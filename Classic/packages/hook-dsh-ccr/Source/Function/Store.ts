// Store - the compression store: an in-memory LRU keyed by hash + TTL
// eviction + an OPTIONAL JSONL disk journal (the plan §3: NOT the factory's
// storage journal - that is a typed LIFECYCLE ledger; reusing it for MB-size
// BLOBs would corrupt the governance domain's contract; the factory journal
// keeps only the plugin's lifecycle/ledger lines).
//
//   * LRU: `storeBudgetBytes` cap (default 256 MiB, Aphrodite's inline
//     store). The victim is the entry with the SMALLEST lastAccessed; the
//     just-inserted entry is never evicted (an oversized single entry may
//     exceed the budget alone rather than evict itself - the marker it
//     backs must stay retrievable).
//   * TTL: `ttlSeconds` (default 3600). An entry at or past its `ttlAt` is
//     expired: dropped on insert (sweep before insert) and on access - a Get
//     reports `gone: "expired"` so the retrieval tool can say so.
//   * Journal (opt-in via `journalPath`; "" = memory-only, Aphrodite's
//     inline mode): one JSONL record per store,
//     `{hash, type, size, ttlAt, payload}`, payload = base64 of the
//     content's JSON serialization. Appended on every Put; LOADED + COMPACTED
//     (expired records dropped) on boot, so a restart restores the surviving
//     entries. Plain-fs like the ledger append - the plugin's own diagnostic
//     file, never a governed write.
//
// All fs is best-effort and contained: the store must never break dispatch -
// a journal read/write failure degrades to memory-only. The store returns
// its evictions to the CALLER: the ledger strings are the module's own
// (Function/Apply composes them via Factory.Append), the store logs nothing.
import * as FileSystem from "node:fs";

import type Entry from "@Interface/Entry.js";
import { Expand } from "@playform/lib-dsh-core";

// One eviction reported to the caller (the reason tags the ledger line).
export type Eviction = { hash: string; reason: "ttl" | "budget" };
// The Get outcome: the found entry (lastAccessed refreshed) or the gone
// reason the retrieval tool turns into its self-describing error.
export type Lookup = { found: Entry } | { gone: "expired" | "unknown" };

export default class Store {
	/** The live entries, keyed by hash (insertion order = LRU tiebreak). */
	Entries = new Map<string, Entry>();
	/** The total byte size of the live entries (the LRU's accounting). */
	Bytes = 0;
	/** The journal path; "" = memory-only. */
	Path: string;

	constructor(JournalPath: string) {
		// The config-supplied path expands once here (a leading "~" -> the
		// user's home), so every later use - the load, the compaction rewrite
		// and the append - sees the resolved path.
		this.Path = Expand(JournalPath ?? "");
		switch (true) {
			case this.Path !== "":
				this.Load();
				break;
		}
	}

	/** Boot: load the journal, drop the expired records, compact the file. */
	Load(): void {
		try {
			switch (true) {
				case !FileSystem.existsSync(this.Path):
					return;
			}
			const Raw = FileSystem.readFileSync(this.Path, "utf8");
			const Now = Date.now();
			const Lines = Raw.split("\n").filter((Line) => Line.trim().length > 0);
			const Survivors: string[] = [];
			for (const Line of Lines) {
				try {
					const Record = JSON.parse(Line) as {
						hash?: string;
						type?: string;
						size?: number;
						ttlAt?: number;
						payload?: string;
					};
					// A record without a parseable payload is dropped (corruption,
					// never a crash); an expired record is dropped (the compaction).
					const Decoded = decode(Record.payload);
					switch (true) {
						case typeof Record.hash !== "string" ||
							Decoded === null ||
							!Array.isArray(Decoded) ||
							typeof Record.ttlAt !== "number" ||
							Now >= Record.ttlAt:
							continue;
					}
					const Entry: Entry = {
						hash: Record.hash,
						type: Record.type ?? "default",
						size: Record.size ?? Buffer.byteLength(JSON.stringify(Decoded)),
						content: Decoded,
						createdAt: Now,
						ttlAt: Record.ttlAt,
						lastAccessed: Now,
					};
					this.Entries.set(Entry.hash, Entry);
					this.Bytes += Entry.size;
					Survivors.push(encode(Entry));
				} catch {
					/* a corrupt line is dropped, never fatal */
				}
			}
			// Compact: rewrite the file with only the surviving records.
			FileSystem.writeFileSync(this.Path, `${Survivors.join("\n")}\n`);
		} catch {
			/* journal failures degrade to memory-only */
		}
	}

	/** Insert one entry: sweep the expired, evict the LRU over budget, append
	 *  the journal record. Returns every eviction for the caller's ledger. */
	Put(Entry: Entry): Eviction[] {
		const Evicted = this.Sweep();
		const Previous = this.Entries.get(Entry.hash);
		switch (true) {
			case Previous !== undefined:
				// A re-store of identical content replaces in place (bytes stay honest).
				this.Bytes -= Previous.size;
				break;
		}
		this.Entries.set(Entry.hash, Entry);
		this.Bytes += Entry.size;
		while (this.Bytes > this.Budget() && this.lru() !== undefined) {
			const Victim = this.lru();
			if (Victim === undefined) break;
			this.drop(Victim.hash);
			Evicted.push({ hash: Victim.hash, reason: "budget" });
		}
		this.Journal(Entry);
		return Evicted;
	}

	/** The configured budget (read live so a volatile re-tune lands on the next insert). */
	private Budget(): number {
		return this.BudgetBytes ?? Number.POSITIVE_INFINITY;
	}

	/** The budget override, injected by Apply on every Put (the volatile cell). */
	BudgetBytes: number | undefined;

	/** Look up one hash: found (lastAccessed refreshed) or the gone reason. */
	Get(Hash: string): Lookup {
		const Entry = this.Entries.get(Hash);
		switch (true) {
			case Entry === undefined:
				return { gone: "unknown" };
		}
		const Now = Date.now();
		switch (true) {
			case Now >= Entry.ttlAt: {
				this.drop(Hash);
				return { gone: "expired" };
			}
			default:
				Entry.lastAccessed = Now;
				return { found: Entry };
		}
	}

	/** The current entry count and byte size (the stats surface). */
	Stats(): { count: number; bytes: number } {
		return { count: this.Entries.size, bytes: this.Bytes };
	}

	/** Drop every expired entry (used before insert). */
	private Sweep(): Eviction[] {
		const Evicted: Eviction[] = [];
		const Now = Date.now();
		for (const [Hash, Entry] of this.Entries) {
			switch (true) {
				case Now >= Entry.ttlAt:
					this.drop(Hash);
					Evicted.push({ hash: Hash, reason: "ttl" });
					break;
			}
		}
		return Evicted;
	}

	/** The LRU victim: the smallest lastAccessed (insertion order breaks ties). */
	private lru(): Entry | undefined {
		let Victim: Entry | undefined;
		for (const Entry of this.Entries.values()) {
			switch (true) {
				case Victim === undefined || Entry.lastAccessed < Victim.lastAccessed:
					Victim = Entry;
					break;
			}
		}
		return Victim;
	}

	private drop(Hash: string): void {
		const Entry = this.Entries.get(Hash);
		switch (true) {
			case Entry !== undefined:
				this.Entries.delete(Hash);
				this.Bytes -= Entry.size;
				break;
		}
	}

	/** Append the JSONL record (best-effort, contained). */
	private Journal(Entry: Entry): void {
		switch (true) {
			case this.Path === "":
				return;
		}
		try {
			FileSystem.appendFileSync(this.Path, `${encode(Entry)}\n`);
		} catch {
			/* journal failures degrade to memory-only */
		}
	}
}

// The journal record projection: {hash, type, size, ttlAt, payload}, payload
// = base64 of the content's JSON serialization.
const encode = (Entry: Entry): string =>
	JSON.stringify({
		hash: Entry.hash,
		type: Entry.type,
		size: Entry.size,
		ttlAt: Entry.ttlAt,
		payload: Buffer.from(JSON.stringify(Entry.content), "utf8").toString("base64"),
	});

// The inverse of the payload projection; null when the payload is missing or
// undecodable.
const decode = (Payload: unknown): Entry["content"] | null => {
	try {
		switch (true) {
			case typeof Payload !== "string":
				return null;
		}
		return JSON.parse(Buffer.from(Payload, "base64").toString("utf8"));
	} catch {
		return null;
	}
};

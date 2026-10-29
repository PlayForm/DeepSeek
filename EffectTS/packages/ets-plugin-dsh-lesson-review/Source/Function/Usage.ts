// Usage - the usage store: one record per corpus entry, loaded once, written
// through the service's flush chain.
//
// THE STORE IS A SIDECAR, never the corpus itself: the corpus is directories of
// markdown a human reads and edits, so bookkeeping must live beside it where a
// bad write cannot corrupt a skill. The path is one JSON file
// (`~/.dsh/lesson/usage.json`), and every failure mode of that file is
// NON-FATAL, in this order:
//
//   * missing          -> an empty store (a fresh install)
//   * unreadable       -> an empty store + the reason returned to the caller
//   * unparseable      -> an empty store + the reason (a truncated write)
//   * wrong shape      -> an empty store + the reason
//
// A store that failed to load is NOT silently rewritten: the service records the
// failure in the ledger, and the next Save replaces the file. Losing usage
// history costs a stale pass nothing (a record with no history is young), while
// refusing to run costs the review entirely.
import FileSystem from "node:fs/promises";
import Path from "node:path";

import type Entry from "@Interface/Entry.js";

/** The load result: how many records, or why there are none. */
export interface LoadResult {
	loaded: number;
	error?: string;
}

/** One entry's new default record. */
export const Fresh = (Name: string, Now: number, CreatedBy: Entry["createdBy"]): Entry => ({
	name: Name,
	useCount: 0,
	viewCount: 0,
	patchCount: 0,
	createdAt: Now,
	lastUsedAt: Now,
	lastPatchedAt: Now,
	state: "active",
	pinned: false,
	createdBy: CreatedBy,
	archivedAt: null,
});

/** Coerce one stored row, dropping anything that is not an entry. */
const Read = (Raw: unknown): Entry | undefined => {
	const Value = (Raw ?? {}) as Record<string, unknown>;
	switch (true) {
		case typeof Value["name"] !== "string" || (Value["name"] as string) === "":
			return undefined;
		default:
			break;
	}
	const Number_ = (Key: string, Fallback: number): number =>
		typeof Value[Key] === "number" && Number.isFinite(Value[Key] as number)
			? (Value[Key] as number)
			: Fallback;
	const State = Value["state"];
	return {
		name: Value["name"] as string,
		useCount: Number_("useCount", 0),
		viewCount: Number_("viewCount", 0),
		patchCount: Number_("patchCount", 0),
		createdAt: Number_("createdAt", 0),
		lastUsedAt: Number_("lastUsedAt", 0),
		lastPatchedAt: Number_("lastPatchedAt", 0),
		state: State === "stale" || State === "archived" ? State : "active",
		pinned: Value["pinned"] === true,
		createdBy:
			Value["createdBy"] === "agent" ||
			Value["createdBy"] === "learn" ||
			Value["createdBy"] === "user"
				? (Value["createdBy"] as Entry["createdBy"])
				: null,
		archivedAt: typeof Value["archivedAt"] === "number" ? Value["archivedAt"] : null,
	};
};

export default class Usage {
	/** The store path (expanded by the service). */
	private Path: string;

	/** The live records, keyed by entry name. */
	private Rows: Map<string, Entry> = new Map();

	constructor(Path_: string) {
		this.Path = Path_;
	}

	/** Load the sidecar; never throws. */
	async Load(): Promise<LoadResult> {
		let Text: string;
		try {
			Text = await FileSystem.readFile(this.Path, "utf8");
		} catch (Cause) {
			const Code = (Cause as { code?: string })?.code;
			return Code === "ENOENT" ? { loaded: 0 } : { loaded: 0, error: String(Cause) };
		}
		let Raw: unknown;
		try {
			Raw = JSON.parse(Text);
		} catch (Cause) {
			return { loaded: 0, error: `unparseable usage store: ${(Cause as Error).message}` };
		}
		const Listed = Array.isArray(Raw)
			? Raw
			: Array.isArray((Raw as { entries?: unknown })?.entries)
				? ((Raw as { entries: unknown[] }).entries as unknown[])
				: undefined;
		switch (true) {
			case Listed === undefined:
				return { loaded: 0, error: "usage store is not an entries list" };
			default:
				break;
		}
		let Loaded = 0;
		for (const Row of Listed) {
			const Entry_ = Read(Row);
			switch (true) {
				case Entry_ === undefined:
					continue;
				default:
					this.Rows.set(Entry_.name, Entry_);
					Loaded++;
			}
		}
		return { loaded: Loaded };
	}

	/** One record, or undefined. */
	Get(Name: string): Entry | undefined {
		return this.Rows.get(Name);
	}

	/** Every record, sorted by name (the report's stable order). */
	All(): Entry[] {
		return [...this.Rows.values()].sort((Left, Right) => Left.name.localeCompare(Right.name));
	}

	/** Insert or replace one record. */
	Put(Entry_: Entry): void {
		this.Rows.set(Entry_.name, Entry_);
	}

	/** Replace the whole store (the load and the restore paths). */
	Reset(Entries: readonly Entry[]): void {
		this.Rows = new Map(Entries.map((Entry_) => [Entry_.name, Entry_]));
	}

	/** Count one interaction against an entry, creating it on first sight. */
	Touch(Name: string, Kind: "use" | "view" | "patch", Now: number): Entry {
		const Entry_ = this.Rows.get(Name) ?? Fresh(Name, Now, "user");
		switch (Kind) {
			case "use":
				Entry_.useCount++;
				Entry_.lastUsedAt = Now;
				break;
			case "view":
				Entry_.viewCount++;
				break;
			default:
				Entry_.patchCount++;
				Entry_.lastPatchedAt = Now;
				Entry_.lastUsedAt = Now;
				// A patch is the proof the entry is in use; a stale entry that
				// gets patched is active again.
				Entry_.state = "active";
				Entry_.archivedAt = null;
				Entry_.createdBy = Entry_.createdBy ?? "agent";
				break;
		}
		this.Rows.set(Name, Entry_);
		return Entry_;
	}

	/** Persist the store; the caller owns the flush chain. */
	async Save(): Promise<void> {
		await FileSystem.mkdir(Path.dirname(this.Path), { recursive: true });
		const Body = `${JSON.stringify({ version: 1, entries: this.All() }, null, "\t")}\n`;
		await FileSystem.writeFile(this.Path, Body, "utf8");
	}
}

// Library - the entry module of the PATTERN service
// (@playform/plugin-dsh-pattern), the service plugin of the pattern-graph
// family (PATTERN-GRAPH-PLUGIN.md section 4: "the core owns the service and
// the storage"). Loader contract: the CLASS form, mirroring the factory -
// `export default class PatternService extends Service` with
// `super(Context, "pattern")`, registered immediately on construction. The
// ONLY named export is the Config schema (the loader validates it at load;
// also attached as a static for the class-form reading) - every other
// module is a nameless default export and each service method is a thin
// delegate to one Function module.
//
// THE SERVICE SURFACE (ctx.pattern):
//
//   Configure(options)        - apply validated config knobs (volatile cells)
//   Put(pattern)              - idempotent upsert by id (memory; Save flushes)
//   Get(id)                   - one pattern or undefined
//   List()                    - every pattern, sorted by id
//   Match(context)            - the ranked match; the EMPTY result is the
//                               abstention (below threshold or ambiguous)
//   Record(id, outcome)       - the confidence update + the ledger line, and
//                               the persist of the changed pattern
//   Decay(now?)               - the half-life sweep, and the persist of every
//                               pattern it moved
//   Save()                    - the full snapshot flush (awaitable)
//   Flush()                   - await the pending store work (the smoke seam)
//
// THE STORE (the PoC-posture fix, completion spec wave 3): the KV domain
// (Function/Open, config `domain`, version 1) is the PRIMARY store; the JSON
// snapshot (Function/Snapshot) is the FALLBACK, engaged ONLY when the harness
// provides no storage facility (the probe below) or when the open fails. A
// present facility whose open fails is LOUD: one best-effort ledger line
// `storage open failed: <reason>`, then the JSON fallback loads. Load on
// open, save on every mutation (Record/Decay), and the explicit Save/Flush
// seams. The match/record/decay behaviour and every ledger string are
// unchanged.
//
// The cold start seeds the static catalog (Variable/DefaultPatterns) - the
// registry is never empty (PATTERN-GRAPH-PLUGIN.md section 3). The store's
// restore runs detached at construction and REPLACES the catalog only when
// the store is valid and non-empty; a failure keeps the catalog. The KV
// domain restores as a PER-RECORD overlay (a stored record replaces the
// catalog entry with the same id; a catalog entry the domain never received
// stays), the JSON fallback as a FULL snapshot (it replaces the catalog,
// exactly as the PoC did).
import { Service, type Context } from "@deepseek-ai/cordis";

import { Decay as DecayConfidence } from "./Function/Confidence.js";
import Knobs from "./Function/Knobs.js";
import Learner from "./Function/Learner.js";
import Matcher from "./Function/Matcher.js";
import Open from "./Function/Open.js";
import Registry from "./Function/Registry.js";
import { Expand, Load, Save } from "./Function/Snapshot.js";
import type Configuration from "./Interface/Config.js";
import type Handle from "./Interface/Handle.js";
import type { MatchResult } from "./Interface/Match.js";
import type { Outcome } from "./Interface/Outcome.js";
import type Pattern from "./Interface/Pattern.js";
import type Snapshot from "./Interface/Snapshot.js";
import Definition from "./Variable/Config.js";
import DefaultPatterns from "./Variable/DefaultPatterns.js";
import Version from "./Variable/Version.js";

/** The neutral ledger line builder (module-owned strings, byte-stable). */
const Line = (Message: string, State: { logFile: string }): string =>
	`pattern: ${Message} (logFile ${State.logFile})`;

// The compiled package version (Source/Variable/Version, built in by the
// ESBuild define) - NOT a loader key: the contract's names are unchanged
// (the class form's default export with static inject/Config), and Version
// is a standalone named export, not on the class.
export { Version };

export default class PatternService extends Service {
	static inject: string[] = [];

	/** The loader-contract Config (validated at load; knobs via Configure). */
	static Config = Definition;

	/** The knobs, from the constructor defaults plus the loader's validated
	 *  config; Configure applies hot overrides. */
	private Knobs: Configuration;

	/** The in-memory registry (Function/Registry). */
	private Store: Registry;

	/** The ledger sink (best-effort, never throws). */
	private Ledger: (Message: string) => void;

	/** The open KV domain (undefined in the JSON fallback). */
	private Handle: Handle | undefined;

	/** The store chain: the open/recovery and every mutation write, in order.
	 *  Flush and Save await it, so the smokes need no sleep. */
	private Pending: Promise<void> = Promise.resolve();

	constructor(Context: Context, Raw?: unknown) {
		super(Context, "pattern");
		this.Knobs = Knobs(Raw);
		this.Store = new Registry();
		this.Ledger = (Message: string): void => {
			try {
				Context.logger?.info(Line(Message, this.Knobs));
			} catch {
				/* logger optional */
			}
		};
		for (const Pattern_ of DefaultPatterns) {
			this.Store.Put({ ...Pattern_ });
		}
		this.Ledger(
			this.Knobs.enabled
				? `activated (seeded ${this.Store.Size()} patterns)`
				: "disabled (enabled=false)",
		);
		// THE STORE PROBE (the family's P5-style optional facility): the
		// storage hub's domain form first, then the provided storageDomain
		// service. `ctx.get` never throws on a missing service.
		const Facility =
			(Context.get?.("storage") as { domain?: unknown } | undefined)?.domain ??
			Context.get?.("storageDomain");
		switch (true) {
			case !!Facility:
				// The PRIMARY: open the domain and recover from it (detached -
				// a constructor cannot await; the chain serialises it before
				// every write). The effect closes the domain on dispose.
				this.Connect(Facility);
				Context.effect?.(() => {
					return () => {
						const Handle = this.Handle;
						this.Handle = undefined;
						switch (true) {
							case !!Handle:
								void Handle.close().catch(() => {
									/* close best-effort */
								});
								break;
							default:
						}
					};
				}, "pattern-storage");
				break;
			default:
				// The FALLBACK: no facility - the JSON snapshot is the store.
				this.Pending = this.Pending.then(() => this.RestoreJson());
		}
	}

	/** Apply the validated config knobs (called by the host on load/volatile). */
	Configure(Options: Partial<Configuration>): void {
		this.Knobs = { ...this.Knobs, ...Options };
	}

	Put(Pattern_: Pattern): void {
		this.Store.Put(Pattern_);
	}

	Get(Id: string): Pattern | undefined {
		return this.Store.Get(Id);
	}

	List(): Pattern[] {
		return this.Store.List();
	}

	Match(Context_: { tool?: string | undefined; text?: string | undefined }): MatchResult[] {
		if (!this.Knobs.enabled) {
			return [];
		}
		return Matcher(this.Store.List(), Context_, this.Knobs);
	}

	Record(Id: string, Outcome_: Outcome, Now: number = Date.now()): void {
		const Pattern_ = this.Store.Get(Id);
		if (Pattern_ === undefined) {
			return;
		}
		Learner(Pattern_, Outcome_, this.Knobs, Now);
		this.Ledger(`recorded ${Outcome_} on ${Id} (confidence ${Pattern_.confidence.toFixed(2)})`);
		this.Persist([Pattern_]);
	}

	Decay(Now: number = Date.now()): void {
		const Changed: Pattern[] = [];
		for (const Pattern_ of this.Store.List()) {
			const Decayed = DecayConfidence(Pattern_, Now, this.Knobs.decayHalfLifeDays);
			if (Decayed !== Pattern_.confidence) {
				Pattern_.confidence = Decayed;
				Pattern_.updatedAt = Math.max(Pattern_.updatedAt, Now);
				Changed.push(Pattern_);
			}
		}
		this.Persist(Changed);
	}

	/** Await the pending store work (the open/recovery and the mutation
	 *  writes). The flush seam the smokes use: every assertion after a
	 *  mutation is deterministic without a sleep. */
	async Flush(): Promise<void> {
		await this.Pending;
	}

	/** The full snapshot flush: the KV domain when it is open (every pattern
	 *  plus the meta timestamp), the JSON file in the fallback. */
	async Save(): Promise<void> {
		await this.Pending;
		const Patterns = this.Store.List();
		const Handle = this.Handle;
		switch (true) {
			case Handle !== undefined: {
				try {
					const Table = Handle.table("patterns");
					for (const Pattern_ of Patterns) {
						await Table.put(Pattern_.id, Pattern_);
					}
					await Handle.table("meta").put("__savedAt", Date.now());
				} catch {
					/* persistence optional - the live state is the truth */
				}
				this.Ledger(`saved ${Patterns.length} patterns to ${this.Knobs.domain}`);
				return;
			}
			default: {
				const Snapshot_: Snapshot = {
					version: 1,
					savedAt: Date.now(),
					patterns: Patterns,
				};
				await Save(this.Knobs.storagePath, Snapshot_);
				this.Ledger(
					`saved ${Snapshot_.patterns.length} patterns to ${Expand(this.Knobs.storagePath)}`,
				);
			}
		}
	}

	/** Open the KV domain and recover the registry from it (the primary
	 *  store). A failed open is loud and degrades to the JSON fallback. */
	private Connect(Facility: unknown): void {
		this.Pending = this.Pending.then(async () => {
			try {
				const Handle = await Open(this.Knobs.domain, Facility);
				const Patterns = [...Handle.table("patterns").entries()].map(
					([, Value]) => Value as Pattern,
				);
				switch (true) {
					case Patterns.length > 0:
						// The domain is a PER-RECORD overlay on the cold-start
						// catalog: a stored record replaces the catalog entry with
						// the same id, and a catalog entry the domain never
						// received stays (the JSON fallback is a full snapshot and
						// replaces the catalog - the PoC's behaviour). A LIVE
						// record the store has not seen yet wins when it is newer
						// (a mutation in the open window is never clobbered by the
						// store's older copy).
						for (const Stored of Patterns) {
							const Live = this.Store.Get(Stored.id);
							switch (true) {
								case Live !== undefined && Live.updatedAt > Stored.updatedAt:
									continue;
								default:
									this.Store.Put(Stored);
							}
						}
						this.Ledger(`restored ${Patterns.length} patterns from snapshot`);
						break;
					default:
				}
				this.Handle = Handle;
			} catch (Cause) {
				this.Ledger(`storage open failed: ${(Cause as Error)?.message ?? String(Cause)}`);
				await this.RestoreJson();
			}
		});
	}

	/** The JSON fallback's load (Function/Snapshot): a stale or unreadable
	 *  file is a silent miss - the catalog stays. */
	private async RestoreJson(): Promise<void> {
		const Snapshot_ = await Load(this.Knobs.storagePath);
		switch (true) {
			case Snapshot_ !== null && Snapshot_.patterns.length > 0:
				this.Store.Reset(Snapshot_.patterns);
				this.Ledger(`restored ${Snapshot_.patterns.length} patterns from snapshot`);
				break;
			default:
		}
	}

	/** Persist the mutated patterns on the primary store (best-effort, on the
	 *  chain, so the open always lands first). The JSON fallback is written
	 *  only by the explicit Save - the PoC's behaviour, unchanged. */
	private Persist(Patterns: Pattern[]): void {
		switch (true) {
			case Patterns.length === 0:
				return;
			default:
				break;
		}
		this.Pending = this.Pending.then(async () => {
			const Handle = this.Handle;
			switch (true) {
				case Handle === undefined:
					return;
				default:
					break;
			}
			try {
				const Table = Handle.table("patterns");
				for (const Pattern_ of Patterns) {
					await Table.put(Pattern_.id, Pattern_);
				}
			} catch {
				/* persistence optional - the live state is the truth */
			}
		});
	}
}

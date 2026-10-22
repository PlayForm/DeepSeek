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
//   Put(pattern)              - idempotent upsert by id
//   Get(id)                   - one pattern or undefined
//   List()                    - every pattern, sorted by id
//   Match(context)            - the ranked match; the EMPTY result is the
//                               abstention (below threshold or ambiguous)
//   Record(id, outcome)       - the confidence update + the ledger line
//   Decay(now?)               - the half-life sweep over every pattern
//   Save()                    - the best-effort JSON snapshot (awaitable)
//
// The cold start seeds the static catalog (Variable/DefaultPatterns) - the
// registry is never empty (PATTERN-GRAPH-PLUGIN.md section 3). The snapshot
// load runs detached at construction and REPLACES the catalog only when the
// file is valid and non-empty; a failure keeps the catalog.
import { Service, type Context } from "@deepseek-ai/cordis";

import { Decay as DecayConfidence } from "./Function/Confidence.js";
import Learner from "./Function/Learner.js";
import Matcher from "./Function/Matcher.js";
import Registry from "./Function/Registry.js";
import { Expand, Load, Save } from "./Function/Snapshot.js";
import type Knobs from "./Interface/Config.js";
import type { MatchResult } from "./Interface/Match.js";
import type { Outcome } from "./Interface/Outcome.js";
import type Pattern from "./Interface/Pattern.js";
import type Snapshot from "./Interface/Snapshot.js";
import Definition from "./Variable/Config.js";
import DefaultPatterns from "./Variable/DefaultPatterns.js";

/** The neutral ledger line builder (module-owned strings, byte-stable). */
const Line = (Message: string, State: { logFile: string }): string =>
	`pattern: ${Message} (logFile ${State.logFile})`;

export default class PatternService extends Service {
	static inject: string[] = [];

	/** The loader-contract Config (validated at load; knobs via Configure). */
	static Config = Definition;

	/** The knobs, defaults copied from the schema's intent; Configure applies
	 *  the host's validated values. */
	private Knobs: Knobs;

	/** The in-memory registry (Function/Registry). */
	private Store: Registry;

	/** The ledger sink (best-effort, never throws). */
	private Ledger: (Message: string) => void;

	constructor(Context: Context) {
		super(Context, "pattern");
		this.Knobs = {
			enabled: true,
			logFile: "~/.dsh/pattern.log",
			storagePath: "~/.dsh/pattern/registry.json",
			matchThreshold: 0.35,
			maxMatches: 3,
			ambiguityEpsilon: 0.02,
			decayHalfLifeDays: 14,
			acceptBonus: 0.1,
			rejectPenalty: 0.2,
			appliedBonus: 0.15,
			failedPenalty: 0.25,
		};
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
		// The snapshot load is detached: a constructor cannot await, and a
		// failed load keeps the catalog (best-effort by design).
		void Load(this.Knobs.storagePath).then((Snapshot_: Snapshot | null) => {
			if (Snapshot_ !== null && Snapshot_.patterns.length > 0) {
				this.Store.Reset(Snapshot_.patterns);
				this.Ledger(`restored ${Snapshot_.patterns.length} patterns from snapshot`);
			}
		});
	}

	/** Apply the validated config knobs (called by the host on load/volatile). */
	Configure(Options: Partial<Knobs>): void {
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
	}

	Decay(Now: number = Date.now()): void {
		for (const Pattern_ of this.Store.List()) {
			const Decayed = DecayConfidence(Pattern_, Now, this.Knobs.decayHalfLifeDays);
			if (Decayed !== Pattern_.confidence) {
				Pattern_.confidence = Decayed;
				Pattern_.updatedAt = Math.max(Pattern_.updatedAt, Now);
			}
		}
	}

	async Save(): Promise<void> {
		const Snapshot_: Snapshot = {
			version: 1,
			savedAt: Date.now(),
			patterns: this.Store.List(),
		};
		await Save(this.Knobs.storagePath, Snapshot_);
		this.Ledger(
			`saved ${Snapshot_.patterns.length} patterns to ${Expand(this.Knobs.storagePath)}`,
		);
	}
}

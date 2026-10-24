// Store - the learned layer's storage: the accept rates the score reads, the
// outcome writes the follow-through performs, and the decision-record memory
// (completion spec D8 + 03-SUGGESTERS section 2).
//
// THE PRIMARY IS THE SHARED PATTERN SERVICE, PROBED PER USE (`ctx.get("pattern")`,
// NEVER AN INJECT): the service is optional and may load after this plugin, so
// the probe runs on every read/write and a missing service is simply the
// fallback. The service's own Record moves a record's confidence by its
// configured accept bonus / reject penalty; this leaf seeds the record at the
// current rate before the first outcome, so a new record moves from the
// neutral 1/3 exactly like the memory fallback. A service that cannot answer
// Get/Put/Record (a partial or foreign implementation) is treated as absent.
//
// WHY Get AND NOT Match: every learned record has an EXACT id (below), so Get
// is the honest read. Match ranks by keyword overlap and abstains under its
// own threshold/ambiguity rules - and it answers the empty result when the
// service ships disabled (its documented idle posture) - so a Match-based read
// would hide the learned state instead of reporting it. Record is still the
// write that moves a record (the service owns the outcome arithmetic).
//
// THE FALLBACK IS AN IN-MEMORY, BOUNDED STORE (config `storeLimit`, default
// 512): the same arithmetic (accept +0.1, reject -0.2, clamped to 0..1, the
// pattern service's documented defaults), keyed by the same ids, evicting the
// oldest entry when the bound is reached. It is PER INSTANCE by design - a
// reopen starts neutral, which is why the durable path is the service.
//
// THE KEYS (deterministic, module-scoped so two suggesters never collide):
//
//   <module>:family:<Family>        the family's learned rate;
//   <module>:companion:<Path>       the companion's learned rate;
//   <module>:decision:<Family>:<sorted paths joined by |>   the decision record.
//
// THE DECISION RECORD is stored as a pattern when the service is present:
// the family is the intent, the companion paths are the targets, the outcome
// is the arbiter, the kappa is the confidence, and the transform lines carry
// the weight table, the enabled list and one `path <values>` line per
// companion (the pattern schema is the read-only contract, so the record is
// projected onto its string fields rather than extending it).
import type { Context } from "@deepseek-ai/cordis";

import type Decision from "../Interface/Decision.js";
import type Learning from "../Interface/Learning.js";
import Table from "./Table.js";

/** The neutral rate: the Laplace prior with zero observations (today's score). */
const Neutral = 1 / 3;

/** The accept move - the pattern service's documented default `acceptBonus`. */
const AcceptBonus = 0.1;

/** The reject move - the pattern service's documented default `rejectPenalty`. */
const RejectPenalty = 0.2;

/** Clamp a rate into 0..1 (the service's confidence domain). */
const Clamp = (Value: number): number => Math.min(1, Math.max(0, Value));

/** One pattern record (the pattern service's serializable projection). */
interface Stored {
	/** The registry id. */
	id: string;
	/** The intent label (the family id). */
	intent: string;
	/** The trigger signals (the family id or the companion path, lowercased). */
	trigger: { tool?: string | undefined; keywords: string[] };
	/** The target subgraph as paths (the companion set). */
	targets: string[];
	/** The descriptions-only lines (the decision record's projection). */
	transform: string[];
	/** The arbiter (the outcome for a decision record, the module for a rate). */
	arbiter: string;
	/** The confidence in 0..1 (the learned rate, or the decision's kappa). */
	confidence: number;
	/** The decision hook's eligibility hint (always false here). */
	allowlist: boolean;
	/** Last write time, epoch ms. */
	updatedAt: number;
}

/** The structural view of the pattern service this leaf uses. */
interface Registry {
	/** One record by id. */
	Get?: (Id: string) => Stored | undefined;
	/** Idempotent upsert by id. */
	Put?: (Pattern: Stored) => void;
	/** The outcome move on one record. */
	Record?: (Id: string, Outcome: "accepted" | "rejected") => void;
}

export default (
	/** The plugin context (the optional service probe). */
	Context: Context,
	/** The module id (the key prefix and the rate records' arbiter). */
	Module: string,
	/** The memory fallback's bound (config `storeLimit`). */
	Limit: number,
): Learning => {
	/** The fallback's rates: key -> learned rate (insertion-ordered, bounded). */
	const Memory = new Map<string, number>();
	/** The decision ring: key -> record (bounded; also the Resolve index). */
	const Decisions = new Map<string, Decision>();
	const Bound = Math.max(1, Math.trunc(Number.isFinite(Limit) ? Limit : 512));
	/** The optional pattern service, when it answers the whole contract. */
	const Probe = (): Registry | undefined => {
		try {
			const Service = Context.get?.("pattern") as Registry | undefined;
			return typeof Service?.Get === "function" &&
				typeof Service.Put === "function" &&
				typeof Service.Record === "function"
				? Service
				: undefined;
		} catch {
			return undefined;
		}
	};
	/** The rate key of a family (Path "") or a companion. */
	const Key = (Family: string, Path: string): string =>
		Path === "" ? `${Module}:family:${Family}` : `${Module}:companion:${Path}`;
	/** The decision key: the family plus its sorted companion set. */
	const DecisionKey = (Family: string, Paths: string[]): string =>
		`${Module}:decision:${Family}:${Paths.slice().sort().join("|")}`;
	/** Read one rate: the service's record, else the memory row, else neutral. */
	const Read = (Service: Registry | undefined, Id: string): number => {
		switch (true) {
			case Service === undefined:
				return Memory.get(Id) ?? Neutral;
			default: {
				try {
					const Confidence = Service.Get?.(Id)?.confidence;
					return typeof Confidence === "number" && Number.isFinite(Confidence)
						? Confidence
						: Neutral;
				} catch {
					return Neutral;
				}
			}
		}
	};
	/** A rate record, seeded at the current rate before its first outcome. */
	const RateRecord = (Id: string, Family: string, Path: string): Stored => ({
		id: Id,
		intent: Family,
		trigger: { keywords: [Path === "" ? Family.toLowerCase() : Path.toLowerCase()] },
		targets: Path === "" ? [] : [Path],
		transform: [],
		arbiter: Module,
		// The record is seeded only when it is absent, so the seed IS neutral:
		// the first outcome then moves it exactly like the memory fallback.
		confidence: Neutral,
		allowlist: false,
		updatedAt: Date.now(),
	});
	/** The decision record projected onto the pattern schema's string fields. */
	const DecisionRecord = (
		Id: string,
		Family: string,
		Paths: string[],
		Record: Decision,
	): Stored => ({
		id: Id,
		intent: Family,
		trigger: { keywords: [Family.toLowerCase()] },
		targets: [...Paths],
		transform: [
			`weights ${Table(Record.weights)}`,
			`enabled ${Record.enabled.join(",")}`,
			`outcome ${Record.outcome}`,
			...Record.companions.map(
				(Companion) => `${Companion.path} ${Table(Companion.heuristics)}`,
			),
		],
		arbiter: Record.outcome,
		confidence: Record.kappa,
		allowlist: false,
		updatedAt: Date.now(),
	});
	/** The bounded insert: evict the oldest entry when the bound is reached. */
	const Hold = <T>(Table_: Map<string, T>, Id: string, Value: T): void => {
		if (!Table_.has(Id) && Table_.size >= Bound) {
			const Oldest = Table_.keys().next().value;
			switch (true) {
				case Oldest !== undefined:
					Table_.delete(Oldest);
					break;
				default:
			}
		}
		Table_.set(Id, Value);
	};
	return {
		Store: (): "pattern" | "memory" => (Probe() === undefined ? "memory" : "pattern"),
		Rate: (Family: string, Path: string) => {
			const Service = Probe();
			return {
				Companion: Read(Service, Key(Family, Path)),
				Family: Read(Service, Key(Family, "")),
			};
		},
		Move: (Family: string, Paths: string[], Outcome: "accepted" | "rejected"): void => {
			const Service = Probe();
			const Rows = [
				{ id: Key(Family, ""), path: "" },
				...Paths.map((Path) => ({ id: Key(Family, Path), path: Path })),
			];
			for (const Row of Rows) {
				switch (true) {
					case Service !== undefined: {
						try {
							switch (true) {
								case Service.Get?.(Row.id) === undefined:
									Service.Put?.(RateRecord(Row.id, Family, Row.path));
									break;
								default:
									break;
							}
							Service.Record?.(Row.id, Outcome);
						} catch {
							/* the outcome is best-effort: the live rate stays neutral */
						}
						break;
					}
					default: {
						const Current = Memory.get(Row.id) ?? Neutral;
						Hold(
							Memory,
							Row.id,
							Clamp(
								Current + (Outcome === "accepted" ? AcceptBonus : -RejectPenalty),
							),
						);
					}
				}
			}
		},
		Remember: (Family: string, Paths: string[], Record: Decision): void => {
			const Id = DecisionKey(Family, Paths);
			Hold(Decisions, Id, Record);
			const Service = Probe();
			switch (true) {
				case Service !== undefined:
					try {
						Service.Put?.(DecisionRecord(Id, Family, Paths, Record));
					} catch {
						/* the record ring still holds it */
					}
					break;
				default:
					break;
			}
		},
		Resolve: (Family: string, Paths: string[], Outcome: "accepted" | "rejected"): void => {
			const Id = DecisionKey(Family, Paths);
			const Record = Decisions.get(Id);
			switch (true) {
				case Record === undefined:
					return;
				default:
					break;
			}
			Record.outcome = Outcome;
			const Service = Probe();
			switch (true) {
				case Service !== undefined:
					try {
						Service.Put?.(DecisionRecord(Id, Family, Paths, Record));
					} catch {
						/* the ring still carries the verdict */
					}
					break;
				default:
					break;
			}
		},
		Recent: (): Decision[] => [...Decisions.values()],
	};
};

import type { ConsolidationResult } from "../Interface/Consolidation.js";
import type { Curation } from "../Interface/Curation.js";
import type { Outcome } from "../Interface/Trigger.js";
/** One run's record, which is also the shape `run.json` is written in. */
export interface RunReport {
    /** ISO-8601 UTC, the moment the run started. */
    readonly startedAt: string;
    /** Wall time of the run in milliseconds. */
    readonly durationMs: number;
    /** The class the run ended in. */
    readonly outcome: Outcome;
    /** The provider that answered, or "" when no call was made. */
    readonly provider: string;
    /** The model that answered, or "" when no call was made. */
    readonly model: string;
    /** What the digest kept and what it collapsed. */
    readonly digest: {
        readonly kept: number;
        readonly collapsed: number;
    };
    /** How many skill bodies the confirm prompt carried. */
    readonly views: number;
    /** How many operations the reply named. */
    readonly operations: number;
    /** The skills whose bytes changed. */
    readonly applied: readonly string[];
    /** Every refused operation, with the rule and the clause that refused it. */
    readonly refused: readonly {
        readonly skill: string;
        readonly rule: string;
        readonly detail: string;
    }[];
    /** The session's spent write count at the end of the run. */
    readonly writes: number;
    /** The curator pass that rode the same idle edge, when one ran. */
    readonly curation?: Curation;
    /** The consolidation pass, when one ran. */
    readonly consolidation?: ConsolidationResult;
    /** The ledger row ids the run appended. */
    readonly ledger: readonly string[];
    /** The snapshot taken before the run, when one was taken. */
    readonly snapshot: string;
    /** One clause of detail: a failure's cause, a skip reason, a drift. */
    readonly detail?: string;
}
export default _default;
declare function _default(Root: string, Report_: RunReport): Promise<string>;

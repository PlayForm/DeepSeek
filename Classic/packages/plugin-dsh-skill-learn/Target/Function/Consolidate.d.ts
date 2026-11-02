import type Usage from "./Usage.js";
import { type Seam } from "./Write.js";
import type Configuration from "../Interface/Configuration.js";
import type { ConsolidationCandidate, ConsolidationPlan, ConsolidationResult } from "../Interface/Consolidation.js";
import type { Corpus } from "../Interface/Corpus.js";
/** One consolidation pass's whole input. */
export interface Request {
    readonly store: Usage;
    /** The read-only catalog view; a patch row's body must already be carried here. */
    readonly corpus: Corpus;
    readonly seam: Seam;
    readonly configuration: Configuration;
    /** Whether the pass computes the plan and applies nothing. */
    readonly dryRun: boolean;
    /** The report directory, when the caller is writing one; "" otherwise. */
    readonly report: string;
    /**
     * The one model call: the nine-field survey in, the plan out, or null when the
     * call failed or the reply did not parse.
     */
    readonly ask: (survey: readonly ConsolidationCandidate[]) => Promise<ConsolidationPlan | null>;
}
export default _default;
/** One consolidation pass: the survey, the plan, and every guard between them and the corpus. */
declare function _default(Request_: Request): Promise<ConsolidationResult>;

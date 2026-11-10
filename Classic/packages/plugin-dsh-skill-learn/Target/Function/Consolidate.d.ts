import type Usage from "./Usage.js";
import { type Seam } from "./Write.js";
import type Configuration from "../Interface/Configuration.js";
import type { ConsolidationCandidate, ConsolidationPlan, ConsolidationResult } from "../Interface/Consolidation.js";
import type { Corpus } from "../Interface/Corpus.js";
/**
 * @module Consolidate
 *
 * The opt-in second half of the curator: one survey, one model call, and the same
 * fence every other write goes through.
 *
 * @remarks
 *
 * IT SHIPS OFF. `consolidate` defaults to false, which is the Hermes code default too
 * (`DEFAULT_CONSOLIDATE = False`, agent/curator.py:35); the live Hermes config on this
 * machine sets it true, and the README states that difference so it is a choice the
 * user makes rather than a surprise (SKILL-LEARN-PLUGIN.md:574-576).
 *
 * THE PLAN HAS FOUR ROWS AND NO DELETE. A row may be `keep`, `patch`, `create`, or
 * `write_file`; there is no delete row and no absorbed-into field in the schema at
 * all, so the worst outcome this pass can produce is still an archive, and a
 * hallucinated umbrella cannot become a phantom merge because no merge can be
 * expressed (SKILL-LEARN-PLUGIN.md:580-594).
 *
 * THE FIVE GUARDS (SKILL-LEARN-PLUGIN.md:582-588):
 *
 * - consolidate-enabled - `consolidate` must be true, and a dry run renders the plan
 *   without applying it
 * - consolidate-survey - an empty candidate list skips the call entirely
 * - consolidate-budget - at most `maxOperationsPerRun` rows, counted on successes
 * - consolidate-target - every writing row is judged by the same sixteen rules, so a
 *   consolidation patch IS a normal patch
 * - consolidate-snapshot - a whole-tree snapshot is taken before the first write
 *
 * READ-BEFORE-WRITE HOLDS HERE TOO, and it is the caller's job to make it possible: a
 * row that patches a skill needs that skill's body carried in the Corpus view before
 * the plan is asked for, exactly as a review patch does
 * (SKILL-LEARN-PLUGIN.md:288-297). A row whose body was not carried is refused by the
 * same J5 rule, not waved through because the pass is the curator's.
 */
/**
 * One consolidation pass's whole input.
 */
export interface Request {
    readonly store: Usage;
    /**
     * The read-only catalog view; a patch row's body must already be carried here.
     */
    readonly corpus: Corpus;
    readonly seam: Seam;
    readonly configuration: Configuration;
    /**
     * Whether the pass computes the plan and applies nothing.
     */
    readonly dryRun: boolean;
    /**
     * The report directory, when the caller is writing one; "" otherwise.
     */
    readonly report: string;
    /**
     * The one model call: the nine-field survey in, the plan out, or null when the
     * call failed or the reply did not parse.
     */
    readonly ask: (survey: readonly ConsolidationCandidate[]) => Promise<ConsolidationPlan | null>;
}
export default _default;
/**
 * One consolidation pass: the survey, the plan, and every guard between them and the corpus.
 */
declare function _default(Request_: Request): Promise<ConsolidationResult>;

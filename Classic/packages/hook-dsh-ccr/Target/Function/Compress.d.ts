import type { ContentBlock } from "@deepseek-ai/dsh-llm";
import type State from "../Interface/State.js";
import type { Eviction } from "./Store.js";
/**
 * @module Compress
 *
 * The gate: the pure decision of whether one tool result gets compressed,
 * stored-only (auto-expand), or passed through.
 *
 * @remarks
 *
 * Plan §2. Given the tool name, the failure flag and the result's content
 * blocks the function returns a verdict the Apply stage turns into ledger
 * lines and (for `replace`) the preview + marker decision:
 *
 *   1. empty content            → pass (Aphrodite skips empty);
 *   2. exempt tool              → pass (execution-critical mutators and their
 *                                 own echo, the plugin's own retrieval tool,
 *                                 another agent's brief, a user gate);
 *   3. a failure, and           → pass (failures pass through unchanged
 *      compressFailures is off     unless compressFailures - the error ×8
 *                                 tier is the only beneficiary);
 *   4. name not in targets      → pass (the allow-list: nothing outside the
 *                                 terminal/search/fetch family is touched);
 *   5. size at or under the     → pass (the byte gate: thresholdBytes times
 *      type's multiplier           the classified type's multiplier - errors
 *                                 compress late at ×8, grep/paths/web early
 *                                 at ×2, the rest at parity);
 *   6. over the gate            → store the entry, then either
 *                                 a. `store`  - auto-expand is on and the size
 *                                    is at or under autoExpandLimitBytes: the
 *                                    FULL original content returns, no marker
 *                                    reaches the model, the entry is still
 *                                    retrievable; or
 *                                 b. `replace` - the preview + marker content.
 *
 * The store work (deep-copy, insert, eviction sweep) happens here because the
 * eviction and TTL lines are inseparable from the decision; the ledger STRINGS
 * stay module-side in Apply. The content basis is the caller's: post-execute
 * hands the content a downstream listener may have already enriched
 * (`decision.content ?? result.content`, the spill-policy precedent) - the
 * store keeps what the model would have seen.
 */
/**
 * The verdict: pass, store-only (auto-expand), or replace (preview + marker).
 */
export type Verdict = {
    action: "pass";
} | {
    action: "store";
    type: string;
    size: number;
    hash: string;
    evicted: Eviction[];
} | {
    action: "replace";
    type: string;
    size: number;
    hash: string;
    preview: string;
    evicted: Eviction[];
};
export default _default;
declare function _default(State: State, Name: string, IsError: boolean, Content: ContentBlock[]): Verdict;

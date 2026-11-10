import type { Route } from "./Route.js";
import type { LlmSlice } from "../Interface/Services.js";
/**
 * @module Plan
 *
 * The phase-1 request: one hand-built `ctx.llm.stream` call carrying the digest and the
 * skill index, and the `text-delta` read that collects its reply.
 *
 * @remarks
 *
 * THE REQUEST CARRIES EXACTLY SIX FIELDS (plan section 4.1): `system` is `Prompt(1)`,
 * `messages` is one user message built here, `provider` and `model` are the resolved
 * route, `maxTokens` is the reply budget, and `signal` is the maintenance signal.
 * `purpose` IS DELIBERATELY UNSET: its union is closed to `'compaction'` and
 * `'session-title'` (`dsh-llm/lib/types/types.d.ts:547`), and a review has no slot in
 * it, so a review that set one would be claiming to be a call it is not.
 *
 * THE CALL IS NOT AN AGENT-LOOP REQUEST. The loop marks its own request objects in a
 * process-local WeakSet (`dsh-llm/lib/index.js:377`, `:386`); a hand-built object is
 * simply never added, so no adapter or interceptor can mistake this for a turn
 * (`Temporary/Research/DSH-Skill-Surface.md:204`). That is why there is no `tools`
 * field and no loop: two calls maximum, no repair pass, no iteration (plan section
 * 4.2).
 *
 * THE REPLY IS READ FROM `text-delta` FRAMES ONLY
 * (`dsh-llm/lib/types/types.d.ts:439-442`, the pattern at
 * `Classic/packages/plugin-dsh-lesson-review/Source/Library.ts:302-311`). Reasoning
 * deltas, tool-call deltas, usage frames and the finish frame are all skipped: the
 * reply is a JSON object, so anything that is not visible text cannot be part of it,
 * and collecting reasoning would silently prepend prose the strict parser must then
 * reject.
 *
 * A THROW IS LEFT TO THE CALLER. The stream can reject (no adapter, a transport
 * failure, an aborted signal); the service turns that into `model-failed` with the
 * error's message, because the ledger line and the report both need the cause and this
 * leaf has nowhere to put it.
 */
/**
 * One phase-1 call: the route, the system prompt, the user text's parts, and the run's limits.
 */
export interface PlanOptions {
    readonly route: Route;
    /**
     * `Prompt(1)`, the byte-stable phase-1 text.
     */
    readonly system: string;
    /**
     * The digest text (`Function/Digest`).
     */
    readonly digest: string;
    /**
     * The catalog index lines (`Function/Catalog`).
     */
    readonly index: readonly string[];
    readonly maxTokens: number;
    readonly signal: AbortSignal;
}
export default _default;
declare function _default(Llm: LlmSlice, Options: PlanOptions): Promise<string>;

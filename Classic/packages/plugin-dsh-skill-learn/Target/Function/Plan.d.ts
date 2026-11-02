import type { Route } from "./Route.js";
import type { LlmSlice } from "../Interface/Services.js";
/** One phase-1 call: the route, the system prompt, the user text's parts, and the run's limits. */
export interface PlanOptions {
    readonly route: Route;
    /** `Prompt(1)`, the byte-stable phase-1 text. */
    readonly system: string;
    /** The digest text (`Function/Digest`). */
    readonly digest: string;
    /** The catalog index lines (`Function/Catalog`). */
    readonly index: readonly string[];
    readonly maxTokens: number;
    readonly signal: AbortSignal;
}
export default _default;
declare function _default(Llm: LlmSlice, Options: PlanOptions): Promise<string>;

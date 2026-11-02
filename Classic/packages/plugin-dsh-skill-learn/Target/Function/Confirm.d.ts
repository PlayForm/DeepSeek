import type { Route } from "./Route.js";
import type { LlmSlice } from "../Interface/Services.js";
/** One body the model asked to see: the skill's name and its exact current text. */
export interface View {
    readonly name: string;
    readonly body: string;
}
/** One phase-2 call: the route, the system prompt, the user text's parts, and the run's limits. */
export interface ConfirmOptions {
    readonly route: Route;
    /** `Prompt(2)`, the byte-stable phase-2 text. */
    readonly system: string;
    /** The digest text (`Function/Digest`). */
    readonly digest: string;
    /** The catalog index lines (`Function/Catalog`). */
    readonly index: readonly string[];
    /** The bodies the plan asked for, in the order the caller loaded them. */
    readonly views: readonly View[];
    readonly maxTokens: number;
    readonly signal: AbortSignal;
}
export default _default;
declare function _default(Llm: LlmSlice, Options: ConfirmOptions): Promise<string>;

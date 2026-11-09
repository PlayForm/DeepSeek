/**
 * @module Confirm
 *
 * The phase-2 request: the same call shape as phase 1, carrying the exact bodies
 * the plan asked to see, so a patch can only target text the model was handed.
 *
 * @remarks
 * THIS FILE IS THE READ-BEFORE-WRITE PROPERTY, not a second prompt. The view set is
 * computed by the caller as the plan's `views` unioned with every patch and support
 * target (plan section 4.2), so a body the model did not name is still carried when
 * an operation targets it, and the judge's `body-carried` rule can then require the
 * anchor to occur in text the model actually saw. A confirm call that carried a body
 * the model did not ask for, or that omitted one it did, would break the identity the
 * whole fence rests on.
 *
 * THE BODIES ARE THE EXACT CURRENT TEXT: `ctx.skills.get(name).content` for a
 * `SKILL.md`, `ctx.fs.readText` for a support file (plan section 4.2). Nothing here
 * re-wraps, trims, or normalises them, because the model copies `oldString` out of
 * this text character for character and the fence later matches that anchor against
 * the file.
 *
 * THE FENCE LENGTH IS COMPUTED, because a `SKILL.md` may itself contain a
 * triple-backtick code fence - a skill about a build pipeline almost certainly does.
 * A fixed three-backtick delimiter would close early and hand the model a truncated
 * body, which is exactly the failure the read-before-write property exists to
 * prevent; so the delimiter is one backtick longer than the longest run the body
 * contains, and never shorter than three.
 *
 * WHY THE REQUEST AND THE `text-delta` READ ARE REPEATED FROM `Function/Plan`: the
 * two phases are two requests with one shape (plan section 4.1 and 4.2), and each
 * leaf owns its own request so a change to one phase cannot silently change the
 * other. The read is the same four lines by necessity - a reply is read from
 * `text-delta` frames only (`dsh-llm/lib/types/types.d.ts:439-442`).
 */
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

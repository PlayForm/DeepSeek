import type { PostToolDecision } from "@deepseek-ai/dsh-tools";
import type State from "../Interface/State.js";
/**
 * @module Overpass
 *
 * The ets-hook-dsh-normalize-fullwidth's THIN DELEGATE over the ETS base's tool-results arm
 * factory (@playform/ets-base-dsh/Overpass/ToolResults).
 *
 * @remarks
 *
 * The generic machinery lives in the base; this file supplies only what
 * makes it THE NORMALIZE-FULLWIDTH:
 *
 *   - the fullwidth transform - the core's Fullwidth map pinned to the ASCII
 *     counterparts (the one-argument delegate ignores State);
 *   - the fullwidth ledger line - byte-identical with the Classic tree's
 *     line: `overpass: normalized N char(s) in tool result <name> <callId>`;
 *   - the fullwidth ledger sink - State.Factory.Append /
 *     State.Factory.Journal;
 *   - the fullwidth module identity - State.Module (the Classic identity,
 *     `hook-dsh-normalize-fullwidth`), prefixed by the factory's Append;
 *   - the schema-default exemption list, exported here because the module's
 *     `normalize-overpass scopes` command reports it (Function/Command).
 *
 * The default export is the listener itself (the factory's return), so
 * Function/Apply's `{ prepend: true }` registration and the import path stay
 * untouched.
 */
/**
 * The schema-default scopes (the fallback for a hand-built config).
 */
export declare const DefaultScopes: {
    conversation: boolean;
    reasoning: boolean;
    toolInput: boolean;
    toolResults: boolean;
    files: boolean;
    batch: boolean;
};
/**
 * The schema-default exemption list (the fallback for a hand-built config).
 */
export declare const DefaultExempt: string[];
declare const _default: (Exec: {
    name?: unknown;
    callId?: unknown;
}, Result: {
    content?: unknown;
}, Next: () => Promise<PostToolDecision>, State: State) => Promise<PostToolDecision>;
export default _default;

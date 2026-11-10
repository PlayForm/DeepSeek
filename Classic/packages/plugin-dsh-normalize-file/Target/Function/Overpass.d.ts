/**
 * @module Overpass
 *
 * The plugin-dsh-normalize-file's THIN DELEGATE over the core's tool-results
 * arm factory (@playform/lib-dsh-core/Overpass/ToolResults).
 *
 * @remarks
 * The generic machinery (next() first, the tool-results scope gate, the
 * exemption list, the accepted/non-value decision rules, the content basis,
 * the text-only block rewrite, the CCR marker guard, the fail-open, the
 * identity-preserving no-op) lives in the core; this file supplies only what
 * makes it THE NORMALIZE-FILE:
 *
 * - the file transform - the six-fold Rewrite chain (dashes to the configured
 *   replacement, then quotes, ellipsis, spaces, invisible removal, fullwidth),
 *   read per call from the volatile-refreshed State;
 * - the file ledger line - the module's own string, byte-identical with the
 *   pre-delegate arm: `overpass: normalized N char(s) in tool result <name>
 *   <callId>`;
 * - the file ledger sink - State.Factory.Append / State.Factory.Journal;
 * - the file module identity - State.Module, which the factory's Append
 *   prefixes (the delegate never hardcodes the identity);
 * - the schema-default exemption list, exported here because the module's
 *   `normalize-overpass scopes` command reports it (Function/Command).
 *
 * The default export is the listener itself (the factory's return), so
 * Function/Apply's `{ prepend: true }` registration and the import path stay
 * untouched. The registration is what makes the arm OUTERMOST in the family's
 * bundle order; the core's marker guard makes any load order safe.
 */
import type { PostToolDecision } from "@deepseek-ai/dsh-tools";
import type State from "@Interface/State.js";
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

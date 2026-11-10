/**
 * @module Overpass
 *
 * The comment filter's THIN DELEGATE over the core's tool-results arm factory
 * (@playform/lib-dsh-core/Overpass/ToolResults).
 *
 * @remarks
 * The generic machinery (next() first, the accepted/non-value decision rules, the content basis,
 * the text-only block rewrite, the CCR marker guard, the fail-open, the identity-preserving
 * no-op, the ledger journal) lives in the core; this file supplies only what makes it THE
 * COMMENT FILTER:
 *
 * - the FLAVOR's transform - Function/Strip, the envelope-aware, string-aware comment remover,
 *   read per call from the State (the volatile-refreshed `notice` lands on the next dispatch);
 * - the FLAVOR's ledger line - the module's own string, byte-exact:
 *   `filtered N comment(s) in tool result <name> <callId>`;
 * - the FLAVOR's ledger sink - State.Factory.Append / State.Factory.Journal (the factory never
 *   owns ledger strings);
 * - the FLAVOR's module identity - `State.Module`, which the factory's Append prefixes
 *   (`hook-dsh-comment-filter: ...`); the delegate never hardcodes the identity;
 * - the FLAVOR's schema-default exemption list - `read` and `ccr_retrieve` are ABSENT, the
 *   deliberate opposite of the normalize flavors (they exempt `read` as byte-contracted; here
 *   the omission of comment bytes is the whole feature).
 *
 * THE MODULE GATE IS THE SINGLE DECISION POINT: Function/Gate decides per call (enabled /
 * targets / exempt / intent / keywords) and the core arm then does the mechanics. The core
 * arm's OWN scope gate (`State.Scopes.toolResults`) is pinned OPEN by the adapter
 * Function/Apply installs - this flavor has no scope vocabulary.
 *
 * `next()` IS ALWAYS AWAITED FIRST and exactly ONCE: the module listener settles the downstream
 * decision itself and hands the core a thunk that resolves it - the core calls the thunk once,
 * so the waterfall is never short-circuited and the downstream decision is never computed twice.
 * The core listener is built ONCE (this module is imported by Function/Apply, and the factory is
 * stateless per call, so one instance serves every dispatch).
 *
 * FAIL-OPEN: the whole body is one try/catch; on any error the downstream decision is returned
 * UNCHANGED. Never throw into the waterfall - a thrown listener would turn a good tool result
 * into a pipeline failure.
 */
import type { PostToolDecision } from "@deepseek-ai/dsh-tools";
import type State from "@Interface/State.js";
/**
 * The structural tool execution: only the fields the delegate reads.
 */
type Execution = {
    name?: unknown;
    callId?: unknown;
    agent?: unknown;
};
/**
 * The structural tool execution result: only the content basis.
 */
type Result = {
    content?: unknown;
};
export default _default;
declare function _default(Exec: Execution, Result: Result, Next: () => Promise<PostToolDecision>, State: State): Promise<PostToolDecision>;

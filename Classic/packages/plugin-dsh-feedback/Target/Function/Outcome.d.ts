import type Shape from "../Interface/Outcome.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Outcome
 *
 * The batch outcome record (Function/Outcome): the caller-side orchestration
 * integration the plan defers.
 *
 * @remarks
 *
 * The ingester (the outcome's owner) reports the apply's honest result; a
 * decision that never reaches an apply (denied / expired) can be reported by
 * whoever recorded it.
 *
 * The record is APPENDED to the session's outcome ring (never rewritten - the
 * same honesty rule the blocks carry) and journaled as its own line:
 *
 * ```
 * {"at":<epoch>,"event":"batch","session":"<s>","agentId":"<a>",
 *  "proposal":"<id>","outcome":"applied","detail":"applied 1, conflicts 0, recovery 0"}
 * ```
 *
 * The journal line is its own shape (the block events carry a `block`); the
 * two writers append to the same file, and both are best-effort - a ledger
 * failure never breaks the service.
 */
declare function _default(State: State, Session: string, AgentId: string, Proposal: string, Outcome_: string, Detail: string): Shape | null;

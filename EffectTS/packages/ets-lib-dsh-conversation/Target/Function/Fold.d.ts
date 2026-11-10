/**
 * @module Fold
 *
 * The pure fold: the session log's records, in sequence order, become the
 * conversation state of one session (the conversation spine's section 3.1).
 *
 * @remarks
 * It reads exactly the shapes the harness records - session, turn/start,
 * step/start, assistant/message, tool/call - and skips every other shape
 * without throwing. The shared rules are imported, not re-written: the touch
 * derivation is Function/Resolve's and the call fields are Function/Usage's,
 * each imported here and by Function/Emits, so the rule lives in one module
 * and both import it. The fold is pure: no I/O, no clock, no global state.
 */
import type State from "../Interface/State.js";
export default _default;
declare function _default(Events: readonly unknown[]): State;

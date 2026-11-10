/**
 * @module Emits
 *
 * The pure emission: the session log's records, in sequence order, become
 * the conversation envelopes the factory's service emits on the bus (the
 * conversation spine's section 3.1).
 *
 * @remarks
 * One envelope per state-changing event: the turn start, the step start,
 * the assistant message, the tool call, each resolved touch, and the
 * session end (`session/disposed` or `turn/end`). It reads exactly the
 * shapes the harness records and skips every other shape without throwing.
 * The shared rules are imported, not re-written: the touch derivation is
 * Function/Resolve's and the call fields are Function/Usage's - the same
 * modules Function/Fold imports - so the rule lives in one module and all
 * three use it. The emission is pure: no I/O, no clock, no global state.
 */
import type Envelope from "../Interface/Envelope.js";
export default _default;
declare function _default(Events: readonly unknown[]): readonly Envelope[];

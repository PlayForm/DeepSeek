import type State from "../Interface/State.js";
export default _default;
/**
 * @module Append
 *
 * The ledger write: one global log line through the module's own channel.
 *
 * @remarks
 *
 * The family's Append pattern writes the logger first, then the durable ledger file. The logger
 * prefix is the module's frozen `graph: ` tag; the message strings are the module's own and
 * byte-stable (the brief's section 4.6 list).
 *
 * The durable file is appended only when a ledger path is set (the internal `State.Ledger` seam
 * - config `logFile` names the path and config `log` gates it; the empty default keeps the
 * logger as the only surface). It is the plugin's OWN diagnostic log, not a
 * governed file, so the plain `appendFileSync` is the documented exemption (identical to the
 * factory's).
 *
 * Both writes are best-effort and never rethrow.
 */
declare function _default(StateRef: State, Message: string): void;

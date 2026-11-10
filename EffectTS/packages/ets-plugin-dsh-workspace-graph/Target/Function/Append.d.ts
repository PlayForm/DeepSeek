import type State from "../Interface/State.js";
export default _default;
/**
 * @module Append
 *
 * The ledger: one global log line through the module's own channel, logger
 * first and then the durable ledger file.
 *
 * @remarks
 *
 * The family's Append pattern. The logger prefix is the module's frozen
 * `graph: ` tag; the message strings are the module's own and byte-stable
 * (the brief's section 4.6 list). The durable file is appended only when a
 * ledger path is set (the internal State.Ledger seam - the frozen config
 * table has no ledger knob); it is the plugin's OWN diagnostic log, not a
 * governed file, so the plain `appendFileSync` is the documented exemption
 * (identical to the factory's). Both best-effort, never rethrow.
 */
declare function _default(StateRef: State, Message: string): void;

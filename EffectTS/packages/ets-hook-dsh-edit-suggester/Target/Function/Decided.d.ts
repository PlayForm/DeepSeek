/**
 * @module Decided
 *
 * Prints the `decided` ledger line for one emitted note or one gated silence.
 *
 * @remarks
 * The line is a single byte-stable form, so the decision is answerable from the ledger
 * alone (D8: every decision logged):
 *
 * ```
 * decided <Family> <kappa> <n> companions <head path> <values> weights <weights> store=<pattern|memory>
 * ```
 *
 * The values and the weights are the canonical `name=value` tables (Function/Table); the
 * head is the top-ranked companion, whose row the values describe (the per-companion rows
 * of the rest live in the stored decision record - a ledger line cannot carry seven paths'
 * six values each). `store` names the backend that answered, so a live operator can tell
 * the durable learning from the memory fallback without reading the state.
 */
import type Decision from "../Interface/Decision.js";
export default _default;
declare function _default(
/**
 * The decision record to print.
 */
Record: Decision): string;

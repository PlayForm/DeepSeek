/**
 * @module Pipe
 *
 * Handles one collected stream chunk: the ledger line (the smoke's arbiter) and, when a job
 * ring is attached (P1), the same text into the ring.
 */
import type State from "../../../Interface/State.js";
export default _default;
declare function _default(State: State, Text: string, Emit: ((text: string) => void) | undefined): void;

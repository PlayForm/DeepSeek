import type { ProcessStatus } from "../Interface/Process.js";
export default _default;
/**
 * @module Transition
 *
 * The process-cell state machine's one guard: is this edge legal?
 *
 * @remarks
 *
 * Every writer asks this question before it moves a cell, so the legal edges
 * live in one table (`Variable/Table`) instead of direct assignments scattered
 * across the writers. The lookup is pure: it reads the table and answers.
 */
declare function _default(From: ProcessStatus, To: ProcessStatus): boolean;

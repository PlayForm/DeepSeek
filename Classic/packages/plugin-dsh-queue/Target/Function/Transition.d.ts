import type { TaskState } from "../Interface/Task.js";
export default _default;
/**
 * @module Transition
 *
 * The task state machine's one guard: is this edge legal?
 *
 * @remarks
 *
 * Every transition site asks this question before it flips a task, so the
 * legal edges live in one table (`Variable/Table`) instead of six hand-written
 * comparisons. The lookup is pure: it reads the table and answers.
 */
declare function _default(From: TaskState, To: TaskState): boolean;

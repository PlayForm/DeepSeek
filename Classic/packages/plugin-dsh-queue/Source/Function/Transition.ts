import type { TaskState } from "@Interface/Task.js";

import Table from "../Variable/Table.js";

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
export default (From: TaskState, To: TaskState): boolean => Table(From, To);

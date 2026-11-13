import type { TaskState } from "@Interface/Task.js";

/**
 * @module Table
 *
 * The task state machine's transition table: for every state, the states the
 * plugin is allowed to move it to.
 *
 * @remarks
 *
 * The union in `Interface/Task` declares the vocabulary; this table declares
 * the GRAMMAR. Before it, the legal edges existed only as the six ad-hoc
 * guards in Enqueue, Dispatch, Schedule, Dispatcher, Settle and Reconcile, so
 * a new site could invent an edge nobody reviewed.
 *
 * The edges are exactly the ones the six sites already enforced - the table
 * is a declaration, not a behavior change: a terminal state has no outgoing
 * edge, `queued` may only be dispatched, and a dispatched or running task
 * may requeue, start, settle or fail.
 *
 * The table is static and pure: no mount, no State, no I/O.
 */

// The edges, each named with the site that already enforced it:
//
//   queued -> dispatched: Schedule's queued-only filter, flipped by Dispatch
//   dispatched -> queued: Reconcile's requeue arm (the first orphan detection)
//   dispatched -> running: Dispatcher's Start
//   dispatched -> completed: Settle (the complete arm)
//   dispatched -> failed: Settle (the fail arm) and Reconcile's give-up arm
//   dispatched -> interrupted: Settle (the interrupt arm)
//   running -> queued: Reconcile's requeue arm (the first orphan detection)
//   running -> completed: Settle (the complete arm)
//   running -> failed: Settle (the fail arm) and Reconcile's give-up arm
//   running -> interrupted: Settle (the interrupt arm)
const Table: Record<TaskState, readonly TaskState[]> = {
	queued: ["dispatched"],
	dispatched: ["queued", "running", "completed", "failed", "interrupted"],
	running: ["queued", "completed", "failed", "interrupted"],
	completed: [],
	failed: [],
	interrupted: [],
};

export default (From: TaskState, To: TaskState): boolean => Table[From].includes(To);

import type { ProcessStatus } from "@Interface/Process.js";

/**
 * @module Table
 *
 * The process-cell state machine's transition table: for every status, the
 * statuses the machine is allowed to move a cell to.
 *
 * @remarks
 *
 * `Interface/Process` declares the vocabulary; this table declares the
 * GRAMMAR. Before it, the legal edges existed only as the direct status
 * assignments in Machine and Ops, so a new writer could invent an edge nobody
 * reviewed.
 *
 * The edges are exactly the ones the writers already enforce - the table is a
 * declaration, not a behavior change. Each edge names its writer in one
 * clause:
 *
 * - observed -> running: the commit start (Ops phase 1 selects the cell).
 * - observed -> halted: the stale observer (Machine.OnObserved, the version
 *   moved underneath).
 * - running -> observed: the designed no-op and the atomic gate's unwritten
 *   remainder (Ops).
 * - running -> halted: the close settle ("interrupted"), the plan-phase stale
 *   ("stale") and the no-jobs-hub deadline ("deadline") (Machine.Close, Ops).
 * - running -> done: the applied write, inline and its background-job twin
 *   (Ops).
 * - running -> errored: the plan failure and the write failure (Ops).
 * - halted -> running: the re-commit selection (Ops phase 1 selects halted
 *   cells).
 * - done -> observed: the re-insert renewal (Machine.Adopt).
 * - done -> halted: the stale observer (Machine.OnObserved skips only running
 *   and halted cells).
 * - errored -> running: the re-commit selection (Ops phase 1 selects errored
 *   cells).
 * - errored -> halted: the stale observer (Machine.OnObserved skips only
 *   running and halted cells).
 *
 * The table is static and pure: no mount, no State, no I/O.
 */
const Table: Record<ProcessStatus, readonly ProcessStatus[]> = {
	observed: ["running", "halted"],
	running: ["observed", "halted", "done", "errored"],
	halted: ["running"],
	done: ["observed", "halted"],
	errored: ["running", "halted"],
};

export default (From: ProcessStatus, To: ProcessStatus): boolean => Table[From].includes(To);

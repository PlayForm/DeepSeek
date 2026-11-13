import type { HaltReason, ProcessCell, ProcessStatus } from "@Interface/Process.js";

import Transition from "./Transition.js";

/**
 * @module Flip
 *
 * The ONE writer of a process cell's status: the guard, the halt reason and
 * the move.
 *
 * @remarks
 *
 * Every status change goes through here, so the machine has one place that
 * decides whether an edge is legal. A refused edge leaves the cell untouched
 * and answers false - the caller's own ledger line and the fields it sets
 * beside the status (`freshVersion`, `diff`, `error`, `opAt`) stay the
 * caller's business.
 *
 * The halt reason is set ONLY on the halted edge and cleared on every other
 * edge, so a cell that leaves the halted state cannot carry a stale reason.
 */
export default (Cell: ProcessCell, Next: ProcessStatus, Reason?: HaltReason): boolean => {
	switch (true) {
		case !Transition(Cell.status, Next):
			return false;
		default:
			Cell.status = Next;
			Cell.haltReason = Next === "halted" ? Reason : undefined;
			return true;
	}
};

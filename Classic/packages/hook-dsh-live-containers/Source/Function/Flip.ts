import type { MemberStatus } from "@Interface/Member.js";

import Table from "../Variable/Table.js";

/**
 * @module Flip
 *
 * The board member's ONE status writer: the guard and the move.
 *
 * @remarks
 *
 * Every status change goes through here, so the machine has one place that
 * decides whether an edge is legal. A refused edge leaves the row untouched
 * and answers false - the caller's own lease fields and ledger lines stay the
 * caller's business.
 */
export default (Row: { status: MemberStatus }, Next: MemberStatus): boolean => {
	switch (true) {
		case !Table(Row.status, Next):
			return false;
		default:
			Row.status = Next;
			return true;
	}
};

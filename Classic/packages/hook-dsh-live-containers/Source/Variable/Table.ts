import type { MemberStatus } from "@Interface/Member.js";

/**
 * @module Table
 *
 * The board member's state machine: for every status, the statuses the board
 * is allowed to move a member to.
 *
 * @remarks
 *
 * The statuses were strings compared in place; this table declares the
 * grammar. The edges are exactly the ones the board already enforces - a
 * declaration, not a behavior change - and each names its site in one clause.
 * `Report` writes without a from-guard, so its "stalled", "error" and "done"
 * reports land from any status, while its "running" report runs every row
 * EXCEPT a stale one (the stale row stays stale); `OnSettled` lands done or
 * failed from the three live rows its settled-guard leaves; `OnTurn` stalls
 * only a running row and declares stale only a row that still holds a lease
 * entry - a settled row has none. The edges the module never performs are
 * absent: nothing moves a stale row back to running and nothing makes a
 * settled row stale.
 *
 * Static and pure: no mount, no State, no I/O.
 */
const Table: Record<MemberStatus, readonly MemberStatus[]> = {
	running: ["running", "stalled", "stale", "done", "failed"],
	stalled: ["running", "stalled", "stale", "done", "failed"],
	stale: ["stale", "stalled", "done", "failed"],
	done: ["running", "stalled", "done", "failed"],
	failed: ["running", "stalled", "done", "failed"],
};

export default (From: MemberStatus, To: MemberStatus): boolean => Table[From].includes(To);

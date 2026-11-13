/**
 * @module Member
 *
 * The board member's status vocabulary and its lease shape.
 *
 * @remarks
 *
 * The statuses were strings the module compared against itself, and the lease
 * was four loose fields; this module declares both so the machine in
 * `Function/Board` can name its states and its table can name its edges.
 */
export type MemberStatus = "running" | "stalled" | "stale" | "done" | "failed";
export interface MemberLease {
    remaining: number;
    declared: boolean;
    stalledLedged: boolean;
    lastReportAt: number;
}

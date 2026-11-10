/**
 * @module Contributions
 *
 * The engine's second, file-scoped read family: for one file path, the
 * conversations that contributed to that file's cost, and one
 * conversation's calls that allocated to that same file.
 *
 * @remarks
 * Each read carries the money it allocated to the file and its share of the
 * file's whole lifetime total; the deeper level carries each call's own
 * money, tokens, stage and touch evidence. This is the product question the
 * ledger exists to answer (the file, then its conversations, then their
 * calls and models), so each read is one statement and no envelope: the
 * report reads stay untouched, and a path or a session the ledger does not
 * record answers an empty array rather than a throw.
 *
 * THE CONVERSATION READ resolves the file by its exact path (File.Path,
 * which the ledger keys per project, so every FileId carrying that path is
 * in scope), aggregates the allocation money per CallId first - a call with
 * several allocation rows for the file cannot fan its money out - then
 * groups those calls by SessionId for the distinct call count, the direct
 * and amortized sums and the first and last call times, joins Session for
 * the title, and carries the file's lifetime total (the same pre-aggregated
 * money over every session) so the caller can divide one group by it. The
 * models are the distinct `Provider/Model` ids of the group's calls, handed
 * over as one JSON array.
 *
 * THE CALL READ is the same file scope and the same per-call money,
 * narrowed to one conversation: CallScope pins the session, CallMoney
 * collapses the file's Allocation rows to one money row per call, TouchRow
 * collapses the file's Touch rows to one stage and one touched flag per
 * call, and the two meet on CallId in one FROM clause - the money never
 * joins Touch, so a call that touched the file more than once cannot
 * multiply its allocation, and the LEFT JOIN keeps a call that only carried
 * the file (no touch row) in the answer with `Touched` false and a null
 * stage. The order is the conversation's own grain: turn, step, then the
 * call id.
 *
 * Every statement reads only; the caller owns the open handle, so this
 * module sees the open ledger and never a path it resolves itself. The
 * twin's read service has not been ported yet, so these are the Functions
 * the future service (and the file-to-conversation command) call directly,
 * exactly as Function/Report and Function/Assess are called.
 */
import type { DatabaseSync } from "node:sqlite";
import type ContributionRow from "../Interface/ContributionRow.js";
import type FileCallRow from "../Interface/FileCallRow.js";
export default _default;
declare function _default(Database: DatabaseSync): {
    Contributions: (Path: string) => readonly ContributionRow[];
    FileCalls: (Path: string, SessionId: string) => readonly FileCallRow[];
};

/**
 * @module Contributions
 *
 * The engine's file-scoped read family: for one file path, the conversations
 * that contributed to that file's cost, the calls that allocated to it, and the
 * file's own content versions with the touches bound to each.
 *
 * @remarks
 * This is the product question the ledger exists to answer (the file, then its
 * conversations, then their calls and models, then the content chain those
 * calls produced), so each read is one statement and no envelope: the session
 * reader keeps its CostResponse untouched, and a path or a session the ledger
 * does not record answers an empty array rather than a throw. Every statement
 * reads only; the read-only open lives in `Function/Provide`, so this module
 * sees the open handle and never a path it resolves itself.
 *
 * The conversation read resolves the file by its exact path (File.Path, which
 * the ledger keys per project, so every FileId carrying that path is in scope),
 * aggregates the allocation money per CallId first - a call with several
 * allocation rows for the file cannot fan its money out - then groups those
 * calls by SessionId for the distinct call count, the direct and amortized sums
 * and the first and last call times, joins Session for the title, and carries
 * the file's lifetime total (the same pre-aggregated money over every session)
 * so the reader can divide one group by it. The models are the distinct
 * `Provider/Model` ids of the group's calls, handed over as one JSON array.
 *
 * The call read is the same file scope and the same per-call money, narrowed to
 * one conversation: CallScope pins the session, CallMoney collapses the file's
 * Allocation rows to one money row per call, TouchRow collapses the file's
 * Touch rows to one stage and one touched flag per call, and the two meet on
 * CallId in one FROM clause - the money never joins Touch, so a call that
 * touched the file more than once cannot multiply its allocation, and the LEFT
 * JOIN keeps a call that only carried the file (no touch row) in the answer
 * with `touched` false and a null stage. The order is the conversation's own
 * grain: turn, step, then the call id.
 *
 * The version read is the artifact-lineage step (the research's sections 3.C
 * and 4): the same exact-path file scope, the FileVersion rows of those files
 * LEFT JOINed to the Touch rows that carry each version as their VersionId and
 * grouped per version, so a version no touch has bound yet - a write's after
 * content, until a later touch comes - keeps its row with a zero count instead
 * of disappearing. The touch count, the first and last touch time and the
 * distinct session count collapse in one grouped subquery, so a version bound
 * by many touches is still one row and the join can never fan out; the distinct
 * kinds are the correlated JSON array of that version's own touch rows, the
 * same one-array hand-over the conversation read uses for its models. The order
 * is newest first - ObservedAt, then VersionId, both descending - because a
 * content chain reads from the version the ledger saw last.
 */
import type { DatabaseSync } from "node:sqlite";
import type CostContributionRow from "../Interface/ContributionRow.js";
import type CostFileCallRow from "../Interface/FileCallRow.js";
import type CostVersionRow from "../Interface/VersionRow.js";
export default function Contributions(Database: DatabaseSync, Path: string): readonly CostContributionRow[];
export declare function FileCalls(Database: DatabaseSync, Path: string, SessionId: string): readonly CostFileCallRow[];
export declare function History(Database: DatabaseSync, Path: string): readonly CostVersionRow[];

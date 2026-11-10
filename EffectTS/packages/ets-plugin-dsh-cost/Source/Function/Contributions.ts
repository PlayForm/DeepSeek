import type { DatabaseSync, SQLOutputValue } from "node:sqlite";

import type ContributionRow from "@Interface/ContributionRow.js";
import type FileCallRow from "@Interface/FileCallRow.js";

/**
 * @module Contributions
 *
 * The engine's second, file-scoped read family: for one file path, the
 * conversations that contributed to that file's cost, and one
 * conversation's calls that allocated to that same file.
 *
 * @remarks
 *
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
/**
 * The two read-only statements: FileScope pins the path, CallMoney
 * collapses the Allocation rows to one money row per call, Lifetime sums
 * that same money across every session, SessionRow groups it by the call's
 * session, and FileCalls joins that same per-call money to the call row and
 * to the per-call touch.
 *
 * @remarks
 *
 * TouchRow is the same collapse on the touch side: the touch count is the
 * evidence flag and the stage is the call's own stage word - the greatest
 * name when one call recorded more than one touch of the file, so the row
 * stays one per call and never fans out. The model list is a correlated
 * subquery over the group's calls, so the fan-out the statements avoid in
 * money never returns in the string. The conversation sort is the unrounded
 * total, descending, with the session id as the tiebreak.
 */
const Query = {
	Contributions: `WITH FileScope AS (
    SELECT File.FileId AS FileId
    FROM File
    WHERE File.Path = ?
),
CallMoney AS (
    SELECT Allocation.CallId AS CallId,
        SUM(Allocation.DirectCost) AS Direct,
        SUM(Allocation.AmortizedCost) AS Amortized
    FROM Allocation
    JOIN FileScope ON FileScope.FileId = Allocation.FileId
    GROUP BY Allocation.CallId
),
Lifetime AS (
    SELECT SUM(CallMoney.Direct + CallMoney.Amortized) AS Total
    FROM CallMoney
),
SessionRow AS (
    SELECT Call.SessionId AS SessionId,
        COUNT(*) AS Calls,
        SUM(CallMoney.Direct) AS Direct,
        SUM(CallMoney.Amortized) AS Amortized,
        SUM(CallMoney.Direct + CallMoney.Amortized) AS Total,
        MIN(Call.At) AS FirstAt,
        MAX(Call.At) AS LastAt
    FROM CallMoney
    JOIN Call ON Call.CallId = CallMoney.CallId
    GROUP BY Call.SessionId
)
SELECT SessionRow.SessionId AS SessionId,
    Session.Title AS Title,
    SessionRow.Calls AS Calls,
    SessionRow.Direct AS Direct,
    SessionRow.Amortized AS Amortized,
    SessionRow.Total AS Total,
    (SELECT Lifetime.Total FROM Lifetime) AS Lifetime,
    SessionRow.FirstAt AS FirstAt,
    SessionRow.LastAt AS LastAt,
    (SELECT json_group_array(Model.Id) FROM (
            SELECT DISTINCT Call.Provider || '/' || Call.Model AS Id
            FROM CallMoney
            JOIN Call ON Call.CallId = CallMoney.CallId
            WHERE Call.SessionId = SessionRow.SessionId
            ORDER BY Id ASC
        ) AS Model) AS Models
FROM SessionRow
LEFT JOIN Session ON Session.SessionId = SessionRow.SessionId
ORDER BY SessionRow.Total DESC, SessionRow.SessionId ASC;`,

	FileCalls: `WITH FileScope AS (
    SELECT File.FileId AS FileId
    FROM File
    WHERE File.Path = ?
),
CallScope AS (
    SELECT Call.CallId AS CallId,
        Call.Turn AS Turn,
        Call.Step AS Step,
        Call.At AS At,
        Call.Provider AS Provider,
        Call.Model AS Model,
        Call.InputTokens AS InputTokens,
        Call.OutputTokens AS OutputTokens,
        Call.CacheReadTokens AS CacheReadTokens,
        Call.CacheWriteTokens AS CacheWriteTokens
    FROM Call
    WHERE Call.SessionId = ?
),
CallMoney AS (
    SELECT Allocation.CallId AS CallId,
        SUM(Allocation.DirectCost) AS Direct,
        SUM(Allocation.AmortizedCost) AS Amortized
    FROM Allocation
    JOIN FileScope ON FileScope.FileId = Allocation.FileId
    JOIN CallScope ON CallScope.CallId = Allocation.CallId
    GROUP BY Allocation.CallId
),
TouchRow AS (
    SELECT Touch.CallId AS CallId,
        MAX(Touch.Stage) AS Stage,
        COUNT(*) AS Touched
    FROM Touch
    JOIN FileScope ON FileScope.FileId = Touch.FileId
    JOIN CallScope ON CallScope.CallId = Touch.CallId
    GROUP BY Touch.CallId
)
SELECT CallScope.CallId AS CallId,
    CallScope.Turn AS Turn,
    CallScope.Step AS Step,
    CallScope.At AS At,
    CallScope.Provider AS Provider,
    CallScope.Model AS Model,
    CallMoney.Direct AS Direct,
    CallMoney.Amortized AS Amortized,
    CallMoney.Direct + CallMoney.Amortized AS Total,
    CallScope.InputTokens AS InputTokens,
    CallScope.OutputTokens AS OutputTokens,
    CallScope.CacheReadTokens AS CacheReadTokens,
    CallScope.CacheWriteTokens AS CacheWriteTokens,
    TouchRow.Stage AS Stage,
    COALESCE(TouchRow.Touched, 0) AS Touched
FROM CallMoney
JOIN CallScope ON CallScope.CallId = CallMoney.CallId
LEFT JOIN TouchRow ON TouchRow.CallId = CallMoney.CallId
ORDER BY CallScope.Turn ASC, CallScope.Step ASC, CallScope.CallId ASC;`,
} as const;

/**
 * The row readers both statements share: every statement of this module
 * hands over the same SQLite value shapes, so the helpers are defined once
 * and read the same way whichever grain the caller asked for.
 */
const Text = (Row: Record<string, SQLOutputValue>, Key: string): string | null => {
	const Value = Row[Key];
	return typeof Value === "string" ? Value : null;
};

/**
 * One finite number cell of a statement row, or null.
 */
const Figure = (Row: Record<string, SQLOutputValue>, Key: string): number | null => {
	const Value = Row[Key];
	return typeof Value === "number" && Number.isFinite(Value) ? Value : null;
};

/**
 * One number cell read as zero when it is absent or not finite.
 */
const Stored = (Row: Record<string, SQLOutputValue>, Key: string): number => Figure(Row, Key) ?? 0;

/**
 * One money column: the rounding is to the sixth decimal, the precision
 * every report read lands on, so a contribution row agrees with the file
 * row of the report reads and with the report of the same sum, and a call
 * row agrees with the conversation row above it.
 */
const Round = (Value: number): number => Math.round(Value * 1e6) / 1e6;

/**
 * The model ids the statement hands over as one JSON array (the provider
 * and model pair is the id), never split from a comma-joined list, because
 * a model id may itself carry punctuation the aggregate does not escape.
 */
const ModelList = (Raw: SQLOutputValue | undefined): readonly string[] => {
	if (typeof Raw !== "string") {
		return [];
	}
	const Parsed: unknown = JSON.parse(Raw);
	return Array.isArray(Parsed)
		? Parsed.filter((One): One is string => typeof One === "string")
		: [];
};

export default (Database: DatabaseSync) => {
	const SelectContributions = Database.prepare(Query.Contributions);
	const SelectFileCalls = Database.prepare(Query.FileCalls);

	// The conversation read: one row per session that ever allocated money to
	// this path, newest money first, with the file's lifetime total and the
	// share this session carried.
	const Contributions = (Path: string): readonly ContributionRow[] =>
		SelectContributions.all(Path).map((Row) => {
			const Direct = Round(Stored(Row, "Direct"));
			const Amortized = Round(Stored(Row, "Amortized"));
			const Total = Round(Direct + Amortized);
			const Lifetime = Round(Stored(Row, "Lifetime"));
			return {
				SessionId: Text(Row, "SessionId") ?? "",
				Title: Text(Row, "Title"),
				Calls: Stored(Row, "Calls"),
				Direct,
				Amortized,
				Total,
				// The share is this conversation's rounded total over the
				// file's rounded lifetime total, clamped into [0, 1] so the
				// rounding cannot answer a share above one, and zero when the
				// lifetime rounds to zero (the statement then stores no total
				// at all).
				Share: Lifetime > 0 ? Math.min(1, Math.max(0, Total / Lifetime)) : 0,
				FirstAt: Figure(Row, "FirstAt"),
				LastAt: Figure(Row, "LastAt"),
				Models: ModelList(Row["Models"]),
			};
		});

	// The call read: the deeper level of the same read - the calls of one
	// conversation that allocated money to one file, in the conversation's own
	// turn and step order. A path the ledger does not record, a session that
	// contributed nothing to that path, and a session that is not recorded at
	// all each answer an empty array, because the statement simply matches no
	// row; nothing here throws and nothing here writes.
	const FileCalls = (Path: string, SessionId: string): readonly FileCallRow[] =>
		SelectFileCalls.all(Path, SessionId).map((Row) => {
			const Direct = Round(Stored(Row, "Direct"));
			const Amortized = Round(Stored(Row, "Amortized"));
			return {
				CallId: Stored(Row, "CallId"),
				Turn: Stored(Row, "Turn"),
				Step: Stored(Row, "Step"),
				At: Stored(Row, "At"),
				Provider: Text(Row, "Provider") ?? "",
				Model: Text(Row, "Model") ?? "",
				Direct,
				Amortized,
				Total: Round(Direct + Amortized),
				Input: Stored(Row, "InputTokens"),
				Output: Stored(Row, "OutputTokens"),
				CacheRead: Stored(Row, "CacheReadTokens"),
				CacheWrite: Stored(Row, "CacheWriteTokens"),
				Stage: Text(Row, "Stage"),
				// The touch count is the evidence fact: a call with no Touch
				// row for the file carried it in context and never touched it,
				// and the statement's COALESCE already turned that null into a
				// zero.
				Touched: Stored(Row, "Touched") > 0,
			};
		});

	return { Contributions, FileCalls };
};

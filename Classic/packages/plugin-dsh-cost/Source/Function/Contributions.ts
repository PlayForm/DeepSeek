import type { DatabaseSync, SQLOutputValue } from "node:sqlite";

import type CostContributionRow from "@Interface/ContributionRow.js";
import type CostFileCallRow from "@Interface/FileCallRow.js";
import type CostVersionRow from "@Interface/VersionRow.js";

/**
 * @module Contributions
 *
 * The engine's file-scoped read family: for one file path, the conversations
 * that contributed to that file's cost, the calls that allocated to it, and the
 * file's own content versions with the touches bound to each.
 *
 * @remarks
 *
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
// The three read-only statements: FileScope pins the path, CallMoney
// collapses the Allocation rows to one money row per call, Lifetime sums that
// same money across every session, SessionRow groups it by the call's
// session, and FileCalls joins that same per-call money to the call row and
// to the per-call touch. TouchRow is the same collapse on the touch side: the
// touch count is the evidence flag and the stage is the call's own stage word
// - the greatest name when one call recorded more than one touch of the file,
// so the row stays one per call and never fans out. The model list is a
// correlated subquery over the group's calls, so the fan-out the statements
// avoid in money never returns in the string. The conversation sort is the
// unrounded total, descending, with the session id as the tiebreak. History
// is the version grain: VersionRow is the file's own FileVersion rows,
// TouchRow the same collapse keyed by VersionId, and the kind list the
// correlated JSON array of the version's touches - newest version first, the
// version id breaking a shared clock tick.
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

	History: `WITH FileScope AS (
    SELECT File.FileId AS FileId
    FROM File
    WHERE File.Path = ?
),
VersionRow AS (
    SELECT FileVersion.VersionId AS VersionId,
        FileVersion.Hash AS Hash,
        FileVersion.Bytes AS Bytes,
        FileVersion.Lines AS Lines,
        FileVersion.ObservedAt AS ObservedAt
    FROM FileVersion
    JOIN FileScope ON FileScope.FileId = FileVersion.FileId
),
TouchRow AS (
    SELECT Touch.VersionId AS VersionId,
        COUNT(*) AS Touches,
        MIN(Touch.At) AS FirstAt,
        MAX(Touch.At) AS LastAt,
        COUNT(DISTINCT Touch.SessionId) AS Sessions
    FROM Touch
    JOIN FileScope ON FileScope.FileId = Touch.FileId
    WHERE Touch.VersionId IS NOT NULL
    GROUP BY Touch.VersionId
)
SELECT VersionRow.VersionId AS VersionId,
    VersionRow.Hash AS Hash,
    VersionRow.Bytes AS Bytes,
    VersionRow.Lines AS Lines,
    VersionRow.ObservedAt AS ObservedAt,
    COALESCE(TouchRow.Touches, 0) AS Touches,
    TouchRow.FirstAt AS FirstAt,
    TouchRow.LastAt AS LastAt,
    COALESCE(TouchRow.Sessions, 0) AS Sessions,
    (SELECT json_group_array(Kind) FROM (
            SELECT DISTINCT Touch.Kind AS Kind
            FROM Touch
            JOIN FileScope ON FileScope.FileId = Touch.FileId
            WHERE Touch.VersionId = VersionRow.VersionId
            ORDER BY Kind ASC
        ) AS Kind) AS Kinds
FROM VersionRow
LEFT JOIN TouchRow ON TouchRow.VersionId = VersionRow.VersionId
ORDER BY VersionRow.ObservedAt DESC, VersionRow.VersionId DESC;`,
} as const;

// The row readers all three statements share: every statement of this module
// hands over the same SQLite value shapes, so the four helpers are defined
// once and read the same way whichever grain the caller asked for.
const Text = (Row: Record<string, SQLOutputValue>, Key: string): string | null => {
	const Value = Row[Key];
	return typeof Value === "string" ? Value : null;
};

const Figure = (Row: Record<string, SQLOutputValue>, Key: string): number | null => {
	const Value = Row[Key];
	return typeof Value === "number" && Number.isFinite(Value) ? Value : null;
};

const Stored = (Row: Record<string, SQLOutputValue>, Key: string): number => Figure(Row, Key) ?? 0;

// One money column: the rounding is to the sixth decimal, the precision every
// report read lands on, so a contribution row agrees with the file row of the
// session reader and with the report of the same sum, and a call row agrees
// with the conversation row above it.
const Round = (Value: number): number => Math.round(Value * 1e6) / 1e6;

// The version row's short hash: the first twelve hex characters of the
// SHA-256 digest the drain stored, the git-style version label a chain reads
// by. A version the ledger stored no hash for answers null - the row says
// "unrecorded" rather than inventing a label - and a hash the ledger stored
// shorter than this keeps every character it has.
const HASH_PREFIX = 12;

export default function Contributions(
	Database: DatabaseSync,
	Path: string,
): readonly CostContributionRow[] {
	// The model ids the statement hands over as one JSON array (the provider
	// and model pair is the id), never split from a comma-joined list, because
	// a model id may itself carry punctuation the aggregate does not escape.
	const ModelList = (Raw: SQLOutputValue | undefined): readonly string[] => {
		if (typeof Raw !== "string") {
			return [];
		}
		const Parsed: unknown = JSON.parse(Raw);
		return Array.isArray(Parsed)
			? Parsed.filter((One): One is string => typeof One === "string")
			: [];
	};

	const Rows = Database.prepare(Query.Contributions).all(Path);
	return Rows.map((Row) => {
		const Direct = Round(Stored(Row, "Direct"));
		const Amortized = Round(Stored(Row, "Amortized"));
		const Total = Round(Direct + Amortized);
		const Lifetime = Round(Stored(Row, "Lifetime"));
		return {
			sessionId: Text(Row, "SessionId") ?? "",
			title: Text(Row, "Title"),
			calls: Stored(Row, "Calls"),
			direct: Direct,
			amortized: Amortized,
			total: Total,
			// The share is this conversation's rounded total over the file's
			// rounded lifetime total, clamped into [0, 1] so the rounding
			// cannot answer a share above one, and zero when the lifetime
			// rounds to zero (the statement then stores no total at all).
			share: Lifetime > 0 ? Math.min(1, Math.max(0, Total / Lifetime)) : 0,
			firstAt: Figure(Row, "FirstAt"),
			lastAt: Figure(Row, "LastAt"),
			models: ModelList(Row["Models"]),
		};
	});
}

// FileCalls - the deeper level of the same read: the calls of one
// conversation that allocated money to one file, in the conversation's own
// turn and step order. A path the ledger does not record, a session that
// contributed nothing to that path, and a session that is not recorded at all
// each answer an empty array, because the statement simply matches no row;
// nothing here throws and nothing here writes.
export function FileCalls(
	Database: DatabaseSync,
	Path: string,
	SessionId: string,
): readonly CostFileCallRow[] {
	const Rows = Database.prepare(Query.FileCalls).all(Path, SessionId);
	return Rows.map((Row) => {
		const Direct = Round(Stored(Row, "Direct"));
		const Amortized = Round(Stored(Row, "Amortized"));
		return {
			callId: Stored(Row, "CallId"),
			turn: Stored(Row, "Turn"),
			step: Stored(Row, "Step"),
			at: Stored(Row, "At"),
			provider: Text(Row, "Provider") ?? "",
			model: Text(Row, "Model") ?? "",
			direct: Direct,
			amortized: Amortized,
			total: Round(Direct + Amortized),
			input: Stored(Row, "InputTokens"),
			output: Stored(Row, "OutputTokens"),
			cacheRead: Stored(Row, "CacheReadTokens"),
			cacheWrite: Stored(Row, "CacheWriteTokens"),
			stage: Text(Row, "Stage"),
			// The touch count is the evidence fact: a call with no Touch row
			// for the file carried it in context and never touched it, and
			// the statement's COALESCE already turned that null into a zero.
			touched: Stored(Row, "Touched") > 0,
		};
	});
}

// History - the lineage level of the same read (the research's sections 3.C
// and 4): one row per content version the ledger recorded for one file path,
// newest first, each with its short hash, the size and line count it measured,
// when it was observed, and the touches bound to it - their count, their first
// and last times, the distinct kinds they recorded and the distinct sessions
// that produced them. A path the ledger does not record answers an empty
// array, because the statement matches no File row; a version no touch has
// bound yet keeps its row with a zero count, an empty kind list and null first
// and last times. Nothing here throws and nothing here writes.
export function History(Database: DatabaseSync, Path: string): readonly CostVersionRow[] {
	// The kind list arrives as one JSON array, read exactly the way the model
	// list is: never split from a comma-joined string, because a kind the
	// ledger gains later may carry punctuation the aggregate does not escape.
	const KindList = (Raw: SQLOutputValue | undefined): readonly string[] => {
		if (typeof Raw !== "string") {
			return [];
		}
		const Parsed: unknown = JSON.parse(Raw);
		return Array.isArray(Parsed)
			? Parsed.filter((One): One is string => typeof One === "string")
			: [];
	};

	const Rows = Database.prepare(Query.History).all(Path);
	return Rows.map((Row) => ({
		versionId: Stored(Row, "VersionId"),
		hash: Text(Row, "Hash")?.slice(0, HASH_PREFIX) ?? null,
		bytes: Figure(Row, "Bytes"),
		lines: Figure(Row, "Lines"),
		observedAt: Stored(Row, "ObservedAt"),
		touches: Stored(Row, "Touches"),
		firstAt: Figure(Row, "FirstAt"),
		lastAt: Figure(Row, "LastAt"),
		kinds: KindList(Row["Kinds"]),
		sessions: Stored(Row, "Sessions"),
	}));
}

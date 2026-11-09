// Contributions - the engine's second, file-scoped read: for one file path,
// the conversations that contributed to that file's cost, each with the
// money it allocated to the file and its share of the file's whole lifetime
// total. This is the product question the ledger exists to answer (the file,
// then its conversations, then their calls and models), so the read is one
// statement and no envelope: the session reader keeps its CostResponse
// untouched, and a path the ledger does not record answers an empty array
// rather than a throw. The statement resolves the file by its exact path
// (File.Path, which the ledger keys per project, so every FileId carrying
// that path is in scope), aggregates the allocation money per CallId first -
// a call with several allocation rows for the file cannot fan its money out -
// then groups those calls by SessionId for the distinct call count, the
// direct and amortized sums and the first and last call times, joins Session
// for the title, and carries the file's lifetime total (the same
// pre-aggregated money over every session) so the reader can divide one group
// by it. The models are the distinct `Provider/Model` ids of the group's
// calls, handed over as one JSON array. Every statement reads only; the
// read-only open lives in Function/Provide, so this module sees the open
// handle and never a path it resolves itself.
import type { DatabaseSync, SQLOutputValue } from "node:sqlite";

import type CostContributionRow from "@Interface/ContributionRow.js";

// The one read-only statement: FileScope pins the path, CallMoney collapses
// the Allocation rows to one money row per call, Lifetime sums that same
// money across every session, and SessionRow groups it by the call's session.
// The model list is a correlated subquery over the group's calls, so the
// fan-out the statement avoids in money never returns in the string. The sort
// is the unrounded total, descending, with the session id as the tiebreak.
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
} as const;

export default function Contributions(
	Database: DatabaseSync,
	Path: string,
): readonly CostContributionRow[] {
	const Text = (Row: Record<string, SQLOutputValue>, Key: string): string | null => {
		const Value = Row[Key];
		return typeof Value === "string" ? Value : null;
	};
	const Figure = (Row: Record<string, SQLOutputValue>, Key: string): number | null => {
		const Value = Row[Key];
		return typeof Value === "number" && Number.isFinite(Value) ? Value : null;
	};
	const Stored = (Row: Record<string, SQLOutputValue>, Key: string): number =>
		Figure(Row, Key) ?? 0;
	// One money column: the rounding is to the sixth decimal, the precision
	// every report read lands on, so a contribution row agrees with the file
	// row of the session reader and with the report of the same sum.
	const Round = (Value: number): number => Math.round(Value * 1e6) / 1e6;
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

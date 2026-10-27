// Assess - the analytics surface (Documentation/Plans/COST-TRACK-PLUGIN.md
// section 12 and section 16): one read-only query per call that buckets a
// session's spend the way a client argues about it - delivered (the files
// whose verdict is "changed"), explored (read or searched, never changed),
// reverted (changed and then undone), overhead (the unattributed rows -
// retries, compaction, title generation, tooling) and carry (the amortized
// input mass, the part a client always disputes) - plus the derived cost per
// surviving line and the edit-grain totals (section 17.3): the hunks' own
// lines added and removed per session. The ledger always stores the
// undiscounted truth; this is a
// view over it, and a discount policy stays an export-time concern (section
// 12). The money is rounded to six decimals, the reading precision of every
// other report row.
import type { DatabaseSync } from "node:sqlite";

type Row = {
	SessionId: string;
	Delivered: number;
	Explored: number;
	Reverted: number;
	Overhead: number;
	Carry: number;
	CostPerLine: number;
	LinesAdded: number;
	LinesRemoved: number;
};

// One money column: a non-finite or absent sum is zero, never guessed, and
// the rounding is to the sixth decimal.
const Round = (Value: unknown): number => {
	const One = typeof Value === "number" && Number.isFinite(Value) ? Value : 0;
	return Math.round(One * 1e6) / 1e6;
};

export default (Database: DatabaseSync) =>
	(SessionId?: string): readonly Row[] => {
		const Argument = SessionId === undefined || SessionId.length === 0 ? undefined : SessionId;
		const Statement = Database.prepare(
			"SELECT Call.SessionId AS SessionId, " +
				"SUM(CASE WHEN Verdict.State = 'changed' THEN Allocation.DirectCost + Allocation.AmortizedCost ELSE 0 END) AS Delivered, " +
				"SUM(CASE WHEN Verdict.State = 'read' THEN Allocation.DirectCost + Allocation.AmortizedCost ELSE 0 END) AS Explored, " +
				"SUM(CASE WHEN Verdict.State = 'reverted' THEN Allocation.DirectCost + Allocation.AmortizedCost ELSE 0 END) AS Reverted, " +
				"SUM(CASE WHEN Allocation.FileId IS NULL THEN Allocation.DirectCost + Allocation.AmortizedCost ELSE 0 END) AS Overhead, " +
				"SUM(Allocation.AmortizedCost) AS Carry, " +
				"(SELECT SUM(V.LinesAdded) FROM Verdict AS V WHERE V.State = 'changed' AND V.SessionId = Call.SessionId) AS Lines, " +
				"(SELECT SUM(Edit.LinesAdded) FROM Edit JOIN Touch ON Touch.TouchId = Edit.TouchId " +
				"WHERE Touch.SessionId = Call.SessionId) AS Edited, " +
				"(SELECT SUM(Edit.LinesRemoved) FROM Edit JOIN Touch ON Touch.TouchId = Edit.TouchId " +
				"WHERE Touch.SessionId = Call.SessionId) AS Undone " +
				"FROM Allocation " +
				"JOIN Call ON Call.CallId = Allocation.CallId " +
				"LEFT JOIN Verdict ON Verdict.SessionId = Call.SessionId AND Verdict.FileId = Allocation.FileId " +
				"WHERE (? IS NULL OR Call.SessionId = ?) " +
				"GROUP BY Call.SessionId " +
				"ORDER BY Delivered + Reverted + Overhead DESC",
		);
		// The filter placeholder is written twice (the IS NULL probe and the
		// match), so the argument is bound to both; an absent argument binds null.
		const Found = (
			Argument === undefined ? Statement.all(null, null) : Statement.all(Argument, Argument)
		) as Record<string, unknown>[];
		return Found.map((One) => {
			const Delivered = Round(One["Delivered"]);
			const Lines = typeof One["Lines"] === "number" && One["Lines"] > 0 ? One["Lines"] : 0;
			return {
				SessionId: typeof One["SessionId"] === "string" ? One["SessionId"] : "",
				Delivered,
				Explored: Round(One["Explored"]),
				Reverted: Round(One["Reverted"]),
				Overhead: Round(One["Overhead"]),
				Carry: Round(One["Carry"]),
				// cost per surviving line (section 12): the delivered bucket over
				// the surviving lines - zero when nothing survived, never a guess
				CostPerLine: Lines > 0 ? Math.round((Delivered / Lines) * 1e6) / 1e6 : 0,
				// the edit-grain totals (section 17.3): the hunks' own line
				// counts per session, zero when the session edited nothing
				LinesAdded:
					typeof One["Edited"] === "number" && One["Edited"] > 0 ? One["Edited"] : 0,
				LinesRemoved:
					typeof One["Undone"] === "number" && One["Undone"] > 0 ? One["Undone"] : 0,
			};
		});
	};

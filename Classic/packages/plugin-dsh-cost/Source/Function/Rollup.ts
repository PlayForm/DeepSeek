// Rollup - the materialized aggregate refresh (Documentation/Plans/
// COST-TRACK-PLUGIN.md section 3): the Rollup table rebuilt for one UTC day
// (or every day that has priced calls) over the ledger's scopes - file,
// project, client, model and session - from Allocation joined Call, File,
// Project, Session and Client. The rebuild is a pure upsert over a GROUP BY,
// so a recompute lands byte-identical totals. Returns the row count written.
import type { DatabaseSync } from "node:sqlite";

export default (Database: DatabaseSync) =>
	(Day?: string): number => {
		const Days =
			typeof Day === "string" && Day.length > 0
				? [Day]
				: (
						Database.prepare(
							"SELECT DISTINCT strftime('%Y-%m-%d', Call.At / 1000, 'unixepoch') AS Day FROM Call",
						).all() as { Day: unknown }[]
					)
						.map((Row) => Row.Day)
						.filter(
							(One): One is string => typeof One === "string" && One.length === 10,
						);
		const Changed = Database.prepare("SELECT changes() AS Changed");
		const Now = Date.now();
		let Written = 0;

		// The five scopes, one upsert each: the unattributed rows (FileId null)
		// are outside the file scope but inside every call-hung scope, so an
		// invoice can show the overhead line without inventing a file.
		const Scopes: { Scope: string; Statement: string }[] = [
			{
				Scope: "file",
				Statement:
					"INSERT INTO Rollup (Scope, Key, Day, DirectCost, AmortizedCost, Cost, Calls, Tokens, UpdatedAt) " +
					"SELECT 'file', File.Path, ?, SUM(Allocation.DirectCost), SUM(Allocation.AmortizedCost), " +
					"SUM(Allocation.DirectCost + Allocation.AmortizedCost), COUNT(DISTINCT Allocation.CallId), " +
					"COALESCE(SUM(Call.TotalTokens), 0), ? " +
					"FROM Allocation " +
					"JOIN Call ON Call.CallId = Allocation.CallId " +
					"JOIN File ON File.FileId = Allocation.FileId " +
					"WHERE Call.At >= ? AND Call.At < ? " +
					"GROUP BY File.Path " +
					"ON CONFLICT(Scope, Key, Day) DO UPDATE SET " +
					"DirectCost = excluded.DirectCost, AmortizedCost = excluded.AmortizedCost, " +
					"Cost = excluded.Cost, Calls = excluded.Calls, Tokens = excluded.Tokens, " +
					"UpdatedAt = excluded.UpdatedAt",
			},
			{
				Scope: "model",
				Statement:
					"INSERT INTO Rollup (Scope, Key, Day, DirectCost, AmortizedCost, Cost, Calls, Tokens, UpdatedAt) " +
					"SELECT 'model', Call.Provider || '/' || Call.Model, ?, SUM(Allocation.DirectCost), " +
					"SUM(Allocation.AmortizedCost), SUM(Allocation.DirectCost + Allocation.AmortizedCost), " +
					"COUNT(DISTINCT Allocation.CallId), COALESCE(SUM(Call.TotalTokens), 0), ? " +
					"FROM Allocation " +
					"JOIN Call ON Call.CallId = Allocation.CallId " +
					"WHERE Call.At >= ? AND Call.At < ? " +
					"GROUP BY Call.Provider, Call.Model " +
					"ON CONFLICT(Scope, Key, Day) DO UPDATE SET " +
					"DirectCost = excluded.DirectCost, AmortizedCost = excluded.AmortizedCost, " +
					"Cost = excluded.Cost, Calls = excluded.Calls, Tokens = excluded.Tokens, " +
					"UpdatedAt = excluded.UpdatedAt",
			},
			{
				Scope: "session",
				Statement:
					"INSERT INTO Rollup (Scope, Key, Day, DirectCost, AmortizedCost, Cost, Calls, Tokens, UpdatedAt) " +
					"SELECT 'session', Call.SessionId, ?, SUM(Allocation.DirectCost), SUM(Allocation.AmortizedCost), " +
					"SUM(Allocation.DirectCost + Allocation.AmortizedCost), COUNT(DISTINCT Allocation.CallId), " +
					"COALESCE(SUM(Call.TotalTokens), 0), ? " +
					"FROM Allocation " +
					"JOIN Call ON Call.CallId = Allocation.CallId " +
					"WHERE Call.At >= ? AND Call.At < ? " +
					"GROUP BY Call.SessionId " +
					"ON CONFLICT(Scope, Key, Day) DO UPDATE SET " +
					"DirectCost = excluded.DirectCost, AmortizedCost = excluded.AmortizedCost, " +
					"Cost = excluded.Cost, Calls = excluded.Calls, Tokens = excluded.Tokens, " +
					"UpdatedAt = excluded.UpdatedAt",
			},
			{
				Scope: "project",
				Statement:
					"INSERT INTO Rollup (Scope, Key, Day, DirectCost, AmortizedCost, Cost, Calls, Tokens, UpdatedAt) " +
					"SELECT 'project', Project.Root, ?, SUM(Allocation.DirectCost), SUM(Allocation.AmortizedCost), " +
					"SUM(Allocation.DirectCost + Allocation.AmortizedCost), COUNT(DISTINCT Allocation.CallId), " +
					"COALESCE(SUM(Call.TotalTokens), 0), ? " +
					"FROM Allocation " +
					"JOIN Call ON Call.CallId = Allocation.CallId " +
					"JOIN Session ON Session.SessionId = Call.SessionId " +
					"JOIN Project ON Project.ProjectId = Session.ProjectId " +
					"WHERE Call.At >= ? AND Call.At < ? " +
					"GROUP BY Project.Root " +
					"ON CONFLICT(Scope, Key, Day) DO UPDATE SET " +
					"DirectCost = excluded.DirectCost, AmortizedCost = excluded.AmortizedCost, " +
					"Cost = excluded.Cost, Calls = excluded.Calls, Tokens = excluded.Tokens, " +
					"UpdatedAt = excluded.UpdatedAt",
			},
			{
				Scope: "client",
				Statement:
					"INSERT INTO Rollup (Scope, Key, Day, DirectCost, AmortizedCost, Cost, Calls, Tokens, UpdatedAt) " +
					"SELECT 'client', Client.Name, ?, SUM(Allocation.DirectCost), SUM(Allocation.AmortizedCost), " +
					"SUM(Allocation.DirectCost + Allocation.AmortizedCost), COUNT(DISTINCT Allocation.CallId), " +
					"COALESCE(SUM(Call.TotalTokens), 0), ? " +
					"FROM Allocation " +
					"JOIN Call ON Call.CallId = Allocation.CallId " +
					"JOIN Session ON Session.SessionId = Call.SessionId " +
					"JOIN Project ON Project.ProjectId = Session.ProjectId " +
					"JOIN Client ON Client.ClientId = Project.ClientId " +
					"WHERE Call.At >= ? AND Call.At < ? " +
					"GROUP BY Client.Name " +
					"ON CONFLICT(Scope, Key, Day) DO UPDATE SET " +
					"DirectCost = excluded.DirectCost, AmortizedCost = excluded.AmortizedCost, " +
					"Cost = excluded.Cost, Calls = excluded.Calls, Tokens = excluded.Tokens, " +
					"UpdatedAt = excluded.UpdatedAt",
			},
		];

		for (const One of Days) {
			const Start = Date.parse(`${One}T00:00:00Z`);
			if (!Number.isFinite(Start)) {
				continue;
			}
			const Finish = Start + 86400000;
			for (const Scope of Scopes) {
				const Write = Database.prepare(Scope.Statement);
				Write.run(One, Now, Start, Finish);
				const Row = Changed.get() as { Changed: unknown } | undefined;
				Written += typeof Row?.Changed === "number" ? Row.Changed : 0;
			}
		}
		return Written;
	};

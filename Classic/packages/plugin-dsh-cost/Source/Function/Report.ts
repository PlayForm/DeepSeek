// Report - the read queries (Documentation/Plans/COST-TRACK-PLUGIN.md
// section 3): one SELECT per report scope over the ledger's pre-aggregated
// views - FileCost for the file rows, ClientCost for the client rows,
// ModelCost for the model rows, and SessionCost joined through the Session
// and Project dimensions for the project rows - each returning plain rows
// whose cost columns are rounded to six decimals, so a report, an export and
// a re-derivation land the same numbers at the same precision. The FileCost
// view carries no token column, so file rows report Tokens zero.
import type { DatabaseSync } from "node:sqlite";

type Row = {
	Scope: "file" | "project" | "client" | "model" | "session";
	Key: string;
	Direct: number;
	Amortized: number;
	Total: number;
	Calls: number;
	Tokens: number;
};

// One money column: a non-finite or absent sum is zero, never guessed, and
// the rounding is to the sixth decimal.
const Round = (Value: unknown): number => {
	const One = typeof Value === "number" && Number.isFinite(Value) ? Value : 0;
	return Math.round(One * 1e6) / 1e6;
};

const Row = (Scope: Row["Scope"], Raw: Record<string, unknown>): Row => ({
	Scope,
	Key: typeof Raw["Key"] === "string" ? Raw["Key"] : "",
	Direct: Round(Raw["Direct"]),
	Amortized: Round(Raw["Amortized"]),
	Total: Round(Raw["Total"]),
	Calls: typeof Raw["Calls"] === "number" ? Raw["Calls"] : 0,
	Tokens: typeof Raw["Tokens"] === "number" ? Raw["Tokens"] : 0,
});

const Mapped = (
	Database: DatabaseSync,
	Scope: Row["Scope"],
	Sql: string,
	Argument?: string,
): readonly Row[] => {
	const Statement = Database.prepare(Sql);
	// The filter placeholder is written twice (the IS NULL probe and the
	// match), so the argument is bound to both; an absent argument binds null.
	const Found = (
		Argument === undefined ? Statement.all(null, null) : Statement.all(Argument, Argument)
	) as Record<string, unknown>[];
	return Found.map((One) => Row(Scope, One));
};

export default (Database: DatabaseSync) => ({
	File: (Path?: string): readonly Row[] => {
		const Argument = Path === undefined || Path.length === 0 ? undefined : Path;
		return Mapped(
			Database,
			"file",
			"SELECT 'file' AS Scope, Path AS Key, Direct, Amortized, Total, Calls, 0 AS Tokens FROM FileCost " +
				"WHERE (? IS NULL OR Path = ?) ORDER BY Total DESC",
			Argument,
		);
	},
	Project: (Root?: string): readonly Row[] => {
		const Argument = Root === undefined || Root.length === 0 ? undefined : Root;
		return Mapped(
			Database,
			"project",
			"SELECT 'project' AS Scope, Project.Root AS Key, SUM(SessionCost.Direct) AS Direct, " +
				"SUM(SessionCost.Amortized) AS Amortized, SUM(SessionCost.Total) AS Total, " +
				"SUM(SessionCost.Calls) AS Calls, SUM(SessionCost.Tokens) AS Tokens " +
				"FROM SessionCost JOIN Session ON Session.SessionId = SessionCost.SessionId " +
				"JOIN Project ON Project.ProjectId = Session.ProjectId " +
				"WHERE (? IS NULL OR Project.Root = ?) GROUP BY Project.Root ORDER BY Total DESC",
			Argument,
		);
	},
	Client: (Name?: string): readonly Row[] => {
		const Argument = Name === undefined || Name.length === 0 ? undefined : Name;
		return Mapped(
			Database,
			"client",
			"SELECT 'client' AS Scope, Name AS Key, Direct, Amortized, Total, Calls, Tokens FROM ClientCost " +
				"WHERE (? IS NULL OR Name = ?) ORDER BY Total DESC",
			Argument,
		);
	},
	Model: (): readonly Row[] =>
		(
			Database.prepare(
				"SELECT 'model' AS Scope, Provider || '/' || Model AS Key, Direct, Amortized, Total, Calls, Tokens " +
					"FROM ModelCost ORDER BY Total DESC",
			).all() as Record<string, unknown>[]
		).map((One) => Row("model", One)),
	Session: (Id?: string): readonly Row[] => {
		const Argument = Id === undefined || Id.length === 0 ? undefined : Id;
		return Mapped(
			Database,
			"session",
			"SELECT 'session' AS Scope, SessionId AS Key, Direct, Amortized, Total, Calls, Tokens FROM SessionCost " +
				"WHERE (? IS NULL OR SessionId = ?) ORDER BY Total DESC",
			Argument,
		);
	},
});

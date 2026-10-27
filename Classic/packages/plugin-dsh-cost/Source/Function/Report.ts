// Report - the read queries (Documentation/Plans/COST-TRACK-PLUGIN.md
// sections 3 and 16): one SELECT per report scope over the ledger's
// pre-aggregated views - FileCost for the file rows, ClientCost for the
// client rows, SessionCost joined through the Session and Project dimensions
// for the project rows, and the model rows grouped from Allocation and Call
// per provider, model, mode and region (section 17.1, the pricing
// dimensions on the Call row) - plus the v2 analytics reads: Lifetime over
// the FileLifetime view (the cost of one file across every session that
// ever touched it, section 10) and Stages grouped from Touch (the semantic
// pipeline's stage spend, section 16.1). The factor read (section 17.1)
// groups CallFactor joined to Factor: one row per (Key, Value) with the
// call count and the summed call cost, so a classification factor is a
// slice, not a schema change. The v4 edit-grain read (section 17.3) groups
// Edit through Touch to File: one row per file with the lines added and
// removed, the hunk count and the summed cost. Each returns plain rows whose
// cost columns
// are rounded to six decimals, so a report, an export and a re-derivation
// land the same numbers at the same precision. The FileCost view carries no
// token column, so file rows report Tokens zero.
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

type LifetimeRow = {
	Path: string;
	Sessions: number;
	Direct: number;
	Amortized: number;
	Cost: number;
};

type StageRow = {
	Stage: string;
	Touches: number;
	Tokens: number;
	Cost: number;
};

type FactorRow = {
	Key: string;
	Value: string;
	Calls: number;
	Cost: number;
};

type EditRow = {
	Path: string;
	LinesAdded: number;
	LinesRemoved: number;
	Hunks: number;
	Cost: number;
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
	// The model read (section 17.1): one row per provider, model, mode and
	// region the calls ran in, with the mode and the region (a NULL region
	// reads "any") folded into the key, so a batch call no longer shares a
	// row with a standard one.
	Model: (): readonly Row[] =>
		(
			Database.prepare(
				"SELECT 'model' AS Scope, Call.Provider || '/' || Call.Model || '/' || Call.Mode || '/' || COALESCE(Call.Region, 'any') AS Key, " +
					"SUM(Allocation.DirectCost) AS Direct, SUM(Allocation.AmortizedCost) AS Amortized, " +
					"SUM(Allocation.DirectCost + Allocation.AmortizedCost) AS Total, " +
					"COUNT(DISTINCT Allocation.CallId) AS Calls, SUM(Call.TotalTokens) AS Tokens " +
					"FROM Allocation JOIN Call ON Call.CallId = Allocation.CallId " +
					"GROUP BY Call.Provider, Call.Model, Call.Mode, Call.Region ORDER BY Total DESC",
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
	// The lifetime read (section 10): one file's cost across every session
	// that ever touched it, straight from the FileLifetime view.
	Lifetime: (Path?: string): readonly LifetimeRow[] => {
		const Argument = Path === undefined || Path.length === 0 ? undefined : Path;
		const Statement = Database.prepare(
			"SELECT Path AS Path, Sessions AS Sessions, Direct AS Direct, Amortized AS Amortized, Cost AS Cost " +
				"FROM FileLifetime WHERE (? IS NULL OR Path = ?) ORDER BY Cost DESC",
		);
		const Found = (
			Argument === undefined ? Statement.all(null, null) : Statement.all(Argument, Argument)
		) as Record<string, unknown>[];
		return Found.map((One) => ({
			Path: typeof One["Path"] === "string" ? One["Path"] : "",
			Sessions: typeof One["Sessions"] === "number" ? One["Sessions"] : 0,
			Direct: Round(One["Direct"]),
			Amortized: Round(One["Amortized"]),
			Cost: Round(One["Cost"]),
		}));
	},
	// The stage read (section 16.1): Touch grouped by Stage for one file, or
	// every file, with the token and cost totals joined through the calls
	// that carried the touches; an unclassified stage is its own row, never
	// silently dropped.
	Stages: (Path?: string): readonly StageRow[] => {
		const Argument = Path === undefined || Path.length === 0 ? undefined : Path;
		const Statement = Database.prepare(
			"SELECT COALESCE(Touch.Stage, 'unclassified') AS Stage, COUNT(*) AS Touches, " +
				"SUM(Call.TotalTokens) AS Tokens, " +
				"SUM(Allocation.DirectCost + Allocation.AmortizedCost) AS Cost " +
				"FROM Touch " +
				"JOIN Call ON Call.CallId = Touch.CallId " +
				"JOIN File ON File.FileId = Touch.FileId " +
				"LEFT JOIN Allocation ON Allocation.CallId = Touch.CallId AND Allocation.FileId = Touch.FileId " +
				"WHERE (? IS NULL OR File.Path = ?) GROUP BY Stage ORDER BY Cost DESC",
		);
		const Found = (
			Argument === undefined ? Statement.all(null, null) : Statement.all(Argument, Argument)
		) as Record<string, unknown>[];
		return Found.map((One) => ({
			Stage: typeof One["Stage"] === "string" ? One["Stage"] : "unclassified",
			Touches: typeof One["Touches"] === "number" ? One["Touches"] : 0,
			Tokens: typeof One["Tokens"] === "number" ? One["Tokens"] : 0,
			Cost: Round(One["Cost"]),
		}));
	},
	// The factor read (section 17.1): CallFactor joined to Factor, one row
	// per (Key, Value) with the call count and the summed call cost - the
	// classification slice the reports ask for once a classifier writes
	// rows. A factor nothing links to produces no row, never a zero row.
	Factors: (): readonly FactorRow[] => {
		const Found = Database.prepare(
			"SELECT Key, Value, COUNT(*) AS Calls, SUM(Cost) AS Cost FROM (" +
				"SELECT DISTINCT Factor.Key AS Key, Factor.Value AS Value, " +
				"CallFactor.CallId AS CallId, Call.CostTotal AS Cost " +
				"FROM CallFactor " +
				"JOIN Factor ON Factor.FactorId = CallFactor.FactorId " +
				"JOIN Call ON Call.CallId = CallFactor.CallId" +
				") GROUP BY Key, Value ORDER BY Cost DESC",
		).all() as Record<string, unknown>[];
		return Found.map((One) => ({
			Key: typeof One["Key"] === "string" ? One["Key"] : "",
			Value: typeof One["Value"] === "string" ? One["Value"] : "",
			Calls: typeof One["Calls"] === "number" ? One["Calls"] : 0,
			Cost: Round(One["Cost"]),
		}));
	},
	// The edit-grain read (section 17.3): Edit grouped through Touch to File,
	// one row per file with the summed lines added and removed, the hunk
	// count, and the touched calls' allocated cost - the cost read once per
	// touch, so a multi-hunk touch never multiplies its own allocation.
	Edits: (Path?: string): readonly EditRow[] => {
		const Argument = Path === undefined || Path.length === 0 ? undefined : Path;
		const Statement = Database.prepare(
			"SELECT Path, SUM(LinesAdded) AS LinesAdded, SUM(LinesRemoved) AS LinesRemoved, " +
				"SUM(Hunks) AS Hunks, SUM(Cost) AS Cost FROM (" +
				"SELECT File.Path AS Path, SUM(Edit.LinesAdded) AS LinesAdded, " +
				"SUM(Edit.LinesRemoved) AS LinesRemoved, COUNT(*) AS Hunks, " +
				"COALESCE((SELECT Allocation.DirectCost + Allocation.AmortizedCost FROM Allocation " +
				"WHERE Allocation.CallId = Touch.CallId AND Allocation.FileId = Touch.FileId LIMIT 1), 0) AS Cost " +
				"FROM Edit " +
				"JOIN Touch ON Touch.TouchId = Edit.TouchId " +
				"JOIN File ON File.FileId = Touch.FileId " +
				"WHERE (? IS NULL OR File.Path = ?) GROUP BY Touch.TouchId" +
				") GROUP BY Path ORDER BY Cost DESC",
		);
		const Found = (
			Argument === undefined ? Statement.all(null, null) : Statement.all(Argument, Argument)
		) as Record<string, unknown>[];
		return Found.map((One) => ({
			Path: typeof One["Path"] === "string" ? One["Path"] : "",
			LinesAdded: typeof One["LinesAdded"] === "number" ? One["LinesAdded"] : 0,
			LinesRemoved: typeof One["LinesRemoved"] === "number" ? One["LinesRemoved"] : 0,
			Hunks: typeof One["Hunks"] === "number" ? One["Hunks"] : 0,
			Cost: Round(One["Cost"]),
		}));
	},
});

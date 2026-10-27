// Export - the client-facing bundle (Documentation/Plans/COST-TRACK-PLUGIN.md
// section 8): csv (RFC 4180 quoting with CRLF records, one header row, one
// row per Day, Project, File and Model), json (the re-derivable bundle - the
// meta block, the projects, the files, the calls, the allocations and the
// rollups, with ISO-8601 UTC timestamps) and markdown (a one-page invoice per
// client: the totals, the per-project table, the top-10 files and the model
// mix). The destination is the given path - a directory, or an exact file
// path when its extension matches the format - and defaults to the configured
// export directory or the project root. The money columns round to six
// decimals, the same precision the reports use.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import type { DatabaseSync } from "node:sqlite";

import type Config from "../Interface/Config.js";

// The bundle version, mirrored from package.json (a release bumps both).
const Version = "0.3.0";

type Row = Record<string, unknown>;

// The money columns, by name: every other column passes through untouched.
const Money = new Set([
	"DirectCost",
	"AmortizedCost",
	"Cost",
	"CostInput",
	"CostOutput",
	"CostCacheRead",
	"CostCacheWrite",
	"CostReasoning",
	"Direct",
	"Amortized",
	"Total",
]);

const Round = (Value: unknown): number => {
	const One = typeof Value === "number" && Number.isFinite(Value) ? Value : 0;
	return Math.round(One * 1e6) / 1e6;
};

const Clean = (Raw: Row): Row => {
	const Next: Row = {};
	for (const [Key, Value] of Object.entries(Raw)) {
		Next[Key] = Money.has(Key) ? Round(Value) : Value;
	}
	return Next;
};

// One RFC 4180 cell: a field that carries a comma, a quote or a line break is
// quoted, and every quote inside it is doubled.
const Cell = (Value: unknown): string => {
	const Text = Value === null || Value === undefined ? "" : String(Value);
	return Text.search(/[",\r\n]/) >= 0 ? `"${Text.replaceAll('"', '""')}"` : Text;
};

const Csv = (Head: readonly string[], Rows: readonly Row[]): string => {
	const Lines = [
		Head.join(","),
		...Rows.map((One) => Head.map((Key) => Cell(One[Key])).join(",")),
	];
	return `${Lines.join("\r\n")}\r\n`;
};

// One markdown table: the head row, the separator row, one row per record.
const Table = (Title: string, Head: readonly string[], Rows: readonly Row[]): string[] => {
	const Lines = [
		`### ${Title}`,
		"",
		`| ${Head.join(" | ")} |`,
		`| ${Head.map(() => "---").join(" | ")} |`,
	];
	for (const One of Rows) {
		Lines.push(`| ${Head.map((Key) => Cell(One[Key]).replaceAll("|", "\\|")).join(" | ")} |`);
	}
	Lines.push("");
	return Lines;
};

const CallRows =
	"FROM Allocation JOIN Call ON Call.CallId = Allocation.CallId " +
	"JOIN Session ON Session.SessionId = Call.SessionId JOIN Project ON Project.ProjectId = Session.ProjectId " +
	"WHERE Project.ClientId = ?";

const Projects = (Database: DatabaseSync, ClientId: number): readonly Row[] =>
	(
		Database.prepare(
			"SELECT Project.Root AS Project, COUNT(DISTINCT Allocation.CallId) AS Calls, " +
				"COALESCE(SUM(Call.TotalTokens), 0) AS Tokens, SUM(Allocation.DirectCost) AS Direct, " +
				"SUM(Allocation.AmortizedCost) AS Amortized, " +
				"SUM(Allocation.DirectCost + Allocation.AmortizedCost) AS Total " +
				`${CallRows} GROUP BY Project.Root ORDER BY Total DESC`,
		).all(ClientId) as Row[]
	).map(Clean);

const Files = (Database: DatabaseSync, ClientId: number): readonly Row[] =>
	(
		Database.prepare(
			"SELECT File.Path AS File, COUNT(DISTINCT Allocation.CallId) AS Calls, " +
				"SUM(Allocation.DirectCost) AS Direct, SUM(Allocation.AmortizedCost) AS Amortized, " +
				"SUM(Allocation.DirectCost + Allocation.AmortizedCost) AS Total " +
				`${CallRows} JOIN File ON File.FileId = Allocation.FileId ` +
				"GROUP BY File.Path ORDER BY Total DESC LIMIT 10",
		).all(ClientId) as Row[]
	).map(Clean);

const Models = (Database: DatabaseSync, ClientId: number): readonly Row[] =>
	(
		Database.prepare(
			"SELECT Call.Provider || '/' || Call.Model AS Model, COUNT(DISTINCT Allocation.CallId) AS Calls, " +
				"COALESCE(SUM(Call.TotalTokens), 0) AS Tokens, " +
				"SUM(Allocation.DirectCost + Allocation.AmortizedCost) AS Total " +
				`${CallRows} GROUP BY Call.Provider, Call.Model ORDER BY Total DESC`,
		).all(ClientId) as Row[]
	).map(Clean);

const Invoice = (
	Database: DatabaseSync,
	Config: Config,
	ClientId: number,
	Name: string,
): string[] => {
	const Lines: string[] = [`# Cost invoice - ${Name}`, ""];
	Lines.push(`Exported ${new Date().toISOString()} - currency ${Config.currency}`, "");
	const Totals = Database.prepare(
		"SELECT COALESCE(Calls, 0) AS Calls, COALESCE(Tokens, 0) AS Tokens, COALESCE(Direct, 0) AS Direct, " +
			"COALESCE(Amortized, 0) AS Amortized, COALESCE(Total, 0) AS Total FROM ClientCost WHERE ClientId = ?",
	).get(ClientId) as Row | undefined;
	Lines.push(
		...Table(
			"Totals",
			["Calls", "Tokens", "Direct", "Amortized", "Total"],
			[Clean(Totals ?? {})],
		),
	);
	Lines.push(
		...Table(
			"Projects",
			["Project", "Calls", "Tokens", "Direct", "Amortized", "Total"],
			Projects(Database, ClientId),
		),
	);
	Lines.push(
		...Table(
			"Files (top 10)",
			["File", "Calls", "Direct", "Amortized", "Total"],
			Files(Database, ClientId),
		),
	);
	Lines.push(
		...Table("Models", ["Model", "Calls", "Tokens", "Total"], Models(Database, ClientId)),
	);
	return Lines;
};

// The bundle: one format, one text, and the row count the result reports.
const Bundle = (
	Database: DatabaseSync,
	Config: Config,
	Format: string,
): { Text: string; Rows: number } => {
	switch (true) {
		case Format === "csv": {
			const Rows = (
				Database.prepare(
					"SELECT strftime('%Y-%m-%d', Call.At / 1000, 'unixepoch') AS Day, Project.Root AS Project, " +
						"File.Path AS File, Call.Provider || '/' || Call.Model AS Model, " +
						"SUM(Allocation.DirectCost) AS Direct, SUM(Allocation.AmortizedCost) AS Amortized, " +
						"SUM(Allocation.DirectCost + Allocation.AmortizedCost) AS Total, " +
						"COUNT(DISTINCT Allocation.CallId) AS Calls, COALESCE(SUM(Call.TotalTokens), 0) AS Tokens " +
						"FROM Allocation JOIN Call ON Call.CallId = Allocation.CallId " +
						"JOIN File ON File.FileId = Allocation.FileId " +
						"JOIN Session ON Session.SessionId = Call.SessionId " +
						"JOIN Project ON Project.ProjectId = Session.ProjectId " +
						"GROUP BY Day, Project, File, Model ORDER BY Day, Project, File, Model",
				).all() as Row[]
			).map(Clean);
			return {
				Text: Csv(
					[
						"Day",
						"Project",
						"File",
						"Model",
						"Direct",
						"Amortized",
						"Total",
						"Calls",
						"Tokens",
					],
					Rows,
				),
				Rows: Rows.length,
			};
		}
		case Format === "json": {
			const Dump = (Sql: string): readonly Row[] =>
				(Database.prepare(Sql).all() as Row[]).map(Clean);
			const Bundle_ = {
				meta: {
					exportedAt: new Date().toISOString(),
					currency: Config.currency,
					version: Version,
				},
				projects: Dump("SELECT * FROM Project ORDER BY ProjectId"),
				files: Dump("SELECT * FROM File ORDER BY FileId"),
				calls: Dump("SELECT * FROM Call ORDER BY CallId"),
				allocations: Dump("SELECT * FROM Allocation ORDER BY AllocationId"),
				rollups: Dump("SELECT * FROM Rollup ORDER BY Scope, Key, Day"),
			};
			return {
				Text: JSON.stringify(Bundle_, null, 2),
				Rows:
					Bundle_.projects.length +
					Bundle_.files.length +
					Bundle_.calls.length +
					Bundle_.allocations.length +
					Bundle_.rollups.length,
			};
		}
		case Format === "markdown": {
			const Clients = Database.prepare(
				"SELECT Client.ClientId AS ClientId, Client.Name AS Name FROM Client " +
					"JOIN ClientCost ON ClientCost.ClientId = Client.ClientId ORDER BY Client.ClientId",
			).all() as { ClientId: number; Name: string }[];
			const Lines = Clients.flatMap((One) =>
				Invoice(Database, Config, One.ClientId, One.Name),
			);
			return { Text: Lines.join("\n"), Rows: Clients.length };
		}
		default:
			throw new Error(
				`plugin-dsh-cost: unknown export format "${Format}" - csv, json, markdown`,
			);
	}
};

// The destination: the given path wins; a path whose extension matches the
// format is the exact file, anything else is a directory; the default is the
// configured export directory, then the project root.
const Target = (Format: string, Destination: string | undefined, Config: Config): string => {
	const Given =
		Destination !== undefined && Destination.length > 0 ? Destination : Config.export.directory;
	const Base = resolve(Given.length > 0 ? Given : process.cwd());
	const Extension = extname(Base).slice(1).toLowerCase();
	const Extension_ = Format === "markdown" ? "md" : Format;
	switch (true) {
		case Extension === Extension_ || (Format === "markdown" && Extension === "markdown"):
			return Base;
		default:
			return join(Base, `cost.${Extension_}`);
	}
};

export default (Database: DatabaseSync, Config: Config) =>
	(Format: string, Destination?: string): { Path: string; Rows: number } => {
		const Built = Bundle(Database, Config, Format);
		const Path = Target(Format, Destination, Config);
		mkdirSync(dirname(Path), { recursive: true });
		writeFileSync(Path, Built.Text, "utf8");
		return { Path, Rows: Built.Rows };
	};

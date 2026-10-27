// Analysis - the five metric families (Documentation/Plans/
// COST-TRACK-PLUGIN.md sections 11, 12 and 16.2-16.4), the REAL queries now:
// every family is one SELECT over the ledger the cost plugin wrote, the
// plugin never writes, and each Reading is one key of the asked scope with
// its metric rows. Every method honours the scope (file, project, client,
// model, session) and the optional key filter, narrows to the configured day
// window, orders the readings by their headline value descending, and
// returns an empty array for a closed database, an unknown scope, an empty
// key filter or a family switched off in Config.metrics.
import type { DatabaseSync } from "node:sqlite";

import type Config from "../Interface/Config.js";
import type Metric from "../Interface/Metric.js";
import type Reading from "../Interface/Reading.js";

// One query row, every cell unknown until a guard reads it.
type Row = Record<string, unknown>;

// The two query bases: the money base (Allocation joined to its Call) and
// the hunk base (Edit joined through its Touch to its Call).
const Money = "FROM Allocation JOIN Call ON Call.CallId = Allocation.CallId";
const Hunks =
	"FROM Edit JOIN Touch ON Touch.TouchId = Edit.TouchId JOIN Call ON Call.CallId = Touch.CallId";

// The scope joins above the Call: the session, project and client
// dimensions hang off the call's session.
const ProjectJoin =
	"JOIN Session ON Session.SessionId = Call.SessionId JOIN Project ON Project.ProjectId = Session.ProjectId";
const ClientJoin = `${ProjectJoin} JOIN Client ON Client.ClientId = Project.ClientId`;

// The scope's anchor: the key expression the readings group by and the join
// chain that makes it available over the asked base. An unknown scope
// anchors nowhere, which is every family's empty result.
const Of = (Scope: string, Base: string): { Key: string; From: string } | undefined => {
	switch (true) {
		case Scope === "file":
			return {
				Key: "File.Path",
				From: `${Base} JOIN File ON File.FileId = ${Base === Money ? "Allocation" : "Touch"}.FileId`,
			};
		case Scope === "session":
			return { Key: "Call.SessionId", From: Base };
		case Scope === "model":
			return { Key: "(Call.Provider || '/' || Call.Model)", From: Base };
		case Scope === "project":
			return { Key: "Project.Root", From: `${Base} ${ProjectJoin}` };
		case Scope === "client":
			return { Key: "Client.Name", From: `${Base} ${ClientJoin}` };
		default:
			return undefined;
	}
};

// The number a row carries, zero when the cell is absent or not finite.
const Num = (One: Row, Field: string): number => {
	const Value = Number(One[Field]);
	return Number.isFinite(Value) ? Value : 0;
};

// The ratio, zero when the denominator is zero - never Infinity, never NaN.
const Ratio = (Numerator: number, Denominator: number): number =>
	Denominator === 0 ? 0 : Numerator / Denominator;

// The SELECT of one family: the key expression and the aggregates over the
// anchor, narrowed by the window and the optional key filter.
const Select = (
	Database: DatabaseSync,
	Anchor: { Key: string; From: string },
	Aggregates: string,
	Where: readonly string[],
	Key: string | undefined,
	Values: readonly (string | number)[],
): readonly Row[] => {
	const Filter = Key === undefined ? [...Where] : [...Where, `${Anchor.Key} = ?`];
	const Params = Key === undefined ? [...Values] : [...Values, Key];
	const Clause = Filter.length === 0 ? "" : ` WHERE ${Filter.join(" AND ")}`;
	return Database.prepare(
		`SELECT ${Anchor.Key} AS Key, ${Aggregates} ${Anchor.From}${Clause} GROUP BY ${Anchor.Key}`,
	).all(...Params) as readonly Row[];
};

// The readings of one family from its raw rows: one reading per row with a
// real string key, the family's metrics built per row, all ordered by the
// headline (first) metric's value descending.
const Gather = (
	Scope: string,
	Found: readonly Row[],
	Build: (One: Row, Group: string) => readonly Metric[],
): readonly Reading[] => {
	const Out: Reading[] = [];
	for (const One of Found) {
		const Key = One["Key"];
		if (typeof Key !== "string" || Key.length === 0) {
			continue;
		}
		Out.push({ Scope, Key, Rows: Build(One, Key) });
	}
	return Out.sort((Left, Right) => (Right.Rows[0]?.Value ?? 0) - (Left.Rows[0]?.Value ?? 0));
};

// The WHERE and the params of the day window: the readings narrow to the
// window counted back from now, and a non-positive window reads everything.
const Window = (Start: number | null): { Clause: readonly string[]; Values: readonly number[] } =>
	Start === null ? { Clause: [], Values: [] } : { Clause: ["Call.At >= ?"], Values: [Start] };

// Credit - Ring C (section 11): per key, the cache saving the surface
// produced, each call weighted by the share of its surface the key's file
// occupied, and that sum over the key's total allocated cost.
const CreditRows = (
	Database: DatabaseSync,
	Scope: string,
	Key: string | undefined,
	Start: number | null,
): readonly Reading[] => {
	const Anchor = Of(Scope, Money);
	if (Anchor === undefined) {
		return [];
	}
	const Span = Window(Start);
	const Found = Select(
		Database,
		Anchor,
		"SUM(Call.CacheSaving * (Allocation.ContextTokens * 1.0 / NULLIF(Allocation.SurfaceTokens, 0))) AS Credit, " +
			"SUM(Allocation.DirectCost + Allocation.AmortizedCost) AS Total",
		Span.Clause,
		Key,
		Span.Values,
	);
	return Gather(Scope, Found, (One, Group) => {
		const Saved = Num(One, "Credit");
		const Total = Num(One, "Total");
		return [
			{
				Metric: "credit",
				Key: Group,
				Value: Saved,
				Unit: "USD",
				Note: "the cache saving the file's presence produced",
			},
			{
				Metric: "credit_ratio",
				Key: Group,
				Value: Ratio(Saved, Total),
				Unit: "ratio",
				Note: "the credit over the total allocated cost of the same key",
			},
		];
	});
};

// Effectiveness - cost per surviving line (section 16.4): per key, the
// allocated cost over the lines its changed edits added, where a key counts
// only when one of its files carries a changed Verdict in the window
// (section 14) - a read-only file yields no row.
const EffectivenessRows = (
	Database: DatabaseSync,
	Scope: string,
	Key: string | undefined,
	Start: number | null,
): readonly Reading[] => {
	const CostAnchor = Of(Scope, Money);
	const LineAnchor = Of(Scope, Hunks);
	if (CostAnchor === undefined || LineAnchor === undefined) {
		return [];
	}
	const Span = Window(Start);
	const Stamp = Start === null ? "" : " AND Verdict.At >= ?";
	const Stamps: readonly number[] = Start === null ? [] : [Start];
	// The verdict gate: the (session, file) pair the money or the hunk hangs
	// on must carry State 'changed' inside the window, so a group's cost and
	// lines both count only its changed files.
	const Changed = (FileId: string): string =>
		`EXISTS (SELECT 1 FROM Verdict WHERE Verdict.SessionId = Call.SessionId AND Verdict.FileId = ${FileId} AND Verdict.State = 'changed'${Stamp})`;
	const Costs = Select(
		Database,
		CostAnchor,
		"SUM(Allocation.DirectCost + Allocation.AmortizedCost) AS Cost",
		[...Span.Clause, Changed("Allocation.FileId")],
		Key,
		[...Span.Values, ...Stamps],
	);
	const Lines = Select(
		Database,
		LineAnchor,
		"SUM(Edit.LinesAdded) AS Lines",
		[...Span.Clause, Changed("Touch.FileId")],
		Key,
		[...Span.Values, ...Stamps],
	);
	const Survived = new Map<string, number>();
	for (const One of Lines) {
		const Group = One["Key"];
		if (typeof Group === "string") {
			Survived.set(Group, Num(One, "Lines"));
		}
	}
	return Gather(Scope, Costs, (One, Group) => {
		const Cost = Num(One, "Cost");
		const Count = Survived.get(Group) ?? 0;
		return [
			{
				Metric: "cost_per_line",
				Key: Group,
				Value: Ratio(Cost, Count),
				Unit: "USD/line",
				Note: "the allocated cost over the surviving lines",
			},
			{
				Metric: "surviving_lines",
				Key: Group,
				Value: Count,
				Unit: "lines",
				Note: "the lines the changed edits added",
			},
			{
				Metric: "cost",
				Key: Group,
				Value: Cost,
				Unit: "USD",
				Note: "the allocated cost of the changed files",
			},
		];
	});
};

// Lines - the churn (sections 16.2 and 17.3): per key, the lines its hunks
// added and removed, the hunk count, and the allocated cost over the added
// lines.
const LinesRows = (
	Database: DatabaseSync,
	Scope: string,
	Key: string | undefined,
	Start: number | null,
): readonly Reading[] => {
	const HunkAnchor = Of(Scope, Hunks);
	const MoneyAnchor = Of(Scope, Money);
	if (HunkAnchor === undefined || MoneyAnchor === undefined) {
		return [];
	}
	const Span = Window(Start);
	const Counts = Select(
		Database,
		HunkAnchor,
		"SUM(Edit.LinesAdded) AS Added, SUM(Edit.LinesRemoved) AS Removed, COUNT(Edit.EditId) AS Hunks",
		Span.Clause,
		Key,
		Span.Values,
	);
	const Costs = Select(
		Database,
		MoneyAnchor,
		"SUM(Allocation.DirectCost + Allocation.AmortizedCost) AS Cost",
		Span.Clause,
		Key,
		Span.Values,
	);
	const Priced = new Map<string, number>();
	for (const One of Costs) {
		const Group = One["Key"];
		if (typeof Group === "string") {
			Priced.set(Group, Num(One, "Cost"));
		}
	}
	return Gather(Scope, Counts, (One, Group) => {
		const Added = Num(One, "Added");
		const Removed = Num(One, "Removed");
		const Cost = Priced.get(Group) ?? 0;
		return [
			{
				Metric: "lines_added",
				Key: Group,
				Value: Added,
				Unit: "lines",
				Note: "the lines the hunks added",
			},
			{
				Metric: "lines_removed",
				Key: Group,
				Value: Removed,
				Unit: "lines",
				Note: "the lines the hunks removed",
			},
			{
				Metric: "hunks",
				Key: Group,
				Value: Num(One, "Hunks"),
				Unit: "hunks",
				Note: "the edit hunks",
			},
			{
				Metric: "cost_per_added_line",
				Key: Group,
				Value: Ratio(Cost, Added),
				Unit: "USD/line",
				Note: "the allocated cost over the added lines",
			},
		];
	});
};

// Overhead - the exploration share (section 12): per key, the money whose
// allocation names no file (the CASE keeps the query portable where a FILTER
// clause is not), over the key's total allocated cost.
const OverheadRows = (
	Database: DatabaseSync,
	Scope: string,
	Key: string | undefined,
	Start: number | null,
): readonly Reading[] => {
	const Anchor = Of(Scope, Money);
	if (Anchor === undefined) {
		return [];
	}
	const Span = Window(Start);
	const Found = Select(
		Database,
		Anchor,
		"SUM(CASE WHEN Allocation.FileId IS NULL THEN Allocation.DirectCost + Allocation.AmortizedCost ELSE 0 END) AS Overhead, " +
			"SUM(Allocation.DirectCost + Allocation.AmortizedCost) AS Total",
		Span.Clause,
		Key,
		Span.Values,
	);
	return Gather(Scope, Found, (One, Group) => {
		const Unpaid = Num(One, "Overhead");
		const Total = Num(One, "Total");
		return [
			{
				Metric: "overhead",
				Key: Group,
				Value: Unpaid,
				Unit: "USD",
				Note: "the money no file paid for (FileId IS NULL)",
			},
			{
				Metric: "overhead_ratio",
				Key: Group,
				Value: Ratio(Unpaid, Total),
				Unit: "ratio",
				Note: "the unattributed share of the total allocated cost",
			},
		];
	});
};

// Cache - the cache efficiency (section 16.4): per key, the share of its
// surface-weighted input tokens the prompt cache served - the cached tokens
// over the cached plus uncached input, each call weighted by the share of
// its surface the key's file occupied.
const CacheRows = (
	Database: DatabaseSync,
	Scope: string,
	Key: string | undefined,
	Start: number | null,
): readonly Reading[] => {
	const Anchor = Of(Scope, Money);
	if (Anchor === undefined) {
		return [];
	}
	const Span = Window(Start);
	const Found = Select(
		Database,
		Anchor,
		"SUM(Call.CacheReadTokens * (Allocation.ContextTokens * 1.0 / NULLIF(Allocation.SurfaceTokens, 0))) AS Cached, " +
			"SUM((Call.InputTokens + Call.CacheReadTokens) * (Allocation.ContextTokens * 1.0 / NULLIF(Allocation.SurfaceTokens, 0))) AS Input",
		Span.Clause,
		Key,
		Span.Values,
	);
	return Gather(Scope, Found, (One, Group) => {
		const Cached = Num(One, "Cached");
		const Whole = Num(One, "Input");
		return [
			{
				Metric: "cache_ratio",
				Key: Group,
				Value: Ratio(Cached, Whole),
				Unit: "ratio",
				Note: "the cached share of the surface-weighted input tokens",
			},
			{
				Metric: "cached_tokens",
				Key: Group,
				Value: Cached,
				Unit: "tokens",
				Note: "the surface-weighted cache-read tokens",
			},
			{
				Metric: "input_tokens",
				Key: Group,
				Value: Whole,
				Unit: "tokens",
				Note: "the surface-weighted input tokens, cached plus uncached",
			},
		];
	});
};

export default (
	Database: DatabaseSync,
	Config: Config,
): {
	Credit(Scope: string, Key?: string): readonly Reading[];
	Effectiveness(Scope: string, Key?: string): readonly Reading[];
	Lines(Scope: string, Key?: string): readonly Reading[];
	Overhead(Scope: string, Key?: string): readonly Reading[];
	Cache(Scope: string, Key?: string): readonly Reading[];
} => {
	// The day window's lower bound, read once at mount: the readings narrow
	// to the configured window counted back from now; a non-positive window
	// reads everything.
	const Start =
		Number.isFinite(Config.window) && Config.window > 0
			? Date.now() - Config.window * 86400000
			: null;
	// The shared gates: an open database, a non-empty optional key filter and
	// the family's own config switch. The unknown scope is caught inside each
	// family by the anchor lookup.
	const Rows = (
		Scope: string,
		Key: string | undefined,
		On: boolean,
		Query: () => readonly Reading[],
	): readonly Reading[] => {
		switch (true) {
			case !Database.isOpen:
				return [];
			case Scope.length === 0:
				return [];
			case Key !== undefined && Key.length === 0:
				return [];
			case !On:
				return [];
			default:
				return Query();
		}
	};
	return {
		Credit: (Scope: string, Key?: string): readonly Reading[] =>
			Rows(Scope, Key, Config.metrics.credit, () => CreditRows(Database, Scope, Key, Start)),
		Effectiveness: (Scope: string, Key?: string): readonly Reading[] =>
			Rows(Scope, Key, Config.metrics.effectiveness, () =>
				EffectivenessRows(Database, Scope, Key, Start),
			),
		Lines: (Scope: string, Key?: string): readonly Reading[] =>
			Rows(Scope, Key, Config.metrics.lines, () => LinesRows(Database, Scope, Key, Start)),
		Overhead: (Scope: string, Key?: string): readonly Reading[] =>
			Rows(Scope, Key, Config.metrics.overhead, () =>
				OverheadRows(Database, Scope, Key, Start),
			),
		Cache: (Scope: string, Key?: string): readonly Reading[] =>
			Rows(Scope, Key, Config.metrics.cache, () => CacheRows(Database, Scope, Key, Start)),
	};
};

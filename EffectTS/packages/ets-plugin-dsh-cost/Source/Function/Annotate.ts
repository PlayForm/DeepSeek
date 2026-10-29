// Annotate - the comment writer (Documentation/Plans/COST-TRACK-PLUGIN.md
// section 7): the accumulated cost of one file, read from the ledger, is
// rendered as at most Config.annotate.maxLines content lines between the
// marker delimiters in the file's own comment language, then written through
// the factory's write executor so the fresh-stat version guard applies - an
// existing block is replaced in place (its line count may change), an absent
// block is appended after one blank line at end of file, and a second run
// with the same numbers is a no-op. A file with no recorded cost is skipped
// with a reason, never invented; an unknown extension is skipped, never
// guessed; the gate Config.annotate.enabled (off by default) refuses the
// write before anything is read. Every successful write leaves one Annotation
// row: what was written, into which file, at what price, when.
import { resolve } from "node:path";
import type { DatabaseSync } from "node:sqlite";

import type { Context } from "@deepseek-ai/cordis";

import type Config from "../Interface/Config.js";
import Language from "./Language.js";

type Totals = {
	Direct: number;
	Amortized: number;
	Calls: number;
	First: number | null;
	Last: number | null;
	Currency: string;
};

type ModelRow = { Model: string; Cost: number };

// One weave outcome: the new content is byte-identical (unchanged), the
// existing block is malformed (refused), or the content is ready to write.
type Woven =
	| { Kind: "unchanged" }
	| { Kind: "refused"; Reason: string }
	| { Kind: "ready"; Content: string; Reason: string };

// One comment line in the file's own syntax: the prefix opens the line and,
// for the markup family, the close token ends it.
const Wrapped = (Line: string, End: string, Text: string): string =>
	End.length === 0 ? `${Line} ${Text}` : `${Line} ${Text} ${End}`;

// The block: the marker delimiters plus at most Max content lines - the cost
// line first, then the model mix (at most eight rows on one line), then the
// call count and the first and last priced day.
const Block = (
	Line: string,
	End: string,
	Marker: string,
	Totals: Totals,
	Models: readonly ModelRow[],
	Max: number,
): string[] => {
	const Wrap = (Text: string): string => Wrapped(Line, End, Text);
	const Room = Math.max(0, Math.round(Max));
	const Content: string[] = [];
	Content.push(
		Wrap(
			`Inference cost: ${(Totals.Direct + Totals.Amortized).toFixed(4)} ${Totals.Currency} ` +
				`(direct ${Totals.Direct.toFixed(4)} + amortized ${Totals.Amortized.toFixed(4)})`,
		),
	);
	if (Content.length < Room && Models.length > 0) {
		Content.push(
			Wrap(
				`Models: ${Models.slice(0, 8)
					.map((One) => `${One.Model} ${One.Cost.toFixed(4)}`)
					.join(" | ")}`,
			),
		);
	}
	if (Content.length < Room) {
		Content.push(
			Wrap(
				`Calls: ${Totals.Calls} | First: ${Stamp(Totals.First)} | Last: ${Stamp(Totals.Last)}`,
			),
		);
	}
	return [Wrap(`${Marker}:begin`), ...Content, Wrap(`${Marker}:end`)];
};

// One priced day: the UTC date of the epoch millisecond.
const Stamp = (At: number | null): string =>
	At === null ? "unknown" : new Date(At).toISOString().slice(0, 10);

// The weave: an existing marker block (a line carrying the begin marker with
// a later line carrying the end marker) is replaced in place; an unterminated
// block is refused, never forced; an absent block is appended after one blank
// line at end of file. An identical rebuild is the unchanged outcome - the
// idempotence rule of a second run with the same numbers.
const Weave = (Content: string, Lines: readonly string[], Marker: string): Woven => {
	const Split = Content.split("\n");
	const Begin = Split.findIndex((One) => One.includes(`${Marker}:begin`));
	switch (true) {
		case Begin >= 0: {
			const Finish = Split.findIndex(
				(One, At) => At > Begin && One.includes(`${Marker}:end`),
			);
			if (Finish < 0) {
				return { Kind: "refused", Reason: "unterminated cost block" };
			}
			const Rebuilt = [...Split.slice(0, Begin), ...Lines, ...Split.slice(Finish + 1)];
			const Joined = Rebuilt.join("\n");
			return Joined === Content
				? { Kind: "unchanged" }
				: { Kind: "ready", Content: Joined, Reason: "replaced" };
		}
		default: {
			const Joined =
				Content.length === 0
					? `${Lines.join("\n")}\n`
					: `${Content.endsWith("\n") ? Content : `${Content}\n`}\n${Lines.join("\n")}\n`;
			return { Kind: "ready", Content: Joined, Reason: "appended" };
		}
	}
};

export default (Context: Context, Database: DatabaseSync, Config: Config) => {
	const Factory = Context.pluginFactory;
	const State = Factory.State(Context, Config, { module: "plugin-dsh-cost", fields: {} });
	const SelectTotals = Database.prepare(
		"SELECT COALESCE(SUM(Allocation.DirectCost), 0) AS Direct, " +
			"COALESCE(SUM(Allocation.AmortizedCost), 0) AS Amortized, " +
			"COUNT(DISTINCT Allocation.CallId) AS Calls, MIN(Call.At) AS First, MAX(Call.At) AS Last, " +
			"MIN(Call.Currency) AS Currency " +
			"FROM Allocation JOIN Call ON Call.CallId = Allocation.CallId WHERE Allocation.FileId = ?",
	);
	const SelectModels = Database.prepare(
		"SELECT Call.Model AS Model, SUM(Allocation.DirectCost + Allocation.AmortizedCost) AS Cost " +
			"FROM Allocation JOIN Call ON Call.CallId = Allocation.CallId WHERE Allocation.FileId = ? " +
			"GROUP BY Call.Model ORDER BY Cost DESC",
	);
	const SelectProjects = Database.prepare("SELECT ProjectId, Root FROM Project");
	const SelectFile = Database.prepare("SELECT FileId FROM File WHERE ProjectId = ? AND Path = ?");
	const InsertAnnotation = Database.prepare(
		"INSERT INTO Annotation (FileId, VersionId, Marker, Body, Cost, At) VALUES (?, NULL, ?, ?, ?, ?)",
	);

	return async (Path: string): Promise<{ Written: boolean; Reason: string }> => {
		if (!Config.annotate.enabled) {
			return { Written: false, Reason: "annotate is disabled (config annotate.enabled)" };
		}
		const Syntax = Language(Path);
		if (Syntax === undefined) {
			return { Written: false, Reason: `unknown extension - no comment syntax for ${Path}` };
		}
		const Absolute = resolve(Path);
		// The file's ledger identity: the project whose root is the longest
		// prefix of the path (the plan's project rule - a path belongs to the
		// workspace that contains it), then the (ProjectId, Path) file row.
		let ProjectId: number | undefined;
		let Reach = 0;
		for (const One of SelectProjects.all() as { ProjectId: unknown; Root: unknown }[]) {
			if (typeof One.ProjectId !== "number" || typeof One.Root !== "string") {
				continue;
			}
			if (Absolute.startsWith(One.Root) && One.Root.length > Reach) {
				Reach = One.Root.length;
				ProjectId = One.ProjectId;
			}
		}
		if (ProjectId === undefined) {
			return { Written: false, Reason: `no recorded cost for ${Absolute}` };
		}
		const Found = SelectFile.get(ProjectId, Absolute) as { FileId: unknown } | undefined;
		if (Found === undefined || typeof Found.FileId !== "number") {
			return { Written: false, Reason: `no recorded cost for ${Absolute}` };
		}
		const Raw = SelectTotals.get(Found.FileId) as Record<string, unknown> | undefined;
		const Calls = typeof Raw?.["Calls"] === "number" ? Raw["Calls"] : 0;
		if (Raw === undefined || Calls === 0) {
			return { Written: false, Reason: `no recorded cost for ${Absolute}` };
		}
		const Totals: Totals = {
			Direct: Number(Raw["Direct"]),
			Amortized: Number(Raw["Amortized"]),
			Calls,
			First: typeof Raw["First"] === "number" ? Raw["First"] : null,
			Last: typeof Raw["Last"] === "number" ? Raw["Last"] : null,
			Currency:
				typeof Raw["Currency"] === "string" && Raw["Currency"].length > 0
					? Raw["Currency"]
					: Config.currency,
		};
		const Models = (SelectModels.all(Found.FileId) as Record<string, unknown>[]).map((One) => ({
			Model: String(One["Model"] ?? ""),
			Cost: Number(One["Cost"] ?? 0),
		}));
		const Lines = Block(
			Syntax.Line,
			Syntax.End,
			Config.annotate.marker,
			Totals,
			Models,
			Config.annotate.maxLines,
		);

		// The write, under the fresh-stat version guard: resolve, stat, read,
		// weave, write replaceIfVersion - a version that moved under the
		// plugin refuses the write and the whole cycle retries (bounded),
		// never forces.
		let Failure: unknown;
		for (let Attempt = 0; Attempt < 3; Attempt += 1) {
			try {
				const Target = await Context.fs.resolve(Absolute);
				const Stat = await Context.fs.stat(Target);
				if (Stat === undefined) {
					return { Written: false, Reason: "the file does not exist" };
				}
				const Content = await Context.fs.readText(Target);
				const Woven = Weave(Content, Lines, Config.annotate.marker);
				switch (true) {
					case Woven.Kind === "unchanged":
						return { Written: false, Reason: "unchanged" };
					case Woven.Kind === "refused":
						return { Written: false, Reason: Woven.Reason };
					default:
				}
				await Factory.Write(State, Target, Woven.Content, {
					intent: { kind: "replaceIfVersion", version: Stat.version },
					policy: "p4",
				});
				InsertAnnotation.run(
					Found.FileId,
					Config.annotate.marker,
					Lines.join("\n"),
					Totals.Direct + Totals.Amortized,
					Date.now(),
				);
				return { Written: true, Reason: Woven.Reason };
			} catch (Issue) {
				Failure = Issue;
			}
		}
		return {
			Written: false,
			Reason: `the file changed during annotate - ${Failure instanceof Error ? Failure.message : String(Failure)}`,
		};
	};
};

// Report - the per-run record: `run.json` for full fidelity and `REPORT.md` for
// the person who reads it, one timestamped directory per run.
//
// WHY A FILE AND NOT JUST THE LEDGER LINE: the ledger is a line-per-event contract
// every plugin in the family shares, so it stays terse and byte-stable. A review
// needs more - the digest shape, the route that answered, every refusal WITH its
// rule id and its clause - and that detail is what turns "the review did nothing"
// into "the judge refused `negative-claim` four times, fix the prompt"
// (SKILL-LEARN-PLUGIN.md:150, :498-519).
//
// A REPORT WRITE IS BEST-EFFORT: a failure returns "" and the run's result is
// unchanged. The run already happened; losing its paperwork must not turn a
// successful pass into an error.
//
// THE DIRECTORY NAME IS SORTABLE AND DISAMBIGUATED: `YYYYMMDD-HHMMSS` in UTC, and
// `-2`, `-3` on a same-second collision, which is the Hermes report directory rule
// (agent/curator.py:705-709).
import FileSystem from "node:fs/promises";
import Path from "node:path";

import type { ConsolidationResult } from "@Interface/Consolidation.js";
import type { Curation } from "@Interface/Curation.js";
import type { Outcome } from "@Interface/Trigger.js";

/** One run's record, which is also the shape `run.json` is written in. */
export interface RunReport {
	/** ISO-8601 UTC, the moment the run started. */
	readonly startedAt: string;
	/** Wall time of the run in milliseconds. */
	readonly durationMs: number;
	/** The class the run ended in. */
	readonly outcome: Outcome;
	/** The provider that answered, or "" when no call was made. */
	readonly provider: string;
	/** The model that answered, or "" when no call was made. */
	readonly model: string;
	/** What the digest kept and what it collapsed. */
	readonly digest: { readonly kept: number; readonly collapsed: number };
	/** How many skill bodies the confirm prompt carried. */
	readonly views: number;
	/** How many operations the reply named. */
	readonly operations: number;
	/** The skills whose bytes changed. */
	readonly applied: readonly string[];
	/** Every refused operation, with the rule and the clause that refused it. */
	readonly refused: readonly {
		readonly skill: string;
		readonly rule: string;
		readonly detail: string;
	}[];
	/** The session's spent write count at the end of the run. */
	readonly writes: number;
	/** The curator pass that rode the same idle edge, when one ran. */
	readonly curation?: Curation;
	/** The consolidation pass, when one ran. */
	readonly consolidation?: ConsolidationResult;
	/** The ledger row ids the run appended. */
	readonly ledger: readonly string[];
	/** The snapshot taken before the run, when one was taken. */
	readonly snapshot: string;
	/** One clause of detail: a failure's cause, a skip reason, a drift. */
	readonly detail?: string;
}

/** The directory name: `YYYYMMDD-HHMMSS` in UTC, sortable and separator-free. */
const Stamp = (At: string): string =>
	At.replace(/[-:]/g, "")
		.replace(/\.\d{3}Z$/, "")
		.replace("T", "-");

/** The human summary, in the family's section order. */
const Markdown = (Report_: RunReport): string =>
	[
		`# Skill learn - ${Report_.startedAt}`,
		"",
		`- Outcome: **${Report_.outcome}**`,
		`- Route: ${Report_.provider === "" ? "(not resolved)" : `${Report_.provider}/${Report_.model}`}`,
		`- Duration: ${Report_.durationMs}ms`,
		`- Digest: ${Report_.digest.kept} kept, ${Report_.digest.collapsed} collapsed`,
		`- Views: ${Report_.views}, operations: ${Report_.operations}`,
		`- Session writes: ${Report_.writes}`,
		`- Snapshot: ${Report_.snapshot === "" ? "(none)" : Report_.snapshot}`,
		...(Report_.detail === undefined ? [] : [`- Detail: ${Report_.detail}`]),
		"",
		"## Applied",
		"",
		...(Report_.applied.length === 0
			? ["(none)"]
			: Report_.applied.map((Name) => `- \`${Name}\``)),
		"",
		"## Refused",
		"",
		...(Report_.refused.length === 0
			? ["(none)"]
			: Report_.refused.map(
					(Entry) => `- \`${Entry.skill}\` - ${Entry.rule}: ${Entry.detail}`,
				)),
		"",
		...(Report_.curation === undefined
			? []
			: [
					"## Curation",
					"",
					`- Checked: ${Report_.curation.checked}${Report_.curation.dryRun ? " (dry run)" : ""}`,
					`- Seeded: ${Report_.curation.seeded}`,
					`- Stale: ${Report_.curation.markedStale}`,
					`- Archived: ${Report_.curation.archived}`,
					`- Reactivated: ${Report_.curation.reactivated}`,
					"",
				]),
		...(Report_.consolidation === undefined
			? []
			: [
					"## Consolidation",
					"",
					`- Outcome: ${Report_.consolidation.outcome}`,
					`- Proposed: ${Report_.consolidation.proposed}, applied: ${Report_.consolidation.applied}, refused: ${Report_.consolidation.refused}`,
					"",
				]),
		"## Ledger",
		"",
		...(Report_.ledger.length === 0 ? ["(none)"] : Report_.ledger.map((Id) => `- \`${Id}\``)),
		"",
	].join("\n");

export default async (Root: string, Report_: RunReport): Promise<string> => {
	const Base = Path.join(Root, Stamp(Report_.startedAt));
	try {
		let Directory = Base;
		let Attempt = 1;
		while (Attempt < 100) {
			try {
				await FileSystem.access(Directory);
			} catch {
				break;
			}
			Attempt += 1;
			Directory = `${Base}-${String(Attempt)}`;
		}
		await FileSystem.mkdir(Directory, { recursive: true });
		await FileSystem.writeFile(
			Path.join(Directory, "run.json"),
			`${JSON.stringify(Report_, null, "\t")}\n`,
			"utf8",
		);
		await FileSystem.writeFile(Path.join(Directory, "REPORT.md"), Markdown(Report_), "utf8");
		return Directory;
	} catch {
		return "";
	}
};

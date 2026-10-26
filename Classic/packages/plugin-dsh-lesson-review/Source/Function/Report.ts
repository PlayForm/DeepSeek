// Report - the per-run record: `run.json` (full fidelity) + `REPORT.md` (the
// human summary), one timestamped directory per run.
//
// WHY A FILE AND NOT JUST THE LEDGER: the ledger is a line-per-event contract
// that every plugin in the family shares, so it must stay terse and
// byte-stable. A review needs more than a line - the digest size, the model
// that answered, the note the reviewer wrote, and every rejection WITH its
// rule - and that detail is what turns "the review did nothing" into "the
// review was refused for `negative-claim` eight times, fix the prompt".
//
// A report write is BEST-EFFORT: a failure returns "" and the run's result is
// unchanged. The review already happened; losing its paperwork must not turn a
// successful pass into an error.
import FileSystem from "node:fs/promises";
import Path from "node:path";

/** One run's record. */
export interface RunReport {
	/** ISO UTC timestamp of the run. */
	at: string;
	/** The session the review belongs to ("" when unknown). */
	session: string;
	/** The outcome class (`applied`/`proposed`/`nothing`/`unavailable`/`failed`). */
	outcome: string;
	/** The provider/model that answered ("" when no call was made). */
	provider: string;
	model: string;
	/** The digest's cost shape. */
	digest: { kept: number; collapsed: number; trimmed: boolean };
	/** The names that landed in the corpus. */
	applied: string[];
	/** The names queued for acceptance. */
	proposed: string[];
	/** The refusals, with their rule ids. */
	rejected: { name: string; rule: string }[];
	/** The reviewer's own note, when it wrote one. */
	note?: string;
	/** One clause of detail (a skip reason, a failure's cause). */
	detail?: string;
	/** Wall time of the review, ms. */
	durationMs: number;
}

/** The directory name: `YYYYMMDD-HHMMSS` in UTC (sortable, no separators). */
const Stamp = (At: string): string =>
	At.replace(/[-:]/g, "").replace(/\..*$/, "").replace("T", "-");

/** The human summary. */
const Markdown = (Report: RunReport): string =>
	[
		`# Lesson review - ${Report.at}`,
		"",
		`- Outcome: **${Report.outcome}**`,
		`- Route: ${Report.provider === "" ? "(not resolved)" : `${Report.provider}/${Report.model}`}`,
		`- Duration: ${Report.durationMs}ms`,
		`- Session: ${Report.session === "" ? "(unknown)" : Report.session}`,
		`- Digest: ${Report.digest.kept} kept, ${Report.digest.collapsed} collapsed${Report.digest.trimmed ? ", trimmed to the input cap" : ""}`,
		...(Report.detail === undefined ? [] : [`- Detail: ${Report.detail}`]),
		"",
		"## Applied",
		"",
		...(Report.applied.length === 0
			? ["(none)"]
			: Report.applied.map((Name) => `- \`${Name}\``)),
		"",
		"## Proposed (awaiting acceptance)",
		"",
		...(Report.proposed.length === 0
			? ["(none)"]
			: Report.proposed.map((Name) => `- \`${Name}\``)),
		"",
		"## Refused",
		"",
		...(Report.rejected.length === 0
			? ["(none)"]
			: Report.rejected.map((Entry) => `- \`${Entry.name}\` - ${Entry.rule}`)),
		"",
		"## Reviewer's note",
		"",
		Report.note === undefined || Report.note.trim() === "" ? "(none)" : Report.note.trim(),
		"",
	].join("\n");

export default async (Root: string, Report: RunReport): Promise<string> => {
	const Directory = Path.join(Root, Stamp(Report.at));
	try {
		await FileSystem.mkdir(Directory, { recursive: true });
		await FileSystem.writeFile(
			Path.join(Directory, "run.json"),
			`${JSON.stringify(Report, null, "\t")}\n`,
			"utf8",
		);
		await FileSystem.writeFile(Path.join(Directory, "REPORT.md"), Markdown(Report), "utf8");
		return Directory;
	} catch {
		return "";
	}
};

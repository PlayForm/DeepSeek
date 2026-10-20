// Band - the byte-exact renderer of the monitor stanza (the FILE-MONITOR
// design section 6 - the C3 implements to these bytes). Pure functions over
// the per-agent monitor state; no I/O, no eval.
//
// THE GLYPHS: U+2204 THERE DOES NOT EXIST (clean) and U+2205 EMPTY SET
// (not-run-yet) are written in source as the escaped forms - the family's
// escape discipline - and rendered as the characters. `!` problem, `~`
// stale, `x` infrastructure.
//
// THE KV-CACHE HONESTY: no relative ages anywhere in the stanza - the check
// time is HH:MM:SS and the staleness is derived per render from the raw
// version tokens, so the text changes only on the events of the design
// section 5.2 set (the retirement closing line is the one documented
// exception - a terminal one-time change).
import type State from "@Interface/State.js";
import type { CheckResult, MonitorEntry } from "@Interface/Events.js";
import { StartedAt as JobsStartedAt } from "@Function/Jobs.js";

/** The clean glyph: U+2204 THERE DOES NOT EXIST (the escaped source form). */
const CLEAN = "\u2204";
/** The not-run-yet glyph: U+2205 EMPTY SET (the escaped source form). */
const EMPTY = "\u2205";

/** The bytes of one string. */
export const Bytes = (Text: string): number => Buffer.byteLength(Text, "utf8");

/** The version display: the raw token verbatim when <= 12 bytes, else the
 * first 12 bytes + "..". The staleness comparison ALWAYS uses the raw
 * tokens - this is display only. */
export const VersionDisplay = (Version: string): string =>
	Version.length <= 12 ? Version : `${Version.slice(0, 12)}..`;

/** The writer display: "-" when absent. */
export const Writer = (Writer: string | undefined): string =>
	typeof Writer === "string" && Writer.length > 0 ? Writer : "-";

/** One result's state (the worst-state order: stale > problem > infra >
 * clean > not-run-yet). */
export type ResultState = "stale" | "problem" | "infra" | "clean" | "not-run";

/** The state rank (higher = worse; not-run is the weakest). */
const RANK: Record<ResultState, number> = {
	stale: 4,
	problem: 3,
	infra: 2,
	clean: 1,
	"not-run": 0,
};

/** The outcome part of a result line (the glyph phrase; the `(recovered)`
 * marker rides the outcome text - design section 6.2). */
const OutcomePart = (Result: CheckResult): string => {
	const Recovered = Result.provenance === "recovered" ? " (recovered)" : "";
	if (Result.infra === "sandbox") {
		return `check denied (sandbox) (x)${Recovered}`;
	}
	if (Result.infra !== null) {
		return `check failed (infrastructure) (x)${Recovered}`;
	}
	if (Result.exit !== null && Result.exit !== 0) {
		return `problem (!)${Recovered}`;
	}
	return `clean (${CLEAN})${Recovered}`;
};

/** The facts part of a result line (the checked/exit details). */
const FactsPart = (Result: CheckResult): string => {
	const Base = `checked ${JobsStartedAt(Result.ranAt)} v${VersionDisplay(Result.checkedVersion)} by ${Writer(Result.writer)}`;
	if (Result.infra === "sandbox") {
		return Base;
	}
	if (Result.infra !== null) {
		return `${Base} | ${Result.infra}`;
	}
	return `${Base} | exit ${Result.exit === null ? "null" : Result.exit}`;
};

/** The state of one result (stale is decided by the caller). */
const StateOf = (Result: CheckResult): ResultState => {
	if (Result.infra !== null) {
		return "infra";
	}
	if (Result.exit !== null && Result.exit !== 0) {
		return "problem";
	}
	return "clean";
};

/** One line of the band frame, with the set it came from (undefined for the
 * linked and not-run lines) and its state. Forms (design section 6.2,
 * byte-exact):
 *
 *   live, fresh:           <outcome> | <facts>
 *   live, version-stale:   ~ STALE (file changed after check) | <outcome> | <facts> | now v<current>
 *   recovered, fresh:      <outcome> | <facts> | not re-checked this session
 *   recovered, time-stale: ~ STALE (not re-checked this session) | <facts>
 *   recovered, version-stale:
 *                          ~ STALE (file changed after check) | <outcome> | <facts> | now v<current>
 */
export const ResultLine = (
	State: State,
	Entry: MonitorEntry,
	Result: CheckResult,
	Now: number,
): { text: string; state: ResultState } => {
	const Outcome = OutcomePart(Result);
	const Facts = FactsPart(Result);
	const Fresh = Result.checkedVersion === (Entry.lastVersion ?? "");
	const Recovered = Result.provenance === "recovered";
	const TimeStale = Recovered && Result.ranAt < Now - State.Monitor.staleMs;
	if (Recovered && TimeStale) {
		return { text: `~ STALE (not re-checked this session) | ${Facts}`, state: "stale" };
	}
	if (!Fresh) {
		return {
			text: `~ STALE (file changed after check) | ${Outcome} | ${Facts} | now v${VersionDisplay(Entry.lastVersion ?? "")}`,
			state: "stale",
		};
	}
	if (Recovered) {
		return {
			text: `${Outcome} | ${Facts} | not re-checked this session`,
			state: StateOf(Result),
		};
	}
	return { text: `${Outcome} | ${Facts}`, state: StateOf(Result) };
};

/** The linked-governance line for a check set that is linked and never runs
 * (design section 6.1 - never a fabricated governance verdict). The observed
 * facts come from the entry's own version truth. */
export const LinkedLine = (Entry: MonitorEntry): string =>
	`${EMPTY} (linked governance; no re-run) | observed v${VersionDisplay(Entry.lastVersion ?? "")} by ${Writer(Entry.lastWriter)} at ${JobsStartedAt(Entry.lastObservedAt ?? Entry.enrolledAt)}`;

/** The not-run-yet line for a check set that has never run (design section
 * 6.1). `WithNoChecks` appends the honest `checks: none` clause. */
export const NotRunLine = (Entry: MonitorEntry, WithNoChecks: boolean): string =>
	`not run yet (${EMPTY}?) | enrolled ${JobsStartedAt(Entry.enrolledAt)} by ${Writer(Entry.lastWriter)}${WithNoChecks ? " | checks: none" : ""}`;

/** One assembled line of the band body. */
type BodyLine = { set: string | undefined; text: string; state: ResultState };

/** The band body lines for one entry: one per check set - a linked set the
 * linked form, a set with a result the result line, a set with no result the
 * not-run-yet form - plus the `checks: none` line for an entry with no sets. */
const Body = (State: State, Entry: MonitorEntry, Now: number): BodyLine[] => {
	const ById = new Map<string, CheckResult>();
	for (const Result of Entry.checks) {
		ById.set(Result.setId, Result);
	}
	const Lines: BodyLine[] = [];
	for (const SetId of Entry.sets) {
		const Result = ById.get(SetId);
		if (Result !== undefined) {
			Lines.push({ set: SetId, ...ResultLine(State, Entry, Result, Now) });
			continue;
		}
		const Spec = State.CheckSets[SetId];
		if (Spec && Spec.link !== undefined) {
			Lines.push({ set: undefined, text: LinkedLine(Entry), state: "not-run" });
			continue;
		}
		Lines.push({ set: undefined, text: NotRunLine(Entry, false), state: "not-run" });
	}
	if (Entry.sets.length === 0) {
		Lines.push({ set: undefined, text: NotRunLine(Entry, true), state: "not-run" });
	}
	return Lines;
};

/** The band frame's parts without the cap decisions. */
const Parts = (
	Entry: MonitorEntry,
	Separator: string,
	BodyLines: string[],
	Tail: string,
): string[] => [
	`${Separator} MONITOR ${Entry.path} ${Separator}`,
	...BodyLines,
	...(Tail.length > 0 ? [Tail] : []),
	`${Separator} END MONITOR ${Entry.path} ${Separator}`,
];

/** One band frame for one entry (design section 6.1). The primary
 * (worst-state) line first; ties keep the set order. The tail block rides
 * only when the primary line carries a problem outcome (a non-zero exit - a
 * stale wrapping a problem keeps the tail). Honesty bound: a clean glyph
 * renders ONLY from an observed settle with exit 0 of the exact check set
 * for the exact version with provenance "live" - a settle-less version bump
 * renders STALE (the false-pass guard).
 *
 * The band cap: the composer truncates the tail first (it is already
 * 2 KiB-capped), then the oldest (lowest-priority) set lines, to fit
 * `State.Monitor.bandCapBytes`; never silently dropped - the caller records
 * the cut. */
export const Frame = (
	State: State,
	Entry: MonitorEntry,
	Separator: string,
	Now: number,
): { frame: string; truncated: boolean } => {
	const Lines = Body(State, Entry, Now);
	// The primary (worst-state) line first; ties keep the set order.
	const Ordered = [...Lines].sort((Left, Right) => RANK[Right.state] - RANK[Left.state]);
	const Primary = Ordered[0];
	const ById = new Map<string, CheckResult>();
	for (const Result of Entry.checks) {
		ById.set(Result.setId, Result);
	}
	// The tail block: only when the primary line carries a problem outcome
	// (a non-zero exit).
	const PrimaryResult =
		Primary !== undefined && Primary.set !== undefined ? ById.get(Primary.set) : undefined;
	const WithProblem =
		Primary !== undefined &&
		(Primary.state === "problem" ||
			(Primary.state === "stale" &&
				PrimaryResult !== undefined &&
				PrimaryResult.exit !== null &&
				PrimaryResult.exit !== 0));
	let Texts = Ordered.map((Line) => Line.text);
	let Tail =
		WithProblem && PrimaryResult !== undefined
			? `tail (up to 2 KiB):\n${PrimaryResult.tail}`
			: "";
	let Truncated = false;
	const Fits = (): boolean =>
		Bytes(Parts(Entry, Separator, Texts, Tail).join("\n")) <= State.Monitor.bandCapBytes;
	while (!Fits() && Tail.length > 0) {
		Tail = "";
		Truncated = true;
	}
	while (!Fits() && Texts.length > 1) {
		Texts = Texts.slice(0, -1);
		Truncated = true;
	}
	return { frame: Parts(Entry, Separator, Texts, Tail).join("\n"), truncated: Truncated };
};

/** The full-frame byte count of an entry (the collapsed line's value). */
const FullFrameBytes = (
	State: State,
	Entry: MonitorEntry,
	Separator: string,
	Now: number,
): number =>
	Bytes(
		Parts(
			Entry,
			Separator,
			Body(State, Entry, Now).map((Line) => Line.text),
			"",
		).join("\n"),
	);

/** The retirement closing line (design section 6.1; rendered once, then the
 * band withdraws). */
export const Closing = (Entry: MonitorEntry, Separator: string, Now: number): string =>
	`${Separator} MONITOR ${Entry.path} (retired; not touched for ${Math.max(0, Math.round((Now - (Entry.lastObservedAt ?? Entry.enrolledAt)) / 1000))}s) ${Separator}`;

/** The overflow collapsed form (design section 6.1; one line per overflowed
 * file - never silently dropped). */
export const Collapsed = (
	State: State,
	Entry: MonitorEntry,
	Separator: string,
	Now: number,
): string =>
	`${Separator} MONITOR ${Entry.path} (collapsed, ${FullFrameBytes(State, Entry, Separator, Now)} bytes) ${Separator}`;

/** The primary state of one entry (the worst across its check sets; an
 * entry with no results is not-run). Used by the summary band and the
 * live_monitor list. */
export const PrimaryState = (State: State, Entry: MonitorEntry, Now: number): ResultState => {
	let Worst: ResultState = "not-run";
	for (const Line of Body(State, Entry, Now)) {
		if (RANK[Line.state] > RANK[Worst]) {
			Worst = Line.state;
		}
	}
	return Worst;
};

/** The primary line's text of one entry (the live_monitor list's one-liner):
 * the primary (worst-state) line's text, or the not-run-yet form when no
 * set ever ran. */
export const PrimaryText = (State: State, Entry: MonitorEntry, Now: number): string => {
	const Lines = Body(State, Entry, Now);
	let Best: BodyLine | undefined;
	for (const Line of Lines) {
		if (Best === undefined || RANK[Line.state] > RANK[Best.state]) {
			Best = Line;
		}
	}
	return Best !== undefined ? Best.text : NotRunLine(Entry, Entry.sets.length === 0);
};

/** The primary glyph character of one entry (the summary band's source):
 * the stale state dominates, then problem, then infra, then clean, then
 * not-run-yet. */
export const PrimaryGlyph = (State: State, Entry: MonitorEntry, Now: number): string => {
	switch (PrimaryState(State, Entry, Now)) {
		case "stale":
			return "~";
		case "problem":
			return "!";
		case "infra":
			return "x";
		case "clean":
			return CLEAN;
		default:
			return EMPTY;
	}
};

/** The summary band (design section 6.1; pinned - the R3 example's counts
 * were internally loose, this form is self-consistent and the smoke asserts
 * the sum). Each enrolled file contributes its primary glyph; `<total>` =
 * clean + problem + stale + not-run + infra; the trailing phrase's four
 * counts mirror the parenthetical's. */
export const Summary = (State: State, Entries: MonitorEntry[], Now: number): string => {
	let Clean = 0;
	let Problem = 0;
	let Stale = 0;
	let NotRun = 0;
	let Infra = 0;
	for (const Entry of Entries) {
		switch (PrimaryGlyph(State, Entry, Now)) {
			case "~":
				Stale += 1;
				break;
			case "!":
				Problem += 1;
				break;
			case "x":
				Infra += 1;
				break;
			case CLEAN:
				Clean += 1;
				break;
			default:
				NotRun += 1;
				break;
		}
	}
	return `monitors: ${Entries.length} (${CLEAN}${Clean} !${Problem} ~${Stale} ${EMPTY}${NotRun} x${Infra}) - ${Problem} problem, ${Stale} stale, ${NotRun} not run, ${Infra} infra`;
};

/** The monitors stanza (design section 6.1; ONE part - header + summary band
 * FIRST + the band frames, the overflow collapsed lines and the retirement
 * closing lines). */
export const Stanza = (Separator: string, SummaryLine: string, Frames: string[]): string =>
	[
		`${Separator} MONITORS (file checks; not harness state) ${Separator}`,
		SummaryLine,
		...Frames,
		`${Separator} END MONITORS ${Separator}`,
	].join("\n");

/** The outcome text for one settled result (the monitors board row and the
 * `[live-report] monitored` fold: the file's outcome text, `clean (∄)` etc.). */
export const OutcomeText = (Result: CheckResult): string => {
	if (Result.infra === "sandbox") {
		return "check denied (sandbox) (x)";
	}
	if (Result.infra !== null) {
		return "check failed (infrastructure) (x)";
	}
	if (Result.exit !== null && Result.exit !== 0) {
		return "problem (!)";
	}
	return `clean (${CLEAN})`;
};

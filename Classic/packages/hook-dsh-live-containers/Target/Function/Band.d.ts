import type { CheckResult, MonitorEntry } from "@Interface/Events.js";
import type State from "@Interface/State.js";
/** The bytes of one string. */
export declare const Bytes: (Text: string) => number;
/** The version display: the raw token verbatim when <= 12 bytes, else the
 * first 12 bytes + "..". The staleness comparison ALWAYS uses the raw
 * tokens - this is display only. */
export declare const VersionDisplay: (Version: string) => string;
/** The writer display: "-" when absent. */
export declare const Writer: (Writer: string | undefined) => string;
/** One result's state (the worst-state order: stale > problem > infra >
 * clean > not-run-yet). */
export type ResultState = "stale" | "problem" | "infra" | "clean" | "not-run";
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
export declare const ResultLine: (State: State, Entry: MonitorEntry, Result: CheckResult, Now: number) => {
    text: string;
    state: ResultState;
};
/** The linked-governance line for a check set that is linked and never runs
 * (design section 6.1 - never a fabricated governance verdict). The observed
 * facts come from the entry's own version truth. */
export declare const LinkedLine: (Entry: MonitorEntry) => string;
/** The not-run-yet line for a check set that has never run (design section
 * 6.1). `WithNoChecks` appends the honest `checks: none` clause. */
export declare const NotRunLine: (Entry: MonitorEntry, WithNoChecks: boolean) => string;
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
export declare const Frame: (State: State, Entry: MonitorEntry, Separator: string, Now: number) => {
    frame: string;
    truncated: boolean;
};
/** The retirement closing line (design section 6.1; rendered once, then the
 * band withdraws). */
export declare const Closing: (Entry: MonitorEntry, Separator: string, Now: number) => string;
/** The overflow collapsed form (design section 6.1; one line per overflowed
 * file - never silently dropped). */
export declare const Collapsed: (State: State, Entry: MonitorEntry, Separator: string, Now: number) => string;
/** The primary state of one entry (the worst across its check sets; an
 * entry with no results is not-run). Used by the summary band and the
 * live_monitor list. */
export declare const PrimaryState: (State: State, Entry: MonitorEntry, Now: number) => ResultState;
/** The primary line's text of one entry (the live_monitor list's one-liner):
 * the primary (worst-state) line's text, or the not-run-yet form when no
 * set ever ran. */
export declare const PrimaryText: (State: State, Entry: MonitorEntry, Now: number) => string;
/** The primary glyph character of one entry (the summary band's source):
 * the stale state dominates, then problem, then infra, then clean, then
 * not-run-yet. */
export declare const PrimaryGlyph: (State: State, Entry: MonitorEntry, Now: number) => string;
/** The summary band (design section 6.1; pinned - the R3 example's counts
 * were internally loose, this form is self-consistent and the smoke asserts
 * the sum). Each enrolled file contributes its primary glyph; `<total>` =
 * clean + problem + stale + not-run + infra; the trailing phrase's four
 * counts mirror the parenthetical's. */
export declare const Summary: (State: State, Entries: MonitorEntry[], Now: number) => string;
/** The monitors stanza (design section 6.1; ONE part - header + summary band
 * FIRST + the band frames, the overflow collapsed lines and the retirement
 * closing lines). */
export declare const Stanza: (Separator: string, SummaryLine: string, Frames: string[]) => string;
/** The outcome text for one settled result (the monitors board row and the
 * `[live-report] monitored` fold: the file's outcome text, `clean (∄)` etc.). */
export declare const OutcomeText: (Result: CheckResult) => string;

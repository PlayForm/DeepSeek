// Watchlist - the classification module (the FILE-MONITOR design section
// 3.2). Config and data, never code: the file -> check-set resolution is the
// watchlist override, else the effective check-set catalog's globs. Pure
// functions over the plugin's own state - no I/O, no eval.
//
// THE ENROLLMENT SPLIT (the R3 3.1 rule):
//   - the AUTOMATIC enrollment (the fs/observed path) is watchlist-gated:
//     only a matching watchlist entry enrolls a file; the default watchlist
//     is empty, so nothing auto-enrolls (no scan, no watch-all);
//   - the EXPLICIT enrollment (live_monitor <path>) falls back to the
//     catalog globs when no watchlist entry matches - the model's escape
//     hatch works out of the box.
//
// No match anywhere: the effective set is [] - the band renders the
// `checks: none` form and nothing ever runs (honest: with no checks, no
// verification is claimed).
import type { WatchlistEntry } from "@Interface/Events.js";
import type State from "@Interface/State.js";

/** Convert one glob to a RegExp (the small self-contained converter; the
 * Policy.ts self-contained precedent): a single star within a segment, a
 * double star across segments (the double-star-slash leading form makes any
 * leading directories optional), a question mark a single char. A malformed
 * glob matches nothing (fail-open). */
export const GlobToRegExp = (Glob: string): RegExp | null => {
	try {
		let Source = "";
		for (let Index = 0; Index < Glob.length; Index += 1) {
			const Char = Glob[Index];
			if (Char === undefined) {
				break;
			}
			switch (true) {
				case Char === "*":
					switch (true) {
						// The double-star-slash form: any leading directories optional.
						case Glob[Index + 1] === "*" && Glob[Index + 2] === "/":
							Source += "(?:.*/)?";
							Index += 2;
							break;
						case Glob[Index + 1] === "*":
							Source += ".*";
							Index += 1;
							break;
						default:
							Source += "[^/]*";
							break;
					}
					break;
				case Char === "?":
					Source += "[^/]";
					break;
				default:
					Source += Char.replace(/[.+^${}()|[\]\\]/g, "\\$&");
					break;
			}
		}
		return new RegExp(`^${Source}$`);
	} catch {
		return null;
	}
};

/** Whether one glob matches one path (malformed globs match nothing - fail-open). */
export const Matches = (Glob: string, Path: string): boolean => {
	const Pattern = GlobToRegExp(Glob);
	return Pattern !== null && Pattern.test(Path);
};

/** The watchlist entry whose glob matches the path - the MOST-SPECIFIC glob
 * wins (the longest pattern); ties -> the later entry. */
export const WatchlistMatch = (State: State, Path: string): WatchlistEntry | undefined => {
	let Best: WatchlistEntry | undefined;
	for (const Entry of State.Watchlist ?? []) {
		if (!Entry || typeof Entry.glob !== "string" || !Matches(Entry.glob, Path)) {
			continue;
		}
		if (Best === undefined || Entry.glob.length >= Best.glob.length) {
			Best = Entry;
		}
	}
	return Best;
};

/** The catalog classification: every effective check set whose glob matches
 * the path (in config order; the catalog's own order is the schema default's).
 * Malformed or absent specs are skipped (runtime fail-open). */
export const CatalogSets = (State: State, Path: string): string[] => {
	const Sets: string[] = [];
	for (const [ID, Spec] of Object.entries(State.CheckSets ?? {})) {
		if (Spec && typeof Spec.glob === "string" && Matches(Spec.glob, Path)) {
			Sets.push(ID);
		}
	}
	return Sets;
};

/** The explicit enrollment classification (live_monitor <path>): the
 * watchlist override, else the catalog globs. */
export const ExplicitSets = (State: State, Path: string): string[] => {
	const Entry = WatchlistMatch(State, Path);
	if (Entry !== undefined) {
		return (Entry.checks ?? []).filter((ID) => typeof ID === "string");
	}
	return CatalogSets(State, Path);
};

/** Whether the path is opted out for one agent (the per-glob opt-outs; the
 * `live_monitor off <glob>` records). */
export const OptedOut = (State: State, AgentID: string, Path: string): boolean =>
	(State.MonitorOptOuts.get(AgentID) ?? []).some(
		(Glob) => typeof Glob === "string" && Matches(Glob, Path),
	);

/** The automatic enrollment classification (the fs/observed path):
 * watchlist-gated and opt-out filtered. Returns undefined when the file
 * must NOT be enrolled (no watchlist match, or opted out); an array (even
 * empty) when it enrolls - an empty array enrolls with `checks: none`. */
export const AutoSets = (State: State, AgentID: string, Path: string): string[] | undefined => {
	if (OptedOut(State, AgentID, Path)) {
		return undefined;
	}
	const Entry = WatchlistMatch(State, Path);
	if (Entry === undefined) {
		return undefined;
	}
	return (Entry.checks ?? []).filter((ID) => typeof ID === "string");
};

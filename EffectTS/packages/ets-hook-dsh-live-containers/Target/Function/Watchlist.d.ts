/**
 * @module Watchlist
 *
 * Resolves a file's check sets from the config watchlist and the check-set catalog.
 *
 * @remarks
 * The classification module (the FILE-MONITOR design section 3.2). Config and data, never
 * code: the file -> check-set resolution is the watchlist override, else the effective
 * check-set catalog's globs. Pure functions over the plugin's own state - no I/O, no
 * eval.
 *
 * THE ENROLLMENT SPLIT (the R3 3.1 rule):
 *
 * - the AUTOMATIC enrollment (the fs/observed path) is watchlist-gated: only a matching
 *   watchlist entry enrolls a file; the default watchlist is empty, so nothing
 *   auto-enrolls (no scan, no watch-all);
 * - the EXPLICIT enrollment (live_monitor <path>) falls back to the catalog globs when no
 *   watchlist entry matches - the model's escape hatch works out of the box.
 *
 * No match anywhere: the effective set is [] - the band renders the `checks: none` form
 * and nothing ever runs (honest: with no checks, no verification is claimed).
 */
import type { WatchlistEntry } from "../Interface/Events.js";
import type State from "../Interface/State.js";
/**
 * Convert one glob to a RegExp (the small self-contained converter; the Policy.ts
 * self-contained precedent): a single star within a segment, a double star across
 * segments (the double-star-slash leading form makes any leading directories optional), a
 * question mark a single char. A malformed glob matches nothing (fail-open).
 */
export declare const GlobToRegExp: (Glob: string) => RegExp | null;
/**
 * Whether one glob matches one path (malformed globs match nothing - fail-open).
 */
export declare const Matches: (Glob: string, Path: string) => boolean;
/**
 * The watchlist entry whose glob matches the path - the MOST-SPECIFIC glob wins (the
 * longest pattern); ties -> the later entry.
 */
export declare const WatchlistMatch: (State: State, Path: string) => WatchlistEntry | undefined;
/**
 * The catalog classification: every effective check set whose glob matches the path (in
 * config order; the catalog's own order is the schema default's). Malformed or absent
 * specs are skipped (runtime fail-open).
 */
export declare const CatalogSets: (State: State, Path: string) => string[];
/**
 * The explicit enrollment classification (live_monitor <path>): the watchlist override,
 * else the catalog globs.
 */
export declare const ExplicitSets: (State: State, Path: string) => string[];
/**
 * Whether the path is opted out for one agent (the per-glob opt-outs; the `live_monitor
 * off <glob>` records).
 */
export declare const OptedOut: (State: State, AgentID: string, Path: string) => boolean;
/**
 * The automatic enrollment classification (the fs/observed path): watchlist-gated and
 * opt-out filtered. Returns undefined when the file must NOT be enrolled (no watchlist
 * match, or opted out); an array (even empty) when it enrolls - an empty array enrolls
 * with `checks: none`.
 */
export declare const AutoSets: (State: State, AgentID: string, Path: string) => string[] | undefined;

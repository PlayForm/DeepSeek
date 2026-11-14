import type { CoachClass } from "../Interface/Execution.js";
/**
 * @module Normalize
 *
 * Command normalization and segment splitting.
 *
 * @remarks
 *
 * Plan Part 2 §2.7a. Detection is NEVER exact-match only: before any
 * matching, the raw command is normalized so obfuscated variants resolve to
 * the same text the pattern rows and the intent-marker scan see.
 *
 * The normalizer, in order:
 *   1. Heredoc bodies are STRIPPED (`<< [+-]MARKER` ... MARKER): the body is
 *      stdin data, not command text, and must not match rows or markers; the
 *      `<< MARKER` prefix and any redirect survive (the heredoc-to-file row).
 *   2. Substitutions ($(...), `...`) become the marker `«sub»` (inner text
 *      kept out of matching - it is command OUTPUT, not command text).
 *   3. Variables ($IFS, $VAR, ${VAR}) become the marker `«var»` - treated as
 *      an opaque token; `$IFS` specifically becomes a space (the classic
 *      whitespace obfuscation).
 *   4. Quote layers are stripped ('x', "x", \x -> x), whitespace collapsed,
 *      and the leading command word of the whole command lowercased.
 *
 * Splitting (plan Part 2 §2.6 / the PLAN §5 Detect contract): the command is
 * split into PIPELINES on `;`, `&&`, `||`, `&` (outside quotes/heredocs -
 * heredocs are already gone at this point); a pipeline's segments (split on
 * `|`) share one fate: if the pipeline's HEAD is exempt, the whole pipeline is
 * exempt (rule 5); otherwise every segment is classified individually and the
 * highest-priority class wins. Trailing redirect context belongs to the
 * segment it follows, so `cat f > out.txt` is one segment with a redirect.
 */
/**
 * The class priority rank of a class (lower = more severe).
 */
export declare const Rank: (Class: CoachClass) => number;
/**
 * Escape user data before template insertion: `${` becomes `$${`.
 */
export declare const Escape: (Text: string) => string;
/**
 * Strip heredoc bodies. `<< [-]MARKER` starts a heredoc; everything after the
 * operator line until a line equal to MARKER is body data and is removed.
 * Redirects on the operator line survive.
 */
export declare const StripHeredocs: (Command: string) => string;
/**
 * Remove quote layers and backslashes: 'x', "x", \x -> x.
 */
export declare const StripQuotes: (Text: string) => string;
/**
 * Collapse runs of whitespace to single spaces and trim.
 */
export declare const Collapse: (Text: string) => string;
/**
 * Normalize ONE pipeline's text (no splitting): the plan's §2.7a steps.
 */
declare const Normalize: (Pipeline: string) => string;
export default Normalize;
/**
 * Split a pipeline into its pipe segments (the unit of classification).
 */
export declare const Segments: (Pipeline: string) => string[];
/**
 * The pipeline's head command word (its first segment's first token).
 */
export declare const Head: (Pipeline: string) => string;

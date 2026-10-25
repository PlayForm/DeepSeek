import type { CoachClass } from "@Interface/Execution.js";
/** The class priority rank of a class (lower = more severe). */
export declare const Rank: (Class: CoachClass) => number;
/** Escape user data before template insertion: `${` becomes `$${`. */
export declare const Escape: (Text: string) => string;
/**
 * Strip heredoc bodies. `<< [-]MARKER` starts a heredoc; everything after the
 * operator line until a line equal to MARKER is body data and is removed.
 * Redirects on the operator line survive.
 */
export declare const StripHeredocs: (Command: string) => string;
/** Remove quote layers and backslashes: 'x', "x", \x -> x. */
export declare const StripQuotes: (Text: string) => string;
/** Collapse runs of whitespace to single spaces and trim. */
export declare const Collapse: (Text: string) => string;
/** Normalize ONE pipeline's text (no splitting): the plan's §2.7a steps. */
declare const Normalize: (Pipeline: string) => string;
export default Normalize;
/** Split a pipeline into its pipe segments (the unit of classification). */
export declare const Segments: (Pipeline: string) => string[];
/** The pipeline's head command word (its first segment's first token). */
export declare const Head: (Pipeline: string) => string;

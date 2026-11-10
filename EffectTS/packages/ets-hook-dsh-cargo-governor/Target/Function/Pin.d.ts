import type Plan from "../Interface/Plan.js";
/**
 * @module Pin
 *
 * The surgical line-level rewrite of the raw Cargo.toml text.
 *
 * @remarks
 *
 * This is the internal calculation that makes comment/formatting
 * preservation possible: smol-toml is used ONLY to identify entries -
 * Function/Decode/Satisfy - and THIS function operates on the raw text
 * lines, so comments, inline comments, blank lines, and spacing survive
 * byte-for-byte; only the version requirement strings of the planned entries
 * change. Never a TOML stringify.
 *
 * Handled entry shapes on the raw text:
 *   * `name = "0.3.4"`                     -> the quoted string is replaced;
 *   * `name = { version = "0.3.4", ... }`  -> the version inside the inline
 *                                             table is replaced (same line);
 *   * a pretty-printed inline table        -> the `version = "..."` line inside
 *     (the `{` opens, the `}` closes        the entry's lines is replaced;
 *     on later lines)
 *   * `name.version = "0.3.4"` (dotted)    -> treated as the inline shape via
 *                                             the parsed entry (rare);
 *   * `[dependencies.name]` table style    -> the `version = "..."` line inside
 *     the entry table is replaced;
 *   * strips (strict mode)                 -> the entry's lines are REMOVED
 *     (single-line entries: just the line; pretty/table entries: through the
 *     closing brace or the next header).
 *
 * REFUSAL GUARD: if any planned entry cannot be located in the text (a
 * parse/scan disagreement - the module never writes a partial rewrite), the
 * rewrite is ABORTED with a REFUSED line and the original text is returned
 * unchanged. Non-dependency sections cannot be touched by construction:
 * replacements are only applied while the scanner is inside a planned
 * dependency section, and Continue additionally refuses any plan entry whose
 * section is not an identified dependency table.
 *
 * The granularized units (one definition per file, Pin/): SplitPath (the
 * header-path normalization), KeyOf (the plan key), Name (the declaration
 * matcher) and SpliceVersion (the in-line version splice).
 */
export interface Outcome {
    /**
     * The rewritten text (unchanged when nothing matched or on refusal).
     */
    Text: string;
    /**
     * Whether any line was modified.
     */
    Changed: boolean;
    /**
     * Refusal message when the rewrite was aborted, else null.
     */
    Refusal: string | null;
}
export default _default;
declare function _default(Text: string, Plan: Plan, Path: string): Outcome;

/**
 * @module ScanImports
 *
 * The v0 import-specifier scanner: static `from "..."` and dynamic `import("...")`
 * occurrences per line, comment lines skipped.
 *
 * @remarks
 *
 * The caller decides which specifiers become edges: only RELATIVE specifiers produce an
 * `imports` edge; a non-relative specifier is recorded as a skipped import in the parse
 * result - never as a fake node or edge.
 */
export interface ImportMatch {
    specifier: string;
    line: number;
}
export default _default;
declare function _default(Lines: string[]): ImportMatch[];

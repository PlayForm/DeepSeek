/**
 * @module Language
 *
 * The extension to language and comment syntax map: the annotation block speaks
 * the file's own comment language.
 *
 * @remarks
 *
 * The map follows `Documentation/Plans/COST-TRACK-PLUGIN.md` section 7. It
 * answers a line prefix of `//` for the C family, `#` for the script and data
 * languages, `--` for the dash family, and a `<!--` open with a `-->` close for
 * the markup family. Line opens one comment line; Begin and End wrap the marker
 * lines (they equal Line, and End is empty, for the three line-comment
 * families). An unknown extension returns undefined: the annotation is skipped,
 * never guessed.
 */
type Syntax = {
    Language: string;
    Line: string;
    Begin: string;
    End: string;
};
export default _default;
declare function _default(Path: string): Syntax | undefined;

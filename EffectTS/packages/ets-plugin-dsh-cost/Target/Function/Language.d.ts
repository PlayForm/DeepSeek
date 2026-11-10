/**
 * @module Language
 *
 * The extension to language and comment syntax
 * (Documentation/Plans/COST-TRACK-PLUGIN.md section 7): the annotation
 * block speaks the file's own comment language.
 *
 * @remarks
 *
 * The line-comment families are the C family (a double slash), the script
 * and data languages (a hash), and the dash family (a double dash); the
 * markup family opens with a comment-open token and closes with a
 * comment-close token. Line opens one comment line; Begin and End wrap the
 * marker lines (they equal Line, and End is empty, for the three
 * line-comment families). An unknown extension returns undefined: the
 * annotation is skipped, never guessed.
 */
/**
 * One file's comment syntax.
 */
type Syntax = {
    Language: string;
    Line: string;
    Begin: string;
    End: string;
};
export default _default;
declare function _default(Path: string): Syntax | undefined;

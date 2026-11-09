/**
 * @module ScanMarkdown
 *
 * The v0 Markdown section scanner: one DocSection per `^#{1,6} ` heading.
 *
 * @remarks
 * The span runs from the heading line to the line before the next heading of the same or
 * higher level (or the end of the file). The title is the heading text without the hashes and
 * the separating space.
 */
import type { Span } from "../Interface/Node.js";
export interface SectionMatch {
    level: number;
    title: string;
    span: Span;
}
export default _default;
declare function _default(Lines: string[]): SectionMatch[];

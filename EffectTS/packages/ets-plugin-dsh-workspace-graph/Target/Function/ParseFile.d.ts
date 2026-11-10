import type Edge from "../Interface/Edge.js";
import type Node from "../Interface/Node.js";
/**
 * @module ParseFile
 *
 * The v0 parser for one file's text: the entry behind Index.
 *
 * @remarks
 *
 * TypeScript/JavaScript: the File node over the whole text, one Symbol node
 * per declaration (ScanSymbols), one Block node per multi-line symbol body
 * (kind `body`), the contains edges, the relative-import edges (a
 * non-relative specifier is recorded as skipped - never a fake node), and
 * the Test node plus its contains edge when the path is a test path (a
 * `.test.ts`, `.test.tsx` or `.test.js` suffix, or a `Test.ts` segment).
 * Markdown: the File node, one DocSection per heading (ScanMarkdown) and the
 * contains edges. Every node carries the file version token it was parsed
 * from; every fingerprint is content-derived (Fingerprint).
 */
export interface Parsed {
    nodes: Node[];
    edges: Edge[];
    skipped: {
        specifier: string;
        line: number;
    }[];
    fileFingerprint: string;
}
export default _default;
declare function _default(Path: string, Text: string, Language: "typescript" | "javascript" | "markdown", Version: string): Parsed;

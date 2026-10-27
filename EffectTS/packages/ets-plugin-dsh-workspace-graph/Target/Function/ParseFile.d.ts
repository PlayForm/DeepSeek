import type Edge from "../Interface/Edge.js";
import type Node from "../Interface/Node.js";
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

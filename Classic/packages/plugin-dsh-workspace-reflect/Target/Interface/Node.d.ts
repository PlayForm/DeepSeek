export default interface Node {
    /** The frozen node id (`Symbol:<path>:<name>`, `Block:<path>:<line>:<kind>`). */
    id: string;
    /** The node kind (Symbol, Block, ...). */
    kind: string;
    /** The resolved display path of the file the node lives in. */
    path: string;
    /** The node's name (a Symbol's declaration name); absent for a Block. */
    name?: string;
    /** The 1-based, inclusive line span. */
    span?: {
        startLine: number;
        endLine: number;
    };
    /** The graph's content-derived fingerprint at index time. */
    fingerprint?: string;
}

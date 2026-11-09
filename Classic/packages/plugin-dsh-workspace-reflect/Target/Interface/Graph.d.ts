import type Node from "@Interface/Node.js";
export default interface GraphHandle {
    /** The frozen contract's method: re-index one file after a
     *  transformation, so the graph's representation stays current. */
    indexFile(path: string): Promise<unknown>;
    /** The frozen contract's method: find nodes by name (the reflective
     *  locate aid for a rename given without a span). */
    find(query: {
        name?: string;
        pattern?: string;
        kind?: string;
        limit?: number;
    }): unknown[];
    /** The frozen contract's method: one node by id - the AST source a
     *  fingerprint-targeted Replace resolves its span from. */
    getNode(id: string): Node | undefined;
}

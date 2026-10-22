export interface GraphEntry {
    /** The repo-relative path of the neighborhood entry. */
    path: string;
    /** The role of the entry in the component: "definition" | "caller" | "test" | "doc" | a graph-specific role. */
    role: string;
    /** The one phrase the model reads (e.g. "the callers"). */
    reason: string;
}
export default interface WorkspaceGraph {
    /**
     * The connected component around a file's code blocks.
     * @param Path - the repo-relative path of the anchor file.
     * @param Limit - the maximum entries (default 7).
     */
    neighborhood(Path: string, Limit?: number): GraphEntry[];
}
declare module "@deepseek-ai/cordis" {
    interface Context {
        /** The workspace graph service (W1 foundation; declared in this package). */
        workspaceGraph: WorkspaceGraph;
    }
}

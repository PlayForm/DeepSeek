export interface Fact {
    /** The node kinds recorded at the path, in the graph's own order. */
    kinds: string[];
    /** The path's depth below the snapshot's common root (1 = a root file). */
    depth: number;
    /** The version-token rank in [0, 1] (1 = the newest token in the snapshot). */
    recency: number;
}
export default interface Projection {
    /** The graph's indexRevision the projection was built from. */
    revision: string;
    /** The number of nodes read from the snapshot. */
    nodes: number;
    /** The common-root segment count the depth is measured below. */
    root: number;
    /** The normalized node path to its facts. */
    facts: Map<string, Fact>;
}

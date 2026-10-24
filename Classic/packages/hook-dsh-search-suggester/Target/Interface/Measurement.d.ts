export default interface Measurement {
    /** Whether the graph has a node at the candidate path (or under its glob). */
    exists: boolean;
    /** The matched node kind: the first expected kind present, else the first seen. */
    kind: string;
    /** The shallowest matched node's depth below the snapshot root. */
    depth: number;
    /** The best matched node's version-token rank in [0, 1]. */
    recency: number;
    /** The projected literal score (plan section 3.7 `literal(c)`). */
    literal: number;
    /** The projected scope score (plan section 3.7 `scope(c)`). */
    scope: number;
    /** The matched node paths, shallowest first (the projection's concrete index). */
    paths: string[];
    /** The number of matched node paths. */
    count: number;
}

/**
 * @module Statistics
 *
 * The counts (the brief's section 4.3 GraphStatistics): the stored file count, the total node
 * and edge counts over the valid mirror, and the current indexRevision.
 */
export default interface Statistics {
    /** The stored file count. */
    files: number;
    /** The total node count over the valid mirror. */
    nodes: number;
    /** The total edge count over the valid mirror. */
    edges: number;
    /** The current index revision, as a string. */
    indexRevision: string;
}

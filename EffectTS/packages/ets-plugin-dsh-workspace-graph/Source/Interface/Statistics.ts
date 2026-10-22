// Statistics - the counts (the brief's section 4.3 GraphStatistics): the
// stored file count, the total node and edge counts over the valid mirror,
// and the current indexRevision.
export default interface Statistics {
	files: number;
	nodes: number;
	edges: number;
	indexRevision: string;
}

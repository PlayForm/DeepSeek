// EdgeWeight - the edge-strength ranking table (DATA, not code; V4-1
// section 3.5: "ranked by edge strength (a call beats a reference, a test
// beats a mention)"). Higher wins. The graph's v0 edge set is
// contains/imports; the table already carries the full v4-1 vocabulary so
// later waves need no ranking change. The table is the module-owned
// contract: reordering it is a semantic change to the packet's NEIGHBORS
// section and belongs in a plan, not in a refactor.
const EDGE_WEIGHT: Record<string, number> = {
	calls: 50,
	tests: 40,
	imports: 30,
	references: 20,
	mention: 10,
	contains: 5,
};

export default EDGE_WEIGHT;

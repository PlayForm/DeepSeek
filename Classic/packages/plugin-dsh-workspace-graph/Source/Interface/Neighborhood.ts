// Neighborhood - one entry of the connected component around an anchor file,
// the shape the graph-suggester's declared contract consumes
// (`ctx.workspaceGraph.neighborhood(path, limit)`). The W1 graph serves it
// from the two edge kinds it parses (`contains`, `imports`): the anchor
// itself (the definition), the files that import it (the importers, split
// into the tests by path), the files it imports (the dependencies), and the
// DocSections in the anchor's own file (the doc block). Callers and
// references are NOT faked - they need the deferred `calls`/`references`
// edges.
export default interface Neighborhood {
	/** The resolved display path of the entry (the anchor's own path included). */
	path: string;
	/** The role in the component: definition | importer | test | dependency | doc. */
	role: string;
	/** The one phrase the model reads (e.g. "the importers"). */
	reason: string;
}

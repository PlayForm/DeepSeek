// Trace - the D5 trace vocabulary the panel follows, mirrored structurally
// from @playform/ets-lib-dsh-trace (Variable/Names.ts) and the factory's Trace
// service. The panel does not import either package: the client bundle must
// not reach a host package, and the names are the contract, so they are
// restated here as data. A host that exposes the bus in the browser answers
// these names through the `on` face.
const Observe = "observe/stamp";
const Indexed = "graph/indexed";
const Invalidated = "graph/invalidated";

export default {
	/** The service name the factory provides on the host (`ctx.trace`). */
	service: "trace",
	/** The observe hook's recorded stamp (the indexer's first source). */
	observe: Observe,
	/** The graph stored (or replaced) a file record. */
	indexed: Indexed,
	/** The graph's record for a path is no longer valid. */
	invalidated: Invalidated,
	/** The three names an adapter follows when its manifest declares none. */
	kinds: [Observe, Indexed, Invalidated],
} as const;

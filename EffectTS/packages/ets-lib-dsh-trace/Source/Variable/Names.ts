// Names - the trace vocabulary's names: the service name the factory provides
// (`ctx.trace`) and the event names the family's adapters emit and consume.
// The library owns the strings; no plugin re-declares them (the one place a
// new event name is added).
export default {
	/** The service name the factory provides (`ctx.trace`). */
	service: "trace",
	/** The observe hook's recorded stamp (the indexer's first source). */
	observe: "observe/stamp",
	/** The graph stored (or replaced) a file record. */
	indexed: "graph/indexed",
	/** The graph's record for a path is no longer valid (replaced, removed, absent). */
	invalidated: "graph/invalidated",
} as const;

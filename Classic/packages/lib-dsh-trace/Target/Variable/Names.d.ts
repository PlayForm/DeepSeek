declare const _default: {
    /** The service name the factory provides (`ctx.trace`). */
    readonly service: "trace";
    /** The observe hook's recorded stamp (the indexer's first source). */
    readonly observe: "observe/stamp";
    /** The graph stored (or replaced) a file record. */
    readonly indexed: "graph/indexed";
    /** The graph's record for a path is no longer valid (replaced, removed, absent). */
    readonly invalidated: "graph/invalidated";
};
export default _default;

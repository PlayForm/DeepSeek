declare const _default: {
    /** The service name the factory provides on the host (`ctx.trace`). */
    readonly service: "trace";
    /** The observe hook's recorded stamp (the indexer's first source). */
    readonly observe: "observe/stamp";
    /** The graph stored (or replaced) a file record. */
    readonly indexed: "graph/indexed";
    /** The graph's record for a path is no longer valid. */
    readonly invalidated: "graph/invalidated";
    /** The three names an adapter follows when its manifest declares none. */
    readonly kinds: readonly ["observe/stamp", "graph/indexed", "graph/invalidated"];
};
export default _default;

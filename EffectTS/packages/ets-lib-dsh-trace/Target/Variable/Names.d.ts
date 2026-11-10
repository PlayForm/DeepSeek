/**
 * @module Names
 *
 * Describes the trace vocabulary's names: the service name the factory
 * provides (`ctx.trace`) and the event names the family's adapters emit and
 * consume.
 *
 * @remarks
 * The library owns the strings; no plugin re-declares them (the one place a
 * new event name is added).
 */
declare const _default: {
    /**
     * The service name the factory provides (`ctx.trace`).
     */
    readonly service: "trace";
    /**
     * The observe hook's recorded stamp (the indexer's first source).
     */
    readonly observe: "observe/stamp";
    /**
     * The graph stored (or replaced) a file record.
     */
    readonly indexed: "graph/indexed";
    /**
     * The graph's record for a path is no longer valid (replaced, removed,
     * absent).
     */
    readonly invalidated: "graph/invalidated";
};
export default _default;

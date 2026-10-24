declare const _default: {
    /** The service name the factory provides on the host (`ctx.trace`). */
    readonly service: "trace";
    /** The observe hook's recorded stamp (the indexer's first source). */
    readonly observe: "observe/stamp";
    /** The graph stored (or replaced) a file record. */
    readonly indexed: "graph/indexed";
    /** The graph's record for a path is no longer valid. */
    readonly invalidated: "graph/invalidated";
    /** The batch gate heard a proposal (the decision hook's event). */
    readonly proposed: "batch/proposed";
    /** The batch gate decided a proposal (the decision hook's event). */
    readonly decision: "batch/decision";
    /** The batch state machine moved (the batchstate plugin's event). */
    readonly stateChange: "batch/state-change";
    /** Every name the live view follows. */
    readonly kinds: readonly ["observe/stamp", "graph/indexed", "graph/invalidated", "batch/proposed", "batch/decision", "batch/state-change"];
};
export default _default;

// Trace - the D5 trace vocabulary the live view follows. The names are
// mirrored structurally from @playform/ets-lib-dsh-trace (Variable/Names.ts) and
// the batch transitions from the batch packages' cordis events
// (batch/proposed, batch/decision, batch/state-change): the live view
// subscribes to the names on the trace bus, so a batch plugin that mirrors its
// transitions onto the bus (the "when present" condition) surfaces them in
// the tail without any extra wiring. The package never imports the trace
// library or the factory - the bus is resolved structurally from the client
// context (`ctx.get("trace")`).
const Observe = "observe/stamp";
const Indexed = "graph/indexed";
const Invalidated = "graph/invalidated";
const Proposed = "batch/proposed";
const Decision = "batch/decision";
const StateChange = "batch/state-change";

export default {
	/** The service name the factory provides on the host (`ctx.trace`). */
	service: "trace",
	/** The observe hook's recorded stamp (the indexer's first source). */
	observe: Observe,
	/** The graph stored (or replaced) a file record. */
	indexed: Indexed,
	/** The graph's record for a path is no longer valid. */
	invalidated: Invalidated,
	/** The batch gate heard a proposal (the decision hook's event). */
	proposed: Proposed,
	/** The batch gate decided a proposal (the decision hook's event). */
	decision: Decision,
	/** The batch state machine moved (the batchstate plugin's event). */
	stateChange: StateChange,
	/** Every name the live view follows. */
	kinds: [Observe, Indexed, Invalidated, Proposed, Decision, StateChange],
} as const;

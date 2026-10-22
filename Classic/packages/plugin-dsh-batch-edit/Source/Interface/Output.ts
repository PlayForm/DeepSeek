// Output - the canonical output value of the batch_edit tool: ONE JSON
// object (the defineTool law), rendered to model-facing prose by
// output.render and carrying the per-file diffs for the UI's diff card
// through presentationMeta (the cookbook path - no client half in v1).
import type { ProcessStatus } from "./Process.js";

/** One per-file cell in the output's `state` array. */
export interface OutputCell {
	file: string;
	status: ProcessStatus;
	version?: string;
	diff?: string;
	error?: string;
	haltReason?: string;
}

/** The canonical value. */
export default interface Output {
	machine: string;
	state: OutputCell[];
	applied: number;
	failed: number;
	halted: number;
	/** The background job id when the commit exceeded the deadline and
	 *  continues as a background job. */
	jobId?: string;
	/** The misses listed at open/insert (never guessed). */
	misses?: string[];
	/** The advisory intercept's note when a bash call on a held file was
	 *  observed (v1, interceptBash on). */
	offer?: string;
}

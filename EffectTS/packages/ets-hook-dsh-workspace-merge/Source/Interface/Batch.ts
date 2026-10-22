// Batch - the input of preview/commit (Interface/Batch): an ORDERED set of
// per-file operations. The order is the commit order (the factory's write
// executor is awaited one file at a time, so the version-guarded writes
// never race - the sequential fold).
import type Operation from "@Interface/Operation.js";

export default interface Batch {
	/** An optional caller-supplied id; a generated one is assigned when
	 *  absent (`batch-<seq>`, never a wall clock). */
	id?: string;
	/** The ordered operations. */
	operations: Operation[];
}

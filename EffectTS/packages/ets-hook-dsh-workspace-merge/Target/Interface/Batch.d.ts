import type Operation from "@Interface/Operation.js";
export default interface Batch {
    /** An optional caller-supplied id; a generated one is assigned when
     *  absent (`batch-<seq>`, never a wall clock). */
    id?: string;
    /** The ordered operations. */
    operations: Operation[];
}

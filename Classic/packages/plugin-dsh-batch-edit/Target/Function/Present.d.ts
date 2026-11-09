import type { OutputCell } from "../Interface/Output.js";
import type Output from "../Interface/Output.js";
import type { MachineRecord } from "../Interface/Process.js";
/** The per-file cells in the canonical value: one entry per held process,
 *  in the stable path-sorted order, each carrying its status, its held
 *  version, and whatever the last transition left (diff / error / halt
 *  reason). */
export declare const Cells: (Machine: MachineRecord) => OutputCell[];
/** The model-facing prose for the tool's output.render: the state list, one
 *  line per file, plus the counts and any misses. Pure text, no markup the
 *  model could mistake for harness state. */
export declare const Prose: (Value: Output, Machine: MachineRecord | undefined) => string;

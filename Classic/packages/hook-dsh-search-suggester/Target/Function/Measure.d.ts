import type { Intent, Target } from "../Interface/Execution.js";
import type Measurement from "../Interface/Measurement.js";
import type Projection from "../Interface/Projection.js";
/** Whether a node path satisfies a candidate path or glob. */
export declare const Match: (Candidate: string, NodePath: string) => boolean;
export default _default;
declare function _default(
/** The built projection (Function/Projection). */
Projection: Projection, 
/** The intent the candidate belongs to (its expected kinds). */
Intent: Intent, 
/** The pack candidate. */
Target: Target): Measurement;

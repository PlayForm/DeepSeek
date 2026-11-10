/**
 * @module Filter
 *
 * The BASE-AWARE workspace filter over the detections: each intent's
 * candidate set is reduced to the targets that exist under any of the call's
 * three bases (the repo root, the package root, the package parent), BEFORE
 * the score/gate step (the runner-up intent too, since a close second folds
 * into the same note).
 *
 * @remarks
 * An intent whose whole candidate set is absent survives as a detection with
 * zero targets, and Score turns that into the `no-companions` abstention.
 */
import type { Detection } from "../Interface/Execution.js";
export default _default;
declare function _default(
/**
 * The ranked detections (Detect's output).
 */
Detections: Detection[], 
/**
 * The call path the pack is judged against.
 */
CallPath: string, 
/**
 * The resolved workspace root (the gate's root).
 */
Root: string, 
/**
 * The session cwd, when the harness service exposes one.
 */
Cwd: string | undefined): Detection[];

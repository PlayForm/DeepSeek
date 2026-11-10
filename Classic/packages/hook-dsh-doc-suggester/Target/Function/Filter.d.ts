import type { Detection } from "../Interface/Execution.js";
export default _default;
/**
 * @module Filter
 *
 * Reduces each detection's companion set to the targets that exist on disk.
 *
 * @remarks
 *
 * The BASE-AWARE workspace filter over the detections: each family's companion set is
 * reduced to the targets that exist under any of the call's three bases (the repo root, the
 * package root, the package parent), BEFORE the score/gate step. A family whose whole
 * companion set is absent survives as a detection with zero targets, and Score turns that
 * into the `no-companions` abstention (the family is still named in the ledger, so the
 * silence stays diagnosable).
 */
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

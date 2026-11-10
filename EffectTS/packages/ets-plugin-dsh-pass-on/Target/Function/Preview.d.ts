/**
 * @module Preview
 *
 * The bounded before/after per target: the diff region, not the full files.
 *
 * @remarks
 * Plan section 3. Each side is capped at maxPreviewBytes per entry.
 */
import type Preview from "../Interface/Preview.js";
export default _default;
declare function _default(Path: string, Before: string, After: string, MaxBytes: number): Preview;

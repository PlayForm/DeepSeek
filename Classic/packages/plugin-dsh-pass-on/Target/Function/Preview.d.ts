/**
 * @module Preview
 *
 * The bounded before/after per target (plan section 3): the diff region, not
 * the full files.
 *
 * @remarks
 * Each side is capped at maxPreviewBytes per entry.
 */
import type Preview from "../Interface/Preview.js";
export default _default;
declare function _default(Path: string, Before: string, After: string, MaxBytes: number): Preview;

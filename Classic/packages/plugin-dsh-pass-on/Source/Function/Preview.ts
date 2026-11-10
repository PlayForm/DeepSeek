import type Preview from "../Interface/Preview.js";

/**
 * @module Preview
 *
 * The bounded before/after per target (plan section 3): the diff region, not
 * the full files.
 *
 * @remarks
 *
 * Each side is capped at maxPreviewBytes per entry.
 */
/**
 * Bound one side of the preview.
 */
const Cap = (Value: string, Bytes: number): string =>
	Value.length <= Bytes ? Value : `${Value.slice(0, Bytes)}... [capped]`;

export default (Path: string, Before: string, After: string, MaxBytes: number): Preview => ({
	path: Path,
	before: Cap(Before, MaxBytes),
	after: Cap(After, MaxBytes),
});

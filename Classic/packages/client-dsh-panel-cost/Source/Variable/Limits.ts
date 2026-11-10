/**
 * @module Limits
 *
 * The row budget the route applies.
 *
 * @remarks
 *
 * The shape is the Design.md section 13.4 one: the default when the query carries no usable rows
 * value and the two clamp ends, read by the ledger reader and mirrored by the view's own budget
 * growth, plus the two step-page sizes the view pages the step tail and the older rows by.
 */
export default {
	/**
	 * The row budget when the query carries no usable rows value.
	 */
	DefaultRows: 200,
	/**
	 * The lower clamp end of the row budget.
	 */
	MinRows: 1,
	/**
	 * The upper clamp end of the row budget.
	 */
	MaxRows: 2000,
	/**
	 * The step-page size the view pages the step tail by.
	 */
	StepLimit: 24,
	/**
	 * The factor the view grows the older rows by.
	 */
	LoadOlderFactor: 2,
} as const;

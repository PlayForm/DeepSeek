// Limits - the row budget the route applies (Design.md section 13.4): the
// default when the query carries no usable rows value and the two clamp
// ends, read by the ledger reader and mirrored by the view's own budget
// growth, plus the two step-page sizes the view pages the step tail and the
// older rows by.
export default {
	DefaultRows: 200,
	MinRows: 1,
	MaxRows: 2000,
	StepLimit: 24,
	LoadOlderFactor: 2,
} as const;

// Lines - the panel's documented log lines (the client half keeps no ledger
// file: it is a pure browser module, so its lines go through the client
// logger). Every line is a byte-exact contract asserted by the smoke suites
// and documented in SCHEME section 6:
//
//   * the duplicate-adapter refusal: one adapter per bundle per declared
//     child slot; a second adapter id claiming an occupied (slot, bundle) is
//     refused and the line names both sides;
//   * the plain-field audit: one line per accepted bridge write;
//   * the missing-bridge note: a plain field was edited with no host bridge
//     exposed (the field stays read-only).
export default {
	/** The slot-aware registry's refusal line. */
	duplicate: (bundle: string, slot: string): string =>
		`client-dsh-panel-family: duplicate adapter refused for ${bundle} in ${slot}`,
	/** The audit line for one accepted plain-field bridge write. */
	plainWrite: (namespace: string, path: string): string =>
		`client-dsh-panel-family: plain-field write ${namespace} ${path}`,
	/** The note for a plain-field edit with no bridge exposed. */
	bridgeMissing: (namespace: string): string =>
		`client-dsh-panel-family: plain-field bridge unavailable for ${namespace}`,
	/** The refusal for a plain-field write into a namespace with secrets. */
	plainSecret: (namespace: string): string =>
		`client-dsh-panel-family: plain-field secret refused for ${namespace}`,
} as const;

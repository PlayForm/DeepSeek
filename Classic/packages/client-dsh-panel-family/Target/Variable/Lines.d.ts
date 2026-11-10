/**
 * @module Lines
 *
 * The panel's documented log lines (the client half keeps no ledger file: it is a pure browser
 * module, so its lines go through the client logger).
 *
 * @remarks
 *
 * Every line is a byte-exact contract asserted by the smoke suites and documented in SCHEME
 * section 6:
 *
 * - The duplicate-adapter refusal: one adapter per bundle per declared child slot; a second
 *   adapter id claiming an occupied (slot, bundle) is refused and the line names both sides.
 * - The plain-field audit: one line per accepted bridge write.
 * - The missing-bridge note: a plain field was edited with no host bridge exposed (the field stays
 *   read-only).
 */
declare const _default: {
    /**
     * The slot-aware registry's refusal line.
     */
    readonly duplicate: (bundle: string, slot: string) => string;
    /**
     * The audit line for one accepted plain-field bridge write.
     */
    readonly plainWrite: (namespace: string, path: string) => string;
    /**
     * The note for a plain-field edit with no bridge exposed.
     */
    readonly bridgeMissing: (namespace: string) => string;
    /**
     * The refusal for a plain-field write into a namespace with secrets.
     */
    readonly plainSecret: (namespace: string) => string;
};
export default _default;

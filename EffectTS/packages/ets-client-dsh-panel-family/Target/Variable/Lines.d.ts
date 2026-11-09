declare const _default: {
    /** The slot-aware registry's refusal line. */
    readonly duplicate: (bundle: string, slot: string) => string;
    /** The audit line for one accepted plain-field bridge write. */
    readonly plainWrite: (namespace: string, path: string) => string;
    /** The note for a plain-field edit with no bridge exposed. */
    readonly bridgeMissing: (namespace: string) => string;
    /** The refusal for a plain-field write into a namespace with secrets. */
    readonly plainSecret: (namespace: string) => string;
};
export default _default;

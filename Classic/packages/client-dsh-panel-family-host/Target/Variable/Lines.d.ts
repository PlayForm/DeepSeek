declare const _default: {
    /** The plain-field bridge's refusal for a namespace declaring a secret. */
    readonly secret: (namespace: string) => string;
    /** The bridge's refusal for a namespace that is not a non-empty string. */
    readonly invalidNamespace: (namespace: string) => string;
    /** The bridge's refusal for a namespace that names no profile entry. */
    readonly unknown: (namespace: string) => string;
    /** The bridge's refusal when no config editor is composed. */
    readonly unavailable: () => string;
    /** The bridge's refusal when the package ships disabled. */
    readonly disabled: () => string;
    /** The bridge's refusal for a patch that is not a plain object. */
    readonly invalid: (namespace: string) => string;
    /** The bridge's note when the config editor rejects the write. */
    readonly failed: (namespace: string) => string;
};
export default _default;

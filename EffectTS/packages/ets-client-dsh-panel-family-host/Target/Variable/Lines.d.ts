/**
 * @module Lines
 *
 * The host package's documented refusal lines (the plain-field bridge's
 * ledger strings).
 *
 * @remarks
 *
 * The activation line stays the package's one `host:` line (Function/Apply);
 * every bridge refusal carries the `bridge:` prefix and is byte-exact - the
 * smoke suite asserts each one verbatim and SCHEME section 5 documents them.
 * The accepted write's audit line is not here: it comes from
 * `ctx.configEditor.edit()` itself (the editor owns the write path and its
 * own journal), exactly as PHASE-7 requires.
 */
declare const _default: {
    /**
     * The plain-field bridge's refusal for a namespace declaring a secret.
     */
    readonly secret: (namespace: string) => string;
    /**
     * The bridge's refusal for a namespace that is not a non-empty string.
     */
    readonly invalidNamespace: (namespace: string) => string;
    /**
     * The bridge's refusal for a namespace that names no profile entry.
     */
    readonly unknown: (namespace: string) => string;
    /**
     * The bridge's refusal when no config editor is composed.
     */
    readonly unavailable: () => string;
    /**
     * The bridge's refusal when the package ships disabled.
     */
    readonly disabled: () => string;
    /**
     * The bridge's refusal for a patch that is not a plain object.
     */
    readonly invalid: (namespace: string) => string;
    /**
     * The bridge's note when the config editor rejects the write.
     */
    readonly failed: (namespace: string) => string;
};
export default _default;

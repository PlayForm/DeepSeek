// Lines - the host package's documented refusal lines (the plain-field
// bridge's ledger strings). The activation line stays the package's one
// `host:` line (Function/Apply); every bridge refusal carries the `bridge:`
// prefix and is byte-exact - the smoke suite asserts each one verbatim and
// SCHEME section 5 documents them. The accepted write's audit line is NOT
// here: it comes from `ctx.configEditor.edit()` itself (the editor owns the
// write path and its own journal), exactly as PHASE-7 requires.
export default {
	/** The plain-field bridge's refusal for a namespace declaring a secret. */
	secret: (namespace: string): string => `bridge: secret namespace refused for ${namespace}`,
	/** The bridge's refusal for a namespace that is not a non-empty string. */
	invalidNamespace: (namespace: string): string => `bridge: invalid namespace ${namespace}`,
	/** The bridge's refusal for a namespace that names no profile entry. */
	unknown: (namespace: string): string => `bridge: unknown namespace ${namespace}`,
	/** The bridge's refusal when no config editor is composed. */
	unavailable: (): string => "bridge: config editor unavailable",
	/** The bridge's refusal when the package ships disabled. */
	disabled: (): string => "bridge: disabled (enabled=false)",
	/** The bridge's refusal for a patch that is not a plain object. */
	invalid: (namespace: string): string => `bridge: invalid patch for ${namespace}`,
	/** The bridge's note when the config editor rejects the write. */
	failed: (namespace: string): string => `bridge: write failed for ${namespace}`,
} as const;

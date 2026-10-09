// Invocation — one planned cargo upgrade run (CARGO MODULE). The package.json
// governor derives one invocation per policy target; the cargo module has no
// per-package target selector (documented mapping gap), so there is exactly
// ONE invocation per update run: the merged exclusion list (the policy's
// reject list ∪ the chain deps — the cordis-trap analog: cargo upgrade must
// never bump a chain-governed pin) and, when the policy names `allow` crates,
// the restriction to those crates.
export default interface Invocation {
	/** Ledger label for the run ("base"). */
	label: string;
	/** Crates to upgrade exclusively (one -p flag per crate), or null for the
	 *  unfiltered run over every non-excluded dependency. */
	allow: string[] | null;
	/** Crates to exclude (one --exclude flag per crate — the comma form is
	 *  silently ignored by cargo upgrade): policy.reject ∪ chain deps. */
	exclude: string[];
}

// Registry — the shape of an auxiliary `registry.json` discovery file (the
// chain workspace's record of effective latest versions). THE SAME discovery
// as the package.json governor: the nearest registry.json walking UP from the
// written file's directory, stopping at node_modules boundaries and the
// filesystem root (Function/Discover); read by Function/Parse during the
// listener's synchronous g2 stage. Only `effectiveLatest` is consumed: a dep
// name present there is CHAIN-GOVERNED (canonicalized to the Cargo caret form
// — the BARE version string, `version = "0.1.0-rc.6"`, because Cargo's caret
// is implicit — by the chain pass, and merged into cargo upgrade's --exclude
// list so the CLI can never bump a chain pin), a name absent from it is
// PUBLIC (left for the update stage).
export default interface Registry {
	/** Dependency name → the resolved version the chain pins against. */
	effectiveLatest?: Record<string, string>;
}

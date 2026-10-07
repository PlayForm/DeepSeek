// Registry — the shape of an auxiliary `registry.json` discovery file (the
// chain workspace's record of effective latest versions). Read by Function/
// Parse during the listener's synchronous g2 stage; only `effectiveLatest` is
// consumed: a dep name present there is CHAIN-GOVERNED (canonicalized to
// "^<resolved>" by the chain pass and merged into ncu's reject list), a name
// absent from it is PUBLIC (left for the update stage).
export default interface Registry {
	/** Dependency name → the resolved version the chain pins against. */
	effectiveLatest?: Record<string, string>;
}

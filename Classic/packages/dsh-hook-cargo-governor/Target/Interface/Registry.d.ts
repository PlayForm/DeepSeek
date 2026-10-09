export default interface Registry {
    /** Dependency name → the resolved version the chain pins against. */
    effectiveLatest?: Record<string, string>;
}

// Host - the service contract of the panel-family host
// (Documentation/Plans/UI-Family/PHASE-5-ADAPTERS-AND-LEDGER-TAILS.md).
// Two methods, least privilege, READ-ONLY (A5.3): the endpoint reads ~/.dsh
// family logs only and has no write surface.
//
// The Typert generation pipeline (TypertRemoteService + @Remote + generated
// descriptors) is documented as not reproducible from an external package
// (PHASE-5 caveat), so this PoC ships the endpoint as a plain host service
// under `panelFamilyHost` with the exact method surface; the end-phase
// either reproduces the pipeline or keeps the v1 shortcut (the pre-decided
// fallback, PHASE-5 step 1). fiberPhases are NOT here: they come from the
// already-remote remote.pluginManager (PHASE-5: prefer the existing remote;
// no new endpoint for them).
export default interface Host {
	/** tail(namespace, lines): the last `lines` lines of the owning
	 *  module's ~/.dsh log (`~/.dsh/<namespace>.log`). The namespace is
	 *  validated against the family module-name pattern (lowercase
	 *  letters/digits/hyphens) - a path traversal attempt is rejected, not
	 *  sanitized. `lines` is capped at the Config maxLines. Returns the
	 *  lines (oldest first, each without its newline) or a failure:
	 *  `not-found` when the log file does not exist, `rejected` when the
	 *  namespace or the line count is invalid. */
	tail(namespace: string, lines: number): Promise<unknown>;
	/** stats(): the CCR store summary. The LRU internals are not exposed by
	 *  any existing remote (the ccr adapter's LRU count stays deferred to
	 *  the Typert spike), so v1 returns the ccr log summary (the log path,
	 *  its byte size, its line count) from the Config ccrLog file. */
	stats(): Promise<unknown>;
}

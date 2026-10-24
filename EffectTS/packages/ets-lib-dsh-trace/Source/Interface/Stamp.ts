// Stamp - the `observe/stamp` payload: the observation stamp the observe hook
// records (the path, the observed version, the origin). The graph's adapter
// consumes exactly this shape; the hook's own KV record adds its monotonic
// sequence, which the trace does not carry (the sequence stays the hook's
// private ledger).
export default interface Stamp {
	/** The path as the fs/observed event carried it (`displayPath`). */
	path: string;
	/** The observed version token, verbatim; "absent" for an absent observation. */
	version: string;
	/** How the stamp was recorded ("fs/observed" or "manual"). */
	origin: string;
}

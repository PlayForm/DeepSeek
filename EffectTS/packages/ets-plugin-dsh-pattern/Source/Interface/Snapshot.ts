// Snapshot - the persisted registry shape (the local JSON under ~/.dsh,
// PATTERN-GRAPH-PLUGIN.md open decision 2, second reading). Versioned so a
// stale file is rejected rather than merged; the memory stays local, never
// the repo.
export default interface Snapshot {
	version: 1;
	savedAt: number;
	patterns: import("./Pattern.js").default[];
}

/**
 * @module Snapshot
 *
 * The persisted registry shape: the local JSON under ~/.dsh.
 *
 * @remarks
 *
 * PATTERN-GRAPH-PLUGIN.md open decision 2, second reading. Versioned so a
 * stale file is rejected rather than merged; the memory stays local, never
 * the repo.
 */
export default interface Snapshot {
	/**
	 * The snapshot's schema version.
	 */
	version: 1;

	/**
	 * When the snapshot was saved (epoch ms).
	 */
	savedAt: number;

	/**
	 * The registry's patterns.
	 */
	patterns: import("./Pattern.js").default[];
}

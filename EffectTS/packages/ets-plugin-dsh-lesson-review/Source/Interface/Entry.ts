// Entry - one corpus entry's usage record: the `.usage.json` sidecar row of
// the Hermes original, reduced to the fields the lifecycle actually reads.
//
// `createdBy` is a POLICY FLAG, not a provenance claim (the Hermes
// `created_by` note): it answers "may autonomous curation archive this?", not
// "who wrote it". Only the review sets it to `agent`; a foreground lesson is
// `learn`, a hand-written skill is `user` (or null for a record that predates
// the flag), and the lifecycle never archives the latter two.
export default interface Entry {
	/** The corpus directory name (kebab-case, class-level). */
	name: string;
	/** How often the entry was loaded into a turn. */
	useCount: number;
	/** How often the entry was read (`skill_view` analog). */
	viewCount: number;
	/** How often the review wrote to it. */
	patchCount: number;
	/** Epoch ms - the entry's first observation. */
	createdAt: number;
	/** Epoch ms - the last use (the inactivity clock). */
	lastUsedAt: number;
	/** Epoch ms - the last review write. */
	lastPatchedAt: number;
	/** The lifecycle state. */
	state: "active" | "stale" | "archived";
	/** Pinned entries are off-limits to BOTH transitions and the review. */
	pinned: boolean;
	/** The policy flag (see the header note). */
	createdBy: "agent" | "learn" | "user" | null;
	/** Epoch ms when the entry was archived, or null. */
	archivedAt: number | null;
}

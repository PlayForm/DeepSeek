// Proposal - one TYPED workspace proposal (Interface/Proposal): the three
// legal operation kinds of the operate layer (rename, connect, replace -
// OPERATE.md's typed proposals). A proposal is created ONLY when the
// resolution rules pass; it always carries the version fence it was made
// against and its monotonic sequence (never a wall clock). The status
// lifecycle is the proposal-side slice of the v4.1 edit lifecycle
// (`proposed -> approved -> applying -> verified | conflict | denied`,
// W4.1 section 3.7): the operate hook owns proposed/withdrawn; the later
// approve and merge steps own the rest.
export default interface Proposal {
	/** The stable id: `<kind>-<sequence>` (unique per hook instance). */
	id: string;
	/** The proposal kind. */
	kind: "rename" | "connect" | "replace";
	/** The lifecycle status (the operate hook's own slice). */
	status: "proposed" | "withdrawn";
	/** The primary file the proposal touches. */
	path: string;
	/** The version fence: the expected version the proposal was made
	 *  against (never absent - a proposal without a fence is never
	 *  created; the refusal-to-guess). */
	version: string;
	/** The hook's own monotonic sequence (never a wall clock). */
	sequence: number;
	/** RENAME: the symbol's name as the graph knows it. */
	name?: string;
	/** RENAME: the new name. */
	to?: string;
	/** CONNECT: the source endpoint (`symbol` = the symbol name in the
	 *  file; absent for the file itself). */
	from?: { path: string; symbol?: string };
	/** CONNECT: the target endpoint. */
	target?: { path: string; symbol?: string };
	/** CONNECT: the proposed edge kind (the W1 graph's two kinds plus the
	 *  deferred reference kinds, which the graph may reject). */
	edge?: "contains" | "imports" | "references" | "calls" | "tests";
	/** REPLACE: the span to replace (1-based, inclusive). */
	span?: { startLine: number; endLine: number };
	/** REPLACE: the replacement content for the span. */
	content?: string;
}

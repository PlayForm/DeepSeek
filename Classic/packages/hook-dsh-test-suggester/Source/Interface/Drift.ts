// Drift - one reconciliation finding (Interface/Drift.ts): the file the drift
// names, the one-phrase reason the note carries, and the two counts.
//
// THE NUMBERS ARE PASS COUNTS (the note's contract): `expected` is what the
// smoke README claims for the entry, `actual` is what the aggregate runner
// would actually run for it (0 when it would run nothing). The GRAPH row is
// the documented exception - it counts NODES (1 claimed, 0 on disk), because
// the graph makes no PASS claim; SCHEME.md states the unit per drift kind.
//
// Read-only by construction: a Drift is a statement about two observations,
// never an instruction to write anything (the reconciliation never edits).
export default interface Drift {
	/** The repo-relative file the drift names (the README, the suite, the roster entry, the node). */
	file: string;
	/** The one-phrase reason the note carries. */
	reason: string;
	/** The PASS count the README claims (0 when it claims none). */
	expected: number;
	/** The PASS count the aggregate runner would run (0 when it runs nothing). */
	actual: number;
}

// The reconciliation's answer for one package: the drift list plus the two
// package totals the note header carries. An EMPTY drift list is the
// consistent tree - the documented abstention (silence with the clear line).
export interface Reconciliation {
	/** The package root, repo-relative (the note's `package=` segment). */
	package: string;
	/** The drifted files, sorted by path. */
	drifts: Drift[];
	/** The summed README counts over every counted folder. */
	expected: number;
	/** The summed README counts over the folders the aggregate runner will run. */
	actual: number;
	/** The graph's Test node count for the package (0 when the graph is absent or empty). */
	nodes: number;
}

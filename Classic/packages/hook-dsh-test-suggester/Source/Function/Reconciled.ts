// Reconciled - the reconciliation NOTE text (the delivery surface, the same
// `additionalContexts` notice the intents use; the message itself is built by
// Function/Note, so the source label and the freeze contract are shared).
//
// THE SHAPE (byte-exact, asserted by Source/Test/Reconciliation):
//
//   [test-suggester] reconciliation package=<pkg> drifts=<n> expected=<e> actual=<a>
//   - <file> - <reason> (expected <e>, actual <a>)
//   ...
//   note: <the caveat line>
//
// The header carries the PACKAGE totals (the summed README counts vs the
// summed counts the runner will actually run); every drift line carries its
// own pair. The text is bound to maxNoteChars exactly like the intent note
// (the same truncation with the ellipsis), so one knob governs both.
export default (
	/** The reconciliation result (Function/Reconcile). */
	Result: {
		package: string;
		drifts: { file: string; reason: string; expected: number; actual: number }[];
		expected: number;
		actual: number;
	},
	/** The hard character cap (config `maxNoteChars`, volatile). */
	MaxChars: number,
): string => {
	const Header = `[test-suggester] reconciliation package=${Result.package} drifts=${Result.drifts.length} expected=${Result.expected} actual=${Result.actual}`;
	const Lines = Result.drifts.map(
		(Drift) =>
			`- ${Drift.file} - ${Drift.reason} (expected ${Drift.expected}, actual ${Drift.actual})`,
	);
	const Note =
		"note: the smoke claims drifted from the tree; fix the README count, the suite file or the roster - Target/ is never edited.";
	const Full = `${Header}\n${[...Lines, Note].join("\n")}`;
	if (Full.length <= MaxChars) {
		return Full;
	}
	return `${Full.slice(0, MaxChars - 1)}...`;
};

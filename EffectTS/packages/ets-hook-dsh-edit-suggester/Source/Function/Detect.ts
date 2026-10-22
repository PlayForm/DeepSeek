// Detect - the deterministic path classifier: a pure function over
// (edit, pack) -> the ranked detections. The edit suggester's trigger shape
// is simpler than the search consumer's: the signal source is the EDITED
// PATH alone (plan section 3.3: write/edit calls are classified by the
// file_path only), so each family's rules are matched against the path and
// the matched weights sum into the evidence.
import type { Detection, EditView, Family } from "../Interface/Execution.js";

export default (
	/** The pack: the families in priority order. */
	Pack: Family[],
	/** The current edited call. */
	Edit: EditView,
): Detection[] => {
	const Detections: Detection[] = [];
	for (const Family of Pack) {
		const Evidence = Family.signals.reduce((Sum, Signal) => {
			const Pattern = new RegExp(Signal.pattern);
			return Sum + (Pattern.test(Edit.path) ? Signal.weight : 0);
		}, 0);
		if (Evidence === 0) {
			continue;
		}
		Detections.push({ family: Family, evidence: Evidence });
	}
	// Rank: the evidence first, ties broken by priority (lower wins).
	return Detections.sort(
		(Left, Right) =>
			Right.evidence - Left.evidence || Left.family.priority - Right.family.priority,
	);
};

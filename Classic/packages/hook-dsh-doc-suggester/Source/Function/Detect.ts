// Detect - the deterministic path classifier: a pure function over
// (docCall, pack) -> the ranked detections. The doc suggester's trigger
// shape is the doc path the call names (the read file_path, the grep
// path/include, the edited path), so each family's rules are matched against
// that path and the matched weights sum into the evidence.
import type { Detection, DocView, Family } from "../Interface/Execution.js";

export default (
	/** The pack: the families in priority order. */
	Pack: Family[],
	/** The current doc-task call. */
	Call: DocView,
): Detection[] => {
	const Detections: Detection[] = [];
	for (const Family of Pack) {
		const Evidence = Family.signals.reduce((Sum, Signal) => {
			const Pattern = new RegExp(Signal.pattern);
			return Sum + (Pattern.test(Call.path) ? Signal.weight : 0);
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

// Projected - the PROJECTED INDEX: the top graph paths for one intent, the
// list the sticky section renders in place of the static pack targets (the
// P2 re-spec: the section carries the projection, not the hand list).
//
// The rows are the intent's candidates measured against the graph
// (Function/Measure): a candidate the graph cannot prove is not in the
// index, a literal target contributes the concrete node path(s) it resolves
// to (a package-relative `Source/Variable/Config.ts` resolves once per
// package the graph indexed), and a glob contributes every matched path. The
// rows are ordered by the projected score (scope + literal), then by the
// pack's own order; the limit is the caller's (maxCandidates).
//
// `undefined` means the graph proved none of the intent's candidates: the
// caller falls back to the static pack list (the documented neutral
// behavior). The count is rendered only when a row aggregates several
// matched paths (the family-row convention of Function/Note).
import type { Intent } from "../Interface/Execution.js";
import type Projection from "../Interface/Projection.js";
import Measure from "./Measure.js";

/** One projected index row. */
export interface Row {
	/** The concrete graph path. */
	path: string;
	/** The pack candidate's reason phrase. */
	reason: string;
	/** The number of matched paths this row aggregates (omitted when 1). */
	count?: number;
}

/** The internal row with its ordering key. */
interface Scored {
	path: string;
	reason: string;
	count: number;
	score: number;
	order: number;
}

export default (
	/** The built projection (Function/Projection). */
	Projection: Projection,
	/** The intent whose index is projected. */
	Intent: Intent,
	/** The maximum rows (the caller's maxCandidates). */
	Limit: number,
): Row[] | undefined => {
	const Scored: Scored[] = [];
	Intent.targets.forEach((Target, Order) => {
		const Measured = Measure(Projection, Intent, Target);
		if (!Measured.exists) {
			return;
		}
		Measured.paths.forEach((Path, Index) => {
			Scored.push({
				path: Path,
				reason: Target.reason,
				count: Measured.count,
				// The first matched path of a target keeps the target's score;
				// the later ones trail it so the order stays deterministic.
				score: Measured.scope + Measured.literal - Index * 0.0001,
				order: Order,
			});
		});
	});
	if (Scored.length === 0) {
		return undefined;
	}
	// One row per concrete path: the best-scoring target wins the reason.
	const Best = new Map<string, Scored>();
	for (const Entry of Scored) {
		const Seen = Best.get(Entry.path);
		if (Seen === undefined || Entry.score > Seen.score) {
			Best.set(Entry.path, Entry);
		}
	}
	const Sorted = [...Best.values()].sort(
		(Left, Right) =>
			Right.score - Left.score ||
			Left.order - Right.order ||
			(Left.path < Right.path ? -1 : Left.path > Right.path ? 1 : 0),
	);
	return Sorted.slice(0, Math.max(0, Limit)).map((Entry) =>
		Entry.count > 1
			? { path: Entry.path, reason: Entry.reason, count: Entry.count }
			: { path: Entry.path, reason: Entry.reason },
	);
};

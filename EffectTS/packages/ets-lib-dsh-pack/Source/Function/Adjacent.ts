/**
 * @module Adjacent
 *
 * Folds the session history into the co-touch candidates for one path.
 *
 * @remarks
 * For every call that touched the anchor path, the calls that follow it within
 * the window contribute `1 / (1 + distance)` to the followed path's score and
 * one to its count, so a repeatedly co-touched path outranks a single one and a
 * near neighbour outranks a far one. The anchor itself is never a candidate.
 * Pure and deterministic - no I/O, no ordering surprises.
 */
import type Touch from "../Interface/Touch.js";

/**
 * The path normalized the same way the fold normalizes it.
 */
const Clean = (Value: string): string => Value.replaceAll("\\", "/").replace(/^\.\//, "");

/**
 * A candidate row: the followed path, how often it followed, and its score.
 */
export type Candidate = { readonly path: string; readonly count: number; readonly score: number };

export default (
	Touches: readonly Touch[],
	Path: string,
	Options?: { readonly window?: number; readonly limit?: number },
): readonly Candidate[] => {
	const Window = Options?.window ?? 8;
	const Limit = Options?.limit ?? 7;
	const Anchor = Clean(Path);
	const Scores = new Map<string, { count: number; score: number }>();
	for (const [Index, Touch] of Touches.entries()) {
		if (Touch.path !== Anchor) {
			continue;
		}
		for (let Step = 1; Step <= Window; Step++) {
			const Following = Touches[Index + Step];
			if (Following === undefined) {
				break;
			}
			if (Following.path === Anchor) {
				continue;
			}
			const Current = Scores.get(Following.path) ?? { count: 0, score: 0 };
			Current.count += 1;
			Current.score += 1 / (1 + Step);
			Scores.set(Following.path, Current);
		}
	}
	return [...Scores.entries()]
		.map(([Path_, Value]) => ({ path: Path_, count: Value.count, score: Value.score }))
		.sort(
			(Left, Right) =>
				Right.count - Left.count ||
				Right.score - Left.score ||
				Left.path.localeCompare(Right.path),
		)
		.slice(0, Limit);
};

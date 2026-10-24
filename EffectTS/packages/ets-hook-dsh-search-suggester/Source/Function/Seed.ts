// Seed - the P3 OFFLINE SEED: the deterministic warm start of the learned
// knowledge, applied at load with NO LLM and NO session history.
//
// The seed source (the only source):
//   * the BUILT-IN pack's canonical candidates - every target of the ten
//     search intents whose prior is 1.0 (the "canonical location" tier of
//     the plan's section 3.6), including a glob target such as the package
//     families; the illustrative `<...>` placeholders, the rows marked
//     `family: true` and the fallback tiers (prior 0.6/0.3) stay cold, so
//     the seed never promotes a fallback over a canonical row;
//   * the REPO'S OWN INDEX - the graph projection (Function/Projection): a
//     canonical candidate the graph proves is seeded twice, so a repo the
//     graph has indexed starts warmer than one it has not.
//
// The row is the ordinary KnowledgeRow with the `seed` marker set: count 1 /
// followed 1 (Laplace 2/3) unproven, count 2 / followed 2 (Laplace 3/4)
// proven. The online learning moves the same counters on top of it, so the
// seed is outvoted by real observations (the plan's section 6.1 discipline).
//
// The seed NEVER overwrites a row the knowledge already carries (a reloaded
// store stays the truth), it runs only when `learn` is on (a deterministic
// `learn: false` mount is the plan's section 6.4 cold start), and it does not
// SAVE: the existing Persist store persists it on the next real write (an
// emit, a follow, a dismissal), so the cold-start file stays absent until
// there is something to record.
import type { Intent, Knowledge } from "../Interface/Execution.js";
import type Projection from "../Interface/Projection.js";
import Measure from "./Measure.js";

export default (
	/** The loaded (or cold) knowledge, mutated in place. */
	Knowledge: Knowledge,
	/** The built-in pack's intents (the seed source). */
	Pack: Intent[],
	/** The graph projection when one was available at load. */
	Projection: Projection | undefined,
	/** The epoch-seconds timestamp recorded on every seeded row. */
	At: number,
): number => {
	let Seeded = 0;
	for (const Intent of Pack) {
		const Bucket = (Knowledge.intents[Intent.id] ??= {});
		for (const Target of Intent.targets) {
			// The canonical tier only: family aggregates and illustrative
			// placeholders are not rows, and a fallback never seeds.
			if (Target.family === true || Target.path.includes("<") || Target.prior < 1) {
				continue;
			}
			if (Bucket[Target.path] !== undefined) {
				continue;
			}
			const Proven = Projection !== undefined && Measure(Projection, Intent, Target).exists;
			Bucket[Target.path] = {
				count: Proven ? 2 : 1,
				followed: Proven ? 2 : 1,
				lastSeen: At,
				seed: true,
			};
			Seeded += 1;
		}
	}
	Knowledge.seed = true;
	Knowledge.seededAt = At;
	return Seeded;
};

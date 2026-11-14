import assert from "node:assert/strict";

import { SuggestStore } from "../../../Target/Library.js";
import { Check, Finish, MakeCounter } from "../Harness.js";

/**
 * @module Test
 *
 * One singular test of the suggester learning store.
 *
 * @remarks
 *
 * The test covers the store's contract over its own tiny state and probe: a
 * probe that answers undefined is the bounded memory fallback (the backend
 * reads "memory") and an unobserved rate answers the neutral 1/3, an accepted
 * outcome raises the candidate's confidence by the accept bonus, a rejected
 * one lowers it by the reject penalty, the clamp keeps the floor and the
 * ceiling from ever being crossed, a probe that answers the whole
 * Get/Put/Record contract flips the backend to "pattern" (the rate record is
 * seeded at the neutral rate and the service's own rows answer the read), and
 * two mounts in one process hold independent maps.
 *
 * The file runs standalone (`node Target/Test/SuggestStore/Test.js`) AND under
 * the aggregate (`Maintain/Run/Smokes/Index.mjs`). It is a unit smoke of
 * `@playform/lib-dsh-core`: the REAL built entry only.
 */
export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group: SuggestStore - the learning store (the probe and the bounded map, the caller's).
	{
		const Sub = "SuggestStore: the learning store (the probe and the bounded map, the caller's)";
		{
			Check(Count, Sub, () => {
				const Neutral = 1 / 3;
				const Table = (): string => "table";
				const Never = (): undefined => undefined;
				const Store = SuggestStore(Never, "core-suggester", 512, Table, () => 0);

				assert.equal(
					Store.Store(),
					"memory",
					"a probe that answers undefined is the memory fallback",
				);
				assert.equal(
					Store.Rate("History", "GUIDE.md").Companion,
					Neutral,
					"an unobserved companion rate answers the neutral 1/3",
				);
				assert.equal(
					Store.Rate("History", "GUIDE.md").Family,
					Neutral,
					"an unobserved family rate answers the neutral 1/3 too",
				);

				Store.Move("History", ["GUIDE.md"], "accepted");
				assert.equal(
					Store.Rate("History", "GUIDE.md").Companion,
					Neutral + 0.1,
					"an accepted outcome raises the candidate's confidence by the accept bonus",
				);
				assert.equal(
					Store.Rate("History", "GUIDE.md").Family,
					Neutral + 0.1,
					"the family's row moves with the outcome",
				);

				Store.Move("History", ["GUIDE.md"], "rejected");
				assert.equal(
					Store.Rate("History", "GUIDE.md").Companion,
					Neutral + 0.1 - 0.2,
					"a rejected outcome lowers the candidate's confidence by the reject penalty",
				);

				for (let Index = 0; Index < 8; Index++) {
					Store.Move("History", ["GUIDE.md"], "rejected");
				}
				assert.equal(
					Store.Rate("History", "GUIDE.md").Companion,
					0,
					"the floor is never crossed: repeated rejections stop at zero",
				);
				assert.equal(
					Store.Rate("History", "GUIDE.md").Family,
					0,
					"the family's row clamps at the floor too",
				);

				for (let Index = 0; Index < 12; Index++) {
					Store.Move("History", ["GUIDE.md"], "accepted");
				}
				assert.equal(
					Store.Rate("History", "GUIDE.md").Companion,
					1,
					"the ceiling is never crossed either: repeated accepts stop at one",
				);

				const Second = SuggestStore(Never, "core-suggester", 512, Table, () => 0);
				Second.Move("History", ["GUIDE.md"], "accepted");
				assert.equal(
					Store.Rate("History", "GUIDE.md").Companion,
					1,
					"a second mount leaves the first mount's rows untouched",
				);
				assert.equal(
					Second.Rate("History", "GUIDE.md").Companion,
					Neutral + 0.1,
					"a second mount starts neutral: the maps are per factory call",
				);

				const Pattern = SuggestStore(
					() => ({
						Get: () => undefined,
						Put: () => undefined,
						Record: () => undefined,
					}),
					"core-suggester",
					512,
					Table,
					() => 0,
				);
				assert.equal(
					Pattern.Store(),
					"pattern",
					"a probe that answers the whole Get/Put/Record contract is the pattern backend",
				);
				Pattern.Move("History", ["GUIDE.md"], "accepted");
				assert.equal(
					Pattern.Rate("History", "GUIDE.md").Companion,
					Neutral,
					"the service's absent rows answer the neutral rate: the record is seeded, the service owns the move",
				);
			});
		}
	}
	return Finish(Count, "SuggestStore");
};

// Standalone entry: `node Target/Test/SuggestStore/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - SuggestStore`);
}

import assert from "node:assert/strict";

import { SuggestRing } from "../../../Target/Library.js";
import { Check, Finish, MakeCounter } from "../Harness.js";

/**
 * @module Test
 *
 * One singular test of the suggester ring.
 *
 * @remarks
 *
 * The test covers the ring's contract over the caller's own state and
 * predicate: one state per agent key with one shared default key, Touch
 * recording the path and the call count, Mark cooling a family and keeping
 * the dedupe key, Tick aging every cooling family by one judged call and
 * dropping the entries whose age passes the window, the open note's
 * follow-through (Follow answers only when the judged path names a
 * companion) and its aging verdict (Age closes the note at the window), and
 * Reset clearing the ring back to its fresh shape.
 *
 * The file runs standalone (`node Target/Test/SuggestRing/Test.js`) AND under
 * the aggregate (`Maintain/Run/Smokes/Index.mjs`). It is a unit smoke of
 * `@playform/lib-dsh-core`: the REAL built entry only.
 */
export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group: SuggestRing - the per-agent ring (keyed per agent, the caller's state and predicate).
	{
		const Sub = "SuggestRing: the per-agent ring (keyed per agent, the caller's state and predicate)";
		{
			Check(Count, Sub, () => {
				interface Note {
					family: string;
					companions: string[];
					since: number;
				}
				interface State {
					touched: Set<string>;
					cooled: Map<string, number>;
					cooledNoted: Set<string>;
					notes: number;
					calls: number;
					pending?: Note | undefined;
				}
				const Fresh = (): State => ({
					touched: new Set(),
					cooled: new Map(),
					cooledNoted: new Set(),
					notes: 0,
					calls: 0,
				});
				const Match = (Path: string, Companion: string): boolean => Path === Companion;
				const Ring = SuggestRing(Fresh, Match);

				const Agent = {};
				const One = Ring.State(Agent);
				assert.equal(Ring.State(Agent), One, "the same agent returns the same state");
				assert.notEqual(Ring.State({}), One, "distinct agents hold distinct states");
				assert.equal(
					Ring.State(null),
					Ring.State(undefined),
					"every no-agent call shares one default state",
				);

				Ring.Touch(One, "README.md");
				assert.ok(One.touched.has("README.md"), "Touch records the judged path");
				assert.equal(One.calls, 1, "Touch increments the call count");

				Ring.Mark(One, "History", "History:README.md");
				assert.equal(One.cooled.get("History"), 0, "Mark cools the family at age zero");
				assert.ok(One.cooledNoted.has("History:README.md"), "Mark keeps the dedupe key");
				assert.equal(One.notes, 1, "Mark moves the note count");

				Ring.Mark(One, "Replay", "Replay:README.md");
				Ring.Tick(One, 2);
				assert.deepEqual(
					[...One.cooled.entries()],
					[
						["History", 1],
						["Replay", 1],
					],
					"Tick ages every cooling family by one judged call",
				);
				Ring.Tick(One, 2);
				assert.deepEqual(
					[...One.cooled.entries()],
					[
						["History", 2],
						["Replay", 2],
					],
					"Tick keeps the families still inside the window",
				);
				Ring.Tick(One, 2);
				assert.equal(One.cooled.size, 0, "Tick drops the entries whose age passes the window");

				Ring.Open(One, "History", ["GUIDE.md"]);
				assert.deepEqual(
					One.pending,
					{ family: "History", companions: ["GUIDE.md"], since: 0 },
					"Open stores the open note",
				);
				assert.equal(Ring.Follow(One, "SCHEME.md"), undefined, "a path outside the companions is no follow");
				assert.ok(One.pending !== undefined, "a missed follow keeps the note open");
				assert.deepEqual(
					Ring.Follow(One, "GUIDE.md"),
					{ family: "History", companions: ["GUIDE.md"], companion: "GUIDE.md" },
					"a companion named by the judged path is a follow",
				);
				assert.equal(One.pending, undefined, "a follow closes the open note");

				Ring.Open(One, "History", ["GUIDE.md"]);
				assert.equal(Ring.Age(One, 2), undefined, "an open note inside the window stays open");
				assert.ok(One.pending !== undefined, "an aged note inside the window is not closed");
				assert.deepEqual(
					Ring.Age(One, 2),
					{ family: "History", companions: ["GUIDE.md"] },
					"Age closes the note when its age reaches the window",
				);
				assert.equal(One.pending, undefined, "a closed note is forgotten");

				Ring.Touch(One, "GUIDE.md");
				Ring.Mark(One, "History", "History:GUIDE.md");
				Ring.Reset(One);
				assert.equal(One.touched.size, 0, "Reset clears the touched paths");
				assert.equal(One.cooled.size, 0, "Reset clears the cooldowns");
				assert.equal(One.cooledNoted.size, 0, "Reset clears the dedupe keys");
				assert.equal(One.notes, 0, "Reset clears the note count");
				assert.equal(One.calls, 0, "Reset clears the call count");
				assert.equal(One.pending, undefined, "Reset forgets an open note without a verdict");
			});
		}
	}
	return Finish(Count, "SuggestRing");
};

// Standalone entry: `node Target/Test/SuggestRing/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - SuggestRing`);
}

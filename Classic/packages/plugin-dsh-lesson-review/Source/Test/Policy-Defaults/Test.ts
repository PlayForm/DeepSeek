// Source/Test/Policy-Defaults/Test.ts - THE POLICY BLOCK (D6) and the knob
// contract on the lesson-review service.
//
// `write: approve` is the single most important default in this package: it is
// what makes the review a PROPOSER rather than an autonomous editor. The block's
// eight verdicts, the schema's fill, the bare-construction fallback and the
// fail-loud knob checks are all pinned here.
import assert from "node:assert/strict";

import { Check, Finish, LessonService, Make, MakeCounter } from "../Harness.js";

/** The D6 defaults, written out (the contract, not a mirror). */
const Defaults = {
	read: "auto",
	index: "auto",
	record: "auto",
	suggest: "auto",
	write: "approve",
	commit: "approve",
	spawn: "approve",
	message: "auto",
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	Check(Count, "P1: the schema fills the D6 policy defaults", () => {
		const Config = (LessonService as any).Config({});
		assert.deepEqual(Config.policy.get(), Defaults, "the composed block carries the defaults");
	});

	Check(Count, "P2: a bare construction carries the D6 block in the knobs", () => {
		const Run = Make();
		assert.deepEqual((Run.Service as any).Knobs.policy, Defaults, "the bare default is the D6 table");
	});

	Check(Count, "P3: a partial policy override merges over the defaults", () => {
		const Run = Make({ policy: { write: "auto" } });
		assert.deepEqual(
			(Run.Service as any).Knobs.policy,
			{ ...Defaults, write: "auto" },
			"the override replaces one verdict and keeps the rest",
		);
	});

	Check(Count, "P4: the shipped posture is PROPOSE (write stays approve)", () => {
		const Run = Make();
		assert.equal((Run.Service as any).Knobs.policy.write, "approve", "a review never writes unasked");
		assert.equal((Run.Service as any).Knobs.policy.suggest, "auto", "but it may always suggest");
	});

	Check(Count, "P5: the schema's own defaults are the idle-forever posture", () => {
		const Config = (LessonService as any).Config({});
		assert.equal(Config.enabled.get(), false, "a loaded plugin ships disabled");
		assert.equal(Config.intervalTurns.get(), 10, "the nudge interval is ten turns");
		assert.equal(Config.staleAfterDays.get(), 14, "the stale line is fourteen days");
		assert.equal(Config.archiveAfterDays.get(), 30, "the archive line is thirty");
		assert.equal(Config.consolidate.get(), false, "the LLM consolidation pass is opt-in");
	});

	Check(Count, "P6: a reversed stale/archive pair throws AT LOAD", () => {
		assert.throws(
			() => Make({ staleAfterDays: 30, archiveAfterDays: 10 }),
			/archiveAfterDays must be >= staleAfterDays/,
			"a reversed pair would archive the moment it stales",
		);
	});

	Check(Count, "P7: a bad domain name throws AT LOAD", () => {
		assert.throws(
			() => Make({ domain: "Lesson Review" }),
			/domain must be a lowercase unit name/,
			"the store's name is validated where it is cheap",
		);
	});

	Check(Count, "P8: a non-finite numeric knob falls back to its default", () => {
		const Run = Make({ intervalTurns: Number.NaN, digestTail: "nonsense" });
		assert.equal((Run.Service as any).Knobs.intervalTurns, 10, "NaN is not a cadence");
		assert.equal((Run.Service as any).Knobs.digestTail, 24, "a string is not a tail");
	});

	Check(Count, "P9: the digest tail below two is refused", () => {
		assert.throws(
			() => Make({ digestTail: 1 }),
			/digestTail must be >= 2/,
			"a one-message digest is no digest",
		);
	});

	return Finish(Count, "Policy-Defaults");
};

// Standalone entry: `node Target/Test/Policy-Defaults/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Policy-Defaults`);
}

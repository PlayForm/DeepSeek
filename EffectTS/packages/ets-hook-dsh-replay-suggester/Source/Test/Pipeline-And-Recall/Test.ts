// Source/Test/Pipeline-And-Recall/Test.ts - the pipeline against the seeded
// history store: the Repeat intent fires ONLY through the recalled record
// (the lift crosses the gate), the recalled candidates and the verification
// caveat, the longest-probe rule, the candidate cap, the exclusion, the
// gate (cooldown, cap + the pre-step reset), the silence without a record,
// the block decision, the volatile flip, and the fs purity.
import assert from "node:assert/strict";
import {
	Call,
	Check,
	CheckAsync,
	Finish,
	LedgerWith,
	LinesWith,
	MakeCounter,
	PreStep,
	Flip,
	Setup,
	Volatile,
	WriteStore,
	rmStore,
} from "../Harness.js";

/** One valid history record. */
const Rec = (Probe: string, Files: string[], Verify = "pnpm test"): unknown => ({
	intent: "Repeat",
	probe: Probe,
	files: Files,
	verify: Verify,
	at: 1700000000,
});

/** The full-evidence Repeat probe: search + literal + context shapes. */
const REPEAT_ARGS = { file_path: "src/Core.ts", pattern: "export function", glob: "**/*.ts" };
const REPEAT_PROBE_SUB = "src/Core.ts";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group R1: the recall fires the Repeat intent.
	{
		rmStore();
		WriteStore([Rec(REPEAT_PROBE_SUB, ["src/Core.ts", "src/Use.ts"], "pnpm test")]);
		const Run = Setup();
		const Result = await Call(Run, "read", REPEAT_ARGS);
		Check(Count, "R1: the suggest line is byte-exact (logger and durable ledger)", () => {
			assert.deepEqual(LinesWith(Run, "candidates call"), [
				"replay-suggester: suggest Repeat 0.77 2 candidates call read",
			]);
			assert.equal(LedgerWith("suggest Repeat 0.77 2 candidates call read").length, 1);
		});
		await CheckAsync(Count, "R1: the note carries the recalled files and the verification", async () => {
			const Note = Result.additionalContexts[0];
			assert.deepEqual(Note.source, {
				kind: "replay-suggester",
				form: "notice",
				summary: "Repeat 0.77",
			});
			assert.equal(
				Note.content[0].text,
				"[replay-suggester] intent=Repeat confidence=0.77\ntargets (2):\n- src/Core.ts - touched last time (Repeat)\n- src/Use.ts - touched last time (Repeat)\nnote: last time verified with pnpm test",
			);
		});
	}

	// Group R2: the longest probe wins; the cap and the exclusion apply.
	{
		rmStore();
		WriteStore([
			Rec(REPEAT_PROBE_SUB, ["src/Short.ts"]),
			Rec('"file_path":"src/Core.ts","pattern"', ["src/Deep1.ts", "src/Deep2.ts"]),
		]);
		const Run = Setup();
		const Result = await Call(Run, "read", { ...REPEAT_ARGS, flag: true });
		Check(Count, "R2: the longest matching probe supplies the candidates", () => {
			assert.deepEqual(LinesWith(Run, "candidates call"), [
				"replay-suggester: suggest Repeat 0.77 2 candidates call read",
			]);
			assert.ok(Result.additionalContexts[0].content[0].text.includes("- src/Deep1.ts"));
		});
		rmStore();
		WriteStore([
			Rec(REPEAT_PROBE_SUB, ["src/A.ts", "src/B.ts", "src/C.ts"]),
		]);
		const Capped = Setup({ maxCandidates: 1 });
		const CappedResult = await Call(Capped, "read", REPEAT_ARGS);
		Check(Count, "R2: the recalled files are capped at maxCandidates", () => {
			assert.deepEqual(LinesWith(Capped, "candidates call"), [
				"replay-suggester: suggest Repeat 0.77 1 candidates call read",
			]);
			assert.ok(CappedResult.additionalContexts[0].content[0].text.includes("- src/A.ts"));
		});
		rmStore();
		WriteStore([Rec(REPEAT_PROBE_SUB, ["node_modules/pkg.ts"])]);
		const Excluded = Setup();
		await Call(Excluded, "read", REPEAT_ARGS);
		Check(Count, "R2: a fully excluded recall abstains as ambiguous", () => {
			assert.deepEqual(LinesWith(Excluded, "abstained"), [
				"replay-suggester: abstained ambiguous Repeat 0.77",
			]);
		});
	}

	// Group R3: the gate and the reset.
	{
		const Agent = { agent: { id: "agent-a" } };
		rmStore();
		WriteStore([Rec(REPEAT_PROBE_SUB, ["src/Core.ts"])]);
		const Run = Setup();
		await Call(Run, "read", REPEAT_ARGS, Agent);
		await Call(Run, "read", REPEAT_ARGS, Agent);
		Check(Count, "R3: a repeat within the cooldown is suppressed with the byte-exact line", () => {
			assert.deepEqual(LinesWith(Run, "suppressed"), [
				"replay-suggester: suppressed cooldown Repeat",
			]);
			assert.equal(LinesWith(Run, "candidates call").length, 1);
		});
		rmStore();
		WriteStore([Rec(REPEAT_PROBE_SUB, ["src/Core.ts"])]);
		const Capped = Setup({ cooldownCalls: 0, maxNotesPerTurn: 1 });
		await Call(Capped, "read", REPEAT_ARGS, Agent);
		await Call(Capped, "read", REPEAT_ARGS, Agent);
		Check(Count, "R3: a note beyond the per-turn cap is suppressed", () => {
			assert.deepEqual(LinesWith(Capped, "suppressed"), [
				"replay-suggester: suppressed cap Repeat",
			]);
		});
		await PreStep(Capped, Agent);
		await Call(Capped, "read", REPEAT_ARGS, Agent);
		Check(Count, "R3: a user turn resets the per-turn counter and the note emits again", () => {
			assert.equal(LinesWith(Capped, "candidates call").length, 2);
		});
	}

	// Group R4: the silence without a record (the designed abstention).
	{
		rmStore();
		WriteStore([Rec("src/Unrelated.ts", ["src/Unrelated.ts"])]);
		const Run = Setup();
		const Decision = { kind: "allow" };
		const Result = await Call(Run, "read", REPEAT_ARGS, undefined, Decision);
		Check(Count, "R4: without a recalled record the hook stays silent", () => {
			assert.equal(Result, Decision);
			assert.equal(LinesWith(Run, "candidates call").length, 0);
			assert.equal(LinesWith(Run, "abstained").length, 0);
			assert.equal(LinesWith(Run, "suppressed").length, 0);
		});
	}

	// Group R5: the block decision and the empty-verification caveat.
	{
		rmStore();
		WriteStore([Rec(REPEAT_PROBE_SUB, ["src/Core.ts"], "")]);
		const Run = Setup();
		const Downstream = { kind: "block", feedback: "no", additionalContexts: [{ marker: "x" }] };
		const Result = await Call(Run, "read", REPEAT_ARGS, undefined, Downstream);
		Check(Count, "R5: a block decision keeps its feedback and prepends the note", () => {
			assert.equal(Result.kind, "block");
			assert.equal(Result.feedback, "no");
			assert.equal(Result.additionalContexts.length, 2);
			assert.equal(Result.additionalContexts[0].source.kind, "replay-suggester");
			assert.equal(Result.additionalContexts[1], Downstream.additionalContexts[0]);
		});
		Check(Count, "R5: an empty verification falls back to the pack caveat", () => {
			assert.ok(
				Result.additionalContexts[0].content[0].text.endsWith(
					"note: the recall is the answer; without a record the hook abstains.",
				),
			);
		});
	}

	// Group R6: the volatile flip.
	{
		rmStore();
		WriteStore([Rec(REPEAT_PROBE_SUB, ["src/Core.ts"])]);
		const Run = Setup();
		Flip(Volatile(Run, "enabled"), false);
		Run.CtxListeners["loader/volatile-update"]([["enabled"]]);
		const Result = await Call(Run, "read", REPEAT_ARGS);
		Check(Count, "R6: after the flip every call passes through unchanged", () => {
			assert.equal(Run.State.On, false);
			assert.equal(LinesWith(Run, "candidates call").length, 0);
			assert.equal(Result.kind, "allow");
		});
	}

	// Group R7: the fs purity.
	{
		rmStore();
		WriteStore([Rec(REPEAT_PROBE_SUB, ["src/Core.ts"])]);
		const Run = Setup();
		await Call(Run, "read", REPEAT_ARGS);
		Check(Count, "R7: the history store is read with node:fs, NEVER through ctx.fs", () => {
			assert.equal(Run.Fs.reads.length, 0);
			assert.equal(Run.Fs.writes.length, 0);
			assert.equal(Run.Fs.resolved.length, 0);
			assert.equal(Run.Fs.stats.length, 0);
		});
	}
	return Finish(Count, "Pipeline-And-Recall");
};

// Standalone entry: `node Target/Test/Pipeline-And-Recall/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Pipeline-And-Recall`);
}

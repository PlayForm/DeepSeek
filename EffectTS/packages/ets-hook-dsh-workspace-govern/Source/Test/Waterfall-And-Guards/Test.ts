// Source/Test/Waterfall-And-Guards/Test.ts - the waterfall discipline and the
// guards: next() first with the downstream decision returned unchanged on
// pass, the deny and ask envelopes, the synthesized proposal from a plain
// tool call, the excluded-target silence, the own-actor exemption, the
// recursion guard with its byte-exact loop line, the outcome observer with
// its byte-exact observed lines, and the fail-open containment.
import assert from "node:assert/strict";
import {
	Check,
	CheckAsync,
	Exec,
	Finish,
	Ledger,
	LedgerWith,
	LinesWith,
	MakeCounter,
	Make,
	Next,
	Proposal,
	rm,
	Validate,
} from "../Harness.js";

/** A standard enabled mount with overrides. */
const Setup = (Config: Record<string, unknown> = {}): any => {
	rm();
	return Make(Validate({ logFile: Ledger, enabled: true, ...Config }));
};

/** Drive one folder's checks. */
export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group W1: the pass envelope.
	{
		const Run = Setup();
		const pre = Run.CtxListeners["tools/pre-execute"];
		const post = Run.CtxListeners["tools/post-execute"];
		const Downstream = Next();
		await CheckAsync(Count, "W1: next() runs first and the pass returns the downstream decision unchanged", async () => {
			const Decision = await pre(Exec(), Downstream.next);
			assert.equal(Decision, Downstream.decision);
		});
		await CheckAsync(Count, "W1: a passing gate emits the byte-exact passed and observed lines", async () => {
			await pre(
				Exec({ callId: "c2", arguments: { proposal: Proposal({ operation: "op:w1" }) } }),
				Next().next,
			);
			await post(Exec({ callId: "c2" }), { success: true }, Next().next);
			assert.deepEqual(LinesWith(Run, "op:w1"), [
				"govern: passed op:w1 (write /repo/src/a.ts)",
			]);
			assert.equal(LedgerWith("passed op:w1 (write /repo/src/a.ts)").length, 1);
		});
	}

	// Group W2: the deny and ask envelopes.
	{
		const Run = Setup();
		await CheckAsync(Count, "W2: a denial returns the deny envelope with the govern-prefixed reason", async () => {
			const Decision = await Run.CtxListeners["tools/pre-execute"](
				Exec({ callId: "c3", arguments: { proposal: Proposal({ contribution: "" }) } }),
				Next().next,
			);
			assert.deepEqual(Decision, { kind: "deny", reason: "govern: contributes" });
		});
		await CheckAsync(Count, "W2: an escalation returns the ask envelope", async () => {
			Run.State.PolicyRules = [{ kind: "*", decision: "escalate" }];
			const Decision = await Run.CtxListeners["tools/pre-execute"](
				Exec({ callId: "c4", arguments: { proposal: Proposal({ operation: "op:w4" }) } }),
				Next().next,
			);
			assert.deepEqual(Decision, { kind: "ask", reason: "govern: policy: *" });
			assert.deepEqual(LinesWith(Run, "escalated"), [
				"govern: escalated op:w4 (approval required)",
			]);
		});
	}

	// Group W3: the synthesized proposal from a plain call.
	{
		const Run = Setup();
		const Downstream = Next();
		await CheckAsync(Count, "W3: a plain tool call synthesizes a proposal and passes", async () => {
			const Decision = await Run.CtxListeners["tools/pre-execute"](
				Exec({ name: "edit", callId: "c5" }),
				Downstream.next,
			);
			assert.equal(Decision, Downstream.decision);
			assert.deepEqual(LinesWith(Run, "passed"), [
				"govern: passed op:c5 (edit /repo/src/a.ts)",
			]);
		});
	}

	// Group W4: the excluded-target silence and the own-actor exemption.
	{
		const Run = Setup();
		await CheckAsync(Count, "W4: an excluded target passes through in silence", async () => {
			const Downstream = Next();
			const Decision = await Run.CtxListeners["tools/pre-execute"](
				Exec({ callId: "c6", arguments: { path: "/repo/Target/out/x.ts" } }),
				Downstream.next,
			);
			assert.equal(Decision, Downstream.decision);
			assert.deepEqual(LinesWith(Run, "passed").length, 0);
			assert.deepEqual(LinesWith(Run, "denied").length, 0);
		});
		await CheckAsync(Count, "W4: the hook's own activity is never gated", async () => {
			const Downstream = Next();
			const Decision = await Run.CtxListeners["tools/pre-execute"](
				Exec({ agent: Run.State.Self, callId: "c7" }),
				Downstream.next,
			);
			assert.equal(Decision, Downstream.decision);
			assert.deepEqual(LinesWith(Run, "op:c7").length, 0);
		});
	}

	// Group W5: the recursion guard.
	{
		const Run = Setup({ loopBound: 2 });
		for (const Call of ["c8", "c8", "c8", "c8"]) {
			await Run.CtxListeners["tools/pre-execute"](
				Exec({ callId: Call, arguments: { proposal: Proposal({ operation: "op:loop" }) } }),
				Next().next,
			);
		}
		Check(Count, "W5: an operation gated beyond the loop bound is dropped with the byte-exact line", () => {
			assert.deepEqual(LinesWith(Run, "(recursion guard)"), [
				"govern: loop op:loop (recursion guard)",
				"govern: loop op:loop (recursion guard)",
			]);
			assert.equal(LedgerWith("(recursion guard)").length, 2);
			assert.equal(LinesWith(Run, "passed").length, 2);
		});
	}

	// Group W6: the outcome observer.
	{
		const Run = Setup();
		await Run.CtxListeners["tools/post-execute"](
			Exec({ callId: "c9" }),
			{ success: true },
			Next().next,
		);
		await Run.CtxListeners["tools/post-execute"](
			Exec({ callId: "c10" }),
			{ success: false },
			Next().next,
		);
		Check(Count, "W6: the observer records accepted and errored outcomes byte-exactly", () => {
			assert.deepEqual(LinesWith(Run, "observed"), [
				"govern: observed op:c9 (accepted)",
				"govern: observed op:c10 (errored)",
			]);
			assert.equal(LedgerWith("observed op:c9 (accepted)").length, 1);
		});
	}

	// Group W7: the fail-open containment.
	{
		const Run = Setup();
		Run.State.Tools = null;
		const Downstream = Next();
		const Decision = await Run.CtxListeners["tools/pre-execute"](
			Exec({ callId: "c11" }),
			Downstream.next,
		);
		Check(Count, "W7: a gate error never breaks a dispatch (fail-open with a warn line)", () => {
			assert.equal(Decision, Downstream.decision);
			assert.equal(Run.Warns.length, 1);
			assert.match(Run.Warns[0] as string, /^govern: /);
			assert.match(Run.Warns[0] as string, /; the dispatch passes through$/);
		});
	}
	return Finish(Count, "Waterfall-And-Guards");
};

// Standalone entry: `node Target/Test/Waterfall-And-Guards/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Waterfall-And-Guards`);
}

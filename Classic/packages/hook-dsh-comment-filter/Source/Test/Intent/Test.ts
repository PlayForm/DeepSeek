// Source/Test/Intent/Test.ts - one singular test: the INTENT GATE - the
// agent/pre-step stash (the observer returns the downstream decision
// unchanged) and the per-task gate it feeds: a task ABOUT comments leaves the
// read result untouched, a normal task strips it, the stash is PER AGENT, a
// call with no agent identity falls back to the global text, a step with no
// user message keeps the previous intent, `intent: false` always strips,
// `enabled: false` never strips, and a filter switched off still records its
// ACTIVATION line in the ledger (the switch maps onto `State.Active`, never
// onto the factory's ledger gate). Runs standalone (`node Target/Test/Intent/Test.js`) AND under the aggregate
// (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/hook-dsh-comment-filter: the fake ctx + the REAL
// factory + the REAL comment-filter apply, from the Harness.
import assert from "node:assert/strict";

import { Check, Finish, Ledger, Make, MakeCounter, Rm, Validate } from "../Harness.js";

/** The read tool's model-facing envelope (the harness contract, byte-exact). */
const Envelope = (Path: string, Body: string): string =>
	`<path>${Path}</path>\n<type>file</type>\n<content>\n${Body}\n</content>`;

/** A numbered body: the numbered lines, the blank separator, the footer. */
const Body = (Lines: string[], Footer: string): string => [...Lines, "", Footer].join("\n");

/** The omission notice line (module-owned, byte-exact). */
const Omission =
	"(Comments omitted. Use grep to inspect them, or ask the user to include comments.)";

/** A settled tool result whose only content is one text block. */
const Outcome = (Value: string) => ({ isError: false, value: {}, content: [{ type: "text", text: Value }] });

/** One agent/pre-step payload carrying one user message. */
const Step = (Agent: unknown, Text: string) => ({
	agent: Agent,
	messages: [{ role: "user", content: [{ type: "text", text: Text }] }],
	turn: 1,
	step: 0,
	signal: new AbortController().signal,
});

/** One tool execution identity (the agent field is optional, like the harness's). */
const Exec = (Name: string, Agent?: unknown) => ({
	callId: "call_smoke",
	name: Name,
	arguments: {},
	signal: new AbortController().signal,
	...(Agent === undefined ? {} : { agent: Agent }),
});

/** The downstream accept decision every post-execute case hands in. */
const Accept = async () => ({ kind: "accept" });

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: I - the intent stash and the per-task gate. One apply with the
	// REAL schema defaults; two fake agent identities (plain objects stand in
	// for the harness's Agent instances - the Map keys by identity).
	Rm();
	{
		const RunI = Make(Validate({ logFile: Ledger }));
		const PostI = RunI.Listeners["tools/post-execute"];
		const PreI = RunI.Listeners["agent/pre-step"];
		const AgentA = { id: "agent-a" };
		const AgentB = { id: "agent-b" };
		const Source = Envelope(
			"/tmp/demo.ts",
			Body(["1: // comment", "2: const a = 1;"], "(End of file - total 2 lines)"),
		);
		const Stripped = Envelope(
			"/tmp/demo.ts",
			Body(["1: ", "2: const a = 1;"], "(End of file - total 2 lines)") + "\n" + Omission,
		);
		// I0: registration.
		{
			const Sub = "intent: the agent/pre-step arm is registered";
			Check(Count, Sub, () => {
				assert.ok(typeof PreI === "function");
			});
		}
		// I1: the observer contract - the downstream decision comes back
		// UNCHANGED (and the step's user text is stashed as A's intent).
		{
			const Decision = { kind: "enter", messages: [] };
			const Out = await PreI(
				Step(AgentA, "Please explain the comments in the parser"),
				async () => Decision,
			);
			const Sub = "intent: the pre-step listener returns the downstream decision unchanged";
			Check(Count, Sub, () => {
				assert.ok(Out === Decision);
			});
		}
		// I2: a task ABOUT comments leaves the read result untouched.
		{
			const LinesBefore = RunI.Lines.length;
			const Out = await PostI(Exec("read", AgentA), Outcome(Source), Accept);
			const Sub = "intent: a task ABOUT comments leaves the read result untouched";
			Check(Count, Sub, () => {
				assert.ok(Out.kind === "accept" && !("content" in Out));
				assert.ok(RunI.Lines.length === LinesBefore);
			});
		}
		// I3: a normal task strips the read result.
		{
			await PreI(Step(AgentA, "Refactor the parser"), async () => ({ kind: "enter", messages: [] }));
			const Out = await PostI(Exec("read", AgentA), Outcome(Source), Accept);
			const Sub = "intent: a normal task strips the read result";
			Check(Count, Sub, () => {
				assert.equal(Out.content[0].text, Stripped);
			});
		}
		// I4: the stash is PER AGENT - B's comment task leaves B's read alone.
		{
			await PreI(Step(AgentB, "Show me the docstrings"), async () => ({ kind: "enter", messages: [] }));
			const Out = await PostI(Exec("read", AgentB), Outcome(Source), Accept);
			const Sub = "intent: the stash is PER AGENT (B's comment task leaves B untouched)";
			Check(Count, Sub, () => {
				assert.ok(Out.kind === "accept" && !("content" in Out));
			});
		}
		// I5: ... and A's normal task still strips (the isolation cut both ways).
		{
			const Out = await PostI(Exec("read", AgentA), Outcome(Source), Accept);
			const Sub = "intent: A still strips after B's comment task (per-agent isolation)";
			Check(Count, Sub, () => {
				assert.equal(Out.content[0].text, Stripped);
			});
		}
		// I6: a call with NO agent identity uses the global fallback (the last
		// text seen by any agent).
		{
			await PreI(Step(AgentA, "Fix the off-by-one bug"), async () => ({ kind: "enter", messages: [] }));
			const Out = await PostI(Exec("read"), Outcome(Source), Accept);
			const Sub = "intent: a call with no agent identity uses the global fallback";
			Check(Count, Sub, () => {
				assert.equal(Out.content[0].text, Stripped);
			});
		}
		// I7: a step with NO user message keeps the previous intent (a later
		// step of the same task carries tool results/assistant text only).
		{
			await PreI(Step(AgentA, "Explain the comments"), async () => ({ kind: "enter", messages: [] }));
			await PreI(
				{
					agent: AgentA,
					messages: [{ role: "assistant", content: [{ type: "text", text: "ok" }] }],
					turn: 1,
					step: 1,
					signal: new AbortController().signal,
				},
				async () => ({ kind: "enter", messages: [] }),
			);
			const Out = await PostI(Exec("read", AgentA), Outcome(Source), Accept);
			const Sub = "intent: a step with no user message keeps the previous intent";
			Check(Count, Sub, () => {
				assert.ok(Out.kind === "accept" && !("content" in Out));
			});
		}
		// I8: a non-target tool passes regardless of the intent.
		{
			await PreI(Step(AgentA, "Refactor the parser"), async () => ({ kind: "enter", messages: [] }));
			const LinesBefore = RunI.Lines.length;
			const Out = await PostI(Exec("grep", AgentA), Outcome(Source), Accept);
			const Sub = "intent: a non-target tool passes by identity";
			Check(Count, Sub, () => {
				assert.ok(Out.kind === "accept" && !("content" in Out));
				assert.ok(RunI.Lines.length === LinesBefore);
			});
		}
	}
	// Group: I9 - `intent: false` always strips (the blunt mode), even after a
	// task ABOUT comments.
	{
		const RunOff = Make(Validate({ logFile: Ledger, intent: false }));
		const Agent = { id: "agent-blunt" };
		await RunOff.Listeners["agent/pre-step"](
			Step(Agent, "Please explain the comments in the parser"),
			async () => ({ kind: "enter", messages: [] }),
		);
		const Source = Envelope(
			"/tmp/blunt.ts",
			Body(["1: // comment", "2: const a = 1;"], "(End of file - total 2 lines)"),
		);
		const Out = await RunOff.Listeners["tools/post-execute"](
			Exec("read", Agent),
			Outcome(Source),
			Accept,
		);
		const Sub = "intent: intent off always strips (the blunt mode)";
		Check(Count, Sub, () => {
			assert.ok(Out.kind === "accept" && Out.content[0].text.includes("1: \n2: const a = 1;"));
		});
	}
	// Group: I10 - `enabled: false` never strips and writes no ledger line.
	{
		const RunDisabled = Make(Validate({ logFile: Ledger, enabled: false }));
		const LinesBefore = RunDisabled.Lines.length;
		const Source = Envelope(
			"/tmp/off.ts",
			Body(["1: // comment", "2: const a = 1;"], "(End of file - total 2 lines)"),
		);
		const Out = await RunDisabled.Listeners["tools/post-execute"](
			Exec("read", { id: "agent-off" }),
			Outcome(Source),
			Accept,
		);
		const Sub = "intent: enabled off never strips (and no ledger line)";
		Check(Count, Sub, () => {
			assert.ok(Out.kind === "accept" && !("content" in Out));
			assert.ok(RunDisabled.Lines.length === LinesBefore);
		});
		// I11: ... and the ACTIVATION line still reached the ledger: the
		// filter switch maps onto State.Active, NOT onto the factory's ledger
		// gate (State.Enabled, from the shared `log` cell), so "did it
		// activate" stays answerable from the ledger alone while the filter is
		// off.
		{
			const Sub = "intent: enabled off still records the activation line in the ledger";
			Check(Count, Sub, () => {
				const Activated = RunDisabled.Lines.filter((Line: string) =>
					Line.startsWith("hook-dsh-comment-filter: activated"),
				);
				assert.equal(Activated.length, 1);
				assert.ok(Activated[0].includes("targets 2"));
			});
		}
	}
	return Finish(Count, "Intent");
};

// Standalone entry: `node Target/Test/Intent/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Intent`);
}

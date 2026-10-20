// Source/Test/Suggester-And-Set/Test.ts - the S-series tests: the suggester
// gate, the privacy default, the rate cap, the parse containment, the
// configured-block frame, the accept/dismiss verbs, autoPlant, and the
// live_container_set tool surface.
import assert from "node:assert/strict";
import {
	AgentA,
	Advance,
	Check,
	ClockBox,
	Finish,
	LinesWith,
	MakeCounter,
	MakeWave,
	WaveAssemble,
	live_set,
	Validate,
	FakeJobsHub,
	Ledger,
	rm,
	FakeSubagent,
} from "../Harness.js";

// A 260-char request whose last 60 bytes ("SECRET-CONTENTS-42..." plus
// filler) appear ONLY there, so the redact assertion is meaningful.
const LongRequest =
	"Please implement the new export pipeline for the reports module: ".padEnd(200, "x") +
	" SECRET-CONTENTS-42 ".padEnd(60, "z");

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group S1: the zero-subagent guarantee.
	rm();
	ClockBox.Now = 1700000000000;
	{
		const Run = MakeWave(Validate({ logFile: Ledger, enabled: true }), { jobs: FakeJobsHub() });
		const Sub = FakeSubagent();
		Run.Context.subagent = Sub.registry;
		Run.State.Wave.Subagent = Sub.registry;
		await Run.Listeners["agent/pre-step"](
			{ agent: AgentA, messages: [{ source: { kind: "user" }, content: [{ type: "text", text: LongRequest }] }] },
			async () => ({}),
		);
		await WaveAssemble(Run);
		Check(Count, "S1: suggester off - zero spawns, zero frames", () => {
			assert.equal(Sub.spawns.length, 0);
		});
	}
	// Group S2: one spawn per qualifying turn; the redact default.
	rm();
	{
		const Run = MakeWave(Validate({ logFile: Ledger, enabled: true, suggester: "plant" }), { jobs: FakeJobsHub() });
		const Sub = FakeSubagent();
		Run.Context.subagent = Sub.registry;
		Run.State.Wave.Subagent = Sub.registry;
		await Run.Listeners["agent/pre-step"](
			{ agent: AgentA, messages: [{ source: { kind: "user" }, content: [{ type: "text", text: LongRequest }] }] },
			async () => ({}),
		);
		Check(Count, "S2: a qualifying turn spawns exactly one detached activation", () => {
			assert.equal(Sub.spawns.length, 1);
			assert.equal(Sub.spawns[0].label, "live-containers-suggester");
			assert.equal(Sub.spawns[0].provider, "cloudflare-workers-ai");
			assert.equal(Sub.spawns[0].request.parent.id, "agent-a");
		});
		const Prompt = Sub.spawns[0].request.prompt;
		Check(Count, "S2: privacy redact - the first 200 chars plus the total length only", () => {
			assert.ok(Prompt.includes(LongRequest.slice(0, 200)));
			assert.ok(Prompt.includes(`[truncated, ${LongRequest.length} chars]`));
			assert.ok(!Prompt.includes(LongRequest.slice(200, 260)));
			assert.ok(Prompt.includes("Template catalog:"));
			assert.ok(Prompt.includes("agent-progress-board:"));
		});
		await WaveAssemble(Run); // advance the turn
		await Run.Listeners["agent/pre-step"](
			{ agent: AgentA, messages: [{ source: { kind: "user" }, content: [{ type: "text", text: LongRequest + " more" }] }] },
			async () => ({}),
		);
		Check(Count, "S2: at most one suggestion per user turn (a new turn spawns again)", () => {
			assert.equal(Sub.spawns.length, 2);
		});
	}
	// Group S3: the skip words, the gate length, the rate cap.
	rm();
	{
		const Run = MakeWave(Validate({ logFile: Ledger, enabled: true, suggester: "plant" }), { jobs: FakeJobsHub() });
		const Sub = FakeSubagent();
		Run.Context.subagent = Sub.registry;
		Run.State.Wave.Subagent = Sub.registry;
		await Run.Listeners["agent/pre-step"](
			{ agent: AgentA, messages: [{ source: { kind: "user" }, content: [{ type: "text", text: "please plant a board for this task and run it" }] }] },
			async () => ({}),
		);
		Check(Count, "S3: a message naming a skip word spawns nothing", () => {
			assert.equal(Sub.spawns.length, 0);
		});
		await Run.Listeners["agent/pre-step"](
			{ agent: AgentA, messages: [{ source: { kind: "user" }, content: [{ type: "text", text: "short but sweet" }] }] },
			async () => ({}),
		);
		Check(Count, "S3: a message below the gate length spawns nothing", () => {
			assert.equal(Sub.spawns.length, 0);
		});
		for (let Index = 0; Index < 8; Index += 1) {
			await WaveAssemble(Run); // advance the turn
			await Run.Listeners["agent/pre-step"](
				{ agent: AgentA, messages: [{ source: { kind: "user" }, content: [{ type: "text", text: LongRequest + ` variant ${Index}` }] }] },
				async () => ({}),
			);
			Advance(60000);
		}
		Check(Count, "S3: the 7th suggestion in an hour spawns nothing (the rate cap)", () => {
			assert.equal(Sub.spawns.length, 6);
		});
	}
	// Group S4: the parse containment.
	rm();
	{
		const Run = MakeWave(Validate({ logFile: Ledger, enabled: true, suggester: "plant" }), { jobs: FakeJobsHub() });
		const Sub = FakeSubagent();
		Run.Context.subagent = Sub.registry;
		Run.State.Wave.Subagent = Sub.registry;
		await Run.Listeners["agent/pre-step"](
			{ agent: AgentA, messages: [{ source: { kind: "user" }, content: [{ type: "text", text: LongRequest }] }] },
			async () => ({}),
		);
		Sub.answer(0, "this is not json at all");
		await new Promise((Resolve) => setImmediate(Resolve));
		await WaveAssemble(Run);
		Check(Count, "S4: a parse failure produces only the ledger line", () => {
			assert.deepEqual(LinesWith(Run, "suggestion parse failed"), [
				"hook-dsh-live-containers: suggestion parse failed",
			]);
			assert.ok(Object.keys(Run.contexts).length > 0);
		});
	}
	// Group S5/S6: the configured frame, clamping, expiry.
	rm();
	{
		const Run = MakeWave(Validate({ logFile: Ledger, enabled: true, suggester: "plant" }), { jobs: FakeJobsHub() });
		const Sub = FakeSubagent();
		Run.Context.subagent = Sub.registry;
		Run.State.Wave.Subagent = Sub.registry;
		await Run.Listeners["agent/pre-step"](
			{ agent: AgentA, messages: [{ source: { kind: "user" }, content: [{ type: "text", text: LongRequest }] }] },
			async () => ({}),
		);
		Sub.answer(0, JSON.stringify({ fit: "yes", templateId: "agent-progress-board", rationale: "the request dispatches several subagents", tokens: { expectAgents: 12 } }));
		await new Promise((Resolve) => setImmediate(Resolve));
		const Text = (await WaveAssemble(Run)).sections.at(-1).text;
		Check(Count, "S6: the out-of-range expectAgents clamps to 8 (ledgered before the frame)", () => {
			assert.ok(LinesWith(Run, "suggestion clamped").some((Line: string) => /suggestion clamped sug-[0-9a-f]{4} expectAgents/.test(Line)));
			assert.ok(Text.includes("expect agents: 8"));
		});
		Check(Count, "S5: the configured frame renders exactly once with the verbs and the lease", () => {
			assert.ok(Text.includes("LIVE SUGGESTION sug-"));
			assert.ok(Text.includes("(template: agent-progress-board; configured)"));
			assert.ok(Text.includes("lease: 3 turns (config default)"));
			assert.ok(Text.includes("why: the request dispatches several subagents"));
			assert.ok(Text.includes("accept: live_container_set accept=sug-"));
			assert.ok(Text.includes("dismiss: live_container_set dismiss=sug-"));
		});
		Advance(1);
		const After = (await WaveAssemble(Run)).sections.at(-1).text;
		Check(Count, "S5: the frame withdraws after one assembly (suggestion expired)", () => {
			assert.ok(!After.includes("LIVE SUGGESTION"));
			assert.equal(LinesWith(Run, "suggestion expired").length, 1);
		});
	}
	// Group S7: accept/dismiss.
	rm();
	{
		const Run = MakeWave(Validate({ logFile: Ledger, enabled: true, suggester: "plant" }), { jobs: FakeJobsHub() });
		const Sub = FakeSubagent();
		Run.Context.subagent = Sub.registry;
		Run.State.Wave.Subagent = Sub.registry;
		await Run.Listeners["agent/pre-step"](
			{ agent: AgentA, messages: [{ source: { kind: "user" }, content: [{ type: "text", text: LongRequest }] }] },
			async () => ({}),
		);
		Sub.answer(0, JSON.stringify({ fit: "yes", templateId: "agent-progress-board", rationale: "multi-agent", tokens: { expectAgents: 3 } }));
		await new Promise((Resolve) => setImmediate(Resolve));
		const Text = (await WaveAssemble(Run)).sections.at(-1).text;
		const Sid = /sug-[0-9a-f]{4}/.exec(Text)?.[0];
		Check(Count, "S7: the suggestion id is present in the frame", () => {
			assert.ok(Sid !== undefined);
		});
		if (Sid !== undefined) {
			const Result = await live_set(Run, AgentA, { accept: Sid });
			Check(Count, "S7: the accept verb opens the board with the suggested expectAgents", () => {
				assert.equal(String((Result as any).detail), `suggestion accepted ${Sid} (agent-progress-board)`);
				const Board = Run.State.Boards.get("agent-a")?.get(`planted-${Sid}`);
				assert.ok(Board !== undefined);
				assert.equal(Board.expect, 3);
				assert.equal(LinesWith(Run, `suggestion accepted ${Sid} (agent-progress-board)`).length, 1);
			});
			const Late = await live_set(Run, AgentA, { accept: Sid });
			Check(Count, "S7: accept on an expired sid fails honestly", () => {
				assert.equal((Late as any).detail, `accept failed ${Sid} (expired)`);
			});
		}
	}
	rm();
	{
		const Run = MakeWave(Validate({ logFile: Ledger, enabled: true, suggester: "plant" }), { jobs: FakeJobsHub() });
		const Sub = FakeSubagent();
		Run.Context.subagent = Sub.registry;
		Run.State.Wave.Subagent = Sub.registry;
		await Run.Listeners["agent/pre-step"](
			{ agent: AgentA, messages: [{ source: { kind: "user" }, content: [{ type: "text", text: LongRequest }] }] },
			async () => ({}),
		);
		Sub.answer(0, JSON.stringify({ fit: "yes", templateId: "todo-list", rationale: "multi-step", tokens: { steps: ["scaffold", "test", "docs"] } }));
		await new Promise((Resolve) => setImmediate(Resolve));
		const Text = (await WaveAssemble(Run)).sections.at(-1).text;
		const Sid = /sug-[0-9a-f]{4}/.exec(Text)?.[0];
		assert.ok(Sid !== undefined);
		const Result = await live_set(Run, AgentA, { dismiss: Sid });
		Check(Count, "S7: the dismiss verb withdraws the suggestion (byte-exact line)", () => {
			assert.equal((Result as any).detail, `suggestion dismissed ${Sid}`);
		});
	}
	// Group S8: autoPlant.
	rm();
	{
		const Run = MakeWave(Validate({ logFile: Ledger, enabled: true, suggester: "plant", autoPlant: true }), { jobs: FakeJobsHub() });
		const Sub = FakeSubagent();
		Run.Context.subagent = Sub.registry;
		Run.State.Wave.Subagent = Sub.registry;
		await Run.Listeners["agent/pre-step"](
			{ agent: AgentA, messages: [{ source: { kind: "user" }, content: [{ type: "text", text: LongRequest }] }] },
			async () => ({}),
		);
		Sub.answer(0, JSON.stringify({ fit: "yes", templateId: "agent-progress-board", rationale: "multi-agent", tokens: { expectAgents: 2 } }));
		await new Promise((Resolve) => setImmediate(Resolve));
		const Out = await WaveAssemble(Run);
		const Text = Out.sections.at(-1).text;
		Check(Count, "S8: autoPlant renders the dormant block with the accept verb (no preview frame)", () => {
			assert.ok(Text.includes("status: suggested - accept=sug-"));
			assert.ok(!Text.includes("LIVE SUGGESTION"));
		});
		const Sid = /sug-[0-9a-f]{4}/.exec(Text)?.[0];
		const Result = await live_set(Run, AgentA, { dismiss: Sid });
		Check(Count, "S8: dismiss withdraws the dormant block (dormant line)", () => {
			assert.equal((Result as any).detail, `suggestion dismissed ${Sid} (dormant)`);
		});
	}
	// Group S9: the set tool.
	rm();
	{
		const Run = MakeWave(Validate({ logFile: Ledger, enabled: true }), { jobs: FakeJobsHub() });
		const SetResult = await live_set(Run, AgentA, { key: "memory", value: "build is pnpm" });
		Check(Count, "S9: key/value writes to per-agent state (set <key> ledger)", () => {
			assert.equal((SetResult as any).set, true);
			assert.equal(LinesWith(Run, "set memory").length, 1);
		});
		const Unknown = await live_set(Run, AgentA, {});
		Check(Count, "S9: an empty call no-ops with the unknown line", () => {
			assert.equal((Unknown as any).set, false);
		});
		const Planted = await live_set(Run, AgentA, { plant: "todo-list", expect: "2", id: "todos" });
		Check(Count, "S9: the plant verb opens a board from the catalog preset", () => {
			assert.equal((Planted as any).set, true);
			assert.equal(LinesWith(Run, "plant opened todos (expect 2)").length, 1);
		});
		const BadPlant = await live_set(Run, AgentA, { plant: "no-such-template" });
		Check(Count, "S9: an unknown template no-ops with the unknown line", () => {
			assert.equal((BadPlant as any).set, false);
			assert.equal(LinesWith(Run, "set unknown plant no-such-template").length, 1);
		}
		);
	}
	return Finish(Count, "Suggester-And-Set");
};

// Standalone entry: `node Target/Test/Suggester-And-Set/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Suggester-And-Set`);
}

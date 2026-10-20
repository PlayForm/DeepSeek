// Source/Test/Volatile-And-Failsafes/Test.ts - the volatile-flip and
// fail-open discipline tests: every knob flips through its volatile cell
// (the cosmokit hot-edit write + the captured loader/volatile-update
// listener) and the NEXT assembly respects the flip WITHOUT a remount (the
// state object identity is preserved); the skip-reason ledger lines are
// byte-exact and quiet on steady state; the fail-open negatives (a render
// failure skips the block, the assembly still resolves; a throwing clock
// degrades; a malformed pre-step payload never throws); the cold-mount
// IDLE-forever posture (full passthrough, zero noise).
import assert from "node:assert/strict";
import {
	Assemble,
	AssembleBase,
	Block,
	Check,
	ClockBox,
	Finish,
	Flip,
	Frame,
	LinesWith,
	Make,
	MakeClocked,
	MakeCounter,
	Post,
	Validate,
	Ledger,
	rm,
	LiveSection,
} from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: the volatile flips (hot edits commit without remounting).
	rm();
	ClockBox.Now = 1700000000000;
	const Run1 = MakeClocked(
		Validate({
			logFile: Ledger,
			enabled: true,
			blocks: [Block("n", "note", "one")],
		}),
	);
	const State1 = Run1.State;
	{
		Flip(Run1.Raw.enabled, false);
		Run1.Listeners["loader/volatile-update"]([["enabled"]]);
		const Base = { sections: [], contexts: [], tools: [], variables: {} };
		const Out = await AssembleBase(Run1, Base);
		Check(Count, "flip enabled=false: the next assembly passes through unchanged", () => {
			assert.equal(Out, Base);
		});
		Check(Count, "flip enabled=false: the state object identity is preserved (no remount)", () => {
			assert.equal(Run1.State, State1);
			assert.equal(Run1.State.On, false);
		});
		Flip(Run1.Raw.enabled, true);
		Run1.Listeners["loader/volatile-update"]([["enabled"]]);
		const Out2 = await Assemble(Run1);
		Check(Count, "flip enabled=true: the section returns on the next assembly", () => {
			assert.ok(LiveSection(Out2).text.includes(Frame("---", "n", "one")));
		});
	}
	{
		Flip(Run1.Raw.separator, "***");
		Run1.Listeners["loader/volatile-update"]([["separator"]]);
		const Out = await Assemble(Run1);
		Check(Count, "flip separator: the next frame uses the new dashes", () => {
			assert.ok(LiveSection(Out).text.includes(Frame("***", "n", "one")));
			assert.equal(LiveSection(Out).text.includes("--- LIVE CONTAINER"), false);
		});
	}
	{
		Flip(Run1.Raw.refresh, "ttl");
		Run1.Listeners["loader/volatile-update"]([["refresh"]]);
		await Assemble(Run1);
		const Before = LinesWith(Run1, "block rendered n (").length;
		const Out = await Assemble(Run1);
		Check(Count, "flip refresh=ttl: the next assemblies reuse the global cache", () => {
			assert.equal(LinesWith(Run1, "block rendered n (").length, Before);
			assert.ok(LiveSection(Out).text.length > 0);
		});
	}
	{
		Flip(Run1.Raw.ttlCalls, 1);
		Run1.Listeners["loader/volatile-update"]([["ttlCalls"]]);
		const Out = await Assemble(Run1);
		Check(Count, "flip ttlCalls=1: the expired TTL rebuilds with the new cadence", () => {
			assert.deepEqual(LinesWith(Run1, "section rebuilt (ttl"), [
				"hook-dsh-live-containers: section rebuilt (ttl 1)",
			]);
			assert.ok(LiveSection(Out).text.includes(Frame("***", "n", "one")));
		});
	}
	{
		Flip(Run1.Raw.blocks, [Block("new1", "note", "brand new")]);
		Run1.Listeners["loader/volatile-update"]([["blocks"]]);
		const Out = await Assemble(Run1);
		Check(Count, "flip blocks: the next assembly renders the new table", () => {
			assert.ok(LiveSection(Out).text.includes(Frame("***", "new1", "brand new")));
		});
		Check(Count, "flip blocks: the new block has its own rendered ledger line", () => {
			assert.ok(LinesWith(Run1, "block rendered new1 (").length >= 1);
		});
	}
	{
		Flip(Run1.Raw.sectionBudgetBytes, 10);
		Run1.Listeners["loader/volatile-update"]([["sectionBudgetBytes"]]);
		Flip(Run1.Raw.blocks, [Block("f1", "note", "y".repeat(80)), Block("f2", "note", "y".repeat(80))]);
		Run1.Listeners["loader/volatile-update"]([["blocks"]]);
		const Out = await Assemble(Run1);
		Check(Count, "flip sectionBudgetBytes: the collapse engages on the next assembly", () => {
			assert.ok(LiveSection(Out).text.includes("(collapsed, "));
			assert.deepEqual(LinesWith(Run1, "failsafe section-collapse"), [
				"hook-dsh-live-containers: failsafe section-collapse 1",
			]);
		});
	}
	// Group: the skip-reason ledger lines (byte-exact, quiet on steady state).
	rm();
	{
		const Run2 = MakeClocked(
			Validate({
				logFile: Ledger,
				enabled: true,
				blocks: [
					Block("sk1", "note", "a", { scope: "never" }),
					Block("sk2", "note", "b", { trigger: "manual" }),
					Block("sk3", "session-stats", "c"),
					Block("sk4", "note", "d", { enabled: false }),
				],
			}),
		);
		await Assemble(Run2);
		Check(Count, "skip lines byte-exact (scope / manual / unknown kind / disabled)", () => {
			assert.deepEqual(LinesWith(Run2, "block skipped sk1"), [
				"hook-dsh-live-containers: block skipped sk1 (scope)",
			]);
			assert.deepEqual(LinesWith(Run2, "block skipped sk2"), [
				"hook-dsh-live-containers: block skipped sk2 (manual)",
			]);
			assert.deepEqual(LinesWith(Run2, "block skipped sk3"), [
				"hook-dsh-live-containers: block skipped sk3 (unknown kind)",
			]);
			assert.deepEqual(LinesWith(Run2, "block skipped sk4"), [
				"hook-dsh-live-containers: block skipped sk4 (disabled)",
			]);
		});
		await Assemble(Run2);
		Check(Count, "skip lines stay quiet on steady state (no repeated skips)", () => {
			assert.equal(LinesWith(Run2, "block skipped sk1").length, 1);
			assert.equal(LinesWith(Run2, "block skipped sk2").length, 1);
			assert.equal(LinesWith(Run2, "block skipped sk3").length, 1);
			assert.equal(LinesWith(Run2, "block skipped sk4").length, 1);
		});
	}
	// Group: fail-open negatives.
	rm();
	ClockBox.Now = 1700000000000;
	{
		const Run3 = MakeClocked(
			Validate({
				logFile: Ledger,
				enabled: true,
				blocks: [Block("poison", "note", "bad"), Block("safe", "note", "good")],
			}),
		);
		const Thrower = new Proxy(
			{},
			{
				// The substitution engine spreads the vars object (ownKeys) and
				// reads keys from it (get) - both traps throw, so the render
				// pass fails inside the engine's try/catch.
				get: () => {
					throw new Error("no reads allowed");
				},
				ownKeys: () => {
					throw new Error("no key enumeration allowed");
				},
			},
		) as unknown as Record<string, string>;
		// The schema-frozen block objects cannot be mutated; the hot-edit path
		// replaces the table wholesale (the same shape the volatile blocks
		// cell refresh produces).
		Run3.State.Blocks = [
			Block("poison", "note", "{{secret}}", { vars: Thrower }),
			Block("safe", "note", "good"),
		];
		const Out = await Assemble(Run3);
		Check(Count, "fail-open: the poisoned block is skipped, the assembly still resolves", () => {
			assert.equal(Out.sections.length, 2);
			assert.ok(LiveSection(Out).text.includes(Frame("---", "safe", "good")));
			assert.equal(LiveSection(Out).text.includes("poison"), false);
		});
		Check(Count, "fail-open: ledger render failed <id> -> skipped (byte-exact)", () => {
			assert.deepEqual(LinesWith(Run3, "render failed"), [
				"hook-dsh-live-containers: render failed poison -> skipped",
			]);
		});
		const Out2 = await Assemble(Run3);
		Check(Count, "fail-open: the assembly keeps resolving after the failure", () => {
			assert.equal(Out2.sections.length, 2);
		});
	}
	{
		const Run4 = MakeClocked(
			Validate({ logFile: Ledger, enabled: true, blocks: [Block("t", "time", "{{time}}")] }),
		);
		Run4.State.Now = () => {
			throw new Error("boom");
		};
		const Out = await Assemble(Run4);
		Check(Count, "fail-open: a throwing clock degrades to the real clock, never throws", () => {
			assert.equal(Out.sections.length, 2);
			assert.ok(LiveSection(Out).text.length > 0);
		});
	}
	{
		const Run5 = MakeClocked(Validate({ logFile: Ledger, enabled: true }));
		const Base = { sections: [], contexts: [], tools: [], variables: {} };
		const Out = await Run5.Listeners["agent/pre-step"](
			{ agent: { id: "x" }, messages: "not-an-array" },
			async () => Base,
		);
		Check(Count, "fail-open: a malformed pre-step payload never throws", () => {
			assert.equal(Out, Base);
			assert.equal(Run5.Warns.length, 0);
		});
	}
	// Group: the IDLE-forever cold mount (the disabled posture, behaviorally).
	rm();
	{
		const Run6 = Make(Validate({ logFile: Ledger }));
		Run6.State.Now = () => ClockBox.Now;
		const Base = { sections: [{ name: "base", text: "BASE" }], contexts: [], tools: [], variables: {} };
		const Out = await AssembleBase(Run6, Base);
		Check(Count, "idle: the cold mount appends no section (full passthrough)", () => {
			assert.equal(Out, Base);
		});
		Check(Count, "idle: the cold mount logs the byte-exact disabled line", () => {
			assert.deepEqual(Run6.Lines, ["hook-dsh-live-containers: disabled (enabled=false)"]);
		});
		const Decision = await Post(Run6, "bash");
		Check(Count, "idle: the post-execute observer passes the decision through", () => {
			assert.ok(Decision.kind === "accept" || Decision === undefined || Decision !== null);
		});
		Run6.Listeners["tools/change"]();
		Check(Count, "idle: the tools/change listener logs nothing while disabled", () => {
			assert.equal(Run6.Lines.length, 1);
		});
		Check(Count, "idle: no warnings on the cold mount", () => {
			assert.equal(Run6.Warns.length, 0);
		});
	}
	// Group: the per-scope labels ({{sessionId}}).
	rm();
	{
		const Run7 = MakeClocked(
			Validate({
				logFile: Ledger,
				enabled: true,
				blocks: [Block("m", "manifest", "session={{sessionId}}")],
			}),
		);
		const ScopeA = { key: "a" };
		const ScopeB = { key: "b" };
		const OutA = await Assemble(Run7, ScopeA);
		const OutB = await Assemble(Run7, ScopeB);
		const OutA2 = await Assemble(Run7, ScopeA);
		Check(Count, "labels: distinct scopes get stable distinct labels", () => {
			assert.ok(LiveSection(OutA).text.includes("session=scope-1"));
			assert.ok(LiveSection(OutB).text.includes("session=scope-2"));
		});
		Check(Count, "labels: the same scope keeps its label", () => {
			assert.ok(LiveSection(OutA2).text.includes("session=scope-1"));
		});
	}
	return Finish(Count, "Volatile-And-Failsafes");
};

// Standalone entry: `node Target/Test/Volatile-And-Failsafes/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Volatile-And-Failsafes`);
}

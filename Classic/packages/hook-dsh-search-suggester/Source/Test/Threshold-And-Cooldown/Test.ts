import assert from "node:assert/strict";
import {
	AgentOf,
	CheckAsync,
	Commit,
	Finish,
	Ledger,
	Make,
	MakeCounter,
	Post,
	rm,
	SeedHistory,
	Service,
	Setup,
	Validate,
	Workspace,
} from "../Harness.js";

/**
 * @module Test
 *
 * The plan's suite 2: the gate arithmetic, the cooldown window, the dedupe, and
 * the per-turn cap.
 *
 * @remarks
 *
 * The gate arithmetic (the config floor and the synthetic family's own 0.75
 * gate, the R13 loop bonus on the ring), the cooldown window, the dedupe, and
 * the per-turn cap. Every refusal is a byte-exact ledger line; the counters are
 * judged calls, never a clock.
 *
 * THE CANDIDATES COME FROM THE SESSION HISTORY (k = sigmoid(2.5 - 0.6) = 0.87),
 * so the gate arithmetic is asserted on the history path instead of a pack row's
 * per-intent threshold. Every scenario mounts a temp workspace and judges the
 * workspace's absolute anchor.
 */
/**
 * The judged call's anchor path (relative to the temp workspace).
 */
const Anchor = "README.md";

/**
 * The two companions touched right after the anchor.
 */
const Companions = ["CHANGELOG.md", "SCHEME.md"];

/**
 * The temp workspace the scenarios judge.
 */
const Space = Workspace([Anchor, ...Companions]);

/**
 * One judged read of the anchor.
 */
const Read = (Id: string): any => ({
	name: "read",
	arguments: { file_path: Space.At(Anchor) },
	agent: AgentOf(Id),
});

/**
 * One judged call whose anchor has no history (it only ages the cooldown).
 */
const Elsewhere = (Id: string, N: string): any => ({
	name: "grep",
	arguments: { pattern: `unrelated query ${N}`, path: Space.At("package.json") },
	agent: AgentOf(Id),
});

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group T1: the gate arithmetic.
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Space.Root);
		SeedHistory(Run, "b", Space.At(Anchor), Companions);
		await CheckAsync(Count, "T1: the default gate crosses and emits", async () => {
			const Out = await Post(Run, Read("b"));
			assert.equal(Out.additionalContexts[0].source.summary, "History 0.87");
			assert.ok(Run.Lines.includes("hook-dsh-search-suggester: suggest History 0.87 2 candidates"));
		});
		rm();
		const Raised = Make(Validate({ logFile: Ledger, enabled: true, threshold: 0.9 }));
		Raised.Context.workingDirectory = Service(Space.Root);
		SeedHistory(Raised, "b", Space.At(Anchor), Companions);
		await CheckAsync(Count, "T1: a raised config threshold abstains low-confidence", async () => {
			const Out = await Post(Raised, Read("b"), { kind: "allow", additionalContexts: [] });
			assert.deepEqual(Out.additionalContexts, []);
			assert.ok(
				Raised.Lines.includes("hook-dsh-search-suggester: abstained low-confidence History 0.87"),
			);
		});
	}

	// Group T2: the cooldown and the dedupe.
	{
		rm();
		const Run = Setup();
		Run.Context.workingDirectory = Service(Space.Root);
		SeedHistory(Run, "a", Space.At(Anchor), Companions);
		await CheckAsync(Count, "T2: a second note within the cooldown is suppressed", async () => {
			await Post(Run, Read("a"));
			const Out = await Post(Run, Read("a"), { kind: "allow", additionalContexts: [] });
			assert.deepEqual(Out.additionalContexts, []);
			assert.ok(Run.Lines.includes("hook-dsh-search-suggester: suppressed cooldown History"));
		});
		await CheckAsync(Count, "T2: after the cooldown expires the dedupe holds the same note", async () => {
			for (let Index = 0; Index < 6; Index += 1) {
				await Post(Run, Elsewhere("a", String(Index)), {
					kind: "allow",
					additionalContexts: [],
				});
			}
			const Out = await Post(Run, Read("a"), { kind: "allow", additionalContexts: [] });
			assert.deepEqual(Out.additionalContexts, []);
			assert.ok(Run.Lines.includes("hook-dsh-search-suggester: suppressed dedupe History"));
			assert.equal(
				Run.Lines.filter((Line: string) => Line.includes(": suggest ")).length,
				1,
			);
		});
	}

	// Group T3: the zero cooldown reaches the dedupe directly.
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger, enabled: true, cooldownCalls: 0 }));
		Run.Context.workingDirectory = Service(Space.Root);
		SeedHistory(Run, "a", Space.At(Anchor), Companions);
		await CheckAsync(Count, "T3: a zero cooldown window reaches the dedupe suppress", async () => {
			await Post(Run, Read("a"));
			const Out = await Post(Run, Read("a"), { kind: "allow", additionalContexts: [] });
			assert.deepEqual(Out.additionalContexts, []);
			assert.ok(Run.Lines.includes("hook-dsh-search-suggester: suppressed dedupe History"));
		});
	}

	// Group T4: the per-turn cap.
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger, enabled: true, cooldownCalls: 0, maxNotesPerTurn: 1 }));
		Run.Context.workingDirectory = Service(Space.Root);
		// One session history with two anchors: the two calls carry different
		// candidate sets, so the second reaches the cap instead of the dedupe.
		// The events are committed through the projection drive.
		Commit(Run, "a", Space.At(Anchor));
		Commit(Run, "a", "CHANGELOG.md");
		Commit(Run, "a", Space.At("package.json"));
		Commit(Run, "a", "SCHEME.md");
		await CheckAsync(Count, "T4: the second note is capped", async () => {
			await Post(Run, Read("a"));
			const Out = await Post(
				Run,
				{ name: "read", arguments: { file_path: Space.At("package.json") }, agent: AgentOf("a") },
				{ kind: "allow", additionalContexts: [] },
			);
			assert.deepEqual(Out.additionalContexts, []);
			assert.ok(Run.Lines.includes("hook-dsh-search-suggester: suppressed cap History"));
		});
	}

	// Group T5: the loop bonus lifts the evidence over a raised floor.
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger, enabled: true, threshold: 0.88 }));
		Run.Context.workingDirectory = Service(Space.Root);
		SeedHistory(Run, "a", Space.At(Anchor), Companions);
		await CheckAsync(Count, "T5: the R13 loop bonus lifts the third call over the floor", async () => {
			for (let Index = 0; Index < 2; Index += 1) {
				await Post(Run, Read("a"), { kind: "allow", additionalContexts: [] });
			}
			assert.equal(
				Run.Lines.filter((Line: string) => Line.includes("abstained low-confidence History 0.87")).length,
				2,
			);
			const Out = await Post(Run, Read("a"));
			assert.equal(Out.additionalContexts[0].source.summary, "History 0.89");
			assert.ok(Run.Lines.includes("hook-dsh-search-suggester: suggest History 0.89 2 candidates"));
		});
	}

	return Finish(Count, "Threshold-And-Cooldown");
};

// Standalone entry: `node Target/Test/Threshold-And-Cooldown/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Threshold-And-Cooldown`);
}

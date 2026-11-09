/**
 * @module Test
 *
 * The workspace root and the history note against the fake ctx and REAL temp trees.
 *
 * @remarks
 * (a) a call path with NO `.git`/`package.json` root and no session cwd abstains
 * `foreign-workspace` before any candidate work, whether the cwd arrives through the optional
 * harness service or is absent, or its getter throws; (b) the call path's own root wins over the
 * session cwd; (c) a call inside a temp root carrying a `package.json` emits the HISTORY note
 * naming the two companions the session touched right after the anchor; (d) the same rooted tree
 * with an agent that has no history abstains `no-history`; (e) a history whose whole companion
 * set is gone abstains `no-companions`; (f) a foreign call never poisons the next in-workspace
 * call.
 */
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import {
	AgentOf,
	Call,
	CheckAsync,
	Commit,
	Finish,
	LedgerWith,
	LinesWith,
	MakeCounter,
	Setup,
} from "../Harness.js";

/** A temp tree under the OS temp dir (fresh per folder process). */
const Tree = (Prefix: string): string => FileSystem.mkdtempSync(Path.join(OS.tmpdir(), Prefix));

/** Write one file under the tree (parents created). */
const Put = (Root: string, Relative: string, Body = "x"): string => {
	const Full = Path.join(Root, Relative);
	FileSystem.mkdirSync(Path.dirname(Full), { recursive: true });
	FileSystem.writeFileSync(Full, Body, "utf8");
	return Full;
};

/** The FOREIGN tree: no `.git`, no `package.json`, and no session cwd. */
const Foreign = Tree("test-suggester-foreign-");
const ForeignTest = Put(Foreign, "Source/Test/Foo/Test.ts");

/** The ROOTED tree: a `package.json` marker, the anchor and the two companions. */
const Rooted = Tree("test-suggester-rooted-");
Put(Rooted, "package.json", "{}");
const RootedTest = Put(Rooted, "Source/Library.ts");
Put(Rooted, "README.md");
Put(Rooted, "SCHEME.md");

/** The optional harness service the probe reads (the real shape: get(session)). */
const Service = (Cwd: string): { get: () => string } => ({ get: () => Cwd });

/**
 * Seed one agent's session history through the PROJECTION drive: the absolute
 * anchor the call names, then the followers, committed as `tool/call` events
 * and folded by the registered unit into that session's cell.
 */
const Seed = (Run: any, Id: string, Followers: string[]): void => {
	Commit(Run, Id, RootedTest);
	for (const Follower of Followers) {
		Commit(Run, Id, Follower);
	}
};

/** The history note's byte-exact text (k = sigmoid(2.5 - 0.6) = 0.87). */
const HistoryText = [
	"[test-suggester] intent=History confidence=0.87",
	"targets (2):",
	"- README.md - touched 1 time(s) after this file",
	"- SCHEME.md - touched 1 time(s) after this file",
	"note: these files were touched right after this one in this workspace",
].join("\n");

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group G1: no workspace root, no session cwd.
	{
		const Agent = AgentOf("gate-a");
		const Run = Setup();
		// The bare mount: without the service the absolute foreign path has
		// no `.git`/`package.json` ancestor and no cwd fallback.
		delete Run.Context.workingDirectory;
		await CheckAsync(Count, "G1: a call with no root abstains foreign-workspace", async () => {
			const Decision = { kind: "allow", additionalContexts: [{ id: "downstream" }] };
			const Out = await Call(Run, "read", { file_path: ForeignTest }, Agent, Decision);
			assert.equal(Out, Decision);
			assert.deepEqual(Out.additionalContexts, [{ id: "downstream" }]);
			assert.ok(Run.Lines.includes("test-suggester: abstained foreign-workspace  0.00"));
			assert.equal(LedgerWith("abstained foreign-workspace  0.00").length, 1);
			assert.equal(LinesWith(Run, "candidates call").length, 0);
		});
		await CheckAsync(Count, "G1: the foreign call does not touch the per-agent memory", async () => {
			assert.equal(Run.State.Agents.get(Agent), undefined);
		});
		await CheckAsync(Count, "G1: the cwd probe never throws (a throwing getter still abstains)", async () => {
			const Throwing = Setup();
			Throwing.Context.workingDirectory = {
				get: () => {
					throw new Error("the service getter throws");
				},
			};
			const Decision = { kind: "allow" };
			const Out = await Call(Throwing, "read", { file_path: ForeignTest }, Agent, Decision);
			assert.equal(Out, Decision);
			assert.ok(Throwing.Lines.includes("test-suggester: abstained foreign-workspace  0.00"));
			assert.deepEqual(Throwing.Warns, []);
		});
	}

	// Group G2: the call path's own root wins over the session cwd.
	{
		const Agent = AgentOf("gate-b");
		const Run = Setup();
		// The cwd service points at the FOREIGN tree (no marker), while the
		// call path sits inside the ROOTED one: the upward walk finds the
		// call path's own `package.json` before the cwd fallback.
		Run.Context.workingDirectory = Service(Foreign);
		await Run.Ready;
		Seed(Run, "gate-b", ["README.md", "SCHEME.md"]);
		await CheckAsync(Count, "G2: the call path's own root wins over the session cwd", async () => {
			const Out = await Call(Run, "read", { file_path: RootedTest }, Agent);
			assert.equal(Out.additionalContexts[0].source.summary, "History 0.87");
		});
	}

	// Group G3: the history note inside a rooted temp tree.
	{
		const Agent = AgentOf("gate-c");
		const Run = Setup();
		Run.Context.workingDirectory = Service(Rooted);
		await Run.Ready;
		Seed(Run, "gate-c", ["README.md", "SCHEME.md"]);
		await CheckAsync(Count, "G3: the History note names the companions of the temp root", async () => {
			const Out = await Call(Run, "read", { file_path: RootedTest }, Agent);
			assert.equal(Out.additionalContexts.length, 1);
			assert.deepEqual(Out.additionalContexts[0].source, {
				kind: "test-suggester",
				form: "notice",
				summary: "History 0.87",
			});
			assert.equal(Out.additionalContexts[0].content[0].text, HistoryText);
		});
		await CheckAsync(Count, "G3: the suggest line counts the two companions", async () => {
			assert.deepEqual(LinesWith(Run, "candidates call"), [
				"test-suggester: suggest History 0.87 2 candidates call read",
			]);
			assert.equal(LedgerWith("suggest History 0.87 2 candidates call read").length, 1);
		});
		await CheckAsync(Count, "G3: the rooted workspace with no history abstains no-history", async () => {
			const Decision = { kind: "allow" };
			const Out = await Call(Run, "read", { file_path: RootedTest }, AgentOf("gate-d"), Decision);
			assert.equal(Out, Decision);
			assert.deepEqual(Out.additionalContexts, undefined);
			assert.ok(Run.Lines.includes("test-suggester: abstained no-history  0.00"));
			assert.equal(LedgerWith("abstained no-history  0.00").length, 1);
		});
	}

	// Group G4: a history whose whole companion set is gone.
	{
		const Agent = AgentOf("gate-e");
		const Run = Setup();
		Run.Context.workingDirectory = Service(Rooted);
		await Run.Ready;
		Seed(Run, "gate-e", ["GONE.md", "ALSO-GONE.md"]);
		await CheckAsync(Count, "G4: an emptied history abstains no-companions with the family and kappa", async () => {
			const Decision = { kind: "allow" };
			const Out = await Call(Run, "read", { file_path: RootedTest }, Agent, Decision);
			assert.equal(Out, Decision);
			assert.ok(Run.Lines.includes("test-suggester: abstained no-companions History 0.87"));
			assert.equal(LedgerWith("abstained no-companions History 0.87").length, 1);
			assert.equal(LinesWith(Run, "candidates call").length, 0);
		});
	}

	// Group G5: the foreign abstention does not poison the next in-workspace call.
	{
		const Agent = AgentOf("gate-f");
		const Run = Setup();
		// The first call is the bare mount (no root at all); the second
		// arrives with the rooted tree's cwd and the seeded history.
		delete Run.Context.workingDirectory;
		await Run.Ready;
		Seed(Run, "gate-f", ["README.md", "SCHEME.md"]);
		await CheckAsync(Count, "G5: a foreign call never poisons the next in-workspace call", async () => {
			const Foreign_ = await Call(Run, "read", { file_path: ForeignTest }, Agent);
			assert.equal(Foreign_.kind, "allow");
			assert.equal(Run.Lines.includes("test-suggester: abstained foreign-workspace  0.00"), true);
			Run.Context.workingDirectory = Service(Rooted);
			const Out = await Call(Run, "read", { file_path: RootedTest }, Agent);
			assert.equal(Out.additionalContexts[0].source.summary, "History 0.87");
		});
	}

	return Finish(Count, "Workspace-Gate");
};

// Standalone entry: `node Target/Test/Workspace-Gate/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Workspace-Gate`);
}

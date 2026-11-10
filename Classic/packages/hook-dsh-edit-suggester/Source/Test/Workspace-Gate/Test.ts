import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import {
	AgentOf,
	CheckAsync,
	Commit,
	Durable,
	DurableLine,
	Finish,
	MakeCounter,
	Post,
	Setup,
} from "../Harness.js";

/**
 * @module Test
 *
 * The workspace root and the history note against the fake ctx and REAL temp trees.
 *
 * @remarks
 *
 * - A call path with NO `.git`/`package.json` root and no session cwd abstains `foreign-workspace`
 *   before any candidate work, whether the cwd arrives through the optional harness service, is
 *   absent, or its getter throws.
 * - A call inside a temp root carrying a `package.json` emits the HISTORY note naming the two
 *   companions the session touched right after the anchor, committed through the projection
 *   drive.
 * - The same rooted tree with an agent that has no history abstains `no-history`.
 */
/**
 * A temp tree under the OS temp dir (fresh per folder process).
 */
const Tree = (Prefix: string): string => FileSystem.mkdtempSync(Path.join(OS.tmpdir(), Prefix));

/**
 * Write one file under the tree (parents created).
 */
const Put = (Root: string, Relative: string, Body = "x"): string => {
	const Full = Path.join(Root, Relative);
	FileSystem.mkdirSync(Path.dirname(Full), { recursive: true });
	FileSystem.writeFileSync(Full, Body, "utf8");
	return Full;
};

/**
 * The FOREIGN tree: no `.git`, no `package.json`, and no session cwd.
 */
const Foreign = Tree("edit-suggester-foreign-");
const ForeignConfig = Put(Foreign, "Source/Variable/Config.ts");

/**
 * The ROOTED tree: a `package.json` marker, the anchor and the two companions.
 */
const Rooted = Tree("edit-suggester-rooted-");
Put(Rooted, "package.json", "{}");
const RootedConfig = Put(Rooted, "Source/Variable/Config.ts");
Put(Rooted, "README.md");
Put(Rooted, "SCHEME.md");

/**
 * The optional harness service the probe reads (the real shape: get(session)).
 */
const Service = (Cwd: string): { get: () => string } => ({ get: () => Cwd });

/**
 * A judged edit call.
 */
const Edit = (Path_: string, Id: string): any => ({
	name: "edit",
	arguments: { file_path: Path_ },
	agent: AgentOf(Id),
});

/**
 * The history note's byte-exact text (k = sigmoid(2.5 - 0.6) = 0.87).
 */
const HistoryText = [
	"[edit-suggester] family=History confidence=0.87",
	"companions (2):",
	"- README.md - touched 1 time(s) after this file",
	"- SCHEME.md - touched 1 time(s) after this file",
	"note: this file rarely stands alone; check whether these need the same change.",
].join("\n");

/**
 * Seed one agent's session history through the PROJECTION drive: the absolute
 * anchor the call names, then the two relative companions, committed as
 * `tool/call` events and folded by the registered unit into that session's
 * cell.
 */
const Seed = (Run: any, Id: string, Anchor: string): void => {
	Commit(Run, Id, Anchor);
	Commit(Run, Id, "README.md");
	Commit(Run, Id, "SCHEME.md");
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group G1: no workspace root, no session cwd.
	{
		const Run = Setup();
		// The bare mount: without the service the absolute foreign path has
		// no `.git`/`package.json` ancestor and no cwd fallback.
		delete Run.Context.workingDirectory;
		await CheckAsync(Count, "G1: a call with no root abstains foreign-workspace", async () => {
			const Decision = { kind: "allow", additionalContexts: [{ id: "downstream" }] };
			const Out = await Post(Run, Edit(ForeignConfig, "a"), Decision);
			assert.equal(Out, Decision);
			assert.deepEqual(Out.additionalContexts, [{ id: "downstream" }]);
			assert.ok(Run.Lines.includes("hook-dsh-edit-suggester: abstained foreign-workspace  0.00"));
			assert.match(
				DurableLine("abstained foreign-workspace"),
				Durable("abstained foreign-workspace  0.00"),
			);
			assert.equal(Run.Lines.filter((Line: string) => Line.includes(": suggest ")).length, 0);
		});
		await CheckAsync(Count, "G1: the foreign call does not touch the ring", async () => {
			const Rings = Run.State.Rings.State(AgentOf("a"));
			assert.equal(Rings.calls, 0);
			assert.equal(Rings.touched.size, 0);
			assert.equal(Rings.notes, 0);
		});
		await CheckAsync(Count, "G1: the cwd probe never throws (a throwing getter still abstains)", async () => {
			const Throwing = Setup();
			Throwing.Context.workingDirectory = {
				get: () => {
					throw new Error("the service getter throws");
				},
			};
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(Throwing, Edit(ForeignConfig, "a"), Decision);
			assert.equal(Out, Decision);
			assert.ok(Throwing.Lines.includes("hook-dsh-edit-suggester: abstained foreign-workspace  0.00"));
			assert.deepEqual(Throwing.Warns, []);
		});
	}

	// Group G2: the history note inside a rooted temp tree.
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Rooted);
		await CheckAsync(Count, "G2: the History note names the companions of the temp root", async () => {
			await Run.Ready;
			Seed(Run, "b", RootedConfig);
			const Out = await Post(Run, Edit(RootedConfig, "b"));
			assert.equal(Out.additionalContexts.length, 1);
			assert.deepEqual(Out.additionalContexts[0].source, {
				kind: "edit-suggester",
				form: "notice",
				summary: "History 0.87",
			});
			assert.equal(Out.additionalContexts[0].content[0].text, HistoryText);
		});
		await CheckAsync(Count, "G2: the suggest line counts the two companions", async () => {
			assert.ok(
				Run.Lines.includes(
					`hook-dsh-edit-suggester: suggest History 0.87 2 companions ${RootedConfig}`,
				),
			);
			assert.match(
				DurableLine(`suggest History 0.87 2 companions ${RootedConfig}`),
				Durable(`suggest History 0.87 2 companions ${RootedConfig}`),
			);
		});
		await CheckAsync(Count, "G2: the rooted workspace with no history abstains no-history", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(Run, Edit(RootedConfig, "c"), Decision);
			assert.equal(Out, Decision);
			assert.deepEqual(Out.additionalContexts, []);
			assert.ok(Run.Lines.includes("hook-dsh-edit-suggester: abstained no-history  0.00"));
			assert.match(
				DurableLine("abstained no-history"),
				Durable("abstained no-history  0.00"),
			);
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

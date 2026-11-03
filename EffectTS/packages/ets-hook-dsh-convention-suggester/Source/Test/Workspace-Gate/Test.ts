// Source/Test/Workspace-Gate/Test.ts - the workspace gate against the fake
// ctx and REAL temp trees: (a) a call path with NO `.git`/`package.json` root
// and no session cwd abstains `foreign-workspace`; (b) a call inside a temp
// root that carries `.git` emits the HISTORY note naming the companions the
// session touched right after the anchor, and the same root with no history
// abstains `no-history`.
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

/** A temp tree under the OS temp dir (fresh per folder process). */
const Tree = (Prefix: string): string => FileSystem.mkdtempSync(Path.join(OS.tmpdir(), Prefix));

/** Write one file under the tree (parents created). */
const Put = (Root: string, Relative: string, Body = "x"): string => {
	const Full = Path.join(Root, Relative);
	FileSystem.mkdirSync(Path.dirname(Full), { recursive: true });
	FileSystem.writeFileSync(Full, Body, "utf8");
	return Full;
};

/** The optional harness service the probe reads (the real shape: get(session)). */
const Service = (Cwd: string): { get: () => string } => ({ get: () => Cwd });

/** A judged write call. */
const Write = (Path_: string, Id: string): any => ({
	name: "write",
	arguments: { file_path: Path_ },
	agent: AgentOf(Id),
});

/** The history note's byte-exact text (k = 0.60 + 0.05 * 2). */
const HistoryText = [
	"[convention-suggester] intent=History confidence=0.70",
	"targets (2):",
	"- Source/Library.ts - touched 1 time(s) after this file",
	"- README.md - touched 1 time(s) after this file",
	"note: these files were touched right after this one in this workspace",
].join("\n");

/**
 * Seed one agent's session history through the PROJECTION drive: the absolute
 * anchor the call names, then the two relative companions, committed as
 * `tool/call` events and folded by the registered unit into that session's
 * cell.
 */
const Seed = (Run: any, Id: string, Anchor: string): void => {
	Commit(Run, Id, Anchor);
	Commit(Run, Id, "Source/Library.ts");
	Commit(Run, Id, "README.md");
};

/** The FOREIGN tree: no `.git`, no `package.json`, and no session cwd. */
const Foreign = Tree("convention-suggester-foreign-");
const ForeignApply = Put(Foreign, "Source/Function/Apply.ts");

/** The ROOTED tree: a `.git` marker, the anchor and the two companions. */
const Rooted = Tree("convention-suggester-rooted-");
FileSystem.mkdirSync(Path.join(Rooted, ".git"));
const RootedAnchor = Put(Rooted, "Source/Function/Apply.ts");
Put(Rooted, "Source/Library.ts");
Put(Rooted, "README.md");

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group G1: no workspace root, no session cwd.
	{
		const Run = Setup();
		// The bare mount: without the service the absolute foreign path has
		// no `.git`/`package.json` ancestor and no cwd fallback.
		delete Run.Context.workingDirectory;
		await CheckAsync(Count, "G1: a call with no .git/package.json root abstains foreign-workspace", async () => {
			const Decision = { kind: "allow", additionalContexts: [{ id: "downstream" }] };
			const Out = await Post(Run, Write(ForeignApply, "a"), Decision);
			assert.equal(Out, Decision);
			assert.deepEqual(Out.additionalContexts, [{ id: "downstream" }]);
			assert.ok(Run.Lines.includes("convention-suggester: abstained foreign-workspace  0.00"));
			assert.match(
				DurableLine("abstained foreign-workspace"),
				Durable("abstained foreign-workspace  0.00"),
			);
			assert.equal(Run.Lines.filter((Line: string) => Line.includes(": suggest ")).length, 0);
		});
		await CheckAsync(Count, "G1: the foreign call does not touch the per-agent memory", async () => {
			const Memory = Run.State.Agents.get(AgentOf("a"));
			assert.equal(Memory, undefined);
		});
		await CheckAsync(Count, "G1: the cwd probe never throws (a throwing getter still abstains)", async () => {
			const Throwing = Setup();
			Throwing.Context.workingDirectory = {
				get: () => {
					throw new Error("the service getter throws");
				},
			};
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(Throwing, Write(ForeignApply, "a"), Decision);
			assert.equal(Out, Decision);
			assert.ok(Throwing.Lines.includes("convention-suggester: abstained foreign-workspace  0.00"));
			assert.deepEqual(Throwing.Warns, []);
		});
	}

	// Group G2: the history note inside a rooted temp tree.
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Rooted);
		await CheckAsync(Count, "G2: the History note names the companions of the temp root", async () => {
			await Run.Ready;
			Seed(Run, "b", RootedAnchor);
			const Out = await Post(Run, Write(RootedAnchor, "b"));
			assert.equal(Out.additionalContexts.length, 1);
			assert.deepEqual(Out.additionalContexts[0].source, {
				kind: "convention-suggester",
				form: "notice",
				summary: "History 0.70",
			});
			assert.equal(Out.additionalContexts[0].content[0].text, HistoryText);
		});
		await CheckAsync(Count, "G2: the suggest line counts the two candidates", async () => {
			assert.ok(
				Run.Lines.includes("convention-suggester: suggest History 0.70 2 candidates call write"),
			);
			assert.match(
				DurableLine("suggest History 0.70 2 candidates call write"),
				Durable("suggest History 0.70 2 candidates call write"),
			);
		});
		await CheckAsync(Count, "G2: the rooted workspace with no history abstains no-history", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(Run, Write(RootedAnchor, "c"), Decision);
			assert.equal(Out, Decision);
			assert.deepEqual(Out.additionalContexts, []);
			assert.ok(Run.Lines.includes("convention-suggester: abstained no-history  0.00"));
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

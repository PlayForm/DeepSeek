// Source/Test/Workspace-Gate/Test.ts - the workspace gate and the existence
// filter against the fake ctx and REAL temp trees: (a) a call path with NO
// `.git`/`package.json` root and no session cwd abstains `foreign-workspace`
// before any candidate work, whether the cwd service is absent or its getter
// throws; (b) a rooted tree with no history abstains `no-history`; (c) a
// rooted tree with a seeded session history emits the HISTORY note naming
// ONLY the companions that exist; (d) a history whose whole companion set is
// absent abstains `no-companions`; (e) a foreign call never poisons the next
// in-workspace call.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import {
	AgentOf,
	CheckAsync,
	Durable,
	DurableLine,
	Finish,
	MakeCounter,
	Post,
	SeedHistory,
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

/** A dedicated parent for the fixture trees. */
const Parent = Tree("search-suggester-workspaces-");
const Branch = (Name: string): string => {
	const Full = Path.join(Parent, Name);
	FileSystem.mkdirSync(Full, { recursive: true });
	return Full;
};

/** The FOREIGN tree: no `.git`, no `package.json`, and no session cwd. */
const Foreign = Branch("foreign");
const ForeignIndex = Put(Foreign, "Documentation/INDEX.md");

/** The ROOTED tree: the `package.json` marker and the anchor's companions. */
const Rooted = Branch("rooted");
Put(Rooted, "package.json", "{}");
const RootedAnchor = Put(Rooted, "README.md");
Put(Rooted, "CHANGELOG.md");
Put(Rooted, "SCHEME.md");

/** The optional harness service the probe reads (the real shape: get(session)). */
const Service = (Cwd: string): { get: () => string } => ({ get: () => Cwd });

/** A judged read call. */
const Read = (Path_: string, Id: string): any => ({
	name: "read",
	arguments: { file_path: Path_ },
	agent: AgentOf(Id),
});

/** The history note's byte-exact text (k = sigmoid(2.5 - 0.6) = 0.87). */
const HistoryText = [
	"[search-suggester] intent=History confidence=0.87",
	"targets (1):",
	"- CHANGELOG.md - touched 1 time(s) after a similar call",
	"note: open these before more searches; Target/ is generated, never edit it.",
].join("\n");

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group G1: no workspace root, no session cwd.
	{
		const Run = Setup();
		await CheckAsync(Count, "G1: a call with no root abstains foreign-workspace", async () => {
			const Decision = { kind: "allow", additionalContexts: [{ id: "downstream" }] };
			const Out = await Post(Run, Read(ForeignIndex, "a"), Decision);
			assert.equal(Out, Decision);
			assert.deepEqual(Out.additionalContexts, [{ id: "downstream" }]);
			assert.ok(Run.Lines.includes("hook-dsh-search-suggester: abstained foreign-workspace  0.00"));
			assert.match(
				DurableLine("abstained foreign-workspace"),
				Durable("abstained foreign-workspace  0.00"),
			);
			assert.equal(Run.Lines.filter((Line: string) => Line.includes(": suggest ")).length, 0);
		});
		await CheckAsync(Count, "G1: the foreign call does not touch the ring", async () => {
			const Rings = Run.State.Rings.State(AgentOf("a"));
			assert.equal(Rings.calls, 0);
			assert.equal(Rings.notes, 0);
			assert.equal(Rings.pending, undefined);
		});
		await CheckAsync(Count, "G1: the cwd probe never throws (a throwing getter still abstains)", async () => {
			const Throwing = Setup();
			Throwing.Context.workingDirectory = {
				get: () => {
					throw new Error("the service getter throws");
				},
			};
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(Throwing, Read(ForeignIndex, "a"), Decision);
			assert.equal(Out, Decision);
			assert.ok(Throwing.Lines.includes("hook-dsh-search-suggester: abstained foreign-workspace  0.00"));
			assert.deepEqual(Throwing.Warns, []);
		});
	}

	// Group G2: a rooted tree with no history.
	{
		const Run = Setup();
		await CheckAsync(Count, "G2: a rooted tree with no history abstains no-history", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(Run, Read(RootedAnchor, "b"), Decision);
			assert.equal(Out, Decision);
			assert.deepEqual(Out.additionalContexts, []);
			assert.ok(Run.Lines.includes("hook-dsh-search-suggester: abstained no-history  0.00"));
			assert.match(DurableLine("abstained no-history"), Durable("abstained no-history  0.00"));
			assert.equal(Run.Lines.filter((Line: string) => Line.includes(": suggest ")).length, 0);
		});
	}

	// Group G3: the existence filter keeps only the real companions.
	{
		const Run = Setup();
		SeedHistory(Run, "c", RootedAnchor, ["CHANGELOG.md", "MISSING.md"]);
		await CheckAsync(Count, "G3: the note names only the companions that exist", async () => {
			const Out = await Post(Run, Read(RootedAnchor, "c"));
			assert.equal(Out.additionalContexts.length, 1);
			assert.deepEqual(Out.additionalContexts[0].source, {
				kind: "search-suggester",
				form: "notice",
				summary: "History 0.87",
			});
			assert.equal(Out.additionalContexts[0].content[0].text, HistoryText);
			assert.equal(Out.additionalContexts[0].content[0].text.includes("MISSING.md"), false);
		});
		await CheckAsync(Count, "G3: the suggest line counts only the existing companion", async () => {
			assert.ok(
				Run.Lines.includes(`hook-dsh-search-suggester: suggest History 0.87 1 candidates`),
			);
			assert.match(
				DurableLine("suggest History 0.87 1 candidates"),
				Durable("suggest History 0.87 1 candidates"),
			);
		});
	}

	// Group G4: a history whose whole companion set is absent.
	{
		const Run = Setup();
		SeedHistory(Run, "d", RootedAnchor, ["MISSING.md", "GONE.md"]);
		await CheckAsync(Count, "G4: an emptied history abstains no-companions", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(Run, Read(RootedAnchor, "d"), Decision);
			assert.equal(Out, Decision);
			assert.ok(
				Run.Lines.includes("hook-dsh-search-suggester: abstained no-companions History 0.87"),
			);
			assert.match(
				DurableLine("abstained no-companions"),
				Durable("abstained no-companions History 0.87"),
			);
			assert.equal(Run.Lines.filter((Line: string) => Line.includes(": suggest ")).length, 0);
		});
	}

	// Group G5: the foreign abstention does not poison the next in-workspace call.
	{
		const Run = Setup();
		SeedHistory(Run, "e", RootedAnchor, ["CHANGELOG.md"]);
		await CheckAsync(Count, "G5: a foreign call never poisons the next in-workspace call", async () => {
			await Post(Run, Read(ForeignIndex, "e"));
			const Out = await Post(Run, Read(RootedAnchor, "e"));
			assert.equal(Out.additionalContexts[0].source.summary, "History 0.87");
			assert.equal(Out.additionalContexts[0].content[0].text.includes("- CHANGELOG.md"), true);
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

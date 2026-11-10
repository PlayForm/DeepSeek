import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import {
	Call,
	CheckAsync,
	Finish,
	LedgerWith,
	LinesWith,
	MakeCounter,
	rmStore,
	Setup,
	WriteStore,
} from "../Harness.js";

/**
 * @module Test
 *
 * The workspace gate and the RECALL VALIDATION against the fake ctx and REAL temp workspaces.
 *
 * @remarks
 *
 * (a) a FOREIGN workspace (a temp tree with the recalled path but no `.git`/`package.json` root)
 * produces NO note and the `abstained foreign-workspace` ledger line; (b) OUR workspace emits a
 * note naming only the recalled regular file that exists - a DELETED path and a bare DIRECTORY
 * are dropped; (c) a record whose files all vanish abstains `no-companions`; (d) a recalled path
 * in the anchor's OWN directory wins outright and the unrelated subtrees are dropped; (e) without
 * such a neighbor a same-tree recalled path ranks ahead of the other release tree's, which is
 * never dropped; (f) a foreign call never poisons the next in-workspace call.
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
 * Mark the tree as a workspace root (the pack-independent `package.json` marker).
 */
const Manifest = (Root: string): void => {
	FileSystem.writeFileSync(Path.join(Root, "package.json"), "{}", "utf8");
};

/**
 * The optional harness service the probe reads (the real shape: get(session)).
 */
const Service = (Cwd: string): { get: () => string } => ({ get: () => Cwd });

/**
 * One valid history record.
 */
const Rec = (Probe: string, Files: string[], Verify = "pnpm test"): unknown => ({
	intent: "Repeat",
	probe: Probe,
	files: Files,
	verify: Verify,
	at: 1700000000,
});

/**
 * The FOREIGN workspace: the recalled path, no root marker.
 */
const Foreign = Tree("replay-suggester-foreign-");
const ForeignFile = Put(Foreign, "src/Core.ts");

/**
 * OUR workspace: the root marker, the call path, and the recalled file.
 */
const Ours = Tree("replay-suggester-ours-");
Manifest(Ours);
const OursFile = Put(Ours, "README.md");
Put(Ours, "src/Core.ts");

/**
 * The EMPTY workspace: the root marker, the call path, and one live file.
 */
const Empty = Tree("replay-suggester-empty-");
Manifest(Empty);
const EmptyFile = Put(Empty, "README.md");
Put(Empty, "src/Core.ts");
Put(Empty, "src/Nested/File.ts");

/** The two release trees side by side (the recall's same-tree rule): the
 * anchor's own directory holds NO recalled file, so the release tree decides. */
const Release = Tree("replay-suggester-release-");
Manifest(Release);
const Peer = Put(Release, "Classic/lib/Peer.ts");
const Other = Put(Release, "EffectTS/src/Other.ts");
const Anchor = Path.join(Release, "Classic/src/Anchor.ts");

/** The same-directory preference (the live-noise shape): the anchor's own
 * folder holds one recalled file, two unrelated subtrees hold the rest, and
 * the anchor itself is a brand-new path the tree does not have yet. */
const Beside = Tree("replay-suggester-beside-");
Manifest(Beside);
const Neighbor = Put(Beside, "packages/one/Source/Function/Exists.ts");
const Subtree = Put(Beside, "packages/two/Source/Function/Exists.ts");
const Cousin = Put(Beside, "packages/one/Source/Interface/Exists.ts");
const BesideAnchor = Path.join(Beside, "packages/one/Source/Function/Apply.ts");

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group G1: the foreign workspace, cwd through the service.
	{
		const Agent = { agent: { id: "agent-a" } };
		rmStore();
		const Run = Setup();
		Run.Context.workingDirectory = Service(Foreign);
		await CheckAsync(Count, "G1: a foreign workspace produces NO note and the foreign-workspace line", async () => {
			const Decision = { kind: "allow", additionalContexts: [{ id: "downstream" }] };
			const Out = await Call(Run, "read", { file_path: ForeignFile }, Agent, Decision);
			assert.equal(Out, Decision);
			assert.deepEqual(Out.additionalContexts, [{ id: "downstream" }]);
			assert.ok(Run.Lines.includes("replay-suggester: abstained foreign-workspace  0.00"));
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
			const Out = await Call(Throwing, "read", { file_path: ForeignFile }, Agent, Decision);
			assert.equal(Out, Decision);
			assert.ok(Throwing.Lines.includes("replay-suggester: abstained foreign-workspace  0.00"));
			assert.deepEqual(Throwing.Warns, []);
		});
	}

	// Group G2: the foreign workspace with NO service at all (the bare mount).
	{
		const Agent = { agent: { id: "agent-a" } };
		rmStore();
		const Run = Setup();
		await CheckAsync(Count, "G2: without the service the absolute foreign path still abstains", async () => {
			const Decision = { kind: "allow" };
			const Out = await Call(Run, "read", { file_path: ForeignFile }, Agent, Decision);
			assert.equal(Out, Decision);
			assert.ok(Run.Lines.includes("replay-suggester: abstained foreign-workspace  0.00"));
			assert.deepEqual(Run.Warns, []);
		});
	}

	// Group G3: OUR workspace - the recall names only the file the tree has.
	{
		const Agent = { agent: { id: "agent-a" } };
		rmStore();
		WriteStore([Rec("README.md", ["src/Core.ts"])]);
		const Run = Setup();
		Run.Context.workingDirectory = Service(Ours);
		await CheckAsync(Count, "G3: the note names only the recalled file that exists", async () => {
			const Out = await Call(Run, "read", { file_path: OursFile }, Agent);
			assert.equal(Out.additionalContexts.length, 1);
			assert.deepEqual(Out.additionalContexts[0].source, {
				kind: "replay-suggester",
				form: "notice",
				summary: "Repeat 0.87",
			});
			assert.equal(
				Out.additionalContexts[0].content[0].text,
				"[replay-suggester] intent=Repeat confidence=0.87\ntargets (1):\n- src/Core.ts - touched last time (Repeat)\nnote: last time verified with pnpm test",
			);
		});
		await CheckAsync(Count, "G3: the suggest line counts only the existing file", async () => {
			assert.deepEqual(LinesWith(Run, "candidates call"), [
				"replay-suggester: suggest Repeat 0.87 1 candidates call read",
			]);
			assert.equal(LedgerWith("suggest Repeat 0.87 1 candidates call read").length, 1);
		});
	}

	// Group G4: the tree validation (deleted, directory, vanished, empty).
	{
		const Agent = { agent: { id: "agent-a" } };
		rmStore();
		WriteStore([Rec("README.md", ["src/Gone.ts", "src/Core.ts"])]);
		const Run = Setup();
		Run.Context.workingDirectory = Service(Empty);
		await CheckAsync(Count, "G4: a recalled path the tree no longer has is dropped", async () => {
			const Out = await Call(Run, "read", { file_path: EmptyFile }, Agent);
			assert.equal(
				Out.additionalContexts[0].content[0].text,
				"[replay-suggester] intent=Repeat confidence=0.87\ntargets (1):\n- src/Core.ts - touched last time (Repeat)\nnote: last time verified with pnpm test",
			);
			assert.deepEqual(LinesWith(Run, "candidates call"), [
				"replay-suggester: suggest Repeat 0.87 1 candidates call read",
			]);
		});
		rmStore();
		WriteStore([Rec("README.md", ["src/Nested", "src/Core.ts"])]);
		const Directory = Setup();
		Directory.Context.workingDirectory = Service(Empty);
		await CheckAsync(Count, "G4: a recalled directory is dropped", async () => {
			const Out = await Call(Directory, "read", { file_path: EmptyFile }, Agent);
			assert.equal(
				Out.additionalContexts[0].content[0].text,
				"[replay-suggester] intent=Repeat confidence=0.87\ntargets (1):\n- src/Core.ts - touched last time (Repeat)\nnote: last time verified with pnpm test",
			);
			assert.equal(Out.additionalContexts[0].content[0].text.includes("src/Nested"), false);
		});
		rmStore();
		WriteStore([Rec("README.md", ["src/Gone.ts", "src/AlsoGone.ts"])]);
		const Vanished = Setup();
		Vanished.Context.workingDirectory = Service(Empty);
		await CheckAsync(Count, "G4: a record whose files all vanish abstains no-companions", async () => {
			const Decision = { kind: "allow" };
			const Out = await Call(Vanished, "read", { file_path: EmptyFile }, Agent, Decision);
			assert.equal(Out, Decision);
			assert.ok(Vanished.Lines.includes("replay-suggester: abstained no-companions Repeat 0.87"));
			assert.equal(LedgerWith("abstained no-companions Repeat 0.87").length, 1);
			assert.equal(LinesWith(Vanished, "candidates call").length, 0);
		});
		rmStore();
		WriteStore([Rec("README.md", [])]);
		const Emptied = Setup();
		Emptied.Context.workingDirectory = Service(Empty);
		await CheckAsync(Count, "G4: a record with an empty file set abstains no-companions", async () => {
			const Decision = { kind: "allow" };
			const Out = await Call(Emptied, "read", { file_path: EmptyFile }, Agent, Decision);
			assert.equal(Out, Decision);
			assert.ok(Emptied.Lines.includes("replay-suggester: abstained no-companions Repeat 0.87"));
			assert.equal(LedgerWith("abstained no-companions Repeat 0.87").length, 1);
			assert.equal(LinesWith(Emptied, "candidates call").length, 0);
		});
	}

	// Group G5: the foreign abstention does not poison the next in-workspace call.
	{
		const Agent = { agent: { id: "agent-a" } };
		rmStore();
		WriteStore([Rec("README.md", ["src/Core.ts"])]);
		const Run = Setup();
		Run.Context.workingDirectory = Service(Foreign);
		await CheckAsync(Count, "G5: a foreign call never poisons the next in-workspace call", async () => {
			await Call(Run, "read", { file_path: ForeignFile }, Agent);
			Run.Context.workingDirectory = Service(Ours);
			const Out = await Call(Run, "read", { file_path: OursFile }, Agent);
			assert.equal(Out.additionalContexts[0].source.summary, "Repeat 0.87");
		});
	}

	// Group G6: the same-tree ranking (the other tree is never dropped), with NO
	// recalled path in the anchor's own directory, so the fallback decides.
	{
		const Agent = { agent: { id: "agent-a" } };
		rmStore();
		WriteStore([Rec("Anchor.ts", [Other, Peer])]);
		const Run = Setup();
		await CheckAsync(Count, "G6: a same-tree recalled path ranks ahead of the other tree's", async () => {
			const Out = await Call(Run, "read", { file_path: Anchor }, Agent);
			assert.equal(
				Out.additionalContexts[0].content[0].text,
				`[replay-suggester] intent=Repeat confidence=0.87\ntargets (2):\n- ${Peer} - touched last time (Repeat)\n- ${Other} - touched last time (Repeat)\nnote: last time verified with pnpm test`,
			);
			assert.deepEqual(LinesWith(Run, "candidates call"), [
				"replay-suggester: suggest Repeat 0.87 2 candidates call read",
			]);
		});
	}

	// Group G7: the anchor's own directory wins (the live-noise fix) - the
	// sibling beside the anchor is the only target and the unrelated subtrees
	// are dropped, even though the anchor file is brand new.
	{
		const Agent = { agent: { id: "agent-a" } };
		rmStore();
		WriteStore([Rec("Apply.ts", [Subtree, Cousin, Neighbor])]);
		const Run = Setup();
		await CheckAsync(
			Count,
			"G7: a same-directory recalled path wins and the unrelated subtrees are dropped",
			async () => {
				const Out = await Call(Run, "read", { file_path: BesideAnchor }, Agent);
				const Text = Out.additionalContexts[0].content[0].text;
				assert.equal(
					Text,
					`[replay-suggester] intent=Repeat confidence=0.87\ntargets (1):\n- ${Neighbor} - touched last time (Repeat)\nnote: last time verified with pnpm test`,
				);
				assert.equal(Text.includes(Subtree), false);
				assert.equal(Text.includes(Cousin), false);
				assert.deepEqual(LinesWith(Run, "candidates call"), [
					"replay-suggester: suggest Repeat 0.87 1 candidates call read",
				]);
			},
		);
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

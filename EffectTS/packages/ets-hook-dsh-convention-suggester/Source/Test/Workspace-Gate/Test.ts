// Source/Test/Workspace-Gate/Test.ts - the workspace gate and the existence
// filter against the fake ctx and REAL temp workspaces: (a) a FOREIGN
// workspace (a temp tree with the pack's triggering path but no
// Documentation/ARCHIVE-STYLE.md) produces NO note and the
// `abstained foreign-workspace` ledger line; (b) OUR workspace (a temp tree
// WITH the signature, a package Source leaf and README.md, WITHOUT SCHEME.md
// and cordis.patch.yml) emits a note naming ONLY the companion that exists;
// (c) an intent whose whole target set is absent abstains `no-companions`;
// (d) a foreign call never poisons the next in-workspace call.
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

/** The FOREIGN workspace: a Ledger-shaped path, no signature file. */
const Foreign = Tree("convention-suggester-foreign-");
const ForeignApply = Put(Foreign, "Source/Function/Apply.ts");

/** OUR workspace: the signature, a package Source leaf and README.md. */
const Ours = Tree("convention-suggester-ours-");
Put(Ours, "Documentation/ARCHIVE-STYLE.md");
const OursSource = Put(Ours, "Classic/packages/x/Source/Library.ts");
Put(Ours, "README.md");

/** The EMPTY workspace: the signature and one TypeScript leaf, no targets. */
const Empty = Tree("convention-suggester-empty-");
Put(Empty, "Documentation/ARCHIVE-STYLE.md");
const EmptySource = Put(Empty, "Foo.ts");

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group G1: the foreign workspace, cwd through the service.
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Foreign);
		await CheckAsync(Count, "G1: a foreign workspace produces NO note and the foreign-workspace line", async () => {
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

	// Group G2: the foreign workspace with NO service at all (the bare mount).
	{
		const Run = Setup();
		// The shared harness supplies a package cwd for the judged fixtures;
		// this group proves the bare-mount fallback, so drop it.
		delete Run.Context.workingDirectory;
		await CheckAsync(Count, "G2: without the service the absolute foreign path still abstains", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(Run, Write(ForeignApply, "a"), Decision);
			assert.equal(Out, Decision);
			assert.ok(Run.Lines.includes("convention-suggester: abstained foreign-workspace  0.00"));
			assert.deepEqual(Run.Warns, []);
		});
	}

	// Group G3: OUR workspace - the existence filter keeps only real targets.
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Ours);
		await CheckAsync(Count, "G3: the note names only the companion that exists", async () => {
			const Out = await Post(Run, Write(OursSource, "a"));
			assert.equal(Out.additionalContexts.length, 1);
			assert.deepEqual(Out.additionalContexts[0].source, {
				kind: "convention-suggester",
				form: "notice",
				summary: "Docs 0.95",
			});
			const Text = Out.additionalContexts[0].content[0].text;
			assert.equal(
				Text,
				"[convention-suggester] intent=Docs confidence=0.95\ntargets (1):\n- README.md - the package must ship its README\nnote: a package ships README + SCHEME; the config table must match the schema.",
			);
			assert.equal(Text.includes("SCHEME.md"), false);
			assert.equal(Text.includes("cordis.patch.yml"), false);
		});
		await CheckAsync(Count, "G3: the suggest line counts only the existing companion", async () => {
			assert.ok(
				Run.Lines.includes("convention-suggester: suggest Docs 0.95 1 candidates call write"),
			);
			assert.match(
				DurableLine("suggest Docs 0.95 1 candidates call write"),
				Durable("suggest Docs 0.95 1 candidates call write"),
			);
		});
	}

	// Group G4: an intent whose whole target set is absent.
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Empty);
		await CheckAsync(Count, "G4: an emptied intent abstains no-companions with the intent and kappa", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(Run, Write(EmptySource, "a"), Decision);
			assert.equal(Out, Decision);
			assert.ok(Run.Lines.includes("convention-suggester: abstained no-companions Naming 0.80"));
			assert.match(
				DurableLine("abstained no-companions"),
				Durable("abstained no-companions Naming 0.80"),
			);
			assert.equal(Run.Lines.filter((Line: string) => Line.includes(": suggest ")).length, 0);
		});
	}

	// Group G5: the foreign abstention does not poison the next in-workspace call.
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Foreign);
		await CheckAsync(Count, "G5: a foreign call never poisons the next in-workspace call", async () => {
			await Post(Run, Write(ForeignApply, "a"));
			Run.Context.workingDirectory = Service(Ours);
			const Out = await Post(Run, Write(OursSource, "a"));
			assert.equal(Out.additionalContexts[0].source.summary, "Docs 0.95");
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

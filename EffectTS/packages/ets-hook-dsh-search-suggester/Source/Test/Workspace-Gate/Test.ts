// Source/Test/Workspace-Gate/Test.ts - the workspace gate and the existence
// filter against the fake ctx and REAL temp workspaces: (a) a FOREIGN
// workspace (a temp tree with the pack's triggering path but no
// Documentation/ARCHIVE-STYLE.md) produces NO note and the
// `abstained foreign-workspace` ledger line; (b) OUR workspace (a temp tree
// WITH the signature, package.json, CHANGELOG.md and the three family globs,
// WITHOUT the other targets) emits a note naming ONLY the candidates that
// exist; (c) a family whose whole candidate set is absent abstains
// `no-companions`; (d) a foreign call never poisons the next in-workspace
// call.
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

/** The strong Version call: the pattern and the path both match. */
const Version = (Path_: string, Id: string): any => ({
	name: "grep",
	arguments: { pattern: "1.2.3 version", path: Path_ },
	agent: AgentOf(Id),
});

/**
 * A dedicated parent for the fixture trees: the base-aware sibling glob
 * (an asterisk followed by `/<rest>`) checks the package parent's immediate
 * subdirectories, so the parent must contain only this fixture's branches
 * (the OS temp dir holds unrelated temp trees that would otherwise satisfy a
 * sibling glob).
 */
const Parent = Tree("search-suggester-workspaces-");
const Branch = (Name: string): string => {
	const Full = Path.join(Parent, Name);
	FileSystem.mkdirSync(Full, { recursive: true });
	return Full;
};

/** The FOREIGN workspace: a package.json, no signature file. */
const Foreign = Branch("foreign");
const ForeignManifest = Put(Foreign, "package.json");

/** OUR workspace: the signature, the manifest, the changelog and the globs. */
const Ours = Branch("ours");
Put(Ours, "Documentation/ARCHIVE-STYLE.md");
const OursManifest = Put(Ours, "package.json");
Put(Ours, "CHANGELOG.md");
Put(Ours, "README.md");
Put(Ours, "CONTRIBUTING.md");
Put(Ours, "SCHEME.md");

/** The EMPTY workspace: the signature only, none of the Owner set. */
const Empty = Branch("empty");
Put(Empty, "Documentation/ARCHIVE-STYLE.md");

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group G1: the foreign workspace, cwd through the service.
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Foreign);
		await CheckAsync(Count, "G1: a foreign workspace produces NO note and the foreign-workspace line", async () => {
			const Decision = { kind: "allow", additionalContexts: [{ id: "downstream" }] };
			const Out = await Post(Run, Version(ForeignManifest, "a"), Decision);
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
			const Out = await Post(Throwing, Version(ForeignManifest, "a"), Decision);
			assert.equal(Out, Decision);
			assert.ok(Throwing.Lines.includes("hook-dsh-search-suggester: abstained foreign-workspace  0.00"));
			assert.deepEqual(Throwing.Warns, []);
		});
	}

	// Group G2: the foreign workspace with NO service at all (the bare mount).
	{
		const Run = Setup();
		await CheckAsync(Count, "G2: without the service the absolute foreign path still abstains", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(Run, Version(ForeignManifest, "a"), Decision);
			assert.equal(Out, Decision);
			assert.ok(Run.Lines.includes("hook-dsh-search-suggester: abstained foreign-workspace  0.00"));
			assert.deepEqual(Run.Warns, []);
		});
	}

	// Group G3: OUR workspace - the existence filter keeps only real candidates.
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Ours);
		await CheckAsync(Count, "G3: the note names only the candidates that exist", async () => {
			const Out = await Post(Run, Version(OursManifest, "a"));
			assert.equal(Out.additionalContexts.length, 1);
			assert.deepEqual(Out.additionalContexts[0].source, {
				kind: "search-suggester",
				form: "notice",
				summary: "Version 0.92",
			});
			const Text = Out.additionalContexts[0].content[0].text;
			assert.equal(
				Text,
				"[search-suggester] intent=Version confidence=0.92\ntargets (5):\n- package.json - the monorepo manifest\n- CHANGELOG.md - the new section\n- **/README.md - the long tail\n- **/CONTRIBUTING.md - the long tail\n- **/SCHEME.md - the long tail\nnote: open these before more searches; Target/ is generated, never edit it.",
			);
			assert.equal(Text.includes("Site/Source/Library/Content.ts"), false);
			assert.equal(Text.includes("Documentation/Plugins/PLUGIN-FAMILY.md"), false);
		});
		await CheckAsync(Count, "G3: the suggest line counts only the existing candidates", async () => {
			assert.ok(Run.Lines.includes("hook-dsh-search-suggester: suggest Version 0.92 5 candidates"));
			assert.match(
				DurableLine("suggest Version 0.92 5 candidates"),
				Durable("suggest Version 0.92 5 candidates"),
			);
		});
	}

	// Group G4: a family whose whole candidate set is absent.
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Empty);
		await CheckAsync(Count, "G4: an emptied family abstains no-companions with the family and kappa", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(
				Run,
				{
					name: "grep",
					arguments: { pattern: "CONTRIBUTING", path: "" },
					agent: AgentOf("a"),
				},
				Decision,
			);
			assert.equal(Out, Decision);
			assert.ok(
				Run.Lines.includes("hook-dsh-search-suggester: abstained no-companions Owner 0.66"),
			);
			assert.match(
				DurableLine("abstained no-companions"),
				Durable("abstained no-companions Owner 0.66"),
			);
			assert.equal(Run.Lines.filter((Line: string) => Line.includes(": suggest ")).length, 0);
		});
	}

	// Group G5: the foreign abstention does not poison the next in-workspace call.
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Foreign);
		await CheckAsync(Count, "G5: a foreign call never poisons the next in-workspace call", async () => {
			await Post(Run, Version(ForeignManifest, "a"));
			Run.Context.workingDirectory = Service(Ours);
			const Out = await Post(Run, Version(OursManifest, "a"));
			assert.equal(Out.additionalContexts[0].source.summary, "Version 0.92");
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

// Source/Test/Workspace-Gate/Test.ts - the workspace gate and the existence
// filter against the fake ctx and REAL temp workspaces: (a) a FOREIGN
// workspace (a temp tree with the pack's triggering path but no
// Documentation/ARCHIVE-STYLE.md) produces NO note and the
// `abstained foreign-workspace` ledger line, whether the cwd arrives through
// the optional harness service, is absent, or its getter throws; (b) OUR
// workspace (a temp tree WITH the signature, a Config.ts, README.md and the
// site surface, WITHOUT SCHEME.md/cordis.patch.yml) emits a note naming ONLY
// the companions that exist; (c) a family whose whole companion set is absent
// abstains `no-companions`; (d) a foreign call never poisons the next
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

/** The FOREIGN workspace: the pack's triggering path, no signature file. */
const Foreign = Tree("edit-suggester-foreign-");
const ForeignIndex = Put(Foreign, "Documentation/INDEX.md");

/** OUR workspace: the signature, a Config.ts, README.md and the site surface. */
const Ours = Tree("edit-suggester-ours-");
Put(Ours, "Documentation/ARCHIVE-STYLE.md");
const OursConfig = Put(Ours, "Source/Variable/Config.ts");
Put(Ours, "README.md");
Put(Ours, "Site/Source/Component/Configurator.astro");

/** The EMPTY workspace: the signature, a workflow, none of its companions. */
const Empty = Tree("edit-suggester-empty-");
Put(Empty, "Documentation/ARCHIVE-STYLE.md");
const EmptyWorkflow = Put(Empty, ".github/workflows/NPM.yml");

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group G1: the foreign workspace, cwd through the service.
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Foreign);
		await CheckAsync(Count, "G1: a foreign workspace produces NO note and the foreign-workspace line", async () => {
			const Decision = { kind: "allow", additionalContexts: [{ id: "downstream" }] };
			const Out = await Post(
				Run,
				{ name: "edit", arguments: { file_path: ForeignIndex }, agent: AgentOf("a") },
				Decision,
			);
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
			const Out = await Post(
				Throwing,
				{ name: "edit", arguments: { file_path: ForeignIndex }, agent: AgentOf("a") },
				Decision,
			);
			assert.equal(Out, Decision);
			assert.ok(Throwing.Lines.includes("hook-dsh-edit-suggester: abstained foreign-workspace  0.00"));
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
			const Out = await Post(
				Run,
				{ name: "edit", arguments: { file_path: ForeignIndex }, agent: AgentOf("a") },
				Decision,
			);
			assert.equal(Out, Decision);
			assert.ok(Run.Lines.includes("hook-dsh-edit-suggester: abstained foreign-workspace  0.00"));
			assert.deepEqual(Run.Warns, []);
		});
	}

	// Group G3: OUR workspace - the existence filter keeps only real companions.
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Ours);
		await CheckAsync(Count, "G3: the note names only the companions that exist", async () => {
			const Out = await Post(Run, {
				name: "edit",
				arguments: { file_path: OursConfig },
				agent: AgentOf("a"),
			});
			assert.equal(Out.additionalContexts.length, 1);
			assert.deepEqual(Out.additionalContexts[0].source, {
				kind: "edit-suggester",
				form: "notice",
				summary: "Config 0.87",
			});
			const Text = Out.additionalContexts[0].content[0].text;
			assert.equal(
				Text,
				"[edit-suggester] family=Config confidence=0.87\ncompanions (2):\n- README.md - the Config section\n- Site/Source/Component/Configurator.astro - the site surface\nnote: this file rarely stands alone; check whether these need the same change.",
			);
			assert.equal(Text.includes("SCHEME.md"), false);
			assert.equal(Text.includes("cordis.patch.yml"), false);
		});
		await CheckAsync(Count, "G3: the suggest line counts only the existing companions", async () => {
			assert.ok(
				Run.Lines.includes(
					`hook-dsh-edit-suggester: suggest Config 0.87 2 companions ${OursConfig}`,
				),
			);
			assert.match(
				DurableLine(`suggest Config 0.87 2 companions ${OursConfig}`),
				Durable(`suggest Config 0.87 2 companions ${OursConfig}`),
			);
		});
	}

	// Group G4: a family whose whole companion set is absent.
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Empty);
		await CheckAsync(Count, "G4: an emptied family abstains no-companions with the family and kappa", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(
				Run,
				{ name: "edit", arguments: { file_path: EmptyWorkflow }, agent: AgentOf("a") },
				Decision,
			);
			assert.equal(Out, Decision);
			assert.ok(
				Run.Lines.includes("hook-dsh-edit-suggester: abstained no-companions Workflow 0.87"),
			);
			assert.match(
				DurableLine("abstained no-companions"),
				Durable("abstained no-companions Workflow 0.87"),
			);
			assert.equal(Run.Lines.filter((Line: string) => Line.includes(": suggest ")).length, 0);
		});
	}

	// Group G5: the foreign abstention does not poison the next in-workspace call.
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Foreign);
		await CheckAsync(Count, "G5: a foreign call never poisons the next in-workspace call", async () => {
			await Post(Run, { name: "edit", arguments: { file_path: ForeignIndex }, agent: AgentOf("a") });
			Run.Context.workingDirectory = Service(Ours);
			const Out = await Post(Run, {
				name: "edit",
				arguments: { file_path: OursConfig },
				agent: AgentOf("a"),
			});
			assert.equal(Out.additionalContexts[0].source.summary, "Config 0.87");
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

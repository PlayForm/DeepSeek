// Source/Test/Index-Workspace/Test.ts - the INDEXING TRIGGER over a REAL
// temp fixture tree: `indexWorkspace` walks the tree deterministically, never
// follows a symlink out of the root, prunes an excluded directory, bounds the
// walk with maxFiles, and indexes every candidate through the existing
// per-file gates; the graph it fills answers snapshot/find/getNode/expand and
// neighborhood; a second run is idempotent; the fs/observed listener
// re-indexes an observed change with a per-path debounce; and the disabled
// gate still skips every candidate with the byte-exact lines.
//
// The tree is written to disk (node:fs) and served through the harness's
// disk-backed fake fs, so the walk, the realpath identity and the symlink
// containment are exercised for real.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as Path from "node:path";
import {
	Check,
	CheckAsync,
	Contexts,
	Emit,
	Finish,
	Handlers,
	LinesWith,
	MakeCounter,
	MakeDisk,
	Subscribers,
	Tree,
} from "../Harness.js";

/** src/core.ts imports util through a .ts specifier: the v0 parser adds no
 * extension, so a resolved imports edge needs the exact path. */
const CORE = 'import { util } from "./util.ts";\n\nexport function core(): number {\n\treturn util;\n}\n';

const CORE_CHANGED =
	'import { util } from "./util.ts";\n\nexport function core(): number {\n\treturn util;\n}\n\nexport function extra(): number {\n\treturn 2;\n}\n';

const UTIL = "export const util = 1;\n";

const UTIL_CHANGED = "export const util = 42;\n";

const TEST_FILE = 'import { core } from "./core.ts";\n\nexport const suite = core;\n';

const MARKDOWN = "# The workspace\n\nIntro text.\n\n## Section\n";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	const Fixture = Tree({
		"src/core.ts": CORE,
		"src/util.ts": UTIL,
		"src/core.test.ts": TEST_FILE,
		"README.md": MARKDOWN,
		"node_modules/pkg/index.ts": "export const vendored = 1;\n",
	});
	const Root = Fixture.root;
	const CorePath = Path.join(Root, "src/core.ts");
	const UtilPath = Path.join(Root, "src/util.ts");
	const Secret = Path.join(Fixture.outside, "secret.ts");
	FileSystem.writeFileSync(Secret, "export const secret = 1;\n");
	FileSystem.symlinkSync(Secret, Path.join(Root, "src/link.ts"));

	// Group I1: the walk and the counts.
	{
		const Run = MakeDisk(Root, { enabled: true });
		const Summary = await Run.Graph.indexWorkspace(Root);
		Check(Count, "I1: indexWorkspace indexes the fixture tree and returns the counts", () => {
			assert.deepEqual(Summary, { indexed: 4, skipped: 0, failed: 0, files: 4 });
			assert.deepEqual(LinesWith(Run, "workspace indexed"), [
				"graph: workspace indexed 4 files (4 indexed, 0 skipped, 0 failed)",
			]);
			assert.equal(Run.Graph.statistics().files, 4);
			assert.equal(Run.Graph.statistics().indexRevision, "4");
		});
		Check(Count, "I1: the walk never follows the symlink out of the root and prunes node_modules", () => {
			assert.equal(
				Run.loggerLines.some((Line: string) => Line.includes("link.ts")),
				false,
				"the out-of-root symlink is never a candidate",
			);
			assert.equal(
				Run.loggerLines.some((Line: string) => Line.includes("node_modules")),
				false,
				"the excluded directory is not descended",
			);
			assert.equal(
				Run.loggerLines.some((Line: string) => Line.includes("secret")),
				false,
				"the outside target is never read",
			);
		});
		Check(Count, "I1: the graph sees the records through snapshot, find and getNode", () => {
			const Snapshot = Run.Graph.snapshot();
			assert.equal(Snapshot.nodes.length, 11);
			assert.equal(Snapshot.edges.length, 9);
			assert.equal(Run.Graph.find({ kind: "File" }).length, 4);
			assert.equal(Run.Graph.find({ kind: "DocSection" }).length, 2);
			assert.equal(Run.Graph.find({ kind: "Test" }).length, 1);
			const Core = Run.Graph.getNode(`File:${CorePath}`);
			assert.ok(Core !== undefined, "the File node exists under its resolved path");
			assert.match(Core.version, /^\d+(\.\d+)?-\d+$/);
			assert.equal(Run.Graph.getNode(`Symbol:${CorePath}:core`)?.name, "core");
			assert.equal(Run.Graph.getNode(`Block:${CorePath}:4:body`)?.kind, "Block");
			assert.equal(
				Run.Graph.getNode(`DocSection:${Path.join(Root, "README.md")}:1`)?.name,
				"The workspace",
			);
		});
		Check(Count, "I1: expand follows the resolved imports edge", () => {
			const Expansion = Run.Graph.expand(`File:${CorePath}`);
			assert.deepEqual(
				Expansion.nodes.map((Node: any) => Node.id),
				[
					`File:${CorePath}`,
					`Symbol:${CorePath}:core`,
					`Block:${CorePath}:4:body`,
					`File:${UtilPath}`,
				],
			);
			assert.deepEqual(
				Expansion.edges.map((Edge: any) => `${Edge.kind} ${Edge.to}`),
				[
					`contains Symbol:${CorePath}:core`,
					`contains Block:${CorePath}:4:body`,
					`imports File:${UtilPath}`,
				],
			);
		});
		Check(Count, "I1: neighborhood serves the component the suggester consumes", () => {
			assert.deepEqual(Run.Graph.neighborhood(CorePath), [
				{ path: CorePath, role: "definition", reason: "the definition" },
				{
					path: Path.join(Root, "src/core.test.ts"),
					role: "test",
					reason: "the tests",
				},
				{ path: UtilPath, role: "dependency", reason: "the dependencies" },
			]);
			assert.deepEqual(Run.Graph.neighborhood("src/core.ts"), Run.Graph.neighborhood(CorePath));
			assert.deepEqual(Run.Graph.neighborhood(Path.join(Root, "missing.ts")), []);
		});
	}

	// Group I2: idempotence and the walk bound.
	{
		const Run = MakeDisk(Root, { enabled: true });
		await Run.Graph.indexWorkspace(Root);
		const First = Run.Graph.snapshot();
		const Summary = await Run.Graph.indexWorkspace(Root);
		const Second = Run.Graph.snapshot();
		Check(Count, "I2: a second run is idempotent (same records, same fingerprints)", () => {
			assert.deepEqual(Summary, { indexed: 4, skipped: 0, failed: 0, files: 4 });
			assert.deepEqual(
				Second.nodes.map((Node: any) => `${Node.id} ${Node.fingerprint}`),
				First.nodes.map((Node: any) => `${Node.id} ${Node.fingerprint}`),
			);
			assert.equal(Run.Graph.statistics().indexRevision, "8");
		});
		{
			const Bounded = MakeDisk(Root, { enabled: true });
			const BoundedSummary = await Bounded.Graph.indexWorkspace(Root, { maxFiles: 2 });
			Check(Count, "I2: maxFiles bounds the walk and the cap is ledgered", () => {
				assert.deepEqual(BoundedSummary, { indexed: 2, skipped: 0, failed: 0, files: 2 });
				assert.ok(Bounded.loggerLines.includes("graph: workspace capped at 2 files"));
				assert.deepEqual(LinesWith(Bounded, "workspace indexed"), [
					"graph: workspace indexed 2 files (2 indexed, 0 skipped, 0 failed)",
				]);
			});
			const Zero = MakeDisk(Root, { enabled: true });
			const ZeroSummary = await Zero.Graph.indexWorkspace(Root, { maxFiles: 0 });
			Check(Count, "I2: maxFiles 0 indexes nothing and is still bounded (never unbounded)", () => {
				assert.deepEqual(ZeroSummary, { indexed: 0, skipped: 0, failed: 0, files: 0 });
				assert.ok(Zero.loggerLines.includes("graph: workspace capped at 0 files"));
				assert.deepEqual(LinesWith(Zero, "workspace indexed"), [
					"graph: workspace indexed 0 files (0 indexed, 0 skipped, 0 failed)",
				]);
			});
		}
		{
			const Broken = MakeDisk(Root, { enabled: true });
			await CheckAsync(Count, "I2: a root that cannot be listed rejects instead of reporting zero", async () => {
				await assert.rejects(
					() => Broken.Graph.indexWorkspace(Path.join(Root, "missing")),
					/cannot list/,
				);
				assert.equal(Broken.Graph.statistics().files, 0);
			});
		}
	}

	// Group I3: the fs/observed listener.
	{
		const Run = MakeDisk(Root, { enabled: true });
		await Run.Graph.indexWorkspace(Root);
		const Before = Run.Graph.getNode(`File:${CorePath}`);
		FileSystem.writeFileSync(CorePath, CORE_CHANGED);
		Emit(Run, { targetKey: CorePath, displayPath: CorePath }, { kind: "present", version: "v2" });
		await Run.State.Flush;
		Check(Count, "I3: the trace subscription is wired when the graph is enabled", () => {
			assert.equal(Subscribers(Run, "observe/stamp"), 1);
			assert.equal(
				Handlers(Run, "fs/observed"),
				0,
				"the direct root registration is gone - the bus is the source",
			);
			assert.equal(Run.Context.root, Run.Context, "the fake ctx is its own root");
		});
		Check(Count, "I3: an observed change re-indexes the file with the byte-exact line", () => {
			assert.ok(
				Run.loggerLines.includes(`graph: reindexed ${CorePath} (indexed)`),
				JSON.stringify(LinesWith(Run, "reindexed")),
			);
			assert.equal(Run.Graph.statistics().indexRevision, "5");
			const After = Run.Graph.getNode(`File:${CorePath}`);
			assert.notEqual(After.fingerprint, Before.fingerprint);
			assert.notEqual(After.version, Before.version);
			assert.equal(
				Run.Graph.find({ name: "extra" }).length,
				1,
				"the changed symbol set is in the graph",
			);
			assert.equal(Run.Graph.snapshot().nodes.length, 13);
		});
		FileSystem.writeFileSync(UtilPath, UTIL_CHANGED);
		Emit(Run, { targetKey: UtilPath, displayPath: UtilPath });
		Emit(Run, { targetKey: UtilPath, displayPath: UtilPath });
		await Run.State.Flush;
		Check(Count, "I3: rapid events for one path are coalesced into one re-index", () => {
			assert.equal(LinesWith(Run, `reindexed ${UtilPath}`).length, 1);
			assert.equal(Run.Graph.statistics().indexRevision, "6");
			assert.equal(Run.Graph.find({ name: "util" }).length, 1);
		});
		Check(Count, "I3: an excluded path and an absent observation are ignored silently", () => {
			const Revision = Run.Graph.statistics().indexRevision;
			Emit(Run, {
				targetKey: Path.join(Root, "node_modules/pkg/index.ts"),
				displayPath: Path.join(Root, "node_modules/pkg/index.ts"),
			});
			Emit(Run, { targetKey: CorePath, displayPath: CorePath }, { kind: "absent" });
			assert.equal(Run.Graph.statistics().indexRevision, Revision);
			assert.equal(LinesWith(Run, "reindexed").length, 2);
			assert.equal(LinesWith(Run, "node_modules").length, 0);
		});
	}

	// Group I4: the disabled gate.
	{
		const Run = MakeDisk(Root, { enabled: false });
		const Summary = await Run.Graph.indexWorkspace(Root);
		Check(Count, "I4: a disabled graph still walks but every candidate is skipped", () => {
			assert.deepEqual(Summary, { indexed: 0, skipped: 4, failed: 0, files: 0 });
			assert.equal(Handlers(Run, "fs/observed"), 0, "a disabled graph wires no listener");
			assert.equal(
				Subscribers(Run, "observe/stamp"),
				0,
				"a disabled graph subscribes to nothing",
			);
			for (const Path_ of [
				Path.join(Root, "README.md"),
				Path.join(Root, "src/core.test.ts"),
				Path.join(Root, "src/core.ts"),
				Path.join(Root, "src/util.ts"),
			]) {
				assert.ok(
					Run.loggerLines.includes(`graph: skipped ${Path_} (disabled)`),
					`the byte-exact disabled line for ${Path_}`,
				);
			}
			assert.deepEqual(LinesWith(Run, "workspace indexed"), [
				"graph: workspace indexed 4 files (0 indexed, 4 skipped, 0 failed)",
			]);
		});
	}

	// Group I5: the A7 purity guard.
	{
		Check(Count, "I5: the fake fs records zero writeText calls (A7)", () => {
			const Total = Contexts.reduce(
				(Sum: number, Ctx: any) => Sum + (Ctx.__writeCapture as unknown[]).length,
				0,
			);
			assert.equal(Total, 0, "the plugin never writes a file through ctx.fs");
		});
	}

	return Finish(Count, "Index-Workspace");
};

// Standalone entry: `node Target/Test/Index-Workspace/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Index-Workspace`);
}

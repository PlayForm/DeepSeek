// Source/Test/Store-And-Limits/Test.ts - the store round-trip and the gate
// limits: the domain opens on the fake facility with the byte-exact opened
// line, indexFile persists the record and the meta revision and snapshot
// returns what it stored (A6), removeFile deletes/bumps/ledgers, a stored
// record that fails validation is skipped and counted (never guessed), the
// find limits and filters, the size gate, the exclude and include gates, the
// disabled posture, and the A7 purity guard (zero writeText calls).
// Unit smoke of @playform/plugin-dsh-workspace-graph: the fake ctx + the REAL
// built class, from the Harness.
import assert from "node:assert/strict";
import { Check, CheckAsync, Contexts, FakeStorage, Finish, MakeCounter, MakeGraph, Settled } from "../Harness.js";

const Content = (Count: number): string =>
	Array.from({ length: Count }, (_, Index) => `export const value${Index} = ${Index};\n`).join("");

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	const Path = "/proj/src/store.ts";
	const Files = { [Path]: Content(4) };

	// Group: the domain open (byte-exact line, the declared spec).
	{
		const Storage = FakeStorage();
		const Run = MakeGraph({ enabled: true, files: Files }, Storage);
		await Settled(Run);
		Check(Count, "store: the domain opens on the fake facility and the opened line is byte-exact", () => {
			assert.equal(Storage.spec?.name, "workspace_graph");
			assert.equal(Storage.spec?.layout, "per-record");
			assert.ok(Storage.spec?.tables?.records !== undefined, "the records table is declared");
			assert.ok(
				Run.loggerLines.includes("graph: domain workspace_graph opened (0 records)"),
				JSON.stringify(Run.loggerLines),
			);
		});
	}

	// Group: the round-trip (A6).
	{
		const Storage = FakeStorage();
		const Run = MakeGraph({ enabled: true, files: Files }, Storage);
		await Settled(Run);
		const First = await Run.Graph.indexFile(Path);
		const Stored = Storage.records.get(Path) as any;
		Check(Count, "store: indexFile persists the record and the meta revision (A6)", () => {
			assert.equal(First.status, "indexed");
			assert.equal(Stored.version, "v1");
			assert.equal(Stored.nodes.length, First.nodes);
			assert.equal(Stored.edges.length, First.edges);
			assert.deepEqual((Storage.records.get("__meta") as any).indexRevision, 1);
		});
		Check(Count, "store: snapshot returns what indexFile stored and the revision increments (A6)", () => {
			const Snapshot = Run.Graph.snapshot();
			assert.deepEqual(Snapshot.nodes, Stored.nodes);
			assert.deepEqual(Snapshot.edges, Stored.edges);
			assert.equal(Snapshot.indexRevision, "1");
			assert.equal(Run.Graph.statistics().files, 1);
			assert.equal(Run.State.Revision, 1);
		});
	}

	// Group: the revision increments per successful index.
	{
		const Run = MakeGraph({ enabled: true, files: Files });
		await Run.Graph.indexFile(Path);
		await Run.Graph.indexFile(Path);
		Check(Count, "store: the revision increments with every successful index (A6)", () => {
			assert.equal(Run.Graph.statistics().indexRevision, "2");
			assert.equal(Run.State.Revision, 2);
		});
	}

	// Group: removeFile.
	{
		const Storage = FakeStorage();
		const Run = MakeGraph({ enabled: true, files: Files }, Storage);
		await Settled(Run);
		await Run.Graph.indexFile(Path);
		const Removed = await Run.Graph.removeFile(Path);
		await CheckAsync(Count, "store: removeFile deletes the record, bumps the revision and logs the byte-exact removed line", async () => {
			assert.equal(Removed, true);
			assert.equal(Storage.records.has(Path), false);
			assert.equal(Run.Graph.statistics().files, 0);
			assert.equal(Run.Graph.statistics().indexRevision, "2");
			assert.ok(Run.loggerLines.includes(`graph: removed ${Path}`));
			assert.equal(await Run.Graph.removeFile(Path), false, "removing again is a silent false");
		});
	}

	// Group: the invalid stored record is skipped and counted, never guessed.
	{
		const Storage = FakeStorage();
		Storage.seed("/proj/src/broken.ts", { version: 42 });
		Storage.seed(Path, {
			version: "v1",
			fingerprint: "seeded",
			nodes: [
				{ id: `File:${Path}`, kind: "File", path: Path, fingerprint: "seeded", version: "v1" },
			],
			edges: [],
		});
		const Run = MakeGraph({ enabled: true, files: Files }, Storage);
		await Settled(Run);
		Check(Count, "store: a stored record that fails validation is skipped and counted, never guessed", () => {
			assert.equal(Run.State.Invalid, 1, "the broken record was counted");
			assert.ok(
				Run.loggerLines.includes("graph: domain workspace_graph opened (1 records)"),
				"only the valid record was loaded",
			);
			assert.equal(Run.Graph.getNode(`File:${Path}`)?.fingerprint, "seeded");
			assert.equal(Run.Graph.snapshot().nodes.some((N: any) => N.id.includes("broken")), false);
		});
	}

	// Group: the find limits and filters.
	{
		const Run = MakeGraph({ enabled: true, files: Files });
		await Run.Graph.indexFile(Path);
		Run.State.Config.limitMaximum = 2;
		Check(Count, "limits: find defaults to limitDefault and caps at limitMaximum", () => {
			assert.equal(Run.Graph.find({}).length, 2, "default 50 capped at 2");
			assert.equal(Run.Graph.find({ limit: 99 }).length, 2, "request capped at 2");
			assert.equal(Run.Graph.find({ limit: 1 }).length, 1, "smaller request honored");
		});
		Run.State.Config.limitMaximum = 500;
		Check(Count, "limits: find filters by kind, name and pattern", () => {
			assert.equal(Run.Graph.find({ kind: "File" }).length, 1);
			assert.equal(Run.Graph.find({ kind: "Symbol" }).length, 4);
			assert.equal(Run.Graph.find({ name: "value2" }).length, 1);
			assert.equal(Run.Graph.find({ pattern: "VALUE2" }).length, 1, "pattern is case-insensitive");
			assert.equal(Run.Graph.find({ name: "value2", kind: "Block" }).length, 0);
		});
	}

	// Group: the size gate and the glob gates (byte-exact skipped lines).
	{
		const Run = MakeGraph({ enabled: true, files: Files });
		await Run.Graph.indexFile(Path);
		Run.State.Config.maxFileBytes = 5;
		const TooBig = await Run.Graph.indexFile(Path);
		Check(Count, "limits: a file above maxFileBytes is skipped with the byte-exact line", () => {
			assert.deepEqual(TooBig, {
				path: Path,
				status: "skipped",
				nodes: 0,
				edges: 0,
				reason: `file too large (${(Files[Path] as string).length} > 5 bytes)`,
			});
			assert.ok(
				Run.loggerLines.includes(`graph: skipped ${Path} (file too large (${(Files[Path] as string).length} > 5 bytes))`),
			);
		});
	}
	{
		const Run = MakeGraph({ enabled: true, files: { "/proj/node_modules/pkg/index.ts": "export const a = 1;\n" } });
		const Outcome = await Run.Graph.indexFile("/proj/node_modules/pkg/index.ts");
		Check(Count, "limits: an excluded path is skipped with the byte-exact excluded line", () => {
			assert.equal(Outcome.reason, "excluded");
			assert.ok(
				Run.loggerLines.includes("graph: skipped /proj/node_modules/pkg/index.ts (excluded)"),
			);
		});
	}
	{
		const Run = MakeGraph({ enabled: true, files: { "/proj/other/thing.ts": "export const a = 1;\n" }, include: ["**/src/**"] });
		const Outcome = await Run.Graph.indexFile("/proj/other/thing.ts");
		Check(Count, "limits: a file outside the include list is skipped with the byte-exact line", () => {
			assert.equal(Outcome.reason, "not included");
			assert.ok(Run.loggerLines.includes("graph: skipped /proj/other/thing.ts (not included)"));
		});
	}

	// Group: the disabled posture.
	{
		const Run = MakeGraph({ files: Files, enabled: false });
		const Outcome = await Run.Graph.indexFile(Path);
		Check(Count, "disabled: with enabled=false indexFile skips with the byte-exact disabled line", () => {
			assert.equal(Outcome.reason, "disabled");
			assert.ok(Run.loggerLines.includes(`graph: skipped ${Path} (disabled)`));
			assert.equal(Run.Graph.statistics().files, 0);
			assert.ok(
				Run.loggerLines.includes("graph: activated (domain=workspace_graph, languages=3)"),
				"the service still registers and announces itself",
			);
		});
	}

	// Group: the A7 purity guard.
	{
		Check(Count, "purity: the fake fs records zero writeText calls (A7)", () => {
			const Total = Contexts.reduce((Sum: number, Ctx: any) => Sum + (Ctx.__writeCapture as unknown[]).length, 0);
			assert.equal(Total, 0, "the plugin never writes a file through ctx.fs");
		});
	}

	return Finish(Count, "Store-And-Limits");
};

// Standalone entry: `node Target/Test/Store-And-Limits/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Store-And-Limits`);
}

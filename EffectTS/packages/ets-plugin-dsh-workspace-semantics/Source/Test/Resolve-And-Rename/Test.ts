// Source/Test/Resolve-And-Rename/Test.ts - the resolve/rename/refusal
// semantics: the lazy model build through the default TypeScript adapter,
// the byte-exact resolve and refusal lines, the symbol lookup and the
// reference list, the invalidation-driven rebuild, the index cap, the
// any-file adapter seam, the rename plan and its refusal arms, and the
// statistics triple.
import assert from "node:assert/strict";
import {
	Boot,
	Check,
	CheckAsync,
	Finish,
	Fire,
	Ledger,
	LinesWith,
	MakeCounter,
	Make,
	rm,
	Validate,
} from "../Harness.js";

/** The TS snippet the resolve tests build against. */
const Source = "const foo = 1;\nfoo.bar;\n";

/** A standard enabled mount with seeded file contents. */
const Setup = async (
	Config: Record<string, unknown> = {},
	Contents: Record<string, string> = { "/src/a.ts": Source },
): Promise<any> => {
	rm();
	const Run = Make(Validate({ logFile: Ledger, enabled: true, ...Config }));
	Run.Fs.contents = Contents;
	await Boot();
	return Run;
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group R1: the lazy resolve through the TypeScript adapter.
	{
		const Run = await Setup();
		const Service = Run.Context.workspaceSemantics;
		await CheckAsync(Count, "R1: resolve builds the model through the adapter", async () => {
			const Model = await Service.resolve("/src/a.ts");
			assert.equal(Model.path, "/src/a.ts");
			assert.equal(Model.version, "manual");
			assert.equal(Model.freshness, "fresh");
			assert.equal(Model.indexRevision, 1);
			assert.deepEqual(
				Model.symbols.map((S: any) => [S.kind, S.qualifiedName, S.fingerprint]),
				[["const", "foo", "const:foo"]],
			);
			assert.deepEqual(
				Model.references.map((R: any) => R.target),
				["foo.bar"],
			);
			assert.deepEqual(Model.dependencies, []);
		});
		Check(Count, "R1: the resolve line is byte-exact and the file was read once", () => {
			assert.deepEqual(LinesWith(Run, "resolved /src/a.ts"), [
				"semantics: resolved /src/a.ts (1 symbols, 1 references)",
			]);
			assert.deepEqual(Run.Fs.reads, ["/src/a.ts"]);
		});
		await CheckAsync(Count, "R1: the lookup and the reference list read the built model", async () => {
			const Symbol = Service.symbol("/src/a.ts", "foo");
			assert.equal(Symbol.kind, "const");
			assert.equal(Symbol.qualifiedName, "foo");
			assert.equal(Service.symbol("/src/a.ts", "nope"), undefined);
			assert.equal(Service.symbol("/src/none.ts", "foo"), undefined);
			assert.deepEqual(
				Service.references("/src/a.ts").map((R: any) => R.target),
				["foo.bar"],
			);
			assert.deepEqual(Service.references("/src/none.ts"), []);
			assert.deepEqual(Service.statistics(), { paths: 1, revision: 1, adapters: 7 });
		});
	}

	// Group R2: the refusals.
	{
		const Run = await Setup({ exclude: ["skipme"] }, {});
		const Service = Run.Context.workspaceSemantics;
		await CheckAsync(Count, "R2: a path with no adapter refuses with the byte-exact line", async () => {
			assert.equal(await Service.resolve("/doc/readme.md"), undefined);
			assert.deepEqual(LinesWith(Run, "refused /doc/readme.md"), [
				"semantics: refused /doc/readme.md (no adapter for .md)",
			]);
		});
		await CheckAsync(Count, "R2: an excluded path refuses before any read", async () => {
			assert.equal(await Service.resolve("/repo/skipme/x.ts"), undefined);
			assert.deepEqual(LinesWith(Run, "refused /repo/skipme/x.ts"), []);
			assert.deepEqual(LinesWith(Run, "ignored /repo/skipme/x.ts"), [
				"semantics: ignored /repo/skipme/x.ts (excluded)",
			]);
			assert.equal(Run.Fs.reads.length, 0);
		});
		await CheckAsync(Count, "R2: an empty path fails with the byte-exact line", async () => {
			assert.equal(await Service.resolve(""), undefined);
			assert.deepEqual(LinesWith(Run, "failed resolve"), [
				"semantics: failed resolve (empty path)",
			]);
		});
		await CheckAsync(Count, "R2: a missing file fails with the byte-exact line", async () => {
			assert.equal(await Service.resolve("/src/gone.ts"), undefined);
			assert.ok(
				Run.Lines.some((Line: string) => Line.startsWith("semantics: failed /src/gone.ts (ENOENT")),
			);
		});
	}

	// Group R3: no fs reader.
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger, enabled: true }), (Context: any) => {
			Context.fs = undefined;
		});
		await Boot();
		await CheckAsync(Count, "R3: without a text reader the resolve fails byte-exactly", async () => {
			assert.equal(await Run.Context.workspaceSemantics.resolve("/src/a.ts"), undefined);
			assert.deepEqual(LinesWith(Run, "failed /src/a.ts"), [
				"semantics: failed /src/a.ts (no fs text reader)",
			]);
		});
	}

	// Group R4: the invalidation-driven rebuild and the index cap.
	{
		const Run = await Setup();
		const Service = Run.Context.workspaceSemantics;
		await Service.resolve("/src/a.ts");
		Fire(Run, "/src/a.ts", "2");
		await CheckAsync(Count, "R4: an observed write invalidates the model and forces a rebuild", async () => {
			assert.equal(Run.State.Index.has("/src/a.ts"), false);
			const Rebuilt = await Service.resolve("/src/a.ts");
			assert.equal(Rebuilt.indexRevision, 3);
			assert.deepEqual(LinesWith(Run, "indexed /src/a.ts"), [
				"semantics: indexed /src/a.ts version 2 (revision 2)",
			]);
			assert.equal(Run.Fs.reads.length, 2);
		});
	}
	{
		const Run = await Setup({ maxEntries: 1 }, { "/src/a.ts": Source, "/src/b.ts": Source });
		const Service = Run.Context.workspaceSemantics;
		await Service.resolve("/src/a.ts");
		await Service.resolve("/src/b.ts");
		Check(Count, "R4: the index caps at maxEntries by oldest revision", () => {
			assert.equal(Run.State.Index.size, 1);
			assert.ok(Run.State.Index.has("/src/b.ts"));
			assert.ok(!Run.State.Index.has("/src/a.ts"));
		});
	}

	// Group R5: the any-file adapter seam.
	{
		const Run = await Setup({}, { "/doc/readme.md": "intro text" });
		const Service = Run.Context.workspaceSemantics;
		await CheckAsync(Count, "R5: adapt() registers an adapter and the resolve follows", async () => {
			Service.adapt({
				extensions: [".md"],
				scan: () => ({ symbols: [], references: [], dependencies: [], certain: true }),
				rename: () => undefined,
			});
			assert.deepEqual(LinesWith(Run, "adapters registered"), [
				"semantics: adapters registered (7 extensions)",
				"semantics: adapters registered (8 extensions)",
			]);
			const Model = await Service.resolve("/doc/readme.md");
			assert.equal(Model.path, "/doc/readme.md");
			assert.deepEqual(LinesWith(Run, "resolved /doc/readme.md"), [
				"semantics: resolved /doc/readme.md (0 symbols, 0 references)",
			]);
		});
		await CheckAsync(Count, "R5: a re-registration replaces the adapter (last wins)", async () => {
			Service.adapt({
				extensions: [".md"],
				scan: () => ({
					symbols: [{ kind: "type", qualifiedName: "doc", span: { start: 0, end: 3 }, fingerprint: "type:doc" }],
					references: [],
					dependencies: [],
					certain: true,
				}),
				rename: () => undefined,
			});
			const Model = await Service.resolve("/doc/readme.md");
			assert.deepEqual(
				Model.symbols.map((S: any) => S.qualifiedName),
				["doc"],
			);
		});
	}

	// Group R6: the rename plan and its refusal arms.
	{
		const Run = await Setup({}, { "/src/a.ts": "const foo = 1;\nfoo.bar;\nfoo;\n" });
		const Service = Run.Context.workspaceSemantics;
		await CheckAsync(Count, "R6: the rename plan rewrites every occurrence at reference certainty", async () => {
			const Plan = await Service.rename("/src/a.ts", { start: 15, end: 18 }, "baz");
			assert.equal(Plan.path, "/src/a.ts");
			assert.equal(Plan.from, "foo");
			assert.equal(Plan.to, "baz");
			assert.equal(Plan.certainty, "references");
			assert.deepEqual(
				Plan.edits.map((E: any) => E.start),
				[6, 15, 24],
			);
			assert.deepEqual(LinesWith(Run, "planned rename"), [
				"semantics: planned rename foo -> baz in /src/a.ts (3 edits, references)",
			]);
		});
		await CheckAsync(Count, "R6: a non-identifier span is the adapter's refusal-to-guess", async () => {
			assert.equal(
				await Service.rename("/src/a.ts", { start: 12, end: 13 }, "baz"),
				undefined,
			);
			const Lines = LinesWith(Run, "adapter not certain");
			assert.equal(Lines.length, 1);
			assert.deepEqual(Lines, ["semantics: refused /src/a.ts (rename: adapter not certain)"]);
		});
		await CheckAsync(Count, "R6: an empty new name is refused byte-exactly", async () => {
			assert.equal(
				await Service.rename("/src/a.ts", { start: 14, end: 17 }, ""),
				undefined,
			);
			assert.deepEqual(LinesWith(Run, "rename: empty name"), [
				"semantics: refused /src/a.ts (rename: empty name)",
			]);
		});
		await CheckAsync(Count, "R6: a path with no adapter is refused byte-exactly", async () => {
			assert.equal(
				await Service.rename("/doc/readme.md", { start: 0, end: 1 }, "x"),
				undefined,
			);
			const Lines = LinesWith(Run, "refused /doc/readme.md");
			assert.equal(Lines.length, 1);
			assert.deepEqual(Lines, ["semantics: refused /doc/readme.md (no adapter for .md)"]);
		});
	}
	{
		const Run = await Setup({ exclude: ["skipme"] }, { "/src/skipme/x.ts": Source });
		await CheckAsync(Count, "R6: an unresolved excluded path is the rename's no-model refusal", async () => {
			assert.equal(
				await Run.Context.workspaceSemantics.rename("/src/skipme/x.ts", { start: 0, end: 1 }, "x"),
				undefined,
			);
			assert.deepEqual(LinesWith(Run, "rename: no model"), [
				"semantics: refused /src/skipme/x.ts (rename: no model)",
			]);
		});
	}

	// Group R7: the purity of the rename path.
	{
		const Run = await Setup();
		await Run.Context.workspaceSemantics.rename("/src/a.ts", { start: 6, end: 9 }, "baz");
		Check(Count, "R7: the rename plans without writing anything (zero writeText)", () => {
			assert.equal(Run.Fs.writes.length, 0);
			assert.ok(Run.Lines.every((Line: string) => !Line.includes("written")));
		});
	}
	return Finish(Count, "Resolve-And-Rename");
};

// Standalone entry: `node Target/Test/Resolve-And-Rename/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Resolve-And-Rename`);
}

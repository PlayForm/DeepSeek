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
  Validate
} from "../Harness.js";
const Source = "const foo = 1;\nfoo.bar;\n";
const Setup = async (Config = {}, Contents = { "/src/a.ts": Source }) => {
  rm();
  const Run = Make(Validate({ logFile: Ledger, enabled: true, ...Config }));
  Run.Fs.contents = Contents;
  await Boot();
  return Run;
};
const runTest = async () => {
  const Count = MakeCounter();
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
        Model.symbols.map((S) => [S.kind, S.qualifiedName, S.fingerprint]),
        [["const", "foo", "const:foo"]]
      );
      assert.deepEqual(
        Model.references.map((R) => R.target),
        ["foo.bar"]
      );
      assert.deepEqual(Model.dependencies, []);
    });
    Check(Count, "R1: the resolve line is byte-exact and the file was read once", () => {
      assert.deepEqual(LinesWith(Run, "resolved /src/a.ts"), [
        "semantics: resolved /src/a.ts (1 symbols, 1 references)"
      ]);
      assert.deepEqual(Run.Fs.reads, ["/src/a.ts"]);
    });
    await CheckAsync(Count, "R1: the lookup and the reference list read the built model", async () => {
      const Symbol = Service.symbol("/src/a.ts", "foo");
      assert.equal(Symbol.kind, "const");
      assert.equal(Symbol.qualifiedName, "foo");
      assert.equal(Service.symbol("/src/a.ts", "nope"), void 0);
      assert.equal(Service.symbol("/src/none.ts", "foo"), void 0);
      assert.deepEqual(
        Service.references("/src/a.ts").map((R) => R.target),
        ["foo.bar"]
      );
      assert.deepEqual(Service.references("/src/none.ts"), []);
      assert.deepEqual(Service.statistics(), { paths: 1, revision: 1, adapters: 7 });
    });
  }
  {
    const Run = await Setup({ exclude: ["skipme"] }, {});
    const Service = Run.Context.workspaceSemantics;
    await CheckAsync(Count, "R2: a path with no adapter refuses with the byte-exact line", async () => {
      assert.equal(await Service.resolve("/doc/readme.md"), void 0);
      assert.deepEqual(LinesWith(Run, "refused /doc/readme.md"), [
        "semantics: refused /doc/readme.md (no adapter for .md)"
      ]);
    });
    await CheckAsync(Count, "R2: an excluded path refuses before any read", async () => {
      assert.equal(await Service.resolve("/repo/skipme/x.ts"), void 0);
      assert.deepEqual(LinesWith(Run, "refused /repo/skipme/x.ts"), []);
      assert.deepEqual(LinesWith(Run, "ignored /repo/skipme/x.ts"), [
        "semantics: ignored /repo/skipme/x.ts (excluded)"
      ]);
      assert.equal(Run.Fs.reads.length, 0);
    });
    await CheckAsync(Count, "R2: an empty path fails with the byte-exact line", async () => {
      assert.equal(await Service.resolve(""), void 0);
      assert.deepEqual(LinesWith(Run, "failed resolve"), [
        "semantics: failed resolve (empty path)"
      ]);
    });
    await CheckAsync(Count, "R2: a missing file fails with the byte-exact line", async () => {
      assert.equal(await Service.resolve("/src/gone.ts"), void 0);
      assert.ok(
        Run.Lines.some((Line) => Line.startsWith("semantics: failed /src/gone.ts (ENOENT"))
      );
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: true }), (Context) => {
      Context.fs = void 0;
    });
    await Boot();
    await CheckAsync(Count, "R3: without a text reader the resolve fails byte-exactly", async () => {
      assert.equal(await Run.Context.workspaceSemantics.resolve("/src/a.ts"), void 0);
      assert.deepEqual(LinesWith(Run, "failed /src/a.ts"), [
        "semantics: failed /src/a.ts (no fs text reader)"
      ]);
    });
  }
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
        "semantics: indexed /src/a.ts version 2 (revision 2)"
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
  {
    const Run = await Setup({}, { "/doc/readme.md": "intro text" });
    const Service = Run.Context.workspaceSemantics;
    await CheckAsync(Count, "R5: adapt() registers an adapter and the resolve follows", async () => {
      Service.adapt({
        extensions: [".md"],
        scan: () => ({ symbols: [], references: [], dependencies: [], certain: true }),
        rename: () => void 0
      });
      assert.deepEqual(LinesWith(Run, "adapters registered"), [
        "semantics: adapters registered (7 extensions)",
        "semantics: adapters registered (8 extensions)"
      ]);
      const Model = await Service.resolve("/doc/readme.md");
      assert.equal(Model.path, "/doc/readme.md");
      assert.deepEqual(LinesWith(Run, "resolved /doc/readme.md"), [
        "semantics: resolved /doc/readme.md (0 symbols, 0 references)"
      ]);
    });
    await CheckAsync(Count, "R5: a re-registration replaces the adapter (last wins)", async () => {
      Service.adapt({
        extensions: [".md"],
        scan: () => ({
          symbols: [{ kind: "type", qualifiedName: "doc", span: { start: 0, end: 3 }, fingerprint: "type:doc" }],
          references: [],
          dependencies: [],
          certain: true
        }),
        rename: () => void 0
      });
      const Model = await Service.resolve("/doc/readme.md");
      assert.deepEqual(
        Model.symbols.map((S) => S.qualifiedName),
        ["doc"]
      );
    });
  }
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
        Plan.edits.map((E) => E.start),
        [6, 15, 24]
      );
      assert.deepEqual(LinesWith(Run, "planned rename"), [
        "semantics: planned rename foo -> baz in /src/a.ts (3 edits, references)"
      ]);
    });
    await CheckAsync(Count, "R6: a non-identifier span is the adapter's refusal-to-guess", async () => {
      assert.equal(
        await Service.rename("/src/a.ts", { start: 12, end: 13 }, "baz"),
        void 0
      );
      const Lines = LinesWith(Run, "adapter not certain");
      assert.equal(Lines.length, 1);
      assert.deepEqual(Lines, ["semantics: refused /src/a.ts (rename: adapter not certain)"]);
    });
    await CheckAsync(Count, "R6: an empty new name is refused byte-exactly", async () => {
      assert.equal(
        await Service.rename("/src/a.ts", { start: 14, end: 17 }, ""),
        void 0
      );
      assert.deepEqual(LinesWith(Run, "rename: empty name"), [
        "semantics: refused /src/a.ts (rename: empty name)"
      ]);
    });
    await CheckAsync(Count, "R6: a path with no adapter is refused byte-exactly", async () => {
      assert.equal(
        await Service.rename("/doc/readme.md", { start: 0, end: 1 }, "x"),
        void 0
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
        void 0
      );
      assert.deepEqual(LinesWith(Run, "rename: no model"), [
        "semantics: refused /src/skipme/x.ts (rename: no model)"
      ]);
    });
  }
  {
    const Run = await Setup();
    await Run.Context.workspaceSemantics.rename("/src/a.ts", { start: 6, end: 9 }, "baz");
    Check(Count, "R7: the rename plans without writing anything (zero writeText)", () => {
      assert.equal(Run.Fs.writes.length, 0);
      assert.ok(Run.Lines.every((Line) => !Line.includes("written")));
    });
  }
  return Finish(Count, "Resolve-And-Rename");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Resolve-And-Rename`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

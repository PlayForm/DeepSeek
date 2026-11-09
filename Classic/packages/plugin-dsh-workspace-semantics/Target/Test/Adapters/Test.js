import assert from "node:assert/strict";
import {
  Boot,
  Check,
  CheckAsync,
  Finish,
  Ledger,
  LinesWith,
  MakeCounter,
  Make,
  rm,
  Validate
} from "../Harness.js";
const JSON_TEXT = '{\n  "alpha": "alpha",\n  "beta": 2\n}\n';
const YAML_TEXT = "service:\n  name: alpha\n  copy: name\n";
const MARKDOWN_TEXT = "# Title\n\nSee [the doc](./other.md) and [again](./other.md).\n";
const PACKAGE_TEXT = '{\n  "name": "demo",\n  "dependencies": {\n    "alpha": "1.0.0"\n  },\n  "devDependencies": {\n    "alpha": "2.0.0",\n    "beta": "3.0.0"\n  }\n}\n';
const TS_TEXT = "const foo = 1;\nfoo.bar;\n";
const Setup = async (Config = {}, Contents = {}) => {
  rm();
  const Run = Make(
    Validate({
      logFile: Ledger,
      enabled: true,
      adapters: ["json", "yaml", "markdown", "package"],
      ...Config
    })
  );
  Run.Fs.contents = Contents;
  await Boot();
  return Run;
};
const At = (Line, Character, Length) => ({
  uri: "file:///repo/a.ts",
  range: {
    start: { line: Line, character: Character },
    end: { line: Line, character: Character + Length }
  }
});
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = await Setup();
    Check(Count, "A: the opt-in adapters register beside the TypeScript one", () => {
      assert.deepEqual(LinesWith(Run, "adapters registered"), [
        "semantics: adapters registered (7 extensions)",
        "semantics: adapters registered (8 extensions)",
        "semantics: adapters registered (10 extensions)",
        "semantics: adapters registered (12 extensions)",
        "semantics: adapters registered (13 extensions)"
      ]);
      assert.equal(Run.Context.workspaceSemantics.statistics().adapters, 13);
    });
  }
  {
    const Run = await Setup({}, { "/repo/data.json": JSON_TEXT });
    const Service = Run.Context.workspaceSemantics;
    await CheckAsync(Count, "B: resolve builds the JSON key model", async () => {
      const Model = await Service.resolve("/repo/data.json");
      assert.equal(Model.freshness, "fresh");
      assert.deepEqual(
        Model.symbols.map((S) => [S.kind, S.qualifiedName, S.span.start, S.span.end]),
        [
          ["key", "alpha", 5, 10],
          ["key", "beta", 25, 29]
        ]
      );
      assert.deepEqual(LinesWith(Run, "resolved /repo/data.json"), [
        "semantics: resolved /repo/data.json (2 symbols, 1 references)"
      ]);
    });
    await CheckAsync(Count, "B: a repeated string value is the JSON reference", async () => {
      assert.deepEqual(
        Service.references("/repo/data.json").map((R) => [R.target, R.span.start, R.span.end]),
        [["alpha", 14, 19]]
      );
    });
    await CheckAsync(Count, "B: the JSON rename rewrites the key and its reference", async () => {
      const Plan = await Service.rename("/repo/data.json", { start: 5, end: 10 }, "gamma");
      assert.equal(Plan.from, "alpha");
      assert.equal(Plan.to, "gamma");
      assert.equal(Plan.certainty, "references");
      assert.deepEqual(
        Plan.edits.map((E) => [E.start, E.end]),
        [
          [5, 10],
          [14, 19]
        ]
      );
      assert.deepEqual(LinesWith(Run, "planned rename"), [
        "semantics: planned rename alpha -> gamma in /repo/data.json (2 edits, references)"
      ]);
    });
  }
  {
    const Run = await Setup({}, { "/repo/config.yml": YAML_TEXT });
    const Service = Run.Context.workspaceSemantics;
    await CheckAsync(Count, "C: resolve builds the YAML key model", async () => {
      const Model = await Service.resolve("/repo/config.yml");
      assert.deepEqual(
        Model.symbols.map((S) => [S.kind, S.qualifiedName, S.span.start]),
        [
          ["key", "service", 0],
          ["key", "name", 11],
          ["key", "copy", 25]
        ]
      );
      assert.deepEqual(LinesWith(Run, "resolved /repo/config.yml"), [
        "semantics: resolved /repo/config.yml (3 symbols, 1 references)"
      ]);
    });
    await CheckAsync(Count, "C: a repeated plain scalar is the YAML reference", async () => {
      assert.deepEqual(
        Service.references("/repo/config.yml").map((R) => [R.target, R.span.start, R.span.end]),
        [["name", 31, 35]]
      );
    });
    await CheckAsync(Count, "C: the YAML rename rewrites the key and its scalar", async () => {
      const Plan = await Service.rename("/repo/config.yml", { start: 11, end: 15 }, "label");
      assert.deepEqual(
        Plan.edits.map((E) => [E.start, E.end]),
        [
          [11, 15],
          [31, 35]
        ]
      );
      assert.deepEqual(LinesWith(Run, "planned rename"), [
        "semantics: planned rename name -> label in /repo/config.yml (2 edits, references)"
      ]);
    });
  }
  {
    const Run = await Setup({}, { "/repo/doc.md": MARKDOWN_TEXT });
    const Service = Run.Context.workspaceSemantics;
    await CheckAsync(Count, "D: resolve builds the Markdown heading model", async () => {
      const Model = await Service.resolve("/repo/doc.md");
      assert.deepEqual(
        Model.symbols.map((S) => [S.kind, S.qualifiedName, S.span.start, S.span.end]),
        [["heading", "Title", 2, 7]]
      );
      assert.deepEqual(LinesWith(Run, "resolved /repo/doc.md"), [
        "semantics: resolved /repo/doc.md (1 symbols, 2 references)"
      ]);
    });
    await CheckAsync(Count, "D: every link target is a Markdown reference", async () => {
      assert.deepEqual(
        Service.references("/repo/doc.md").map((R) => R.target),
        ["./other.md", "./other.md"]
      );
    });
    await CheckAsync(Count, "D: the Markdown rename rewrites every equal link target", async () => {
      const First = Service.references("/repo/doc.md")[0];
      const Plan = await Service.rename("/repo/doc.md", First.span, "./elsewhere.md");
      assert.equal(Plan.from, "./other.md");
      assert.equal(Plan.edits.length, 2);
      assert.deepEqual(LinesWith(Run, "planned rename"), [
        "semantics: planned rename ./other.md -> ./elsewhere.md in /repo/doc.md (2 edits, references)"
      ]);
    });
  }
  {
    const Run = await Setup({}, { "/repo/package.json": PACKAGE_TEXT });
    const Service = Run.Context.workspaceSemantics;
    await CheckAsync(Count, "E: package.json selects the dependency adapter, not the JSON one", async () => {
      const Model = await Service.resolve("/repo/package.json");
      assert.deepEqual(
        Model.symbols.map((S) => [S.kind, S.qualifiedName]),
        [
          ["dependency", "alpha"],
          ["dependency", "beta"]
        ]
      );
      assert.deepEqual(Model.dependencies, ["alpha", "beta"]);
      assert.deepEqual(LinesWith(Run, "resolved /repo/package.json"), [
        "semantics: resolved /repo/package.json (2 symbols, 1 references)"
      ]);
    });
    await CheckAsync(Count, "E: a dependency listed twice is one reference", async () => {
      assert.deepEqual(
        Service.references("/repo/package.json").map((R) => R.target),
        ["alpha"]
      );
    });
    await CheckAsync(Count, "E: the dependency rename rewrites every section occurrence", async () => {
      const First = Service.symbol("/repo/package.json", "alpha");
      const Plan = await Service.rename("/repo/package.json", First.span, "gamma");
      assert.equal(Plan.edits.length, 2);
      assert.deepEqual(LinesWith(Run, "planned rename"), [
        "semantics: planned rename alpha -> gamma in /repo/package.json (2 edits, references)"
      ]);
    });
  }
  {
    const Requests = [];
    const Run = await Setup({ root: "/repo" }, { "/repo/a.ts": TS_TEXT });
    Run.Context.lsp = {
      query: async (Request) => {
        Requests.push(Request);
        return {
          kind: "locations",
          locations: [
            At(0, 6, 3),
            At(1, 0, 3),
            {
              uri: "file:///other/b.ts",
              range: { start: { line: 0, character: 0 }, end: { line: 0, character: 3 } }
            }
          ],
          resolvedWorkspaceUri: "file:///repo"
        };
      }
    };
    const Service = Run.Context.workspaceSemantics;
    await CheckAsync(Count, "F: the seam is asked for findReferences at the symbol", async () => {
      const Model = await Service.resolve("/repo/a.ts");
      assert.deepEqual(Requests, [
        {
          operation: "findReferences",
          filePath: "/repo/a.ts",
          position: { line: 0, character: 6 },
          workspaceRoot: "/repo"
        }
      ]);
      assert.deepEqual(
        Model.references.map((R) => [R.target, R.span.start, R.span.end]),
        [
          ["foo", 6, 9],
          ["foo", 15, 18]
        ]
      );
      assert.deepEqual(LinesWith(Run, "resolved /repo/a.ts"), [
        "semantics: resolved /repo/a.ts (1 symbols, 2 references)"
      ]);
    });
    await CheckAsync(Count, "F: the deepened line names the seam and the count", async () => {
      assert.deepEqual(LinesWith(Run, "deepened /repo/a.ts"), [
        "semantics: deepened /repo/a.ts (2 references via lsp)"
      ]);
    });
    await CheckAsync(Count, "F: the rename is derived from the seam's same-file locations", async () => {
      const Plan = await Service.rename("/repo/a.ts", { start: 15, end: 18 }, "baz");
      assert.equal(Plan.from, "foo");
      assert.equal(Plan.to, "baz");
      assert.deepEqual(
        Plan.edits.map((E) => [E.start, E.end]),
        [
          [6, 9],
          [15, 18]
        ]
      );
      assert.deepEqual(LinesWith(Run, "planned rename"), [
        "semantics: planned rename foo -> baz in /repo/a.ts (2 edits, references)"
      ]);
    });
  }
  {
    const Run = await Setup({ lsp: false }, { "/repo/a.ts": TS_TEXT });
    const Service = Run.Context.workspaceSemantics;
    await CheckAsync(Count, "G: lsp=false keeps the lexical reference list", async () => {
      const Model = await Service.resolve("/repo/a.ts");
      assert.deepEqual(
        Model.references.map((R) => R.target),
        ["foo.bar"]
      );
      assert.deepEqual(LinesWith(Run, "resolved /repo/a.ts"), [
        "semantics: resolved /repo/a.ts (1 symbols, 1 references)"
      ]);
      assert.deepEqual(LinesWith(Run, "deepened"), []);
    });
  }
  {
    const Run = await Setup({}, { "/repo/a.ts": TS_TEXT });
    Run.Context.lsp = {};
    await CheckAsync(Count, "G: a seam without a query method falls back silently", async () => {
      const Model = await Run.Context.workspaceSemantics.resolve("/repo/a.ts");
      assert.deepEqual(
        Model.references.map((R) => R.target),
        ["foo.bar"]
      );
      assert.deepEqual(LinesWith(Run, "deepened"), []);
    });
  }
  {
    const Run = await Setup({}, { "/repo/a.ts": TS_TEXT });
    Run.Context.lsp = {
      query: async () => {
        throw new Error("LSP_UNAVAILABLE");
      }
    };
    await CheckAsync(Count, "G: a throwing seam falls back to the lexical list", async () => {
      const Model = await Run.Context.workspaceSemantics.resolve("/repo/a.ts");
      assert.deepEqual(
        Model.references.map((R) => R.target),
        ["foo.bar"]
      );
      assert.deepEqual(LinesWith(Run, "deepened"), []);
      assert.deepEqual(LinesWith(Run, "failed"), []);
    });
  }
  {
    const Run = await Setup({}, { "/repo/a.ts": TS_TEXT });
    Run.Context.lsp = {
      query: async () => ({ kind: "hover", hover: null })
    };
    await CheckAsync(Count, "G: a non-locations result is 'cannot answer', never a guess", async () => {
      const Model = await Run.Context.workspaceSemantics.resolve("/repo/a.ts");
      assert.deepEqual(
        Model.references.map((R) => R.target),
        ["foo.bar"]
      );
      assert.deepEqual(LinesWith(Run, "deepened"), []);
    });
  }
  {
    rm();
    Check(Count, "H: an unknown adapter name fails loud at load", () => {
      assert.throws(
        () => Make(
          Validate({
            logFile: Ledger,
            enabled: true,
            adapters: ["nope"]
          })
        ),
        /semantics: adapters must name known adapters \(json, yaml, markdown, package\)/
      );
    });
    Check(Count, "H: a non-string root fails at the schema layer", () => {
      assert.throws(
        () => Validate({ logFile: Ledger, enabled: true, root: 7 }),
        /root/
      );
    });
    Check(Count, "H: a non-array adapters value fails at the schema layer", () => {
      assert.throws(
        () => Validate({ logFile: Ledger, enabled: true, adapters: "json" }),
        /adapters/
      );
    });
  }
  return Finish(Count, "Adapters");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Adapters`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

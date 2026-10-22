import assert from "node:assert/strict";
import { Check, Finish, MakeCounter, MakeGraph } from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = MakeGraph({ files: {} });
    Check(Count, "entry: the service registers on the fake ctx under workspaceGraph (A3)", () => {
      assert.equal(Run.provided["workspaceGraph"], Run.Graph);
      assert.equal(Run.Graph.name, "workspaceGraph");
    });
    Check(Count, "entry: the class carries the loader contract (static inject, static Config)", () => {
      const Graph = Run.Graph.constructor;
      assert.deepEqual(Graph.inject, ["fs", "storage"]);
      assert.equal(typeof Graph.Config, "function");
      assert.equal(Run.Graph.name, "workspaceGraph");
    });
    Check(Count, "entry: the activation line is byte-exact", () => {
      assert.ok(
        Run.loggerLines.includes("graph: activated (domain=workspace_graph, languages=3)")
      );
    });
    Check(Count, "entry: the declaration-merged accessor types as the service (A3 compile proof)", () => {
      const Accessor = (Typed) => Typed.workspaceGraph;
      assert.equal(typeof Accessor, "function");
    });
  }
  {
    const Defaults = MakeGraph({ files: {} });
    Check(Count, "config: the schema defaults flow into the plain State config", () => {
      assert.deepEqual(Defaults.State.Config, {
        enabled: false,
        domain: "workspace_graph",
        languages: ["typescript", "javascript", "markdown"],
        include: [],
        exclude: ["node_modules/**", "**/Target/**", "**/.git/**"],
        maxFileBytes: 1e6,
        maxNodesPerFile: 5e3,
        limitDefault: 50,
        limitMaximum: 500
      });
    });
    Check(Count, "config: every volatile field arrives as a cell and unwraps", () => {
      const Cells = Defaults.Graph.constructor.Config({});
      for (const Key of ["enabled", "domain", "languages", "include", "exclude", "maxFileBytes", "maxNodesPerFile", "limitDefault", "limitMaximum"]) {
        assert.equal(typeof Cells[Key]?.get, "function", `cell for ${Key}`);
      }
      assert.equal(Defaults.State.Config.domain, "workspace_graph");
    });
  }
  {
    const Fails = (Raw) => {
      try {
        MakeGraph({ ...Raw, files: {} });
      } catch (Error_) {
        return Error_.message;
      }
      return "no throw";
    };
    let SchemaError = null;
    try {
      MakeGraph({ maxFileBytes: {}, files: {} });
    } catch (Error_) {
      SchemaError = Error_;
    }
    Check(Count, "config: a wrong-typed field fails loud at the schema (Schemastery)", () => {
      assert.match(SchemaError?.message ?? "", /expected number/);
    });
    Check(Count, "fail-loud: an empty domain is rejected", () => {
      assert.equal(Fails({ domain: "" }), "invalid config: domain must be a lowercase unit name matching /^[a-z][a-z0-9_]*$/");
    });
    Check(Count, "fail-loud: a domain outside the unit-name pattern is rejected", () => {
      assert.equal(Fails({ domain: "Workspace Graph" }), "invalid config: domain must be a lowercase unit name matching /^[a-z][a-z0-9_]*$/");
    });
    Check(Count, "fail-loud: empty languages are rejected", () => {
      assert.equal(Fails({ languages: [] }), 'invalid config: languages must be a non-empty array of "typescript" | "javascript" | "markdown"');
    });
    Check(Count, "fail-loud: limitDefault above limitMaximum is rejected", () => {
      assert.equal(Fails({ limitDefault: 10, limitMaximum: 5 }), "invalid config: limitDefault must not exceed limitMaximum");
    });
  }
  return Finish(Count, "Entry-And-Config");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Entry-And-Config`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

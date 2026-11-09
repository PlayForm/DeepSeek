import assert from "node:assert/strict";
import {
  AgentOf,
  Assemble,
  CheckAsync,
  Durable,
  DurableLine,
  FakeGraph,
  Finish,
  Ledger,
  LedgerWith,
  Make,
  MakeCounter,
  Post,
  rm,
  SeedHistory,
  Setup,
  Validate,
  Workspace
} from "../Harness.js";
const Anchor = "README.md";
const Companions = ["CHANGELOG.md", "SCHEME.md"];
const Space = Workspace([
  Anchor,
  ...Companions,
  "package.json",
  "Source/Function/Apply.ts"
]);
const Read = (Id) => ({
  name: "read",
  arguments: { file_path: Space.At(Anchor) },
  agent: AgentOf(Id)
});
const Neutral = "[search-suggester] intent=History confidence=0.87\ntargets (2):\n- CHANGELOG.md - touched 1 time(s) after a similar call\n- SCHEME.md - touched 1 time(s) after a similar call\nnote: open these before more searches; Target/ is generated, never edit it.";
const Projected = "[search-suggester] intent=History confidence=0.87\ntargets (2):\n- SCHEME.md - touched 1 time(s) after a similar call\n- CHANGELOG.md - touched 1 time(s) after a similar call\nnote: open these before more searches; Target/ is generated, never edit it.";
const runTest = async () => {
  const Count = MakeCounter();
  {
    rm();
    const Run = Make(
      Validate({ logFile: Ledger, enabled: true }),
      (Context) => {
        Context.workspaceGraph = FakeGraph([
          { path: "CHANGELOG.md", kind: "File", version: "1" },
          { path: "SCHEME.md", kind: "File", version: "2" }
        ]);
      }
    );
    SeedHistory(Run, "a", Space.At(Anchor), Companions);
    await CheckAsync(Count, "J1: the projected note leads with the newer proven path", async () => {
      const Out = await Post(Run, Read("a"));
      assert.equal(Out.additionalContexts.length, 1);
      assert.equal(Out.additionalContexts[0].content[0].text, Projected);
      assert.equal(Out.additionalContexts[0].source.summary, "History 0.87");
    });
    await CheckAsync(Count, "J1: the projection adds no ledger string", async () => {
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: suggest History 0.87 2 candidates"));
      assert.equal(LedgerWith("suggest History 0.87 2 candidates").length, 1);
      assert.match(
        DurableLine("suggest History 0.87 2 candidates"),
        Durable("suggest History 0.87 2 candidates")
      );
      assert.deepEqual(Run.Lines, [
        `hook-dsh-search-suggester: activated (bundle ${"0.2.1"}, history, threshold 0.75)`,
        "hook-dsh-search-suggester: suggest History 0.87 2 candidates"
      ]);
    });
  }
  {
    const Run = Setup();
    SeedHistory(Run, "a", Space.At(Anchor), Companions);
    await CheckAsync(Count, "J2: without a graph the note is the neutral one", async () => {
      const Out = await Post(Run, Read("a"));
      assert.equal(Out.additionalContexts[0].content[0].text, Neutral);
    });
  }
  {
    rm();
    const Sticky = Make(
      Validate({ logFile: Ledger, enabled: true, sectionMode: "sticky" }),
      (Context) => {
        Context.workspaceGraph = FakeGraph([
          { path: "CHANGELOG.md", kind: "File", version: "1" },
          { path: "SCHEME.md", kind: "File", version: "2" }
        ]);
      }
    );
    SeedHistory(Sticky, "a", Space.At(Anchor), Companions);
    await CheckAsync(Count, "J3: the sticky section renders the projected index", async () => {
      await Post(Sticky, Read("a"));
      const Out = await Assemble(Sticky, AgentOf("a"));
      assert.deepEqual(Out.sections.map((Section) => Section.name), [
        "base",
        "hook-dsh-search-suggester"
      ]);
      assert.equal(
        Out.sections[1].text,
        "[search-suggester] intent=History confidence=1.00\ntargets (2):\n- SCHEME.md - touched after a similar call\n- CHANGELOG.md - touched after a similar call\nnote: open these before more searches; Target/ is generated, never edit it."
      );
    });
    await CheckAsync(Count, "J3: the section stays gated by the enabled state", async () => {
      rm();
      const Off = Make(
        Validate({ logFile: Ledger, enabled: false, sectionMode: "sticky" }),
        (Context) => {
          Context.workspaceGraph = FakeGraph([
            { path: "CHANGELOG.md", kind: "File", version: "1" }
          ]);
        }
      );
      const Out = await Assemble(Off, AgentOf("a"));
      assert.deepEqual(Out.sections, [{ name: "base", text: "b" }]);
      assert.deepEqual(Off.Lines, ["hook-dsh-search-suggester: disabled (enabled=false)"]);
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: true }), (Context) => {
      Context.workspaceGraph = FakeGraph([{ path: "unrelated/README.md", kind: "File" }]);
    });
    SeedHistory(Run, "a", Space.At(Anchor), Companions);
    await CheckAsync(Count, "J4: a graph that proves no candidate keeps the unproven tiers", async () => {
      const Out = await Post(Run, Read("a"));
      assert.equal(Out.additionalContexts[0].content[0].text, Neutral);
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: true }), (Context) => {
      Context.workspaceGraph = FakeGraph([
        { path: "package.json", kind: "Test", version: "2" },
        { path: "CHANGELOG.md", kind: "File", version: "1" }
      ]);
    });
    SeedHistory(Run, "a", Space.At(Anchor), ["CHANGELOG.md", "package.json"]);
    await CheckAsync(Count, "J5: an unexpected node kind scores below an expected one", async () => {
      const Out = await Post(Run, Read("a"));
      const Text = Out.additionalContexts[0].content[0].text;
      assert.ok(Text.indexOf("- CHANGELOG.md") < Text.indexOf("- package.json"));
      assert.equal(Text.indexOf("- CHANGELOG.md") > 0, true);
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: true }), (Context) => {
      Context.workspaceGraph = FakeGraph([
        { path: "package.json", kind: "File", version: "1" },
        { path: "Source/Function/Apply.ts", kind: "File", version: "1" }
      ]);
    });
    SeedHistory(Run, "a", Space.At(Anchor), ["Source/Function/Apply.ts", "package.json"]);
    await CheckAsync(Count, "J6: the shallower proven path leads the deeper one", async () => {
      const Out = await Post(Run, Read("a"));
      const Text = Out.additionalContexts[0].content[0].text;
      assert.ok(Text.indexOf("- package.json") < Text.indexOf("- Source/Function/Apply.ts"));
    });
  }
  return Finish(Count, "Projection");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Projection`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

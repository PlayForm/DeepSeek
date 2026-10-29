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
  Setup,
  Validate
} from "../Harness.js";
const StrongVersion = (Id) => ({
  name: "grep",
  arguments: { pattern: "1.2.3 version", path: "package.json" },
  agent: AgentOf(Id)
});
const Nodes = [
  { path: "package.json", kind: "File", version: "10" },
  { path: "Site/package.json", kind: "File", version: "9" },
  { path: "CHANGELOG.md", kind: "File", version: "8" },
  { path: "Site/Source/Library/Content.ts", kind: "File", version: "7" },
  { path: "Classic/packages/hook-dsh-ccr/Source/Function/Apply.ts", kind: "File", version: "6" },
  { path: "Classic/packages/hook-dsh-ccr/Source/Function/Apply.ts", kind: "Symbol", version: "6" }
];
const Neutral = "[search-suggester] intent=Version confidence=0.92\ntargets (7):\n- package.json - the monorepo manifest\n- Site/package.json - the site manifest\n- Classic/packages/*/package.json - the Classic manifests\n- EffectTS/packages/*/package.json - the EffectTS manifests\n- Site/Source/Library/Content.ts - the site release constant\n- CHANGELOG.md - the new section\n- Documentation/Plugins/PLUGIN-FAMILY.md - the roster versions\nnote: open these before more searches; Target/ is generated, never edit it.";
const Projected = "[search-suggester] intent=Version confidence=0.92\ntargets (7):\n- package.json - the monorepo manifest\n- Site/package.json - the site manifest\n- CHANGELOG.md - the new section\n- Site/Source/Library/Content.ts - the site release constant\n- Documentation/Plugins/PLUGIN-FAMILY.md - the roster versions\n- Site/Source/pages/reference.astro - the versions page\n- .github/workflows/NPM.yml - the publish trigger\nnote: open these before more searches; Target/ is generated, never edit it.";
const UnprovenNote = "[search-suggester] intent=Version confidence=0.92\ntargets (7):\n- package.json - the monorepo manifest\n- Site/package.json - the site manifest\n- Site/Source/Library/Content.ts - the site release constant\n- CHANGELOG.md - the new section\n- Documentation/Plugins/PLUGIN-FAMILY.md - the roster versions\n- Site/Source/pages/reference.astro - the versions page\n- .github/workflows/NPM.yml - the publish trigger\nnote: open these before more searches; Target/ is generated, never edit it.";
const runTest = async () => {
  const Count = MakeCounter();
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: true }), (Context) => {
      Context.workspaceGraph = FakeGraph(Nodes);
    });
    await CheckAsync(Count, "J1: the projected note leads with the graph-proven paths", async () => {
      const Out = await Post(Run, StrongVersion("a"));
      assert.equal(Out.additionalContexts.length, 1);
      assert.equal(Out.additionalContexts[0].content[0].text, Projected);
      assert.equal(Out.additionalContexts[0].source.summary, "Version 0.92");
    });
    await CheckAsync(Count, "J1: the projection adds no ledger string", async () => {
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: suggest Version 0.92 7 candidates"));
      assert.equal(LedgerWith("suggest Version 0.92 7 candidates").length, 1);
      assert.match(
        DurableLine("suggest Version 0.92 7 candidates"),
        Durable("suggest Version 0.92 7 candidates")
      );
      assert.deepEqual(Run.Lines, [
        `hook-dsh-search-suggester: activated (bundle ${"0.2.1"}, intents 10, threshold 0.75)`,
        "hook-dsh-search-suggester: suggest Version 0.92 7 candidates"
      ]);
    });
  }
  {
    const Run = Setup();
    await CheckAsync(Count, "J2: without a graph the note is byte-identical to the PoC", async () => {
      const Out = await Post(Run, StrongVersion("a"));
      assert.equal(Out.additionalContexts[0].content[0].text, Neutral);
    });
  }
  {
    rm();
    const Sticky = Make(
      Validate({ logFile: Ledger, enabled: true, sectionMode: "sticky" }),
      (Context) => {
        Context.workspaceGraph = FakeGraph(Nodes);
      }
    );
    await CheckAsync(Count, "J3: the sticky section renders the projected index", async () => {
      await Post(Sticky, StrongVersion("a"));
      const Out = await Assemble(Sticky, AgentOf("a"));
      assert.deepEqual(Out.sections.map((Section) => Section.name), [
        "base",
        "hook-dsh-search-suggester"
      ]);
      assert.equal(
        Out.sections[1].text,
        "[search-suggester] intent=Version confidence=1.00\ntargets (5):\n- package.json - the monorepo manifest\n- Site/package.json - the site manifest\n- CHANGELOG.md - the new section\n- Site/Source/Library/Content.ts - the site release constant\n- Classic/packages/hook-dsh-ccr/Source/Function/Apply.ts - the const Version\nnote: open these before more searches; Target/ is generated, never edit it."
      );
    });
    await CheckAsync(Count, "J3: the section stays gated by the enabled state", async () => {
      rm();
      const Off = Make(
        Validate({ logFile: Ledger, enabled: false, sectionMode: "sticky" }),
        (Context) => {
          Context.workspaceGraph = FakeGraph(Nodes);
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
    await CheckAsync(Count, "J4: a graph that proves no candidate keeps the unproven tiers", async () => {
      const Out = await Post(Run, StrongVersion("a"));
      assert.equal(Out.additionalContexts[0].content[0].text, UnprovenNote);
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
    await CheckAsync(Count, "J5: an unexpected node kind scores below an expected one", async () => {
      const Out = await Post(Run, StrongVersion("a"));
      const Text = Out.additionalContexts[0].content[0].text;
      assert.ok(Text.indexOf("- CHANGELOG.md") < Text.indexOf("- package.json"));
      assert.equal(Text.indexOf("- CHANGELOG.md") > 0, true);
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: true }), (Context) => {
      Context.workspaceGraph = FakeGraph([
        { path: "CHANGELOG.md", kind: "File", version: "1" },
        { path: "Site/Source/Library/Content.ts", kind: "File", version: "1" }
      ]);
    });
    await CheckAsync(Count, "J6: the shallower proven path leads the deeper one", async () => {
      const Out = await Post(Run, StrongVersion("a"));
      const Text = Out.additionalContexts[0].content[0].text;
      assert.ok(Text.indexOf("- CHANGELOG.md") < Text.indexOf("- Site/Source/Library/Content.ts"));
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

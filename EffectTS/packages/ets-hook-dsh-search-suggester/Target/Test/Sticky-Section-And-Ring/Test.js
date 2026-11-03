import assert from "node:assert/strict";
import {
  AgentOf,
  Assemble,
  CheckAsync,
  Durable,
  DurableLine,
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
const Space = Workspace([Anchor, ...Companions]);
const Read = (Id) => ({
  name: "read",
  arguments: { file_path: Space.At(Anchor) },
  agent: AgentOf(Id)
});
const Section = "[search-suggester] intent=History confidence=1.00\ntargets (2):\n- CHANGELOG.md - touched after a similar call\n- SCHEME.md - touched after a similar call\nnote: open these before more searches; Target/ is generated, never edit it.";
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup();
    SeedHistory(Run, "a", Space.At(Anchor), Companions);
    await CheckAsync(Count, "S1: with sectionMode off the assemble passes through untouched", async () => {
      await Post(Run, Read("a"));
      const Out = await Assemble(Run, AgentOf("a"));
      assert.deepEqual(Out.sections, [{ name: "base", text: "b" }]);
      assert.ok(!Run.Lines.includes("hook-dsh-search-suggester: section rebuilt (ttl 20)"));
    });
  }
  {
    rm();
    const Sticky = Make(Validate({ logFile: Ledger, enabled: true, sectionMode: "sticky" }));
    SeedHistory(Sticky, "a", Space.At(Anchor), Companions);
    await CheckAsync(Count, "S2: after an emit the sticky section is appended", async () => {
      await Post(Sticky, Read("a"));
      const Out = await Assemble(Sticky, AgentOf("a"));
      assert.deepEqual(Out.sections.map((Section_) => Section_.name), ["base", "hook-dsh-search-suggester"]);
      assert.equal(Out.sections[1].text, Section);
      assert.ok(Sticky.Lines.includes("hook-dsh-search-suggester: section rebuilt (ttl 20)"));
      assert.match(
        DurableLine("section rebuilt (ttl 20)"),
        Durable("section rebuilt (ttl 20)")
      );
      assert.equal(LedgerWith("section rebuilt (ttl 20)").length, 1);
    });
    await CheckAsync(Count, "S2: the section is cached until the TTL expires", async () => {
      const Rings = Sticky.State.Rings.State(AgentOf("a"));
      const Built = Rings.sectionBuilt;
      const Out = await Assemble(Sticky, AgentOf("a"));
      assert.deepEqual(Out.sections.map((Section_) => Section_.name), ["base", "hook-dsh-search-suggester"]);
      assert.equal(Sticky.State.Rings.State(AgentOf("a")).sectionBuilt, Built);
      assert.equal(LedgerWith("section rebuilt (ttl 20)").length, 1);
    });
  }
  {
    rm();
    const Sticky = Make(Validate({ logFile: Ledger, enabled: true, sectionMode: "sticky" }));
    await CheckAsync(Count, "S3: the default ring builds its section from the last noted family", async () => {
      const Rings = Sticky.State.Rings.State(void 0);
      Sticky.State.Rings.Mark(Rings, "History", ["CHANGELOG.md"], "History CHANGELOG.md");
      const Out = await Assemble(Sticky, void 0);
      assert.deepEqual(Out.sections.map((Section_) => Section_.name), ["base", "hook-dsh-search-suggester"]);
      assert.equal(
        Out.sections[1].text,
        "[search-suggester] intent=History confidence=1.00\ntargets (1):\n- CHANGELOG.md - touched after a similar call\nnote: open these before more searches; Target/ is generated, never edit it."
      );
      assert.ok(Sticky.Lines.includes("hook-dsh-search-suggester: section rebuilt (ttl 20)"));
    });
    await CheckAsync(Count, "S3: tools/change invalidates the default ring's cache with its ledger line", async () => {
      Sticky.Lines.length = 0;
      Sticky.CtxListeners["tools/change"]();
      assert.ok(Sticky.Lines.includes("hook-dsh-search-suggester: section invalidated (tools/change)"));
      assert.match(
        DurableLine("section invalidated (tools/change)"),
        Durable("section invalidated (tools/change)")
      );
      const Out = await Assemble(Sticky, void 0);
      assert.deepEqual(Out.sections.map((Section_) => Section_.name), ["base", "hook-dsh-search-suggester"]);
      assert.ok(Sticky.Lines.includes("hook-dsh-search-suggester: section rebuilt (ttl 20)"));
    });
    await CheckAsync(Count, "S3: tools/change on an empty cache is silent", async () => {
      rm();
      const Fresh = Make(Validate({ logFile: Ledger, enabled: true, sectionMode: "sticky" }));
      Fresh.Lines.length = 0;
      Fresh.CtxListeners["tools/change"]();
      assert.deepEqual(Fresh.Lines, []);
    });
  }
  {
    const Run = Setup();
    await CheckAsync(Count, "S4: an assemble with no cooled family passes through with no section", async () => {
      const Out = await Assemble(Run, void 0);
      assert.deepEqual(Out.sections, [{ name: "base", text: "b" }]);
      assert.deepEqual(Run.Lines, [`hook-dsh-search-suggester: activated (bundle ${"0.2.1"}, history, threshold 0.75)`]);
      assert.deepEqual(Run.Warns, []);
    });
  }
  return Finish(Count, "Sticky-Section-And-Ring");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Sticky-Section-And-Ring`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

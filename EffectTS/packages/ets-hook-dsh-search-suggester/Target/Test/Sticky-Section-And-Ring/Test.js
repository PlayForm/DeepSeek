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
  Setup,
  Validate
} from "../Harness.js";
const StrongVersion = (Id) => ({
  name: "grep",
  arguments: { pattern: "1.2.3 version", path: "package.json" },
  agent: AgentOf(Id)
});
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup();
    await CheckAsync(Count, "S1: with sectionMode off the assemble passes through untouched", async () => {
      await Post(Run, StrongVersion("a"));
      const Out = await Assemble(Run, AgentOf("a"));
      assert.deepEqual(Out.sections, [{ name: "base", text: "b" }]);
      assert.ok(!Run.Lines.includes("hook-dsh-search-suggester: section rebuilt (ttl 20)"));
    });
  }
  {
    rm();
    const Sticky = Make(Validate({ logFile: Ledger, enabled: true, sectionMode: "sticky" }));
    await CheckAsync(Count, "S2: after an emit the sticky section is appended", async () => {
      await Post(Sticky, StrongVersion("a"));
      const Out = await Assemble(Sticky, AgentOf("a"));
      assert.deepEqual(Out.sections.map((Section) => Section.name), ["base", "hook-dsh-search-suggester"]);
      assert.equal(
        Out.sections[1].text,
        "[search-suggester] intent=Version confidence=1.00\ntargets (10):\n- package.json - the monorepo manifest\n- Site/package.json - the site manifest\n- Classic/packages/*/package.json - the Classic manifests\n- EffectTS/packages/*/package.json - the EffectTS manifests\n- */Source/Function/Apply.ts - the const Version\n- Site/Source/Library/Content.ts - the site release constant\n- CHANGELOG.md - the new section\n- Documentation/Plugins/PLUGIN-FAMILY.md - the roster versions\n- Site/Source/pages/versions.astro - the versions page\n- .github/workflows/NPM.yml - the publish trigger\nnote: open these before more searches; Target/ is generated, never edit it."
      );
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
      assert.deepEqual(Out.sections.map((Section) => Section.name), ["base", "hook-dsh-search-suggester"]);
      assert.equal(Sticky.State.Rings.State(AgentOf("a")).sectionBuilt, Built);
      assert.equal(LedgerWith("section rebuilt (ttl 20)").length, 1);
    });
  }
  {
    rm();
    const Sticky = Make(Validate({ logFile: Ledger, enabled: true, sectionMode: "sticky" }));
    await CheckAsync(Count, "S3: the default ring builds its section on the no-agent emit and assemble", async () => {
      await Post(Sticky, { name: "grep", arguments: { pattern: "1.2.3 version", path: "package.json" }, agent: void 0 });
      const Out = await Assemble(Sticky, void 0);
      assert.deepEqual(Out.sections.map((Section) => Section.name), ["base", "hook-dsh-search-suggester"]);
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
      assert.deepEqual(Out.sections.map((Section) => Section.name), ["base", "hook-dsh-search-suggester"]);
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
    await CheckAsync(Count, "S4: an assemble with no cooled intent passes through with no section", async () => {
      const Out = await Assemble(Run, void 0);
      assert.deepEqual(Out.sections, [{ name: "base", text: "b" }]);
      assert.deepEqual(Run.Lines, ["hook-dsh-search-suggester: activated (bundle 0.3.0, intents 10, threshold 0.75)"]);
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

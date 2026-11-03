import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import {
  AgentOf,
  CheckAsync,
  Durable,
  DurableLine,
  Finish,
  Knowledge,
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
const Persist = (Dismissals) => {
  FileSystem.writeFileSync(
    Knowledge,
    JSON.stringify({
      schema: 1,
      intents: {},
      journal: [],
      dismissals: Dismissals,
      stats: { emitted: 0, followed: 0, ignored: 0, dismissed: 0 }
    }),
    "utf8"
  );
};
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup();
    await CheckAsync(Count, "D1: the tool registers through the loader's tool API", async () => {
      assert.equal(Run.Tools.length, 1);
      const Tool = Run.Tools[0];
      assert.equal(Tool.name, "suggestion_dismiss");
      assert.equal(typeof Tool.execute, "function");
      assert.deepEqual(Tool.parameters.required, ["intent"]);
      assert.equal(Tool.parameters.properties.intent.type, "string");
      assert.equal(Tool.parameters.properties.path.type, "string");
      assert.deepEqual(Object.keys(Tool.output.schema.properties).sort(), [
        "detail",
        "dismissed",
        "intent",
        "path",
        "until"
      ]);
      assert.deepEqual(Tool.output.schema.required, ["dismissed", "intent", "until", "detail"]);
    });
  }
  {
    rm();
    const Run = Setup();
    SeedHistory(Run, "a", Space.At(Anchor), Companions);
    await CheckAsync(Count, "D2: a family dismissal is recorded and ledgered", async () => {
      const Before = Math.floor(Date.now() / 1e3);
      const Out = await Run.Tools[0].execute({ intent: "History" }, {});
      const After = Math.floor(Date.now() / 1e3);
      assert.equal(Out.dismissed, true);
      assert.equal(Out.intent, "History");
      assert.equal(Object.hasOwn(Out, "path"), false);
      assert.ok(Out.until >= Before + 86400 && Out.until <= After + 86400);
      assert.equal(Out.detail, `dismissed History until ${Out.until}`);
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: dismissed History *"));
      assert.match(DurableLine("dismissed History *"), Durable("dismissed History *"));
      assert.equal(LedgerWith("dismissed History *").length, 1);
    });
    await CheckAsync(Count, "D2: the dismissal lands in the knowledge file", async () => {
      const Stored = JSON.parse(FileSystem.readFileSync(Knowledge, "utf8"));
      assert.equal(Stored.dismissals.length, 1);
      assert.equal(Stored.dismissals[0].intent, "History");
      assert.equal(Object.hasOwn(Stored.dismissals[0], "path"), false);
      assert.equal(Stored.stats.dismissed, 1);
      assert.equal(Stored.seed, false);
    });
    await CheckAsync(Count, "D2: the family dismissal suppresses the note", async () => {
      const Out = await Post(Run, Read("a"), { kind: "allow", additionalContexts: [] });
      assert.deepEqual(Out.additionalContexts, []);
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: suppressed dismissed History"));
      assert.match(
        DurableLine("suppressed dismissed History"),
        Durable("suppressed dismissed History")
      );
      assert.equal(Run.Lines.filter((Line) => Line.includes(": suggest ")).length, 0);
    });
  }
  {
    rm();
    const Run = Setup();
    SeedHistory(Run, "b", Space.At(Anchor), Companions);
    await CheckAsync(Count, "D3: a path dismissal is recorded with its path", async () => {
      const Out = await Run.Tools[0].execute({ intent: "History", path: "CHANGELOG.md" }, {});
      assert.equal(Out.dismissed, true);
      assert.equal(Out.path, "CHANGELOG.md");
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: dismissed History CHANGELOG.md"));
    });
    await CheckAsync(Count, "D3: the dismissed path leaves the note, the rest emits", async () => {
      const Out = await Post(Run, Read("b"));
      const Text = Out.additionalContexts[0].content[0].text;
      assert.equal(Text.includes("- CHANGELOG.md"), false);
      assert.equal(Text.includes("- SCHEME.md - touched 1 time(s) after a similar call"), true);
      assert.equal(
        Text.startsWith("[search-suggester] intent=History confidence=0.87\ntargets (1):"),
        true
      );
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: suggest History 0.87 1 candidates"));
    });
  }
  {
    rm();
    Persist([{ intent: "History", until: Math.floor(Date.now() / 1e3) + 3600 }]);
    const Live = Make(Validate({ logFile: Ledger, enabled: true }));
    SeedHistory(Live, "a", Space.At(Anchor), Companions);
    await CheckAsync(Count, "D4: a live dismissal survives a reload", async () => {
      assert.equal(Live.State.Knowledge.dismissals.length, 1);
      const Out = await Post(Live, Read("a"), { kind: "allow", additionalContexts: [] });
      assert.deepEqual(Out.additionalContexts, []);
      assert.ok(Live.Lines.includes("hook-dsh-search-suggester: suppressed dismissed History"));
    });
    rm();
    Persist([{ intent: "History", until: 1 }]);
    const Expired = Make(Validate({ logFile: Ledger, enabled: true }));
    SeedHistory(Expired, "a", Space.At(Anchor), Companions);
    await CheckAsync(Count, "D4: an expired dismissal is pruned and the note returns", async () => {
      assert.equal(Expired.State.Knowledge.dismissals.length, 1);
      const Out = await Post(Expired, Read("a"));
      assert.equal(Out.additionalContexts[0].source.summary, "History 0.87");
      assert.equal(Expired.State.Knowledge.dismissals.length, 0);
      assert.equal(Expired.Lines.filter((Line) => Line.includes("dismissed")).length, 0);
    });
  }
  {
    rm();
    const Run = Setup();
    await CheckAsync(Count, "D5: an unknown family is a self-describing error", async () => {
      await assert.rejects(
        Run.Tools[0].execute({ intent: "Nope" }, {}),
        /unknown suggestion family "Nope"/
      );
      await assert.rejects(
        Run.Tools[0].execute({ intent: "Version" }, {}),
        /unknown suggestion family "Version"/
      );
      assert.equal(Run.Lines.filter((Line) => Line.includes(": dismissed ")).length, 0);
    });
    await CheckAsync(Count, "D5: a disabled suggester refuses the tool", async () => {
      rm();
      const Off = Make(Validate({ logFile: Ledger, enabled: false }));
      await assert.rejects(Off.Tools[0].execute({ intent: "History" }, {}), /disabled \(enabled=false\)/);
    });
  }
  return Finish(Count, "Dismiss");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Dismiss`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

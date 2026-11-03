import assert from "node:assert/strict";
import Benchmark from "../../Function/Benchmark.js";
import Sequence from "../../Variable/Sequence.js";
import {
  AgentOf,
  CheckAsync,
  Finish,
  Ledger,
  Make,
  MakeCounter,
  Post,
  Pre,
  rm,
  SeedHistory,
  Setup,
  Validate,
  Workspace
} from "../Harness.js";
const Bench = () => {
  rm();
  return Make(Validate({ logFile: Ledger, enabled: true, threshold: 0.6 }));
};
const Lanes = ["version", "test", "doc", "config", "symbol"].map((Id) => ({
  Id,
  Anchor: `History/${Id}/anchor.ts`,
  Companions: [0, 1, 2, 3].map((Index) => `History/${Id}/c${Index}.ts`)
}));
const Space = Workspace(Lanes.flatMap((Lane) => [Lane.Anchor, ...Lane.Companions]));
const Expected = {
  History: Lanes.flatMap((Lane) => Lane.Companions)
};
const Seed = (Run) => {
  for (const Lane of Lanes) {
    SeedHistory(Run, Lane.Id, Space.At(Lane.Anchor), Lane.Companions);
  }
};
const Candidates = (Text) => Text.split("\n").filter((Line) => Line.startsWith("- ")).map((Line) => {
  const Body = Line.slice(2);
  const Cut = Body.indexOf(" - ");
  const Head = Cut === -1 ? Body : Body.slice(0, Cut);
  return Head.replace(/ \(\d+\)$/, "");
});
const Replay = async (Run) => {
  const Notes = [];
  const Seen = /* @__PURE__ */ new Set();
  for (const [Index, Call] of Sequence.calls.entries()) {
    if (Call.context !== void 0) {
      await Pre(Run, {
        agent: AgentOf(Call.agent),
        messages: [{ role: "user", content: Call.context }]
      });
    }
    const First = !Seen.has(Call.agent);
    Seen.add(Call.agent);
    const Lane = Lanes.find((Entry) => Entry.Id === Call.agent);
    const Arguments = First && Lane !== void 0 ? { ...Call.arguments, path: Space.At(Lane.Anchor) } : Call.arguments;
    const Out = await Post(Run, {
      name: Call.name,
      arguments: Arguments,
      agent: AgentOf(Call.agent)
    });
    const Contexts = Out.additionalContexts ?? [];
    const Note = Contexts.find((Entry) => Entry?.source?.kind === "search-suggester");
    if (Note === void 0) {
      continue;
    }
    const Text = Note.content[0].text;
    Notes.push({
      intent: String(Note.source.summary).split(" ")[0] ?? "",
      candidates: Candidates(Text),
      call: Index + 1
    });
  }
  return Notes;
};
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Bench();
    Seed(Run);
    const Notes = await Replay(Run);
    await CheckAsync(Count, "B1: the sequence emits one note per lane", async () => {
      assert.deepEqual(
        Notes.map((Note) => Note.intent),
        ["History", "History", "History", "History", "History"]
      );
      assert.deepEqual(
        Notes.map((Note) => Note.candidates.length),
        [4, 4, 4, 4, 4]
      );
    });
    const Metrics = Benchmark(Notes, Expected);
    await CheckAsync(Count, "B1: the benchmark numbers are the recorded baseline", async () => {
      assert.equal(Metrics.Notes, 5);
      assert.equal(Metrics.Suggested, 20);
      assert.equal(Metrics.Hits, 20);
      assert.equal(Metrics.Expected, 20);
      assert.equal(Metrics.Matched, 20);
      assert.equal(Metrics.First, 1);
      assert.equal(Metrics.Precision.toFixed(2), "1.00");
      assert.equal(Metrics.Recall.toFixed(2), "1.00");
    });
    await CheckAsync(Count, "B1: the benchmark line prints the numbers", async () => {
      const Line = `benchmark: calls=${Sequence.calls.length} notes=${Metrics.Notes} precision=${Metrics.Precision.toFixed(2)} recall=${Metrics.Recall.toFixed(2)} first-note=${Metrics.First}`;
      console.log(Line);
      assert.equal(
        Line,
        "benchmark: calls=50 notes=5 precision=1.00 recall=1.00 first-note=1"
      );
    });
  }
  {
    const Run = Bench();
    Seed(Run);
    const Metrics = Benchmark(await Replay(Run), Expected);
    await CheckAsync(Count, "B2: the replay is deterministic", async () => {
      assert.equal(Metrics.Notes, 5);
      assert.equal(Metrics.Suggested, 20);
      assert.equal(Metrics.Expected, 20);
      assert.equal(Metrics.Matched, 20);
      assert.equal(Metrics.Precision.toFixed(2), "1.00");
      assert.equal(Metrics.Recall.toFixed(2), "1.00");
      assert.equal(Metrics.First, 1);
    });
    await CheckAsync(Count, "B2: the replay leaves the deterministic ledger trail", async () => {
      assert.equal(Run.Lines.filter((Line) => Line.includes(": suggest ")).length, 5);
      assert.equal(Run.Warns.length, 0);
    });
  }
  {
    const Run = Setup();
    Seed(Run);
    const Metrics = Benchmark(await Replay(Run), Expected);
    await CheckAsync(Count, "B3: the config cannot lower the family's gate", async () => {
      assert.equal(Metrics.Notes, 5);
      assert.equal(Metrics.Suggested, 20);
      assert.equal(Metrics.Precision.toFixed(2), "1.00");
      assert.equal(Metrics.Recall.toFixed(2), "1.00");
    });
  }
  return Finish(Count, "Benchmark");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Benchmark`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

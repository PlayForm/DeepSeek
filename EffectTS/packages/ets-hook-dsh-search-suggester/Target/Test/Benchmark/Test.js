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
  Setup,
  Validate
} from "../Harness.js";
const Bench = () => {
  rm();
  return Make(Validate({ logFile: Ledger, enabled: true, threshold: 0.6 }));
};
const Candidates = (Text) => Text.split("\n").filter((Line) => Line.startsWith("- ")).map((Line) => {
  const Body = Line.slice(2);
  const Cut = Body.indexOf(" - ");
  const Head = Cut === -1 ? Body : Body.slice(0, Cut);
  return Head.replace(/ \(\d+\)$/, "");
});
const Replay = async (Run) => {
  const Notes = [];
  for (const [Index, Call] of Sequence.calls.entries()) {
    if (Call.context !== void 0) {
      await Pre(Run, {
        agent: AgentOf(Call.agent),
        messages: [{ role: "user", content: Call.context }]
      });
    }
    const Out = await Post(Run, {
      name: Call.name,
      arguments: Call.arguments,
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
    const Notes = await Replay(Run);
    await CheckAsync(Count, "B1: the sequence emits one note per lane", async () => {
      assert.deepEqual(
        Notes.map((Note) => Note.intent),
        ["Version", "Test", "Doc", "Config", "Symbol"]
      );
      assert.deepEqual(
        Notes.map((Note) => Note.candidates.length),
        [7, 4, 5, 6, 4]
      );
    });
    const Metrics = Benchmark(Notes, Sequence.expected);
    await CheckAsync(Count, "B1: the benchmark numbers are the recorded baseline", async () => {
      assert.equal(Metrics.Notes, 5);
      assert.equal(Metrics.Suggested, 26);
      assert.equal(Metrics.Hits, 26);
      assert.equal(Metrics.Expected, 37);
      assert.equal(Metrics.Matched, 26);
      assert.equal(Metrics.First, 1);
      assert.equal(Metrics.Precision.toFixed(2), "1.00");
      assert.equal(Metrics.Recall.toFixed(2), "0.70");
    });
    await CheckAsync(Count, "B1: the benchmark line prints the numbers", async () => {
      const Line = `benchmark: calls=${Sequence.calls.length} notes=${Metrics.Notes} precision=${Metrics.Precision.toFixed(2)} recall=${Metrics.Recall.toFixed(2)} first-note=${Metrics.First}`;
      console.log(Line);
      assert.equal(
        Line,
        "benchmark: calls=50 notes=5 precision=1.00 recall=0.70 first-note=1"
      );
    });
  }
  {
    const Run = Bench();
    const Metrics = Benchmark(await Replay(Run), Sequence.expected);
    await CheckAsync(Count, "B2: the replay is deterministic", async () => {
      assert.equal(Metrics.Notes, 5);
      assert.equal(Metrics.Suggested, 26);
      assert.equal(Metrics.Expected, 37);
      assert.equal(Metrics.Matched, 26);
      assert.equal(Metrics.Precision.toFixed(2), "1.00");
      assert.equal(Metrics.Recall.toFixed(2), "0.70");
      assert.equal(Metrics.First, 1);
    });
    await CheckAsync(Count, "B2: the replay leaves the deterministic ledger trail", async () => {
      assert.equal(Run.Lines.filter((Line) => Line.includes(": suggest ")).length, 5);
      assert.equal(Run.Warns.length, 0);
    });
  }
  {
    const Run = Setup();
    const Metrics = Benchmark(await Replay(Run), Sequence.expected);
    await CheckAsync(Count, "B3: the config cannot lower the pack's gates", async () => {
      assert.equal(Metrics.Notes, 5);
      assert.equal(Metrics.Suggested, 26);
      assert.equal(Metrics.Precision.toFixed(2), "1.00");
      assert.equal(Metrics.Recall.toFixed(2), "0.70");
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

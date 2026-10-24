import assert from "node:assert/strict";
import { AgentOf, CheckAsync, Finish, MakeCounter, Post, Pre, Setup } from "../Harness.js";
const Grep = (Run, Agent, Pattern) => Post(Run, { name: "grep", arguments: { pattern: Pattern, path: "" }, agent: AgentOf(Agent) });
const Other = (Run, Name, Args) => Post(Run, { name: Name, arguments: Args, agent: AgentOf("noise") });
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup();
    let Notes = 0;
    const Record = (Out) => {
      Notes += (Out.additionalContexts ?? []).length;
    };
    await CheckAsync(Count, "N1: twenty legitimate calls produce exactly zero notes", async () => {
      for (let Index = 0; Index < 5; Index += 1) {
        Record(await Grep(Run, `n${Index}`, `unrelated query ${Index}`));
      }
      for (const [Index, Pattern] of [
        "threshold",
        "PASS",
        "const Thing",
        "README",
        "hook-dsh-noise"
      ].entries()) {
        Record(await Grep(Run, `l${Index}`, Pattern));
      }
      Record(await Other(Run, "webfetch", { url: "https://example.com" }));
      Record(await Other(Run, "agent", { prompt: "read the docs" }));
      Record(await Other(Run, "web_search", { queries: ["search suggester"] }));
      Record(await Other(Run, "list_agents", {}));
      Record(await Other(Run, "write", { file_path: "Temporary/scratch.txt", content: "x" }));
      for (let Index = 5; Index < 10; Index += 1) {
        Record(await Grep(Run, `n${Index}`, `unrelated query ${Index}`));
      }
      assert.equal(Notes, 0);
    });
    await CheckAsync(Count, "N1: the silence is measured (ten abstention lines)", async () => {
      assert.equal(Run.Lines.filter((Line) => Line.includes(": suggest ")).length, 0);
      assert.equal(
        Run.Lines.filter((Line) => Line.includes("abstained no-signal")).length,
        10
      );
      assert.equal(
        Run.Lines.filter((Line) => Line.includes("abstained low-confidence")).length,
        5
      );
    });
    await CheckAsync(Count, "N1: no warning fired during the silent run", async () => {
      assert.deepEqual(Run.Warns, []);
    });
  }
  {
    const Run = Setup();
    await CheckAsync(Count, "N2: a fresh turn stays silent after a silent turn", async () => {
      await Grep(Run, "a", "unrelated query one");
      await Pre(Run, { agent: AgentOf("a"), messages: [{ source: { kind: "user" } }] });
      const Second = await Grep(Run, "a", "unrelated query two");
      assert.deepEqual(Second.additionalContexts ?? [], []);
      assert.equal(Run.Lines.filter((Line) => Line.includes(": suggest ")).length, 0);
    });
  }
  return Finish(Count, "Noise");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Noise`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

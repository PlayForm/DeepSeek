import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import {
  Call,
  Check,
  CheckAsync,
  FakeStorage,
  Finish,
  FreshRecord,
  LinesWith,
  MakeCounter,
  Mount,
  Setup,
  WriteStore,
  rmStore
} from "../Harness.js";
const Probe = (Path_) => ({
  file_path: Path_,
  pattern: "export function"
});
const Knobs = { cooldownCalls: 0, maxNotesPerTurn: 5 };
const Episode = async (Run, Agent) => {
  for (const Name of ["src/A.ts", "src/B.ts", "src/C.ts", "src/D.ts"]) {
    await Call(Run, "read", Probe(Name), Agent);
  }
};
const Service = (Cwd) => ({ get: () => Cwd });
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Agent = { agent: { id: "produce-a" } };
    const Run = Setup(Knobs);
    await Run.State.Flush();
    await Episode(Run, Agent);
    await CheckAsync(Count, "H1: the judged calls fill the durable mirror, newest first", async () => {
      await Run.State.Flush();
      assert.deepEqual(
        Run.State.History.map((Entry) => `${Entry.seq} ${Entry.path} ${Entry.intent}`),
        ["3 src/D.ts Repeat", "2 src/C.ts Repeat", "1 src/B.ts Repeat", "0 src/A.ts replay"]
      );
    });
    await CheckAsync(Count, "H1: the agent's own ring carries the same calls", async () => {
      const Memory = Run.State.Agents.get(Agent);
      assert.deepEqual(
        Memory.History.map((Entry) => Entry.path),
        ["src/D.ts", "src/C.ts", "src/B.ts", "src/A.ts"]
      );
    });
    await CheckAsync(Count, "H1: every recorded call logs the byte-exact line", async () => {
      await Run.State.Flush();
      assert.deepEqual(LinesWith(Run, "recorded "), [
        "replay-suggester: recorded replay src/A.ts (1 in store)",
        "replay-suggester: recorded Repeat src/B.ts (2 in store)",
        "replay-suggester: recorded Repeat src/C.ts (3 in store)",
        "replay-suggester: recorded Repeat src/D.ts (4 in store)"
      ]);
    });
  }
  {
    const Agent = { agent: { id: "recall-a" } };
    const Run = Setup(Knobs);
    await Run.State.Flush();
    await Episode(Run, Agent);
    const Result = await Call(Run, "read", Probe("src/E.ts"), Agent);
    Check(Count, "H2: the note names the companions of the similar call", () => {
      assert.equal(Result.additionalContexts.length, 1);
      assert.deepEqual(Result.additionalContexts[0].source, {
        kind: "replay-suggester",
        form: "notice",
        summary: "Repeat 0.77"
      });
      assert.equal(
        Result.additionalContexts[0].content[0].text,
        "[replay-suggester] intent=Repeat confidence=0.77\ntargets (3):\n- src/D.ts - touched last time (Repeat)\n- src/C.ts - touched last time (Repeat)\n- src/B.ts - touched last time (Repeat)\nnote: the recall is the answer; without a record the hook abstains."
      );
    });
    Check(Count, "H2: the suggest line counts the recalled companions", () => {
      assert.deepEqual(LinesWith(Run, "candidates call").slice(-1), [
        "replay-suggester: suggest Repeat 0.77 3 candidates call read"
      ]);
    });
  }
  {
    const Agent = { agent: { id: "empty-a" } };
    const Run = Setup(Knobs);
    await Run.State.Flush();
    const Decision = { kind: "allow" };
    const Result = await Call(Run, "read", Probe("src/A.ts"), Agent, Decision);
    Check(Count, "H3: an empty store emits NO note and makes NO claim", () => {
      assert.equal(Result, Decision);
      assert.equal(LinesWith(Run, "candidates call").length, 0);
      assert.equal(LinesWith(Run, "abstained").length, 0);
      assert.equal(LinesWith(Run, "store empty (starting fresh)").length, 1);
    });
  }
  {
    const Facility = FakeStorage();
    const Agent = { agent: { id: "kv-a" } };
    const First = Mount(Knobs, Facility);
    await First.State.Flush();
    await Episode(First, Agent);
    await First.State.Flush();
    Check(Count, "H4: the domain spec is replay_history v1 per-record with NO compatibleVersions", () => {
      assert.equal(Facility.spec.name, "replay_history");
      assert.equal(Facility.spec.version, 1);
      assert.equal(Facility.spec.layout, "per-record");
      assert.equal(Facility.spec.invalidRecords, "backup-and-skip");
      assert.ok(Facility.spec.tables.history !== void 0);
      assert.ok(Facility.spec.tables.meta !== void 0);
      assert.equal(Facility.spec.compatibleVersions, void 0);
    });
    const Second = Mount(Knobs, Facility);
    await Second.State.Flush();
    Check(Count, "H4: the reopen restores the entries with the byte-exact line", () => {
      assert.deepEqual(LinesWith(Second, "store recovered"), [
        "replay-suggester: store recovered 4 entries (replay_history)"
      ]);
      assert.equal(Second.State.History.length, 4);
      assert.equal(Second.State.Seq, 4);
    });
    await CheckAsync(Count, "H4: a call after the reopen recalls the restored companions", async () => {
      const Result = await Call(Second, "read", Probe("src/E.ts"), { agent: { id: "kv-b" } });
      assert.equal(
        Result.additionalContexts[0].content[0].text.includes("- src/D.ts - touched last time (Repeat)"),
        true
      );
    });
  }
  {
    const Shared = FreshRecord();
    const Agent = { agent: { id: "file-a" } };
    const First = Setup({ ...Knobs, recordPath: Shared });
    await First.State.Flush();
    await Episode(First, Agent);
    await First.State.Flush();
    Check(Count, "H5: without storage the JSON fallback is the store", () => {
      const Raw = JSON.parse(FileSystem.readFileSync(Shared, "utf8"));
      assert.equal(Raw.version, 1);
      assert.equal(typeof Raw.savedAt, "number");
      assert.deepEqual(
        Raw.entries.map((Entry) => Entry.path),
        ["src/D.ts", "src/C.ts", "src/B.ts", "src/A.ts"]
      );
    });
    const Second = Setup({ ...Knobs, recordPath: Shared });
    await Second.State.Flush();
    Check(Count, "H5: the fallback reopen restores the entries with the byte-exact line", () => {
      assert.deepEqual(LinesWith(Second, "store recovered"), [
        "replay-suggester: store recovered 4 entries (file)"
      ]);
    });
    await CheckAsync(Count, "H5: a call after the fallback reopen recalls the restored companions", async () => {
      const Result = await Call(Second, "read", Probe("src/E.ts"), { agent: { id: "file-b" } });
      assert.equal(
        Result.additionalContexts[0].content[0].text.includes("- src/D.ts - touched last time (Repeat)"),
        true
      );
    });
  }
  {
    const Agent = { agent: { id: "bound-a" } };
    const Run = Setup({ ...Knobs, historyDepth: 2 });
    await Run.State.Flush();
    await Episode(Run, Agent);
    await Run.State.Flush();
    Check(Count, "H6: historyDepth bounds the mirror and the agent ring", () => {
      assert.deepEqual(
        Run.State.History.map((Entry) => Entry.path),
        ["src/D.ts", "src/C.ts"]
      );
      assert.deepEqual(
        Run.State.Agents.get(Agent).History.map((Entry) => Entry.path),
        ["src/D.ts", "src/C.ts"]
      );
    });
  }
  {
    const Agent = { agent: { id: "skip-a" } };
    const Run = Setup(Knobs);
    await Run.State.Flush();
    await Call(Run, "fetch", Probe("src/A.ts"), Agent);
    await CheckAsync(Count, "H7: a non-judged tool is never recorded", async () => {
      await Run.State.Flush();
      assert.equal(Run.State.History.length, 0);
      assert.equal(LinesWith(Run, "recorded ").length, 0);
    });
    const Foreign = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "replay-suggester-foreign-"));
    FileSystem.writeFileSync(Path.join(Foreign, "src.ts"), "x", "utf8");
    const Gated = Setup(Knobs);
    Gated.Context.workingDirectory = Service(Foreign);
    await Call(Gated, "read", Probe(Path.join(Foreign, "src.ts")), Agent);
    await CheckAsync(Count, "H7: a foreign-workspace call is never recorded", async () => {
      await Gated.State.Flush();
      assert.equal(Gated.State.History.length, 0);
      assert.equal(LinesWith(Gated, "recorded ").length, 0);
      assert.ok(Gated.Lines.includes("replay-suggester: abstained foreign-workspace  0.00"));
    });
  }
  {
    rmStore();
    WriteStore([{ intent: "Repeat", probe: "src", files: ["src/Seed.ts"], verify: "", at: 1 }]);
    const Agent = { agent: { id: "seed-a" } };
    const Run = Setup(Knobs);
    await Run.State.Flush();
    await Episode(Run, Agent);
    const Result = await Call(Run, "read", Probe("src/E.ts"), Agent);
    Check(Count, "H8: the seeded record takes precedence over the live history", () => {
      const Text = Result.additionalContexts[0].content[0].text;
      assert.equal(Text.includes("- src/Seed.ts - touched last time (Repeat)"), true);
      assert.equal(Text.includes("- src/D.ts"), false);
    });
    rmStore();
  }
  {
    const Facility = FakeStorage({ failOpen: true });
    const Run = Mount(Knobs, Facility);
    await Run.State.Flush();
    Check(Count, "H9: a failed open is loud and the JSON fallback takes over", () => {
      assert.deepEqual(LinesWith(Run, "store open failed"), [
        "replay-suggester: store open failed: storage unavailable"
      ]);
      assert.equal(Run.State.Handle, void 0);
      assert.equal(LinesWith(Run, "store empty (starting fresh)").length, 1);
    });
  }
  return Finish(Count, "History-Producer");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - History-Producer`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

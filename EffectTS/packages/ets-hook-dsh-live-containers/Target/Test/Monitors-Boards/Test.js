import assert from "node:assert/strict";
import {
  Advance,
  Check,
  ClockBox,
  Finish,
  FireJobs,
  FireObserved,
  FireSession,
  MakeCounter,
  MakeWave,
  FakeJobsHub,
  FakeShell,
  Validate,
  Ledger,
  rm,
  MonitorConfig,
  WaveAssemble,
  live_plant,
  AgentA
} from "../Harness.js";
const Setup = (Config = {}) => {
  const Jobs = FakeJobsHub();
  const Shell = FakeShell();
  const Run = MakeWave(
    Validate({
      logFile: Ledger,
      enabled: true,
      ...MonitorConfig({ watchlist: [{ glob: "**/*.ts", checks: ["tsc"] }] }),
      ...Config
    }),
    { jobs: Jobs, shell: Shell }
  );
  return { Jobs, Shell, Run };
};
const BoardText = async (Run) => (await WaveAssemble(Run)).sections.find((S) => S.name === "live-containers")?.text ?? "";
const runTest = async () => {
  const Count = MakeCounter();
  rm();
  ClockBox.Now = 17e11;
  {
    const { Jobs, Run } = Setup();
    await live_plant(Run, AgentA, { id: "b1", plantType: "monitors", expectAgents: 1, memberIds: ["child-1"] });
    FireObserved(Run, "/repo/src/App.ts", "1", { agent: { id: "child-1", session: void 0 } });
    Advance(2e3);
    await BoardText(Run);
    const JobId = Jobs.started[0].id;
    FireJobs(Run, Jobs.settled(JobId, { owner: "child-1", detail: "exit code: 0" }));
    const Text = await BoardText(Run);
    Check(Count, "R1: the member's monitor settle feeds the monitors board row", () => {
      const Board = Run.State.Boards.get("agent-a")?.get("b1");
      assert.equal(Board?.items.length, 1);
      assert.equal(Board?.items[0]?.label, "/repo/src/App.ts");
      assert.equal(Board?.items[0]?.state, "clean (\u2204)");
      assert.ok(Text.includes("[monitored] /repo/src/App.ts - clean (\u2204) by child-1"), `missing in: ${Text.slice(0, 500)}`);
    });
    Check(Count, "R1: the skip guard - the member's TASK row was NOT flipped by its monitor settle", () => {
      const Board = Run.State.Boards.get("agent-a")?.get("b1");
      assert.equal(Board?.members[0]?.status, "running");
    });
    Check(Count, "R1: the writer of the row is the checked version's writer", () => {
      const Board = Run.State.Boards.get("agent-a")?.get("b1");
      assert.equal(Board?.items[0]?.by, "child-1");
    });
  }
  rm();
  {
    const { Run } = Setup();
    await live_plant(Run, AgentA, { id: "b2", plantType: "monitors", expectAgents: 1, memberIds: ["child-1"] });
    FireSession(Run, {
      type: "agent/inbox/spliced",
      data: {
        inserted: [
          {
            content: [
              { type: "text", text: "[live-report] b2 child-1 monitored problem /repo/some path.ts" }
            ]
          }
        ]
      }
    });
    const Text = await BoardText(Run);
    Check(Count, "R2: the monitored report folds the row with the path kept whole", () => {
      const Board = Run.State.Boards.get("agent-a")?.get("b2");
      assert.equal(Board?.items.length, 1);
      assert.equal(Board?.items[0]?.label, "/repo/some path.ts");
      assert.equal(Board?.items[0]?.state, "problem (!)");
      assert.ok(Text.includes("[monitored] /repo/some path.ts - problem (!) by child-1"), `missing in: ${Text.slice(0, 500)}`);
    });
  }
  rm();
  {
    const { Jobs, Run } = Setup();
    await live_plant(Run, AgentA, { id: "b3", plantType: "agent-board", expectAgents: 1, memberIds: ["child-1"] });
    FireJobs(Run, Jobs.settled("bash-abc", { owner: "child-1", detail: "exit code: 0" }));
    const Text = await BoardText(Run);
    Check(Count, "R3: a non-monitor settle still flips the member's row to done", () => {
      const Board = Run.State.Boards.get("agent-a")?.get("b3");
      assert.equal(Board?.members[0]?.status, "done");
      assert.ok(Text.includes("[done]"), `missing in: ${Text.slice(0, 400)}`);
    });
  }
  rm();
  {
    const { Run } = Setup();
    const Value = await live_plant(Run, AgentA, { id: "b4", plantType: "monitors", expectAgents: 2 });
    Check(Count, "R4: live_plant opens a monitors board with the monitors plantType", () => {
      assert.equal(Value.plantType, "monitors");
      assert.ok(Run.State.Boards.get("agent-a")?.get("b4") !== void 0);
    });
    let Message = "";
    try {
      await live_plant(Run, AgentA, { id: "b5", plantType: "nonsense" });
    } catch (Error) {
      Message = String(Error.message);
    }
    Check(Count, "R4: an unknown plantType still fails loud with the extended list", () => {
      assert.ok(Message.includes('expected one of "agent-board" | "todo-fill" | "aggregate" | "custom" | "monitors"'), `wrong: ${Message}`);
    });
  }
  return Finish(Count, "Monitors-Boards");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Monitors-Boards`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

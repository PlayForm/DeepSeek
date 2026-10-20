import assert from "node:assert/strict";
import {
  Check,
  Finish,
  FireObserved,
  LinesWith,
  MakeCounter,
  MakeWave,
  FakeJobsHub,
  FakeShell,
  Validate,
  Ledger,
  rm,
  Advance,
  MonitorConfig,
  ClockBox,
  live_monitor,
  CallTool,
  WaveAssemble
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
const Rendered = (Run, Name, Value) => Run.tools[Name].output.render(null, Value)[0].text;
const runTest = async () => {
  const Count = MakeCounter();
  rm();
  ClockBox.Now = 17e11;
  {
    const { Run } = Setup({ watchlist: [] });
    const Value = await live_monitor(Run, { id: "agent-a" }, { path: "/repo/src/App.ts" });
    Check(Count, "T1: the explicit enrollment classifies from the catalog and logs byte-exact", () => {
      assert.equal(Value.action, "enrolled");
      assert.deepEqual(Value.count, 2);
      assert.deepEqual(LinesWith(Run, "monitor enrolled"), [
        "hook-dsh-live-containers: monitor enrolled /repo/src/App.ts (by agent-a)"
      ]);
    });
    Check(Count, "T1: the rendered text is byte-exact", () => {
      assert.equal(
        Rendered(Run, "live_monitor", Value),
        "monitored /repo/src/App.ts (2 checks) - the band renders in the live section."
      );
    });
  }
  rm();
  {
    const { Run } = Setup({ watchlist: [] });
    await live_monitor(Run, { id: "agent-a" }, { path: "/repo/src/App.ts", agent: "child-1" });
    Check(Count, "T2: the enrollment lands in the named session's monitor set", () => {
      assert.ok(Run.State.Monitors.get("child-1")?.get("/repo/src/App.ts") !== void 0);
      assert.equal(Run.State.Monitors.get("agent-a")?.size ?? 0, 0);
      assert.deepEqual(LinesWith(Run, "monitor enrolled"), [
        "hook-dsh-live-containers: monitor enrolled /repo/src/App.ts (by agent-a)"
      ]);
    });
  }
  rm();
  {
    const { Run } = Setup();
    FireObserved(Run, "/repo/src/App.ts", "1");
    FireObserved(Run, "/repo/src/Other.ts", "1");
    const Value = await live_monitor(Run, { id: "agent-a" }, { off: "**/*.ts" });
    Check(Count, "T3: the opt-out retires both matches and logs the byte-exact line", () => {
      assert.equal(Value.count, 2);
      assert.deepEqual(LinesWith(Run, "monitor off"), [
        "hook-dsh-live-containers: monitor off **/*.ts"
      ]);
      assert.deepEqual(Run.State.MonitorOptOuts.get("agent-a"), ["**/*.ts"]);
    });
    await WaveAssemble(Run);
    Check(Count, "T3: the closing lines render at the next assembly", () => {
      assert.equal(LinesWith(Run, "monitor retired").length, 2);
    });
  }
  rm();
  {
    const { Run } = Setup();
    FireObserved(Run, "/repo/src/App.ts", "1");
    const Value = await live_monitor(Run, { id: "agent-a" }, { list: true });
    Check(Count, "T4: the list renders the enrolled files with their primary outcomes", () => {
      const Lines = Value.lines;
      assert.equal(Lines.length, 1);
      assert.ok(Lines[0]?.startsWith("/repo/src/App.ts - not run yet ("));
    });
  }
  rm();
  {
    const { Jobs, Run } = Setup({ watchlist: [{ glob: "**/*.ts", checks: ["tsc", "format"] }] });
    FireObserved(Run, "/repo/src/App.ts", "1");
    const Value = await CallTool(Run, "live_monitor_check", { path: "/repo/src/App.ts" });
    Check(Count, "T5: the deep check starts one job per set and reports the job ids", () => {
      assert.equal(Value.started, true);
      assert.equal(Jobs.started.length, 2);
      assert.deepEqual(Value.jobs, Jobs.started.map((S) => S.id));
    });
    Check(Count, "T5: the rendered text is byte-exact", () => {
      const Ids = Jobs.started.map((S) => S.id).join(", ");
      assert.equal(
        Rendered(Run, "live_monitor_check", Value),
        `[monitor] deep check started /repo/src/App.ts (2 checks) - job_output ${Ids} for the full tail.`
      );
    });
  }
  rm();
  {
    const { Jobs, Run } = Setup();
    FireObserved(Run, "/repo/src/App.ts", "1");
    Run.State.MonitorJobs.set("fake-1", {
      agentId: "agent-a",
      path: "/repo/src/Other.ts",
      pathKey: "/repo/src/Other.ts",
      setId: "tsc",
      startedAt: ClockBox.Now,
      checkedVersion: "1",
      writer: "agent-a",
      tail: { Render: () => "" }
    });
    Run.State.MonitorJobs.set("fake-2", { ...Run.State.MonitorJobs.get("fake-1"), path: "/x" });
    Run.State.MonitorJobs.set("fake-3", { ...Run.State.MonitorJobs.get("fake-1"), path: "/y" });
    const Value = await CallTool(Run, "live_monitor_check", { path: "/repo/src/App.ts" });
    Check(Count, "T6: at full admission the deep check coalesces and answers the pending form", () => {
      assert.equal(Jobs.started.length, 0);
      assert.equal(Value.started, false);
      assert.equal(Value.count, 1);
      assert.ok(Run.State.Monitors.get("agent-a")?.get("/repo/src/App.ts")?.pending.has("tsc"));
    });
    Check(Count, "T6: the pending rendered text is byte-exact", () => {
      assert.equal(
        Rendered(Run, "live_monitor_check", Value),
        "[monitor] deep check pending /repo/src/App.ts (1 checks) - admission full; the band updates when it runs."
      );
    });
  }
  rm();
  {
    const { Jobs, Run } = Setup();
    FireObserved(Run, "/repo/src/App.ts", "1");
    const Value = await CallTool(Run, "live_monitor_check", { path: "/repo/src/App.ts" });
    Check(Count, "T7: the deep check dispatches despite the unelapsed window", () => {
      assert.equal(Value.started, true);
      assert.equal(Jobs.started.length, 1);
    });
    Advance(6e5);
    await WaveAssemble(Run);
  }
  return Finish(Count, "Monitors-Tools");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Monitors-Tools`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

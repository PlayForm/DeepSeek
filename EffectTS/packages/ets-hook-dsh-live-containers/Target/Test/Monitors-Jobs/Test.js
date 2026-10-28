import assert from "node:assert/strict";
import * as JobsModule from "../../../Target/Function/Jobs.js";
import {
  Advance,
  Check,
  ClockBox,
  Finish,
  FireJobs,
  FireObserved,
  FlipLive,
  LinesWith,
  MakeCounter,
  MakeWave,
  FakeJobsHub,
  FakeShell,
  Validate,
  Ledger,
  rm,
  MonitorConfig,
  WaveAssemble
} from "../Harness.js";
const Setup = (Config = {}, BreakStart = false) => {
  const Jobs = FakeJobsHub();
  if (BreakStart) {
    Jobs.registry = {
      ...Jobs.registry,
      start: (Specification) => {
        void Specification;
        throw new Error("preflight refused");
      }
    };
  }
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
const Entry = (Run, Path = "/repo/src/App.ts") => Run.State.Monitors.get("agent-a")?.get(Path);
const Dispatch = async (Run, Path = "/repo/src/App.ts", Version = "1") => {
  FireObserved(Run, Path, Version);
  Advance(2e3);
  await WaveAssemble(Run);
};
const runTest = async () => {
  const Count = MakeCounter();
  rm();
  ClockBox.Now = 17e11;
  {
    const { Jobs, Shell, Run } = Setup();
    await Dispatch(Run);
    Check(Count, "J1: the monitor job carries the design's spec", () => {
      assert.equal(Jobs.started.length, 1);
      const Specification = Jobs.started[0].spec;
      assert.equal(Specification.kind, "monitor");
      assert.equal(Specification.label, "monitor tsc /repo/src/App.ts");
      assert.equal(Specification.owner, "agent-a");
      assert.equal(Specification.outputLimitBytes, 2048);
      assert.ok(Specification.toolCall.callId.startsWith("monitor-"));
    });
    Check(Count, "J1: the resolved shell spec preserves the governed path", () => {
      const Resolved = Shell.resolved[0];
      assert.equal(Resolved.command, "tsc --noEmit /repo/src/App.ts");
      assert.equal(Resolved.workdir, "/repo/src");
      assert.equal(Resolved.timeoutMs, 12e4);
      assert.equal(Resolved.onExpiry, "none");
      assert.equal(Resolved.sandboxPolicy.mode, "workspace-write");
    });
    Check(Count, "J1: the dispatched line is byte-exact", () => {
      assert.deepEqual(LinesWith(Run, "monitor check dispatched"), [
        `hook-dsh-live-containers: monitor check dispatched /repo/src/App.ts tsc -> ${Jobs.started[0].id}`
      ]);
    });
  }
  rm();
  {
    const { Jobs, Run } = Setup();
    await Dispatch(Run);
    const JobID = Jobs.started[0].id;
    FireJobs(Run, Jobs.settled(JobID, { owner: "agent-a", detail: "exit code: 0" }));
    Check(Count, "J2: an observed exit 0 folds a live clean result", () => {
      const Result = Entry(Run).checks[0];
      assert.ok(Result !== void 0);
      assert.equal(Result.exit, 0);
      assert.equal(Result.provenance, "live");
      assert.equal(Result.checkedVersion, "1");
    });
    Check(Count, "J2: the settled line is byte-exact", () => {
      assert.deepEqual(LinesWith(Run, "monitor check settled"), [
        `hook-dsh-live-containers: monitor check settled /repo/src/App.ts tsc (${JobID}, exit 0)`
      ]);
    });
  }
  rm();
  {
    const { Jobs, Run } = Setup();
    await Dispatch(Run);
    const JobID = Jobs.started[0].id;
    FireJobs(Run, Jobs.settled(JobID, { owner: "agent-a", detail: "exit code: 0" }));
    FireObserved(Run, "/repo/src/App.ts", "2");
    await WaveAssemble(Run);
    Check(Count, "J3: a settle-less version bump starts no re-run", () => {
      assert.equal(Jobs.started.length, 1, "no second job was started");
      assert.deepEqual(LinesWith(Run, "monitor check dispatched").length, 1);
    });
  }
  rm();
  {
    const { Jobs, Run } = Setup();
    await Dispatch(Run);
    const JobID = Jobs.started[0].id;
    FireObserved(Run, "/repo/src/App.ts", "2");
    FireJobs(Run, Jobs.settled(JobID, { owner: "agent-a", detail: "exit code: 0" }));
    const Text = await WaveAssemble(Run).then(
      (A) => A.sections.find((S) => S.name === "live-containers")?.text ?? ""
    );
    Check(Count, "J3: a settle for an older version renders the STALE form, never clean", () => {
      assert.ok(Text.includes("~ STALE (file changed after check)"), `missing in: ${Text.slice(0, 400)}`);
      assert.ok(!Text.includes("monitors: 1 (\u22041"));
    });
  }
  rm();
  {
    const { Jobs, Run } = Setup();
    await Dispatch(Run);
    const JobID = Jobs.started[0].id;
    Run.State.MonitorJobs.get(JobID)?.tail.Append("stdout", "error TS2345: first\n");
    FireJobs(Run, Jobs.settled(JobID, { owner: "agent-a", detail: "exit code: 3" }));
    const Text = await WaveAssemble(Run).then(
      (A) => A.sections.find((S) => S.name === "live-containers")?.text ?? ""
    );
    Check(Count, "J4: a non-zero exit renders the problem with the captured head", () => {
      assert.ok(Text.includes("problem (!) | checked"), `missing in: ${Text.slice(0, 400)}`);
      assert.ok(Text.includes("tail (up to 2 KiB):\nerror TS2345: first"), `missing in: ${Text}`);
    });
    Check(Count, "J4: the settled line carries the non-zero exit", () => {
      assert.deepEqual(LinesWith(Run, "monitor check settled"), [
        `hook-dsh-live-containers: monitor check settled /repo/src/App.ts tsc (${JobID}, exit 3)`
      ]);
    });
  }
  rm();
  {
    const Head = new JobsModule.JobTail(true);
    Head.Append("stdout", "a".repeat(3e3));
    Head.Append("stderr", "b".repeat(100));
    const Default = new JobsModule.JobTail();
    Default.Append("stdout", "c".repeat(3e3));
    Default.Append("stderr", "d".repeat(100));
    Check(Count, "J5: the head-keep render keeps the earliest bytes; the default keeps the newest", () => {
      const HeadText = Head.Render();
      assert.ok(HeadText.length <= 2048);
      assert.ok(HeadText.startsWith("a"), "the head-keep render lost the earliest stdout bytes");
      assert.ok(!HeadText.includes("[stderr]"), "the head-keep render kept the tail over the head");
      const DefaultText = Default.Render();
      assert.ok(DefaultText.length <= 2048);
      assert.ok(DefaultText.includes("[stderr]"), "the default render must keep the newest stderr");
    });
  }
  rm();
  {
    const { Jobs, Run } = Setup();
    await Dispatch(Run);
    const JobID = Jobs.started[0].id;
    FireJobs(Run, Jobs.settled(JobID, { owner: "agent-a", status: "killed", detail: "signal: SIGTERM" }));
    Check(Count, "J6: a killed producer outcome maps to the infrastructure form", () => {
      assert.deepEqual(LinesWith(Run, "monitor check settled"), [
        `hook-dsh-live-containers: monitor check settled /repo/src/App.ts tsc (${JobID}, exit null)`
      ]);
      assert.equal(Entry(Run).checks[0]?.infra, "producer:signal: SIGTERM");
    });
  }
  rm();
  {
    const { Jobs, Run } = Setup();
    await Dispatch(Run);
    const JobID = Jobs.started[0].id;
    FireJobs(
      Run,
      Jobs.settled(JobID, {
        owner: "agent-a",
        status: "killed",
        detail: "[sandbox: file access denied under workspace-write mode]"
      })
    );
    const Text = await WaveAssemble(Run).then(
      (A) => A.sections.find((S) => S.name === "live-containers")?.text ?? ""
    );
    Check(Count, "J7: a sandbox-denied check renders the denial, never a code problem", () => {
      assert.equal(Entry(Run).checks[0]?.infra, "sandbox");
      assert.ok(Text.includes("check denied (sandbox) (x) | checked"), `missing in: ${Text.slice(0, 400)}`);
      assert.ok(!Text.includes("problem (!)"));
    });
  }
  rm();
  {
    const { Jobs, Run } = Setup({
      monitor: { ...MonitorConfig().monitor, checkTimeoutMs: 5e3 }
    });
    await Dispatch(Run);
    Advance(6e3);
    await WaveAssemble(Run);
    Check(Count, "J8: past checkTimeoutMs the registry receives the monitor-deadline kill", () => {
      assert.deepEqual(Jobs.killed, [
        { id: Jobs.started[0].id, caller: "agent-a", reason: "monitor-deadline" }
      ]);
    });
    FireJobs(Run, Jobs.settled(Jobs.started[0].id, { owner: "agent-a", cause: "kill", detail: "monitor-deadline" }));
    Check(Count, "J8: the deadline kill settles to the killed:monitor-deadline infra", () => {
      assert.equal(Entry(Run).checks[0]?.infra, "killed:monitor-deadline");
    });
  }
  rm();
  {
    const { Run } = Setup({}, true);
    FireObserved(Run, "/repo/src/App.ts", "1");
    Advance(2e3);
    await WaveAssemble(Run);
    Check(Count, "J9: a start failure logs the byte-exact line and keeps the band honest", () => {
      assert.deepEqual(LinesWith(Run, "monitor check failed"), [
        "hook-dsh-live-containers: monitor check failed /repo/src/App.ts tsc (start)"
      ]);
      assert.ok((Entry(Run)?.checks.length ?? 0) === 0);
    });
  }
  rm();
  {
    const { Jobs, Run } = Setup();
    await Dispatch(Run);
    const JobID = Jobs.started[0].id;
    FireJobs(Run, Jobs.settled(JobID, { owner: "agent-a", detail: "exit code: 0" }));
    FireObserved(Run, "/repo/src/App.ts", "2");
    Run.State.Wave = {
      ...Run.State.Wave,
      Jobs: {
        ...Run.State.Wave?.Jobs,
        start: () => {
          throw new Error("preflight refused");
        }
      }
    };
    Advance(2e3);
    const Text = await WaveAssemble(Run).then(
      (A) => A.sections.find((S) => S.name === "live-containers")?.text ?? ""
    );
    Check(Count, "J9: a later start failure keeps the last-known result and renders STALE", () => {
      assert.deepEqual(LinesWith(Run, "monitor check failed"), [
        "hook-dsh-live-containers: monitor check failed /repo/src/App.ts tsc (start)"
      ]);
      assert.ok(
        Text.includes("~ STALE (file changed after check) | clean (\u2204)"),
        `missing in: ${Text.slice(0, 400)}`
      );
    });
  }
  rm();
  {
    const { Jobs, Run } = Setup();
    await Dispatch(Run);
    const JobID = Jobs.started[0].id;
    FireJobs(Run, Jobs.settled(JobID, { owner: "agent-a", cause: "teardown" }));
    Check(Count, "J10: a teardown settle records nothing and logs the loss", () => {
      assert.deepEqual(LinesWith(Run, "monitor check lost"), [
        "hook-dsh-live-containers: monitor check lost /repo/src/App.ts tsc (teardown)"
      ]);
      assert.ok((Entry(Run)?.checks.length ?? 0) === 0);
    });
  }
  rm();
  {
    const { Jobs, Run } = Setup();
    FireObserved(Run, "/repo/src/App.ts", "1");
    FlipLive(Run, "checksets", {});
    Advance(2e3);
    await WaveAssemble(Run);
    Check(Count, "J11: a flipped-away check set logs the unknown line and starts no job", () => {
      assert.deepEqual(LinesWith(Run, "monitor check unknown"), [
        "hook-dsh-live-containers: monitor check unknown tsc"
      ]);
      assert.equal(Jobs.started.length, 0);
    });
  }
  rm();
  {
    const { Jobs, Run } = Setup({
      watchlist: [{ glob: "**/Cargo.toml", checks: ["cargo"] }],
      monitor: { ...MonitorConfig().monitor, slowCheckIntervalMs: 1e3 }
    });
    FireObserved(Run, "/repo/Cargo.toml", "1");
    await WaveAssemble(Run);
    Check(Count, "J12: the slow schedule dispatches once per interval at the assemble checkpoint", () => {
      assert.equal(Jobs.started.length, 1);
      assert.equal(Jobs.started[0].spec.label, "monitor cargo /repo/Cargo.toml");
    });
    await WaveAssemble(Run);
    Check(Count, "J12: within the interval no second job starts", () => {
      assert.equal(Jobs.started.length, 1);
    });
    Advance(1001);
    await WaveAssemble(Run);
    Check(Count, "J12: past the interval the next assemble dispatches again", () => {
      assert.equal(Jobs.started.length, 2);
    });
  }
  rm();
  {
    let Message = "";
    try {
      Setup({ monitor: { ...MonitorConfig().monitor, checkTimeoutMs: 2e5 } });
    } catch (Error2) {
      Message = String(Error2.message);
    }
    Check(Count, "J13: checkTimeoutMs above the inline deadline fails loud at load", () => {
      assert.ok(
        Message.includes("monitor.checkTimeoutMs must be >= 1000 and <= 120000"),
        `wrong error: ${Message}`
      );
    });
  }
  rm();
  {
    let Message = "";
    try {
      Setup({ watchlist: [{ glob: "**/*.ts", checks: ["ghost"] }] });
    } catch (Error2) {
      Message = String(Error2.message);
    }
    Check(Count, "J13: a watchlist reference to an unknown check set fails loud at load", () => {
      assert.ok(
        Message.includes("watchlist references an unknown check set: ghost"),
        `wrong error: ${Message}`
      );
    });
  }
  rm();
  {
    const { Jobs, Shell, Run } = Setup({
      checksets: {
        tsc: { glob: "**/*.ts", command: "tsc --noEmit {{path}}", fast: true, timeoutMs: 5e3 }
      }
    });
    await Dispatch(Run);
    Check(Count, "J14: the set's own timeoutMs caps the dispatch deadline", () => {
      assert.equal(Jobs.started.length, 1);
      assert.equal(Shell.resolved[0].timeoutMs, 5e3);
    });
  }
  rm();
  {
    const { Jobs, Run } = Setup();
    FireObserved(Run, "/repo/src/App.ts", "1");
    const Tool = Run.tools["live_monitor_check"];
    const Result = await Tool.execute({ path: "/repo/src/App.ts" }, { agent: { id: "agent-a" } });
    Check(Count, "J15: the deep check dispatches immediately without crossing the window", () => {
      assert.equal(Jobs.started.length, 1);
      assert.equal(Result.started, true);
    });
  }
  return Finish(Count, "Monitors-Jobs");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Monitors-Jobs`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

import assert from "node:assert/strict";
import {
  Advance,
  Check,
  ClockBox,
  Execute,
  Exec,
  Finish,
  FireJobs,
  FireSession,
  LinesWith,
  MakeCounter,
  MakeWave,
  Pre,
  PendingText,
  FakeJobsHub,
  FakeShell,
  WaveAssemble,
  Validate,
  Ledger,
  rm
} from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  const MARKER = (JobID) => `[live] ${JobID} running: cargo build - output pending; proceed reasoning.`;
  const DetachConfig = {
    mode: "long-running",
    allRequiresConfirm: false,
    longRunningMarkers: ["cargo build"],
    minHistoricalMs: 2e4,
    historyWindow: 5,
    selectedTools: [],
    selectedPatterns: [],
    maxLivePerAgent: 5,
    minLatencyMs: 2e3,
    liveTimeoutMs: 12e4,
    dedup: true,
    retryFailsafeCount: 3
  };
  rm();
  ClockBox.Now = 17e11;
  {
    const Jobs = FakeJobsHub();
    const Shell = FakeShell();
    const Run = MakeWave(Validate({ logFile: Ledger, enabled: true, detach: DetachConfig }), { jobs: Jobs, shell: Shell });
    const { decision } = await Pre(Run, Exec("cargo build"));
    Check(Count, "J1: the pre-execute arm returns the downstream decision (allow)", () => {
      assert.deepEqual(decision, { kind: "allow" });
    });
    Check(Count, "J1: the fake registry gained one start with the exact re-dispatch spec", () => {
      assert.equal(Jobs.started.length, 1);
      const Specification = Shell.resolved[0];
      assert.equal(Specification.command, "cargo build");
      assert.equal(Specification.workdir, "/session");
      assert.deepEqual(Specification.dshEnv, { DSH_SESSION: "agent-a" });
      assert.deepEqual(Specification.sandboxPolicy, { mode: "workspace-write", session: void 0 });
      assert.equal(Specification.onExpiry, "none");
      assert.equal(Jobs.started[0].spec.kind, "bash");
      assert.equal(Jobs.started[0].spec.label, "cargo build");
      assert.equal(Jobs.started[0].spec.owner, "agent-a");
      assert.equal(Jobs.started[0].spec.outputLimitBytes, 2048);
    });
    Check(Count, "J1: ledger detached bash -> <job-id> (byte-exact)", () => {
      assert.deepEqual(LinesWith(Run, "detached "), [
        `hook-dsh-live-containers: detached bash -> ${Jobs.started[0].id}`
      ]);
    });
    const TaggedExec = Exec("cargo build --release");
    await Pre(Run, TaggedExec);
    let BodyRan = false;
    const Result = await Execute(Run, TaggedExec, async () => {
      BodyRan = true;
      return { isError: false, value: { real: true }, content: [] };
    });
    Check(Count, "J1: the fabricated result is a successful value whose text is the byte-exact marker", () => {
      assert.equal(Result.isError, false);
      const Value = Result.value;
      assert.equal(Value.kind, "foreground");
      assert.equal(Value.exitCode, 0);
      assert.equal(Value.signal, null);
      assert.equal(Value.timedOut, false);
      assert.equal(Value.aborted, false);
      assert.equal(Value.stdout.truncated, false);
      assert.deepEqual(Value.stderr, { text: "", truncated: false });
      assert.equal(
        Value.stdout.text,
        `[live] ${Jobs.started[1]?.id} running: cargo build --release - output pending; proceed reasoning.`
      );
    });
    Check(Count, "J1: next() was NOT called by the execute arm (the veto)", () => {
      assert.equal(BodyRan, false);
    });
  }
  rm();
  {
    const Jobs = FakeJobsHub();
    const Run = MakeWave(
      Validate({
        logFile: Ledger,
        enabled: true,
        detach: { ...DetachConfig, mode: "all", allRequiresConfirm: true }
      }),
      { jobs: Jobs, shell: FakeShell() }
    );
    const WriteExec = { ...Exec("anything"), name: "write", arguments: { path: "x", content: "y" } };
    const { decision, nextCalled } = await Pre(Run, WriteExec);
    const Result = await Execute(Run, WriteExec, async () => ({ isError: false, value: { inline: true }, content: [] }));
    Check(Count, "J2: write under mode all passes through pre-execute (no start)", () => {
      assert.deepEqual(decision, { kind: "allow" });
      assert.equal(nextCalled, true);
      assert.equal(Jobs.started.length, 0);
    });
    Check(Count, "J2: write runs inline (the execute arm calls next)", () => {
      assert.deepEqual(Result, { isError: false, value: { inline: true }, content: [] });
    });
  }
  rm();
  {
    const Jobs = FakeJobsHub();
    const Shell = FakeShell();
    const Run = MakeWave(Validate({ logFile: Ledger, enabled: true, detach: DetachConfig }), { jobs: Jobs, shell: Shell });
    const { decision } = await Pre(Run, Exec("cargo build --features slow"));
    Check(Count, "J3: the transform passes through with the policy resolved", () => {
      assert.deepEqual(decision, { kind: "allow" });
      assert.equal(Shell.resolved.length, 1);
      assert.ok(Shell.resolved[0].sandboxPolicy.mode === "workspace-write");
    });
    Check(Count, "J3: escalation -> inline (ledger byte-exact)", () => {
      assert.deepEqual(LinesWith(Run, "escalation -> inline"), []);
    });
  }
  rm();
  {
    const Jobs = FakeJobsHub();
    const Run = MakeWave(Validate({ logFile: Ledger, enabled: true, detach: DetachConfig }), {
      jobs: { ...Jobs, registry: { ...Jobs.registry, start: (Specification) => {
        void Specification;
        throw new Error("preflight refused");
      } } },
      shell: FakeShell()
    });
    Run.State.Wave.Jobs = Run.Context.jobs;
    const { decision } = await Pre(Run, Exec("cargo build"));
    Check(Count, "J4: a start failure is inline + start failed -> inline (byte-exact)", () => {
      assert.deepEqual(decision, { kind: "allow" });
      assert.deepEqual(LinesWith(Run, "start failed"), ["hook-dsh-live-containers: start failed bash -> inline"]);
    });
  }
  rm();
  {
    const Jobs = FakeJobsHub();
    const Run = MakeWave(Validate({ logFile: Ledger, enabled: true, detach: DetachConfig }), { jobs: Jobs, shell: FakeShell() });
    class ThrowMap extends Map {
      set() {
        throw new Error("no records allowed");
      }
    }
    Run.State.Detached = new ThrowMap();
    const { decision } = await Pre(Run, Exec("cargo build"));
    Check(Count, "J4: a thrown post-start write yields marker-failed + transform failed (byte-exact)", () => {
      assert.deepEqual(decision, { kind: "allow" });
      assert.ok(Jobs.started.length === 1);
      assert.deepEqual(LinesWith(Run, "marker failed"), [
        `hook-dsh-live-containers: marker failed ${Jobs.started[0].id} -> inline`
      ]);
      assert.deepEqual(LinesWith(Run, "transform failed"), [
        "hook-dsh-live-containers: transform failed bash -> inline"
      ]);
      assert.deepEqual(Jobs.killed, [{ id: Jobs.started[0].id, caller: "agent-a", reason: "marker-failed" }]);
    });
  }
  rm();
  {
    const Jobs = FakeJobsHub();
    const Run = MakeWave(Validate({ logFile: Ledger, enabled: true, detach: DetachConfig }), { jobs: Jobs, shell: FakeShell() });
    await Pre(Run, Exec("cargo build"));
    const JobID = Jobs.started[0].id;
    await WaveAssemble(Run);
    Check(Count, "J5: no completion frame before any settled event", () => {
      assert.equal(PendingText(Run), "");
    });
    FireJobs(Run, Jobs.settled(JobID, { owner: "agent-a", detail: "exit code: 0" }));
    await WaveAssemble(Run);
    const Text = PendingText(Run);
    Check(Count, "J5: one settled event -> exactly one completed frame (byte-exact shape)", () => {
      assert.ok(Text.includes("[live] completion report (harness-appended; not a user request):"));
      assert.ok(Text.includes(`--- LIVE CONTAINER ${JobID} completed ---`));
      assert.ok(Text.includes("status: completed (cause: producer)"));
      assert.ok(Text.includes("elapsed: 0s"));
      assert.ok(Text.includes("output (tail up to 2 KiB):"));
      assert.ok(Text.includes(`--- END LIVE CONTAINER ${JobID} ---`));
      assert.ok(Text.includes(`[live] job_output ${JobID} to read the full output.`));
      assert.ok(Text.endsWith("[live] next: all 1 finished - review the outputs above, then continue the cargo steps."));
    });
    FireSession(Run, {
      type: "user/message",
      data: {
        message: {
          source: { kind: "runtime-context", form: "snapshot" },
          content: [{ type: "text", text: Text }]
        }
      }
    });
    Check(Count, "J5: the logged snapshot drains the batch (ledger byte-exact)", () => {
      const Rendered = LinesWith(Run, "completion rendered ");
      assert.ok(Rendered.length === 1);
      assert.ok(Rendered[0]?.endsWith(" bytes"));
      assert.deepEqual(LinesWith(Run, `withdrawn ${JobID}`), [
        `hook-dsh-live-containers: withdrawn ${JobID} (completed)`
      ]);
    });
    const After = PendingText(Run);
    Check(Count, "J5: after delivery the provider returns the stable delivered tail (never the CLEARED shape)", () => {
      assert.equal(After, Text);
    });
  }
  rm();
  {
    const Jobs = FakeJobsHub();
    const Run = MakeWave(Validate({ logFile: Ledger, enabled: true, detach: DetachConfig }), { jobs: Jobs, shell: FakeShell() });
    await Pre(Run, Exec("cargo build"));
    const First = Jobs.started[0].id;
    const Second = Exec("cargo build");
    await Pre(Run, Second);
    Check(Count, "J6: a re-issued identical command starts NO second job", () => {
      assert.equal(Jobs.started.length, 1);
      assert.deepEqual(LinesWith(Run, "dedup "), [`hook-dsh-live-containers: dedup bash -> ${First}`]);
    });
    const Result = await Execute(Run, Second, async () => ({ isError: false, value: { real: true }, content: [] }));
    Check(Count, "J6: the dedup marker references the same job id with the already-running line", () => {
      const Text = Result.value.stdout.text;
      assert.equal(Text, `${MARKER(First)}
[live] already running as ${First}; job_output ${First} to check.`);
    });
  }
  rm();
  {
    const Jobs = FakeJobsHub();
    const Run = MakeWave(
      Validate({ logFile: Ledger, enabled: true, detach: { ...DetachConfig, liveTimeoutMs: 5e3 } }),
      { jobs: Jobs, shell: FakeShell() }
    );
    await Pre(Run, Exec("cargo build"));
    Advance(6e3);
    await WaveAssemble(Run);
    Check(Count, "J7: the fake clock past liveTimeoutMs -> kill with reason live-timeout", () => {
      assert.deepEqual(Jobs.killed, [{ id: Jobs.started[0].id, caller: "agent-a", reason: "live-timeout" }]);
    });
  }
  rm();
  {
    const Jobs = FakeJobsHub();
    const Run = MakeWave(Validate({ logFile: Ledger, enabled: true, detach: DetachConfig }), { jobs: Jobs, shell: FakeShell() });
    await Pre(Run, Exec("cargo build"));
    const JobID = Jobs.started[0].id;
    FireJobs(Run, Jobs.settled(JobID, { owner: "agent-a", awaited: true }));
    await WaveAssemble(Run);
    Check(Count, "J8: an awaited settlement renders no frame (ledger byte-exact)", () => {
      assert.equal(PendingText(Run), "");
      assert.deepEqual(LinesWith(Run, "completion skipped"), [
        `hook-dsh-live-containers: completion skipped ${JobID} (awaited)`
      ]);
    });
  }
  rm();
  {
    const Jobs = FakeJobsHub();
    const Run = MakeWave(
      Validate({ logFile: Ledger, enabled: true, detach: { ...DetachConfig, maxLivePerAgent: 1 } }),
      { jobs: Jobs, shell: FakeShell() }
    );
    await Pre(Run, Exec("cargo build"));
    await Pre(Run, Exec("cargo build --release"));
    Check(Count, "J9: at capacity the call passes through inline (ledger byte-exact)", () => {
      assert.equal(Jobs.started.length, 1);
      assert.deepEqual(LinesWith(Run, "capacity full"), [
        "hook-dsh-live-containers: capacity full agent-a -> inline"
      ]);
    });
  }
  rm();
  {
    const Jobs = FakeJobsHub();
    const Run = MakeWave(Validate({ logFile: Ledger, enabled: true, detach: DetachConfig }), { jobs: Jobs, shell: FakeShell() });
    const Quick = Exec("pnpm build");
    await Pre(Run, Quick);
    await Run.Listeners["tools/post-execute"](Quick, { isError: false, value: "", content: [] }, async () => ({ kind: "accept" }));
    await Pre(Run, Exec("pnpm build"));
    Check(Count, "J10: a short history keeps the command inline (min-latency)", () => {
      assert.equal(Jobs.started.length, 0);
    });
    for (let Index = 0; Index < 2; Index += 1) {
      const Slow = Exec("pnpm build");
      await Pre(Run, Slow);
      Advance(4e4);
      await Run.Listeners["tools/post-execute"](Slow, { isError: false, value: "", content: [] }, async () => ({ kind: "accept" }));
    }
    const Third = Exec("pnpm build");
    await Pre(Run, Third);
    Check(Count, "J10: a long history detaches the command without any marker", () => {
      assert.ok(Jobs.started.length >= 1);
    });
  }
  rm();
  {
    const Jobs = FakeJobsHub();
    const Run = MakeWave(Validate({ logFile: Ledger, enabled: true, detach: DetachConfig }), { jobs: Jobs, shell: FakeShell() });
    const Marked = { ...Exec("cargo build"), arguments: new Proxy({ __await: true, description: "d", command: "cargo build" }, {}) };
    const { decision } = await Pre(Run, Marked);
    Check(Count, "J11: the first-key __await marker runs the call inline (ledger byte-exact)", () => {
      assert.deepEqual(decision, { kind: "allow" });
      assert.equal(Jobs.started.length, 0);
      assert.deepEqual(LinesWith(Run, "await marker -> inline"), [
        "hook-dsh-live-containers: await marker -> inline bash"
      ]);
    });
    Check(Count, "J11: the marker key survives in the arguments (nothing stripped)", () => {
      assert.equal(Marked.arguments["__await"], true);
      assert.equal(Marked.arguments.command, "cargo build");
    });
    const FalseMarker = { ...Exec("cargo build"), arguments: { __await: false, description: "d", command: "cargo build" } };
    await Pre(Run, FalseMarker);
    Check(Count, "J11: a first-key __await:false is NOT a marker (the call detaches)", () => {
      assert.equal(Jobs.started.length, 1);
      assert.equal(LinesWith(Run, "await marker -> inline").length, 1);
    });
  }
  rm();
  {
    const Jobs = FakeJobsHub();
    const Run = MakeWave(Validate({ logFile: Ledger, enabled: true, detach: DetachConfig }), { jobs: Jobs, shell: FakeShell() });
    await Pre(Run, Exec("cargo build"));
    const JobID = Jobs.started[0].id;
    FireJobs(Run, Jobs.settled(JobID, { owner: "agent-a", cause: "teardown" }));
    await WaveAssemble(Run);
    Check(Count, "teardown: owner gone -> nothing pending (ledger byte-exact)", () => {
      assert.equal(PendingText(Run), "");
      assert.deepEqual(LinesWith(Run, "owner gone"), [
        `hook-dsh-live-containers: owner gone ${JobID}`
      ]);
    });
  }
  rm();
  {
    const Jobs = FakeJobsHub();
    const Run = MakeWave(Validate({ logFile: Ledger, enabled: true, detach: DetachConfig }), { jobs: Jobs, shell: FakeShell() });
    await Pre(Run, Exec("cargo build", { sandbox_permissions: "danger-full-access", justification: "need network" }));
    Check(Count, "escalation: the approval flow stays inline (ledger byte-exact)", () => {
      assert.equal(Jobs.started.length, 0);
      assert.deepEqual(LinesWith(Run, "escalation -> inline"), [
        "hook-dsh-live-containers: escalation -> inline bash"
      ]);
    });
  }
  return Finish(Count, "Jobs-And-Detach");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Jobs-And-Detach`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

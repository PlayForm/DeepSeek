import assert from "node:assert/strict";
import {
  Check,
  Finish,
  Ledger,
  LinesWith,
  Make,
  MakeCounter,
  rm,
  Validate
} from "../Harness.js";
const Setup = (Config = {}) => {
  rm();
  return Make(Validate({ logFile: Ledger, enabled: true, stateFile: "/nonexistent/batch-state.json", ...Config }));
};
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup();
    const Service = Run.Context.batchstate;
    Service.setTask("a", "Building the parser");
    const Started = Run.State.Members.get("a")?.startedAt ?? 0;
    Service.setTask("a", "Reviewing the parser");
    Check(Count, "S1: the task lines are byte-exact and the events fire", () => {
      assert.deepEqual(LinesWith(Run, "task a:"), [
        "batchstate: task a: Building the parser",
        "batchstate: task a: Reviewing the parser"
      ]);
      assert.deepEqual(Run.Events, [
        { batch: "default", id: "a", kind: "task" },
        { batch: "default", id: "a", kind: "task" }
      ]);
    });
    Check(Count, "S1: startedAt stamps once and the member is active", () => {
      assert.equal(Run.State.Members.get("a")?.startedAt, Started);
      assert.equal(Run.State.Members.get("a")?.status, "active");
      assert.equal(Run.State.Members.get("a")?.task, "Reviewing the parser");
    });
  }
  {
    const Run = Setup();
    const Service = Run.Context.batchstate;
    Service.setTask("a", "T1");
    Service.queue("a");
    Service.setStatus("a", "completed");
    Check(Count, "S2: the status line is byte-exact and finishedAt stamps", () => {
      assert.deepEqual(LinesWith(Run, "status a:"), ["batchstate: status a: completed"]);
      assert.equal(Run.State.Members.get("a")?.status, "completed");
      assert.ok((Run.State.Members.get("a")?.finishedAt ?? 0) > 0);
    });
    Check(Count, "S2: a terminal status drops the member from the queue", () => {
      assert.deepEqual(Run.State.IdleQueue, []);
      assert.deepEqual(Run.State.Recent, [
        { id: "a", status: "completed", task: "T1", at: Run.State.Members.get("a")?.finishedAt }
      ]);
    });
  }
  {
    const Run = Setup();
    const Service = Run.Context.batchstate;
    const Held = ["/p1", "/p2"];
    Service.setScope("a", Held);
    Held.push("/mutated");
    Check(Count, "S3: the scope line is byte-exact and the list is copied", () => {
      assert.deepEqual(LinesWith(Run, "scope a:"), ["batchstate: scope a: 2 surfaces"]);
      assert.deepEqual(Run.State.Members.get("a")?.scope, ["/p1", "/p2"]);
    });
  }
  {
    const Run = Setup();
    const Service = Run.Context.batchstate;
    Service.queue("b");
    Service.queue("c");
    const Before = Run.Lines.length;
    Service.queue("b");
    Check(Count, "S4: the queue lines are byte-exact with positions", () => {
      assert.ok(Run.Lines.includes("batchstate: queued b (position 0)"));
      assert.ok(Run.Lines.includes("batchstate: queued c (position 1)"));
      assert.equal(Run.State.Members.get("b")?.queue, 0);
      assert.equal(Run.State.Members.get("c")?.queue, 1);
    });
    Check(Count, "S4: a repeated queue call is idempotent", () => {
      assert.equal(Run.Lines.length, Before);
      assert.deepEqual(Run.State.IdleQueue, ["b", "c"]);
    });
  }
  {
    const Run = Setup({ maxRecent: 2 });
    const Service = Run.Context.batchstate;
    Service.setTask("x", "X");
    Service.setTask("y", "Y");
    Service.setTask("z", "Z");
    Service.setStatus("x", "completed");
    Service.setStatus("y", "completed");
    Service.setStatus("z", "completed");
    Check(Count, "S5: the ring is capped at maxRecent, newest first", () => {
      assert.deepEqual(
        Run.State.Recent.map((Entry) => Entry.id),
        ["z", "y"]
      );
    });
  }
  {
    const Run = Setup();
    const Service = Run.Context.batchstate;
    Service.setTask("a", "Building the parser");
    Service.setScope("a", ["/p1", "/p2"]);
    Service.setTask("b", "Writing tests");
    Service.setScope("b", ["/p2", "/p9"]);
    Service.queue("c");
    Check(Count, "S6: the context block is byte-exact", () => {
      assert.equal(
        Service.getContext("a"),
        [
          "[BATCH STATE - default - live]",
          "RUNNING: 2 lanes",
          "  a Building the parser - OWNER: /p1, /p2",
          "  b Writing tests - OWNER: /p2, /p9",
          "IDLE: 1 (c)",
          "YOUR SCOPE: /p1, /p2 - OFF-LIMITS: /p9",
          "PENDING: c"
        ].join("\n")
      );
    });
    Check(Count, "S6: the scope view separates yours, shared, and off-limits", () => {
      assert.deepEqual(Service.getScope("a"), {
        yours: ["/p1", "/p2"],
        shared: { b: ["/p2"] },
        offLimits: ["/p9"]
      });
    });
    Check(Count, "S6: the concurrent-lanes block excludes the caller", () => {
      assert.equal(Service.whoElse("a"), "[CONCURRENT LANES - live]\n  b Writing tests");
      assert.equal(Service.whoElse("c"), "[CONCURRENT LANES - live]\n  a Building the parser\n  b Writing tests");
    });
    Check(Count, "S6: an unknown agent gets the honest unknown scope", () => {
      assert.ok(Service.getContext("zz").includes('YOUR SCOPE: unknown agent "zz"'));
    });
    Check(Count, "S6: the snapshot carries the batch, the running, the idle, the recent", () => {
      const Snapshot = Service.getState();
      assert.equal(Snapshot.batch, "default");
      assert.equal(typeof Snapshot.generatedAt, "number");
      assert.deepEqual(
        Snapshot.running.map((Member) => Member.id),
        ["a", "b"]
      );
      assert.deepEqual(
        Snapshot.idle.map((Member) => Member.id),
        ["c"]
      );
      assert.deepEqual(Snapshot.recent, []);
    });
  }
  {
    const Run = Setup();
    const Service = Run.Context.batchstate;
    Service.setTask("a", "T");
    Service.clear();
    Check(Count, "S7: the reset empties everything and fires the clear event", () => {
      assert.ok(Run.Lines.includes("batchstate: cleared"));
      assert.equal(Run.State.Members.size, 0);
      assert.deepEqual(Run.State.IdleQueue, []);
      assert.deepEqual(Run.State.Recent, []);
      assert.deepEqual(Run.Events[Run.Events.length - 1], { batch: "default", id: "", kind: "clear" });
    });
  }
  return Finish(Count, "State-And-Compile");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - State-And-Compile`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

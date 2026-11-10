import assert from "node:assert/strict";
import {
  Check,
  Finish,
  Flip,
  Ledger,
  LinesWith,
  Make,
  MakeCounter,
  rm,
  Validate
} from "../Harness.js";
const Setup = (Config = {}, Attach) => {
  rm();
  return Make(Validate({ logFile: Ledger, enabled: true, ...Config }), Attach);
};
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup();
    const Service = Run.Context.dshQueue;
    Service.Enqueue({ spec: "a", priority: 0 });
    Service.Enqueue({ spec: "b", priority: 5 });
    Service.Enqueue({ spec: "c", priority: 5 });
    const First = Service.Dispatch();
    Check(Count, "D1: the first dispatch takes the highest priority, FIFO on ties", () => {
      assert.equal(First?.id, "queue-2");
      assert.equal(First?.state, "dispatched");
      assert.equal(First?.assignedAgent, "main");
      assert.ok(Run.Lines.includes("plugin-dsh-queue: dispatched queue-2 -> main"));
      assert.equal(Run.State.Seats.get("main"), 1);
    });
    const Second = Service.Dispatch();
    const Third = Service.Dispatch();
    Check(Count, "D1: the order continues FIFO; the seats accumulate", () => {
      assert.equal(Second?.id, "queue-3");
      assert.equal(Third?.id, "queue-1");
      assert.equal(Run.State.Seats.get("main"), 3);
      assert.ok(Run.Lines.includes("plugin-dsh-queue: dispatched queue-3 -> main"));
      assert.ok(Run.Lines.includes("plugin-dsh-queue: dispatched queue-1 -> main"));
    });
    Service.Enqueue({ spec: "d" });
    Service.Enqueue({ spec: "e" });
    Service.Enqueue({ spec: "f" });
    const A1 = Service.Dispatch("agent-a");
    const A2 = Service.Dispatch("agent-a");
    const A3 = Service.Dispatch("agent-a");
    Check(Count, "D2: the child cap of two blocks the third dispatch", () => {
      assert.equal(A1?.id, "queue-4");
      assert.equal(A2?.id, "queue-5");
      assert.equal(A3, void 0);
      assert.equal(Run.State.Seats.get("agent-a"), 2);
      assert.ok(Run.Lines.includes("plugin-dsh-queue: dispatched queue-4 -> agent-a"));
      assert.ok(Run.Lines.includes("plugin-dsh-queue: dispatched queue-5 -> agent-a"));
      assert.equal(LinesWith(Run, "dispatched queue-6").length, 0);
    });
    const Started = Service.Start("queue-4");
    Check(Count, "D3: Start flips dispatched to running with the byte-exact line", () => {
      assert.equal(Started?.state, "running");
      assert.ok(Run.Lines.includes("plugin-dsh-queue: running queue-4"));
    });
    const Done = Service.Complete("queue-4", "hash-1");
    Check(Count, "D3: Complete records the hash and releases the seat", () => {
      assert.equal(Done?.state, "completed");
      assert.equal(Done?.resultHash, "hash-1");
      assert.equal(Run.State.Seats.get("agent-a"), 1);
      assert.ok(Run.Lines.includes("plugin-dsh-queue: completed queue-4 (agent-a)"));
    });
    const Failed = Service.Fail("queue-5");
    Check(Count, "D3: Fail releases the seat and ledger the byte-exact line", () => {
      assert.equal(Failed?.state, "failed");
      assert.equal(Run.State.Seats.get("agent-a"), 0);
      assert.ok(Run.Lines.includes("plugin-dsh-queue: failed queue-5 (agent-a)"));
    });
    Service.Dispatch("agent-a");
    const Interrupted = Service.Interrupt("queue-6");
    Check(Count, "D3: Interrupt releases the seat and ledger the byte-exact line", () => {
      assert.equal(Interrupted?.state, "interrupted");
      assert.ok(Run.Lines.includes("plugin-dsh-queue: interrupted queue-6 (agent-a)"));
    });
    Service.Enqueue({ spec: "g" });
    const NotRunning = Service.Complete("queue-7");
    Check(Count, "D3: a queued task cannot settle - no state flip, no line", () => {
      assert.equal(NotRunning, void 0);
      assert.equal(LinesWith(Run, "completed queue-7").length, 0);
      assert.equal(Run.State.Tasks.get("queue-7")?.state, "queued");
    });
  }
  {
    const Run = Setup();
    const Service = Run.Context.dshQueue;
    Service.Enqueue({ spec: "first", priority: 0 });
    Service.Enqueue({ spec: "second", priority: 9, dependsOn: ["queue-1"] });
    const Blocked = Service.Dispatch();
    Check(Count, "D4: a high-priority task with unsatisfied dependencies waits", () => {
      assert.equal(Blocked?.id, "queue-1");
      assert.ok(Run.Lines.includes("plugin-dsh-queue: dispatched queue-1 -> main"));
    });
    Service.Complete("queue-1", "h");
    const Unblocked = Service.Dispatch();
    Check(Count, "D4: a completed dependency unblocks the waiting task", () => {
      assert.equal(Unblocked?.id, "queue-2");
      assert.ok(Run.Lines.includes("plugin-dsh-queue: dispatched queue-2 -> main"));
    });
  }
  {
    const Run = Setup();
    const Service = Run.Context.dshQueue;
    Check(Count, "D5: the empty board is byte-exact", () => {
      assert.equal(Service.Board(), "QUEUE: 0 pending - next: none - running: 0/10 (main seats 0)");
    });
    Service.Enqueue({ spec: "x", priority: 0 });
    Service.Enqueue({ spec: "y", priority: 7 });
    Service.Dispatch();
    Check(Count, "D5: the active board is byte-exact", () => {
      assert.equal(Service.Board(), "QUEUE: 1 pending - next: queue-1 - running: 1/10 (main seats 1)");
    });
  }
  {
    const Plain = Setup();
    Plain.Context.dshQueue.Enqueue({ spec: "s" });
    Plain.Context.dshQueue.Dispatch();
    Check(Count, "D6: with no dshRoute the dispatch proceeds unrouted", () => {
      assert.ok(Plain.Lines.includes("plugin-dsh-queue: dispatched queue-1 -> main"));
      assert.equal(Plain.State.Tasks.get("queue-1")?.route, void 0);
      assert.equal(LinesWith(Plain, " route ").length, 0);
    });
    const Routed = Setup({}, (Context) => {
      Context.dshRoute = {
        Resolve: () => ({ provider: "deepseek", model: "glm-5.3-flash", reasoningEffort: "high" })
      };
    });
    Routed.Context.dshQueue.Enqueue({ spec: "s", role: "coder" });
    const Task = Routed.Context.dshQueue.Dispatch();
    Check(Count, "D6: a present dshRoute resolves the route onto the task and the line", () => {
      assert.ok(Routed.Lines.includes(
        "plugin-dsh-queue: dispatched queue-1 -> main route deepseek glm-5.3-flash high"
      ));
      assert.equal(Task?.route, "deepseek glm-5.3-flash high");
    });
    const Broken = Setup({}, (Context) => {
      Context.dshRoute = {
        Resolve: () => {
          throw new Error("router down");
        }
      };
    });
    Broken.Context.dshQueue.Enqueue({ spec: "s" });
    const Fallback = Broken.Context.dshQueue.Dispatch();
    Check(Count, "D6: a routing failure is fail-open - the dispatch still happens", () => {
      assert.equal(Fallback?.state, "dispatched");
      assert.equal(Fallback?.route, void 0);
      assert.ok(Broken.Lines.includes("plugin-dsh-queue: dispatched queue-1 -> main"));
    });
    const Disabled = Setup({ routedDispatch: false }, (Context) => {
      Context.dshRoute = {
        Resolve: () => ({ provider: "deepseek", model: "m", reasoningEffort: "low" })
      };
    });
    Disabled.Context.dshQueue.Enqueue({ spec: "s" });
    Disabled.Context.dshQueue.Dispatch();
    Check(Count, "D6: routedDispatch=false skips the route even with the service present", () => {
      assert.ok(Disabled.Lines.includes("plugin-dsh-queue: dispatched queue-1 -> main"));
      assert.equal(Disabled.State.Tasks.get("queue-1")?.route, void 0);
    });
  }
  {
    const Run = Setup();
    Run.CtxListeners["loader/volatile-update"](["enabled"]);
    Check(Count, "D7: an unflipped cell keeps the state unchanged", () => {
      assert.equal(Run.State.On, true);
    });
    Flip(Run.Raw.enabled, false);
    Run.CtxListeners["loader/volatile-update"](["enabled"]);
    Check(Count, "D7: the enabled flip lands in place and the tool refuses", () => {
      assert.equal(Run.State.On, false);
      assert.deepEqual(Run.Tools[0].exec({ spec: "x" }), {
        ok: false,
        error: "queue disabled (enabled=false)"
      });
    });
    Flip(Run.Raw.capacity, { main: 5, child: 2 });
    Run.CtxListeners["loader/volatile-update"](["capacity"]);
    Check(Count, "D7: the capacity flip lands in place without a remount", () => {
      assert.deepEqual(Run.State.Capacity, { main: 5, child: 2 });
    });
  }
  {
    const Run = Setup();
    const Enqueue = Run.Tools[0].exec({ spec: "S", role: "planner", priority: 2 });
    const Status = Run.Tools[1].exec({});
    Check(Count, "D8: the tools answer with the canonical payloads", () => {
      assert.deepEqual(Enqueue, { ok: true, id: "queue-1", state: "queued" });
      assert.deepEqual(Status, {
        ok: true,
        board: "QUEUE: 1 pending - next: queue-1 - running: 0/10 (main seats 0)",
        tasks: [{ id: "queue-1", state: "queued", priority: 2, agent: void 0, route: void 0 }]
      });
      const Snapshot = Run.Context.dshQueue.Snapshot();
      assert.equal(Snapshot.tasks.length, 1);
      assert.equal(Snapshot.board, Status.board);
    });
  }
  return Finish(Count, "Dispatch-And-Board");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Dispatch-And-Board`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

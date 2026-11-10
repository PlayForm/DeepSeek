import assert from "node:assert/strict";
import {
  Automation,
  Check,
  FakeAgents,
  FakeSubagents,
  Finish,
  LinesWith,
  Make,
  MakeCounter,
  rm,
  Validate,
  Ledger
} from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  {
    const { Run, Service, Subagents, Agents } = Automation();
    const Journal = Run.Context.pluginFactory.PendingJournal;
    const Before = Journal.length;
    Service.Enqueue({ spec: "Build the parser", role: "coder", priority: 1 });
    await Service.Flush();
    Check(Count, "S1: one queued task spawns exactly one agent with the expected prompt", () => {
      assert.equal(Subagents.calls.length, 1);
      const Call = Subagents.calls[0];
      assert.equal(Call.provider, "spawn");
      assert.equal(Call.label, "queue-1");
      assert.equal(Call.delivery, "caller");
      assert.equal(Call.request.parent, Agents.parent);
      assert.deepEqual(Call.request.prompt, [{ type: "text", text: "Build the parser" }]);
      assert.equal(Call.request.agentOptions, void 0);
      assert.ok(Call.signal instanceof AbortSignal);
    });
    Check(Count, "S1: the spawned line and the child id are byte-exact", () => {
      assert.ok(Run.Lines.includes("plugin-dsh-queue: spawned queue-1 -> child-1"));
      assert.equal(Run.State.Tasks.get("queue-1")?.childId, "child-1");
      assert.equal(Run.State.Tasks.get("queue-1")?.state, "dispatched");
      assert.equal(Run.State.Seats.get("main"), 1);
      assert.equal(Service.Board(), "QUEUE: 0 pending - next: none - running: 1/10 (main seats 1)");
    });
    Check(Count, "S1: the spawn rides the journal's pre-open sink", () => {
      const Records = Journal.slice(Before);
      assert.ok(Records.some((Record) => Record.event === "task spawned" && Record.path === "queue-1"));
    });
  }
  {
    rm();
    const Subagents = FakeSubagents();
    const Agents = FakeAgents();
    const Run = Make(Validate({ logFile: Ledger, enabled: true }), (Context) => {
      Context.subagents = Subagents;
      Context.agents = Agents;
    });
    const Service = Run.Context.dshQueue;
    Service.Enqueue({ spec: "x" });
    await Service.Flush();
    Check(Count, "S2: autoSpawn=false never calls the service and writes no spawn line", () => {
      assert.equal(Subagents.calls.length, 0);
      assert.equal(LinesWith(Run, "spawn").length, 0);
      assert.equal(Run.State.Tasks.get("queue-1")?.state, "queued");
    });
    const Assigned = Service.Dispatch();
    await Service.Flush();
    Check(Count, "S2: the manual dispatch still assigns and ledgers, and still never spawns", () => {
      assert.equal(Assigned?.state, "dispatched");
      assert.ok(Run.Lines.includes("plugin-dsh-queue: dispatched queue-1 -> main"));
      assert.equal(Subagents.calls.length, 0);
      assert.equal(Run.State.Tasks.get("queue-1")?.childId, void 0);
    });
  }
  {
    const { Run, Service, Subagents } = Automation({ capacity: { main: 1, child: 2 } });
    Service.Enqueue({ spec: "a" });
    Service.Enqueue({ spec: "b" });
    await Service.Flush();
    Check(Count, "S3: a saturated pool queues the second task instead of spawning it", () => {
      assert.equal(Subagents.calls.length, 1);
      assert.equal(Subagents.calls[0].request.prompt[0].text, "a");
      assert.equal(Run.State.Tasks.get("queue-2")?.state, "queued");
    });
    Subagents.results[0].resolve({ stopReason: "completed" });
    await Service.Flush();
    Check(Count, "S3: the completed child settles its task and the freed seat pulls the next", () => {
      assert.ok(Run.Lines.includes("plugin-dsh-queue: completed queue-1 (main)"));
      assert.equal(Run.State.Tasks.get("queue-1")?.state, "completed");
      assert.equal(Subagents.calls.length, 2);
      assert.equal(Subagents.calls[1].request.prompt[0].text, "b");
      assert.ok(Run.Lines.includes("plugin-dsh-queue: spawned queue-2 -> child-2"));
    });
  }
  {
    const { Run, Service, Subagents } = Automation();
    Service.Enqueue({ spec: "a" });
    await Service.Flush();
    Subagents.results[0].resolve({ stopReason: "aborted" });
    await Service.Flush();
    Check(Count, "S4: an aborted child fails its task with the settle template", () => {
      assert.ok(Run.Lines.includes("plugin-dsh-queue: failed queue-1 (main)"));
      assert.equal(Run.State.Tasks.get("queue-1")?.state, "failed");
      assert.equal(Run.State.Seats.get("main"), 0);
    });
  }
  {
    const First = Automation({ capacity: { main: 1, child: 2 } });
    First.Service.Enqueue({ spec: "a" });
    await First.Service.Flush();
    const Persisted = First.Service.Snapshot().tasks;
    const Second = Automation({ capacity: { main: 1, child: 2 } });
    const Report = Second.Service.Reconcile(Persisted);
    Check(Count, "S5: a task whose agent is gone is requeued (the persisted record restored)", () => {
      assert.deepEqual(Report, { requeued: ["queue-1"], failed: [] });
      assert.ok(Second.Run.Lines.includes("plugin-dsh-queue: requeued queue-1 (main gone)"));
      assert.equal(Second.Run.State.Tasks.get("queue-1")?.attempts, 1);
    });
    await Second.Service.Flush();
    Check(Count, "S5: the requeue releases the seat and the pull relaunches the task", () => {
      assert.equal(Second.Subagents.calls.length, 1);
      assert.equal(Second.Subagents.calls[0].request.prompt[0].text, "a");
      assert.equal(Second.Run.State.Tasks.get("queue-1")?.attempts, 1);
      assert.ok(Second.Run.Lines.includes("plugin-dsh-queue: spawned queue-1 -> child-1"));
    });
    const Twice = Persisted.map((Task) => ({ ...Task, attempts: 1 }));
    const Third = Automation({ capacity: { main: 1, child: 2 } });
    const Failed = Third.Service.Reconcile(Twice);
    Check(Count, "S5: a second orphan detection fails the task honestly", () => {
      assert.deepEqual(Failed, { requeued: [], failed: ["queue-1"] });
      assert.ok(Third.Run.Lines.includes("plugin-dsh-queue: failed queue-1 (main)"));
      assert.equal(Third.Run.State.Tasks.get("queue-1")?.state, "failed");
      assert.equal(Third.Run.State.Seats.get("main"), 0);
    });
  }
  {
    const Route = {
      Resolve: () => ({
        provider: "cloudflare-workers-ai",
        model: "@cf/zai-org/glm-5.3-flash",
        reasoningEffort: "high"
      })
    };
    rm();
    const Subagents = FakeSubagents();
    const Run = Make(
      Validate({ logFile: Ledger, enabled: true, autoSpawn: true, policy: { spawn: "auto" } }),
      (Context) => {
        Context.subagents = Subagents;
        Context.agents = FakeAgents();
        Context.dshRoute = Route;
      }
    );
    Run.Context.dshQueue.Enqueue({ spec: "s", role: "coder" });
    await Run.Context.dshQueue.Flush();
    Check(Count, "S6: the routed dispatch hands the child the resolved triple", () => {
      assert.deepEqual(Subagents.calls[0].request.agentOptions, {
        provider: "cloudflare-workers-ai",
        model: "@cf/zai-org/glm-5.3-flash",
        reasoningEffort: "high"
      });
      assert.ok(
        Run.Lines.includes(
          "plugin-dsh-queue: dispatched queue-1 -> main route cloudflare-workers-ai @cf/zai-org/glm-5.3-flash high"
        )
      );
    });
  }
  {
    const NoParent = Automation({}, null);
    NoParent.Service.Enqueue({ spec: "a" });
    await NoParent.Service.Flush();
    Check(Count, "S7: no live parent refuses with the byte-exact line", () => {
      assert.equal(NoParent.Subagents.calls.length, 0);
      assert.ok(
        NoParent.Run.Lines.includes("plugin-dsh-queue: spawn skipped queue-1 (no live parent)")
      );
    });
    rm();
    const Run = Make(
      Validate({ logFile: Ledger, enabled: true, autoSpawn: true, policy: { spawn: "auto" } }),
      (Context) => {
        Context.agents = FakeAgents();
      }
    );
    Run.Context.dshQueue.Enqueue({ spec: "a" });
    await Run.Context.dshQueue.Flush();
    Check(Count, "S7: no subagents service refuses with the byte-exact line", () => {
      assert.ok(
        Run.Lines.includes(
          "plugin-dsh-queue: spawn skipped queue-1 (no subagents service)"
        )
      );
    });
  }
  {
    const { Run, Service, Subagents } = Automation();
    Service.Enqueue({ spec: "a" });
    await Service.Flush();
    const Signal = Subagents.calls[0].signal;
    Service.Interrupt("queue-1");
    Check(Count, "S8: Interrupt aborts the spawn signal and releases the seat", () => {
      assert.equal(Signal.aborted, true);
      assert.ok(Run.Lines.includes("plugin-dsh-queue: interrupted queue-1 (main)"));
      assert.equal(Run.State.Seats.get("main"), 0);
    });
  }
  {
    const Broken = {
      calls: [],
      startActivation: async (Spec) => {
        Broken.calls.push(Spec);
        throw new Error("provider down");
      }
    };
    rm();
    const Run = Make(
      Validate({ logFile: Ledger, enabled: true, autoSpawn: true, policy: { spawn: "auto" } }),
      (Context) => {
        Context.subagents = Broken;
        Context.agents = FakeAgents();
      }
    );
    Run.Context.dshQueue.Enqueue({ spec: "a" });
    await Run.Context.dshQueue.Flush();
    Check(Count, "S9: a rejected start ledgers the failure and fails the task", () => {
      assert.ok(Run.Lines.includes("plugin-dsh-queue: spawn failed queue-1 (provider down)"));
      assert.ok(Run.Lines.includes("plugin-dsh-queue: failed queue-1 (main)"));
      assert.equal(Run.State.Tasks.get("queue-1")?.state, "failed");
      assert.equal(Run.State.Seats.get("main"), 0);
    });
  }
  return Finish(Count, "Spawn-And-Reconcile");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Spawn-And-Reconcile`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

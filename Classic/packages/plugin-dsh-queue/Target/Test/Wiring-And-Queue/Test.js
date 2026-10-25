import assert from "node:assert/strict";
import {
  Check,
  Finish,
  Ledger,
  LedgerLines,
  Make,
  MakeCounter,
  Plugin,
  rm,
  Validate
} from "../Harness.js";
const Setup = (Config = {}) => {
  rm();
  return Make(Validate({ logFile: Ledger, enabled: true, ...Config }));
};
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup();
    Check(Count, "L1: the default object carries name/apply/Config/inject", () => {
      assert.equal(Plugin.name, "plugin-dsh-queue");
      assert.equal(typeof Plugin.apply, "function");
      assert.ok(Plugin.Config);
      assert.deepEqual(Plugin.inject, ["pluginFactory", "tools"]);
    });
    Check(Count, "L1: apply returns NOTHING and the state probe exists", () => {
      assert.equal(Run.Returned, void 0);
      assert.ok(Run.State !== void 0);
      assert.equal(Run.State.Module, "plugin-dsh-queue");
      assert.equal(Run.State.On, true);
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger }));
    Check(Count, "W1: the cold mount logs the byte-exact disabled line", () => {
      assert.deepEqual(Run.Lines, ["plugin-dsh-queue: disabled (enabled=false)"]);
    });
    Check(Count, "W1: a disabled mount registers no listener on any context", () => {
      assert.deepEqual(Run.RootNames, []);
      assert.deepEqual(Object.keys(Run.CtxListeners).filter((K) => K !== "loader/volatile-update"), []);
    });
    Check(Count, "W1: the service and the tools still register; the tools refuse", () => {
      assert.ok(Run.Provided["dshQueue"] !== void 0);
      assert.deepEqual(Run.Tools.map((T) => T.name), ["queue_enqueue", "queue_status"]);
      assert.deepEqual(Run.Tools[0].exec({ spec: "x" }), {
        ok: false,
        error: "queue disabled (enabled=false)"
      });
      assert.deepEqual(Run.Tools[1].exec({}), {
        ok: false,
        error: "queue disabled (enabled=false)"
      });
    });
  }
  {
    const Run = Setup();
    Check(Count, "W2: the activation line is byte-exact", () => {
      assert.deepEqual(Run.Lines, [
        "plugin-dsh-queue: activated (bundle 0.2.0, capacity=main=10 child=2, routedDispatch=true)"
      ]);
    });
    Check(Count, "W2: the dshQueue service is the apply-registered instance", () => {
      const Service = Run.Provided["dshQueue"];
      assert.ok(Service !== void 0);
      assert.equal(Service, Run.State.DshQueue);
      assert.equal(typeof Service.Enqueue, "function");
      assert.equal(typeof Service.Dispatch, "function");
      assert.equal(typeof Service.Start, "function");
      assert.equal(typeof Service.Complete, "function");
      assert.equal(typeof Service.Fail, "function");
      assert.equal(typeof Service.Interrupt, "function");
      assert.equal(typeof Service.Board, "function");
      assert.equal(typeof Service.Snapshot, "function");
      assert.equal(typeof Service.Capacity, "function");
    });
    Check(Count, "W2: the two tools are registered with the queue surface", () => {
      assert.deepEqual(Run.Tools.map((T) => T.name), ["queue_enqueue", "queue_status"]);
      assert.deepEqual(Run.Tools[0].parameters.required, ["spec"]);
    });
  }
  {
    const Run = Setup();
    const Service = Run.Context.dshQueue;
    const First = Service.Enqueue({ spec: "Build the parser", role: "coder", priority: 3, dependsOn: [] });
    const Second = Service.Enqueue({ spec: "Review the docs" });
    Check(Count, "W3: enqueue assigns the ids and stores the spec verbatim", () => {
      assert.equal(First.id, "queue-1");
      assert.equal(First.state, "queued");
      assert.equal(First.seq, 1);
      assert.equal(First.spec, "Build the parser");
      assert.equal(Second.id, "queue-2");
      assert.equal(Second.seq, 2);
      assert.equal(Second.priority, 0);
      assert.equal(Second.role, void 0);
    });
    Check(Count, "W3: the enqueue ledger lines are byte-exact", () => {
      assert.ok(Run.Lines.includes("plugin-dsh-queue: queued queue-1 coder p3 deps0"));
      assert.ok(Run.Lines.includes("plugin-dsh-queue: queued queue-2 auto p0 deps0"));
      assert.equal(LedgerLines().filter((Line) => Line.endsWith("queued queue-1 coder p3 deps0")).length, 1);
      assert.equal(LedgerLines().filter((Line) => Line.endsWith("queued queue-2 auto p0 deps0")).length, 1);
    });
    Check(Count, "W3: the journal record rides the pre-open journaling path", () => {
      const Factory = Run.Context.pluginFactory;
      const Before = Factory.PendingJournal.length;
      Factory.PendingJournal.splice(0, Before);
      Service.Enqueue({ spec: "Journal probe", role: "coder", priority: 4 });
      assert.equal(Factory.PendingJournal.length, 1);
      assert.equal(Factory.PendingJournal[0].event, "task queued");
      assert.equal(Factory.PendingJournal[0].path, "queue-3");
      assert.equal(Factory.PendingJournal[0].detail, "p4");
      assert.equal(typeof Factory.PendingJournal[0].at, "number");
    });
  }
  {
    Check(Count, "W4: capacity.main below 1 fails loud at the schema (load time)", () => {
      assert.throws(
        () => Validate({ logFile: Ledger, enabled: true, capacity: { main: 0, child: 2 } }),
        /expected number >= 1/
      );
    });
    const Composition = await import("../../Function/Validate.js");
    Check(Count, "W4: the composition check fails loud on plain values", () => {
      assert.throws(
        () => Composition.default({ main: 0, child: 2 }),
        /plugin-dsh-queue: capacity\.main must be >= 1/
      );
      assert.throws(
        () => Composition.default({ main: 10, child: 0 }),
        /plugin-dsh-queue: capacity\.child must be >= 1/
      );
      assert.throws(
        () => Composition.default({ get: () => ({ main: 0, child: 2 }) }),
        /plugin-dsh-queue: capacity\.main must be >= 1/
      );
    });
  }
  {
    const Run = Setup();
    const Service = Run.Context.dshQueue;
    Service.Enqueue({ spec: "a" });
    Service.Dispatch();
    Service.Start("queue-1");
    Service.Complete("queue-1", "hash-1");
    Check(Count, "W5: the fake fs records ZERO writeText and readText calls", () => {
      assert.equal(Run.Fs.writes.length, 0);
      assert.equal(Run.Fs.reads.length, 0);
    });
  }
  return Finish(Count, "Wiring-And-Queue");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Wiring-And-Queue`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

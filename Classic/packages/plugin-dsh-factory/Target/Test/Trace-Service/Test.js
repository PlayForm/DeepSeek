import assert from "node:assert/strict";
import { Names } from "@playform/lib-dsh-trace";
import { Check, CheckAsync, Finish, MakeCounter, Make, FactoryClass } from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  const Fake = Make(null, {});
  const factory = new FactoryClass(Fake.Context);
  const Trace = Fake.provided["trace"];
  {
    const Sub = "trace: the factory provides ONE ctx.trace service (the same instance)";
    {
      Check(Count, Sub, () => {
        assert.ok(Trace !== void 0, "the factory provided trace");
        assert.equal(Fake.Context.trace, Trace, "ctx.trace resolves to the service");
        assert.equal(Trace, factory.Trace, "the factory holds the same bus");
        assert.equal(typeof Trace.emit, "function");
        assert.equal(typeof Trace.on, "function");
        assert.equal(typeof Trace.flush, "function");
        assert.equal(typeof Trace.ring, "function");
        assert.equal(typeof Trace.dispose, "function");
      });
    }
  }
  {
    const Received = [];
    const Dispose = Trace.on(Names.observe, (Envelope) => Received.push(Envelope));
    Trace.emit({
      kind: Names.observe,
      payload: { path: "/repo/src/a.ts", version: "1", origin: "fs/observed" }
    });
    Check(Count, "trace: an emit reaches the named listener with the completed envelope", () => {
      assert.equal(Received.length, 1);
      assert.equal(Received[0].trace, "trace-1", "the bus assigned the correlation id");
      assert.equal(Received[0].kind, "observe/stamp");
      assert.equal(typeof Received[0].at, "number");
      assert.deepEqual(Received[0].payload, {
        path: "/repo/src/a.ts",
        version: "1",
        origin: "fs/observed"
      });
    });
    Check(Count, "trace: an emitter-supplied trace and at are preserved", () => {
      Trace.emit({
        kind: Names.indexed,
        payload: { path: "/repo/src/b.ts" },
        trace: "chain-9",
        at: 4242
      });
      const Envelope = Trace.ring(1)[0];
      assert.equal(Envelope.trace, "chain-9");
      assert.equal(Envelope.at, 4242);
    });
    Check(Count, "trace: the disposer stops delivery", () => {
      Dispose();
      Trace.emit({ kind: Names.observe, payload: { path: "/repo/src/c.ts" } });
      assert.equal(Received.length, 1, "no delivery after the disposer");
    });
  }
  {
    const Sub = "trace: the ring is newest first and bounded at 256";
    {
      Check(Count, Sub, () => {
        const Before = Trace.ring().length;
        for (let Index = 0; Index < 300; Index += 1) {
          Trace.emit({ kind: Names.invalidated, payload: { path: `/bulk/${Index}.ts` } });
        }
        const Ring = Trace.ring();
        assert.equal(Ring.length, 256, "the bound holds");
        assert.equal(Ring[0].payload.path, "/bulk/299.ts", "newest first");
        assert.equal(Trace.ring(2).length, 2, "the limit slices the head");
        assert.equal(Before <= 256, true);
      });
    }
  }
  {
    const Seen = [];
    Trace.on(Names.indexed, () => {
      throw new Error("listener boom");
    });
    Trace.on(Names.indexed, () => Seen.push("second"));
    Check(Count, "trace: a throwing listener never reaches the caller and never silences the rest", () => {
      assert.doesNotThrow(
        () => Trace.emit({ kind: Names.indexed, payload: { path: "/repo/src/d.ts" } })
      );
      assert.deepEqual(Seen, ["second"]);
    });
    Check(Count, "trace: a malformed draft is ignored (no ring entry, no dispatch)", () => {
      const Before = Trace.ring().length;
      assert.doesNotThrow(() => Trace.emit(null));
      assert.doesNotThrow(() => Trace.emit({ kind: "", payload: {} }));
      assert.doesNotThrow(() => Trace.emit({ kind: Names.observe, payload: null }));
      assert.equal(Trace.ring().length, Before);
    });
  }
  {
    await CheckAsync(Count, "trace: flush settles deterministically (no timer)", async () => {
      await assert.doesNotReject(() => Trace.flush());
    });
    Check(Count, "trace: the unload effect disposes the bus; a late emit and on are contained", () => {
      const Unload = Fake.effects.find((Entry) => Entry[0] === "trace")?.[1];
      assert.equal(typeof Unload, "function", "the constructor registered the trace unload effect");
      const Late = [];
      Unload();
      assert.doesNotThrow(
        () => Trace.emit({ kind: Names.observe, payload: { path: "/repo/src/e.ts" } })
      );
      const Dispose = Trace.on(Names.observe, () => Late.push("late"));
      assert.equal(typeof Dispose, "function", "a late subscription returns a disposer");
      Dispose();
      assert.deepEqual(Late, []);
    });
  }
  return Finish(Count, "Trace-Service");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Trace-Service`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

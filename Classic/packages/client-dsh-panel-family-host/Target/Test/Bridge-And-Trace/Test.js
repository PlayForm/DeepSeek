import assert from "node:assert/strict";
import {
  BundleSource,
  Check,
  CheckAsync,
  ClientPlugin,
  Finish,
  Make,
  MakeBus,
  MakeClient,
  MakeCounter,
  MakeEditor,
  MakeEntry,
  MakeSchema,
  Validate
} from "../Harness.js";
const NORMALIZE = "hook-dsh-normalize-dash";
const SECRET = "hook-dsh-secret-test";
const NormalizeSchema = MakeSchema({
  uid: 0,
  refs: {
    "0": {
      type: "object",
      dict: {
        logFile: { type: "string", meta: { volatile: true } },
        normalizeReasoning: { type: "boolean" }
      }
    }
  }
});
const SecretSchema = MakeSchema({
  uid: 0,
  refs: {
    "0": {
      type: "object",
      dict: {
        token: { type: "string", meta: { role: "secret" } },
        label: { type: "string" }
      }
    }
  }
});
const NestedSecretSchema = MakeSchema({
  uid: 0,
  refs: {
    "0": {
      type: "object",
      dict: {
        scopes: {
          type: "object",
          dict: { token: { type: "string", meta: { role: "secret" } } }
        }
      }
    }
  }
});
const PATCH = {
  logFile: "~/.dsh/playform/hook-dsh-normalize-dash.log",
  normalizeReasoning: true
};
const MakeRemote = () => {
  const Calls = [];
  const Listeners = /* @__PURE__ */ new Map();
  return {
    Calls,
    Remote: {
      playformFamilyPanel: {
        editFull: async (Namespace, Patch) => {
          Calls.push({ namespace: Namespace, patch: Patch });
          return { ok: true, value: true };
        },
        trace: {
          on: (Kind, Listener) => {
            let Subscribers = Listeners.get(Kind);
            if (Subscribers === void 0) {
              Subscribers = /* @__PURE__ */ new Set();
              Listeners.set(Kind, Subscribers);
            }
            Subscribers.add(Listener);
            return () => {
              Subscribers?.delete(Listener);
            };
          },
          ring: (Limit) => [{ trace: "trace-1", kind: "graph/indexed" }].slice(0, Limit ?? 1)
        }
      }
    },
    Emit: (Kind, Envelope) => {
      for (const Listener of Listeners.get(Kind) ?? []) Listener(Envelope);
    }
  };
};
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Normalize = MakeEditor([MakeEntry(NORMALIZE, NormalizeSchema)]);
    const Run = Make(Validate({ enabled: true }), { configEditor: Normalize.Editor });
    const Bridge = Run.Provided["panelFamilyBridge"];
    Check(Count, "B1: the host provides panelFamilyBridge.editFull", () => {
      assert.equal(typeof Bridge, "object");
      assert.equal(typeof Bridge.editFull, "function");
    });
    await CheckAsync(Count, "B2: a plain patch applies through the config editor", async () => {
      assert.equal(await Bridge.editFull(NORMALIZE, PATCH), true);
      assert.deepEqual(Normalize.Writes, [{ id: NORMALIZE, patch: PATCH }]);
      assert.deepEqual(Run.Warns, []);
    });
    const SecretEditor = MakeEditor([MakeEntry(SECRET, SecretSchema)]);
    const SecretRun = Make(Validate({ enabled: true }), {
      configEditor: SecretEditor.Editor
    });
    await CheckAsync(Count, "B3: a secret namespace is refused with the exact line", async () => {
      assert.equal(
        await SecretRun.Provided["panelFamilyBridge"].editFull(SECRET, {
          token: "redacted",
          label: "x"
        }),
        false
      );
      assert.deepEqual(SecretRun.Warns, [
        `bridge: secret namespace refused for ${SECRET}`
      ]);
      assert.deepEqual(SecretEditor.Writes, []);
    });
    const NestedEditor = MakeEditor([MakeEntry(SECRET, NestedSecretSchema)]);
    const NestedRun = Make(Validate({ enabled: true }), {
      configEditor: NestedEditor.Editor
    });
    await CheckAsync(Count, "B4: a nested secret field is refused too", async () => {
      assert.equal(
        await NestedRun.Provided["panelFamilyBridge"].editFull(SECRET, {
          scopes: { token: "redacted" }
        }),
        false
      );
      assert.deepEqual(NestedRun.Warns, [
        `bridge: secret namespace refused for ${SECRET}`
      ]);
      assert.deepEqual(NestedEditor.Writes, []);
    });
    await CheckAsync(Count, "B5: an unknown namespace is refused", async () => {
      const Missing = MakeEditor([MakeEntry(NORMALIZE, NormalizeSchema)]);
      const MissingRun = Make(Validate({ enabled: true }), {
        configEditor: Missing.Editor
      });
      assert.equal(
        await MissingRun.Provided["panelFamilyBridge"].editFull("hook-dsh-missing", {}),
        false
      );
      assert.deepEqual(MissingRun.Warns, [
        "bridge: unknown namespace hook-dsh-missing"
      ]);
      assert.deepEqual(Missing.Writes, []);
    });
    const Bare = Make(Validate({ enabled: true }));
    await CheckAsync(Count, "B6: a composition without the editor is refused", async () => {
      assert.equal(await Bare.Provided["panelFamilyBridge"].editFull(NORMALIZE, {}), false);
      assert.deepEqual(Bare.Warns, ["bridge: config editor unavailable"]);
    });
    const InvalidEditor = MakeEditor([MakeEntry(NORMALIZE, NormalizeSchema)]);
    const InvalidRun = Make(Validate({ enabled: true }), {
      configEditor: InvalidEditor.Editor
    });
    await CheckAsync(Count, "B7: a non-object patch is refused", async () => {
      assert.equal(
        await InvalidRun.Provided["panelFamilyBridge"].editFull(NORMALIZE, "not-a-patch"),
        false
      );
      assert.deepEqual(InvalidRun.Warns, [`bridge: invalid patch for ${NORMALIZE}`]);
      assert.deepEqual(InvalidEditor.Writes, []);
    });
    const DisabledEditor = MakeEditor([MakeEntry(NORMALIZE, NormalizeSchema)]);
    const Disabled = Make(Validate({ enabled: false }), {
      configEditor: DisabledEditor.Editor
    });
    await CheckAsync(Count, "B8: a disabled package refuses the bridge first", async () => {
      assert.equal(await Disabled.Provided["panelFamilyBridge"].editFull(NORMALIZE, PATCH), false);
      assert.deepEqual(Disabled.Warns, ["bridge: disabled (enabled=false)"]);
      assert.deepEqual(DisabledEditor.Writes, []);
    });
    const FailingEditor = {
      entries: () => [MakeEntry(NORMALIZE, NormalizeSchema)],
      edit: async () => {
        throw new Error("editor refused");
      }
    };
    const Failing = Make(Validate({ enabled: true }), { configEditor: FailingEditor });
    await CheckAsync(Count, "B9: an editor rejection is reported", async () => {
      assert.equal(await Failing.Provided["panelFamilyBridge"].editFull(NORMALIZE, PATCH), false);
      assert.deepEqual(Failing.Warns, [`bridge: write failed for ${NORMALIZE}`]);
    });
  }
  {
    const Bus = MakeBus();
    const Run = Make(Validate({ enabled: true }), { trace: Bus });
    const Trace = Run.Provided["panelFamilyTrace"];
    Check(Count, "T1: the forwarder is provided when the bus exists", () => {
      assert.equal(typeof Trace, "object");
      assert.equal(typeof Trace.on, "function");
      assert.equal(typeof Trace.ring, "function");
    });
    Check(Count, "T2: on forwards a bus event to its listener", () => {
      const Received = [];
      Trace.on("observe/stamp", (Envelope) => Received.push(Envelope));
      const Emitted = Bus.emit("observe/stamp", { path: "src/a.ts" });
      assert.deepEqual(Received, [Emitted]);
      assert.equal(Received[0].trace, "trace-1");
      assert.deepEqual(Received[0].payload, { path: "src/a.ts" });
    });
    Check(Count, "T3: ring reads the bus newest first", () => {
      Bus.emit("graph/indexed", { path: "src/b.ts" });
      assert.deepEqual(
        Trace.ring(2).map((Envelope) => Envelope.payload.path),
        ["src/b.ts", "src/a.ts"]
      );
    });
    const Bare = Make(Validate({ enabled: true }));
    Check(Count, "T4: without the bus no forwarder is provided", () => {
      assert.equal(Bare.Provided["panelFamilyTrace"], void 0);
    });
  }
  {
    const Remote = MakeRemote();
    const Run = MakeClient({ remote: Remote.Remote });
    ClientPlugin.apply(Run.Context);
    Check(Count, "C1: the client half requires the Remote gateway", () => {
      assert.deepEqual(ClientPlugin.inject, ["remote"]);
      assert.equal(typeof ClientPlugin.apply, "function");
      assert.deepEqual(
        Run.Injects.map((Entry) => Entry.deps),
        [["remote.playformFamilyPanel"]]
      );
    });
    Run.Open();
    Check(Count, "C2: the client half re-publishes the bridge and the trace", () => {
      assert.deepEqual(Object.keys(Run.Provided).sort(), [
        "panelFamilyBridge",
        "trace"
      ]);
      assert.equal(typeof Run.Provided["panelFamilyBridge"].editFull, "function");
      assert.equal(typeof Run.Provided["trace"].on, "function");
    });
    await CheckAsync(Count, "C3: the forwarded bridge normalizes the gateway answer", async () => {
      assert.equal(
        await Run.Provided["panelFamilyBridge"].editFull(NORMALIZE, PATCH),
        true
      );
      assert.deepEqual(Remote.Calls, [{ namespace: NORMALIZE, patch: PATCH }]);
    });
    Check(Count, "C4: the forwarded trace relays a namespace event", () => {
      const Received = [];
      Run.Provided["trace"].on(
        "graph/indexed",
        (Envelope) => Received.push(Envelope)
      );
      Remote.Emit("graph/indexed", { trace: "trace-9", kind: "graph/indexed" });
      assert.deepEqual(Received, [{ trace: "trace-9", kind: "graph/indexed" }]);
      assert.deepEqual(Run.Provided["trace"].ring(1), [
        { trace: "trace-1", kind: "graph/indexed" }
      ]);
    });
    const Bare = MakeClient({ remote: {} });
    ClientPlugin.apply(Bare.Context);
    Bare.Open();
    Check(Count, "C5: without the namespace the client half provides nothing", () => {
      assert.deepEqual(Bare.Provided, {});
    });
  }
  Check(Count, "K1: the client bundle is a closure factory that executes", () => {
    const Code = BundleSource();
    assert.equal(Code.includes("window.__ModuleLoader__.load({"), true);
    const Rows = [];
    const Window = {
      __ModuleLoader__: { load: (Row) => Rows.push(Row) }
    };
    new Function("window", Code)(Window);
    assert.equal(Rows.length, 1);
    assert.equal(Rows[0].id, "@playform/client-dsh-panel-family-host");
    assert.equal(typeof Rows[0].factory, "function");
    const Exports = Rows[0].factory(() => {
      throw new Error("the client bundle must not require an external");
    });
    assert.deepEqual(Exports.inject, ["remote"]);
    assert.equal(typeof Exports.apply, "function");
    assert.deepEqual(Exports.default.inject, ["remote"]);
  });
  return Finish(Count, "Bridge-And-Trace");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Bridge-And-Trace`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

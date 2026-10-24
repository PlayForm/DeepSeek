import assert from "node:assert/strict";
import {
  Boot,
  Check,
  Finish,
  Ledger,
  Lines,
  LoggerLines,
  MakeCounter
} from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  const World = Boot();
  const { ctx, Factory, Returned, st } = World;
  {
    const Sub = "the REAL factory service instantiated against the fake ctx";
    {
      Check(Count, Sub, () => {
        assert.equal(ctx.pluginFactory, Factory, "factory registered as ctx.pluginFactory");
      });
    }
  }
  {
    const Sub = "apply returns undefined; Wire registered the fs/observed hook";
    {
      Check(Count, Sub, () => {
        assert.equal(Returned, void 0, "apply returns NOTHING");
        assert.equal(
          ctx.events.filter((e) => e[0] === "fs/observed").length,
          1,
          "exactly one fs/observed listener (Wire)"
        );
      });
    }
  }
  {
    const Sub = "State: factory-built shared shape + the pinner's Section field + PolicyName";
    {
      Check(Count, Sub, () => {
        assert.ok(st, "state exposed via the context attachment");
        assert.equal(st.Module, "hook-dsh-pinner-package", "State.Module = the logger/ledger prefix");
        assert.equal(st.Ledger, Ledger);
        assert.equal(st.Enabled, true);
        assert.deepEqual(st.Tool, ["write", "edit", "str_replace_editor", "raw-write"]);
        assert.deepEqual(st.Section, [
          "dependencies",
          "devDependencies",
          "peerDependencies",
          "optionalDependencies"
        ]);
        assert.equal(st.Policy, "");
        assert.equal(st.PolicyName, "pin-policy.json", "the union-discovery sidecar name");
        assert.deepEqual(st.List, [
          "node_modules",
          ".git",
          ".dsh",
          ".pnpm",
          ".store",
          "DeepSeek Harness.app"
        ]);
        assert.ok(
          st.Stash instanceof Map && st.Inflight instanceof Map && st.Seams instanceof Map && Array.isArray(st.Queue)
        );
        assert.equal(st.Subprocess, void 0, "P9: subprocess seam probed once, absent \u2192 undefined");
        assert.ok(ctx.serviceGets.includes("subprocess"), "the subprocess probe went through ctx.get");
      });
    }
  }
  {
    const Sub = "activation proof: the durable activated (pinner, \u2026) ledger line + the logger prefix";
    {
      Check(Count, Sub, () => {
        const activation = Lines(Ledger)[0];
        assert.match(
          activation,
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] activated \(pinner, logFile=.*ledger-main\.log, sections=\[dependencies, devDependencies, peerDependencies, optionalDependencies\], exclude=\[node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app\]\)$/,
          "the activation line is byte-identical"
        );
        assert.ok(
          LoggerLines.info.includes(
            `hook-dsh-pinner-package: activated (pinner, logFile=${Ledger}, sections=[dependencies, devDependencies, peerDependencies, optionalDependencies], exclude=[node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app])`
          ),
          "logger prefix composed from State.Module"
        );
      });
    }
  }
  {
    const Sub = "Attach: P1/P2/P5 labels + the in-flight disposal effect";
    {
      Check(Count, Sub, () => {
        assert.deepEqual(
          ctx.effects.map((e) => e[0]),
          [
            "trace",
            "hook-dsh-pinner-package-jobs",
            "hook-dsh-pinner-package-inflight",
            "hook-dsh-pinner-package-storage"
          ],
          "Attach: the trace effect + the three lifecycle effects"
        );
        const flight = new AbortController();
        st.Inflight.set("probe", { controller: flight });
        ctx.effects.find((e) => e[0] === "hook-dsh-pinner-package-inflight")[1]();
        assert.equal(flight.signal.aborted, true, "P2 disposer aborted the in-flight pass");
        assert.equal(st.Inflight.size, 0, "P2 disposer cleared the map");
      });
    }
  }
  {
    const Sub = "Journal: silent skip without a storage domain";
    {
      Check(Count, Sub, () => {
        st.Journal("x", "", "y");
        assert.equal(st.Queue.length, 0, "P5 absent: the sink is a no-op \u2014 no queue growth");
      });
    }
  }
  return Finish(Count, "State-And-Activation");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - State-And-Activation`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

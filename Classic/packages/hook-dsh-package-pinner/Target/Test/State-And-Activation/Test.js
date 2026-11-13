import assert from "node:assert/strict";
import * as Path from "node:path";
import {
  Boot,
  Check,
  Finish,
  Ledger,
  Lines,
  LoggerLines,
  MakeCounter,
  Root,
  Validate
} from "../Harness.js";
import * as Pinner from "../../../Target/Library.js";
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
        assert.equal(st.On, true, "the master switch (enabled) mapped by the setup map");
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
  {
    const EventsBefore = ctx.events.length;
    const EffectsBefore = ctx.effects.length;
    Pinner.apply(ctx, Validate({ log: true, logFile: Ledger, enabled: false }));
    const Disabled = ctx.__hookDshPinnerPackageState;
    const DisabledListener = ctx.events.filter((e) => e[0] === "fs/observed").at(-1)[1];
    const LinesBefore = Lines(Ledger).length;
    const Excluded = {
      displayPath: Path.join(Root, "node_modules", "probe", "package.json")
    };
    {
      const Sub = "disabled mount: every surface still registers and the ledger line is the byte-exact disabled line (no early return)";
      Check(Count, Sub, () => {
        assert.equal(Disabled.On, false, "the disabled mount's master switch");
        const All = Lines(Ledger);
        assert.equal(All.length, LinesBefore + 1, "exactly one new ledger line");
        assert.match(
          All.at(-1),
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] disabled \(enabled=false\)$/,
          "the byte-exact disabled line instead of the activation proof"
        );
        assert.ok(
          ctx.events.slice(EventsBefore).some((e) => e[0] === "fs/observed"),
          "the fs/observed listener STILL registered on the disabled mount"
        );
        assert.deepEqual(
          ctx.effects.slice(EffectsBefore).map((e) => e[0]),
          [
            "hook-dsh-pinner-package-jobs",
            "hook-dsh-pinner-package-inflight",
            "hook-dsh-pinner-package-storage"
          ],
          "the P1/P2/P5 lifecycle effects STILL registered on the disabled mount"
        );
        assert.ok(
          LoggerLines.info.includes("hook-dsh-pinner-package: disabled (enabled=false)"),
          "the disabled logger line carries the State.Module prefix"
        );
      });
    }
    {
      const Sub = "disabled mount: a call passes through with ZERO new ledger lines";
      Check(Count, Sub, () => {
        DisabledListener(
          { targetKey: "disabled-probe", ...Excluded },
          { kind: "present", version: "v-disabled-1" },
          { name: "edit" }
        );
        assert.equal(
          Lines(Ledger).length,
          LinesBefore + 1,
          "the disabled call did nothing (no exclusion line, no gate line)"
        );
      });
    }
    {
      const Sub = "disabled mount: flipping enabled acts on the very next call - and back";
      Check(Count, Sub, () => {
        Disabled.On = true;
        DisabledListener(
          { targetKey: "disabled-probe", ...Excluded },
          { kind: "present", version: "v-disabled-1" },
          { name: "edit" }
        );
        const All = Lines(Ledger);
        assert.equal(All.length, LinesBefore + 2, "the flipped-on call ran the gates (one new line)");
        assert.ok(
          All.at(-1).includes("skipped (excluded)"),
          "the pass really ran (the module's exclusion line)"
        );
        Disabled.On = false;
        DisabledListener(
          { targetKey: "disabled-probe-2", ...Excluded },
          { kind: "present", version: "v-disabled-2" },
          { name: "edit" }
        );
        assert.equal(Lines(Ledger).length, LinesBefore + 2, "the flipped-back call is silent again");
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

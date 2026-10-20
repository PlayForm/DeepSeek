import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import * as Path from "node:path";
import {
  Check,
  CheckAsync,
  Finish,
  MakeCounter,
  Make,
  TempRoot,
  FactoryClass
} from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  const Fake = Make(null, { files: {} });
  const ctx = Fake.Context;
  const { emitted, writes } = Fake;
  const Root = TempRoot("factory-smoke-");
  const Ledger = Path.join(Root, "ledger.log");
  const factory = new FactoryClass(ctx);
  const volatileCell = { get: () => ["write", "edit"] };
  const st1 = factory.State(
    ctx,
    {
      log: true,
      logFile: Ledger,
      policyFile: "",
      exclude: ["x"],
      mutationTools: volatileCell,
      strict: false,
      sections: ["dependencies"]
    },
    { module: "smoke-flavor", fields: { Section: "sections", Strict: "strict" } }
  );
  const proj = Path.join(Root, "proj");
  mkdirSync(proj);
  const target = { targetKey: "k1", displayPath: Path.join(proj, "package.json") };
  const actor = { name: "edit" };
  const present = { kind: "present", version: "v1" };
  const base = { basename: "package.json" };
  {
    const Sub = "Gate: full g1 matrix (target/govern/actor/kind/idempotent/basename/excluded/pass)";
    {
      Check(Count, Sub, () => {
        assert.deepEqual(factory.Gate(st1, null, present, actor, base), {
          pass: false,
          reason: "target"
        });
        assert.equal(factory.Gate(st1, target, present, void 0, base).reason, "actor");
        assert.equal(factory.Gate(st1, target, present, { name: "grep" }, base).reason, "actor");
        assert.equal(factory.Gate(st1, target, { kind: "absent" }, actor, base).reason, "kind");
        st1.Stash.set("k1", "v1");
        assert.equal(factory.Gate(st1, target, present, actor, base).reason, "idempotent");
        st1.Stash.clear();
        assert.equal(
          factory.Gate(st1, target, present, actor, { basename: "Cargo.toml" }).reason,
          "basename"
        );
        assert.equal(
          factory.Gate(
            st1,
            { targetKey: "k1", displayPath: Path.join(Root, "x", "package.json") },
            present,
            actor,
            base
          ).reason,
          "excluded"
        );
        assert.deepEqual(factory.Gate(st1, target, present, actor, base), {
          pass: true,
          path: target.displayPath
        });
        assert.equal(factory.Gate(st1, target, present, actor, base).pass, true);
        const st3 = factory.State(
          ctx,
          { logFile: Ledger, mutationTools: ["zwrite"] },
          { module: "f" }
        );
        assert.equal(
          factory.Gate(st3, target, present, actor, {
            basename: "package.json",
            mutationToolsField: "Tool"
          }).reason,
          "actor"
        );
        assert.deepEqual(factory.Gate(st1, target, present, { ...actor, govern: false }, base), {
          pass: false,
          reason: "govern",
          path: target.displayPath
        });
        assert.equal(
          factory.Gate(st1, target, present, { ...actor, govern: true }, base).reason,
          "govern"
        );
        assert.equal(
          factory.Gate(st1, target, present, { ...actor, govern: ["canonicalize"] }, base).reason,
          "govern"
        );
        assert.equal(
          factory.Gate(st1, target, present, { name: "raw-write" }, base).reason,
          "actor",
          "the marker is the gate: a name alone keeps the actor check"
        );
      });
    }
  }
  {
    const Sub = "GuardedWrite: replaceIfVersion intent + both P4 postures + Stash pre-registration";
    {
      await CheckAsync(Count, Sub, async () => {
        ctx.fs.sandboxMode = void 0;
        const out1 = await factory.GuardedWrite(st1, target, "{}\n", "v1");
        assert.equal(out1.version, "fresh-v2");
        assert.deepEqual(writes.at(-1).intent, { kind: "replaceIfVersion", version: "v1" });
        assert.equal(writes.at(-1).fence, null, "bare backend \u2192 NO fence policy");
        assert.equal(st1.Stash.get("k1"), "fresh-v2", "fresh version pre-registered");
        ctx.fs.sandboxMode = "workspace-write";
        await factory.GuardedWrite(st1, target, "{}\n", "fresh-v2");
        assert.deepEqual(
          writes.at(-1).fence,
          { mode: "workspace-write", workspaceRoot: proj },
          "confined backend \u2192 fence rooted at the file's own directory"
        );
        assert.equal(st1.Stash.get("k1"), "fresh-v2");
      });
    }
  }
  {
    const Sub = "Refresh: P3/U2 re-emit with the same actor + best-effort";
    {
      Check(Count, Sub, () => {
        emitted.length = 0;
        factory.Refresh(st1, target, actor, "fresh-v2");
        assert.deepEqual(emitted.at(-1), [
          "fs/observed",
          target,
          { kind: "present", version: "fresh-v2" },
          actor
        ]);
        assert.equal(st1.Stash.get("k1"), "fresh-v2");
        assert.doesNotThrow(() => {
          ctx.emit = () => {
            throw new Error("bus down");
          };
          factory.Refresh(st1, target, actor, "x");
          ctx.emit = (n, ...a) => emitted.push([n, ...a]);
        }, "best-effort");
      });
    }
  }
  {
    const Sub = "Gate: empty mutation-tool list \u2192 actor gate fails";
    {
      Check(Count, Sub, () => {
        const stE = factory.State(ctx, { logFile: Ledger, mutationTools: [] }, { module: "f" });
        assert.equal(
          factory.Gate(stE, target, present, actor, {
            basename: "package.json",
            mutationToolsField: "Tool"
          }).reason,
          "actor"
        );
      });
    }
  }
  {
    const Sub = "GuardedWrite: abort signal forwarded";
    {
      await CheckAsync(Count, Sub, async () => {
        ctx.fs.sandboxMode = void 0;
        const signal = new AbortController().signal;
        await factory.GuardedWrite(st1, target, "{}\n", "v1", signal);
        assert.equal(writes.at(-1).signal, signal, "signal forwarded to ctx.fs.writeText");
      });
    }
  }
  return Finish(Count, "Gate-Write-Refresh");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Gate-Write-Refresh`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

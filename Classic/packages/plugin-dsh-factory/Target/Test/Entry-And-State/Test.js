import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as Path from "node:path";
import {
  Check,
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
  const { provided, services, serviceGets, events } = Fake;
  const Root = TempRoot("factory-smoke-");
  const Ledger = Path.join(Root, "ledger.log");
  const factory = new FactoryClass(ctx);
  {
    const Sub = "entry: class extends Service, static inject=[fs], registered as ctx.pluginFactory";
    {
      Check(Count, Sub, () => {
        assert.equal(typeof FactoryClass, "function", "default export is a class");
        assert.ok(
          Object.getPrototypeOf(FactoryClass)?.name === "Service" || String(Object.getPrototypeOf(FactoryClass)).includes("Service"),
          "extends Service"
        );
        assert.deepEqual(FactoryClass.inject, ["fs"], "static inject = [fs]");
        assert.equal(provided["pluginFactory"], factory, "registered as ctx.pluginFactory");
        assert.equal(factory.name, "pluginFactory", "service name is pluginFactory");
      });
    }
    {
      const Sub2 = "entry: all 15 service methods present";
      Check(Count, Sub2, () => {
        for (const m of [
          "Append",
          "Match",
          "Discover",
          "Parse",
          "ResolvePolicy",
          "Gate",
          "GuardedWrite",
          "Refresh",
          "Continue",
          "State",
          "Wire",
          "Attach",
          "Journal",
          "Schema",
          "Seam"
        ])
          assert.equal(typeof factory[m], "function", `method ${m}`);
      });
    }
  }
  let st2;
  {
    const Sub = "State: cell unwrap + shared mappings + module fields + fresh structures";
    {
      Check(Count, Sub, () => {
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
        assert.equal(st1.Module, "smoke-flavor");
        assert.deepEqual(st1.Tool, ["write", "edit"], "volatile cell unwrapped");
        assert.equal(st1.Ledger, Ledger);
        assert.equal(st1.Enabled, true);
        assert.deepEqual(st1.List, ["x"]);
        assert.equal(st1.Policy, "");
        assert.equal(st1.PolicyName, "");
        assert.deepEqual(st1.Section, ["dependencies"], "module field Section mapped");
        assert.equal(st1.Strict, false, "module field Strict mapped");
        assert.ok(
          st1.Stash instanceof Map && st1.Inflight instanceof Map && st1.Seams instanceof Map && st1.Queue.length === 0
        );
        assert.equal(st1.Subprocess, void 0, "subprocess seam absent \u2192 undefined");
      });
    }
    {
      const Sub2 = "State: P9 probe-once subprocess seam";
      Check(Count, Sub2, () => {
        services["subprocess"] = { spawn: () => "stub" };
        st2 = factory.State(ctx, { logFile: Ledger }, { module: "smoke-flavor" });
        assert.equal(st2.Subprocess.spawn(), "stub", "subprocess probed once at build");
      });
    }
  }
  {
    const Sub = "Seam: probe-once cache (incl. cached undefined), ctx.get only";
    {
      Check(Count, Sub, () => {
        services["smoke-x"] = { tag: "x" };
        const seamBefore = serviceGets.length;
        assert.equal(factory.Seam(st2, "smoke-x"), services["smoke-x"]);
        assert.equal(factory.Seam(st2, "smoke-x"), services["smoke-x"]);
        assert.equal(serviceGets.length, seamBefore + 1, "second Seam call served from cache");
        assert.equal(factory.Seam(st2, "no-such-service"), void 0);
      });
    }
  }
  {
    const Sub = "State: missing config fields tolerated (schema guarantees them in production)";
    {
      Check(Count, Sub, () => {
        const stBare = factory.State(ctx, {}, { module: "f" });
        assert.equal(stBare.Ledger, void 0);
        assert.doesNotThrow(() => factory.Append(stBare, "bare"));
      });
    }
  }
  {
    const Sub = "Append: the tilde ledger path expands against $HOME (the live config shape)";
    {
      Check(Count, Sub, () => {
        const Original = process.env["HOME"];
        const Home = TempRoot("factory-smoke-home-");
        try {
          process.env["HOME"] = Home;
          FileSystem.mkdirSync(Path.join(Home, ".dsh"), { recursive: true });
          const stTilde = factory.State(
            ctx,
            { log: true, logFile: "~/.dsh/probe.log" },
            { module: "smoke-flavor" }
          );
          assert.equal(stTilde.Ledger, "~/.dsh/probe.log", "State keeps the raw config path");
          factory.Append(stTilde, "probe tilde");
          const Probe = Path.join(Home, ".dsh", "probe.log");
          const Written = FileSystem.readFileSync(Probe, "utf8");
          assert.ok(
            /^\[\d{4}-\d{2}-\d{2}T.*\] probe tilde\n$/.test(Written),
            "the append landed in the expanded home path"
          );
        } finally {
          if (Original === void 0) {
            delete process.env["HOME"];
          } else {
            process.env["HOME"] = Original;
          }
        }
      });
    }
  }
  {
    const Sub = "Append: the ledger append creates its missing parent directory (~/.dsh/playform)";
    {
      Check(Count, Sub, () => {
        const Original = process.env["HOME"];
        const Home = TempRoot("factory-smoke-home-");
        try {
          process.env["HOME"] = Home;
          const stDir = factory.State(
            ctx,
            { log: true, logFile: "~/.dsh/playform/probe.log" },
            { module: "smoke-flavor" }
          );
          assert.equal(
            FileSystem.existsSync(Path.join(Home, ".dsh")),
            false,
            "the fixture pre-state: no .dsh directory"
          );
          factory.Append(stDir, "probe dir");
          const Probe = Path.join(Home, ".dsh", "playform", "probe.log");
          const Written = FileSystem.readFileSync(Probe, "utf8");
          assert.ok(
            /^\[\d{4}-\d{2}-\d{2}T.*\] probe dir\n$/.test(Written),
            "the append created the directory and landed in the file"
          );
        } finally {
          if (Original === void 0) {
            delete process.env["HOME"];
          } else {
            process.env["HOME"] = Original;
          }
        }
      });
    }
  }
  {
    const Sub = "UpdateKey: the namespaced Inflight key (update:<targetKey>)";
    {
      Check(Count, Sub, () => {
        assert.equal(
          factory.UpdateKey({ targetKey: "k1", displayPath: "/x/package.json" }),
          "update:k1"
        );
        assert.equal(
          factory.UpdateKey({ targetKey: "update:k1", displayPath: "/x" }),
          "update:update:k1"
        );
      });
    }
  }
  {
    const Sub = "P10 volatile refresh: one instance-local listener, in-place field updates (key-array + dotted + nested-object paths), identity preserved, unknown/failed paths safe";
    {
      Check(Count, Sub, () => {
        const Cell = { get: () => "first" };
        const LogCell = { get: () => false };
        const Mark = events.length;
        const stV = factory.State(
          ctx,
          { logFile: Ledger, log: LogCell, replacement: Cell },
          { module: "volatile-flavor", fields: { Replacement: "replacement" } }
        );
        const Refresh = events.slice(Mark).filter((e) => e[0] === "loader/volatile-update").map((e) => e[1]).at(-1);
        assert.ok(Refresh, "the State builder registers one loader/volatile-update listener");
        assert.equal(stV.Replacement, "first", "initial unwrap: the cell's mount-time value");
        assert.equal(stV.Enabled, false, "initial unwrap: the log cell's mount-time value");
        const Same = stV;
        Cell.get = () => "second";
        Refresh([["replacement"]]);
        assert.equal(stV.Replacement, "second", "key-array path: the field refreshes in place");
        assert.equal(Same, stV, "State object identity preserved (no remount, no rebuild)");
        Cell.get = () => "third";
        Refresh(["replacement"]);
        assert.equal(stV.Replacement, "third", "dotted-string path: the same refresh");
        const ObjCell = { get: () => ({ conversation: true, toolInput: false }) };
        const stO = factory.State(
          ctx,
          { logFile: Ledger, scopes: ObjCell },
          { module: "volatile-flavor", fields: { Scopes: "scopes" } }
        );
        const ObjRefresh = events.slice(events.length - 1).filter((e) => e[0] === "loader/volatile-update").map((e) => e[1]).at(-1);
        assert.deepEqual(stO.Scopes, { conversation: true, toolInput: false });
        ObjCell.get = () => ({ conversation: false, toolInput: true });
        ObjRefresh([["scopes", "toolInput"]]);
        assert.deepEqual(
          stO.Scopes,
          { conversation: false, toolInput: true },
          "nested object key: the whole object cell re-reads (top-level key)"
        );
        LogCell.get = () => true;
        Refresh([["log"]]);
        assert.equal(stV.Enabled, true, "shared mapping: log -> Enabled refreshes in place");
        Cell.get = () => "kept";
        Refresh([["replacement"]]);
        assert.equal(stV.Replacement, "kept", "valid path still refreshes before the ignore tests");
        assert.doesNotThrow(() => Refresh([["nonsense"], "a.b.c", 42, void 0]));
        assert.equal(stV.Replacement, "kept", "unknown key paths are ignored");
        assert.doesNotThrow(() => Refresh([["logFile"]]));
        assert.equal(stV.Ledger, Ledger, "non-volatile key path: no refresh");
        Cell.get = () => {
          throw new Error("boom");
        };
        assert.doesNotThrow(() => Refresh([["replacement"]]));
        assert.equal(stV.Replacement, "kept", "failed refresh keeps the previous value");
        assert.ok(events.filter((e) => e[0] === "loader/volatile-update").length >= 3);
      });
    }
  }
  return Finish(Count, "Entry-And-State");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Entry-And-State`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

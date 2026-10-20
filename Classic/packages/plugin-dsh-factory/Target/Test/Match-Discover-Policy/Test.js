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
  const { loggerLines } = Fake;
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
  {
    const Sub = "Match: exclusion-first segment match";
    {
      Check(Count, Sub, () => {
        assert.equal(factory.Match("/a/node_modules/b/package.json", ["node_modules"]), true);
        assert.equal(factory.Match("/a/b/package.json", ["node_modules"]), false);
        assert.equal(factory.Match("/a/b/package.json", []), false);
        assert.equal(factory.Match("/a/b/package.json", null), false);
      });
    }
  }
  {
    const Sub = "Discover/Parse: walk-up + node_modules boundary + contained JSON read";
    {
      Check(Count, Sub, () => {
        const proj = Path.join(Root, "proj");
        FileSystem.mkdirSync(proj);
        FileSystem.writeFileSync(
          Path.join(Root, "registry.json"),
          JSON.stringify({ effectiveLatest: { leftpad: "1.0.0" } })
        );
        assert.equal(factory.Discover(proj), Path.join(Root, "registry.json"));
        const nm = Path.join(Root, "node_modules", "deep");
        FileSystem.mkdirSync(nm, { recursive: true });
        assert.equal(factory.Discover(nm), null, "walk-up stops at node_modules");
        assert.equal(factory.Discover("/"), null);
        assert.deepEqual(factory.Parse(Path.join(Root, "registry.json")), {
          effectiveLatest: { leftpad: "1.0.0" }
        });
        FileSystem.writeFileSync(Path.join(Root, "bad.json"), "{ nope");
        assert.equal(factory.Parse(Path.join(Root, "bad.json")), null);
        assert.equal(factory.Parse(Path.join(Root, "missing.json")), null);
      });
    }
  }
  {
    const Sub = "ResolvePolicy: union keep-list + P3 chain-keys + unreadable handling";
    {
      Check(Count, Sub, () => {
        const proj = Path.join(Root, "proj");
        const globalPolicy = Path.join(Root, "global-policy.json");
        FileSystem.writeFileSync(globalPolicy, JSON.stringify({ keep: ["g", "a"] }));
        FileSystem.writeFileSync(
          Path.join(proj, "pin-policy.json"),
          JSON.stringify({ keep: ["a", "b"] })
        );
        FileSystem.writeFileSync(
          Path.join(Root, "pin-policy.json"),
          JSON.stringify({ keep: ["b", "c"] })
        );
        const stP = factory.State(
          ctx,
          { logFile: Ledger, policyFile: globalPolicy },
          { module: "f", policyFileName: "pin-policy.json" }
        );
        const keep1 = factory.ResolvePolicy(stP, proj, Path.join(Root, "registry.json"), [
          "leftpad"
        ]);
        assert.deepEqual(
          keep1,
          ["g", "a", "b", "c", "leftpad"],
          "union order: global \u2192 dir \u2192 found \u2192 chain"
        );
        const keep2 = factory.ResolvePolicy(stP, proj, null, ["zzz"]);
        assert.deepEqual(keep2, ["g", "a", "b", "zzz"], "no registry \u2192 no found-adjacent source");
        FileSystem.writeFileSync(globalPolicy, JSON.stringify({ keep: ["g", "a"] }));
        const keepOpt = factory.ResolvePolicy(st1, proj, null, [], {
          policyFileName: "pin-policy.json",
          policyFileField: "Policy"
        });
        assert.ok(
          keepOpt.includes("a") && keepOpt.includes("b"),
          "Options-parameterized lookup works on a State without PolicyName"
        );
        FileSystem.writeFileSync(globalPolicy, "{ nope");
        const keep3 = factory.ResolvePolicy(stP, proj, null, []);
        assert.deepEqual(keep3, ["a", "b"], "unreadable global skipped + logged");
        assert.ok(
          loggerLines.info.some(
            (m) => m.includes(
              `unreadable pin-policy.json at ${globalPolicy} \u2014 using built-in default`
            )
          ),
          "unreadable-policy line composed with the parameterized filename"
        );
      });
    }
  }
  {
    const Sub = "Discover: nearest-wins over multiple levels";
    {
      Check(Count, Sub, () => {
        const proj = Path.join(Root, "proj");
        const deeper = Path.join(proj, "deeper");
        FileSystem.mkdirSync(deeper, { recursive: true });
        FileSystem.writeFileSync(Path.join(proj, "registry.json"), JSON.stringify({ level: "near" }));
        assert.equal(Path.dirname(factory.Discover(deeper)), proj, "nearest registry.json wins");
        FileSystem.unlinkSync(Path.join(proj, "registry.json"));
      });
    }
  }
  {
    const Sub = "Parse: directory path contained to null";
    {
      Check(Count, Sub, () => {
        assert.equal(factory.Parse(Root), null);
      });
    }
  }
  {
    const Sub = "ResolvePolicy: configured-but-absent policy is silently not a source";
    {
      Check(Count, Sub, () => {
        const proj = Path.join(Root, "proj");
        try {
          FileSystem.unlinkSync(Path.join(proj, "pin-policy.json"));
        } catch {
        }
        try {
          FileSystem.unlinkSync(Path.join(Root, "pin-policy.json"));
        } catch {
        }
        const stQ = factory.State(
          ctx,
          { logFile: Ledger, policyFile: Path.join(Root, "nope-policy.json") },
          { module: "f", policyFileName: "pin-policy.json" }
        );
        if (!FileSystem.existsSync(Ledger)) {
          FileSystem.writeFileSync(Ledger, "");
        }
        const linesQ = FileSystem.readFileSync(Ledger, "utf8").split("\n").filter(Boolean).length;
        assert.deepEqual(factory.ResolvePolicy(stQ, proj, null, []), []);
        assert.equal(
          FileSystem.readFileSync(Ledger, "utf8").split("\n").filter(Boolean).length,
          linesQ,
          "absent global \u2192 no unreadable log"
        );
      });
    }
  }
  {
    const Sub = "Match: exact-segment equality";
    {
      Check(Count, Sub, () => {
        assert.equal(factory.Match("/a/b/package.json", ["package.json"]), true);
      });
    }
  }
  return Finish(Count, "Match-Discover-Policy");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Match-Discover-Policy`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

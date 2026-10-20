import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as Path from "node:path";
import { Check, EXCLUDE, Finish, Ledger, MakeCounter, NCU_BIN, TOOLS } from "../Harness.js";
import * as Governor from "../../../Target/Library.js";
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Sub = "entry: name/apply/Config/inject + the default object carries all four";
    {
      Check(Count, Sub, () => {
        assert.equal(Governor.name, "hook-dsh-governor-package");
        assert.equal(typeof Governor.apply, "function");
        assert.ok(Governor.Config, "Config schema exported");
        assert.deepEqual(Governor.inject, ["fs", "pluginFactory"], "inject = fs + pluginFactory");
        for (const k of ["name", "apply", "Config", "inject"])
          assert.ok(k in Governor.default, `default object carries ${k}`);
      });
    }
  }
  {
    const Sub = "consumption: the built Target resolves the factory through ctx EXCEPT the Config module's standalone Schema import";
    {
      Check(Count, Sub, () => {
        const GovernorDir = Path.resolve(import.meta.dirname, "../../..");
        const factoryImporters = [];
        const walk = (dir) => {
          if (dir.endsWith(Path.join("Target", "Test"))) return;
          for (const e of FileSystem.readdirSync(dir, { withFileTypes: true })) {
            const p = Path.join(dir, e.name);
            if (e.isDirectory()) walk(p);
            else if (p.endsWith(".js")) {
              const source = FileSystem.readFileSync(p, "utf8");
              if (source.includes("ets-plugin-dsh-factory")) factoryImporters.push(p);
            }
          }
        };
        walk(`${GovernorDir}/Target`);
        assert.deepEqual(
          factoryImporters,
          [Path.join(GovernorDir, "Target", "Variable", "Config.js")],
          "the ONLY factory import is the Config module's standalone Schema (module-load use)"
        );
      });
    }
  }
  {
    const Sub = "Config: volatile cells + defaults (factory.Schema shared-block parity)";
    {
      Check(Count, Sub, () => {
        const raw = Governor.Config({ logFile: Ledger });
        assert.equal(raw.logFile.get(), Ledger, "volatile logFile cell");
        assert.equal(raw.log.get(), true, "volatile log cell default true");
        assert.equal(raw["updateCooldownMs"].get(), 3e3, "volatile cooldown cell");
        assert.deepEqual(raw["mutationTools"].get(), TOOLS, "volatile mutationTools cell");
        assert.equal(raw["strict"], false);
        assert.equal(raw["maxUpdateFailures"], 3);
        assert.equal(raw["updateMode"], "programmatic");
        assert.equal(raw["ncuBin"], NCU_BIN);
        assert.equal(raw["policyFile"], "");
        assert.deepEqual(raw["exclude"], EXCLUDE);
      });
    }
  }
  return Finish(Count, "Entry-And-Config");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Entry-And-Config`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

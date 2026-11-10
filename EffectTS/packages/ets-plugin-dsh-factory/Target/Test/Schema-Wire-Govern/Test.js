import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
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
import Unwrap from "../../../Target/Function/Unwrap.js";
import SectionList from "../../../Target/Variable/Default.js";
const runTest = async () => {
  const Count = MakeCounter();
  const Fake = Make(null, { files: {} });
  const ctx = Fake.Context;
  const { events } = Fake;
  const Root = TempRoot("factory-smoke-");
  const Ledger = Path.join(Root, "ledger.log");
  const flavorLedger = Path.join(Root, "flavor-ledger.log");
  const factory = new FactoryClass(ctx);
  const volatileCell = { get: () => ["write", "edit"] };
  const proj = Path.join(Root, "proj");
  FileSystem.mkdirSync(proj, { recursive: true });
  const target = { targetKey: "k1", displayPath: Path.join(proj, "package.json") };
  const present = { kind: "present", version: "v1" };
  const actor = { name: "edit" };
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
    const Sub = "Schema: shared volatile fields, per-module defaults, module field slots, real validation + unwrap";
    {
      Check(Count, Sub, () => {
        const schema2 = factory.Schema({ logFile: flavorLedger });
        const order = Object.keys(schema2.dict ?? {});
        assert.deepEqual(order.slice(0, 6), [
          "log",
          "logFile",
          "updateCooldownMs",
          "mutationTools",
          "policyFile",
          "exclude"
        ]);
        for (const f of ["log", "logFile", "updateCooldownMs", "mutationTools"])
          assert.equal(schema2.dict[f].meta.volatile, true, `${f} volatile`);
        assert.equal(schema2.dict.logFile.meta.default, flavorLedger);
        assert.equal(schema2.dict.updateCooldownMs.meta.default, 3e3);
        assert.equal(schema2.dict.policyFile.meta.default, "");
        assert.deepEqual(schema2.dict.exclude.meta.default, SectionList);
        assert.equal(schema2.dict.exclude.meta.volatile, void 0, "exclude not volatile");
        const validated = schema2({});
        assert.equal(
          validated.logFile.get(),
          flavorLedger,
          "volatile logFile validates to a cell with the default"
        );
        assert.equal(validated.policyFile, "", "non-volatile policyFile validates to the plain default");
        const unwrapped = Unwrap(validated);
        assert.deepEqual(
          unwrapped.mutationTools,
          ["write", "edit", "str_replace_editor", "raw-write"],
          "volatile cell unwrapped by State machinery"
        );
        assert.equal(unwrapped.log, true);
      });
    }
  }
  {
    const Sub = "Schema: module field slots appended verbatim";
    {
      Check(Count, Sub, () => {
        const flavorField = factory.Schema({}, {}).dict.exclude;
        const schema3 = factory.Schema({ logFile: flavorLedger }, { sections: flavorField });
        assert.equal(
          Object.keys(schema3.dict).at(-1),
          "sections",
          "module field appended after the shared block"
        );
        assert.deepEqual(schema3.dict.sections.meta.default, SectionList);
        assert.equal(
          schema3.dict.sections.meta.volatile,
          void 0,
          "module fields keep their own volatility"
        );
      });
    }
  }
  {
    const Sub = "Wire: fiber-owned fs/observed registration + module-supplied activation proof";
    {
      Check(Count, Sub, () => {
        events.length = 0;
        let observed = null;
        factory.Wire(ctx, st1, (t, o, a) => {
          observed = [t, o, a];
        });
        assert.equal(events.at(-1)[0], "fs/observed");
        events.at(-1)[1](target, present, actor);
        assert.deepEqual(observed, [target, present, actor]);
        factory.Append(st1, "activated (smoke)");
        assert.ok(FileSystem.readFileSync(Ledger, "utf8").includes("activated (smoke)"));
      });
    }
  }
  {
    const Sub = "Govern: the direct-govern registry \u2014 RegisterGovern storage, selection resolution (true/all/array/name/false), basename routing, per-step containment, in-place re-registration";
    {
      await CheckAsync(Count, Sub, async () => {
        assert.deepEqual(factory.GovernSteps, {}, "the registry starts empty");
        {
          const goTarget = { targetKey: "k-gov", displayPath: Path.join(proj, "package.json") };
          const actor2 = { name: "edit" };
          await assert.doesNotReject(
            () => factory.Govern(goTarget, true, actor2, "v1"),
            "empty registry: governed no-op"
          );
          assert.equal(
            Object.keys(factory.GovernSteps).length,
            0,
            "empty registry: nothing registered by Govern itself"
          );
          const ran = [];
          const step = (name) => (t, act, ver) => ran.push([name, t.displayPath, act, ver]);
          factory.RegisterGovern("package.json", "first", step("first"));
          factory.RegisterGovern("package.json", "second", step("second"));
          factory.RegisterGovern("Cargo.toml", "cargo", step("cargo"));
          assert.deepEqual(
            factory.GovernSteps["package.json"].map((s) => s.name),
            ["first", "second"],
            "RegisterGovern: steps stored per basename in registration order"
          );
          assert.deepEqual(
            factory.GovernSteps["Cargo.toml"].map((s) => s.name),
            ["cargo"],
            "RegisterGovern: basenames are independent"
          );
          ran.length = 0;
          await factory.Govern(goTarget, true, actor2, "v1");
          assert.deepEqual(
            ran.map((r) => r[0]),
            ["first", "second"],
            "Govern: true \u2192 every registered step"
          );
          assert.deepEqual(
            ran.map((r) => r[2]),
            [actor2, actor2],
            "Govern: steps receive the actor"
          );
          assert.deepEqual(
            ran.map((r) => r[3]),
            ["v1", "v1"],
            "Govern: steps receive the version"
          );
          assert.deepEqual(
            ran.map((r) => r[1]),
            [goTarget.displayPath, goTarget.displayPath],
            "Govern: steps receive the target"
          );
          ran.length = 0;
          await factory.Govern(goTarget, ["second", "nope"], actor2, "v2");
          assert.deepEqual(
            ran.map((r) => r[0]),
            ["second"],
            "Govern: array \u2192 the named subset, unknown names ignored"
          );
          assert.deepEqual(
            ran.map((r) => r[3]),
            ["v2"],
            "Govern: the subset received the version"
          );
          ran.length = 0;
          await factory.Govern(goTarget, "first", actor2, "v3");
          assert.deepEqual(
            ran.map((r) => r[0]),
            ["first"],
            "Govern: a single name selects that step"
          );
          ran.length = 0;
          await factory.Govern(goTarget, "nope", actor2, "v3");
          await factory.Govern(goTarget, ["nope"], actor2, "v3");
          assert.deepEqual(ran, [], "Govern: an unknown-only selection runs nothing");
          for (const None of [false, null, void 0]) {
            ran.length = 0;
            await factory.Govern(goTarget, None, actor2, "v3");
            assert.deepEqual(ran, [], `Govern: ${String(None)} \u2192 no governance`);
          }
          ran.length = 0;
          await factory.Govern(
            { targetKey: "k-toml", displayPath: Path.join(proj, "Cargo.toml") },
            true,
            actor2,
            "v4"
          );
          assert.deepEqual(
            ran.map((r) => r[0]),
            ["cargo"],
            "Govern: basename resolution (package.json steps not fired for Cargo.toml)"
          );
          factory.RegisterGovern("package.json", "boom", () => {
            throw new Error("step boom");
          });
          ran.length = 0;
          await assert.doesNotReject(
            () => factory.Govern(goTarget, true, actor2, "v5"),
            "a throwing step never propagates"
          );
          assert.deepEqual(
            ran.map((r) => r[0]),
            ["first", "second"],
            "Govern: the steps after the throwing one still ran (per-step containment)"
          );
          factory.RegisterGovern("package.json", "first", step("first2"));
          assert.deepEqual(
            factory.GovernSteps["package.json"].map((s) => s.name),
            ["first", "second", "boom"],
            "RegisterGovern: same-name re-registration replaces in place (position preserved, no duplicate)"
          );
          ran.length = 0;
          await factory.Govern(goTarget, "first", actor2, "v6");
          assert.deepEqual(
            ran.map((r) => r[0]),
            ["first2"],
            "RegisterGovern: the replaced closure is the one that runs"
          );
        }
      });
    }
  }
  return Finish(Count, "Schema-Wire-Govern");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Schema-Wire-Govern`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

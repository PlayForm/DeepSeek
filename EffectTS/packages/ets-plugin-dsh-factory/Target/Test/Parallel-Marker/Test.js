import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as Path from "node:path";
import {
  CheckAsync,
  Finish,
  MakeCounter,
  Make,
  TempRoot,
  FactoryClass
} from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  const P = Make(null, { files: {} });
  const factoryP = new FactoryClass(P.Context);
  const Root = TempRoot("factory-smoke-");
  const dirP = Path.join(Root, "proj-parallel");
  FileSystem.mkdirSync(dirP);
  const targetP = { targetKey: "k-par", displayPath: Path.join(dirP, "package.json") };
  const fileA = Path.join(dirP, "parallel-a.txt");
  const fileB = Path.join(dirP, "parallel-b.txt");
  const fileC = Path.join(dirP, "parallel-c.txt");
  const eventsP = [];
  const actor = { name: "edit" };
  const step = (name, file, delay) => async () => {
    eventsP.push(`${name}:start`);
    if (delay > 0) await new Promise((r) => setTimeout(r, delay));
    FileSystem.writeFileSync(file, `${name}
`);
    eventsP.push(`${name}:done`);
  };
  factoryP.RegisterGovern("package.json", "par-a", step("par-a", fileA, 25));
  factoryP.RegisterGovern("package.json", "par-b", step("par-b", fileB, 15));
  factoryP.RegisterGovern("package.json", "par-c", step("par-c", fileC, 10));
  {
    const Sub = "#14 parallel: the `{ steps, parallel }` marker is accepted and both disjoint-safe steps run and settle";
    {
      await CheckAsync(Count, Sub, async () => {
        await assert.doesNotReject(
          () => factoryP.Govern(targetP, { steps: ["par-a", "par-b"], parallel: true }, actor, "v-par"),
          "the marker form is accepted"
        );
        assert.equal(
          FileSystem.readFileSync(fileA, "utf8"),
          "par-a\n",
          "parallel: step a's effect settled (its file written)"
        );
        assert.equal(
          FileSystem.readFileSync(fileB, "utf8"),
          "par-b\n",
          "parallel: step b's effect settled (its file written)"
        );
      });
    }
  }
  {
    const Sub = "#14 parallel: real unbounded overlap \u2014 both steps started before either finished";
    {
      await CheckAsync(Count, Sub, async () => {
        eventsP.length = 0;
        await factoryP.Govern(targetP, { steps: ["par-a", "par-b"], parallel: true }, actor, "v-par2");
        const firstDone = Math.min(
          ...["par-a:done", "par-b:done"].map((m) => eventsP.indexOf(m)).filter((i) => i >= 0)
        );
        assert.equal(
          eventsP.slice(0, firstDone).filter((e) => e.endsWith(":start")).length,
          2,
          "parallel: both steps started before either finished (unbounded concurrency)"
        );
        assert.equal(
          FileSystem.existsSync(fileA) && FileSystem.existsSync(fileB),
          true,
          "parallel: both steps settled again"
        );
      });
    }
  }
  {
    const Sub = "#14 parallel: the inner selection still applies \u2014 array and single-name forms run only the selected steps";
    {
      await CheckAsync(Count, Sub, async () => {
        FileSystem.rmSync(fileB, { force: true });
        eventsP.length = 0;
        await factoryP.Govern(targetP, { steps: ["par-a"], parallel: true }, actor, "v-par3");
        assert.equal(
          eventsP.includes("par-a:start"),
          true,
          "parallel + inner selection: the selected step ran"
        );
        assert.equal(
          eventsP.includes("par-b:start"),
          false,
          "parallel + inner selection: the unselected step did not run"
        );
        assert.equal(
          FileSystem.existsSync(fileB),
          false,
          "parallel + inner selection: the unselected step's effect is absent"
        );
        eventsP.length = 0;
        await factoryP.Govern(targetP, { steps: "par-b", parallel: true }, actor, "v-par4");
        assert.deepEqual(
          eventsP,
          ["par-b:start", "par-b:done"],
          "parallel: single-name inner selection runs just that step"
        );
      });
    }
  }
  {
    const Sub = "#14 parallel: the object form WITHOUT the marker keeps the sequential fold (each step completes before the next starts)";
    {
      await CheckAsync(Count, Sub, async () => {
        eventsP.length = 0;
        FileSystem.rmSync(fileA, { force: true });
        FileSystem.rmSync(fileB, { force: true });
        await factoryP.Govern(targetP, { steps: ["par-a", "par-b"] }, actor, "v-par5");
        assert.deepEqual(
          eventsP,
          ["par-a:start", "par-a:done", "par-b:start", "par-b:done"],
          "object form without the marker: the sequential fold (each step completes before the next starts)"
        );
        assert.equal(
          FileSystem.existsSync(fileA) && FileSystem.existsSync(fileB),
          true,
          "sequential object form: both steps settled"
        );
      });
    }
  }
  {
    const Sub = "#14 parallel: containment \u2014 a throwing step never propagates and the other step still runs and settles";
    {
      await CheckAsync(Count, Sub, async () => {
        factoryP.RegisterGovern("package.json", "par-boom", () => {
          throw new Error("parallel boom");
        });
        FileSystem.rmSync(fileB, { force: true });
        eventsP.length = 0;
        await assert.doesNotReject(
          () => factoryP.Govern(
            targetP,
            { steps: ["par-boom", "par-b"], parallel: true },
            actor,
            "v-par6"
          ),
          "parallel: a throwing step never propagates"
        );
        assert.equal(
          FileSystem.readFileSync(fileB, "utf8"),
          "par-b\n",
          "parallel: the step after the throwing one still ran and settled"
        );
      });
    }
  }
  {
    const Sub = "#14 parallel: `steps: true` / `steps: 'all'` run every registered step, the throwing one contained";
    {
      await CheckAsync(Count, Sub, async () => {
        FileSystem.rmSync(fileA, { force: true });
        FileSystem.rmSync(fileB, { force: true });
        FileSystem.rmSync(fileC, { force: true });
        await assert.doesNotReject(
          () => factoryP.Govern(targetP, { steps: true, parallel: true }, actor, "v-par7"),
          "parallel: `steps: true` accepted (all registered steps)"
        );
        assert.equal(
          FileSystem.existsSync(fileA) && FileSystem.existsSync(fileB) && FileSystem.existsSync(fileC),
          true,
          "parallel: all three registered steps' effects settled"
        );
        await assert.doesNotReject(
          () => factoryP.Govern(targetP, { steps: "all", parallel: true }, actor, "v-par8"),
          "parallel: `steps: 'all'` accepted"
        );
      });
    }
  }
  {
    const Sub = "#14 parallel: false/null/undefined inner selections stay no-ops in the marker form";
    {
      await CheckAsync(Count, Sub, async () => {
        eventsP.length = 0;
        for (const None of [false, null, void 0]) {
          await factoryP.Govern(targetP, { steps: None, parallel: true }, actor, "v-par9");
        }
        assert.deepEqual(eventsP, [], "parallel: false/null/undefined inner selections run nothing");
      });
    }
  }
  return Finish(Count, "Parallel-Marker");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Parallel-Marker`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

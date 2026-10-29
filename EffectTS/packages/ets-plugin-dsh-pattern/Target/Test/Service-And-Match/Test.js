import assert from "node:assert/strict";
import {
  Check,
  Finish,
  Make,
  MakeCounter,
  Messages,
  PatternService
} from "../Harness.js";
const Pattern = (Id, Keywords, Extra = {}) => ({
  id: Id,
  intent: Id,
  trigger: { keywords: Keywords },
  targets: [],
  transform: [],
  arbiter: "test",
  confidence: 0.5,
  allowlist: false,
  updatedAt: 0,
  ...Extra
});
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Make();
    Check(Count, "S1: the class form registers the service instance under `pattern`", () => {
      assert.equal(Run.Provided["pattern"], Run.Service);
      assert.equal(Run.Service.name, "pattern");
      assert.equal(Run.Service.ctx, Run.Context);
    });
    Check(Count, "S1: the loader contract - the Config static and the empty inject static", () => {
      assert.ok(PatternService.Config !== void 0);
      assert.deepEqual(PatternService.inject, []);
      assert.equal(typeof PatternService.Config, "function");
    });
    Check(Count, "S1: the cold start seeds the static catalog - never an empty registry", () => {
      assert.deepEqual(
        Run.Service.List().map((P) => P.id),
        ["rename", "search", "test-update", "version-bump"]
      );
    });
    Check(Count, "S1: the activation line is byte-exact", () => {
      assert.deepEqual(Run.Lines, ["pattern: activated (seeded 4 patterns) (logFile ~/.dsh/playform/ets-plugin-dsh-pattern.log)"]);
    });
  }
  {
    const Run = Make();
    Check(Count, "S2: Get returns the stored pattern and undefined for unknown ids", () => {
      assert.equal(Run.Service.Get("version-bump").confidence, 0.5);
      assert.equal(Run.Service.Get("nope"), void 0);
    });
    Check(Count, "S2: Put is idempotent by id - a re-Put replaces, never duplicates", () => {
      Run.Service.Put(Pattern("version-bump", ["version"], { confidence: 0.9 }));
      assert.equal(Run.Service.List().length, 4);
      assert.equal(Run.Service.Get("version-bump").confidence, 0.9);
    });
    Check(Count, "S2: List is sorted by id for a deterministic output", () => {
      Run.Service.Put(Pattern("aaa", ["x"]));
      assert.deepEqual(
        Run.Service.List().map((P) => P.id),
        ["aaa", "rename", "search", "test-update", "version-bump"]
      );
    });
  }
  {
    const Run = Make();
    Check(Count, "S3: the keyword overlap weighs 0.6 and the confidence 0.2 - exact score", () => {
      const Matched = Run.Service.Match({ text: "please bump the version" });
      assert.equal(Matched.length, 1);
      assert.equal(Matched[0].pattern.id, "version-bump");
      assert.ok(Math.abs(Matched[0].score - 0.5) < 1e-12);
    });
    Check(Count, "S3: the trigger's tool match weighs 0.2 - exact score", () => {
      const Without = Run.Service.Match({ text: "find it", tool: "grep" });
      const With = Run.Service.Match({ text: "find it", tool: "search" });
      assert.equal(With[0].pattern.id, "search");
      assert.ok(Math.abs(With[0].score - 0.5) < 1e-12);
      assert.deepEqual(Without, []);
    });
    Check(Count, "S3: a score below matchThreshold abstains - the EMPTY result, never a guess", () => {
      assert.deepEqual(Run.Service.Match({ text: "unrelated chatter" }), []);
    });
    Check(Count, "S3: ambiguity - the top two within epsilon abstain", () => {
      Run.Service.Put(Pattern("dup-a", ["alpha"]));
      Run.Service.Put(Pattern("dup-b", ["alpha"]));
      assert.deepEqual(Run.Service.Match({ text: "alpha" }), []);
    });
    Check(Count, "S3: maxMatches caps the result; ties break by id", () => {
      Run.Service.Configure({ maxMatches: 1 });
      Run.Service.Put(Pattern("tie-a", ["shared"]));
      Run.Service.Put(Pattern("tie-b", ["shared"]));
      Run.Service.Configure({ ambiguityEpsilon: 0 });
      const Matched = Run.Service.Match({ text: "shared" });
      assert.equal(Matched.length, 1);
      assert.equal(Matched[0].pattern.id, "tie-a");
    });
    Check(Count, "S3: a disabled service abstains to the empty result", () => {
      Run.Service.Configure({ enabled: false });
      assert.deepEqual(Run.Service.Match({ text: "please bump the version" }), []);
      assert.deepEqual(Messages(Run), ["pattern: activated (seeded 4 patterns)"]);
    });
  }
  return Finish(Count, "Service-And-Match");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Service-And-Match`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

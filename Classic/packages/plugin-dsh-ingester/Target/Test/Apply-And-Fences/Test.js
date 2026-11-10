import assert from "node:assert/strict";
import {
  Build,
  Check,
  CheckAsync,
  Decision,
  Finish,
  Journal,
  MakeCounter,
  Proposal,
  Sha
} from "../Harness.js";
const A = "/repo/a.txt";
const B = "/repo/b.txt";
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Build({}, { [A]: "hello world", [B]: "keep" });
    const Result = await Run.Ingester.Apply(
      Proposal("p1", [{ path: A, version: Sha("hello world"), why: "w" }], [
        { path: A, find: "world", replace: "there", why: "w" }
      ]),
      Decision("p1")
    );
    await CheckAsync(Count, "A1: the fenced edit applies and reports the new version", async () => {
      assert.equal(Result.applied, 1);
      assert.equal(Result.conflicts, 0);
      assert.equal(Result.recovery, 0);
      assert.deepEqual(Result.perTarget, [{ path: A, outcome: "applied", version: Sha("hello there") }]);
      assert.equal(Run.Files[A], "hello there");
      assert.equal(Run.Files[B], "keep");
    });
    Check(Count, "A1: the applied outcome is journaled with the version detail", () => {
      assert.deepEqual(
        Journal().map((Line) => [Line.event, Line.proposal, Line.path, Line.detail]),
        [["applied", "p1", A, `version ${Sha("hello there")}`]]
      );
    });
  }
  {
    const Run = Build(
      {},
      { [A]: "changed since prepare", [B]: "untouched" }
    );
    const Result = await Run.Ingester.Apply(
      Proposal(
        "p1",
        [
          { path: A, version: Sha("the prepared content"), why: "w" },
          { path: B, version: Sha("untouched"), why: "w" }
        ],
        [
          { path: A, find: "changed", replace: "x", why: "w" },
          { path: B, find: "untouched", replace: "y", why: "w" }
        ]
      ),
      Decision("p1")
    );
    Check(Count, "A2: a changed content is a conflict, not a silent overwrite", () => {
      assert.deepEqual(Result.perTarget, [{ path: A, outcome: "conflict" }]);
      assert.equal(Result.conflicts, 1);
      assert.equal(Result.applied, 0);
      assert.equal(Run.Files[A], "changed since prepare");
    });
    Check(Count, "A2: stopOnConflict stops at the first conflict (B never resolved)", () => {
      assert.deepEqual(Run.Fs.resolved, [A]);
      assert.equal(Journal()[0].detail, "content changed since prepare");
      assert.deepEqual(Journal().map((Line) => Line.path), [A]);
    });
  }
  {
    const Run = Build({}, { [B]: "present" });
    const Result = await Run.Ingester.Apply(
      Proposal("p1", [{ path: A, version: "v", why: "w" }], [
        { path: A, find: "x", replace: "y", why: "w" }
      ]),
      Decision("p1")
    );
    Check(Count, "A3: an absent target conflicts with the byte-exact reason", () => {
      assert.deepEqual(Result.perTarget, [{ path: A, outcome: "conflict" }]);
      assert.deepEqual(
        Journal().map((Line) => [Line.event, Line.detail]),
        [["conflict", "target absent"]]
      );
    });
  }
  {
    const Run = Build({}, { [A]: "current text" });
    const Result = await Run.Ingester.Apply(
      Proposal("p1", [{ path: A, version: Sha("current text"), why: "w" }], [
        { path: A, find: "stale match", replace: "new", why: "w" }
      ]),
      Decision("p1")
    );
    Check(Count, "A4: an operation that no longer matches conflicts with its count", () => {
      assert.deepEqual(Result.perTarget, [{ path: A, outcome: "conflict" }]);
      assert.deepEqual(
        Journal().map((Line) => Line.detail),
        ["1 operation(s) no longer match"]
      );
    });
    const NoOps = Build({}, { [A]: "current text" });
    const R2 = await NoOps.Ingester.Apply(
      Proposal(
        "p2",
        [{ path: A, version: Sha("current text"), why: "w" }],
        [{ path: "/repo/other.txt", find: "x", replace: "y", why: "w" }]
      ),
      Decision("p2")
    );
    Check(Count, "A4: a target with no operations of its own conflicts", () => {
      assert.deepEqual(R2.perTarget, [{ path: A, outcome: "conflict" }]);
      assert.ok(Journal().some((Line) => Line.detail === "no operations for target"));
    });
  }
  {
    const Run = Build({}, { [A]: "hello" }, true);
    const Result = await Run.Ingester.Apply(
      Proposal("p1", [{ path: A, version: Sha("hello"), why: "w" }], [
        { path: A, find: "hello", replace: "hi", why: "w" }
      ]),
      Decision("p1")
    );
    Check(Count, "A5: a fs edit failure is recovery-required with the error detail", () => {
      assert.deepEqual(Result.perTarget, [{ path: A, outcome: "recovery-required" }]);
      assert.equal(Result.recovery, 1);
      assert.ok(Journal()[0].detail.includes("FS_STALE_VERSION"));
      assert.equal(Journal()[0].event, "recovery-required");
      assert.equal(Run.Files[A], "hello");
    });
  }
  {
    const Run = Build(
      { stopOnConflict: false },
      { [A]: "changed", [B]: "good content" }
    );
    const Result = await Run.Ingester.Apply(
      Proposal(
        "p1",
        [
          { path: A, version: Sha("prepared-a"), why: "w" },
          { path: B, version: Sha("good content"), why: "w" }
        ],
        [
          { path: A, find: "changed", replace: "x", why: "w" },
          { path: B, find: "good", replace: "better", why: "w" }
        ]
      ),
      Decision("p1")
    );
    Check(Count, "A6: with stopOnConflict=false the run continues and reports each target", () => {
      assert.deepEqual(Result.perTarget, [
        { path: A, outcome: "conflict" },
        { path: B, outcome: "applied", version: Sha("better content") }
      ]);
      assert.equal(Result.conflicts, 1);
      assert.equal(Result.applied, 1);
      assert.equal(Run.Files[B], "better content");
    });
  }
  {
    const Run = Build({}, { [A]: "one two three" });
    const Result = await Run.Ingester.Apply(
      Proposal("p1", [{ path: A, version: Sha("one two three"), why: "w" }], [
        { path: A, find: "one", replace: "1", why: "w" },
        { path: A, find: "two", replace: "2", why: "w" }
      ]),
      Decision("p1")
    );
    Check(Count, "A7: chained operations each receive the previous version", () => {
      assert.deepEqual(
        Run.Fs.edits.map((E) => E.version),
        [Sha("one two three"), Sha("1 two three")]
      );
      assert.equal(Run.Files[A], "1 2 three");
      assert.equal(Result.perTarget[0].version, Sha("1 2 three"));
    });
    const Bounded = Build({ maxTargets: 1 }, { [A]: "one", [B]: "two" });
    const R2 = await Bounded.Ingester.Apply(
      Proposal(
        "p2",
        [
          { path: A, version: Sha("one"), why: "w" },
          { path: B, version: Sha("two"), why: "w" }
        ],
        [
          { path: A, find: "one", replace: "ONE", why: "w" },
          { path: B, find: "two", replace: "TWO", why: "w" }
        ]
      ),
      Decision("p2")
    );
    Check(Count, "A7: maxTargets bounds the run to the first targets", () => {
      assert.deepEqual(R2.perTarget, [{ path: A, outcome: "applied", version: Sha("ONE") }]);
      assert.equal(Bounded.Files[B], "two");
    });
  }
  return Finish(Count, "Apply-And-Fences");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Apply-And-Fences`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

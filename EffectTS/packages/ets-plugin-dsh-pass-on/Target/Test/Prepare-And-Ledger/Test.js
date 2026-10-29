import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as Path from "node:path";
import Digest from "../../../Target/Function/Digest.js";
import {
  Check,
  Finish,
  LedgerLines,
  LedgerWith,
  Make,
  MakeCounter,
  Root,
  Seed,
  VersionOf,
  rm
} from "../Harness.js";
const Setup = (Raw = {}) => {
  rm();
  return Make({ enabled: true, ...Raw });
};
const Bump = (Run, Targets, Version) => Run.Instance.Prepare({ kind: "version-bump", targets: Targets, params: { version: Version } });
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Full = Seed("bump/pkg.json", '{"name": "b", "version": "1.0.0"}');
    const Run = Setup();
    const Proposal = Bump(Run, [Full], "2.0.0");
    const Version = await VersionOf(Full);
    const Operations = [{ find: '"version": "1.0.0"', replace: '"version": "2.0.0"', why: "version 1.0.0 -> 2.0.0" }];
    Check(Count, "P1: the target carries the exact path, version token and why", () => {
      assert.deepEqual(Proposal.targets, [
        { path: Full, version: Version, why: "version 1.0.0 -> 2.0.0" }
      ]);
    });
    Check(Count, "P1: the operation is the exact find/replace", () => {
      assert.deepEqual(Proposal.operations, [{ path: Full, ...Operations[0] }]);
    });
    Check(Count, "P1: the digest is the plugin's own sha256 over targets and operations", () => {
      assert.equal(Proposal.digest, Digest(Proposal.targets, Operations));
      assert.equal(Proposal.id, Proposal.digest.slice(0, 12));
    });
    Check(Count, "P1: the intent, revision and timestamps are stamped", () => {
      assert.deepEqual(Proposal.intent, { kind: "version-bump", params: { version: "2.0.0" } });
      assert.equal(Proposal.revision, 1);
      assert.equal(Proposal.createdAt, Proposal.createdAt);
      assert.equal(Proposal.expiresAt > Proposal.createdAt, true);
      assert.equal(Proposal.expiresAt - Proposal.createdAt, 36e5);
    });
  }
  {
    const Full = Seed("journal/pkg.json", '{"name":"j","version":"1.0.0"}');
    const Run = Setup();
    const Proposal = Bump(Run, [Full], "2.0.0");
    Check(Count, "P2: the journal line is the exact JSON with the plugin's fields", () => {
      const Matched = LedgerLines().filter(
        (Line) => new RegExp(
          `^\\{"at":\\d+,"event":"prepared","proposal":"${Proposal.id}","digest":"${Proposal.digest}","targets":1,"note":"prepared 1 targets"\\}$`
        ).test(Line)
      );
      assert.equal(Matched.length, 1);
      assert.equal(LedgerWith('"event":"prepared"').length, 1);
    });
  }
  {
    const Full = Seed("get/pkg.json", '{"name":"g","version":"1.0.0"}');
    const Run = Setup();
    const Proposal = Bump(Run, [Full], "2.0.0");
    Check(Count, "P3: Get returns the stored proposal for its id", () => {
      assert.equal(Run.Instance.Get(Proposal.id), Proposal);
    });
    Run.State.Proposals.get(Proposal.id).expiresAt = Date.now() - 1;
    Check(Count, "P3: an expired proposal reads as null, never resurrected", () => {
      assert.equal(Run.Instance.Get(Proposal.id), null);
    });
  }
  {
    const Full = Seed("noop/pkg.json", '{"name":"n","version":"1.0.0"}');
    const Run = Setup();
    Check(Count, "P4: an already-applied version prepares nothing (never an empty batch)", () => {
      assert.equal(Bump(Run, [Full], "1.0.0"), null);
      assert.equal(LedgerWith('"note":"rejected version-bump"').length, 1);
    });
    Check(Count, "P4: an unknown kind is rejected", () => {
      assert.equal(Run.Instance.Prepare({ kind: "teleport", targets: [Full] }), null);
      assert.equal(LedgerWith('"note":"rejected teleport"').length, 1);
    });
    Check(Count, "P4: a kind with no resolvable targets is rejected", () => {
      assert.equal(Run.Instance.Prepare({ kind: "replace", params: { find: "a", replace: "b" } }), null);
      assert.equal(LedgerWith('"note":"rejected replace"').length, 1);
    });
    Check(Count, "P4: a null intent is rejected", () => {
      assert.equal(Run.Instance.Prepare(null), null);
    });
  }
  {
    const Full = Seed("replace/notes.txt", "the foo stays");
    const Run = Setup();
    const Proposal = Run.Instance.Prepare({
      kind: "replace",
      targets: [Full],
      params: { find: "foo", replace: "bar" }
    });
    Check(Count, "P5: the literal replace operation and its why", () => {
      assert.deepEqual(Proposal?.operations, [
        { path: Full, find: "foo", replace: "bar", why: "literal replace (3 bytes)" }
      ]);
    });
  }
  {
    Seed("walk/src/package.json", '{"version":"1.0.0"}');
    Seed("walk/lib/package.json", '{"version":"1.0.0"}');
    Seed("walk/node_modules/package.json", '{"version":"1.0.0"}');
    const Run = Setup();
    const Proposal = Run.Instance.Prepare({ kind: "version-bump", params: { version: "2.0.0" } });
    Check(Count, "P6: the walk finds the workspace packages and skips node_modules", () => {
      assert.deepEqual(
        (Proposal?.targets ?? []).map((Target) => Path.relative(Root, Target.path)),
        ["walk/lib/package.json", "walk/src/package.json"]
      );
    });
    const Capped = Setup({ maxTargets: 1 });
    const CappedProposal = Capped.Instance.Prepare({
      kind: "version-bump",
      params: { version: "2.0.0" }
    });
    Check(Count, "P6: the walk is capped at maxTargets", () => {
      assert.equal(CappedProposal?.targets.length, 1);
    });
  }
  {
    const Full = Seed("preview/pkg.json", `{"pad": "${"x".repeat(200)}", "version": "1.0.0"}`);
    const Run = Setup({ maxPreviewBytes: 20 });
    const Proposal = Bump(Run, [Full], "2.0.0");
    Check(Count, "P7: the preview is the matched region capped with the marker", () => {
      assert.equal(Proposal?.preview.length, 1);
      assert.equal(Proposal?.preview[0].path, Full);
      assert.equal(Proposal?.preview[0].before.length, 32);
      assert.equal(Proposal?.preview[0].after.length, 32);
      assert.equal(Proposal?.preview[0].before.endsWith("... [capped]"), true);
      assert.equal(Proposal?.preview[0].after.endsWith("... [capped]"), true);
    });
  }
  {
    const Full = Seed("determinism/pkg.json", '{"name":"m","version":"1.0.0"}');
    const Run = Setup();
    const First = Bump(Run, [Full], "2.0.0");
    const Second = Bump(Run, [Full], "2.0.0");
    Check(Count, "P8: preparing the same intent twice yields the same id", () => {
      assert.equal(Second?.id, First?.id);
      assert.equal(Second?.digest, First?.digest);
    });
  }
  {
    const Content = '{"name":"r","version":"1.0.0"}';
    const Full = Seed("readonly/pkg.json", Content);
    const Run = Setup();
    Bump(Run, [Full], "2.0.0");
    Check(Count, "P9: the target file is untouched - only the journal is written", () => {
      assert.equal(FileSystem.readFileSync(Full, "utf8"), Content);
      const Created = FileSystem.readdirSync(Path.join(Root, "readonly"));
      assert.deepEqual(Created, ["pkg.json"]);
      assert.equal(LedgerWith('"event":"prepared"').length, 1);
    });
  }
  return Finish(Count, "Prepare-And-Ledger");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Prepare-And-Ledger`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

import assert from "node:assert/strict";
import {
  Check,
  CheckAsync,
  Finish,
  Ledger,
  LinesWith,
  Make,
  MakeCounter,
  rm,
  Seed,
  Validate
} from "../Harness.js";
const Defaults = {
  read: "auto",
  index: "auto",
  record: "auto",
  suggest: "auto",
  write: "approve",
  commit: "approve",
  spawn: "approve",
  message: "auto"
};
const PATH = "/repo/src/a.ts";
const CONTENT = "export const alpha = 1;\nexport const beta = 2;\nexport const gamma = 3;\n";
const Mount = (Config = {}) => {
  rm();
  return Make(Validate({ logFile: Ledger, enabled: true, ...Config }), Seed({ [PATH]: CONTENT }));
};
const Replace = { kind: "replace", path: PATH, startLine: 1, endLine: 1, text: "export const delta = 1;" };
const Rename = {
  kind: "rename",
  path: PATH,
  startLine: 1,
  endLine: 1,
  oldName: "alpha",
  newName: "delta"
};
const runTest = async () => {
  const Count = MakeCounter();
  {
    Check(Count, "P1: the service's schema fills the D6 policy defaults", () => {
      const Config = Validate({ logFile: Ledger });
      assert.deepEqual(Config.policy.get(), Defaults, "the composed block carries the defaults");
    });
    Check(Count, "P1: the built State carries the block on Allow", () => {
      const Run = Mount();
      assert.deepEqual(Run.State.Allow, Defaults, "the apply maps policy -> Allow");
    });
    Check(Count, "P1: a policy override lands on the built State", () => {
      const Run = Mount({ policy: { write: "auto" } });
      assert.deepEqual(
        Run.State.Allow,
        { ...Defaults, write: "auto" },
        "the override replaces write and keeps the rest"
      );
    });
  }
  {
    const Run = Mount();
    const Reply = await Run.Context.workspaceReflect.replace(Replace);
    await CheckAsync(Count, "P2: an approve verdict refuses the replace with the exact line", async () => {
      assert.deepEqual(Reply, {
        status: "rejected",
        detail: "the policy holds the replace (write=approve)",
        version: void 0
      });
      assert.deepEqual(LinesWith(Run, "replace held"), [
        `reflect: replace held ${PATH} (policy write=approve)`
      ]);
    });
    await CheckAsync(Count, "P2: the held replace never touches the file", async () => {
      assert.equal(Run.Fs.writes.length, 0, "zero writes");
      assert.equal(Run.Fs.reads.length, 0, "the file is not even read");
      assert.equal(Run.Fs.files[PATH], CONTENT, "the bytes are unchanged");
    });
    await CheckAsync(Count, "P2: an approve verdict refuses the rename with the exact line", async () => {
      const Renamed = await Run.Context.workspaceReflect.rename(Rename);
      assert.deepEqual(Renamed, {
        status: "rejected",
        detail: "the policy holds the rename (write=approve)",
        version: void 0
      });
      assert.deepEqual(LinesWith(Run, "rename held"), [
        `reflect: rename held ${PATH} (policy write=approve)`
      ]);
      assert.equal(Run.Fs.writes.length, 0, "still zero writes");
    });
  }
  {
    const Run = Mount({ policy: { write: "auto" } });
    const Replaced = await Run.Context.workspaceReflect.replace(Replace);
    await CheckAsync(Count, "P3: an auto verdict proceeds to the write path", async () => {
      assert.equal(Replaced.status, "applied", "the replace lands");
      assert.equal(Run.Fs.writes.length, 1, "exactly one write");
      assert.equal(Run.Fs.files[PATH].split("\n")[0], "export const delta = 1;");
      assert.equal(LinesWith(Run, "held").length, 0, "no held line when the gate is open");
    });
    await CheckAsync(Count, "P3: the rename proceeds on the same open gate", async () => {
      const Renamed = await Run.Context.workspaceReflect.rename({
        ...Rename,
        oldName: "beta",
        newName: "omega",
        startLine: 2,
        endLine: 2
      });
      assert.equal(Renamed.status, "applied", "the rename lands");
      assert.ok(
        LinesWith(Run, "rename").includes(`reflect: rename ${PATH} beta -> omega (applied)`),
        "the rename line"
      );
    });
  }
  {
    const Run = Mount({ policy: { commit: "auto" } });
    const Reply = await Run.Context.workspaceReflect.replace(Replace);
    await CheckAsync(Count, "P4: a commit override never opens the write gate", async () => {
      assert.equal(Reply.status, "rejected", "the replace is still held");
      assert.ok(
        LinesWith(Run, "replace held").includes(
          `reflect: replace held ${PATH} (policy write=approve)`
        ),
        "the documented held line"
      );
      assert.equal(Run.Fs.writes.length, 0, "still zero writes");
    });
  }
  return Finish(Count, "Policy-Defaults");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Policy-Defaults`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

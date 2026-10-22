import assert from "node:assert/strict";
import * as Ops from "../../../Target/Function/Ops.js";
import {
  Check,
  CheckAsync,
  Exec,
  Finish,
  Ledger,
  Make,
  MakeCounter,
  rm,
  Validate
} from "../Harness.js";
const Setup = (Files, Raw = {}) => {
  rm();
  return Make(Validate({ ...Raw, enabled: true, logFile: Ledger }), Files);
};
const OpenReplace = async (Run, Search, With, Files) => Run.Tool.execute(
  {
    action: "open",
    files: Files ?? Object.keys(Run.Fs.files),
    searches: [`s=${Search}`],
    ops: [`file=* search=s op=replace with=${With}`]
  },
  Exec()
);
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup({ "a.txt": "hello\nworld\n" });
    await CheckAsync(Count, "C1: a commit replaces, writes through the factory and closes the one-shot machine", async () => {
      await OpenReplace(Run, "world", "HI");
      const Out = await Run.Tool.execute({ action: "commit", machine: "mach-1" }, Exec());
      assert.equal(Out.applied, 1);
      assert.equal(Out.failed, 0);
      assert.equal(Out.halted, 0);
      assert.deepEqual(Out.state, [
        {
          file: "a.txt",
          status: "done",
          version: "v2",
          diff: "- world\n+ HI"
        }
      ]);
      assert.equal(Run.Fs.files["a.txt"], "hello\nHI\n");
    });
    await CheckAsync(Count, "C1: the commit ledger lines are byte-exact", async () => {
      assert.ok(Run.Lines.includes("plugin-dsh-batch-edit: transition running a.txt op=1/1"));
      assert.ok(Run.Lines.includes("plugin-dsh-batch-edit: transition applied a.txt version v1 -> v2"));
      assert.ok(Run.Lines.includes("plugin-dsh-batch-edit: machine committed mach-1 (1 applied, 0 failed, 0 halted)"));
      assert.ok(Run.Lines.includes("plugin-dsh-batch-edit: machine closed mach-1"));
    });
    await CheckAsync(Count, "C1: the write carried the replaceIfVersion intent and the factory's stash got the fresh version", async () => {
      assert.equal(Run.Fs.writes.length, 1);
      assert.deepEqual(Run.Fs.writes[0].intent, { kind: "replaceIfVersion", version: "v1" });
      assert.equal(Run.Fs.writes[0].content, "hello\nHI\n");
      assert.equal(Run.State.Stash.get("key:a.txt"), "v2");
    });
  }
  {
    const Run = Setup({ "package.json": '{\n	"name": "x"\n}\n' });
    const Governed = [];
    Run.State.Factory.RegisterGovern("package.json", "smoke", (_T, _A, V) => {
      Governed.push({ path: _T.displayPath, version: V });
    });
    await CheckAsync(Count, "C2: a package.json write re-runs the registered governance steps exactly once", async () => {
      await Run.Tool.execute(
        {
          action: "open",
          files: ["package.json"],
          searches: ["s=x"],
          ops: ["file=* search=s op=replace with=y"]
        },
        Exec()
      );
      await Run.Tool.execute({ action: "commit", machine: "mach-1" }, Exec());
      assert.deepEqual(Governed, [{ path: "package.json", version: "v2" }]);
      assert.equal(Run.Fs.files["package.json"], '{\n	"name": "y"\n}\n');
    });
  }
  {
    const Run = Setup({ "a.txt": "hello\nworld\n" });
    await CheckAsync(Count, "C3: an externally touched file halts stale and is protected, not written", async () => {
      await OpenReplace(Run, "world", "HI");
      Run.Fs.versions.set("a.txt", "v9");
      const Out = await Run.Tool.execute({ action: "commit", machine: "mach-1" }, Exec());
      assert.equal(Out.halted, 1);
      assert.equal(Out.applied, 0);
      assert.deepEqual(Out.state, [{ file: "a.txt", status: "halted", version: "v1", haltReason: "stale" }]);
      assert.ok(Run.Lines.includes("plugin-dsh-batch-edit: transition halted a.txt stale"));
      assert.ok(Run.Lines.includes("plugin-dsh-batch-edit: machine committed mach-1 (0 applied, 0 failed, 1 halted)"));
      assert.equal(Run.Fs.files["a.txt"], "hello\nworld\n");
    });
  }
  {
    const Run = Setup({ "a.txt": "hello\n" }, { strictMode: true });
    await CheckAsync(Count, "C4: a search-not-found under strict mode errors the file loudly", async () => {
      await OpenReplace(Run, "missing", "HI");
      const Out = await Run.Tool.execute({ action: "commit", machine: "mach-1" }, Exec());
      assert.equal(Out.failed, 1);
      assert.deepEqual(Out.state, [{ file: "a.txt", status: "errored", version: "v1", error: "search not found" }]);
      assert.ok(Run.Lines.includes("plugin-dsh-batch-edit: transition errored a.txt search not found"));
    });
  }
  {
    const Run = Setup({ "a.txt": "hello\n" });
    await CheckAsync(Count, "C5: a zero-change commit is the designed no-op - nothing written, nothing logged", async () => {
      await Run.Tool.execute(
        {
          action: "open",
          files: ["a.txt"],
          searches: ["s=zzz"],
          ops: ["file=* search=s op=replace with=HI"]
        },
        Exec()
      );
      const Out = await Run.Tool.execute({ action: "commit", machine: "mach-1" }, Exec());
      assert.equal(Out.applied, 0);
      assert.deepEqual(Out.state, [{ file: "a.txt", status: "observed", version: "v1" }]);
      assert.equal(Run.Fs.writes.length, 0);
      assert.ok(Run.Lines.includes("plugin-dsh-batch-edit: machine committed mach-1 (0 applied, 0 failed, 0 halted)"));
      assert.ok(!Run.Lines.some((L) => L.includes("transition applied")));
    });
  }
  {
    const Run = Setup({ "1-first.txt": "one\n", "2-second.txt": "two\n" });
    await CheckAsync(Count, "C6: a failed write stops the apply loop - the remainder returns to observed", async () => {
      Run.Fs.failWrite = "1-first.txt";
      await OpenReplace(Run, "one", "UNO");
      const Out = await Run.Tool.execute({ action: "commit", machine: "mach-1" }, Exec());
      assert.equal(Out.failed, 1);
      assert.equal(Out.applied, 0);
      assert.ok(Run.Lines.includes("plugin-dsh-batch-edit: transition errored 1-first.txt write denied"));
      const Second = Out.state.find((C) => C.file === "2-second.txt");
      assert.equal(Second.status, "observed");
      assert.equal(Run.Fs.writes.length, 0);
    });
  }
  {
    Check(Count, "C7: replace with mode first replaces only the first occurrence", () => {
      assert.deepEqual(Ops.ApplyOp("a a a", "a", "replace", "b", "first", false), { next: "b a a", count: 1 });
      assert.deepEqual(Ops.ApplyOp("a a a", "a", "replace", "b", 2, false), { next: "b b a", count: 2 });
      assert.deepEqual(Ops.ApplyOp("a a a", "a", "replace", "b", void 0, false), { next: "b b b", count: 3 });
    });
    Check(Count, "C7: a regex search counts and replaces through the same executor", () => {
      const Result = Ops.ApplyOp("aa12bb34", /[0-9]+/, "replace", "#", void 0, false);
      assert.deepEqual(Result, { next: "aa#bb#", count: 2 });
    });
    Check(Count, "C7: the line ops insert before/after and remove the matched lines", () => {
      assert.deepEqual(Ops.ApplyOp("one\ntwo\nthree", "two", "insert-before", "X", void 0, false), {
        next: "one\nX\ntwo\nthree",
        count: 1
      });
      assert.deepEqual(Ops.ApplyOp("one\ntwo\nthree", "two", "insert-after", "X", void 0, false), {
        next: "one\ntwo\nX\nthree",
        count: 1
      });
      assert.deepEqual(Ops.ApplyOp("one\ntwo\nthree", "two", "remove-line", "", void 0, false), {
        next: "one\nthree",
        count: 1
      });
    });
    Check(Count, "C7: append and prepend pad the newline honestly", () => {
      assert.deepEqual(Ops.ApplyOp("one", "s", "append", "X", void 0, false), { next: "one\nX\n", count: 1 });
      assert.deepEqual(Ops.ApplyOp("one\n", "s", "append", "X", void 0, false), { next: "one\nX\n", count: 1 });
      assert.deepEqual(Ops.ApplyOp("one", "s", "prepend", "X", void 0, false), { next: "X\none", count: 1 });
    });
    Check(Count, "C7: the diff is the bounded removed/added line list", () => {
      assert.equal(Ops.Diff("a\nb\nc\n", "a\nc\n"), "- b");
      assert.equal(Ops.Diff("a\n", "a\nX\n"), "+ X");
      assert.equal(Ops.Diff("", "", 2e3), "");
    });
  }
  return Finish(Count, "Commit-And-Ops");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Commit-And-Ops`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

import { createHash as Hash } from "node:crypto";
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import Ingester from "../../Target/Library.js";
const MakeCounter = () => ({ N: 0, F: 0 });
const Check = (Count, Label, Assertions) => {
  Count.N++;
  try {
    Assertions();
    console.log(`PASS - ${Label}`);
  } catch (_Error) {
    Count.F++;
    console.log(`FAIL - ${Label}`);
    console.log(_Error instanceof Error ? _Error.message : Error(String(_Error)).message);
  }
};
const CheckAsync = async (Count, Label, Assertions) => {
  Count.N++;
  try {
    await Assertions();
    console.log(`PASS - ${Label}`);
  } catch (_Error) {
    Count.F++;
    console.log(`FAIL - ${Label}`);
    console.log(_Error instanceof Error ? _Error.message : Error(String(_Error)).message);
  }
};
const Finish = (Count, Name) => {
  if (Count.F !== 0) {
    throw new Error(`${Name}: ${Count.F} failed check(s)`);
  }
  return Count.N;
};
const Sha = (Content) => Hash("sha256").update(Content).digest("hex");
const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "ingester-smoke-"));
const Ledger = Path.join(Root, "ingester", "ingester.log");
const Journal = () => (() => {
  try {
    return FileSystem.readFileSync(Ledger, "utf8").split("\n").filter(Boolean).map((Line) => JSON.parse(Line));
  } catch {
    return [];
  }
})();
const rm = () => {
  try {
    FileSystem.rmSync(Ledger);
  } catch {
  }
};
const FakeFs = (Files = {}, FailEdit = false) => {
  const Fs = {
    files: Files,
    resolved: [],
    stats: [],
    reads: [],
    edits: []
  };
  Fs.resolve = async (P) => {
    Fs.resolved.push(P);
    return { targetKey: P, displayPath: P };
  };
  Fs.stat = async (Target) => {
    Fs.stats.push(Target.displayPath);
    const Text = Fs.files[Target.displayPath];
    if (Text === void 0) {
      return void 0;
    }
    return { version: Sha(Text), type: "file" };
  };
  Fs.readText = async (Target) => {
    Fs.reads.push(Target.displayPath);
    const Text = Fs.files[Target.displayPath];
    if (Text === void 0) {
      throw new Error("vanished");
    }
    return Text;
  };
  Fs.editText = async (Target, Edit, Guard) => {
    Fs.edits.push({ path: Target.displayPath, find: Edit.oldString, replace: Edit.newString, version: Guard.version });
    if (FailEdit) {
      throw new Error("FS_STALE_VERSION");
    }
    const Text = Fs.files[Target.displayPath];
    if (Text === void 0 || !Text.includes(Edit.oldString) || Sha(Text) !== Guard.version) {
      throw new Error("FS_STALE_VERSION");
    }
    const Next = Text.replace(Edit.oldString, Edit.newString);
    Fs.files[Target.displayPath] = Next;
    return { operation: "update", version: Sha(Next) };
  };
  return Fs;
};
const MakeCtx = (Fs) => {
  const Lines = [];
  const Provided = {};
  const Listeners = {};
  const Context = {
    logger: {
      info: (M) => Lines.push(M),
      warn: (M) => Lines.push(M),
      error: (M) => Lines.push(M)
    },
    on: (Name, Listener) => {
      Listeners[Name] = Listener;
      return () => true;
    },
    reflect: {
      provide: (Name, Value) => {
        Provided[Name] = Value;
      }
    },
    get: (Name) => Context[Name],
    get root() {
      return Context;
    }
  };
  if (Fs !== void 0) {
    Context.fs = Fs;
  }
  return { Context, Lines, Provided, Listeners };
};
const Build = (Raw = {}, Files = {}, FailEdit = false) => {
  rm();
  const Fs = FakeFs(Files, FailEdit);
  const Run = MakeCtx(Fs);
  Run.Files = Files;
  Run.Fs = Fs;
  Run.Ingester = new Ingester(Run.Context, Ingester.Config({ logFile: Ledger, ...Raw }));
  return Run;
};
const Proposal = (Id, Targets, Operations, ExpiresAt = Date.now() + 6e4) => ({
  id: Id,
  intent: { kind: "test", params: {} },
  targets: Targets,
  operations: Operations,
  preview: [],
  digest: "digested",
  revision: 1,
  expiresAt: ExpiresAt,
  createdAt: Date.now() - 1e3
});
const Decision = (Id, Outcome = "approved") => ({
  proposal: Id,
  outcome: Outcome,
  by: "user",
  at: Date.now()
});
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Count = MakeCounter();
  Check(Count, "selfcheck: a passing assertion counts as PASS", () => {
    assert.equal(1, 1);
  });
  Check(Count, "selfcheck: a failing assertion counts as FAIL (expected)", () => {
    assert.equal(1, 2);
  });
  const Run = Build();
  Check(Count, "selfcheck: the fake ctx constructs the ingester service", () => {
    assert.equal(Run.Provided["ingester"], Run.Ingester);
    assert.equal(typeof Run.Ingester.Apply, "function");
  });
  if (Count.N === 3 && Count.F === 1) {
    console.log("Harness selfcheck OK");
  } else {
    console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
    process.exitCode = 1;
  }
}
export {
  Build,
  Check,
  CheckAsync,
  Decision,
  FakeFs,
  Finish,
  Ingester,
  Journal,
  Ledger,
  MakeCounter,
  MakeCtx,
  Proposal,
  Root,
  Sha,
  rm
};
//# sourceMappingURL=Harness.js.map

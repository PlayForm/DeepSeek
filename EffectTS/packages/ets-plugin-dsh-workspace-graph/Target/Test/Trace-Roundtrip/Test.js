import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import { Names } from "@playform/ets-lib-dsh-trace";
import ContextPlugin from "../../../../ets-plugin-dsh-workspace-context/Target/Library.js";
import FactoryClass from "../../../../ets-plugin-dsh-factory/Target/Library.js";
import ObservePlugin from "../../../../ets-hook-dsh-workspace-observe/Target/Library.js";
import GraphClass from "../../../Target/Library.js";
import { Check, CheckAsync, Finish, MakeCounter } from "../Harness.js";
const CORE = 'import { util } from "./util.ts";\n\nexport function core(): number {\n	return util;\n}\n';
const CORE_CHANGED = `${CORE}
export function extra(): number {
	return 2;
}
`;
const UTIL = "export const util = 1;\n";
const TEST_FILE = 'import { core } from "./core.ts";\n\nexport const suite = core;\n';
const MARKDOWN = "# The workspace\n\nIntro text.\n\n## Section\n";
const DiskFs = () => {
  const Fs = {
    resolve: async (P) => {
      const Display = Path.resolve(P);
      let Identity = Display;
      try {
        Identity = FileSystem.realpathSync(Display);
      } catch {
      }
      return { targetKey: Identity, displayPath: Display };
    },
    stat: async (Target) => {
      try {
        const Stat = FileSystem.statSync(String(Target.targetKey));
        return {
          version: `${Stat.mtimeMs}-${Stat.size}`,
          type: Stat.isFile() ? "file" : Stat.isDirectory() ? "directory" : "other",
          size: Stat.size
        };
      } catch {
        return void 0;
      }
    },
    readText: async (Target) => FileSystem.readFileSync(String(Target.targetKey), "utf8"),
    listDir: async (Target) => FileSystem.readdirSync(String(Target.targetKey), { withFileTypes: true }).sort((Left, Right) => Left.name.localeCompare(Right.name)).map((Entry) => ({
      name: Entry.name,
      type: Entry.isFile() ? "file" : Entry.isDirectory() ? "directory" : "other",
      target: {
        targetKey: Path.join(String(Target.targetKey), Entry.name),
        displayPath: Path.join(String(Target.displayPath), Entry.name)
      }
    })),
    contains: (Parent, Child) => {
      const Left = String(Parent.targetKey);
      const Right = String(Child.targetKey);
      return Right === Left || Right.startsWith(`${Left}${Path.sep}`);
    },
    writeText: async () => {
      throw new Error("the round-trip must never write through ctx.fs");
    }
  };
  return Fs;
};
const Make = () => {
  const Provided = {};
  const Lines = [];
  const Effects = [];
  const Disposers = [];
  const Tools = [];
  const RootListeners = {};
  const CtxListeners = {};
  const Root = {
    on: (Name, Listener) => {
      (RootListeners[Name] ??= []).push(Listener);
      return () => true;
    }
  };
  let Context;
  Context = {
    fs: DiskFs(),
    logger: {
      info: (Message) => Lines.push(Message),
      warn: (Message) => Lines.push(Message),
      error: (Message) => Lines.push(Message)
    },
    on: (Name, Listener) => {
      CtxListeners[Name] = Listener;
      return () => true;
    },
    get: (Name) => Context[Name],
    effect: (Setup, Label) => {
      const Name = Label ?? "unnamed";
      Effects.push(Name);
      const Disposer = Setup();
      if (typeof Disposer === "function") {
        Disposers.push({ label: Name, dispose: Disposer });
      }
      return () => true;
    },
    root: Root,
    tools: {
      register: (Definition) => {
        Tools.push(Definition);
      }
    },
    reflect: {
      provide: (Name, Value) => {
        Provided[Name] = Value;
        Context[Name] = Value;
        return () => true;
      }
    },
    provide: (Name, Value) => {
      Provided[Name] = Value;
      Context[Name] = Value;
      return () => true;
    }
  };
  return {
    Context,
    Provided,
    Lines,
    Effects,
    Disposers,
    Tools,
    RootListeners,
    CtxListeners
  };
};
const Fire = (Run, Path_, Version, Kind = "present") => {
  for (const Listener of Run.RootListeners["fs/observed"] ?? []) {
    Listener(
      { displayPath: Path_, targetKey: Path_ },
      Kind === "present" ? { kind: "present", version: Version } : { kind: Kind },
      { agent: { id: "agent-a" } }
    );
  }
};
const LinesWith = (Run, Needle) => Run.Lines.filter((Line) => Line.includes(Needle));
const runTest = async () => {
  const Count = MakeCounter();
  const Base = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "workspace-trace-roundtrip-"));
  const Root = Path.join(Base, "ws");
  const Files = {
    "src/core.ts": CORE,
    "src/util.ts": UTIL,
    "src/core.test.ts": TEST_FILE,
    "README.md": MARKDOWN
  };
  for (const [Relative, Text] of Object.entries(Files)) {
    const Absolute = Path.join(Root, Relative);
    FileSystem.mkdirSync(Path.dirname(Absolute), { recursive: true });
    FileSystem.writeFileSync(Absolute, Text);
  }
  const CorePath = Path.join(Root, "src/core.ts");
  const UtilPath = Path.join(Root, "src/util.ts");
  const Run = Make();
  const Context = Run.Context;
  {
    const Factory = new FactoryClass(Context);
    ObservePlugin.apply(Context, ObservePlugin.Config({ enabled: true }));
    const Graph = new GraphClass(Context, GraphClass.Config({ enabled: true }));
    ContextPlugin.apply(Context, ContextPlugin.Config({ enabled: true }));
    Run.Factory = Factory;
    Run.Graph = Graph;
    Run.Trace = Run.Provided["trace"];
    Check(Count, "T1: the factory provides the one bus and every plugin registers on the ctx", () => {
      assert.ok(Run.Trace !== void 0, "ctx.trace is provided");
      assert.equal(Run.Trace, Factory.Trace, "the factory holds the same bus");
      assert.equal(Run.Provided["pluginFactory"], Factory);
      assert.equal(Run.Provided["workspaceObserve"] !== void 0, true);
      assert.equal(Run.Provided["workspaceGraph"], Graph);
      assert.equal(Run.Provided["workspaceContext"] !== void 0, true);
      assert.equal(Run.Tools.length, 1, "the context tool registered");
    });
    Check(Count, "T1: the observe hook is the ONLY fs/observed listener (the graph uses the bus)", () => {
      assert.equal(Run.RootListeners["fs/observed"]?.length, 1);
    });
  }
  {
    const Summary = await Run.Graph.indexWorkspace(Root);
    Check(Count, "T2: the graph indexes the tree and emits graph/indexed for every record", () => {
      assert.deepEqual(Summary, { indexed: 4, skipped: 0, failed: 0, files: 4 });
      const Indexed = Run.Trace.ring().filter((Envelope) => Envelope.kind === Names.indexed).map((Envelope) => Envelope.payload.path).sort();
      assert.deepEqual(Indexed, [CorePath, UtilPath, Path.join(Root, "README.md"), Path.join(Root, "src/core.test.ts")].sort());
      assert.equal(
        Run.Trace.ring().some((Envelope) => Envelope.kind === Names.invalidated),
        false,
        "a first index invalidates nothing"
      );
    });
  }
  {
    const First = Context.workspaceContext.packet({ id: `File:${CorePath}`, caller: "tester" });
    const Second = Context.workspaceContext.packet({ id: `File:${CorePath}`, caller: "tester" });
    Check(Count, "T3: the packet carries the real revision and a repeated query is memoized", () => {
      assert.equal(First.workspace, "WORKSPACE workspace @ 4");
      assert.equal(First.nodeId, `File:${CorePath}`);
      assert.equal(Second, First, "the second identical query is served from the memo");
      assert.equal(LinesWith(Run, "context: packet").length, 1, "a memo hit adds no ledger line");
    });
  }
  {
    FileSystem.writeFileSync(CorePath, CORE_CHANGED);
    Fire(Run, CorePath, "v2");
    Fire(Run, CorePath, "v2");
    await CheckAsync(Count, "T4: a coalesced pair re-indexes ONCE through the bus", async () => {
      await Run.Graph.State.Flush;
      assert.deepEqual(LinesWith(Run, `graph: reindexed ${CorePath}`), [
        `graph: reindexed ${CorePath} (indexed)`
      ]);
      assert.equal(Run.Graph.statistics().indexRevision, "5");
      assert.equal(Run.Graph.find({ name: "extra" }).length, 1, "the change is in the graph");
    });
    Check(Count, "T4: the observe stamp is recorded byte-exactly and carried on the bus", () => {
      assert.deepEqual(LinesWith(Run, `observe: stamped ${CorePath}`), [
        `observe: stamped ${CorePath} version v2 (fs/observed)`,
        `observe: stamped ${CorePath} version v2 (fs/observed)`
      ]);
      const Stamp = Run.Trace.ring().find((Envelope) => Envelope.kind === Names.observe);
      assert.deepEqual(Stamp.payload, {
        path: CorePath,
        version: "v2",
        origin: "fs/observed"
      });
      assert.match(Stamp.trace, /^trace-\d+$/);
    });
    Check(Count, "T4: the graph emits graph/invalidated (replaced) then graph/indexed", () => {
      const Invalidated = Run.Trace.ring().filter((Envelope) => Envelope.kind === Names.invalidated);
      assert.equal(Invalidated.length, 1);
      assert.deepEqual(Invalidated[0].payload, {
        path: CorePath,
        reason: "replaced",
        version: Invalidated[0].payload.version
      });
      assert.equal(Invalidated[0].payload.path, CorePath);
      const Indexed = Run.Trace.ring().find(
        (Envelope) => Envelope.kind === Names.indexed && Envelope.payload.path === CorePath
      );
      assert.equal(Indexed.payload.revision, 5);
    });
  }
  {
    const Third = Context.workspaceContext.packet({ id: `File:${CorePath}`, caller: "tester" });
    Check(Count, "T5: graph/invalidated cleared the memo - the next query rebuilds", () => {
      assert.notEqual(Third.workspace, "WORKSPACE workspace @ 4", "not the stale packet");
      assert.equal(Third.workspace, "WORKSPACE workspace @ 5", "the new revision");
      assert.equal(LinesWith(Run, "context: packet").length, 2, "the rebuild ledgers its line");
    });
  }
  {
    await CheckAsync(Count, "T6: the bus flush and the loop flush settle without a sleep", async () => {
      await assert.doesNotReject(() => Run.Trace.flush());
      await assert.doesNotReject(() => Run.Graph.State.Flush);
    });
  }
  {
    const Revision = Run.Graph.statistics().indexRevision;
    Fire(Run, UtilPath, "v1", "absent");
    Check(Count, "T7: an absent stamp emits graph/invalidated (absent) and re-indexes nothing", () => {
      assert.equal(Run.Graph.statistics().indexRevision, Revision);
      assert.equal(LinesWith(Run, `graph: reindexed ${UtilPath}`).length, 0);
      const Absent = Run.Trace.ring().find(
        (Envelope) => Envelope.kind === Names.invalidated && Envelope.payload.path === UtilPath
      );
      assert.deepEqual(Absent.payload, { path: UtilPath, reason: "absent" });
    });
  }
  {
    const Excluded = Path.join(Root, "node_modules/pkg/index.ts");
    FileSystem.mkdirSync(Path.dirname(Excluded), { recursive: true });
    FileSystem.writeFileSync(Excluded, "export const vendored = 1;\n");
    Fire(Run, Excluded, "v1");
    Check(Count, "T8: an excluded path never reaches the bus (the source's guard)", () => {
      assert.deepEqual(LinesWith(Run, `observe: ignored ${Excluded}`), [
        `observe: ignored ${Excluded} (excluded)`
      ]);
      assert.equal(LinesWith(Run, `graph: reindexed ${Excluded}`).length, 0);
    });
  }
  {
    Check(Count, "T9: the graph adapter's disposer stops the re-index (the stamp still records)", () => {
      const Effect = Run.Disposers.find(
        (Entry) => Entry.label === "graph-trace"
      );
      assert.ok(Effect !== void 0, "the adapter registered its unload effect");
      Effect.dispose();
      FileSystem.writeFileSync(CorePath, `${CORE_CHANGED}
export const later = 3;
`);
      Fire(Run, CorePath, "v3");
      assert.equal(
        LinesWith(Run, `graph: reindexed ${CorePath}`).length,
        1,
        "no second re-index after the disposer"
      );
      assert.equal(
        LinesWith(Run, `observe: stamped ${CorePath} version v3`).length,
        1,
        "the observe hook still records (its own wiring is untouched)"
      );
    });
  }
  return Finish(Count, "Trace-Roundtrip");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Trace-Roundtrip`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

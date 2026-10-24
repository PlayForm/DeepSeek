import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import DocPlugin from "../../../../ets-hook-dsh-doc-suggester/Target/Library.js";
import {
  AgentOf,
  CheckAsync,
  Finish,
  Furnace,
  Ledger,
  Make,
  MakeCounter,
  Post,
  rm,
  Validate
} from "../Harness.js";
const Tree = (Prefix) => FileSystem.mkdtempSync(Path.join(OS.tmpdir(), Prefix));
const Put = (Root, Relative, Body = "x") => {
  const Full = Path.join(Root, Relative);
  FileSystem.mkdirSync(Path.dirname(Full), { recursive: true });
  FileSystem.writeFileSync(Full, Body, "utf8");
  return Full;
};
const Home = Tree("convention-learn-install-home-");
process.env["HOME"] = Home;
const Proposal = (Root) => Path.join(
  Home,
  ".dsh/playform/proposals",
  `${Path.basename(Root).toLowerCase()}.yml`
);
const Live = (Root) => Path.join(
  Home,
  ".dsh/playform/workspaces",
  `${Path.basename(Root).toLowerCase()}.yml`
);
const Service = (Cwd) => ({ get: () => Cwd });
const Repo = Tree("convention-learn-install-repo-");
for (const Relative of [
  "Documentation/INDEX.md",
  "Documentation/Handoff/handoff.md",
  "Site/Source/Content/content.md",
  "Site/Source/pages/index.astro",
  "Site/Source/Component/Card.astro",
  "Site/Source/Library/Layout.ts",
  "package.json",
  "README.md",
  "SCHEME.md",
  "cordis.patch.yml",
  "Source/Library.ts",
  "Source/Function/Apply.ts",
  "Source/Variable/Config.ts",
  "Source/Interface/Config.ts",
  "Source/Test/Suite/Test.ts"
]) {
  Put(Repo, Relative);
}
const DocLedger = Path.join(Home, "doc-suggester.log");
const MountDoc = (Cwd) => {
  const Lines = [];
  const Warns = [];
  const Listeners = {};
  let Context;
  Context = {
    pluginFactory: Furnace,
    workingDirectory: { get: () => Cwd },
    fs: {
      readText: async () => {
        throw new Error("readText must never be called");
      },
      writeText: async () => {
        throw new Error("writeText must never be called");
      }
    },
    logger: {
      info: (Message) => {
        Lines.push(Message);
      },
      warn: (Message) => {
        Warns.push(Message);
      }
    },
    on: (Name, Listener) => {
      Listeners[Name] = Listener;
      return () => true;
    },
    get: (Name) => Context[Name],
    effect: (Setup) => {
      Setup();
      return () => true;
    },
    root: { on: () => () => true },
    reflect: {
      provide: (Name, Value) => {
        Context[Name] = Value;
        return () => true;
      }
    }
  };
  const Raw = DocPlugin.Config({
    logFile: DocLedger,
    enabled: true
  });
  DocPlugin.apply(Context, Raw);
  return { Context, Lines, Warns, Listeners, State: Context.__hookDshDocSuggesterState };
};
const DocLines = () => (() => {
  try {
    return FileSystem.readFileSync(DocLedger, "utf8").split("\n").filter(Boolean);
  } catch {
    return [];
  }
})();
const DocText = [
  "[doc-suggester] family=Site confidence=0.87",
  "companions (5):",
  "- Documentation - the source of truth",
  "- Site/Source/Content - the site content",
  "- Site/Source/pages - the site pages",
  "- Site/Source/Component - the components",
  "- Site/Source/Library - the site library",
  "note: a documentation task rarely touches one file; keep the doc graph coherent."
].join("\n");
const runTest = async () => {
  const Count = MakeCounter();
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: true, learning: true }));
    Run.Context.workingDirectory = Service(Repo);
    await CheckAsync(Count, "I1: the learner writes the proposal and notes it", async () => {
      const Out = await Post(Run, {
        name: "write",
        arguments: { file_path: "Source/Function/Apply.ts" },
        agent: AgentOf("a")
      });
      assert.equal(Out.additionalContexts[0].source.summary, "learned pack 6 families");
      assert.equal(FileSystem.existsSync(Proposal(Repo)), true);
      assert.equal(FileSystem.existsSync(Live(Repo)), false);
    });
  }
  FileSystem.mkdirSync(Path.dirname(Live(Repo)), { recursive: true });
  FileSystem.copyFileSync(Proposal(Repo), Live(Repo));
  {
    const Doc = MountDoc(Repo);
    await CheckAsync(Count, "I2: the installed proposal is byte-identical to the file the learner wrote", async () => {
      assert.equal(
        FileSystem.readFileSync(Live(Repo), "utf8"),
        FileSystem.readFileSync(Proposal(Repo), "utf8")
      );
    });
    await CheckAsync(Count, "I3: the doc suggester emits the note naming the proposal's companions", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Doc.Listeners["tools/post-execute"](
        {
          name: "read",
          arguments: { file_path: "Site/Source/pages/index.astro" },
          agent: AgentOf("doc")
        },
        {},
        () => Promise.resolve(Decision)
      );
      assert.equal(Out.additionalContexts.length, 1);
      assert.deepEqual(Out.additionalContexts[0].source, {
        kind: "doc-suggester",
        form: "notice",
        summary: "Site 0.87"
      });
      assert.equal(Out.additionalContexts[0].content[0].text, DocText);
      assert.equal(Out.additionalContexts[0].content[0].text.includes("Component"), true);
      assert.equal(
        Out.additionalContexts[0].content[0].text.includes(
          "Site/Source/Library/Content.ts"
        ),
        false
      );
    });
    await CheckAsync(Count, "I3: the doc ledger line counts the derived companions", async () => {
      assert.ok(
        Doc.Lines.includes(
          "hook-dsh-doc-suggester: suggest Site 0.87 5 companions Site/Source/pages/index.astro"
        )
      );
      assert.equal(
        DocLines().filter(
          (Line) => Line.includes(
            "suggest Site 0.87 5 companions Site/Source/pages/index.astro"
          )
        ).length,
        1
      );
      assert.deepEqual(Doc.Warns, []);
    });
  }
  return Finish(Count, "Learn-Install");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Learn-Install`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

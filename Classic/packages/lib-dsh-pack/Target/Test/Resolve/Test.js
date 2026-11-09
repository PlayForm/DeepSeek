import assert from "node:assert/strict";
import {
  Check,
  Finish,
  Library,
  MakeCounter,
  Put,
  Tree
} from "../Harness.js";
const Repo = `signature:
  - docs/STYLE.md
slug: custom
families:
  "doc/Plan":
    id: Plan
    priority: 4
    threshold: 0.5
    note: the temp caveat
    signals:
      - rule: plan
        pattern: 'Documentation/Plans/.*\\.md$'
        weight: 2.5
    targets:
      - path: docs/STYLE.md
        kind: style
        prior: 1.0
        reason: the temp style
`;
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Home = Tree("pack-resolve-home-");
    const Root = Tree("pack-resolve-builtin-");
    Put(Root, "Documentation/ARCHIVE-STYLE.md");
    Check(Count, "R1: no pack layer resolves to the built-in pack", () => {
      assert.equal(Library.Resolve(Root, { home: Home }), Library.Builtin);
      assert.equal(Library.Families(Library.Resolve(Root, { home: Home }), "doc").length, 7);
    });
    Check(Count, "R1: the locator finds the built-in workspace by the default signature", () => {
      const Located = Library.Locate("Documentation/INDEX.md", Root, { home: Home });
      assert.equal(Located?.root, Root);
      assert.equal(Located?.pack, Library.Builtin);
    });
  }
  {
    const Home = Tree("pack-resolve-home-");
    const Root = Tree("pack-resolve-repo-");
    Put(Root, ".dsh/pack.yml", Repo);
    Put(Root, "docs/STYLE.md");
    Check(Count, "R2: the repo layer replaces the signature and declares the slug", () => {
      const Pack = Library.Resolve(Root, { home: Home });
      assert.deepEqual(Pack.signature, ["docs/STYLE.md"]);
      assert.equal(Pack.slug, "custom");
      assert.equal(Object.keys(Pack.families ?? {}).length, 1);
      assert.equal(Pack.families?.["doc/Plan"]?.priority, 4);
      assert.equal(Pack.families?.["doc/Plan"]?.threshold, 0.5);
      assert.equal(Pack.families?.["doc/Plan"]?.targets[0]?.path, "docs/STYLE.md");
    });
    Check(Count, "R2: the locator resolves a foreign workspace by its pack signature", () => {
      const Located = Library.Locate("Documentation/Plans/anything.md", Root, { home: Home });
      assert.equal(Located?.root, Root);
      assert.deepEqual(Located?.pack.signature, ["docs/STYLE.md"]);
      assert.equal(Library.Families(Located?.pack ?? {}, "doc").length, 1);
    });
  }
  {
    const Home = Tree("pack-resolve-home-");
    const Root = Tree("pack-resolve-user-");
    Put(
      Home,
      ".dsh/playform/workspaces/custom.yml",
      `learning:
  propose: true
families:
  "doc/Plan":
    priority: 9
    targets:
      - path: docs/BASE.md
        prior: 0.6
        reason: the user companion
`
    );
    Put(
      Root,
      ".dsh/pack.yml",
      `slug: custom
signature:
  - docs/STYLE.md
families:
  "doc/Plan":
    threshold: 0.5
    targets:
      - path: docs/REPO.md
        prior: 1.0
        reason: the repo companion
`
    );
    Put(Root, "docs/STYLE.md");
    Check(Count, "R3: the user layer is read first and the repo layer overrides it", () => {
      const Pack = Library.Resolve(Root, { home: Home });
      const Plan = Pack.families?.["doc/Plan"];
      assert.equal(Plan?.priority, 9);
      assert.equal(Plan?.threshold, 0.5);
      assert.deepEqual(
        Plan?.targets.map((Target) => Target.path),
        ["docs/BASE.md", "docs/REPO.md"]
      );
      assert.equal(Pack.learning?.propose, true);
    });
  }
  {
    const Home = Tree("pack-resolve-home-");
    const Root = Tree("Pack-UserOnly-");
    const Name = Root.split("/").pop() ?? "";
    Put(
      Home,
      `.dsh/playform/workspaces/${Name.toLowerCase()}.yml`,
      `signature:
  - docs/ONLY.md
families:
  "test/Suite":
    id: Suite
    priority: 1
    threshold: 0.6
`
    );
    Put(Root, "docs/ONLY.md");
    Check(Count, "R4: a user-only layer is located by the lowercased basename", () => {
      const Located = Library.Locate("docs/ONLY.md", Root, { home: Home });
      assert.equal(Located?.root, Root);
      assert.equal(Library.Families(Located?.pack ?? {}, "test").length, 1);
    });
  }
  {
    const Home = Tree("pack-resolve-home-");
    const Root = Tree("pack-resolve-gate-");
    Put(Root, ".dsh/pack.yml", `signature:
  - docs/MISSING.md
`);
    Check(Count, "R5: a pack whose signature marker is absent does not resolve", () => {
      assert.equal(Library.Locate("anything.md", Root, { home: Home }), void 0);
    });
  }
  {
    const Home = Tree("pack-resolve-home-");
    const Root = Tree("pack-resolve-foreign-");
    Put(Root, "Documentation/INDEX.md");
    Check(Count, "R6: a foreign workspace without a pack stays silent", () => {
      assert.equal(Library.Locate("Documentation/INDEX.md", Root, { home: Home }), void 0);
    });
  }
  {
    const Home = Tree("pack-resolve-home-");
    const Root = Tree("pack-resolve-json-");
    Put(
      Root,
      ".dsh/pack.json",
      JSON.stringify({
        signature: ["docs/JSON.md"],
        families: { "doc/Index": { priority: 2 } }
      })
    );
    Put(Root, "docs/JSON.md");
    Check(Count, "R7: a .json pack resolves through JSON.parse", () => {
      const Located = Library.Locate("docs/JSON.md", Root, { home: Home });
      assert.equal(Located?.root, Root);
      assert.equal(Library.Families(Located?.pack ?? {}, "doc")[0]?.priority, 2);
    });
  }
  {
    const Home = Tree("pack-resolve-home-");
    const Root = Tree("pack-resolve-memo-");
    Put(Root, ".dsh/pack.yml", `signature:
  - docs/MEMO.md
`);
    Put(Root, "docs/MEMO.md");
    Check(Count, "R8: Load memoizes one pack per root", () => {
      assert.equal(Library.Load(Root, { home: Home }), Library.Load(Root, { home: Home }));
    });
  }
  return Finish(Count, "Resolve");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Resolve`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

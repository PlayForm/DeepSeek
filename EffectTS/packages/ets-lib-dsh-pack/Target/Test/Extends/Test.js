import assert from "node:assert/strict";
import { Check, Finish, Library, MakeCounter, Put, Tree } from "../Harness.js";
const Repo = (Extends, Family = "") => `slug: repo
signature:
  - docs/S.md
extends: ${Extends}
${Family}`;
const Pack = (Extends, Path, Priority) => `${Extends === "" ? "" : `extends: ${Extends}
`}families:
  "doc/Plan":
    priority: ${Priority}
    targets:
      - path: ${Path}
        prior: 1.0
        reason: the ${Path} companion
`;
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Home = Tree("pack-extends-home-");
    const Root = Tree("pack-extends-chain-");
    Put(Home, ".dsh/playform/workspaces/base.yml", Pack("", "docs/BASE.md", 1));
    Put(Home, ".dsh/playform/workspaces/mid.yml", Pack("base", "docs/MID.md", 2));
    Put(
      Root,
      ".dsh/pack.yml",
      Repo("mid", `families:
  "doc/Plan":
    threshold: 0.5
`)
    );
    Put(Root, "docs/S.md");
    Check(Count, "E1: the chain merges base, middle and repo in order", () => {
      const Plan = Library.Resolve(Root, { home: Home }).families?.["doc/Plan"];
      assert.equal(Plan?.priority, 2);
      assert.equal(Plan?.threshold, 0.5);
      assert.deepEqual(
        Plan?.targets.map((Target) => Target.path),
        ["docs/BASE.md", "docs/MID.md"]
      );
    });
  }
  {
    const Home = Tree("pack-extends-home-");
    const Root = Tree("pack-extends-cycle-");
    Put(Home, ".dsh/playform/workspaces/a.yml", Pack("b", "docs/A.md", 1));
    Put(Home, ".dsh/playform/workspaces/b.yml", Pack("a", "docs/B.md", 2));
    Put(Root, ".dsh/pack.yml", Repo("a"));
    Put(Root, "docs/S.md");
    Check(Count, "E2: a cycle is guarded and each pack merges once", () => {
      const Plan = Library.Resolve(Root, { home: Home }).families?.["doc/Plan"];
      assert.deepEqual(
        Plan?.targets.map((Target) => Target.path),
        ["docs/B.md", "docs/A.md"]
      );
    });
  }
  {
    const Home = Tree("pack-extends-home-");
    const Root = Tree("pack-extends-self-");
    Put(Home, ".dsh/playform/workspaces/base.yml", Pack("", "docs/BASE.md", 1));
    Put(Root, ".dsh/pack.yml", Repo("[repo, base]"));
    Put(Root, "docs/S.md");
    Check(Count, "E3: a self-cycle is skipped and the other base applies", () => {
      const Plan = Library.Resolve(Root, { home: Home }).families?.["doc/Plan"];
      assert.deepEqual(
        Plan?.targets.map((Target) => Target.path),
        ["docs/BASE.md"]
      );
    });
  }
  {
    const Home = Tree("pack-extends-home-");
    const Root = Tree("pack-extends-missing-");
    Put(Home, ".dsh/playform/workspaces/base.yml", Pack("", "docs/BASE.md", 1));
    Put(Root, ".dsh/pack.yml", Repo("[missing, base]"));
    Put(Root, "docs/S.md");
    Check(Count, "E4: a missing extends link is skipped, the rest resolves", () => {
      const Plan = Library.Resolve(Root, { home: Home }).families?.["doc/Plan"];
      assert.equal(Plan?.targets.length, 1);
      assert.equal(Plan?.targets[0]?.path, "docs/BASE.md");
    });
  }
  {
    const Home = Tree("pack-extends-home-");
    const Root = Tree("pack-extends-array-");
    Put(Home, ".dsh/playform/workspaces/a.yml", Pack("", "docs/A.md", 1));
    Put(Home, ".dsh/playform/workspaces/b.yml", Pack("", "docs/B.md", 2));
    Put(Root, ".dsh/pack.yml", Repo("[a, b]"));
    Put(Root, "docs/S.md");
    Check(Count, "E5: an extends array merges both bases in order", () => {
      const Plan = Library.Resolve(Root, { home: Home }).families?.["doc/Plan"];
      assert.deepEqual(
        Plan?.targets.map((Target) => Target.path),
        ["docs/A.md", "docs/B.md"]
      );
    });
  }
  {
    const Home = Tree("pack-extends-home-");
    const Root = Tree("pack-extends-override-");
    Put(
      Home,
      ".dsh/playform/workspaces/base.yml",
      `families:
  "doc/Plan":
    targets:
      - path: docs/SAME.md
        prior: 1.0
        reason: the base reason
`
    );
    Put(
      Root,
      ".dsh/pack.yml",
      `slug: repo
signature:
  - docs/S.md
extends: base
families:
  "doc/Plan":
    targets:
      - path: docs/SAME.md
        prior: 1.0
        reason: the repo reason
`
    );
    Put(Root, "docs/S.md");
    Check(Count, "E6: the repo layer overrides its base on the same path", () => {
      const Plan = Library.Resolve(Root, { home: Home }).families?.["doc/Plan"];
      assert.equal(Plan?.targets.length, 1);
      assert.equal(Plan?.targets[0]?.reason, "the repo reason");
    });
  }
  return Finish(Count, "Extends");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Extends`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

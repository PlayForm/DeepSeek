import assert from "node:assert/strict";
import {
  Check,
  Finish,
  Library,
  MakeCounter,
  Put,
  Tree
} from "../Harness.js";
const Call = (Name, Path, Type = "tool/call") => ({
  type: Type,
  name: Name,
  arguments: typeof Path === "string" && Path.startsWith("{") ? Path : JSON.stringify({ file_path: Path })
});
const Fold = (Paths) => Paths.flatMap((Entry_, Seq) => {
  const Touch = Library.Fold(Call("Edit", Entry_), Seq);
  return Touch === void 0 ? [] : [Touch];
});
const runTest = async () => {
  const Count = MakeCounter();
  Check(Count, "A1: the fold ignores a non-tool/call event, a missing type and a malformed payload", () => {
    assert.equal(Library.Fold({ type: "tool/result", name: "Edit", arguments: "{}" }, 0), void 0);
    assert.equal(Library.Fold({ name: "Edit", arguments: "{}" }, 0), void 0);
    assert.equal(Library.Fold({ type: "tool/call", arguments: "not json" }, 0), void 0);
    assert.equal(Library.Fold({ type: "tool/call", arguments: "42" }, 0), void 0);
    assert.equal(Library.Fold({ type: "tool/call", arguments: "{}" }, 0), void 0);
  });
  Check(Count, "A2: the fold parses a JSON-string payload and extracts file_path", () => {
    const Touch = Library.Fold(Call("Read", "Source/Function/Read.ts"), 3);
    assert.deepEqual(Touch, { seq: 3, path: "Source/Function/Read.ts", tool: "Read" });
  });
  Check(Count, "A3: the fold accepts an object payload and falls back from file_path to path to filePath", () => {
    assert.deepEqual(
      Library.Fold({ type: "tool/call", name: "Write", arguments: { path: "a/b.md" } }, 1),
      { seq: 1, path: "a/b.md", tool: "Write" }
    );
    assert.deepEqual(
      Library.Fold({ type: "tool/call", name: "Edit", arguments: { filePath: "a/c.md" } }, 2),
      { seq: 2, path: "a/c.md", tool: "Edit" }
    );
    assert.equal(Library.Fold({ type: "tool/call", name: "Edit", arguments: {} }, 3), void 0);
    assert.deepEqual(
      Library.Fold({ type: "tool/call", name: "Edit", arguments: { file_path: "", path: "a/d.md" } }, 4),
      { seq: 4, path: "a/d.md", tool: "Edit" }
    );
  });
  Check(Count, "A4: the fold normalizes backslashes and a leading ./", () => {
    assert.equal(Library.Fold({ type: "tool/call", arguments: { file_path: "a\\b\\c.md" } }, 0)?.path, "a/b/c.md");
    assert.equal(Library.Fold({ type: "tool/call", arguments: { file_path: "./a/b.md" } }, 0)?.path, "a/b.md");
    assert.equal(Library.Fold({ type: "tool/call" }, 0), void 0);
  });
  Check(Count, "A5: a repeated co-touch outranks a single one and the anchor is excluded", () => {
    const Touches = Fold([
      "doc/INDEX.md",
      "doc/STYLE.md",
      "doc/PLAN.md",
      "doc/INDEX.md",
      "doc/STYLE.md",
      "doc/INDEX.md"
    ]);
    const Ranked = Library.Adjacent(Touches, "doc/INDEX.md");
    assert.deepEqual(
      Ranked.map((Entry_) => Entry_.path),
      ["doc/STYLE.md", "doc/PLAN.md"]
    );
    assert.equal(Ranked[0]?.count, 3);
    assert.equal(Ranked[1]?.count, 1);
    assert.ok(!Ranked.some((Entry_) => Entry_.path === "doc/INDEX.md"));
  });
  Check(Count, "A6: Adjacent respects the window and the limit", () => {
    const Touches = Fold([
      "doc/INDEX.md",
      "doc/NEAR.md",
      "doc/FAR.md",
      "doc/STYLE.md"
    ]);
    assert.deepEqual(
      Library.Adjacent(Touches, "doc/INDEX.md", { window: 1 }).map((Entry_) => Entry_.path),
      ["doc/NEAR.md"]
    );
    assert.equal(
      Library.Adjacent(Touches, "doc/INDEX.md", { window: 8, limit: 1 }).length,
      1
    );
  });
  Check(Count, "A7: Root finds the directory with package.json by walking upward", () => {
    const Root = Tree("pack-adjacent-root-");
    Put(Root, "package.json", "{}");
    const Nested = Put(Root, "Source/Function/Nested.ts");
    assert.equal(Library.Root(Nested), Root);
    assert.equal(Library.Root(`${Root}/package.json`), Root);
  });
  Check(Count, "A8: Root falls back to the cwd and returns undefined without one", () => {
    const Home = Tree("pack-adjacent-cwd-");
    Put(Home, "Documentation/INDEX.md");
    assert.equal(Library.Root(`${Home}/Documentation/INDEX.md`), void 0);
    assert.equal(Library.Root(`${Home}/Documentation/INDEX.md`, Home), Home);
    assert.equal(Library.Root("", Home), Home);
    assert.equal(Library.Root(""), void 0);
  });
  Check(Count, "A9: Resolve with builtin false returns undefined for a layer-less workspace", () => {
    const Home = Tree("pack-adjacent-home-");
    const Root = Tree("pack-adjacent-builtin-");
    Put(Root, "Documentation/INDEX.md");
    assert.equal(Library.Resolve(Root, { home: Home, builtin: false }), void 0);
    assert.equal(Library.Resolve(Root, { home: Home }), Library.Builtin);
  });
  Check(Count, "A10: Resolve with builtin false still returns a workspace with a repo layer", () => {
    const Home = Tree("pack-adjacent-home-");
    const Root = Tree("pack-adjacent-repo-");
    Put(Root, ".dsh/pack.yml", `signature:
  - docs/STYLE.md
`);
    Put(Root, "docs/STYLE.md");
    const Pack = Library.Resolve(Root, { home: Home, builtin: false });
    assert.notEqual(Pack, void 0);
    assert.deepEqual(Pack?.signature, ["docs/STYLE.md"]);
  });
  return Finish(Count, "Adjacent");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Adjacent`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

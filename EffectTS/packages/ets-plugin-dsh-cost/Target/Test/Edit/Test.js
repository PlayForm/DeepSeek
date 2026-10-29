import assert from "node:assert/strict";
import Edit from "../../../Target/Function/Edit.js";
import { Check, Finish, MakeCounter } from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  Check(Count, "E3: a single edit yields one row with the right line and byte counts", () => {
    const Rows = Edit(
      "edit",
      JSON.stringify({ file_path: "/w/a.ts", old_string: "a\nb\nc", new_string: "x\ny" }),
      0
    );
    assert.equal(Rows.length, 1, `rows ${Rows.length}`);
    const Row = Rows[0];
    assert.ok(Row !== void 0, "the single hunk exists");
    assert.equal(Row.Ordinal, 0, `ordinal ${Row.Ordinal}`);
    assert.equal(Row.LinesRemoved, 3, `lines removed ${Row.LinesRemoved}`);
    assert.equal(Row.LinesAdded, 2, `lines added ${Row.LinesAdded}`);
    assert.equal(Row.BytesRemoved, 5, `bytes removed ${Row.BytesRemoved}`);
    assert.equal(Row.BytesAdded, 3, `bytes added ${Row.BytesAdded}`);
  });
  Check(Count, "E3: a multi-edit yields one row per entry with ascending ordinals", () => {
    const Rows = Edit(
      "multi_edit",
      JSON.stringify({
        file_path: "/w/a.ts",
        edits: [
          { old_string: "one", new_string: "1\n2" },
          { old_string: "two\nthree", new_string: "2" },
          { old_string: "x", new_string: "y\nz\nw" }
        ]
      }),
      0
    );
    assert.equal(Rows.length, 3, `rows ${Rows.length}`);
    assert.deepEqual(
      Rows.map((Row) => Row.Ordinal),
      [0, 1, 2],
      "the ordinals ascend"
    );
    const First = Rows[0];
    assert.ok(First !== void 0, "the first hunk exists");
    assert.equal(First.LinesAdded, 2, `first added ${First.LinesAdded}`);
    assert.equal(First.LinesRemoved, 1, `first removed ${First.LinesRemoved}`);
    const Second = Rows[1];
    assert.ok(Second !== void 0, "the second hunk exists");
    assert.equal(Second.LinesRemoved, 2, `second removed ${Second.LinesRemoved}`);
  });
  Check(Count, "E3: a write yields one row from the content", () => {
    const Rows = Edit(
      "write",
      JSON.stringify({ file_path: "/w/a.ts", content: "one\ntwo\nthree" }),
      0
    );
    assert.equal(Rows.length, 1, `rows ${Rows.length}`);
    const Row = Rows[0];
    assert.ok(Row !== void 0, "the written hunk exists");
    assert.equal(Row.LinesAdded, 3, `lines added ${Row.LinesAdded}`);
    assert.equal(Row.LinesRemoved, 0, `lines removed ${Row.LinesRemoved}`);
    assert.equal(Row.BytesAdded, 13, `bytes added ${Row.BytesAdded}`);
    const Empty = Edit("write", JSON.stringify({ file_path: "/w/a.ts", content: "" }), 0);
    assert.equal(Empty[0]?.LinesAdded, 0, "an empty content adds no lines");
  });
  Check(Count, "E3: malformed or alien arguments yield an empty array and do not throw", () => {
    assert.deepEqual(Edit("edit", "{not json", 0), [], "malformed JSON");
    assert.deepEqual(Edit("write", "[]", 0), [], "a non-object payload");
    assert.deepEqual(Edit("unknown", JSON.stringify({ content: "x" }), 0), [], "an unmapped tool");
    assert.deepEqual(Edit("multi_edit", JSON.stringify({ edits: "no" }), 0), [], "a non-array edits key");
    assert.deepEqual(Edit("edit", "null", 0), [], "a null payload");
  });
  return Finish(Count, "Edit");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Edit`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

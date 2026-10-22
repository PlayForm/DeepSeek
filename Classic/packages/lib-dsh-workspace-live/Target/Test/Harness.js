import assert from "node:assert/strict";
import * as Library from "../../Target/Library.js";
const Render = Library.Render;
const Collapse = Library.Collapse;
const Packet = Library.Packet;
const MakeCounter = () => ({ N: 0, F: 0 });
const Check = (Count, Label, Assertions) => {
  Count.N++;
  try {
    Assertions();
    console.log(`PASS - ${Label}`);
  } catch (_Error) {
    Count.F++;
    console.log(`FAIL - ${Label}`);
    console.log(_Error instanceof Error ? _Error.message : String(_Error));
  }
};
const Finish = (Count, Name) => {
  if (Count.F !== 0) {
    throw new Error(`${Name}: ${Count.F} failed check(s)`);
  }
  return Count.N;
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Count = MakeCounter();
  Check(Count, "selfcheck: a passing assertion counts as PASS", () => {
    assert.equal(1, 1);
  });
  Check(Count, "selfcheck: a failing assertion counts as FAIL (expected)", () => {
    assert.equal(1, 2);
  });
  Check(Count, "selfcheck: the built library exports Render, Collapse and Packet", () => {
    assert.equal(typeof Render, "function");
    assert.equal(typeof Collapse, "function");
    assert.equal(typeof Packet, "function");
    assert.equal(
      Render({ id: "s", kind: "note", title: "t", lines: ["x"], version: "1" }),
      [
        "--- WORKSPACE SECTION s (note) - t @ 1 ---",
        "x",
        "--- END WORKSPACE SECTION s ---"
      ].join("\n")
    );
  });
  if (Count.N === 3 && Count.F === 1) {
    console.log("Harness selfcheck OK");
  } else {
    console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
    process.exitCode = 1;
  }
}
export {
  Check,
  Collapse,
  Finish,
  MakeCounter,
  Packet,
  Render
};
//# sourceMappingURL=Harness.js.map

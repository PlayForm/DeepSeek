import assert from "node:assert/strict";
import StoreFactory from "../../../Target/Function/Store.js";
import { BuiltSource, Check, CheckAsync, Finish, MakeCounter } from "../Harness.js";
const Event = (Sequence, Path) => ({
  operationId: `op-${Sequence}`,
  parentId: "op-0",
  category: "fs",
  path: Path,
  sequence: Sequence
});
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Store = StoreFactory({ maxEvents: 50, maxRepresentations: 100 });
    const First = Store.getSnapshot();
    const Second = Store.getSnapshot();
    Check(Count, "S1: getSnapshot is stable - the same reference across reads", () => {
      assert.equal(First, Second);
      assert.deepEqual(First, { sequence: 0, representations: [], events: [] });
    });
    await CheckAsync(Count, "S2: a quiet wait with no event emits nothing (no polling)", async () => {
      let Calls = 0;
      Store.subscribe(() => {
        Calls += 1;
      });
      await new Promise((Resolve) => setTimeout(Resolve, 50));
      assert.equal(Calls, 0);
      assert.equal(Store.getSnapshot(), First);
    });
  }
  {
    const Store = StoreFactory({ maxEvents: 50, maxRepresentations: 100 });
    Check(Count, "S3: ingest with a path creates the file representation", () => {
      Store.ingest(Event(1, "src/a.ts"));
      const View = Store.getSnapshot();
      assert.deepEqual(View.representations, [
        {
          id: "file:src/a.ts",
          kind: "file",
          label: "src/a.ts",
          version: "unknown",
          lastSequence: 1
        }
      ]);
      assert.equal(View.sequence, 1);
    });
    Check(Count, "S4: a second event on the same path updates lastSequence in place", () => {
      Store.ingest(Event(2, "src/a.ts"));
      const View = Store.getSnapshot();
      assert.equal(View.representations.length, 1);
      assert.equal(View.representations[0].id, "file:src/a.ts");
      assert.equal(View.representations[0].lastSequence, 2);
      assert.equal(View.sequence, 2);
    });
    Check(Count, "S5: the sequence takes the running maximum", () => {
      Store.ingest(Event(1, "src/out-of-order.ts"));
      assert.equal(Store.getSnapshot().sequence, 2);
      Store.ingest(Event(9, "src/later.ts"));
      assert.equal(Store.getSnapshot().sequence, 9);
    });
  }
  {
    const Store = StoreFactory({ maxEvents: 3, maxRepresentations: 2 });
    Check(Count, "S6: the event tail is bounded - the oldest drops", () => {
      for (let Index = 1; Index <= 5; Index++) Store.ingest(Event(Index, `p${Index}.ts`));
      const View = Store.getSnapshot();
      assert.deepEqual(
        View.events.map((E) => E.sequence),
        [3, 4, 5]
      );
    });
    Check(Count, "S7: the representations are bounded - the oldest drops", () => {
      assert.deepEqual(
        Store.getSnapshot().representations.map((R) => R.id),
        ["file:p4.ts", "file:p5.ts"]
      );
    });
  }
  {
    const Store = StoreFactory({ maxEvents: 50, maxRepresentations: 100 });
    Store.ingest(Event(4, "src/a.ts"));
    Check(Count, "S8: refresh replaces the representation set from the graph", () => {
      Store.refresh({
        indexRevision: "r1",
        nodes: [
          { id: "file:src/a.ts", kind: "File", path: "src/a.ts", fingerprint: "f1", version: "3" },
          { id: "doc:readme", kind: "DocSection", path: "README.md", name: "Readme", fingerprint: "f2", version: "1" },
          { id: "sym:main", kind: "Symbol", path: "src/main.ts", name: "main", fingerprint: "f3", version: "5" }
        ]
      });
      const View = Store.getSnapshot();
      assert.deepEqual(View.representations, [
        { id: "file:src/a.ts", kind: "file", label: "src/a.ts", version: "3", lastSequence: 4 },
        { id: "doc:readme", kind: "doc", label: "Readme", version: "1", lastSequence: 4 },
        { id: "sym:main", kind: "symbol", label: "main", version: "5", lastSequence: 4 }
      ]);
    });
    Check(Count, "S9: refresh keeps the sequence and the event tail", () => {
      const View = Store.getSnapshot();
      assert.equal(View.sequence, 4);
      assert.equal(View.events.length, 1);
    });
  }
  {
    const Store = StoreFactory({ maxEvents: 50, maxRepresentations: 100 });
    Check(Count, "S10: each emit notifies once and yields a NEW snapshot object", () => {
      let Calls = 0;
      Store.subscribe(() => {
        Calls += 1;
      });
      const Before = Store.getSnapshot();
      Store.ingest(Event(1, "src/x.ts"));
      assert.equal(Calls, 1);
      assert.notEqual(Store.getSnapshot(), Before);
      Store.refresh({ indexRevision: "r2", nodes: [] });
      assert.equal(Calls, 2);
    });
  }
  Check(Count, "S11: the built store source has no timer and no Node API", () => {
    const Source = BuiltSource("../Function/Store.js");
    assert.equal(/setInterval|setTimeout/.test(Source), false);
    assert.equal(/node:/.test(Source), false);
    assert.equal(/require\(/.test(Source), false);
  });
  return Finish(Count, "Store-And-Snapshot");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Store-And-Snapshot`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

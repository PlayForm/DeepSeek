import assert from "node:assert/strict";
import Allocate from "../../../Target/Function/Allocate.js";
import { Check, Finish, MakeCounter, Validate } from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  const Config = Validate({ enabled: true });
  const Costed = { Input: 10, Output: 8, CacheRead: 0, CacheWrite: 0, Reasoning: 0, Total: 18, Currency: "USD" };
  const Usage = {
    SessionId: "s",
    Turn: 2,
    Step: 1,
    Seq: 9,
    Provider: "p",
    Model: "m",
    InputTokens: 0,
    OutputTokens: 0,
    CacheReadTokens: 0,
    CacheWriteTokens: 0,
    ReasoningTokens: 0,
    TotalTokens: 0,
    At: 0
  };
  const Written = [
    {
      SessionId: "s",
      Turn: 2,
      Step: 1,
      Seq: 9,
      CallKey: "k",
      Tool: "write",
      Path: "/w/a.ts",
      Kind: "edit",
      BytesBefore: null,
      BytesAfter: null,
      BytesDelta: 30
    },
    {
      SessionId: "s",
      Turn: 2,
      Step: 1,
      Seq: 9,
      CallKey: "k",
      Tool: "write",
      Path: "/w/b.ts",
      Kind: "edit",
      BytesBefore: null,
      BytesAfter: null,
      BytesDelta: 10
    }
  ];
  Check(Count, "A1: the rows sum to the call's price within 1e-9 (the conservation law)", () => {
    const Rows = Allocate(Usage, Costed, Written, { Surface: 0, PerPath: /* @__PURE__ */ new Map() }, Config);
    const Summed = Rows.reduce((Sum, Row) => Sum + Row.DirectCost + Row.AmortizedCost, 0);
    assert.ok(Math.abs(Summed - Costed.Total) <= 1e-9, `the rows sum to ${Summed}, the call costs ${Costed.Total}`);
  });
  Check(Count, "A1: the written files split the output half by changed bytes", () => {
    const Rows = Allocate(Usage, Costed, Written, { Surface: 0, PerPath: /* @__PURE__ */ new Map() }, Config);
    const A = Rows.find((Row) => Row.Path === "/w/a.ts");
    const B = Rows.find((Row) => Row.Path === "/w/b.ts");
    assert.ok(Math.abs((A?.DirectCost ?? 0) - 6) <= 1e-9, `a.ts direct ${A?.DirectCost}`);
    assert.ok(Math.abs((B?.DirectCost ?? 0) - 2) <= 1e-9, `b.ts direct ${B?.DirectCost}`);
  });
  Check(Count, "A1: a file read early still carries its amortized mass into a later call", () => {
    const Rows = Allocate(Usage, Costed, [], { Surface: 100, PerPath: /* @__PURE__ */ new Map([["/w/a.ts", 50]]) }, Config);
    const A = Rows.find((Row) => Row.Path === "/w/a.ts");
    assert.ok(A !== void 0, "the read file keeps a row");
    assert.ok(Math.abs(A.AmortizedCost - 5) <= 1e-9, `a.ts amortized ${A.AmortizedCost}`);
    const Summed = Rows.reduce((Sum, Row) => Sum + Row.DirectCost + Row.AmortizedCost, 0);
    assert.ok(Math.abs(Summed - Costed.Total) <= 1e-9, `the rows sum to ${Summed}`);
    assert.ok(Math.abs((Rows.find((Row) => Row.Path === null)?.AmortizedCost ?? 0) - 5) <= 1e-9);
  });
  return Finish(Count, "Allocate");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Allocate`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

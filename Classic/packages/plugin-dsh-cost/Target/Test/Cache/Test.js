import assert from "node:assert/strict";
import Allocate from "../../../Target/Function/Allocate.js";
import Mass from "../../../Target/Function/Mass.js";
import { Check, Finish, MakeCounter, Validate } from "../Harness.js";
const Estimate = () => 10;
const runTest = async () => {
  const Count = MakeCounter();
  const Config = Validate({ enabled: true });
  const Events = [
    { type: "session", cwd: "/w" },
    {
      type: "tool/call",
      data: { callId: "c1", name: "read", arguments: JSON.stringify({ file_path: "/w/a.ts" }) }
    },
    { type: "tool/result", data: { message: { source: { callId: "c1" } } } },
    {
      type: "tool/call",
      data: { callId: "c2", name: "read", arguments: JSON.stringify({ file_path: "/w/b.ts" }) }
    },
    { type: "tool/result", data: { message: { source: { callId: "c2" } } } }
  ];
  const Costed = { Input: 8, Output: 6, CacheRead: 2, CacheWrite: 0, Reasoning: 0, Total: 16, Currency: "USD" };
  const Usage = {
    SessionId: "s",
    Turn: 1,
    Step: 1,
    Seq: 0,
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
  const Massed = Mass(Estimate)(Events, 10);
  Check(Count, "C1: the first node fills the budget and the second stays uncached", () => {
    assert.equal(Massed.Surface, 20, `surface ${Massed.Surface}`);
    assert.equal(Massed.CachedSurface, 10, `cached surface ${Massed.CachedSurface}`);
    assert.equal(Massed.PerPath.get("/w/a.ts"), 10, `a.ts total mass`);
    assert.equal(Massed.PerPath.get("/w/b.ts"), 10, `b.ts total mass`);
  });
  Check(Count, "C1: the cached and uncached masses split per file", () => {
    assert.equal(Massed.Cached.get("/w/a.ts"), 10, "a.ts is entirely inside the cached prefix");
    assert.ok(!Massed.Cached.has("/w/b.ts"), "b.ts carries no cached mass");
  });
  Check(Count, "C2: the cached input follows the cached mass, the uncached the rest", () => {
    const Rows = Allocate(Usage, Costed, [], Massed, Config);
    const A = Rows.find((Row) => Row.Path === "/w/a.ts");
    const B = Rows.find((Row) => Row.Path === "/w/b.ts");
    assert.ok(A !== void 0, "a.ts keeps a row");
    assert.ok(B !== void 0, "b.ts keeps a row");
    assert.ok(Math.abs(A.AmortizedCost - 2) <= 1e-9, `a.ts amortized ${A.AmortizedCost}`);
    assert.ok(Math.abs(B.AmortizedCost - 8) <= 1e-9, `b.ts amortized ${B.AmortizedCost}`);
  });
  Check(Count, "C2: the conservation law still holds with the cache split", () => {
    const Rows = Allocate(Usage, Costed, [], Massed, Config);
    const Summed = Rows.reduce((Sum, Row) => Sum + Row.DirectCost + Row.AmortizedCost, 0);
    assert.ok(
      Math.abs(Summed - Costed.Total) <= 1e-9,
      `the rows sum to ${Summed}, the call costs ${Costed.Total}`
    );
  });
  return Finish(Count, "Cache");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Cache`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

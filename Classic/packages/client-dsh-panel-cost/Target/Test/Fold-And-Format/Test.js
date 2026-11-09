import assert from "node:assert/strict";
import { Check, Finish, MakeCounter } from "../Harness.js";
import Fold from "../../../Target/Function/Fold.js";
import Price from "../../../Target/Function/Price.js";
import Count from "../../../Target/Function/Count.js";
import CountShort from "../../../Target/Function/CountShort.js";
import Rate from "../../../Target/Function/Rate.js";
import Share from "../../../Target/Function/Share.js";
import Lines from "../../../Target/Function/Lines.js";
const Tokens = (Input, Read, Write, Output) => ({
  input: Input,
  output: Output,
  cacheRead: Read,
  cacheWrite: Write,
  reasoning: 0,
  total: Input + Read + Write + Output,
  reported: null
});
const Money = (Total, Input, Read, Output) => ({
  input: Input,
  output: Output,
  cacheRead: Read,
  cacheWrite: 0,
  reasoning: 0,
  total: Total,
  other: Math.max(0, Total - Read - Input - Output)
});
const Call = (overrides = {}) => ({
  turn: 1,
  step: 1,
  seq: 1,
  at: 0,
  provider: "deepseek",
  model: "model-a",
  mode: "standard",
  region: null,
  tier: null,
  priced: true,
  currency: "USD",
  tokens: Tokens(0, 0, 0, 0),
  cost: Money(0, 0, 0, 0),
  saving: 0,
  attempts: 1,
  error: null,
  surfaceTokens: 0,
  purpose: null,
  contextWindow: null,
  utilization: null,
  latencyMs: null,
  firstTokenMs: null,
  tokensPerSecond: null,
  direct: 0,
  amortized: 0,
  allocations: 0,
  files: [],
  ...overrides
});
const Touch = (Path, overrides = {}) => ({
  path: Path,
  kind: null,
  stage: null,
  tool: null,
  branch: null,
  readBeforeEdit: false,
  direct: 0,
  amortized: 0,
  total: 0,
  linesDelta: null,
  bytesDelta: null,
  durationMs: null,
  touched: false,
  at: 0,
  ...overrides
});
const Response = (calls, summary = {}) => ({
  ok: true,
  code: "ok",
  message: null,
  path: "",
  rows: calls.length,
  truncated: false,
  session: null,
  currency: "USD",
  currencies: [],
  summary,
  calls
});
const runTest = () => {
  const Meter = MakeCounter();
  Check(Meter, "F1: the Price ladder matches the acceptance cases", () => {
    assert.equal(Price(0, "USD"), "$0.00");
    assert.equal(Price(0.0123, "USD"), "$0.0123");
    assert.equal(Price(123e-6, "USD"), "$0.000123");
    assert.equal(Price(1.5, "USD"), "$1.50");
    assert.equal(Price(1234.567, "USD"), "$1,234.57");
    assert.equal(Price(-0.0123, "USD"), "-$0.0123");
    assert.equal(Price(0.0123, "EUR"), "EUR 0.0123");
    assert.equal(Price(null, "USD"), "-");
    assert.equal(Price(1e-7, "USD"), "<$0.000001");
  });
  Check(Meter, "F2: Count groups thousands and CountShort walks the K/M ladder", () => {
    assert.equal(Count(47300), "47,300");
    assert.equal(Count(null), "-");
    assert.equal(CountShort(47300), "47.3K");
    assert.equal(CountShort(999), "1.00K");
    assert.equal(CountShort(12e6), "12.0M");
    assert.equal(CountShort(null), "-");
  });
  Check(Meter, "F3: Rate renders two-decimal percent and Lines signs the delta", () => {
    assert.equal(Rate(0.8035), "80.35%");
    assert.equal(Rate(0), "0.00%");
    assert.equal(Rate(null), "-");
    assert.equal(Lines(12), "+12");
    assert.equal(Lines(-3), "-3");
    assert.equal(Lines(null), "");
  });
  Check(Meter, "F4: Share scales by the square root and guards the scale", () => {
    assert.equal(Share(25, 100), 0.5);
    assert.equal(Share(100, 100), 1);
    assert.equal(Share(0, 100), 0);
    assert.equal(Share(50, 0), 1);
  });
  Check(Meter, "F5: an empty calls list folds to the empty snapshot, summary verbatim", () => {
    const Marker = { calls: 7, currency: "EUR" };
    const Empty = Fold(Response([], Marker));
    assert.deepEqual(Empty.turns, []);
    assert.equal(Empty.steps, 0);
    assert.ok(Empty.summary === Marker);
  });
  Check(
    Meter,
    "F6: one turn with two calls sums the buckets and computes the token-weighted cache hit",
    () => {
      const First = Call({
        step: 1,
        tokens: Tokens(100, 600, 100, 50),
        cost: Money(0.25, 0.125, 0.0625, 0.0625)
      });
      const Second = Call({
        step: 2,
        tokens: Tokens(200, 300, 0, 50),
        cost: Money(0.75, 0.25, 0.25, 0.25)
      });
      const Folded = Fold(Response([Second, First]));
      assert.equal(Folded.turns.length, 1);
      const Turn = Folded.turns[0];
      assert.equal(Turn.turn, 1);
      assert.equal(Turn.steps.length, 2);
      assert.equal(Turn.steps[0].step, 1);
      assert.equal(Turn.steps[1].step, 2);
      assert.equal(Folded.steps, 2);
      assert.equal(Turn.cost.total, 1);
      assert.equal(Turn.cost.input, 0.375);
      assert.equal(Turn.cost.cacheRead, 0.3125);
      assert.equal(Turn.cost.output, 0.3125);
      assert.equal(Turn.cost.cacheWrite, 0);
      assert.equal(Turn.cost.other, 0);
      assert.equal(Turn.tokens.input, 300);
      assert.equal(Turn.tokens.cacheRead, 900);
      assert.equal(Turn.tokens.cacheWrite, 100);
      assert.equal(Turn.tokens.output, 100);
      assert.equal(Turn.tokens.total, 1400);
      assert.equal(Turn.cacheHit, 900 / 1300);
      assert.equal(Turn.steps[0].cacheHit, 0.75);
      assert.equal(Turn.steps[1].cacheHit, 0.6);
    }
  );
  Check(
    Meter,
    "F7: the dominant provider and model follow the largest total cost; a full tie keeps the earlier step",
    () => {
      const Cheaper = Call({
        step: 1,
        provider: "deepseek",
        model: "model-a",
        tokens: Tokens(100, 600, 100, 50),
        cost: Money(0.25, 0, 0, 0)
      });
      const Pricier = Call({
        step: 2,
        provider: "another",
        model: "model-b",
        tokens: Tokens(200, 100, 0, 50),
        cost: Money(1, 0, 0, 0)
      });
      const Dominated = Fold(Response([Cheaper, Pricier]));
      assert.equal(Dominated.turns[0].provider, "another");
      assert.equal(Dominated.turns[0].model, "model-b");
      const TieFirst = Call({
        step: 1,
        model: "model-a",
        tokens: Tokens(100, 600, 100, 50),
        cost: Money(0.5, 0, 0, 0)
      });
      const TieSecond = Call({
        step: 2,
        model: "model-b",
        tokens: Tokens(100, 600, 100, 50),
        cost: Money(0.5, 0, 0, 0)
      });
      const Tied = Fold(Response([TieSecond, TieFirst]));
      assert.equal(Tied.turns[0].model, "model-a");
    }
  );
  Check(
    Meter,
    "F8: unpriced calls, errors and retries are counted and different currencies flag the turn mixed",
    () => {
      const Failed = Call({
        step: 1,
        priced: false,
        attempts: 3,
        error: "rate_limit",
        currency: "USD"
      });
      const Euro = Call({ step: 2, currency: "EUR" });
      const Mixed = Fold(Response([Failed, Euro]));
      assert.equal(Mixed.turns[0].unpriced, 1);
      assert.equal(Mixed.turns[0].errors, 1);
      assert.equal(Mixed.turns[0].retries, 2);
      assert.equal(Mixed.turns[0].mixed, true);
      assert.equal(Mixed.turns[0].currency, "USD");
      const United = Fold(Response([Call({ turn: 2, step: 1 }), Call({ turn: 2, step: 2 })]));
      assert.equal(United.turns[0].mixed, false);
      assert.equal(United.turns[0].currency, "USD");
    }
  );
  Check(
    Meter,
    "F9: the file tally keys by path and sorts by total then path; the tool tally counts touched files only",
    () => {
      const Editor = Call({
        step: 1,
        files: [
          Touch("/src/a.ts", {
            direct: 0.25,
            amortized: 0.125,
            total: 0.375,
            linesDelta: 10,
            touched: true,
            tool: "edit",
            stage: "write"
          }),
          Touch("/src/b.ts", {
            direct: 0.5,
            amortized: 0.375,
            total: 0.875,
            linesDelta: -3,
            touched: true,
            tool: "write",
            stage: "edit"
          }),
          Touch("/src/c.ts", {
            direct: 0.125,
            total: 0.125,
            touched: false,
            tool: "read"
          })
        ]
      });
      const Reader = Call({
        step: 2,
        files: [
          Touch("/src/a.ts", {
            direct: 0.125,
            total: 0.125,
            linesDelta: 5,
            touched: true,
            tool: "edit",
            stage: "read"
          }),
          Touch("/src/d.ts", {
            direct: 0.5,
            total: 0.5,
            touched: true,
            tool: "write",
            stage: "write"
          })
        ]
      });
      const Folded = Fold(Response([Editor, Reader]));
      const Turn = Folded.turns[0];
      assert.deepEqual(
        Turn.files.map((Entry) => Entry.key),
        ["/src/b.ts", "/src/a.ts", "/src/d.ts", "/src/c.ts"]
      );
      assert.equal(Turn.files[0].total, 0.875);
      assert.equal(Turn.files[0].lines, -3);
      assert.equal(Turn.files[1].count, 2);
      assert.equal(Turn.files[1].direct, 0.375);
      assert.equal(Turn.files[1].amortized, 0.125);
      assert.equal(Turn.files[1].total, 0.5);
      assert.equal(Turn.files[1].lines, 15);
      assert.equal(Turn.files[1].stage, "write");
      assert.equal(Turn.files[2].total, 0.5);
      assert.equal(Turn.files[2].lines, 0);
      assert.equal(Turn.files[3].stage, null);
      assert.deepEqual(
        Turn.tools.map((Entry) => Entry.key),
        ["edit", "write"]
      );
      assert.equal(Turn.tools[0].count, 2);
      assert.equal(Turn.tools[1].count, 2);
      assert.equal(Turn.tools[0].total, 0);
    }
  );
  Check(Meter, "F10: a malformed response never throws and folds to a well-formed snapshot", () => {
    const Blank = Fold({});
    const Broken = Fold({ calls: null });
    const Sparse = Fold(Response([{ turn: 1, step: 1, seq: 1 }]));
    assert.doesNotThrow(() => Fold({ calls: [null, 7, void 0] }));
    assert.deepEqual(Blank.turns, []);
    assert.equal(Blank.steps, 0);
    assert.equal(Blank.summary.calls, 0);
    assert.equal(Blank.summary.currency, "USD");
    assert.deepEqual(Broken.turns, []);
    assert.equal(Broken.steps, 0);
    assert.equal(Sparse.turns.length, 1);
    const Turn = Sparse.turns[0];
    assert.equal(Turn.steps.length, 1);
    assert.equal(Turn.cost.total, 0);
    assert.equal(Turn.tokens.total, 0);
    assert.equal(Turn.cacheHit, null);
    assert.equal(Turn.steps[0].cacheHit, null);
    assert.equal(Turn.model, "");
    assert.equal(Turn.currency, "");
    assert.equal(Turn.mixed, false);
    assert.deepEqual(Turn.files, []);
    assert.deepEqual(Turn.tools, []);
  });
  return Finish(Meter, "Fold-And-Format");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = runTest();
  console.log(`${Pass} PASS - Fold-And-Format`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

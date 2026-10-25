import assert from "node:assert/strict";
import {
  Advance,
  Assemble,
  Block,
  Check,
  ClockBox,
  ExpectedTime,
  Finish,
  LinesWith,
  MakeClocked,
  MakeCounter,
  Post,
  PreStep,
  Validate,
  Ledger,
  rm,
  LiveSection
} from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  rm();
  ClockBox.Now = 17e11;
  const Run1 = MakeClocked(
    Validate({
      logFile: Ledger,
      enabled: true,
      refresh: "ttl",
      ttlCalls: 2,
      blocks: [Block("t", "time", "{{time}}")]
    })
  );
  const Out1 = await Assemble(Run1);
  const Text1 = LiveSection(Out1).text;
  {
    Check(Count, "ttl: the first assembly renders and caches", () => {
      assert.ok(LinesWith(Run1, "block rendered t (").length === 1);
      assert.ok(Text1.includes(ExpectedTime(ClockBox.Now)));
    });
    const Out2 = await Assemble(Run1);
    const Text2 = LiveSection(Out2).text;
    Check(Count, "ttl: the second assembly REUSES the cache (byte-identical body)", () => {
      assert.equal(Text2, Text1);
    });
    Check(Count, "ttl: the cache hit re-renders nothing (no new ledger line)", () => {
      assert.equal(LinesWith(Run1, "block rendered t (").length, 1);
    });
    Advance(1e3);
    const Out3 = await Assemble(Run1);
    const Text3 = LiveSection(Out3).text;
    Check(Count, "ttl: the expired TTL rebuilds and the time value CHANGES", () => {
      assert.equal(Text3 !== Text1, true);
      assert.ok(Text3.includes(ExpectedTime(ClockBox.Now)));
    });
    Check(Count, "ttl: ledger section rebuilt (ttl 2) byte-exact", () => {
      assert.deepEqual(LinesWith(Run1, "section rebuilt (ttl"), [
        "hook-dsh-live-containers: section rebuilt (ttl 2)"
      ]);
    });
    Check(Count, "ttl: the rebuild re-rendered the block (second rendered line)", () => {
      assert.equal(LinesWith(Run1, "block rendered t (").length, 2);
    });
  }
  rm();
  ClockBox.Now = 17e11;
  {
    const Run2 = MakeClocked(
      Validate({
        logFile: Ledger,
        enabled: true,
        refresh: "request",
        blocks: [Block("t", "time", "{{time}}")]
      })
    );
    const Out12 = await Assemble(Run2);
    const Text12 = LiveSection(Out12).text;
    Advance(1e3);
    const Out2 = await Assemble(Run2);
    const Text2 = LiveSection(Out2).text;
    Check(Count, "request: the second assembly re-renders (value changes)", () => {
      assert.equal(Text2 !== Text12, true);
      assert.ok(Text2.includes(ExpectedTime(ClockBox.Now)));
    });
    Check(Count, "request: ledger gains a rendered line per assembly", () => {
      assert.equal(LinesWith(Run2, "block rendered t (").length, 2);
    });
    Check(Count, "request: no global TTL cache line ever", () => {
      assert.equal(LinesWith(Run2, "section rebuilt").length, 0);
    });
  }
  rm();
  ClockBox.Now = 17e11;
  {
    const Run3 = MakeClocked(
      Validate({
        logFile: Ledger,
        enabled: true,
        blocks: [Block("p", "note", "stable", { trigger: "ttl", ttlCalls: 2 })]
      })
    );
    await Assemble(Run3);
    await Assemble(Run3);
    Check(Count, "per-block ttl: the second assembly reuses the block cache", () => {
      assert.equal(LinesWith(Run3, "block rendered p (").length, 1);
    });
    await Assemble(Run3);
    Check(Count, "per-block ttl: the third assembly re-renders (ttlCalls=2 elapsed)", () => {
      assert.equal(LinesWith(Run3, "block rendered p (").length, 2);
    });
  }
  rm();
  ClockBox.Now = 17e11;
  {
    const Run4 = MakeClocked(
      Validate({
        logFile: Ledger,
        enabled: true,
        blocks: [Block("e", "note", "eventful", { trigger: "event" })]
      })
    );
    await Assemble(Run4);
    await Assemble(Run4);
    Check(Count, "event: steady assemblies reuse the block cache", () => {
      assert.equal(LinesWith(Run4, "block rendered e (").length, 1);
    });
    await Post(Run4, "bash");
    await Assemble(Run4);
    Check(Count, "event: the post-execute observation marks the block dirty", () => {
      assert.equal(LinesWith(Run4, "block rendered e (").length, 2);
    });
  }
  rm();
  ClockBox.Now = 17e11;
  {
    const Run5 = MakeClocked(
      Validate({
        logFile: Ledger,
        enabled: true,
        blocks: [Block("g", "gauge", "s={{sinceLastTool}}")]
      })
    );
    await Assemble(Run5);
    await Post(Run5, "bash");
    await PreStep(Run5, 1);
    Check(Count, "per-turn reset: the attempts table is cleared on a user message", () => {
      const Shared = [...Run5.State.Registry][0];
      assert.deepEqual(Shared.attempts, {});
      assert.equal(Shared.turns, 1);
    });
  }
  rm();
  ClockBox.Now = 17e11;
  {
    const Run6 = MakeClocked(
      Validate({
        logFile: Ledger,
        enabled: true,
        refresh: "ttl",
        ttlCalls: 8,
        blocks: [Block("n", "note", "steady")]
      })
    );
    const Out12 = await Assemble(Run6);
    Run6.Listeners["tools/change"]();
    Check(Count, "tools/change: ledger section rebuilt (tools/change) byte-exact", () => {
      assert.deepEqual(LinesWith(Run6, "section rebuilt (tools/change)"), [
        "hook-dsh-live-containers: section rebuilt (tools/change)"
      ]);
    });
    const Out2 = await Assemble(Run6);
    Check(Count, "tools/change: the next assembly rebuilds the section body", () => {
      assert.equal(LiveSection(Out2).text, LiveSection(Out12).text);
      assert.equal(LinesWith(Run6, "section rebuilt (ttl").length, 0);
    });
    Check(Count, "tools/change: steady blocks are not re-rendered", () => {
      assert.equal(LinesWith(Run6, "block rendered n (").length, 1);
    });
  }
  return Finish(Count, "Recompute-And-Ttl");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Recompute-And-Ttl`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

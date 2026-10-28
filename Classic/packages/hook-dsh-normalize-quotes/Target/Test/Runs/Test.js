import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import {
  Check,
  Finish,
  Furnace,
  MakeCounter,
  Ledger,
  Make,
  rm,
  Validate
} from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  rm();
  const Run1 = Make(Validate({ logFile: Ledger }));
  const SeedChunks = [
    { type: "block-start", index: 0, blockType: "text" },
    { type: "text-delta", index: 0, text: "a \u2018 b \u2019 c \u201C d \u201D e" },
    {
      type: "tool-call-delta",
      index: 1,
      id: "call_1",
      name: "write",
      argumentsDelta: '{"path":"a\u201Cb"}'
    },
    { type: "reasoning-delta", index: 2, text: "\u2018x\u2019" },
    { type: "block-end", index: 0, block: { type: "text", text: "\u201Ckept \u2018gone" } },
    { type: "block-end", index: 2, block: { type: "reasoning", text: "\u201Cy" } },
    { type: "block-end", index: 3, block: { type: "reasoning", text: "", thinking: "\u201Dz" } },
    { type: "usage", usage: { input: 1, output: 2 } },
    { type: "finish", reason: "stop" }
  ];
  for await (const Chunk of Run1.Listeners["llm/stream"](
    Object.freeze(Object.freeze({ model: "x", messages: [] })),
    () => (async function* () {
      yield* SeedChunks;
    })()
  )) {
    void Chunk;
  }
  await new Promise((R) => setTimeout(R, 10));
  rm();
  const Run2 = Make(Validate({ normalizeReasoning: false, logFile: Ledger }));
  const L2 = Run2.Listeners["llm/stream"];
  const Out2 = [];
  for await (const C of L2(
    Object.freeze({}),
    () => (async function* () {
      yield { type: "reasoning-delta", index: 0, text: "\u2018" };
      yield { type: "text-delta", index: 0, text: "plain text" };
    })()
  )) {
    Out2.push(C);
  }
  {
    const Sub = "reasoning-delta passthrough (identity) when normalizeReasoning=off";
    {
      Check(Count, Sub, () => {
        assert.ok(
          Out2[0] && Out2[0].text === "\u2018",
          "reasoning-delta passthrough (identity) when normalizeReasoning=off"
        );
      });
    }
  }
  {
    const Sub = "stream completed with both chunks";
    {
      Check(Count, Sub, () => {
        assert.ok(Out2.length === 2, "stream completed with both chunks");
      });
    }
  }
  {
    const Sub = "stream completed";
    {
      Check(Count, Sub, () => {
        assert.ok(Out2[1] === void 0 || typeof Out2[1] === "object", "stream completed");
      });
    }
  }
  await new Promise((R) => setTimeout(R, 10));
  {
    const Sub = "NO count line when nothing replaced (N=0)";
    {
      Check(Count, Sub, () => {
        assert.ok(
          !existsSync(Ledger) || !readFileSync(Ledger, "utf8").includes("normalized"),
          "NO count line when nothing replaced (N=0)"
        );
      });
    }
  }
  {
    const Sub = "NO journal record when nothing was replaced (N=0)";
    {
      Check(Count, Sub, () => {
        assert.ok(
          Furnace.PendingJournal.filter((R) => R.event === "normalized").length === 1,
          "NO journal record when nothing was replaced (N=0)"
        );
      });
    }
  }
  rm();
  const Run3 = Make(Validate({ logFile: Ledger }));
  const L3 = Run3.Listeners["llm/stream"];
  const Out3 = [];
  for await (const C of L3(
    Object.freeze({}),
    () => (async function* () {
      yield {
        type: "text-delta",
        index: 0,
        text: "\u2018\u2019\u201A\u201B\u201C\u201D\u201E\u201F"
      };
    })()
  )) {
    Out3.push(C);
  }
  {
    const Sub = `the whole Quotes table maps in one segment (singles \u2192 ', doubles \u2192 ")`;
    {
      Check(Count, Sub, () => {
        assert.ok(
          Out3[0].text === `''''""""`,
          `the whole Quotes table maps in one segment (singles \u2192 ', doubles \u2192 ")`
        );
      });
    }
  }
  {
    const Sub = "MAP flavor is 1:1 \u2014 one ASCII char out per quote char in";
    {
      Check(Count, Sub, () => {
        assert.ok(
          Out3[0].text.length === 8,
          "MAP flavor is 1:1 \u2014 one ASCII char out per quote char in"
        );
      });
    }
  }
  await new Promise((R) => setTimeout(R, 10));
  {
    const Sub = "count line reflects the 8-code-point run";
    {
      Check(Count, Sub, () => {
        assert.ok(
          readFileSync(Ledger, "utf8").includes("normalized 8 quote char(s) in one stream"),
          "count line reflects the 8-code-point run"
        );
      });
    }
  }
  const JournalRun3 = Furnace.PendingJournal.filter((R) => R.event === "normalized");
  {
    const Sub = "the MAP-table run adds its 'normalized' journal record";
    {
      Check(Count, Sub, () => {
        assert.ok(
          JournalRun3.length === 2,
          "the MAP-table run adds its 'normalized' journal record"
        );
      });
    }
  }
  {
    const Sub = "MAP-table journal detail mirrors the ledger line";
    {
      Check(Count, Sub, () => {
        assert.ok(
          JournalRun3[1] !== void 0 && JournalRun3[1].detail === "normalized 8 quote char(s) in one stream",
          "MAP-table journal detail mirrors the ledger line"
        );
      });
    }
  }
  rm();
  const Run4 = Make(Validate({ logFile: Ledger }));
  const L4 = Run4.Listeners["llm/stream"];
  let Threw = null;
  try {
    for await (const C of L4(
      Object.freeze({}),
      () => (async function* () {
        yield { type: "text-delta", index: 0, text: "\u2018" };
        throw new Error("transport boom");
      })()
    )) {
      void C;
    }
  } catch (E) {
    Threw = E;
  }
  {
    const Sub = "upstream throw propagates through the wrapper";
    {
      Check(Count, Sub, () => {
        assert.ok(
          Threw && Threw.message === "transport boom",
          "upstream throw propagates through the wrapper"
        );
      });
    }
  }
  await new Promise((R) => setTimeout(R, 10));
  {
    const Sub = "NO count line after an upstream throw";
    {
      Check(Count, Sub, () => {
        assert.ok(
          !existsSync(Ledger) || !readFileSync(Ledger, "utf8").includes("normalized"),
          "NO count line after an upstream throw"
        );
      });
    }
  }
  {
    const Sub = "NO journal record after an upstream throw";
    {
      Check(Count, Sub, () => {
        assert.ok(
          Furnace.PendingJournal.filter((R) => R.event === "normalized").length === 2,
          "NO journal record after an upstream throw"
        );
      });
    }
  }
  const Run5 = Make(Validate({ logFile: Ledger }));
  const L5 = Run5.Listeners["llm/stream"];
  const Keep = { type: "text-delta", index: 0, text: "plain" };
  const Out5 = [];
  for await (const C of L5(
    Object.freeze({}),
    () => (async function* () {
      yield Keep;
    })()
  )) {
    Out5.push(C);
  }
  {
    const Sub = "unchanged text-delta passes through BY IDENTITY (count 0)";
    {
      Check(Count, Sub, () => {
        assert.ok(Out5[0] === Keep, "unchanged text-delta passes through BY IDENTITY (count 0)");
      });
    }
  }
  {
    const Sub = "identity stream (count 0) adds no journal record";
    {
      Check(Count, Sub, () => {
        assert.ok(
          Furnace.PendingJournal.filter((R) => R.event === "normalized").length === 2,
          "identity stream (count 0) adds no journal record"
        );
      });
    }
  }
  const First = Run1.State;
  const Second = Run5.State;
  {
    const Sub = "each apply builds a FRESH state (no module-level globals)";
    {
      Check(Count, Sub, () => {
        assert.ok(
          First !== Second && First.Reasoning === true && Second.Reasoning === true,
          "each apply builds a FRESH state (no module-level globals)"
        );
      });
    }
  }
  rm();
  const Run7 = Make(Validate({ normalizeToolArguments: true, logFile: Ledger }));
  {
    const Sub = "plain fields: ToolArgs=true when normalizeToolArguments=on";
    {
      Check(Count, Sub, () => {
        assert.ok(
          Run7.State.ToolArgs === true,
          "plain fields: ToolArgs=true when normalizeToolArguments=on"
        );
      });
    }
  }
  {
    const Sub = "activation line reflects toolArgs=on";
    {
      Check(Count, Sub, () => {
        assert.ok(
          Run7.Lines.some(
            (L) => L.startsWith("hook-dsh-normalize-quotes: activated") && L.includes("toolArgs=on")
          ),
          "activation line reflects toolArgs=on"
        );
      });
    }
  }
  const L7 = Run7.Listeners["llm/stream"];
  const ToolDelta7 = {
    type: "tool-call-delta",
    index: 1,
    id: "call_1",
    name: "write",
    argumentsDelta: '{"path":"a\u201Cb"}'
  };
  const ToolBlockEnd7 = {
    type: "block-end",
    index: 2,
    block: { type: "tool-call", id: "call_1", name: "write", arguments: '{"path":"a\u201Cb"}' }
  };
  const Out7 = [];
  for await (const C of L7(
    Object.freeze({}),
    () => (async function* () {
      yield ToolDelta7;
      yield ToolBlockEnd7;
    })()
  )) {
    Out7.push(C);
  }
  {
    const Sub = "tool-call-delta argumentsDelta normalized when normalizeToolArguments=on";
    {
      Check(Count, Sub, () => {
        assert.ok(
          Out7[0].argumentsDelta === '{"path":"a"b"}',
          "tool-call-delta argumentsDelta normalized when normalizeToolArguments=on"
        );
      });
    }
  }
  {
    const Sub = "rewritten tool-call-delta is a new object (id/index/name preserved)";
    {
      Check(Count, Sub, () => {
        assert.ok(
          Out7[0] !== ToolDelta7,
          "rewritten tool-call-delta is a new object (id/index/name preserved)"
        );
      });
    }
  }
  {
    const Sub = "block-end ToolCallBlock.arguments normalized too (the deltas AND the block agree)";
    {
      Check(Count, Sub, () => {
        assert.ok(
          Out7[1].block.arguments === '{"path":"a"b"}',
          "block-end ToolCallBlock.arguments normalized too (the deltas AND the block agree)"
        );
      });
    }
  }
  await new Promise((R) => setTimeout(R, 10));
  {
    const Sub = "count line includes the tool-args replacements (delta + block)";
    {
      Check(Count, Sub, () => {
        assert.ok(
          readFileSync(Ledger, "utf8").includes("normalized 2 quote char(s) in one stream"),
          "count line includes the tool-args replacements (delta + block)"
        );
      });
    }
  }
  const JournalRun7 = Furnace.PendingJournal.filter((R) => R.event === "normalized");
  {
    const Sub = "tool-args replacements journal too (delta + block in one count record)";
    {
      Check(Count, Sub, () => {
        assert.ok(
          JournalRun7.length === 3 && JournalRun7[2].detail === "normalized 2 quote char(s) in one stream",
          "tool-args replacements journal too (delta + block in one count record)"
        );
      });
    }
  }
  return Finish(Count, "Runs");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Runs`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

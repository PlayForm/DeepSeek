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
  const SPACES = "a\xA0b\u2000c\u3000d";
  const Listener = Run1.Listeners["llm/stream"];
  const Chunks = [
    { type: "block-start", index: 0, blockType: "text" },
    { type: "text-delta", index: 0, text: SPACES },
    {
      type: "tool-call-delta",
      index: 1,
      id: "call_1",
      name: "write",
      argumentsDelta: '{"path":"a\xA0b"}'
    },
    { type: "reasoning-delta", index: 2, text: "\xA0x\u2003" },
    { type: "block-end", index: 0, block: { type: "text", text: "\u202Fkept\u205Fgone" } },
    { type: "block-end", index: 2, block: { type: "reasoning", text: "\u1680y" } },
    { type: "block-end", index: 3, block: { type: "reasoning", text: "", thinking: "\xA0z" } },
    { type: "usage", usage: { input: 1, output: 2 } },
    { type: "finish", reason: "stop" }
  ];
  let NextCalls = 0;
  let Iterated = false;
  let IteratedAtNext = true;
  const Next = () => {
    NextCalls += 1;
    IteratedAtNext = Iterated;
    return (async function* () {
      yield* Chunks;
    })();
  };
  const Request = Object.freeze(Object.freeze({ model: "x", messages: [] }));
  const Wrapped = Listener(Request, Next);
  const Out = [];
  for await (const Chunk of Wrapped) {
    Iterated = true;
    Out.push(Chunk);
  }
  {
    const Sub = "next() called exactly once, synchronously (before iteration)";
    {
      Check(Count, Sub, () => {
        assert.ok(
          NextCalls === 1,
          "next() called exactly once, synchronously (before iteration)"
        );
      });
    }
  }
  {
    const Sub = "next() was called BEFORE any upstream iteration";
    {
      Check(Count, Sub, () => {
        assert.ok(IteratedAtNext === false, "next() was called BEFORE any upstream iteration");
      });
    }
  }
  {
    const Sub = "deep-frozen options untouched (still frozen)";
    {
      Check(Count, Sub, () => {
        assert.ok(Object.isFrozen(Request), "deep-frozen options untouched (still frozen)");
      });
    }
  }
  {
    const Sub = "chunk order/count preserved (1 in, 1 out)";
    {
      Check(Count, Sub, () => {
        assert.ok(Out.length === Chunks.length, "chunk order/count preserved (1 in, 1 out)");
      });
    }
  }
  {
    const Sub = "chunk type sequence identical to upstream";
    {
      Check(Count, Sub, () => {
        assert.ok(
          Out.map((C) => C.type).join(",") === Chunks.map((C) => C.type).join(","),
          "chunk type sequence identical to upstream"
        );
      });
    }
  }
  {
    const Sub = "block-start passthrough BY IDENTITY";
    {
      Check(Count, Sub, () => {
        assert.ok(Out[0] === Chunks[0], "block-start passthrough BY IDENTITY");
      });
    }
  }
  {
    const Sub = "tool-call-delta passthrough BY IDENTITY (argumentsDelta raw JSON untouched)";
    {
      Check(Count, Sub, () => {
        assert.ok(
          Out[2] === Chunks[2],
          "tool-call-delta passthrough BY IDENTITY (argumentsDelta raw JSON untouched)"
        );
      });
    }
  }
  {
    const Sub = "argumentsDelta non-breaking space still verbatim";
    {
      Check(Count, Sub, () => {
        assert.ok(
          Out[2].argumentsDelta.includes("\xA0"),
          "argumentsDelta non-breaking space still verbatim"
        );
      });
    }
  }
  {
    const Sub = "usage passthrough BY IDENTITY";
    {
      Check(Count, Sub, () => {
        assert.ok(Out[7] === Chunks[7], "usage passthrough BY IDENTITY");
      });
    }
  }
  {
    const Sub = "finish passthrough BY IDENTITY";
    {
      Check(Count, Sub, () => {
        assert.ok(Out[8] === Chunks[8], "finish passthrough BY IDENTITY");
      });
    }
  }
  {
    const Sub = "text-delta normalized (U+00A0/U+2000/U+3000 \u2192 ' ')";
    {
      Check(Count, Sub, () => {
        assert.ok(
          Out[1].text === "a b c d",
          "text-delta normalized (U+00A0/U+2000/U+3000 \u2192 ' ')"
        );
      });
    }
  }
  {
    const Sub = "rewritten text-delta is a new object, index preserved";
    {
      Check(Count, Sub, () => {
        assert.ok(
          Out[1] !== Chunks[1] && Out[1].index === 0,
          "rewritten text-delta is a new object, index preserved"
        );
      });
    }
  }
  {
    const Sub = "reasoning-delta normalized when reasoning=on";
    {
      Check(Count, Sub, () => {
        assert.ok(Out[3].text === " x ", "reasoning-delta normalized when reasoning=on");
      });
    }
  }
  {
    const Sub = "block-end TextBlock.text normalized";
    {
      Check(Count, Sub, () => {
        assert.ok(Out[4].block.text === " kept gone", "block-end TextBlock.text normalized");
      });
    }
  }
  {
    const Sub = "block-end ReasoningBlock.text normalized (rc.2 field)";
    {
      Check(Count, Sub, () => {
        assert.ok(Out[5].block.text === " y", "block-end ReasoningBlock.text normalized (rc.2 field)");
      });
    }
  }
  {
    const Sub = "block-end runtime `thinking` field normalized (defensive)";
    {
      Check(Count, Sub, () => {
        assert.ok(
          Out[6].block.thinking === " z",
          "block-end runtime `thinking` field normalized (defensive)"
        );
      });
    }
  }
  {
    const Sub = "rewritten block-end is a new object";
    {
      Check(Count, Sub, () => {
        assert.ok(Out[5] !== Chunks[5], "rewritten block-end is a new object");
      });
    }
  }
  await new Promise((R) => setTimeout(R, 10));
  const Log1 = existsSync(Ledger) ? readFileSync(Ledger, "utf8") : "";
  {
    const Sub = "count ledger line written after the 9-replacement stream (N>0)";
    {
      Check(Count, Sub, () => {
        assert.ok(
          Log1.includes("normalized 9 space char(s) in one stream"),
          "count ledger line written after the 9-replacement stream (N>0)"
        );
      });
    }
  }
  {
    const Sub = "exactly ONE count line for the stream";
    {
      Check(Count, Sub, () => {
        assert.ok(
          Log1.split("\n").filter((L) => L.includes("normalized")).length === 1,
          "exactly ONE count line for the stream"
        );
      });
    }
  }
  {
    const Sub = "logger line 'hook-dsh-normalize-spaces: normalized 9 space char(s) in one stream' (3 delta + 2 reasoning + 2 block-end + 1 thinking)";
    {
      Check(Count, Sub, () => {
        assert.ok(
          Run1.Lines.filter((L) => L.includes("normalized")).length === 1 && Run1.Lines[1] === "hook-dsh-normalize-spaces: normalized 9 space char(s) in one stream",
          "logger line 'hook-dsh-normalize-spaces: normalized 9 space char(s) in one stream' (3 delta + 2 reasoning + 2 block-end + 1 thinking)"
        );
      });
    }
  }
  const JournalRun1 = Furnace.PendingJournal.filter((R) => R.event === "normalized");
  {
    const Sub = "exactly ONE 'normalized' journal record after the 9-replacement stream";
    {
      Check(Count, Sub, () => {
        assert.ok(
          JournalRun1.length === 1,
          "exactly ONE 'normalized' journal record after the 9-replacement stream"
        );
      });
    }
  }
  {
    const Sub = "the 'normalized' record carries an empty path (stream-level event)";
    {
      Check(Count, Sub, () => {
        assert.ok(
          JournalRun1[0] !== void 0 && JournalRun1[0].path === "",
          "the 'normalized' record carries an empty path (stream-level event)"
        );
      });
    }
  }
  {
    const Sub = "journal detail byte-identical to the ledger count line";
    {
      Check(Count, Sub, () => {
        assert.ok(
          JournalRun1[0] !== void 0 && JournalRun1[0].detail === "normalized 9 space char(s) in one stream",
          "journal detail byte-identical to the ledger count line"
        );
      });
    }
  }
  {
    const Sub = "the 'normalized' record carries a numeric timestamp";
    {
      Check(Count, Sub, () => {
        assert.ok(
          JournalRun1[0] !== void 0 && typeof JournalRun1[0].at === "number",
          "the 'normalized' record carries a numeric timestamp"
        );
      });
    }
  }
  {
    const Sub = "the record routes to the factory pre-bind buffer (stage 2), not the per-State queue";
    {
      Check(Count, Sub, () => {
        assert.ok(
          Run1.State.Queue.filter((R) => R.event === "normalized").length === 0,
          "the record routes to the factory pre-bind buffer (stage 2), not the per-State queue"
        );
      });
    }
  }
  return Finish(Count, "Stream-Contract");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Stream-Contract`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

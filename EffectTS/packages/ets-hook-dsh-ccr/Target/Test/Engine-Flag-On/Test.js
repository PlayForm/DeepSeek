import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import {
  Check,
  Finish,
  MakeCounter,
  Make,
  Rm,
  Validate,
  Ledger,
  TextBlock,
  Exec,
  NextAccept,
  TerminalText,
  PlainText,
  HashOf
} from "../Harness.js";
import { ThresholdBytes, Eligible, Decide } from "../../../Target/Function/Engine.js";
const runTest = async () => {
  const Count = MakeCounter();
  Rm();
  {
    const Sub = "ThresholdBytes: 30% of the 256 MiB store budget (the nominal reference) = 80530636 bytes";
    Check(Count, Sub, () => {
      assert.ok(ThresholdBytes(268435456, 30) === 80530636);
    });
  }
  {
    const Sub = "ThresholdBytes: 30% of 10000 = 3000";
    Check(Count, Sub, () => {
      assert.ok(ThresholdBytes(1e4, 30) === 3e3);
    });
  }
  {
    const Sub = "ThresholdBytes: 0% yields a zero limit and Decide never crosses it";
    Check(Count, Sub, () => {
      assert.ok(
        ThresholdBytes(1e4, 0) === 0 && Decide([{ turn: 1, name: "bash", isError: false, size: 5 }], 9, 1e4, 0, 2, 4) === void 0
      );
    });
  }
  {
    const Sub = "Eligible: first-2 head and last-4 tail protected - only turns 3,4 are middle at CurrentTurn 9";
    Check(Count, Sub, () => {
      const Turn1 = { turn: 1, name: "bash", isError: false, size: 100, content: TextBlock("1") };
      const Turn3 = { turn: 3, name: "bash", isError: false, size: 1500, content: TextBlock("3") };
      const Turn4 = { turn: 4, name: "bash", isError: false, size: 1500, content: TextBlock("4") };
      const Turn9 = { turn: 9, name: "bash", isError: false, size: 1500, content: TextBlock("9") };
      assert.ok(
        JSON.stringify(Eligible([Turn1, Turn3, Turn4, Turn9], 9, 2, 4).map((R) => R.turn)) === JSON.stringify([3, 4])
      );
    });
  }
  {
    const Sub = "Eligible: a record inside the last-4 window (turn 3 at CurrentTurn 6) is protected";
    Check(Count, Sub, () => {
      const Turn3 = { turn: 3, name: "bash", isError: false, size: 1500, content: TextBlock("3") };
      assert.ok(JSON.stringify(Eligible([Turn3], 6, 2, 4)) === "[]");
    });
  }
  {
    const Sub = "Eligible: the current turn itself sits inside the last-4 window and is never eligible";
    Check(Count, Sub, () => {
      const Turn4Current = {
        turn: 4,
        name: "bash",
        isError: false,
        size: 10,
        content: TextBlock("c")
      };
      assert.ok(JSON.stringify(Eligible([Turn4Current], 4, 2, 4)) === "[]");
    });
  }
  {
    const Sub = "Decide: under the threshold -> no archive (undefined)";
    Check(Count, Sub, () => {
      const Turn3 = { turn: 3, name: "bash", isError: false, size: 1500, content: TextBlock("3") };
      assert.ok(Decide([Turn3], 9, 1e4, 30, 2, 4) === void 0);
    });
  }
  {
    const Sub = "Decide: over the threshold but zero middle records -> no archive";
    Check(Count, Sub, () => {
      const Turn9 = { turn: 9, name: "bash", isError: false, size: 1500, content: TextBlock("9") };
      assert.ok(Decide([Turn9], 9, 1e4, 30, 2, 4) === void 0);
    });
  }
  {
    const Sub = "Decide: the crossing archives the MIDDLE records only (turns 3,4 of 3,4,9)";
    Check(Count, Sub, () => {
      const Turn3 = { turn: 3, name: "bash", isError: false, size: 1500, content: TextBlock("3") };
      const Turn4 = { turn: 4, name: "bash", isError: false, size: 1500, content: TextBlock("4") };
      const Turn9 = { turn: 9, name: "bash", isError: false, size: 1500, content: TextBlock("9") };
      const Plan = Decide([Turn3, Turn4, Turn9], 9, 1e4, 30, 2, 4);
      assert.ok(Plan !== void 0 && Plan.archive.length === 2);
    });
  }
  {
    const Sub = "Decide: the archived bytes are the middle records' sizes";
    Check(Count, Sub, () => {
      const Turn3 = { turn: 3, name: "bash", isError: false, size: 1500, content: TextBlock("3") };
      const Turn4 = { turn: 4, name: "bash", isError: false, size: 1500, content: TextBlock("4") };
      const Turn9 = { turn: 9, name: "bash", isError: false, size: 1500, content: TextBlock("9") };
      const Plan = Decide([Turn3, Turn4, Turn9], 9, 1e4, 30, 2, 4);
      assert.ok(Plan !== void 0 && Plan.bytes === 3e3);
    });
  }
  {
    const Sub = "Decide: the last-4 turn stays protected";
    Check(Count, Sub, () => {
      const Turn3 = { turn: 3, name: "bash", isError: false, size: 1500, content: TextBlock("3") };
      const Turn4 = { turn: 4, name: "bash", isError: false, size: 1500, content: TextBlock("4") };
      const Turn9 = { turn: 9, name: "bash", isError: false, size: 1500, content: TextBlock("9") };
      const Plan = Decide([Turn3, Turn4, Turn9], 9, 1e4, 30, 2, 4);
      assert.ok(Plan !== void 0 && Plan.archive.every((R) => R.turn !== 9));
    });
  }
  Rm();
  const Run12 = Make(Validate({ contextEngine: true, logFile: Ledger, storeBudgetBytes: 1e4 }));
  {
    const Pre = Run12.Listeners["agent/pre-step"];
    const Retrieve12 = Run12.Registered[0];
    const PreCall = (Turn) => Pre(
      { agent: {}, messages: [], turn: Turn, step: 0, signal: new AbortController().signal },
      async () => ({ kind: "accept" })
    );
    const EngineLines = () => Run12.Lines.filter((Line) => Line.startsWith("ccr: engine "));
    const ExecBash = Exec("bash");
    {
      const Sub = "engine flag ON: the agent/pre-step listener is registered";
      Check(Count, Sub, () => {
        assert.ok(typeof Pre === "function");
      });
    }
    {
      const Sub = "engine flag ON: tools/post-execute + agent/pre-step, plus the State builder's P10 volatile-update refresh";
      Check(Count, Sub, () => {
        assert.ok(
          Object.keys(Run12.Listeners).length === 3 && Run12.Listeners["tools/post-execute"] !== void 0 && Run12.Listeners["tools/post-execute"] !== Pre
        );
      });
    }
    {
      const Sub = "engine flag ON: the runtime is built (Turn=1, empty log)";
      Check(Count, Sub, () => {
        assert.ok(
          Run12.State.EngineRuntime !== void 0 && Run12.State.EngineRuntime.Turn === 1 && Run12.State.EngineRuntime.Records.length === 0
        );
      });
    }
    {
      const Sub = "pre-step: the downstream decision is returned unchanged";
      await (async () => {
        const Out1 = await PreCall(1);
        Check(Count, Sub, () => {
          assert.ok(Out1 !== void 0 && Out1.kind === "accept");
        });
      })();
    }
    {
      const Sub = "pre-step turn 1: no archive, no engine line";
      Check(Count, Sub, () => {
        assert.ok(EngineLines().length === 0);
      });
    }
    {
      const Sub = "engine flag ON: post-execute behavior unchanged - the small result still passes through";
      await (async () => {
        const Small = TextBlock(PlainText(1800));
        const OutSmall = await Run12.Listeners["tools/post-execute"](
          ExecBash,
          { isError: false, value: {}, content: Small },
          NextAccept
        );
        Check(Count, Sub, () => {
          assert.ok(OutSmall.kind === "accept" && !JSON.stringify(OutSmall).includes("CCR"));
        });
      })();
    }
    {
      const Sub = "pre-step turn 3: under the threshold -> no archive line";
      await (async () => {
        await PreCall(3);
        Check(Count, Sub, () => {
          assert.ok(EngineLines().length === 0);
        });
      })();
    }
    {
      const Big = TextBlock(TerminalText("b".repeat(80), 40));
      await Run12.Listeners["tools/post-execute"](
        ExecBash,
        { isError: false, value: {}, content: Big },
        NextAccept
      );
      const Mid = TextBlock(PlainText(1700));
      await Run12.Listeners["tools/post-execute"](
        ExecBash,
        { isError: false, value: {}, content: Mid },
        NextAccept
      );
      const Records = Run12.State.EngineRuntime.Records;
      const Total = Records.reduce((Sum, R) => Sum + R.size, 0);
      {
        const Sub = "engine flag ON: three observations recorded";
        Check(Count, Sub, () => {
          assert.ok(Records.length === 3);
        });
      }
      {
        const Sub = "observations are tagged with the engine's turn cursor";
        Check(Count, Sub, () => {
          assert.ok(Records[0].turn === 1 && Records[1].turn === 3 && Records[2].turn === 3);
        });
      }
      {
        const Sub = "the pass-through result is observed with its CONTENT (archivable)";
        Check(Count, Sub, () => {
          assert.ok(Records[0].content !== void 0 && Records[0].hash === void 0);
        });
      }
      {
        const Sub = "the stored result is observed with its HASH (already in the store)";
        Check(Count, Sub, () => {
          assert.ok(Records[1].hash !== void 0 && Records[1].content === void 0);
        });
      }
      {
        const Sub = "the accumulated observed bytes cross the 3000-byte threshold";
        Check(Count, Sub, () => {
          assert.ok(Total >= 3e3);
        });
      }
      let BeforeArchive = null;
      try {
        await Retrieve12.execute({ hash: HashOf(Mid) }, Exec("ccr_retrieve"));
      } catch (Error) {
        BeforeArchive = Error;
      }
      {
        const Sub = "before the archive, the pass-through content is NOT in the store";
        Check(Count, Sub, () => {
          assert.ok(BeforeArchive !== null && /not in the store/.test(BeforeArchive.message));
        });
      }
      const Out8 = await PreCall(8);
      {
        const Sub = "pre-step turn 8: the decision still passes through";
        Check(Count, Sub, () => {
          assert.ok(Out8 !== void 0 && Out8.kind === "accept");
        });
      }
      {
        const Sub = "engine ledger line byte-exact: 'ccr: engine archived 2 results'";
        Check(Count, Sub, () => {
          const Lines8 = EngineLines();
          assert.ok(Lines8.length === 1 && Lines8[0] === "ccr: engine archived 2 results");
        });
      }
      {
        const Sub = "the head-protected turn-1 record survives the archive (middle-only)";
        Check(Count, Sub, () => {
          assert.ok(
            Run12.State.EngineRuntime.Records.length === 1 && Run12.State.EngineRuntime.Records[0].turn === 1
          );
        });
      }
      {
        const Sub = "the engine turn cursor advanced to the pre-step's turn (8)";
        Check(Count, Sub, () => {
          assert.ok(Run12.State.EngineRuntime.Turn === 8);
        });
      }
      {
        const Sub = "the archive pushed the record through the REAL compress path: ccr_retrieve restores the original bytes";
        await (async () => {
          const BackMid = await Retrieve12.execute({ hash: HashOf(Mid) }, Exec("ccr_retrieve"));
          Check(Count, Sub, () => {
            assert.ok(BackMid.text === PlainText(1700));
          });
        })();
      }
      {
        const Sub = "the hash-recorded (already-stored) entry stays retrievable untouched";
        await (async () => {
          const BackBig = await Retrieve12.execute({ hash: HashOf(Big) }, Exec("ccr_retrieve"));
          Check(Count, Sub, () => {
            assert.ok(BackBig.text === TerminalText("b".repeat(80), 40));
          });
        })();
      }
      const Tail = TextBlock(PlainText(1650));
      await Run12.Listeners["tools/post-execute"](
        ExecBash,
        { isError: false, value: {}, content: Tail },
        NextAccept
      );
      await PreCall(9);
      {
        const Sub = "crossing with an EMPTY middle (turn 8 in the last-4 window): a deliberate no-op, no line";
        Check(Count, Sub, () => {
          assert.ok(EngineLines().length === 1);
        });
      }
      {
        const Sub = "the tail-window record survives the no-archive pre-step";
        Check(Count, Sub, () => {
          assert.ok(Run12.State.EngineRuntime.Records.length === 2);
        });
      }
      await PreCall(14);
      {
        const Sub = "engine ledger line byte-exact: 'ccr: engine archived 1 results'";
        Check(Count, Sub, () => {
          const Lines14 = EngineLines();
          assert.ok(Lines14.length === 2 && Lines14[1] === "ccr: engine archived 1 results");
        });
      }
      {
        const Sub = "after both archives only the head-protected record remains";
        Check(Count, Sub, () => {
          assert.ok(
            Run12.State.EngineRuntime.Records.length === 1 && Run12.State.EngineRuntime.Records[0].turn === 1
          );
        });
      }
      {
        const Sub = "the archived tail-window record is retrievable too";
        await (async () => {
          const BackTail = await Retrieve12.execute({ hash: HashOf(Tail) }, Exec("ccr_retrieve"));
          Check(Count, Sub, () => {
            assert.ok(BackTail.text === PlainText(1650));
          });
        })();
      }
      await PreCall(15);
      {
        const Sub = "pre-step 15: the accumulator is below the threshold again -> no further archive";
        Check(Count, Sub, () => {
          assert.ok(EngineLines().length === 2);
        });
      }
      const Log12 = existsSync(Ledger) ? readFileSync(Ledger, "utf8") : "";
      {
        const Sub = "the durable ledger file: '[ISO] engine archived 2 results'";
        Check(Count, Sub, () => {
          assert.ok(
            Log12.split("\n").some(
              (Line) => /^\[[^\]]+\] engine archived 2 results$/.test(Line)
            )
          );
        });
      }
    }
  }
  return Finish(Count, "Engine-Flag-On");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Engine-Flag-On`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

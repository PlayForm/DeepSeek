import { existsSync, readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { Check, Finish, MakeCounter, Make, Rm, Validate, Furnace, Ledger } from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  Rm();
  {
    const Run1 = Make(Validate({ logFile: Ledger }));
    const Tool = Run1.Registered[0];
    const Exec = (Signal) => ({
      signal: Signal ?? new AbortController().signal,
      agent: void 0,
      callId: "call_smoke"
    });
    const All6 = "a\u2014b\u201Cc\u201D\u2026d\xA0e\u200Bf\uFF21g";
    const Normalized6 = 'a-b"c"...d efAg';
    const Fixture = "/tmp/normalize-file-smoke-fixture.txt";
    Run1.Files.set(`key:${Fixture}`, All6);
    const Exec1 = Exec();
    const Out1 = await Tool.execute({ file_path: Fixture }, Exec1);
    {
      const Sub = "the exec resolves the model-supplied path first (caller-side, like raw-write)";
      Check(Count, Sub, () => {
        assert.ok(Run1.Resolved.length === 1 && Run1.Resolved[0].path === Fixture);
      });
    }
    {
      const Sub = "the pipeline reads the target exactly once";
      Check(Count, Sub, () => {
        assert.ok(Run1.Reads.length === 1 && Run1.Reads[0] === Fixture);
      });
    }
    {
      const Sub = "N>0: the write lands through Factory.Write with ALL SIX transforms applied (em dash\u2192-, curly quotes\u2192straight, ellipsis\u2192..., NBSP\u2192space, zero-width removed, fullwidth\u2192halfwidth)";
      Check(Count, Sub, () => {
        assert.ok(Run1.Writes.length === 1 && Run1.Writes[0].content === Normalized6);
      });
    }
    {
      const Sub = "the fs/write-intent waterfall's next() default flowed through (unconditional write)";
      Check(Count, Sub, () => {
        assert.ok(Run1.Writes[0].intent === void 0);
      });
    }
    {
      const Sub = "the shared executor ran the fs/write-intent waterfall";
      Check(Count, Sub, () => {
        assert.ok(Run1.Intents.length === 1 && Run1.Intents[0].name === "fs/write-intent");
      });
    }
    {
      const Sub = "the waterfall received the actor";
      Check(Count, Sub, () => {
        assert.ok(Run1.Intents[0].actor === void 0 || typeof Run1.Intents[0].actor === "object");
      });
    }
    {
      const Sub = "bare backend: no sandbox policy stamped onto the write (standing posture)";
      Check(Count, Sub, () => {
        assert.ok(Run1.Writes[0].policy === void 0);
      });
    }
    {
      const Sub = "the exec's signal flows end to end into writeText";
      Check(Count, Sub, () => {
        assert.ok(Run1.Writes[0].signal === Exec1.signal);
      });
    }
    {
      const Sub = "fs/observed emitted with the written version (the governance hooks' trigger)";
      Check(Count, Sub, () => {
        assert.ok(
          Run1.Observations.some(
            (O) => O.name === "fs/observed" && O.observation.kind === "present" && O.observation.version === "v1"
          )
        );
      });
    }
    {
      const Sub = "the outcome reports path, count=7, changed=true";
      Check(Count, Sub, () => {
        assert.ok(Out1.path === Fixture && Out1.count === 7 && Out1.changed === true);
      });
    }
    {
      const Sub = "the outcome carries the real before/after contents";
      Check(Count, Sub, () => {
        assert.ok(Out1.before === All6 && Out1.after === Normalized6);
      });
    }
    await new Promise((R) => setTimeout(R, 10));
    const Log1 = existsSync(Ledger) ? readFileSync(Ledger, "utf8") : "";
    {
      const Sub = "count ledger line byte-exact (N>0 only)";
      Check(Count, Sub, () => {
        assert.ok(
          Run1.Lines[1] === "plugin-dsh-normalize-file: normalized 7 char(s) in /tmp/normalize-file-smoke-fixture.txt"
        );
      });
    }
    {
      const Sub = "the durable ledger file carries the count line (the [ISO] message, no logger prefix)";
      Check(Count, Sub, () => {
        assert.ok(Log1.includes("normalized 7 char(s) in /tmp/normalize-file-smoke-fixture.txt"));
      });
    }
    {
      const Sub = "exactly ONE count line for the write";
      Check(Count, Sub, () => {
        assert.ok(Run1.Lines.filter((L) => L.includes("normalized")).length === 1);
      });
    }
    {
      const Journal1 = Furnace.PendingJournal.filter((R) => R.event === "normalized");
      {
        const Sub = "exactly ONE 'normalized' journal record after the write";
        Check(Count, Sub, () => {
          assert.ok(Journal1.length === 1);
        });
      }
      {
        const Sub = "the 'normalized' record carries the target's displayPath";
        Check(Count, Sub, () => {
          assert.ok(
            Journal1[0] !== void 0 && Journal1[0].path === "/tmp/normalize-file-smoke-fixture.txt"
          );
        });
      }
      {
        const Sub = "journal detail byte-identical to the ledger count line";
        Check(Count, Sub, () => {
          assert.ok(
            Journal1[0] !== void 0 && Journal1[0].detail === "normalized 7 char(s) in /tmp/normalize-file-smoke-fixture.txt"
          );
        });
      }
      {
        const Sub = "the 'normalized' record carries a numeric timestamp";
        Check(Count, Sub, () => {
          assert.ok(Journal1[0] !== void 0 && typeof Journal1[0].at === "number");
        });
      }
      {
        const Sub = "the record routes to the factory pre-bind buffer (stage 2), not the per-State queue";
        Check(Count, Sub, () => {
          assert.ok(Run1.State.Queue.filter((R) => R.event === "normalized").length === 0);
        });
      }
    }
  }
  {
    Rm();
    const Run6 = Make(Validate({ replacement: "$&", logFile: Ledger }));
    const Exec = (Signal) => ({
      signal: Signal ?? new AbortController().signal,
      agent: void 0,
      callId: "call_smoke"
    });
    {
      const Sub = "volatile unwrap: custom replacement unwrapped";
      Check(Count, Sub, () => {
        assert.ok(Run6.State.Replacement === "$&");
      });
    }
    Run6.Files.set("key:/tmp/normalize-file-smoke-replacement.txt", "a\u2014b");
    const Out6 = await Run6.Registered[0].execute(
      { file_path: "/tmp/normalize-file-smoke-replacement.txt" },
      Exec()
    );
    {
      const Sub = "the replacement knob flows into the Dashes step (literal $& - the function replacer)";
      Check(Count, Sub, () => {
        assert.ok(Run6.Writes[0].content === "a$&b");
      });
    }
    {
      const Sub = "the replacement run reports count=1, changed=true";
      Check(Count, Sub, () => {
        assert.ok(Out6.count === 1 && Out6.changed === true);
      });
    }
    await new Promise((R) => setTimeout(R, 10));
    {
      const Sub = "the count line reflects the custom-replacement run";
      Check(Count, Sub, () => {
        assert.ok(
          readFileSync(Ledger, "utf8").includes(
            "normalized 1 char(s) in /tmp/normalize-file-smoke-replacement.txt"
          )
        );
      });
    }
    const Journal6 = Furnace.PendingJournal.filter((R) => R.event === "normalized");
    {
      const Sub = "the custom-replacement run adds its 'normalized' journal record";
      Check(Count, Sub, () => {
        assert.ok(
          Journal6.length === 2 && Journal6[1].detail === "normalized 1 char(s) in /tmp/normalize-file-smoke-replacement.txt"
        );
      });
    }
  }
  return Finish(Count, "Read-Write-Pipeline");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Read-Write-Pipeline`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

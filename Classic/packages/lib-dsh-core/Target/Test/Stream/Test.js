import assert from "node:assert/strict";
import { Stream } from "../../../Target/Library.js";
import { Check, Finish, MakeCounter } from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Sub = "Stream: the llm-stream arm factory (state, count, settle)";
    {
      Check(Count, Sub, () => {
        const Lines = [];
        const Journal = [];
        const Sink = {
          Append: (_State, Line) => {
            Lines.push(Line);
          },
          Journal: (_State, Event, _Path, Value) => {
            Journal.push(`${Event}:${Value}`);
          }
        };
        const Arm = Stream(
          (Original) => ({ chunk: Original, count: Original.type === "text-delta" ? 2 : 0 }),
          (Total) => `normalized ${Total} dash char(s) in one stream`,
          Sink
        );
        return (async () => {
          const Upstream = async function* () {
            yield { type: "text-delta", text: "a" };
            yield { type: "block-start" };
          };
          const Seen = [];
          for await (const Item of Arm(Upstream(), { Tag: "x" })) {
            Seen.push(Item);
          }
          assert.equal(Seen.length, 2, "every upstream chunk is yielded exactly once");
          assert.equal(Seen[0]?.text, "a", "the chunk order and the payload are preserved");
          assert.deepEqual(Lines, ["normalized 2 dash char(s) in one stream"], "one settle line");
          assert.deepEqual(Journal, [
            "normalized:normalized 2 dash char(s) in one stream"
          ], "one journal record with the same text");
        })();
      });
      Check(Count, Sub, async () => {
        const SeenRaw = [];
        const Arm = Stream(
          (Original, _State, Raw) => {
            SeenRaw.push(Raw);
            return { chunk: Original, count: 0 };
          },
          () => "unused",
          { Append: () => {
          }, Journal: () => {
          } }
        );
        const Upstream = async function* () {
          yield { type: "tool-call-delta", id: "c1", argumentsDelta: '{"__normalize":false,"x":1}' };
          yield { type: "tool-call-delta", id: "c1", argumentsDelta: ',"y":2' };
          yield { type: "tool-call-delta", id: "c2", argumentsDelta: '{"a":1}' };
        };
        for await (const _Item of Arm(Upstream(), {})) {
        }
        assert.deepEqual(SeenRaw, [true, true, false], "the raw flag is per call");
      });
      Check(Count, Sub, async () => {
        const Lines = [];
        const Arm = Stream(
          (Original) => ({ chunk: Original, count: 1 }),
          (Total) => `normalized ${Total}`,
          {
            Append: (_State, Line) => {
              Lines.push(Line);
            },
            Journal: () => {
            }
          }
        );
        const Upstream = async function* () {
          yield { type: "text-delta", text: "a" };
          throw new Error("upstream failure");
        };
        let Thrown = false;
        try {
          for await (const _Item of Arm(Upstream(), {})) {
          }
        } catch {
          Thrown = true;
        }
        assert.equal(Thrown, true, "an upstream throw propagates");
        assert.deepEqual(Lines, [], "a failed stream writes no ledger line");
      });
    }
  }
  return Finish(Count, "Stream");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Stream`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

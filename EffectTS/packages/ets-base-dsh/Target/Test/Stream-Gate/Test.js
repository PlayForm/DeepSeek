import assert from "node:assert/strict";
import { CheckAsync, Finish, MakeCounter } from "../Harness.js";
import { Dashes, Replace } from "../../../../ets-lib-dsh-core/Target/Library.js";
import { Chunk, StreamGate as Gate } from "../../../Target/Library.js";
import { Stream } from "effect";
const runTest = async () => {
  const Count = MakeCounter();
  {
    await CheckAsync(
      Count,
      "Gate: the stream transformer \u2014 reducer equivalence, per-call raw state, error propagation, completion-only count summary, fresh state per materialization",
      async () => {
        const ToDash = (Text) => Replace(Text, Dashes, "-");
        const Replay = (Chunks) => ({
          [Symbol.asyncIterator]: async function* () {
            yield* Chunks;
          }
        });
        const Collect = async (Chunks, ToolArgs = false, OnCount) => {
          const Out = Gate(
            Stream.fromAsyncIterable(Replay(Chunks), (Error2) => Error2),
            ToDash,
            true,
            ToolArgs,
            OnCount
          );
          return Array.fromAsync(Stream.toAsyncIterable(Out));
        };
        const GateChunks = [
          { type: "text-delta", index: 0, text: "a \u2014 b" },
          { type: "usage", usage: { input: 1, output: 2 } },
          { type: "text-delta", index: 0, text: "plain" }
        ];
        const GateGot = await Collect(GateChunks);
        assert.deepEqual(
          GateGot,
          GateChunks.map((Original) => Chunk(Original, ToDash, true).chunk),
          "the gate stream's output equals the reducer-level Chunk dispatch, in order"
        );
        assert.equal(
          GateGot[1],
          GateChunks[1],
          "usage passes through BY IDENTITY through the stream"
        );
        let GateSum = -1;
        await Collect(GateChunks, false, (Count2) => GateSum = Count2);
        assert.equal(
          GateSum,
          1,
          "the count summary reports the stream's total after a NORMAL completion (1 dash in 'a \u2014 b', none in 'plain')"
        );
        const GateRaw = {
          type: "tool-call-delta",
          index: 1,
          id: "call_1",
          name: "write",
          argumentsDelta: '{"__normalize":false,"path":"a\u2014b"}'
        };
        const GateRawNext = {
          type: "tool-call-delta",
          index: 1,
          id: "call_1",
          name: "write",
          argumentsDelta: ',"note":"x\u2014y"}'
        };
        const GatePlain = {
          type: "tool-call-delta",
          index: 1,
          id: "call_2",
          name: "write",
          argumentsDelta: '{"path":"c\u2014d"}'
        };
        const GateRawGot = await Collect([GateRaw, GateRawNext, GatePlain], true);
        assert.deepEqual(
          GateRawGot[0],
          {
            type: "tool-call-delta",
            index: 1,
            id: "call_1",
            name: "write",
            argumentsDelta: '{"path":"a\u2014b"}'
          },
          "the raw-marked call's first delta is stripped and UNNORMALIZED"
        );
        assert.equal(
          GateRawGot[1],
          GateRawNext,
          "a later delta of the SAME raw call passes through BY IDENTITY"
        );
        assert.deepEqual(
          GateRawGot[2],
          {
            type: "tool-call-delta",
            index: 1,
            id: "call_2",
            name: "write",
            argumentsDelta: '{"path":"c-d"}'
          },
          "the NEXT call id resets the raw state \u2192 its arguments normalize"
        );
        const Boom = new Error("upstream boom");
        async function* Broken() {
          yield { type: "text-delta", index: 0, text: "\u2014x" };
          throw Boom;
        }
        await assert.rejects(
          async () => {
            const Out = Gate(
              Stream.fromAsyncIterable(Broken(), (Error2) => Error2),
              ToDash,
              true
            );
            for await (const ChunkOut of Stream.toAsyncIterable(Out)) {
              void ChunkOut;
            }
          },
          (Error2) => Error2 === Boom,
          "an upstream failure propagates through the gate stream untouched"
        );
        let AbandonedSum = 0;
        {
          const Out = Gate(
            Stream.fromAsyncIterable(Replay(GateChunks), (Error2) => Error2),
            ToDash,
            true,
            false,
            (Count2) => AbandonedSum = Count2
          );
          const Iterator = Stream.toAsyncIterable(Out)[Symbol.asyncIterator]();
          await Iterator.next();
          await Iterator.return?.();
          await new Promise((Resolve) => setImmediate(Resolve));
        }
        assert.equal(
          AbandonedSum,
          0,
          "an abandoned stream never reaches the count summary"
        );
        let TwiceSum = -1;
        {
          const Out = Gate(
            Stream.fromAsyncIterable(Replay([GateRaw, GatePlain]), (Error2) => Error2),
            ToDash,
            true,
            true,
            (Count2) => TwiceSum = Count2
          );
          const First = await Array.fromAsync(Stream.toAsyncIterable(Out));
          let SecondSum = -1;
          const Again = Gate(
            Stream.fromAsyncIterable(Replay([GateRaw, GatePlain]), (Error2) => Error2),
            ToDash,
            true,
            true,
            (Count2) => SecondSum = Count2
          );
          const Second = await Array.fromAsync(Stream.toAsyncIterable(Again));
          assert.deepEqual(
            First,
            Second,
            "two materializations of the gate produce identical output"
          );
          assert.equal(
            SecondSum,
            TwiceSum,
            "the per-materialization state is fresh (same count both runs)"
          );
        }
      }
    );
  }
  return Finish(Count, "Stream-Gate");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Stream-Gate`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

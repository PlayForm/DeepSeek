import assert from "node:assert/strict";
import { Check, Finish as Guard, MakeCounter } from "../Harness.js";
import { Dashes, Replace } from "../../../Target/Library.js";
import { Block } from "../../../../ets-base-dsh/Target/Library.js";
const runTest = async () => {
  const Count = MakeCounter();
  {
    Check(
      Count,
      "Block: the generic block-end normalizer with the injected transform (text/reasoning/thinking rewritten, tool JSON gated by the tool-args flag ON + OFF, the edit exemption, the raw-write exemption, the raw-marker strip)",
      () => {
        const ToDash = (Text) => Replace(Text, Dashes, "-");
        {
          const BlockText = { type: "text", text: "\u2014kept \u2013gone" };
          assert.equal(
            Block(BlockText, ToDash).block.text,
            "-kept -gone",
            "Block: TextBlock.text normalized"
          );
          const BlockReasoning = { type: "reasoning", text: "\u2014y", thinking: "\u2014z" };
          const BlockReasoningOut = Block(BlockReasoning, ToDash);
          assert.equal(BlockReasoningOut.block.text, "-y", "Block: ReasoningBlock.text normalized");
          assert.equal(
            BlockReasoningOut.block.thinking,
            "-z",
            "Block: runtime `thinking` field normalized"
          );
          assert.equal(
            BlockReasoningOut.count,
            2,
            "Block: the count sums both reasoning fields"
          );
        }
        {
          const BlockTool = {
            type: "tool-call",
            id: "call_1",
            name: "write",
            arguments: '{"path":"a\u2014b"}'
          };
          const BlockToolOut = Block(BlockTool, ToDash);
          assert.equal(
            BlockToolOut.block,
            BlockTool,
            "Block: tool-call block passthrough BY IDENTITY (arguments raw JSON untouched)"
          );
          assert.ok(
            BlockToolOut.block.arguments.includes("\u2014"),
            "Block: arguments dash still verbatim"
          );
          assert.equal(BlockToolOut.count, 0, "Block: tool-call count 0");
          const BlockToolOffExplicit = Block(BlockTool, ToDash, false);
          assert.equal(
            BlockToolOffExplicit.block,
            BlockTool,
            "Block: tool-call passthrough BY IDENTITY with the tool-args flag explicitly off"
          );
          const BlockToolOnOut = Block(BlockTool, ToDash, true);
          assert.deepEqual(
            BlockToolOnOut.block,
            { type: "tool-call", id: "call_1", name: "write", arguments: '{"path":"a-b"}' },
            "Block: tool-call arguments normalized when the tool-args flag is ON"
          );
          assert.notEqual(
            BlockToolOnOut.block,
            BlockTool,
            "Block: rewritten tool-call is a new object (id/name preserved)"
          );
          assert.equal(BlockToolOnOut.count, 1, "Block: tool-call count 1");
          const BlockToolClean = {
            type: "tool-call",
            id: "call_1",
            name: "write",
            arguments: '{"path":"plain"}'
          };
          assert.equal(
            Block(BlockToolClean, ToDash, true).block,
            BlockToolClean,
            "Block: unchanged tool-call passes through BY IDENTITY even with the flag on (count 0)"
          );
        }
        {
          const BlockEdit = {
            type: "tool-call",
            id: "call_2",
            name: "edit",
            arguments: '{"old_string":"a\u2014b"}'
          };
          const BlockEditOut = Block(BlockEdit, ToDash, true, true);
          assert.equal(
            BlockEditOut.block,
            BlockEdit,
            "Block: edit block passes through BY IDENTITY with the flag on (old_string must match real file bytes)"
          );
          assert.ok(
            BlockEditOut.block.arguments.includes("\u2014"),
            "Block: edit arguments dash still verbatim"
          );
          assert.equal(BlockEditOut.count, 0, "Block: edit block count 0");
        }
        {
          const BlockRawWrite = {
            type: "tool-call",
            id: "call_6",
            name: "raw-write",
            arguments: '{"file_path":"/x","content":"a\u2014b"}'
          };
          const BlockRawWriteOut = Block(BlockRawWrite, ToDash, true, true);
          assert.equal(
            BlockRawWriteOut.block,
            BlockRawWrite,
            "Block: raw-write block passes through BY IDENTITY with the flag on (the tool owns its normalize parameter)"
          );
          assert.ok(
            BlockRawWriteOut.block.arguments.includes("\u2014"),
            "Block: raw-write arguments dash still verbatim"
          );
          assert.equal(BlockRawWriteOut.count, 0, "Block: raw-write block count 0");
        }
        {
          const BlockNormalizeFile = {
            type: "tool-call",
            id: "call_7",
            name: "normalize-file",
            arguments: '{"file_path":"/a\u2014b.txt"}'
          };
          const BlockNormalizeFileOut = Block(BlockNormalizeFile, ToDash, true, true);
          assert.equal(
            BlockNormalizeFileOut.block,
            BlockNormalizeFile,
            "Block: normalize-file block passes through BY IDENTITY with the flag on (its arguments carry a file path)"
          );
          assert.ok(
            BlockNormalizeFileOut.block.arguments.includes("\u2014"),
            "Block: normalize-file arguments dash still verbatim"
          );
          assert.equal(BlockNormalizeFileOut.count, 0, "Block: normalize-file block count 0");
          assert.equal(
            Block(BlockNormalizeFile, ToDash, true, false).block,
            BlockNormalizeFile,
            "Block: normalize-file block also passes through with the flag off (no gate change)"
          );
        }
        {
          const BlockRaw = {
            type: "tool-call",
            id: "call_3",
            name: "write",
            arguments: '{"__normalize":false,"path":"a\u2014b"}'
          };
          const BlockRawOut = Block(BlockRaw, ToDash, true, true);
          assert.deepEqual(
            BlockRawOut.block,
            { type: "tool-call", id: "call_3", name: "write", arguments: '{"path":"a\u2014b"}' },
            "Block: raw-marked block - the marker entry is stripped and the arguments pass through UNNORMALIZED"
          );
          assert.ok(
            BlockRawOut.block.arguments.includes("\u2014"),
            "Block: raw-marked arguments dash still verbatim"
          );
          assert.equal(
            BlockRawOut.count,
            0,
            "Block: raw-marked count 0 (the strip is not a normalization)"
          );
          assert.notEqual(
            BlockRawOut.block,
            BlockRaw,
            "Block: the stripped raw-marked block is a new object"
          );
          const BlockRawEmpty = {
            type: "tool-call",
            id: "call_4",
            name: "write",
            arguments: '{"__normalize":false}'
          };
          assert.equal(
            Block(BlockRawEmpty, ToDash, true, true).block.arguments,
            "{}",
            "Block: raw-marked marker-only block becomes the empty object"
          );
          assert.equal(
            Block(BlockRaw, ToDash, false, true).block.arguments,
            '{"path":"a\u2014b"}',
            "Block: raw-marked block with the flag OFF still gets the marker stripped"
          );
        }
        {
          const BlockRawText = { type: "text", text: "\u2014kept" };
          assert.equal(
            Block(BlockRawText, ToDash, true, true).block.text,
            "-kept",
            "Block: a text block normalizes even when Raw is forwarded (Raw only matters to the tool-call case)"
          );
          const BlockImage = { type: "image", attachment: {} };
          assert.equal(
            Block(BlockImage, ToDash).block,
            BlockImage,
            "Block: unknown/merge-extensible block passthrough BY IDENTITY"
          );
        }
      }
    );
  }
  return Guard(Count, "Block");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Block`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map

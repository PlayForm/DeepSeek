// Source/Test/Chunk/Test.ts - one singular test: the generic per-chunk
// dispatch with the injected transform - the text-delta rewrites and identity
// passthroughs, the tool-call-delta gate ON + OFF, the three exemptions (edit,
// raw-write, normalize-file), the per-call raw-marker strip, the reasoning
// gate, the block-start/usage/finish passthroughs, the block-end
// text/reasoning/thinking fields, and the second-flavor injection.
// Runs standalone (`node Target/Test/Chunk/Test.js`) AND under the aggregate
// (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/ets-lib-dsh-core: the REAL built Target only.
// NOTE: the harness's Finish guard is aliased to `Guard` here so the source
// suite's `Finish` chunk fixture keeps its name.
import assert from "node:assert/strict";
import { Check, Finish as Guard, MakeCounter } from "../Harness.js";
import { Dashes, Quotes, Replace, ReplaceMap } from "../../../Target/Library.js";
import { Chunk } from "../../../../ets-base-dsh/Target/Library.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: Chunk + Block - the generic injected-transform dispatch.
	{
		// Sub: Chunk - the generic per-chunk dispatch. The Check label is the
		// source suite's ok label, verbatim. The callback carries the whole
		// dispatch scenario tree; each nested block below is one branch of it.
		Check(
			Count,
			"Chunk: the generic per-chunk dispatch with the injected transform (rewrites, identity passthroughs, reasoning gate, tool-args gate ON + OFF, the edit exemption, the raw-write exemption, the raw-marker strip)",
			() => {
				const ToDash = (Text: string) => Replace(Text, Dashes, "-");
				{
					// Branch: the text-delta rewrites.
					const Delta = {
						type: "text-delta",
						index: 0,
						text: "a \u2014 b \u2013 c \u2011 d \u2015 e",
					};
					const DeltaOut = Chunk(Delta, ToDash, true);
					assert.deepEqual(
						DeltaOut.chunk,
						{ type: "text-delta", index: 0, text: "a - b - c - d - e" },
						"text-delta normalized (em/en/U+2011/U+2015 \u2192 '-')",
					);
					assert.notEqual(
						DeltaOut.chunk,
						Delta,
						"rewritten text-delta is a new object (index preserved)",
					);
					assert.equal(DeltaOut.chunk.index, 0, "the rewritten chunk preserves the index");
					assert.equal(DeltaOut.count, 4, "the text-delta count is the replaced characters");
					const Keep = { type: "text-delta", index: 0, text: "plain" };
					assert.equal(
						Chunk(Keep, ToDash, true).chunk,
						Keep,
						"unchanged text-delta passes through BY IDENTITY (count 0)",
					);
				}
				{
					// Branch: the tool-call-delta gate ON + OFF.
					const Tool = {
						type: "tool-call-delta",
						index: 1,
						id: "call_1",
						name: "write",
						argumentsDelta: '{"path":"a\u2014b"}',
					};
					const ToolOut = Chunk(Tool, ToDash, true);
					assert.equal(
						ToolOut.chunk,
						Tool,
						"tool-call-delta passthrough BY IDENTITY (argumentsDelta raw JSON untouched)",
					);
					assert.ok(
						ToolOut.chunk.argumentsDelta.includes("\u2014"),
						"argumentsDelta dash still verbatim",
					);
					assert.equal(ToolOut.count, 0, "tool-call-delta count 0");
					const ToolExplicitOff = Chunk(Tool, ToDash, true, false);
					assert.equal(
						ToolExplicitOff.chunk,
						Tool,
						"tool-call-delta passthrough BY IDENTITY with the tool-args flag explicitly off",
					);
					const ToolOnOut = Chunk(Tool, ToDash, true, true);
					assert.deepEqual(
						ToolOnOut.chunk,
						{
							type: "tool-call-delta",
							index: 1,
							id: "call_1",
							name: "write",
							argumentsDelta: '{"path":"a-b"}',
						},
						"tool-call-delta argumentsDelta normalized when the tool-args flag is ON",
					);
					assert.notEqual(
						ToolOnOut.chunk,
						Tool,
						"rewritten tool-call-delta is a new object (id/index/name preserved)",
					);
					assert.equal(
						ToolOnOut.count,
						1,
						"the tool-call-delta count is the replaced arguments characters",
					);
					const ToolClean = {
						type: "tool-call-delta",
						index: 1,
						id: "call_1",
						name: "write",
						argumentsDelta: '{"path":"plain"}',
					};
					assert.equal(
						Chunk(ToolClean, ToDash, true, true).chunk,
						ToolClean,
						"unchanged tool-call-delta passes through BY IDENTITY even with the flag on (count 0)",
					);
				}
				{
					// Branch: the EDIT EXEMPTION - an `edit` call passes through BY
					// IDENTITY even with the flag on - the edit tool's old_string
					// must match the real file bytes, so a rewritten character
					// would silently break every edit.
					const ToolEdit = {
						type: "tool-call-delta",
						index: 1,
						id: "call_2",
						name: "edit",
						argumentsDelta: '{"old_string":"a\u2014b"}',
					};
					const ToolEditOut = Chunk(ToolEdit, ToDash, true, true);
					assert.equal(
						ToolEditOut.chunk,
						ToolEdit,
						"edit tool-call-delta passes through BY IDENTITY with the flag on (old_string must match real file bytes)",
					);
					assert.ok(
						ToolEditOut.chunk.argumentsDelta.includes("\u2014"),
						"edit argumentsDelta dash still verbatim",
					);
					assert.equal(ToolEditOut.count, 0, "edit tool-call-delta count 0");
					assert.equal(
						Chunk(ToolEdit, ToDash, true, false).chunk,
						ToolEdit,
						"edit tool-call-delta also passes through with the flag off (no gate change)",
					);
				}
				{
					// Branch: the RAW-WRITE EXEMPTION - a `raw-write` call passes
					// through BY IDENTITY even with the flag on - the tool owns its
					// normalization through its explicit `normalize` parameter
					// (default false = verbatim), so a rewritten stream copy of its
					// arguments would fight the tool's own decision. Same exemption
					// as `edit`, family-wide.
					const ToolRawWrite = {
						type: "tool-call-delta",
						index: 1,
						id: "call_6",
						name: "raw-write",
						argumentsDelta: '{"file_path":"/x","content":"a\u2014b"}',
					};
					const ToolRawWriteOut = Chunk(ToolRawWrite, ToDash, true, true);
					assert.equal(
						ToolRawWriteOut.chunk,
						ToolRawWrite,
						"raw-write tool-call-delta passes through BY IDENTITY with the flag on (the tool owns its normalize parameter)",
					);
					assert.ok(
						ToolRawWriteOut.chunk.argumentsDelta.includes("\u2014"),
						"raw-write argumentsDelta dash still verbatim",
					);
					assert.equal(ToolRawWriteOut.count, 0, "raw-write tool-call-delta count 0");
					assert.equal(
						Chunk(ToolRawWrite, ToDash, true, false).chunk,
						ToolRawWrite,
						"raw-write tool-call-delta also passes through with the flag off (no gate change)",
					);
				}
				{
					// Branch: the NORMALIZE-FILE EXEMPTION - a `normalize-file` call
					// passes through BY IDENTITY even with the flag on - its
					// arguments carry a FILE PATH, and a rewritten dash inside a
					// filename would corrupt the target.
					const ToolNormalizeFile = {
						type: "tool-call-delta",
						index: 1,
						id: "call_7",
						name: "normalize-file",
						argumentsDelta: '{"file_path":"/a\u2014b.txt"}',
					};
					const ToolNormalizeFileOut = Chunk(ToolNormalizeFile, ToDash, true, true);
					assert.equal(
						ToolNormalizeFileOut.chunk,
						ToolNormalizeFile,
						"normalize-file tool-call-delta passes through BY IDENTITY with the flag on (its arguments carry a file path)",
					);
					assert.ok(
						ToolNormalizeFileOut.chunk.argumentsDelta.includes("\u2014"),
						"normalize-file argumentsDelta dash still verbatim",
					);
					assert.equal(ToolNormalizeFileOut.count, 0, "normalize-file tool-call-delta count 0");
					assert.equal(
						Chunk(ToolNormalizeFile, ToDash, true, false).chunk,
						ToolNormalizeFile,
						"normalize-file tool-call-delta also passes through with the flag off (no gate change)",
					);
				}
				{
					// Branch: the PER-CALL RAW MARKER - a call whose arguments open
					// with the `{"__normalize":false` marker (first key) passes
					// through UNNORMALIZED and the marker entry is STRIPPED (the
					// executed call carries no unknown key).
					const ToolRaw = {
						type: "tool-call-delta",
						index: 1,
						id: "call_3",
						name: "write",
						argumentsDelta: '{"__normalize":false,"path":"a\u2014b"}',
					};
					const ToolRawOut = Chunk(ToolRaw, ToDash, true, true, true);
					assert.deepEqual(
						ToolRawOut.chunk,
						{
							type: "tool-call-delta",
							index: 1,
							id: "call_3",
							name: "write",
							argumentsDelta: '{"path":"a\u2014b"}',
						},
						"raw-marked tool-call-delta: the marker entry is stripped and the arguments pass through UNNORMALIZED",
					);
					assert.ok(
						ToolRawOut.chunk.argumentsDelta.includes("\u2014"),
						"raw-marked argumentsDelta dash still verbatim (unnormalized)",
					);
					assert.equal(
						ToolRawOut.count,
						0,
						"raw-marked count 0 (the strip is not a normalization)",
					);
					assert.notEqual(ToolRawOut.chunk, ToolRaw, "the stripped raw-marked delta is a new object");
					const ToolRawEmpty = {
						type: "tool-call-delta",
						index: 1,
						id: "call_4",
						name: "write",
						argumentsDelta: '{"__normalize":false}',
					};
					assert.equal(
						Chunk(ToolRawEmpty, ToDash, true, true, true).chunk.argumentsDelta,
						"{}",
						"raw-marked call with no other arguments: the marker becomes the empty object",
					);
					const ToolRawSpaced = {
						type: "tool-call-delta",
						index: 1,
						id: "call_5",
						name: "write",
						argumentsDelta: '{ "__normalize" : false , "path":"a\u2014b"}',
					};
					assert.equal(
						Chunk(ToolRawSpaced, ToDash, true, true, true).chunk.argumentsDelta,
						'{ "path":"a\u2014b"}',
						"raw marker with whitespace around key/value is still stripped (valid JSON preserved)",
					);
					const ToolRawNext = {
						type: "tool-call-delta",
						index: 1,
						id: "call_3",
						name: "write",
						argumentsDelta: ',"note":"x\u2014y"}',
					};
					assert.equal(
						Chunk(ToolRawNext, ToDash, true, true, true).chunk,
						ToolRawNext,
						"subsequent raw-marked delta passes through BY IDENTITY (the strip is anchored at the arguments start)",
					);
					const ToolRawOff = Chunk(ToolRaw, ToDash, true, false, true);
					assert.equal(
						ToolRawOff.chunk.argumentsDelta,
						'{"path":"a\u2014b"}',
						"raw-marked delta with the flag OFF: the marker is still stripped (removal is not normalization)",
					);
					assert.equal(ToolRawOff.count, 0, "raw-marked with the flag OFF: count 0");
				}
				{
					// Branch: the reasoning gate + the identity passthroughs.
					const Reason = { type: "reasoning-delta", index: 2, text: "\u2014x\u2013" };
					assert.deepEqual(
						Chunk(Reason, ToDash, true).chunk,
						{ type: "reasoning-delta", index: 2, text: "-x-" },
						"reasoning-delta normalized when the reasoning flag is on",
					);
					assert.equal(
						Chunk(Reason, ToDash, false).chunk,
						Reason,
						"reasoning-delta passthrough (identity) when the reasoning flag is off",
					);
					const Start = { type: "block-start", index: 0, blockType: "text" };
					assert.equal(Chunk(Start, ToDash, true).chunk, Start, "block-start passthrough BY IDENTITY");
					const Usage = { type: "usage", usage: { input: 1, output: 2 } };
					assert.equal(Chunk(Usage, ToDash, true).chunk, Usage, "usage passthrough BY IDENTITY");
					const Finish = { type: "finish", reason: "stop" };
					assert.equal(Chunk(Finish, ToDash, true).chunk, Finish, "finish passthrough BY IDENTITY");
				}
				{
					// Branch: the block-end fields (text/reasoning/thinking).
					const EndText = {
						type: "block-end",
						index: 0,
						block: { type: "text", text: "\u2014kept \u2013gone" },
					};
					const EndTextOut = Chunk(EndText, ToDash, true);
					assert.equal(EndTextOut.chunk.block.text, "-kept -gone", "block-end TextBlock.text normalized");
					assert.notEqual(EndTextOut.chunk, EndText, "rewritten block-end is a new object");
					const EndReason = {
						type: "block-end",
						index: 2,
						block: { type: "reasoning", text: "\u2014y" },
					};
					assert.equal(
						Chunk(EndReason, ToDash, true).chunk.block.text,
						"-y",
						"block-end ReasoningBlock.text normalized (rc.2 field)",
					);
					const EndThinking = {
						type: "block-end",
						index: 3,
						block: { type: "reasoning", text: "", thinking: "\u2014z" },
					};
					assert.equal(
						Chunk(EndThinking, ToDash, true).chunk.block.thinking,
						"-z",
						"block-end runtime `thinking` field normalized (defensive)",
					);
				}
				{
					// Branch: the second-flavor injection - a second flavor flows
					// through the SAME dispatch.
					const ToQuotes = (Text: string) => ReplaceMap(Text, Quotes);
					const Curly = { type: "text-delta", index: 0, text: "\u2018hi\u2019" };
					assert.deepEqual(
						Chunk(Curly, ToQuotes, true).chunk,
						{ type: "text-delta", index: 0, text: "'hi'" },
						"a second flavor (the Quotes map) flows through the SAME dispatch (the transform is injected)",
					);
				}
			},
		);
	}
	return Guard(Count, "Chunk");
};

// Standalone entry: `node Target/Test/Chunk/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Chunk`);
}

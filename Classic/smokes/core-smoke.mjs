// core-smoke.mjs — the @playform/hook-dsh-core unit smoke: the pure helpers
// exercised WITHOUT any harness context (no fake ctx, no factory — the core
// is dependency-free by design). Loads the REAL built entry
// (hook-dsh-core/Target/Library.js).
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import {
	Section,
	Default,
	Suppress,
	Policy,
	Refusal,
	Replace,
	ReplaceMap,
	Dashes,
	Quotes,
	Ellipsis,
	Spaces,
	Invisible,
	Fullwidth,
	Chunk,
	Block,
} from "../packages/hook-dsh-core/Target/Library.js";

let N = 0;
const ok = (label) => {
	N++;
	console.log(`ok ${N} — ${label}`);
};

// ── 1. the data lists ──────────────────────────────────────────────────────
assert.deepEqual(
	Section,
	["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"],
	"the canonical npm dependency sections",
);
ok("Section: the canonical npm dependency sections");

assert.deepEqual(
	Default,
	["node_modules", ".git", ".dsh", ".pnpm", ".store", "DeepSeek Harness.app"],
	"the built-in exclusion segments",
);
ok("Default: the built-in exclusion segments (anywhere mode, exclusion-first)");

// ── 2. Suppress: the byte-identical suppression lines ──────────────────────
assert.equal(
	Suppress("package-governor", "continuation", new Error("boom")),
	"package-governor: continuation error (suppressed): boom",
	"the continuation shape",
);
assert.equal(
	Suppress("package-pinner", "listener", "x"),
	"package-pinner: listener error (suppressed): x",
	"the listener shape with a string cause",
);
assert.equal(
	Suppress("cargo-governor", "listener", new Error("")) ===
		"cargo-governor: listener error (suppressed): " ||
		Suppress("cargo-governor", "listener", new Error("")).includes("(suppressed):"),
	true,
	"an empty-message error still composes the suppressed line",
);
ok("Suppress: the suppression-line composer (module/kind/cause)");

// ── 3. Policy: the read → fallback → diagnostics mechanics ────────────────
const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "core-smoke-"));
const Lines = [];
const Append = (Message) => Lines.push(Message);
const Defaults = { reject: [], verifyCommand: null };

// absent file → the built-in default + the no-policy + default lines
const P1 = Policy(Append, Path.join(Root, "nope.json"), Defaults);
assert.equal(P1, Defaults, "absent file → the module's built-in default object");
assert.deepEqual(
	Lines,
	[
		`update: no policy at ${Path.join(Root, "nope.json")} — using built-in default`,
		"update: using built-in default policy",
	],
	"the two byte-identical diagnostic lines",
);
ok("Policy: absent file → built-in default + the byte-identical diagnostics");

// readable file → the file's policy, silence
Lines.length = 0;
FileSystem.writeFileSync(
	Path.join(Root, "policy.json"),
	JSON.stringify({ reject: ["chalk"], verifyCommand: "npm test" }),
);
const P2 = Policy(Append, Path.join(Root, "policy.json"), Defaults);
assert.deepEqual(
	P2,
	{ reject: ["chalk"], verifyCommand: "npm test" },
	"readable file → its policy",
);
assert.equal(Lines.length, 0, "no diagnostics on the happy path");
ok("Policy: readable file → the file's policy, silent");

// unreadable file → the fallback + the unreadable diagnostic
Lines.length = 0;
FileSystem.writeFileSync(Path.join(Root, "bad.json"), "{ not json");
const P3 = Policy(Append, Path.join(Root, "bad.json"), Defaults);
assert.equal(P3, Defaults, "unreadable file → the built-in default");
assert.deepEqual(
	Lines,
	[
		`update: unreadable policy at ${Path.join(Root, "bad.json")} — using built-in default`,
		"update: using built-in default policy",
	],
	"the unreadable + default diagnostics",
);
ok("Policy: unreadable file → built-in default + the unreadable diagnostic");

// the Quiet form: no diagnostics, same result
Lines.length = 0;
const P4 = Policy(Append, Path.join(Root, "nope.json"), Defaults, true);
assert.equal(P4, Defaults, "quiet → the built-in default");
assert.equal(Lines.length, 0, "quiet → no diagnostic lines");
ok("Policy: the Quiet form skips every diagnostic");

// ── 4. Refusal: only the declared dependency sections may differ ──────────
let RefusalLines = [];
const RAppend = (Message) => RefusalLines.push(Message);
const Current = { name: "x", dependencies: { a: "^1.0.0" }, scripts: { build: "tsc" } };
const NextOk = { name: "x", dependencies: { a: "1.0.0" }, scripts: { build: "tsc" } };
const NextBad = { name: "x", dependencies: { a: "1.0.0" }, scripts: { build: "bun" } };
assert.equal(
	Refusal(RAppend, "/x/package.json", Section, Current, NextOk),
	false,
	"sections-only change → allowed",
);
assert.equal(RefusalLines.length, 0, "no refusal line");
assert.equal(
	Refusal(RAppend, "/x/package.json", Section, Current, NextBad),
	true,
	"a non-dependency section change → refused",
);
assert.equal(
	RefusalLines[0],
	'REFUSED rewrite of /x/package.json: non-dependency section "scripts" would change',
	"the byte-identical refusal line",
);
ok("Refusal: the shared refusal guard (sections-only changes allowed)");

// ── 5. the normalization tables: the six exact contents ───────────────────
assert.equal(Dashes.flags, "g", "the character-class tables carry the g flag");
assert.deepEqual(
	[Ellipsis.flags, Spaces.flags, Invisible.flags],
	["g", "g", "g"],
	"Ellipsis/Spaces/Invisible carry the g flag",
);
assert.equal(
	Dashes.source,
	"[\\u058A\\u05BE\\u1400\\u1806\\u2010-\\u2015\\u2E17\\u2E1A\\u2E3A-\\u2E3B\\u2E40\\u2E5D\\u301C\\u3030\\u30A0\\uFE31-\\uFE32\\uFE58\\uFE63\\uFF0D]",
	"the Dashes source is the hermes pattern verbatim",
);
assert.equal(Ellipsis.source, "[\\u2026]", "the Ellipsis source is the single ellipsis character");
assert.equal(
	Spaces.source,
	"[\\u00A0\\u1680\\u2000-\\u200A\\u202F\\u205F\\u3000]",
	"the Spaces source is the unicode space class (Zs minus ASCII)",
);
assert.equal(
	Invisible.source,
	"[\\u00AD\\u200B\\u200C\\u200D\\u200E\\u200F\\u202A-\\u202E\\u2060\\uFEFF]",
	"the Invisible source is the zero-width/invisible class",
);
ok(
	"tables: the four character classes carry their exact patterns (Dashes = the hermes identity, verbatim)",
);

assert.deepEqual(
	Quotes,
	{
		"\u2018": "'",
		"\u2019": "'",
		"\u201A": "'",
		"\u201B": "'",
		"\u201C": '"',
		"\u201D": '"',
		"\u201E": '"',
		"\u201F": '"',
	},
	"the Quotes map is the curly → straight quote table",
);
const FullwidthComputed = {};
for (let i = 0; i < 94; i++) {
	FullwidthComputed[String.fromCharCode(0xff01 + i)] = String.fromCharCode(0x21 + i);
}
assert.deepEqual(
	Fullwidth,
	FullwidthComputed,
	"the Fullwidth map is the standard fullwidth-to-halfwidth table (U+FF01–U+FF5E → U+0021–U+007E)",
);
ok(
	"tables: the two maps carry their exact contents (Quotes curly→straight, Fullwidth the standard 94-entry table)",
);

// ── 6. Replace: the generic class→string replacer ─────────────────────────
assert.deepEqual(
	Replace("a \u2014 b \u2013 c", Dashes, "-"),
	{ text: "a - b - c", count: 2 },
	"the Dashes class → the replacement, with the count",
);
assert.deepEqual(
	Replace("plain", Dashes, "-"),
	{ text: "plain", count: 0 },
	"no match → count 0 (the caller keeps the segment by identity)",
);
assert.equal(
	Replace("\u2014end", Dashes, "$&").text,
	"$&end",
	"the replacement is inserted LITERALLY (function replacer, no $-pattern interpretation)",
);
assert.equal(
	Dashes.lastIndex,
	0,
	"the caller's regex is never mutated (per-call construction from source)",
);
ok(
	"Replace: the generic class→string replacer (the Dashes flavor, literal replacement, count 0 unchanged)",
);

// ── 7. ReplaceMap: the char→char map replacer ─────────────────────────────
assert.deepEqual(
	ReplaceMap("\u2018x\u2019\u201Dy\u201E", Quotes),
	{ text: "'x'\"y\"", count: 4 },
	"the Quotes map → the straight counterparts, with the count",
);
assert.deepEqual(
	ReplaceMap("\uFF21\uff4a\uff10", Fullwidth),
	{ text: "Aj0", count: 3 },
	"the Fullwidth map → the half-width counterparts",
);
assert.equal(
	ReplaceMap("a", { a: "$&" }).text,
	"$&",
	"the map value is inserted LITERALLY (function replacer, no $-pattern interpretation)",
);
assert.deepEqual(
	ReplaceMap("plain", Quotes),
	{ text: "plain", count: 0 },
	"no key match → count 0 (unchanged)",
);
ok(
	"ReplaceMap: the char→char map replacer (the Quotes + Fullwidth flavors, literal values, count 0 unchanged)",
);

// ── 8. Chunk + Block: the generic injected-transform dispatch ─────────────
const ToDash = (Text) => Replace(Text, Dashes, "-");
const Delta = { type: "text-delta", index: 0, text: "a \u2014 b \u2013 c \u2011 d \u2015 e" };
const DeltaOut = Chunk(Delta, ToDash, true);
assert.deepEqual(
	DeltaOut.chunk,
	{ type: "text-delta", index: 0, text: "a - b - c - d - e" },
	"text-delta normalized (em/en/U+2011/U+2015 → '-')",
);
assert.notEqual(DeltaOut.chunk, Delta, "rewritten text-delta is a new object (index preserved)");
assert.equal(DeltaOut.chunk.index, 0, "the rewritten chunk preserves the index");
assert.equal(DeltaOut.count, 4, "the text-delta count is the replaced characters");
const Keep = { type: "text-delta", index: 0, text: "plain" };
assert.equal(
	Chunk(Keep, ToDash, true).chunk,
	Keep,
	"unchanged text-delta passes through BY IDENTITY (count 0)",
);
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
assert.ok(ToolOut.chunk.argumentsDelta.includes("\u2014"), "argumentsDelta dash still verbatim");
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
assert.equal(ToolOnOut.count, 1, "the tool-call-delta count is the replaced arguments characters");
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
// the EDIT EXEMPTION: an `edit` call passes through BY IDENTITY even with
// the flag on - the edit tool's old_string must match the real file bytes,
// so a rewritten character would silently break every edit.
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
// the RAW-WRITE EXEMPTION: a `raw-write` call passes through BY IDENTITY even
// with the flag on - the tool owns its normalization through its explicit
// `normalize` parameter (default false = verbatim), so a rewritten stream
// copy of its arguments would fight the tool's own decision. Same exemption
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
// the NORMALIZE-FILE EXEMPTION: a `normalize-file` call passes through BY
// IDENTITY even with the flag on - its arguments carry a FILE PATH, and a
// rewritten dash inside a filename would corrupt the target.
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
// the PER-CALL RAW MARKER: a call whose arguments open with the
// `{"__normalize":false` marker (first key) passes through UNNORMALIZED and
// the marker entry is STRIPPED (the executed call carries no unknown key).
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
assert.equal(ToolRawOut.count, 0, "raw-marked count 0 (the strip is not a normalization)");
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
const EndText = {
	type: "block-end",
	index: 0,
	block: { type: "text", text: "\u2014kept \u2013gone" },
};
const EndTextOut = Chunk(EndText, ToDash, true);
assert.equal(EndTextOut.chunk.block.text, "-kept -gone", "block-end TextBlock.text normalized");
assert.notEqual(EndTextOut.chunk, EndText, "rewritten block-end is a new object");
const EndReason = { type: "block-end", index: 2, block: { type: "reasoning", text: "\u2014y" } };
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
const ToQuotes = (Text) => ReplaceMap(Text, Quotes);
const Curly = { type: "text-delta", index: 0, text: "\u2018hi\u2019" };
assert.deepEqual(
	Chunk(Curly, ToQuotes, true).chunk,
	{ type: "text-delta", index: 0, text: "'hi'" },
	"a second flavor (the Quotes map) flows through the SAME dispatch (the transform is injected)",
);
ok(
	"Chunk: the generic per-chunk dispatch with the injected transform (rewrites, identity passthroughs, reasoning gate, tool-args gate ON + OFF, the edit exemption, the raw-write exemption, the raw-marker strip)",
);

const BlockText = { type: "text", text: "\u2014kept \u2013gone" };
assert.equal(
	Block(BlockText, ToDash).block.text,
	"-kept -gone",
	"Block: TextBlock.text normalized",
);
const BlockReasoning = { type: "reasoning", text: "\u2014y", thinking: "\u2014z" };
const BlockReasoningOut = Block(BlockReasoning, ToDash);
assert.equal(BlockReasoningOut.block.text, "-y", "Block: ReasoningBlock.text normalized");
assert.equal(BlockReasoningOut.block.thinking, "-z", "Block: runtime `thinking` field normalized");
assert.equal(BlockReasoningOut.count, 2, "Block: the count sums both reasoning fields");
const BlockTool = {
	type: "tool-call",
	id: "call_1",
	name: "write",
	arguments: '{"path":"a\u2014b"}',
};
const BlockToolOut = Block(BlockTool, ToDash);
assert.equal(
	BlockToolOut.block,
	BlockTool,
	"Block: tool-call block passthrough BY IDENTITY (arguments raw JSON untouched)",
);
assert.ok(BlockToolOut.block.arguments.includes("\u2014"), "Block: arguments dash still verbatim");
assert.equal(BlockToolOut.count, 0, "Block: tool-call count 0");
const BlockToolOffExplicit = Block(BlockTool, ToDash, false);
assert.equal(
	BlockToolOffExplicit.block,
	BlockTool,
	"Block: tool-call passthrough BY IDENTITY with the tool-args flag explicitly off",
);
const BlockToolOnOut = Block(BlockTool, ToDash, true);
assert.deepEqual(
	BlockToolOnOut.block,
	{ type: "tool-call", id: "call_1", name: "write", arguments: '{"path":"a-b"}' },
	"Block: tool-call arguments normalized when the tool-args flag is ON",
);
assert.notEqual(
	BlockToolOnOut.block,
	BlockTool,
	"Block: rewritten tool-call is a new object (id/name preserved)",
);
assert.equal(BlockToolOnOut.count, 1, "Block: tool-call count 1");
const BlockToolClean = {
	type: "tool-call",
	id: "call_1",
	name: "write",
	arguments: '{"path":"plain"}',
};
assert.equal(
	Block(BlockToolClean, ToDash, true).block,
	BlockToolClean,
	"Block: unchanged tool-call passes through BY IDENTITY even with the flag on (count 0)",
);
// the EDIT EXEMPTION: an `edit` block passes through BY IDENTITY even with
// the flag on - the deltas AND the block agree.
const BlockEdit = {
	type: "tool-call",
	id: "call_2",
	name: "edit",
	arguments: '{"old_string":"a\u2014b"}',
};
const BlockEditOut = Block(BlockEdit, ToDash, true, true);
assert.equal(
	BlockEditOut.block,
	BlockEdit,
	"Block: edit block passes through BY IDENTITY with the flag on (old_string must match real file bytes)",
);
assert.ok(
	BlockEditOut.block.arguments.includes("\u2014"),
	"Block: edit arguments dash still verbatim",
);
assert.equal(BlockEditOut.count, 0, "Block: edit block count 0");
// the RAW-WRITE EXEMPTION: a `raw-write` block passes through BY IDENTITY
// even with the flag on - the deltas AND the block agree.
const BlockRawWrite = {
	type: "tool-call",
	id: "call_6",
	name: "raw-write",
	arguments: '{"file_path":"/x","content":"a\u2014b"}',
};
const BlockRawWriteOut = Block(BlockRawWrite, ToDash, true, true);
assert.equal(
	BlockRawWriteOut.block,
	BlockRawWrite,
	"Block: raw-write block passes through BY IDENTITY with the flag on (the tool owns its normalize parameter)",
);
assert.ok(
	BlockRawWriteOut.block.arguments.includes("\u2014"),
	"Block: raw-write arguments dash still verbatim",
);
assert.equal(BlockRawWriteOut.count, 0, "Block: raw-write block count 0");
// the NORMALIZE-FILE EXEMPTION: a `normalize-file` block passes through BY
// IDENTITY even with the flag on - the deltas AND the block agree; the
// arguments carry a FILE PATH, so a rewritten dash inside a filename would
// corrupt the target.
const BlockNormalizeFile = {
	type: "tool-call",
	id: "call_7",
	name: "normalize-file",
	arguments: '{"file_path":"/a\u2014b.txt"}',
};
const BlockNormalizeFileOut = Block(BlockNormalizeFile, ToDash, true, true);
assert.equal(
	BlockNormalizeFileOut.block,
	BlockNormalizeFile,
	"Block: normalize-file block passes through BY IDENTITY with the flag on (its arguments carry a file path)",
);
assert.ok(
	BlockNormalizeFileOut.block.arguments.includes("\u2014"),
	"Block: normalize-file arguments dash still verbatim",
);
assert.equal(BlockNormalizeFileOut.count, 0, "Block: normalize-file block count 0");
assert.equal(
	Block(BlockNormalizeFile, ToDash, true, false).block,
	BlockNormalizeFile,
	"Block: normalize-file block also passes through with the flag off (no gate change)",
);
// the PER-CALL RAW MARKER: the assembled block is unnormalized with the
// marker stripped - it agrees with the stripped deltas.
const BlockRaw = {
	type: "tool-call",
	id: "call_3",
	name: "write",
	arguments: '{"__normalize":false,"path":"a\u2014b"}',
};
const BlockRawOut = Block(BlockRaw, ToDash, true, true);
assert.deepEqual(
	BlockRawOut.block,
	{ type: "tool-call", id: "call_3", name: "write", arguments: '{"path":"a\u2014b"}' },
	"Block: raw-marked block - the marker entry is stripped and the arguments pass through UNNORMALIZED",
);
assert.ok(
	BlockRawOut.block.arguments.includes("\u2014"),
	"Block: raw-marked arguments dash still verbatim",
);
assert.equal(BlockRawOut.count, 0, "Block: raw-marked count 0 (the strip is not a normalization)");
assert.notEqual(
	BlockRawOut.block,
	BlockRaw,
	"Block: the stripped raw-marked block is a new object",
);
const BlockRawEmpty = {
	type: "tool-call",
	id: "call_4",
	name: "write",
	arguments: '{"__normalize":false}',
};
assert.equal(
	Block(BlockRawEmpty, ToDash, true, true).block.arguments,
	"{}",
	"Block: raw-marked marker-only block becomes the empty object",
);
assert.equal(
	Block(BlockRaw, ToDash, false, true).block.arguments,
	'{"path":"a\u2014b"}',
	"Block: raw-marked block with the flag OFF still gets the marker stripped",
);
// Raw only matters to the tool-call case: a text block normalizes even when Raw is forwarded.
const BlockRawText = { type: "text", text: "\u2014kept" };
assert.equal(
	Block(BlockRawText, ToDash, true, true).block.text,
	"-kept",
	"Block: a text block normalizes even when Raw is forwarded (Raw only matters to the tool-call case)",
);
const BlockImage = { type: "image", attachment: {} };
assert.equal(
	Block(BlockImage, ToDash).block,
	BlockImage,
	"Block: unknown/merge-extensible block passthrough BY IDENTITY",
);
ok(
	"Block: the generic block-end normalizer with the injected transform (text/reasoning/thinking rewritten, tool JSON gated by the tool-args flag ON + OFF, the edit exemption, the raw-write exemption, the raw-marker strip)",
);

// ── done ───────────────────────────────────────────────────────────────────
console.log(`\n${N} checks — ALL PASS`);

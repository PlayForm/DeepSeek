// core-smoke.mjs — the @playform/ets-hook-dsh-core unit smoke: the pure helpers
// exercised WITHOUT any harness context (no fake ctx, no factory — the core
// is dependency-free by design). Loads the REAL built entry
// (hook-dsh-core/Target/Library.js).
//
// EffectTS release: the Classic 14 assertions are the ARBITER and stay
// byte-identical; the coverage GROWS ADDITIVELY with two sections for the
// R1 Effect additions — the stream gate as a real `Stream` transformer
// (Stream/Gate, equivalence with the reducer-level dispatch) and the
// Update envelope's typed effects (Dispatch/Settle). Effect is imported
// from the bundle's own installed dependency (the smoke adds no
// dependency of its own).
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
	Activate,
	Update,
	Gate,
} from "../packages/ets-hook-dsh-core/Target/Library.js";
import { Effect, Stream } from "../packages/ets-hook-dsh-core/node_modules/effect/dist/index.js";

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
	"the Dashes source is the dash pattern verbatim",
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
	"tables: the four character classes carry their exact patterns (Dashes = the dash identity, verbatim)",
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

// ── 9. Activate + Update: the builders' shapes (same names, additive) ─────
assert.equal(
	Activate([
		["mode", "anywhere"],
		["exclude", undefined],
		["", "pinner flavor"],
	]),
	"activated (mode=anywhere, pinner flavor)",
	"Activate: the activation-line composer (skip-absent, bare segment)",
);
assert.equal(
	typeof Update,
	"function",
	"Update: the envelope builder is exported under the same name",
);
ok("Activate + Update: the builders keep their export names (the composer + the effect builder)");

// ── 10. Gate: the stream transformer (EffectTS additive) ──────────────────
// A replayable async iterable (the reducer-level contract: Stream.flatMap is
// sequential by default, so one in - one out, strictly sequential).
const Replay = (Chunks) => ({
	[Symbol.asyncIterator]: async function* () {
		yield* Chunks;
	},
});
const Collect = async (Chunks, ToolArgs = false, OnCount) => {
	const Out = Gate(
		Stream.fromAsyncIterable(Replay(Chunks), (Error) => Error),
		ToDash,
		true,
		ToolArgs,
		OnCount,
	);
	return Array.fromAsync(Stream.toAsyncIterable(Out));
};
// equivalence with the reducer-level dispatch (the Classic assertions'
// behaviors, observed through the Stream boundary)
const GateChunks = [
	{ type: "text-delta", index: 0, text: "a \u2014 b" },
	{ type: "usage", usage: { input: 1, output: 2 } },
	{ type: "text-delta", index: 0, text: "plain" },
];
const GateGot = await Collect(GateChunks);
assert.deepEqual(
	GateGot,
	GateChunks.map((Original) => Chunk(Original, ToDash, true).chunk),
	"the gate stream's output equals the reducer-level Chunk dispatch, in order",
);
assert.equal(GateGot[1], GateChunks[1], "usage passes through BY IDENTITY through the stream");
let GateSum = -1;
await Collect(GateChunks, false, (Count) => (GateSum = Count));
assert.equal(
	GateSum,
	1,
	"the count summary reports the stream's total after a NORMAL completion (1 dash in 'a — b', none in 'plain')",
);
// the per-call RAW-marker state machine (CurrentCall/RawCall via Stream.suspend):
// the first delta of a call opens it, later deltas of the SAME call keep it,
// and the NEXT call id resets it.
const GateRaw = {
	type: "tool-call-delta",
	index: 1,
	id: "call_1",
	name: "write",
	argumentsDelta: '{"__normalize":false,"path":"a\u2014b"}',
};
const GateRawNext = {
	type: "tool-call-delta",
	index: 1,
	id: "call_1",
	name: "write",
	argumentsDelta: ',"note":"x\u2014y"}',
};
const GatePlain = {
	type: "tool-call-delta",
	index: 1,
	id: "call_2",
	name: "write",
	argumentsDelta: '{"path":"c\u2014d"}',
};
const GateRawGot = await Collect([GateRaw, GateRawNext, GatePlain], true);
assert.deepEqual(
	GateRawGot[0],
	{
		type: "tool-call-delta",
		index: 1,
		id: "call_1",
		name: "write",
		argumentsDelta: '{"path":"a\u2014b"}',
	},
	"the raw-marked call's first delta is stripped and UNNORMALIZED",
);
assert.equal(
	GateRawGot[1],
	GateRawNext,
	"a later delta of the SAME raw call passes through BY IDENTITY",
);
assert.deepEqual(
	GateRawGot[2],
	{
		type: "tool-call-delta",
		index: 1,
		id: "call_2",
		name: "write",
		argumentsDelta: '{"path":"c-d"}',
	},
	"the NEXT call id resets the raw state → its arguments normalize",
);
// upstream failures propagate untouched (the Classic generator's unguarded loop)
const Boom = new Error("upstream boom");
async function* Broken() {
	yield { type: "text-delta", index: 0, text: "\u2014x" };
	throw Boom;
}
await assert.rejects(
	async () => {
		const Out = Gate(
			Stream.fromAsyncIterable(Broken(), (Error) => Error),
			ToDash,
			true,
		);
		for await (const ChunkOut of Stream.toAsyncIterable(Out)) {
			void ChunkOut;
		}
	},
	(Error) => Error === Boom,
	"an upstream failure propagates through the gate stream untouched",
);
// a stream abandoned mid-flight writes NO count summary (the thrown-away
// generator's unwritten ledger line)
let AbandonedSum = 0;
{
	const Out = Gate(
		Stream.fromAsyncIterable(Replay(GateChunks), (Error) => Error),
		ToDash,
		true,
		false,
		(Count) => (AbandonedSum = Count),
	);
	const Iterator = Stream.toAsyncIterable(Out)[Symbol.asyncIterator]();
	await Iterator.next();
	await Iterator.return?.();
	await new Promise((Resolve) => setImmediate(Resolve));
}
assert.equal(AbandonedSum, 0, "an abandoned stream never reaches the count summary");
// re-running the SAME gate Stream re-runs the state (fresh per materialization
// via Stream.suspend — two streams never share CurrentCall/RawCall)
let TwiceSum = -1;
{
	const Out = Gate(
		Stream.fromAsyncIterable(Replay([GateRaw, GatePlain]), (Error) => Error),
		ToDash,
		true,
		true,
		(Count) => (TwiceSum = Count),
	);
	const First = await Array.fromAsync(Stream.toAsyncIterable(Out));
	let SecondSum = -1;
	const Again = Gate(
		Stream.fromAsyncIterable(Replay([GateRaw, GatePlain]), (Error) => Error),
		ToDash,
		true,
		true,
		(Count) => (SecondSum = Count),
	);
	const Second = await Array.fromAsync(Stream.toAsyncIterable(Again));
	assert.deepEqual(First, Second, "two materializations of the gate produce identical output");
	assert.equal(
		SecondSum,
		TwiceSum,
		"the per-materialization state is fresh (same count both runs)",
	);
}
ok(
	"Gate: the stream transformer — reducer equivalence, per-call raw state, error propagation, completion-only count summary, fresh state per materialization",
);

// ── 11. Update: the typed-effect envelope (EffectTS additive) ─────────────
// The module-side fake: injected State maps, factory delegates, the job
// hooks and the module's OWN ledger strings (the shape the governor/pinner/
// cargo modules supply; the strings here are the smoke's, not the core's).
const UpdateLines = {
	Paused: (Dir, Count, Limit) =>
		`update stage paused for ${Dir} (consecutive=${Count}, limit=${Limit})`,
	InFlight: (Dir) => `update stage skipped for ${Dir} (in-flight)`,
	Cooldown: (Dir) => `update stage skipped for ${Dir} (cooldown)`,
	Failed: (Dir, Code, Consecutive) =>
		`update stage FAILED (${Code}) for ${Dir}; consecutive=${Consecutive}`,
	Dispatched: (State, Dir, PolicyPath) =>
		`update stage dispatched for ${Dir} (mode=smoke, ncu via /bin/ncu, ${PolicyPath})`,
};
const UpdateState = () => ({
	Count: new Map(),
	Stamp: new Map(),
	Set: new Set(),
	Inflight: new Map(),
	Journal: [],
	Ledger: [],
	Refreshed: [],
	Spec: null,
	Detached: null,
});
const UpdateDeps = (Over = {}) => ({
	Count: (State) => State.Count,
	Stamp: (State) => State.Stamp,
	Set: (State) => State.Set,
	Inflight: (State) => State.Inflight,
	Limit: () => 2,
	Wait: () => 0,
	UpdateKey: (State, Target) => `update:${Target}`,
	Append: (State, Message) => State.Ledger.push(Message),
	Journal: (State, Event, Dir, Detail) => State.Journal.push([Event, Dir, Detail]),
	Refresh: (State, Target, Actor, Version) => State.Refreshed.push([Target, Version]),
	Stat: async () => ({ version: 7 }),
	Start: (State, Spec, Detached) => {
		State.Spec = Spec;
		State.Detached = Detached;
	},
	Lines: UpdateLines,
	DispatchedEvent: "dispatched",
	DispatchedDetail: () => "mode=smoke",
	FailedEvent: "update-failed",
	Kind: "governor-update",
	Label: (Dir) => `ncu ${Dir}`,
	RejectedDetail: "update stage rejected",
	Stage: async () => 0,
	...Over,
});
const RunScoped = (EffectIn) => Effect.runPromise(Effect.scoped(EffectIn));
// Settle: the breaker reset on 0, the failure line + record otherwise, the
// U₂ refresh in every case, the code returned, never rejecting.
{
	const State = UpdateState();
	const Code = await Effect.runPromise(
		Update(UpdateDeps()).Settle(State, "/x", {}, undefined, 0),
	);
	assert.equal(Code, 0, "Settle returns the code it was given");
	assert.equal(State.Count.get("/x"), 0, "Settle resets the breaker on 0");
	assert.deepEqual(
		State.Refreshed,
		[[{}, 7]],
		"Settle runs U₂ (the stat's version to the module's Refresh)",
	);
	assert.equal(State.Ledger.length, 0, "Settle on 0: no failure line");
}
{
	const State = UpdateState();
	const Code = await Effect.runPromise(
		Update(UpdateDeps()).Settle(State, "/x", {}, undefined, 3),
	);
	assert.equal(Code, 3, "Settle returns a non-zero code");
	assert.equal(State.Count.get("/x"), 1, "Settle increments the breaker on failure");
	assert.deepEqual(
		State.Ledger,
		["update stage FAILED (3) for /x; consecutive=1"],
		"Settle appends the module's byte-identical failure line",
	);
	assert.deepEqual(
		State.Journal,
		[["update-failed", "/x", "3"]],
		"Settle journals the P5 failure record (event, dir, stringified code)",
	);
	assert.equal(State.Refreshed.length, 1, "Settle still runs U₂ after a failure");
}
{
	const State = UpdateState();
	const Code = await Effect.runPromise(
		Update(
			UpdateDeps({
				Stat: async () => {
					throw new Error("stat boom");
				},
			}),
		).Settle(State, "/x", {}, undefined, 5),
	);
	assert.equal(Code, 5, "a rejected stat is contained (U₂ best-effort)");
	assert.equal(State.Refreshed.length, 0, "no Refresh when the stat fails");
	assert.equal(State.Count.get("/x"), 1, "the breaker still increments");
}
// Dispatch: the three gates (circuit breaker → in-flight → cooldown), each
// logging its own line and returning.
{
	const State = UpdateState();
	State.Count.set("/x", 2);
	await RunScoped(Update(UpdateDeps()).Dispatch(State, "/x/pkg", undefined, "/x", null, "/p"));
	assert.deepEqual(
		State.Ledger,
		["update stage paused for /x (consecutive=2, limit=2)"],
		"the breaker gate: the paused line (the raw map read)",
	);
	assert.equal(State.Spec, null, "the breaker gate: no job started");
	assert.equal(State.Journal.length, 0, "the breaker gate: no journal record");
}
{
	const State = UpdateState();
	State.Set.add("/x");
	await RunScoped(Update(UpdateDeps()).Dispatch(State, "/x/pkg", undefined, "/x", null, "/p"));
	assert.deepEqual(
		State.Ledger,
		["update stage skipped for /x (in-flight)"],
		"the in-flight gate: one update run per directory",
	);
	assert.equal(State.Spec, null, "the in-flight gate: no job started");
}
{
	const State = UpdateState();
	State.Stamp.set("/x", Date.now());
	await RunScoped(
		Update(UpdateDeps({ Wait: () => 60_000 })).Dispatch(
			State,
			"/x/pkg",
			undefined,
			"/x",
			null,
			"/p",
		),
	);
	assert.deepEqual(State.Ledger, ["update stage skipped for /x (cooldown)"], "the cooldown gate");
	assert.equal(State.Spec, null, "the cooldown gate: no job started");
}
// Dispatch: the dispatched path — the P2 registration, the jobs envelope
// (journal first, then the line), the never-rejecting done outcome and the
// settlement.
{
	const State = UpdateState();
	await RunScoped(
		Update(UpdateDeps()).Dispatch(
			State,
			"/x/package.json",
			undefined,
			"/x",
			null,
			"/p/policy.json",
		),
	);
	assert.deepEqual(
		State.Journal,
		[["dispatched", "/x", "mode=smoke"]],
		"the dispatched journal record comes FIRST (the governor-family order)",
	);
	assert.match(
		State.Ledger[0],
		/^update stage dispatched for \/x \(mode=smoke/,
		"the dispatched ledger line comes after the journal record",
	);
	assert.equal(State.Spec.kind, "governor-update", "the spec's producer kind");
	assert.equal(State.Spec.label, "ncu /x", "the spec's one-line label");
	assert.equal(
		State.Inflight.has("update:/x/package.json"),
		true,
		"the P2 registration under the namespaced key",
	);
	const Job = State.Spec.run({ append: () => {} });
	assert.equal(typeof Job.cancel, "function", "the job's cancel aborts the task-owned signal");
	const Outcome = await Job.done;
	assert.deepEqual(
		Outcome,
		{ status: "completed", detail: "exit code: 0" },
		"the done outcome maps the exit code",
	);
	assert.equal(State.Set.has("/x"), false, "the settlement removed the in-flight marker");
	assert.equal(
		State.Inflight.has("update:/x/package.json"),
		false,
		"the settlement removed the P2 registration",
	);
	assert.equal(State.Count.get("/x"), 0, "the settlement reset the breaker");
	assert.equal(State.Refreshed.length, 1, "the settlement ran U₂");
}
// Dispatch: a bug-level Stage rejection still settles the breaker and
// resolves `failed` with the module's rejected detail (containment).
{
	const State = UpdateState();
	const BoomStage = async (StateArg, Dir, Target, Actor, Registry, PolicyPath, Signal) => {
		await new Promise((Resolve, Reject) => {
			Signal.addEventListener("abort", () => Reject(new Error("aborted")));
			setTimeout(Resolve, 250);
		});
		return 0;
	};
	await RunScoped(
		Update(UpdateDeps({ Stage: BoomStage })).Dispatch(
			State,
			"/x/package.json",
			undefined,
			"/x",
			null,
			"/p",
		),
	);
	const Job = State.Spec.run({ append: () => {} });
	Job.cancel();
	const Outcome = await Job.done;
	assert.deepEqual(
		Outcome,
		{ status: "failed", detail: "update stage rejected" },
		"a bug-level rejection resolves the failed outcome with the module's detail",
	);
	assert.equal(State.Set.has("/x"), false, "the containment removed the in-flight marker");
	assert.equal(
		State.Inflight.has("update:/x/package.json"),
		false,
		"the containment removed the P2 registration",
	);
	assert.equal(State.Count.get("/x"), 1, "the containment incremented the breaker");
}
// Dispatch: the detached fallback (no job registry) — the same contained
// chain, forked ON THE PLUGIN SCOPE and settled without any awaiter.
{
	const State = UpdateState();
	await RunScoped(
		Effect.gen(function* () {
			yield Update(UpdateDeps({ Start: (StateArg, Spec, Detached) => Detached() })).Dispatch(
				State,
				"/x/package.json",
				undefined,
				"/x",
				null,
				"/p/policy.json",
			);
			// the continuation fiber runs while the scope is open
			for (let Index = 0; Index < 200 && State.Refreshed.length === 0; Index++) {
				yield Effect.yieldNow;
			}
		}),
	);
	assert.equal(State.Set.has("/x"), false, "the detached chain settled (marker removed)");
	assert.equal(State.Count.get("/x"), 0, "the detached chain settled (breaker reset)");
	assert.equal(State.Refreshed.length, 1, "the detached chain ran U₂");
	assert.equal(State.Journal.length, 1, "the detached chain's dispatch record");
}
// Dispatch: the in-flight fiber is interrupted at dispose (Effect.forkIn on
// the plugin scope) and the interruption aborts the task-owned controller —
// the Classic Inflight-disposal semantics.
{
	const State = UpdateState();
	const HangStage = (StateArg, Dir, Target, Actor, Registry, PolicyPath, Signal) =>
		new Promise((Resolve) => {
			Signal.addEventListener("abort", () => Resolve(143));
		});
	await RunScoped(
		Effect.gen(function* () {
			yield Update(
				UpdateDeps({ Stage: HangStage, Start: (StateArg, Spec, Detached) => Detached() }),
			).Dispatch(State, "/x/package.json", undefined, "/x", null, "/p/policy.json");
			yield Effect.yieldNow;
			yield Effect.yieldNow;
		}),
	);
	const Registration = State.Inflight.get("update:/x/package.json");
	for (
		let Index = 0;
		Index < 100 && !(Registration && Registration.controller.signal.aborted);
		Index++
	) {
		await new Promise((Resolve) => setImmediate(Resolve));
	}
	assert.ok(Registration, "the interrupted fiber never settled (the P2 registration stands)");
	assert.equal(
		Registration.controller.signal.aborted,
		true,
		"the scope's dispose interrupted the in-flight fiber and aborted its controller",
	);
}
ok(
	"Update: the typed-effect envelope — Settle's breaker/U₂ flow, the three gates, the dispatched order (journal → line), the never-rejecting done outcome, the contained rejection, the settling detached fallback and the forkIn interruption at dispose",
);

// ── done ───────────────────────────────────────────────────────────────────
console.log(`\n${N} checks — ALL PASS`);

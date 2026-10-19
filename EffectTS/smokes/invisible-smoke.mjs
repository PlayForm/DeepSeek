// Classic/smokes/invisible-smoke.mjs — the family smoke pattern: a
// fake ctx (on capture, get returning the REAL @playform/ets-plugin-dsh-factory
// instance from its built Target, logger capture) + the REAL invisible apply
// (from the built Target) → assert the full llm/stream waterfall contract
// for the CLASS flavor (the core's Invisible class + the configured
// replacement, default "" — REMOVAL).
import { appendFileSync, rmSync, readFileSync, existsSync } from "node:fs";
import Invisible from "../packages/ets-hook-dsh-normalize-invisible/Target/Library.js";
import FactoryClass from "../packages/ets-plugin-dsh-factory/Target/Library.js";

const Ledger = "/tmp/invisible-smoke-ledger.log";
let Pass = 0,
	Fail = 0;
const Check = (Condition, Message) => {
	if (Condition) {
		Pass += 1;
		console.log(`PASS — ${Message}`);
	} else {
		Fail += 1;
		console.log(`FAIL — ${Message}`);
	}
};

// The REAL factory instance, constructed exactly the way the factory's own
// smoke does (the Service base constructor registers through
// ctx.reflect.provide; the stub context is used once and discarded).
const Furnace = new FactoryClass({ reflect: { provide: () => undefined } });

// The fake ctx: on() captures listeners (returns a disposer, fiber-owned
// pattern); get() serves the REAL factory for "pluginFactory" and throws for
// anything else (the factory's probe-once Seam catches the throw); logger
// captures lines; effect not needed (Apply registers none).
const Make = (Raw) => {
	const Listeners = {},
		ListenerOptions = {},
		Lines = [];
	const CommandsRegistered = [];
	const Context = {
		// The service accessor (typed via Interface/Factory's augmentation): the
		// REAL factory instance, guaranteed present by `inject: ["pluginFactory"]`.
		pluginFactory: Furnace,
		on: (Name, Listener, Options) => {
			Listeners[Name] = Listener;
			ListenerOptions[Name] = Options;
			return () => true;
		},
		get: (Name) => {
			switch (Name) {
				case "pluginFactory":
					return Furnace;
				// The human-command registry seam (the `normalize-overpass`
				// registration): records every registered definition.
				case "commands":
					return {
						register: (Definition) => {
							CommandsRegistered.push(Definition);
							return () => true;
						},
					};
				default:
					throw new Error(`unknown service: ${Name}`);
			}
		},
		logger: {
			info: (M) => {
				Lines.push(M);
			},
		},
	};
	apply(Context, Raw); // the loader contract: apply(ctx, config)
	return {
		Context,
		Listeners,
		ListenerOptions,
		Lines,
		CommandsRegistered,
		State: Context.__hookDshInvisibleState,
	};
};

const Invisible0 = Invisible; // (apply + Config live on both named and default)
const { apply, Config: Schema } = Invisible0;
const Validate = (Raw) => Schema({ ...Raw });

// The real-config shape the loader hands to apply: volatile fields arrive as
// `{ get }` cells. Build one via the schema and assert the cells, then let
// the factory's State builder unwrap them.
const rm = () => {
	try {
		rmSync(Ledger);
	} catch {}
};
rm();

// ---------- Run 1: defaults ----------
rm();
const Raw1 = Validate({ logFile: Ledger });
Check(Raw1.log && typeof Raw1.log.get === "function", "volatile cell: log arrives as { get }");
Check(typeof Raw1.logFile.get === "function", "volatile cell: logFile arrives as { get }");
Check(typeof Raw1.replacement.get === "function", "volatile cell: replacement arrives as { get }");
Check(Raw1.normalizeReasoning === true, "config default normalizeReasoning=true");
Check(Raw1.normalizeToolArguments === false, "config default normalizeToolArguments=false");
const Run1 = Make(Raw1);

Check(typeof Run1.Listeners["llm/stream"] === "function", "the llm/stream listener is registered");
Check(
	Object.keys(Run1.Listeners).length === 4 &&
		Run1.Listeners["loader/volatile-update"] !== undefined &&
		Run1.Listeners["tools/post-execute"] !== undefined &&
		Run1.Listeners["agent/pre-step"] !== undefined,
	"llm/stream + the P10 volatile-update refresh + the two overpass arms (post-execute prepended, pre-step default order)",
);
Check(Run1.State && Run1.State.Factory === Furnace, "state carries the REAL factory instance");
Check(
	Run1.State.Ledger === "/tmp/invisible-smoke-ledger.log",
	"volatile unwrap: logFile cell unwrapped to State.Ledger",
);
Check(Run1.State.Enabled === true, "volatile unwrap: log cell unwrapped to State.Enabled=true");
Check(
	Run1.State.Replacement === "",
	"volatile unwrap: replacement cell unwrapped to State.Replacement=''",
);
Check(
	Run1.State.Reasoning === true && Run1.State.ToolArgs === false,
	"plain fields: Reasoning=true, ToolArgs=false",
);
Check(
	Run1.State.Module === "hook-dsh-normalize-invisible",
	"state module = hook-dsh-normalize-invisible (the ledger prefix)",
);
const Activation = `[${Run1.Lines.find((L) => L.startsWith("hook-dsh-normalize-invisible: activated")) ?? ""}]`;
Check(
	Run1.Lines.includes(
		"hook-dsh-normalize-invisible: activated (replacement=, reasoning=on, toolArgs=off, logFile=/tmp/invisible-smoke-ledger.log)",
	),
	"activation ledger line byte-exact",
);

// ---------- The waterfall listener, exercised ----------
const INVISIBLE = "a\u200Bb\u200Cc\u00ADd"; // zero-width space, ZWNJ, soft hyphen
const Listener = Run1.Listeners["llm/stream"];

const Chunks = [
	{ type: "block-start", index: 0, blockType: "text" },
	{ type: "text-delta", index: 0, text: INVISIBLE },
	{
		type: "tool-call-delta",
		index: 1,
		id: "call_1",
		name: "write",
		argumentsDelta: '{"path":"a\u200Bb"}',
	},
	{ type: "reasoning-delta", index: 2, text: "\u200Dx\uFEFF" },
	{ type: "block-end", index: 0, block: { type: "text", text: "\u2060kept\u200Egone" } },
	{ type: "block-end", index: 2, block: { type: "reasoning", text: "\u202Ay" } },
	{ type: "block-end", index: 3, block: { type: "reasoning", text: "", thinking: "\u202Ez" } },
	{ type: "usage", usage: { input: 1, output: 2 } },
	{ type: "finish", reason: "stop" },
];

// next(): must be called exactly once, synchronously, BEFORE iteration; its
// result is the upstream stream we hand back.
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

// Deep-frozen options — the wrapper must never touch it (a mutation throws;
// even a read is fine, a write is not — Object.freeze proves it).
const Request = Object.freeze(Object.freeze({ model: "x", messages: [] }));
const Wrapped = Listener(Request, Next);
Check(NextCalls === 1, "next() called exactly once, synchronously (before iteration)");
Check(IteratedAtNext === false, "next() was called BEFORE any upstream iteration");
Check(Object.isFrozen(Request), "deep-frozen options untouched (still frozen)");

const Out = [];
for await (const Chunk of Wrapped) {
	Iterated = true;
	Out.push(Chunk);
}

Check(Out.length === Chunks.length, "chunk order/count preserved (1 in, 1 out)");
Check(
	Out.map((C) => C.type).join(",") === Chunks.map((C) => C.type).join(","),
	"chunk type sequence identical to upstream",
);
Check(Out[0] === Chunks[0], "block-start passthrough BY IDENTITY");
Check(
	Out[2] === Chunks[2],
	"tool-call-delta passthrough BY IDENTITY (argumentsDelta raw JSON untouched)",
);
Check(Out[2].argumentsDelta.includes("\u200B"), "argumentsDelta zero-width space still verbatim");
Check(Out[7] === Chunks[7], "usage passthrough BY IDENTITY");
Check(Out[8] === Chunks[8], "finish passthrough BY IDENTITY");
Check(Out[1].text === "abcd", "text-delta normalized (U+200B/U+200C/U+00AD removed)");
Check(
	Out[1] !== Chunks[1] && Out[1].index === 0,
	"rewritten text-delta is a new object, index preserved",
);
Check(Out[3].text === "x", "reasoning-delta normalized when reasoning=on (ZWJ + BOM removed)");
Check(
	Out[4].block.text === "keptgone",
	"block-end TextBlock.text normalized (word joiner + LRM removed)",
);
Check(Out[5].block.text === "y", "block-end ReasoningBlock.text normalized (rc.2 field)");
Check(
	Out[6].block.thinking === "z",
	"block-end runtime `thinking` field normalized (defensive, RLO override)",
);
Check(Out[5] !== Chunks[5], "rewritten block-end is a new object");
await new Promise((R) => setTimeout(R, 10));
const Log1 = existsSync(Ledger) ? readFileSync(Ledger, "utf8") : "";
Check(
	Log1.includes("normalized 9 invisible char(s) in one stream"),
	"count ledger line written after the 9-replacement stream (N>0)",
);
Check(
	Log1.split("\n").filter((L) => L.includes("normalized")).length === 1,
	"exactly ONE count line for the stream",
);
Check(
	Run1.Lines.filter((L) => L.includes("normalized")).length === 1 &&
		Run1.Lines[1] ===
			"hook-dsh-normalize-invisible: normalized 9 invisible char(s) in one stream",
	"logger line 'hook-dsh-normalize-invisible: normalized 9 invisible char(s) in one stream' (3 delta + 2 reasoning + 2 block-end + 1 thinking)",
);

// ---------- Run 1 (P5 journal): the count event lands in the shared storage domain ----------
// The smoke's factory instance has no storageDomain facility and no Open has
// ever succeeded, so the REAL three-stage routing (Function/Journal) serves
// the record from the factory-level PRE-BIND buffer (stage 2, PendingJournal)
// — not the per-State queue (stage 3). Record shape:
// { event: "normalized", path: "", detail: <the ledger line>, at: <number> }.
const JournalRun1 = Furnace.PendingJournal.filter((R) => R.event === "normalized");
Check(
	JournalRun1.length === 1,
	"exactly ONE 'normalized' journal record after the 9-replacement stream",
);
Check(
	JournalRun1[0] !== undefined && JournalRun1[0].path === "",
	"the 'normalized' record carries an empty path (stream-level event)",
);
Check(
	JournalRun1[0] !== undefined &&
		JournalRun1[0].detail === "normalized 9 invisible char(s) in one stream",
	"journal detail byte-identical to the ledger count line",
);
Check(
	JournalRun1[0] !== undefined && typeof JournalRun1[0].at === "number",
	"the 'normalized' record carries a numeric timestamp",
);
Check(
	Run1.State.Queue.filter((R) => R.event === "normalized").length === 0,
	"the record routes to the factory pre-bind buffer (stage 2), not the per-State queue",
);

// ---------- Run 2: reasoning off ----------
rm();
const Run2 = Make(Validate({ normalizeReasoning: false, logFile: Ledger }));
const L2 = Run2.Listeners["llm/stream"];
const Out2 = [];
for await (const C of L2(Object.freeze({}), () =>
	(async function* () {
		yield { type: "reasoning-delta", index: 0, text: "\u200B" };
		yield { type: "text-delta", index: 0, text: "plain text" };
	})(),
)) {
	Out2.push(C);
}
Check(
	Out2[0] && Out2[0].text === "\u200B",
	"reasoning-delta passthrough (identity) when normalizeReasoning=off",
);
Check(Out2.length === 2, "stream completed with both chunks");
Check(Out2[1] === undefined || typeof Out2[1] === "object", "stream completed");
await new Promise((R) => setTimeout(R, 10));
Check(
	!existsSync(Ledger) || !readFileSync(Ledger, "utf8").includes("normalized"),
	"NO count line when nothing replaced (N=0)",
);
Check(
	Furnace.PendingJournal.filter((R) => R.event === "normalized").length === 1,
	"NO journal record when nothing was replaced (N=0)",
);

// ---------- Run 3: custom replacement + literal insertion ----------
rm();
const Run3 = Make(Validate({ replacement: "X", logFile: Ledger }));
const L3 = Run3.Listeners["llm/stream"];
Check(Run3.State.Replacement === "X", "volatile unwrap: custom replacement unwrapped");
const Out3 = [];
for await (const C of L3(Object.freeze({}), () =>
	(async function* () {
		yield { type: "text-delta", index: 0, text: "\u200Bend" };
	})(),
)) {
	Out3.push(C);
}
Check(Out3[0].text === "Xend", "custom replacement inserted LITERALLY (function replacer)");
await new Promise((R) => setTimeout(R, 10));
Check(
	readFileSync(Ledger, "utf8").includes("normalized 1 invisible char(s) in one stream"),
	"count line reflects custom-replacement run",
);
const JournalRun3 = Furnace.PendingJournal.filter((R) => R.event === "normalized");
Check(JournalRun3.length === 2, "the custom-replacement run adds its 'normalized' journal record");
Check(
	JournalRun3[1] !== undefined &&
		JournalRun3[1].detail === "normalized 1 invisible char(s) in one stream",
	"custom-replacement journal detail mirrors the ledger line",
);

// ---------- Run 4: upstream throw propagates, no count line ----------
rm();
const Run4 = Make(Validate({ logFile: Ledger }));
const L4 = Run4.Listeners["llm/stream"];
let Threw = null;
try {
	for await (const C of L4(Object.freeze({}), () =>
		(async function* () {
			yield { type: "text-delta", index: 0, text: "\u200B" };
			throw new Error("transport boom");
		})(),
	)) {
		void C;
	}
} catch (E) {
	Threw = E;
}
Check(Threw && Threw.message === "transport boom", "upstream throw propagates through the wrapper");
await new Promise((R) => setTimeout(R, 10));
Check(
	!existsSync(Ledger) || !readFileSync(Ledger, "utf8").includes("normalized"),
	"NO count line after an upstream throw",
);
Check(
	Furnace.PendingJournal.filter((R) => R.event === "normalized").length === 2,
	"NO journal record after an upstream throw",
);

// ---------- Run 5: identity when nothing to replace ----------
const Run5 = Make(Validate({ logFile: Ledger }));
const L5 = Run5.Listeners["llm/stream"];
const Keep = { type: "text-delta", index: 0, text: "plain" };
const Out5 = [];
for await (const C of L5(Object.freeze({}), () =>
	(async function* () {
		yield Keep;
	})(),
)) {
	Out5.push(C);
}
Check(Out5[0] === Keep, "unchanged text-delta passes through BY IDENTITY (count 0)");
Check(
	Furnace.PendingJournal.filter((R) => R.event === "normalized").length === 2,
	"identity stream (count 0) adds no journal record",
);

// ---------- Run 6: HMR-safety probe (no module-level state) ----------
const First = Run1.State;
const Second = Run5.State;
Check(
	First !== Second && First.Replacement === "" && Second.Replacement === "",
	"each apply builds a FRESH state (no module-level globals)",
);

// ---------- Run 7: tool args ON (normalizeToolArguments: true) ----------
rm();
const Run7 = Make(Validate({ normalizeToolArguments: true, logFile: Ledger }));
Check(Run7.State.ToolArgs === true, "plain fields: ToolArgs=true when normalizeToolArguments=on");
Check(
	Run7.Lines.some(
		(L) => L.startsWith("hook-dsh-normalize-invisible: activated") && L.includes("toolArgs=on"),
	),
	"activation line reflects toolArgs=on",
);
const L7 = Run7.Listeners["llm/stream"];
const ToolDelta7 = {
	type: "tool-call-delta",
	index: 1,
	id: "call_1",
	name: "write",
	argumentsDelta: '{"path":"a\u200Bb"}',
};
const ToolBlockEnd7 = {
	type: "block-end",
	index: 2,
	block: { type: "tool-call", id: "call_1", name: "write", arguments: '{"path":"a\u200Bb"}' },
};
const Out7 = [];
for await (const C of L7(Object.freeze({}), () =>
	(async function* () {
		yield ToolDelta7;
		yield ToolBlockEnd7;
	})(),
)) {
	Out7.push(C);
}
Check(
	Out7[0].argumentsDelta === '{"path":"ab"}',
	"tool-call-delta argumentsDelta REMOVED the invisible char when normalizeToolArguments=on",
);
Check(
	Out7[0] !== ToolDelta7,
	"rewritten tool-call-delta is a new object (id/index/name preserved)",
);
Check(
	Out7[1].block.arguments === '{"path":"ab"}',
	"block-end ToolCallBlock.arguments normalized too (the deltas AND the block agree)",
);
await new Promise((R) => setTimeout(R, 10));
Check(
	readFileSync(Ledger, "utf8").includes("normalized 2 invisible char(s) in one stream"),
	"count line includes the tool-args removals (delta + block)",
);
const JournalRun7 = Furnace.PendingJournal.filter((R) => R.event === "normalized");
Check(
	JournalRun7.length === 3 &&
		JournalRun7[2].detail === "normalized 2 invisible char(s) in one stream",
	"tool-args removals journal too (delta + block in one count record)",
);

// ---------- Run S (additive): the granular scope gates ----------
// Each scope gate on/off with everything else at defaults; the config is
// hand-built with a `scopes` volatile cell whose getter returns a mutable
// object (the stable-reference simulation). Defaults = the previous
// behavior exactly. The invisible flavor REMOVES (replacement ""): the
// normalized expectations below have the invisible char gone.
const SCOPES_DEFAULT = {
	conversation: true,
	reasoning: true,
	toolInput: false,
	toolResults: false,
	files: true,
	batch: false,
};
const RunS = (Scopes, Flags) =>
	Make({
		log: true,
		logFile: Ledger,
		replacement: "",
		normalizeReasoning: Flags?.reasoning ?? true,
		normalizeToolArguments: Flags?.toolArgs ?? false,
		scopes: { get: () => Scopes },
	});
const DriveS = async (Run, Chunks) => {
	const Out = [];
	for await (const C of Run.Listeners["llm/stream"](
		Object.freeze({ model: "x", messages: [] }),
		() =>
			(async function* () {
				yield* Chunks;
			})(),
	))
		Out.push(C);
	return Out;
};
const TextChunkS = { type: "text-delta", index: 0, text: "a\u200Bb" };
const ReasonChunkS = { type: "reasoning-delta", index: 0, text: "\u200Bx" };
const TextBlockChunkS = {
	type: "block-end",
	index: 0,
	block: { type: "text", text: "\u200Bkept" },
};
const ArgsChunkS = {
	type: "tool-call-delta",
	index: 1,
	id: "call_s",
	name: "bash",
	argumentsDelta: '{"a":"\u200B"}',
};

// S1: conversation off -> text-delta passes by identity (count 0, no line).
const S1 = RunS({ ...SCOPES_DEFAULT, conversation: false });
const OutS1 = await DriveS(S1, [TextChunkS]);
Check(OutS1[0] === TextChunkS, "scopes.conversation off: text-delta passes by identity");
Check(
	S1.Lines.every((L) => !L.includes("normalized")),
	"scopes.conversation off: no count line",
);
// S2: reasoning scope off -> reasoning-delta passes even with normalizeReasoning on.
const S2 = RunS({ ...SCOPES_DEFAULT, reasoning: false });
const OutS2 = await DriveS(S2, [ReasonChunkS]);
Check(OutS2[0] === ReasonChunkS, "scopes.reasoning off: reasoning-delta passes by identity");
// S3: conversation off -> the assembled TEXT block passes by identity too.
const S3 = RunS({ ...SCOPES_DEFAULT, conversation: false });
const OutS3 = await DriveS(S3, [TextBlockChunkS]);
Check(
	OutS3[0].block === TextBlockChunkS.block,
	"scopes.conversation off: text block passes by identity",
);
// S4: the effective toolInput gate is an OR of the deprecated field and the scope.
const S4 = RunS({ ...SCOPES_DEFAULT }, { toolArgs: true });
const OutS4 = await DriveS(S4, [ArgsChunkS]);
Check(
	OutS4[0].argumentsDelta === '{"a":""}',
	"effective toolInput (deprecated field on, scope off): still normalizes (removal)",
);
const S4b = RunS({ ...SCOPES_DEFAULT }, { toolArgs: false });
const OutS4b = await DriveS(S4b, [ArgsChunkS]);
Check(OutS4b[0] === ArgsChunkS, "toolInput both off: passes by identity");
const S4c = RunS({ ...SCOPES_DEFAULT, toolInput: true });
const OutS4c = await DriveS(S4c, [ArgsChunkS]);
Check(
	OutS4c[0].argumentsDelta === '{"a":""}',
	"effective toolInput (scope on, deprecated field off): normalizes (removal)",
);
// S5: the volatile scope flip -> the NEXT stream's gate changes without remount.
const LiveScopes = { ...SCOPES_DEFAULT };
const S5 = RunS(LiveScopes);
LiveScopes.conversation = false;
S5.Listeners["loader/volatile-update"]([["scopes", "conversation"]]);
const OutS5 = await DriveS(S5, [TextChunkS]);
Check(
	OutS5[0] === TextChunkS,
	"volatile scope flip: conversation off applies to the NEXT stream without remount",
);

// ---------- Run O (additive): the overpass arms + the command ----------
// The tool-results arm (tools/post-execute), the step-batch arm
// (agent/pre-step), the normalize-overpass command, the ordering guard and
// the history-safety invariant. Hand-built config with a MUTABLE scopes
// object (the stable-reference simulation) so the scope flips go through
// the factory's volatile-update dispatch like Run V / Run S. The fixtures
// use this flavor's own character class.
rm();
const LiveScopesO = { ...SCOPES_DEFAULT };
const RawO = {
	log: true,
	logFile: Ledger,
	replacement: "",
	normalizeReasoning: true,
	normalizeToolArguments: false,
	scopes: { get: () => LiveScopesO },
};
const RunO = Make(RawO);
const PostO = RunO.Listeners["tools/post-execute"];
const PreO = RunO.Listeners["agent/pre-step"];
const NextAcceptO = async () => ({ kind: "accept" });
const ExecO = (Name) => ({
	callId: "call_smoke",
	name: Name,
	arguments: {},
	signal: new AbortController().signal,
});

// O0: registration facts (the ordering contract is the prepend flag +
// the marker guard, together making any load order safe).
Check(typeof PostO === "function", "overpass: the tools/post-execute arm is registered");
Check(typeof PreO === "function", "overpass: the agent/pre-step arm is registered");
Check(
	RunO.ListenerOptions["tools/post-execute"]?.prepend === true,
	"overpass: the post-execute arm PREPENDS (outermost vs the ccr arm's own prepend)",
);
Check(
	RunO.ListenerOptions["agent/pre-step"] === undefined,
	"overpass: the pre-step arm uses default ordering (nothing needs to precede it)",
);
Check(
	RunO.CommandsRegistered.length === 1 &&
		RunO.CommandsRegistered[0].name === "normalize-overpass" &&
		typeof RunO.CommandsRegistered[0].handler === "function",
	"overpass: the normalize-overpass command is registered (name without slash)",
);

// O1: the tool-results scope is OFF by default -> the bare decision passes.
const OutO1 = await PostO(
	ExecO("bash"),
	{ isError: false, value: {}, content: [{ type: "text", text: "a \u200B b" }] },
	NextAcceptO,
);
Check(
	OutO1.kind === "accept" && !("content" in OutO1),
	"overpass: toolResults off (default) -> the decision passes untouched",
);
// O2: scope ON via the volatile flip -> normalization + the exact ledger line.
LiveScopesO.toolResults = true;
RunO.Listeners["loader/volatile-update"]([["scopes", "toolResults"]]);
const OutO2 = await PostO(
	ExecO("bash"),
	{ isError: false, value: {}, content: [{ type: "text", text: "a \u200B b" }] },
	NextAcceptO,
);
Check(
	OutO2.kind === "accept" && OutO2.content.length === 1 && OutO2.content[0].text === "a  b",
	"overpass: toolResults on -> the text block is rewritten (em dash -> hyphen)",
);
Check(
	RunO.Lines.includes(
		"hook-dsh-normalize-invisible: overpass: normalized 1 char(s) in tool result bash call_smoke",
	),
	"overpass: the tool-result ledger line is byte-exact",
);
Check(
	RunO.State.Factory === Furnace,
	"overpass: the arm runs against the REAL factory (no direct fs access)",
);

// O3: the exemption list -> `read` passes by identity even with the scope on.
const OutO3 = await PostO(
	ExecO("read"),
	{ isError: false, value: {}, content: [{ type: "text", text: "a \u200B b" }] },
	NextAcceptO,
);
Check(
	OutO3.kind === "accept" && !("content" in OutO3),
	"overpass: exempt tool (read) passes through by identity",
);

// O4: non-text blocks are never touched; a mixed content rewrites only text.
const ToolBlockO = { type: "tool-call", name: "bash", arguments: '{"a":"\u200B"}' };
const OutO4 = await PostO(
	ExecO("bash"),
	{
		isError: false,
		value: {},
		content: [ToolBlockO, { type: "text", text: "x \u200B y" }],
	},
	NextAcceptO,
);
Check(
	OutO4.content[0] === ToolBlockO && OutO4.content[0].arguments === '{"a":"\u200B"}',
	"overpass: tool-call/argument blocks pass untouched (execution-critical JSON)",
);
Check(
	OutO4.content[1].text === "x  y",
	"overpass: the text block in the same content IS rewritten",
);

// O5: N = 0 -> the decision unchanged and NO ledger line.
const LinesBeforeO5 = RunO.Lines.length;
const OutO5 = await PostO(
	ExecO("bash"),
	{ isError: false, value: {}, content: [{ type: "text", text: "plain text" }] },
	NextAcceptO,
);
Check(
	OutO5.kind === "accept" && !("content" in OutO5),
	"overpass: N=0 payload -> the bare decision unchanged",
);
Check(RunO.Lines.length === LinesBeforeO5, "overpass: N=0 -> no ledger line (the no-op rule)");

// O6: a value-carrying decision is canonical -> untouched.
const OutO6 = await PostO(
	ExecO("bash"),
	{ isError: false, value: {}, content: [{ type: "text", text: "a \u200B b" }] },
	async () => ({ kind: "accept", value: { ok: 1 } }),
);
Check(
	OutO6.kind === "accept" && OutO6.value.ok === 1 && !("content" in OutO6),
	"overpass: value-carrying decision passes untouched",
);

// O7: the CCR marker guard -> marker-bearing content passes unchanged
// (the ordering guard: normalization never touches a ccr replacement).
const MarkerBlockO = {
	type: "text",
	text: "[text:preview]\n<<<CCR:0123456789abcdef01234567|text|42>>>",
};
const OutO7 = await PostO(
	ExecO("bash"),
	{ isError: false, value: {}, content: [MarkerBlockO] },
	NextAcceptO,
);
Check(
	OutO7.kind === "accept" && !("content" in OutO7),
	"overpass: marker-bearing content passes through the arm unchanged (N=0 on a ccr replacement)",
);
Check(
	RunO.Lines.length === LinesBeforeO5,
	"overpass: O5/O6/O7 added NO ledger lines (the no-op and pass-through rules)",
);

// O8: the content basis is the DOWNSTREAM decision's content when present.
const OutO8 = await PostO(
	ExecO("bash"),
	{ isError: false, value: {}, content: [{ type: "text", text: "raw \u200B result" }] },
	async () => ({ kind: "accept", content: [{ type: "text", text: "downstream \u200B shaped" }] }),
);
Check(
	OutO8.content[0].text === "downstream  shaped",
	"overpass: the downstream decision's content is the basis (not the raw result)",
);

// O9: the batch scope is OFF by default -> the enter decision passes.
const MsgO = (Text) => ({ role: "user", content: [{ type: "text", text: Text }] });
const OutO9 = await PreO(
	{
		agent: {},
		messages: [MsgO("a \u200B batch")],
		turn: 3,
		step: 1,
		signal: new AbortController().signal,
	},
	async () => ({ kind: "enter", messages: [MsgO("a \u200B batch")] }),
);
Check(
	OutO9.kind === "enter" && OutO9.messages[0].content[0].text === "a \u200B batch",
	"overpass: batch off (default) -> the enter decision passes untouched",
);

// O10: batch ON via the volatile flip -> normalized messages + exact ledger.
LiveScopesO.batch = true;
RunO.Listeners["loader/volatile-update"]([["scopes", "batch"]]);
const LinesBeforeO10 = RunO.Lines.length;
const OutO10 = await PreO(
	{
		agent: {},
		messages: [MsgO("a \u200B batch")],
		turn: 3,
		step: 1,
		signal: new AbortController().signal,
	},
	async () => ({ kind: "enter", messages: [MsgO("a \u200B batch")] }),
);
Check(
	OutO10.kind === "enter" && OutO10.messages[0].content[0].text === "a  batch",
	"overpass: batch on -> the text blocks in the incoming batch are rewritten",
);
Check(
	RunO.Lines.includes(
		"hook-dsh-normalize-invisible: overpass: normalized 1 char(s) in step batch (turn 3 step 1)",
	),
	"overpass: the step-batch ledger line is byte-exact",
);

// O11: N=0 batch -> decision unchanged, no ledger line.
const LinesBeforeO11 = RunO.Lines.length;
const OutO11 = await PreO(
	{
		agent: {},
		messages: [MsgO("plain")],
		turn: 3,
		step: 2,
		signal: new AbortController().signal,
	},
	async () => ({ kind: "enter", messages: [MsgO("plain")] }),
);
Check(OutO11.kind === "enter", "overpass: N=0 batch -> the decision unchanged");
Check(RunO.Lines.length === LinesBeforeO11, "overpass: N=0 batch -> no ledger line");

// O12: the one-shot arm from the command fires ONCE regardless of the scope.
LiveScopesO.batch = false;
RunO.Listeners["loader/volatile-update"]([["scopes", "batch"]]);
const CommandO = RunO.CommandsRegistered[0];
const ArmO = await CommandO.handler({ rawInput: "batch" });
Check(
	ArmO.kind === "success" && RunO.State.Overpass === true,
	"overpass: the command's batch grammar arms the one-shot flag",
);
const OutO12 = await PreO(
	{
		agent: {},
		messages: [MsgO("a \u200B batch")],
		turn: 4,
		step: 0,
		signal: new AbortController().signal,
	},
	async () => ({ kind: "enter", messages: [MsgO("a \u200B batch")] }),
);
Check(
	OutO12.messages[0].content[0].text === "a  batch",
	"overpass: the one-shot arm normalizes the next batch with the scope off",
);
Check(
	RunO.Lines.includes(
		"hook-dsh-normalize-invisible: overpass: normalized 1 char(s) in step batch (turn 4 step 0)",
	),
	"overpass: the one-shot batch ledger line is byte-exact",
);
Check(
	RunO.State.Overpass === false,
	"overpass: the one-shot flag is consumed (cleared after one use)",
);
const OutO12b = await PreO(
	{
		agent: {},
		messages: [MsgO("a \u200B batch")],
		turn: 4,
		step: 1,
		signal: new AbortController().signal,
	},
	async () => ({ kind: "enter", messages: [MsgO("a \u200B batch")] }),
);
Check(
	OutO12b.messages[0].content[0].text === "a \u200B batch",
	"overpass: the second batch after the one-shot passes untouched (exactly one use)",
);

// O13: a rejected step is never touched.
const OutO13 = await PreO(
	{
		agent: {},
		messages: [MsgO("a \u200B")],
		turn: 5,
		step: 0,
		signal: new AbortController().signal,
	},
	async () => ({ kind: "reject" }),
);
Check(OutO13.kind === "reject", "overpass: a reject decision passes untouched");

// O14: the command's other grammars.
const ReportO = await CommandO.handler({ rawInput: "scopes" });
Check(
	ReportO.kind === "success" &&
		ReportO.text.includes("conversation=on") &&
		ReportO.text.includes("toolResults=on") &&
		ReportO.text.includes("batch=off") &&
		ReportO.text.includes("exempt: read, edit"),
	"overpass: the scopes report is the read-only effective-values summary",
);
const FilesO = await CommandO.handler({ rawInput: "files /tmp/x.txt" });
Check(
	FilesO.kind === "error" && FilesO.text.includes("normalize-file"),
	"overpass: the files sweep is declined by a stream flavor (owned by normalize-file)",
);
const ResultsBadO = await CommandO.handler({ rawInput: "results" });
Check(ResultsBadO.kind === "error", "overpass: 'results' without on|off is a usage error");
const JunkO = await CommandO.handler({ rawInput: "nonsense" });
Check(JunkO.kind === "error", "overpass: an unknown grammar is a usage error");
const ResultsO = await CommandO.handler({ rawInput: "results on" });
Check(
	ResultsO.kind === "success" &&
		(ResultsO.text.includes("settings") || ResultsO.text.includes("config")),
	"overpass: 'results on' with no settings/config-editor service reports the settings path (config stays the source of truth)",
);
rm();
console.log(`\n${Pass} PASS, ${Fail} FAIL`);
process.exit(Fail === 0 ? 0 : 1);

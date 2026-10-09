// Classic/smokes/fullwidth-smoke.mjs — the family smoke pattern: a
// fake ctx (on capture, get returning the REAL @playform/ets-dsh-plugin-factory
// instance from its built Target, logger capture) + the REAL fullwidth apply
// (from the built Target) → assert the full llm/stream waterfall contract
// for the MAP flavor (the core's Fullwidth char→char table — no replacement
// knob).
import { appendFileSync, rmSync, readFileSync, existsSync } from "node:fs";
import Fullwidth from "../packages/ets-hook-dsh-normalize-fullwidth/Target/Library.js";
import FactoryClass from "../packages/ets-dsh-plugin-factory/Target/Library.js";

const Ledger = "/tmp/fullwidth-smoke-ledger.log";
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
		Lines = [];
	const Context = {
		// The service accessor (typed via Interface/Factory's augmentation): the
		// REAL factory instance, guaranteed present by `inject: ["pluginFactory"]`.
		pluginFactory: Furnace,
		on: (Name, Listener) => {
			Listeners[Name] = Listener;
			return () => true;
		},
		get: (Name) => {
			switch (Name) {
				case "pluginFactory":
					return Furnace;
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
	return { Context, Listeners, Lines, State: Context.__hookDshFullwidthState };
};

const Fullwidth0 = Fullwidth; // (apply + Config live on both named and default)
const { apply, Config: Schema } = Fullwidth0;
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
Check(Raw1.replacement === undefined, "MAP flavor: no replacement field in the schema");
Check(Raw1.normalizeReasoning === true, "config default normalizeReasoning=true");
Check(Raw1.normalizeToolArguments === false, "config default normalizeToolArguments=false");
const Run1 = Make(Raw1);

Check(typeof Run1.Listeners["llm/stream"] === "function", "the llm/stream listener is registered");
Check(Object.keys(Run1.Listeners).length === 1, "only llm/stream registered");
Check(Run1.State && Run1.State.Factory === Furnace, "state carries the REAL factory instance");
Check(
	Run1.State.Ledger === "/tmp/fullwidth-smoke-ledger.log",
	"volatile unwrap: logFile cell unwrapped to State.Ledger",
);
Check(Run1.State.Enabled === true, "volatile unwrap: log cell unwrapped to State.Enabled=true");
Check(!("Replacement" in Run1.State), "MAP flavor: state carries no Replacement field");
Check(
	Run1.State.Reasoning === true && Run1.State.ToolArgs === false,
	"plain fields: Reasoning=true, ToolArgs=false",
);
Check(
	Run1.State.Module === "hook-dsh-normalize-fullwidth",
	"state module = hook-dsh-normalize-fullwidth (the ledger prefix)",
);
const Activation = `[${Run1.Lines.find((L) => L.startsWith("hook-dsh-normalize-fullwidth: activated")) ?? ""}]`;
Check(
	Run1.Lines.includes(
		"hook-dsh-normalize-fullwidth: activated (reasoning=on, toolArgs=off, logFile=/tmp/fullwidth-smoke-ledger.log)",
	),
	"activation ledger line byte-exact",
);

// ---------- The waterfall listener, exercised ----------
const FULLWIDTH = "\uFF21\uFF11\uFF01\uFF1F"; // Ａ１！？ → A1!?
const Listener = Run1.Listeners["llm/stream"];

const Chunks = [
	{ type: "block-start", index: 0, blockType: "text" },
	{ type: "text-delta", index: 0, text: FULLWIDTH },
	{
		type: "tool-call-delta",
		index: 1,
		id: "call_1",
		name: "write",
		argumentsDelta: '{"path":"\uFF21\uFF11"}',
	},
	{ type: "reasoning-delta", index: 2, text: "\uFF38\uFF39" },
	{ type: "block-end", index: 0, block: { type: "text", text: "\uFF28\uFF49" } },
	{ type: "block-end", index: 2, block: { type: "reasoning", text: "\uFF39" } },
	{ type: "block-end", index: 3, block: { type: "reasoning", text: "", thinking: "\uFF3A" } },
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
Check(Out[2].argumentsDelta.includes("\uFF21"), "argumentsDelta full-width letter still verbatim");
Check(Out[7] === Chunks[7], "usage passthrough BY IDENTITY");
Check(Out[8] === Chunks[8], "finish passthrough BY IDENTITY");
Check(Out[1].text === "A1!?", "text-delta normalized (Ａ→A, １→1, ！→!, ？→?)");
Check(
	Out[1] !== Chunks[1] && Out[1].index === 0,
	"rewritten text-delta is a new object, index preserved",
);
Check(Out[3].text === "XY", "reasoning-delta normalized when reasoning=on (ＸＹ → XY)");
Check(Out[4].block.text === "Hi", "block-end TextBlock.text normalized (Ｈｉ → Hi)");
Check(Out[5].block.text === "Y", "block-end ReasoningBlock.text normalized (rc.2 field)");
Check(Out[6].block.thinking === "Z", "block-end runtime `thinking` field normalized (defensive)");
Check(Out[5] !== Chunks[5], "rewritten block-end is a new object");
await new Promise((R) => setTimeout(R, 10));
const Log1 = existsSync(Ledger) ? readFileSync(Ledger, "utf8") : "";
Check(
	Log1.includes("normalized 10 fullwidth char(s) in one stream"),
	"count ledger line written after the 10-replacement stream (N>0)",
);
Check(
	Log1.split("\n").filter((L) => L.includes("normalized")).length === 1,
	"exactly ONE count line for the stream",
);
Check(
	Run1.Lines.filter((L) => L.includes("normalized")).length === 1 &&
		Run1.Lines[1] ===
			"hook-dsh-normalize-fullwidth: normalized 10 fullwidth char(s) in one stream",
	"logger line 'hook-dsh-normalize-fullwidth: normalized 10 fullwidth char(s) in one stream' (4 delta + 2 reasoning + 2 block-end + 1 thinking)",
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
	"exactly ONE 'normalized' journal record after the 10-replacement stream",
);
Check(
	JournalRun1[0] !== undefined && JournalRun1[0].path === "",
	"the 'normalized' record carries an empty path (stream-level event)",
);
Check(
	JournalRun1[0] !== undefined &&
		JournalRun1[0].detail === "normalized 10 fullwidth char(s) in one stream",
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
		yield { type: "reasoning-delta", index: 0, text: "\uFF38" };
		yield { type: "text-delta", index: 0, text: "plain text" };
	})(),
)) {
	Out2.push(C);
}
Check(
	Out2[0] && Out2[0].text === "\uFF38",
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

// ---------- Run 3: the MAP's special values inserted literally (no replacement knob) ----------
rm();
const Run3 = Make(Validate({ logFile: Ledger }));
const L3 = Run3.Listeners["llm/stream"];
const Out3 = [];
for await (const C of L3(Object.freeze({}), () =>
	(async function* () {
		yield { type: "text-delta", index: 0, text: "\uFF04\uFF3C\uFF3E\uFF5C" };
	})(),
)) {
	Out3.push(C);
}
Check(
	Out3[0].text === "$\\^|",
	"special half-width values come out LITERALLY (＄→$, ＼→\\, ＾→^, ｜→| — function replacer, no replacement-pattern interpretation)",
);
Check(
	Out3[0].text.length === 4,
	"MAP flavor is 1:1 — one half-width char out per full-width char in",
);
await new Promise((R) => setTimeout(R, 10));
Check(
	readFileSync(Ledger, "utf8").includes("normalized 4 fullwidth char(s) in one stream"),
	"count line reflects the 4-code-point run",
);
const JournalRun3 = Furnace.PendingJournal.filter((R) => R.event === "normalized");
Check(JournalRun3.length === 2, "the special-values run adds its 'normalized' journal record");
Check(
	JournalRun3[1] !== undefined &&
		JournalRun3[1].detail === "normalized 4 fullwidth char(s) in one stream",
	"special-values journal detail mirrors the ledger line",
);

// ---------- Run 4: upstream throw propagates, no count line ----------
rm();
const Run4 = Make(Validate({ logFile: Ledger }));
const L4 = Run4.Listeners["llm/stream"];
let Threw = null;
try {
	for await (const C of L4(Object.freeze({}), () =>
		(async function* () {
			yield { type: "text-delta", index: 0, text: "\uFF01" };
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
	First !== Second && First.Reasoning === true && Second.Reasoning === true,
	"each apply builds a FRESH state (no module-level globals)",
);

// ---------- Run 7: tool args ON (normalizeToolArguments: true) ----------
rm();
const Run7 = Make(Validate({ normalizeToolArguments: true, logFile: Ledger }));
Check(Run7.State.ToolArgs === true, "plain fields: ToolArgs=true when normalizeToolArguments=on");
Check(
	Run7.Lines.some(
		(L) => L.startsWith("hook-dsh-normalize-fullwidth: activated") && L.includes("toolArgs=on"),
	),
	"activation line reflects toolArgs=on",
);
const L7 = Run7.Listeners["llm/stream"];
const ToolDelta7 = {
	type: "tool-call-delta",
	index: 1,
	id: "call_1",
	name: "write",
	argumentsDelta: '{"path":"a\uFF1Ab"}',
};
const ToolBlockEnd7 = {
	type: "block-end",
	index: 2,
	block: { type: "tool-call", id: "call_1", name: "write", arguments: '{"path":"a\uFF1Ab"}' },
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
	Out7[0].argumentsDelta === '{"path":"a:b"}',
	"tool-call-delta argumentsDelta normalized when normalizeToolArguments=on (fullwidth colon → ASCII)",
);
Check(
	Out7[0] !== ToolDelta7,
	"rewritten tool-call-delta is a new object (id/index/name preserved)",
);
Check(
	Out7[1].block.arguments === '{"path":"a:b"}',
	"block-end ToolCallBlock.arguments normalized too (the deltas AND the block agree)",
);
await new Promise((R) => setTimeout(R, 10));
Check(
	readFileSync(Ledger, "utf8").includes("normalized 2 fullwidth char(s) in one stream"),
	"count line includes the tool-args replacements (delta + block)",
);
const JournalRun7 = Furnace.PendingJournal.filter((R) => R.event === "normalized");
Check(
	JournalRun7.length === 3 &&
		JournalRun7[2].detail === "normalized 2 fullwidth char(s) in one stream",
	"tool-args replacements journal too (delta + block in one count record)",
);

rm();
console.log(`\n${Pass} PASS, ${Fail} FAIL`);
process.exit(Fail === 0 ? 0 : 1);

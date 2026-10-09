// Classic/smokes/normalize-dash-smoke.mjs — the family smoke pattern: a fake ctx (on capture,
// get returning the REAL @playform/plugin-dsh-factory instance from its built
// Target, logger capture) + the REAL dash apply (from the built Target) →
// assert the full llm/stream waterfall contract.
import { appendFileSync, rmSync, readFileSync, existsSync } from "node:fs";
import NormalizeDash from "../packages/hook-dsh-normalize-dash/Target/Library.js";
import FactoryClass from "../packages/plugin-dsh-factory/Target/Library.js";

const Ledger = "/tmp/normalize-dash-smoke-ledger.log";
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
// captures lines; the tool/fs seams capture the raw-write tool's registration
// and its fs path (a BARE backend: sandboxMode undefined, so the standing
// sandbox-policy path is skipped — exactly the no-confinement branch of the
// built-in write's FsSandboxController).
const Make = (Raw) => {
	const Listeners = {},
		Lines = [];
	const Registered = [],
		Resolved = [],
		Writes = [],
		Intents = [],
		Observations = [];
	const Files = new Map();
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
		// The tool registry seam: records every registered definition.
		tools: {
			register: (Definition) => {
				Registered.push(Definition);
				return () => true;
			},
		},
		// The fs seam: resolve manufactures a stable target; writeText records
		// the call, honors the abort signal like a real backend, and reports
		// create/update from its own in-memory prior state.
		fs: {
			sandboxMode: undefined,
			resolve: async (Path, Opts) => {
				Resolved.push({ path: Path, signal: Opts?.signal });
				return { targetKey: `key:${Path}`, displayPath: Path };
			},
			writeText: async (Target, Content, Intent, Signal, Policy) => {
				if (Signal?.aborted) throw new Error("aborted before write");
				Writes.push({
					target: Target,
					content: Content,
					intent: Intent,
					signal: Signal,
					policy: Policy,
				});
				const Before = Files.get(Target.targetKey) ?? null;
				Files.set(Target.targetKey, Content);
				return {
					operation: Before === null ? "create" : "update",
					version: `v${Writes.length}`,
					before: Before,
					after: Content,
				};
			},
		},
		// The fs/write-intent waterfall: next() delegates to the unconditional
		// default (no observation policy in the smoke harness).
		waterfall: async (Name, Target, Actor, Next) => {
			Intents.push({ name: Name, target: Target });
			return Next();
		},
		// The fs/observed emit: a synchronous recorder (the governance hooks'
		// trigger — the raw-write must fire it exactly like the built-in write).
		emit: (Name, Target, Observation, Actor) => {
			Observations.push({
				name: Name,
				target: Target,
				observation: Observation,
				actor: Actor,
			});
		},
		// The ROOT seam: cordis plugin contexts inherit `root` — the shared write
		// executor's fs/observed emit goes through ctx.root (the built-in write's
		// own posture: its ctx IS the root, and a listener hears root emissions
		// from its own scope too). The fake ctx is its own root, so
		// ctx.root.emit captures into Observations (a harness seam, not an
		// assertion change — Run 8's emit assertions are untouched).
		get root() {
			return Context;
		},
	};
	apply(Context, Raw); // the loader contract: apply(ctx, config)
	return {
		Context,
		Listeners,
		Lines,
		Registered,
		Resolved,
		Writes,
		Intents,
		Observations,
		State: Context.__hookDshNormalizeDashState,
	};
};

const NormalizeDash0 = NormalizeDash; // (apply + Config live on both named and default)
const { apply, Config: Schema } = NormalizeDash0;
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
Check(Object.keys(Run1.Listeners).length === 1, "only llm/stream registered");
Check(Run1.State && Run1.State.Factory === Furnace, "state carries the REAL factory instance");
Check(
	Run1.State.Ledger === "/tmp/normalize-dash-smoke-ledger.log",
	"volatile unwrap: logFile cell unwrapped to State.Ledger",
);
Check(Run1.State.Enabled === true, "volatile unwrap: log cell unwrapped to State.Enabled=true");
Check(
	Run1.State.Replacement === "-",
	"volatile unwrap: replacement cell unwrapped to State.Replacement='-'",
);
Check(
	Run1.State.Reasoning === true && Run1.State.ToolArgs === false,
	"plain fields: Reasoning=true, ToolArgs=false",
);
Check(
	Run1.State.Module === "hook-dsh-normalize-dash",
	"state module = hook-dsh-normalize-dash (the ledger prefix)",
);
const Activation = `[${Run1.Lines.find((L) => L.startsWith("hook-dsh-normalize-dash: activated")) ?? ""}]`;
Check(
	Run1.Lines.includes(
		"hook-dsh-normalize-dash: activated (replacement=-, reasoning=on, toolArgs=off, logFile=/tmp/normalize-dash-smoke-ledger.log)",
	),
	"activation ledger line byte-exact",
);

// ---------- The waterfall listener, exercised ----------
const DASHES = "a \u2014 b \u2013 c \u2011 d \u2015 e"; // em, en, U+2011, U+2015
const Listener = Run1.Listeners["llm/stream"];

const Chunks = [
	{ type: "block-start", index: 0, blockType: "text" },
	{ type: "text-delta", index: 0, text: DASHES },
	{
		type: "tool-call-delta",
		index: 1,
		id: "call_1",
		name: "write",
		argumentsDelta: '{"path":"a\u2014b"}',
	},
	{ type: "reasoning-delta", index: 2, text: "\u2014x\u2013" },
	{ type: "block-end", index: 0, block: { type: "text", text: "\u2014kept \u2013gone" } },
	{ type: "block-end", index: 2, block: { type: "reasoning", text: "\u2014y" } },
	{ type: "block-end", index: 3, block: { type: "reasoning", text: "", thinking: "\u2014z" } },
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
Check(Out[2].argumentsDelta.includes("\u2014"), "argumentsDelta dash still verbatim");
Check(Out[7] === Chunks[7], "usage passthrough BY IDENTITY");
Check(Out[8] === Chunks[8], "finish passthrough BY IDENTITY");
Check(Out[1].text === "a - b - c - d - e", "text-delta normalized (em/en/U+2011/U+2015 → '-')");
Check(
	Out[1] !== Chunks[1] && Out[1].index === 0,
	"rewritten text-delta is a new object, index preserved",
);
Check(Out[3].text === "-x-", "reasoning-delta normalized when reasoning=on");
Check(Out[4].block.text === "-kept -gone", "block-end TextBlock.text normalized");
Check(Out[5].block.text === "-y", "block-end ReasoningBlock.text normalized (rc.2 field)");
Check(Out[6].block.thinking === "-z", "block-end runtime `thinking` field normalized (defensive)");
Check(Out[5] !== Chunks[5], "rewritten block-end is a new object");
await new Promise((R) => setTimeout(R, 10));
const Log1 = existsSync(Ledger) ? readFileSync(Ledger, "utf8") : "";
Check(
	Log1.includes("normalized 10 dash char(s) in one stream"),
	"count ledger line written after the 10-replacement stream (N>0)",
);
Check(
	Log1.split("\n").filter((L) => L.includes("normalized")).length === 1,
	"exactly ONE count line for the stream",
);
Check(
	Run1.Lines.filter((L) => L.includes("normalized")).length === 1 &&
		Run1.Lines[1] === "hook-dsh-normalize-dash: normalized 10 dash char(s) in one stream",
	"logger line 'hook-dsh-normalize-dash: normalized 10 dash char(s) in one stream' (4 delta + 2 reasoning + 3 block-end + 1 thinking)",
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
		JournalRun1[0].detail === "normalized 10 dash char(s) in one stream",
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
		yield { type: "reasoning-delta", index: 0, text: "\u2014" };
		yield { type: "text-delta", index: 0, text: "plain - text" };
	})(),
)) {
	Out2.push(C);
}
Check(
	Out2[0] && Out2[0].text === "\u2014",
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

// ---------- Run 3: custom replacement + $-literal safety ----------
rm();
const Run3 = Make(Validate({ replacement: "$&", logFile: Ledger }));
const L3 = Run3.Listeners["llm/stream"];
Check(Run3.State.Replacement === "$&", "volatile unwrap: custom replacement unwrapped");
const Out3 = [];
for await (const C of L3(Object.freeze({}), () =>
	(async function* () {
		yield { type: "text-delta", index: 0, text: "\u2014end" };
	})(),
)) {
	Out3.push(C);
}
Check(
	Out3[0].text === "$&end",
	"custom replacement inserted LITERALLY (function replacer, no $-pattern interpretation)",
);
await new Promise((R) => setTimeout(R, 10));
Check(
	readFileSync(Ledger, "utf8").includes("normalized 1 dash char(s) in one stream"),
	"count line reflects custom-replacement run",
);
const JournalRun3 = Furnace.PendingJournal.filter((R) => R.event === "normalized");
Check(JournalRun3.length === 2, "the custom-replacement run adds its 'normalized' journal record");
Check(
	JournalRun3[1] !== undefined &&
		JournalRun3[1].detail === "normalized 1 dash char(s) in one stream",
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
			yield { type: "text-delta", index: 0, text: "\u2014" };
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
	First !== Second && First.Replacement === "-" && Second.Replacement === "-",
	"each apply builds a FRESH state (no module-level globals)",
);

// ---------- Run 7: tool args ON (normalizeToolArguments: true) ----------
rm();
const Run7 = Make(Validate({ normalizeToolArguments: true, logFile: Ledger }));
Check(Run7.State.ToolArgs === true, "plain fields: ToolArgs=true when normalizeToolArguments=on");
Check(
	Run7.Lines.some(
		(L) => L.startsWith("hook-dsh-normalize-dash: activated") && L.includes("toolArgs=on"),
	),
	"activation line reflects toolArgs=on",
);
const L7 = Run7.Listeners["llm/stream"];
const ToolDelta7 = {
	type: "tool-call-delta",
	index: 1,
	id: "call_1",
	name: "write",
	argumentsDelta: '{"path":"a\u2014b"}',
};
const ToolBlockEnd7 = {
	type: "block-end",
	index: 2,
	block: { type: "tool-call", id: "call_1", name: "write", arguments: '{"path":"a\u2014b"}' },
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
	Out7[0].argumentsDelta === '{"path":"a-b"}',
	"tool-call-delta argumentsDelta normalized when normalizeToolArguments=on",
);
Check(
	Out7[0] !== ToolDelta7,
	"rewritten tool-call-delta is a new object (id/index/name preserved)",
);
Check(
	Out7[1].block.arguments === '{"path":"a-b"}',
	"block-end ToolCallBlock.arguments normalized too (the deltas AND the block agree)",
);
await new Promise((R) => setTimeout(R, 10));
Check(
	readFileSync(Ledger, "utf8").includes("normalized 2 dash char(s) in one stream"),
	"count line includes the tool-args replacements (delta + block)",
);
const JournalRun7 = Furnace.PendingJournal.filter((R) => R.event === "normalized");
Check(
	JournalRun7.length === 3 && JournalRun7[2].detail === "normalized 2 dash char(s) in one stream",
	"tool-args replacements journal too (delta + block in one count record)",
);

// ---------- Run 7b: the edit exemption (normalizeToolArguments: on) ----------
rm();
const Run7b = Make(Validate({ normalizeToolArguments: true, logFile: Ledger }));
const L7b = Run7b.Listeners["llm/stream"];
const EditDelta7b = {
	type: "tool-call-delta",
	index: 1,
	id: "call_9",
	name: "edit",
	argumentsDelta: '{"old_string":"a\u2014b","new_string":"x"}',
};
const EditBlockEnd7b = {
	type: "block-end",
	index: 2,
	block: {
		type: "tool-call",
		id: "call_9",
		name: "edit",
		arguments: '{"old_string":"a\u2014b"}',
	},
};
const Out7b = [];
for await (const C of L7b(Object.freeze({}), () =>
	(async function* () {
		yield EditDelta7b;
		yield EditBlockEnd7b;
	})(),
)) {
	Out7b.push(C);
}
Check(
	Out7b[0] === EditDelta7b,
	"edit tool-call-delta passes through BY IDENTITY with the flag on (old_string must match real file bytes)",
);
Check(Out7b[0].argumentsDelta.includes("\u2014"), "edit argumentsDelta dash still verbatim");
Check(
	Out7b[1].block === EditBlockEnd7b.block,
	"edit ToolCallBlock passes through BY IDENTITY too (the deltas AND the block agree)",
);
Check(Out7b[1].block.arguments.includes("\u2014"), "edit block arguments dash still verbatim");
await new Promise((R) => setTimeout(R, 10));
Check(
	!existsSync(Ledger) || !readFileSync(Ledger, "utf8").includes("normalized"),
	"NO count line for an edit-only stream (nothing normalized)",
);
Check(
	Furnace.PendingJournal.filter((R) => R.event === "normalized").length === 3,
	"NO journal record for an edit-only stream (nothing normalized)",
);

// ---------- Run 7c: the per-call raw marker (normalizeToolArguments: on) ----------
rm();
const Run7c = Make(Validate({ normalizeToolArguments: true, logFile: Ledger }));
const L7c = Run7c.Listeners["llm/stream"];
const RawDelta7c = {
	type: "tool-call-delta",
	index: 1,
	id: "call_7",
	name: "write",
	argumentsDelta: '{"__normalize":false,"path":"a\u2014b"}',
};
const RawNext7c = {
	type: "tool-call-delta",
	index: 1,
	id: "call_7",
	name: "write",
	argumentsDelta: ',"note":"x\u2013y"}',
};
const RawBlockEnd7c = {
	type: "block-end",
	index: 2,
	block: {
		type: "tool-call",
		id: "call_7",
		name: "write",
		arguments: '{"__normalize":false,"path":"a\u2014b","note":"x\u2013y"}',
	},
};
const Out7c = [];
for await (const C of L7c(Object.freeze({}), () =>
	(async function* () {
		yield RawDelta7c;
		yield RawNext7c;
		yield RawBlockEnd7c;
	})(),
)) {
	Out7c.push(C);
}
Check(
	Out7c[0].argumentsDelta === '{"path":"a\u2014b"}',
	"raw-marked call: the marker entry is stripped from the first delta",
);
Check(
	Out7c[0].argumentsDelta.includes("\u2014"),
	"raw-marked arguments pass through UNNORMALIZED (em dash survives)",
);
Check(Out7c[1] === RawNext7c, "subsequent raw-call delta passes through untouched");
Check(
	Out7c[2].block.arguments === '{"path":"a\u2014b","note":"x\u2013y"}',
	"raw-marked assembled block: marker stripped, arguments unnormalized",
);
Check(Out7c[2] !== RawBlockEnd7c, "the stripped raw-marked block-end is a new object");
Check(
	JSON.parse(Out7c[2].block.arguments).__normalize === undefined,
	"the executed arguments carry no __normalize key (no additionalProperties rejection)",
);
await new Promise((R) => setTimeout(R, 10));
Check(
	!existsSync(Ledger) || !readFileSync(Ledger, "utf8").includes("normalized"),
	"NO count line for a raw-marked stream (the strip is not a normalization)",
);
Check(
	Furnace.PendingJournal.filter((R) => R.event === "normalized").length === 3,
	"NO journal record for a raw-marked stream (the strip is not a normalization)",
);

// ---------- Run 7d: the marker state resets at the next call id ----------
rm();
const Run7d = Make(Validate({ normalizeToolArguments: true, logFile: Ledger }));
const L7d = Run7d.Listeners["llm/stream"];
const Out7d = [];
for await (const C of L7d(Object.freeze({}), () =>
	(async function* () {
		yield {
			type: "tool-call-delta",
			index: 0,
			id: "call_7",
			name: "write",
			argumentsDelta: '{"__normalize":false,"path":"a\u2014b"}',
		};
		yield {
			type: "tool-call-delta",
			index: 1,
			id: "call_8",
			name: "write",
			argumentsDelta: '{"path":"a\u2014b"}',
		};
	})(),
)) {
	Out7d.push(C);
}
Check(
	Out7d[0].argumentsDelta === '{"path":"a\u2014b"}',
	"the first call is raw-marked: marker stripped, dash unnormalized",
);
Check(
	Out7d[1].argumentsDelta === '{"path":"a-b"}',
	"the next call id RESETS the marker state: normalization resumes",
);
await new Promise((R) => setTimeout(R, 10));
Check(
	readFileSync(Ledger, "utf8").includes("normalized 1 dash char(s) in one stream"),
	"count line counts only the normalized call (the raw call stays invisible)",
);
const JournalRun7d = Furnace.PendingJournal.filter((R) => R.event === "normalized");
Check(
	JournalRun7d.length === 4 &&
		JournalRun7d[3].detail === "normalized 1 dash char(s) in one stream",
	"the run 7d record journals only the normalized call (the raw call stays invisible)",
);

// ---------- Run 8: the raw-write tool (registration capture + exec) ----------
rm();
const Run8 = Make(Validate({ logFile: Ledger }));
const Tool = Run8.Registered[0];
Check(Run8.Registered.length === 1, "exactly one tool registered");
Check(
	Tool && Tool.name === "raw-write",
	"the tool registration is captured: the tool is named raw-write",
);
Check(
	Tool.parameters.properties.file_path.type === "string" &&
		Tool.parameters.required.includes("file_path"),
	"input schema: file_path is a required string",
);
Check(
	Tool.parameters.properties.content.type === "string" &&
		Tool.parameters.required.includes("content"),
	"input schema: content is a required string",
);
const NormalizeUnion = Tool.parameters.properties.normalize.oneOf;
Check(
	Array.isArray(NormalizeUnion) &&
		NormalizeUnion.length === 3 &&
		NormalizeUnion[0].type === "boolean" &&
		NormalizeUnion[1].type === "string" &&
		NormalizeUnion[1].enum.join() === "all" &&
		NormalizeUnion[2].type === "array" &&
		NormalizeUnion[2].items.type === "string" &&
		NormalizeUnion[2].items.enum.join() === "dash,quotes,ellipsis,spaces,invisible,fullwidth",
	'input schema: normalize is an OPTIONAL union (boolean | "all" | the flavor-name array — the harness tools reject unknown keys, so the whole selection shape is declared)',
);
Check(!Tool.parameters.required.includes("normalize"), "normalize stays OPTIONAL");
const GovernUnion = Tool.parameters.properties.govern.oneOf;
Check(
	Array.isArray(GovernUnion) &&
		GovernUnion.length === 3 &&
		GovernUnion[0].type === "boolean" &&
		GovernUnion[1].type === "string" &&
		GovernUnion[1].enum.join() === "all" &&
		GovernUnion[2].type === "array" &&
		GovernUnion[2].items.type === "string" &&
		GovernUnion[2].items.enum.join() === "canonicalize,pin,cargo,update",
	'input schema: govern is an OPTIONAL union (boolean | "all" | the step-name array)',
);
Check(!Tool.parameters.required.includes("govern"), "govern stays OPTIONAL");
Check(
	Tool.output.schema.properties.path.type === "string" &&
		Tool.output.schema.properties.operation.enum.join() === "create,update" &&
		Tool.output.schema.required.join() === "path,operation,before,after",
	"output schema mirrors the built-in write envelope (path/operation/before/after)",
);

const Exec = (Signal) => ({
	signal: Signal ?? new AbortController().signal,
	agent: undefined,
	callId: "call_smoke",
});

// normalize ABSENT → verbatim (the default).
const Verbatim = "a—b“c”";
const Out8a = await Tool.execute(
	{ file_path: "/tmp/normalize-dash-smoke-verbatim.txt", content: Verbatim },
	Exec(),
);
Check(
	Run8.Writes.length === 1 && Run8.Writes[0].content === Verbatim,
	"normalize absent: content written VERBATIM (em dash and curly quotes untouched)",
);
Check(
	Run8.Writes[0].intent === undefined,
	"the fs/write-intent waterfall's next() default flowed through (unconditional write)",
);
Check(
	Run8.Writes[0].policy === undefined,
	"bare backend: no sandbox policy stamped onto the write",
);
Check(
	Run8.Observations.some(
		(O) =>
			O.name === "fs/observed" &&
			O.observation.kind === "present" &&
			O.observation.version === "v1",
	),
	"fs/observed emitted with the written version (the governance hooks' trigger)",
);
Check(
	Run8.Observations[0].actor &&
		"govern" in Run8.Observations[0].actor &&
		Run8.Observations[0].actor.govern === false,
	"the emitted actor is the WRAPPED exec: the govern marker present, false for an absent flag (the factory's gate skips the event path)",
);
Check(
	Run8.Observations[0].actor.callId === "call_smoke" &&
		"signal" in Run8.Observations[0].actor &&
		Run8.Observations[0].actor.agent === undefined,
	"the wrapped actor preserves every exec field (the spread — name/callId/agent/signal survive for the harness's own listeners)",
);
Check(
	Out8a.path === "/tmp/normalize-dash-smoke-verbatim.txt" &&
		Out8a.operation === "create" &&
		Out8a.before === null &&
		Out8a.after === Verbatim,
	"the write outcome is returned (path, create, before null, after verbatim)",
);

// normalize: true → all SIX transforms, in order.
const All6 = "a—b“c”…d\u00A0e\u200BfＡg";
const Normalized6 = 'a-b"c"...d efAg';
const Out8b = await Tool.execute(
	{ file_path: "/tmp/normalize-dash-smoke-normalized.txt", content: All6, normalize: true },
	Exec(),
);
Check(
	Run8.Writes[1].content === Normalized6,
	"normalize: true → all six transforms applied (em dash→-, curly quotes→straight, ellipsis→..., NBSP→space, zero-width removed, fullwidth→halfwidth)",
);
Check(
	Out8b.operation === "create" && Out8b.after === Normalized6,
	"the normalized write to a new path reports create with the normalized after",
);

// Overwrite the verbatim path: the outcome carries the real before/after.
const Out8d = await Tool.execute(
	{ file_path: "/tmp/normalize-dash-smoke-verbatim.txt", content: All6 },
	Exec(),
);
Check(
	Out8d.operation === "update" && Out8d.before === Verbatim && Out8d.after === All6,
	"an overwrite reports update with the real before/after contents",
);

// normalize: false EXPLICITLY → verbatim.
const Out8c = await Tool.execute(
	{ file_path: "/tmp/normalize-dash-smoke-explicit.txt", content: All6, normalize: false },
	Exec(),
);
Check(Run8.Writes[2].content === All6, "normalize: false → content written VERBATIM");

// The configured replacement knob flows into the tool's Dashes transform.
rm();
const Run8b = Make(Validate({ replacement: "$&", logFile: Ledger }));
await Run8b.Registered[0].execute(
	{ file_path: "/tmp/normalize-dash-smoke-replacement.txt", content: "a—b", normalize: true },
	Exec(),
);
Check(
	Run8b.Writes[0].content === "a$&b",
	"the volatile replacement knob flows into the tool (literal $& — the function replacer)",
);

// A pre-aborted signal → NO write (the fs seam honors the signal; the real
// registry rejects a pre-aborted invocation before the body even runs).
const WritesBeforeAbort = Run8.Writes.length;
const Aborted = new AbortController();
Aborted.abort();
let AbortError = null;
try {
	await Tool.execute(
		{ file_path: "/tmp/normalize-dash-smoke-abort.txt", content: "x—y" },
		Exec(Aborted.signal),
	);
} catch (E) {
	AbortError = E;
}
Check(
	AbortError !== null && /aborted/.test(AbortError.message),
	"a pre-aborted signal rejects the call",
);
Check(
	Run8.Writes.length === WritesBeforeAbort,
	"a pre-aborted signal writes NOTHING (no fs write after the abort)",
);

// ---------- Run 9: the fine-grained normalize selection (per-call flavors) ----------
const DashOnly = "a-b“c”…d\u00A0e\u200BfＡg"; // ONLY the em dash replaced
const QuotesOnly = 'a—b"c"…d\u00A0e\u200BfＡg'; // ONLY the curly quotes replaced
const Out9a = await Tool.execute(
	{ file_path: "/tmp/normalize-dash-smoke-sel-dash.txt", content: All6, normalize: ["dash"] },
	Exec(),
);
Check(
	Run8.Writes.at(-1).content === DashOnly,
	'normalize: ["dash"] → ONLY the dashes replaced (quotes, ellipsis, spaces, invisible, fullwidth untouched)',
);
Check(Out9a.after === DashOnly, 'the ["dash"] write\'s after mirrors the selection');
const Out9b = await Tool.execute(
	{ file_path: "/tmp/normalize-dash-smoke-sel-quotes.txt", content: All6, normalize: ["quotes"] },
	Exec(),
);
Check(
	Run8.Writes.at(-1).content === QuotesOnly,
	'normalize: ["quotes"] → ONLY the curly quotes replaced (em dash untouched)',
);
const Out9c = await Tool.execute(
	{
		file_path: "/tmp/normalize-dash-smoke-sel-fullwidth.txt",
		content: All6,
		normalize: ["fullwidth"],
	},
	Exec(),
);
Check(
	Run8.Writes.at(-1).content === "a—b“c”…d\u00A0e\u200Bf" + "Ag",
	'normalize: ["fullwidth"] → ONLY the fullwidth mapped (Ａ → A)',
);
// The family order is fixed even when the selection is out of order.
const Out9d = await Tool.execute(
	{
		file_path: "/tmp/normalize-dash-smoke-sel-order.txt",
		content: All6,
		normalize: ["fullwidth", "dash", "quotes"],
	},
	Exec(),
);
Check(
	Run8.Writes.at(-1).content === 'a-b"c"…d\u00A0e\u200BfAg',
	"an out-of-order selection applies the flavors in the FAMILY order (dashes → quotes → fullwidth)",
);
// "all" as a string is the legacy boolean behavior, byte-equivalent.
const Out9e = await Tool.execute(
	{ file_path: "/tmp/normalize-dash-smoke-sel-all.txt", content: All6, normalize: "all" },
	Exec(),
);
Check(
	Run8.Writes.at(-1).content === Normalized6,
	'normalize: "all" → all six transforms (byte-equivalent with normalize: true)',
);
// An empty selection and unknown names are verbatim.
const Out9f = await Tool.execute(
	{ file_path: "/tmp/normalize-dash-smoke-sel-empty.txt", content: All6, normalize: [] },
	Exec(),
);
Check(Run8.Writes.at(-1).content === All6, "normalize: [] → an empty selection writes VERBATIM");
let BogusError = null;
try {
	await Tool.execute(
		{
			file_path: "/tmp/normalize-dash-smoke-sel-bogus.txt",
			content: All6,
			normalize: ["bogus"],
		},
		Exec(),
	);
} catch (E) {
	BogusError = E;
}
Check(
	BogusError !== null && /must match exactly one oneOf branch/.test(BogusError.message),
	'normalize: ["bogus"] — the union schema REJECTS unknown flavor names (harness-style args validation; the chain\'s own filter is the second gate)',
);
// The presenters recompute through the same selection-aware chain.
const Call9 = Tool.presentCall({ file_path: "/x", content: All6, normalize: ["dash"] });
Check(
	Call9.diffs[0].newText === DashOnly,
	"presentCall shows the selection-aware content (card and file can never disagree)",
);
const Result9 = Tool.presentResult(
	{ file_path: "/x", content: All6, normalize: ["dash"] },
	{ isError: false },
);
Check(Result9.diffs[0].newText === DashOnly, "presentResult shows the selection-aware content");

// ---------- Run 10: the govern call path (the registry is EMPTY here) ----------
const Writes10 = Run8.Writes.length;
const StepsBefore = Object.keys(Furnace.GovernSteps).length;
const Out10a = await Tool.execute(
	{ file_path: "/tmp/normalize-dash-smoke-gov-true.txt", content: All6, govern: true },
	Exec(),
);
Check(
	Run8.Writes.length === Writes10 + 1 && Out10a.after === All6,
	"govern: true with an empty registry — the write completes (the governed call is a contained no-op)",
);
Check(
	Run8.Observations.at(-1).actor.govern === true,
	"govern: true — the wrapped actor carries the selection value (true; the gate checks presence, the direct path gets the original flag)",
);
const Out10b = await Tool.execute(
	{
		file_path: "/tmp/normalize-dash-smoke-gov-steps.txt",
		content: All6,
		govern: ["canonicalize", "pin"],
	},
	Exec(),
);
Check(
	Run8.Writes.length === Writes10 + 2 && Out10b.after === All6,
	"govern: a step-name array with an empty registry — the write completes (the governed call is a contained no-op)",
);
Check(
	JSON.stringify(Run8.Observations.at(-1).actor.govern) ===
		JSON.stringify(["canonicalize", "pin"]),
	"govern: [steps] — the wrapped actor carries the array selection as-is",
);
let GovBogusError = null;
try {
	await Tool.execute(
		{ file_path: "/tmp/normalize-dash-smoke-gov-bogus.txt", content: All6, govern: ["bogus"] },
		Exec(),
	);
} catch (E) {
	GovBogusError = E;
}
Check(
	GovBogusError !== null && /must match exactly one oneOf branch/.test(GovBogusError.message),
	'govern: ["bogus"] — the union schema rejects unknown step names at the harness boundary',
);
const Out10c = await Tool.execute(
	{ file_path: "/tmp/normalize-dash-smoke-gov-all.txt", content: All6, govern: "all" },
	Exec(),
);
Check(
	Run8.Writes.length === Writes10 + 3 && Out10c.after === All6,
	'govern: "all" with an empty registry — the write completes',
);
Check(
	Run8.Observations.at(-1).actor.govern === true,
	'govern: "all" — the marker maps to true like the boolean',
);
Check(
	Object.keys(Furnace.GovernSteps).length === StepsBefore,
	"govern: the empty registry stays empty (no steps registered by the calls)",
);
// govern combined with the normalize selection on one call.
const Out10d = await Tool.execute(
	{
		file_path: "/tmp/normalize-dash-smoke-gov-norm.txt",
		content: All6,
		normalize: ["dash"],
		govern: true,
	},
	Exec(),
);
Check(
	Run8.Writes.length === Writes10 + 4 && Out10d.after === DashOnly,
	"govern + normalize compose on one call (selection-aware write, contained govern)",
);
// govern: false → no governance (the default posture), still verbatim without normalize.
const Out10e = await Tool.execute(
	{ file_path: "/tmp/normalize-dash-smoke-gov-false.txt", content: All6, govern: false },
	Exec(),
);
Check(
	Run8.Writes.length === Writes10 + 5 && Out10e.after === All6,
	"govern: false — no governance chain, verbatim write",
);
Check(
	Run8.Observations.at(-1).actor.govern === false,
	"govern: false — the marker maps to false (still present: the event path stays skipped)",
);

// ---------- Run 10 addendum: the Govern call's ACTOR ----------
// The direct steps must receive the WRAPPED actor (the marker rides along),
// not the plain exec — that is what makes every Refresh re-emit inside the
// chain passes carry the `govern` marker, so the event-path listeners skip
// them (no cross-module re-processing, no Follow, no update dispatch, no
// second pinner pass). Registered on the previously-empty registry (Run 10's
// checks above are untouched; the probe basename matches nothing else here).
const ProbeRuns = [];
Furnace.RegisterGovern("normalize-dash-smoke-gov-actor.txt", "pin", (Target, Actor, Version) => {
	ProbeRuns.push({ target: Target, actor: Actor, version: Version });
});
const Out10f = await Tool.execute(
	{ file_path: "/tmp/normalize-dash-smoke-gov-actor.txt", content: All6, govern: ["pin"] },
	Exec(),
);
Check(
	Run8.Writes.length === Writes10 + 6 && Out10f.after === All6,
	"govern actor probe: the write completes with a registered step in the chain",
);
Check(
	ProbeRuns.length === 1 && ProbeRuns[0].version === Run8.Observations.at(-1).observation.version,
	"govern actor probe: the direct step runs once with the written outcome's fresh version (the fs/observed emit's token)",
);
Check(
	ProbeRuns[0].actor &&
		"govern" in ProbeRuns[0].actor &&
		JSON.stringify(ProbeRuns[0].actor.govern) === JSON.stringify(["pin"]),
	"govern actor probe: the direct step receives the WRAPPED actor — the govern marker present with the mapped selection (NOT the plain exec)",
);
Check(
	ProbeRuns[0].actor.callId === "call_smoke" && "signal" in ProbeRuns[0].actor,
	"govern actor probe: the spread preserves the exec fields (callId, signal ride along)",
);
// govern: false omits the Govern call entirely — the registered probe never runs.
const ProbeRunsBefore = ProbeRuns.length;
await Tool.execute(
	{ file_path: "/tmp/normalize-dash-smoke-gov-actor-false.txt", content: All6, govern: false },
	Exec(),
);
Check(
	ProbeRuns.length === ProbeRunsBefore,
	"govern: false — the Govern call is omitted entirely (the registered probe step never runs)",
);

// The SEQUENTIAL FOLD (factory v0.2.1): the exec AWAITS the Govern call, so
// an async step's promise is fulfilled before the tool result returns (each
// step's chain completes before the next step reads the file).
const SlowRuns = [];
Furnace.RegisterGovern(
	"normalize-dash-smoke-gov-async.txt",
	"slow",
	async (Target, Actor, Version) => {
		await new Promise((r) => setTimeout(r, 10));
		SlowRuns.push({ target: Target, actor: Actor, version: Version });
	},
);
const OutSlow = await Tool.execute(
	{ file_path: "/tmp/normalize-dash-smoke-gov-async.txt", content: All6, govern: true },
	Exec(),
);
Check(
	Run8.Writes.length === Writes10 + 8 && OutSlow.after === All6,
	"govern sequential fold: the write completes with an async registered step in the chain",
);
Check(
	SlowRuns.length === 1 && SlowRuns[0].version === Run8.Observations.at(-1).observation.version,
	"govern sequential fold: the async step ran ONCE and completed BEFORE the tool result returned (the exec awaits the fold)",
);
Check(
	SlowRuns[0].actor && JSON.stringify(SlowRuns[0].actor.govern) === "true",
	"govern sequential fold: the async step receives the wrapped actor like the sync steps",
);

rm();
console.log(`\n${Pass} PASS, ${Fail} FAIL`);
process.exit(Fail === 0 ? 0 : 1);

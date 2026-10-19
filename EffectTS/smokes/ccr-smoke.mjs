// EffectTS/smokes/ccr-smoke.mjs - the family smoke pattern: a fake ctx (on capture,
// get returning the REAL @playform/ets-plugin-dsh-factory instance from its built
// Target, logger capture) + the REAL ccr apply (from the built Target) →
// assert the full tools/post-execute + ccr_retrieve contract (plan §6).
//
// TRACING-HYGIENE MODE (the family's additive EffectTS coverage; the ONLY
// genuinely applicable one for ccr's plain waterfall - no Stream, no typed
// envelope, no parallel marker, so a Stream/envelope section would be
// vacuously green): the suite's core assertions run a second time with
// `FACTORY_SMOKE_TRACING=1` (the OPT-IN tracing knob - the optional
// @effect/opentelemetry bundle is loaded dynamically by `Runtime.enableTracing`
// BEFORE the shells are constructed, mirroring factory-smoke.mjs; the Runtime
// lives in @playform/ets-base-dsh, the base's Service/Runtime.js) and the
// rerun's stdout + the durable ledger log must be BYTE-IDENTICAL with the
// default run (the spans never alter the ledger strings/ordering - the
// hygiene rule). The comparison is silent (`node:assert`, no Check) so the
// printed PASS stream stays identical in both modes, exactly like
// factory-smoke's traced tail.
import assert from "node:assert/strict";
import { appendFileSync, rmSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import * as Http from "node:http";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { ThresholdBytes, Eligible, Decide } from "../packages/ets-hook-dsh-ccr/Target/Function/Engine.js";

// ── TRACING MODE setup (the OPT-IN knob, before ANY shell is built) ──────
// The runtime is materialized synchronously in the factory constructor, so
// the knob must be set and the optional bundle loaded before the first
// `new FactoryClass` - hence the bundle imports below are dynamic.
const TRACING = process.env.FACTORY_SMOKE_TRACING === "1";
let tracingHits = 0;
let tracingServer = null;
if (TRACING) {
	// Fast batch flush so the tail assertion is deterministic (mirrors
	// factory-smoke.mjs; exports never run on the caller's critical path).
	process.env.OTEL_BSP_SCHEDULE_DELAY = "200";
	process.env.OTEL_BSP_EXPORT_TIMEOUT = "2000";
	// The local OTel collector: accepts any OTLP/HTTP POST and counts exports.
	tracingServer = Http.createServer((Req, Res) => {
		Req.resume();
		Req.on("end", () => {
			tracingHits++;
			Res.writeHead(200, { "content-type": "application/x-protobuf" });
			Res.end(Buffer.alloc(0));
		});
	});
	tracingServer.unref();
	await new Promise((Resolve) => tracingServer.listen(0, "127.0.0.1", Resolve));
	const Runtime = await import("../packages/ets-base-dsh/Target/Service/Runtime.js");
	const Enabled = await Runtime.enableTracing({
		endpoint: `http://127.0.0.1:${tracingServer.address().port}`,
		serviceName: "ccr-smoke",
	});
	assert.equal(Enabled, true, "tracing mode: the optional OTel bundle loaded (dynamic import)");
}

const Ccr = (await import("../packages/ets-hook-dsh-ccr/Target/Library.js")).default;
const FactoryClass = (await import("../packages/ets-plugin-dsh-factory/Target/Library.js")).default;

const Ledger = "/tmp/ccr-smoke-ledger.log";
const Journal = "/tmp/ccr-smoke-journal.jsonl";
let Pass = 0,
	Fail = 0;
const Check = (Condition, Message) => {
	if (Condition) {
		Pass += 1;
		console.log(`PASS - ${Message}`);
	} else {
		Fail += 1;
		console.log(`FAIL - ${Message}`);
	}
};
const rm = () => {
	try {
		rmSync(Ledger);
	} catch {}
	try {
		rmSync(Journal);
	} catch {}
};

// The stdout capture for the tracing-hygiene comparison: every line this
// suite prints is recorded (while still going to stdout) so the traced rerun
// can be compared byte-for-byte with the default run.
const Output = [];
const OriginalLog = console.log;
console.log = (Message) => {
	const Line = typeof Message === "string" ? Message : String(Message);
	Output.push(Line);
	OriginalLog(Line);
};

// The REAL factory instance, constructed exactly the way the factory's own
// smoke does (the Service base constructor registers through
// ctx.reflect.provide; the stub context is used once and discarded).
const Furnace = new FactoryClass({ reflect: { provide: () => undefined } });

// The fake ctx: on() captures listeners (+ their options - the posture check),
// get() serves the REAL factory for "pluginFactory" and throws for anything
// else (the factory's probe-once Seam catches the throw); logger captures
// info + warn lines; the tool seam captures the ccr_retrieve registration.
const Make = (Raw) => {
	const Listeners = {},
		ListenerOptions = {},
		Lines = [],
		Warns = [];
	const Registered = [];
	const Context = {
		// The service accessor (typed via Interface/Factory's augmentation): the
		// REAL factory instance, guaranteed present by `inject: ["pluginFactory", "tools"]`.
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
				default:
					throw new Error(`unknown service: ${Name}`);
			}
		},
		logger: {
			info: (M) => {
				Lines.push(M);
			},
			warn: (M) => {
				Warns.push(M);
			},
		},
		// The tool registry seam: records every registered definition.
		tools: {
			register: (Definition) => {
				Registered.push(Definition);
				return () => true;
			},
		},
		// The ROOT seam: cordis plugin contexts inherit `root`.
		get root() {
			return Context;
		},
	};
	Ccr.apply(Context, Raw); // the loader contract: apply(ctx, config)
	return {
		Context,
		Listeners,
		ListenerOptions,
		Lines,
		Warns,
		Registered,
		State: Context.__ccrState,
	};
};

const { apply: ApplyUnused, Config: Schema } = Ccr;
void ApplyUnused;
const Validate = (Raw) => Schema({ ...Raw });

// The expected hash of a content array - the same sha256-24 of the serialized
// bytes the bundle's Function/Hash computes (node:crypto, first 24 hex).
const HashOf = (Content) =>
	createHash("sha256").update(JSON.stringify(Content)).digest("hex").slice(0, 24);
const SizeOf = (Content) => Buffer.byteLength(JSON.stringify(Content), "utf8");
const TextBlock = (Text) => [{ type: "text", text: Text }];
const Exec = (Name) => ({
	callId: "call_smoke",
	name: Name,
	arguments: {},
	signal: new AbortController().signal,
});
// The waterfall's downstream decision (the registry default: an accept with
// no content and no value).
const NextAccept = async () => ({ kind: "accept" });

// A terminal-shaped text: the harness's `exit code: 0` echo + filler rows.
const TerminalText = (Fill, Rows) => {
	const Body = [];
	for (let I = 0; I < Rows; I += 1) Body.push(`row ${I} ${Fill}`);
	return `make: starting\nexit code: 0\n${Body.join("\n")}`;
};
// A ~N byte single-line text (the fill length scales the total).
const PlainText = (Bytes) => "x".repeat(Math.max(0, Bytes - 2));

// ---------- Run 1: defaults + activation ----------
rm();
const Raw1 = Validate({ logFile: Ledger });
Check(typeof Raw1.log.get === "function", "volatile cell: log arrives as { get }");
Check(typeof Raw1.logFile.get === "function", "volatile cell: logFile arrives as { get }");
Check(
	typeof Raw1.thresholdBytes.get === "function",
	"volatile cell: thresholdBytes arrives as { get }",
);
Check(
	typeof Raw1.previewMaxChars.get === "function",
	"volatile cell: previewMaxChars arrives as { get }",
);
Check(typeof Raw1.multipliers.get === "function", "volatile cell: multipliers arrives as { get }");
Check(Raw1.thresholdBytes.get() === 2048, "config default thresholdBytes=2048");
Check(Raw1.inlineThresholdBytes === 1024, "config default inlineThresholdBytes=1024");
Check(Raw1.autoExpand === true, "config default autoExpand=true");
Check(Raw1.autoExpandLimitBytes === 102400, "config default autoExpandLimitBytes=102400");
Check(Raw1.compressFailures === false, "config default compressFailures=false");
Check(Raw1.previewMaxChars.get() === 240, "config default previewMaxChars=240");
Check(Raw1.ttlSeconds === 3600, "config default ttlSeconds=3600");
Check(Raw1.storeBudgetBytes === 268435456, "config default storeBudgetBytes=268435456");
Check(Raw1.journalPath === "", "config default journalPath='' (memory-only)");
Check(Raw1.contextEngine === false, "config default contextEngine=false (phase 4, inert)");
Check(Raw1.contextEngineThresholdPct === 30, "config default contextEngineThresholdPct=30");
Check(Raw1.protectFirstTurns === 2, "config default protectFirstTurns=2");
Check(Raw1.protectLastTurns === 4, "config default protectLastTurns=4");
Check(
	JSON.stringify(Raw1.multipliers.get()) ===
		JSON.stringify({
			terminal: 1,
			error: 8,
			grep: 2,
			paths: 2,
			file: 1,
			json: 1,
			web: 2,
			default: 1,
		}),
	"config default multipliers: error ×8, grep/paths/web ×2, the rest ×1",
);
Check(
	JSON.stringify(Raw1.targets) ===
		JSON.stringify([
			"bash",
			"glob",
			"grep",
			"read",
			"web_fetch",
			"web_search",
			"list",
			"search",
		]),
	"config default targets: the 8-tool terminal/search/fetch family",
);
Check(
	JSON.stringify(Raw1.exempt) ===
		JSON.stringify([
			"write",
			"edit",
			"raw-write",
			"subagent",
			"ask_user_question",
			"ccr_retrieve",
		]),
	"config default exempt: mutators, the plugin's own tool, agents' briefs, user gates",
);
const Run1 = Make(Raw1);
Check(
	typeof Run1.Listeners["tools/post-execute"] === "function",
	"the tools/post-execute listener is registered",
);
Check(Object.keys(Run1.Listeners).length === 1, "only tools/post-execute registered");
Check(
	Run1.ListenerOptions["tools/post-execute"] !== undefined &&
		Run1.ListenerOptions["tools/post-execute"].prepend === true,
	"the listener PREPENDS (the gate runs before the other post-execute listeners)",
);
Check(Run1.Registered.length === 1, "exactly one tool registered");
Check(
	Run1.Registered[0] && Run1.Registered[0].name === "ccr_retrieve",
	"the tool registration is captured: the tool is named ccr_retrieve",
);
Check(Run1.State && Run1.State.Factory === Furnace, "state carries the REAL factory instance");
Check(
	Run1.State.Ledger === "/tmp/ccr-smoke-ledger.log",
	"volatile unwrap: logFile cell unwrapped to State.Ledger",
);
Check(Run1.State.Enabled === true, "volatile unwrap: log cell unwrapped to State.Enabled=true");
Check(Run1.State.Threshold === 2048, "volatile unwrap: thresholdBytes cell → State.Threshold=2048");
Check(Run1.State.PreviewMax === 240, "volatile unwrap: previewMaxChars cell → State.PreviewMax=240");
Check(
	Run1.State.Multipliers && Run1.State.Multipliers.error === 8,
	"volatile unwrap: multipliers cell → State.Multipliers (error ×8)",
);
Check(Run1.State.Module === "ccr", "state module = ccr (the ledger prefix)");
Check(Run1.State.Store && Run1.State.Store.Path === "", "the store is memory-only by default");
Check(Run1.State.Targets.length === 8, "state targets copied from config");
const Activation = `[${Run1.Lines.find((L) => L.startsWith("ccr: activated")) ?? ""}]`;
// The bundle version is the tree convention (0.0.1) - the ONLY identity-driven
// assertion delta from the Boilerplate reference (which says `bundle 0.1.0`).
Check(
	Run1.Lines.includes("ccr: activated (bundle 0.0.1, targets 8, budget 268435456)"),
	"activation ledger line byte-exact: 'ccr: activated (bundle 0.0.1, targets 8, budget 268435456)'",
);
Check(
	Furnace.PendingJournal.some(
		(R) => R.event === "activated" && R.detail === "activated (bundle 0.0.1, targets 8, budget 268435456)",
	),
	"the activation record journals to the shared storage domain with the identical detail",
);

// ---------- The post-execute listener, exercised ----------
const Listener = Run1.Listeners["tools/post-execute"];
const Retrieve = Run1.Registered[0];

// ---------- Run 1a: under-threshold pass-through (byte-identical) ----------
{
	const Content = TextBlock("short bash output");
	const Result = { isError: false, value: { out: "short bash output" }, content: Content };
	const Decision = { kind: "accept" };
	const Out = await Listener(Exec("bash"), Result, async () => Decision);
	Check(Out === Decision, "under-threshold bash result: the downstream decision passes through unchanged");
	Check(
		!Run1.Lines.some((L) => L.includes("compressed") || L.includes("stored")),
		"under-threshold result writes NO ledger line (no compress, no store)",
	);
}

// ---------- Run 1b: the vacuously-green companion - a compressed case ----------
// autoExpand OFF so the marker path is exercised at a small size.
rm();
const Run1b = Make(Validate({ autoExpand: false, logFile: Ledger }));
const Listener1b = Run1b.Listeners["tools/post-execute"];
{
	const Text = TerminalText("y".repeat(96), 26); // well over 2048 serialized bytes
	const Content = TextBlock(Text);
	const Result = { isError: false, value: {}, content: Content };
	const Decision = { kind: "accept" };
	const Out = await Listener1b(Exec("bash"), Result, async () => Decision);
	const Hash = HashOf(Content);
	const Size = SizeOf(Content);
	Check(Out !== Decision && Out && Out.kind === "accept", "oversized bash result is replaced (not passed through)");
	Check(
		JSON.stringify(Out.content) ===
			JSON.stringify([
				{
					type: "text",
					text: `[terminal:exit 0 | ${Text.split("\n").length} lines | make: starting]\n<<<CCR:${Hash}|terminal|${Size}>>>`,
				},
			]),
		"replacement content is exactly [terminal:preview] + newline + the exact marker bytes",
	);
	const Retrieved = await Run1b.Registered[0].execute({ hash: Hash }, Exec("ccr_retrieve"));
	Check(
		Retrieved.text === Text,
		"round-trip: ccr_retrieve restores the ORIGINAL bytes for the marker's hash",
	);
	Check(
		Retrieved.hash === Hash && Retrieved.type === "terminal" && Retrieved.size === Size,
		"retrieval echoes hash/type/size from the stored entry",
	);
	Check(
		Run1b.Lines.includes(`ccr: compressed bash terminal ${Size} -> ${Hash}`),
		"compressed ledger line byte-exact: 'ccr: compressed bash terminal <bytes> -> <hash>'",
	);
	Check(
		Run1b.Lines.includes(`ccr: retrieved ${Hash}`),
		"retrieval ledger line: 'ccr: retrieved <hash>'",
	);
	Check(
		!Run1b.Lines.some((L) => L.includes("-> ") && L.includes("stored ")),
		"the compressed case writes NO stored line (compressed ≠ auto-expand store)",
	);
	// Unknown hash → the self-describing error.
	let UnknownError = null;
	try {
		await Run1b.Registered[0].execute({ hash: "f".repeat(24) }, Exec("ccr_retrieve"));
	} catch (E) {
		UnknownError = E;
	}
	Check(
		UnknownError !== null &&
			/not in the store/.test(UnknownError.message) &&
			/Re-run the original tool/.test(UnknownError.message),
		"unknown hash → the self-describing error (re-run the original tool; no fuzzy matching)",
	);
	Check(
		Run1b.Lines.includes(`ccr: retrieval miss ${"f".repeat(24)} (unknown)`),
		"unknown-hash ledger line: 'ccr: retrieval miss <hash> (unknown)'",
	);
	// No prefix matching: a hash prefix must NOT retrieve.
	let PrefixError = null;
	try {
		await Run1b.Registered[0].execute({ hash: Hash.slice(0, 12) }, Exec("ccr_retrieve"));
	} catch (E) {
		PrefixError = E;
	}
	Check(
		PrefixError !== null,
		"a 12-char hash PREFIX does not retrieve (no prefix or fuzzy matching)",
	);
}

// ---------- Run 2: the marker contract details on a read result ----------
rm();
const Run2 = Make(Validate({ autoExpand: false, logFile: Ledger }));
{
	const Text = `${PlainText(2400)}\n${PlainText(300)}`; // > 2048 bytes, file type
	const Content = TextBlock(Text);
	const Result = { isError: false, value: {}, content: Content };
	const Out = await Run2.Listeners["tools/post-execute"](Exec("read"), Result, NextAccept);
	const Hash = HashOf(Content);
	const Size = SizeOf(Content);
	const Marker = /^<<<CCR:([0-9a-f]{24})\|([a-z]+)\|(\d+)>>>$/.exec(
		Out.content[0].text.split("\n")[1] ?? "",
	);
	Check(Marker !== null, "the marker parses strictly (24-hex hash, type, size)");
	Check(
		Marker !== null && Marker[1] === Hash && Marker[2] === "file" && Number(Marker[3]) === Size,
		"read result marker: the full-content hash, type 'file', the exact serialized size",
	);
	Check(
		Out.content[0].text.startsWith("[file:"),
		"the preview line is the [file:...] type-tagged one-liner",
	);
	// Granular range retrieval over the stored full content.
	const Ranged = await Run2.Registered[0].execute(
		{ hash: Hash, range: { start: 1, count: 1 } },
		Exec("ccr_retrieve"),
	);
	Check(
		Ranged.text === PlainText(300),
		"range {start:1,count:1} returns only the second line (granular retrieval)",
	);
	const Tail = await Run2.Registered[0].execute(
		{ hash: Hash, range: { start: 99, count: 5 } },
		Exec("ccr_retrieve"),
	);
	Check(Tail.text === "", "an out-of-range start clamps to an empty slice (never an error)");
}

// ---------- Run 3: auto-expand (default on) - stored, FULL content, no marker ----------
rm();
const Run3 = Make(Validate({ logFile: Ledger }));
{
	const Text = TerminalText("z".repeat(80), 40); // > 2048, < 102400
	const Content = TextBlock(Text);
	const Result = { isError: false, value: {}, content: Content };
	const Decision = { kind: "accept" };
	const Out = await Run3.Listeners["tools/post-execute"](Exec("bash"), Result, async () => Decision);
	const Hash = HashOf(Content);
	Check(Out === Decision, "auto-expand: the downstream decision passes through (FULL content, no marker)");
	Check(
		!(Out.content ?? []).some?.((B) => (B.text ?? "").includes("<<<CCR:")) ?? true,
		"auto-expand: NO marker reaches the model",
	);
	const Retrieved = await Run3.Registered[0].execute({ hash: Hash }, Exec("ccr_retrieve"));
	Check(Retrieved.text === Text, "auto-expand: the entry is STILL retrievable by hash");
	Check(
		Run3.Lines.includes(`ccr: stored bash terminal ${SizeOf(Content)} -> ${Hash}`),
		"auto-expand ledger line: 'ccr: stored bash terminal <bytes> -> <hash>'",
	);
	Check(
		!Run3.Lines.some((L) => L.includes("compressed ")),
		"auto-expand writes NO compressed line (nothing was replaced)",
	);
	// Above the auto-expand limit the marker kicks in again.
	const Big = PlainText(102500);
	const BigContent = TextBlock(Big);
	const BigOut = await Run3.Listeners["tools/post-execute"](
		Exec("bash"),
		{ isError: false, value: {}, content: BigContent },
		NextAccept,
	);
	Check(
		BigOut !== undefined &&
			BigOut.kind === "accept" &&
			JSON.stringify(BigOut.content) ===
				JSON.stringify([
					{
						// The preview is hard-cut to exactly 240 chars: the 19-char
						// `exit ? | 1 lines | ` prefix + 221 fill chars.
						type: "text",
						text: `[terminal:${`exit ? | 1 lines | ${"x".repeat(221)}`}]\n<<<CCR:${HashOf(BigContent)}|terminal|${SizeOf(BigContent)}>>>`,
					},
				]),
		"above autoExpandLimitBytes the preview + marker replacement returns (preview hard-cut at 240 chars)",
	);
}

// ---------- Run 4: exempt tools pass through byte-identical ----------
rm();
const Run4 = Make(Validate({ autoExpand: false, logFile: Ledger }));
for (const Name of ["write", "edit", "raw-write", "subagent", "ask_user_question", "ccr_retrieve"]) {
	const Content = TextBlock(PlainText(5000));
	const Result = { isError: false, value: {}, content: Content };
	const Decision = { kind: "accept" };
	const Out = await Run4.Listeners["tools/post-execute"](Exec(Name), Result, async () => Decision);
	Check(Out === Decision, `exempt tool '${Name}' passes through byte-identical (no marker, no store)`);
}
Check(
	!Run4.Lines.some((L) => L.includes("compressed") || L.includes("stored")),
	"exempt tools write NO ledger lines",
);

// ---------- Run 5: TTL expiry and LRU budget eviction ----------
rm();
const Run5 = Make(Validate({ logFile: Ledger, ttlSeconds: 0 }));
{
	const Content = TextBlock(TerminalText("t".repeat(80), 40));
	const Result = { isError: false, value: {}, content: Content };
	await Run5.Listeners["tools/post-execute"](Exec("bash"), Result, NextAccept);
	const Hash = HashOf(Content);
	let ExpiredError = null;
	try {
		await Run5.Registered[0].execute({ hash: Hash }, Exec("ccr_retrieve"));
	} catch (E) {
		ExpiredError = E;
	}
	Check(
		ExpiredError !== null && /expired/.test(ExpiredError.message),
		"TTL expiry (ttlSeconds: 0): retrieval reports the entry expired",
	);
	Check(
		Run5.Lines.includes(`ccr: retrieval miss ${Hash} (expired)`),
		"expired ledger line: 'ccr: retrieval miss <hash> (expired)'",
	);
}
rm();
const Run5b = Make(Validate({ logFile: Ledger, storeBudgetBytes: 5000 }));
{
	const A = TextBlock(TerminalText("a".repeat(80), 40)); // ~3.5KB serialized
	const B = TextBlock(TerminalText("b".repeat(80), 40));
	const ExecBash = Exec("bash");
	await Run5b.Listeners["tools/post-execute"](ExecBash, { isError: false, value: {}, content: A }, NextAccept);
	await Run5b.Listeners["tools/post-execute"](ExecBash, { isError: false, value: {}, content: B }, NextAccept);
	const HashA = HashOf(A);
	const HashB = HashOf(B);
	Check(
		Run5b.Lines.includes(`ccr: evicted ${HashA} (budget)`),
		"LRU eviction at budget: 'ccr: evicted <hash> (budget)' for the least-recently-used entry",
	);
	let GoneError = null;
	try {
		await Run5b.Registered[0].execute({ hash: HashA }, Exec("ccr_retrieve"));
	} catch (E) {
		GoneError = E;
	}
	Check(GoneError !== null && /not in the store/.test(GoneError.message), "the evicted entry is gone (unknown hash)");
	const Kept = await Run5b.Registered[0].execute({ hash: HashB }, Exec("ccr_retrieve"));
	Check(
		Kept.text === `${"make: starting\nexit code: 0\n"}${Array.from({ length: 40 }, (_, I) => `row ${I} ${"b".repeat(80)}`).join("\n")}`,
		"the surviving entry is still retrievable with the ORIGINAL bytes",
	);
}

// ---------- Run 6: failures pass through unless compressFailures ----------
rm();
const Run6 = Make(Validate({ autoExpand: false, logFile: Ledger }));
{
	const Content = TextBlock(PlainText(5000));
	const Failure = { isError: true, error: { message: "boom" }, content: Content };
	const Decision = { kind: "accept" };
	const Out = await Run6.Listeners["tools/post-execute"](Exec("bash"), Failure, async () => Decision);
	Check(Out === Decision, "a failing result passes through byte-identical with compressFailures=false");
	// A value-carrying decision is canonical - never replaced.
	const ValueDecision = { kind: "accept", value: { ok: true } };
	const Out2 = await Run6.Listeners["tools/post-execute"](
		Exec("bash"),
		{ isError: false, value: { ok: true }, content: TextBlock(PlainText(5000)) },
		async () => ValueDecision,
	);
	Check(Out2 === ValueDecision, "a value-carrying accepted decision passes through (content is never replaced)");
	// A block decision passes through untouched.
	const BlockDecision = { kind: "block", feedback: [{ type: "text", text: "no" }] };
	const Out3 = await Run6.Listeners["tools/post-execute"](
		Exec("bash"),
		{ isError: false, value: {}, content: TextBlock(PlainText(5000)) },
		async () => BlockDecision,
	);
	Check(Out3 === BlockDecision, "a block decision passes through (feedback is never compressed)");
}
rm();
const Run6b = Make(Validate({ autoExpand: false, logFile: Ledger, compressFailures: true }));
{
	const Content = TextBlock(PlainText(17000)); // > 2048 × 8 (the error tier)
	const Failure = { isError: true, error: { message: "boom" }, content: Content };
	const Out = await Run6b.Listeners["tools/post-execute"](Exec("bash"), Failure, NextAccept);
	const Hash = HashOf(Content);
	Check(
		Out.kind === "accept" &&
			Out.content[0].text ===
				`[error:${"x".repeat(240)}]\n<<<CCR:${Hash}|error|${SizeOf(Content)}>>>`,
		"compressFailures=true: an oversized failure compresses with the error preview (first content line, hard-cut) and the |error| marker",
	);
	const Retrieved = await Run6b.Registered[0].execute({ hash: Hash }, Exec("ccr_retrieve"));
	Check(Retrieved.text === PlainText(17000), "the failure's original content is retrievable");
}

// ---------- Run 7: all 7 classifier types hit their multiplier gates ----------
rm();
const Run7 = Make(
	Validate({ autoExpand: false, logFile: Ledger, targets: [...Raw1.targets, "probe"] }),
);
{
	// 3000 bytes: over the ×1 gate (2048), under the ×2 gate (4096) — only
	// the ×1 types compress at this size.
	const Text3000 = PlainText(3000);
	const ExecTable = [
		["bash", "terminal"],
		["read", "file"],
	];
	for (const [Name, Type] of ExecTable) {
		const Content = TextBlock(Text3000);
		const Out = await Run7.Listeners["tools/post-execute"](
			Exec(Name),
			{ isError: false, value: {}, content: Content },
			NextAccept,
		);
		Check(
			Out.kind === "accept" && Out.content[0].text.endsWith(`|${Type}|${SizeOf(Content)}>>>`),
			`'${Name}' → type '${Type}' marker (×1 gate: 3000 bytes compresses)`,
		);
	}
	// 5000 bytes: over the ×2 gate (4096) — the ×2 types compress here, with
	// their exact type in the marker.
	const Text5000 = PlainText(5000);
	const ExecTable2 = [
		["grep", "grep"],
		["glob", "paths"],
		["web_fetch", "web"],
		["web_search", "web"],
		["list", "paths"],
		["search", "grep"],
	];
	for (const [Name, Type] of ExecTable2) {
		const Content = TextBlock(Text5000);
		const Out = await Run7.Listeners["tools/post-execute"](
			Exec(Name),
			{ isError: false, value: {}, content: Content },
			NextAccept,
		);
		Check(
			Out.kind === "accept" && Out.content[0].text.endsWith(`|${Type}|${SizeOf(Content)}>>>`),
			`'${Name}' → type '${Type}' marker (×2 gate: 5000 bytes compresses)`,
		);
	}
	// The ×2 boundary: grep/glob/web_fetch at 3000 bytes PASS THROUGH (gate 4096).
	for (const Name of ["grep", "glob", "web_fetch"]) {
		const Content = TextBlock(Text3000);
		const Decision = { kind: "accept" };
		const Out = await Run7.Listeners["tools/post-execute"](
			Exec(Name),
			{ isError: false, value: {}, content: Content },
			async () => Decision,
		);
		Check(Out === Decision, `'${Name}' at 3000 bytes stays UNDER its ×2 gate (4096) - multiplier respected`);
	}
	// The shape fallback for a non-table target name: JSON → 'json', text → 'default'.
	const JsonText = JSON.stringify({ key: "v".repeat(2900) });
	const JsonContent = TextBlock(JsonText);
	const JsonOut = await Run7.Listeners["tools/post-execute"](
		Exec("probe"),
		{ isError: false, value: {}, content: JsonContent },
		NextAccept,
	);
	Check(
		JsonOut.kind === "accept" && JsonOut.content[0].text.includes("|json|"),
		"a non-table target with JSON content classifies as 'json' (shape fallback) and compresses at ×1",
	);
	const PlainContent = TextBlock(PlainText(3000));
	const PlainOut = await Run7.Listeners["tools/post-execute"](
		Exec("probe"),
		{ isError: false, value: {}, content: PlainContent },
		NextAccept,
	);
	Check(
		PlainOut.kind === "accept" && PlainOut.content[0].text.includes("|default|"),
		"a non-table target with plain text classifies as 'default' (shape fallback) and compresses at ×1",
	);
	// A non-target name is never touched even when huge.
	const Decision = { kind: "accept" };
	const AlienOut = await Run7.Listeners["tools/post-execute"](
		Exec("alien_tool"),
		{ isError: false, value: {}, content: TextBlock(PlainText(20000)) },
		async () => Decision,
	);
	Check(AlienOut === Decision, "a tool outside targets is never compressed (the allow-list)");
	// The ×8 boundary: a size that compresses for ×1 (3000) does NOT compress for error ×8.
	const Run7b = Make(
		Validate({
			autoExpand: false,
			logFile: Ledger,
			compressFailures: true,
			targets: [...Raw1.targets, "probe"],
		}),
	);
	const FailContent = TextBlock(PlainText(5000));
	const Failure = { isError: true, error: { message: "x".repeat(4900) }, content: FailContent };
	const FailDecision = { kind: "accept" };
	const FailOut = await Run7b.Listeners["tools/post-execute"](
		Exec("bash"),
		Failure,
		async () => FailDecision,
	);
	Check(
		FailOut === FailDecision,
		"the error ×8 gate: 5000 bytes compresses for terminal ×1 but NOT for error ×8 (gate 16384)",
	);
	const BigFailContent = TextBlock(PlainText(17000));
	const BigFailOut = await Run7b.Listeners["tools/post-execute"](
		Exec("bash"),
		{ isError: true, error: { message: "y".repeat(16900) }, content: BigFailContent },
		NextAccept,
	);
	Check(
		BigFailOut.kind === "accept" && BigFailOut.content[0].text.includes("|error|"),
		"a failure over the ×8 gate (17000 > 16384) compresses with the |error| marker",
	);
}

// ---------- Run 8: the ledger file carries the [ISO] message forms ----------
// A fresh default-config run (targets 8) so both durable lines exist verbatim.
rm();
const Run8 = Make(Validate({ autoExpand: false, logFile: Ledger }));
{
	const Content = TextBlock(TerminalText("l".repeat(96), 26));
	await Run8.Listeners["tools/post-execute"](
		Exec("bash"),
		{ isError: false, value: {}, content: Content },
		NextAccept,
	);
}
await new Promise((R) => setTimeout(R, 10));
const Log1 = existsSync(Ledger) ? readFileSync(Ledger, "utf8") : "";
Check(
	Log1.split("\n").some((L) => /^\[[^\]]+\] activated \(bundle 0\.0\.1, targets 8, budget 268435456\)$/.test(L)),
	"the durable ledger file: '[ISO] activated (bundle 0.0.1, targets 8, budget 268435456)' (the file form has no module prefix)",
);
Check(
	Log1.split("\n").some((L) => /^\[[^\]]+\] compressed bash terminal \d+ -> [0-9a-f]{24}$/.test(L)),
	"the durable ledger file: '[ISO] compressed bash terminal <bytes> -> <hash>'",
);

// ---------- Run 9: the JSONL journal (opt-in) round-trip + boot compaction ----------
rm();
const Run9 = Make(Validate({ logFile: Ledger, journalPath: Journal }));
{
	Check(Run9.State.Store.Path === Journal, "journalPath is wired into the store");
	const Content = TextBlock(TerminalText("j".repeat(80), 40));
	await Run9.Listeners["tools/post-execute"](Exec("bash"), { isError: false, value: {}, content: Content }, NextAccept);
	const Lines = existsSync(Journal) ? readFileSync(Journal, "utf8").trim().split("\n") : [];
	Check(Lines.length === 1, "the journal: exactly one JSONL record after one store");
	const Record = Lines.length > 0 ? JSON.parse(Lines[0]) : undefined;
	Check(
		Record !== undefined &&
			Record.hash === HashOf(Content) &&
			Record.type === "terminal" &&
			Record.size === SizeOf(Content) &&
			typeof Record.ttlAt === "number",
		"the journal record carries {hash, type, size, ttlAt}",
	);
	Check(
		Record !== undefined &&
			Buffer.from(Record.payload, "base64").toString("utf8") === JSON.stringify(Content),
		"the journal payload is the base64 of the content's JSON serialization",
	);
	// Corrupt the journal: one broken line + one expired record.
	appendFileSync(Journal, "\n");
	appendFileSync(
		Journal,
		`${JSON.stringify({
			hash: "e".repeat(24),
			type: "terminal",
			size: 3,
			ttlAt: Date.now() - 1000,
			payload: Buffer.from("[]", "utf8").toString("base64"),
		})}\n`,
	);
	appendFileSync(Journal, "{not json at all\n");
	// The "restart": a fresh apply over the same journal file loads + compacts.
	const Run9b = Make(Validate({ logFile: Ledger, journalPath: Journal }));
	const Surviving = existsSync(Journal) ? readFileSync(Journal, "utf8").trim().split("\n") : [];
	Check(Surviving.length === 1, "boot compaction: the corrupt and expired records are dropped, one survives");
	const Retrieved = await Run9b.Registered[0].execute({ hash: HashOf(Content) }, Exec("ccr_retrieve"));
	Check(Retrieved.text === `${"make: starting\nexit code: 0\n"}${Array.from({ length: 40 }, (_, I) => `row ${I} ${"j".repeat(80)}`).join("\n")}`, "the journal survives the fake restart: the entry is retrievable again");
}

// ---------- Run 9b (additive): the journal's boot-compaction edges ----------
rm();
{
	// Edge 1: an EMPTY journal file - loads to an empty store, no crash.
	writeFileSync(Journal, "", "utf8");
	const Run9c = Make(Validate({ logFile: Ledger, journalPath: Journal }));
	Check(
		Run9c.State.Store.Stats().count === 0 && Run9c.State.Store.Stats().bytes === 0,
		"boot compaction edge: an EMPTY journal file loads to an empty store (no crash)",
	);
	// Edge 2: an ALL-EXPIRED journal - every record past its TTL compacts away.
	writeFileSync(
		Journal,
		`${JSON.stringify({
			hash: "a".repeat(24),
			type: "terminal",
			size: 3,
			ttlAt: Date.now() - 1000,
			payload: Buffer.from("[]", "utf8").toString("base64"),
		})}\n${JSON.stringify({
			hash: "b".repeat(24),
			type: "file",
			size: 3,
			ttlAt: Date.now() - 2000,
			payload: Buffer.from("[]", "utf8").toString("base64"),
		})}\n`,
		"utf8",
	);
	const Run9d = Make(Validate({ logFile: Ledger, journalPath: Journal }));
	Check(
		Run9d.State.Store.Stats().count === 0,
		"boot compaction edge: an ALL-EXPIRED journal compacts to an empty store",
	);
	Check(
		readFileSync(Journal, "utf8").trim() === "",
		"boot compaction edge: the all-expired file is rewritten empty",
	);
	// Edge 3: a MISSING journal file - boot creates nothing, memory-only.
	const Fresh = "/tmp/ccr-smoke-journal-absent.jsonl";
	try {
		rmSync(Fresh);
	} catch {}
	const Run9e = Make(Validate({ logFile: Ledger, journalPath: Fresh }));
	Check(
		Run9e.State.Store.Path === Fresh && !existsSync(Fresh),
		"boot compaction edge: a MISSING journal file is not created on boot (memory-only)",
	);
}

// ---------- Run 10 (additive): the context engine, flag OFF - fully inert ----------
rm();
const Run10 = Make(Validate({ logFile: Ledger }));
{
	Check(
		Run10.State.EngineRuntime === undefined,
		"engine flag OFF (default): no engine runtime is built",
	);
	Check(
		Object.keys(Run10.Listeners).length === 1 && Run10.Listeners["agent/pre-step"] === undefined,
		"engine flag OFF: NO agent/pre-step listener is registered (the engine's no-op posture)",
	);
	// Post-execute traffic leaves no engine traces: no observation, no lines.
	await Run10.Listeners["tools/post-execute"](
		Exec("bash"),
		{ isError: false, value: {}, content: TextBlock(PlainText(5000)) },
		NextAccept,
	);
	Check(
		Run10.State.EngineRuntime === undefined,
		"engine flag OFF: post-execute results are not observed",
	);
	Check(
		!Run10.Lines.some((Line) => Line.startsWith("ccr: engine ")),
		"engine flag OFF: no engine ledger lines",
	);
}

// ---------- Run 11 (additive): the engine's pure decision math ----------
rm();
{
	Check(
		ThresholdBytes(268435456, 30) === 80530636,
		"ThresholdBytes: 30% of the 256 MiB store budget (the nominal reference) = 80530636 bytes",
	);
	Check(ThresholdBytes(10000, 30) === 3000, "ThresholdBytes: 30% of 10000 = 3000");
	Check(
		ThresholdBytes(10000, 0) === 0 && Decide([{ turn: 1, name: "bash", isError: false, size: 5 }], 9, 10000, 0, 2, 4) === undefined,
		"ThresholdBytes: 0% yields a zero limit and Decide never crosses it",
	);
	// The protect windows: first-2 head, last-4 tail relative to CurrentTurn.
	const Turn1 = { turn: 1, name: "bash", isError: false, size: 100, content: TextBlock("1") };
	const Turn3 = { turn: 3, name: "bash", isError: false, size: 1500, content: TextBlock("3") };
	const Turn4 = { turn: 4, name: "bash", isError: false, size: 1500, content: TextBlock("4") };
	const Turn9 = { turn: 9, name: "bash", isError: false, size: 1500, content: TextBlock("9") };
	Check(
		JSON.stringify(Eligible([Turn1, Turn3, Turn4, Turn9], 9, 2, 4).map((R) => R.turn)) ===
			JSON.stringify([3, 4]),
		"Eligible: first-2 head and last-4 tail protected - only turns 3,4 are middle at CurrentTurn 9",
	);
	Check(
		JSON.stringify(Eligible([Turn3], 6, 2, 4)) === "[]",
		"Eligible: a record inside the last-4 window (turn 3 at CurrentTurn 6) is protected",
	);
	const Turn4Current = { turn: 4, name: "bash", isError: false, size: 10, content: TextBlock("c") };
	Check(
		JSON.stringify(Eligible([Turn4Current], 4, 2, 4)) === "[]",
		"Eligible: the current turn itself sits inside the last-4 window and is never eligible",
	);
	Check(
		Decide([Turn3], 9, 10000, 30, 2, 4) === undefined,
		"Decide: under the threshold -> no archive (undefined)",
	);
	Check(
		Decide([Turn9], 9, 10000, 30, 2, 4) === undefined,
		"Decide: over the threshold but zero middle records -> no archive",
	);
	const Plan = Decide([Turn3, Turn4, Turn9], 9, 10000, 30, 2, 4);
	Check(
		Plan !== undefined && Plan.archive.length === 2,
		"Decide: the crossing archives the MIDDLE records only (turns 3,4 of 3,4,9)",
	);
	Check(Plan !== undefined && Plan.bytes === 3000, "Decide: the archived bytes are the middle records' sizes");
	Check(
		Plan !== undefined && Plan.archive.every((R) => R.turn !== 9),
		"Decide: the last-4 turn stays protected",
	);
}

// ---------- Run 12 (additive): the context engine flag ON - end to end ----------
rm();
const Run12 = Make(
	Validate({ contextEngine: true, logFile: Ledger, storeBudgetBytes: 10000 }),
);
{
	// Threshold: 30% of 10000 = 3000 bytes; autoExpand stays on (default).
	const Pre = Run12.Listeners["agent/pre-step"];
	const Retrieve12 = Run12.Registered[0];
	const PreCall = (Turn) =>
		Pre(
			{ agent: {}, messages: [], turn: Turn, step: 0, signal: new AbortController().signal },
			async () => ({ kind: "accept" }),
		);
	Check(typeof Pre === "function", "engine flag ON: the agent/pre-step listener is registered");
	Check(
		Object.keys(Run12.Listeners).length === 2 &&
			Run12.Listeners["tools/post-execute"] !== undefined &&
			Run12.Listeners["tools/post-execute"] !== Pre,
		"engine flag ON: exactly two listeners (tools/post-execute + agent/pre-step)",
	);
	Check(
		Run12.State.EngineRuntime !== undefined &&
			Run12.State.EngineRuntime.Turn === 1 &&
			Run12.State.EngineRuntime.Records.length === 0,
		"engine flag ON: the runtime is built (Turn=1, empty log)",
	);
	const EngineLines = () => Run12.Lines.filter((Line) => Line.startsWith("ccr: engine "));
	const ExecBash = Exec("bash");
	// pre-step turn 1: nothing observed yet; the decision passes through.
	const Out1 = await PreCall(1);
	Check(Out1 !== undefined && Out1.kind === "accept", "pre-step: the downstream decision is returned unchanged");
	Check(EngineLines().length === 0, "pre-step turn 1: no archive, no engine line");
	// post-execute at turn 1: a small pass-through (content record).
	const Small = TextBlock(PlainText(1800)); // ~1825 serialized bytes: under the 2048 gate
	const OutSmall = await Run12.Listeners["tools/post-execute"](
		ExecBash,
		{ isError: false, value: {}, content: Small },
		NextAccept,
	);
	Check(
		OutSmall.kind === "accept" && !JSON.stringify(OutSmall).includes("CCR"),
		"engine flag ON: post-execute behavior unchanged - the small result still passes through",
	);
	// pre-step turn 3: the accumulator (one ~1825-byte record) is under 3000; also
	// turn 1 is head-protected anyway.
	await PreCall(3);
	Check(EngineLines().length === 0, "pre-step turn 3: under the threshold -> no archive line");
	// post-execute at turn 3: a big auto-expanded result (hash record) and a
	// mid-size pass-through (content record).
	const Big = TextBlock(TerminalText("b".repeat(80), 40)); // ~3534 bytes: auto-expand store
	await Run12.Listeners["tools/post-execute"](
		ExecBash,
		{ isError: false, value: {}, content: Big },
		NextAccept,
	);
	const Mid = TextBlock(PlainText(1700)); // ~1725 serialized bytes: pass-through
	await Run12.Listeners["tools/post-execute"](
		ExecBash,
		{ isError: false, value: {}, content: Mid },
		NextAccept,
	);
	const Records = Run12.State.EngineRuntime.Records;
	Check(Records.length === 3, "engine flag ON: three observations recorded");
	Check(
		Records[0].turn === 1 && Records[1].turn === 3 && Records[2].turn === 3,
		"observations are tagged with the engine's turn cursor",
	);
	Check(
		Records[0].content !== undefined && Records[0].hash === undefined,
		"the pass-through result is observed with its CONTENT (archivable)",
	);
	Check(
		Records[1].hash !== undefined && Records[1].content === undefined,
		"the stored result is observed with its HASH (already in the store)",
	);
	const Total = Records.reduce((Sum, R) => Sum + R.size, 0);
	Check(Total >= 3000, "the accumulated observed bytes cross the 3000-byte threshold");
	// The pass-through content is NOT in the store yet.
	let BeforeArchive = null;
	try {
		await Retrieve12.execute({ hash: HashOf(Mid) }, Exec("ccr_retrieve"));
	} catch (Error) {
		BeforeArchive = Error;
	}
	Check(
		BeforeArchive !== null && /not in the store/.test(BeforeArchive.message),
		"before the archive, the pass-through content is NOT in the store",
	);
	// pre-step turn 8: CurrentTurn 7 -> eligible = turns >2 and <=3 -> the two
	// turn-3 records archive; the head-protected turn-1 record stays.
	const Out8 = await PreCall(8);
	Check(Out8 !== undefined && Out8.kind === "accept", "pre-step turn 8: the decision still passes through");
	const Lines8 = EngineLines();
	Check(
		Lines8.length === 1 && Lines8[0] === "ccr: engine archived 2 results",
		"engine ledger line byte-exact: 'ccr: engine archived 2 results'",
	);
	Check(
		Run12.State.EngineRuntime.Records.length === 1 &&
			Run12.State.EngineRuntime.Records[0].turn === 1,
		"the head-protected turn-1 record survives the archive (middle-only)",
	);
	Check(
		Run12.State.EngineRuntime.Turn === 8,
		"the engine turn cursor advanced to the pre-step's turn (8)",
	);
	const BackMid = await Retrieve12.execute({ hash: HashOf(Mid) }, Exec("ccr_retrieve"));
	Check(
		BackMid.text === PlainText(1700),
		"the archive pushed the record through the REAL compress path: ccr_retrieve restores the original bytes",
	);
	const BackBig = await Retrieve12.execute({ hash: HashOf(Big) }, Exec("ccr_retrieve"));
	Check(
		BackBig.text === TerminalText("b".repeat(80), 40),
		"the hash-recorded (already-stored) entry stays retrievable untouched",
	);
	// post-execute at turn 8: a tail-window pass-through (content record).
	const Tail = TextBlock(PlainText(1650)); // ~1675 serialized bytes: pass-through
	await Run12.Listeners["tools/post-execute"](
		ExecBash,
		{ isError: false, value: {}, content: Tail },
		NextAccept,
	);
	// pre-step turn 9: CurrentTurn 8 -> the threshold is crossed again
	// (~1825 + ~1675 >= 3000) but eligible = turns >2 and <=4: none (turn 8 is
	// inside the last-4 window) -> a deliberate no-op, no second line.
	await PreCall(9);
	Check(
		EngineLines().length === 1,
		"crossing with an EMPTY middle (turn 8 in the last-4 window): a deliberate no-op, no line",
	);
	Check(
		Run12.State.EngineRuntime.Records.length === 2,
		"the tail-window record survives the no-archive pre-step",
	);
	// pre-step turn 14: CurrentTurn 13 -> eligible = turns >2 and <=9: the turn-8
	// record archives (the head-protected turn-1 record stays forever).
	await PreCall(14);
	const Lines14 = EngineLines();
	Check(
		Lines14.length === 2 && Lines14[1] === "ccr: engine archived 1 results",
		"engine ledger line byte-exact: 'ccr: engine archived 1 results'",
	);
	Check(
		Run12.State.EngineRuntime.Records.length === 1 &&
			Run12.State.EngineRuntime.Records[0].turn === 1,
		"after both archives only the head-protected record remains",
	);
	const BackTail = await Retrieve12.execute({ hash: HashOf(Tail) }, Exec("ccr_retrieve"));
	Check(BackTail.text === PlainText(1650), "the archived tail-window record is retrievable too");
	// With the accumulator emptied below the threshold, pre-step is a clean no-op.
	await PreCall(15);
	Check(
		EngineLines().length === 2,
		"pre-step 15: the accumulator is below the threshold again -> no further archive",
	);
	// The durable ledger file carries the engine line in its [ISO] form.
	const Log12 = existsSync(Ledger) ? readFileSync(Ledger, "utf8") : "";
	Check(
		Log12.split("\n").some((Line) => /^\[[^\]]+\] engine archived 2 results$/.test(Line)),
		"the durable ledger file: '[ISO] engine archived 2 results'",
	);
}

// The pre-cleanup snapshot for the tracing-hygiene comparison: the durable
// ledger log's final content (Run 12's lines) is captured before the rm; the
// traced rerun's copy is compared with the `[ISO]` stamps normalized (the
// timestamps are the one non-deterministic part of the ledger format).
const FinalLedger = existsSync(Ledger) ? readFileSync(Ledger, "utf8") : "";
const StripStamp = (Text) => Text.replace(/^\[[^\]]+\]/gm, "[ISO]");

console.log(`\n${Pass} PASS, ${Fail} FAIL`);

// ── TRACING-HYGIENE MODE (the additive EffectTS coverage) ────────────────
// Silent on purpose (`node:assert`, no Check): the printed PASS stream must
// stay byte-identical in both modes, exactly like factory-smoke's traced
// tail. Default mode: spawn THIS suite with FACTORY_SMOKE_TRACING=1 and
// require (a) exit 0, (b) byte-identical stdout, (c) a byte-identical ledger
// log. Traced mode (the spawned run, or a manual `FACTORY_SMOKE_TRACING=1`
// invocation): wait for the fast BatchSpanProcessor flush and require the
// local collector to have received exports - the traced runtime was LIVE for
// the whole suite, not silently off.
if (!TRACING) {
	const { spawn } = await import("node:child_process");
	const Child = spawn(process.execPath, [fileURLToPath(import.meta.url)], {
		env: { ...process.env, FACTORY_SMOKE_TRACING: "1" },
		stdio: ["ignore", "pipe", "pipe"],
	});
	let ChildOut = "";
	let ChildErr = "";
	Child.stdout.on("data", (Chunk) => {
		ChildOut += Chunk;
	});
	Child.stderr.on("data", (Chunk) => {
		ChildErr += Chunk;
	});
	const Code = await new Promise((Resolve) => Child.on("close", Resolve));
	assert.equal(Code, 0, `tracing rerun exit ${Code}${ChildErr ? `: ${ChildErr}` : ""}`);
	assert.equal(
		ChildOut,
		`${Output.map((Line) => `${Line}\n`).join("")}`,
		"tracing rerun stdout is byte-identical with the default run",
	);
	const ChildLedger = existsSync(Ledger) ? readFileSync(Ledger, "utf8") : "";
	assert.equal(
		StripStamp(ChildLedger),
		StripStamp(FinalLedger),
		"tracing rerun ledger log is byte-identical (the [ISO] stamps normalized)",
	);
	// The cleanup happens only after both comparisons - the traced rerun's
	// final ledger log has to survive until it is read above.
	rm();
} else {
	await new Promise((Resolve) => setTimeout(Resolve, 2000));
	assert.ok(
		tracingHits > 0,
		"tracing mode: the local collector received OTLP span exports (traced runtime live)",
	);
	tracingServer.close();
	// No rm here by design: the traced run (the spawned rerun, or a manual
	// `FACTORY_SMOKE_TRACING=1` invocation) leaves its final ledger log in
	// place so the default run can compare it; the next default run removes it.
}

process.exit(Fail === 0 ? 0 : 1);

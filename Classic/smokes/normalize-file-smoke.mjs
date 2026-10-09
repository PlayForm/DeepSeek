// Classic/smokes/normalize-file-smoke.mjs - the family smoke pattern: a fake ctx
// (on capture, get returning the REAL @playform/plugin-dsh-factory instance from
// its built Target, logger capture) + the REAL normalize-file apply (from the
// built Target) → assert the full tool contract: the read → count → write
// pipeline through Factory.Write (the shared executor), the N=0 no-op no-write
// rule, the error paths (missing file, binary, abort), the count ledger line,
// the P5 journal record, and the listener-less posture (the family's first
// flavor with NO event listener).
import { rmSync, readFileSync, existsSync } from "node:fs";
import NormalizeFile from "../packages/hook-dsh-normalize-file/Target/Library.js";
import FactoryClass from "../packages/plugin-dsh-factory/Target/Library.js";

const Ledger = "/tmp/normalize-file-smoke-ledger.log";
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

// The REAL factory instance, constructed exactly the way the factory's own
// smoke does (the Service base constructor registers through
// ctx.reflect.provide; the stub context is used once and discarded).
const Furnace = new FactoryClass({ reflect: { provide: () => undefined } });

// The fake ctx: on() RECORDS (the plugin must register NO listener - the
// family's first listener-less flavor - and the empty registry is asserted);
// get() serves the REAL factory for "pluginFactory" and throws for anything
// else (the factory's probe-once Seam catches the throw); logger captures
// lines; the tool/fs seams capture the tool's registration and its fs path
// (a BARE backend: sandboxMode undefined, so the standing sandbox-policy path
// is skipped - exactly the no-confinement branch of the built-in write's
// FsSandboxController).
const Make = (Raw) => {
	const Listeners = {},
		Lines = [];
	const Registered = [],
		Resolved = [],
		Reads = [],
		Writes = [],
		Intents = [],
		Observations = [];
	const Files = new Map();
	const Context = {
		// The service accessor (typed via Interface/Factory's augmentation): the
		// REAL factory instance, guaranteed present by `inject: ["pluginFactory"]`.
		pluginFactory: Furnace,
		// The listener capture: the plugin registers NOTHING here - if a future
		// edit adds a listener, the empty-registry assertions below fail.
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
		// The fs seam: resolve manufactures a stable target; readText serves the
		// in-memory file (or throws like the real backend: missing file, binary,
		// abort); writeText records the call, honors the abort signal like a real
		// backend, and reports create/update from its own in-memory prior state.
		fs: {
			sandboxMode: undefined,
			resolve: async (Path, Opts) => {
				Resolved.push({ path: Path, signal: Opts?.signal });
				return { targetKey: `key:${Path}`, displayPath: Path };
			},
			readText: async (Target, Signal) => {
				if (Signal?.aborted) throw new Error("aborted before read");
				Reads.push(Target.displayPath);
				if (Target.displayPath.endsWith(".bin")) {
					throw new Error("FS_NOT_TEXT: binary or non-UTF-8 content");
				}
				const Content = Files.get(Target.targetKey);
				if (Content === undefined) {
					throw new Error("FS_NOT_FOUND: no such file");
				}
				return Content;
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
			Intents.push({ name: Name, target: Target, actor: Actor });
			return Next();
		},
		// The fs/observed emit: a synchronous recorder (the governance hooks'
		// trigger - the shared executor must fire it exactly like the built-in
		// write, with the call's exec as the actor).
		emit: (Name, Target, Observation, Actor) => {
			Observations.push({
				name: Name,
				target: Target,
				observation: Observation,
				actor: Actor,
			});
		},
		// The ROOT seam: cordis plugin contexts inherit `root` - the shared write
		// executor's fs/observed emit goes through ctx.root (the built-in write's
		// own posture: its ctx IS the root). The fake ctx is its own root.
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
		Reads,
		Writes,
		Intents,
		Observations,
		Files,
		State: Context.__hookDshNormalizeFileState,
	};
};

const NormalizeFile0 = NormalizeFile; // (apply + Config live on both named and default)
const { apply, Config: Schema } = NormalizeFile0;
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

// ---------- Run 1: defaults + the listener-less posture ----------
rm();
const Raw1 = Validate({ logFile: Ledger });
Check(Raw1.log && typeof Raw1.log.get === "function", "volatile cell: log arrives as { get }");
Check(typeof Raw1.logFile.get === "function", "volatile cell: logFile arrives as { get }");
Check(typeof Raw1.replacement.get === "function", "volatile cell: replacement arrives as { get }");
Check(
	Raw1.normalizeReasoning === undefined && Raw1.mutationTools === undefined,
	"minimal schema: no stream flags and no fs/observed fields (shared: false + two knobs)",
);
const Run1 = Make(Raw1);

Check(
	Object.keys(Run1.Listeners).length === 0,
	"NO event listener registered (the family's first listener-less flavor)",
);
Check(Run1.Registered.length === 1, "exactly one tool registered");
const Tool = Run1.Registered[0];
Check(
	Tool && Tool.name === "normalize-file",
	"the tool registration is captured: the tool is named normalize-file",
);
Check(
	Tool.parameters.properties.file_path.type === "string" &&
		Tool.parameters.required.includes("file_path"),
	"input schema: file_path is a required string",
);
Check(Run1.State && Run1.State.Factory === Furnace, "state carries the REAL factory instance");
Check(
	Run1.State.Ledger === "/tmp/normalize-file-smoke-ledger.log",
	"volatile unwrap: logFile cell unwrapped to State.Ledger",
);
Check(Run1.State.Enabled === true, "volatile unwrap: log cell unwrapped to State.Enabled=true");
Check(
	Run1.State.Replacement === "-",
	"volatile unwrap: replacement cell unwrapped to State.Replacement='-'",
);
Check(
	!("Reasoning" in Run1.State) && !("ToolArgs" in Run1.State),
	"tool flavor: state carries no stream flags (no Reasoning/ToolArgs)",
);
Check(
	Run1.State.Module === "hook-dsh-normalize-file",
	"state module = hook-dsh-normalize-file (the ledger prefix)",
);
Check(
	Run1.Lines.includes(
		"hook-dsh-normalize-file: activated (replacement=-, logFile=/tmp/normalize-file-smoke-ledger.log)",
	),
	"activation ledger line byte-exact",
);
Check(
	Furnace.PendingJournal.length === 0,
	"apply journals NOTHING (the family's stream-flavor posture - only the tool's N>0 count is journaled, unlike the trio's activated record)",
);
Check(
	Furnace.PendingJournal.filter((R) => R.event === "normalized").length === 0,
	"no normalized journal record before any tool call",
);

// The exec helper: the call identity the registry would supply.
const Exec = (Signal) => ({
	signal: Signal ?? new AbortController().signal,
	agent: undefined,
	callId: "call_smoke",
});

// ---------- Run 1b: a file with all six families → N > 0 → the write lands ----------
// All six transforms in one file (the dash smoke's All6 fixture): em dash,
// curly double quotes, ellipsis, NBSP, zero-width space, fullwidth A.
const All6 = "a\u2014b\u201Cc\u201D\u2026d\u00A0e\u200Bf\uFF21g";
const Normalized6 = 'a-b"c"...d efAg';
const Fixture = "/tmp/normalize-file-smoke-fixture.txt";
Run1.Files.set(`key:${Fixture}`, All6);
const Exec1 = Exec();
const Out1 = await Tool.execute({ file_path: Fixture }, Exec1);

Check(
	Run1.Resolved.length === 1 && Run1.Resolved[0].path === Fixture,
	"the exec resolves the model-supplied path first (caller-side, like raw-write)",
);
Check(
	Run1.Reads.length === 1 && Run1.Reads[0] === Fixture,
	"the pipeline reads the target exactly once",
);
Check(
	Run1.Writes.length === 1 && Run1.Writes[0].content === Normalized6,
	"N>0: the write lands through Factory.Write with ALL SIX transforms applied (em dash→-, curly quotes→straight, ellipsis→..., NBSP→space, zero-width removed, fullwidth→halfwidth)",
);
Check(
	Run1.Writes[0].intent === undefined,
	"the fs/write-intent waterfall's next() default flowed through (unconditional write)",
);
Check(
	Run1.Intents.length === 1 && Run1.Intents[0].name === "fs/write-intent",
	"the shared executor ran the fs/write-intent waterfall",
);
Check(
	Run1.Intents[0].actor === undefined || typeof Run1.Intents[0].actor === "object",
	"the waterfall received the actor",
);
Check(
	Run1.Writes[0].policy === undefined,
	"bare backend: no sandbox policy stamped onto the write (standing posture)",
);
Check(Run1.Writes[0].signal === Exec1.signal, "the exec's signal flows end to end into writeText");
Check(
	Run1.Observations.some(
		(O) =>
			O.name === "fs/observed" &&
			O.observation.kind === "present" &&
			O.observation.version === "v1",
	),
	"fs/observed emitted with the written version (the governance hooks' trigger)",
);
Check(
	Out1.path === Fixture && Out1.count === 7 && Out1.changed === true,
	"the outcome reports path, count=7, changed=true",
);
Check(
	Out1.before === All6 && Out1.after === Normalized6,
	"the outcome carries the real before/after contents",
);

await new Promise((R) => setTimeout(R, 10));
const Log1 = existsSync(Ledger) ? readFileSync(Ledger, "utf8") : "";
Check(
	Run1.Lines[1] ===
		"hook-dsh-normalize-file: normalized 7 char(s) in /tmp/normalize-file-smoke-fixture.txt",
	"count ledger line byte-exact (N>0 only)",
);
Check(
	Log1.includes("normalized 7 char(s) in /tmp/normalize-file-smoke-fixture.txt"),
	"the durable ledger file carries the count line (the [ISO] message, no logger prefix)",
);
Check(
	Run1.Lines.filter((L) => L.includes("normalized")).length === 1,
	"exactly ONE count line for the write",
);

// ---------- Run 1c: the P5 journal record (the REAL routing) ----------
// The smoke's factory instance has no storageDomain facility and no Open has
// ever succeeded, so the REAL three-stage routing (Function/Journal) serves
// the record from the factory-level PRE-BIND buffer (stage 2,
// PendingJournal) - not the per-State queue (stage 3). Record shape:
// { event: "normalized", path: <displayPath>, detail: <the count line>, at: <number> }.
const Journal1 = Furnace.PendingJournal.filter((R) => R.event === "normalized");
Check(Journal1.length === 1, "exactly ONE 'normalized' journal record after the write");
Check(
	Journal1[0] !== undefined && Journal1[0].path === "/tmp/normalize-file-smoke-fixture.txt",
	"the 'normalized' record carries the target's displayPath",
);
Check(
	Journal1[0] !== undefined &&
		Journal1[0].detail === "normalized 7 char(s) in /tmp/normalize-file-smoke-fixture.txt",
	"journal detail byte-identical to the ledger count line",
);
Check(
	Journal1[0] !== undefined && typeof Journal1[0].at === "number",
	"the 'normalized' record carries a numeric timestamp",
);
Check(
	Run1.State.Queue.filter((R) => R.event === "normalized").length === 0,
	"the record routes to the factory pre-bind buffer (stage 2), not the per-State queue",
);

// ---------- Run 1d: idempotence - normalizing the normalized file is a no-op ----------
const WritesBeforeNoop = Run1.Writes.length;
const Out2 = await Tool.execute({ file_path: Fixture }, Exec());
Check(
	Out2.count === 0 && Out2.changed === false,
	"normalizing the already-normalized file: count 0, changed=false",
);
Check(Run1.Writes.length === WritesBeforeNoop, "N=0 → NO write at all (no writeText call)");
Check(Run1.Intents.length === 1, "N=0 → no fs/write-intent waterfall run");
Check(Run1.Observations.length === 1, "N=0 → no fs/observed emit");
await new Promise((R) => setTimeout(R, 10));
Check(
	Run1.Lines.filter((L) => L.includes("normalized")).length === 1,
	"N=0 → NO count line (the ledger keeps exactly the first one)",
);
Check(
	Furnace.PendingJournal.filter((R) => R.event === "normalized").length === 1,
	"N=0 → NO journal record",
);
Check(Run1.Files.get(`key:${Fixture}`) === Normalized6, "N=0 → the file is left byte-identical");
Check(
	Out2.before === undefined && Out2.after === undefined,
	"N=0 → the outcome carries no before/after (nothing to diff)",
);

// ---------- Run 2: a clean file is a no-op from the start ----------
const Clean = "/tmp/normalize-file-smoke-clean.txt";
Run1.Files.set(`key:${Clean}`, "plain text, already clean\n");
const Out3 = await Tool.execute({ file_path: Clean }, Exec());
Check(
	Out3.count === 0 && Out3.changed === false && Out3.path === Clean,
	"a clean file: count 0, changed=false, path reported",
);
Check(Run1.Writes.length === WritesBeforeNoop, "a clean file: NO write");
Check(
	Furnace.PendingJournal.filter((R) => R.event === "normalized").length === 1,
	"a clean file: NO journal record",
);

// ---------- Run 3: a missing file is an error result, no write ----------
let MissingError = null;
try {
	await Tool.execute({ file_path: "/tmp/normalize-file-smoke-missing.txt" }, Exec());
} catch (E) {
	MissingError = E;
}
Check(
	MissingError !== null &&
		MissingError.message.startsWith(
			"normalize-file: cannot read /tmp/normalize-file-smoke-missing.txt: ",
		),
	"a missing file rejects with the tool's context prefix",
);
Check(
	MissingError !== null && MissingError.message.includes("FS_NOT_FOUND"),
	"the missing-file error keeps the backend's code",
);
Check(Run1.Writes.length === WritesBeforeNoop, "a missing file: NO write");
Check(
	Furnace.PendingJournal.filter((R) => R.event === "normalized").length === 1,
	"a missing file: NO journal record",
);

// ---------- Run 4: a binary/undecodable target is an error result, no write ----------
let BinaryError = null;
try {
	await Tool.execute({ file_path: "/tmp/normalize-file-smoke-image.bin" }, Exec());
} catch (E) {
	BinaryError = E;
}
Check(
	BinaryError !== null &&
		BinaryError.message.startsWith(
			"normalize-file: cannot read /tmp/normalize-file-smoke-image.bin: ",
		),
	"a binary target rejects with the tool's context prefix",
);
Check(
	BinaryError !== null && BinaryError.message.includes("FS_NOT_TEXT"),
	"the binary error keeps the backend's FS_NOT_TEXT code (the mime check, tool-shaped)",
);
Check(Run1.Writes.length === WritesBeforeNoop, "a binary target: NO write");

// ---------- Run 5: a pre-aborted signal rejects, no write ----------
const WritesBeforeAbort = Run1.Writes.length;
const Aborted = new AbortController();
Aborted.abort();
let AbortError = null;
try {
	await Tool.execute({ file_path: "/tmp/normalize-file-smoke-abort.txt" }, Exec(Aborted.signal));
} catch (E) {
	AbortError = E;
}
Check(
	AbortError !== null && /aborted/.test(AbortError.message),
	"a pre-aborted signal rejects the call",
);
Check(
	Run1.Writes.length === WritesBeforeAbort,
	"a pre-aborted signal writes NOTHING (no fs write after the abort)",
);
Check(
	Furnace.PendingJournal.filter((R) => R.event === "normalized").length === 1,
	"an aborted call: NO journal record",
);

// ---------- Run 6: the volatile replacement knob flows into the tool ----------
rm();
const Run6 = Make(Validate({ replacement: "$&", logFile: Ledger }));
Check(Run6.State.Replacement === "$&", "volatile unwrap: custom replacement unwrapped");
Run6.Files.set("key:/tmp/normalize-file-smoke-replacement.txt", "a\u2014b");
const Out6 = await Run6.Registered[0].execute(
	{ file_path: "/tmp/normalize-file-smoke-replacement.txt" },
	Exec(),
);
Check(
	Run6.Writes[0].content === "a$&b",
	"the replacement knob flows into the Dashes step (literal $& - the function replacer)",
);
Check(
	Out6.count === 1 && Out6.changed === true,
	"the replacement run reports count=1, changed=true",
);
await new Promise((R) => setTimeout(R, 10));
Check(
	readFileSync(Ledger, "utf8").includes(
		"normalized 1 char(s) in /tmp/normalize-file-smoke-replacement.txt",
	),
	"the count line reflects the custom-replacement run",
);
const Journal6 = Furnace.PendingJournal.filter((R) => R.event === "normalized");
Check(
	Journal6.length === 2 &&
		Journal6[1].detail === "normalized 1 char(s) in /tmp/normalize-file-smoke-replacement.txt",
	"the custom-replacement run adds its 'normalized' journal record",
);

// ---------- Run 7: the presenters (pure, outcome-metadata driven) ----------
const Call7 = Tool.presentCall({ file_path: Fixture });
Check(
	Call7.card === "generic" && Call7.kind === "edit" && Call7.title === `Normalize ${Fixture}`,
	"presentCall: the generic follow-along card (a call-time presenter has no access to the file's content)",
);
Check(
	Call7.locations && Call7.locations[0].path === Fixture,
	"presentCall: the file location for editor follow-along",
);
const Meta7 = Tool.output.presentationMeta(
	{},
	{ path: Fixture, count: 7, changed: true, before: All6, after: Normalized6 },
);
Check(
	Meta7.changed === true &&
		Meta7.path === Fixture &&
		Meta7.before === All6 &&
		Meta7.after === Normalized6,
	"presentationMeta projects the changed outcome's before/after",
);
const Card7 = Tool.presentResult(
	{ file_path: Fixture },
	{ isError: false, content: [], meta: Meta7 },
);
Check(
	Card7 && Card7.card === "diff" && Card7.title === `Normalize ${Fixture}`,
	"presentResult: the diff card for a changed file",
);
Check(
	Card7 &&
		Card7.diffs[0].path === Fixture &&
		Card7.diffs[0].oldText === All6 &&
		Card7.diffs[0].newText === Normalized6,
	"the diff card shows the outcome's real before/after (the same-turn visibility)",
);
const MetaNoop = Tool.output.presentationMeta({}, { path: Clean, count: 0, changed: false });
Check(
	MetaNoop.changed === false && MetaNoop.path === Clean,
	"presentationMeta for a no-op: changed=false, no before/after",
);
Check(
	Tool.presentResult({ file_path: Clean }, { isError: false, content: [], meta: MetaNoop }) ===
		undefined,
	"presentResult: no diff card for a no-op (the generic result renders)",
);
Check(
	Tool.presentResult({ file_path: Fixture }, { isError: true, content: [], meta: undefined }) ===
		undefined,
	"presentResult: no card for an error result",
);

// ---------- Run 8: each apply builds a FRESH state (no module-level globals) ----------
const First = Run1.State;
const Second = Run6.State;
Check(
	First !== Second && First.Replacement === "-" && Second.Replacement === "$&",
	"each apply builds a FRESH state (no module-level globals)",
);

rm();
console.log(`\n${Pass} PASS, ${Fail} FAIL`);
process.exit(Fail === 0 ? 0 : 1);

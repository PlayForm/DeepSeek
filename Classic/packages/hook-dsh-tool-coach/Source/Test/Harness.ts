import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import Coach from "../../Target/Library.js";
import Detect from "../../Target/Function/Detect.js";
import { DefaultOf, ParamsOf, PrimaryOf } from "../../Target/Function/Fetch.js";
import { CATALOG } from "../../Target/Variable/Catalog.js";
import { DEFAULT_EXEMPTS, DEFAULT_PATTERNS } from "../../Target/Variable/Patterns.js";
import {
	CLASS_LEADS,
	NOTE_DENIED,
	NOTE_DENIED_TOOL,
	NOTE_FIRST,
	NOTE_PERSISTENT,
} from "../../Target/Variable/Notes.js";
import FactoryClass from "../../../plugin-dsh-factory/Target/Library.js";

/**
 * @module Harness
 *
 * The shared test harness for the TOOL COACH tests: the fake ctx (on capture, get serving the REAL
 * @playform/plugin-dsh-factory instance from its built Target, logger capture, a configurable
 * tools.schemas seam + the root seam) plus the REAL tool-coach apply from its built Target - the
 * seams from the source suite (Classic/smokes/tool-coach-smoke.mjs), written ONCE per package and
 * imported by every test folder.
 *
 * @remarks
 *
 * The suite-level fixtures (the tmp ledger, the live registry schema fixture, the Post/Pre/Assemble
 * waterfall helpers, the pattern-row locators) live here too: each folder process gets a fresh set
 * (the module state is per-process), so every folder is standalone-green and the aggregate replays
 * the same seams per folder.
 *
 * Standalone selfcheck: `node Target/Test/Harness.js --selfcheck` runs the counter through one
 * deliberate pass + one deliberate failure and exits 0 only when both are counted exactly, then
 * proves the fake ctx actually wires the coach (the vacuously-green backstop for every folder's
 * fixture); prepublishOnly.sh gates the build on it. Imported as a library, this module only
 * exports.
 *
 * The fake clock: the coach measures time in JUDGED CALLS, not wall time - the cooldown window, the
 * clean window and sectionTtl are all judged-call counters (strike 8 at the 6th call since the
 * note, 12 clean calls, calls-9 >= ttl 2), so the TTL/cooldown paths are driven deterministically
 * by the call sequences in the folders; there are no timer stubs to fake.
 */
export {
	CATALOG,
	CLASS_LEADS,
	Coach,
	DefaultOf,
	Detect,
	DEFAULT_EXEMPTS,
	DEFAULT_PATTERNS,
	NOTE_DENIED,
	NOTE_DENIED_TOOL,
	NOTE_FIRST,
	NOTE_PERSISTENT,
	ParamsOf,
	PrimaryOf,
};

/**
 * The per-folder counter: `N` = passing checks, `F` = failing checks.
 * Passed by reference so Check can bump it from inside its callback.
 */
export type Counter = {
	N: number;
	F: number;
};

/**
 * A fresh counter for one test folder.
 */
export const MakeCounter = (): Counter => ({ N: 0, F: 0 });

/**
 * One check = the source suite's ok group. The callback carries that group's
 * assertions VERBATIM (same bytes, same order within the folder); a throw
 * inside counts the whole group failed - every later check still runs, and
 * Finish turns any failure into a non-zero exit for the runner.
 */
export const Check = (Count: Counter, Label: string, Assertions: () => void): void => {
	Count.N++;
	try {
		Assertions();
		console.log(`PASS - ${Label}`);
	} catch (_Error) {
		Count.F++;
		console.log(`FAIL - ${Label}`);
		console.log(_Error instanceof Error ? _Error.message : String(_Error));
	}
};

/**
 * The async variant of Check, for folders whose assertions await. Same
 * counting and printing; the caller must await it so checks stay sequential
 * and Finish sees the final counts.
 */
export const CheckAsync = async (
	Count: Counter,
	Label: string,
	Assertions: () => Promise<void>,
): Promise<void> => {
	Count.N++;
	try {
		await Assertions();
		console.log(`PASS - ${Label}`);
	} catch (_Error) {
		Count.F++;
		console.log(`FAIL - ${Label}`);
		console.log(_Error instanceof Error ? _Error.message : String(_Error));
	}
};

/**
 * End-of-folder guard: any failed assertion is a folder failure. Returns the
 * PASS count for the runner's `N PASS - <Name>` line (the vacuously-green
 * backstop: the runner compares it against the folder README's expected
 * count).
 */
export const Finish = (Count: Counter, Name: string): number => {
	if (Count.F !== 0) {
		throw new Error(`${Name}: ${Count.F} failed check(s)`);
	}
	return Count.N;
};

// -- the suite-level fixtures (the source suite's module state, verbatim) --

export const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "tool-coach-smoke-"));
export const Ledger = Path.join(Root, "tool-coach.log");

/**
 * Remove the durable ledger file (the source suite's `rm()`, verbatim): every
 * scenario starts from an empty ledger so the `[ISO]` file assertions see
 * exactly the lines their scenario wrote.
 */
export const rm = (): void => {
	try {
		FileSystem.rmSync(Ledger);
	} catch {}
};

/**
 * The REAL factory instance (constructed exactly the way the factory's own
 * smoke does - the Service base constructor registers through
 * ctx.reflect.probe; the stub context is used once and discarded).
 */
export const Furnace: any = new FactoryClass({
	reflect: { provide: () => undefined },
} as any);

/**
 * The LIVE registry fixture (the fake ctx.tools.schemas). The read
 * description carries a distinctive `(live fixture)` marker so the tests can
 * tell a LIVE fetch from the GENERATED static fallback (D1 vs D2), and the
 * read/edit schemas carry `required` plus the harness's own
 * "Defaults to X." parameter sentences so the parameter projection is
 * exercised exactly as the real registry exercises it.
 */
export const LiveSchemas = () => [
	{
		name: "read",
		description: "Read a UTF-8 text file (live fixture) and return line-numbered content.",
		parameters: {
			type: "object",
			properties: {
				file_path: { type: "string", description: "Path to read." },
				offset: { type: "number", description: "1-based first line to return. Defaults to 1." },
				limit: {
					type: "number",
					description: "Maximum number of lines to return. Defaults to 2000.",
				},
			},
			required: ["file_path"],
		},
	},
	{
		name: "write",
		description: "Create or fully replace a UTF-8 text file.",
		parameters: { properties: { file_path: {} }, required: ["file_path"] },
	},
	{
		name: "edit",
		description: "Edit an existing UTF-8 text file by replacing literal text.",
		parameters: {
			properties: {
				file_path: { description: "Path to edit." },
				old_string: { description: "Literal text to replace." },
				new_string: { description: "Literal replacement text." },
				replace_all: {
					description: "Replace all matches. Defaults to false; when false, old_string must appear exactly once.",
				},
			},
			required: ["file_path", "old_string", "new_string"],
		},
	},
	{
		name: "grep",
		description: "Search file contents with a ripgrep regular expression.",
		parameters: { properties: { pattern: {} }, required: ["pattern"] },
	},
	{
		name: "aaa_fixture",
		description: "Fixture tool that sorts first, so the top-up has a stable first row.",
		parameters: { properties: { x: {} } },
	},
	{
		name: "web_search",
		description: "Search the web for current information.",
		parameters: { properties: { queries: {} }, required: ["queries"] },
	},
	{
		name: "working_directory",
		description: "Read the current working directory, or change it with cd.",
		parameters: {
			properties: {
				cd: { description: "Existing directory to enter. Omit to read the current directory." },
			},
		},
	},
	{
		name: "zzz_fixture",
		description: "Fixture tool for the top-up ordering.",
		parameters: { properties: { x: {} } },
	},
];

/**
 * The pattern rows the assertions name (located from the ACTUAL defaults, so
 * the expected strings cannot drift from the table).
 */
export const RowFor = (Needle: string): any =>
	DEFAULT_PATTERNS.find((Row: any) => Row.pattern.includes(Needle));
export const CAT_ROW: string = RowFor("(cat|less|more").pattern;
export const SED_ROW: string = RowFor("\\bsed\\b").pattern;
export const JQ_EXEMPT: any = DEFAULT_EXEMPTS.find((Pattern: any) => Pattern.includes("jq"));

/**
 * The fake ctx: on() captures listeners, get() serves the REAL factory,
 * logger captures info + warn lines, tools.schemas is configurable.
 */
export const Make = (Raw: any, Options: any = {}): any => {
	const Listeners: any = {},
		ListenerOptions: any = {},
		Lines: string[] = [],
		Warns: string[] = [];
	const Context: any = {
		pluginFactory: Furnace,
		tools: Options.tools ?? { schemas: LiveSchemas },
		on: (Name: string, Listener: unknown, Opts: unknown) => {
			Listeners[Name] = Listener;
			ListenerOptions[Name] = Opts;
			return () => true;
		},
		get: (Name: string) => {
			switch (Name) {
				case "pluginFactory":
					return Furnace;
				case "tools":
					return Context.tools;
				default:
					throw new Error(`unknown service: ${Name}`);
			}
		},
		logger: {
			info: (M: string) => {
				Lines.push(M);
			},
			warn: (M: string) => {
				Warns.push(M);
			},
		},
		get root() {
			return Context;
		},
	};
	const Returned = (Coach.apply as any)(Context, Raw);
	return {
		Context,
		Listeners,
		ListenerOptions,
		Lines,
		Warns,
		Returned,
		State: Context.__hookDshToolCoachState,
	};
};

/**
 * The real-config shape the loader hands to apply: volatile fields arrive as
 * `{ get }` cells. Build one via the coach's schema. The cast is fixture-only
 * scaffolding.
 */
export const Validate = (Raw: Record<string, unknown>): any =>
	(Coach.Config as unknown as (Raw: Record<string, unknown>) => any)({ ...Raw });

// Stable downstream decisions shared by every fake Next (so identity checks
// `Out === Downstream` are meaningful).
export const ACCEPT: any = { kind: "accept" };
export const ALLOW: any = { kind: "allow" };

/**
 * A judged terminal call through the post-execute listener.
 */
export const Agent = (ID: string): any => ({ id: ID });
export const AgentA: any = Agent("agent-a");

export const Post = async (Run: any, Command: string, Who: any = AgentA, Name = "bash"): Promise<any> =>
	Run.Listeners["tools/post-execute"](
		{
			callId: "call_smoke",
			name: Name,
			arguments: { command: Command },
			agent: Who,
			signal: undefined,
		},
		{ isError: false, value: "", content: [] },
		async () => ACCEPT,
	);

export const Pre = async (Run: any, Command: string, Who: any = AgentA, Name = "bash"): Promise<any> =>
	Run.Listeners["tools/pre-execute"](
		{
			callId: "call_smoke",
			name: Name,
			arguments: { command: Command },
			agent: Who,
			signal: undefined,
		},
		async () => ALLOW,
	);

export const Assemble = async (Run: any, Who: any = AgentA): Promise<any> => {
	const Assembly = {
		sections: [{ name: "base", text: "BASE" }],
		contexts: [{ name: "ctx", text: "CTX" }],
		tools: [{ name: "read", description: "d", parameters: {} }],
		variables: { v: "1" },
	};
	return Run.Listeners["system-prompt/assemble"](Assembly, { agent: Who }, async () => Assembly);
};

export const LinesWith = (Run: any, Needle: string): string[] =>
	Run.Lines.filter((L: string) => L.includes(Needle));

// Standalone entry: `node Target/Test/Harness.js --selfcheck`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Count = MakeCounter();
	Check(Count, "selfcheck: a passing assertion counts as PASS", () => {
		assert.equal(1, 1);
	});
	Check(Count, "selfcheck: a failing assertion counts as FAIL (expected)", () => {
		assert.equal(1, 2);
	});

	// The seam selfcheck: the fake ctx actually wires the coach (the
	// vacuously-green backstop for every folder's fixture - a broken seam
	// would print fewer checks in every folder, which the runner's
	// expected-count guard catches; this proves the seam itself at build time).
	rm();
	const Run = Make(Validate({ logFile: Ledger }));
	Check(Count, "selfcheck: the fake ctx registers the coach's apply-time wiring", () => {
		assert.equal(Object.keys(Run.Listeners).length, 6);
		assert.equal(Run.State.Module, "hook-dsh-tool-coach");
		assert.ok(
			Run.Lines.some((L: string) => L.startsWith("hook-dsh-tool-coach: activated")),
		);
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

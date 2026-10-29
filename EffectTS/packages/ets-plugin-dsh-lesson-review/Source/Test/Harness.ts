// Source/Test/Harness.ts - the shared test harness for the LESSON-REVIEW
// service: the fake ctx (reflect.provide capture for the Service base, the
// logger capture, the effect runner, the probe-once `get`) + the REAL
// LessonService class from its built Target - the family fake-ctx +
// real-built-library harness pattern, written ONCE per package and imported by
// every test folder. Each folder process gets a fresh set, so every folder is
// standalone-green.
//
// THE HOME REDIRECT: every knob is a `~/.dsh/...` path, so the harness points
// $HOME at a fresh OS temp directory BEFORE any construction. A scenario then
// writes its own corpus under `<Home>/.dsh/skills` and asserts against the real
// filesystem - no path is stubbed, and the user's real home is never touched.
//
// THE LLM IS A FAKE SERVICE, not a stubbed module: `FakeLlm` answers with the
// reply split into two `text-delta` frames (the streaming shape the service
// reads) and records the request it was handed, so a scenario can assert the
// digest + prompt that went out as well as the operations that came back. The
// absent-llm path is simply a ctx without one.
//
// Standalone selfcheck: `node Target/Test/Harness.js --selfcheck` runs the
// counter through one deliberate pass + one deliberate failure and exits 0 only
// when both are counted exactly, then proves the fake ctx actually wires the
// Service constructor and the activation line (the vacuously-green backstop).
//
// NO FAKE CLOCK: Curate takes an explicit `Now`, and every entry carries
// explicit timestamps, so every timing assertion is on a passed value.
import assert from "node:assert/strict";
import FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";

import LessonService from "../../Target/Library.js";

export { LessonService };

/** The fresh temp home: the service's `~/.dsh` paths resolve inside it. */
export const Home = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "lesson-smoke-home-"));
process.env["HOME"] = Home;

/** The per-folder counter. */
export type Counter = { N: number; F: number };

export const MakeCounter = (): Counter => ({ N: 0, F: 0 });

/**
 * One check = the source suite's ok group. The callback carries that group's
 * assertions VERBATIM; a throw inside counts the whole group failed.
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

/** The async variant of Check, for folders whose assertions await. */
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
 * PASS count for the runner's `N PASS - <Name>` line.
 */
export const Finish = (Count: Counter, Name: string): number => {
	if (Count.F !== 0) {
		throw new Error(`${Name}: ${Count.F} failed check(s)`);
	}
	return Count.N;
};

/** Flush the detached constructor chain (the usage-store load). */
export const Settle = async (): Promise<void> => {
	for (let Index = 0; Index < 4; Index++) {
		await new Promise<void>((Resolve) => setImmediate(Resolve));
	}
};

/**
 * The fake ctx: the Service base constructor registers through
 * ctx.reflect.provide; the logger captures the service's ledger lines; the
 * effect runner executes its setup immediately and records the disposer; get
 * resolves through the context properties (the `llm` probe).
 */
export const Make = (
	Knobs: Record<string, unknown> = {},
	Attach?: (Context: any, Run: any) => void,
): any => {
	const Lines: string[] = [];
	const Warns: string[] = [];
	const Provided: any = {};
	const Effects: string[] = [];
	const Disposers: Array<() => void> = [];
	const Context: any = {
		logger: {
			info: (M: string) => {
				Lines.push(M);
			},
			warn: (M: string) => {
				Warns.push(M);
			},
		},
		get: (Name: string) => Context[Name],
		effect: (Setup: () => unknown, Label?: string) => {
			Effects.push(Label ?? "unnamed");
			const Disposer = Setup();
			if (typeof Disposer === "function") {
				Disposers.push(Disposer as () => void);
			}
			return () => true;
		},
		reflect: {
			provide: (Name: string, Value?: unknown) => {
				Provided[Name] = Value ?? true;
				Context[Name] = Value;
				return () => true;
			},
		},
	};
	const Run: any = { Context, Lines, Warns, Provided, Effects, Disposers };
	// The optional pre-construction attachment: the llm service must be in
	// place BEFORE the constructor runs its probes.
	Attach?.(Context, Run);
	Run.Service = new LessonService(Context, Knobs);
	return Run;
};

/** One request the fake llm was handed. */
export interface LlmRequest {
	provider?: string;
	model?: string;
	messages?: { role?: string; content?: { type?: string; text?: string }[] }[];
	maxTokens?: number;
	signal?: AbortSignal;
}

/**
 * The fake llm service: the reply split across two `text-delta` frames, and
 * every request recorded. `fail` throws synchronously out of `stream` (the
 * provider-exploded path); `silent` yields no frames at all (an empty reply).
 */
export const FakeLlm = (
	Reply: string,
	Options: { fail?: boolean; silent?: boolean } = {},
): any => {
	const Calls: LlmRequest[] = [];
	return {
		Calls,
		stream: (Request: LlmRequest) => {
			Calls.push(Request);
			switch (true) {
				case Options.fail === true:
					throw new Error("provider exploded");
				case Options.silent === true:
					return (async function* () {
						/* no frames */
					})();
				default:
					return (async function* () {
						yield { type: "text-delta", index: 0, text: Reply.slice(0, 12) };
						yield { type: "text-delta", index: 0, text: Reply.slice(12) };
					})();
			}
		},
	};
};

/** A corpus fixture: one skill directory with a SKILL.md under the temp HOME. */
export const Seed = (Name: string, Body = `---\nname: ${Name}\ndescription: x\n---\n\n# ${Name}\n`): string => {
	const Directory = Path.join(Home, ".dsh", "skills", Name);
	FileSystem.mkdirSync(Directory, { recursive: true });
	FileSystem.writeFileSync(Path.join(Directory, "SKILL.md"), Body, "utf8");
	return Directory;
};

/** Whether a corpus path exists (the write assertions). */
export const Exists = (Relative: string): boolean =>
	FileSystem.existsSync(Path.join(Home, ".dsh", Relative));

/** Read a corpus file (the body assertions). */
export const Read = (Relative: string): string =>
	FileSystem.readFileSync(Path.join(Home, ".dsh", Relative), "utf8");

/** The service's ledger lines without the neutral ` (logFile ...)` suffix. */
export const Messages = (Run: any): string[] =>
	Run.Lines.map((Line: string) => Line.replace(/ \(logFile .*\)$/, ""));

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
	// The seam selfcheck: the fake ctx actually wires the Service constructor.
	const Run = Make();
	Check(Count, "selfcheck: the fake ctx registers the service", () => {
		assert.equal(Run.Provided["lesson"], Run.Service);
		assert.equal(Run.Service.name, "lesson");
	});
	Check(Count, "selfcheck: the activation line names the corpus and the write posture", () => {
		assert.deepEqual(Messages(Run), [
			`lesson: activated (bundle=${process.env.VERSION_PACKAGE}, interval=10 turns, corpus=~/.dsh/skills, write=approve)`,
		]);
	});
	if (Count.N === 4 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

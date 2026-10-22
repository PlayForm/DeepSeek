// Source/Test/Harness.ts - the shared test harness for the PATTERN service
// tests: the fake ctx (reflect.provide capture for the Service base, the
// logger capture) + the REAL PatternService class from its built Target -
// the family fake-ctx + real-built-library harness pattern, written ONCE
// per package and imported by every test folder. Each folder process gets a
// fresh set, so every folder is standalone-green.
//
// The service's Snapshot persistence uses the REAL node fs/promises against
// `~/.dsh/pattern/registry.json` - the harness redirects $HOME to a fresh
// OS temp directory BEFORE any construction, so the service never reads or
// writes the user's real home directory, and every scenario starts from an
// empty (or explicitly seeded) store.
//
// Standalone selfcheck: `node Target/Test/Harness.js --selfcheck` runs the
// counter through one deliberate pass + one deliberate failure and exits 0
// only when both are counted exactly, then proves the fake ctx actually
// wires the Service constructor (the vacuously-green backstop).
//
// NO FAKE CLOCK: Record and Decay take an explicit `Now` argument, so every
// timing assertion is on the passed value - the no-wall-clock rule holds
// without a time seam.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import PatternService from "../../Target/Library.js";

export { PatternService };

/** The fresh temp home: the service's `~/.dsh` paths resolve inside it. */
export const Home = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "pattern-smoke-home-"));
process.env["HOME"] = Home;

/** The per-folder counter. */
export type Counter = {
	N: number;
	F: number;
};

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

/**
 * The async variant of Check, for folders whose assertions await (the
 * snapshot Save/Load paths). Same counting and printing.
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
 * PASS count for the runner's `N PASS - <Name>` line.
 */
export const Finish = (Count: Counter, Name: string): number => {
	if (Count.F !== 0) {
		throw new Error(`${Name}: ${Count.F} failed check(s)`);
	}
	return Count.N;
};

/**
 * Flush the detached constructor promise queue (the snapshot Load runs
 * detached, so the restore line lands on a later microtask/macrotask).
 */
export const Settle = async (): Promise<void> => {
	for (let Index = 0; Index < 4; Index++) {
		await new Promise<void>((Resolve) => setImmediate(Resolve));
	}
	// The detached Load's readFile completes on the thread pool: give the
	// poll phase a real macrotask before asserting.
	await new Promise<void>((Resolve) => setTimeout(Resolve, 20));
};

/**
 * The fake ctx: the Service base constructor registers through
 * ctx.reflect.provide; the logger captures the service's ledger lines.
 */
export const Make = (Knobs: Record<string, unknown> = {}): any => {
	const Lines: string[] = [];
	const Warns: string[] = [];
	const Provided: any = {};
	const Context: any = {
		logger: {
			info: (M: string) => {
				Lines.push(M);
			},
			warn: (M: string) => {
				Warns.push(M);
			},
		},
		reflect: {
			provide: (Name: string, Value?: unknown) => {
				Provided[Name] = Value ?? true;
				Context[Name] = Value;
				return () => true;
			},
		},
	};
	const Service: any = new PatternService(Context);
	if (Object.keys(Knobs).length > 0) {
		Service.Configure(Knobs);
	}
	return { Context, Service, Lines, Warns, Provided };
};

/**
 * The service's ledger lines carry the neutral suffix
 * ` (logFile <Knobs.logFile>)` - strip it for the message-only assertions.
 */
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
	// The seam selfcheck: the fake ctx actually wires the Service
	// constructor (the vacuously-green backstop for every folder's fixture).
	const Run = Make();
	Check(Count, "selfcheck: the fake ctx registers the service and seeds the catalog", () => {
		assert.equal(Run.Provided["pattern"], Run.Service);
		assert.equal(Run.Service.name, "pattern");
		assert.equal(Run.Service.List().length, 4);
		assert.deepEqual(Run.Lines, ["pattern: activated (seeded 4 patterns) (logFile ~/.dsh/pattern.log)"]);
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

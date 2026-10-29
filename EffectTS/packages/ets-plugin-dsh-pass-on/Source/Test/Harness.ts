// Source/Test/Harness.ts - the shared test harness for the PASS-ON tests:
// the fake ctx (the reflect.provide capture, the logger capture) + the REAL
// @playform/ets-plugin-dsh-pass-on class from its built Target - the family
// fake-ctx + real-built-library harness pattern, written ONCE per package and
// imported by every test folder. Each folder process gets a fresh set, so
// every folder is standalone-green and the aggregate replays the same seams
// per folder.
//
// Standalone selfcheck: `node Target/Test/Harness.js --selfcheck` runs the
// counter through one deliberate pass + one deliberate failure and exits 0
// only when both are counted exactly, then proves the fake ctx actually
// constructs the plugin (the vacuously-green backstop for every folder's
// fixture).
//
// THE REAL FILESYSTEM: the pass-on reads its targets through node:fs
// (Function/Prepare) and appends its own journal through node:fs
// (Function/Journal) - the plugin has NO ctx.fs dependency at all, so the
// harness gives it a fresh temporary directory per folder process and the
// tests seed fixture files into it. The journal file is the ONLY artifact the
// plugin may create there (the read-only law, asserted in the folders).
//
// NO FAKE CLOCK: the proposal timestamps are the plugin's own Date.now reads;
// the expiry test mutates the stored proposal's expiresAt instead of waiting.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import Plugin from "../../Target/Library.js";

export { Plugin };

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
 * assertions VERBATIM; a throw inside counts the whole group failed - every
 * later check still runs, and Finish turns any failure into a non-zero exit
 * for the runner.
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

// -- the suite-level fixtures (fresh per folder process) --

export const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "pass-on-smoke-"));
export const Ledger = Path.join(Root, "pass-on.log");

/**
 * Seed one fixture file into the temporary directory (the plugin reads these
 * through node:fs; the path is relative to the fixture root).
 */
export const Seed = (Relative: string, Content: string): string => {
	const Full = Path.join(Root, Relative);
	FileSystem.mkdirSync(Path.dirname(Full), { recursive: true });
	FileSystem.writeFileSync(Full, Content);
	return Full;
};

/**
 * Remove the durable journal file: every scenario starts from an empty
 * journal so the line assertions see exactly the lines their scenario wrote.
 */
export const rm = (): void => {
	try {
		FileSystem.rmSync(Ledger);
	} catch {}
};

/**
 * The journal file's lines (the JSON-line forms).
 */
export const LedgerLines = (): string[] =>
	(() => {
		try {
			return FileSystem.readFileSync(Ledger, "utf8").split("\n").filter(Boolean);
		} catch {
			return [];
		}
	})();

/**
 * Validate a raw config through the plugin's own schema (the registry's
 * load-time validation; fills every default).
 */
export const Validate = (Raw: Record<string, unknown> = {}): any =>
	(Plugin as unknown as { Config: (Raw: Record<string, unknown>) => any }).Config({
		...Raw,
	});

/**
 * The fake ctx: the Service base's registration (ctx.reflect.provide), the
 * bus emission capture (`batch/proposed`), the optional-service probe
 * (`get` - the harness agent registry, the inbox delivery's target) and the
 * logger capture. The plugin never reads anything else off the context.
 */
export const Make = (Raw: Record<string, unknown> = {}): any => {
	const Provided: any = {};
	const Lines: string[] = [];
	const Emits: any[][] = [];
	const Services: Record<string, unknown> = {};
	let Context: any;
	Context = {
		logger: {
			info: (Message: string) => {
				Lines.push(Message);
			},
			warn: (Message: string) => {
				Lines.push(Message);
			},
		},
		emit: (Name: string, ...Args: unknown[]) => {
			Emits.push([Name, ...Args]);
		},
		get: (Name: string) => Services[Name],
		reflect: {
			provide: (Name: string, Value?: unknown) => {
				Provided[Name] = Value ?? true;
				Context[Name] = Value;
				return () => true;
			},
		},
	};
	const Config = Validate({ logFile: Ledger, root: Root, ...Raw });
	const Instance = new (Plugin as unknown as new (
		Context: unknown,
		Config: unknown,
	) => any)(Context, Config);
	return { Context, Provided, Lines, Emits, Services, Config, Instance, State: Instance.State };
};

/**
 * The captured logger lines that carry the needle.
 */
export const LinesWith = (Run: any, Needle: string): string[] =>
	Run.Lines.filter((Line: string) => Line.includes(Needle));

/**
 * The journal lines that carry the needle.
 */
export const LedgerWith = (Needle: string): string[] =>
	LedgerLines().filter((Line: string) => Line.includes(Needle));

/**
 * The sha256 of one file's content (the plugin's version token, recomputed
 * in the test for the byte-exact target assertion).
 */
export const VersionOf = async (Full: string): Promise<string> =>
	(await import("node:crypto")).createHash("sha256")
		.update(FileSystem.readFileSync(Full))
		.digest("hex");

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
	// The seam selfcheck: the fake ctx actually constructs the plugin (the
	// vacuously-green backstop for every folder's fixture - a broken seam
	// would print fewer checks in every folder, which the runner's
	// expected-count guard catches; this proves the seam itself at build
	// time).
	rm();
	const Run = Make({ enabled: false });
	Check(Count, "selfcheck: the fake ctx constructs the plugin instance", () => {
		assert.equal(Run.Provided.passOn, Run.Instance);
		assert.equal(Run.Instance.name, "passOn");
		assert.equal(Run.Instance.Prepare({ kind: "replace" }), null);
		assert.equal(Run.Lines.length, 0);
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

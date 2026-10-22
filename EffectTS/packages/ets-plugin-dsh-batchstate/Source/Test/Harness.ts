// Source/Test/Harness.ts - the shared test harness for the BATCH-STATE
// tests: the fake ctx (ctx listener capture, a DISTINCT root object,
// reflect.provide capture for the service, the event capture for
// batch/state-change, the effect runner, logger capture + the fs seam) + the
// REAL @playform/plugin-dsh-batchstate apply from its built Target + the
// REAL @playform/ets-plugin-dsh-factory instance from its built Target - the
// family fake-ctx + real-factory harness pattern, written ONCE per package
// and imported by every test folder. Each folder process gets a fresh set,
// so every folder is standalone-green and the aggregate replays the same
// seams per folder.
//
// Standalone selfcheck: `node Target/Test/Harness.js --selfcheck` runs the
// counter through one deliberate pass + one deliberate failure and exits 0
// only when both are counted exactly, then proves the fake ctx actually
// wires the plugin (the vacuously-green backstop for every folder's
// fixture).
//
// NO FAKE CLOCK: the plugin stamps Date.now() for startedAt/finishedAt
// bookkeeping only; no assertion depends on a wall-clock value (the
// compile output is derived purely from the state).
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import Plugin from "../../Target/Library.js";
import FactoryClass from "../../../ets-plugin-dsh-factory/Target/Library.js";

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

export const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "batchstate-smoke-"));
export const Ledger = Path.join(Root, "batchstate.log");
export const StateFile = Path.join(Root, "state.json");

/**
 * Remove the durable ledger file: every scenario starts from an empty ledger
 * so the `[ISO]` file assertions see exactly the lines their scenario wrote.
 */
export const rm = (): void => {
	try {
		FileSystem.rmSync(Ledger);
	} catch {}
};

/**
 * The durable ledger file's lines (the `[ISO] message` forms).
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
 * Seed the JSON state file the recovery reads (the restart scenario: the
 * file is the plugin's own durable store, written directly by the fixture).
 */
export const Seed = (Content: string, File: string = StateFile): void => {
	FileSystem.writeFileSync(File, Content, "utf8");
};

/**
 * The REAL factory instance (constructed exactly the way the factory's own
 * smoke does - the Service base constructor registers through
 * ctx.reflect.provide; the stub context is used once and discarded).
 */
export const Furnace: any = new FactoryClass({
	reflect: { provide: () => undefined },
} as any);

/**
 * The fake fs: writeText/readText RECORD then THROW - the plugin must never
 * touch file content through the context fs (the state file and the ledger
 * are the plugin's own plain-fs stores; the throw makes a context-fs
 * violation fail loud instead of passing silently).
 */
export const FakeFs = (): any => {
	const Fs: any = {
		files: {},
		writes: [] as unknown[][],
		reads: [] as unknown[],
	};
	Fs.resolve = async (P: string) => ({ targetKey: P, displayPath: P });
	Fs.stat = async () => undefined;
	Fs.writeText = async (...Parts: unknown[]) => {
		Fs.writes.push(Parts);
		throw new Error("writeText must never be called");
	};
	Fs.readText = async (...Parts: unknown[]) => {
		Fs.reads.push(Parts);
		throw new Error("readText must never be called");
	};
	return Fs;
};

/**
 * The fake ctx: the ROOT object is DISTINCT from the ctx (its on() is the
 * only root capture), ctx.on() captures into a SEPARATE map (the factory's
 * loader/volatile-update listener lands there), reflect.provide captures the
 * `batchstate` service registration, the event capture records every
 * batch/state-change emission, effect runs its setup immediately and records
 * the disposer, get() resolves through the context properties.
 */
export const Make = (Raw: any, Attach?: (Context: any, Run: any) => void): any => {
	const Listeners: any = {};
	const CtxListeners: any = {};
	const Lines: string[] = [];
	const Warns: string[] = [];
	const Provided: any = {};
	const Events: any[] = [];
	const Effects: string[] = [];
	const Disposers: Array<() => void> = [];
	const RootNames: string[] = [];
	const Root: any = {
		on: (Name: string, Listener: unknown) => {
			RootNames.push(Name);
			Listeners[Name] = Listener;
			return () => true;
		},
	};
	const Fs = FakeFs();
	let Context: any;
	Context = {
		pluginFactory: Furnace,
		fs: Fs,
		logger: {
			info: (M: string) => {
				Lines.push(M);
			},
			warn: (M: string) => {
				Warns.push(M);
			},
		},
		on: (Name: string, Listener: unknown) => {
			CtxListeners[Name] = Listener;
			return () => true;
		},
		emit: (Name: string, Payload: unknown) => {
			if (Name === "batch/state-change") {
				Events.push(Payload);
			}
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
		root: Root,
		reflect: {
			provide: (Name: string, Value?: unknown) => {
				Provided[Name] = Value ?? true;
				Context[Name] = Value;
				return () => true;
			},
		},
	};
	const Run: any = {
		Context,
		Root,
		Listeners,
		CtxListeners,
		Lines,
		Warns,
		Provided,
		Events,
		Effects,
		Disposers,
		RootNames,
		Raw,
		Fs,
	};
	// The optional pre-apply attachment: the seeded state file must be in
	// place BEFORE apply runs (the recovery reads it at apply time).
	Attach?.(Context, Run);
	Run.Returned = (Plugin.apply as any)(Context, Raw);
	Run.State = Context.__pluginDshBatchstateState;
	return Run;
};

/**
 * The real-config shape the loader hands to apply: volatile fields arrive as
 * `{ get }` cells. Build one via the plugin's schema. The cast is
 * fixture-only scaffolding.
 */
export const Validate = (Raw: Record<string, unknown>): any =>
	(Plugin.Config as unknown as (Raw: Record<string, unknown>) => any)({ ...Raw });

/**
 * A captured info line that carries the needle.
 */
export const LinesWith = (Run: any, Needle: string): string[] =>
	Run.Lines.filter((L: string) => L.includes(Needle));

/**
 * The ledger file lines that carry the needle (after the `[ISO] ` stamp).
 */
export const LedgerWith = (Needle: string): string[] =>
	LedgerLines().filter((L: string) => L.includes(Needle));

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
	// The seam selfcheck: the fake ctx actually wires the plugin (the
	// vacuously-green backstop for every folder's fixture - a broken seam
	// would print fewer checks in every folder, which the runner's
	// expected-count guard catches; this proves the seam itself at build
	// time).
	rm();
	const Run = Make(Validate({ logFile: Ledger, enabled: true, stateFile: StateFile }));
	Check(Count, "selfcheck: the fake ctx registers the plugin's apply-time wiring", () => {
		assert.equal(Run.Returned, undefined);
		assert.deepEqual(Run.RootNames, []);
		assert.ok(Run.Provided["batchstate"] !== undefined);
		assert.ok(Run.State !== undefined);
		assert.deepEqual(Run.Lines, [
			`batchstate: activated (batch=default, stateFile=${StateFile})`,
			"batchstate: recovered (0 members, queue 0)",
		]);
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

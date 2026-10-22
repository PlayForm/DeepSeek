// Source/Test/Harness.ts - the shared test harness for the WORKSPACE-MONITOR
// tests: the fake ctx (root listener capture with a DISTINCT root object, the
// ctx listener capture, reflect.provide capture, the effect runner, logger
// capture + the fs/storage seams) + the REAL @playform/plugin-dsh-factory
// instance from its built Target + the REAL workspace-monitor apply from its
// built Target - the family fake-ctx + real-factory harness pattern, written
// ONCE per package and imported by every test folder. Each folder process
// gets a fresh set, so every folder is standalone-green and the aggregate
// replays the same seams per folder.
//
// Standalone selfcheck: `node Target/Test/Harness.js --selfcheck` runs the
// counter through one deliberate pass + one deliberate failure and exits 0
// only when both are counted exactly, then proves the fake ctx actually
// wires the plugin (the vacuously-green backstop for every folder's
// fixture).
//
// NO FAKE CLOCK IN THE HARNESS: the plugin's Clock is the module's own seam
// (State.Now, the no-real-timers rule) - the tests set it through the
// `ctx.__hookDshWorkspaceMonitorState` probe; the harness itself has no
// time seam and the harness never sleeps.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import Plugin from "../../Target/Library.js";
import FactoryClass from "../../../plugin-dsh-factory/Target/Library.js";

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

export const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "workspace-monitor-smoke-"));
export const Ledger = Path.join(Root, "monitor.log");

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
 * The REAL factory instance (constructed exactly the way the factory's own
 * smoke does - the Service base constructor registers through
 * ctx.reflect.probe; the stub context is used once and discarded).
 */
export const Furnace: any = new FactoryClass({
	reflect: { provide: () => undefined },
} as any);

/**
 * The fake fs: resolve returns a stable target for the path, stat returns
 * the seeded version (undefined when the path was not seeded - an absent
 * target), and writeText/readText RECORD then THROW - the monitor never
 * touches file content (the purity rule: zero writeText calls; the throw
 * makes a violation fail loud instead of passing silently).
 */
export const FakeFs = (Files: Record<string, string> = {}): any => {
	const Fs: any = {
		files: Files,
		targets: new Map<string, unknown>(),
		writes: [] as unknown[][],
		reads: [] as unknown[],
		resolved: [] as string[],
		stats: [] as unknown[],
	};
	Fs.resolve = async (P: string) => {
		Fs.resolved.push(P);
		const Target = { targetKey: P, displayPath: P };
		Fs.targets.set(P, Target);
		return Target;
	};
	Fs.stat = async (Target: any) => {
		Fs.stats.push(Target);
		const Version = Fs.files[Target.displayPath];
		return Version === undefined ? undefined : { version: Version, type: "file" };
	};
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
 * only root capture, so a registration made on the plugin ctx instead of the
 * root cannot pass the root-identity assertions), ctx.on() captures into a
 * SEPARATE map (the loader/volatile-update listener the factory's State
 * builder registers lands there), reflect.provide captures the service
 * registrations, effect runs its setup immediately and records the disposer,
 * get() resolves through the context properties.
 */
export const Make = (Raw: any): any => {
	const Listeners: any = {};
	const CtxListeners: any = {};
	const Lines: string[] = [];
	const Warns: string[] = [];
	const Provided: any = {};
	const Effects: string[] = [];
	const Disposers: Array<() => void> = [];
	const RootNames: string[] = [];
	const Emitted: unknown[][] = [];
	const Root: any = {
		on: (Name: string, Listener: unknown) => {
			RootNames.push(Name);
			Listeners[Name] = Listener;
			return () => true;
		},
		emit: (Name: string, ...Parts: unknown[]) => {
			Emitted.push([Name, ...Parts]);
			return true;
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
		Effects,
		Disposers,
		RootNames,
		Emitted,
		Raw,
		Fs,
	};
	Run.Returned = (Plugin.apply as any)(Context, Raw);
	Run.State = Context.__hookDshWorkspaceMonitorState;
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
 * Fire one fs/observed event through the ROOT listener (the actor default is
 * a plain foreign actor object - never the hook's own).
 */
export const Fire = (
	Run: any,
	Path: string,
	Version: string,
	Actor: any = { agent: { id: "agent-a" } },
): void => {
	Run.Listeners["fs/observed"](
		{ displayPath: Path, targetKey: Path },
		{ kind: "present", version: Version },
		Actor,
	);
};

/**
 * Fire an absent observation (the observation kind is not "present").
 */
export const FireAbsent = (Run: any, Path: string): void => {
	Run.Listeners["fs/observed"](
		{ displayPath: Path, targetKey: Path },
		{ kind: "absent" },
		{ agent: { id: "agent-a" } },
	);
};

/**
 * Fire a malformed event (a null target and a null observation) - the
 * listener must catch, never throw.
 */
export const FireMalformed = (Run: any): void => {
	Run.Listeners["fs/observed"](null, null, undefined);
};

/**
 * The volatile-cell write symbol (cosmokit): the loader's hot-edit path
 * commits a new value into a `{ get }` cell through it. The harness uses the
 * REGISTERED global symbol - the same mechanism the live loader uses, so the
 * flip tests exercise the real cells the schema produces.
 */
const Write = Symbol.for("cosmokit.volatile.write");

/**
 * Commit a new value into a volatile cell (the hot-edit write), WITHOUT
 * firing the loader event - the caller then fires the captured
 * loader/volatile-update listener with the changed key, mirroring the live
 * sequence (commit, then the event).
 */
export const Flip = (CellValue: unknown, New: unknown): void => {
	const Cell = CellValue as { [Write]?: (Value: unknown) => unknown };
	if (typeof Cell?.[Write] !== "function") {
		throw new Error("Flip: not a volatile cell (no cosmokit write symbol)");
	}
	Cell[Write](New);
};

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
	const Run = Make(Validate({ logFile: Ledger, enabled: true }));
	Check(Count, "selfcheck: the fake ctx registers the plugin's apply-time wiring", () => {
		assert.equal(Run.RootNames.length, 1);
		assert.equal(Run.RootNames[0], "fs/observed");
		assert.equal(Run.Returned, undefined);
		assert.ok(Run.State !== undefined);
		assert.deepEqual(Run.Lines, [
			"monitor: activated (domain=workspace_monitor, checksets=4)",
		]);
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

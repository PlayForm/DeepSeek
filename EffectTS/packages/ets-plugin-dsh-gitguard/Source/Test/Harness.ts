// Source/Test/Harness.ts - the shared test harness for the GIT-GUARD tests:
// the fake ctx (ctx listener capture for the tools/pre-execute waterfall, a
// DISTINCT root object, reflect.provide capture, the effect runner, logger
// capture + the fs seam) + the REAL @playform/plugin-dsh-gitguard apply from
// its built Target + the REAL @playform/ets-plugin-dsh-factory instance from its
// built Target (the guard's exclusion match runs on the factory's own Match)
// - the family fake-ctx + real-factory harness pattern, written ONCE per
// package and imported by every test folder. Each folder process gets a
// fresh set, so every folder is standalone-green and the aggregate replays
// the same seams per folder.
//
// Standalone selfcheck: `node Target/Test/Harness.js --selfcheck` runs the
// counter through one deliberate pass + one deliberate failure and exits 0
// only when both are counted exactly, then proves the fake ctx actually
// wires the plugin (the vacuously-green backstop for every folder's
// fixture).
//
// NO FAKE CLOCK: the guard has no clock dependency at all - every assertion
// is on the classification, the listener capture, and the ledger lines.
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

// -- the suite-level fixtures (fresh per folder process) --

export const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "gitguard-smoke-"));
export const Ledger = Path.join(Root, "gitguard.log");

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
 * ctx.reflect.provide; the stub context is used once and discarded).
 */
export const Furnace: any = new FactoryClass({
	reflect: { provide: () => undefined },
} as any);

/**
 * The fake fs: writeText/readText RECORD then THROW - the guard must never
 * touch file content (the throw makes a violation fail loud instead of
 * passing silently).
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
 * only root capture, so a registration made on the plugin ctx instead of the
 * root cannot pass the root-identity assertions - and the guard's
 * tools/pre-execute listener must sit on the plugin ctx, NOT the root),
 * ctx.on() captures into a SEPARATE map (the factory's loader/volatile-update
 * listener lands there alongside the guard's waterfall listener),
 * reflect.provide captures any service registration (the guard registers
 * none), effect runs its setup immediately and records the disposer.
 */
export const Make = (Raw: any, Attach?: (Context: any, Run: any) => void): any => {
	const Listeners: any = {};
	const CtxListeners: any = {};
	const Lines: string[] = [];
	const Warns: string[] = [];
	const Provided: any = {};
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
		Raw,
		Fs,
	};
	// The optional pre-apply attachment.
	Attach?.(Context, Run);
	Run.Returned = (Plugin.apply as any)(Context, Raw);
	Run.State = Context.__pluginDshGitguardState;
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
 * Fire one tools/pre-execute dispatch through the captured listener, with a
 * recording `next()`. Returns the listener's decision.
 */
export const Fire = async (Run: any, Payload: unknown): Promise<any> => {
	const Called: number[] = [];
	const Next = async () => {
		Called.push(1);
		return { decision: "allow", passed: true };
	};
	const Decision = await Run.CtxListeners["tools/pre-execute"](Payload, Next);
	Decision.__nextCalled = Called.length;
	return Decision;
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
		assert.equal(Run.Returned, undefined);
		assert.deepEqual(Run.RootNames, []);
		assert.equal(typeof Run.CtxListeners["tools/pre-execute"], "function");
		assert.ok(Run.State !== undefined);
		assert.deepEqual(Run.Lines, ["gitguard: activated (strict=false, denyPatterns=23, allowPatterns=7)"]);
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

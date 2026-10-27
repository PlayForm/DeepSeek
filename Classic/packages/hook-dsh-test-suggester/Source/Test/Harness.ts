// Source/Test/Harness.ts - the shared test harness for the TEST-SUGGESTER
// tests: the fake ctx (ctx listener capture, reflect.provide capture, the
// effect runner, the logger capture, the fs capture that must stay untouched,
// the distinct root seam) + the REAL @playform/plugin-dsh-factory instance
// from its built Target + the REAL test-suggester apply from its built
// Target - the family fake-ctx + real-factory harness pattern, written ONCE
// per package and imported by every test folder. Each folder process gets a
// fresh set, so every folder is standalone-green.
//
// Standalone selfcheck: `node Target/Test/Harness.js --selfcheck` runs the
// counter through one deliberate pass + one deliberate failure and exits 0
// only when both are counted exactly, then proves the fake ctx actually
// wires the plugin (the vacuously-green backstop for every folder's
// fixture).
//
// NO FAKE CLOCK: the plugin has no clock dependency at all.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import { fileURLToPath } from "node:url";
import Plugin from "../../Target/Library.js";
import FactoryClass from "../../../plugin-dsh-factory/Target/Library.js";

export { Plugin };

/**
 * The REAL package cwd the judged relative paths resolve against: the pack
 * mixes package-relative targets (`README.md`, `SCHEME.md`), so the fixture
 * cwd is a package that actually carries them (hook-dsh-ccr) instead of the
 * repo root.
 */
const Package = fileURLToPath(new URL("../../../hook-dsh-ccr/", import.meta.url));

/**
 * The per-folder counter: `N` = passing checks, `F` = failing checks.
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
 * One check = the source suite's ok group. A throw inside counts the whole
 * group failed - every later check still runs, and Finish turns any failure
 * into a non-zero exit for the runner.
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
 * The async variant of Check, for folders whose assertions await.
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

// -- the suite-level fixtures (fresh per folder process) --

/**
 * The fresh temp home: every `~`-prefixed path (the pack user layer, the
 * ledger defaults) resolves inside it, so no folder ever reads or writes the
 * real ~/.dsh. The reconciliation itself writes nothing at all - it reads the
 * package tree with node:fs only.
 */
export const Home = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "test-suggester-home-"));
process.env["HOME"] = Home;

export const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "test-suggester-smoke-"));
export const Ledger = Path.join(Root, "test-suggester.log");

/**
 * Remove the durable ledger file: every scenario starts from an empty ledger.
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
 * smoke does - the stub context is used once and discarded).
 */
export const Furnace: any = new FactoryClass({
	reflect: { provide: () => undefined },
} as any);

/**
 * The fake fs: every method RECORDS then THROWS - the suggester is read-only
 * by design and must never touch the fs; a violation fails loud instead of
 * passing silently (the purity backstop).
 */
export const FakeFs = (): any => {
	const Fs: any = {
		writes: [] as unknown[][],
		reads: [] as unknown[],
		resolved: [] as string[],
		stats: [] as unknown[],
	};
	Fs.resolve = async (P: string) => {
		Fs.resolved.push(P);
		throw new Error("resolve must never be called");
	};
	Fs.stat = async (...Parts: unknown[]) => {
		Fs.stats.push(Parts);
		throw new Error("stat must never be called");
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
 * The fake ctx: the ctx listener capture is the ONLY registration surface
 * (this hook registers on the plugin ctx, never on the root), reflect.provide
 * captures the service registrations, the effect runner executes immediately
 * and records disposers, get() resolves through the context properties, and
 * the root is a DISTINCT object.
 */
export const Make = (Raw: any): any => {
	const CtxListeners: any = {};
	const Lines: string[] = [];
	const Warns: string[] = [];
	const Provided: any = {};
	const Effects: string[] = [];
	const Disposers: Array<() => void> = [];
	const Fs = FakeFs();
	const RootObj: any = { on: () => () => true };
	let Context: any;
	Context = {
		pluginFactory: Furnace,
		workingDirectory: { get: () => Package },
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
		root: RootObj,
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
		Root: RootObj,
		CtxListeners,
		Lines,
		Warns,
		Provided,
		Effects,
		Disposers,
		Raw,
		Fs,
	};
	Run.Returned = (Plugin.apply as any)(Context, Raw);
	Run.State = Context.__testSuggesterState;
	return Run;
};

/**
 * The raw-config shape the loader hands to apply: volatile fields arrive as
 * `{ get }` cells. Build one via the plugin's schema.
 */
export const Validate = (Raw: Record<string, unknown>): any =>
	(Plugin.Config as unknown as (Raw: Record<string, unknown>) => any)({ ...Raw });

/**
 * The standard enabled mount with a tuned gate (the pack floor governs).
 */
export const Setup = (Config: Record<string, unknown> = {}): any => {
	rm();
	return Make(Validate({ logFile: Ledger, threshold: 0.5, ...Config }));
};

/**
 * Fire one tools/post-execute through the captured ctx listener. `Decision`
 * is what the downstream `next()` resolves to (the waterfall's tail).
 */
export const Call = async (
	Run: any,
	Name: string,
	Arguments: Record<string, unknown>,
	Agent: unknown = { agent: { id: "agent-a" } },
	Decision: any = { kind: "allow" },
): Promise<any> =>
	Run.CtxListeners["tools/post-execute"](
		{ name: Name, arguments: Arguments, agent: Agent },
		undefined,
		async () => Decision,
	);

/**
 * Fire one agent/pre-step (the per-turn reset): the step ends with a user
 * message by default.
 */
export const PreStep = async (
	Run: any,
	Agent: unknown = { agent: { id: "agent-a" } },
	Messages: { role: string }[] = [{ role: "user" }],
): Promise<any> =>
	Run.CtxListeners["agent/pre-step"]({ agent: Agent, messages: Messages }, async () => ({
		kind: "allow",
	}));

/**
 * The volatile-cell write symbol (cosmokit): the loader's hot-edit path
 * commits a new value into a `{ get }` cell through it.
 */
const Write = Symbol.for("cosmokit.volatile.write");

/**
 * Commit a new value into a volatile cell WITHOUT firing the loader event -
 * the caller then dispatches the captured loader/volatile-update listener.
 */
export const Flip = (CellValue: unknown, New: unknown): void => {
	const Cell = CellValue as { [Write]?: (Value: unknown) => unknown };
	if (typeof Cell?.[Write] !== "function") {
		throw new Error("Flip: not a volatile cell (no cosmokit write symbol)");
	}
	Cell[Write](New);
};

/**
 * The volatile cell of the raw config for one key (the flip target).
 */
export const Volatile = (Run: any, Key: string): unknown => Run.Raw[Key];

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
	// vacuously-green backstop for every folder's fixture).
	rm();
	const Run = Make(Validate({ logFile: Ledger, enabled: true }));
	Check(Count, "selfcheck: the fake ctx registers the plugin's apply-time wiring", () => {
		assert.equal(Run.Returned, undefined);
		assert.ok(Run.CtxListeners["tools/post-execute"] instanceof Function);
		assert.ok(Run.CtxListeners["agent/pre-step"] instanceof Function);
		assert.ok(Run.State !== undefined);
		assert.ok(
			Run.Lines.includes("test-suggester: activated (bundle 0.3.0, intents 2, threshold 0.75)"),
		);
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

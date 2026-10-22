// Source/Test/Harness.ts - the shared test harness for the WORKSPACE-GOVERN
// tests: the fake ctx (the ctx listener capture for the two waterfall
// listeners, reflect.provide capture, logger capture, the throwing fs) + the
// REAL @playform/plugin-dsh-factory instance from its built Target + the
// REAL workspace-govern apply from its built Target - the family fake-ctx +
// real-factory harness pattern, written ONCE per package and imported by
// every test folder. Each folder process gets a fresh set, so every folder
// is standalone-green and the aggregate replays the same seams per folder.
//
// Standalone selfcheck: `node Target/Test/Harness.js --selfcheck` runs the
// counter through one deliberate pass + one deliberate failure and exits 0
// only when both are counted exactly, then proves the fake ctx actually
// wires the plugin (the vacuously-green backstop for every folder's
// fixture).
//
// NO CLOCK: the govern gate has no time dependency - decisions are sequenced
// by the plugin's own monotonic counter (the no-wall-clock rule), so the
// harness needs no time seam.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import Plugin from "../../Target/Library.js";
import FactoryClass from "../../../plugin-dsh-factory/Target/Library.js";

export { Plugin };

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
 * PASS count for the runner's `N PASS - <Name>` line.
 */
export const Finish = (Count: Counter, Name: string): number => {
	if (Count.F !== 0) {
		throw new Error(`${Name}: ${Count.F} failed check(s)`);
	}
	return Count.N;
};

// -- the suite-level fixtures (fresh per folder process) --

export const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "workspace-govern-smoke-"));
export const Ledger = Path.join(Root, "govern.log");

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
 * smoke does - the Service base constructor registers through
 * ctx.reflect.probe; the stub context is used once and discarded).
 */
export const Furnace: any = new FactoryClass({
	reflect: { provide: () => undefined },
} as any);

/**
 * The throwing fs: read/write RECORD then THROW - the gate reads no file
 * content (the purity rule); a violation fails loud instead of passing
 * silently.
 */
export const FakeFs = (): any => {
	const Fs: any = {
		writes: [] as unknown[],
		reads: [] as unknown[],
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
 * A gate proposal record (the attached form: the operate family's
 * arguments.proposal, the strict reading). Every field explicit, none
 * guessed.
 */
export const Proposal = (Over: Record<string, unknown> = {}): Record<string, unknown> => ({
	operation: "op:1",
	parent: "(root)",
	category: "tool",
	kind: "write",
	target: "/repo/src/a.ts",
	contribution: "edit the workspace",
	scope: [],
	holder: "agent-a",
	declared: true,
	...Over,
});

/**
 * The fake ctx: the ROOT object is DISTINCT from the ctx (the govern gate
 * registers NO root listener, so RootNames stays empty), ctx.on() captures
 * the two waterfall listeners, reflect.provide captures the service
 * registrations, effect records, get() resolves through the context
 * properties.
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
	const Root: any = {
		on: (Name: string, Listener: unknown) => {
			RootNames.push(Name);
			Listeners[Name] = Listener;
			return () => true;
		},
		emit: () => true,
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
	Run.Returned = (Plugin.apply as any)(Context, Raw);
	Run.State = Context.__hookDshWorkspaceGovernState;
	return Run;
};

/**
 * The real-config shape the loader hands to apply: volatile fields arrive as
 * `{ get }` cells. Build one via the plugin's schema.
 */
export const Validate = (Raw: Record<string, unknown>): any =>
	(Plugin.Config as unknown as (Raw: Record<string, unknown>) => any)({ ...Raw });

/**
 * A gate exec for the waterfall listeners (the tool call shape the gate
 * reads).
 */
export const Exec = (Over: Record<string, unknown> = {}): Record<string, unknown> => ({
	name: "write",
	callId: "c1",
	rootCallId: "c1",
	arguments: { path: "/repo/src/a.ts" },
	agent: { id: "agent-a" },
	...Over,
});

/**
 * A next() stub that returns a sentinel downstream decision object.
 */
export const Next = (): { decision: unknown; next: (Value?: unknown) => unknown } => {
	let Called = 0;
	const downstream = { kind: "pass-through" };
	return {
		decision: downstream,
		next: (Value?: unknown) => {
			Called += 1;
			return Value ?? downstream;
		},
	};
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
	// The seam selfcheck: the fake ctx actually wires the plugin.
	rm();
	const Run = Make(Validate({ logFile: Ledger, enabled: true }));
	Check(Count, "selfcheck: the fake ctx registers the plugin's apply-time wiring", () => {
		assert.equal(Run.Returned, undefined);
		assert.ok(Run.State !== undefined);
		assert.ok(Run.Provided["workspaceGovern"] !== undefined);
		assert.deepEqual(Run.RootNames, []);
		assert.deepEqual(Object.keys(Run.CtxListeners), [
			"loader/volatile-update",
			"tools/pre-execute",
			"tools/post-execute",
		]);
		assert.deepEqual(Run.Lines, ["govern: activated (tools=4, policy=0)"]);
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

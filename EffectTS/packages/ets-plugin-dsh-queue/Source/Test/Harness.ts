// Source/Test/Harness.ts - the shared test harness for the SUBAGENT-QUEUE
// tests: the fake ctx (root listener capture with a DISTINCT root object,
// the ctx listener capture, reflect.provide capture, the effect runner, the
// tools.register capture, the dshRoute seam, logger capture + the fs seam)
// + the REAL @playform/plugin-dsh-queue apply from its built Target + the
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
// NO FAKE CLOCK: the queue stamps Date.now() for queuedAt/dispatchedAt
// bookkeeping only; no assertion depends on a wall-clock value (the
// sequence `queue-<n>` is the plugin's own monotonic counter - the
// no-wall-clock rule). The only timing assertion is on that counter.
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

export const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "queue-smoke-"));
export const Ledger = Path.join(Root, "queue.log");

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
 * The fake fs: resolve returns a stable target for the path, stat returns
 * the seeded version (undefined when the path was not seeded - an absent
 * target), and writeText/readText RECORD then THROW - the queue must never
 * touch file content (the queue registers no fs/observed listener and never
 * reads or writes a file outside its own ledger; the throw makes a violation
 * fail loud instead of passing silently).
 */
export const FakeFs = (): any => {
	const Fs: any = {
		files: {},
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
		return Fs.files[Target.displayPath] === undefined
			? undefined
			: { version: Fs.files[Target.displayPath], type: "file" };
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
 * SEPARATE map (the factory's loader/volatile-update listener lands there),
 * reflect.provide captures the dshQueue service registration, tools.register
 * captures the queue_enqueue/queue_status definitions, effect runs its setup
 * immediately and records the disposer, get() resolves through the context
 * properties (the dshRoute probe reads it at dispatch time).
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
	const Tools: any[] = [];
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
		tools: {
			register: (Definition: any) => {
				Tools.push(Definition);
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
		Tools,
		Raw,
		Fs,
	};
	// The optional pre-apply attachment: the dshRoute seam must be in place
	// BEFORE apply when a scenario wants the routed dispatch probe to find it.
	Attach?.(Context, Run);
	Run.Returned = (Plugin.apply as any)(Context, Raw);
	Run.State = Context.__pluginDshQueueState;
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

/**
 * The fake HARNESS subagent service (`ctx.subagents`): records every
 * `startActivation` spec verbatim, hands back a CONTROLLABLE result, and
 * exposes each activation's abort signal. A scenario settles a child by
 * resolving its result explicitly - no sleeps, no timers, no wall clock.
 */
export const FakeSubagents = (): any => {
	const Calls: any[] = [];
	const Results: Array<{ resolve: (Value: unknown) => void; reject: (Error: unknown) => void }> = [];
	const Disposed: string[] = [];
	return {
		calls: Calls,
		results: Results,
		disposed: Disposed,
		startActivation: async (Spec: any) => {
			Calls.push(Spec);
			let Settle: any = {};
			const Result = new Promise((Resolve, Reject) => {
				Settle = { resolve: Resolve, reject: Reject };
			});
			Results.push(Settle);
			const Child = `child-${Calls.length}`;
			return {
				childId: Child,
				messageId: `message-${Calls.length}`,
				result: Result,
				dispose: async () => {
					Disposed.push(Child);
				},
			};
		},
	};
};

/**
 * The fake HARNESS agent registry (`ctx.agents`): `currentInitiator` returns
 * the seeded parent (the exact object the spawn must hand the service), and
 * `get` answers from a MUTABLE live set - a scenario removes a child to model
 * the restart's dead agent.
 */
export const FakeAgents = (Parent: any = { id: "parent" }): any => {
	const Live = new Set<string>();
	return {
		live: Live,
		parent: Parent,
		currentInitiator: () => Parent,
		get: (Id: string) => (Live.has(Id) ? { id: Id } : undefined),
	};
};

/**
 * The automation mount: the enabled plugin plus the fake subagent service and
 * the fake agent registry, both attached BEFORE apply (the probes read the
 * context at dispatch time).
 *
 * THE POLICY FIXTURE (D6): the mount opts the outer policy gate OPEN
 * (`policy.spawn: "auto"`) so the spawn scenarios keep exercising the launch
 * itself; the gate's approve posture and its precedence over `autoSpawn` are
 * the Policy-Defaults folder's scenarios. A caller passes its own `policy`
 * to model a closed gate.
 */
export const Automation = (
	Config: Record<string, unknown> = {},
	Agents: any = FakeAgents(),
	Subagents: any = FakeSubagents(),
): { Run: any; Service: any; Subagents: any; Agents: any } => {
	rm();
	const Run = Make(
		Validate({
			logFile: Ledger,
			enabled: true,
			autoSpawn: true,
			policy: { spawn: "auto" },
			...Config,
		}),
		(Context: any) => {
			Context.subagents = Subagents;
			if (Agents !== undefined) {
				Context.agents = Agents;
			}
		},
	);
	return { Run, Service: Run.Context.dshQueue, Subagents, Agents };
};

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
		assert.ok(Run.Provided["dshQueue"] !== undefined);
		assert.deepEqual(Run.Tools.map((T: any) => T.name), ["queue_enqueue", "queue_status"]);
		assert.deepEqual(Run.Lines, [
			`plugin-dsh-queue: activated (bundle ${process.env.VERSION_PACKAGE}, capacity=main=10 child=2, routedDispatch=true)`,
		]);
		assert.ok(Run.State !== undefined);
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

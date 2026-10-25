// Source/Test/Harness.ts - the shared test harness for the BATCH-DECISION
// hook tests: the fake ctx (ctx listener capture, emit capture, the
// reflect.provide capture, logger capture, the throwing fs purity seam, the
// DISTINCT root object with its own on/emit capture) + the REAL
// @play_written_as @playform/plugin-dsh-factory instance from its built
// Target + the REAL batch-decision apply from its built Target - the family
// fake-ctx + real-factory harness pattern, written ONCE per package and
// imported by every test folder. Each folder process gets a fresh set, so
// every folder is standalone-green.
//
// Standalone selfcheck: `node Target/Test/Harness.js --selfcheck` runs the
// counter through one deliberate pass + one deliberate failure and exits 0
// only when both are counted exactly, then proves the fake ctx actually
// wires the plugin (the vacuously-green backstop for every folder's
// fixture).
//
// THE FAKE CLOCK: the State carries the `Now` clock seam - every time read
// goes through it, so the expiry and TTL tests never touch the wall clock.
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
 * batch_decision tool's execute is async).
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

export const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "batch-decision-smoke-"));
export const Ledger = Path.join(Root, "batch-decision.log");

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
 * The ledger file lines that carry the needle (after the `[ISO] ` stamp).
 */
export const LedgerWith = (Needle: string): string[] =>
	LedgerLines().filter((Line) => Line.includes(Needle));

/**
 * The REAL factory instance (constructed the way the factory's own smoke
 * does - the Service base registers through ctx.reflect.provide).
 */
export const Furnace: any = new FactoryClass({
	reflect: { provide: () => undefined },
} as any);

/**
 * The canonical BatchProposal fixture, with the expiry tied to the fake
 * clock (the clock starts at 1_000_000; the default expiresAt is
 * Clock.Now + 60_000 = 1_060_000, confidence 0.9).
 */
export const Proposal = (Overrides: Record<string, unknown> = {}): any => ({
	id: "prop-1",
	intent: "version-bump",
	targets: [{ path: "package.json", version: "v1", why: "the version bump" }],
	operations: [],
	preview: { entries: [], changes: 0, skipped: [] },
	digest: "digest-1",
	revision: 1,
	expiresAt: 1_060_000,
	confidence: 0.9,
	...Overrides,
});

/**
 * The fake ctx: the ROOT object is DISTINCT from the ctx (its on/emit are
 * the only root captures), ctx.on captures into a SEPARATE map, ctx.emit
 * records the hook's own emissions, get() resolves through the pre-attached
 * services, and the fs SEAM RECORDS then THROWS - the hook never touches
 * file content (it is the decision maker, never a writer).
 */
export const Make = (Raw: any, Attach?: (Context: any, Run: any) => void): any => {
	const CtxListeners: any = {};
	const RootListeners: any = {};
	const RootEmits: any[][] = [];
	const Emits: any[][] = [];
	const Lines: string[] = [];
	const Warns: string[] = [];
	const Provided: any = {};
	const Services: Record<string, unknown> = {};
	const Registered: any[] = [];
	const Gets: string[] = [];
	const Fs: any = {
		reads: [] as string[],
		writes: [] as string[],
	};
	const ThrowingFs: any = {
		...Fs,
		readText: async (T: any) => {
			Fs.reads.push(T?.displayPath ?? String(T));
			throw new Error("readText must never be called");
		},
		writeText: async (T: any) => {
			Fs.writes.push(T?.displayPath ?? String(T));
			throw new Error("writeText must never be called");
		},
	};
	const Root: any = {
		on: (Name: string, Listener: unknown) => {
			RootListeners[Name] = Listener;
			return () => true;
		},
		emit: (Name: string, ...Args: unknown[]) => {
			RootEmits.push([Name, ...Args]);
		},
	};
	const Clock = { Now: 1_000_000 };
	let Context: any;
	Context = {
		pluginFactory: Furnace,
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
		emit: (Name: string, ...Args: unknown[]) => {
			Emits.push([Name, ...Args]);
		},
		get: (Name: string) => {
			Gets.push(Name);
			return Services[Name];
		},
		tools: {
			register: (Definition: unknown) => {
				Registered.push(Definition);
				return () => true;
			},
		},
		fs: ThrowingFs,
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
		RootListeners,
		RootEmits,
		Emits,
		CtxListeners,
		Lines,
		Warns,
		Provided,
		Services,
		Registered,
		Gets,
		Fs: ThrowingFs,
		Clock,
	};
	Attach?.(Context, Run);
	Run.Returned = (Plugin.apply as any)(Context, Raw);
	Run.State = Context.__hookDshBatchDecisionState;
	if (Run.State !== undefined) {
		Run.State.Now = () => Clock.Now;
	}
	return Run;
};

/**
 * The real-config shape the loader hands to apply: volatile fields arrive as
 * `{ get }` cells. Build one via the plugin's schema.
 */
export const Validate = (Raw: Record<string, unknown>): any =>
	(Plugin.Config as unknown as (Raw: Record<string, unknown>) => any)({ ...Raw });

/**
 * The captured batch_decision tool definition.
 */
export const Tool = (Run: any): any => Run.Registered.find((D: any) => D.name === "batch_decision");

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
	const Run = Make(Validate({ logFile: Ledger, enabled: true, autoApprove: "on", allowlist: ["version-bump"] }));
	Check(Count, "selfcheck: the fake ctx registers the listener, the tool and the state", () => {
		assert.deepEqual(Object.keys(Run.CtxListeners), ["loader/volatile-update", "batch/proposed"]);
		assert.equal(Tool(Run).name, "batch_decision");
		assert.ok(Run.State !== undefined);
		assert.deepEqual(Run.Lines, [
			"hook-dsh-batch-decision: activated (bundle 0.2.0, autoApprove=on, allowlist=1)",
		]);
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

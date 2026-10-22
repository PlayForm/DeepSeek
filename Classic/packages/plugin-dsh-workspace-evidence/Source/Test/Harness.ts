// Source/Test/Harness.ts - the shared test harness for the WORKSPACE-EVIDENCE
// tests: the fake ctx (registration capture with a DISTINCT root object, the
// ctx listener capture, reflect.provide capture, the effect runner, the
// logger capture, the fs purity capture, the storageDomain probe) + the REAL
// @playform/plugin-dsh-factory instance from its built Target + the REAL
// workspace-evidence apply from its built Target - the family fake-ctx +
// real-factory harness pattern, written ONCE per package and imported by
// every test folder.
//
// Standalone selfcheck: `node Target/Test/Harness.js --self` runs the counter
// through one deliberate pass + one deliberate failure and exits 0 only when
// both are counted exactly, then proves the fake ctx actually wires the
// plugin (the vacuously-green backstop).
//
// NO FAKE CLOCK: the sequence is the service's own monotonic counter (the
// no-wall-clock rule); every timing assertion is on the counter.
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
 * One check = the source suite's ok group.
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
 * End-of-folder guard: any failed assertion is a folder failure.
 */
export const Finish = (Count: Counter, Name: string): number => {
	if (Count.F !== 0) {
		throw new Error(`${Name}: ${Count.F} failed check(s)`);
	}
	return Count.N;
};

// -- the suite-level fixtures (fresh per folder process) --

export const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "workspace-evidence-smoke-"));
export const Ledger = Path.join(Root, "evidence.log");

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
 * smoke does).
 */
export const Furnace: any = new FactoryClass({
	reflect: { provide: () => undefined },
} as any);

/**
 * The fake fs: writeText/readText RECORD then THROW - the evidence plugin
 * must never touch file content (it reads only events and explicit calls).
 */
export const FakeFs = (): any => {
	const Fs: any = {
		writes: [] as unknown[][],
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
 * The fake storage facility: the open capture (the spec the service
 * declared), per-table maps, and an optional failure mode for the loud-open
 * test.
 */
export const FakeStorage = (Options: { failOpen?: boolean } = {}): any => {
	const Store: any = {
		spec: undefined as any,
		tables: new Map<string, Map<string, unknown>>(),
		failOpen: Options.failOpen === true,
	};
	Store.facility = {
		open: async (Specification: any) => {
			if (Store.failOpen) {
				throw new Error("storage unavailable");
			}
			Store.spec = Specification;
			return {
				close: async () => {
					Store.closed = true;
				},
				table: (Name: string) => {
					if (!Store.tables.has(Name)) {
						Store.tables.set(Name, new Map());
					}
					const Rows = Store.tables.get(Name) as Map<string, unknown>;
					return {
						put: async (Key: string, Value: unknown) => {
							Rows.set(Key, Value);
						},
						entries: () => Rows.entries(),
						keys: () => Rows.keys(),
						get: (Key: string) => Rows.get(Key),
						delete: async (Key: string) => Rows.delete(Key),
						get size() {
							return Rows.size;
						},
					};
				},
			};
		},
	};
	/** Seed one record (the restart scenario: the store outlives the process). */
	Store.seed = (Name: string, Key: string, Value: unknown): void => {
		if (!Store.tables.has(Name)) {
			Store.tables.set(Name, new Map());
		}
		(Store.tables.get(Name) as Map<string, unknown>).set(Key, Value);
	};
	return Store;
};

/**
 * The fake ctx: the ROOT object is DISTINCT from the ctx (its on() is the
 * only root capture - the invalidation seam is registered through the
 * factory's Wire there), ctx.on() captures into a SEPARATE map, reflect.
 * provide captures the service registrations, effect runs its setup
 * immediately and records the disposer, get() resolves through the context
 * properties.
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
			info: (Message: string) => {
				Lines.push(Message);
			},
			warn: (Message: string) => {
				Warns.push(Message);
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
	// The optional pre-apply attachment: the storage facility must be in
	// place BEFORE apply runs (the effect probes at apply time).
	Attach?.(Context, Run);
	Run.Returned = (Plugin.apply as any)(Context, Raw);
	Run.State = Context.__pluginDshWorkspaceEvidenceState;
	return Run;
};

/**
 * The real-config shape the loader hands to apply: volatile fields arrive as
 * `{ get }` cells. Build one via the plugin's schema.
 */
export const Validate = (Raw: Record<string, unknown>): any =>
	(Plugin.Config as unknown as (Raw: Record<string, unknown>) => any)({ ...Raw });

/**
 * Fire one fs/observed event through the root listener (the actor default is
 * a plain foreign actor object - never the service's own).
 */
export const Fire = (
	Run: any,
	Path: string,
	Kind: string = "present",
	Actor: any = { agent: { id: "agent-a" } },
): void => {
	Run.Listeners["fs/observed"](
		Path === null ? null : { displayPath: Path, targetKey: Path },
		Kind === null ? null : { kind: Kind, version: "1" },
		Actor,
	);
};

/**
 * A captured info line that carries the needle.
 */
export const LinesWith = (Run: any, Needle: string): string[] =>
	Run.Lines.filter((Line: string) => Line.includes(Needle));

/**
 * The ledger file lines that carry the needle (after the `[ISO] ` stamp).
 */
export const LedgerWith = (Needle: string): string[] =>
	LedgerLines().filter((Line: string) => Line.includes(Needle));

/**
 * Open the evidence storage domain against a fake facility (the body of the
 * effect registers; the fake ctx has no await-able effect, so the tests
 * drive the module directly - the Monitors-Persist precedent).
 */
export const OpenStorage = async (Run: any, Facility: any): Promise<void> => {
	const Storage = await import("../../Target/Function/Storage.js");
	await Storage.default(Run.State, Facility);
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
	// The seam selfcheck: the fake ctx actually wires the plugin.
	rm();
	const Run = Make(Validate({ logFile: Ledger, enabled: true }));
	Check(Count, "selfcheck: the fake ctx registers the plugin's apply-time wiring", () => {
		assert.equal(Run.Returned, undefined);
		assert.ok(Run.Provided.workspaceEvidence !== undefined);
		assert.ok(Run.State !== undefined);
		assert.deepEqual(Run.RootNames, ["fs/observed"]);
		assert.deepEqual(Run.Effects, ["evidence-storage"]);
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

// Source/Test/Harness.ts - the shared test harness for the PATTERN service
// tests: the fake ctx (reflect.provide capture for the Service base, the
// logger capture, the effect runner, the probe-once `get`) + the REAL
// PatternService class from its built Target - the family fake-ctx +
// real-built-library harness pattern, written ONCE per package and imported
// by every test folder. Each folder process gets a fresh set, so every folder
// is standalone-green.
//
// THE STORE SEAMS: the JSON fallback uses the REAL node fs/promises against
// `~/.dsh/pattern/registry.json` - the harness redirects $HOME to a fresh OS
// temp directory BEFORE any construction, so the service never reads or
// writes the user's real home directory, and every scenario starts from an
// empty (or explicitly seeded) store. The storage-domain PRIMARY is exercised
// with FakeStorage (the authority/evidence fake-storage pattern: the open
// capture, the map-backed tables, the seed hook and the version fence) - the
// facility is attached to the fake ctx BEFORE construction.
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
 * snapshot Save/Load paths, the storage domain).
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
 * Flush the detached constructor promise queue (the JSON fallback's Load runs
 * detached, so the restore line lands on a later microtask/macrotask). The
 * storage domain's chain is awaited through the service's own Flush instead.
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
 * ctx.reflect.provide; the logger captures the service's ledger lines; the
 * effect runner executes its setup immediately and records the disposer; get
 * resolves through the context properties (the storage facility probe).
 */
export const Make = (
	Knobs: Record<string, unknown> = {},
	Attach?: (Context: any, Run: any) => void,
): any => {
	const Lines: string[] = [];
	const Warns: string[] = [];
	const Provided: any = {};
	const Effects: string[] = [];
	const Disposers: Array<() => void> = [];
	const Context: any = {
		logger: {
			info: (M: string) => {
				Lines.push(M);
			},
			warn: (M: string) => {
				Warns.push(M);
			},
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
		reflect: {
			provide: (Name: string, Value?: unknown) => {
				Provided[Name] = Value ?? true;
				Context[Name] = Value;
				return () => true;
			},
		},
	};
	const Run: any = { Context, Lines, Warns, Provided, Effects, Disposers };
	// The optional pre-construction attachment: the storage facility must be
	// in place BEFORE the constructor probes it.
	Attach?.(Context, Run);
	Run.Service = new PatternService(Context, Knobs);
	return Run;
};

/**
 * The fake storage facility (the authority/evidence fake-storage pattern):
 * the open capture (the spec the service declared), the map-backed tables,
 * a seed hook for the restart scenarios, and the VERSION FENCE - the real
 * library enforces exact version equality per record (single layout) and a
 * mismatched stamp is the `version-mismatch` failure, so the fake refuses an
 * open whose declared version differs from the stored one.
 */
export const FakeStorage = (Options: { failOpen?: boolean; version?: number } = {}): any => {
	const Store: any = {
		spec: undefined as any,
		version: Options.version ?? 1,
		tables: new Map<string, Map<string, unknown>>(),
		writes: [] as [string, string][],
		failOpen: Options.failOpen === true,
		closed: false,
	};
	Store.facility = {
		open: async (Specification: any) => {
			switch (true) {
				case Store.failOpen:
					throw new Error("storage unavailable");
				case Specification.version !== Store.version:
					throw new Error(
						`version-mismatch: stored ${Store.version}, declared ${Specification.version}`,
					);
				default:
			}
			Store.spec = Specification;
			return {
				name: Specification.name,
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
							Store.writes.push([Name, Key]);
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
		assert.deepEqual(Run.Lines, ["pattern: activated (seeded 4 patterns) (logFile ~/.dsh/playform/plugin-dsh-pattern.log)"]);
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

// Source/Test/Harness.ts - the shared test harness for the WORKSPACE-JOURNAL
// tests: the fake ctx (root listener capture with a DISTINCT root object, the
// ctx listener capture, reflect.provide capture, the effect runner, logger
// capture + the fs/storage seams) + the REAL @playform/plugin-dsh-factory
// instance from its built Target + the REAL workspace-journal apply from its
// built Target - the family fake-ctx + real-factory harness pattern, adapted
// from the workspace-observe reference harness. Each folder process gets a
// fresh set, so every folder is standalone-green.
//
// NO FAKE CLOCK: the journal has no timer dependency - the batch's `at` is a
// record field, the lifecycle is the state machine, so the harness needs no
// time seam.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import Plugin from "../../Target/Library.js";
import FactoryClass from "../../../plugin-dsh-factory/Target/Library.js";

export { Plugin };

/** The per-folder counter: `N` = passing checks, `F` = failing checks. */
export type Counter = { N: number; F: number };

/** A fresh counter for one test folder. */
export const MakeCounter = (): Counter => ({ N: 0, F: 0 });

/** One check = one assert group; a throw counts the group failed. */
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

/** The async variant of Check. */
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

/** End-of-folder guard: any failed assertion is a folder failure. */
export const Finish = (Count: Counter, Name: string): number => {
	if (Count.F !== 0) {
		throw new Error(`${Name}: ${Count.F} failed check(s)`);
	}
	return Count.N;
};

// -- the suite-level fixtures (fresh per folder process) --

export const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "workspace-journal-smoke-"));
export const Ledger = Path.join(Root, "journal.log");

/** Remove the durable ledger file: every scenario starts empty. */
export const rm = (): void => {
	try {
		FileSystem.rmSync(Ledger);
	} catch {}
};

/** The durable ledger file's lines (`[ISO] message`). */
export const LedgerLines = (): string[] =>
	(() => {
		try {
			return FileSystem.readFileSync(Ledger, "utf8").split("\n").filter(Boolean);
		} catch {
			return [];
		}
	})();

/** The REAL factory instance (constructed the way the factory's smoke does). */
export const Furnace: any = new FactoryClass({
	reflect: { provide: () => undefined },
} as any);

/**
 * The fake fs: resolve returns a stable target, stat returns the seeded
 * version (undefined = absent), writeText RECORDS then returns a fresh
 * version (the journal's revert legitimately writes through the factory's
 * executor) - unless the path is in `staleOn`, where the write throws the
 * version-fence rejection. readText RECORDS then THROWS: the journal never
 * reads file content (the observe hook's B10 discipline).
 */
export const FakeFs = (Files: Record<string, string> = {}): any => {
	const Fs: any = {
		files: Files,
		staleOn: new Set<string>(),
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
	Fs.writeText = async (Target: any, _Content: string, Intent: any) => {
		Fs.writes.push([Target, _Content, Intent]);
		if (
			Fs.staleOn.has(Target.displayPath) &&
			(Intent as { kind?: string } | undefined)?.kind === "replaceIfVersion"
		) {
			throw new Error("FS_STALE_VERSION: target changed outside the batch");
		}
		return { version: `w${Fs.writes.length}` };
	};
	Fs.readText = async (...Parts: unknown[]) => {
		Fs.reads.push(Parts);
		throw new Error("readText must never be called");
	};
	return Fs;
};

/**
 * The fake storage facility: captures the declared domain spec, keeps
 * per-table maps, offers the read surface the recovery uses; an optional
 * failure mode for the loud-open test.
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
				close: async () => undefined,
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
 * The fake ctx: the ROOT object is DISTINCT from the ctx, ctx.on() captures
 * into a SEPARATE map, reflect.provide captures the service registrations,
 * effect runs its setup immediately and records the disposer, get() resolves
 * through the context properties.
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
	Attach?.(Context, Run);
	Run.Returned = (Plugin.apply as any)(Context, Raw);
	Run.State = Context.__hookDshWorkspaceJournalState;
	return Run;
};

/** The validated config shape the loader hands to apply (the schema call). */
export const Validate = (Raw: Record<string, unknown>): any =>
	(Plugin.Config as unknown as (Raw: Record<string, unknown>) => any)({ ...Raw });

/**
 * Flush the boot recovery pass: Apply queues its one-shot recover() in a
 * microtask; a macrotask boundary lets it fire exactly as it does live
 * (against the state as it stood at mount), so a test that opens batches
 * afterwards sees the ordinary lifecycle.
 */
export const Boot = async (): Promise<void> => {
	await new Promise((Resolve) => setImmediate(Resolve));
};

/** Fire one fs/observed event through the ROOT listener (a foreign actor). */
export const Fire = (
	Run: any,
	Path: string,
	Actor: any = { agent: { id: "agent-a" } },
): void => {
	Run.Listeners["fs/observed"](
		{ displayPath: Path, targetKey: Path },
		{ kind: "present", version: "1" },
		Actor,
	);
};

/** Fire a malformed event (a null target and a null observation). */
export const FireMalformed = (Run: any): void => {
	Run.Listeners["fs/observed"](null, null, undefined);
};

/** Open the journal storage domain against a fake facility (module-driven). */
export const OpenStorage = async (Run: any, Facility: any): Promise<void> => {
	const Storage = await import("../../Target/Function/Storage.js");
	await Storage.default(Run.State, Facility);
};

/** A batch record fixture. */
export const Batch = (Id: string, Files: string[]): any => ({
	batchId: Id,
	operation: "workspace.commit",
	parent: "",
	state: "applying",
	files: Files,
	progress: 0,
	reason: "",
	at: 1,
});

/** An entry record fixture (the revert data). */
export const Entry = (Id: string, Path: string, Content = "A"): any => ({
	batchId: Id,
	path: Path,
	state: "present",
	version: "1",
	content: Content,
	truncated: false,
	at: 1,
});

/** A captured info line that carries the needle. */
export const LinesWith = (Run: any, Needle: string): string[] =>
	Run.Lines.filter((L: string) => L.includes(Needle));

/** The ledger file lines that carry the needle (after the `[ISO] ` stamp). */
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
	rm();
	const Run = Make(Validate({ logFile: Ledger, enabled: true }));
	Check(Count, "selfcheck: the fake ctx registers the plugin's apply-time wiring", () => {
		assert.equal(Run.RootNames.length, 1);
		assert.equal(Run.RootNames[0], "fs/observed");
		assert.ok(Run.Provided["workspaceJournal"] !== undefined);
		assert.deepEqual(Run.Lines, ["journal: activated (domain=workspace_journal, maxBatches=200)"]);
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

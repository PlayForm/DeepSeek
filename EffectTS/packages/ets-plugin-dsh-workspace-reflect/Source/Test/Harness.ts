// Source/Test/Harness.ts - the shared test harness for the WORKSPACE-REFLECT
// tests: the fake ctx (root listener capture with a DISTINCT root object, the
// ctx listener capture, reflect.provide capture, the effect runner, logger
// capture + the fs seam) + the REAL @playform/ets-plugin-dsh-factory instance
// from its built Target + the REAL workspace-reflect apply from its built
// Target - the family fake-ctx + real-factory harness pattern, written ONCE
// per package and imported by every test folder. Each folder process gets a
// fresh set, so every folder is standalone-green and the aggregate replays
// the same seams per folder.
//
// The fs seam is a WORKING fake (unlike the observe/approve zero-write
// fakes): the reflective ops' ONLY write path is the factory's GuardedWrite,
// which ends in fs.writeText - the fake implements the replaceIfVersion
// version fence (a stale intent throws, a matching intent writes and bumps
// the version), so the conflict and applied paths run through the REAL
// factory code, not a mock of it.
//
// Standalone selfcheck: `node Target/Test/Harness.js --selfcheck` runs the
// counter through one deliberate pass + one deliberate failure and exits 0
// only when both are counted exactly, then proves the fake ctx actually
// wires the plugin (the vacuously-green backstop for every folder's
// fixture).
//
// NO FAKE CLOCK: the plugin has no clock dependency at all - the harness
// needs no time seam.
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

export const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "workspace-reflect-smoke-"));
export const Ledger = Path.join(Root, "reflect.log");

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
 * The WORKING fake fs: files are content strings, versions start at "1";
 * stat reports the version and the content size (the Observe size guard),
 * readText returns the content, and writeText implements the
 * replaceIfVersion fence - a stale intent throws a "version conflict"
 * error (Publish maps it to `conflict`), a matching intent writes, bumps
 * the version and returns the outcome. `FailWrites` forces every write to
 * throw with a message that is neither stale nor version-shaped (Publish
 * maps it to `outcome-unknown`).
 */
export const FakeFs = (
	Files: Record<string, string> = {},
	Options: { Versions?: Record<string, string>; FailWrites?: string } = {},
): any => {
	const Versions: Record<string, string> = { ...(Options.Versions ?? {}) };
	const Fs: any = {
		files: Files,
		versions: Versions,
		writes: [] as unknown[],
		reads: [] as string[],
		resolved: [] as string[],
		stats: [] as unknown[],
	};
	Fs.resolve = async (P: string) => {
		Fs.resolved.push(P);
		const Target = { targetKey: P, displayPath: P };
		return Target;
	};
	Fs.stat = async (Target: any) => {
		Fs.stats.push(Target);
		const Content = Fs.files[Target.displayPath];
		return Content === undefined
			? undefined
			: { version: Fs.versions[Target.displayPath] ?? "1", type: "file", size: Content.length };
	};
	Fs.readText = async (Target: any) => {
		const Content = Fs.files[Target.displayPath];
		if (Content === undefined) {
			throw new Error(`readText: no such file ${Target.displayPath}`);
		}
		Fs.reads.push(Target.displayPath);
		return Content;
	};
	Fs.writeText = async (Target: any, Content: string, Intent: any) => {
		Fs.writes.push({ target: Target.displayPath, content: Content, intent: Intent });
		const Fail = Fs.FailWrites ?? Options.FailWrites;
		if (Fail !== undefined) {
			throw new Error(Fail);
		}
		// An optional override of the fence's "current" version: the
		// conflict test needs the current version to differ from the
		// observed one, which cannot happen while the map is the single
		// source (Observe reads it right before the write).
		const Current = Fs.WriteVersionOverride ?? Fs.versions[Target.displayPath] ?? "1";
		if (
			Intent?.kind === "replaceIfVersion" &&
			String(Intent.version) !== Current
		) {
			throw new Error(
				`writeText: version conflict, intent ${Intent.version}, current ${Current}`,
			);
		}
		const Next = Number.isFinite(Number(Current)) ? String(Number(Current) + 1) : `${Current}~`;
		Fs.versions[Target.displayPath] = Next;
		Fs.files[Target.displayPath] = Content;
		return { version: Next, operation: "replaceIfVersion" };
	};
	return Fs;
};

/**
 * The fake ctx: the ROOT object is DISTINCT from the ctx (its on() is the
 * only root capture, so a registration made on the plugin ctx instead of the
 * root cannot pass the root-identity assertions), ctx.on() captures into a
 * SEPARATE map, reflect.provide captures the service registrations, effect
 * runs its setup immediately and records the disposer, get() resolves
 * through the context properties (the Carry probe reads `workspaceGraph`
 * here).
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
	// The optional pre-apply attachment: the fs content and the optional
	// workspaceGraph handle must be in place BEFORE apply runs.
	Attach?.(Context, Run);
	Run.Returned = (Plugin.apply as any)(Context, Raw);
	Run.State = Context.__pluginDshWorkspaceReflectState;
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
 * Seed the fake fs with files (a convenience for the Attach hook).
 */
export const Seed = (Files: Record<string, string>, Versions: Record<string, string> = {}) => (
	_Context: any,
	Run: any,
): void => {
	Run.Fs.files = { ...Files };
	Run.Fs.versions = { ...Versions };
};

/**
 * Attach a fake workspaceGraph handle (the Carry probe reads it through
 * ctx.get at use time, never through inject).
 */
export const Graph = (Calls: string[] = [], Throw?: string) => ({
	indexFile: async (P: string) => {
		Calls.push(P);
		if (Throw !== undefined) {
			throw new Error(Throw);
		}
		return { ok: true };
	},
	find: () => [],
	getNode: () => undefined,
});

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
		assert.equal(Run.RootNames.length, 0);
		assert.ok(Run.Provided["workspaceReflect"] !== undefined);
		assert.ok(Run.State !== undefined);
		assert.deepEqual(Run.Lines, ["reflect: activated (propagate=block)"]);
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

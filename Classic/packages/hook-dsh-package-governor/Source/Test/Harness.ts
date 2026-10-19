// Source/Test/Harness.ts - the shared test harness for the PACKAGE GOVERNOR
// tests: the fake ctx (on/emit/effect/get/fs/reflect capture + the root seam)
// + the REAL @playform/plugin-dsh-factory instance from its built Target + the
// governor's REAL built Target - the seams from the source suite
// (Classic/smokes/governor-smoke.mjs), written ONCE per package and imported
// by every test folder. The suite-level fixtures (the tmp Root, the ledger, the
// files map, the subprocess/jobs/storageDomain service stubs, the spawn knobs)
// live here too: each folder process gets a fresh set (the module state is
// per-process), so every folder is standalone-green and the aggregate replays
// the same seams per folder.
//
// Standalone selfcheck: `node Target/Test/Harness.js --selfcheck` runs the
// counter through one deliberate pass + one deliberate failure and exits 0
// only when both are counted exactly, then proves the fake ctx actually wires
// the governor (the vacuously-green backstop for every folder's fixture);
// prepublishOnly.sh gates the build on it. Imported as a library, this module
// only exports.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import * as Governor from "../../Target/Library.js";
import FactoryClass from "../../../plugin-dsh-factory/Target/Library.js";

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
 * assertions VERBATIM (same bytes, same order within the folder); a throw
 * inside counts the whole group failed - every later check still runs, and
 * Finish turns any failure into a non-zero exit for the runner.
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

// -- the suite-level fixtures (the source suite's module state, verbatim) --
export const NCU_BIN = "ncu";
export const EXCLUDE = ["node_modules", ".git", ".dsh", ".pnpm", ".store", "DeepSeek Harness.app"];
export const TOOLS = ["write", "edit", "str_replace_editor", "raw-write"];

export const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "governor-smoke-"));
export const Ledger = Path.join(Root, "governor.log");

export const Provided: Record<string, any> = {};
export const Events: [string, any][] = [];
export const Emitted: any[][] = [];
export const Effects: [string, any][] = [];
export const ServiceGets: string[] = [];
export const LoggerLines: { info: string[]; error: string[] } = { info: [], error: [] };
export const Reads: [string, boolean][] = [];
export const Writes: any[] = [];
export const SpawnSpecs: any[] = [];
export const JobStarts: any[] = [];
export const JobRings: any[][] = [];
export const StorageRecords: [string, any][] = [];
export const Controllers: string[] = [];
export const Detached: string[] = [];
export const Domain: { Closed: boolean } = { Closed: false };

/**
 * The spawn knobs: the update stage's bin-mode runs are driven through the
 * subprocess stub below - folders queue exit codes and stdout text here.
 */
export const Spawn: { Exits: number[]; Out: string } = { Exits: [], Out: "" };

/**
 * The Inflight probe: the patched main-context readText records the size of
 * the governor's Inflight map at read time (the P2 lifecycle assertion).
 */
export const Inflight: { DuringRead: number } = { DuringRead: -1 };

let WriteSeq = 0;

const fakeLogger = {
	info: (m: string) => LoggerLines.info.push(m),
	error: (m: string) => LoggerLines.error.push(m),
};

// The ROOT seam: the Wire registers on the root scope (`Context.root.on`), so
// the fake ctx must be its own root - ctx.root.on records into the same
// `Events` capture (a harness seam; zero assertion changes).
export const MakeContext = (over: any = {}): any => {
	const Context: any = {
		logger: fakeLogger,
		on: (name: string, fn: unknown) => {
			Events.push([name, fn]);
			return () => true;
		},
		emit: (name: string, ...args: any[]) => {
			Emitted.push([name, ...args]);
			// the real bus dispatches synchronously - the refresh re-emit re-enters
			// the listener (and must be a no-op there via the Stash gate)
			for (const [n, fn] of [...Events]) if (n === name) fn(...args);
		},
		effect: (fn: () => unknown, label: string) => {
			const dispose = fn();
			Effects.push([label, dispose]);
			return () =>
				Effects.splice(
					Effects.findIndex((e) => e[0] === label),
					1,
				);
		},
		get: (name: string) => {
			ServiceGets.push(name);
			// Attach's P5 factory probe (ctx.get "pluginFactory") must find the real
			// factory: it is wired as a ctx property (`ctx.pluginFactory = factory`),
			// so get falls through to the ctx property when the services map lacks
			// the name - without it the shared sink is never bound and the pre-bind
			// buffer never drains.
			return Services[name] ?? Context[name];
		},
		fs: {
			sandboxMode: undefined,
			readText: async (target: any, signal: any) => {
				Reads.push([target.displayPath, !!signal]);
				over.onRead?.(target);
				const file = over.files?.[target.displayPath];
				if (file === undefined) throw new Error("vanished");
				return file;
			},
			writeText: async (target: any, content: string, intent: unknown, signal: any, fence: unknown) => {
				Writes.push({
					path: target.displayPath,
					content,
					intent,
					signal: signal ?? null,
					fence: fence ?? null,
				});
				over.files[target.displayPath] = content;
				return { version: `fresh-${++WriteSeq}` };
			},
			stat: async () => ({ version: "stat-v9" }),
		},
		reflect: { provide: (name: string, value: unknown) => (Provided[name] = value) },
		// cordis plugin contexts inherit `root` (the shared event bus scope); the
		// fake ctx is its own root.
		get root() {
			return Context;
		},
	};
	return Context;
};

export const Files: Record<string, string> = {};
export const Services: Record<string, any> = {};

// The MAIN context, exactly like the source suite's: built from the shared
// files map, with the readText probe patch installed (the Inflight-lifecycle
// seam; the folder resets Inflight.DuringRead before the pass it measures).
export const Context: any = MakeContext({ files: Files });
Context.__spy = {
	onRead: () => {
		/* set later, after the probe exists */
	},
};
Context.fs.readText = async (target: any, signal: any) => {
	Reads.push([target.displayPath, !!signal]);
	if (typeof Probe !== "undefined" && Probe) Inflight.DuringRead = Probe.Inflight.size;
	const file = Files[target.displayPath];
	if (file === undefined) throw new Error("vanished");
	return file;
};

Services["subprocess"] = {
	resolveExecutable: async (bin: string) => `resolved:${bin}`,
	spawn: (spec: any) => {
		SpawnSpecs.push(spec);
		const exit = Spawn.Exits.length ? Spawn.Exits.shift() : 0;
		return {
			done: Promise.resolve({ exitCode: exit }),
			collected: {
				stdout: { readFrom: () => (Spawn.Out ? { text: Spawn.Out } : undefined) },
				stderr: { readFrom: () => undefined },
			},
		};
	},
};
Services["jobs"] = {
	attachController: (name: string) => {
		Controllers.push(name);
		return () => Detached.push(name);
	},
	start: (spec: any) => {
		JobStarts.push(spec);
		const ring: any[] = [];
		JobRings.push(ring);
		const hooks = spec.run({ append: (t: any) => ring.push(t) });
		hooks.done.catch(() => {});
		return "governor-update-1";
	},
};
Services["storageDomain"] = {
	open: async () => ({
		close: async () => {
			Domain.Closed = true;
		},
		table: () => ({ put: async (k: string, v: unknown) => StorageRecords.push([k, v]) }),
	}),
};

/**
 * The ledger helpers (the source suite's, verbatim): the ledger lines with the
 * ISO timestamps, and a substring finder over them.
 */
export const ledgerLines = (): string[] =>
	FileSystem.readFileSync(Ledger, "utf8").split("\n").filter(Boolean);
export const find = (needle: string): string[] => ledgerLines().filter((l) => l.includes(needle));

/**
 * The settle helper (the source suite's, verbatim): turns of setImmediate.
 */
export const settle = async (turns = 8): Promise<void> => {
	for (let i = 0; i < turns; i++) await new Promise((r) => setImmediate(r));
};

/**
 * The target factory and the shared actor (the source suite's, verbatim).
 */
export const mkTarget = (dir: string, key: string): any => ({
	targetKey: key,
	displayPath: Path.join(dir, "package.json"),
});
export const actor: any = { name: "edit" };

/**
 * The real-config shape the loader hands to apply: volatile fields arrive as
 * `{ get }` cells. Build one via the governor's schema. The cast is
 * fixture-only scaffolding.
 */
export const Validate = (Raw: Record<string, unknown>): any =>
	(Governor.Config as unknown as (Raw: Record<string, unknown>) => any)({ ...Raw });

/**
 * The REAL factory instance, constructed exactly the way the source suite
 * does (against the main context, so the factory registers as
 * ctx.pluginFactory through the reflect capture). One instance per folder
 * process.
 */
export const Furnace: any = new FactoryClass(Context);
// The source suite's explicit wiring: the factory registers through the
// reflect capture, and the ctx property is assigned right after construction
// (the Attach probe reads it via `services[name] ?? ctx[name]`).
Context.pluginFactory = Furnace;

/**
 * The governor probe (the source suite's `Probe`): set by Boot once the
 * governor's apply has run on the main context. A live binding - folders
 * import it and read the latest value.
 */
export let Probe: any = null;

/**
 * Boot: apply the governor on the main context with the source suite's config
 * (the logFile pointed at the harness ledger) and expose the state probe.
 * Returns the probe. Every folder calls this once, at its start.
 */
export const Boot = (): any => {
	const Raw = Validate({ logFile: Ledger });
	Governor.apply(Context, Raw);
	Probe = Context.__hookDshGovernorPackageState;
	return Probe;
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
	// The seam selfcheck: the fake ctx actually wires the governor (the
	// vacuously-green backstop for every folder's fixture - a broken seam would
	// print fewer checks in every folder, which the runner's expected-count
	// guard catches; this proves the seam itself at build time).
	const State = Boot();
	Check(Count, "selfcheck: the fake ctx registers the governor's apply-time wiring", () => {
		assert.ok(Events.some(([n]) => n === "fs/observed"));
		assert.equal(State.Factory, Furnace);
		assert.equal(State.Module, "hook-dsh-governor-package");
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

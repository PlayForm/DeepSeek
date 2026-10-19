// Source/Test/Harness.ts - the shared test harness for the PINNER tests: the
// fake ctx (on/emit/effect/get/reflect capture + the root seam) with the
// REAL-TOKEN fs backend (real temp-dir I/O whose version tokens
// dev:size:mtimeNs:ctimeNs enforce the replaceIfVersion guard) + the REAL
// @playform/plugin-dsh-factory instance from its built Target + the pinner's
// REAL built Target - the seams from the source suite
// (Classic/smokes/pinner-smoke.mjs), written ONCE per package and imported by
// every test folder.
//
// Standalone selfcheck: `node Target/Test/Harness.js --selfcheck` runs the
// counter through one deliberate pass + one deliberate failure and exits 0
// only when both are counted exactly, then proves the real-token fs actually
// wires the pinner (the vacuously-green backstop for every folder's fixture);
// prepublishOnly.sh gates the build on it. Imported as a library, this module
// only exports.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import * as Pinner from "../../Target/Library.js";
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
export const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "pinner-smoke-"));
// The source suite's main ledger name is asserted byte-shape
// (`...ledger-main.log` in the activation regex) - keep it.
export const Ledger = Path.join(Root, "ledger-main.log");

export const LoggerLines: { info: string[]; error: string[] } = { info: [], error: [] };

const fakeLogger = {
	info: (m: string) => LoggerLines.info.push(m),
	error: (m: string) => LoggerLines.error.push(m),
};

// The stat->write race injector: when Armed, the fake `stat` captures the
// file's CURRENT version token, then lets a racing author write land, then
// returns the PRE-write token - so the chain's guarded write guards a version
// that is already superseded when writeText checks it. This is the only window
// left after the fresh-stat basis (a racing write between the observation and
// the chain no longer refuses; the chain re-reads and merges it).
export const Race: { Armed: null | { path: string; content: string } } = { Armed: null };

/**
 * The real-token version token (the source suite's, verbatim).
 */
export const token = (p: string): string => {
	const s = FileSystem.statSync(p);
	return `dev:${s.dev}:${s.size}:${s.mtimeNs}:${s.ctimeNs}`;
};

/**
 * The fake ctx (the source suite's makeCtx, verbatim): the captures live ON
 * the ctx object, and the fs backend is the real-token one.
 */
export const MakeContext = (): any => {
	const ctx: any = {
		logger: fakeLogger,
		events: [],
		emitted: [],
		effects: [],
		serviceGets: [],
		services: {},
		reads: [],
		writes: [],
		on: (name: string, fn: unknown) => {
			ctx.events.push([name, fn]);
			return () => true;
		},
		emit: (name: string, ...args: any[]) => ctx.emitted.push([name, ...args]),
		effect: (fn: () => unknown, label: string) => {
			const dispose = fn();
			ctx.effects.push([label, dispose]);
			return () => {
				const i = ctx.effects.findIndex((e: any) => e[0] === label);
				if (i >= 0) ctx.effects.splice(i, 1);
			};
		},
		get: (name: string) => {
			ctx.serviceGets.push(name);
			return ctx.services[name];
		},
		reflect: {
			provide: (name: string, value: unknown) => {
				ctx.services[name] = value;
				ctx[name] = value; // the service accessor (ctx.pluginFactory)
			},
		},
		// The ROOT seam: the Wire registers on the root scope (`Context.root.on`),
		// so the fake ctx must be its own root - ctx.root.on records into the
		// same ctx.events capture (a harness seam; zero assertion changes).
		get root() {
			return ctx;
		},
	};
	// The governed-fs backend: REAL temp-dir I/O, version tokens
	// (dev:size:mtimeNs:ctimeNs) enforcing the replaceIfVersion guard.
	ctx.fs = {
		sandboxMode: undefined,
		readText: async (target: any, signal: any) => {
			ctx.reads.push([target.displayPath, signal !== undefined]);
			// throws when the file vanished - the backend contract
			return FileSystem.readFileSync(target.displayPath, "utf8");
		},
		writeText: async (target: any, content: string, intent: unknown, signal: any, fence: unknown) => {
			const current = FileSystem.existsSync(target.displayPath)
				? token(target.displayPath)
				: null;
			if (intent?.kind === "replaceIfVersion" && current !== intent.version)
				throw new Error(`FS_STALE_VERSION: ${target.displayPath}`);
			FileSystem.writeFileSync(target.displayPath, content);
			ctx.writes.push({
				path: target.displayPath,
				content,
				intent,
				signal: signal ?? null,
				fence: fence ?? null,
			});
			return { version: token(target.displayPath) };
		},
		stat: async (target: any) => {
			// The fresh-stat probe (the chain's write basis). When armed, the
			// racing author write lands AFTER the token is captured - the write
			// the chain is about to make will then fail the guard.
			const version = token(target.displayPath);
			if (Race.Armed && Race.Armed.path === target.displayPath) {
				FileSystem.writeFileSync(Race.Armed.path, Race.Armed.content);
				Race.Armed = null;
			}
			return { version };
		},
	};
	return ctx;
};

/**
 * The file-writing fixture helper (the source suite's, verbatim).
 */
export const Write = (p: string, content: string): string => {
	FileSystem.mkdirSync(Path.dirname(p), { recursive: true });
	FileSystem.writeFileSync(p, content);
	return p;
};

/**
 * The ledger helpers (the source suite's, verbatim).
 */
export const Lines = (ledger: string): string[] =>
	FileSystem.existsSync(ledger)
		? FileSystem.readFileSync(ledger, "utf8").split("\n").filter(Boolean)
		: [];
export const LedgerHas = (ledger: string, fragment: string): boolean =>
	Lines(ledger).some((l) => l.endsWith(fragment));
export const LedgerCount = (ledger: string, fragment: string): number =>
	Lines(ledger).filter((l) => l.endsWith(fragment)).length;

/**
 * The settle helper (the source suite's, verbatim): polls the state's
 * Inflight map until the detached continuation has settled.
 */
export const Settle = async (st: any): Promise<void> => {
	for (let i = 0; i < 500; i++) {
		if (st.Inflight.size === 0) return;
		await new Promise((r) => setImmediate(r));
	}
	throw new Error("the detached continuation never settled");
};
export const Wait = (): Promise<void> =>
	new Promise((r) => setImmediate(() => setImmediate(r)));

/**
 * The real-config shape the loader hands to apply (the pinner's schema). The
 * cast is fixture-only scaffolding.
 */
export const Validate = (Raw: Record<string, unknown>): any =>
	(Pinner.Config as unknown as (Raw: Record<string, unknown>) => any)({ ...Raw });

/**
 * The world for one folder: the main fake ctx + the REAL factory instantiated
 * against it + one pinner apply with the source suite's main config. Returns
 * every capture the folders' checks read (same names as the source suite's
 * locals). `St` is the state probe.
 */
export const Boot = () => {
	const ctx = MakeContext();
	const Factory = new FactoryClass(ctx);
	const cfg = Validate({ log: true, logFile: Ledger });
	const Returned = Pinner.apply(ctx, cfg);
	const st = ctx.__hookDshPinnerPackageState;
	return {
		ctx,
		Factory,
		cfg,
		Returned,
		st,
		listener: ctx.events.find((e: any) => e[0] === "fs/observed")[1],
	};
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
	// The seam selfcheck: the real-token fs actually wires the pinner (the
	// vacuously-green backstop for every folder's fixture - a broken seam would
	// print fewer checks in every folder, which the runner's expected-count
	// guard catches; this proves the seam itself at build time).
	const World = Boot();
	Check(Count, "selfcheck: the real-token fs registers the pinner's apply-time wiring", () => {
		assert.ok(World.ctx.events.some((e: any) => e[0] === "fs/observed"));
		assert.equal(World.st.Factory, World.Factory);
		assert.equal(World.st.Module, "hook-dsh-pinner-package");
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

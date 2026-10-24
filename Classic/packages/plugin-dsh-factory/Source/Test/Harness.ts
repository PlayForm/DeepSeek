// Source/Test/Harness.ts - the shared test harness for the FACTORY tests: the
// fake ctx of the source suite (the capture seams on/emit/effect/get/reflect/
// fs/logger + the ROOT seam, since the Wire and the State builder register on
// the root scope) + the REAL factory class from the built Target - the seams
// from the source suite, written ONCE per package and imported by every test
// folder. Every folder constructs its own factory instance from the class
// (the Service base registers through ctx.reflect.provide) and drives the
// State builder, the write executor and the registry against it.
//
// Standalone selfcheck: `node Target/Test/Harness.js --selfcheck` runs the
// counter through one deliberate pass + one deliberate failure and exits 0
// only when both are counted exactly, then proves the fake ctx actually wires
// the Service constructor (the vacuously-green backstop for every folder's
// fixture); prepublishOnly.sh gates the build on it. Imported as a library,
// this module only exports.
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import FactoryClass from "../../Target/Library.js";

export { FactoryClass };

/**
 * The per-folder counter: `N` = passing checks, `F` = failing checks. Passed
 * by reference so Check can bump it from inside its callback.
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
 * The async variant of Check, for folders whose assertions await (the write
 * executor, the continuation lifecycle, the storage domain). Same counting
 * and printing; the caller must await it so checks stay sequential and Finish
 * sees the final counts.
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

/**
 * The tmpdir fixture: a fresh OS temp directory each folder creates its
 * ledger/proj/registry fixtures in (the same mechanics as the source suite,
 * which leaves its temp root in place after the run).
 */
export const TempRoot = (Prefix: string): string =>
	mkdtempSync(Path.join(OS.tmpdir(), Prefix));

/**
 * The fake ctx of the source suite, verbatim: the factory instance is reset
 * at the top of every make (the P5 journal stages - a stale shared sink or
 * pending buffer would leak earlier scenarios' records into a later
 * scenario's domain, exactly the source suite's reason for the reset), and
 * the ROOT seam makes the fake ctx its own root, so the Wire's and the State
 * builder's root registrations land in the same `events` capture.
 *
 * `Raw.files` backs the fs read/write seam; `Raw.stat` overrides the
 * Continue chain's fresh-stat probe (the raced scenario). The typing is
 * `any` deliberately - fixture-only scaffolding, so every check in the
 * folders reads the captures through the source suite's exact expressions.
 */
export const Make = (Factory: any, Raw: any = {}): any => {
	if (Factory) {
		Factory.PendingJournal = [];
		Factory.SharedJournal = undefined;
	}
	const Over = Raw.files ? Raw : { ...Raw, files: {} };
	const provided: Record<string, unknown> = {};
	const events: any[][] = [];
	const emitted: any[][] = [];
	const effects: any[][] = [];
	const serviceGets: string[] = [];
	const services: Record<string, any> = {};
	const loggerLines: { info: string[]; error: string[] } = { info: [], error: [] };
	const reads: any[][] = [];
	const writes: any[] = [];
	const stats: any[][] = [];
	const appended: unknown[] = [];
	const fakeLogger = {
		info: (M: string) => loggerLines.info.push(M),
		error: (M: string) => loggerLines.error.push(M),
	};
	const Context: any = {
		logger: fakeLogger,
		on: (Name: string, Listener: unknown) => {
			events.push([Name, Listener]);
			return () => true;
		},
		emit: (Name: string, ...Args: unknown[]) => emitted.push([Name, ...Args]),
		effect: (Function: () => unknown, Label: string) => {
			const Dispose = Function();
			effects.push([Label, Dispose]);
			return () =>
				effects.splice(
					effects.findIndex((E) => E[0] === Label),
					1,
				);
		},
		get: (Name: string) => {
			serviceGets.push(Name);
			return services[Name];
		},
		fs: {
			sandboxMode: undefined,
			readText: async (Target: any, Signal?: unknown) => {
				reads.push([Target.displayPath, !!Signal]);
				const File = Over.files?.[Target.displayPath];
				if (File === undefined) throw new Error("vanished");
				return File;
			},
			writeText: async (
				Target: any,
				Content: string,
				Intent: unknown,
				Signal?: unknown,
				Fence?: unknown,
			) => {
				writes.push({
					path: Target.displayPath,
					content: Content,
					intent: Intent,
					signal: Signal ?? null,
					fence: Fence ?? null,
				});
				Over.files[Target.displayPath] = Content;
				return { version: "fresh-v2" };
			},
			// The Continue chain pass's fresh-stat probe. The default returns the
			// CURRENT file version ("v1" - the unraced basis); a scenario that
			// models the file advancing overrides `stat` (the raced pass).
			stat:
				Raw.stat ??
				(async (Target: any, Signal?: unknown) => {
					stats.push([Target.displayPath, Signal !== undefined]);
					return { version: "v1" };
				}),
		},
		reflect: { provide: (Name: string, Value: unknown) => (provided[Name] = Value) },
		// The public provide seam (the factory's trace registration): the real
		// Service base uses reflect.provide; `ctx.provide` is the mixed-in
		// public form the constructor calls for `ctx.trace`. The fake sets the
		// context property so a consumer probe resolves, and records it in the
		// same `provided` capture.
		provide: (Name: string, Value?: unknown) => {
			provided[Name] = Value;
			Context[Name] = Value;
			return () => true;
		},
		// cordis plugin contexts inherit `root` (the shared event bus scope); the
		// fake ctx is its own root.
		get root() {
			return Context;
		},
	};
	return {
		Context,
		provided,
		events,
		emitted,
		effects,
		serviceGets,
		services,
		loggerLines,
		reads,
		writes,
		stats,
		appended,
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
	// The seam selfcheck: the fake ctx actually wires the Service constructor
	// (the vacuously-green backstop for every folder's fixture - a broken seam
	// would print fewer checks in every folder, which the runner's
	// expected-count guard catches; this proves the seam itself at build time).
	const Seamed = Make(null, { files: {} });
	const Self = new FactoryClass(Seamed.Context);
	Check(Count, "selfcheck: the fake ctx registers the Service instance", () => {
		assert.equal(Seamed.provided["pluginFactory"], Self);
		assert.equal(Self.name, "pluginFactory");
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

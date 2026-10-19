// Source/Test/Harness.ts - the shared test harness for the ellipsis flavor's
// per-test folders: the fake ctx + the REAL factory instance + the REAL
// ellipsis apply, written ONCE per package and imported by every test folder
// (the seams are the source suite's, Classic/smokes/ellipsis-smoke.mjs, moved
// verbatim - the .mjs suite duplicates its harness per file; here it is one
// file).
//
// Standalone selfcheck: `node Target/Test/Harness.js --selfcheck` runs the
// counter through one deliberate pass + one deliberate failure and exits 0
// only when both are counted exactly (the negative control for the harness
// itself); prepublishOnly.sh gates the build on it. Imported as a library,
// this module only exports.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import type { Context as CordisContext } from "@deepseek-ai/cordis";
// Import depths: this file sits at Source/Test/ (ONE level shallower than
// the per-test folders), so the own-bundle import is ../../Target/Library.js
// and the cross-bundle factory import is ../../../plugin-dsh-factory/... -
// valid from BOTH trees (Source/Test/ and Target/Test/ mirror each other).
import type State from "../../Target/Interface/State.js";
import Ellipsis from "../../Target/Library.js";
import FactoryClass from "../../../plugin-dsh-factory/Target/Library.js";

// (apply + Config live on both named and default - same as the source suite.)
const { apply, Config: Schema } = Ellipsis;

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
 * One check = the source suite's Check(condition, message) call. The
 * condition and the message move VERBATIM into the callback (an assert.ok
 * with the suite's exact message); a throw counts the whole check failed -
 * every later check still runs, and Finish turns any failure into a
 * non-zero exit for the runner.
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

// The REAL factory instance, constructed exactly the way the factory's own
// smoke does (the Service base constructor registers through
// ctx.reflect.provide; the stub context is used once and discarded).
export const Furnace = new FactoryClass(
	{ reflect: { provide: () => undefined } } as unknown as CordisContext,
);

// The ledger file path - the source suite's exact fixture (one /tmp log per
// suite; the identity-driven path is asserted in Config-And-State).
export const Ledger = "/tmp/ellipsis-smoke-ledger.log";

// The suite's rm(): remove the ledger file, ignoring absence.
export const rm = (): void => {
	try {
		FileSystem.rmSync(Ledger);
	} catch {}
};

// The real-config shape the loader hands to apply: volatile fields arrive as
// `{ get }` cells. The suite builds one via the schema and asserts the
// cells, then lets the factory's State builder unwrap them. The validated
// value is the runtime shape (cells included) even though the schema's
// static type says plain fields - the harness types it loosely for that
// reason (fixture-only typing; the assertions stay verbatim).
export const Validate = (Raw: Record<string, unknown>): any => Schema({ ...Raw } as never);

/**
 * One made run: the fake ctx (on() captures listeners and returns a
 * disposer, fiber-owned pattern; get() serves the REAL factory for
 * "pluginFactory", the human-command registry for "commands", and throws for
 * anything else - the factory's probe-once Seam catches the throw; logger
 * captures lines; effect not needed, Apply registers none) + the REAL apply,
 * exactly the source suite's Make().
 */
export type Run = {
	Context: Record<string, unknown>;
	Listeners: Record<string, (...Args: any[]) => any>;
	ListenerOptions: Record<string, any>;
	Lines: string[];
	CommandsRegistered: any[];
	State: State;
};

export const Make = (Raw: unknown): Run => {
	const Listeners: Record<string, (...Args: any[]) => any> = {};
	const ListenerOptions: Record<string, any> = {};
	const Lines: string[] = [];
	const CommandsRegistered: any[] = [];
	const Context = {
		// The service accessor (typed via Interface/Factory's augmentation): the
		// REAL factory instance, guaranteed present by `inject: ["pluginFactory"]`.
		pluginFactory: Furnace,
		on: (Name: string, Listener: (...Args: any[]) => any, Options: any) => {
			Listeners[Name] = Listener;
			ListenerOptions[Name] = Options;
			return () => true;
		},
		get: (Name: string) => {
			switch (Name) {
				case "pluginFactory":
					return Furnace;
				// The human-command registry seam (the `normalize-overpass`
				// registration): records every registered definition.
				case "commands":
					return {
						register: (Definition: unknown) => {
							CommandsRegistered.push(Definition);
							return () => true;
						},
					};
				default:
					throw new Error(`unknown service: ${Name}`);
			}
		},
		logger: {
			info: (M: string) => {
				Lines.push(M);
			},
		},
	};
	apply(Context as unknown as CordisContext, Raw as never); // the loader contract: apply(ctx, config)
	return {
		Context: Context as Record<string, unknown>,
		Listeners,
		ListenerOptions,
		Lines,
		CommandsRegistered,
		State: (Context as { __hookDshEllipsisState?: State }).__hookDshEllipsisState as State,
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
	if (Count.N === 2 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

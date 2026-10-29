// Source/Test/Harness.ts - the shared test harness for the COMMENT FILTER
// tests: the fake ctx (on capture, get returning the REAL
// @playform/ets-plugin-dsh-factory instance from its built Target, logger
// capture) + the REAL comment-filter apply (from the built Target) - the
// seams from the source suite, written ONCE per package and imported by every
// test folder. The ctx carries the emit/effect/root seams too: the factory's
// State builder probes the OPTIONAL subprocess service through `ctx.get` (a
// throwing probe is an absent service) and registers its volatile-refresh
// listener on the same ctx, and the ledger writes through `ctx.logger`.
//
// Standalone selfcheck: `node Target/Test/Harness.js --selfcheck` runs the
// counter through one deliberate pass + one deliberate failure and exits 0
// only when both are counted exactly, then proves the fake ctx actually wires
// apply (the vacuously-green backstop for every folder's fixture);
// prepublishOnly.sh gates the build on it. Imported as a library, this module
// only exports.
import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import CommentFilter from "../../Target/Library.js";
import FactoryClass from "../../../ets-plugin-dsh-factory/Target/Library.js";

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
 * One check = the source suite's ok. The callback carries that check's
 * condition VERBATIM (same bytes, same order within the folder); a throw
 * inside counts the check failed - every later check still runs, and Finish
 * turns any failure into a non-zero exit for the runner.
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

// The durable ledger file (one fixed path per package) and the rm helper every
// folder calls at its start and at the same points the source suite does.
export const Ledger = "/tmp/comment-filter-smoke-ledger.log";
export const Rm = (): void => {
	try {
		rmSync(Ledger);
	} catch {}
};

// The REAL factory instance, constructed exactly the way the factory's own
// smoke does (the Service base constructor registers through
// ctx.reflect.provide; the stub context is used once and discarded). One
// instance per folder process - the journal arithmetic inside a folder
// accumulates on it exactly like the source suite's arithmetic does.
export const Furnace: any = new FactoryClass({
	reflect: { provide: () => undefined },
} as any);

const { apply, Config: Schema } = CommentFilter;

/**
 * The real-config shape the loader hands to apply: volatile fields arrive as
 * `{ get }` cells. Build one via the schema (the schema callable fills every
 * default), then override the fields a case needs. The cast is fixture-only
 * scaffolding - every check reads the returned object through the same
 * expressions the source suite uses.
 */
export const Validate = (Raw: Record<string, unknown>): any =>
	(Schema as unknown as (Raw: Record<string, unknown>) => any)({ ...Raw });

/**
 * The fake ctx + one apply: on() captures listeners (returns a disposer,
 * fiber-owned pattern); get() serves the REAL factory for "pluginFactory" and
 * throws for anything else (the factory's probe-once Seam catches the throw -
 * a throwing probe is an absent service); logger captures lines; emit is a
 * synchronous recorder; effect runs the callback and returns its disposer;
 * the fake ctx is its own root. The typing is `any` deliberately -
 * fixture-only scaffolding, so every check in the folders reads the captures
 * through the source suite's exact expressions.
 */
export const Make = (Raw: any): any => {
	const Listeners: Record<string, any> = {},
		ListenerOptions: Record<string, any> = {},
		Lines: string[] = [];
	const Context: any = {
		// The service accessor (typed via Interface/Factory's augmentation): the
		// REAL factory instance, guaranteed present by `inject: ["pluginFactory"]`.
		pluginFactory: Furnace,
		on: (Name: string, Listener: unknown, Options: unknown) => {
			Listeners[Name] = Listener;
			ListenerOptions[Name] = Options;
			return () => true;
		},
		get: (Name: string) => {
			switch (Name) {
				case "pluginFactory":
					return Furnace;
				default:
					throw new Error(`unknown service: ${Name}`);
			}
		},
		logger: {
			info: (M: string) => {
				Lines.push(M);
			},
			warn: (M: string) => {
				Lines.push(M);
			},
		},
		// The emit seam: a synchronous recorder (the plugin emits nothing, but
		// the fake ctx must answer the API).
		emit: () => undefined,
		// The effect seam: run the callback now and hand back its disposer.
		effect: (Callback: () => unknown) => {
			const Disposer = Callback?.();
			return typeof Disposer === "function" ? Disposer : () => true;
		},
		// The ROOT seam: cordis plugin contexts inherit `root`; the fake ctx is
		// its own root.
		get root() {
			return Context;
		},
	};
	apply(Context, Raw); // the loader contract: apply(ctx, config)
	return {
		Context,
		Listeners,
		ListenerOptions,
		Lines,
		State: Context.__hookDshCommentFilterState,
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
	// The seam selfcheck: the fake ctx actually wires apply (the vacuously-
	// green backstop for every folder's fixture - a broken seam would print
	// fewer checks in every folder, which the runner's expected-count guard
	// catches; this proves the seam itself at build time).
	const Seamed = Make(Validate({ logFile: Ledger }));
	Check(Count, "selfcheck: the fake ctx registers the apply-time listeners", () => {
		assert.ok(typeof Seamed.Listeners["tools/post-execute"] === "function");
		assert.ok(typeof Seamed.Listeners["agent/pre-step"] === "function");
		assert.ok(Seamed.State.Factory === Furnace);
		assert.equal(Seamed.State.Module, "hook-dsh-comment-filter");
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

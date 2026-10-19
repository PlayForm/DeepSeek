// Source/Test/Harness.ts - the shared test harness for the DASH tests: the
// fake ctx (on capture, get returning the REAL @playform/plugin-dsh-factory
// instance from its built Target, logger capture) + the REAL dash apply (from
// the built Target) - the seams from the source suite, written ONCE per
// package and imported by every test folder. The ctx carries the tool/fs/
// waterfall/emit seams too (a BARE backend: sandboxMode undefined, so the
// standing sandbox-policy path is skipped), so the raw-write tool folder and
// the overpass folder drive the same machinery the source suite drives.
//
// Standalone selfcheck: `node Target/Test/Harness.js --selfcheck` runs the
// counter through one deliberate pass + one deliberate failure and exits 0
// only when both are counted exactly, then proves the fake ctx actually wires
// apply (the vacuously-green backstop for every folder's fixture);
// prepublishOnly.sh gates the build on it. Imported as a library, this module
// only exports.
import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import NormalizeDash from "../../Target/Library.js";
import FactoryClass from "../../../plugin-dsh-factory/Target/Library.js";

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

// The durable ledger file (the source suite's fixed path, verbatim) and the
// rm helper every folder calls at its start and at the same points the source
// suite does.
export const Ledger = "/tmp/normalize-dash-smoke-ledger.log";
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
export const Furnace = new FactoryClass({ reflect: { provide: () => undefined } });

const { apply, Config: Schema } = NormalizeDash;

/**
 * The real-config shape the loader hands to apply: volatile fields arrive as
 * `{ get }` cells. Build one via the schema. The cast is fixture-only
 * scaffolding - every check reads the returned object through the same
 * expressions the source suite uses.
 */
export const Validate = (Raw: Record<string, unknown>): any =>
	(Schema as unknown as (Raw: Record<string, unknown>) => any)({ ...Raw });

/**
 * The fake ctx + one apply: on() captures listeners (returns a disposer,
 * fiber-owned pattern); get() serves the REAL factory for "pluginFactory" and
 * throws for anything else (the factory's probe-once Seam catches the throw);
 * logger captures lines; the tool/fs seams capture the raw-write tool's
 * registration and its fs path; the waterfall delegates to the unconditional
 * default; the fs/observed emit is a synchronous recorder; the fake ctx is
 * its own root. The typing is `any` deliberately - fixture-only scaffolding,
 * so every check in the folders reads the captures through the source suite's
 * exact expressions.
 */
export const Make = (Raw: any): any => {
	const Listeners = {},
		ListenerOptions = {},
		Lines = [];
	const Registered = [],
		CommandsRegistered = [],
		Resolved = [],
		Writes = [],
		Intents = [],
		Observations = [];
	const Files = new Map();
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
		// The tool registry seam: records every registered definition.
		tools: {
			register: (Definition: unknown) => {
				Registered.push(Definition);
				return () => true;
			},
		},
		// The fs seam: resolve manufactures a stable target; writeText records
		// the call, honors the abort signal like a real backend, and reports
		// create/update from its own in-memory prior state.
		fs: {
			sandboxMode: undefined,
			resolve: async (Path: string, Opts: any) => {
				Resolved.push({ path: Path, signal: Opts?.signal });
				return { targetKey: `key:${Path}`, displayPath: Path };
			},
			writeText: async (Target: any, Content: string, Intent: unknown, Signal: any, Policy: unknown) => {
				if (Signal?.aborted) throw new Error("aborted before write");
				Writes.push({
					target: Target,
					content: Content,
					intent: Intent,
					signal: Signal,
					policy: Policy,
				});
				const Before = Files.get(Target.targetKey) ?? null;
				Files.set(Target.targetKey, Content);
				return {
					operation: Before === null ? "create" : "update",
					version: `v${Writes.length}`,
					before: Before,
					after: Content,
				};
			},
		},
		// The fs/write-intent waterfall: next() delegates to the unconditional
		// default (no observation policy in the smoke harness).
		waterfall: async (Name: string, Target: unknown, Actor: unknown, Next: () => unknown) => {
			Intents.push({ name: Name, target: Target });
			return Next();
		},
		// The fs/observed emit: a synchronous recorder (the governance hooks'
		// trigger - the raw-write must fire it exactly like the built-in write).
		emit: (Name: string, Target: unknown, Observation: unknown, Actor: unknown) => {
			Observations.push({
				name: Name,
				target: Target,
				observation: Observation,
				actor: Actor,
			});
		},
		// The ROOT seam: cordis plugin contexts inherit `root` - the shared write
		// executor's fs/observed emit goes through ctx.root (the built-in write's
		// own posture: its ctx IS the root, and a listener hears root emissions
		// from its own scope too). The fake ctx is its own root, so
		// ctx.root.emit captures into Observations (a harness seam, not an
		// assertion change - Run 8's emit assertions are untouched).
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
		Registered,
		CommandsRegistered,
		Resolved,
		Writes,
		Intents,
		Observations,
		State: Context.__hookDshNormalizeDashState,
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
		assert.ok(typeof Seamed.Listeners["llm/stream"] === "function");
		assert.ok(Seamed.State.Factory === Furnace);
		assert.equal(Seamed.State.Module, "hook-dsh-normalize-dash");
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

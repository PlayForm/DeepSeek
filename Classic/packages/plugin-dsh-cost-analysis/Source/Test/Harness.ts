import assert from "node:assert/strict";

import Plugin from "../../Target/Library.js";

/**
 * @module Harness
 *
 * The shared test harness for the cost analysis plugin's smokes.
 *
 * @remarks
 *
 * The harness carries the counter with Check/CheckAsync/Finish and the FAKE
 * ctx with a FAKE pluginFactory (State/Append), a command registry, a
 * logger, the listener seam, the effect seam and the get accessor - the
 * surfaces the plugin entry consumes. It never imports the ledger package:
 * the analysis plugin reads a ledger file, it does not load the ledger's
 * code.
 */
/**
 * The per-folder counter: `N` = passing checks, `F` = failing checks.
 */
export type Counter = { N: number; F: number };

/**
 * A fresh counter for one test folder.
 */
export const MakeCounter = (): Counter => ({ N: 0, F: 0 });

/**
 * One check = one assert group; a throw counts the group failed.
 */
export const Check = (Count: Counter, Label: string, Assertions: () => void): void => {
	Count.N++;
	try {
		Assertions();
		console.log(`PASS - ${Label}`);
	} catch (Issue) {
		Count.F++;
		console.log(`FAIL - ${Label}`);
		console.log(Issue instanceof Error ? Issue.message : String(Issue));
	}
};

/**
 * The async variant of Check.
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
	} catch (Issue) {
		Count.F++;
		console.log(`FAIL - ${Label}`);
		console.log(Issue instanceof Error ? Issue.message : String(Issue));
	}
};

/**
 * End-of-folder guard: any failed assertion is a folder failure.
 */
export const Finish = (Count: Counter, Name: string): number => {
	if (Count.F !== 0) throw new Error(`${Name}: ${Count.F} failed check(s)`);
	return Count.N;
};

/**
 * The fake ctx: the plugin's surfaces, plus the token meter the ledger's
 * drain probes when a test folds a fixture through it. `get` resolves
 * through the context's own properties.
 */
export const Make = (Raw: Record<string, unknown>): any => {
	const Listeners: Record<string, unknown> = {};
	const Lines: string[] = [];
	const Effects: string[] = [];
	const Commands: any = { Registered: [] as unknown[] };
	Commands.register = (Definition: unknown) => void Commands.Registered.push(Definition);
	const Factory = {
		State: (Context: unknown, _Config: unknown, Setup: any) => {
			// The setup map, honored like the real factory's builder: every
			// mapped field is copied from the (cell-unwrapped) validated
			// config onto the State, so Apply's call-time reads (`State.On`)
			// see the plain values.
			const State: any = {
				Context,
				Module: Setup?.module ?? "plugin-dsh-cost-analysis",
				Stash: new Map(),
				Inflight: new Map(),
			};
			for (const [Key, Field] of Object.entries(Setup?.fields ?? {})) {
				const Value = (Raw as Record<string, unknown>)[Field as string];
				State[Key] =
					typeof (Value as { get?: unknown } | null)?.get === "function"
						? (Value as { get: () => unknown }).get()
						: Value;
			}
			return State;
		},
		Append: (_State: unknown, Message: string) => void Lines.push(Message),
	};
	let Context: any;
	Context = {
		pluginFactory: Factory,
		commands: Commands,
		tokenMeter: { estimateMessage: () => 10 },
		logger: { info: (M: string) => void Lines.push(M), warn: (M: string) => void Lines.push(M) },
		on: (Name: string, Listener: unknown) => {
			Listeners[Name] = Listener;
			return () => true;
		},
		get: (Name: string) => Context[Name],
		effect: (Setup: () => unknown, Label?: string) => {
			Effects.push(Label ?? "unnamed");
			const Disposer = Setup();
			return typeof Disposer === "function" ? Disposer : () => true;
		},
		Raw,
	};
	return { Context, Factory, Commands, Listeners, Lines, Effects, Raw };
};

/**
 * The validated config shape the loader hands to apply (the schema call).
 */
export const Validate = (Raw: Record<string, unknown>): any =>
	(Plugin.Config as unknown as (Raw: Record<string, unknown>) => any)({ ...Raw });

// Standalone entry: `node Target/Test/Harness.js --selfcheck`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Count = MakeCounter();
	const Run = Make(Validate({ enabled: true }));
	Check(Count, "selfcheck: a failing assertion counts as FAIL", () => {
		assert.equal(1, 2);
	});
	Check(Count, "selfcheck: the fake ctx carries the spec's surfaces", () => {
		assert.equal(Count.N, 2);
		assert.equal(Count.F, 1);
		assert.equal(typeof Run.Context.on, "function");
		assert.equal(typeof Run.Context.commands.register, "function");
		assert.equal(typeof Run.Factory.Append, "function");
	});
	// The live posture (the Config base): a disabled mount registers the
	// command but reads the flag at call time - the command answers the
	// disabled line and the activation proof is the disabled line.
	const OffRun = Make(Validate({ enabled: false }));
	Plugin.apply(OffRun.Context, OffRun.Raw);
	const OffCommand = OffRun.Commands.Registered[0] as any;
	Check(Count, "selfcheck: the disabled mount appends the disabled line and refuses", () => {
		assert.ok(
			OffRun.Lines.includes("disabled (enabled=false)"),
			"the activation proof names the disabled posture",
		);
		assert.ok(OffCommand !== undefined, "the command still registers");
		assert.deepEqual(OffCommand.handler({}), {
			kind: "error",
			text: "plugin-dsh-cost-analysis: disabled (enabled=false)",
		});
	});
	console.log(Count.N === 3 && Count.F === 1 ? "Harness selfcheck OK" : `Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
	if (Count.N !== 3 || Count.F !== 1) process.exitCode = 1;
}

// Source/Test/Harness.ts - the shared test harness for the PANEL-FAMILY
// client-half smokes: the alias hooks load the REAL built Target (the
// ./client export and the loader row), and the fake CLIENT ctx captures
// exactly the seams the client body uses - locale.register, slots.inject,
// slots.register, effect, reflect.provide. This is the
// hook-dsh-workspace-observe harness pattern adapted to the client SDK:
// there is no root listener, no fs capture and no waterfall here - the
// client half is a pure browser module that touches no filesystem and has
// no clock, so the harness has neither an fs seam nor a time seam; the
// purity is asserted directly on the built code instead.
//
// Standalone selfcheck: `node Target/Test/Harness.js --selfcheck` proves
// the fake ctx actually wires the real client apply (the vacuously-green
// backstop for every folder's fixture).
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";

// The alias hooks MUST be registered before any Target import resolves.
await import("./Alias-Hooks.js");

export type Counter = { N: number; F: number };

export const MakeCounter = (): Counter => ({ N: 0, F: 0 });

/** One check = the source suite's ok group; a throw marks the group FAIL
 *  and every later check still runs; Finish turns any failure into a
 *  non-zero exit for the runner. */
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

/** End-of-folder guard: any failed assertion is a folder failure. */
export const Finish = (Count: Counter, Name: string): number => {
	if (Count.F !== 0) {
		throw new Error(`${Name}: ${Count.F} failed check(s)`);
	}
	return Count.N;
};

// -- the real built artifacts (loaded AFTER the alias hooks registered) --

export const Library = await import("../../Target/Library.js");
export const Client = await import("../../Target/Client.js");

/** The loader row (the default export of the plugin entry). */
export const Plugin = Library.default;
/** The client half (the ./client export: { inject, apply }). */
export const ClientPlugin = Client.default;

/** The validated config the loader produces (defaults filled). */
export const Validate = (Raw: Record<string, unknown>): any =>
	(Plugin.Config as unknown as (Raw: Record<string, unknown>) => any)({ ...Raw });

// -- the fake client context --

/**
 * One run: the fake ctx's captures, plus the ones the tests drive. Every
 * seam records and returns a disposer, exactly as the real client services
 * do; effect runs its setup immediately and keeps the recorded label.
 */
export const Make = (): any => {
	const Locale: { namespace: string; dictionaries: Record<string, unknown> }[] = [];
	const Injects: Record<string, () => unknown> = {};
	const Registered: { options: any; component: () => unknown }[] = [];
	const Provided: Record<string, unknown> = {};
	const Effects: string[] = [];
	const Disposers: Array<() => unknown> = [];
	const Ctx: any = {
		locale: {
			register: (Namespace: string, Dictionaries: Record<string, unknown>) => {
				Locale.push({ namespace: Namespace, dictionaries: Dictionaries });
				return () => true;
			},
		},
		slots: {
			inject: (Slot: string, Factory: () => unknown) => {
				Injects[Slot] = Factory;
				return () => true;
			},
			register: (Options: any, Component: () => unknown) => {
				Registered.push({ options: Options, component: Component });
				return () => true;
			},
		},
		effect: (Setup: () => unknown, Label?: string) => {
			Effects.push(Label ?? "unnamed");
			const Disposer = Setup();
			if (typeof Disposer === "function") {
				Disposers.push(Disposer as () => unknown);
			}
			return () => true;
		},
		reflect: {
			provide: (Name: string, Value: unknown) => {
				Provided[Name] = Value;
				return () => true;
			},
		},
	};
	const Run: any = {
		Ctx,
		Locale,
		Injects,
		Registered,
		Provided,
		Effects,
		Disposers,
	};
	(ClientPlugin.apply as any)(Ctx);
	/** Open one slot point: run the injected factory, return the last
	 *  slots.register record it produced (the tab/overlay registration). */
	Run.OpenSlot = (Slot: string): any => {
		const Before = Registered.length;
		(Injects[Slot] as () => unknown)();
		return Registered.slice(Before);
	};
	return Run;
};

/**
 * The purity probe on the REAL built code: the client half must not touch
 * the Node APIs or the filesystem (the package is a pure browser module).
 * Reads Target/Client.js and asserts the forbidden tokens are absent.
 */
export const BuiltClientSource = (): string =>
	FileSystem.readFileSync(new URL("../Client.js", import.meta.url), "utf8");

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
	// The seam selfcheck: the fake ctx actually wires the client apply (the
	// vacuously-green backstop for every folder's fixture).
	const Run = Make();
	Check(Count, "selfcheck: the fake ctx registers the client apply wiring", () => {
		assert.equal(Run.Provided["playformFamilyPanel"] !== undefined, true);
		assert.deepEqual(Run.Effects, ["panel: dictionaries", "panel: family tab", "panel: overlay mount"]);
		assert.equal(Run.Locale.length, 1);
		assert.deepEqual(Object.keys(Run.Injects), ["conversation.view", "shell.overlay"]);
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

// Source/Test/Harness.ts - the shared test harness for the PANEL-FAMILY
// client-half smokes: the alias hooks load the REAL built Target (the
// ./client export and the loader row), and the fake CLIENT ctx captures
// exactly the seams the client body uses - locale.register, slots.inject,
// slots.register, effect, reflect.provide, ctx.get (the optional trace /
// settings / bridge services), and the logger. This is the
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

/** The optional services one run may expose on ctx.get. */
export type MakeOptions = {
	trace?: unknown;
	configForms?: unknown;
	bridge?: unknown;
	remote?: unknown;
};

/**
 * One run: the fake ctx's captures, plus the ones the tests drive. Every
 * seam records and returns a disposer, exactly as the real client services
 * do; effect runs its setup immediately and keeps the recorded label. A slot
 * keeps EVERY injected factory (the real slot service runs one callback per
 * declaration lifetime), and OpenSlot runs them all.
 */
export const Make = (Options: MakeOptions = {}): any => {
	const Locale: { namespace: string; dictionaries: Record<string, unknown> }[] = [];
	const Injects: Record<string, Array<() => unknown>> = {};
	const Registered: { options: any; component: (props?: any) => unknown }[] = [];
	const Provided: Record<string, unknown> = {};
	const Effects: string[] = [];
	const Disposers: Array<() => unknown> = [];
	const Services: Record<string, unknown> = {};
	const Info: string[] = [];
	const Warn: string[] = [];
	if (Options.trace !== undefined) Services["trace"] = Options.trace;
	if (Options.configForms !== undefined) Services["configForms"] = Options.configForms;
	if (Options.bridge !== undefined) Services["panelFamilyBridge"] = Options.bridge;
	if (Options.remote !== undefined) Services["remote"] = Options.remote;
	const Ctx: any = {
		get: (Name: string) => Services[Name],
		logger: {
			info: (Message: string) => {
				Info.push(Message);
			},
			warn: (Message: string) => {
				Warn.push(Message);
			},
			error: (Message: string) => {
				Warn.push(Message);
			},
			debug: () => undefined,
		},
		locale: {
			register: (Namespace: string, Dictionaries: Record<string, unknown>) => {
				Locale.push({ namespace: Namespace, dictionaries: Dictionaries });
				return () => true;
			},
		},
		slots: {
			inject: (Slot: string, Factory: () => unknown) => {
				Injects[Slot] = [...(Injects[Slot] ?? []), Factory];
				return () => true;
			},
			register: (Registration: any, Component: (props?: any) => unknown) => {
				Registered.push({ options: Registration, component: Component });
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
		Services,
		Info,
		Warn,
	};
	(ClientPlugin.apply as any)(Ctx);
	/** Open one slot point: run every injected factory, return the
	 *  slots.register records they produced (the tab/overlay/section
	 *  registrations). */
	Run.OpenSlot = (Slot: string): any => {
		const Before = Registered.length;
		for (const Factory of Injects[Slot] ?? []) {
			Factory();
		}
		return Registered.slice(Before);
	};
	return Run;
};

/** A fake D5 trace port: `on` + `ring`, plus an `emit` the tests drive. */
export const MakeTrace = (): any => {
	const Listeners = new Map<string, Set<(Envelope: any) => void>>();
	const Ring: any[] = [];
	let Sequence = 0;
	return {
		on: (Kind: string, Listener: (Envelope: any) => void) => {
			let Subscribers = Listeners.get(Kind);
			if (Subscribers === undefined) {
				Subscribers = new Set();
				Listeners.set(Kind, Subscribers);
			}
			Subscribers.add(Listener);
			return () => {
				Subscribers?.delete(Listener);
			};
		},
		ring: (Limit?: number) => [...Ring].reverse().slice(0, Limit ?? 256),
		emit: (Kind: string, Payload: Record<string, unknown>) => {
			Sequence += 1;
			const Envelope = {
				trace: `trace-${Sequence}`,
				kind: Kind,
				at: Sequence,
				payload: Payload,
			};
			Ring.push(Envelope);
			for (const Listener of Listeners.get(Kind) ?? []) Listener(Envelope);
			return Envelope;
		},
	};
};

/** A fake settings client (`ctx.configForms`): the describe mirror plus the
 *  namespace forms, with every mutate captured for the write assertions. */
export const MakeForms = (Namespaces: any[], Writable = true): any => {
	const Listeners = new Set<() => void>();
	const Snapshot = {
		status: "ready",
		view: { namespaces: Namespaces, writable: Writable },
		error: null,
	};
	const Mutations: any[] = [];
	const Forms = {
		describe: () => ({
			getSnapshot: () => Snapshot,
			subscribe: (Listener: () => void) => {
				Listeners.add(Listener);
				return () => {
					Listeners.delete(Listener);
				};
			},
			ensure: async () => {},
		}),
		get: (Namespace: string) => {
			const View = Namespaces.find((Entry) => Entry.ns === Namespace);
			return {
				getSnapshot: () => ({
					status: View === undefined ? "unavailable" : "ready",
					value: View?.value,
					base: View?.base,
					user: View?.user,
					revision: View?.revision,
					writable: Writable,
				}),
				subscribe: (Listener: () => void) => {
					Listeners.add(Listener);
					return () => {
						Listeners.delete(Listener);
					};
				},
				set: async (Field: string, Value: unknown) => {
					Mutations.push({
						namespace: Namespace,
						ops: [{ op: "set", path: [Field], value: Value }],
						revision: undefined,
					});
					return true;
				},
				unset: async (Field: string) => {
					Mutations.push({
						namespace: Namespace,
						ops: [{ op: "unset", path: [Field] }],
						revision: undefined,
					});
					return true;
				},
				mutate: async (Operations: any[], Revision?: number) => {
					Mutations.push({
						namespace: Namespace,
						ops: Operations,
						revision: Revision,
					});
					return true;
				},
			};
		},
	};
	return {
		Forms,
		Mutations,
		Notify: () => {
			for (const Listener of Listeners) Listener();
		},
	};
};

/** A fake plain-field bridge: every editFull write captured. */
export const MakeBridge = (): any => {
	const Writes: any[] = [];
	return {
		Writes,
		Bridge: {
			editFull: async (Namespace: string, Patch: Record<string, unknown>) => {
				Writes.push({ namespace: Namespace, patch: Patch });
				return true;
			},
		},
	};
};

/**
 * The purity probe on the REAL built code: the client half must not touch
 * the Node APIs or the filesystem (the package is a pure browser module).
 * Reads Target/Client.js and asserts the forbidden tokens are absent.
 */
export const BuiltClientSource = (): string =>
	FileSystem.readFileSync(new URL("../Client.js", import.meta.url), "utf8");

/**
 * The real built closure-factory bundle (`Target/Client.bundle.js`), for the
 * fake `window.__ModuleLoader__` execution check (the
 * client-dsh-panel-family-host precedent).
 */
export const BundleSource = (): string =>
	FileSystem.readFileSync(new URL("../Client.bundle.js", import.meta.url), "utf8");

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
		assert.deepEqual(Run.Effects, [
			"panel: dictionaries",
			"panel: trace source",
			"panel: family tab",
			"panel: overlay mount",
			"panel: adapter adapter-hook-dsh-normalize-dash",
			"panel: adapter adapter-hook-dsh-tool-coach",
			"panel: adapter adapter-hook-dsh-convention-suggester",
			"panel: adapter adapter-hook-dsh-normalize-quotes",
			"panel: adapter adapter-hook-dsh-normalize-ellipsis",
			"panel: adapter adapter-hook-dsh-normalize-spaces",
			"panel: adapter adapter-hook-dsh-normalize-invisible",
			"panel: adapter adapter-hook-dsh-normalize-fullwidth",
			"panel: adapter adapter-plugin-dsh-normalize-file",
			"panel: adapter adapter-hook-dsh-package-governor",
			"panel: adapter adapter-hook-dsh-package-pinner",
			"panel: adapter adapter-hook-dsh-cargo-governor",
			"panel: adapter adapter-hook-dsh-ccr",
		]);
		assert.equal(Run.Locale.length, 1);
		assert.deepEqual(Object.keys(Run.Injects), [
			"conversation.view",
			"shell.overlay",
			"playform.panel.section",
		]);
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

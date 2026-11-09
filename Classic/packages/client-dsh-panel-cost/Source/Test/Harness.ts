// Source/Test/Harness.ts - the shared test harness for the PANEL-COST
// smokes, with TWO faces because the package ships both halves: the alias
// hooks load the REAL built Target (the plugin entry and the ./client
// export), and each face is the fake ctx for one half.
//
// Make() is the fake HOST ctx: the plugin apply reads `ctx.get("webServer")`
// structurally and registers one route, so the face answers "webServer"
// with a fake server whose `register` captures the route into
// Provided.routes, answers undefined for anything else, and collects the
// logger lines. MakeClient() is the fake CLIENT ctx: the client apply
// registers dictionaries and mounts one tab, so the face captures
// locale.register, slots.inject, slots.register and effect, every seam
// returning a disposer exactly as the real services do.
//
// There is no root listener, no fs capture and no waterfall here - the
// host half touches no filesystem (the route body is the unwired
// placeholder) and the client half is a pure browser module that touches
// no filesystem and has no clock, so the harness has neither an fs seam
// nor a time seam; Styles() no-ops without a document and the suite never
// drives the DOM.
//
// Standalone selfcheck: `node Target/Test/Harness.js --selfcheck` proves
// both fake ctxs actually wire the real applies (the vacuously-green
// backstop for every folder's fixture).
import assert from "node:assert/strict";

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

/** The validated config the loader produces (defaults filled); the schema
 *  is the schemastery object itself, which is callable in JavaScript even
 *  though the type narrows it - the family precedent. */
export const Validate = (Raw: Record<string, unknown> = {}): any =>
	(Plugin.Config as unknown as (Raw: Record<string, unknown>) => any)({ ...Raw });

// -- the fake HOST context --

/**
 * One host run: `none` drops the webServer (the ctx.get-returns-undefined
 * posture), `defer` skips the apply call so a check can drive it itself.
 * The fake webServer records every register() call through Seen and
 * captures the route into Provided.routes - the only way a route can land
 * there is through the server port.
 */
export const Make = (Options: { none?: boolean; defer?: boolean } = {}): any => {
	const Routes: any[] = [];
	const Info: string[] = [];
	const Warn: string[] = [];
	const Provided: { routes: any[] } = { routes: Routes };
	const Seen = { n: 0 };
	const Server = {
		Seen,
		register: (Route: any) => {
			Seen.n += 1;
			Routes.push(Route);
			return () => true;
		},
	};
	const Services: Record<string, unknown> = {};
	if (Options.none !== true) Services["webServer"] = Server;
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
		effect: (Setup: () => unknown) => {
			const Disposer = Setup();
			return typeof Disposer === "function" ? Disposer : undefined;
		},
	};
	const Run: any = { Ctx, Provided, Routes, Server, Services, Info, Warn };
	if (Options.defer !== true) {
		(Plugin.apply as any)(Ctx);
	}
	return Run;
};

// -- the fake CLIENT context --

/**
 * One client run: every seam records and returns a disposer, exactly as
 * the real client services do; effect runs its setup immediately and
 * collects the recorded label. slots.inject runs the factory once (the
 * registration lifetime) and keeps the disposer the factory produced -
 * the tabs.register disposer the factory returns.
 */
export const MakeClient = (): any => {
	const Tabs: { options: any; component: (props?: any) => unknown }[] = [];
	const Locales: { namespace: string; dictionaries: Record<string, unknown> }[] = [];
	const Disposers: Array<() => unknown> = [];
	const Effects: string[] = [];
	const Info: string[] = [];
	const Warn: string[] = [];
	const Provided: {
		tabs: { options: any; component: (props?: any) => unknown }[];
		locales: { namespace: string; dictionaries: Record<string, unknown> }[];
		disposers: Array<() => unknown>;
	} = { tabs: Tabs, locales: Locales, disposers: Disposers };
	const Ctx: any = {
		get: () => undefined,
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
				Locales.push({ namespace: Namespace, dictionaries: Dictionaries });
				const Disposer = () => true;
				Disposers.push(Disposer);
				return Disposer;
			},
		},
		slots: {
			inject: (Slot: string, Factory: () => unknown) => {
				Effects.push(`inject ${Slot}`);
				const Disposer = Factory();
				if (typeof Disposer === "function") {
					Disposers.push(Disposer as () => unknown);
				}
				return () => true;
			},
			register: (Registration: any, Component: (props?: any) => unknown) => {
				Tabs.push({ options: Registration, component: Component });
				const Disposer = () => true;
				Disposers.push(Disposer);
				return Disposer;
			},
		},
		effect: (Setup: () => unknown, Label?: string) => {
			Effects.push(Label ?? "unnamed");
			Setup();
			return () => true;
		},
	};
	const Run: any = { Ctx, Provided, Tabs, Locales, Disposers, Effects, Info, Warn };
	(ClientPlugin.apply as any)(Ctx);
	return Run;
};

// Standalone entry: `node Target/Test/Harness.js --selfcheck`.
if (process.argv.includes("--selfcheck")) {
	const Count = MakeCounter();
	const HostRun = Make();
	Check(Count, "selfcheck: the fake host ctx registers the route wiring", () => {
		assert.deepEqual(
			HostRun.Provided.routes.map((Route: { path: string }) => Route.path),
			[
				"/api/playform-cost/session",
				"/api/playform-cost/catalogs",
				"/api/playform-cost/rates",
			],
		);
	});
	const ClientRun = MakeClient();
	Check(
		Count,
		"selfcheck: the fake client ctx registers the tab and the locale wiring",
		() => {
			assert.equal(ClientRun.Provided.tabs.length, 1);
			assert.equal(ClientRun.Provided.tabs[0].options.id, "playform-cost");
			assert.equal(ClientRun.Provided.locales.length, 1);
			assert.equal(ClientRun.Provided.locales[0].namespace, "client-dsh-panel-cost");
		},
	);
	if (Count.F === 0 && Count.N === 2) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

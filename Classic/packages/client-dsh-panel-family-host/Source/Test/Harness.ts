// Source/Test/Harness.ts - the shared test harness for the PANEL-FAMILY
// HOST tests: the fake ctx (the ctx.provide capture for the
// panelFamilyHost service, logger capture) + the REAL
// @playform/client-dsh-panel-family-host apply from its built Target - the
// family fake-ctx harness pattern, written ONCE per package and imported by
// every test folder. The host injects NO services and reads the REAL
// filesystem (its own logs, read-only), so the harness works against a
// disposable temp directory that stands in for the log root.
//
// Standalone selfcheck: `node Target/Test/Harness.js --selfcheck` runs the
// counter through one deliberate pass + one deliberate failure and exits 0
// only when both are counted exactly, then proves the fake ctx actually
// wires the plugin (the vacuously-green backstop for every folder's
// fixture).
//
// NO FAKE CLOCK: the host has no clock dependency at all - every assertion
// is on the endpoint results, the file bytes, and the activation lines.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import Plugin from "../../Target/Library.js";
import ClientPluginModule from "../../Target/Client.js";

export { Plugin };

/** The browser half (`./client`: { inject, apply, default }). */
export const ClientPlugin = ClientPluginModule;

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
 * assertions VERBATIM; a throw inside counts the whole group failed - every
 * later check still runs, and Finish turns any failure into a non-zero exit
 * for the runner.
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

// -- the suite-level fixtures (fresh per folder process) --

/**
 * A fresh disposable directory standing in for `<logRoot>`: the host reads
 * the family logs from the real fs (read-only), so the fixtures are real
 * files that the harness owns and can verify byte for byte.
 */
export const MakeRoot = (): string => FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "panel-host-smoke-"));

/**
 * The fake ctx: the provide capture records the panelFamilyHost service (the
 * real cordis registration is `ctx.provide`, removed with the owning fiber),
 * the logger records the activation line.
 */
export const Make = (Raw: any, Services: Record<string, unknown> = {}): any => {
	const Lines: string[] = [];
	const Warns: string[] = [];
	const Provided: any = {};
	const Context: any = {
		get: (Name: string) => Services[Name],
		logger: {
			info: (M: string) => {
				Lines.push(M);
			},
			warn: (M: string) => {
				Warns.push(M);
			},
		},
		provide: (Name: string, Value?: unknown) => {
			Provided[Name] = Value ?? true;
			return () => true;
		},
	};
	const Run: any = {
		Context,
		Lines,
		Warns,
		Provided,
		Raw,
		Services,
	};
	Run.Returned = (Plugin.apply as any)(Context, Raw);
	Run.Service = Provided["panelFamilyHost"];
	return Run;
};

/**
 * The real-config shape the loader hands to apply: volatile fields arrive as
 * `{ get }` cells. Build one via the plugin's schema. The cast is
 * fixture-only scaffolding.
 */
export const Validate = (Raw: Record<string, unknown>): any =>
	(Plugin.Config as unknown as (Raw: Record<string, unknown>) => any)({ ...Raw });

/**
 * Write one real fixture file into the log root and return its path.
 */
export const Put = (Dir: string, Name: string, Content: string): string => {
	const File = Path.join(Dir, Name);
	FileSystem.writeFileSync(File, Content, "utf8");
	return File;
};

/**
 * The bytes of one fixture file (for the read-only guarantee).
 */
export const Bytes = (File: string): Buffer => FileSystem.readFileSync(File);

/**
 * The names of everything in one directory (for the no-new-files guarantee).
 */
export const Names = (Dir: string): string[] => FileSystem.readdirSync(Dir).sort();

/**
 * A captured info line that carries the needle.
 */
export const LinesWith = (Run: any, Needle: string): string[] =>
	Run.Lines.filter((L: string) => L.includes(Needle));

// -- the plain-field bridge's config-editor seam --

/**
 * A fake `ctx.configEditor`: `entries()` answers the declared rows and
 * `edit(entry, change)` records the config the change callback derived. The
 * real editor validates, persists, and audits the write; the fake captures
 * exactly the two facts the bridge is responsible for (which entry, which
 * patch), so the assertions stay on the bridge's contract.
 */
export const MakeEditor = (Entries: any[]): any => {
	const Writes: any[] = [];
	const Editor = {
		entries: () => Entries,
		edit: async (Entry: any, Change: (current: any, inherited: any) => any) => {
			Writes.push({ id: Entry?.options?.id, patch: Change({}, {}) });
		},
	};
	return { Editor, Writes };
};

/** One fake profile entry carrying a serialized Schemastery schema. */
export const MakeEntry = (Id: string, Schema: any): any => ({
	options: { id: Id, name: `@playform/${Id}` },
	fiber: { runtime: { Config: Schema } },
});

/** A serialized-schema stand-in: the `{ toJSON }` shape the editor carries. */
export const MakeSchema = (Serialized: unknown): any => ({
	toJSON: () => Serialized,
});

// -- the D5 bus seam --

/**
 * A fake D5 bus (`ctx.trace`): `on` records listeners per kind, `emit`
 * completes an envelope and dispatches it, and `ring` answers newest first -
 * the factory's contract, without importing it.
 */
export const MakeBus = (): any => {
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

// -- the browser client half's context seam --

/**
 * A fake client ctx for the `./client` half: `get` answers the optional
 * Remote gateway face, `provide` captures the services the half publishes,
 * and `inject` records the service-ready callbacks (the test opens the
 * namespace by running them, the way the real seam fires).
 */
export const MakeClient = (Options: { remote?: unknown } = {}): any => {
	const Services: Record<string, unknown> = {};
	if (Options.remote !== undefined) Services["remote"] = Options.remote;
	const Provided: Record<string, unknown> = {};
	const Injects: { deps: string[]; callback: (ctx: any) => void }[] = [];
	const Context: any = {
		get: (Name: string) => Services[Name],
		provide: (Name: string, Value: unknown) => {
			Provided[Name] = Value;
			return () => true;
		},
		inject: (Deps: string[], Callback: (ctx: any) => void) => {
			Injects.push({ deps: Deps, callback: Callback });
			return () => true;
		},
	};
	const Run: any = { Context, Provided, Injects, Services };
	Run.Open = () => {
		for (const Entry of Injects) Entry.callback(Context);
	};
	return Run;
};

/** The built client bundle's source (the closure-factory envelope). */
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
	// The seam selfcheck: the fake ctx actually wires the plugin (the
	// vacuously-green backstop for every folder's fixture - a broken seam
	// would print fewer checks in every folder, which the runner's
	// expected-count guard catches; this proves the seam itself at build
	// time).
	const Run = Make(Validate({ enabled: true, logRoot: MakeRoot() }));
	Check(Count, "selfcheck: the fake ctx registers the plugin's apply-time wiring", () => {
		assert.equal(Run.Returned, undefined);
		assert.ok(Run.Service !== undefined);
		assert.equal(typeof Run.Service.tail, "function");
		assert.equal(typeof Run.Service.stats, "function");
		assert.deepEqual(Run.Lines, ["host: activated (enabled=true)"]);
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

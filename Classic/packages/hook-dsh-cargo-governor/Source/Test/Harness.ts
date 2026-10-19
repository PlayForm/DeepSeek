// Source/Test/Harness.ts - the shared test harness for the CARGO GOVERNOR
// tests: the fake ctx (on/emit/effect/get/fs capture with the services/files/
// sandboxMode/freshVersion knobs + the root seam) + the REAL
// @play/plugin-dsh-factory instance + the cargo governor's REAL built Target
// - the seams from the source suite (Classic/smokes/cargo-smoke.mjs),
// written ONCE per package and imported by every test folder. The suite-level
// fixtures (the tmp Root, the provided services map, the logger capture, the
// ProbeState holder, the seamStub subprocess fake) live here too: each folder
// process gets a fresh set (the module state is per-process), so every folder
// is standalone-green and the aggregate replays the same seams per folder.
//
// Standalone selfcheck: `node Target/Test/Harness.js --selfcheck` runs the
// counter through one deliberate pass + one deliberate failure and exits 0
// only when both are counted exactly, then proves the fake ctx actually wires
// the cargo governor (the vacuously-green backstop for every folder's
// fixture); prepublishOnly.sh gates the build on it. Imported as a library,
// this module only exports.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import * as Cargo from "../../Target/Library.js";
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
export const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "cargo-smoke-"));

export const Provided: Record<string, unknown> = {};

export const LoggerLines: { info: string[]; error: string[] } = { info: [], error: [] };

const fakeLogger = {
	info: (m: string) => LoggerLines.info.push(m),
	error: (m: string) => LoggerLines.error.push(m),
};

/**
 * The current scenario's `__hookDshGovernorCargoState`. A module-level live
 * binding: Boot assigns it, the folders read it - exactly the source suite's
 * `let ProbeState = null` shared holder.
 */
export let ProbeState: any = null;

/**
 * The fake ctx (the source suite's makeCtx, verbatim): the captures live in
 * the returned world object, and the fs backend reads/writes the world's
 * in-memory files map. `Over` carries the per-scenario knobs: services,
 * files, sandboxMode, freshVersion.
 */
export const MakeContext = (Over: any = {}): any => {
	const captured: any = {
		events: [],
		emitted: [],
		effects: [],
		serviceGets: [],
		writes: [],
		reads: [],
		controllers: [],
		started: [],
	};
	const services = Over.services ?? {};
	const files = Over.files ?? {};
	const store: any = { sandboxMode: Over.sandboxMode };
	const ctx: any = {
		logger: fakeLogger,
		reflect: {
			provide: (name: string, value: unknown) => {
				Provided[name] = value;
			},
		},
		on: (name: string, fn: unknown) => {
			captured.events.push([name, fn]);
			return () => true;
		},
		emit: (name: string, ...args: any[]) => {
			captured.emitted.push([name, ...args]);
		},
		effect: (fn: () => unknown, label: string) => {
			const dispose = fn();
			captured.effects.push([label, dispose]);
			return () => {};
		},
		// Attach's P5 factory probe (ctx.get "pluginFactory") must find the real
		// factory: the scenarios wire it as a ctx property
		// (`m.ctx.pluginFactory = Furnace`), so get falls through to the ctx
		// property when the services map lacks the name - without it the shared
		// sink is never bound and the pre-bind buffer never drains.
		get: (name: string) => {
			captured.serviceGets.push(name);
			return services[name] ?? ctx[name];
		},
		fs: {
			get sandboxMode() {
				return store.sandboxMode;
			},
			set sandboxMode(v: unknown) {
				store.sandboxMode = v;
			},
			readText: async (target: any, signal: any) => {
				captured.reads.push([target.displayPath, !!signal]);
				const file = files[target.displayPath];
				if (file === undefined) throw new Error("vanished");
				return file;
			},
			writeText: async (target: any, content: string, intent: any, signal: any, fence: unknown) => {
				captured.writes.push({
					path: target.displayPath,
					content,
					intent,
					signal: signal ?? null,
					fence: fence ?? null,
					inflight: ProbeState ? ProbeState.Inflight.size : -1,
				});
				files[target.displayPath] = content;
				return { version: Over.freshVersion ?? "fresh-v2" };
			},
			stat: async () => ({ version: "stat-v9" }),
		},
		// The ROOT seam: the Wire registers on the root scope (`Context.root.on`),
		// so the fake ctx must be its own root - ctx.root.on records into the
		// same captured.events (a harness seam; zero assertion changes).
		get root() {
			return ctx;
		},
	};
	return { ctx, captured, files, services, store };
};

// The REAL factory instance - class/service registered as ctx.pluginFactory.
// Created ONCE per folder process (the source suite's module-level instance).
export const Furnace: any = new FactoryClass({
	logger: fakeLogger,
	reflect: {
		provide: (name: string, value: unknown) => {
			Provided[name] = value;
		},
	},
	fs: { sandboxMode: undefined },
});

/**
 * The per-scenario directory fixture: a fresh dir under the tmp Root.
 */
export const Group = (name: string): string => {
	const dir = Path.join(Root, name);
	FileSystem.mkdirSync(dir, { recursive: true });
	return dir;
};

/**
 * The per-scenario ledger path fixture.
 */
export const LedgerFile = (name: string): string => Path.join(Root, `${name}.log`);

/**
 * The ledger reader (the source suite's, verbatim): the timestamp prefix is
 * stripped, blank lines dropped.
 */
export const Ledger = (file: string): string[] =>
	FileSystem.existsSync(file)
		? FileSystem.readFileSync(file, "utf8")
				.split("\n")
				.filter(Boolean)
				.map((l) => l.replace(/^\[[^\]]+\] /, ""))
		: [];

/**
 * The boot helper (the source suite's, verbatim): validate the config
 * (logFile + updateCooldownMs 0 unless overridden), apply, capture the state
 * probe and the fs/observed listener.
 */
export const Boot = (m: any, user: any = {}): any => {
	const cfg = Validate({ logFile: m.ledger, updateCooldownMs: 0, ...user });
	ProbeState = null;
	const ret = Cargo.apply(m.ctx, cfg);
	ProbeState = m.ctx.__hookDshGovernorCargoState;
	m.listener = m.captured.events.filter((e: any) => e[0] === "fs/observed").at(-1)?.[1];
	return { cfg, ret, listener: m.listener };
};

/**
 * The event trigger (the source suite's, verbatim).
 */
export const Fire = (m: any, t: any, version = "v1", actor = "edit"): void =>
	m.listener?.(t, { kind: "present", version }, { name: actor });

/**
 * The registry.json fixture writer (the source suite's, verbatim).
 */
export const Registry = (dir: string, names: unknown): void =>
	FileSystem.writeFileSync(
		Path.join(dir, "registry.json"),
		JSON.stringify({ effectiveLatest: names }),
	);

/**
 * The update-policy.json fixture writer (the source suite's, verbatim).
 */
export const Policy = (dir: string, body: unknown): void =>
	FileSystem.writeFileSync(Path.join(dir, "update-policy.json"), JSON.stringify(body));

/**
 * The subprocess seam stub (the source suite's, verbatim): records every
 * spawn request and answers with the given outcome/stdout.
 */
export const SeamStub = (outcome: any = { exitCode: 0 }, stdoutText = "") => {
	const calls: any[] = [];
	return {
		calls,
		resolveExecutable: async (bin: string) => `/resolved/${bin}`,
		spawn: (req: any) => {
			calls.push(req);
			return {
				done: Promise.resolve(outcome),
				collected: {
					stdout: { readFrom: () => ({ text: stdoutText }) },
					stderr: { readFrom: () => ({ text: "" }) },
				},
			};
		},
	};
};

/**
 * The settle helper (the source suite's, verbatim): 12 setImmediate rounds.
 */
export const Flush = async (): Promise<void> => {
	for (let i = 0; i < 12; i += 1) await new Promise((r) => setImmediate(r));
};

/**
 * The real-config shape the loader hands to apply (the cargo governor's
 * schema). The cast is fixture-only scaffolding.
 */
export const Validate = (Raw: Record<string, unknown>): any =>
	(Cargo.Config as unknown as (Raw: Record<string, unknown>) => any)({ ...Raw });

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
	// The seam selfcheck: the fake ctx actually wires the cargo governor (the
	// vacuously-green backstop for every folder's fixture - a broken seam would
	// print fewer checks in every folder, which the runner's expected-count
	// guard catches; this proves the seam itself at build time).
	const m = MakeContext({ services: { subprocess: SeamStub() } });
	m.ctx.pluginFactory = Furnace;
	m.ledger = LedgerFile("selfcheck");
	Boot(m);
	Check(Count, "selfcheck: the fake ctx registers the cargo governor's apply-time wiring", () => {
		assert.ok(m.captured.events.some((e: any) => e[0] === "fs/observed"));
		assert.equal(m.ctx.pluginFactory, Furnace);
		assert.equal(ProbeState.Module, "hook-dsh-governor-cargo");
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

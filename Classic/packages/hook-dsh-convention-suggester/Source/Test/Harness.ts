// Source/Test/Harness.ts - the shared test harness for the
// CONVENTION-SUGGESTER tests: the fake ctx (ctx listener capture, a DISTINCT
// root object, the effect runner, logger capture, a recording fs the plugin
// must never touch, reflect.provide capture) + the REAL
// @playform/plugin-dsh-factory instance from its built Target + the REAL
// convention-suggester apply from its built Target - the family fake-ctx +
// real-factory harness pattern, written ONCE per package and imported by
// every test folder. Each folder process gets a fresh set, so every folder
// is standalone-green and the aggregate replays the same seams per folder.
//
// Standalone selfcheck: `node Target/Test/Harness.js --selfcheck` proves the
// fake ctx actually wires the plugin (the vacuously-green backstop for every
// folder's fixture) and exits nonzero when it does not.
//
// NO FAKE CLOCK: the plugin has no clock dependency - the per-agent memory
// is a call counter and a map (the no-wall-clock rule); the only timestamps
// are the durable ledger's ISO stamps, asserted with an anchored regex.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import Plugin, * as Exports from "../../Target/Library.js";
import FactoryClass from "../../../plugin-dsh-factory/Target/Library.js";

export { Plugin, Exports };

/** The per-folder counter: N passing checks, F failing checks. */
export type Counter = { N: number; F: number };

/** A fresh counter for one test folder. */
export const MakeCounter = (): Counter => ({ N: 0, F: 0 });

/**
 * One check = the source suite's ok group. The callback carries that group's
 * assertions VERBATIM; a throw inside counts the whole group failed - every
 * later check still runs, and Finish turns any failure into a nonzero exit.
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

/** The async variant of Check; the caller must await it to keep order. */
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

/** End-of-folder guard: any failed assertion is a folder failure. */
export const Finish = (Count: Counter, Name: string): number => {
	if (Count.F !== 0) {
		throw new Error(`${Name}: ${Count.F} failed check(s)`);
	}
	return Count.N;
};

// -- the suite-level fixtures (fresh per folder process) --

export const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "convention-suggester-smoke-"));
export const Ledger = Path.join(Root, "convention-suggester.log");

/** Remove the durable ledger file: every scenario starts from an empty one. */
export const rm = (): void => {
	try {
		FileSystem.rmSync(Ledger);
	} catch {}
};

/** The durable ledger file's lines (the `[ISO] message` forms). */
export const LedgerLines = (): string[] =>
	(() => {
		try {
			return FileSystem.readFileSync(Ledger, "utf8").split("\n").filter(Boolean);
		} catch {
			return [];
		}
	})();

/** The ledger file lines that carry the needle (after the `[ISO] ` stamp). */
export const LedgerWith = (Needle: string): string[] =>
	LedgerLines().filter((Line) => Line.includes(Needle));

/** The anchored `[ISO] message` regex for one durable ledger message. */
export const Durable = (Message: string): RegExp =>
	new RegExp(
		`^\\[\\d{4}-\\d{2}-\\d{2}T[\\d:.]+Z\\] ${Message.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
	);

/** The single durable ledger line carrying the needle; throws when absent. */
export const DurableLine = (Needle: string): string => {
	const Line = LedgerWith(Needle)[0];
	if (Line === undefined) {
		throw new Error(`no durable ledger line for: ${Needle}`);
	}
	return Line;
};

/** The first durable ledger line; throws when the ledger is empty. */
export const FirstLine = (): string => {
	const Line = LedgerLines()[0];
	if (Line === undefined) {
		throw new Error("the durable ledger is empty");
	}
	return Line;
};

/** The REAL factory instance, constructed the way the factory's smoke does. */
export const Furnace: any = new FactoryClass({
	reflect: { provide: () => undefined },
} as any);

/**
 * The fake ctx: the ROOT object is DISTINCT from the ctx; ctx.on() captures
 * into CtxListeners; effect runs its setup immediately; fs records every
 * access and must stay untouched (the convention suggester is a
 * NON-MANIFEST module: zero ctx.fs calls).
 */
export const Make = (Raw: any): any => {
	const CtxListeners: any = {};
	const Lines: string[] = [];
	const Warns: string[] = [];
	const Effects: string[] = [];
	const RootNames: string[] = [];
	const Root: any = {
		on: (Name: string, _Listener: unknown) => {
			RootNames.push(Name);
			return () => true;
		},
	};
	const Fs: any = { reads: 0, writes: 0 };
	Fs.readText = async (..._Parts: unknown[]) => {
		Fs.reads++;
		throw new Error("readText must never be called");
	};
	Fs.writeText = async (..._Parts: unknown[]) => {
		Fs.writes++;
		throw new Error("writeText must never be called");
	};
	let Context: any;
	Context = {
		pluginFactory: Furnace,
		fs: Fs,
		logger: {
			info: (M: string) => {
				Lines.push(M);
			},
			warn: (M: string) => {
				Warns.push(M);
			},
		},
		on: (Name: string, Listener: unknown) => {
			CtxListeners[Name] = Listener;
			return () => true;
		},
		get: (Name: string) => Context[Name],
		effect: (Setup: () => unknown, Label?: string) => {
			Effects.push(Label ?? "unnamed");
			const Disposer = Setup();
			if (typeof Disposer === "function") {
				/* recorded, never called here */
			}
			return () => true;
		},
		root: Root,
		reflect: {
			provide: (Name: string, Value?: unknown) => {
				Context[Name] = Value;
				return () => true;
			},
		},
	};
	const Run: any = { Context, Root, CtxListeners, Lines, Warns, Effects, RootNames, Fs, Raw };
	Run.Returned = (Plugin.apply as any)(Context, Raw);
	Run.State = Context.__conventionSuggesterState;
	return Run;
};

/**
 * The real-config shape the loader hands to apply: volatile fields arrive as
 * `{ get }` cells. Build one via the plugin's schema.
 */
export const Validate = (Raw: Record<string, unknown>): any =>
	(Plugin.Config as unknown as (Raw: Record<string, unknown>) => any)({ ...Raw });

/** A standard enabled mount against the folder's ledger file. */
export const Setup = (): any => {
	rm();
	return Make(Validate({ logFile: Ledger, enabled: true }));
};

/** One judged tools/post-execute call: the agent is the caller's object. */
export const Post = (Run: any, Exec: any, Decision: any = { kind: "allow", additionalContexts: [] }): Promise<any> =>
	Run.CtxListeners["tools/post-execute"](Exec, {}, () => Promise.resolve(Decision));

/** One agent/pre-step call. */
export const Pre = (Run: any, Payload: any): Promise<any> =>
	Run.CtxListeners["agent/pre-step"](Payload, () => Promise.resolve("down"));

/** The standard agent object (the WeakMap key the tests share). Memoized by
 *  id: the per-agent memory is a WeakMap keyed on the exact agent object, so
 *  all calls with the same id must share one identity. */
const Agents = new Map<string, any>();
export const AgentOf = (Id: string): any => {
	if (!Agents.has(Id)) {
		Agents.set(Id, { agent: { id: Id } });
	}
	return Agents.get(Id);
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
	rm();
	const Run = Setup();
	Check(Count, "selfcheck: the fake ctx registers the plugin's two listeners", () => {
		assert.deepEqual(Object.keys(Run.CtxListeners), ["loader/volatile-update", "tools/post-execute", "agent/pre-step"]);
		assert.deepEqual(Run.RootNames, []);
		assert.equal(Run.Returned, undefined);
		assert.equal(Run.Fs.reads + Run.Fs.writes, 0);
		assert.deepEqual(Run.Lines, ["convention-suggester: activated (bundle 0.1.0, intents 4, threshold 0.75)"]);
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

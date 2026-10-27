// Source/Test/Harness.ts - the shared test harness for the SEARCH-SUGGESTER
// tests: the fake ctx (ctx listener capture, a DISTINCT root object, the
// effect runner, logger capture, a recording fs the plugin must never touch,
// reflect.provide capture) + the REAL @playform/plugin-dsh-factory instance
// from its built Target + the REAL search-suggester apply from its built
// Target - the family fake-ctx + real-factory harness pattern, written ONCE
// per package and imported by every test folder. Each folder process gets a
// fresh set, so every folder is standalone-green and the aggregate replays
// the same seams per folder.
//
// Standalone selfcheck: `node Target/Test/Harness.js --selfcheck` proves the
// fake ctx actually wires the plugin (the vacuously-green backstop for every
// folder's fixture) and exits nonzero when it does not.
//
// NO FAKE CLOCK: the ring, the cooldown and the learning window are counters
// driven by judged calls (the no-wall-clock rule); the only timestamps are
// the durable ledger's ISO stamps, asserted with an anchored regex. The
// learner's knowledge file is a real temp file (the plugin's own
// node:fs channel, not ctx.fs).
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

export const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "search-suggester-smoke-"));
export const Ledger = Path.join(Root, "search-suggester.log");
export const Knowledge = Path.join(Root, "knowledge.json");

/** Remove the durable ledger and the knowledge file: a fresh scenario. */
export const rm = (): void => {
	try {
		FileSystem.rmSync(Ledger);
	} catch {}
	try {
		FileSystem.rmSync(Knowledge);
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
 * access and must stay untouched (the suggester writes its knowledge through
 * its own node:fs channel, never through ctx.fs). `tools.register` captures
 * the registered tool definitions (the `suggestion_dismiss` tool) into
 * `Run.Tools`; `Prepare` runs BEFORE apply, so a test can mount the optional
 * `workspaceGraph` seam the projection probes.
 */
export const Make = (Raw: any, Prepare?: (Context: any) => void): any => {
	const CtxListeners: any = {};
	const Lines: string[] = [];
	const Warns: string[] = [];
	const Effects: string[] = [];
	const RootNames: string[] = [];
	const Tools: any[] = [];
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
		tools: {
			register: (Definition: unknown) => {
				Tools.push(Definition);
				return () => true;
			},
		},
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
	Prepare?.(Context);
	const Run: any = { Context, Root, CtxListeners, Lines, Warns, Effects, RootNames, Fs, Raw, Tools };
	Run.Returned = (Plugin.apply as any)(Context, Raw);
	Run.State = Context.__hookDshSearchSuggesterState;
	return Run;
};

/**
 * The fake workspaceGraph seam the projection probes: a snapshot over the
 * given nodes plus a counter of snapshot reads (the refresh test reads it).
 * A node is `{ path, kind, version? }`; the id and fingerprint are derived.
 */
export const FakeGraph = (
	Nodes: { path: string; kind: string; version?: string }[],
	Revision = "r1",
): any => {
	const Calls = { snapshots: 0 };
	return {
		Calls,
		snapshot: () => {
			Calls.snapshots += 1;
			return {
				indexRevision: Revision,
				nodes: Nodes.map((Node) => ({
					id: `${Node.kind}:${Node.path}`,
					kind: Node.kind,
					path: Node.path,
					version: Node.version ?? "1",
					fingerprint: "f",
				})),
				edges: [],
			};
		},
	};
};

/**
 * The real-config shape the loader hands to apply: volatile fields arrive as
 * `{ get }` cells. Build one via the plugin's schema, with the knowledge
 * file pointed at the folder's temp path.
 */
export const Validate = (Raw: Record<string, unknown>): any =>
	(Plugin.Config as unknown as (Raw: Record<string, unknown>) => any)({
		persistPath: Knowledge,
		...Raw,
	});

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

/** One system-prompt/assemble call (the second surface). */
export const Assemble = (Run: any, Agent: unknown): Promise<any> =>
	Run.CtxListeners["system-prompt/assemble"](
		{},
		{ agent: Agent },
		() => Promise.resolve({ sections: [{ name: "base", text: "b" }], contexts: [], tools: [], variables: {} }),
	);

/** The standard agent object (the WeakMap key the tests share). Memoized by
 *  id: the ring is a WeakMap keyed on the exact agent object, so all calls
 *  with the same id must share one identity. */
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
	Check(Count, "selfcheck: the fake ctx registers the plugin's four listeners", () => {
		assert.deepEqual(Object.keys(Run.CtxListeners), [
			"loader/volatile-update",
			"tools/post-execute",
			"agent/pre-step",
			"system-prompt/assemble",
			"tools/change",
		]);
		assert.deepEqual(Run.RootNames, []);
		assert.equal(Run.Returned, undefined);
		assert.equal(Run.Fs.reads + Run.Fs.writes, 0);
		assert.deepEqual(Run.Lines, ["hook-dsh-search-suggester: activated (bundle 0.3.0, intents 10, threshold 0.75)"]);
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

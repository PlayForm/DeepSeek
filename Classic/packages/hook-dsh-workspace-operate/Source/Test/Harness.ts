// Source/Test/Harness.ts - the shared test harness for the WORKSPACE-OPERATE
// tests: the fake ctx (root listener capture with a DISTINCT root object, the
// ctx listener capture, reflect.provide capture, the effect runner, logger
// capture, the FUNCTIONAL fs backing the staleness checks, and the fake
// workspaceGraph seam) + the REAL @playform/plugin-dsh-factory instance from
// its built Target + the REAL workspace-operate apply from its built Target -
// the family fake-ctx + real-factory harness pattern, written ONCE per
// package and imported by every test folder. Each folder process gets a fresh
// set, so every folder is standalone-green and the aggregate replays the same
// seams per folder.
//
// Standalone selfcheck: `node Target/Test/Harness.js --selfcheck` runs the
// counter through one deliberate pass + one deliberate failure and exits 0
// only when both are counted exactly, then proves the fake ctx actually
// wires the plugin (the vacuously-green backstop for every folder's
// fixture).
//
// NO CLOCK: the operate hook has no time dependency - proposals and ids are
// sequenced by the plugin's own monotonic counter (the no-wall-clock rule),
// so the harness needs no time seam.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import Plugin from "../../Target/Library.js";
import FactoryClass from "../../../plugin-dsh-factory/Target/Library.js";

export { Plugin };

/**
 * The per-folder counter: `N` = passing checks, `F` = failing checks.
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
 * One check = the source suite's ok group. A throw inside counts the whole
 * group failed - every later check still runs, and Finish turns any failure
 * into a non-zero exit for the runner.
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
 * PASS count for the runner's `N PASS - <Name>` line.
 */
export const Finish = (Count: Counter, Name: string): number => {
	if (Count.F !== 0) {
		throw new Error(`${Name}: ${Count.F} failed check(s)`);
	}
	return Count.N;
};

// -- the suite-level fixtures (fresh per folder process) --

export const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "workspace-operate-smoke-"));
export const Ledger = Path.join(Root, "operate.log");

/**
 * Remove the durable ledger file: every scenario starts from an empty ledger.
 */
export const rm = (): void => {
	try {
		FileSystem.rmSync(Ledger);
	} catch {}
};

/**
 * The durable ledger file's lines (the `[ISO] message` forms).
 */
export const LedgerLines = (): string[] =>
	(() => {
		try {
			return FileSystem.readFileSync(Ledger, "utf8").split("\n").filter(Boolean);
		} catch {
			return [];
		}
	})();

/**
 * The REAL factory instance (constructed exactly the way the factory's own
 * smoke does - the Service base constructor registers through
 * ctx.reflect.probe; the stub context is used once and discarded).
 */
export const Furnace: any = new FactoryClass({
	reflect: { provide: () => undefined },
} as any);

/**
 * The FUNCTIONAL fake fs: each seeded file carries a version and a text;
 * writeText RECORDS then THROWS - the operate hook never writes a file (the
 * purity rule: the proposal's application is the later approve/merge steps'
 * work).
 */
export const FakeFs = (Files: Record<string, { version: string; text: string }> = {}): any => {
	const Fs: any = {
		files: Files,
		writes: [] as unknown[][],
		reads: [] as unknown[],
		resolved: [] as string[],
		stats: [] as unknown[],
	};
	Fs.resolve = async (P: string) => {
		Fs.resolved.push(P);
		return { targetKey: P, displayPath: P };
	};
	Fs.stat = async (Target: any) => {
		Fs.stats.push(Target);
		const File = Fs.files[Target.displayPath];
		return File === undefined ? undefined : { version: File.version, type: "file" };
	};
	Fs.readText = async (Target: any) => {
		Fs.reads.push(Target);
		const File = Fs.files[Target.displayPath];
		return File === undefined ? undefined : File.text;
	};
	Fs.writeText = async (...Parts: unknown[]) => {
		Fs.writes.push(Parts);
		throw new Error("writeText must never be called");
	};
	return Fs;
};

/**
 * The fake workspaceGraph seam: find() filters by kind/name/path over the
 * seeded nodes, expand() returns the seeded edges for the node id, snapshot()
 * is a stub. Structural shape check: find/expand/snapshot all present.
 */
export const FakeGraph = (Nodes: any[], Edges: any[] = []): any => ({
	find: (Query: any) =>
		Nodes.filter((Node) => {
			switch (true) {
				case Query.kind !== undefined && Node.kind !== Query.kind:
					return false;
				case Query.name !== undefined && Node.name !== Query.name:
					return false;
				case Query.path !== undefined && Node.path !== Query.path:
					return false;
				default:
					return true;
			}
		}).slice(0, Query.limit ?? Nodes.length),
	expand: (Id: string) => ({
		nodes: Nodes.filter((Node) => Node.id === Id),
		edges: Edges.filter((Edge) => Edge.from === Id),
	}),
	snapshot: () => ({ indexRevision: "r1", nodes: Nodes, edges: Edges }),
});

/**
 * The fake ctx: the ROOT object is DISTINCT from the ctx (its on() is the
 * only root capture), ctx.on() captures into a SEPARATE map (the loader
 * volatile-update listener the factory's State builder registers lands
 * there), reflect.provide captures the service registrations, effect runs
 * its setup immediately and records the disposer, get() resolves through the
 * context properties.
 */
export const Make = (Raw: any, Graph?: any): any => {
	const Listeners: any = {};
	const CtxListeners: any = {};
	const Lines: string[] = [];
	const Warns: string[] = [];
	const Provided: any = {};
	const Effects: string[] = [];
	const Disposers: Array<() => void> = [];
	const RootNames: string[] = [];
	const Root: any = {
		on: (Name: string, Listener: unknown) => {
			RootNames.push(Name);
			Listeners[Name] = Listener;
			return () => true;
		},
		emit: () => true,
	};
	const Fs = FakeFs({
		"/repo/src/a.ts": { version: "v1", text: "line1\nline2\nline3" },
		"/repo/src/b.ts": { version: "v1", text: "one\ntwo" },
	});
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
				Disposers.push(Disposer as () => void);
			}
			return () => true;
		},
		root: Root,
		reflect: {
			provide: (Name: string, Value?: unknown) => {
				Provided[Name] = Value ?? true;
				Context[Name] = Value;
				return () => true;
			},
		},
	};
	if (Graph !== undefined) {
		Context.workspaceGraph = Graph;
	}
	const Run: any = {
		Context,
		Root,
		Listeners,
		CtxListeners,
		Lines,
		Warns,
		Provided,
		Effects,
		Disposers,
		RootNames,
		Raw,
		Fs,
	};
	Run.Returned = (Plugin.apply as any)(Context, Raw);
	Run.State = Context.__hookDshWorkspaceOperateState;
	return Run;
};

/**
 * The real-config shape the loader hands to apply: volatile fields arrive as
 * `{ get }` cells. Build one via the plugin's schema.
 */
export const Validate = (Raw: Record<string, unknown>): any =>
	(Plugin.Config as unknown as (Raw: Record<string, unknown>) => any)({ ...Raw });

/**
 * A symbol node for the fake graph.
 */
export const SymbolNode = (Name: string, Path: string, Id = `sym-${Name}`): any => ({
	id: Id,
	kind: "Symbol",
	path: Path,
	name: Name,
	fingerprint: `f-${Name}`,
	version: "v1",
});

/**
 * A file node for the fake graph.
 */
export const FileNode = (Path: string, Id = `file-${Path}`): any => ({
	id: Id,
	kind: "File",
	path: Path,
	fingerprint: `f-${Id}`,
	version: "v1",
});

/**
 * Fire one fs/observed event through the ROOT listener (the actor default is
 * a plain foreign actor object - never the hook's own).
 */
export const Fire = (
	Run: any,
	Path: string,
	Version: string,
	Actor: any = { agent: { id: "agent-a" } },
): void => {
	Run.Listeners["fs/observed"](
		{ displayPath: Path, targetKey: Path },
		{ kind: "present", version: Version },
		Actor,
	);
};

/**
 * A captured info line that carries the needle.
 */
export const LinesWith = (Run: any, Needle: string): string[] =>
	Run.Lines.filter((L: string) => L.includes(Needle));

/**
 * The ledger file lines that carry the needle (after the `[ISO] ` stamp).
 */
export const LedgerWith = (Needle: string): string[] =>
	LedgerLines().filter((L: string) => L.includes(Needle));

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
	// The seam selfcheck: the fake ctx actually wires the plugin.
	rm();
	const Run = Make(Validate({ logFile: Ledger, enabled: true }));
	Check(Count, "selfcheck: the fake ctx registers the plugin's apply-time wiring", () => {
		assert.equal(Run.Returned, undefined);
		assert.ok(Run.State !== undefined);
		assert.ok(Run.Provided["workspaceOperate"] !== undefined);
		assert.deepEqual(Run.RootNames, ["fs/observed"]);
		assert.deepEqual(Run.Lines, ["operate: activated (domain=workspace_operate)"]);
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

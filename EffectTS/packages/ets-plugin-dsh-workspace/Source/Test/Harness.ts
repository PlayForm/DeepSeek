// Source/Test/Harness.ts - the shared test harness for the WORKSPACE agent
// tests: the fake ctx (tools registration capture, ctx listener capture with
// the loader/volatile-update listener, reflect.provide capture, the effect
// runner, logger capture, the throwing fs purity seam, the DISTINCT root
// object) + the REAL @playform/ets-plugin-dsh-factory instance from its built
// Target + the REAL workspace apply from its built Target + a deterministic
// FAKE graph standing in for the injected workspaceGraph service - the
// family fake-ctx + real-factory harness pattern, written ONCE per package
// and imported by every test folder. Each folder process gets a fresh set,
// so every folder is standalone-green.
//
// Standalone selfcheck: `node Target/Test/Harness.js --selfcheck` runs the
// counter through one deliberate pass + one deliberate failure and exits 0
// only when both are counted exactly, then proves the fake ctx actually
// wires the plugin (the vacuously-green backstop for every folder's
// fixture).
//
// NO FAKE CLOCK: the plugin has no clock dependency on the tool path (the
// packet's tokens are a pure character count, the graph revision is a
// fixture string) - the no-wall-clock rule holds without a time seam.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import Plugin from "../../Target/Library.js";
import FactoryClass from "../../../ets-plugin-dsh-factory/Target/Library.js";
import GraphClass from "../../../ets-plugin-dsh-workspace-graph/Target/Library.js";
import type {
	Edge,
	Expansion,
	FindQuery,
	GraphSnapshot,
	GraphStatistics,
	IndexOutcome,
	Node,
	NodeKind,
	WorkspaceGraph,
} from "../../Target/Interface/Graph.js";

export { Plugin };

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
 * The async variant of Check, for folders whose assertions await (the five
 * tools' execute is async). Same counting and printing; the caller must
 * await it so checks stay sequential and Finish sees the final counts.
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

export const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "workspace-smoke-"));
export const Ledger = Path.join(Root, "workspace.log");

/**
 * Remove the durable ledger file: every scenario starts from an empty ledger
 * so the `[ISO]` file assertions see exactly the lines their scenario wrote.
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
 * The ledger file lines that carry the needle (after the `[ISO] ` stamp).
 */
export const LedgerWith = (Needle: string): string[] =>
	LedgerLines().filter((Line) => Line.includes(Needle));

/**
 * The REAL factory instance (constructed exactly the way the factory's own
 * smoke does - the Service base constructor registers through
 * ctx.reflect.provide; the stub context is used once and discarded).
 */
export const Furnace: any = new FactoryClass({
	reflect: { provide: () => undefined },
} as any);

/**
 * The glob matcher for the FAKE graph's find pattern (the same translation
 * the family's own machine uses: `**` crosses separators, `*` and `?` stay
 * within one).
 */
const Glob = (Pattern: string): RegExp => {
	const Escaped = Pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
	const Source = Escaped
		.replace(/\*\*\//g, "(?:.*/)?")
		.replace(/\*\*/g, ".*")
		.replace(/\*/g, "[^/]*")
		.replace(/\?/g, ".");
	return new RegExp(`^${Source}$`);
};

/**
 * The deterministic fake workspaceGraph service: find filters by kind, exact
 * name, and glob pattern over the id/path; expand walks outgoing edges up to
 * the depth; snapshot returns the full fixture with its revision; getNode is
 * an exact id lookup. All answers come from the fixed fixture - no clocks,
 * no randomness (the graph contract's determinism).
 */
export const FakeGraph = (
	Nodes: Node[] = [],
	Edges: Edge[] = [],
	Revision: string = "rev-1",
): WorkspaceGraph & { graph: { nodes: Node[]; edges: Edge[] } } => {
	const Find = (Query: FindQuery): Node[] => {
		let Matched = Nodes.filter((Node_) => {
			if (Query.kind !== undefined && Node_.kind !== Query.kind) {
				return false;
			}
			if (Query.name !== undefined && Node_.name !== Query.name) {
				return false;
			}
			if (Query.pattern !== undefined) {
				const Pattern = Glob(Query.pattern);
				if (!Pattern.test(Node_.id) && !(Node_.path !== undefined && Pattern.test(Node_.path))) {
					return false;
				}
			}
			return true;
		});
		if (Query.limit !== undefined) {
			Matched = Matched.slice(0, Query.limit);
		}
		return Matched;
	};
	const Outgoing = (Id: string): Edge[] => Edges.filter((Edge_) => Edge_.from === Id);
	const Self: WorkspaceGraph = {
		indexFile: (_Path: string): Promise<IndexOutcome> =>
			Promise.resolve({ path: String(_Path), status: "indexed", nodes: 0, edges: 0 }),
		// The fake graph does not walk a filesystem: the five-tool folder over a
		// REAL populated graph (Real-Graph-And-Tools) covers the indexing
		// trigger; here the summary is the fixed fixture's file count.
		indexWorkspace: (
			_Root?: string,
			_Options?: { maxFiles?: number },
		): Promise<{ indexed: number; skipped: number; failed: number; files: number }> =>
			Promise.resolve({
				indexed: 0,
				skipped: 0,
				failed: 0,
				files: Nodes.filter((Node_) => Node_.kind === "File").length,
			}),
		removeFile: (_Path: string): Promise<boolean> => Promise.resolve(true),
		getNode: (Id: string): Node | undefined => Nodes.find((Node_) => Node_.id === Id),
		find: Find,
		expand: (Id: string, Options?: { kinds?: string[]; depth?: number }): Expansion => {
			const Depth = Options?.depth ?? 1;
			const Wanted = Options?.kinds;
			const Seen = new Set<string>([Id]);
			const Frontier: string[] = [Id];
			const Found: Node[] = [];
			const FoundEdges: Edge[] = [];
			for (let Level = 0; Level < Depth; Level++) {
				const Next: string[] = [];
				for (const Current of Frontier) {
					for (const Edge_ of Outgoing(Current)) {
						if (Wanted !== undefined && !Wanted.includes(Edge_.kind)) {
							continue;
						}
						FoundEdges.push(Edge_);
						if (!Seen.has(Edge_.to)) {
							Seen.add(Edge_.to);
							Next.push(Edge_.to);
							const Node_ = Nodes.find((N) => N.id === Edge_.to);
							if (Node_ !== undefined) {
								Found.push(Node_);
							}
						}
					}
				}
				Frontier.splice(0, Frontier.length, ...Next);
			}
			return { nodes: Found, edges: FoundEdges };
		},
		snapshot: (): GraphSnapshot => ({ indexRevision: Revision, nodes: Nodes, edges: Edges }),
		statistics: (): GraphStatistics => ({
			files: Nodes.filter((Node_) => Node_.kind === "File").length,
			nodes: Nodes.length,
			edges: Edges.length,
			indexRevision: Revision,
		}),
	};
	return Object.assign(Self, { graph: { nodes: Nodes, edges: Edges } });
};

/**
 * The standard two-file graph fixture: src/a.ts imports src/b.ts (the
 * imports edge drives the map's entry points and hot symbols); each file
 * carries one symbol; a.ts carries a DocSection named "Module A".
 */
export const StandardGraph = (): WorkspaceGraph & { graph: { nodes: Node[]; edges: Edge[] } } => {
	const Node = (Id: string, Kind: NodeKind, Path: string, Extra: Partial<Node> = {}): Node => ({
		id: Id,
		kind: Kind,
		path: Path,
		fingerprint: `fp-${Id}`,
		version: "1",
		...Extra,
	});
	return FakeGraph(
		[
			Node("File:src/a.ts", "File", "src/a.ts", { span: { startLine: 1, endLine: 20 } }),
			Node("File:src/b.ts", "File", "src/b.ts", { span: { startLine: 1, endLine: 4 } }),
			Node("Doc:src/a.ts", "DocSection", "src/a.ts", { name: "Module A" }),
			Node("Symbol:a", "Symbol", "src/a.ts", { name: "aFn", span: { startLine: 1, endLine: 9 } }),
			Node("Symbol:b", "Symbol", "src/b.ts", { name: "bFn", span: { startLine: 1, endLine: 4 } }),
		],
		[
			{ kind: "contains", from: "File:src/a.ts", to: "Symbol:a" },
			{ kind: "contains", from: "File:src/b.ts", to: "Symbol:b" },
			{ kind: "imports", from: "File:src/a.ts", to: "File:src/b.ts" },
		],
	);
};

/**
 * The REAL workspace graph service (from its built Target) over a
 * deterministic in-memory file map: resolve/stat/readText/listDir/contains
 * drive the real walk and the real parser, so the tools in the
 * Real-Graph-And-Tools folder answer from a genuinely populated graph
 * instead of FakeGraph. The graph gets its OWN ctx (its fs must work); the
 * workspace plugin's ctx fs stays the throwing purity guard.
 */
export const RealGraph = (
	Files: Record<string, string>,
	Options: Record<string, unknown> = {},
): any => {
	const Names = Object.keys(Files);
	const Info = (Display: string): { version: string; type: string; size: number } | undefined => {
		const Text = Files[Display];
		if (Text !== undefined) {
			return { version: "v1", type: "file", size: Text.length };
		}
		return Names.some((Key) => Key.startsWith(`${Display}/`))
			? { version: "v1", type: "directory", size: 0 }
			: undefined;
	};
	const Fs: any = {
		resolve: async (Path_: string) => ({ targetKey: Path_, displayPath: Path_ }),
		stat: async (Target: any) => Info(String(Target.displayPath)),
		readText: async (Target: any) => {
			const Text = Files[String(Target.displayPath)];
			if (Text === undefined) {
				throw new Error("vanished");
			}
			return Text;
		},
		listDir: async (Target: any) => {
			const Directory = String(Target.displayPath).replace(/\/$/, "");
			const Found = new Set<string>();
			for (const Key of Names) {
				if (!Key.startsWith(`${Directory}/`)) {
					continue;
				}
				Found.add(Key.slice(Directory.length + 1).split("/")[0] as string);
			}
			return [...Found].sort((Left, Right) => Left.localeCompare(Right)).map((Name) => {
				const Display = `${Directory}/${Name}`;
				const Meta = Info(Display);
				return {
					name: Name,
					type: Meta?.type ?? "other",
					target: { targetKey: Display, displayPath: Display },
				};
			});
		},
		contains: (Parent: any, Child: any) => {
			const Left = String(Parent.displayPath);
			const Right = String(Child.displayPath);
			return Right === Left || Right.startsWith(`${Left}/`);
		},
		writeText: async () => {
			throw new Error("writeText must never be called");
		},
	};
	const GraphContext: any = {
		fs: Fs,
		logger: { info: () => undefined, warn: () => undefined, error: () => undefined },
		reflect: { provide: () => undefined },
	};
	GraphContext.root = GraphContext;
	return new GraphClass(GraphContext, GraphClass.Config({ enabled: true, ...Options }));
};

/**
 * The fake ctx: the ROOT object is DISTINCT from the ctx (its on() is the
 * only root capture and its emit() the only root emit capture), ctx.on()
 * captures into a SEPARATE map (the factory State builder's
 * loader/volatile-update listener lands there), tools.register captures the
 * tool definitions, reflect.provide captures any service registration (the
 * workspace agent is a pure consumer - it registers none), the fs SEAM
 * RECORDS then THROWS - the agent must never touch file content (purity).
 */
export const Make = (Raw: any, Graph?: WorkspaceGraph): any => {
	const Registered: any[] = [];
	const CtxListeners: any = {};
	const RootListeners: any = {};
	const RootEmits: any[][] = [];
	const Lines: string[] = [];
	const Warns: string[] = [];
	const Provided: any = {};
	const Effects: string[] = [];
	const Fs = {
		resolves: [] as string[],
		stats: [] as string[],
		reads: [] as string[],
		writes: [] as string[],
	};
	const ThrowFs: any = {
		...Fs,
		resolve: async (P: string) => {
			Fs.resolves.push(P);
			throw new Error("resolve must never be called");
		},
		stat: async (T: any) => {
			Fs.stats.push(T?.displayPath ?? String(T));
			throw new Error("stat must never be called");
		},
		readText: async (T: any) => {
			Fs.reads.push(T?.displayPath ?? String(T));
			throw new Error("readText must never be called");
		},
		writeText: async (T: any) => {
			Fs.writes.push(T?.displayPath ?? String(T));
			throw new Error("writeText must never be called");
		},
	};
	const Root: any = {
		on: (Name: string, Listener: unknown) => {
			RootListeners[Name] = Listener;
			return () => true;
		},
		emit: (Name: string, ...Args: unknown[]) => {
			RootEmits.push([Name, ...Args]);
		},
	};
	let Context: any;
	Context = {
		pluginFactory: Furnace,
		workspaceGraph: Graph,
		tools: {
			register: (Definition: unknown) => {
				Registered.push(Definition);
				return () => true;
			},
		},
		fs: ThrowFs,
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
			Setup();
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
	const Run: any = {
		Context,
		Root,
		RootListeners,
		RootEmits,
		CtxListeners,
		Lines,
		Warns,
		Provided,
		Effects,
		Registered,
		Raw,
		Fs: ThrowFs,
		Graph,
	};
	Run.Returned = (Plugin.apply as any)(Context, Raw);
	Run.State = Context.__pluginDshWorkspaceState;
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
 * The captured tool definition by name.
 */
export const Tool = (Run: any, Name: string): any =>
	Run.Registered.find((Definition: any) => Definition.name === Name);

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
	rm();
	const Run = Make(Validate({ logFile: Ledger, enabled: true }), StandardGraph());
	Check(Count, "selfcheck: the fake ctx registers the five tools", () => {
		assert.deepEqual(
			Run.Registered.map((Definition: any) => Definition.name),
			[
				"workspace_map",
				"workspace_find",
				"workspace_expand",
				"workspace_context",
				"workspace_index",
			],
		);
		assert.ok(Run.State !== undefined);
		assert.deepEqual(Run.Lines, ["plugin-dsh-workspace: activated (bundle 0.3.0, tools=5)"]);
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

// Source/Test/Harness.ts - the shared test harness for the WORKSPACE GRAPH
// tests: the fake ctx (fs resolve/stat/readText over a files map with a
// captured writeText, the reflect.provide capture, the logger capture, the
// root seam) + the REAL workspace graph class from its built Target - the
// family fake-ctx + real-built-library harness pattern, written ONCE per
// package and imported by every test folder.
//
// Standalone selfcheck: `node Target/Test/Harness.js --selfcheck` runs the
// counter through one deliberate pass + one deliberate failure and exits 0
// only when both are counted exactly, then proves the fake ctx actually
// constructs the service (the vacuously-green backstop for every folder's
// fixture); prepublishOnly.sh gates the build on it.
//
// THE FAKE STORAGE: MakeGraph optionally attaches a FakeStorage facility as
// both `ctx.storage.domain` and `ctx.storageDomain` - the two probes the
// real Open tries - so the KV round-trip runs through the fake domain exactly
// as the service code does. The A7 purity guard (zero writeText calls) reads
// the summed captures of every fake ctx created in the folder.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import { Names as TraceNames } from "@playform/lib-dsh-trace";
import CreateTrace from "../../../plugin-dsh-factory/Target/Function/Trace.js";
import FactoryClass from "../../../plugin-dsh-factory/Target/Library.js";
import GraphClass from "../../Target/Library.js";

export { GraphClass };

/**
 * The REAL factory instance (constructed the way the factory's own smoke and
 * the semantics harness do). The graph itself never touches it; it is on the
 * fake ctx so a SIBLING plugin (the semantics service, mounted by the
 * References folder) can build its State on the same context.
 */
export const Furnace: any = new FactoryClass({
	reflect: { provide: () => undefined },
} as any);

/**
 * The per-folder counter: `N` = passing checks, `F` = failing checks. Passed
 * by reference so Check can bump it from inside its callback.
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
 * The async variant of Check, for folders whose assertions await (indexFile,
 * removeFile, the storage open). Same counting and printing; the caller must
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

/**
 * Every fake ctx created in this folder process, in creation order - the
 * A7 purity guard sums their writeText captures and asserts zero.
 */
export const Contexts: any[] = [];

/**
 * The fake ctx: fs resolve/stat/readText/listDir/contains over the `files`
 * map (or over a REAL temp directory when `Raw.disk` names one) with the
 * writeText capture (which MUST stay untouched - A7), the reflect.provide
 * capture, the logger capture, the root handler capture (`fs/observed`), and
 * the root seam (the fake ctx is its own root). The typing is `any`
 * deliberately - fixture-only scaffolding.
 */
export const Make = (Raw: any = {}): any => {
	const files: Record<string, string> = Raw.files ?? {};
	const disk: string | undefined = Raw.disk;
	const writes: { path: string; content: string }[] = [];
	const reads: string[] = [];
	const stats: string[] = [];
	const loggerLines: string[] = [];
	const provided: Record<string, unknown> = {};
	const handlers: Record<string, ((...Parts: any[]) => void)[]> = {};
	const effects: string[] = [];
	const disposers: Array<() => void> = [];
	const subscriptions = new Map<string, number>();
	const Trace = CreateTrace();
	const Subscribe = Trace.on.bind(Trace);
	// Count live subscriptions per event name: the mechanism assertion (the
	// graph consumes observe/stamp from the bus; it registers NOTHING on
	// fs/observed). The disposer decrements, so an unload is observable too.
	Trace.on = (Name: string, Listener: (Envelope: any) => void) => {
		subscriptions.set(Name, (subscriptions.get(Name) ?? 0) + 1);
		const Dispose = Subscribe(Name, Listener);
		return () => {
			subscriptions.set(Name, Math.max(0, (subscriptions.get(Name) ?? 1) - 1));
			Dispose();
		};
	};
	/** The absolute display path of a fixture path (the disk mode's root join). */
	const Display = (P: string): string => (disk === undefined ? P : Path.resolve(disk, P));
	/** The canonical identity: a realpath on disk, the path itself in map mode. */
	const Identity = (P: string): string => {
		const Absolute = Display(P);
		if (disk === undefined) {
			return Absolute;
		}
		try {
			return FileSystem.realpathSync(Absolute);
		} catch {
			return Absolute;
		}
	};
	const Info = (Target: any): { version: string; type: string; size: number } | undefined => {
		if (disk === undefined) {
			const Text = files[Target.displayPath];
			if (Text !== undefined) {
				return { version: "v1", type: "file", size: Text.length };
			}
			return Object.keys(files).some((Key) => Key.startsWith(`${Target.displayPath}/`))
				? { version: "v1", type: "directory", size: 0 }
				: undefined;
		}
		try {
			const Stat = FileSystem.statSync(String(Target.targetKey));
			return {
				version: `${Stat.mtimeMs}-${Stat.size}`,
				type: Stat.isFile() ? "file" : Stat.isDirectory() ? "directory" : "other",
				size: Stat.size,
			};
		} catch {
			return undefined;
		}
	};
	const Children = (Target: any): any[] => {
		const Directory = String(Target.displayPath).replace(/\/$/, "");
		if (disk !== undefined) {
			try {
				return FileSystem.readdirSync(String(Target.targetKey), { withFileTypes: true }).map(
					(Entry) => {
						const ChildDisplay = Path.join(Directory, Entry.name);
						return { name: Entry.name, display: ChildDisplay };
					},
				);
			} catch {
				throw new Error(`cannot list ${Directory}: not found`);
			}
		}
		const Names = new Set<string>();
		for (const Key of Object.keys(files)) {
			if (!Key.startsWith(`${Directory}/`)) {
				continue;
			}
			Names.add(Key.slice(Directory.length + 1).split("/")[0] as string);
		}
		return [...Names].sort((Left, Right) => Left.localeCompare(Right)).map((Name) => ({
			name: Name,
			display: `${Directory}/${Name}`,
		}));
	};
	const Context: any = {
		pluginFactory: Furnace,
		logger: {
			info: (M: string) => loggerLines.push(M),
			warn: (M: string) => loggerLines.push(M),
			error: (M: string) => loggerLines.push(M),
		},
		on: (Name: string, Listener: (...Parts: any[]) => void) => {
			(handlers[Name] ??= []).push(Listener);
			return () => true;
		},
		// The trace seam: the REAL bus from the factory's built Target, with
		// its `on` wrapped to count live subscriptions (the mechanism assertion
		// - the graph consumes `observe/stamp` from the bus, not from a direct
		// root fs/observed registration). `get` is the optional-service probe
		// the adapter uses; `effect` runs its setup at once and records the
		// disposer (the adapter's unload path).
		trace: Trace,
		get: (Name: string) => Context[Name],
		effect: (Setup: () => unknown, Label?: string) => {
			effects.push(Label ?? "unnamed");
			const Disposer = Setup();
			if (typeof Disposer === "function") {
				disposers.push(Disposer as () => void);
			}
			return () => true;
		},
		reflect: {
			provide: (Name: string, Value: unknown) => {
				provided[Name] = Value;
				// The registration also lands on the context property, so a
				// sibling service is reachable through ctx.get (the same
				// posture the real Service base has).
				Context[Name] = Value;
			},
		},
		fs: {
			resolve: async (P: string) => ({ targetKey: Identity(P), displayPath: Display(P) }),
			stat: async (Target: any) => {
				stats.push(Target.displayPath);
				return Info(Target);
			},
			// The path form is accepted too (a sibling plugin reads by path -
			// the semantics service's readText takes a string): the same fake
			// file is served either way.
			readText: async (Target: any) => {
				const Display_ = typeof Target === "string" ? Display(Target) : Target.displayPath;
				const Key = typeof Target === "string" ? Identity(Target) : String(Target.targetKey);
				reads.push(Display_);
				if (disk !== undefined) {
					try {
						return FileSystem.readFileSync(Key, "utf8");
					} catch {
						throw new Error("vanished");
					}
				}
				const Text = files[Display_];
				if (Text === undefined) {
					throw new Error("vanished");
				}
				return Text;
			},
			listDir: async (Target: any) =>
				Children(Target)
					.sort((Left, Right) => Left.name.localeCompare(Right.name))
					.map((Child) => {
						const Resolved = {
							targetKey: Identity(Child.display),
							displayPath: Child.display,
						};
						const Meta = Info(Resolved);
						return {
							name: Child.name,
							type: Meta?.type ?? "other",
							target: Resolved,
							...(Meta === undefined ? {} : { version: Meta.version }),
						};
					}),
			contains: (Parent: any, Child: any) => {
				const Left = String(Parent.targetKey);
				const Right = String(Child.targetKey);
				return Right === Left || Right.startsWith(`${Left}${Path.sep}`) || Right.startsWith(`${Left}/`);
			},
			writeText: async (Target: any, Content: string) => {
				writes.push({ path: Target.displayPath, content: Content });
				return { operation: "update", version: "v2", before: null, after: Content };
			},
		},
		get root() {
			return Context;
		},
	};
	Context.__writeCapture = writes;
	Context.__handlers = handlers;
	Contexts.push(Context);
	return {
		Context,
		files,
		writes,
		reads,
		stats,
		loggerLines,
		provided,
		Trace,
		effects,
		disposers,
		subscriptions,
	};
};

/**
 * Fire one observation through the TRACE BUS: the observe hook's side of the
 * contract (`observe/stamp` carrying the path, the version and the origin).
 * The old fs/observed shape is preserved at the call sites: a present
 * observation stamps its version, an absent one stamps "absent", and a target
 * without a display path stamps an empty path (the malformed case the consumer
 * ledgers). Synchronous, exactly like the bus.
 */
export const Emit = (
	Run: any,
	Target: any,
	Observation: any = { kind: "present", version: "v2" },
	Actor?: object,
): void => {
	const Version =
		Observation?.kind === "present" ? String(Observation.version) : "absent";
	Run.Context.trace.emit({
		kind: TraceNames.observe,
		payload: {
			path: typeof Target?.displayPath === "string" ? Target.displayPath : "",
			version: Version,
			origin: "fs/observed",
		},
		actor: Actor,
	});
};

/** How many root handlers are registered for one event name. */
export const Handlers = (Run: any, Name: string): number =>
	(Run.Context.__handlers?.[Name] ?? []).length;

/** How many live trace subscriptions exist for one event name. */
export const Subscribers = (Run: any, Name: string): number =>
	Run.subscriptions?.get(Name) ?? 0;

/**
 * Write a REAL fixture tree under a fresh temp directory and return its root
 * plus a sibling directory (the symlink-out-of-root target). The root is the
 * `ws` child, so a fixture entry `src/core.ts` lands at `<root>/src/core.ts`.
 */
export const Tree = (Files: Record<string, string>): { root: string; outside: string } => {
	const Base = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "workspace-graph-"));
	const Root = Path.join(Base, "ws");
	for (const [Relative, Text] of Object.entries(Files)) {
		const Absolute = Path.join(Root, Relative);
		FileSystem.mkdirSync(Path.dirname(Absolute), { recursive: true });
		FileSystem.writeFileSync(Absolute, Text);
	}
	return { root: Root, outside: Base };
};

/**
 * The graph under test: construct the REAL class from the built Target with
 * the schema-validated config (the volatile cells included - the constructor
 * unwraps them), attach the optional FakeStorage facility to both storage
 * probes BEFORE construction, and expose the State through the
 * __workspaceGraphState probe.
 */
export const MakeGraph = (Raw: any = {}, Storage?: any): any => {
	const Run = Make({ ...Raw, files: { ...(Raw.files ?? {}) } });
	if (Storage !== undefined) {
		Run.Context.storage = { domain: Storage.facility };
		Run.Context.storageDomain = Storage.facility;
	}
	Run.Graph = new GraphClass(Run.Context, GraphClass.Config({ ...Raw }));
	Run.State = Run.Context.__workspaceGraphState;
	return Run;
};

/**
 * The graph over a REAL temp directory (the disk-backed fake fs): the same
 * ctx shell as MakeGraph, with `Raw.disk` naming the directory root. Used by
 * the Index-Workspace folder, where the walk, the realpath identity and the
 * symlink containment must be exercised against a real tree.
 */
export const MakeDisk = (Root: string, Raw: any = {}): any =>
	MakeGraph({ ...Raw, disk: Root });

/**
 * Await the pending storage open (the constructor fires it detached; the
 * store assertions need the handle bound and the opened line in the log).
 */
export const Settled = async (Run: any): Promise<void> => {
	await Run.State.Opened;
};

/**
 * The fake storage facility: the open capture (the spec the service declared),
 * the records map, and a seed hook for the restart scenarios. The handle's
 * table() returns one shared map-backed table (the fake KV domain).
 */
export const FakeStorage = (): any => {
	const Store: any = {
		spec: undefined as any,
		records: new Map<string, unknown>(),
	};
	Store.facility = {
		open: async (Spec: any) => {
			Store.spec = Spec;
			return {
				name: Spec.name,
				close: async () => {
					Store.closed = true;
				},
				table: () => ({
					get: (Key: string) => Store.records.get(Key),
					entries: () => Store.records.entries(),
					keys: () => Store.records.keys(),
					get size() {
						return Store.records.size;
					},
					put: async (Key: string, Value: unknown) => {
						Store.records.set(Key, Value);
					},
					delete: async (Key: string) => Store.records.delete(Key),
				}),
			};
		},
	};
	Store.seed = (Key: string, Value: unknown) => {
		Store.records.set(Key, Value);
	};
	return Store;
};

/**
 * The captured logger lines that carry the needle.
 */
export const LinesWith = (Run: any, Needle: string): string[] =>
	Run.loggerLines.filter((L: string) => L.includes(Needle));

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
	// The seam selfcheck: the fake ctx actually constructs the service (the
	// vacuously-green backstop for every folder's fixture - a broken seam
	// would print fewer checks in every folder, which the runner's
	// expected-count guard catches; this proves the seam itself at build time).
	const Run = MakeGraph({ files: {} });
	Check(Count, "selfcheck: the fake ctx registers the service instance", () => {
		assert.equal(Run.provided["workspaceGraph"], Run.Graph);
		assert.equal(Run.Graph.name, "workspaceGraph");
		assert.ok(
			Run.loggerLines.some((L: string) => L === "graph: activated (domain=workspace_graph, languages=3)"),
		);
	});
	// The trace seam selfcheck: an enabled graph subscribes to observe/stamp
	// on the REAL bus (the mechanism the folders drive through Emit), and a
	// disabled graph subscribes to nothing.
	const Enabled = MakeGraph({ files: {}, enabled: true });
	Check(Count, "selfcheck: the enabled graph wires the trace adapter (observe/stamp)", () => {
		assert.equal(Subscribers(Enabled, "observe/stamp"), 1);
		assert.equal(Handlers(Enabled, "fs/observed"), 0, "no direct root registration");
	});
	if (Count.N === 4 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

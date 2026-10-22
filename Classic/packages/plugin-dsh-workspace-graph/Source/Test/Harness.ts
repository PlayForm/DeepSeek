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
import GraphClass from "../../Target/Library.js";

export { GraphClass };

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
 * The fake ctx: fs resolve/stat/readText over the `files` map with the
 * writeText capture (which MUST stay untouched - A7), the reflect.provide
 * capture, the logger capture, and the root seam (the fake ctx is its own
 * root). The typing is `any` deliberately - fixture-only scaffolding.
 */
export const Make = (Raw: any = {}): any => {
	const files: Record<string, string> = Raw.files ?? {};
	const writes: { path: string; content: string }[] = [];
	const reads: string[] = [];
	const stats: string[] = [];
	const loggerLines: string[] = [];
	const provided: Record<string, unknown> = {};
	const Context: any = {
		logger: {
			info: (M: string) => loggerLines.push(M),
			warn: (M: string) => loggerLines.push(M),
			error: (M: string) => loggerLines.push(M),
		},
		on: () => () => true,
		reflect: {
			provide: (Name: string, Value: unknown) => {
				provided[Name] = Value;
			},
		},
		fs: {
			resolve: async (Path: string) => ({ targetKey: Path, displayPath: Path }),
			stat: async (Target: any) => {
				stats.push(Target.displayPath);
				const Text = files[Target.displayPath];
				if (Text === undefined) {
					return undefined;
				}
				return { version: "v1", type: "file", size: Text.length };
			},
			readText: async (Target: any) => {
				reads.push(Target.displayPath);
				const Text = files[Target.displayPath];
				if (Text === undefined) {
					throw new Error("vanished");
				}
				return Text;
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
	Contexts.push(Context);
	return { Context, files, writes, reads, stats, loggerLines, provided };
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
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

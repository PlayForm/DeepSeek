// Source/Test/Trace-Roundtrip/Test.ts - the TRACE ROUND-TRIP (D5): observe ->
// trace -> graph -> context, across four REAL built packages and ONE shared
// fake ctx:
//
//   * the observe hook hears `fs/observed` on the root, records its stamp
//     (byte-exact ledger line) and emits `observe/stamp` on the factory's bus;
//   * the graph consumes the stamp through its Trace/ adapter, coalesces a
//     pair into ONE re-index through the library's detached loop, and emits
//     `graph/invalidated` (the replaced record) + `graph/indexed`;
//   * the context consumes `graph/invalidated` and drops its packet memo, so
//     the next identical query rebuilds against the new revision.
//
// No sleeps anywhere: the graph's `State.Flush` is the loop's flush promise and
// the bus's `flush()` settles deterministically.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import { Names } from "@playform/lib-dsh-trace";
import ContextPlugin from "../../../../plugin-dsh-workspace-context/Target/Library.js";
import FactoryClass from "../../../../plugin-dsh-factory/Target/Library.js";
import ObservePlugin from "../../../../hook-dsh-workspace-observe/Target/Library.js";
import GraphClass from "../../../Target/Library.js";
import { Check, CheckAsync, Finish, MakeCounter } from "../Harness.js";

const CORE = 'import { util } from "./util.ts";\n\nexport function core(): number {\n\treturn util;\n}\n';
const CORE_CHANGED = `${CORE}\nexport function extra(): number {\n\treturn 2;\n}\n`;
const UTIL = "export const util = 1;\n";
const TEST_FILE = 'import { core } from "./core.ts";\n\nexport const suite = core;\n';
const MARKDOWN = "# The workspace\n\nIntro text.\n\n## Section\n";

/** The disk-backed fs the graph walks (the real tree the fixture writes). */
const DiskFs = (): any => {
	const Fs: any = {
		resolve: async (P: string) => {
			const Display = Path.resolve(P);
			let Identity = Display;
			try {
				Identity = FileSystem.realpathSync(Display);
			} catch {
				/* an unresolved path keeps the display identity */
			}
			return { targetKey: Identity, displayPath: Display };
		},
		stat: async (Target: any) => {
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
		},
		readText: async (Target: any) => FileSystem.readFileSync(String(Target.targetKey), "utf8"),
		listDir: async (Target: any) =>
			FileSystem.readdirSync(String(Target.targetKey), { withFileTypes: true })
				.sort((Left, Right) => Left.name.localeCompare(Right.name))
				.map((Entry) => ({
					name: Entry.name,
					type: Entry.isFile() ? "file" : Entry.isDirectory() ? "directory" : "other",
					target: {
						targetKey: Path.join(String(Target.targetKey), Entry.name),
						displayPath: Path.join(String(Target.displayPath), Entry.name),
					},
				})),
		contains: (Parent: any, Child: any) => {
			const Left = String(Parent.targetKey);
			const Right = String(Child.targetKey);
			return Right === Left || Right.startsWith(`${Left}${Path.sep}`);
		},
		writeText: async () => {
			throw new Error("the round-trip must never write through ctx.fs");
		},
	};
	return Fs;
};

/** The shared fake ctx: the factory's provide/effect seams, the fs, the root. */
const Make = (): any => {
	const Provided: Record<string, unknown> = {};
	const Lines: string[] = [];
	const Effects: string[] = [];
	const Disposers: Array<{ label: string; dispose: () => void }> = [];
	const Tools: unknown[] = [];
	const RootListeners: Record<string, Array<(...Parts: any[]) => void>> = {};
	const CtxListeners: Record<string, unknown> = {};
	const Root: any = {
		on: (Name: string, Listener: (...Parts: any[]) => void) => {
			(RootListeners[Name] ??= []).push(Listener);
			return () => true;
		},
	};
	let Context: any;
	Context = {
		fs: DiskFs(),
		logger: {
			info: (Message: string) => Lines.push(Message),
			warn: (Message: string) => Lines.push(Message),
			error: (Message: string) => Lines.push(Message),
		},
		on: (Name: string, Listener: unknown) => {
			CtxListeners[Name] = Listener;
			return () => true;
		},
		get: (Name: string) => Context[Name],
		effect: (Setup: () => unknown, Label?: string) => {
			const Name = Label ?? "unnamed";
			Effects.push(Name);
			const Disposer = Setup();
			if (typeof Disposer === "function") {
				Disposers.push({ label: Name, dispose: Disposer as () => void });
			}
			return () => true;
		},
		root: Root,
		tools: {
			register: (Definition: unknown) => {
				Tools.push(Definition);
			},
		},
		reflect: {
			provide: (Name: string, Value?: unknown) => {
				Provided[Name] = Value;
				Context[Name] = Value;
				return () => true;
			},
		},
		provide: (Name: string, Value?: unknown) => {
			Provided[Name] = Value;
			Context[Name] = Value;
			return () => true;
		},
	};
	return {
		Context,
		Provided,
		Lines,
		Effects,
		Disposers,
		Tools,
		RootListeners,
		CtxListeners,
	};
};

/** Fire one fs/observed through the observe hook's root registration. */
const Fire = (Run: any, Path_: string, Version: string, Kind = "present"): void => {
	for (const Listener of Run.RootListeners["fs/observed"] ?? []) {
		Listener(
			{ displayPath: Path_, targetKey: Path_ },
			Kind === "present" ? { kind: "present", version: Version } : { kind: Kind },
			{ agent: { id: "agent-a" } },
		);
	}
};

/** The captured logger lines that carry the needle. */
const LinesWith = (Run: any, Needle: string): string[] =>
	Run.Lines.filter((Line: string) => Line.includes(Needle));

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	const Base = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "workspace-trace-roundtrip-"));
	const Root = Path.join(Base, "ws");
	const Files: Record<string, string> = {
		"src/core.ts": CORE,
		"src/util.ts": UTIL,
		"src/core.test.ts": TEST_FILE,
		"README.md": MARKDOWN,
	};
	for (const [Relative, Text] of Object.entries(Files)) {
		const Absolute = Path.join(Root, Relative);
		FileSystem.mkdirSync(Path.dirname(Absolute), { recursive: true });
		FileSystem.writeFileSync(Absolute, Text);
	}
	const CorePath = Path.join(Root, "src/core.ts");
	const UtilPath = Path.join(Root, "src/util.ts");
	const Run = Make();
	const Context = Run.Context;

	// Group T1: the four plugins on ONE ctx, wired through the bus.
	{
		const Factory: any = new FactoryClass(Context);
		(ObservePlugin.apply as any)(Context, (ObservePlugin.Config as any)({ enabled: true }));
		const Graph: any = new GraphClass(Context, (GraphClass as any).Config({ enabled: true }));
		(ContextPlugin.apply as any)(Context, (ContextPlugin.Config as any)({ enabled: true }));
		Run.Factory = Factory;
		Run.Graph = Graph;
		Run.Trace = Run.Provided["trace"];
		Check(Count, "T1: the factory provides the one bus and every plugin registers on the ctx", () => {
			assert.ok(Run.Trace !== undefined, "ctx.trace is provided");
			assert.equal(Run.Trace, Factory.Trace, "the factory holds the same bus");
			assert.equal(Run.Provided["pluginFactory"], Factory);
			assert.equal(Run.Provided["workspaceObserve"] !== undefined, true);
			assert.equal(Run.Provided["workspaceGraph"], Graph);
			assert.equal(Run.Provided["workspaceContext"] !== undefined, true);
			assert.equal(Run.Tools.length, 1, "the context tool registered");
		});
		Check(Count, "T1: the observe hook is the ONLY fs/observed listener (the graph uses the bus)", () => {
			assert.equal(Run.RootListeners["fs/observed"]?.length, 1);
		});
	}

	// Group T2: the index and the graph/indexed emissions.
	{
		const Summary = await Run.Graph.indexWorkspace(Root);
		Check(Count, "T2: the graph indexes the tree and emits graph/indexed for every record", () => {
			assert.deepEqual(Summary, { indexed: 4, skipped: 0, failed: 0, files: 4 });
			const Indexed = Run.Trace.ring()
				.filter((Envelope: any) => Envelope.kind === Names.indexed)
				.map((Envelope: any) => Envelope.payload.path)
				.sort();
			assert.deepEqual(Indexed, [CorePath, UtilPath, Path.join(Root, "README.md"), Path.join(Root, "src/core.test.ts")].sort());
			assert.equal(
				Run.Trace.ring().some((Envelope: any) => Envelope.kind === Names.invalidated),
				false,
				"a first index invalidates nothing",
			);
		});
	}

	// Group T3: the packet and its memo.
	{
		const First = Context.workspaceContext.packet({ id: `File:${CorePath}`, caller: "tester" });
		const Second = Context.workspaceContext.packet({ id: `File:${CorePath}`, caller: "tester" });
		Check(Count, "T3: the packet carries the real revision and a repeated query is memoized", () => {
			assert.equal(First.workspace, "WORKSPACE workspace @ 4");
			assert.equal(First.nodeId, `File:${CorePath}`);
			assert.equal(Second, First, "the second identical query is served from the memo");
			assert.equal(LinesWith(Run, "context: packet").length, 1, "a memo hit adds no ledger line");
		});
	}

	// Group T4: observe -> trace -> graph, a coalesced pair.
	{
		FileSystem.writeFileSync(CorePath, CORE_CHANGED);
		Fire(Run, CorePath, "v2");
		Fire(Run, CorePath, "v2");
		await CheckAsync(Count, "T4: a coalesced pair re-indexes ONCE through the bus", async () => {
			await Run.Graph.State.Flush;
			assert.deepEqual(LinesWith(Run, `graph: reindexed ${CorePath}`), [
				`graph: reindexed ${CorePath} (indexed)`,
			]);
			assert.equal(Run.Graph.statistics().indexRevision, "5");
			assert.equal(Run.Graph.find({ name: "extra" }).length, 1, "the change is in the graph");
		});
		Check(Count, "T4: the observe stamp is recorded byte-exactly and carried on the bus", () => {
			// The SOURCE records every stamp (no coalescing at the recorder);
			// the COALESCING is the graph's loop, proven by the one re-index.
			assert.deepEqual(LinesWith(Run, `observe: stamped ${CorePath}`), [
				`observe: stamped ${CorePath} version v2 (fs/observed)`,
			]);
			const Stamp = Run.Trace
				.ring()
				.find((Envelope: any) => Envelope.kind === Names.observe);
			assert.deepEqual(Stamp.payload, {
				path: CorePath,
				version: "v2",
				origin: "fs/observed",
			});
			assert.match(Stamp.trace, /^trace-\d+$/);
		});
		Check(Count, "T4: the graph emits graph/invalidated (replaced) then graph/indexed", () => {
			const Invalidated = Run.Trace
				.ring()
				.filter((Envelope: any) => Envelope.kind === Names.invalidated);
			assert.equal(Invalidated.length, 1);
			assert.deepEqual(Invalidated[0].payload, {
				path: CorePath,
				reason: "replaced",
				version: Invalidated[0].payload.version,
			});
			assert.equal(Invalidated[0].payload.path, CorePath);
			const Indexed = Run.Trace
				.ring()
				.find(
					(Envelope: any) =>
						Envelope.kind === Names.indexed && Envelope.payload.path === CorePath,
				);
			assert.equal(Indexed.payload.revision, 5);
		});
	}

	// Group T5: the context invalidates its memo on graph/invalidated.
	{
		const Third = Context.workspaceContext.packet({ id: `File:${CorePath}`, caller: "tester" });
		Check(Count, "T5: graph/invalidated cleared the memo - the next query rebuilds", () => {
			assert.notEqual(Third.workspace, "WORKSPACE workspace @ 4", "not the stale packet");
			assert.equal(Third.workspace, "WORKSPACE workspace @ 5", "the new revision");
			assert.equal(LinesWith(Run, "context: packet").length, 2, "the rebuild ledgers its line");
		});
	}

	// Group T6: the deterministic flush.
	{
		await CheckAsync(Count, "T6: the bus flush and the loop flush settle without a sleep", async () => {
			await assert.doesNotReject(() => Run.Trace.flush());
			await assert.doesNotReject(() => Run.Graph.State.Flush);
		});
	}

	// Group T7: the absent observation invalidates without re-indexing.
	{
		const Revision = Run.Graph.statistics().indexRevision;
		Fire(Run, UtilPath, "v1", "absent");
		Check(Count, "T7: an absent stamp emits graph/invalidated (absent) and re-indexes nothing", () => {
			assert.equal(Run.Graph.statistics().indexRevision, Revision);
			assert.equal(LinesWith(Run, `graph: reindexed ${UtilPath}`).length, 0);
			const Absent = Run.Trace
				.ring()
				.find(
					(Envelope: any) =>
						Envelope.kind === Names.invalidated && Envelope.payload.path === UtilPath,
				);
			assert.deepEqual(Absent.payload, { path: UtilPath, reason: "absent" });
		});
	}

	// Group T8: the excluded path is silenced at the source.
	{
		const Excluded = Path.join(Root, "node_modules/pkg/index.ts");
		FileSystem.mkdirSync(Path.dirname(Excluded), { recursive: true });
		FileSystem.writeFileSync(Excluded, "export const vendored = 1;\n");
		Fire(Run, Excluded, "v1");
		Check(Count, "T8: an excluded path never reaches the bus (the source's guard)", () => {
			assert.deepEqual(LinesWith(Run, `observe: ignored ${Excluded}`), [
				`observe: ignored ${Excluded} (excluded)`,
			]);
			assert.equal(LinesWith(Run, `graph: reindexed ${Excluded}`).length, 0);
		});
	}

	// Group T9: the adapter's disposer.
	{
		Check(Count, "T9: the graph adapter's disposer stops the re-index (the stamp still records)", () => {
			const Effect = Run.Disposers.find(
				(Entry: { label: string; dispose: () => void }) => Entry.label === "graph-trace",
			);
			assert.ok(Effect !== undefined, "the adapter registered its unload effect");
			Effect.dispose();
			FileSystem.writeFileSync(CorePath, `${CORE_CHANGED}\nexport const later = 3;\n`);
			Fire(Run, CorePath, "v3");
			assert.equal(
				LinesWith(Run, `graph: reindexed ${CorePath}`).length,
				1,
				"no second re-index after the disposer",
			);
			assert.equal(
				LinesWith(Run, `observe: stamped ${CorePath} version v3`).length,
				1,
				"the observe hook still records (its own wiring is untouched)",
			);
		});
	}

	return Finish(Count, "Trace-Roundtrip");
};

// Standalone entry: `node Target/Test/Trace-Roundtrip/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Trace-Roundtrip`);
}

// Source/Test/Harness.ts - the shared test harness for the BATCH-EDIT tests:
// the fake ctx (tools registration capture, ctx listener capture, the
// reflect.provide capture, the effect runner, logger capture, the DISTINCT
// root object with its own on/emit capture, a content-backed fake fs with
// version tokens) + the REAL @playform/ets-plugin-dsh-factory instance from its
// built Target + the REAL batch-edit apply from its built Target - the
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
// NO FAKE CLOCK by default: the machine ids and the op counters are the
// plugin's own deterministic counters; the commit deadline is driven by a
// per-test patched Date.now (the folder restores it), so the no-timer rule
// holds everywhere.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import Plugin from "../../Target/Library.js";
import FactoryClass from "../../../ets-plugin-dsh-factory/Target/Library.js";

export { Plugin };

/**
 * The per-folder counter: `N` = passing checks, `F` = failing checks.
 */
export type Counter = {
	N: number;
	F: number;
};

export const MakeCounter = (): Counter => ({ N: 0, F: 0 });

/**
 * One check = the source suite's ok group. The callback carries that group's
 * assertions VERBATIM; a throw inside counts the whole group failed.
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
 * The async variant of Check, for folders whose assertions await (the
 * batch_edit tool's execute and the commit path are async).
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

export const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "batch-edit-smoke-"));
export const Ledger = Path.join(Root, "batch-edit.log");

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
 * The fake fs: a content map plus per-path version tokens. resolve throws
 * for paths with no content entry (the machine lists the miss); stat returns
 * the current version token (null when the path was never versioned);
 * readText records and returns the content; writeText records the call,
 * stores the content and bumps the version token. `failWrite` makes the
 * next write of that path throw (the atomic-gate and sandbox scenarios).
 */
export const FakeFs = (Files: Record<string, string> = {}): any => {
	const Fs: any = {
		files: { ...Files },
		versions: new Map<string, string>(),
		n: 0,
		resolves: [] as string[],
		stats: [] as string[],
		reads: [] as string[],
		writes: [] as { path: string; content: string; intent: any }[],
		failWrite: null as string | null,
	};
	for (const Path_ of Object.keys(Files)) {
		Fs.versions.set(Path_, "v1");
	}
	Fs.resolve = async (P: string) => {
		Fs.resolves.push(P);
		if (!(P in Fs.files)) {
			throw new Error(`not found: ${P}`);
		}
		return { displayPath: P, targetKey: `key:${P}` };
	};
	Fs.stat = async (T: any) => {
		Fs.stats.push(T?.displayPath ?? String(T));
		const Version = Fs.versions.get(T?.displayPath ?? "");
		return Version === undefined ? null : { version: Version };
	};
	Fs.readText = async (T: any) => {
		Fs.reads.push(T?.displayPath ?? String(T));
		return Fs.files[T?.displayPath ?? ""];
	};
	Fs.writeText = async (T: any, Content: string, Intent: any) => {
		const P = T?.displayPath ?? String(T);
		if (Fs.failWrite === P) {
			throw new Error("write denied");
		}
		Fs.writes.push({ path: P, content: Content, intent: Intent });
		Fs.files[P] = Content;
		Fs.n += 1;
		const Fresh = `v${Fs.n + 1}`;
		Fs.versions.set(P, Fresh);
		return { version: Fresh };
	};
	Fs.sandboxMode = undefined;
	return Fs;
};

/**
 * The fake ctx: the ROOT object is DISTINCT from the ctx (its on() is the
 * only root capture, its emit() the only root emit capture), ctx.on()
 * captures into a SEPARATE map (the pre-step and pre-execute listeners land
 * there), tools.register captures the tool definition, the factory State
 * builder's loader/volatile-update listener lands in ctx.on as well, and
 * get() resolves through the pre-attached services (the jobs hub seam).
 */
export const Make = (
	Raw: any,
	Files: Record<string, string> = {},
	Attach?: (Context: any, Run: any) => void,
): any => {
	const Registered: any[] = [];
	const CtxListeners: any = {};
	const RootListeners: any = {};
	const RootEmits: any[][] = [];
	const Lines: string[] = [];
	const Warns: string[] = [];
	const Provided: any = {};
	const Services: Record<string, unknown> = {};
	const Gets: string[] = [];
	const Fs = FakeFs(Files);
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
		get: (Name: string) => {
			Gets.push(Name);
			return Services[Name];
		},
		tools: {
			register: (Definition: unknown) => {
				Registered.push(Definition);
				return () => true;
			},
		},
		fs: Fs,
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
		Services,
		Gets,
		Registered,
		Raw,
		Fs,
	};
	Attach?.(Context, Run);
	Run.Returned = (Plugin.apply as any)(Context, Raw);
	Run.State = Context.__pluginDshBatchEditState;
	Run.Tool = Registered.find((D: any) => D.name === "batch_edit");
	return Run;
};

/**
 * The real-config shape the loader hands to apply: volatile fields arrive as
 * `{ get }` cells. Build one via the plugin's schema.
 */
export const Validate = (Raw: Record<string, unknown>): any =>
	(Plugin.Config as unknown as (Raw: Record<string, unknown>) => any)({ ...Raw });

/**
 * The standard exec the tool pipeline would hand to execute.
 */
export const Exec = (): any => ({ agent: { id: "agent-a" } });

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
	// vacuously-green backstop for every folder's fixture).
	rm();
	const Run = Make(
		Validate({ logFile: Ledger, enabled: true }),
		{ "a.txt": "hello\n" },
	);
	Check(Count, "selfcheck: the fake ctx registers the tool, the root observer and the state", () => {
		assert.equal(Run.Tool.name, "batch_edit");
		assert.deepEqual(Object.keys(Run.RootListeners), ["fs/observed"]);
		assert.ok(Run.State !== undefined);
		assert.deepEqual(Run.Lines, [
			"plugin-dsh-batch-edit: activated bundle 0.3.0 (machinesPerAgent 2, opsPerCommit 64, deadlineMs 120000, strictMode false, interceptBash false)",
		]);
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

// Source/Test/Harness.ts - the shared test harness for the LIVE CONTAINERS
// tests: the fake ctx (on capture, get serving the REAL
// @playform/plugin-dsh-factory instance from its built Target, logger
// capture + the root seam) + the REAL live-containers apply from its built
// Target - the family fake-ctx + real-factory harness pattern, written ONCE
// per package and imported by every test folder. The suite-level fixtures
// (the tmp ledger, the FAKE CLOCK, the assemble/pre-step/post-execute
// waterfall helpers, the volatile-cell flip seam, the block-spec builders)
// live here too: each folder process gets a fresh set (the module state is
// per-process), so every folder is standalone-green and the aggregate
// replays the same seams per folder.
//
// Standalone selfcheck: `node Target/Test/Harness.js --selfcheck` runs the
// counter through one deliberate pass + one deliberate failure and exits 0
// only when both are counted exactly, then proves the fake ctx actually
// wires the plugin (the vacuously-green backstop for every folder's
// fixture).
//
// THE FAKE CLOCK: the plugin reads time ONLY through Function/Clock, which
// consults State.Now (the clock seam on the built State) before falling
// back to Date.now(). The harness exposes a mutable ClockBox; every folder
// sets `Run.State.Now = FakeClock` through the
// `ctx.__hookDshLiveContainersState` probe attachment and advances the
// clock - never a sleep, never a real clock dependence.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import Containers from "../../Target/Library.js";
import FactoryClass from "../../../plugin-dsh-factory/Target/Library.js";
import { DEFAULT_BLOCKS } from "../../Target/Variable/DefaultBlocks.js";
import { Frame } from "../../Target/Function/Render.js";

export { Containers, DEFAULT_BLOCKS, Frame };

/**
 * The shipped catalog ids, in order (the schema default's shape contract).
 */
export const DEFAULT_BLOCKS_IDS: string[] = DEFAULT_BLOCKS.map((Block) => Block.id);

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

// -- the suite-level fixtures (fresh per folder process) --

export const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "live-containers-smoke-"));
export const Ledger = Path.join(Root, "live-containers.log");

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
 * The REAL factory instance (constructed exactly the way the factory's own
 * smoke does - the Service base constructor registers through
 * ctx.reflect.probe; the stub context is used once and discarded).
 */
export const Furnace: any = new FactoryClass({
	reflect: { provide: () => undefined },
} as any);

/**
 * The FAKE CLOCK box: `Now` is the epoch-ms the plugin's Clock seam returns
 * whenever a folder pointed State.Now at FakeClock. Deterministic - the
 * folders advance it, never sleep.
 */
export const ClockBox = { Now: 1700000000000 };

/**
 * The clock seam the folders assign to State.Now.
 */
export const FakeClock = (): number => ClockBox.Now;

/**
 * Advance the fake clock (ms). Never sleeps.
 */
export const Advance = (Ms: number): void => {
	ClockBox.Now += Ms;
};

/**
 * The volatile-cell write symbol (cosmokit): the loader's hot-edit path
 * commits a new value into a `{ get }` cell through it. The harness uses the
 * REGISTERED global symbol - the same mechanism the live loader uses, so
 * the flip tests exercise the real cells the schema produces.
 */
const Write = Symbol.for("cosmokit.volatile.write");

/**
 * Commit a new value into a volatile cell (the hot-edit write), WITHOUT
 * firing the loader event - the caller then fires the captured
 * loader/volatile-update listener with the changed path, mirroring the
 * live sequence (commit, then the event).
 */
export const Flip = (CellValue: unknown, New: unknown): void => {
	const Cell = CellValue as { [Write]?: (Value: unknown) => unknown };
	if (typeof Cell?.[Write] !== "function") {
		throw new Error("Flip: not a volatile cell (no cosmokit write symbol)");
	}
	Cell[Write](New);
};

/**
 * The fake ctx: on() captures listeners, get() serves the REAL factory,
 * logger captures info + warn lines, and the root seam serves the ctx
 * itself. Optional service probes (subprocess) return undefined.
 */
export const Make = (Raw: any, Attach?: (Context: any, Run: any) => void): any => {
	const Listeners: any = {},
		Lines: string[] = [],
		Warns: string[] = [];
	const Context: any = {
		pluginFactory: Furnace,
		tools: { schemas: () => [] },
		on: (Name: string, Listener: unknown) => {
			Listeners[Name] = Listener;
			return () => true;
		},
		get: (Name: string) => {
			switch (Name) {
				case "pluginFactory":
					return Furnace;
				case "tools":
					return Context.tools;
				default:
					return undefined;
			}
		},
		logger: {
			info: (M: string) => {
				Lines.push(M);
			},
			warn: (M: string) => {
				Warns.push(M);
			},
		},
		get root() {
			return Context;
		},
	};
	const Run: any = { Context, Listeners, Lines, Warns, Raw };
	// The optional pre-apply attachment: the wave-2 services are read at apply
	// time, so they must be on the Context BEFORE apply runs.
	Attach?.(Context, Run);
	const Returned = (Containers.apply as any)(Context, Raw);
	Run.Returned = Returned;
	Run.State = Context.__hookDshLiveContainersState;
	return Run;
};

/**
 * The real-config shape the loader hands to apply: volatile fields arrive as
 * `{ get }` cells. Build one via the plugin's schema. The cast is
 * fixture-only scaffolding.
 */
export const Validate = (Raw: Record<string, unknown>): any =>
	(Containers.Config as unknown as (Raw: Record<string, unknown>) => any)({ ...Raw });

/**
 * Make + the fake clock wired through the state probe (the standard mount
 * for every timing-sensitive folder).
 */
export const MakeClocked = (Raw: any): any => {
	const Run = Make(Raw);
	Run.State.Now = FakeClock;
	return Run;
};

/**
 * A block spec with the schema's defaults filled in (the harness builder;
 * the per-folder tables override exactly what they assert on).
 */
export const Block = (Id: string, Kind: string, Template: string, Extra: any = {}): any => ({
	id: Id,
	kind: Kind,
	template: Template,
	enabled: true,
	vars: {},
	trigger: "request",
	ttlCalls: 8,
	scope: "always",
	...Extra,
});

/**
 * A line locator: the captured info lines that carry the needle.
 */
export const LinesWith = (Run: any, Needle: string): string[] =>
	Run.Lines.filter((L: string) => L.includes(Needle));

/**
 * The ledger file lines that carry the needle (after the `[ISO] ` stamp).
 */
export const LedgerWith = (Needle: string): string[] =>
	LedgerLines().filter((L: string) => L.includes(Needle));

// -- the waterfall helpers --

export const ACCEPT: any = { kind: "accept" };
export const AgentA: any = { id: "agent-a" };
export const ScopeA: any = { key: "scope-a" };

/**
 * One system-prompt/assemble dispatch. When `Base` is provided the
 * downstream Next returns it (identity checks are meaningful against it);
 * otherwise a fresh base assembly is used.
 */
export const AssembleBase = async (Run: any, Base: any, Scope: unknown = undefined): Promise<any> =>
	Run.Listeners["system-prompt/assemble"](
		Base,
		Scope === undefined ? {} : { scope: Scope },
		async () => Base,
	);

/**
 * One system-prompt/assemble dispatch with a fresh base assembly.
 */
export const Assemble = async (Run: any, Scope: unknown = undefined): Promise<any> => {
	const Assembly = {
		sections: [{ name: "base", text: "BASE" }],
		contexts: [],
		tools: [],
		variables: {},
	};
	return AssembleBase(Run, Assembly, Scope);
};

/**
 * One agent/pre-step dispatch carrying N user messages (the turn boundary).
 */
export const PreStep = async (Run: any, Users = 1): Promise<any> => {
	const Step = {
		agent: AgentA,
		messages: Array.from({ length: Users }, () => ({ source: { kind: "user" } })),
	};
	return Run.Listeners["agent/pre-step"](Step, async () => ({ stepped: true }));
};

/**
 * One tools/post-execute dispatch (a finished tool call).
 */
export const Post = async (Run: any, Name = "bash"): Promise<any> =>
	Run.Listeners["tools/post-execute"](
		{ callId: "call_smoke", name: Name, arguments: { command: "ls" }, agent: AgentA, signal: undefined },
		{ isError: false, value: "", content: [] },
		async () => ACCEPT,
	);

/**
 * The live section of an assembly (undefined when none was appended).
 */
export const LiveSection = (Out: any): any =>
	Out.sections.find((S: any) => S.name === "live-containers");

// -- the WAVE-2 fixtures (appended; the phase-1 fixtures above are untouched) --

/**
 * One wave-2 assemble dispatch: the assemble context carries BOTH the scope
 * and the agent (assembleContextFor sets scope = agent - verified), so the
 * wave-2 body attributes per agent while the phase-1 counters stay shared.
 */
export const WaveAssemble = async (Run: any, Agent: any = AgentA): Promise<any> => {
	const Assembly = {
		sections: [{ name: "base", text: "BASE" }],
		contexts: [],
		tools: [],
		variables: {},
	};
	return Run.Listeners["system-prompt/assemble"](
		Assembly,
		{ scope: Agent, agent: Agent },
		async () => Assembly,
	);
};

/**
 * One wave-2 pre-execute dispatch: the exec carries the agent, the call id,
 * and the parsed arguments; Next records that it was called.
 */
export const Pre = async (Run: any, Exec: any): Promise<{ decision: any; nextCalled: boolean }> => {
	let nextCalled = false;
	const decision = await Run.Listeners["tools/pre-execute"](Exec, async () => {
		nextCalled = true;
		return { kind: "allow" };
	});
	return { decision, nextCalled };
};

/**
 * One wave-2 tools/execute dispatch around a tagged or untagged exec.
 */
export const Execute = async (Run: any, Exec: any, Next?: () => Promise<any>): Promise<any> =>
	Run.Listeners["tools/execute"](Exec, Next ?? (async () => ({ isError: false, value: { real: true }, content: [] })));

/**
 * Fire one captured jobs event through the L6 subscription listener.
 */
export const FireJobs = (Run: any, Event: any): void => {
	if (Run.JobsHub === undefined) {
		throw new Error("FireJobs: the mount has no jobs service (pass jobs: FakeJobsHub() to MakeWave)");
	}
	for (const Listener of Run.JobsHub.listeners) {
		Listener(Event);
	}
};

/**
 * Fire one session event through the L7 observer (the subject is the fake
 * session object).
 */
export const FireSession = (Run: any, Event: any): void => {
	Run.Listeners["session/event"]({ id: "session-1" }, Event);
};

/**
 * A fake process handle: the observed streams the smoke feeds directly, a
 * controllable settle, and the result/done projections the producer reads.
 */
export const FakeProcess = (): any => {
	const State = {
		status: "running" as string,
		exitCode: null as number | null,
		signal: null as string | null,
		stdout: { chunks: "" as string, offset: 0 },
		stderr: { chunks: "" as string, offset: 0 },
	};
	const Read = (Buffer_: { chunks: string; offset: number }) => ({
		text: Buffer_.chunks.slice(Buffer_.offset),
		nextOffset: Buffer_.chunks.length,
		lossy: false,
	});
	const Handle: any = {
		get status() {
			return State.status;
		},
		get exitCode() {
			return State.exitCode;
		},
		get signal() {
			return State.signal;
		},
		observed: {
			stdout: { readFrom: (From: number) => ({ text: State.stdout.chunks.slice(From), nextOffset: State.stdout.chunks.length, lossy: false }) },
			stderr: { readFrom: (From: number) => ({ text: State.stderr.chunks.slice(From), nextOffset: State.stderr.chunks.length, lossy: false }) },
		},
		done: undefined as any,
		resolve: undefined as any,
		kill: () => {
			if (State.status === "running") {
				State.status = "killed";
				State.signal = State.signal ?? "SIGTERM";
			}
			return true;
		},
		result: async () => ({
			exitCode: State.exitCode,
			signal: State.signal,
			timedOut: false,
			aborted: false,
			timeoutMs: 120000,
			stdout: { text: Read(State.stdout).text, truncated: false },
			stderr: { text: Read(State.stderr).text, truncated: false },
		}),
		/** Feed one channel with output (the smoke's pump stand-in). */
		feed: (Channel: "stdout" | "stderr", Text: string) => {
			State[Channel].chunks += Text;
		},
		/** Settle the process (exit or kill). */
		settle: (ExitCode: number | null, Signal: string | null = null) => {
			State.exitCode = ExitCode;
			State.signal = Signal;
			if (State.status === "running") {
				State.status = Signal !== null ? "killed" : "completed";
			}
			ResolveDone?.(undefined);
		},
	};
	let ResolveDone: ((value: unknown) => void) | undefined;
	Handle.done = new Promise((Resolve) => {
		ResolveDone = Resolve;
	});
	return Handle;
};

/**
 * The fake jobs registry: start() records the exact spec and returns a
 * `bash-<16 hex>` id; events.subscribe captures the listener; kill records
 * the reason; a settle trigger fires the captured listeners.
 */
export const FakeJobsHub = () => {
	const Hub: any = {
		started: [] as any[],
		killed: [] as any[],
		listeners: [] as any[],
		next: 0,
		processes: [] as any[],
	};
	Hub.registry = {
		start: (Spec: any) => {
			Hub.next += 1;
			const Id = `bash-${Hub.next.toString(16).padStart(16, "0")}`;
			Hub.started.push({ id: Id, spec: Spec });
			return Id;
		},
		events: {
			subscribe: (_Filter: unknown, Listener: any) => {
				Hub.listeners.push(Listener);
				return () => true;
			},
		},
		kill: (Id: string, Caller: string, Reason: string) => {
			Hub.killed.push({ id: Id, caller: Caller, reason: Reason });
			return "requested";
		},
		list: () => [],
		get: () => ({ id: "x", kind: "bash", label: "x", status: "running", startedAt: 0, output: { total: 0, earliest: 0 } }),
		readAt: () => ({ text: "", nextOffset: 0, lossy: false }),
		wait: async () => ({ id: "x", status: "running", startedAt: 0, output: { total: 0, earliest: 0 } }),
		remove: () => undefined,
		attachController: () => undefined,
	};
	/** Fabricate one settled event (the smoke's controllable settle). The job
	 * kind is taken from the started spec when the id was started through the
	 * fake registry (the monitor jobs carry kind "monitor"), else "bash". */
	Hub.settled = (JobId: string, Options: { owner?: string; status?: string; detail?: string; cause?: string; awaited?: boolean } = {}) => ({
		type: "settled",
		job: {
			id: JobId,
			kind: Hub.started.find((S: any) => S.id === JobId)?.spec.kind ?? "bash",
			label: "cargo build",
			...(Options.owner !== undefined ? { owner: Options.owner } : {}),
			status: Options.status ?? "completed",
			detail: Options.detail,
			startedAt: 0,
			output: { total: 0, earliest: 0 },
		},
		cause: Options.cause ?? "producer",
		awaited: Options.awaited ?? false,
	});
	return Hub;
};

/**
 * The fake shell seam: resolve captures the request (the exact re-dispatch
 * spec assertion reads it), execute creates a FakeProcess.
 */
export const FakeShell = () => {
	const Shell: any = {
		resolved: [] as any[],
		executed: [] as any[],
		processes: [] as any[],
	};
	Shell.registry = {
		sandboxMode: undefined,
		resolve: (Request: any) => {
			const Spec = { ...Request };
			Shell.resolved.push(Spec);
			return Spec;
		},
		execute: async (Spec: any) => {
			const Process = FakeProcess();
			Shell.executed.push(Spec);
			Shell.processes.push(Process);
			return Process;
		},
	};
	return Shell;
};

/**
 * The fake policy service: resolve returns the standing policy the smoke
 * asserts on (the G2 preservation check).
 */
export const FakePolicy = (Mode = "workspace-write"): any => ({
	mode: Mode,
	resolve: (Input: any) => ({ mode: Mode, session: Input?.session }),
});

/**
 * The fake subagent service: counts spawns, captures the specs, and lets the
 * smoke resolve the result promise on demand.
 */
export const FakeSubagent = () => {
	const Sub: any = { spawns: [] as any[], resolvers: [] as any[] };
	Sub.registry = {
		startActivation: (Spec: any) => {
			Sub.spawns.push(Spec);
			let ResolveResult: (Value: any) => void = () => undefined;
			const Result = new Promise((Resolve) => {
				ResolveResult = Resolve;
			});
			Sub.resolvers.push(ResolveResult);
			return { childId: `child-${Sub.spawns.length}`, result: Result, dispose: async () => undefined };
		},
	};
	/** Resolve the Nth spawn's result with the given output blocks. */
	Sub.answer = (Index: number, Output: any): void => {
		Sub.resolvers[Index]?.({ output: Output, stopReason: "end_turn" });
	};
	return Sub;
};

/**
 * A fake agents registry (the owner resolution reads it).
 */
export const FakeAgents = (...Ids: string[]): any => {
	const Map_ = new Map(Ids.map((Id) => [Id, { id: Id, status: "idle" }]));
	return { get: (Id: string) => Map_.get(Id) };
};

/**
 * Mount with the wave-2 services attached (the fake ctx gains the jobs,
 * shell, shellEnv, workingDirectory, sandboxPolicy, subagent and agents
 * services, so the wave-2 listeners register exactly as in production).
 */
export const MakeWave = (Raw: any, Services: { jobs?: any; shell?: any; subagent?: any; agents?: any; policy?: any } = {}): any => {
	const Run = Make(Raw, (Context: any, Run_: any) => {
		Run_.JobsHub = Services.jobs;
		Context.jobs = Services.jobs?.registry;
		Context.shell = Services.shell?.registry;
		Context.shellEnv = { collect: (Exec: any) => ({ DSH_SESSION: Exec?.agent?.id ?? "none" }) };
		Context.workingDirectory = { ensure: async () => "/session" };
		Context.sandboxPolicy = Services.policy ?? FakePolicy();
		Context.subagent = Services.subagent?.registry;
		Context.agents = Services.agents;
		// The registering tools service: captures the definitions so the smoke
		// can invoke live_plant / live_container_set exactly as the registry does.
		Run_.tools = {} as Record<string, any>;
		Context.tools = {
			schemas: () => [],
			register: (Definition: any) => {
				Run_.tools[Definition.name] = Definition;
				return () => true;
			},
		};
		// The fake systemPrompt registry: captures the registered contexts so
		// the smoke can read the completion provider exactly as the loop would.
		Run_.contexts = {} as Record<string, any>;
		Context.systemPrompt = {
			context: (Context_: any) => {
				Run_.contexts[Context_.name] = Context_;
				return () => true;
			},
		};
	});
	Run.State.Now = FakeClock;
	return Run;
};

/**
 * Invoke one registered tool as the registry would (execute with the agent).
 */
export const CallTool = async (Run: any, Name: string, Args: any, Agent: any = AgentA): Promise<any> =>
	Run.tools[Name].execute(Args, { agent: Agent, callId: "call_tool", rootCallId: "call_tool", signal: undefined });

/**
 * The live_plant tool call.
 */
export const live_plant = async (Run: any, Agent: any, Args: any): Promise<any> => CallTool(Run, "live_plant", Args, Agent);

/**
 * The live_container_set tool call.
 */
export const live_set = async (Run: any, Agent: any, Args: any): Promise<any> => CallTool(Run, "live_container_set", Args, Agent);

/**
 * The live_monitor tool call (the wave-3 surface).
 */
export const live_monitor = async (Run: any, Agent: any, Args: any): Promise<any> => CallTool(Run, "live_monitor", Args, Agent);

/**
 * The completion provider's current text for one agent (the registered
 * dynamic context, read exactly as the loop's refreshContext would).
 */
export const PendingText = (Run: any, Agent: any = AgentA): string =>
	Run.contexts["live-containers-completion"]?.text({ agent: Agent, scope: Agent }) ?? "";

// -- the WAVE-3 fixtures (appended; the phase-1 and wave-2 fixtures above are untouched) --

/**
 * The fake storage facility (the monitor domain's P5-style open): captures
 * the defineDomain spec, records puts, offers the read surface the recovery
 * uses, and an optional failure mode for the loud-open test.
 */
export const FakeStorage = (Options: { failOpen?: boolean } = {}): any => {
	const Store: any = {
		spec: undefined as any,
		records: new Map<string, any>(),
		failOpen: Options.failOpen === true,
	};
	Store.facility = {
		open: async (Spec: any) => {
			if (Store.failOpen) {
				throw new Error("storage unavailable");
			}
			Store.spec = Spec;
			return {
				close: async () => undefined,
				table: (_Name: string) => ({
					put: async (Key: string, Value: any) => {
						Store.records.set(Key, Value);
					},
					get: (Key: string) => Store.records.get(Key),
					entries: () => Store.records.entries(),
					keys: () => Store.records.keys(),
					get size() {
						return Store.records.size;
					},
					delete: async (Key: string) => Store.records.delete(Key),
					update: async (Key: string, Fn: any) => {
						const Next = Fn(Store.records.get(Key));
						Store.records.set(Key, Next);
						return Next;
					},
				}),
			};
		},
	};
	/** Seed one record (the restart scenario: the store outlives the process). */
	Store.seed = (Key: string, Record: any): void => {
		Store.records.set(Key, Record);
	};
	return Store;
};

/**
 * Open the monitor storage domain against a fake facility (the body of the
 * effect Apply registers; the fake ctx has no effect method, so the tests
 * drive the module directly).
 */
export const OpenStorage = async (Run: any, Facility: any): Promise<void> => {
	const Storage: any = await import("../../Target/Function/Storage.js");
	await Storage.default(Run.State, Facility, (Message: string) =>
		Run.State.Factory.Append(Run.State, Message),
	);
};

/**
 * Fire one fs/observed event through the L11 observer (registered on the
 * ROOT context through the factory's Wire - the fake ctx's root is the ctx
 * itself, so the listener sits in the capture).
 */
export const FireObserved = (
	Run: any,
	Path: string,
	Version: string,
	Actor: any = { agent: { id: "agent-a", session: undefined } },
): void => {
	Run.Listeners["fs/observed"](
		{ displayPath: Path, targetKey: Path },
		{ kind: "present", version: Version },
		Actor,
	);
};

/**
 * Commit one volatile flip and fire the loader/volatile-update listener with
 * the changed path (the live sequence: commit, then the event).
 */
export const FlipLive = (Run: any, Key: string, Value: unknown): void => {
	Flip((Run.Raw as any)[Key], Value);
	Run.Listeners["loader/volatile-update"]([Key]);
};

/**
 * The wave-3 config: monitors on, a watchlist entry for TypeScript files,
 * and the schema's default monitor knobs (the shape the schema fills).
 */
export const MonitorConfig = (Extra: any = {}): any => ({
	monitors: "on",
	watchlist: [{ glob: "**/*.ts", checks: ["tsc", "format"] }],
	monitor: {
		debounceMs: 1500,
		maxMonitors: 8,
		maxMonitorJobs: 3,
		retireMs: 600000,
		staleMs: 300000,
		slowCheckIntervalMs: 0,
		bandCapBytes: 2048,
		checkTimeoutMs: 120000,
		linkageAlertVersions: 3,
		dedupWindowMs: 30000,
	},
	...Extra,
});

/**
 * A command-runner exec fixture (the bash tool's argument shape).
 */
export const Exec = (Command: string, Extra: any = {}): any => ({
	callId: `call_${Math.random().toString(16).slice(2, 8)}`,
	rootCallId: "call_root",
	name: "bash",
	arguments: { description: "run", command: Command, ...Extra },
	agent: AgentA,
	signal: undefined,
});/**
 * The {{time}} value the plugin renders for a clock value (the same
 * Intl shape Counters.Table uses - the expected bytes are computed with the
 * plugin's own formatting contract, so the assertion stays deterministic
 * under the fake clock).
 */
export const ExpectedTime = (Ms: number): string =>
	new Intl.DateTimeFormat("en-GB", {
		timeZone: Zone(),
		hour12: false,
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	}).format(new Date(Ms));

/**
 * The {{date}} value for a clock value.
 */
export const ExpectedDate = (Ms: number): string =>
	new Intl.DateTimeFormat("en-CA", {
		timeZone: Zone(),
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date(Ms));

/**
 * The {{tz}} value (the host zone, the same helper Counters uses).
 */
export const Zone = (): string => {
	try {
		return new Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
	} catch {
		return "UTC";
	}
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
	// The seam selfcheck: the fake ctx actually wires the plugin (the
	// vacuously-green backstop for every folder's fixture - a broken seam
	// would print fewer checks in every folder, which the runner's
	// expected-count guard catches; this proves the seam itself at build
	// time). WAVE-2 NOTE: the wave-2 listeners arm only when the jobs stack is
	// composed (the arming gate in Apply) - this bare fixture has no services,
	// so the phase-1 count of five is unchanged; the wave-2 folders mount with
	// MakeWave, which provides the services.
	rm();
	const Run = Make(Validate({ logFile: Ledger }));
	Check(Count, "selfcheck: the fake ctx registers the plugin's apply-time wiring", () => {
		assert.equal(Object.keys(Run.Listeners).length, 5);
		assert.equal(Run.State.Module, "hook-dsh-live-containers");
		assert.ok(
			Run.Lines.some((L: string) => L.startsWith("hook-dsh-live-containers: disabled")),
		);
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

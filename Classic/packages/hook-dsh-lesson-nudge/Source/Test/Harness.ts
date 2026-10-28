// Source/Test/Harness.ts - the shared test harness for the LESSON-NUDGE hook:
// the fake ctx (the listener capture, the logger, the probe-once `get`), the
// fake plugin factory (the State builder + the ledger), the fake lesson service
// and the fake agent - plus the REAL built `apply` from Target/Library.js. The
// family fake-ctx + real-built-library pattern, written ONCE per package.
//
// THE LISTENER IS CAPTURED, NOT DISPATCHED: the hook registers through
// `ctx.on("agent/status", fn)`, so the harness records each registration and the
// scenario fires it by hand with a literal payload. That is what makes the idle
// edge assertable without a live agent loop.
//
// THE AGENT'S MAINTENANCE IS SYNCHRONOUS-ENOUGH: `runMaintenance` records the
// task and then runs it on the microtask queue, so `Settle()` is the whole
// waiting story - no timers, no polling.
//
// Standalone selfcheck: `node Target/Test/Harness.js --selfcheck` proves the
// counter counts, the fake factory writes the ledger, and the real `apply`
// registers exactly one listener (the vacuously-green backstop).
import assert from "node:assert/strict";

import { apply, Config, inject, name } from "../../Target/Library.js";

export { apply, Config, inject, name };

/** The per-folder counter. */
export type Counter = { N: number; F: number };

export const MakeCounter = (): Counter => ({ N: 0, F: 0 });

/** One check = the source suite's ok group. */
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

/** The async variant of Check. */
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

/** End-of-folder guard. */
export const Finish = (Count: Counter, Name: string): number => {
	if (Count.F !== 0) {
		throw new Error(`${Name}: ${Count.F} failed check(s)`);
	}
	return Count.N;
};

/** Flush the detached maintenance task (the microtask queue, then the macrotask). */
export const Settle = async (): Promise<void> => {
	for (let Index = 0; Index < 4; Index++) {
		await new Promise<void>((Resolve) => setImmediate(Resolve));
	}
};

/** One captured listener registration. */
export interface Registration {
	name: string;
	fn: (Payload: any) => void;
}

/**
 * The fake plugin factory: the State builder (the `fields` map, cell-unwrapped)
 * and the ledger (`<module>: <message>`), which is the shape the real factory
 * publishes to the family's `~/.dsh/<identity>.log`.
 */
export const FakeFactory = (Lines: string[]): any => ({
	State: (_Context: any, Options: any, Specification: any) => {
		const State: any = { __module: Specification?.module ?? "unknown" };
		for (const [Key, Field] of Object.entries(Specification?.fields ?? {})) {
			const Raw = (Options ?? {})[Field as string];
			State[Key] = typeof (Raw as { get?: unknown })?.get === "function"
				? (Raw as { get: () => unknown }).get()
				: Raw;
		}
		return State;
	},
	Append: (State: any, Message: string) => {
		Lines.push(`${State.__module}: ${Message}`);
	},
});

/** The fake lesson service: the recorded calls and a settable `due`. */
export const FakeLesson = (Options: { due?: boolean; snapshot?: unknown[]; outcome?: string } = {}): any => {
	const Calls = { tick: [] as unknown[], snapshot: [] as unknown[], review: [] as any[] };
	const Lesson = {
		Calls,
		Due: Options.due !== false,
		Tick: (Agent: unknown) => {
			Calls.tick.push(Agent);
			return { due: Lesson.Due, count: 10 };
		},
		Snapshot: (Agent: unknown) => {
			Calls.snapshot.push(Agent);
			return Options.snapshot ?? [{ role: "user", text: "hello" }];
		},
		Review: async (Input: any) => {
			Calls.review.push(Input);
			return { outcome: Options.outcome ?? "proposed", applied: [], proposed: ["one"] };
		},
	};
	return Lesson;
};

/** The fake agent: an identity, a session id and a recording maintenance seam. */
export const FakeAgent = (Id = "session-1"): any => {
	const Tasks: ((Signal: AbortSignal) => Promise<unknown>)[] = [];
	return {
		Tasks,
		session: { id: Id },
		options: { provider: "fake", model: "fake" },
		runMaintenance: (Task: (Signal: AbortSignal) => Promise<unknown>) => {
			Tasks.push(Task);
			return Promise.resolve().then(() => Task(new AbortController().signal));
		},
	};
};

/**
 * The fake ctx + the REAL built apply: the listener capture, the logger, the
 * probe-once `get`, and the factory. The knobs default to the TEST posture
 * (`enabled: true`), because the schema's disabled default is the LOADED
 * posture and every scenario here is about behaviour once enabled.
 */
export const Make = (
	Knobs: Record<string, unknown> = {},
	Attach?: (Context: any, Run: any) => void,
): any => {
	const Lines: string[] = [];
	const Warns: string[] = [];
	const Listeners: Registration[] = [];
	const Context: any = {
		logger: {
			info: (M: string) => {
				Lines.push(M);
			},
			warn: (M: string) => {
				Warns.push(M);
			},
		},
		get: (Name: string) => Context[Name],
		on: (Name: string, Fn: (Payload: any) => void) => {
			Listeners.push({ name: Name, fn: Fn });
			return () => true;
		},
		pluginFactory: FakeFactory(Lines),
	};
	const Run: any = { Context, Lines, Warns, Listeners };
	Attach?.(Context, Run);
	apply(Context, {
		enabled: true,
		logFile: "~/.dsh/playform/hook-dsh-lesson-nudge.log",
		maxReviewsPerSession: 3,
		policy: {
			read: "auto",
			index: "auto",
			record: "auto",
			suggest: "auto",
			write: "approve",
			commit: "approve",
			spawn: "approve",
			message: "auto",
		},
		...Knobs,
	} as any);
	Run.State = Context.__hookDshLessonNudgeState;
	return Run;
};

/** Fire the hook's status listener by hand. */
export const Status = (Run: any, Payload: { agent?: unknown; status?: string }): void => {
	for (const Listener of Run.Listeners) {
		if (Listener.name === "agent/status") {
			Listener.fn(Payload);
		}
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
	const Run = Make();
	Check(Count, "selfcheck: the real apply registers exactly one agent/status listener", () => {
		assert.equal(Run.Listeners.length, 1, "one listener");
		assert.equal(Run.Listeners[0]?.name, "agent/status", "on the idle edge");
	});
	Check(Count, "selfcheck: the activation line is the factory's ledger shape", () => {
		assert.deepEqual(Run.Lines, ["hook-dsh-lesson-nudge: activated (bundle=0.2.1, cap=3)"]);
	});
	Check(Count, "selfcheck: the loader contract exports are all present", () => {
		assert.equal(name, "hook-dsh-lesson-nudge", "the name");
		assert.deepEqual(inject, ["pluginFactory"], "the inject list");
		assert.equal(typeof apply, "function", "the apply function");
		assert.notEqual(Config, undefined, "the schema");
	});
	if (Count.N === 5 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

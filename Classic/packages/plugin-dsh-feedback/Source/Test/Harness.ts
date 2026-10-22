// Source/Test/Harness.ts - the shared test harness for the FEEDBACK tests:
// the fake ctx (the ctx listener capture for session/event, the
// reflect.provide capture, the logger capture) + the REAL feedback class
// from its built Target, constructed the way the registry does
// (new Feedback(ctx, config)). The journal writes to a REAL temp-dir file
// (the durable JSON lines are part of the contract), so every scenario
// starts from an empty ledger.
//
// Standalone selfcheck: `node Target/Test/Harness.js --selfcheck` runs the
// counter through one deliberate pass + one deliberate failure and exits 0
// only when both are counted exactly, then proves the fake ctx actually
// wires the plugin (the vacuously-green backstop for every folder's
// fixture).
//
// NO FAKE CLOCK for the service logic: the blocks carry an epoch `at` stamp
// supplied by the caller (and by Parse), which the tests never assert on;
// the journal lines are parsed as JSON and compared on their event/session/
// agentId/block fields only.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import Plugin from "../../Target/Library.js";

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

export const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "feedback-smoke-"));
export const Ledger = Path.join(Root, "feedback.log");

/**
 * Remove the durable journal file: every scenario starts from an empty
 * journal so the JSON line assertions see exactly their scenario's events.
 */
export const rm = (): void => {
	try {
		FileSystem.rmSync(Ledger);
	} catch {}
};

/**
 * The journal file's parsed JSON lines (one per recorded event).
 */
export const JournalLines = (): any[] =>
	(() => {
		try {
			return FileSystem
				.readFileSync(Ledger, "utf8")
				.split("\n")
				.filter(Boolean)
				.map((Line) => JSON.parse(Line));
		} catch {
			return [];
		}
})();

/**
 * The journal events (the `event` field of each line).
 */
export const JournalEvents = (): string[] => JournalLines().map((Line) => Line.event);

/**
 * The real-config shape the registry hands to the class constructor. Build
 * one via the plugin's schema. The cast is fixture-only scaffolding.
 */
export const Validate = (Raw: Record<string, unknown>): any =>
	(Plugin.Config as unknown as (Raw: Record<string, unknown>) => any)({ ...Raw });

/**
 * The fake ctx: `on` captures the session/event listener into a map (the
 * constructor registers exactly one), reflect.provide captures the service
 * registration (the Service base constructor calls
 * ctx.reflect.provide("feedback", this)), the logger records.
 */
export const Make = (Raw: any): any => {
	const Listeners: any = {};
	const Lines: string[] = [];
	const Provided: any = {};
	const Context: any = {
		logger: {
			info: (M: string) => {
				Lines.push(M);
			},
			warn: (M: string) => {
				Lines.push(`WARN: ${M}`);
			},
		},
		on: (Name: string, Listener: unknown) => {
			Listeners[Name] = Listener;
			return () => true;
		},
		reflect: {
			provide: (Name: string, Value?: unknown) => {
				Provided[Name] = Value ?? true;
				Context[Name] = Value;
				return () => true;
			},
		},
	};
	const Service = new (Plugin as any)(Context, Raw);
	const Run: any = {
		Context,
		Service,
		Listeners,
		Lines,
		Provided,
		Raw,
		State: (Service as any).State,
	};
	return Run;
};

/**
 * Fire one session/event through the captured listener.
 */
export const Fire = (Run: any, Event: { type?: string; data?: unknown }): void => {
	Run.Listeners["session/event"](undefined, Event);
};

/**
 * A fully formed feedback block for the fixtures.
 */
export const Block = (Overrides: Record<string, unknown> = {}): any => ({
	agentId: "agent-a",
	task: "write the smoke",
	session: "session-child",
	liked: "the harness was clear",
	disliked: "the registry lagged",
	deltas: [],
	transferred: [],
	readStatus: "unread",
	at: 1000,
	...Overrides,
});

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
	const Run = Make(Validate({ logFile: Ledger }));
	Check(Count, "selfcheck: the constructor registers the service and the listener", () => {
		assert.ok(Run.Provided["feedback"] !== undefined);
		assert.ok(Run.Listeners["session/event"] !== undefined);
		assert.equal(Run.State.Config.enabled, true);
		Run.Service.Record(Block());
		assert.equal(JournalEvents()[0], "recorded");
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

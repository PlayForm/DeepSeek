// Source/Test/Harness.ts - the shared test harness for the CCR tests: the
// fake ctx of the source suite (on capture with listener options, get
// returning the REAL @playform/plugin-dsh-factory instance from its built
// Target, logger info/warn capture, the tool registry seam, the ROOT seam) +
// the REAL CCR apply (from the built Target) - the seams from the source
// suite, written ONCE per package and imported by every test folder. The
// content helpers (the sha256-24 hash, the serialized size, the terminal
// text, the exec stub, the waterfall default) are also here, since nearly
// every folder drives the post-execute listener with them.
//
// Standalone selfcheck: `node Target/Test/Harness.js --selfcheck` runs the
// counter through one deliberate pass + one deliberate failure and exits 0
// only when both are counted exactly, then proves the fake ctx actually wires
// apply (the vacuously-green backstop for every folder's fixture);
// prepublishOnly.sh gates the build on it. Imported as a library, this module
// only exports.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { rmSync } from "node:fs";
import CCR from "../../Target/Library.js";
import FactoryClass from "../../../plugin-dsh-factory/Target/Library.js";

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
 * One check = the source suite's Check (one PASS/FAIL line each). The
 * callback carries that check's condition VERBATIM (same bytes, same order
 * within the folder); a throw inside counts the check failed - every later
 * check still runs, and Finish turns any failure into a non-zero exit for
 * the runner.
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
 * The async variant of Check, for checks that await the post-execute
 * listener or the ccr_retrieve tool. Same counting and printing; the caller
 * must await it so checks stay sequential and Finish sees the final counts.
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

// The durable ledger and the opt-in JSONL journal (the source suite's fixed
// paths, verbatim) and the rm helper every folder calls at its start and at
// the same points the source suite does.
export const Ledger = "/tmp/ccr-smoke-ledger.log";
export const JournalPath = "/tmp/ccr-smoke-journal.jsonl";
export const Rm = (): void => {
	try {
		rmSync(Ledger);
	} catch {}
	try {
		rmSync(JournalPath);
	} catch {}
};

// The REAL factory instance, constructed exactly the way the factory's own
// smoke does (the Service base constructor registers through
// ctx.reflect.provide; the stub context is used once and discarded). One
// instance per folder process - the journal arithmetic inside a folder
// accumulates on it exactly like the source suite's arithmetic does.
export const Furnace: any = new FactoryClass({
	reflect: { provide: () => undefined },
} as any);

const { Config: Schema } = CCR;

/**
 * The real-config shape the loader hands to apply: volatile fields arrive as
 * `{ get }` cells. Build one via the schema. The cast is fixture-only
 * scaffolding - every check reads the returned object through the same
 * expressions the source suite uses.
 */
export const Validate = (Raw: Record<string, unknown>): any =>
	(Schema as unknown as (Raw: Record<string, unknown>) => any)({ ...Raw });

/**
 * The fake ctx + one apply: on() captures listeners AND their options (the
 * posture check), get() serves the REAL factory for "pluginFactory" and
 * throws for anything else (the factory's probe-once Seam catches the
 * throw), logger captures info + warn lines, the tool registry seam captures
 * the ccr_retrieve registration, and the fake ctx is its own root. The
 * typing is `any` deliberately - fixture-only scaffolding, so every check in
 * the folders reads the captures through the source suite's exact
 * expressions.
 */
export const Make = (Raw: any): any => {
	const Listeners: Record<string, any> = {};
	const ListenerOptions: Record<string, any> = {};
	const Lines: string[] = [];
	const Warns: string[] = [];
	const Registered: any[] = [];
	const Context: any = {
		// The service accessor (typed via Interface/Factory's augmentation): the
		// REAL factory instance, guaranteed present by
		// `inject: ["pluginFactory", "tools"]`.
		pluginFactory: Furnace,
		on: (Name: string, Listener: unknown, Options: unknown) => {
			Listeners[Name] = Listener;
			ListenerOptions[Name] = Options;
			return () => true;
		},
		get: (Name: string) => {
			switch (Name) {
				case "pluginFactory":
					return Furnace;
				default:
					throw new Error(`unknown service: ${Name}`);
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
		// The tool registry seam: records every registered definition.
		tools: {
			register: (Definition: unknown) => {
				Registered.push(Definition);
				return () => true;
			},
		},
		// The ROOT seam: cordis plugin contexts inherit `root`.
		get root() {
			return Context;
		},
	};
	CCR.apply(Context, Raw); // the loader contract: apply(ctx, config)
	return {
		Context,
		Listeners,
		ListenerOptions,
		Lines,
		Warns,
		Registered,
		State: Context.__ccrState,
	};
};

// The content helpers of the source suite, verbatim.

/**
 * The expected hash of a content array - the same sha256-24 of the
 * serialized bytes the bundle's Function/Hash computes (node:crypto, first
 * 24 hex).
 */
export const HashOf = (Content: any): string =>
	createHash("sha256").update(JSON.stringify(Content)).digest("hex").slice(0, 24);

/**
 * The exact serialized size of a content array.
 */
export const SizeOf = (Content: any): number =>
	Buffer.byteLength(JSON.stringify(Content), "utf8");

/**
 * The single text block shape.
 */
export const TextBlock = (Text: string): any[] => [{ type: "text", text: Text }];

/**
 * The exec stub passed to the post-execute listener and to ccr_retrieve.
 */
export const Exec = (Name: string): any => ({
	callId: "call_smoke",
	name: Name,
	arguments: {},
	signal: new AbortController().signal,
});

/**
 * The waterfall's downstream decision (the registry default: an accept with
 * no content and no value).
 */
export const NextAccept = async (): Promise<any> => ({ kind: "accept" });

/**
 * A terminal-shaped text: the harness's `exit code: 0` echo + filler rows.
 */
export const TerminalText = (Fill: string, Rows: number): string => {
	const Body: string[] = [];
	for (let I = 0; I < Rows; I += 1) Body.push(`row ${I} ${Fill}`);
	return `make: starting\nexit code: 0\n${Body.join("\n")}`;
};

/**
 * A ~N byte single-line text (the fill length scales the total).
 */
export const PlainText = (Bytes: number): string => "x".repeat(Math.max(0, Bytes - 2));

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
	// The seam selfcheck: the fake ctx actually wires apply (the vacuously-
	// green backstop for every folder's fixture - a broken seam would print
	// fewer checks in every folder, which the runner's expected-count guard
	// catches; this proves the seam itself at build time).
	Rm();
	const Seamed = Make(Validate({ logFile: Ledger }));
	Check(Count, "selfcheck: the fake ctx registers the apply-time listeners", () => {
		assert.ok(typeof Seamed.Listeners["tools/post-execute"] === "function");
		assert.ok(Seamed.State.Factory === Furnace);
		assert.equal(Seamed.State.Module, "ccr");
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

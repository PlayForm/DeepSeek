// Source/Test/Harness.ts - the shared test harness for the INGESTER tests:
// the fake ctx (the capturing fs service over a content map, the logger
// capture, the reflect.provide capture, the root seam) + the REAL ingester
// class from its built Target, constructed exactly as the loader constructs
// a class-form plugin (the schema-validated config, the Service base) - the
// family fake-ctx + real-built-library harness pattern, written ONCE per
// package and imported by every test folder. Each folder process gets a
// fresh set, so every folder is standalone-green.
//
// Standalone selfcheck: `node Target/Test/Harness.js --selfcheck` runs the
// counter through one deliberate pass + one deliberate failure and exits 0
// only when both are counted exactly, then proves the fake ctx actually
// constructs the service (the vacuously-green backstop for every folder's
// fixture); prepublishOnly.sh gates the build on it.
//
// NO FAKE CLOCK: the journal's `at` field is asserted as a number only - the
// wall clock is the journal's own, never an assertion target.
import { createHash as Hash } from "node:crypto";
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import Ingester from "../../Target/Library.js";

export { Ingester };

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
		console.log(_Error instanceof Error ? _Error.message : Error(String(_Error)).message);
	}
};

/**
 * The async variant of Check, for folders whose assertions await (Apply is
        async). Same counting and printing; the caller must await it so checks
 * stay sequential and Finish sees the final counts.
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
		console.log(_Error instanceof Error ? _Error.message : Error(String(_Error)).message);
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

/**
 * The sha256 of a content string (the version fence's own algorithm).
 */
export const Sha = (Content: string): string => Hash("sha256").update(Content).digest("hex");

// -- the suite-level fixtures (fresh per folder process) --

export const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "ingester-smoke-"));
export const Ledger = Path.join(Root, "ingester", "ingester.log");

/**
 * The durable journal's parsed lines (one JSON object per line).
 */
export const Journal = (): any[] =>
	(() => {
		try {
			return FileSystem.readFileSync(Ledger, "utf8")
				.split("\n")
				.filter(Boolean)
				.map((Line) => JSON.parse(Line));
		} catch {
			return [];
		}
	})();

/**
 * Reset the durable journal file.
 */
export const rm = (): void => {
	try {
		FileSystem.rmSync(Ledger);
	} catch {}
};

/**
 * The capturing fake fs: resolve/stat/readText/editText over the `files`
 * content map. editText verifies the version fence (the version guard the
 * real fs enforces) and simulates the literal replacement; every call is
 * recorded. `failEdit` makes editText throw (the stale-version race).
 */
export const FakeFs = (Files: Record<string, string> = {}, FailEdit = false): any => {
	const Fs: any = {
		files: Files,
		resolved: [] as string[],
		stats: [] as string[],
		reads: [] as string[],
		edits: [] as { path: string; find: string; replace: string; version: string }[],
	};
	Fs.resolve = async (P: string) => {
		Fs.resolved.push(P);
		return { targetKey: P, displayPath: P };
	};
	Fs.stat = async (Target: any) => {
		Fs.stats.push(Target.displayPath);
		const Text = Fs.files[Target.displayPath];
		if (Text === undefined) {
			return undefined;
		}
		return { version: Sha(Text), type: "file" };
	};
	Fs.readText = async (Target: any) => {
		Fs.reads.push(Target.displayPath);
		const Text = Fs.files[Target.displayPath];
		if (Text === undefined) {
			throw new Error("vanished");
		}
		return Text;
	};
	Fs.editText = async (Target: any, Edit: any, Guard: any) => {
		Fs.edits.push({ path: Target.displayPath, find: Edit.oldString, replace: Edit.newString, version: Guard.version });
		if (FailEdit) {
			throw new Error("FS_STALE_VERSION");
		}
		const Text = Fs.files[Target.displayPath];
		if (Text === undefined || !Text.includes(Edit.oldString) || Sha(Text) !== Guard.version) {
			throw new Error("FS_STALE_VERSION");
		}
		const Next = Text.replace(Edit.oldString, Edit.newString);
		Fs.files[Target.displayPath] = Next;
		return { operation: "update", version: Sha(Next) };
	};
	return Fs;
};

/**
 * The fake ctx for a class-form plugin: the capturing fs, the logger
 * capture, the reflect.provide capture, and the root seam (the fake ctx is
 * its own root). `FsUndefined` omits the fs entirely (the absent-service
 * scenario).
 */
export const MakeCtx = (Fs?: any): any => {
	const Lines: string[] = [];
	const Provided: any = {};
	const Context: any = {
		logger: {
			info: (M: string) => Lines.push(M),
			warn: (M: string) => Lines.push(M),
			error: (M: string) => Lines.push(M),
		},
		on: () => () => true,
		reflect: {
			provide: (Name: string, Value: unknown) => {
				Provided[Name] = Value;
			},
		},
		get: (Name: string) => Context[Name],
		get root() {
			return Context;
		},
	};
	if (Fs !== undefined) {
		Context.fs = Fs;
	}
	return { Context, Lines, Provided };
};

/**
 * One built service: the REAL ingester class from the built Target,
 * constructed with the schema-validated config (the loader's class-form
 * sequence), plus the journal reader.
 */
export const Build = (Raw: Record<string, unknown> = {}, Files: Record<string, string> = {}, FailEdit = false): any => {
	rm();
	const Fs = FakeFs(Files, FailEdit);
	const Run = MakeCtx(Fs);
	Run.Files = Files;
	Run.Fs = Fs;
	Run.Ingester = new Ingester(Run.Context, (Ingester as any).Config({ logFile: Ledger, ...Raw }));
	return Run;
};

/**
 * A valid proposal over the given targets and operations (the fence digest
 * is not re-checked by the ingester - it is the pass-on's contract).
 */
export const Proposal = (
	Id: string,
	Targets: { path: string; version: string; why: string }[],
	Operations: { path: string; find: string; replace: string; why: string }[],
	ExpiresAt = Date.now() + 60_000,
): any => ({
	id: Id,
	intent: { kind: "test", params: {} },
	targets: Targets,
	operations: Operations,
	preview: [],
	digest: "digested",
	revision: 1,
	expiresAt: ExpiresAt,
	createdAt: Date.now() - 1_000,
});

/**
 * A valid approval decision for the given proposal id.
 */
export const Decision = (Id: string, Outcome: any = "approved"): any => ({
	proposal: Id,
	outcome: Outcome,
	by: "user",
	at: Date.now(),
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
	// The seam selfcheck: the fake ctx actually constructs the service (the
	// vacuously-green backstop for every folder's fixture).
	const Run = Build();
	Check(Count, "selfcheck: the fake ctx constructs the ingester service", () => {
		assert.equal(Run.Provided["ingester"], Run.Ingester);
		assert.equal(typeof Run.Ingester.Apply, "function");
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

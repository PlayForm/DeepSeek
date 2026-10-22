// Source/Test/Harness.ts - the shared test harness for the WORKSPACE-LIVE
// library tests. The library is NOT a plugin bundle: it has no loader
// contract, no config and no context - the tests call its PURE functions
// directly through the real built Target/Library.js named exports, so the
// harness is only the counter plus the selfcheck (the vacuously-green
// backstop for every folder's fixture). NO FAKE CLOCK, NO FAKE CTX: nothing
// here touches a context, the filesystem, or time.
import assert from "node:assert/strict";
import * as Library from "../../Target/Library.js";

export const Render = Library.Render as (Section: any) => string;
export const Collapse = Library.Collapse as (Sections: any[], Budget: number) => { text: string; collapsed: boolean }[];
export const Packet = Library.Packet as (View: any) => string;

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
	// The seam selfcheck: the real built library exports the three
	// functions (the vacuously-green backstop - a broken export surface
	// would print fewer checks in every folder, which the runner's
	// expected-count guard catches).
	Check(Count, "selfcheck: the built library exports Render, Collapse and Packet", () => {
		assert.equal(typeof Render, "function");
		assert.equal(typeof Collapse, "function");
		assert.equal(typeof Packet, "function");
		assert.equal(
			Render({ id: "s", kind: "note", title: "t", lines: ["x"], version: "1" }),
			[
				"--- WORKSPACE SECTION s (note) - t @ 1 ---",
				"x",
				"--- END WORKSPACE SECTION s ---",
			].join("\n"),
		);
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}

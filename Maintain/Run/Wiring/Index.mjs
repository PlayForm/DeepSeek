// Run-Wiring - the wiring-battery runner (the live ~/.dsh integration test
// per Documentation/Plans/DOGFOOD-TESTING.md). Owns the full scratch
// lifecycle - create (pack tarballs, NO symlinks) -> install (file: copy
// deps) -> activate (the real harness boot) -> exercise (the governed-write
// script through the harness's own event loop) -> verify (the wiring test
// folders) -> destroy (`rm -rf`, no residue; the real profiles untouched).
//
// Since the wiring restructure, the verification units are the COMPILED
// per-test folders under <tree>/smokes/Test/<Suite>/{Gate-And-Harness,
// Live-Assertions}/ (one Test.mjs per folder, built by
// <tree>/smokes/Build-Tests.sh). The former .mjs suite originals were
// retired by the wrap-up lane (I8) - the folders are the arbiter. The
// folders keep the same env gate (DSH_TEST_SCRATCH) and the same self-skip
// behavior; this runner always sets the gate, so they never skip here.
//
// THE COUNTS: each folder prints `N PASS - <Suite>/<Folder>` and its README
// declares the expected count under `## Expected count` (with the gate ON) -
// this runner enforces the match (the vacuously-green guard, like
// Maintain/Run/Smokes/Index.mjs) and reports per-folder and combined wiring
// counts, never the 733/746 mechanics numbers.
import { spawnSync } from "node:child_process";

import Trees from "../../Common/Variable/Trees.mjs";
import Run from "./Function/Run.mjs";
import Suites from "./Variable/Suites.mjs";

if (spawnSync("dsh", ["--version"], { encoding: "utf8" }).status !== 0) {
	console.error("Run-Wiring: the dsh CLI is not available on PATH");
	process.exit(1);
}

const { Failed, Totals } = await Run(Suites);
const Combined = Totals.reduce((Sum, N) => Sum + N, 0);
console.log(
	Failed === 0
		? `\nAll ${Suites.length * Trees.length} wiring suites passed (${Combined} checks; the wiring folders self-skip inside Run-Smokes without DSH_TEST_SCRATCH).`
		: `\n${Failed} wiring suite(s) FAILED.`,
);
process.exit(Failed === 0 ? 0 : 1);

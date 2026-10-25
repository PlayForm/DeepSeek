// Run-Smokes - the smoke runner for the monorepo (the shell-free
// replacement for the bash for-loop over the mechanics suites). Enumerates
// every package's compiled per-test folders (`Classic/packages/*/Target/Test/`
// and `EffectTS/packages/*/Target/Test/`, one folder per test, each holding
// `Test.js` + the `README.md` that declares its expected PASS count), spawns
// each `Test.js` with stdio inherit, and FAILS if the process exits non-zero
// OR if the printed `N PASS - <Name>` line does not match the README's
// expected count - the vacuously-green guard: a mis-wired folder that passes
// with the wrong number of exercised checks is still a failure.
//
// THE COUNTING (the final line's n): one unit per per-test folder under any
// Target/Test/ tree. Folders are counted, not suites, because each folder is
// run and guarded individually. The former `.mjs` fallback suites (42 files)
// were retired by the wrap-up lane (I8) once every package's Source/Test
// folders covered its suite - the runner's glob counts ONLY the folders now;
// the per-suite before/after totals live in the totals ledger of
// Documentation/Plans/SMOKE-SUITE-RESTRUCTURE-BLUEPRINT.md. The wiring
// battery lives in <tree>/smokes/Test/ (built by <tree>/smokes/Build-Tests.sh)
// and runs under Maintain/Run/Wiring/Index.mjs; without DSH_TEST_SCRATCH its
// folders self-skip, and its `.mjs` originals are retired too.
import Folders from "./Function/Folders.mjs";
import Run from "./Function/Run.mjs";

const Suites = Folders();
const Code = await Run(Suites);
if (Code !== 0) process.exit(Code);
console.log(
	`\nAll ${Suites.length} smoke suites passed (the wiring suites self-skip without DSH_TEST_SCRATCH; see Maintain/Run/Wiring/Index.mjs).`,
);

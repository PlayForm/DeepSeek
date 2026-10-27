# The family smokes (the arbiter)

The fourteen mechanics suites - **core 15 / factory 53 / governor 79 / pinner 32 / cargo 62 /
normalize-dash 184 / quotes 104 / ellipsis 104 / spaces 104 / invisible 104 / fullwidth 104 /
normalize-file 112 / ccr 147 / tool-coach 129** - live as per-test folders under their packages
(`Classic/packages/<bundle>/Source/Test/`, compiled into `Target/Test/`), while the folders of the
seven wiring suites live in this directory (see below).

The `.mjs` fallback files are RETIRED (the wrap-up lane, I8), because the folders are the arbiter
now, and the per-suite before/after totals live in the totals ledger of
`Documentation/Plans/SMOKE-SUITE-RESTRUCTURE-BLUEPRINT.md`.

The aggregate (2026-10-24 state) is **269 Classic test folders + 242 EffectTS test folders, and 511
suites / 6,612 checks across both trees**, which is the original 14 mechanics suites plus every
package's own suites, all green via `node Maintain/Run-Smokes.mjs`.

- Each test loads the REAL built `Target/Library.js` of its bundle, and the factory's own tests and
  the consumers' tests instantiate the REAL factory against a fake ctx.
- The ledger strings are the CONTRACT: every assertion is byte-identical, and the tests are the
  arbiter after every change.
- Fixtures: the tests self-create their temp trees, and the live-fixture directories live under the
  family workspace root (the monorepo root).
- Bundle paths: the tests import the bundles from the package-relative `../../Target/...`
  specifiers, because the bundles live in `Classic/packages/<bundle>/`, each with its own
  node_modules restored via `pnpm install --ignore-scripts` from the directory of the bundle.

Run a single mechanics test with `node Classic/packages/<bundle>/Target/Test/<Name>/Test.js`, or run
the whole tree with `node Maintain/Run-Smokes.mjs` (the aggregate, which also guards the printed
PASS count of each folder against its README).

## The per-test folders (the arbiter)

Each suite lives in the own `Source/Test/<test-name>/` folders of the package (one singular TS test
file + one README.md per folder, compiled by the `Configuration/Test-ESBuild.ts` step of the package
into `Target/Test/`).

The folders run standalone (`node Classic/packages/<bundle>/Target/Test/<Name>/Test.js`) and under
the aggregate (`node Maintain/Run-Smokes.mjs`, which compares the printed PASS count of each folder
against the expected count of its README, the vacuously-green guard).

The former `.mjs` suite files are removed, and the folder README sums equal the recorded baselines.

## The wiring suites (the live battery)

The seven wiring suites (`scratch-profile`, `profile-assembly`, `patch-layer`, `live-ledger`,
`governed-write`, `refusal-path`, `introspection`) have no owning package, because they exercise the
LIVE `~/.dsh` harness against the real built targets, so their converted folders live in this smokes
tree: `Test/<Suite>/{Gate-And-Harness,Live-Assertions}/`.

Each folder holds one `Test.ts` + one `README.md`, and `sh Build-Tests.sh` (in this directory)
compiles them in place to `Test.mjs` (build output, git-ignored) and type-checks the tree.

The `Gate-And-Harness` folder carries the skip guard and shared harness contract of the suite, and
the `Live-Assertions` folder carries the live checks of the suite.

The folders import the real `wiring-live.mjs` (no copy) and keep the same `DSH_TEST_SCRATCH` gate,
where unset means `SKIPPED (no scratch home)` with exit 0.

Their former `.mjs` originals are retired like those of the mechanics suites, and the folders are
the arbiter.

They run under `node Maintain/Run-Wiring.mjs` (which sets the gate and guards the printed count of
each folder against its README) and are never forced green in the aggregate.

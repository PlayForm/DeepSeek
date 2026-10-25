# The family smokes (the arbiter)

The fourteen mechanics suites - **core 14 / factory 42 / governor 82 / pinner 32 / cargo 62 /
normalize-dash 184 / quotes 104 / ellipsis 104 / spaces 104 / invisible 104 / fullwidth 104 /
normalize-file 112 / ccr 147 / tool-coach 129** - live as per-test folders under their packages
(`EffectTS/packages/<bundle>/Source/Test/`, compiled into `Target/Test/`); the seven wiring suites'
folders live in this directory (see below).

The `.mjs` fallback files are RETIRED (the wrap-up lane, I8): the folders are the arbiter now, and
the per-suite before/after totals live in the totals ledger of
`Documentation/Plans/SMOKE-SUITE-RESTRUCTURE-BLUEPRINT.md`.

The aggregate (2026-10-22 state): **175 EffectTS test folders, and 359 suites / 5,337 checks across
both trees with Classic's 184** - the original 14 mechanics suites plus every package's own suites,
all green via `node Maintain/Run-Smokes.mjs`.

- Each test loads the REAL built `Target/Library.js` of its bundle (the factory's own tests + the
  consumers' tests instantiate the REAL factory against a fake ctx).
- The ledger strings are the CONTRACT: every assertion is byte-identical; the tests are the arbiter
  after every change.
- Fixtures: the tests self-create their temp trees; the live-fixture directories live under the
  family workspace root (the monorepo root).
- Bundle paths: the tests import the bundles from the package-relative `../../Target/...` specifiers
  (the bundles live in `EffectTS/packages/<bundle>/`, each with its own node_modules restored via
  `pnpm install --ignore-scripts` from the bundle's directory).
- The counts are the CLASSIC numbers plus the additive EffectTS coverage (factory +7, governor +3;
  core is at parity at 14): 1324 total vs Classic's 1314 (both totals include the shared ccr suite
  at 147).
- The ccr and tool-coach tests add the family's tracing-hygiene mode as their additive EffectTS
  coverage: their core assertions run a second time with `FACTORY_SMOKE_TRACING=1` (the traced
  runtime lives in `@playform/ets-base-dsh`) and the rerun must be byte-identical - stdout AND the
  durable ledger log (the `[ISO]` stamps normalized). The comparison is silent (`node:assert`), so
  the printed PASS stream is the same 147 in both modes.

Run a single mechanics test with `node EffectTS/packages/<bundle>/Target/Test/<Name>/Test.js`; run
the whole tree with `node Maintain/Run-Smokes.mjs` (the aggregate, which also guards each folder's
printed PASS count against its README).

## The per-test folders (the arbiter)

Each suite lives in the package's own `Source/Test/<test-name>/` folders (one singular TS test
file + one README.md per folder, compiled by the package's `Configuration/Test-ESBuild.ts` step into
`Target/Test/`). `ets-lib-dsh-core`'s eight shared folders are byte-twins of the Classic tree's
folders under the tree-identity substitutions; its two former ETS-only folders (`Stream-Gate/`,
`Update-Envelope/`) are re-homed into the base's own tree
(`EffectTS/packages/ets-base-dsh/Source/Test/`). The folders run standalone
(`node EffectTS/packages/<bundle>/Target/Test/<Name>/Test.js`) and under the aggregate
(`node Maintain/Run-Smokes.mjs`, which compares each folder's printed PASS count against its
README's expected count — the vacuously-green guard).

The former `.mjs` suite files are removed; the folder README sums equal the recorded baselines.

## The wiring suites (the live battery)

The seven wiring suites (`scratch-profile`, `profile-assembly`, `patch-layer`, `live-ledger`,
`governed-write`, `refusal-path`, `introspection`) have no owning package - they exercise the LIVE
`~/.dsh` harness against the real built targets - so their converted folders live in this smokes
tree: `Test/<Suite>/{Gate-And-Harness,Live-Assertions}/`. Each folder holds one `Test.ts` + one
`README.md`; `sh Build-Tests.sh` (in this directory) compiles them in place to `Test.mjs` (build
output, git-ignored) and type-checks the tree.

The `Gate-And-Harness` folder carries the suite's skip guard and shared harness contract; the
`Live-Assertions` folder carries the suite's live checks.

The folders import the real `wiring-live.mjs` (no copy) and keep the same `DSH_TEST_SCRATCH` gate -
unset means `SKIPPED (no scratch home)` with exit 0.

Their former `.mjs` originals are retired like the mechanics suites'; the folders are the arbiter.
They run under `node Maintain/Run-Wiring.mjs` (which sets the gate and guards each folder's printed
count against its README) and are never forced green in the aggregate.

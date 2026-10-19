# The family smokes (the arbiter)

The fourteen smoke suites — **core 14 / factory 34 / governor 78 / pinner 32 / cargo 62 /
normalize-dash 132 / quotes 62 / ellipsis 62 / spaces 62 / invisible 62 / fullwidth 62 /
normalize-file 71 / ccr 146 / tool-coach 129** — live in this directory (`Classic/smokes/`), kept out of `/tmp` because `/tmp`
gets cleared.

- Each smoke loads the REAL built `Target/Library.js` of its bundle (the factory's own smoke + the
  consumers' smokes instantiate the REAL factory against a fake ctx).
- The ledger strings are the CONTRACT: every assertion is byte-identical; the smokes are the arbiter
  after every change.
- Fixtures: the smokes self-create their temp trees; the live-fixture directories live under the
  family workspace root (the monorepo root).
- Bundle paths: the smokes import the bundles from the monorepo-relative
  `../packages/<bundle>/Target/...` (the bundles live in `Classic/packages/<bundle>/`, each with its
  own node_modules restored via `pnpm install --ignore-scripts` from the bundle's directory).

Run them with `node <name>-smoke.mjs` from this directory — the imports resolve relative to each
smoke file, so the CWD does not matter.

## The migration (per-test folders)

The restructure moves each suite into the package's own `Source/Test/<test-name>/` folders
(one singular TS test file + one README.md per folder, compiled by the package's
`Configuration/Test-ESBuild.ts` step into `Target/Test/`). `hook-dsh-core` is converted: its
folders run standalone (`node Classic/packages/hook-dsh-core/Target/Test/<Name>/Test.js`)
and under the aggregate (`node Maintain/Run-Smokes.mjs`, which also guards each folder's
printed PASS count against its README). The `.mjs` suites stay here unchanged during the
migration - they are the byte-identical fallback and remain the arbiter until a later lane
retires each one.

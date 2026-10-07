# The family smokes (the arbiter)

The twelve smoke suites — **core 14 / factory 34 / governor 78 / pinner 32 / cargo 62 /
normalize-dash 132 / quotes 62 / ellipsis 62 / spaces 62 / invisible 62 / fullwidth 62 /
normalize-file 71** — live in this directory (`Classic/smokes/`), kept out of `/tmp` because `/tmp`
gets cleared.

- Each smoke loads the REAL built `Target/Library.js` of its bundle (the factory's own smoke + the
  consumers' smokes instantiate the REAL factory against a fake ctx).
- The ledger strings are the CONTRACT: every assertion is byte-identical; the smokes are the arbiter
  after every change.
- Fixtures: the smokes self-create their temp trees; the live-fixture directories live under the
  family workspace root (`DeepSeek/`, e.g. `~/Developer/Application/PlayForm/DeepSeek/`).
- Bundle paths: the smokes import the bundles from the monorepo-relative
  `../packages/<bundle>/Target/...` (the bundles live in `Classic/packages/<bundle>/`, each with its
  own node_modules restored via `pnpm install --ignore-scripts` from the bundle's directory).

Run them with `node <name>-smoke.mjs` from this directory — the imports resolve relative to each
smoke file, so the CWD does not matter.

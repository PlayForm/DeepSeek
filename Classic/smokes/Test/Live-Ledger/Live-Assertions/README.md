# Live-Ledger / Live-Assertions

The ledger files of the scratch run, read from real log files instead of synthetic captures.

## Intent

The exercised boot must leave real ledger files under `$SCRATCH/ledgers` (the storage domain under the redirected `DSH_HOME`), every activation line of a family module must match the smoke-contract string byte-for-byte with the scratch paths substituted, and every ledger line must be the `[ISO] message` form.

The one root `llm/stream` waterfall must produce the exact per-flavor count lines, and the exercised writes must leave the chain lines of the governor, the pinner, and the cargo governor, including the visible storage-domain open failure edge.

## Scenario

- Group: the ledger files exist
  - Leaf 1-10: `governor`, `pinner`, `cargo-governor`, `normalize-dash`,
    `quotes`, `ellipsis`, `spaces`, `invisible`, `fullwidth`,
    `normalize-file` each have a `.log` under the scratch home.
- Group: the activation lines (byte-identical)
  - Leaf 11-20: one per module, where the activation line carries the scratch logFile substituted (governor, pinner, cargo-governor, normalize-dash, quotes, ellipsis, spaces, invisible, fullwidth, normalize-file).
- Group: the ISO form
  - Leaf 21: every governor ledger line is ISO-stamped.
- Group: the flavor counts per exercised stream
  - Leaf 22-27: one per flavor - `normalized N ... char(s) in one stream`.
- Group: the governance chain lines
  - Leaf 28: the governed event-path write logged the governed line of the governor.
  - Leaf 29: the pinner logged its no-changes line for the governed manifest.
  - Leaf 30: the cargo direct fold logged the governed line for the chain
    Cargo.toml.
  - Leaf 31: the cargo chain discovery logged the no-registry line.
  - Leaf 32: the refusal attempt logged the byte-identical REFUSED line.
- Group: the storage-domain gap
  - Leaf 33: the storage journal open failure is recorded (the visible edge of the silent-catch era, and the carrying ledger varies by boot).

## Fixtures

- The exercise boot (via `Exercise()`): the ledgers are its product, so it must run first.
- `$DSH_TEST_SCRATCH/ledgers/*.log`: the real log files that this folder reads.

## Expected ledger strings (byte-exact)

- `activated (anywhere mode, logFile=<ledgers>/governor.log, updateMode=programmatic, ncuBin=ncu, exclude=[node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app], policyFile=(discovery))`
- `activated (pinner, logFile=<ledgers>/pinner.log, sections=[dependencies, devDependencies, peerDependencies, optionalDependencies], exclude=[node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app])`
- `activated (cargo flavor, logFile=<ledgers>/cargo-governor.log, updateMode=cargo, cargoBin=<home>/fake-cargo, exclude=[node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app], policyFile=(discovery), keepFile=(discovery))`
- `activated (replacement=-, reasoning=on, toolArgs=on, logFile=<ledgers>/normalize-dash.log)`
- `activated (reasoning=on, toolArgs=on, logFile=<ledgers>/quotes.log)` (and
  the ellipsis `replacement=...`, spaces `replacement= ` , invisible
  `replacement=`, fullwidth variants)
- `activated (replacement=-, logFile=<ledgers>/normalize-file.log)`
- `normalized 1 dash char(s) in one stream` / `normalized 2 quote char(s) in
  one stream` / `normalized 1 ellipsis char(s) in one stream` /
  `normalized 1 space char(s) in one stream` / `normalized 1 invisible
  char(s) in one stream` / `normalized 1 fullwidth char(s) in one stream`
- `governed <path> \u2192 ` (U+2192) - the governor's and cargo's chain lines
- `no changes to pin for <path>`
- `no registry.json found for <path> \u2014 chain pass skipped` (U+2014)
- `REFUSED rewrite of <path>: dependency "leftover" in section "dependencies"
  not found in text \u2014 rewrite aborted` (U+2014)
- `storage journal open failed: domain 'package_governance' is already open`

## Edge cases

- WHICH ledger of a module carries the storage-journal open failure depends on which open loses the best-effort race, so the check scans the family ledgers.
- The activation strings contain the scratch paths, because the logFile value is part of the contract string.

## Env gate

`DSH_TEST_SCRATCH` must be set, and unset means `SKIPPED (no scratch home)` with exit 0, identical to the `.mjs` suite that this folder was split from.

The folder is never forced green in `Maintain/Run-Smokes.mjs`, and it runs under `Maintain/Run-Wiring.mjs`, which always sets the gate.

## Expected count

33 PASS.

Note (recorded 2026-10-20, the lane's fresh baseline): with the CURRENT built targets the stream lines of the five post-dash flavors do not appear (the boot log shows `command "normalize-overpass" is already registered`, and the later flavors fail to finish mounting), so the folder currently prints `28 PASS - ...` with the five stream-count checks failing.

The expected count above is the count of the healthy battery, and the failures are pre-existing live state rather than a property of this folder.

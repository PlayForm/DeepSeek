# Direct-Govern

What this test verifies.

## Intent

The direct-govern path (the raw-write tool's per-call `govern` route through
`Furnace.Govern` to the registered steps) and the fold semantics: the cargo
step alone (the guarded write at the fresh-stat CURRENT version, the resolved
form, the `governed <path> → <version>` line byte-identical, the Stash
seeded then advanced by the write, NO update stage); the selection semantics
(unknown step names run nothing; `true` runs BOTH registered steps in the
sequential fold order - the cargo chain pass's `governed` line precedes the
update step's dispatch, and the fold leaves the chain pin canonical); the
two-chain-writer fold (the live failure mode: the pre-fix fold handed every
step the OBSERVED version so later chain-writing steps failed
FS_STALE_VERSION and silently aborted - with the fresh-stat write basis both
the cargo step and the appended sim step land, in registered order); and the
update step alone through the Dispatch envelope (`update stage dispatched for
<dir> (cargo via cargo, built-in default policy)` byte-identical, the policy
diagnostics, no chain write, the Stash advanced by the U2 refresh). The
assertions are moved verbatim from `Classic/smokes/cargo-smoke.mjs` section
12 (the direct-govern block).

## Scenario

- Group: the direct cargo step + the `true` sequential fold.
    - Sub: "direct-govern: cargo — Stash seed + Continue, guarded write,
      ledger byte-identical, no update stage"
    - Sub: "direct-govern: cargo sequential fold — `true` runs the cargo step
      then the update step, in order (deterministic)"
- Group: the two-chain-writer fold (the live failure mode).
    - Sub: "direct-govern: two-chain-writer fold (cargo + sim) — both writes
      land at the fresh-stat version, final state converged"
- Group: the update step alone.
    - Sub: "direct-govern: update — the update stage alone through the
      Dispatch envelope, gates and ledger byte-identical"

## Fixtures

Per-scenario harness worlds with the `subprocess` SeamStub; `registry.json`
written on disk; a sim second chain-writing step registered through
`Furnace.RegisterGovern` that appends a `# fold-sim` marker line through the
same `Furnace.Continue` chain (and is dropped again after the scenario). The
update-alone scenario fires the `update` step name directly.

## Expected ledger strings (byte-identical)

- `governed <path> → fresh-v2` (U+2192)
- `update stage dispatched for <dir> (cargo via cargo, built-in default
  policy)`
- `update: using built-in default policy`
- `update: DONE — pins bumped per policy` (U+2014)
- `fold-sim appended in <path>` (the sim step's message, in the sim block's
  ledger)

## Edge cases

- The `["bogus"]` selection must not move the ledger by a single line.
- The fold's second write must guard the fresh-stat version, NOT the stale
  observed `v-fold-cargo` (the assert.notEqual is the regression's teeth).
- The update step must chain-write nothing (`writes.filter(...).length === 0`)
  while the Stash still ends at `stat-v9`.

## Expected count

4 PASS.

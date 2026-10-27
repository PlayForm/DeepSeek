# Direct-Govern

This file states what the test verifies.

## Intent

The suite covers the direct-govern path, which is the per-call `govern` route of the raw-write tool
through `Furnace.Govern` to the registered steps, and it covers the fold semantics.

The cargo step alone covers the guarded write at the fresh-stat CURRENT version, the resolved form,
the byte-identical `governed <path> → <version>` line, and the Stash seeded and then advanced by the
write, with NO update stage.

The selection semantics run nothing for unknown step names, and `true` runs BOTH registered steps in
the sequential fold order, where the `governed` line of the cargo chain pass precedes the dispatch of
the update step and the fold leaves the chain pin canonical.

The two-chain-writer fold covers the live failure mode, because the pre-fix fold handed every step
the OBSERVED version, so later chain-writing steps failed with FS_STALE_VERSION and aborted silently,
while the fresh-stat write basis lets both the cargo step and the appended sim step land in
registered order.

The update step alone runs through the Dispatch envelope, with the byte-identical
`update stage dispatched for <dir> (cargo via cargo, built-in default policy)` line, the policy
diagnostics, no chain write, and the Stash advanced by the U2 refresh.

The assertions are moved verbatim from `Classic/smokes/cargo-smoke.mjs` section 12, the direct-govern
block.

## Scenario

- Group: the direct cargo step + the `true` sequential fold.
    - Sub: "direct-govern: cargo - Stash seed + Continue, guarded write,
      ledger byte-identical, no update stage"
    - Sub: "direct-govern: cargo sequential fold - `true` runs the cargo step
      then the update step, in order (deterministic)"
- Group: the two-chain-writer fold (the live failure mode).
    - Sub: "direct-govern: two-chain-writer fold (cargo + sim) - both writes
      land at the fresh-stat version, final state converged"
- Group: the update step alone.
    - Sub: "direct-govern: update - the update stage alone through the
      Dispatch envelope, gates and ledger byte-identical"

## Fixtures

The harness builds per-scenario worlds with the `subprocess` SeamStub and `registry.json` written on
disk.

A sim second chain-writing step registers through `Furnace.RegisterGovern` and appends a `# fold-sim`
marker line through the same `Furnace.Continue` chain, and it is dropped again after the scenario.

The update-alone scenario fires the `update` step name directly.

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
- The second write of the fold must guard the fresh-stat version and NOT the stale observed
  `v-fold-cargo`, which is the teeth of the regression.
- The update step must chain-write nothing (`writes.filter(...).length === 0`) while the Stash still
  ends at `stat-v9`.

## Expected count

4 PASS.

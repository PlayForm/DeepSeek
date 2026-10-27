# Recompute

What this test verifies.

## Intent

`Recompute` - the drop-and-rebuild (Documentation/Plans/COST-TRACK-PLUGIN.md section 2.4): every
number a formula consumes is stored - Call holds the usage and the priced cost columns and the
surface tokens, Touch holds the byte deltas, ContextMass holds the per-file mass - so dropping
Allocation and Rollup and rebuilding them from those tables alone lands byte-identical totals. No
session log is read.

## Scenario

- Check: "T4: the drop-and-rebuild lands byte-identical allocation and rollup totals" - the drain
  folded a synthetic two-call session, the rollup ran, the rebuild reports the same row counts and
  the snapshots compare deep-equal.

## Fixtures

- A fresh OS tmpdir ledger opened through `Open`, a fake harness ctx whose token meter prices every
  message at ten, and one synthetic session replayed through `Drain` (one priced call with a write
  touch, one later call touching nothing).

## Expected count

1 PASS.

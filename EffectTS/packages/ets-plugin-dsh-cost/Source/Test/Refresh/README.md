# Refresh

What this test verifies.

## Intent

`Rollup` on the live path (Documentation/Plans/COST-TRACK-PLUGIN.md section 17.5): a flush refreshes
exactly the UTC days its own events landed in, so a range report or a forecast reads a current
aggregate instead of waiting for a full rebuild. The refresh takes the batch's timestamps rather than
the wall clock, because a backfilled session must land on the day it happened.

## Scenario

- Check: "T5: the flush writes no aggregate before the refresh runs" - the drain alone leaves the
  Rollup empty, which is why the refresh has to exist.
- Check: "T5: the refresh covers the batch's own UTC day" - the batch's five timestamps all fall on
  2026-10-27, the refresh writes rows, exactly that one day is covered, and the aggregate carries the
  priced money.
- Check: "T5: a day with no calls writes nothing" - a 2020 timestamp returns zero rows and invents no
  aggregate.

## Fixtures

- A fresh OS tmpdir ledger opened through `Open`, the fake harness ctx, and one synthetic session
  replayed through `Drain` (one priced call with a write touch) whose five events share one UTC day.

## Expected count

4 PASS.

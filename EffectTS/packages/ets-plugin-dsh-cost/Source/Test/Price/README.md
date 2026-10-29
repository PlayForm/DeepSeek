# Price

What this test verifies.

## Intent

`Price` - the price resolution and the cost arithmetic (Documentation/Plans/COST-TRACK-PLUGIN.md
section 2, the design's verification case 2): an effective-dated price table prices a call at the
row in force at the call's own time - never the newest row - and the arithmetic converts the
provider's own token buckets at the resolved rates, per million tokens.

## Scenario

- Check: "P2: a call inside the first window prices at the first row".
- Check: "P2: a call after the second row's date prices at the second row, not the newest".
- Check: "P2: the boundary instant itself is in force for the new row".
- Check: "P2: the cost arithmetic uses the resolved rates per million tokens" - input 1, output 1,
  cache read 0.2, the total 2.2 in the row's currency.

## Fixtures

- A fresh OS tmpdir ledger opened through `Open`, seeded with two effective-dated rows for one
  provider/model (input 1/output 2 from 2026-01-01, input 3/output 4 from 2026-06-01).

## Expected count

4 PASS.

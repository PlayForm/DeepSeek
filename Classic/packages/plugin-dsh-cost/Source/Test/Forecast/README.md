# Forecast

What this test verifies.

## Intent

`Forecast` - the projection that stays a query, not a stored guess
(Documentation/Plans/COST-TRACK-PLUGIN.md section 17.5): over the Rollup's daily rate per
(Scope, Key) across the last window of days, the mean, the median and the mean of the last seven
days, the projection to a thirty-day period as the mean times thirty, and the confidence band from
the daily minimum and maximum times thirty - with a history of fewer than two days projecting with
no spread.

## Scenario

- Check: "E5: a flat three-day history projects the mean times thirty" - mean 10, median 10, last
  seven 10, projected 300, band 300 to 300.
- Check: "E5: the median differs from the mean when one day is an outlier" - costs 10, 10, 40:
  mean 20 against median 10, projected 600, band 300 to 1200.
- Check: "E5: a single-day history projects without a spread" - cost 12: projected 360 and the
  band collapsed onto it.

## Fixtures

- One in-memory SQLite ledger per check carrying only the Rollup table (the DDL's own shape),
  seeded with hand-built project rows; the day window is anchored at each key's own latest day, so
  the fixed fixture dates never drift.

## Expected count

3 PASS.

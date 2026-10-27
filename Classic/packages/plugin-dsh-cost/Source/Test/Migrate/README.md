# Migrate

What this test verifies.

## Intent

`Open` - the migration ladder (Documentation/Plans/COST-TRACK-PLUGIN.md section 14): opening a
v1-shaped ledger runs the v2 migration inside one transaction - the additive columns appear, the
Alias and Verdict tables and the FileLifetime view exist, the version stamp moves to 2, the fresh
DDL never re-runs, and the v1 data survives.

## Scenario

- Check: "A3: the migration stamps the ledger version 2".
- Check: "A1: the additive columns exist on Price, Call and Touch" - `Price.Window`,
  `Call.CacheSaving`, `Touch.Stage`, `Touch.Branch`, `Touch.ReadBeforeEdit`.
- Check: "A1: the Alias and Verdict tables and the FileLifetime view exist".
- Check: "A3: the fresh DDL never re-runs and the v1 data survives" - the seeded session row is
  still there and no fresh-only table was created.

## Fixtures

- A fresh OS tmpdir ledger seeded by hand with the six v1 tables the migration statements touch
  (Session, File, Price, Call, Allocation, Touch) at `PRAGMA user_version = 1`, plus one session
  row and one file row.

## Expected count

4 PASS.

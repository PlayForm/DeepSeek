# Migrate

What this test verifies.

## Intent

`Open` - the migration ladder (Documentation/Plans/COST-TRACK-PLUGIN.md sections 14 and 17.6):
opening a v1-shaped ledger runs the v2 rung and then the v3 rung inside one transaction each - the
additive columns appear, the Alias and Verdict tables and the FileLifetime view exist, the version
stamp moves to 3, the fresh DDL never re-runs, and the v1 data survives. Opening a v2-shaped ledger
runs only the v3 rung: the factor layer's columns and its three tables (Modifier, Factor,
CallFactor) appear, and the v2 data survives with the new defaults filled.

## Scenario

- Check: "A3: the ladder stamps a v1 ledger version 3".
- Check: "A1: the additive columns exist on Price, Call and Touch through both rungs" - `Price.Window`
  and `Price.TierFrom`, `Call.CacheSaving`, `Call.Mode`, `Call.Tier`, `Touch.Stage`, `Touch.Branch`,
  `Touch.ReadBeforeEdit`.
- Check: "A1: the Alias and Verdict tables and the FileLifetime view exist".
- Check: "A3: the fresh DDL never re-runs and the v1 data survives" - the seeded session row is
  still there and no fresh-only table was created.
- Check: "A3: the v3 rung alone stamps a v2 ledger version 3".
- Check: "A1: the factor columns exist on Price and Call" - `Price.TierFrom`, `Price.TierTo`,
  `Price.Mode`, `Price.Region`, `Call.Mode`, `Call.Region`, `Call.Tier`.
- Check: "A1: the Modifier, Factor and CallFactor tables exist".
- Check: "A3: the v2 data survives with the new defaults filled" - the seeded price and call rows
  remain, tier floors at zero, modes at standard, regions and tiers NULL.

## Fixtures

- A fresh OS tmpdir holding two hand-seeded ledgers: one with the six v1 tables the v2 statements
  touch at `PRAGMA user_version = 1`, one with the same tables carrying the v2 columns, tables and
  view at `PRAGMA user_version = 2`; the v2 ledger carries one session, one file, one price row and
  one call row.

## Expected count

8 PASS.

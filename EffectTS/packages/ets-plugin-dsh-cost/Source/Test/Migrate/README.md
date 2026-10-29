# Migrate

What this test verifies.

## Intent

`Open` - the migration ladder (Documentation/Plans/COST-TRACK-PLUGIN.md sections 14, 17.6, 17.3
and 17.4): opening a v1-shaped ledger runs the v2, v3 and v4 rungs inside one transaction each -
the additive columns appear, the Alias and Verdict tables and the FileLifetime view exist, the
version stamp moves to 4, the fresh DDL never re-runs, and the v1 data survives. Opening a
v2-shaped ledger runs the v3 and v4 rungs: the factor layer's columns and its three tables
(Modifier, Factor, CallFactor) appear, and the v2 data survives with the new defaults filled.
Opening a v3-shaped ledger runs only the v4 rung: the Edit table and the telemetry columns appear,
and the v3 data survives.

## Scenario

- Check: "A3: the ladder stamps a v1 ledger version 4".
- Check: "A1: the additive columns exist on Price, Call and Touch through every rung" -
  `Price.Window` and `Price.TierFrom`, `Call.CacheSaving`, `Call.Mode`, `Call.Tier`,
  `Call.LatencyMs`, `Call.Attempts`, `Call.Utilization`, `Touch.Stage`, `Touch.Branch`,
  `Touch.ReadBeforeEdit`, `Touch.DurationMs`, `Touch.ResultBytes`, and `Edit.Ordinal`.
- Check: "A1: the Alias and Verdict tables and the FileLifetime view exist".
- Check: "A3: the fresh DDL never re-runs and the v1 data survives" - the seeded session row is
  still there and no fresh-only table was created.
- Check: "A3: the v3 and v4 rungs stamp a v2 ledger version 4".
- Check: "A1: the factor columns exist on Price and Call" - `Price.TierFrom`, `Price.TierTo`,
  `Price.Mode`, `Price.Region`, `Call.Mode`, `Call.Region`, `Call.Tier`.
- Check: "A1: the Modifier, Factor and CallFactor tables exist".
- Check: "A3: the v2 data survives with the new defaults filled" - the seeded price and call rows
  remain, tier floors at zero, modes at standard, regions and tiers NULL, attempts at one.
- Check: "A3: the v4 rung alone stamps a v3 ledger version 4".
- Check: "A1: the telemetry columns and the Edit table exist" - `Call.LatencyMs`,
  `Call.FirstTokenMs`, `Call.TokensPerSecond`, `Call.Attempts`, `Call.ErrorCode`,
  `Call.ContextWindow`, `Call.Utilization`, `Touch.DurationMs`, `Touch.ResultBytes`, and the
  `Edit` table's own columns.
- Check: "A3: the v3 data survives, the attempts default to one and Edit starts empty" - the
  seeded call row remains, attempts at one, the context window NULL, and the migrated Edit table
  empty.

## Fixtures

- A fresh OS tmpdir holding three hand-seeded ledgers: one with the six v1 tables the v2 statements
  touch at `PRAGMA user_version = 1`, one with the same tables carrying the v2 columns, tables and
  view at `PRAGMA user_version = 2`, and one with the v2 shape plus the factor layer's columns,
  tables and the call's own mode, region and tier at `PRAGMA user_version = 3`; the v2 and v3
  ledgers carry one session, one file and one call row (the v2 ledger also one price row).

## Expected count

11 PASS.

# Overhead

What this test verifies.

## Intent

`Analysis.Overhead` - the exploration share (Documentation/Plans/COST-TRACK-PLUGIN.md section 12):
the money whose allocation names no file (`FileId IS NULL` - retries, compaction, the shared
context that belongs to no file) over the total allocated cost, read with a CASE expression so the
query stays portable across SQLite builds.

## Scenario

- Check: "T4: the ratio is 1 when nothing is attributed" - session 1 is one call with no tool
  touches, so its whole price sits in the unattributed bucket and the ratio is 1.
- Check: "T4: the ratio is 0 when everything is attributed" - session 2's read and write both
  attribute their full price to a.ts (the input tokens are zero, so no context mass goes unpaid),
  so the ratio is 0.

## Fixtures

- A temporary ledger under the OS tmpdir (removed afterwards), built by importing the sibling
  ledger package's `Open` and `Drain` from its Target: one client, one price row (input 1, output 2
  per million), two sessions - one touchless call, one read-then-write of a.ts with zero input
  tokens.
- The analysis plugin's own `Open` and `Analysis` over that ledger, read-only, through the shared
  harness counter.

## Expected count

2 PASS.

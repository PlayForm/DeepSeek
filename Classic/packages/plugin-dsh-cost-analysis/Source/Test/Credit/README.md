# Credit

What this test verifies.

## Intent

`Analysis.Credit` - the read credit of Ring C (Documentation/Plans/COST-TRACK-PLUGIN.md section
11): reading a file warms the prompt cache, so every later call whose surface carries it pays the
cache-read rate instead of the full input rate; the drain stores that saving on `Call.CacheSaving`
and the analysis credits it to the file in proportion to the share of each call's surface the file
occupied, alongside the credit over the file's total allocated cost.

## Scenario

- Check: "T1: the credit is positive for the file the surface carried" - a.ts is read by call 1 and
  carried by call 2's surface (its tool result), so its credit is positive with the USD unit.
- Check: "T1: the credit is zero for a file never in a surface" - c.ts is written by call 2 and so
  keeps an allocation row, but its content never entered a surface before the fold, so its context
  share is zero and its credit with it.
- Check: "T1: the ratio rides along and the readings rank by credit" - a.ts carries the credit
  ratio with the ratio unit, and the readings rank by the headline credit descending.

## Fixtures

- A temporary ledger under the OS tmpdir (removed afterwards), built by importing the sibling
  ledger package's `Open`, `Drain` and `Rollup` from its Target: one client, one price row (input
  1, output 2, cache read 0.1 per million), one session whose two calls read a.ts and then carry
  a.ts in a cached surface while writing c.ts.
- The analysis plugin's own `Open` and `Analysis` over that ledger, read-only, through the shared
  harness counter.

## Expected count

3 PASS.

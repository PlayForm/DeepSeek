# Lines

What this test verifies.

## Intent

`Analysis.Lines` - the churn (Documentation/Plans/COST-TRACK-PLUGIN.md sections 16.2 and 17.3):
every edit tool call produces hunks and the ledger stores each one in the `Edit` table, so the
analysis sums the lines a file's hunks added and removed, counts the hunks, and divides the file's
allocated cost (`DirectCost + AmortizedCost`) by its added lines - a 40-line refactor becomes
visible next to a one-line fix.

## Scenario

- Check: "T3: the lines added and removed are the hunks' sums" - a write of three lines plus an
  edit of two added against one removed land as 5 added and 1 removed, both in lines.
- Check: "T3: the hunks are counted per file" - the write's hunk and the edit's hunk are two Edit
  rows, so the hunk count is 2, in hunks.
- Check: "T3: the cost per added line is the allocated cost over the added lines" - the metric
  equals the file's allocated cost (read straight from the ledger before it closes) over 5, in
  USD/line.

## Fixtures

- A temporary ledger under the OS tmpdir (removed afterwards), built by importing the sibling
  ledger package's `Open` and `Drain` from its Target: one client, one price row (input 1, output 2
  per million), one session whose two calls write a.ts with three lines and then edit a.ts with a
  two-line hunk.
- The analysis plugin's own `Open` and `Analysis` over that ledger, read-only, through the shared
  harness counter.

## Expected count

3 PASS.

# Effectiveness

What this test verifies.

## Intent

`Analysis.Effectiveness` - the cost per surviving line (Documentation/Plans/COST-TRACK-PLUGIN.md
section 16.4, with the verdict of section 14): over the files whose `Verdict.State` is `changed`
in the window, the allocated cost (`DirectCost + AmortizedCost`) divided by the lines the file's
edit hunks added (`Edit.LinesAdded` joined through `Touch` to `File`); a file whose verdict is only
`read` yields no row, however much money its reads were allocated.

## Scenario

- Check: "T2: the changed file's cost per line is its cost over its lines" - c.ts ends `changed`
  in session 2 with one edit hunk of two lines, so its cost per line equals its cost over 2, with
  the three metrics carrying the USD/line, lines and USD units.
- Check: "T2: a read-only file yields no row" - a.ts and b.ts were only read in session 1, so both
  end `read` and neither yields a row, even though both keep allocation rows from the shared read
  step.

## Fixtures

- A temporary ledger under the OS tmpdir (removed afterwards), built by importing the sibling
  ledger package's `Open` and `Drain` from its Target: one client, one price row (input 1, output 2
  per million), two sessions - one that only reads a.ts and b.ts, one that edits c.ts with a
  two-line hunk - each closed with a `turn/end` so the verdicts land.
- The analysis plugin's own `Open` and `Analysis` over that ledger, read-only, through the shared
  harness counter.

## Expected count

2 PASS.

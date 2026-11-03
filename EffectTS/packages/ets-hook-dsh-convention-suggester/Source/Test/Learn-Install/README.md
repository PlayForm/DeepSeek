# Learn-Install

The RETIRED learner: the install phase of the D4 bootstrap no longer runs.

The literal pack learner is not called any more (the history-driven proposal is the next step), so
this suite keeps only the Apply-level consequence of a judged call in a packless workspace with
`learning: true`.

## Scenarios

- I1: the call returns the downstream decision UNCHANGED with no note, and no
  proposal, no live user-layer pack and no repo pack file is written.
- I2: the ledger carries `abstained no-history  0.00` in both forms, with no
  `learned proposal` line and no `suggest` line.

## Fixtures

The shared Harness (fake ctx, the real factory, the real built Target), a `node:fs` temporary repo
with the doc index, the site and the package layout, and a temporary `HOME` (`process.env.HOME`) so
that the real `~/.dsh` is never read or written.

No sleeps, because the whole sequence is synchronous state.

## Expected ledger strings (byte-exact, `convention-suggester: ` prefix)

`abstained no-history  0.00`.

## Expected count

2 PASS.

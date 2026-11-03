# Learn-Note

The RETIRED learning note: the D4 bootstrap no longer notes anything.

The literal learner is not called any more (the history-driven proposal is the next step), so this
suite keeps only the Apply-level consequence in a packless workspace with `learning: true`.

## Scenarios

- N1: a non-judged call (`bash`) neither writes nor notes - only the activation
  line is in the ledger and no proposal file appears.
- N2: the first judged call (`write`) abstains `abstained no-history  0.00`
  (both forms), returns the decision unchanged, and writes no proposal file.

## Fixtures

The shared Harness (fake ctx, the real factory, the real built Target) plus a `node:fs` temporary
repo and a temporary `HOME` (`process.env.HOME`).

The repo is a packless tree with `Documentation/INDEX.md`, the package layout and its prose.

## Expected ledger strings (byte-exact, `convention-suggester: ` prefix)

`abstained no-history  0.00`.

## Expected count

2 PASS.

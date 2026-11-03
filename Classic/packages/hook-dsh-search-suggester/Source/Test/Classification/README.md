# Classification

The plan's suite 1 covers the rule table of an EXPLICIT pack: one case per family, the priority tie-break, the evidence total beating the priority, the History family's precedence over the pack, and the two silences.

The verdict of the classifier is read from the ledger line (the note or the low-confidence abstention names the winning family), so the suite asserts the RULES, not the delivery.

## Scenarios

- C1-C3: one case per family of the temporary pack (`Version`, `Doc`, `Usage`), each a grep whose literal is that family's own signal, and the ledger names that family. Detect matches the call PATH as well as its text, so the `Usage` case anchors on `Source/Library.ts` instead of a `README` path (which would hand the Doc family a rule).
- C4: equal evidence (a `README` + `hook-dsh-` grep) is broken by the priority of the pack, so `Doc` (8) wins over `Usage` (9).
- C5: the higher evidence total beats the priority, so a grep that matches all three Doc rules classifies as `Doc 1.00` and emits.
- C6: the same call on two fresh agents classifies identically.
- C7: a call the pack does not match (again on the non-`README` anchor) abstains `no-signal`.
- C8: a workspace with no pack and no history abstains `no-history`.
- C9: the synthetic `History` family is prepended and wins the tie against the pack (priority 0), so the note is `History 0.87`.

## The built-in pack

The built-in pack is retired: every rule asserted here belongs to the temporary `.dsh/pack.yml`, never to a literal built-in family.

The suite runs the classifier cases under a raised config floor (0.9), so the winning family is readable from the ledger line, and the History case under the default floor (its own gate is 0.75).

## Fixtures

The shared Harness, the real built Target, two temp workspaces (one packed, one bare), and a distinct agent per case (no loop credit, no cooldown interference).

## Expected ledger strings (byte-exact, `hook-dsh-search-suggester: ` prefix)

`abstained low-confidence Version 0.87`, `abstained low-confidence Doc 0.80`, `abstained low-confidence Usage 0.80`, `suggest Doc 1.00 1 candidates`, `abstained no-signal  0.00`, `abstained no-history  0.00`, `suggest History 0.87 2 candidates`.

## Expected count

9 PASS.

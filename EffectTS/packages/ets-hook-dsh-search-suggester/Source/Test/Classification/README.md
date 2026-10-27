# Classification

The plan's suite 1 covers the rule table: one case per intent kind, the priority tie-break, the evidence total beating the priority, and determinism.

The verdict of the classifier is read from the ledger line (the note or the low-confidence abstention names the winning intent), so the suite asserts the RULES, not the delivery.

## Scenarios

- C1-C10: one case per intent (`Version`, `Path`, `Ledger`, `Config`, `Dependency`, `Test`, `Symbol`, `Doc`, `Usage`, `Owner`), each a grep whose literal is the own signal of the intent, and the ledger names that intent.
- C11: equal evidence (a `README` + `hook-dsh-` grep) is broken by the priority of the pack, so `Doc` (8) wins over `Usage` (9).
- C12: the higher evidence total beats the priority, so a semver + version word + README grep classifies as `Version 0.80`, not `Doc`.
- C13: the same call on two fresh agents classifies identically.

## Known gap (the plan's scope override)

The section 3.4 scope override of the plan ("a lockfile grep is Dependency, not Version") is NOT implemented in this package, because the signals carry no scope weight, so a semver literal still wins.

The suite does not assert it; it is recorded as a residual of the wave.

## Fixtures

The shared Harness, the real built Target, one run, and a distinct agent per case (no loop credit, no cooldown interference).

## Expected ledger strings (byte-exact, `hook-dsh-search-suggester: ` prefix)

`abstained low-confidence <Intent> 0.66` (the ten cases, with `Version 0.84` and `Ledger` as `abstained no-companions Ledger 0.66`), `abstained low-confidence Doc 0.66`, `abstained low-confidence Version 0.80`.

## Expected count

13 PASS.

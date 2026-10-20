# The Additive Coverage Rule (Suites Grow, Never Shrink)

> Source: SKILL.md, section "The assertion contract", rule 3. Mandate:
> the canonical skill-structure conversion of 2026-10-20.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

New features GROW the suites - every new behavior gets NEW additive
checks. The existing assertions never weaken: they are not rewritten,
loosened, merged, or dropped. The assertion counts are recorded per
suite after each run (the handoff's baseline), so growth is visible
and shrinkage is an immediate alarm.

## Why: The Full Philosophy

1. **A test suite is a ratchet.** Each assertion is a guarantee the
   family has decided to keep forever. Refactors must satisfy every
   prior guarantee; new features must add guarantees. The ratchet only
   turns one way - that is what makes the arbiter's green verdict
   cumulative evidence rather than a snapshot of the latest author's
   opinion.
2. **Why counts are recorded.** A weakened suite rarely announces
   itself; assertions disappear one at a time, each with a plausible
   reason ("redundant", "flaky", "out of scope"). The per-suite count,
   written into the handoff baseline, turns quiet erosion into a
   number anyone can compare. Count down without cause = finding.
   Count unchanged while a feature landed = coverage gap (the feature
   shipped without checks).
3. **The counts connect suites to the family's governance.** The
   handoff baseline is the shared record across sessions and agents;
   it is how the next session verifies that this session's changes
   grew - or at least preserved - the family's guarantees.
4. **"Never weaken" has no size threshold.** Removing one redundant
   assertion is still weakening: the redundancy was intentional
   defense against two different failure shapes (see the swapped-/
   reversed-assert trap, ./references/swapped-reversed-asserts.md).

## Examples

### Good

- A new parallel marker lands; its bundle's suite gains checks for it
  (and the parity sibling gains the same additive checks), and the
  recorded count increases by the number added.
- A refactor leaves every existing assertion untouched and passes
  byte-identical - the pure-ratchet case.

### Bad

- Deleting an assertion because the code path "can't fail anymore" -
  the suite was the reason it couldn't.
- Combining three assertions into one to "clean up" - the combined
  check reports one failure shape where three used to be
  distinguished.
- Landing a feature with the counts unchanged and no explanation in
  the handoff.

## Exceptions

- The identity-driven strings (see
  ./references/byte-identical-ledger-assertions.md) may change WITH
  the module's identity. That is a replacement, not a weakening: the
  contract moves, its strictness does not, and the move is recorded
  (the mdash -> normalize-dash precedent).
- Additive coverage in the EffectTS suites (Stream pipeline, typed
  envelope, parallel marker) is the standing example of the rule in
  action - see ./references/parity-three-implementations.md.

## Failure Modes

- Feature-without-checks: the code lands, suites stay green because
  nothing new was asserted. The count that failed to grow is the only
  signal - which is why the counts are recorded at all.
- The slow leak: assertions retired one per refactor under the word
  "cleanup"; a year later the suite checks half of what it did.
- Baseline drift: someone records a count but no longer compares it
  to the previous baseline - a ritual without the audit.

## Arbiters

- The handoff baseline: per-suite counts recorded after every run;
  comparisons against the previous baseline are part of the
  post-change review.
- The suites themselves: any diff that reduces assertions or loosens
  a matcher is rejected unless it is a documented identity change.

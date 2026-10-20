# The Vacuously-Green Trap

> Source: SKILL.md, section "The traps", rule 1. Mandate: the
> canonical skill-structure conversion of 2026-10-20.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

A smoke whose fixture wiring is wrong can pass its checks without ever
exercising the code under test. THE VACUOUSLY-GREEN TRAP. The governing
procedure: when a smoke "passes but the world is weird" - results that
do not match what the change should have produced, a suite green under
conditions that should make it red, output that seems to come from
nowhere - VERIFY THE HARNESS WIRING FIRST, before trusting the pass or
touching the code.

The family's recorded case: the cargo's `boot()` was (in an earlier
era) never actually assigned the listener - and checks 1 through 12
passed anyway, vacuously. The suite was green; the behavior did not
exist.

## Why: The Full Philosophy

1. **Green is only evidence if the test could have been red.** A
   suite that never reaches the code path (wrong fixture, unassigned
   listener, seam that swallows calls) trivially satisfies every
   assertion that happens to hold on the empty record. The formal
   failure: a test that cannot fail is not a test; its pass carries
   zero information.
2. **Vacuous green is worse than red.** A red suite stops the change
   and demands investigation. A vacuously green one endorses the
   change, records a count in the baseline, and moves the hole
   downstream to LIVE - where the same failure costs a live debugging
   session instead of a suite run.
3. **Why wiring is the first suspect.** The harness pattern (real
   library, fake ctx, capture seams, root seam, probes - see
   ./references/harness-pattern-fake-ctx-real-factory.md) has many
   joints, and each joint is a chance to connect the wrong wire. When
   results are weird, the cheapest hypothesis that explains BOTH "the
   suite passes" AND "the world is weird" is: the suite is wired to
   nothing. A code bug usually explains weird output; only a wiring
   bug explains confident green alongside weirdness.
4. **The cargo case is the mnemonic.** Twelve passing checks against a
   listener that was never assigned means twelve checks were reading
   an empty record and finding it empty in ways they considered
   acceptable. The lesson is structural: no check in that set could
   fail. Audit for that property, not just for the specific bug.

## Examples

### Good

- A smoke passes; the recorded `writes` array is empty where a write
  was expected; the author stops and rewires the fs seam - then the
  suite actually fails on the real bug and gets fixed.
- A new suite's first run is made red ON PURPOSE (assert a wrong
  value once) to prove the harness is live before trusting its green.

### Bad

- "It passed, ship it" while the pass contradicts a known behavior
  change - the world being weird IS the finding.
- Adding more checks to a mis-wired harness to "increase confidence" -
  more vacuous green is still vacuous.
- Debugging the production code for an hour before ever opening the
  fixture setup.

## Exceptions

- None. Weirdness plus green is always an audit trigger. The only
  judgment call is ordering: wiring first, code second - not because
  the code is never wrong, but because the wiring check is cheap and
  the vacuous case otherwise poisons every conclusion downstream.

## Failure Modes

- The empty-record pass: assertions over arrays/probes that are
  trivially true when nothing was recorded (empty array, undefined
  state, zero counts).
- The never-assigned listener: the seam object exists, the code
  "calls" into it, but no assignment connected the handler - calls go
  nowhere and no assertion notices.
- Confidence inversion: a long green history makes a suite feel
  trustworthy, so its first real red is blamed on flakiness instead of
  audited - the trap's longest-lived form.

## Arbiters

- The liveness check: every suite must demonstrate it can fail
  (deliberate wrong value during development, or a mutation of the
  fixture) - a suite that has never been seen red is unproven.
- The wiring review: new/changed fixtures are reviewed against the
  seam contract before their first green is trusted.
- Cross-checks: a suite's counts and records are compared against
  what the change should produce; mismatch triggers the wiring audit.

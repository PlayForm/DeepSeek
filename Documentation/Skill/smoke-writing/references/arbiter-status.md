# The Arbiter Status (The Smokes Are the Arbiter)

> Source: SKILL.md, the section-1 intro paragraph ("The smokes are the
> arbiter: after every change, the suites must pass. This manual states
> the conventions directly."). Mandate: the canonical skill-structure
> conversion of 2026-10-20.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

The smoke suites of the DeepSeek Harness Plugin Family are THE ARBITER
of correctness. After every change to any family package - a plugin, a
bundle, a shared module, a build step - the rule is unconditional:

- every suite must pass;
- no change is considered landed until the suites are green;
- the suites judge the change, never the other way around.

"This manual states the conventions directly" means: the smoke-writing
conventions are stated as rules in this skill, not as folklore in chat
history or tribal memory. If a convention is not written here, it is
not yet a convention; if it is written here, it binds.

## Why: The Full Philosophy

1. **An arbiter must be independent of the change.** The person or
   agent making a change is the party with the least incentive to
   doubt it. The suites exist precisely so the verdict does not come
   from the author's confidence. When the suites say red, the change
   is wrong; when they say green, the change may proceed.
2. **"After every change" is deliberately absolute.** There is no
   tier of change small enough to skip the arbiter: a one-line edit, a
   rename, a formatting pass - all can shift a ledger byte or a count.
   The cost of running the suites is trivial next to the cost of a
   silent regression landing in the LIVE harness.
3. **The arbiter's authority depends on its own integrity.** A smoke
   suite that is weakened, mis-wired, or vacuously green is a corrupt
   judge. That is why the rest of this skill exists: the harness
   pattern (the suite must actually exercise the code), the assertion
   contract (byte-identical, additive), and the traps (the ways a
   suite lies to you) are all guardians of the arbiter's authority.
4. **Family context.** The twelve packages under Boilerplate/, Classic/,
   and EffectTS/ each carry smokes dirs; the smoke manual applies to
   every one of them. The smokes are part of the deterministic build
   and the direct-govern loop of the family - they are not optional
   tests, they are the gate.

## Examples

### Good

- You refactor a module leaf. Before declaring done, you run the
  bundle's suites; all pass byte-identical; the change lands.
- You add a feature; the suites pass PLUS the counts grew (see
  ./references/additive-coverage-rule.md).
- A suite fails. You read the failing assertion's intent, conclude the
  change is wrong, and fix the change - not the assertion.

### Bad

- "It's just a comment change, I didn't run the smokes." The comment
  turn's rewrite may have touched a byte; run the arbiter.
- The suite fails; you adjust the expected string to match the new
  output and declare green. That is the judge being suborned.
- You skip a suite because it is "slow today" and trust a code read.
  Only the arbiter issues the verdict.

## Exceptions

None. There is no documented case where a change is exempt from the
smoke gate. If a change genuinely cannot be exercised by the suites
(e.g., an environment-only wiring fact), that is the smoke/live
fidelity gap (see ./references/smoke-live-fidelity-gap.md), and
the duty there is to convert the finding into a smoke where the harness
can represent it - not to waive the gate.

## Failure Modes

- Green-by-default thinking: assuming the suites pass because the
  change "obviously" could not affect them. The arbiter must actually
  be run and observed.
- Judge-shopping: running only the suite you expect to pass, skipping
  the one you suspect will fail.
- Authority erosion: a long stretch of weakened assertions converts
  the arbiter from a judge into a rubber stamp; every weakening is
  permanent damage to the family's safety property.

## Arbiters

- The suites themselves: run the full set for the touched bundle (and
  the parity siblings, see ./references/parity-three-implementations.md)
  after every change.
- The handoff records: suite counts per run (the baseline in
  ./references/additive-coverage-rule.md) - a missing or shrinking
  count without cause is an audit finding.

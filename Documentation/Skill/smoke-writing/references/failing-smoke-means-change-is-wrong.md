# A Failing Smoke Means the Change Is Wrong (Never Weaken)

> Source: SKILL.md, section "The assertion contract", rule 4. Mandate:
> the canonical skill-structure conversion of 2026-10-20.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

When a smoke fails, the default and overwhelming verdict is: THE CHANGE
IS WRONG. Fix the change. Weakening an assertion to make a failing
smoke pass is prohibited - it converts the arbiter's objection into a
signature on the bug.

## Why: The Full Philosophy

1. **The suites are the specification made executable.** The ledger
   strings, the counts, the call sequences - they are what the family
   has agreed the code must do. A failure is the specification telling
   you the code deviates. Editing the expectation to match the code
   inverts the relationship: the code becomes its own specification.
2. **The failure carries information - decode it, don't silence it.**
   Before touching anything, read the assertion's INTENT: what
   property was it guarding? Then classify the failure:
   - the code broke the property -> fix the code (the normal case);
   - the property itself is outdated by an IDENTITY-level decision ->
     update the assertion deliberately, recorded (the mdash
     precedent; see ./references/byte-identical-ledger-assertions.md);
   - the HARNESS is mis-wired and never exercised the code -> fix the
     harness; the pass that follows is then real (see
     ./references/vacuously-green-trap.md);
   - the assertion is swapped/reversed and was never meaningful ->
     fix the assertion to state its intent correctly (see
     ./references/swapped-reversed-asserts.md).
   "Weaken to pass" is the one response that is never on the list.
3. **Asymmetry of cost.** Weakening an assertion costs nothing now and
   an unknown amount later: the bug it was guarding ships, and no
   future run will ever flag it again. Fixing the change costs one
   debugging session. The prohibition is simple actuarial sense.
4. **This rule is the enforcement arm of byte-identity.** Without it,
   the byte-identical contract would erode one convenient "expected
   string update" at a time. Every weakening that ever happened
   started as a red suite somebody wanted green today.

## Examples

### Good

- Suite red on `pinner: pin verified` -> the change altered the emit
  path; the change is fixed; suite green byte-identically.
- Suite red because a `__<name>State` probe reads `undefined` ->
  traced to a mis-wired fake ctx seam; the harness is fixed and the
  suite then exercises the code for real.
- Suite red on an assert whose actual/expected arguments are in the
  wrong order -> the assertion's intent is honored by fixing the
  argument order, not by loosening.

### Bad

- `assert.equal(x, y)` -> `assert.ok(x)` because it passes.
- Deleting the failing check because "that path is covered
  elsewhere" - verify that claim in a reference, never as a deletion
  reason.
- Editing the expected string to today's actual output and moving on
  without naming the identity that changed.

## Exceptions

- The deliberate identity-driven update (above) is the only way an
  existing assertion changes. It must be named, justified, and land
  together with the identity change it belongs to.

## Failure Modes

- Pressure-greening: a deadline (or an impatient loop) turns "suite
  red" into "suite silenced"; the green state is a lie the whole
  family then builds on.
- Fixing the test to match a bug that "looks intentional" - if it is
  intentional, it is an identity-level decision with a recorded
  rationale, not a quiet test edit.
- Debugging the wrong layer: rewriting the harness until the old
  expectations pass, thereby changing what the suite measures while
  leaving the assertion text untouched.

## Arbiters

- Review of every suite diff: any change to an expectation, a matcher,
  or a check's existence must be one of (a) additive, (b) a recorded
  identity change, or (c) a harness-intent fix - and the reviewer asks
  which, with evidence.
- The count baseline (see ./references/additive-coverage-rule.md):
  a weakening shows up as a count decrease or a loosened matcher and
  is called out against the baseline.

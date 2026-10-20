# Swapped/Reversed Asserts and Count Drift

> Source: SKILL.md, section "The traps", rule 2. Mandate: the
> canonical skill-structure conversion of 2026-10-20.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

Two assertion-level failure shapes recur and must be recognized on
sight:

1. **Swapped/reversed asserts**: e.g. `assert.equal(boolean, string)` -
   actual and expected arguments in the wrong order, or a comparison
   between types that can never be meaningfully equal. The assertion
   still "runs"; it just never tests anything real.
2. **Count drifts**: counts (per-suite assertion counts, record-array
   lengths, iteration numbers) that have silently wandered from their
   baseline.

The governing procedure: READ THE ASSERTION'S INTENT before "fixing"
the code. The intent - what property the assertion was guarding - is
the authority; the arguments, the matcher, and the count are its
expression, and the expression is what goes wrong.

## Why: The Full Philosophy

1. **A swapped assert fails in BOTH directions wrongly.** With
   `assert.equal(boolean, string)`, the two arguments are never equal,
   so the check reds even on correct code - which tempts the author
   to "fix" it by weakening, deleting, or reversing it again. And its
   red looks exactly like a code failure, so the debugging effort goes
   to the wrong layer. Recognizing the shape (mismatched types, the
   strict-equality signature with obviously incompatible operands)
   saves the whole detour.
2. **Why intent outranks text.** The assertion text can be wrong while
   the intent is right (`equal(actual, expected)` with the operands
   swapped); the intent can also be obsolete, but only through a
   recorded identity decision. When you know the intent, you know
   which side of the comparison is allowed to move.
3. **Count drift is the slow shape of the same disease.** No single
   count change is loud: a loop runs one fewer time, an array holds
   one fewer record, a baseline count was copied stale. Each is small;
   together they mean the suite is exercising a different amount of
   the system than it did when the baseline was set. Counts are
   assertions too - the additive-coverage baseline
   (./references/additive-coverage-rule.md) makes them comparable
   across runs precisely so drift is detectable.
4. **The family context.** The suites assert heavily on recorded
   arrays and counts (the capture seams' records, the `__<name>State`
   probes). Argument order in `equal(record[i], expected)` and length
   checks before indexed reads are the daily surface for both traps.

## Examples

### Good

- A red `assert.equal(result.length, 3)` that reads `4` -> intent:
  "exactly three records after this op" -> investigate why the code
  produced four; fix the code (or find the fixture leaked a record).
- Reviewing an assertion and rewriting `assert.equal(ok, "pin: ok")`
  into `assert.equal(message, "pin: ok")` because the intent was "the
  ledger line says this" - the expression corrected to match intent.

### Bad

- Swapping the operands again because "then it passes" - now the
  check asserts the constant against itself.
- Changing `equal` to `deepEqual` or `ok` to make a type mismatch go
  away - the matcher is part of the intent's precision.
- Absorbing a count drift into a new baseline without explaining why
  the count moved.

## Exceptions

- Deliberate identity-driven updates may legitimately change an
  assertion's expression (see
  ./references/byte-identical-ledger-assertions.md); they change it
  to the NEW correct expression of the SAME intent, and they are
  recorded. Swapping operands to green-light a run is not that.

## Failure Modes

- The self-passing assert: `assert.equal(x, x)` after an over-zealous
  "fix" - permanently green, permanently meaningless.
- Type-blind matcher choice: `==`-style or loose matchers papering
  over boolean-vs-string swaps.
- Index assertions without a length assert: a shorter record array
  shifts every index; the drift shows up as a phantom "wrong value"
  that is really a missing element.

## Arbiters

- Assertion review: every `equal` is checked for (actual, expected)
  order and type compatibility; every count is checked against the
  recorded baseline.
- The failing-smoke law (./references/failing-smoke-means-change-is-wrong.md):
  any "fix" to a red assertion must name the intent it preserves - a
  fix that cannot name the intent is presumed to be a weakening.

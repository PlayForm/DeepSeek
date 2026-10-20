# The Vacuously-Green Trap

> Source: SKILL.md, Section 4 (The smokes are the arbiter), rule 3.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

A smoke whose fixture wiring is wrong can pass WITHOUT exercising the
code. When a smoke "passes but the world is weird" - the output looks
wrong, the logs are empty, a behavior that should have run did not -
verify the harness wiring FIRST, before debugging the code under test.

## Why: The Full Philosophy

1. **Green is only evidence if the code ran.** A smoke is a machine
   that runs code and compares outputs. If the wiring is wrong - the
   fixture imports the wrong path, the mock swallows the call, the
   plugin never loads - the comparison compares nothing, and the suite
   reports green. Vacuous green is worse than red: red stops you;
   vacuous green sends you off confident.
2. **"Passes but the world is weird" is the trap's signature.** The
   scenario: the smoke is green, yet the thing you changed is nowhere
   in the output - no new ledger line, no new event, no changed
   behavior. The probability mass is NOT on "the code is subtly right
   in a weird way"; it is overwhelmingly on "the code never ran".
   Wiring first is just correct Bayesian triage.
3. **The trap compounds with the smoke/battery boundary.** Because
   smokes use a fake ctx, their wiring has more degrees of freedom
   (what the fake provides, what the real factory expects). A mismatch
   between those two is exactly the silent no-exercise condition (see
   ./references/smokes-prove-mechanics.md).
4. **Order of investigation is the discipline.** The rule fixes the
   sequence: (1) is the harness wired so the code actually runs? (2)
   only then, what is wrong with the code? Reversing it wastes the
   debugging session on phantom bugs.

## Examples

### Good

- New feature added, smoke still green, output unchanged -> check the
  fixture: does it load the rebuilt Target? Is the new code path
  reachable from the fixture's inputs? Wiring fixed, smoke then
  actually exercises the feature (additively - see
  ./references/smoke-arbiter.md).
- Asserting the negative as wiring proof: the fixture asserts the code
  RAN (a log line appeared, a state changed) before asserting what it
  produced.

### Bad

```
// the vacuous fixture:
const plugin = require('./wrong-path/Target')  // stale or wrong target
smoke.assert(output === expectedBaseline)       // green, but code never ran
```

```
// "passes but weird" -> diving into the transform logic first
	// hours spent debugging code that was never executed
```

## Exceptions

- None. There is no scenario where "verify the wiring first" is the
  wrong first move when green coexists with a weird world. Even a
  genuine code bug is found faster after the wiring check, because
  the check also confirms the reproduction path.

## Failure Modes

- **Trusting green over the world:** shipping a change whose smoke
  never touched it. Cost: the feature silently does not exist live;
  discovered by a user, not a test.
- **Stale Target in the fixture:** the fixture loads an old build, so
  every change is "tested" against yesterday's code. Cost: total
  false confidence; the rebuild step (see
  ./references/deterministic-build.md) was skipped and nothing went
  red.
- **Mock-swallowed calls:** an over-eager fake returns defaults for
  the calls under test. Cost: the smoke measures the mock, not the
  code.

## Arbiters

- The triage rule itself: green + weird world => wiring check first,
  as a standing review question ("did you verify the fixture ran the
  code?").
- Wiring-positivity: fixtures assert the code ran (an observable side
  effect) before asserting outcomes; a fixture without a ran-proof is
  suspect in review.
- The battery: a wiring question that survives the smoke fixture
  check gets a battery scenario, not more fixture tweaking (see
  ./references/smokes-prove-mechanics.md).

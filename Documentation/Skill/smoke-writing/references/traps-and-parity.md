# Traps and Parity

## The vacuously-green trap

A suite can pass without exercising the code. The cargo suite's `boot()`
assigned its listener once, and checks 1-12 passed against a listener that
was never registered. The output said PASS; the behavior was untested.

The signature: a suite that passes but the world is weird. The check:
verify the fixture wiring before trusting the pass. Ask what the test
would print if the code under test were deleted; if the answer is "the
same PASS", the test is not testing.

## Swapped and reversed asserts

`assert.equal(boolean, string)` passes when both coerce to the same
string; a reversed expected/actual pair hides which side is wrong. A
drifting count is the same class: the number moved and the assertion
followed it.

The check: read the assertion's intent. What behavior does it protect?
Then decide whether the code or the test is wrong.

## The smoke-versus-live fidelity gap

The smokes prove the mechanics; the live battery proves the wiring. Not
covered by the smokes:

- the profile and bundle patch layers (a patch config replaces the entry
  config wholesale);
- the load order at boot;
- the version-guard interplay across a multi-step fold;
- storage-domain open failures;
- the activation line in the real ledger.

Both green does not prove the profile wiring. The ledgers do. Every live
finding becomes a regression test where the harness can represent it.

## The parity rule

- Classic and EffectTS carry the same assertion sets.
- EffectTS adds coverage: factory +7, governor +3, core at parity at 14, plus the
  tracing rerun for ccr and tool-coach.
- The ledger strings and behaviors are the contract across both trees.
- The old Boilerplate tree no longer exists; the parity pair is Classic
  and EffectTS.

## Tracing hygiene

In EffectTS, run the suite with `FACTORY_SMOKE_TRACING=1`. The rerun must
produce byte-identical stdout and ledgers: the spans never alter the
strings, the ordering, or the timing the assertions depend on. The
comparison is silent; the printed PASS stream stays the same.

## Failure modes

- **Trusting a green suite**: the wiring is unverified.
- **Fixing the code to match a swapped assert**: the bug becomes the
  contract.
- **Skipping the tracing rerun**: the EffectTS additive coverage silently
  disappears.
- **Assuming the live behavior from the smoke**: the patch layers and load
  order are outside the harness.

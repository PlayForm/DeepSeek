# Loader-And-Journal - the class contract and the pre-apply validation

The ingester's class-form loader contract, the config defaults, and the
validation that runs before any write.

## Scenarios

- L1: the class-form loader contract - the class carries
  `inject: ["fs"]` and a Config schema; the service registers on
  construction through the context (the Service base), `Apply` is on the
  surface.
- L2: the config defaults (`enabled` true, `maxTargets` 20,
  `stopOnConflict` true) and the schema fail-loud on a non-numeric
  `maxTargets`.
- L3: a decision for another proposal rejects the whole run: every target
  `skipped`, applied 0, and the byte-exact rejection reason
  ("decision does not reference this proposal") journaled before any write -
  the file content is untouched.
- L4: a denied decision, an expired decision, and a non-approval outcome
  reject with their byte-exact reasons.
- L5: an expired proposal ("proposal expired") and a proposal with no
  operations ("proposal carries no operations") reject.
- L6: a missing fs service reports `recovery-required` for every target
  (recovery = n) and journals "no filesystem service".

## Fixtures

The shared Harness (fake ctx with a capturing fs, real built Target class).
No fake clock: the journal's `at` field is asserted as a number only.

## Expected journal strings (byte-exact, one JSON line per event)

`rejected` / `decision does not reference this proposal`,
`rejected` / `decision denied the proposal`,
`rejected` / `decision recorded the proposal as expired`,
`rejected` / `decision is not an approval`,
`rejected` / `proposal expired`, `rejected` / `proposal carries no operations`,
`rejected` / `no filesystem service`.

## Expected count

10 PASS.

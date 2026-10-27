# Loader-And-Journal - the class contract and the pre-apply validation

This folder covers the class-form loader contract of the ingester, the config defaults, and the
validation that runs before any write.

## Scenarios

- L1: the class-form loader contract - the class carries `inject: ["fs"]` and
  a Config schema, the service registers on construction through the context
  of the Service base, and `Apply` is on the surface.
- L2: the config defaults (`enabled` true, `maxTargets` 20, `stopOnConflict`
  true) hold, and the schema fails loud on a non-numeric `maxTargets`.
- L3: a decision for another proposal rejects the whole run, so every target is
  `skipped`, applied is 0, and the byte-exact rejection reason
  ("decision does not reference this proposal") is journaled before any write,
  with the file content untouched.
- L4: a denied decision, an expired decision, and a non-approval outcome reject
  with their byte-exact reasons.
- L5: an expired proposal ("proposal expired") and a proposal with no
  operations ("proposal carries no operations") reject.
- L6: a missing fs service reports `recovery-required` for every target, with
  recovery = n, and journals "no filesystem service".

## Fixtures

The fixtures are the shared Harness with the fake ctx that has a capturing fs and the real built
Target class.

No fake clock exists, because the checks assert the `at` field of the journal as a number only.

## Expected journal strings (byte-exact, one JSON line per event)

`rejected` / `decision does not reference this proposal`,
`rejected` / `decision denied the proposal`,
`rejected` / `decision recorded the proposal as expired`,
`rejected` / `decision is not an approval`,
`rejected` / `proposal expired`, `rejected` / `proposal carries no operations`,
`rejected` / `no filesystem service`.

## Expected count

10 PASS.

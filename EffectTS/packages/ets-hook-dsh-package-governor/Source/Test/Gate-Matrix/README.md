# Gate-Matrix

What this test verifies.

## Intent

The g1 gate matrix is the governor's first line of defense: every `fs/observed`
event that is not a mutation-actor write of a package.json body must be
handled silently, and the one gate that DOES speak (exclusion-first) must speak
in its exact byte-identical form with its P5 journal record and zero writes.
The gates are exercised through the REAL wired listener (the same listener the
live bus calls), so this folder proves the Factory.Gate composition, not just
the predicate. The assertions are moved verbatim from
`Classic/smokes/governor-smoke.mjs` section 4.

## Scenario

- Group: the g1 gate matrix (Factory.Gate through the wired listener).
    - Sub: "Gate: missing target -> silent (Factory.Gate reason=target)"
    - Sub: "Gate: non-mutation actor tool -> silent (reads emit too)"
    - Sub: "Gate: absent observation -> silent"
    - Sub: "Gate: non-package.json basename -> silent (the module gate)"
    - Sub: "Gate: Stash idempotence -> silent (our own re-emits skip)"
    - Sub: "Gate: exclusion-first -> `skipped (excluded) <path>` byte-identical"
    - Sub: "Gate: the P5 `excluded` record for the excluded path"
    - Sub: "Gate: excluded -> no write, nothing else logged"
    - Sub: "silence: a throwing listener is contained
      (`listener error (suppressed)`), never rethrown"

## Fixtures

The harness world (Boot) + the wired `fs/observed` listener from the Events
capture. A `gates/` directory under the harness Root for the gate targets; the
exclusion fixture is a `package.json` under `<Root>/.git/inner/` (an excluded
prefix). The Stash idempotence gate seeds `Probe.Stash` directly and cleans it
up. No registry, no manifest content - the silent gates must not even read.

## Expected ledger strings (byte-exact)

- `skipped (excluded) <Root>/.git/inner/package.json` (ISO-timestamped ledger
  line; the path interpolation is the only variable part).

## Edge cases

- The five silent gates share ONE `before` baseline (the source suite's
  single variable): any gate that added even one line would break every later
  count - that is the negative control.
- A vanished manifest (the `gates/package.json` never exists) silently fails
  the chain pass: no line, no write, no throw.
- The throw-containment check flips `Probe.Factory` to undefined to force the
  listener body to throw, asserts no rethrow, restores the factory, and
  asserts the `listener error (suppressed)` logger line.

## Expected count

9 PASS.

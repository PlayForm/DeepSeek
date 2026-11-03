Post-Execute-And-Gate - the listener behavior tests

The tools/post-execute and agent/pre-step listeners against the fake ctx: the history emit path, the
real fold (three judged calls feed the history through the listener itself), the silence path
(including the new `no-history` abstention), the abstention path, the gate paths, the block-decision
shape, the per-agent memory isolation, and the per-turn reset.

## Scenarios

- E1: the history emit path - the session history is seeded through the
  `__conventionSuggesterState` probe (the anchor path plus two companions), and
  a write of the anchor prepends ONE frozen, identified note (source kind
  `convention-suggester`, form `notice`, summary `History 0.70`) ahead of
  every downstream context; the note text is byte-exact (intent line, the two
  companion lines with their `touched 1 time(s) after this file` reasons, the
  history caveat); the `suggest History 0.70 2 candidates call write` ledger
  line is byte-exact in the logger and durable forms; the per-agent memory
  records the call, the turn note, the `Noted` map and the probe ring.
- E2: the silence paths - a non-judged tool (bash) returns the decision
  unchanged with zero ledger lines; a judged call with NO history and NO pack
  abstains `abstained no-history  0.00` (both forms) with no note; next() is
  awaited before any judgment.
- E3: the abstention path - a candidate set fully removed by the exclude
  prefixes abstains `ambiguous` (`abstained ambiguous History 0.70`, both
  forms).
- E4: the gate paths - the default cooldown suppresses an immediate History
  repeat (`suppressed cooldown History`); with `cooldownCalls: 0` the
  per-turn cap suppresses the second History note (`suppressed cap History`);
  the `agent/pre-step` reset (a user message as the last message) releases the
  cap so the same call emits again; a pre-step whose last message is not a
  user message does not reset.
- E5: the block decision keeps `kind` and `feedback` and gains the note;
  another agent's memory is independent; the probe ring caps at eight entries
  while the call counter keeps advancing; the reset listener is fail-open and
  returns the downstream decision.
- E6: the REAL fold - NO seeded state: three judged calls through the listener
  (anchor A, companion B, anchor A again) feed the session history
  themselves, so the first two abstain `no-history` and the third emits the
  `History 0.65` note naming B (`suggest History 0.65 1 candidates call
  write`), which proves the feed is the `tools/post-execute` stream itself.

## Fixtures

The shared Harness (fake ctx with a DISTINCT root object, the real factory, the real built Target).

No fake clock is needed, because every timing assertion is on the per-agent call counter and the
cooldown window.

The judged relative paths resolve against the REAL `EffectTS/packages/ets-hook-dsh-ccr` package cwd
(the `workingDirectory` service of the harness), so the seeded companion paths exist under the
package base.

## Expected ledger strings (byte-exact, `convention-suggester: ` prefix)

`suggest History 0.70 2 candidates call write`,
`suggest History 0.65 1 candidates call write`,
`abstained no-history  0.00`,
`abstained ambiguous History 0.70`,
`suppressed cooldown History`, `suppressed cap History`.

## Expected count

17 PASS.

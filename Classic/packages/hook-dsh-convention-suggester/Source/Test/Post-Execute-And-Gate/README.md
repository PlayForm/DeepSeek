Post-Execute-And-Gate - the listener behavior tests

The tools/post-execute and agent/pre-step listeners against the fake ctx:
the emit path, the silence path, the abstention path, the gate paths, the
block-decision shape, the per-agent memory isolation, and the per-turn
reset.

## Scenarios

- E1: the emit path - a write of the plugin entry function prepends ONE
  frozen, identified note (source kind `convention-suggester`, form
  `notice`, summary `Ledger 0.87`) ahead of every downstream context; the
  Naming note text is byte-exact (intent line, the target list with one
  reason each, the intent's caveat); the `suggest Ledger 0.87 4 candidates
  call write` ledger line is byte-exact in the logger and durable forms;
  the Naming line is byte-exact; the per-agent memory records the calls,
  the turn notes, the Noted map with the call indexes and the probe ring.
- E2: the silence paths - a non-judged tool (bash) and a judged call with
  no matching intent return the decision unchanged with zero ledger lines
  (the classifier's identity element is silence); next() is awaited before
  any judgment.
- E3: the abstention path - a candidate set fully removed by the exclude
  prefixes abstains `ambiguous` (`abstained ambiguous Docs 0.80`, both
  forms).
- E4: the gate paths - the default cooldown suppresses an immediate
  same-intent repeat (`suppressed cooldown Ledger`); the per-turn cap
  suppresses the second intent (`suppressed cap Naming`); the
  `agent/pre-step` reset (a user message as the last message) releases the
  cap so the same call emits again; a pre-step whose last message is not a
  user message does not reset.
- E5: the block decision keeps `kind` and `feedback` and gains the note;
  another agent's memory is independent; the probe ring caps at eight
  entries while the call counter keeps advancing; the reset listener is
  fail-open and returns the downstream decision.

## Fixtures

The shared Harness (fake ctx with a DISTINCT root object, the real factory,
the real built Target). No fake clock: every timing assertion is on the
per-agent call counter and the cooldown window. The judged relative paths
resolve against the REAL `Classic/packages/hook-dsh-ccr` package cwd (the
harness's `workingDirectory` service), so the pack's package-relative
targets exist.

## Expected ledger strings (byte-exact, `convention-suggester: ` prefix)

`suggest Ledger 0.87 4 candidates call write`,
`suggest Naming 0.80 3 candidates call write`,
`abstained ambiguous Docs 0.80`,
`suppressed cooldown Ledger`, `suppressed cap Naming`.

## Expected count

16 PASS.

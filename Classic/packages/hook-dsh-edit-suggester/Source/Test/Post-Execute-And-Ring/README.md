Post-Execute-And-Ring - the listener behavior tests

The tools/post-execute and agent/pre-step listeners against the fake ctx:
the emit path, the pass-through paths, the abstention and suppress paths,
the block-decision shape, the per-agent ring isolation, and the per-turn
reset.

## Scenarios

- E1: the emit path - a manifest edit prepends ONE frozen, identified note
  (source kind `edit-suggester`, form `notice`, summary `Version 0.87`)
  ahead of every downstream context; the Config note text is byte-exact
  (family line, the companion list with one reason each, the standing
  caution); the `suggest Version 0.87 7 companions package.json` ledger
  line is byte-exact in the logger and durable forms; the Config line is
  byte-exact for its 5 companions; the ring records the cooldown, the
  dedupe key, the touched path and the counters.
- E2: the pass-through paths - a non-judged tool (bash) returns the
  decision unchanged with zero ledger lines; next() is awaited before any
  judgment.
- E3: the abstention paths - a non-source path abstains `no-signal` with
  the empty-family double-space line (`abstained no-signal  0.00`, both
  forms); a raised config threshold (0.9) abstains `low-confidence
  Version 0.87` and prints the raised threshold in the activation line.
- E4: the suppress paths - a zero cooldown window reaches the `dedupe`
  suppress; the per-turn cap reaches the `cap` suppress for the second
  family; the default cooldown suppresses an immediate same-family repeat.
- E5: the block decision keeps `kind` and `feedback` and gains the note;
  another agent's ring is independent; the `agent/pre-step` reset (a user
  message) clears the ring so the same call emits again; a pre-step without
  a user message does not reset; the reset listener is fail-open and
  returns the downstream decision.

## Fixtures

The shared Harness (fake ctx with a DISTINCT root object, the real factory,
the real built Target). No fake clock: every timing assertion is on the
ring's counters and the cooldown window. The judged relative paths resolve
against the REAL `Classic/packages/hook-dsh-ccr` package cwd (the harness's
`workingDirectory` service), so the pack's package-relative companions exist.

## Expected ledger strings (byte-exact, `hook-dsh-edit-suggester: ` prefix)

`suggest Version 0.87 7 companions package.json`,
`suggest Config 0.87 5 companions Source/Variable/Config.ts`,
`abstained no-signal  0.00`,
`abstained low-confidence Version 0.87`,
`suppressed dedupe Version`, `suppressed cap Config`,
`suppressed cooldown Version`.

## Expected count

16 PASS.

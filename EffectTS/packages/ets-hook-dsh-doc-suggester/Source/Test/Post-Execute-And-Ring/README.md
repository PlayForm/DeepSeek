Post-Execute-And-Ring - the listener behavior tests

The tools/post-execute and agent/pre-step listeners against the fake ctx: the History emit path, the
pass-through paths, the abstention paths (including the `no-history` silence), the suppress paths,
the block-decision shape, the per-agent ring isolation, and the per-turn reset.

## Scenarios

- E1: the emit path - a seeded session history (the anchor
  `Documentation/Plans/POC-LEDGER.md`, then `README.md` and `package.json`)
  prepends ONE frozen, identified note (source kind `doc-suggester`, form
  `notice`, summary `History 0.87`) ahead of every downstream context; the
  note text is byte-exact (family line, the two companions with
  `touched 1 time(s) after this file`, the standing caution); the
  `suggest History 0.87 2 companions Documentation/Plans/POC-LEDGER.md`
  ledger line is byte-exact in the logger and durable forms; the ring
  records the cooldown, the dedupe key, the touched path and the counters.
- E2: the pass-through paths - a non-judged tool (bash) returns the decision
  unchanged with zero ledger lines; next() is awaited before any judgment.
- E3: the abstention paths - a judged call with NO history and NO pack
  abstains `no-history` with the empty-family double-space line
  (`abstained no-history  0.00`, both forms); a raised config threshold (0.9)
  abstains `low-confidence History 0.87` and prints the raised threshold in
  the activation line.
- E4: the suppress paths - a zero cooldown window reaches the `dedupe`
  suppress; a zero per-turn cap reaches the `cap` suppress; the default
  cooldown suppresses an immediate same-family repeat.
- E5: the block decision keeps `kind` and `feedback` and gains the note;
  another agent's ring is independent (a fresh emit on agent A while agent B
  is cooled); the `agent/pre-step` reset (a user message) clears the ring so
  the same call emits again; a pre-step without a user message does not
  reset; the reset listener is fail-open and returns the downstream
  decision.

## Fixtures

The shared Harness (fake ctx with a DISTINCT root object, the real factory, the real built Target).

The session history is seeded through the `__hookDshDocSuggesterState` probe (the same shape the
`session/event` fold writes), so the suite does not need a session bus.

No fake clock is needed, because every timing assertion is on the counters of the ring and the
cooldown window.

## Expected ledger strings (byte-exact, `hook-dsh-doc-suggester: ` prefix)

`suggest History 0.87 2 companions Documentation/Plans/POC-LEDGER.md`,
`abstained no-history  0.00`,
`abstained low-confidence History 0.87`,
`suppressed dedupe History`, `suppressed cap History`, `suppressed cooldown History`.

## Expected count

16 PASS.

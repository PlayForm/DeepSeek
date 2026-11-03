Post-Execute-And-Ring - the listener behavior tests

The tools/post-execute and agent/pre-step listeners against the fake ctx: the History emit path, the
real projection path (committed `tool/call` events folded by the registered unit and read back
through `stateOf`), the pass-through paths, the abstention paths (including the `no-history`
silence), the suppress paths, the block-decision shape, the per-agent ring isolation, and the
per-turn reset.

## Scenarios

- E1: the emit path - the session history is seeded through the projection
  drive (three committed `tool/call` events: the anchor
  `Source/Variable/Config.ts`, then `README.md` and `SCHEME.md`), and a judged
  edit of the anchor prepends ONE frozen, identified note (source kind
  `edit-suggester`, form `notice`, summary `History 0.87`) ahead of every
  downstream context; the note text is byte-exact (family line, the two
  companions with `touched 1 time(s) after this file`, the standing caution);
  the `suggest History 0.87 2 companions Source/Variable/Config.ts` ledger line
  is byte-exact in the logger and durable forms; the ring records the cooldown,
  the dedupe key, the touched path and the counters.
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
- E6: the REAL projection path - NO seeded state and NO State fold.
  `Run.State.History` is `undefined`; three `tool/call` events (the anchor,
  the companion, then the anchor again as the current call's own STARTED
  record) are committed through the fake registry's eager drive, so the unit's
  `apply` folds them into that session's cell (`Seq 3`); the judged edit then
  reads that state through `stateOf` and emits the `History 0.87` note naming
  the companion (`suggest History 0.87 1 companions ...`), and the cell stays
  at `Seq 3` - no post-execute append.

## Fixtures

The shared Harness (fake ctx with a DISTINCT root object, the real factory, the real built Target,
and the fake `sessionProjections` registry: `register` + `stateOf` + the `Commit` drive).

No fake clock is needed, because every timing assertion is on the counters of the ring and the
cooldown window.

## Expected ledger strings (byte-exact, `hook-dsh-edit-suggester: ` prefix)

`suggest History 0.87 2 companions Source/Variable/Config.ts`,
`suggest History 0.87 1 companions Source/Variable/Config.ts`,
`abstained no-history  0.00`,
`abstained low-confidence History 0.87`,
`suppressed dedupe History`, `suppressed cap History`, `suppressed cooldown History`.

## Expected count

17 PASS.

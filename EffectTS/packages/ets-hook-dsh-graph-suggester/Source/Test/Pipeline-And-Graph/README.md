# Pipeline-And-Graph - the pipeline and the graph resolution tests

The tools/post-execute pipeline against the fake `workspaceGraph` service:
the Neighborhood resolution, the fallbacks, the abstention paths, the gate,
the exclusion, the volatile flip, and the purity.

## Scenarios

- P1: the Neighborhood resolution - the graph query receives the anchor and
  the candidate cap (7), the suggest line is byte-exact
  (`suggest Neighborhood 0.65 2 candidates call read`), the note is ONE
  labeled frozen notice (`kind: "graph-suggester"`, `form: "notice"`,
  summary `Neighborhood 0.65`) prepended to the downstream decision.
- P2: the empty-reason fallback (the role is used) and the empty-component
  fallback (the static target set, 3 candidates).
- P3: the graph-unavailable paths - an absent service logs
  `graph unavailable` ONCE per apply and abstains per call with the
  byte-exact `abstained graph-unavailable Neighborhood 0.65`; a throwing
  service logs `graph unavailable Error: boom`; `graph:false` abstains
  WITHOUT the `graph unavailable` line.
- P4: the Sibling intent resolves statically
  (`suggest Sibling 0.55 3 candidates call grep`).
- P5: the gate - a repeat within the cooldown is suppressed
  (`suppressed cooldown Neighborhood`), a note beyond the per-turn cap is
  suppressed (`suppressed cap Sibling`), and a user turn (agent/pre-step)
  resets the counter so the note emits again.
- P6: the exclusion - a fully excluded candidate set abstains
  (`abstained ambiguous Neighborhood 0.65`), a partially excluded set
  suggests the survivors; a block decision keeps its feedback and prepends
  the note ahead of the downstream context.
- P7: the volatile flip - committing `enabled: false` into the cell and
  dispatching `loader/volatile-update` refreshes the state in place and the
  calls pass through; a note longer than `maxNoteChars` is truncated with an
  ellipsis.
- P8: the fs purity - ZERO fs operations across the full scenario.

## Fixtures

The shared Harness plus `FakeGraph` (the service shape declared in
Interface/Graph.ts) and `Flip` (the cosmokit volatile-cell write symbol).

## Expected ledger strings (byte-exact, `graph-suggester: ` prefix)

`suggest Neighborhood 0.65 <n> candidates call read`,
`suggest Sibling 0.55 3 candidates call grep`,
`abstained graph-unavailable Neighborhood 0.65`,
`abstained ambiguous Neighborhood 0.65`,
`graph unavailable`, `graph unavailable Error: boom`,
`suppressed cooldown Neighborhood`, `suppressed cap Sibling`.

## Expected count

19 PASS.

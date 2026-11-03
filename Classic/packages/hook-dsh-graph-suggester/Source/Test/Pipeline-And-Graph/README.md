# Pipeline-And-Graph - the pipeline and the graph resolution tests

The tools/post-execute pipeline against the fake `workspaceGraph` service: the Neighborhood
resolution, the graph-only candidate source (an empty component, or one that holds only the anchor,
abstains), the abstention paths, the Sibling same-directory projection, the gate, the exclusion, the
volatile flip, and the purity.

## Scenarios

- P1: the Neighborhood resolution - the graph query receives the anchor and
  the candidate cap (7), the suggest line is byte-exact
  (`suggest Neighborhood 0.87 1 candidates call read`, the anchor itself
  dropped from the component), the note is ONE labeled frozen notice
  (`kind: "graph-suggester"`, `form: "notice"`, summary `Neighborhood 0.87`)
  prepended to the downstream decision.
- P2: the empty-reason fallback (the role is used) and the empty component
  (an `abstained no-companions Neighborhood 0.87` line, no suggest, and no
  `graph unavailable` - the service answered honestly with nothing, so
  nothing is named).
- P3: the graph-unavailable paths - an absent service logs
  `graph unavailable` ONCE per apply and abstains per call with the
  byte-exact `abstained graph-unavailable Neighborhood 0.87`; a throwing
  service logs `graph unavailable Error: boom`; `graph:false` abstains
  WITHOUT the `graph unavailable` line.
- P4: the Sibling intent is synthesized from the same query as its
  same-directory projection (the anchor excluded), so an `intents: ["Sibling"]`
  mount suggests the directory peer
  (`suggest Sibling 0.87 1 candidates call grep`).
- P5: the gate - a repeat within the cooldown is suppressed
  (`suppressed cooldown Neighborhood`), a note beyond the per-turn cap is
  suppressed (`suppressed cap Neighborhood`), and a user turn (agent/pre-step)
  resets the counter so the note emits again.
- P6: the exclusion - a fully excluded candidate set abstains
  (`abstained ambiguous Neighborhood 0.87`), a partially excluded set
  suggests the survivors; a block decision keeps its feedback and prepends
  the note ahead of the downstream context.
- P7: the volatile flip - committing `enabled: false` into the cell and
  dispatching `loader/volatile-update` refreshes the state in place and the
  calls pass through; a note longer than `maxNoteChars` is truncated with an
  ellipsis.
- P8: the fs purity - ZERO fs operations across the full scenario.
- P9: the anchor exclusion - a component that holds only the anchor abstains
  `abstained no-companions Neighborhood 0.87` (no suggest, no
  `graph unavailable`), a component of anchor plus companions names only the
  companions (`suggest Neighborhood 0.87 2 candidates call read`), an anchor
  entry that arrives as `./src\Source\Core.ts` is normalized and dropped too,
  and no note line ever names the anchor.

## Fixtures

The shared Harness plus `FakeGraph` (the service shape declared in Interface/Graph.ts) and `Flip`
(the cosmokit volatile-cell write symbol).

## Expected ledger strings (byte-exact, `graph-suggester: ` prefix)

`suggest Neighborhood 0.87 <n> candidates call read`,
`suggest Sibling 0.87 <n> candidates call grep`,
`abstained graph-unavailable Neighborhood 0.87`,
`abstained no-companions Neighborhood 0.87`,
`abstained ambiguous Neighborhood 0.87`,
`graph unavailable`, `graph unavailable Error: boom`,
`suppressed cooldown Neighborhood`, `suppressed cap Neighborhood`.

The `k` is the graph intent's own confidence (`sigmoid(2.5 - 0.6) = 0.87`), never a pack's
per-signal sum.

## Expected count

23 PASS.

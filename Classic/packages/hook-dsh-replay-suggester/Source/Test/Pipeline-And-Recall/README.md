# Pipeline-And-Recall - the recall pipeline and the gate tests

The tools/post-execute pipeline runs against the seeded history store, and the Repeat intent fires ONLY through the recalled record, the gate, and the purity.

## Scenarios

- R1: the recall, where a record whose probe matches the call probe lets the Repeat intent cross the gate (the history lift), producing the byte-exact `suggest Repeat 0.77 2 candidates call read` line (logger and durable ledger) and ONE labeled frozen notice with the recalled files and the `note: last time verified with pnpm test` caveat.
- R2: the longest matching probe wins, the recalled files are capped at `maxCandidates`, and a fully excluded recall abstains with the byte-exact `abstained ambiguous Repeat 0.77`.
- R3: the gate suppresses a repeat within the cooldown (`suppressed cooldown Repeat`) and a note beyond the per-turn cap (`suppressed cap Repeat`), while a user turn (agent/pre-step) resets the counter.
- R4: the designed abstention, where without a matching record the hook stays silent (the lift never crosses the gate) and the decision passes through unchanged.
- R5: a block decision keeps its feedback and prepends the note ahead of the downstream context, and an empty verification falls back to the pack caveat.
- R6: the volatile flip, where committing `enabled: false` into the cell and dispatching `loader/volatile-update` makes every call pass through.
- R7: the fs purity, where the history store is read with node:fs on the boot path and NEVER through ctx.fs (zero fs operations across a full scenario).

## Fixtures

The fixtures use the shared Harness plus `WriteStore` (the history JSON writer).

There is no fake clock, because the plugin has no clock dependency.

The recalled files are HISTORY RECORDS, not workspace paths, so they are exempt from the existence filter and the seeded records keep their original `src/...` shapes.

The workspace gate still runs on the call path.

## Expected ledger strings (byte-exact, `replay-suggester: ` prefix)

`suggest Repeat 0.77 <n> candidates call read`,
`abstained ambiguous Repeat 0.77`,
`suppressed cooldown Repeat`, `suppressed cap Repeat`.

## Expected count

13 PASS.

# Pipeline-And-Gates - the pipeline and the gate tests

The tools/post-execute pipeline covers the Suite and Counts intents, the gate, the exclusion, the truncation, the block decision, the volatile flip, and the purity.

## Scenarios

- P1: the Suite intent, where a full-evidence read of a Test.ts (test + path + loop shapes) crosses the pack floor, producing the byte-exact `suggest Suite 0.65 4 candidates call read` line (logger and durable ledger) and ONE labeled frozen notice (`{kind: 'test-suggester', form: 'notice', summary: 'Suite 0.65'}`) with the four pack targets in pack order.
- P2: the Counts intent, where a full-evidence grep (count + doc shapes) suggests `Counts 0.55 3 candidates call grep`.
- P3: the gate, where a repeat within the cooldown is suppressed (`suppressed cooldown Suite`), a note beyond the per-turn cap is suppressed (`suppressed cap Counts`), and a user turn (agent/pre-step) resets the counter.
- P4: the exclusion, where excluded candidates are filtered (`Suite 0.65 1 candidates`) and a fully excluded set abstains with the byte-exact `abstained ambiguous Suite 0.65`.
- P5: the truncation, where a note longer than `maxNoteChars` is cut with an ellipsis.
- P6: a block decision keeps its feedback and prepends the note ahead of the downstream context.
- P7: the volatile flip, where committing `enabled: false` into the cell and dispatching `loader/volatile-update` makes every call pass through.
- P8: the fs purity, where ZERO fs operations occur across the full scenario.

## Fixtures

The fixtures use the shared Harness (fake ctx, real factory, real built Target), and there is no fake clock because the plugin has no clock dependency.

The judged relative paths resolve against the REAL `Classic/packages/hook-dsh-ccr` package cwd (the harness's `workingDirectory` service), so the pack's package-relative targets exist, while the `<Suite>` placeholders are illustrative and are never existence-checked.

## Expected ledger strings (byte-exact, `test-suggester: ` prefix)

`suggest Suite 0.65 <n> candidates call read`,
`suggest Counts 0.55 3 candidates call grep`,
`abstained ambiguous Suite 0.65`,
`suppressed cooldown Suite`, `suppressed cap Counts`.

## Expected count

12 PASS.

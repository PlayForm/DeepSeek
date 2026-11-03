# Pipeline-And-Gates - the pipeline and the gate tests

The tools/post-execute pipeline covers the synthetic `History` family, the reconciliation clear line, the `no-history` abstention, the gate, the exclusion, the truncation, the block decision, the volatile flip, and the purity.

## Scenarios

- P1: the history emit path, where a seeded session history (the anchor, then `README.md` and `SCHEME.md`) makes `Adjacent` name the two companions: the byte-exact `suggest History 0.87 2 candidates call read` line (logger and durable ledger), ONE labeled frozen notice (`{kind: 'test-suggester', form: 'notice', summary: 'History 0.87'}`) with the byte-exact text, and the consistent smoke tree's single `reconciliation clear` line, which never preempts the note.
- P2: a rooted tree with no history and no pack abstains with the byte-exact `abstained no-history  0.00` line and no `suggest` line.
- P3: the gate, where a repeat within the cooldown is suppressed (`suppressed cooldown History`), a note beyond the per-turn cap is suppressed (`suppressed cap History`), and a user turn (agent/pre-step) resets the counter.
- P4: the exclusion, where an excluded companion is filtered (`History 0.87 1 candidates`) and a fully excluded set abstains with the byte-exact `abstained ambiguous History 0.87`.
- P5: the truncation, where a note longer than `maxNoteChars` is cut with an ellipsis.
- P6: a block decision keeps its feedback and prepends the note ahead of the downstream context.
- P7: the volatile flip, where committing `enabled: false` into the cell and dispatching `loader/volatile-update` makes every call pass through.
- P8: the fs purity, where ZERO fs operations happen across the full scenario.

## Fixtures

The shared Harness (fake ctx, real factory, real built Target) plus `node:fs` temp trees under the OS temp dir.

There is no fake clock, because the plugin has no clock dependency.

The ROOTED fixture carries a `package.json` marker, the absolute anchor, the two companions, and a CONSISTENT smoke tree (`Source/Test/Foo/README.md` with `4 PASS`, its `Test.ts`, and `Target/Test/Foo/Test.js`), so the reconciliation logs one clear line and the history note takes the call.

## Expected ledger strings (byte-exact, `test-suggester: ` prefix)

`suggest History 0.87 2 candidates call read`, `suggest History 0.87 1 candidates call read`, `abstained no-history  0.00`, `abstained ambiguous History 0.87`, `suppressed cooldown History`, `suppressed cap History`, `reconciliation clear <package> (4 expected, 4 actual)`.

## Expected count

13 PASS.

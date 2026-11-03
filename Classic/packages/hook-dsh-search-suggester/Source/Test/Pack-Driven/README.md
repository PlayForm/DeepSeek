# Pack-Driven

The search suggester as an EXPLICIT-PACK consumer: the pack of a temporary repo supplies the candidates when the session history is empty, a workspace without a pack abstains `no-history`, the root gates the pack (not its signature), the built-in pack is never a candidate source, and the History family is prepended before the pack's own rows.

## Scenarios

- P1: a temporary repo with `.dsh/pack.yml` (one `search/Version` family targeting `VERSIONS.md`) emits the note naming ONLY the target of the pack (`VERSIONS.md - the temp versions`), never a built-in one, and the ledger counts one candidate.
- P2: the SAME workspace without the pack has no history and abstains `no-history  0.00`, with no `suggest` line.
- P3: a pack whose companion is absent still resolves (the root gates, not the signature), and the existence filter empties its candidate set: `abstained no-companions Version 0.87`.
- P4: a monorepo read with no history abstains `no-history`, because the built-in pack is never a candidate source.
- P5: with a history committed through the projection drive the synthetic `History` row is prepended and wins the tie against the pack's family (`suggest History 0.87 1 candidates`).

## Fixtures

The shared Harness (fake ctx, the real factory, the real built Target) plus `node:fs` temporary trees under the OS temp dir.

The pack is a real `.dsh/pack.yml` read by the strict YAML-subset parser in `@playform/lib-dsh-pack`, resolved with `builtin: false`.

## Expected ledger strings (byte-exact, `hook-dsh-search-suggester: ` prefix)

`suggest Version 0.87 1 candidates`, `abstained no-history  0.00`, `abstained no-companions Version 0.87`, `suggest History 0.87 1 candidates`.

## Expected count

6 PASS.

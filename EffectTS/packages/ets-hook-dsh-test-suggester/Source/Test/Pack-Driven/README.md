# Pack-Driven

The test suggester as a PACK CONSUMER: the pack of a temporary repo overrides the built-in intent, a workspace without a pack stays silent, the signature of the pack gates the workspace, and the built-in pack still drives this monorepo.

## Scenarios

- P1: a temporary repo with `.dsh/pack.yml` (signature `docs/STYLE.md`, one `test/Suite` intent targeting `SUITE.md` and carrying its own caveat) emits the note naming ONLY the target and caveat of the pack, and the ledger counts one candidate.
- P2: the SAME workspace without the pack has no signature and stays silent (`abstained foreign-workspace  0.00`), with no `suggest` line.
- P3: a pack whose signature marker is absent does not resolve, and the call abstains `foreign-workspace`.
- P4: the built-in pack still drives the monorepo path, where a PASS-shaped read emits `Suite 0.65` naming the built-in `Source/Test/<Suite>/Test.ts` target.

## Fixtures

The shared Harness (fake ctx, the real factory, the real built Target) plus `node:fs` temporary trees under the OS temp dir.

The pack is a real `.dsh/pack.yml` read by the strict YAML-subset parser in `@playform/ets-lib-dsh-pack`.

## Expected ledger strings (byte-exact, `test-suggester: ` prefix)

`suggest Suite 0.87 1 candidates call read`, `abstained foreign-workspace  0.00`.

## Expected count

5 PASS.

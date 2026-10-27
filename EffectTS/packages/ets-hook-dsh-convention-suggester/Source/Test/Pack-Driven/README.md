# Pack-Driven

The convention suggester as a PACK CONSUMER: the own pack of a temporary repo overrides the built-in
intent, a workspace without a pack stays silent, the signature of the pack gates the workspace, and
the built-in pack still drives this monorepo.

## Scenarios

- P1: a temporary repo with `.dsh/pack.yml` (signature `docs/STYLE.md`, one
  `convention/Layout` intent targeting `GUIDE.md` and carrying its own
  caveat) emits the note naming ONLY the pack's target and caveat; the
  ledger counts one candidate.
- P2: the SAME workspace without the pack has no signature and stays silent
  (`abstained foreign-workspace  0.00`), with no `suggest` line.
- P3: a pack whose signature marker is absent does not resolve; the call
  abstains `foreign-workspace`.
- P4: the built-in pack still drives the monorepo path: a source write emits
  `Layout 0.80` naming the built-in `Source/Library.ts` target.

## Fixtures

The shared Harness (fake ctx, the real factory, the real built Target) plus `node:fs` temporary
trees under the OS temp dir.

The pack is a real `.dsh/pack.yml` read by the strict YAML-subset parser in
`@playform/ets-lib-dsh-pack`.

## Expected ledger strings (byte-exact, `convention-suggester: ` prefix)

`suggest Layout 0.87 1 candidates call write`,
`abstained foreign-workspace  0.00`.

## Expected count

5 PASS.

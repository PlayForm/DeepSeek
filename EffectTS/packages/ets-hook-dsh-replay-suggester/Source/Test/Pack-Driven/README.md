# Pack-Driven

The replay suggester as an EXPLICIT PACK CONSUMER: a pack of a temporary repo drives the intent and
the caveat while the candidates still come from the recall, a workspace without a pack emits the
synthesized note, a pack with no record abstains `no-memory`, and a workspace with neither a pack nor
a record abstains `no-history`.

## Scenarios

- P1: a temporary repo with `package.json` and `.dsh/pack.yml` (one `replay/Rerun` family, weight
  3.0, its own caveat, an empty target set) plus a seeded record emits the note with the pack's
  intent and caveat (`intent=Rerun confidence=0.92`, `note: the temp recall is the answer`) and the
  recalled companion (`Source/Version.ts - touched last time (Repeat)`), so the candidates come from
  the recall and never from the pack; the ledger counts one candidate.
- P2: the SAME workspace without the pack emits the synthesized `Repeat` note
  (`intent=Repeat confidence=0.87`, the synthesized caveat), because the recall is the only default
  source and no pack is needed.
- P3: the pack with NO record matches on its own signal (k 0.92) and abstains `no-memory Rerun 0.92`,
  because a pack supplies the gate and the caveat, never the files.
- P4: a workspace with no pack and no record abstains `no-history  0.00`, with no `suggest` line.

The declared `signature:` of the pack no longer gates anything: the workspace root is
pack-independent, so a pack governs its tree even when the declared marker file is absent.

## Fixtures

The shared Harness (fake ctx, the real factory, the real built Target) plus `node:fs` temporary trees
under the OS temp dir and a real seeded history store.

Every temp tree carries a `package.json` marker, because the workspace root is pack-independent.

The pack is a real `.dsh/pack.yml` read by the strict YAML-subset parser in
`@playform/ets-lib-dsh-pack`.

## Expected ledger strings (byte-exact, `replay-suggester: ` prefix)

`suggest Rerun 0.92 1 candidates call grep`, `suggest Repeat 0.87 1 candidates call grep`,
`abstained no-memory Rerun 0.92`, `abstained no-history  0.00`.

## Expected count

5 PASS.

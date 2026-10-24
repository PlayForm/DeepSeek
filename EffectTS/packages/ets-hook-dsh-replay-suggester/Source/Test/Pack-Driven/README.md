# Pack-Driven

The replay suggester as a PACK CONSUMER: a temporary repo's own pack
overrides the built-in intent and caveat, a workspace without a pack stays
silent, the pack's signature gates the workspace, and the built-in pack still
drives this monorepo.

## Scenarios

- P1: a temporary repo with `.dsh/pack.yml` (signature `docs/STYLE.md`, one
  `replay/Repeat` intent with its own caveat) emits the note naming the
  recalled companion (`Source/Version.ts - touched last time (Repeat)`) and
  carrying the pack's caveat (`the temp recall is the answer`); the ledger
  counts one candidate.
- P2: the SAME workspace without the pack has no signature and stays silent
  (`abstained foreign-workspace  0.00`), with no `suggest` line.
- P3: a pack whose signature marker is absent does not resolve; the call
  abstains `foreign-workspace`.
- P4: the built-in pack still drives the monorepo path: the recalled
  companion is named and the built-in caveat is used.

The recalled companion comes from the history store (a replay answer without
a record is a guess, so the pack supplies the caveat and the gate, never the
companion).

## Fixtures

The shared Harness (fake ctx, the real factory, the real built Target) plus
`node:fs` temporary trees under the OS temp dir and a real history store. The
pack is a real `.dsh/pack.yml` read by the strict YAML-subset parser in
`@playform/ets-lib-dsh-pack`.

## Expected ledger strings (byte-exact, `replay-suggester: ` prefix)

`suggest Repeat 0.77 1 candidates call grep`,
`abstained foreign-workspace  0.00`.

## Expected count

5 PASS.

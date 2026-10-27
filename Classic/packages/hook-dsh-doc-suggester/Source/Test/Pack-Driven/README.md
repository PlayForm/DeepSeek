# Pack-Driven

The suite covers the doc suggester as a PACK CONSUMER: the own pack of a temporary repo overrides the
built-in family, a workspace without a pack stays silent, the signature of the pack gates the
workspace, and the built-in pack still drives this monorepo.

## Scenarios

- P1: a temporary repo with `.dsh/pack.yml` (signature `docs/STYLE.md`, one `doc/Index` family
  targeting `docs/STYLE.md`) emits the note naming ONLY the companion of the pack
  (`docs/STYLE.md - the temp style`) and never the built-in `Documentation/ARCHIVE-STYLE.md`, and the
  ledger counts one companion.
- P2: the SAME workspace without the pack has no signature and stays silent
  (`abstained foreign-workspace  0.00`), with no `suggest` line.
- P3: a pack whose signature marker is absent does not resolve, and the call abstains with
  `foreign-workspace`.
- P4: the built-in pack still drives the monorepo path, because a plan read emits `Plan 0.87` naming
  the built-in `Documentation/INDEX.md` companion.

## Fixtures

The shared Harness supplies the fake ctx, the real factory, and the real built Target, and the trees
come from `node:fs` temporary directories under the OS temp dir.

The pack is a real `.dsh/pack.yml` read by the strict YAML-subset parser in
`@playform/lib-dsh-pack`.

## Expected ledger strings (byte-exact, `hook-dsh-doc-suggester: ` prefix)

`suggest Index 0.87 1 companions <the temp Documentation/INDEX.md path>`,
`abstained foreign-workspace  0.00`.

## Expected count

5 PASS.

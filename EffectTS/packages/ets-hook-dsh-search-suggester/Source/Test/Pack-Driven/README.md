# Pack-Driven

The search suggester as a PACK CONSUMER: a temporary repo's own pack
overrides the built-in intent, a workspace without a pack stays silent, the
pack's signature gates the workspace, and the built-in pack still drives this
monorepo.

## Scenarios

- P1: a temporary repo with `.dsh/pack.yml` (signature `docs/STYLE.md`, one
  `search/Version` intent targeting `VERSIONS.md`) emits the note naming ONLY
  the pack's target (`VERSIONS.md - the temp versions`), never the built-in
  `package.json - the monorepo manifest`; the ledger counts one candidate.
- P2: the SAME workspace without the pack has no signature and stays silent
  (`abstained foreign-workspace  0.00`), with no `suggest` line.
- P3: a pack whose signature marker is absent does not resolve; the call
  abstains `foreign-workspace`.
- P4: the built-in pack still drives the monorepo path: a version grep emits
  `Version 0.92` naming the built-in `package.json` candidate.

## Fixtures

The shared Harness (fake ctx, the real factory, the real built Target) plus
`node:fs` temporary trees under the OS temp dir. The pack is a real
`.dsh/pack.yml` read by the strict YAML-subset parser in
`@playform/ets-lib-dsh-pack`.

## Expected ledger strings (byte-exact, `hook-dsh-search-suggester: ` prefix)

`suggest Version 0.87 1 candidates`,
`abstained foreign-workspace  0.00`.

## Expected count

5 PASS.

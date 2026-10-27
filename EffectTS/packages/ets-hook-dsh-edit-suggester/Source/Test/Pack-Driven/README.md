# Pack-Driven

The edit suggester as a PACK CONSUMER: the own pack of a temporary repo overrides the built-in
family, a workspace without a pack stays silent, the signature of the pack gates the workspace, and
the built-in pack still drives this monorepo.

## Scenarios

- P1: a temporary repo with `.dsh/pack.yml` (signature `docs/STYLE.md`, one
  `edit/Version` family targeting `MANIFEST.md`) emits the note naming ONLY
  the pack's companion (`MANIFEST.md - the temp manifest`), never the built-in
  `package.json - the root manifest`; the ledger counts one companion.
- P2: the SAME workspace without the pack has no signature and stays silent
  (`abstained foreign-workspace  0.00`), with no `suggest` line.
- P3: a pack whose signature marker is absent does not resolve; the call
  abstains `foreign-workspace`.
- P4: the built-in pack still drives the monorepo path: a `package.json` edit
  emits `Version 0.87` naming the built-in `package.json` companion.

## Fixtures

The shared Harness (fake ctx, the real factory, the real built Target) plus `node:fs` temporary
trees under the OS temp dir.

The pack is a real `.dsh/pack.yml` read by the strict YAML-subset parser in
`@playform/ets-lib-dsh-pack`.

## Expected ledger strings (byte-exact, `hook-dsh-edit-suggester: ` prefix)

`suggest Version 0.87 1 companions <the temp package.json path>`,
`abstained foreign-workspace  0.00`.

## Expected count

5 PASS.

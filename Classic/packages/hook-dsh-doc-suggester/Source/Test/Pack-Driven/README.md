# Pack-Driven

The doc suggester as an EXPLICIT pack consumer: the own pack of a temporary repo still speaks when
the session history is empty, a workspace without a pack abstains `no-history` (the built-in pack is
never a candidate source), a pack in a rooted tree governs even when its declared signature marker is
absent, and the monorepo path with no history abstains too.

## Scenarios

- P1: a temporary repo with `package.json` and `.dsh/pack.yml` (signature
  `docs/STYLE.md`, one `doc/Index` family targeting `docs/STYLE.md`) emits
  the note naming ONLY the pack's companion
  (`docs/STYLE.md - the temp style`), never the built-in
  `Documentation/ARCHIVE-STYLE.md`; the ledger counts one companion. The
  history is empty, so the pack is the only candidate source.
- P2: the SAME workspace without the pack has no layer and stays silent
  (`abstained no-history  0.00`), with no `suggest` line.
- P3: a pack in a rooted tree still governs when its signature marker is
  absent: the root resolves (the `package.json` marker, not the signature),
  the pack's family matches, and its absent companion leaves the set empty
  (`abstained no-companions Index 0.87`), with no `suggest` line.
- P4: a monorepo doc read with no history abstains `no-history` instead of
  naming the built-in pack's companions.

## Fixtures

The shared Harness (fake ctx, the real factory, the real built Target) plus `node:fs` temporary
trees under the OS temp dir.

Every temp tree carries a `package.json` at its root, so the pack-independent workspace root
resolves.

The pack is a real `.dsh/pack.yml` read by the strict YAML-subset parser in
`@playform/lib-dsh-pack`.

## Expected ledger strings (byte-exact, `hook-dsh-doc-suggester: ` prefix)

`suggest Index 0.87 1 companions <the temp Documentation/INDEX.md path>`,
`abstained no-companions Index 0.87`,
`abstained no-history  0.00`.

## Expected count

5 PASS.

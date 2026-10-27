# Learn-Proposal

The derivation of the D4 learning bootstrap and its proposal file.

The `tools/post-execute` listener, with `learning: true`, derives the pack of a repo from the repo
itself and writes it under `<home>/.dsh/playform/proposals/<slug>.yml`, never the live pack.

The proposal is a full pack object, it parses back through `Parse` of `@playform/ets-lib-dsh-pack`,
and every companion it names exists under the repo root.

## Scenarios

- L1: a temporary repo with the doc graph (`Documentation/INDEX.md`,
  `ARCHIVE-STYLE.md`, `Plans`, `Guides`, `Skill`, `Handoff`), the package
  layout (`package.json`, `README.md`, `SCHEME.md`, `cordis.patch.yml`,
  `Source/Library.ts`, the four `Source/` folders) and the site
  (`Site/Source/{Content,pages,Component,Library}`) produces ONE note
  (`learned pack 9 families`) whose text names the absolute proposal path and
  the tilde install path; the `learned proposal <slug> 9 families <path>`
  ledger line is byte-exact in the logger and durable forms; the proposal
  exists and the live pack does not; the proposal parses back with slug
  `<basename>`, signature `Documentation/ARCHIVE-STYLE.md` and the nine
  families `doc/Plan`, `doc/Guide`, `doc/Skill`, `doc/Index`, `doc/Site`,
  `doc/PackageProse`, `convention/Layout`, `convention/Naming`,
  `convention/Docs`; every proposed companion exists under the root and none
  is a glob or a `<...>` placeholder.
- L2: the signature fallback chain - a repo with an index but no style guide
  proposes `signature: [Documentation/INDEX.md]`; a repo with only a manifest
  proposes `signature: [package.json]` and the single `convention/Docs`
  family.
- L3: learning off (the default) - no proposal file, no note, and the gate's
  `abstained foreign-workspace  0.00` line still runs.
- L4: a repo with an installed pack (a `.dsh/pack.yml` carrying a family) is
  never proposed over: no proposal file, no learning line, only the
  activation line.
- L5: the pack's own `learning.propose: true` opts a repo in with the config
  off (a minimal pack with no families), and the proposal + note appear.
- L6: a true config wins over a pack that sets `learning.propose: false`.

## Fixtures

The shared Harness (fake ctx, the real factory, the real built Target) plus `node:fs` temporary
trees under the OS temp dir and a temporary `HOME` (`process.env.HOME`), so the real `~/.dsh` is
never read or written.

The proposal is parsed with the REAL `@playform/ets-lib-dsh-pack` Target.

## Expected ledger strings (byte-exact, `convention-suggester: ` prefix)

`learned proposal <slug> 9 families <absolute proposal path>`,
`abstained foreign-workspace  0.00`.

## Expected count

11 PASS.

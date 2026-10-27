# Learn-Install

The D4 money shot: propose, install, and the doc suggester speaks.

One end-to-end pass runs across three real built Targets: the learner of the convention-suggester
derives a pack for a temporary repo, the proposal is COPIED into the user layer at
`<home>/.dsh/playform/workspaces/<slug>.yml`, and the doc-suggester, mounted in the same repo, now
emits a note that names the companions of the PROPOSAL.

## Scenarios

- I1: the learner proposes (`learned pack 6 families`) and writes
  `<home>/.dsh/playform/proposals/<slug>.yml`, while the live pack does not exist yet.
- I2: the user copies the proposal to the user layer, and the installed file is byte-identical to the
  proposal.
- I3: the doc suggester, resolving the installed user layer, emits `family=Site confidence=0.87` with
  the five DERIVED companions (`Documentation`, `Site/Source/Content`, `Site/Source/pages`,
  `Site/Source/Component`, `Site/Source/Library`) and the byte-exact
  `suggest Site 0.87 5 companions Site/Source/pages/index.astro` ledger line.
- I3 continues: the repo deliberately lacks `Site/Source/Library/Content.ts`, which is the target of
  the built-in pack, so naming `Site/Source/Component` proves that the installed proposal is the pack
  in force and not the built-in fallback.

## Fixtures

The learner uses the shared Harness (fake ctx, the real factory, the real built Target), and the REAL
built doc-suggester uses a local fake ctx in the same family shape.

The trees come from `node:fs` temporary directories, and a temporary `HOME` (`process.env.HOME`)
keeps the real `~/.dsh` unread and unwritten.

No sleeps run, because the whole sequence is synchronous state.

The repo carries `Documentation/INDEX.md` but NO `Documentation/ARCHIVE-STYLE.md`, so the workspace
gate never resolves and never populates the per-root pack memo of the library before the install, and
the doc suggester reads the installed user layer fresh in the same process.

In production the memo contract applies, so an installed pack lands on the next process.

## Expected ledger strings (byte-exact)

`convention-suggester: learned proposal <slug> 6 families <absolute proposal
path>`,
`hook-dsh-doc-suggester: suggest Site 0.87 5 companions
Site/Source/pages/index.astro`.

## Expected count

4 PASS.

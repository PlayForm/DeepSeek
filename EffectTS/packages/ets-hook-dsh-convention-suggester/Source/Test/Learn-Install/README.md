# Learn-Install

The D4 money shot: propose, install, and the doc suggester speaks.

One end-to-end pass across three real built Targets: the convention-suggester's
learner derives a pack for a temporary repo, the proposal is COPIED into the
user layer (`<home>/.dsh/playform/workspaces/<slug>.yml`), and the
doc-suggester - mounted in the same repo - now emits a note naming the
PROPOSAL's companions.

## Scenarios

- I1: the learner proposes (`learned pack 6 families`) and writes
  `<home>/.dsh/playform/proposals/<slug>.yml`; the live pack does not exist
  yet.
- I2: the user copies the proposal to the user layer; the installed file is
  byte-identical to the proposal.
- I3: the doc suggester, resolving the installed user layer, emits
  `family=Site confidence=0.87` with the five DERIVED companions
  (`Documentation`, `Site/Source/Content`, `Site/Source/pages`,
  `Site/Source/Component`, `Site/Source/Library`) and the byte-exact
  `suggest Site 0.87 5 companions Site/Source/pages/index.astro` ledger line.
  The repo deliberately lacks `Site/Source/Library/Content.ts` (the built-in
  pack's target), so naming `Site/Source/Component` proves the installed
  proposal is the pack in force - not the built-in fallback.

## Fixtures

The shared Harness (fake ctx, the real factory, the real built Target) for the
learner, a local fake ctx in the same family shape for the REAL built
doc-suggester, `node:fs` temporary trees, and a temporary `HOME`
(`process.env.HOME`) so the real `~/.dsh` is never read or written. No sleeps:
the whole sequence is synchronous state.

The repo carries `Documentation/INDEX.md` but NO `Documentation/ARCHIVE-STYLE.md`:
the workspace gate therefore never resolves (and never populates the
library's per-root pack memo) before the install, so the doc suggester reads
the installed user layer fresh in the same process. In production the memo
contract applies - an installed pack lands on the next process.

## Expected ledger strings (byte-exact)

`convention-suggester: learned proposal <slug> 6 families <absolute proposal
path>`,
`hook-dsh-doc-suggester: suggest Site 0.87 5 companions
Site/Source/pages/index.astro`.

## Expected count

4 PASS.

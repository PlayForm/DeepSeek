# Learn-Proposal

The RETIRED proposal derivation: the D4 bootstrap no longer derives or writes a pack.

The literal learner is not called any more (the history-driven proposal is the next step), so this
suite keeps only the Apply-level consequence on a repo that used to be the learner's showcase.

## Scenarios

- L1: a temporary repo with the doc graph (`Documentation/INDEX.md`,
  `ARCHIVE-STYLE.md`, `Plans`, `Guides`, `Skill`, `Handoff`), the package
  layout (`package.json`, `README.md`, `SCHEME.md`, `cordis.patch.yml`,
  `Source/Library.ts`, the four `Source/` folders) and the site
  (`Site/Source/{Content,pages,Component,Library}`) produces NO proposal, NO
  live pack and NO repo pack, and the decision comes back unchanged.
- L2: the ledger carries `abstained no-history  0.00` in both forms, with no
  `learned proposal` line and no `suggest` line.

## Fixtures

The shared Harness (fake ctx, the real factory, the real built Target) plus a `node:fs` temporary
repo and a temporary `HOME` (`process.env.HOME`), so the real `~/.dsh` is never read or written.

## Expected ledger strings (byte-exact, `convention-suggester: ` prefix)

`abstained no-history  0.00`.

## Expected count

2 PASS.

# The Build-Verified Rule

> Source: SKILL.md, section 6, bullet 5 (user-mandated 2026-10-08).
> Canonical skill structure: the mandate of 2026-10-20. This file
> carries the full philosophy; SKILL.md only points here.

## The Rule

1. After every file you touch, the relevant arbiter must pass before
   you continue.
2. The arbiter per surface: the site build for the site files; the
   smokes for the packages.
3. Never leave the tree broken at any moment.
4. Fix your break immediately.

## Why: The Full Philosophy

1. **A broken tree is a batch-wide hazard.** Other lanes build and
   test against the same tree; your break becomes their failure, and
   the failure's cause looks like their change. Immediate verification
   keeps every lane's failure its own.
2. **The arbiter is the only honest verdict.** "It should work" is not
   a verdict. The site build and the smokes are mechanical, printed,
   and trusted (see ./references/orchestrator-loop.md - printed totals
   over prose).
3. **The per-file cadence localizes faults.** Verifying after every
   file means a red arbiter points at the last edit. Batch
   verification at the end points at "somewhere in the last twenty
   files".
4. **Fixing immediately is cheaper than remembering.** The context of
   the change is fresh; the fix is one edit away. Deferred breakage
   comes back as archaeology.

## Examples

### Good

- Edit a site file -> run the site build -> it passes -> proceed to
  the next file.
- Edit a package file -> run that package's smokes -> the printed
  totals match the expectation -> proceed.
- The build fails -> fix the file now, re-run, then continue.

### Bad

- "I'll make all six edits, then build once."
- Leaving the tree red while moving to another lane's boundary.
- Interpreting a failed build as "probably unrelated" without
  evidence.

## Exceptions

- None. The cadence is per-file; the only choice is WHICH arbiter
  (per the surface), never whether.

## Failure Modes

- **Batch-mode edits:** many files, one verification; the faults are
  unattributable.
- **A broken-tree handoff:** the lane leaves red at a boundary; the
  next lane inherits a failing arbiter and wastes a run diagnosing it.
- **The wrong arbiter:** the package smokes run for a site change (or
  the reverse); the pass proves nothing about the touched surface.

## Arbiters

- The transcript interleaves edits with arbiter runs - at minimum one
  arbiter run per touched file.
- The final report quotes the arbiter's printed output.
- The tree is green at every lane boundary.

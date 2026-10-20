# Verify the Environment

> Source: SKILL.md, section 6, bullet 2 (user-mandated 2026-10-08), and
> the section 7 recap bullet (the environment discipline at resume).
> Canonical skill structure: the mandate of 2026-10-20. This file
> carries the full philosophy; SKILL.md only points here.

## The Rule

1. Check the tree state BEFORE and DURING the work: git status, the
   recent commits.
2. The user commits MID-SESSION - HEAD moves underneath you.
3. The other lanes' in-flight files show as modifications.
4. Never assume you are the only writer or that the tree is clean.
5. (The recap at resume, 2026-10-09.) The environment discipline
   rebinds in every new session: the user commits mid-session, the
   concurrent lanes edit the same tree, read-before-edit always, and
   the surgical-edit + build-verified rules bind every lane.

## Why: The Full Philosophy

1. **HEAD is a moving target.** The user commits mid-session by
   design; a diff computed against an old HEAD is fiction. Re-check
   before each edit and before each report.
2. **Modifications are other lanes' work in progress.** A dirty file
   is not leftover junk to clean up - it is likely a concurrent
   lane's half-applied change. Treat unexpected modifications as
   owned until proven otherwise (see
   ./references/you-are-never-alone.md).
3. **Assumption is the failure; verification is the discipline.** The
   check is cheap (git status, the recent commits); the cost of a
   wrong assumption is a lost update or a broken build that takes the
   batch down.
4. **Verification is continuous, not one-shot.** "Before AND during":
   the tree changes while you work; a clean start does not certify a
   clean middle.

## Examples

### Good

- Before an edit: git status + the recent commits; the lane notes that
  HEAD moved since its launch and re-bases its understanding of the
  file.
- During the work: before the second of two planned edits, the lane
  re-checks; a new modification appears in the same file -> the lane
  stops and coordinates through its report.
- In the report: the lane states the HEAD it verified against and the
  files it found modified.

### Bad

- "The tree was clean when I started, so it is clean now."
- Reverting a modification because it looked accidental.
- Building a report's diff against a stale HEAD.

## Exceptions

- None. Read-only sessions verify too - they read against HEAD, which
  also moves.

## Failure Modes

- **Lost updates:** the lane edits a stale copy of the file; another
  writer's change is overwritten.
- **False diffs:** reports that claim changes the current HEAD already
  contains, or miss changes that landed.
- **Cleanup damage:** "fixing" another lane's in-flight edits.

## Arbiters

- The transcript shows git status / commit checks before the first
  edit and before the final report.
- Reports state the HEAD they were verified against.
- Unexpected modifications are escalated through the report, never
  silently absorbed.

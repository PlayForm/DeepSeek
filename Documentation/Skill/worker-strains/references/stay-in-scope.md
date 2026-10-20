# Stay in Scope - the Surface Ownership Rule

> Source: SKILL.md, section 6, bullet 3 (user-mandated 2026-10-08).
> Canonical skill structure: the mandate of 2026-10-20. This file
> carries the full philosophy; SKILL.md only points here.

## The Rule

1. The surfaces the other lanes own are off-limits - the state block
   lists them.
2. Read-before-edit ALWAYS on shared files.
3. Coordinate through the report.
4. Never fight over a file region.

## Why: The Full Philosophy

1. **Ownership is the concurrency primitive.** The state block assigns
   surfaces to lanes; the assignment is what makes parallel work
   safe. Crossing an owned surface does not merely risk a conflict -
   it dissolves the guarantee every other lane was given.
2. **Shared files need re-reads, not trust.** A file that two lanes
   touch is read before every edit: the other lane's change may have
   landed since the last read. Read-before-edit is ALWAYS, not "when
   it seems needed".
3. **Conflicts are resolved by communication, not by force.** The
   report is the coordination channel: state the conflict, name the
   region, let the orchestrator sequence the lanes. Two lanes editing
   the same region "to fix it" is how work is lost twice.
4. **Region fights are double losses.** When two lanes contest a
   region, each produces output the other invalidates; the arbiter
   fails for reasons neither spec described.

## Examples

### Good

- A lane needs a function that lives in another lane's owned file ->
  it reads it (reading is allowed), plans around the interface, and
  notes the dependency in its report.
- Two lanes converge on one shared file -> each reads before every
  edit; one defers its region and flags the overlap in its report.
- A lane discovers its task requires editing an owned surface -> it
  reports back for re-scoping instead of proceeding.

### Bad

- "The function is right there, I'll just fix it while I'm in the
  file."
- Editing a shared file from a stale read.
- Two lanes editing the same region simultaneously, each trusting its
  own version.

## Exceptions

- Reading owned surfaces is allowed - read-only access is not an
  ownership violation. Writing requires ownership or an explicit
  re-scoping by the orchestrator.

## Failure Modes

- **Boundary creep:** "one small fix" in another lane's file; the
  owner's next edit conflicts with it.
- **Stale shared edits:** no re-read before the edit; the change lands
  on an outdated region.
- **Silent overlap:** two lanes discover at arbiter time that they
  both changed one region; one run is redone.

## Arbiters

- The state block's surface assignments match the lanes' actual
  writes.
- Every shared-file edit in the transcript is preceded by a read of
  the same file.
- Overlaps are flagged in reports, and the resolution is recorded by
  the orchestrator.

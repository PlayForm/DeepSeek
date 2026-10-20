# Tracking and the Per-Lane Self-Review + Skill-Update Clause

> Source: SKILL.md, "THE FORMALIZED ORCHESTRATION MODEL", point 7 (THE
> TRACKING) and point 8 (THE SELF-REVIEW + SKILL-UPDATE clause per lane).
> Mandate date: 2026-10-20 (canonical restructure).
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

### 1. THE TRACKING

Site/Documentation/TRACKING.md carries:
- EVERY user requirement and EVERY feedback item - each its own line;
- the agent roster (which agents exist, their surfaces, their states);
- the queue (the active pair, the idle seats, the pending order).
The orchestrator updates it (it is the tracking's owner; lanes report, the
orchestrator records).

### 2. THE SELF-REVIEW + SKILL-UPDATE CLAUSE (per lane)

At the end, each lane:
1. reviews its own work for gaps;
2. fixes the gaps it finds;
3. updates the relevant SKILL.md under the project's Documentation/Skill
   ONLY (read-before-edit; the tree exists) - the user's skill-updates
   directive.

## Why: The Full Philosophy

1. **Why every item gets its own line:** a tracking file that merges items
   ("fixed the nav and the buttons") cannot be checked off, cannot be
   audited, and hides partial completion. One line per item makes the
   tracking a checklist the orchestrator and the user can both verify
   against - nothing is lost between "mentioned" and "tracked".
2. **Why the tracking lives in the repo (Site/Documentation/):** it must
   survive sessions and be readable by anyone (the user, the next session,
   the lanes). The orchestrator's memory is not a system of record; the
   committed file is.
3. **Why the roster and queue live in the same file:** the tracking is the
   single place where work items and the agents assigned to them meet.
   Splitting them invites drift - an item marked done whose lane never
   reported, a roster entry with no live lane.
4. **Why self-review is a clause and not a hope:** without a forced
   self-review pass, lanes end at "the task ran" - not "the work is
   complete and consistent". The clause makes the gap-hunt a required
   final step, with the fixing and the record update attached to it.
5. **Why the lane updates the SKILL.md itself:** the lane is the one that
   just learned what the skill got wrong or missed about this exact task;
   capturing that immediately, while the insight is fresh, is how the
   skill stays true. Restricting it to Documentation/Skill ONLY keeps the
   lane from editing the user's other files, and read-before-edit keeps
   the update from clobbering concurrent changes.

## Examples

### Good

- TRACKING.md lines, one per item:
  "R1 - pause cursor color - user feedback 2026-10-10 - lane B - DONE",
  "R2 - homepage buttons duplicated - user feedback - lane C - lane
  investigating (stale artifact suspected)",
  followed by the roster (lanes A-D, states) and the queue order.
- A lane finishing its fix: re-reads its diff, notices it left a debug
  block, removes it, then updates the relevant SKILL.md section under
  Documentation/Skill that described the old behavior.

### Bad

- A tracking line "various UI fixes - in progress" covering five items.
- A lane declaring completion without the self-review pass.
- A lane editing files outside Documentation/Skill "while updating the
  skill" - outside its mandate.
- A lane editing a SKILL.md without reading it first.

## Exceptions

- A lane whose task is pure investigation (no fix) still self-reviews -
  the review covers the report's completeness and the evidence quality.
- If a lane finds a gap it cannot fix (outside its surface or permissions),
  it records the gap in its report instead of fixing; the orchestrator
  routes it (new lane, amendment, or residual).
- If the relevant skill section is ambiguous or contested, the lane
  proposes the update in its report; the orchestrator or user decides -
  the lane does not force a contentious rewrite.

## Failure Modes

- Tracking drift: the file says one state, the queue another - the next
  session trusts the wrong one.
- Merged lines: a partially-done bundle looks done, or done items stay
  marked open.
- Skipped self-review: gaps ship as "done" and return as new feedback
  items - the same work paid for twice.
- Skill updates with stale reads: concurrent edits clobbered because the
  lane skipped read-before-edit.

## Arbiters

- The tracking is audited line-by-line at report time: every user
  requirement/feedback item has a line, a lane, and a state; the roster
  matches the queue record.
- Every lane's completion report must state that the self-review pass ran
  and what it found (including "nothing found" - explicitly).
- Skill updates are checked to be within Documentation/Skill, with a
  read-before-edit, and consistent with the work just done.

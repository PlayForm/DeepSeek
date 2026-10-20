# The Session-Resume Protocol

> Source: SKILL.md, section "The session-resume protocol (user-mandated
> 2026-10-09 - the next session's starting ritual)", steps 1, 2, 4, 5
> (step 3, the routing law, has its own file: routing-law.md); including
> the 2026-10-10 amendment on temporary handoff docs. Mandate date:
> 2026-10-20 (canonical restructure).
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

The next session's starting ritual has four steps in this file (plus the
routing law in routing-law.md):

### 1. READ THE HANDOFF FIRST

Read Documentation/Handoff/BATCH-HANDOFF-*.md - the LATEST dated file is the
current brief: the project state, the idle lanes, the feedback ledger
(addressed + pending), the decisions, the future work. Then read the
per-task files in Documentation/Handoff/Tasks/*.md - each carries the
TEMPORARY CURRENT STATE: the inspected progress, the task spec, the
enhancements. The session picks off from those states - NEVER re-investigate
what the files already state.

### 2. THE QUEUE'S ACTIVATION PROTOCOL

- One lane at a time per activation (the user's rules: max 1-2 agents; the
  ~/.dsh maxActiveSubagents is 1). The two-active regime
  (the-two-active-regime.md) governs how many run concurrently.
- Every activation message carries the STATE BLOCK: the running lanes and
  their current tasks, the pending count, the scope and the off-limits
  surfaces.
- The surgical-edit and build-verified disciplines bind every lane.
- Activate the verify-and-close lanes FIRST (the files marked
  "fix landed + committed - verify") - then the idle ones.

### 3. THE ENVIRONMENT DISCIPLINE

- The user commits MID-SESSION: HEAD moves under you and under the lanes.
- The tree may be mid-edit by concurrent lanes: the read-before-edit rule
  applies always.
- The handoff and the process records are the durable fallbacks (the
  batch-state plugin will automate the live state later).

### 4. THE HANDOFF MAINTENANCE

- At the session's end, the orchestrator REFRESHES the handoff: a new
  date-stamped BATCH-HANDOFF file, the Tasks/ states updated (completed
  lanes marked, new feedback appended) - so the next session resumes from
  fresh states.
- The user's feedback ALWAYS lands in the handoff the same session it
  arrives.
- **2026-10-10 amendment (the temporary-docs decree):** the handoff docs
  are TEMPORARY by the user's decree - erased at the session's close; the
  SKILL.md, the Plans/, and the Reports/ stay as the durable records.
  The maintenance duty still applies WITHIN the session (fresh states for
  mid-session resumes), but the files do not survive the session's close.

## Why: The Full Philosophy

1. **"Never re-investigate what the files already state"** is the resume
   protocol's core economy. A fresh session reading no handoff would spend
   significant effort re-deriving state the previous session already paid
   for and wrote down. The handoff is the previous session's parting gift
   and this session's head start.
2. **Why the activation protocol has a fixed shape:** an activation without
   a state block puts the lane in a batch it cannot see - it may enter
   off-limits surfaces or duplicate running work. Activating
   verify-and-close lanes first drains the queue of near-complete work
   before starting new work - fastest path to fewer active threads.
3. **Why the environment discipline exists:** the environment is dynamic
   (the user commits mid-session - HEAD moves; the lanes edit concurrently -
   the tree shifts). Every assumption a session holds about the tree must
   be re-checked at the moment of action (read-before-edit), and the
   durable records are the fallback when the live state surprises you.
4. **Why the handoff is refreshed even though it is temporary:** within the
   session's life, the handoff is the resume mechanism for interruptions
   (connectivity loss, session switch). The 2026-10-10 decree changes what
   happens at the session's close (erase), not the within-session duty
   (keep it fresh). The durable knowledge moves to SKILL.md, Plans/, and
   Reports/ - the lessons, not the transient state.

## Examples

### Good

- Session starts: read the latest BATCH-HANDOFF (e.g. BATCH-HANDOFF-2026-10-09.md),
  note two idle lanes and one pending feedback item, then read the Tasks/
  files for those lanes, and activate from the recorded states.
- New feedback arrives mid-session: it is appended to the handoff and the
  affected Tasks/ file the SAME session.
- Session close: durable lessons -> SKILL.md/Plans//Reports/; then erase
  Documentation/Handoff/ per the decree.

### Bad

- A new session skipping the handoff and asking the user "so where were
  we?" - the answer was in the files.
- Activating an idle lane with just "ACTIVATE" and no state block.
- Keeping the handoff files forever after the 2026-10-10 decree - the user
  ordered them temporary.

## Exceptions

- If the handoff is missing (first session, or the close-erase already ran),
  the session reconstructs state from the durable records (Plans/, Reports/,
  SKILL.md) and states what it could not reconstruct.
- A crash mid-session before the handoff refresh: the next session
  reconstructs from the last refresh plus the process records, and marks
  the gap explicitly rather than guessing.

## Failure Modes

- Re-investigation waste: the session burns effort re-deriving recorded
  state, and may "discover" a state that contradicts the record because it
  read a different moment in time.
- Activating verify-and-close lanes last: new work starts while verified
  work sits ready to close - the queue drains slowly.
- Handoff not refreshed at close-time within a session: the next resume
  starts from stale states and misassigns work.

## Arbiters

- The resume path is checkable: the latest BATCH-HANDOFF file's date and
  the Tasks/ files read before any activation.
- Every activation message must contain the state block; its absence is a
  violation.
- Same-session feedback: every user feedback item must appear in the
  handoff (or the process records) the session it arrived.
- The close ritual: handoff docs erased per the 2026-10-10 decree;
  durable records (SKILL.md, Plans/, Reports/) intact.

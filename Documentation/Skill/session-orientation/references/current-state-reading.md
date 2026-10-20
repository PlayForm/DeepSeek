# The Current State (README + Plans + Guides)

> Source: SKILL.md, section 0, item 2 (the current state).
> Converted to the canonical skill structure on 2026-10-20.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

After the repo's own skills, read the current state in this order:

1. The root `README.md` - the state of the family.
2. `Documentation/Plans/` - the active plan documents; each is dated and
   named for its subject. These are the state of the work.
3. `Documentation/Guides/` - the state of the registry and the governance
   trio's deep documentation.

All three are read; no subset substitutes for the whole. Reading them is part
of the loading order, before the session acts in the repository.

## Why: The Full Philosophy

1. **State is the antidote to stale context.** A fresh session's only
   alternative to reading state is assuming state - and assumptions come
   from the last thing the session (or its predecessor) was told, which may
   be days old or simply wrong. The repository's state documents are the
   only authoritative, current description of what exists and what is in
   progress.
2. **The three sources answer three different questions.** The README says
   what the family IS (packages, structure, how to build). The Plans say
   what is being DONE right now (dated, subject-named documents - the dating
   is deliberate so a session can tell an active plan from a finished one).
   The Guides say how the registry and the governance trio work in depth.
   A session that reads only one source knows one layer of reality and
   guesses the rest.
3. **Plans being dated and subject-named is part of the protocol.** The
   naming convention (`Documentation/Plans/` documents carry their date and
   subject in the name) means a session can triage at a glance: which plan
   is current, which is historical. Reading Plans without noticing dates
   risks executing a finished plan as if it were active.
4. **The README-first order mirrors the abstraction ladder.** Family overview
   -> active work -> deep governance documentation. Starting deep (Guides)
   without the README gives detail with no frame; starting with Plans without
   the README gives tasks with no system around them.
5. **This is cheap relative to the cost of skipping it.** Three reads at
   session start prevent hours of rediscovery, duplicated work, and
   contradictions with active plans later in the session.

## Examples

### Good

- A session's second orientation step is: read the root `README.md`, list
  `Documentation/Plans/`, read the currently active (dated, current) plan
  documents, then read the relevant `Documentation/Guides/` entries.
- A session that finds two plans touching the same subject uses their dates
  to determine which is current, and reads the newer one as governing.

### Bad

- A session skips `Documentation/Guides/` because "guides are reference
  material" - then misuses the registry because the deep documentation
  described a precondition it never read.
- A session executes steps from an old plan document without checking its
  date, duplicating work that was already completed under a newer plan.
- A session relies on a verbal handoff ("the task is X") instead of reading
  the current state documents - the handoff becomes the session's model of
  reality and is never verified.

## Exceptions

- Depth triage is allowed for Guides: a session may read the Guides entries
  relevant to its task fully and skim the rest, PROVIDED the README and the
  active Plans are read in full. The state of the work (Plans) may not be
  skimmed.
- No other exceptions: even a narrowly-scoped session (one bug fix) reads
  the README and active Plans, because scope decided without state is a
  guess.

## Failure Modes

- Stale-plan execution: working from an outdated plan because its date was
  never checked; the work contradicts the current plan and must be redone.
- Single-source orientation: knowing the family (README) but not the work
  (Plans), so the session rebuilds something a plan already finished.
- Guide-less registry work: touching the registry or the governance trio
  without their deep documentation, violating preconditions only documented
  there.
- State-by-inference: reconstructing "current state" from file listings and
  git status instead of reading the documents written to carry it.

## Arbiters

- The loading order itself (see ./references/orientation-order.md):
  step 2 is defined as all three sources; a transcript that shows the
  session acted after reading only one source has skipped the step.
- Plan dates: every plan document's filename carries its date; any claim
  about "the active plan" must be consistent with the newest dated plan on
  the subject.
- The recitable summary (see ./references/recitable-summary.md): it
  names "README + Plans + Guides" explicitly; a session that cannot say what
  each source is the state of has not completed this step.

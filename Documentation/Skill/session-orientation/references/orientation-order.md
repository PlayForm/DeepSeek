# The Orientation Order (Load Top to Bottom)

> Source: SKILL.md, section 0 ("The loading order"), items 1-3, and section 7
> (the recitable summary). User-mandated first-load protocol; converted to the
> canonical skill structure on 2026-10-20.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

A fresh session knows NOTHING except what it loads. The loading order is
fixed and followed top to bottom, before anything else:

1. The repo's OWN skills. If the working repository has
   `Documentation/Skill/*.md`, read every `SKILL.md` there BEFORE any other
   orientation step. Those copies are the SPECIALIZED TRUTH for this project
   (each carries a header note marking it as the specialized working copy);
   the global skills at `~/.dsh/skills/<name>/SKILL.md` are the FALLBACK for
   sessions running outside a repo that carries its own skills. Where the two
   disagree, the repo copy wins; if you must correct a rule, sync the fix to
   BOTH copies.
2. The current state. Read the root `README.md`, then `Documentation/Plans/`
   (the active plan documents - each is dated and named for its subject) and
   `Documentation/Guides/`. The README is the state of the family; the Plans
   are the state of the work; the Guides are the state of the registry and
   the governance trio's deep documentation.
3. The routing law and the git law - load them now; they are non-negotiable.

The protocol is written to be self-contained: no prior conversation is
required to orient correctly. A session that has not completed this order
does not act in the repository.

## Why: The Full Philosophy

1. **A fresh session has zero inherited context.** The only thing a new
   session knows is what it loads in its first steps. If the loading order
   is left to improvisation, the session invents its own orientation - and
   invents it inconsistently. A fixed order makes orientation reproducible:
   two fresh sessions in the same repository load the same facts in the same
   order and reach the same working model.
2. **Repo skills come before everything** because the repository's own
   `Documentation/Skill/` copies are the specialized truth for THIS project.
   Global skills describe the family in general; the repo copies carry the
   project-specific adjustments (paths, lane laws, task state). Loading a
   global skill first, then reading the repo copy, risks the session having
   already acted on the general version of a rule the repo version specializes.
3. **State comes before action.** README + Plans + Guides tell the session
   what IS, before the session decides what to do. A session that acts before
   reading state re-derives stale conclusions, duplicates finished work, or
   contradicts an active plan.
4. **The laws load with the orientation, not after it.** The routing law and
   the git law gate every action the session could take - including the
   delegations and file writes it might perform while still orienting. That
   is why they are item 3 of the loading order and not a later section to
   "get to eventually": by the time the session makes its first delegation or
   write, the laws must already be loaded. They are marked non-negotiable
   for exactly this reason.
5. **Self-containment is a property to protect.** The protocol must work in
   a session with no prior conversation - that is the common case (every
   crash, every resume, every new task starts fresh). Anything the protocol
   depends on must be loadable from the repository and the skill set alone.

## Examples

### Good

- A fresh session's first tool calls are reads of the repo's
  `Documentation/Skill/*/SKILL.md` files, then the root `README.md`, then the
  Plans and Guides, and only then any acting (delegating, writing, building).
- A session running OUTSIDE a repo that carries its own skills falls back to
  `~/.dsh/skills/<name>/SKILL.md` for every skill - that is what the fallback
  is for.
- A session that discovers a rule it must correct fixes it in the repo copy
  AND the global copy, so the two stay in sync.

### Bad

- A fresh session starts by delegating an exploration subagent before loading
  the routing law - the delegation then has no enforced route.
- A session reads the root README and declares itself oriented, skipping the
  Plans and Guides - it then works against a stale or partial picture of the
  work.
- A session reads a global skill, applies it, and never checks whether the
  repository carries a specialized copy of the same skill.

## Exceptions

- None documented. There is no ordering shortcut: even a session that "already
  knows the task" (for example from a handoff message) still performs the full
  loading order, because the handoff may be stale and the repository state is
  the arbiter, not the message.

## Failure Modes

- Acting before loading: the session mutates files, delegates, or builds
  before completing the order. Every downstream action inherits the
  uninformed model of the repository.
- Partial orientation: reading the README but not Plans/Guides, or reading
  the repo skills but not the global fallback when the repo has none. Each
  partial load silently drops the facts that lived only in the skipped step.
- Loading the laws last: the routing law and git law exist to gate the
  session's first actions. Loading them after the first delegation means the
  first delegation was unpoliced.
- Trusting a summary over the state: reciting the one-paragraph summary from
  memory of a previous session instead of re-reading the current state. The
  summary orients; the state decides.

## Arbiters

- The recitable summary (see ./references/recitable-summary.md): a
  session can recite the one-paragraph summary accurately only if it
  completed the loading order.
- Session transcripts: the earliest events of a fresh session should be
  reads of the repo's `Documentation/Skill/` copies and the state documents,
  before any write, delegation, or build command.
- The two law references (see ./references/routing-law.md and
  see ./references/git-law.md) are checked whenever a delegation or a git
  operation is observed: an unpoliced delegation or a mutating git command is
  evidence the order was not followed.

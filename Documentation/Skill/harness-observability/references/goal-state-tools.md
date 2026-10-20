# The Persisted Goal State (get_goal / update_goal)

> Source: SKILL.md, section 3, rule 4. Documented from the live harness, 2026-10-08.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

A long-running objective survives turns and crashes through the goal record,
accessed by two tools:

- **create_goal** - persist a goal that keeps the session working across
  automatic continuation rounds. Use it for long-running objectives even
  when the user did not say "goal"; not for single-turn work.
- **get_goal** - read the current goal, including the id and the revision
  that update_goal requires.
- **update_goal** - change the goal. Every action requires the EXACT goal id
  and revision from the last get_goal (optimistic concurrency). The actions:
  - **edit** - replace the objective and/or the max_goal_rounds cap;
  - **pause** - suspend the goal's automatic continuation;
  - **resume** - re-arm it;
  - **complete** - mark it achieved (only when the objective is ACTUALLY
    achieved);
  - **blocked** - mark it stuck; requires blocked_reason, the concrete
    condition that persisted across rounds and blocks progress, and is
    rejected before the configured minimum round count.

The re-arm law: after a session resume or fork, an active goal is disarmed.
When the user asks to continue or resume - in any wording or language - the
answer is update_goal action: resume.

The blocked bar: blocked only after the same blocking condition persisted
for at least 3 consecutive goal rounds, with that concrete condition in
blocked_reason. Difficulty, uncertainty, or useful remaining work is NOT
blocked.

## Why: The Full Philosophy

1. **Goals exist because sessions outlive turns.** A long objective cannot
   be carried in one reply; the goal record lets automatic continuation
   rounds pick the work back up. Creating one for single-turn work pollutes
   the state and adds continuation machinery nobody needs.
2. **The revision is the concurrency lock.** Two writers (the agent in two
   rounds, or a resumed session and a stale one) must not silently
   clobber each other; update_goal rejects a stale revision, forcing a fresh
   get_goal before the next write. Guessing the revision is not an
   optimization, it is a rejected call.
3. **complete is a factual claim, not a mood.** Marking a goal complete
   stops the continuation machinery. Claiming it with the objective unmet
   ends the work prematurely with no mechanism left to resume it.
4. **blocked is a high bar on purpose.** Three consecutive rounds of the
   SAME condition is the evidence bar; the reason must be concrete (a
   missing credential, a denied permission, a missing file), not an emotion
   ("too hard"). The bar exists because "blocked" is how work dies quietly.
5. **Resume is the universal continue.** The disarmed-after-resume rule
   means a live goal does nothing until re-armed; whenever the human says
   "continue", "go on", "continue" - whatever the language - the mechanism
   is the same update_goal call.

## Examples

### Good

- The user asks for a multi-session migration: create_goal with a concrete
  objective, then get_goal before every update to fetch the current id and
  revision.
- After a session resume with an active goal and the user saying
  "continue": get_goal, then update_goal action: resume with that id and
  revision.

### Bad

- update_goal with a remembered revision - rejected; the state may have
  moved since.
- action: blocked with "the task is difficult" - not a condition, and not
  three rounds of persistence.
- action: complete while a deliverable is still unwritten.

## Exceptions

- The blocked action is rejected before the configured minimum round count -
  early rounds cannot declare blocking even with a real reason.
- Pause exists precisely for goals that should stop advancing without being
  abandoned or falsified as complete/blocked.

## Failure Modes

- Stale-revision writes: rejected; fetch fresh state and retry.
- Premature complete: the continuation machinery stops with the work
  unfinished.
- Premature blocked: the goal dies on a condition that one more round would
  have broken.
- Forgetting to resume after a session resume: the goal sits disarmed while
  the user believes work is continuing.

## Arbiters

- get_goal is the arbiter of the current goal state: id, revision, phase,
  and rounds come from it, never from memory.
- The revision check is the arbiter of write validity; the blocked bar
  (3 consecutive rounds, concrete condition) is the arbiter of whether
  blocking may be declared.

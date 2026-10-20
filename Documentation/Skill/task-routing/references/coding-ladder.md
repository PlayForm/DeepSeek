# The Coding Ladder (Attempts + Failover)

> Source: SKILL.md, section 4 "Coding protocol", the attempt ladder
> (steps 1-4). The failure signals and spec-writing rules that feed this
> ladder have their own references.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

Attempt ladder, in order, per coding task:

1. **Attempt 1**: `glm-5.3-flash` at `low` (trivial) or `high` (routine).
2. **Attempt 2** (only if attempt 1 fails per the failure signals below):
   `glm-5.3-flash` at `high`.
3. **Escalation** (only if attempt 2 fails): the PARENT re-delegates the
   same task to `@cf/deepseek-ai/deepseek-v4-flash-0731` at `max`,
   passing the failed run's artifacts (workspace files, build logs) and
   a failure summary as context. Escalate at most once per task.
4. If the escalated run also fails: STOP. Report BOTH failure summaries
   to the user. Do not loop.

## Why: The Full Philosophy

1. **The ladder buys quality with attempts, not with over-provisioning.**
   The first attempt is priced for the task tier (trivial -> `low`,
   routine -> `high`). Failing cheap and retrying one notch up is
   cheaper on average than starting every coding task at the ceiling.
2. **Why the PARENT escalates, not the child.** The escalation needs
   things the child cannot assemble: the failed run's artifacts, an
   honest failure summary, and a fresh delegation with clean context.
   The parent owns the ladder; the child only owns the ESCALATION marker
   that signals it (see ./references/failure-signals.md).
3. **Why the escalation carries artifacts.** Re-delegating the same task
   with the same bare prompt would reproduce the same failure. The
   escalated run gets the failed run's workspace files, build logs, and
   a failure summary, so it starts from the failure state instead of
   before it.
4. **Why "at most once".** The ladder is three attempts total (low/high
   attempt, high attempt, deepseek `max` escalation). A fourth attempt
   has no evidence behind it and hides a problem that belongs to the
   user: either the spec is contradictory or the task is out of reach.
5. **Why step 4 is STOP.** Two independent failure summaries are
   diagnostic information for the user, not fuel for another loop.
   Looping past the ladder burns tokens while corrupting the signal
   (later attempts add retries-on-retries, not new information).

## Examples

### Good

- Trivial one-file fix fails attempt 1 -> attempt 2 at `high` ->
  succeeds. Two attempts, no escalation needed.
- Routine feature fails twice -> parent escalates once to
  deepseek-v4-flash `max`, passing the workspace files, the build log,
  and "attempt 2 failed: tests 3 and 7 fail, module import cycle" ->
  succeeds.
- Escalated run also fails -> parent stops and reports both failure
  summaries to the user.

### Bad

- Starting a trivial task at `max` "to avoid the ladder" - over-
  provisioning; the ladder exists for exactly this.
- Letting a failed child re-delegate its own escalation - the parent
  must own it.
- Escalating without the failed artifacts (bare prompt re-run) -
  reproduces the failure.
- A second escalation after the first one failed, or continuing to loop
  instead of stopping and reporting.

## Exceptions

- None to the ladder order itself. The user's override (non-negotiable
  3) can dictate model/effort for a task, and an explicit user request
  for exhaustive verification at `max` is a routing-table matter (see
  ./references/routing-table.md), not a ladder escalation.
- Escalation is also triggered when the parent's own verification fails
  even if the child did not mark ESCALATION (see
  ./references/failure-signals.md).

## Failure Modes

- **Skipping attempt 2**: jumping straight from a failed `low` attempt
  to deepseek `max`. Cost: pays the escalation premium for failures a
  `high` retry usually fixes.
- **Escalating without evidence**: re-delegating because a run "seemed
  off" with no failure signal. Cost: replaces a possibly-fine result
  and burns the one escalation.
- **Looping past STOP**: attempt 4, 5, ... Cost: runaway spend and the
  user never learns the task needs a better spec.
- **Losing the failure summaries**: escalating or stopping without
  writing down why the attempts failed. Cost: the user cannot diagnose;
  the next session repeats the same failure.

## Arbiters

- Audit trail: each attempt is a session whose log shows model, effort,
  and outcome (fields and paths in ./references/adjudication-
  protocol.md). A task with more than three attempts is a ladder
  violation.
- The failure signals (ESCALATION marker, silent give-up, failed parent
  verification) are the objective triggers; see
  ./references/failure-signals.md for their exact definitions.

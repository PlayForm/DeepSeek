# The Guardian Plugin: Programmatic Enforcement of the Discipline (Future)

> Source: SKILL.md, Section 1b (Future - programmatic enforcement; note only, implementation deferred).
> User-mandated 2026-10-04. This file carries the full philosophy; SKILL.md only points here.

## The Mandate

The discipline above must NOT depend on the model's understanding or
memory of this skill. It must become MODEL-INDEPENDENT, enforced by the
plugin system itself, so that ANY future agent - no matter the model -
is steered away from terminal file-edit commands.

## Why Model-Independence Is the Core Requirement

1. **Skills are opt-in; plugins are structural.** A skill loads when an
   agent (or its prompt) asks for it. A model that never loads the
   skill, or loads it and forgets it mid-task, faces no constraint. A
   plugin hook sits in the execution path of every bash call in every
   session regardless of what the model knows.

2. **Memory decays within a task.** Even a compliant model that read
   SKILL.md at turn 1 may, by turn 40 under pressure, reach for the
   quick sed. The prompt-based binding
   (./references/subagents-bound-to-discipline.md) helps but is
   still text competing with the model's habits. Enforcement in the
   waterfall does not compete - it decides.

3. **The family's own precedent.** The harness already routes plugin
   reactions through structured decision points. The guardian is not a
   new kind of machinery; it is a new resident of an existing one: the
   sanctioned allow/deny waterfall of the bash tool's pre-execute hook.

4. **Self-teaching from feedback.** A surfaced error teaches the model
   the constraint in context, at the moment of violation, better than
   any upfront prose. The constraint becomes self-reinforcing: deny ->
   the model reads the reason -> the model infers the rule -> the rule
   holds for the rest of the session without the skill ever being
   loaded.

## The Four Parts of the Note

The note has four sub-parts, each with its own reference:

1. The guardian hook and what it detects -
   see ./references/guardian-hook-detection.md
2. Mode A - surface the error (deny with a structured reason) -
   see ./references/guardian-mode-a-surface-error.md
3. Mode B - the silent rewrite flag (the ideal, later) -
   see ./references/guardian-mode-b-silent-rewrite.md
4. Where the note lives (this skill + plugin-development) -
   see ./references/guardian-placement-home.md

## Status

This is a NOTE ONLY: the implementation is deferred (user-mandated
2026-10-04). Nothing in the current plugin family implements the
guardian yet. The prerequisite base is the governor/pinner/cargo family
and the factory. The note lives here so the design intent survives the
gap between mandate and implementation.

## Failure Modes the Guardian Exists to Close

- A capable model that never loads this skill using sed routinely.
- A subagent whose prompt lost the discipline block improvising a bulk
  rewrite.
- The discipline surviving model swaps: today's model follows prose;
  tomorrow's model may not, and nothing structural would stop it.

## Arbiters

- Until implemented: none beyond the existing session-log review.
- After implementation: the guardian's own ledger plus the pre-execute
  decision records become the arbiter (denied attempts are logged with
  the reason).

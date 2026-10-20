# Subagents Are Bound to the Same Discipline

> Source: SKILL.md, Section 1 (Tool discipline), rule 5.
> User-mandated 2026-10-03. This file carries the full philosophy; SKILL.md only points here.

## The Rule

The discipline binds every subagent, not only the orchestrator. Prompts
for coder agents must explicitly forbid BOTH:

1. terminal-based content EDITS (`sed -i`, `awk`, `perl -pi`, Python
   in-place rewrites, heredoc file surgery), and
2. terminal-based content READS (`cat`, `head`, `tail`, `sed -n`,
   content `grep`).

Deletions via `rm` are permitted (see
./references/deletion-via-rm-allowed.md).

## Why "Explicitly" Is Part of the Rule

1. **Subagents do not inherit this skill automatically.** A delegated
   agent starts with a fresh context. It sees its prompt, not the
   orchestrator's skill library. Unless the discipline is written into
   the prompt, the subagent's default behavior is whatever its base
   training suggests - which includes terminal one-liners.

2. **A positive rule survives; an omitted half fails.** The classic
   failure: the orchestrator writes "don't use sed" and the subagent,
   forbidden to EDIT via terminal, cheerfully `cat`s the file instead to
   "understand" it before editing - violating the read-side. Both halves
   must be stated. The deletion carve-out must also be stated, or the
   subagent will avoid `rm` and invent worse workarounds.

3. **The delegation is the liability boundary.** If a subagent corrupts
   files via a scripted bulk pass, the corruption happened outside the
   orchestrator's direct control, the session log of the parent shows
   only the delegation, and the subagent's own log may be discarded. The
   prompt is the only place the constraint can live for the subagent.

## The Verbatim Block (what a coder prompt must contain)

Every delegation prompt to an agent that touches files includes, in
substance:

```
DISCIPLINE (hard rules):
- File content ONLY through the read/write/edit tool API. NEVER edit
  file content through the terminal: no sed -i, no awk, no perl -pi,
  no python in-place rewrites, no heredoc file surgery.
- NEVER read file content through the terminal: no cat, no head/tail,
  no sed -n, no grep of file contents. Use the read tool, the grep
  tool, and the glob tool.
- Whole-file deletion via rm is allowed - verify the resolved absolute
  path first.
- Every edit: read the file first, copy the exact bytes (tabs vs
  spaces), retry with the edit tool. Never fall back to the terminal.
- Write ASCII + tabs; never write NUL/control bytes; after any bulk
  transformation, run the byte-level scan before reporting done.
- Git: checks only, never mutate (if the work is inside a repo).
- Verify your own changes; report precisely what you changed.
```

The exact wording may flex; the COVERAGE may not. Every rule above maps
to a rule in this skill, and the subagent is as bound as the parent.

## The Incident Context

The rule was written after observed drift: an orchestrator held the
discipline itself but its subagents, unbound in their prompts, ran
terminal-based rewrites. The parent's log looked clean (no terminal
edits) while the child's work violated the skill. A discipline that
stops at the delegation boundary is not a discipline - it is a
suggestion applied to whoever happens to read the skill file.

## Failure Modes

- The prompt says "use the tools" without naming the forbidden terminal
  commands - the subagent does not generalize.
- The prompt forbids edits but not reads - the read-side violation
  sneaks in.
- The prompt omits the `rm` carve-out - the subagent avoids deletion or
  improvises around it.
- The orchestrator assumes "the skill will load" in the subagent -
  skills load on demand and may not load at all mid-task.

## Arbiters

- Prompt review: every delegation that can touch files contains the
  discipline block with both halves (edits + reads) and the `rm`
  carve-out.
- Subagent log review: the same checks as the parent - no terminal
  content edits, no terminal content reads, tool-layer write events for
  every change.

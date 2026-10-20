# The Tool Execution Pipeline and the Selection Rule

> Source: SKILL.md, section 7, pipeline bullets. Sources:
> subsystems/tools.md:182, 400-430; tool-execution-pipeline.md:6, 63;
> extension-cookbook.md:33; cookbook/adding-a-tool.md:67-91.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

Pipeline order (subsystems/tools.md:182; tool-execution-pipeline.md:6,63):

1. `tools/pre-execute` (allow/deny/ask)
2. `ctx.tools.guard()` (monotonic)
3. `tools/execute` (around-dispatch)
4. `projectContent`
5. `tools/post-execute` (replace content OR value, never both)
6. `finalizeContent`
7. `tools/result` (immutable observation)

Decisions: `PreToolDecision` / `PostToolDecision` (tools.md:400-430).

Selection rule (extension-cookbook.md:33): guard for monotonic invariants;
`tools/execute` to wrap dispatch lifetime; `tools/post-execute` for result
transformation; `tools/result` for contained observation.

Presenters are PURE (live AND replay: no I/O, no session state, no
clock/random) (adding-a-tool.md:67-91).

## Why: The Full Philosophy

1. The pipeline is a fixed order of concerns: gatekeeping first (pre-execute
   decisions), invariants next (guard, which can only tighten - monotonic),
   then the actual dispatch wrapped by `tools/execute`, then content
   projection, then result shaping (post-execute), then a final
   observation-only station (result). Knowing the order tells you WHERE a
   behavior belongs, and the wrong place is usually a silent no-op or a
   broken invariant.
2. The selection rule is the design arbiter: each hook has exactly one job,
   and choosing by job (not by convenience) keeps policies composable.
   `tools/result` is deliberately immutable - it observes and records, it
   does not change outcomes.
3. `post-execute` replaces either the content or the value, never both, so
   downstream consumers always know which layer they are reading - mixing
   both replacements makes the canonical value and the rendered content
   inconsistent.
4. Presenter purity is what makes replay trustworthy: a render that reads
   the clock, randomness, session state, or the filesystem produces
   different output in replay than live, which corrupts every debugging
   session that depends on replay fidelity.

## Examples

### Good

- A guard that raises the strictness level (monotonic tighten).
- A `tools/execute` listener that measures dispatch duration around the
  tool call.
- A `tools/post-execute` listener that replaces the rendered content with a
  summarized form.
- A `tools/result` listener that records metrics to the logger.

### Bad

- Trying to deny a tool call in `tools/result` - it is immutable
  observation; deny belongs in `tools/pre-execute`.
- A presenter that calls `Date.now()` or reads session state - replay
  diverges from live.

## Exceptions

- `tools/post-execute`'s dual capability is the only sanctioned result
  transformation point; still restricted to content OR value, not both.

## Failure Modes

- Policy in the wrong station: a post-execute listener attempting to block
  execution (too late - the tool already ran), or a guard trying to
  transform results (guard is monotonic-only).
- Replacing both content and value in post-execute: inconsistent tool
  output for the model.
- Impure presenters: live/replay mismatch, non-reproducible bug reports.

## Arbiters

- Review against the selection rule (extension-cookbook.md:33) - each
  listener's station must match its job (checklist item 10, see
  ./references/checklist.md).
- Replay test: render twice (live and replay paths) and compare bytes.
- Pipeline trace: the seven stations appear in order in
  tool-execution-pipeline.md; any behavior that requires a different order
  is a design error, not a hook-choice problem.

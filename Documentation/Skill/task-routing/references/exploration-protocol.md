# The Exploration Protocol (Low Is ALWAYS the Answer)

> Source: SKILL.md, section 3 "Exploration protocol". Includes the
> rationale, the single re-run exception, and the "archaeology" case.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

- Every exploration task (repo surveys, research, read-only analysis)
  runs on `@cf/zai-org/glm-5.3-flash` at `low`. No exceptions based on
  "importance" or "stakes" - see the adjudication protocol
  (./references/adjudication-protocol.md) for why that is safe.
- Rationale: correctness across efforts is identical (benchmarks); `low`
  occasionally hallucinates minor details (measured: 1-2 per report),
  and downstream validation is deterministic and FREE (shell checks), so
  later stages correct mistakes without LLM re-review tokens.
  `high`/`max` do not reduce the hallucination rate (they reduce nothing
  measurable) and cost 1.5-6x.
- Exception (the ONLY one): if exploration feeds a coding task and comes
  back unusably thin (missing the facts the coding task needs), ONE
  re-run at `high` is allowed. Never `max`.
- If the user explicitly asks for "archaeology" (find everything incl.
  history, remnants, provenance): `max` is permitted - it is the only
  effort that consistently catches errors in other reports.

## Why: The Full Philosophy

1. **The economics are inverted from intuition.** Exploration output is
   not the deliverable; it is the input to something else. Spending
   premium effort on an intermediate artifact buys nothing measurable
   (correctness is flat across efforts) and costs 1.5-6x.
2. **The hallucination asymmetry is the key fact.** `low` produces 1-2
   minor hallucinated details per report. That sounds like a reason to
   pay more effort - until you check what more effort buys: nothing.
   `high` and `max` hallucinate at the same measured rate. The errors
   are not prevented by paying, so they must be caught downstream.
3. **Downstream validation is deterministic and free.** A shell check
   (`test -e`, a count, a build) costs zero LLM tokens and catches
   hallucinated claims deterministically. This pairing - cheap explorer
   + free verifier - is the whole design; the adjudication protocol
   (docs-over-disk rule, spot checks) is its implementation, and it is
   mandatory, not optional (see its reference).
4. **Why the exception is so narrow.** The single re-run at `high`
   covers the only failure mode effort CAN fix: an unusably thin report
   missing the facts a dependent coding task needs. It is capped at one
   re-run and never `max`, because beyond thinness, more effort does not
   help - and `max` exploration measured 5.8x `low` for identical
   correctness. If a second `high` run is still thin, the problem is the
   prompt, not the effort.
5. **Why archaeology is special.** When the user explicitly asks to find
   EVERYTHING - including history, remnants, provenance - the task's own
   success criterion is "caught what other efforts missed". The
   benchmarks showed `max` is the only effort that consistently catches
   errors in other reports, so here the premium effort has a measured,
   user-mandated purpose.

## Examples

### Good

- "List all public entry points of this package" -> glm-5.3-flash `low`,
  then the parent spot-checks 2-3 claims with shell commands.
- Survey feeds a coding task and omits the module boundaries the coder
  needs -> ONE re-run at `high` with a sharper prompt.
- User: "dig through the whole history, find every leftover trace of the
  old API" -> `max` is permitted (explicit archaeology request).

### Bad

- "This survey informs a security fix, so I'll use `max`" - stakes do
  not move exploration; the free verification does the safety work.
- Re-running a thin survey at `max` - the exception allows `high` only,
  one time.
- Skipping verification because "the explorer was careful" - the
  protocol makes verification mandatory regardless of effort.
- Calling something archaeology without the user having asked for
  exhaustive history/remnant hunting - self-declared archaeology is not
  the exception.

## Exceptions

- The single `high` re-run for unusably thin exploration that feeds a
  coding task (never `max`, at most one re-run).
- User-explicit "archaeology" requests may use `max`.
- User override (non-negotiable 3) applies as anywhere else.
- Note the boundary: "importance" and "stakes" are NOT exceptions -
  they are the most common attempted evasion of this rule.

## Failure Modes

- **Premium-effort drift**: escalating exploration effort because the
  repo "looks complex". Cost: 1.5-6x spend with no measurable gain.
- **Unverified `low` output**: trusting the report without the
  mandatory adjudication. Cost: 1-2 hallucinated details per report get
  baked into downstream decisions - this is how the rule fails in
  practice, and it is a verification failure, not a routing one.
- **Exception inflation**: repeated `high` re-runs because each report
  is "a bit thin". Cost: the cap exists because thinness usually means
  a bad prompt; re-running without fixing the prompt repeats the failure.
- **Fake archaeology**: using the archaeology clause to justify `max`
  on ordinary surveys. Cost: 5.8x spend for identical correctness.

## Arbiters

- Session-log audit: every exploration delegation must show
  `glm-5.3-flash` + `low` (or a documented exception) in its session
  log (fields and paths in ./references/adjudication-protocol.md).
- The adjudication protocol itself is the safety arbiter: docs-over-disk
  verification and 2-3 spot checks per report are mandatory; an
  unverified `low` report is a protocol violation.

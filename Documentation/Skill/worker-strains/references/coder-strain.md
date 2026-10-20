# The CODER Strain

> Source: SKILL.md, section 1 (the strains table, CODER row) and
> section 5 (the cultivation sites, CODER bullet). Canonical skill
> structure: the mandate of 2026-10-20.
> This file carries the full philosophy; SKILL.md only points here.

## The Strain (the table row, exact)

| Field | Value |
|---|---|
| Strain | CODER |
| What it is for | implementation, refactors, multi-file features, integration |
| Model (exact) | @cf/zai-org/glm-5.3-flash |
| Effort | high (routine) / low (trivial, single-file, fully specified) |

## The Attempts Ladder (exact)

1. First attempt: GLM high.
2. Second attempt: GLM high again - carrying the first failure's
   artifacts.
3. Escalation: escalate ONCE to DeepSeek max, carrying the failed
   run's artifacts + a failure summary.
4. If the escalated run also fails: STOP and report BOTH summaries to
   the user. Never loop.
5. The subagent ends its failures with the marker
   `ESCALATION: <concrete reason>`.

## Why: The Full Philosophy

1. **Effort matches risk, not ambition.** Routine implementation gets
   `high`; a trivial, single-file, fully specified change gets `low` -
   all three conditions must hold for `low`. When in doubt, default to
   `high`; the ladder is the safety net, not the effort selector.
2. **The ladder is evidence-carrying.** Each rung hands the next rung
   its artifacts and a failure summary, so the retry corrects the
   specific failure instead of rolling the dice again. A bare retry -
   same route, same prompt, no new information - is the most expensive
   failure mode.
3. **Escalation is single-shot by design.** One DeepSeek max run is
   the designed ceiling. DeepSeek max is the most expensive lane; if
   it also fails, the failure is no longer a model-capability problem
   but a problem with the spec, the scope, or the task itself - which
   only the user (or a re-formalized spec) can resolve. Hence STOP and
   both summaries.
4. **The ESCALATION marker makes failure machine-readable.** The
   subagent that hits its own wall ends with
   `ESCALATION: <concrete reason>` so the orchestrator can route the
   next rung (retry, escalate, or stop) without re-reading the whole
   transcript. A vague "this is hard" is not a marker.
5. **Never loop.** The ladder has a floor, not a cycle. After the
   escalated run fails, more attempts are not persistence - they are
   noise generation at maximum price.

## The Cultivation Site

- The CODER is cultivated with SELF-CONTAINED specs carrying the
  arbiters (the smokes for the packages, the site build for the site
  files).
- The never-commit rule binds it: agents never commit; the user
  commits.
- The report format binds it: before -> after with file:line anchors,
  the arbiter results, the residuals.
- The attempts ladder is part of its spec, so failure handling is
  contract, not improvisation.

## Examples

### Good

- Spec: "Implement X. The smokes must pass: <suite names>. Report
  before -> after with file:line anchors. Do not commit. On failure
  end with ESCALATION: <reason>."
- A first run fails on a guard -> the retry carries the failing
  guard's output and the diff; the escalation carries both artifacts
  plus a two-line failure summary.
- The escalated run fails -> the orchestrator stops and reports both
  summaries to the user.

### Bad

- `low` effort on a multi-file refactor because "it looks mechanical"
  (low needs all three: trivial + single-file + fully specified).
- A retry with the same prompt and no failure artifacts.
- A second escalation after the first escalated run failed.
- The subagent committing "to save a step".

## Exceptions

- The user's explicit override can direct a different route for the
  named task (see ./references/three-strains-overview.md).
- A user decision after the double failure can authorize a new,
  re-formalized spec - that is a NEW ladder, not a loop of the old
  one.

## Failure Modes

- **Arbiters missing from the spec:** the coder ships code no suite
  verified. Cost: the tree breaks silently.
- **Artifacts dropped between rungs:** the retry re-derives the
  failure from scratch. Cost: a wasted run at full price.
- **Marker abuse:** ESCALATION emitted for routine uncertainty (which
  should be a question), or not emitted at all at a real wall (the
  orchestrator cannot route).
- **Commit creep:** the coder commits mid-task; the user's tree
  diverges from their intent.

## Arbiters

- Every coder delegation shows @cf/zai-org/glm-5.3-flash with effort
  `high`, or the documented `low` case (trivial + single-file + fully
  specified).
- The run history shows at most: two GLM high runs + one DeepSeek max
  run per task, then stop.
- Reports carry before -> after with file:line anchors, the arbiter
  results, the residuals; no commits by agents.

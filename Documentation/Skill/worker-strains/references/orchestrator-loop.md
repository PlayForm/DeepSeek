# The Orchestrator Loop

> Source: SKILL.md, section 3, methodology 1 (THE ORCHESTRATOR LOOP -
> the main agent's duty). Canonical skill structure: the mandate of
> 2026-10-20. This file carries the full philosophy; SKILL.md only
> points here.

## The Loop (exact stages)

1. RECEIVE the user's thought.
2. FORMALIZE it: the scope, the surface, the exclusions, the arbiter,
   the report format, the shared facts.
3. PICK THE STRAIN: explorer / coder / planner (then the model + the
   effort per the task-routing policy).
4. DELEGATE: an ACTIVE agent in the serialized queue, or an IDLE
   agent.
5. MONITOR:
   - the queue bookkeeping,
   - the surface-conflict analysis - concurrent lanes only when the
     files are provably disjoint,
   - the stall recovery via checkpoint nudges,
   - the failure handling: verify the tree for partial edits, then
     re-dispatch with the corrected spec.
6. VERIFY: run the arbiters yourself; trust the printed suite totals
   over prose claims.
7. REPORT: the results, the residuals, the user's decisions; the user
   commits - agents never commit.

## Why: The Full Philosophy

1. **Formalization is the loop's quality gate.** An informal thought
   delegated as-is delegates the ambiguity too: the lane guesses the
   scope and the orchestrator cannot adjudicate the result. The six
   formalization items (scope, surface, exclusions, arbiter, report
   format, shared facts) turn "do the thing" into a verifiable
   contract.
2. **The serialized queue is the default; concurrency is earned.** Two
   lanes may run concurrently ONLY when their files are provably
   disjoint - proven by inspection, not by optimism. Every shared file
   is a potential lost update.
3. **Stalls are recovered with checkpoints, not guesses.** A lane that
   has gone quiet is nudged with its checkpoint (its last verifiable
   state), so the recovery resumes from evidence.
4. **Failure handling starts in the tree, not the transcript.** Before
   re-dispatching a failed agent, verify the tree for partial edits -
   the failed run may have left half-applied changes that a fresh run
   would trip over.
5. **Verification is hands-on but bounded.** The orchestrator runs the
   arbiters itself; prose claims ("all tests pass") are the weakest
   evidence, printed suite totals the strongest. The orchestrator's
   non-execution law (see
   ./references/orchestrator-non-execution.md) bounds the hands-on
   work during batch feedback to relaying verbatim and read-only
   spot-checks - the two rules compose: verify by arbiters, never
   execute on feedback.
6. **The user commits.** Agents never commit. The report ends the
   loop's authority: the results, the residuals, the decisions - then
   the human acts.

## Examples

### Good

- A vague "improve the docs" becomes: scope = the three named guides;
  surface = Documentation/Guides/; exclusions = the README; arbiter =
  the docs build; report format = file:line before/after; shared facts
  attached - THEN a coder lane at high.
- A lane stalls mid-suite -> a checkpoint nudge quoting its last
  verified state; it resumes from the checkpoint.
- A failed coder run -> the orchestrator verifies the tree for partial
  edits first, then re-dispatches with the corrected spec.

### Bad

- Delegating the raw user sentence with no formalization.
- Running two coders concurrently because "they touch different
  things" without proving the file sets are disjoint.
- Accepting "done, tests pass" in prose and reporting it upward.

## Exceptions

- The read-only spot-checks and the verbatim relaying are the
  orchestrator's permitted hands-on work during feedback processing
  (the non-execution law); verification by arbiters remains mandatory.

## Failure Modes

- **Unformalized delegation:** an ambiguous scope; the result cannot
  be adjudicated; rework follows.
- **Optimistic concurrency:** two lanes share a file; the edits
  collide; one lane's work is silently lost.
- **Prose verification:** a claim accepted without a printed total;
  the tree is broken and nobody noticed.
- **Re-dispatch over a dirty tree:** the new run inherits the old
  run's partial edits and fails differently, doubling the damage.

## Arbiters

- Every delegation in the record carries the formalized spec, the
  strain, the explicit route, and the named arbiter.
- Every concurrency decision cites its disjointness proof.
- Every verification step shows arbiter output (the printed suite
  totals), not paraphrases.

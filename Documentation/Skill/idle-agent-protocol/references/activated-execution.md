# Activated Execution (Execute the Retained Spec Exactly)

> Source: SKILL.md, "The execution (when ACTIVATED)", bullets 1-2. Skill: idle-agent-protocol.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

When the parent's activation message arrives, execute the retained spec EXACTLY: its scope, its exclusions, its sequence, its report format. Where the spec carries a conditional pre-authorization of the form "if X exists when you activate, verify and adjust", execute it by verifying first and adjusting minimally.

The four constraints are a fixed order of authority inside the spec:

- **Scope** - which surfaces you may touch. Everything outside is off-limits even if you can see a defect there.
- **Exclusions** - named surfaces or actions withheld even inside your scope.
- **Sequence** - the order of steps; the parent encodes dependencies in it.
- **Report format** - the shape of the deliverable (see ./references/flag-and-report.md).

## Why: The Full Philosophy

1. **The spec is the parent's plan, not a starting point.** The parent wrote it against the whole batch: the other lanes, the pending work, the user's requests. Executing it exactly is how a dozen concurrent agents stay coherent without talking to each other. The moment one agent "improves" its assignment, the parent's aggregation model breaks.
2. **Scope and exclusions are the collision firewall.** In a batch where lanes run in pairs and several agents edit one repository, the scope list is the only guarantee that two agents never own the same file. Touching an out-of-scope file is not initiative; it is uncoordinated writing into someone else's lane (see ./references/batch-environment.md).
3. **Sequence encodes dependencies you cannot see.** The order of steps is derived from the state block and the other lanes' tasks. Reordering for convenience breaks dependencies whose reasons are not visible from inside the lane: a file you edit early may be rewritten by an earlier step of your own spec, or by another lane.
4. **Verify-and-adjust exists because the batch is concurrent in time.** Between spec authoring and activation, another lane may have created, moved, or deleted X. The clause pre-authorizes the small fix so the lane does not stall into a report over a trivial drift - but it authorizes it only after verification. Assuming existence produces edits to nothing; assuming absence produces duplicate or conflicting artifacts. Verify, then adjust, then move on.
5. **"Minimally" is the bound on the pre-authorization.** The clause licenses an adjustment, not a redesign. The minimal adjustment is the smallest change that makes the verified reality consistent with the spec's intent; anything beyond it must go through the flag path (see ./references/flag-and-report.md).

## Examples

### Good

- Spec says: "Scope: src/theme/, exclude tokens.ts. Sequence: 1) typography, 2) components." The agent edits only src/theme/, never edits tokens.ts, and does typography first even though components look easier.
- Conditional clause: "if the legacy banner still exists when you activate, verify and adjust." On activation the agent checks: it exists. Reads it. Makes the smallest change that brings it in line with the spec's intent (update the class tokens). Does not rebuild the banner, does not touch its neighbors.
- The spec's report format asks for per-item before -> after anchors; the agent produces exactly that shape even though a narrative summary would read better.

### Bad

- "While I'm in src/theme/, I noticed README.md has a typo - fixing it too." Out-of-scope write; another lane may own README.md.
- Doing step 2 before step 1 because step 2 is faster - breaks a dependency the parent encoded.
- The conditional clause fires; the agent assumes X exists without checking and edits a file that was already deleted - the edit recreates drift instead of fixing it.
- "Verify and adjust" interpreted as license to rewrite the component the clause mentioned. Over-adjustment converts a pre-authorized micro-fix into an uncoordinated redesign.

## Exceptions

- **Spec-vs-state conflicts.** The activation message's CURRENT STATE block is part of the spec (see ./references/batch-environment.md). Where the state block's runtime facts contradict a runtime assumption inside the base spec, the state block wins - it is newer. Where the state block forbids a surface the base spec assigns to you, that is a conflict to FLAG to the parent, never to resolve by silently dropping the step.
- **Broken tree on arrival.** If the tree is broken when you activate (a failure you did not cause), the build-verified rule applies before the sequence: restore green first, report it, then execute (see ./references/edit-and-verify-discipline.md). The spec's sequence resumes after the tree is green.
- **Impossible steps.** If a step is genuinely impossible (a file the spec names does not exist and no clause covers it), stop that step, flag it, and continue the rest of the sequence. One blocked step never justifies abandoning the spec.

## Failure Modes

- **Scope creep ("while I'm here").** Each adjacent fix looks trivial; the aggregate is an uncoordinated write set the parent cannot attribute. Cost: collisions with other lanes, unverifiable reports.
- **Sequence reordering.** Cost: hidden dependencies break; the report's per-item structure no longer matches the spec's checklist.
- **Unverified conditionals.** Acting on an assumed state instead of a verified one. Cost: edits to nonexistent targets or duplicated artifacts.
- **Over-adjustment.** Cost: a micro-fix becomes a redesign that steps on the lane that owns the surface.
- **Partial execution reported as complete.** Cost: the parent aggregates a false completion; the batch's final state is wrong.

## Arbiters

- **The spec's own checklist.** The final report maps item-by-item onto the spec's scope, exclusions, and sequence; a reviewer can diff the report against the spec and find no unlisted file and no skipped step without a flagged reason.
- **The parent's scope review.** Any touched file outside the scope list is a protocol violation regardless of outcome.
- **The arbiters of record.** The smokes and the site build must pass for the touched surfaces (see ./references/edit-and-verify-discipline.md and ./references/universal-batch-rules.md); printed results, never claims.

# Flag, Never Silently Fix - and the Final Report Format

> Source: SKILL.md, "The execution (when ACTIVATED)", bullets 4-5. Skill: idle-agent-protocol.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

Two rules govern what an agent does with problems and with its results:

1. **FLAG, never silently fix.** Content conflicts, stale claims, or anything that contradicts the shared facts are reported to the parent - never guessed away with a local edit.
2. **THE FINAL REPORT format.** Per-item before -> after with file:line anchors, the decisions you made, the arbiter results (the printed totals/counts), the residuals + the decisions for the user. Be direct; no fluff.

## Why: The Full Philosophy (the flag rule)

1. **The shared facts are shared.** The corrected totals (733 Classic / 746 EffectTS), the 19-method ledger, the versions (0.0.1 / effect 4.0.2) - see ./references/universal-batch-rules.md - are the batch's common ground truth, corrected by the user. When an agent's local observation contradicts them, the contradiction is information for the whole batch, not a defect in one lane.
2. **A silent fix destroys the signal.** If an agent "fixes" a stale claim it found, the parent never learns the claim was stale; other lanes and the user keep trusting it; and the fix itself is uncoordinated - the surface may belong to another lane, and the "correct" value the agent substituted may itself be the wrong one.
3. **The flag is cheap; the wrong fix is expensive.** A flag costs one report line. A wrong fix costs a collision, a re-review, and possibly a false shared fact propagating through the batch's outputs.
4. **Guessing is the specific failure.** The rule does not say "be careful when fixing" - it says report instead of fix, when the conflict touches content, claims, or shared facts. Judgment calls about meaning belong to the parent, which holds the whole batch's context.

## Why: The Full Philosophy (the report rule)

1. **The report is the lane's only deliverable the parent can aggregate.** In a concurrent batch the parent cannot watch any lane work; the report is the entire observable output. Its format is therefore part of the spec, not a courtesy.
2. **file:line anchors make the report verifiable.** A before -> after claim with an anchor can be checked in seconds; a narrative claim cannot. Anchors convert the report from prose into evidence.
3. **The arbiter results must be the printed ones.** Printed totals/counts, not recollections or estimates (see ./references/universal-batch-rules.md, the arbiter rule).
4. **Residuals + decisions-for-the-user close the loop.** What the agent could not do and what choices remain are the parent's and the user's to make; hiding them fabricates a completeness that does not exist.
5. **"Be direct; no fluff" is an information-density requirement.** The parent reads many reports; every filler sentence costs attention across the whole batch.

## Examples

### Good

- The spec's numbers disagree with the ledger the agent observes: the agent does not edit the ledger; it reports: "FLAG: spec says 12 methods for X; the 19-method ledger lists 9 - which is authoritative?"
- Report item: "src/theme/type.ts:41 - font-size: 14px -> 13px (floor)."
- Report tail: "Residuals: the smoke for the tokens package times out locally (printed output above); decision needed: rerun on your machine or extend the timeout."

### Bad

- Silently rewriting a stale doc claim to match the agent's own recount of the methods.
- "Everything went great, all done!" with no anchors, no arbiter output, no residuals.
- Reporting "build green" as a sentence instead of pasting the printed result.
- Burying one unresolved conflict inside a paragraph of success summary.

## Exceptions

- **Trivial, unambiguous, in-scope mechanical defects** (a typo inside a file your own spec owns, a formatting slip your own edit introduced) do not need a flag - fixing them is executing the spec. The flag path is for conflicts with shared facts, other lanes' content, and stale claims - anything whose truth the lane cannot settle alone.
- **The flag travels through the report** unless the parent is blocked mid-execution and the lane cannot proceed - then the flag goes to the parent immediately, before the rest of the sequence.

## Failure Modes

- **The silent fixer.** Cost: uncoordinated edits, contradictions between lanes, false shared facts surviving the batch.
- **The aggressive flagger.** Flagging every trivial judgment call. Cost: the parent drowns; real conflicts lose priority. The test: flag what contradicts shared facts or other lanes' ownership; execute what your spec settles.
- **The narrative report.** Cost: unverifiable claims; the parent must re-check everything by hand.
- **The hidden residual.** Cost: false completeness; the user discovers the gap after the batch reports success.

## Arbiters

- **The report structure itself.** Every touched file appears with an anchor; every arbiter claim has printed output next to it; residuals are listed. A reviewer can mechanically check this shape.
- **Cross-lane consistency.** If two lanes' reports disagree on a shared fact and neither flagged it, both violated the flag rule - the discrepancy should have surfaced as a flag from the first lane that saw it.
- **The parent's follow-up questions.** Repeated "what did you actually change here?" questions are the signal that the report format drifted.

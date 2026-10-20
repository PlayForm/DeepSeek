# The Difficulty-First Principle (Infer Effort From the Task's Actual Difficulty)

> Source: SKILL.md, section 2 intro (user-mandated 2026-10-20, binding).
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

THE DIFFICULTY-FIRST PRINCIPLE (user-mandated 2026-10-20, binding): the
effort is INFERRED FROM THE TASK'S ACTUAL DIFFICULTY - absorb the
request, infer the operation's complexity, and derive the model + effort
from that inference. NEVER assume "coding => high" or vice versa. The
classification rules:

- MECHANICAL operations - lookup-and-replace sweeps, mechanical renames,
  pattern-following conversions, well-specified multi-file edits with a
  complete spec + a guarded exceptions list - are the TRIVIAL class
  regardless of the file count: `low` (the operation is deterministic;
  the arbiters verify for free).
- SEMANTIC operations - naming judgment, sentence/paragraph authoring,
  design decisions, philosophy writing, ambiguous refactors - are the
  ROUTINE class: `high` where the judgment is real.
- The file count alone never decides the effort; the operation's
  difficulty does.

## Why: The Full Philosophy

1. **The mandate exists to kill category reflexes.** The reflex it
   names verbatim is "coding => high" (and its inverse). Before this
   principle, a delegation prompt's category ("this is coding") decided
   the effort. That conflates what the task is called with what the
   operation demands. The mandated procedure is a three-step inference:
   absorb the request -> infer the operation's complexity -> derive
   model + effort from that inference.
2. **Why mechanical work is trivial even multi-file.** A
   lookup-and-replace sweep, a mechanical rename, or a
   pattern-following conversion is deterministic: the same input
   produces the same output, and nothing in the operation requires
   judgment. Raising the effort does not improve a deterministic
   operation; it only raises cost. The guarded exceptions list (the
   pre-declared set of files/cases the sweep must NOT touch) is what
   makes the multi-file case safe: the arbiters then verify the sweep
   for free with deterministic checks (grep for leftovers, diff counts
   against the exceptions list).
3. **Why semantic work is routine.** Naming judgment, sentence/paragraph
   authoring, design decisions, philosophy writing, ambiguous refactors
   - these are exactly the places where `high` effort changes the output,
   because the operation is not deterministic and the judgment is real.
   Under-classifying them to `low` trades quality for tokens where
   quality is the point.
4. **Why "the file count alone never decides".** File count measures
   bulk, not difficulty. Forty files of mechanical renaming is easier
   per-file than one file of ambiguous refactoring. Making file count
   the trigger would route sweeps to `high` (paying 1.5-3x `low` for no
   correctness gain - see ./references/benchmark-evidence.md) and would
   encourage padding "routine" labels onto mechanical work.
5. **Why the guarded exceptions list is the precondition.** The trivial
   classification for multi-file edits is conditional: complete spec +
   guarded exceptions list. The spec proves the operation is fully
   determined; the exceptions list declares the boundaries so the sweep
   cannot silently overrun. Remove the precondition and the edit is no
   longer mechanical - it lands in the routine row.
6. **Binding status.** "User-mandated 2026-10-20, binding" means this is
   not an interpretation aid; it is part of the policy's core, same
   standing as the non-negotiables. Deviating without a user instruction
   is a policy violation (see ./references/policy-scope.md).

## Examples

### Good

- "Rename `foo` to `bar` in all 60 files per this complete spec; do not
  touch the 3 files in the exceptions list" -> MECHANICAL -> trivial ->
  `low`, arbiters verify with grep + diff counts.
- "Convert these config blocks to the new schema following the mapping
  table" -> MECHANICAL pattern conversion -> `low`.
- "Choose better names for these 12 public functions and update the
  docs" -> SEMANTIC naming judgment -> routine -> `high`.
- "Rewrite this section's philosophy paragraphs" -> SEMANTIC authored
  prose -> `high`.

### Bad

- "It's a 60-file change, so `high`" - file-count reflex; the principle
  explicitly forbids file count deciding the effort.
- "It's coding, so `high`" - the exact category reflex the mandate
  prohibits.
- A multi-file sweep sent to `low` WITHOUT a complete spec or a guarded
  exceptions list - missing the precondition; it belongs in the routine
  row until the spec exists.
- Sending naming judgment or philosophy writing to `low` because the
  diff is small.

## Exceptions

- None to the inference procedure itself. The routing table's built-in
  exceptions stand (exploration re-run at `high`, user-requested
  exhaustive verification at `max`), and the user's override can name a
  task - but the difficulty inference is always performed and recorded.
- If the user pre-declares the route for a task, the override applies;
  the classification note in the delegation prompt should still state
  the inferred difficulty for the audit trail.

## Failure Modes

- **Category reflex**: routing by the task's label ("this is coding",
  "this is just edits") instead of inferring operation complexity. Cost:
  systematic mispricing of whole task classes.
- **File-count reflex**: `high` because "it's 40 files". Cost: pays
  1.5-3x for deterministic work; the arbiters would have verified for
  free.
- **Unguarded mechanical sweep**: `low` classification without the
  complete spec + exceptions list. Cost: the sweep overruns files it
  should not touch, and `low` effort compounds the overrun.
- **Semantic under-classification**: naming/prose/design work pushed to
  `low` "to save tokens". Cost: quality loss exactly where judgment was
  the deliverable.

## Arbiters

- Delegation-prompt audit: every coding delegation must show the
  difficulty inference - either the mechanical precondition (complete
  spec + guarded exceptions list) or the semantic justification. A
  prompt that routes by keyword with no inference is a violation.
- Deterministic verification: mechanical sweeps are checked by free
  arbiters (grep for un-converted leftovers, diff counts against the
  exceptions list) - see ./references/adjudication-protocol.md.
- Session-log audit: model and effort per delegation must match the
  routing table row the inference selected (method in
  ./references/adjudication-protocol.md).

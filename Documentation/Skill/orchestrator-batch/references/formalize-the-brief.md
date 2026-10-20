# Formalize the Brief

> Source: SKILL.md, section "The loop (incremental + synchronous in
> wall-clock time)", step 2 (FORMALIZE). Mandate date: 2026-10-20
> (canonical restructure).
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

Every user thought, however fragmentary, is FORMALIZED before delegation.
Formalization has four movements:

1. **Structure it**: lay out the scope (what is in), the surface (which
   files/directories/repos the work touches), the exclusions (what must NOT
   be touched), and the sequence (what order the work happens in).
2. **Bind it to the shared facts**: the totals 733/746, the 19-method ledger,
   the versions 0.0.1 / effect 4.0.2, the byte-exact ledger quotes - the lane
   must not contradict these (see shared-facts.md).
3. **Bind it to the conventions**: tabs, the typography laws, the Harness
   Blue + zero elevation, never-commit, the smokes/site-build as the
   arbiters.
4. **Shape the report format**: tell the lane exactly what its report must
   contain (the printed totals, the evidence, the residuals) so verification
   is possible when it returns.

If the user's wording is ambiguous, formalize the MOST FAITHFUL READING and
STATE IT - do not stall asking what they meant, and do not guess silently.

## Why: The Full Philosophy

1. **Delegation quality equals brief quality.** The subagent's conversation
   cannot see this one; the brief is the lane's entire world. An unstructured
   thought delegated directly becomes the lane's interpretation, and
   interpretations diverge.
2. **Binding to shared facts and conventions is how the batch stays coherent
   across many lanes.** A lane that invents its own version numbers or
   formatting conventions produces work that conflicts with the other lanes'
   work; the binding is done once, by the orchestrator, in every brief.
3. **The report format is chosen now** because verification (phase 5) is only
   possible if the lane was told, up front, to print its own arbiters'
   numbers. A lane that was never asked for printed totals comes back with
   prose - and prose cannot be cross-checked (see
   arbiters-are-the-lanes-own.md).
4. **The ambiguity rule trades one sentence for one round-trip.** Asking the
   user "did you mean X?" costs a full exchange and stalls the loop; a
   faithful reading stated explicitly can be corrected cheaply in the next
   message, and meanwhile the lanes are not blocked.

## Examples

### Good

- User: "the buttons on the homepage are duplicated" ->
  Brief: scope = homepage buttons; surface = the homepage component + its
  CSS; exclusions = none; sequence = investigate render path, then fix;
  facts: the totals 733/746 stand; conventions: tabs, Harness Blue + zero
  elevation, never-commit; report format: the lane states the cause, the
  file:line, and prints its post-fix build numbers.
- User: "make it look better" (ambiguous) -> the orchestrator states: "I read
  this as: tighten the visual hierarchy on the docs landing page only -
  correct me if not" - and delegates on that reading.

### Bad

- Forwarding the user's raw sentence to a lane with "do this".
- A brief that names scope but not exclusions - the lane then "helpfully"
  reformats neighboring files.
- A brief without a report format - the lane returns an essay.

## Exceptions

- A pure state question ("how many lanes are active?") needs no brief; the
  orchestrator answers from the queue records.
- When the ambiguity is genuinely undecidable AND the work is destructive
  (deletions, renames), state the faithful reading AND wait for the user
  before delegating - the stated-reading rule has a safety valve for
  irreversible actions.

## Failure Modes

- Silently guessing on ambiguous wording: the lane executes an
  interpretation the user never held, and the correction arrives after the
  work is done.
- Omitting the shared-facts binding: the lane "helpfully updates" the version
  numbers or rewrites a ledger quote and breaks byte-exactness.
- Omitting exclusions: the lane's enthusiasm widens the diff beyond the
  surface.

## Arbiters

- Every delegated brief must contain: scope, surface, exclusions, sequence,
  the shared-facts binding, the conventions binding, and the report format.
  A brief missing one of these is non-compliant; re-brief before dispatch.
- Ambiguous-wording delegations must show the stated faithful reading in the
  orchestrator's message (to the user or in the record).
- The lane's returned report is checked against the brief's report format -
  a report that does not match the requested format is sent back.

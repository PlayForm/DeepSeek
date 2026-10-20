# The Shared Facts (The Truth the Whole Batch Must Not Contradict)

> Source: SKILL.md, section "The shared facts (the truth the whole batch
> must not contradict)". Mandate date: 2026-10-20 (canonical restructure);
> facts current as of the 2026-10-09/10 batch records.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

These facts are the batch's ground truth. Every brief, every lane, every
report must be consistent with them; a lane that contradicts one has made an
error, not a discovery:

- **The totals**: Classic 733 / EffectTS 746 (the suites print them).
- **The per-suite pairs** (Classic/EffectTS where paired):
  - core 14/17
  - factory 34/41
  - governor 78/81
  - pinner 32
  - cargo 62
  - dash 132
  - five flavors 62
  - file 71
- **The factory surface**: 19 callable methods (the SCHEME sections:
  2.7 Write + GuardedWrite, 2.16 UpdateKey, 2.17 RegisterGovern,
  2.18 Govern).
- **The releases at 0.0.1.**
- **The effect pin 4.0.2.**
- **The ncuBin default "ncu"** (PATH-resolved - the re-pin landed).
- **The licenses: CC0-1.0.**
- **The Boilerplate + the live ~/.dsh are the internal baselines** (their
  personal paths stay - the pending gitignore/submodule decision).
- **Documentation/Plans/ + Reports/ are the process records** - agents
  leave them, the orchestrator updates them.

## Why: The Full Philosophy

1. **A distributed batch needs an invariant set.** Lanes run in separate
   contexts and cannot see each other's reasoning; the shared facts are the
   one thing they all anchor to. If lane A believes the total is 733 and
   lane B "recalculated" 746 as 750, their reports cannot be reconciled.
2. **Each fact is load-bearing:**
   - The totals 733/746 are the arbiter numbers the suites print - any
     report citing other numbers is wrong (the 795/808 phantoms lesson,
     see arbiters-are-the-lanes-own.md).
   - The per-suite pairs let a lane verify its own slice's count without
     running the whole batch.
   - The 19-method factory surface (with the SCHEME sections) defines the
     documentation's scope: a doc lane that adds a 20th method or misses
     2.16-2.18 is out of bounds.
   - The release version 0.0.1 and the effect pin 4.0.2: a lane that
     "helpfully updates" either breaks byte-exactness and the pin.
   - The ncuBin default "ncu" (PATH-resolved): the re-pin landed; a lane
     hardcoding a different binary name regresses it.
   - CC0-1.0: license headers and boilerplate text must match.
   - The internal baselines: the Boilerplate and the live ~/.dsh stay as
     baselines including their personal paths - the gitignore/submodule
     decision is PENDING and belongs to the user, not to a lane.
   - The process-record convention: agents write into Documentation/Plans/
     and Reports/, but the orchestrator is the one who maintains/updates
     them as records - the roles are fixed.
3. **Facts are bound at formalization time** (see formalize-the-brief.md):
   every brief repeats the relevant subset so the lane never has to guess.

## Examples

### Good

- A doc lane's brief states: "The factory surface is 19 callable methods;
  the SCHEME sections are 2.7 (Write + GuardedWrite), 2.16 (UpdateKey),
  2.17 (RegisterGovern), 2.18 (Govern). Do not add methods."
- A test lane reports "733/733 Classic, 746/746 EffectTS - matching the
  shared totals."

### Bad

- A lane reports "808 tests pass" as an achievement - arithmetic phantom.
- A lane bumps the version to 0.0.2 because "it finished work".
- A lane rewrites personal paths in the baselines because it found them
  "non-portable".

## Exceptions

- A fact can CHANGE, but only by the user's or the verified work's explicit
  action - e.g. a legitimate new test changes the totals; the orchestrator
  then updates the shared facts for all subsequent briefs. A lane never
  updates them unilaterally.
- The pending gitignore/submodule decision on the baselines is explicitly
  open; lanes do not resolve it themselves.

## Failure Modes

- Stale facts: the batch keeps citing 733/746 after the user adds tests -
  the facts must be re-verified when the work legitimately changes them.
- Unilateral updates: a lane edits the pin/version/license on its own -
  byte-exactness and the pin are broken.
- Facts not bound into the brief: the lane, seeing nothing, guesses -
  usually wrong.

## Arbiters

- The suites' printed totals are the arbiter for the test facts.
- The published artifacts (versions, license fields, pinned versions) are
  the arbiter for the release facts.
- Every brief must contain its relevant shared-facts subset; a brief
  without them is non-compliant (see formalize-the-brief.md).
- A report contradicting a shared fact is rejected unless it carries the
  verified evidence that the fact legitimately changed.

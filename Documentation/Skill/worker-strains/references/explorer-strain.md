# The EXPLORER Strain

> Source: SKILL.md, section 1 (the strains table, EXPLORER row) and
> section 5 (the cultivation sites, EXPLORER bullet). Canonical skill
> structure: the mandate of 2026-10-20.
> This file carries the full philosophy; SKILL.md only points here.

## The Strain (the table row, exact)

| Field | Value |
|---|---|
| Strain | EXPLORER |
| What it is for | read-only surveys, research, analysis, scans, archaeology |
| Model (exact) | @cf/zai-org/glm-5.3-flash |
| Effort | low ALWAYS |

## The Effort Law

1. `low` is always the answer for exploration.
2. ONE high re-run is allowed, and only when BOTH conditions hold:
   (a) the exploration feeds a coding task, and
   (b) the first run came back unusably thin.
3. `max` is allowed only on an explicit "archaeology" request.
4. Downstream validation is free - deterministic shell checks - so the
   later stages correct the explorer's mistakes for free.

## Why: The Full Philosophy

1. **Exploration is broad and shallow by design.** A survey's value is
   coverage and orientation, not depth; `low` covers more surface per
   token. The explorer is the cheapest lane, and the harness spends
   its depth budget downstream instead.
2. **Thin output is detectable, so thin output is correctable.** A
   deterministic shell check (does the file exist, is the symbol where
   the survey said it is) costs almost nothing and catches a thin or
   wrong survey. That is why exactly ONE high re-run is budgeted: the
   re-run is a targeted correction triggered by evidence, not a
   standing second pass.
3. **Both conditions on the re-run are mandatory.** "Feeds a coding
   task" prevents spending depth on throwaway exploration; "unusably
   thin" prevents re-running on a merely imperfect but usable survey.
4. **Archaeology is the one depth-is-the-deliverable task.** Deep
   history dives, provenance chains, "where did this come from" -
   only an explicit user request for archaeology unlocks `max`,
   because only then is depth the product rather than the overhead.
5. **Free downstream validation shapes the whole strain.** Because the
   check is cheap, the explorer does not need to be defensive or
   exhaustive; it needs to be fast, broad, and honest about what it
   did not read. The cost of a wrong claim is one cheap check, not a
   wasted implementation.

## The Cultivation Site

- The EXPLORER is cultivated in READ-ONLY surfaces with BOUNDED
  reading.
- Prompts are scaffold-first: the skeleton of the answer is requested
  before the details, so the run produces an orientable structure even
  when the reading budget runs out.
- Verification is by deterministic shell checks, not by re-reading.
- Its mistakes are corrected downstream for free - this is the
  strain's defining economic property.

## Examples

### Good

- Survey prompt: "Read-only. Map the packages under packages/, list
  each package's public entry points, answer as a scaffold first."
- A thin survey feeding a coding task -> one high re-run of the SAME
  bounded scope, not a bigger one.
- "Find where ledger strings are asserted" -> explorer at low, then a
  shell check (a grep count) verifies the located line before the
  coder is dispatched.

### Bad

- Re-running exploration at high because the first run "felt short".
- An unbounded open-ended read ("look around the repo and tell me
  what you find") - no scaffold, no bounds.
- Using max effort for a routine scan because "it might be deep".

## Exceptions

- The one high re-run (both conditions of the Effort Law).
- `max` on an explicit "archaeology" request.
- The user's explicit override for the named task (see
  ./references/three-strains-overview.md).

## Failure Modes

- **Unbounded reading:** no scaffold, no file:line anchors in the
  answer; the coder downstream re-does the exploration. Cost: the
  cheap lane's savings are lost.
- **Silent thinness:** the survey returns without flagging what it did
  not read; downstream stages build on holes. The prompt must demand
  an explicit "not read / not found" section.
- **Re-run creep:** the one high re-run becomes a standing second
  pass. Cost: exploration doubles in cost routinely.
- **Verification skipped:** the survey's claims go into a spec
  unchecked. Cost: the "free correction" is never collected.

## Arbiters

- The delegation record shows EXPLORER + @cf/zai-org/glm-5.3-flash +
  low, or the documented exception with its trigger evidence.
- Survey outputs carry explicit not-found / not-read sections.
- Downstream stages show the deterministic checks that validated the
  survey's load-bearing claims.

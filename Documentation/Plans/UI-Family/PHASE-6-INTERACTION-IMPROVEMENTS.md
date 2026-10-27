---
title: The UI Family Implementation Plan - phase 6 (the interaction improvements R1-R10)
category: Plans/UI-Family
kind: queued-plan
date: 2026-10-20
status: planned
registry: Documentation/Plans/UI-Family/PHASE-6-INTERACTION-IMPROVEMENTS.md
index: Documentation/INDEX.md
statuses:
	- name: the interaction improvements R1-R10
		state: open
		evidence: this document - additive smoke coverage only, zero ledger string changes
---

# PHASE 6 - THE INTERACTION IMPROVEMENTS R1-R10

> This is a granular document of the UI Family Implementation Plan. The parent hub is
> Documentation/Plans/UI-FAMILY-IMPLEMENTATION-PLAN.md.

---

- **THE GOAL**: implement the R-INTERACT recommendations, in the section 5 order.
- **THE CONSTRAINTS**: EACH recommendation gets additive smoke coverage and ZERO changes to existing
  ledger strings.

## 1. Exact locations (per recommendation)

- **R1**: Classic/packages/hook-dsh-ccr/Source/ - a read-only ccr_list tool (or a list:true mode on
  ccr_retrieve): Store stats {count, bytes}
    - a filtered hash/type/age listing. Store already tracks hash/type/size/createdAt. Register via
      Context.tools.register like ccr_retrieve.
- **R2**: Classic/packages/hook-dsh-ccr/README.md (the retrieval section)
    - the journalPath trade-off documentation, plus a considered default recommendation.
- **R3**: Classic/packages/hook-dsh-tool-coach/Source/Variable/Patterns.ts
    - the ledger-search teaching line ("ledgers are plain text - use the grep tool on the ~/.dsh log
      paths"). NOTE: phase 3 step 4b does this partially, and this item is the completion check.
- **R4**: Classic/packages/hook-dsh-ccr/Source/Variable/Config.ts - evaluate a touch or TTL-extend
  parameter on ccr_retrieve OR the ttlSeconds guidance; if the parameter wins, add the additive
  smoke and the README.
- **R5**: (phase 3, step 4a) - completion check here.
- **R6**: (phase 3, step 4b) - completion check here.
- **R7**: Classic/packages/hook-dsh-tool-coach/ - terminal coverage: add a terminal_send-judging
  hook (the command text is an available tool argument) OR the persistent-section teaching line
  ("same rules apply in terminal_send"). Prefer BOTH: the hook for parity, and the line for clarity.
- **R8**: Classic/packages/plugin-dsh-factory/Source/ (the fs/observed gate path) - emit a ledger
  line when the gate skips an event via the `govern` reason with selection=false, so deliberate
  non-governance becomes visible.
- **R9**: Classic/packages/plugin-dsh-factory/ - land the parallel-govern marker (sequential by
  default; parallel only on proven disjointness) OR delete the promise from the skill docs. Decide
  by auditing the registered steps for disjointness; if unclear, delete the promise, which is the
  cheaper correct move.
- **R10**: Classic/packages/hook-dsh-ccr/Source/Variable/Config.ts - replace the hard-coded
  /Users/nikola/... logFile schema default with "~/.dsh/playform/hook-dsh-ccr.log" (or the
  platform-correct equivalent).

## 2. Exact steps

1. **Work R1-R10 in the order above.**

    EACH recommendation is its own commit-sized unit, with a READY-TO-COMMIT report per unit.

2. **Keep the coverage additive.**

    EVERY recommendation gets ADDITIVE smoke coverage ONLY, and the existing byte-identical ledger
    assertions must NOT move (the smoke-writing law).

3. **Re-run the full runner for the hot paths.**

    R7 and R8 touch hot paths (the coach's waterfall and the factory's gate), so run the full
    207-suite runner after each, not just the folder.

4. **Update the READMEs.**

    Update the two package READMEs (ccr and tool-coach) for the user-facing deltas (R1, R2, R4, R7).

5. **Report per unit.**

    Write the READY-TO-COMMIT report per unit.

ANCHORS: R-INTERACT sections 3.5 (the shortcomings), 5.1-5.3 (the recommendations); hook-dsh-ccr
Source (Store Put/Get/Stats; Context.tools register); plugin-dsh-factory Source (the Wire/gate
order; RegisterGovern).

## 3. Acceptance

- A6.1 R1, R7, R8, and R10 are implemented with additive smokes, and the runner prints the new
  expected total.
- A6.2 R2, R3, and R6 are documented (README or teaching text) and verified live in the coach's note
  output.
- A6.3 R4 and R9 have explicit recorded decisions, implemented or rejected with reasons.
- A6.4 Zero existing ledger strings changed, verified by a grep-diff of the asserted strings.

---
title: The Batch Edit Tool - the feature hub (feasibility, schema, state machine, and the package form)
category: Plans
kind: living-plan
date: 2026-10-20
status: active
registry: Documentation/Plans/BATCH-EDIT-TOOL-FEATURE.md
index: Documentation/INDEX.md
statuses:
	- name: the feasibility research (R-BET-1)
		state: complete
		evidence: the granular subdocuments under Documentation/Plans/Batch-Edit-Tool/; every seam verified against the family code and the harness docs
	- name: the batch edit tool implementation
		state: open
		evidence: awaiting the user's dispatch
	- name: the granular split of this research (12 topic documents)
		state: implemented
		evidence: Documentation/Plans/Batch-Edit-Tool/ - every section preserved byte-exact in its own document
---

# BATCH EDIT TOOL - THE FEATURE HUB

> The user's feature: a new family plugin - the batch edit tool - a tool the
> model calls INSTEAD of the bash-sed replaces and the per-file manual edits.
> It functions like a live container: the agent prepares a schema, inserts
> files into it, and the files process like a state machine in one go -
> fully sponsored, tracked, and evented by the harness's event system.
> The philosophy: each file on the system is a process (Process<Halted>);
> the files are living beings, not inert bytes - the reversed view opposing
> the default UNIX view.
> This document is the HUB: the research was distilled into granular
> topic-subdocuments under Documentation/Plans/Batch-Edit-Tool/ - every
> suggestion, idea, fact, number, ledger string, and residual survives in
> them; this hub holds the map and the reading order.

---

## 1. The granular map (the reading order)

| # | Document | Carries |
|---|----------|---------|
| 1 | [VISION-AND-REPRESENTATION.md](Batch-Edit-Tool/VISION-AND-REPRESENTATION.md) | the why (the user's words, binding); the representation-vs-reality contract (MANAGEMENT OF REPRESENTATIONS); the lifecycle; the license flow |
| 2 | [EVICTION.md](Batch-Edit-Tool/EVICTION.md) | the eviction rule - the four triggers in order of severity, the record survives the representation |
| 3 | [PARADIGM-CATALOG.md](Batch-Edit-Tool/PARADIGM-CATALOG.md) | the 13 paradigms for managing representations, ranked 1-3 for this design |
| 4 | [FEASIBILITY.md](Batch-Edit-Tool/FEASIBILITY.md) | the verdict (FEASIBLE); the tool-registration surface; the event sponsorship table; the reusable batch machinery; the gaps |
| 5 | [SCHEMA.md](Batch-Edit-Tool/SCHEMA.md) | the flat input schema; the canonical output; Process<File> states and transitions; the dynamic insertion |
| 6 | [STATE-MACHINE.md](Batch-Edit-Tool/STATE-MACHINE.md) | the consumed events; the emitted events (Factory.Write and nothing else); the ledger lines (the contract); the silence invariant |
| 7 | [STATE-PRESENTATION.md](Batch-Edit-Tool/STATE-PRESENTATION.md) | the filesystem-in-state presentation (the why's schema) |
| 8 | [LIVE-VIEW-FRAMEWORK.md](Batch-Edit-Tool/LIVE-VIEW-FRAMEWORK.md) | the commonality split - the nine machinery extractions into `live-view/*` |
| 9 | [PACKAGE-AND-GOVERNANCE.md](Batch-Edit-Tool/PACKAGE-AND-GOVERNANCE.md) | the plugin anatomy; the risks and mitigations (the recursive governance and the govern actor marker) |
| 10 | [ACCEPTANCE-CRITERIA.md](Batch-Edit-Tool/ACCEPTANCE-CRITERIA.md) | the 10 checks the implementation must satisfy |
| 11 | [RESIDUALS.md](Batch-Edit-Tool/RESIDUALS.md) | the 7 open residuals (the tool name, the regex scope, the framework package name, the tuning pass...) |
| 12 | [LATER-STAGES.md](Batch-Edit-Tool/LATER-STAGES.md) | the vision: the graph stage, the code-block stage (the reflective surface), the token-waste elimination |

## 2. The reading order for the implementation

1. The VISION-AND-REPRESENTATION contract, then the EVICTION rule - the
   philosophy every other document assumes.
2. The FEASIBILITY seams - what already exists and is verified.
3. The SCHEMA and the STATE-MACHINE - the immediate deliverable.
4. The PACKAGE-AND-GOVERNANCE risks, then the ACCEPTANCE-CRITERIA - how the
   build is judged.
5. The LATER-STAGES - the direction after v1.

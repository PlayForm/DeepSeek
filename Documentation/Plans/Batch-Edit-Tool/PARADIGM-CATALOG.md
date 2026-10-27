---
title: The Batch Edit Tool - the paradigm catalog
category: Plans/Batch-Edit-Tool
kind: research-report
date: 2026-10-20
status: researched
registry: Documentation/Plans/Batch-Edit-Tool/PARADIGM-CATALOG.md
index: Documentation/INDEX.md
statuses:
	- name: the paradigm catalog (13 paradigms ranked for this design)
		state: open
		evidence: this document only - the ranked adoption map for the not-yet-built tool
---

# THE BATCH EDIT TOOL - THE PARADIGM CATALOG

> Granular section of the Batch Edit Tool feature research (R-BET-1). The parent hub:
> Documentation/Plans/BATCH-EDIT-TOOL-FEATURE.md. This document carries section 0B of the research,
> byte-preserved.

---

The question of the user: which paradigms are useful for managing such representations.

Ranked for THIS design (1 = core, 2 = adopt in v1/v2, 3 = the later control layers):

| Rank | Paradigm                                               | How it lands here                                                                                                                                                                |
| ---- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Shadow-state / MVC (the model-view-control split)      | the machine = the model; the state presentation = the view; the ops table = the control - already the representation split                                                       |
| 1    | Git-style staging layers (working-tree / index / HEAD) | the held stamp = index; reality = HEAD; commit = the staged write reconciled against HEAD; the stale halt = the merge conflict                                                   |
| 1    | Event-sourcing projections                             | the machine's state is the fold of its event stream (the fs/observed + job events + ledger lines); rebuildable from the ledger                                                   |
| 1    | Caching with invalidation                              | the held stamps are a cache invalidated by fs/observed; the freshness path re-fills                                                                                              |
| 2    | Actor-per-file mailboxes                               | each process cell is an actor: messages = transitions + touches; the mailbox drains at checkpoints (the no-timers discipline); v1 models it as cells, a true actor runtime is v2 |
| 2    | Materialized views / index projections                 | the state presentation is a materialized view over the cells, re-materialized on events only                                                                                     |
| 2    | Reactive / FRP signals                                 | the assemble section as a signal graph: inputs (fs/observed, jobs) propagate to the view; v1 is pull-based at checkpoints, the push form is v2                                   |
| 2    | Snapshot / time-travel versions                        | the ledger + the held stamps give per-file version history; the time-travel UI (diff cards) rides presentationMeta                                                               |
| 2    | Double-entry journaling                                | every transition has two entries: the machine's ledger line + the fs/observed attestation; an unbalanced pair = the reconciliation flag                                          |
| 3    | Virtualization (the filesystem-in-state)               | the full-virtual-filesystem ambition - only the touched/held subset is represented; the north star, not v1                                                                       |
| 3    | Verified-derivation constraints                        | proofs that a representation matches reality (checksums, re-stamps) - the reconciliation discipline's automated form                                                             |
| 3    | DSL compilation                                        | the ops grammar compiled to the transition plan (the BATCH-STATE pre-baked compiler model); the programmable stage                                                               |
| 3    | Delegated authority + checkpoints                      | sub-agents acting on the parent's machine under delegated licenses with checkpoint approval - the layered government's next step                                                 |

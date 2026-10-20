---
title: The Batch Edit Tool - the residuals
category: Plans/Batch-Edit-Tool
kind: research-report
date: 2026-10-20
status: researched
registry: Documentation/Plans/Batch-Edit-Tool/RESIDUALS.md
index: Documentation/INDEX.md
statuses:
	- name: the tool name and the op grammar
		state: open
		evidence: needs the user's confirmation (suggested: batch_edit)
	- name: regex support scope
		state: open
		evidence: literal + simple regex in v1; the ptc-runtime integration is the future host
	- name: the multi-agent machine sharing scope-decision
		state: open
		evidence: rides the session/event fold - decided at implementation time
	- name: the framework package name
		state: open
		evidence: tied to the user's undecided naming refinements (#15)
	- name: the fs/edit-intent control seam
		state: deferred
		evidence: listed but unexercised - the first control-layer plugin's territory
	- name: the eviction trigger values
		state: open
		evidence: first-cut defaults - need the live tuning pass the monitors got
	- name: the graph stage edge-extraction source decision
		state: open
		evidence: the TS language service vs. the cheap import-scan - needed before any design
---

# THE BATCH EDIT TOOL - THE RESIDUALS

> Granular section of the Batch Edit Tool feature research (R-BET-1).
> The parent hub: Documentation/Plans/BATCH-EDIT-TOOL-FEATURE.md.
> This document carries section 8 of the research, byte-preserved.

---

1. The exact tool name and the op grammar need the user's confirmation
   (suggested: `batch_edit`; the ops are the first cut).
2. Regex support scope: literal + simple regex in v1; the ptc-runtime
   integration (the programmable stage, LIVE-CONTAINERS-RESEARCH section 5)
   is the future host for complex transforms.
3. The multi-agent machine sharing (a sub-agent joining the parent's batch)
   rides the session/event fold but needs a scope-decision at implementation
   time.
4. The framework extraction's package name (`lib-dsh-live-view` vs
   `manifest`) is tied to the user's undecided naming refinements (#15).
5. The `fs/edit-intent` slot (the edit waterfall) as the batch tool's
   control seam is listed but unexercised - the first control-layer plugin's
   territory.
6. The eviction rule's trigger values (the lease window, the LRU cap) are
   the first-cut defaults; they need the live tuning pass the monitors got.
7. The graph stage needs an edge-extraction source decision
   (the TS language service vs. the cheap import-scan) before any design.

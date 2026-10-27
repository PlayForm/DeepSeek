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
	- name: the three measurement questions folded from the trajectory evidence
		state: open
		evidence: this document item 8; Documentation/Plans/Batch-Edit-Tool/TRAJECTORY-EVIDENCE.md section 8
---

# THE BATCH EDIT TOOL - THE RESIDUALS

> Granular section of the Batch Edit Tool feature research (R-BET-1). The parent hub:
> Documentation/Plans/BATCH-EDIT-TOOL-FEATURE.md. This document carries section 8 of the research,
> byte-preserved.

---

1. The exact tool name and the op grammar need the confirmation of the user (suggested: `batch_edit`,
   and the ops are the first cut).
2. Regex support scope: literal and simple regex in v1, while the ptc-runtime integration (the
   programmable stage, LIVE-CONTAINERS-RESEARCH section 5) is the future host for complex
   transforms.
3. The multi-agent machine sharing (a sub-agent that joins the batch of the parent) rides the
   session/event fold but needs a scope decision at implementation time.
4. The package name of the framework extraction (`lib-dsh-live-view` against `manifest`) is tied to
   the undecided naming refinements of the user (#15).
5. The `fs/edit-intent` slot (the edit waterfall) as the control seam of the batch tool is listed but
   unexercised, which is the territory of the first control-layer plugin.
6. The trigger values of the eviction rule (the lease window and the LRU cap) are the first-cut
   defaults, and they need the live tuning pass that the monitors got.
7. The graph stage needs an edge-extraction source decision (the TS language service against the
   cheap import-scan) before any design.
8. The three measurement questions from the trajectory evidence
   (Documentation/Plans/Batch-Edit-Tool/TRAJECTORY-EVIDENCE.md section 8), tracked here so the plan
   answers them before the savings are claimed as measured: a. does a batch reduce cache reads in
   the same proportion, or does the larger single payload defeat the prefix cache? b. what is the
   right refusal rule for the interleaved edit-verify shape - the count of interleaved reads, or an
   explicit dependency marker? c. does a batch of 10 edits in one call cost less than 10 sequential
   edits at the provider level, or does the larger request simply move the cost?

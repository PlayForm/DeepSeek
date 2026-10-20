---
title: The Batch Edit Tool suggestions - the residuals and the R-BET-1 merge point
category: Plans/Batch-Edit-Tool
kind: living-record
date: 2026-10-20
status: active
registry: Documentation/Plans/Batch-Edit-Tool/RESIDUALS-AND-MERGE-POINT.md
index: Documentation/INDEX.md
statuses:
	- name: the residuals of the suggestions research (6 items)
		state: open
		evidence: this document - the journal storage tradeoff, the event-name domain decision, the sweep posture, the naming
	- name: the R-BET-1 merge point
		state: resolved
		evidence: R-BET-1 landed as Documentation/Plans/BATCH-EDIT-TOOL-FEATURE.md; the two researches coexist in Documentation/Plans/Batch-Edit-Tool/
---

# THE RESIDUALS AND THE R-BET-1 MERGE POINT

> Granular section of the Batch Edit Tool suggestions research (R-BET-2).
> The parent hub: Documentation/Plans/BATCH-EDIT-TOOL-SUGGESTIONS.md.
> This document carries section 6 of the research, byte-preserved.

---

1. R-BET-1's BATCH-EDIT-TOOL-FEATURE.md had NOT landed at write time. The
	merge point: its feature inventory should map onto this document's
	sections 2 (the forms) and 5 (the ranked set); any R-BET-1 finding that
	contradicts a rank here wins on recency (the addendum-wins rule the
	family uses on the design conflicts).
2. The harness docs at ~/Developer/Documentation/Module/deepseek-harness/
	were ABSENT on this host - the seam verification here inherits the
	live-containers designs' verified anchors (the tool-coach and the
	live-containers precedents) instead of fresh asar reads. The
	implementation agent must re-verify the two seams it actually touches:
	the tools/execute arm (the D2 G1 carrier) and the system-prompt/assemble
	waterfall (the D3 section pattern), both documented in
	Documentation/Archive/Live-Containers/Design/IMPLEMENTATION-DESIGN.md
	section 3.2 and FILE-MONITORS-DESIGN.md section 5.
3. The journal's pre-image storage size: the per-file full pre-image vs the
	reverse-patch tradeoff is UNDECIDED (the rollback improvement).
	Suggestion: the full
	pre-image for the v1 (the simpler revert, the bounded ring cap like the
	live containers' outputLimitBytes), the reverse-patch as the wave-2
	compression.
4. The batch lifecycle event names: NEW event names may require a new
	storage domain version (the D3/M5 open contract). The implementation
	agent must decide: the batch events in the plugin's OWN domain (the
	journal's) vs the shared governance chain. The suggestion: the batch
	LIFECYCLE events in the plugin's own domain; the per-file merges ride
	the EXISTING fs/observed events unmodified.
5. The scheduled sweep's default posture: the IDLE-forever rule (the
	monitors: "off" default) should apply - the batch tool ships with every
	form opt-in, the one-shot search as the only always-available form.
6. The naming: "batch-edit" vs the user's approved names discipline (#15) -
	the name needs the user's ratification before the packages land.

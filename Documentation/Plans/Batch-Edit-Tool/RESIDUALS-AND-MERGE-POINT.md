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

> Granular section of the Batch Edit Tool suggestions research (R-BET-2). The parent hub:
> Documentation/Plans/BATCH-EDIT-TOOL-SUGGESTIONS.md. This document carries section 6 of the
> research, byte-preserved.

---

1. BATCH-EDIT-TOOL-FEATURE.md of R-BET-1 had NOT landed at write time. The merge point: its feature
   inventory should map onto sections 2 (the forms) and 5 (the ranked set) of this document, and any
   R-BET-1 finding that contradicts a rank here wins on recency through the addendum-wins rule that
   the family uses on design conflicts.
2. The harness docs at ~/Developer/Documentation/Module/deepseek-harness/ were ABSENT on this host,
   so the seam verification here inherits the verified anchors of the live-containers designs (the
   tool-coach and the live-containers precedents) instead of fresh asar reads. The implementation
   agent must re-verify the two seams that it actually touches: the tools/execute arm (the D2 G1
   carrier) and the system-prompt/assemble waterfall (the D3 section pattern), both documented in
   Documentation/Archive/Live-Containers/Design/IMPLEMENTATION-DESIGN.md section 3.2 and
   FILE-MONITORS-DESIGN.md section 5.
3. The pre-image storage size of the journal is UNDECIDED, which is the tradeoff between the
   per-file full pre-image and the reverse patch (the rollback improvement). Suggestion: the full
   pre-image for the v1 (the simpler revert and the bounded ring cap like the outputLimitBytes of
   the live containers), and the reverse patch as the wave-2 compression.
4. The batch lifecycle event names: NEW event names may require a new storage domain version (the
   D3/M5 open contract). The implementation agent must decide between the batch events in the OWN
   domain of the plugin (the journal's) and the shared governance chain. The suggestion: the batch
   LIFECYCLE events in the own domain of the plugin, and the per-file merges riding the EXISTING
   fs/observed events unmodified.
5. The default posture of the scheduled sweep: the IDLE-forever rule should apply (the monitors
   default to "off"), so the batch tool ships with every form opt-in and the one-shot search as the
   only always-available form.
6. The naming: "batch-edit" against the approved-names discipline of the user (#15), where the name
   needs the ratification of the user before the packages land.

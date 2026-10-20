---
title: The UI Family Implementation Plan - phase 7 (the plain-field bridge + the Option B trajectory sections)
category: Plans/UI-Family
kind: queued-plan
date: 2026-10-20
status: planned
registry: Documentation/Plans/UI-Family/PHASE-7-PLAIN-FIELD-BRIDGE.md
index: Documentation/INDEX.md
statuses:
	- name: the plain-field bridge (the trusted full-config write surface)
		state: open
		evidence: this document - editFull(ns, patch) through ctx.configEditor.edit()
	- name: the Option B trajectory sections (the upstream request)
		state: open
		evidence: this document - a documented proposal; no priority shadowing
---

# PHASE 7 - THE PLAIN-FIELD BRIDGE + THE OPTION B TRAJECTORY SECTIONS

> Granular document of the UI Family Implementation Plan.
> The parent hub: Documentation/Plans/UI-FAMILY-IMPLEMENTATION-PLAN.md.

---

- **THE GOAL**: close the TWO structural gaps the researches left open -
  the governors'/ccr's plain (non-volatile) knobs, and the trajectory
  screen's closed seam.

## 1. Exact locations

- **THE PLAIN-FIELD BRIDGE** (R-UI-2 section 3.2 step 5): a new
  family-host service in the central package's host half (or the
  companion host package from phase 5) exposing @Remote editFull(ns,
  patch) that calls ctx.configEditor.edit() directly. Its writes go
  through the same patch + Loader path, but plain-field differences
  trigger the normal update lifecycle (remount) - surfaced in the UI as
  "applies on remount". Coverage: the R-UI-2 table's plain column
  (strict, policyFile, exclude, sections, ncuBin/cargoBin, updateMode,
  ccr's structural knobs).
- **THE OPTION B SECTIONS** (R-UI-3 section 1.4): the harness-side change
  - <DOCS>-upstream request to add "conversation.trajectory.sections"
  {kind:"list", scope:"session"} to dsh-client-ui-trajectory's children
  map, rendered in TrajectoryView under the toolbar or as details-pane
  tabs. ONLY the declaring owner may declare a child - this is upstream
  harness work, NOT family work.

## 2. Exact steps

1. The bridge service: minimal surface (one method), schema-validated
   patch input, the same revision/higher-layer checks configEditor
   enforces. Record in the README that this is the ONE place a family
   package is trusted with full-config writes.
2. UI: the phase 4 forms gain a "plain" section per bundle fed by the
   bridge. Each plain field carries the "applies on remount" marker. The
   row status shows the remount observably.
3. Verify: edit a plain knob (e.g. package-governor strict) -> the patch
   override lands -> the bundle remounts -> the new value is live -> the
   UI reflects the remount event.
4. OPTION B: write the upstream request as a documented proposal (this
   document set's appendix + a note in Documentation/Plans/) with the
   exact declaration, the render sites (TrajectoryTable equivalents), and
   the R-UI-3 section 1.4 reasoning. Do NOT shadow trajectory via
   priority re-registration (explicitly rejected in the research). If the
   harness release adds the slot, the central package adds the
   in-trajectory mount as a phase 8 follow-up.
5. Re-run the full arbiters; final READY-TO-COMMIT + plan-status update
   (mark the phases completed in the status ledger).

ANCHORS: R-UI-2 section 3.2 step 5 and section 5 item 5; R-UI-3 section 1.4
options A/B; configEditor README (Known limitations);
dsh-base/cordis.patch.yml composes config-editor + settings (the bridge's
composition prerequisite).

## 3. Acceptance

- A7.1 Every plain knob in the R-UI-2 table is editable via the bridge
  with the remount marker and observable remount.
- A7.2 The bridge's write surface is documented as trusted-with-full-
  config; the least-privilege input validation is smoke-covered.
- A7.3 The Option B proposal exists as a precise upstream request (exact
  declaration text + render sites), and no priority shadowing of
  id=trajectory exists anywhere in family code.

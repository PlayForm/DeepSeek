---
title: The UI Family Implementation Plan - the risks and the mitigations
category: Plans/UI-Family
kind: queued-plan
date: 2026-10-20
status: planned
registry: Documentation/Plans/UI-Family/RISKS-AND-MITIGATIONS.md
index: Documentation/INDEX.md
statuses:
	- name: the risk register (eight risks)
		state: open
		evidence: this document - the mount-failure cause entry to be resolved in phase 0
---

# THE RISKS + THE MITIGATIONS

> Granular document of the UI Family Implementation Plan. The parent hub:
> Documentation/Plans/UI-FAMILY-IMPLEMENTATION-PLAN.md.

---

- **2.1 THE CLIENT-INSPECT TIMEOUT RESIDUAL**:
    - THE RISK: EVERY client-platform inspect query (Slots.listSubTree, Service.listService) times
      out when the GUI page is not open/connected.
    - THE MITIGATION: phase 0 step 4 makes "GUI open" a precondition. Every phase's live-verify step
      states it. If a query times out, fall back to the asar source + docs anchors (the method ALL
      four researches used) and retry with the page open. NEVER treat a timeout as proof of absence.
- **2.2 THE TYPORT DESCRIPTOR GENERATION**:
    - THE RISK: the remote descriptor generation pipeline lives in the harness repo. An external
      package must reproduce the build (adding-a-remote-api caveat).
    - THE MITIGATION: phase 5 step 1 is a standalone spike BEFORE ANY adapter work depends on it,
      with the pre-decided fallback (registry-only data, ledgers deferred). Budget: if the spike
      exceeds a session, take the fallback and record it.
- **2.3 THE MOUNT-FAILURE CLASS**:
    - THE RISK: a prior client install produced live-containers fiberPhase:failed - a live example
      of a client half failing at mount. Phase 0 step 3 investigates the cause (config-shape
      mismatch, client load error, or apply throw are the candidates).
    - THE MITIGATION: the throwaway install in phase 0 step 5 exercises the path before real work.
      Every install step phases 2-5 verifies the GUI row status immediately. A reproduced failure
      STOPS the phase (recorded here).
    - [TO BE RESOLVED IN PHASE 0 - the cause and the GUI error surface go here.]
- **2.4 THE MERMAID 12 RENDERER PINNED**:
    - THE RISK: ANY diagrams in docs/site content must render through the pinned Mermaid 12
      renderer.
    - THE MITIGATION: keep plan/diagram authoring ASCII-first (the plan is ASCII + tabs). When a
      Mermaid diagram is required (site pages), validate via the Line9 CLI per the flowchart-line9
      skill before the site build.
- **2.5 THE PLUGIN-TARGET FRESHNESS**:
    - THE RISK: the family's Target/ trees are build output. Stale Target content gets installed.
    - THE MITIGATION: EVERY install step runs Source/prepublishOnly.sh immediately before
      install_bundle. NEVER hand-edit Target/. The smokes run against the just-built tree.
- **2.6 THE RESTART-ONCE WINDOW (phase 3)**:
    - THE RISK: the client-half discovery happens on composition - the FIRST client-half install
      needs exactly ONE harness restart. A mid-restart state can look like the mount-failure class.
    - THE MITIGATION: do the restart at a known-good point (after the smokes are green), and verify
      the row status in the GUI immediately after.
- **2.7 THE SINGLE-CLIENT-FILE LIMIT**:
    - THE RISK: the lazy-CJS ./client files are hand-written single files. The coach's ladder +
      forms may outgrow hand-rolling.
    - THE MITIGATION: the pre-decided escalation path - add a clientBundle build step to the factory
      (the R-UI-2 build gap) once ANY client file exceeds hand-maintainable size, modeled on
      <DSH>/packages/client/tsdown.client.ts.
- **2.8 THE PROFILE-PATCH SINGLE POINT**:
    - THE RISK: ALL form writes target the active profile patch. A corrupted cordis.patch.yml breaks
      the whole profile.
    - THE MITIGATION: the form writes are revision-fenced and comment/!!js-preserving by
      construction (configEditor). Keep a pre-phase-3 copy of the patch for manual recovery
      (documented in the phase 3 step 6 verification).

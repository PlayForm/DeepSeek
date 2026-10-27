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

> This is a granular document of the UI Family Implementation Plan. The parent hub is
> Documentation/Plans/UI-FAMILY-IMPLEMENTATION-PLAN.md.

---

- **2.1 THE CLIENT-INSPECT TIMEOUT RESIDUAL**:
    - THE RISK: EVERY client-platform inspect query (Slots.listSubTree, Service.listService) times
      out when the GUI page is not open or connected.
    - THE MITIGATION: phase 0 step 4 makes "GUI open" a precondition, and every phase's live-verify
      step states it. If a query times out, fall back to the asar source and docs anchors, which is
      the method ALL four researches used, and retry with the page open. NEVER treat a timeout as
      proof of absence.
- **2.2 THE TYPORT DESCRIPTOR GENERATION**:
    - THE RISK: the remote descriptor generation pipeline lives in the harness repo, so an external
      package must reproduce the build (the adding-a-remote-api caveat).
    - THE MITIGATION: phase 5 step 1 is a standalone spike BEFORE ANY adapter work depends on it,
      with the pre-decided fallback of registry-only data and deferred ledgers. On budget, if the
      spike exceeds a session, take the fallback and record it.
- **2.3 THE MOUNT-FAILURE CLASS**:
    - THE RISK: a prior client install produced live-containers fiberPhase:failed, which is a live
      example of a client half failing at mount. Phase 0 step 3 investigates the cause, and the
      candidates are a config-shape mismatch, a client load error, and an apply throw.
    - THE MITIGATION: the throwaway install in phase 0 step 5 exercises the path before real work,
      and every install step in phases 2-5 verifies the GUI row status immediately. A reproduced
      failure STOPS the phase and is recorded here.
    - [TO BE RESOLVED IN PHASE 0 - the cause and the GUI error surface go here.]
- **2.4 THE MERMAID 12 RENDERER PINNED**:
    - THE RISK: ANY diagrams in docs or site content must render through the pinned Mermaid 12
      renderer.
    - THE MITIGATION: keep plan and diagram authoring ASCII-first, because the plan is ASCII with
      tabs. When a Mermaid diagram is required on a site page, validate it via the Line9 CLI per the
      flowchart-line9 skill before the site build.
- **2.5 THE PLUGIN-TARGET FRESHNESS**:
    - THE RISK: the family's Target/ trees are build output, and stale Target content gets
      installed.
    - THE MITIGATION: EVERY install step runs Source/prepublishOnly.sh immediately before
      install_bundle, and NEVER hand-edit Target/. The smokes run against the just-built tree.
- **2.6 THE RESTART-ONCE WINDOW (phase 3)**:
    - THE RISK: the client-half discovery happens on composition, so the FIRST client-half install
      needs exactly ONE harness restart, and a mid-restart state can look like the mount-failure
      class.
    - THE MITIGATION: do the restart at a known-good point after the smokes are green, and verify
      the row status in the GUI immediately after.
- **2.7 THE SINGLE-CLIENT-FILE LIMIT**:
    - THE RISK: the lazy-CJS ./client files are hand-written single files, and the coach's ladder
      plus forms may outgrow hand-rolling.
    - THE MITIGATION: use the pre-decided escalation path and add a clientBundle build step to the
      factory (the R-UI-2 build gap) once ANY client file exceeds hand-maintainable size, modeled on
      <DSH>/packages/client/tsdown.client.ts.
- **2.8 THE PROFILE-PATCH SINGLE POINT**:
    - THE RISK: ALL form writes target the active profile patch, so a corrupted cordis.patch.yml
      breaks the whole profile.
    - THE MITIGATION: the form writes are revision-fenced and comment- and !!js-preserving by
      construction (configEditor). Keep a pre-phase-3 copy of the patch for manual recovery,
      documented in the phase 3 step 6 verification.

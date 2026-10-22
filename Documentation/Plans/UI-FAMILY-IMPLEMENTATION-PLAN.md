---
title: The UI Family Implementation Plan - the hub
category: Plans
kind: queued-plan
date: 2026-10-20
status: superseded
registry: Documentation/Plans/UI-FAMILY-IMPLEMENTATION-PLAN.md
index: Documentation/INDEX.md
statuses:
    - name: the v4.1 distillation
      state: superseded
      evidence:
          Documentation/Plans/UI-FAMILY-V4-1.md - the distilled plan; this hub and the granular set
          remain the detailed record
    - name: the implementation plan (the expanded brief)
      state: open
      evidence: this document - awaiting the user's dispatch
    - name: the four research inputs (R-UI-1/2/3 + R-INTERACT)
      state: resolved
      evidence: Documentation/Researches - all four delivered
    - name: the central @playform/client-dsh-panel-family package
      state: open
      evidence: planned, no package exists
    - name: the 13 per-plugin client adapters
      state: open
      evidence: planned, no package exists
    - name: the tool-coach adapter (the first, with the marker-usage rule)
      state: open
      evidence: planned as the POC
    - name: the trajectory family tab (Option A)
      state: open
      evidence: planned; the upstream trajectory.sections declaration is Option B
    - name: the granular split of the plan (14 phase/topic documents)
      state: implemented
      evidence:
          Documentation/Plans/UI-Family/ - every phase, risk, extension, and appendix preserved
          byte-exact in its own document
---

# UI-FAMILY-IMPLEMENTATION-PLAN - THE HUB

The expanded, exact, step-by-step plan for implementing the researched DeepSeek Harness UI features
for the @playform plugin family. Written 2026-10-20 by the PLAN-EXPANDER explorer agent. ASCII +
tabs. This plan is the handoff document for a NEW conversation that begins implementation. This
document is the HUB: the plan was distilled into granular phase/topic-subdocuments under
Documentation/Plans/UI-Family/ - every step, anchor, acceptance line, risk, extension, and appendix
preserved in them; this hub holds the map.

Foundations (read these first, in this order):
Documentation/Researches/HARNESS-UI-PLUGIN-RESEARCH.md (R-UI-1: the Plugins page slots)
Documentation/Researches/HARNESS-UI-OPTIONS-RESEARCH.md (R-UI-2: the volatile config chain)
Documentation/Researches/HARNESS-UI-TRAJECTORY-RESEARCH.md (R-UI-3: the panel contract + adapters)
Documentation/Researches/FAMILY-INTERACTIONS-RESEARCH.md (R-INTERACT: the ccr truth + R1-R10)

## 1. The granular map

| Document                                                                               | Carries                                                                                                                  |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| [BRIEF.md](UI-Family/BRIEF.md)                                                         | the new-conversation brief: the state, the order, the routing law, the arbiters, the disciplines, the naming arbitration |
| [PHASE-0-ORIENTATION.md](UI-Family/PHASE-0-ORIENTATION.md)                             | orientation, the mount-failure investigation, the five live-inspect captures, the throwaway install                      |
| [PHASE-1-SITE-COMMIT.md](UI-Family/PHASE-1-SITE-COMMIT.md)                             | the site commit + push (READY-TO-COMMIT; possibly SKIPPED-CLEAN)                                                         |
| [PHASE-2-PANEL-CONTRACT.md](UI-Family/PHASE-2-PANEL-CONTRACT.md)                       | the central package @playform/client-dsh-panel-family: the contract types, the registry service, the mount points        |
| [PHASE-3-FIRST-ADAPTER.md](UI-Family/PHASE-3-FIRST-ADAPTER.md)                         | the coach: the ladder section, the form POC, the marker-usage rule (R5/R6)                                               |
| [PHASE-4-OPTIONS-FORMS.md](UI-Family/PHASE-4-OPTIONS-FORMS.md)                         | all volatile rows via whileServed; the roster, the badge, the section                                                    |
| [PHASE-5-ADAPTERS-AND-LEDGER-TAILS.md](UI-Family/PHASE-5-ADAPTERS-AND-LEDGER-TAILS.md) | the remaining 12 adapters; the Typert endpoint or the registry-only fallback                                             |
| [PHASE-6-INTERACTION-IMPROVEMENTS.md](UI-Family/PHASE-6-INTERACTION-IMPROVEMENTS.md)   | R1-R10 with additive smoke coverage only                                                                                 |
| [PHASE-7-PLAIN-FIELD-BRIDGE.md](UI-Family/PHASE-7-PLAIN-FIELD-BRIDGE.md)               | the plain-field bridge (editFull) + the Option B trajectory proposal                                                     |
| [RISKS-AND-MITIGATIONS.md](UI-Family/RISKS-AND-MITIGATIONS.md)                         | the eight risks (the inspect timeout, the Typert spike, the mount-failure class, the restart-once window...)             |
| [STATUS-LEDGER.md](UI-Family/STATUS-LEDGER.md)                                         | the plan status ledger (updated as phases complete)                                                                      |
| [EXTENSIONS.md](UI-Family/EXTENSIONS.md)                                               | the E1-E6 extensions beyond the core seven phases                                                                        |
| [APPENDIX-INSPECT-CAPTURES.md](UI-Family/APPENDIX-INSPECT-CAPTURES.md)                 | appendix A - the live inspect captures (filled in phase 0)                                                               |
| [ONE-PARAGRAPH-SUMMARY.md](UI-Family/ONE-PARAGRAPH-SUMMARY.md)                         | appendix B - what a fresh session must recite                                                                            |

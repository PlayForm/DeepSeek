---
title: The UI Family Implementation Plan - appendix B (the one-paragraph summary)
category: Plans/UI-Family
kind: queued-plan
date: 2026-10-20
status: planned
registry: Documentation/Plans/UI-Family/ONE-PARAGRAPH-SUMMARY.md
index: Documentation/INDEX.md
statuses:
	- name: the one-paragraph summary (what a fresh session must recite)
		state: resolved
		evidence: this document
---

# APPENDIX B - THE ONE-PARAGRAPH SUMMARY (WHAT A FRESH SESSION MUST RECITE)

> Granular document of the UI Family Implementation Plan.
> The parent hub: Documentation/Plans/UI-FAMILY-IMPLEMENTATION-PLAN.md.

---

Read the four research docs + the plan.
Route EVERY subagent to cloudflare-workers-ai / @cf/zai-org/glm-5.3-flash / low.
NEVER mutate git (READY-TO-COMMIT reports only).
Write files ONLY through the tool API.
The arbiters are the serialized build, the 207-suite runner with the expected-PASS guard, the site build verified on Target/, and the live client inspect with the GUI page OPEN.
Phase 0 resolves the mount-failure class and captures the live slot trees BEFORE ANY client half is written.
The central package is @playform/dsh-panel-family (contract-only) and the 13 adapters import its types ONLY.
The tool-coach is the FIRST adapter and carries the marker-usage rule.
The Typert endpoint is spiked standalone with the registry-only fallback pre-decided.
The trajectory screen stays untouched until upstream ships conversation.trajectory.sections.

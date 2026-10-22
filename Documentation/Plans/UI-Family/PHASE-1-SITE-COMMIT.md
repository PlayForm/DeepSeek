---
title: The UI Family Implementation Plan - phase 1 (the site commit + push)
category: Plans/UI-Family
kind: queued-plan
date: 2026-10-20
status: planned
registry: Documentation/Plans/UI-Family/PHASE-1-SITE-COMMIT.md
index: Documentation/INDEX.md
statuses:
	- name: the site commit + push (READY-TO-COMMIT package)
		state: open
		evidence: this document - possibly SKIPPED-CLEAN if the tree is already clean
---

# PHASE 1 - THE SITE COMMIT + PUSH

> Granular document of the UI Family Implementation Plan. The parent hub:
> Documentation/Plans/UI-FAMILY-IMPLEMENTATION-PLAN.md.

---

- **THE GOAL**: land the pending site delta (the research-era site changes, if any remain
  uncommitted; verify first). So the implementation phases start from a clean tree, and the site
  carries the family's new UI story when phases 2-5 land.
- **THE GIT LAW**: per the git law this phase PREPARES. The user commits.

## 1. Exact locations

- Site/ (the Astro tree; build outDir Site/Target)
- Site/Documentation/TRACKING.md (the batch feedback ledger)
- Documentation/Archive/Site/SITE-UPDATE-BLUEPRINT.md,
  Documentation/Archive/Site/SITE-UPDATE-NOTE.md

## 2. Exact steps

1. git status --porcelain and git log --oneline -10 (checks ONLY). If the tree is clean and HEAD
   contains the site work, mark this phase SKIPPED-CLEAN with the HEAD hash and move to phase 2.
2. If deltas exist: classify EACH file (site content / docs / family code) and group into ONE
   READY-TO-COMMIT package per logical unit. Suggested messages follow the repo convention seen in
   git log (e.g. "docs: Add UI-FAMILY-IMPLEMENTATION-PLAN for the UI expansion").
3. Verify the site builds BEFORE requesting the commit: cd Site && pnpm prepublishOnly, then grep
   the built Target/ for the changed content.
4. Report READY-TO-COMMIT to the user: exact file list + message(s) + the build evidence. The user
   commits and pushes. Do NOT run git add/commit/push under ANY circumstances.

ANCHORS: Documentation/Archive/Site/SITE-UPDATE-BLUEPRINT.md (the site's page inventory and lane
laws); session-orientation section 6 (the lane laws).

## 3. Acceptance

- A1.1 The working tree is clean (or SKIPPED-CLEAN is recorded) before phase 2 starts, with the
  READY-TO-COMMIT evidence in the phase report.
- A1.2 Site/Target contains the built verification for any changed content.

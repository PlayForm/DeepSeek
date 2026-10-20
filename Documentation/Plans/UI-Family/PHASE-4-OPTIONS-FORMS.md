---
title: The UI Family Implementation Plan - phase 4 (the options forms: all volatile rows)
category: Plans/UI-Family
kind: queued-plan
date: 2026-10-20
status: planned
registry: Documentation/Plans/UI-Family/PHASE-4-OPTIONS-FORMS.md
index: Documentation/INDEX.md
statuses:
	- name: the options forms (all volatile rows via whileServed)
		state: open
		evidence: this document - per-bundle client halves, the roster, the badge, the section
---

# PHASE 4 - THE OPTIONS FORMS: ALL VOLATILE ROWS

> Granular document of the UI Family Implementation Plan.
> The parent hub: Documentation/Plans/UI-FAMILY-IMPLEMENTATION-PLAN.md.

---

- **THE GOAL**: EVERY family bundle's volatile knobs become GUI-editable.
- **THE PROGRESSION**: phase 3 proved the pattern on ONE bundle. This
  phase replicates it across the rest and adds the aggregate panel.

## 1. Exact locations

- **THE CLIENT-HALF DECISION**: the client-half pattern is per-bundle,
  but the FORM machinery is shared. Decide (and record here) whether EACH
  bundle ships its own ./client or the central package registers forms
  for all rows. THE DECISION: per-bundle client halves (the R-UI-3
  architecture: visuals/config live in the owner; the central package
  stays contract-only). The forms use a small shared renderer copied per
  bundle via the family's build (NO runtime cross-import).
- **THE BUNDLES AND THEIR VOLATILE COVERAGE** (from R-UI-2 section 2):
  - hook-dsh-package-governor, hook-dsh-package-pinner,
    hook-dsh-cargo-governor - shared block knobs (log, logFile,
    updateCooldownMs, mutationTools)
  - hook-dsh-normalize-{dash,quotes,ellipsis,spaces,invisible,fullwidth}
    - 4-5 knobs each (log, logFile, replacement, normalizeReasoning,
    normalizeToolArguments where present)
  - hook-dsh-normalize-file - scopes + toolResultsExempt + replacement
  - hook-dsh-ccr - log, logFile, thresholdBytes, multipliers (whole
    object), previewMaxChars
  - hook-dsh-tool-coach - done in phase 3
  - hook-dsh-live-containers - ALL 28 knobs volatile
- **THE NAMESPACE LIST** for whileServed = the family's profile patch ids
  from phase 0 step 2.

## 2. Exact steps

1. Per bundle (one at a time, smallest first: normalize flavors -> the
   governors -> ccr -> live-containers):
   a. Add dsh.client + ./client to package.json.
   b. Register the plugins.row.config slot via whileServed for that
      bundle's row id; render the form from the descriptor (same renderer
      as phase 3).
   c. Additive smoke for the panel gate.
   d. Build; smokes; install; live-verify one knob per bundle end-to-end
      (patch override + no remount + refusal + persistence).
2. **THE STATUS STRIP**: EACH form shows form.state (writable/revision),
   the user-vs-base delta, and the applies:"live" marker. Subscribe
   settings/document-updated to refresh (R-UI-2 section 3.1 - this is the
   "per-plugin ledger/status display" WITHOUT ANY new backend).
3. **THE AGGREGATE**: ONE plugins.item entry (id "family-panel") in the
   central package listing ALL family namespaces under one view (read-only
   summary + deep links via pluginNavigation; editing stays per-row).
4. **THE BADGE**: plugins.detail.badge (id "playform-family-badge") - the
   "family" tag on EACH of the 13 bundle pages (R-UI-1).
5. **THE SECTION**: plugins.detail.section (id "playform-family") - the
   roster card on EVERY @playform bundle page. The 13 bundles grouped
   (factory / governors / normalize flavors / ccr / tool-coach). Live
   enabled states from remote.pluginManager + ctx.remote.$on("plugin-manager/changed").
   Deep links via pluginNavigation.openBundle (R-UI-1 section 3 - the
   central package hosts this; it is contract-adjacent UI, NOT adapter
   logic).
6. Update Documentation/Plugins/PLUGIN-FAMILY.md with the new UI surface.
   Bump the affected packages. READY-TO-COMMIT report.

ANCHORS: R-UI-2 sections 2-3 (the gap map + the design); the nine slots
(plugin-manager client.js:4411-4461); the coach's schema qualification as the
model case (R-UI-1 "Data surfaces confirmed live" - every knob x-cordis
volatile); configEditor's Known limitations (active patch only).

## 3. Acceptance

- A4.1 Every volatile knob of every family bundle (the R-UI-2 table's
  volatile column, cell by cell) is editable in the GUI and passes the
  four-point verification from phase 3 step 6.
- A4.2 The roster section + badge render on all 13 @playform bundle
  pages; non-@playform subjects render nothing.
- A4.3 Enable/disable of any family bundle reflects in the roster without
  a reload (plugin-manager/changed).
- A4.4 whileServed semantics: switching a row off removes its page; on
  restores it; no orphaned registrations.
- A4.5 The aggregate family-panel item lists all namespaces with correct
  provenance and deep links.
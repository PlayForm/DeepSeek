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

> This is a granular document of the UI Family Implementation Plan. The parent hub is
> Documentation/Plans/UI-FAMILY-IMPLEMENTATION-PLAN.md.

---

- **THE GOAL**: EVERY family bundle's volatile knobs become GUI-editable.
- **THE PROGRESSION**: phase 3 proved the pattern on ONE bundle, and this phase replicates it across
  the rest and adds the aggregate panel.

## 1. Exact locations

- **THE CLIENT-HALF DECISION**: the client-half pattern is per-bundle, but the FORM machinery is
  shared. Decide and record here whether EACH bundle ships its own ./client or the central package
  registers forms for all rows. THE DECISION: per-bundle client halves, following the R-UI-3
  architecture, where visuals and config live in the owner and the central package stays
  contract-only. The forms use a small shared renderer copied per bundle via the family's build,
  with NO runtime cross-import.
- **THE BUNDLES AND THEIR VOLATILE COVERAGE** (from R-UI-2 section 2):
    - hook-dsh-package-governor, hook-dsh-package-pinner, hook-dsh-cargo-governor - shared block
      knobs (log, logFile, updateCooldownMs, mutationTools)
    - hook-dsh-normalize-{dash,quotes,ellipsis,spaces,invisible,fullwidth}
        - 4-5 knobs each (log, logFile, replacement, normalizeReasoning, and normalizeToolArguments
          where present)
    - plugin-dsh-normalize-file - scopes + toolResultsExempt + replacement
    - hook-dsh-ccr - log, logFile, thresholdBytes, multipliers (whole object), previewMaxChars
    - hook-dsh-tool-coach - done in phase 3
    - hook-dsh-live-containers - ALL 28 knobs volatile
- **THE NAMESPACE LIST** for whileServed is the family's profile patch ids from phase 0 step 2.

## 2. Exact steps

1. **Do one bundle at a time, smallest first (normalize flavors, then the governors, then ccr, then
   live-containers).**

    - Add dsh.client and ./client to package.json.
    - Register the plugins.row.config slot via whileServed for that bundle's row id, and render the
      form from the descriptor with the same renderer as phase 3.
    - Add the additive smoke for the panel gate.
    - Build, run the smokes, install, and live-verify one knob per bundle end-to-end (patch
      override, no remount, refusal, and persistence).

2. **Add THE STATUS STRIP.**

    EACH form shows form.state (writable or revision), the user-versus-base delta, and the
    applies:"live" marker. Subscribe settings/document-updated to refresh (R-UI-2 section 3.1),
    which gives the "per-plugin ledger/status display" WITHOUT ANY new backend.

3. **Build THE AGGREGATE.**

    Add ONE plugins.item entry (id "family-panel") in the central package that lists ALL family
    namespaces under one view, with a read-only summary and deep links via pluginNavigation, while
    editing stays per-row.

4. **Add THE BADGE.**

    Use plugins.detail.badge (id "playform-family-badge") for the "family" tag on EACH of the 13
    bundle pages (R-UI-1).

5. **Add THE SECTION.**

    Use plugins.detail.section (id "playform-family") for the roster card on EVERY @playform bundle
    page, with the 13 bundles grouped into factory, governors, normalize flavors, ccr, and
    tool-coach. Show live enabled states from remote.pluginManager plus
    ctx.remote.$on("plugin-manager/changed"), and use deep links via pluginNavigation.openBundle
    (R-UI-1 section 3), which the central package hosts because it is contract-adjacent UI and NOT
    adapter logic.

6. **Update the family document and report.**

    Update Documentation/Plugins/PLUGIN-FAMILY.md with the new UI surface, bump the affected
    packages, and write the READY-TO-COMMIT report.

ANCHORS: R-UI-2 sections 2-3 (the gap map + the design); the nine slots (plugin-manager
client.js:4411-4461); the coach's schema qualification as the model case (R-UI-1 "Data surfaces
confirmed live" - every knob x-cordis volatile); configEditor's Known limitations (active patch
only).

## 3. Acceptance

- A4.1 Every volatile knob of every family bundle (the R-UI-2 table's volatile column, cell by cell)
  is editable in the GUI and passes the four-point verification from phase 3 step 6.
- A4.2 The roster section and badge render on all 13 @playform bundle pages, and non-@playform
  subjects render nothing.
- A4.3 Enable or disable of any family bundle reflects in the roster without a reload
  (plugin-manager/changed).
- A4.4 whileServed semantics hold: switching a row off removes its page, switching it on restores
  the page, and no orphaned registrations remain.
- A4.5 The aggregate family-panel item lists all namespaces with correct provenance and deep links.

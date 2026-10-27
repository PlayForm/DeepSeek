---
title: The UI Family Implementation Plan - the extensions beyond the phases
category: Plans/UI-Family
kind: queued-plan
date: 2026-10-20
status: planned
registry: Documentation/Plans/UI-Family/EXTENSIONS.md
index: Documentation/INDEX.md
statuses:
	- name: the extensions E1-E6 (beyond the core seven phases)
		state: open
		evidence: this document - the candidates ordered by value
---

# THE "MORE" - THE EXTENSIONS THE RESEARCHES SUGGEST (BEYOND THE PHASES)

> This is a granular document of the UI Family Implementation Plan. The parent hub is
> Documentation/Plans/UI-FAMILY-IMPLEMENTATION-PLAN.md.

---

- **THE ORDERING**: these candidates are ordered by value, and EACH one is a candidate follow-up
  phase rather than part of the core seven.

## E1 The family panel's data sources, deeper

- **THE LIVE LEDGERS' TAILS** via the host and the Typert endpoint: phase 5 handles the tails, and
  this extension adds FOLLOW mode (streaming updates on append) plus a cross-ledger search view (a
  grep-style filter over the combined tails).
- **THE FIBERPHASES** via the pluginManager remote: surface EACH family bundle's fiber status in the
  roster section (mount, failed, or running). This view turns the mount-failure class into a VISIBLE
  signal permanently.
- **THE KNOB FORMS** via the config schemas: the generic renderer is already built in phase 4, and
  the extension is autoGenerate consumption. If the harness later ships a generic auto-form
  consumer, the per-row registrations can collapse to ONE, which is a harness-side gap that is filed
  and not monkey-patched (R-UI-2 residual 1).

## E2 The coach's marker-usage rule (the phase 3 step 4 scope, expanded)

- Beyond R5/R6, a persistent-section line teaches the FULL ccr happy path (marker -> hash ->
  ccr_retrieve {hash, range?}) and the terminal_send parity (R7) as ONE grammar block, composed via
  config (the live-containers precedent, which is the coach README's profile patch pattern in
  R-INTERACT section 2.5).

## E3 The ccr_search tool (R1 expanded)

- The R1 ccr_list is read-only stats and listing, and the expansion is a real ccr_search over the
  STORE's payloads (substring or type filter) that keeps the ledgers out of it, because the ledgers
  stay grep-tool territory per R3.
- **THE GUARDS**: the change makes ZERO changes to existing ccr smoke assertions, and the store's
  LRU semantics stay untouched, so a search must NOT refresh lastAccessed.

## E4 The interaction documentation

- R-INTERACT section 2.5 records the friction that the coach and live-containers coupling is
  invisible in code, so this extension adds a short Documentation/Guides/FAMILY-COMPOSING.md that
  describes the load-order conventions (ccr before the normalize hooks, the marker guard) and the
  config-level couplings.

## E5 The detached panels

- R-UI-3's shell.overlay and sidebar.panellist mounts (the contract's "overlay" and "sidebar"
  PanelMounts) are the mount points that phase 2 builds. The extension is the sidebar panel that
  shows the roster plus the coach's strikes WITHOUT opening the Plugins page.

## E6 The ETS parity

- The EffectTS twins get the client halves ONLY after the Classic side is proven, because the client
  halves are platform code that is identical for BOTH trees and only the host halves differ.
- This work is a phase 8+ candidate, and do NOT mix the trees (the 25-package law).

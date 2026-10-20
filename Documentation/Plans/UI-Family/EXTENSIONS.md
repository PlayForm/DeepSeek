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

> Granular document of the UI Family Implementation Plan.
> The parent hub: Documentation/Plans/UI-FAMILY-IMPLEMENTATION-PLAN.md.

---

- **THE ORDERING**: ordered by value. EACH is a candidate follow-up
  phase, not in the core seven.

## E1 The family panel's data sources, deeper

- **THE LIVE LEDGERS' TAILS** via the host + Typert endpoint: phase 5
  does tails. The extension is FOLLOW mode (streaming updates on append)
  and cross-ledger search view (grep-style filter over the combined
  tails).
- **THE FIBERPHASES** via the pluginManager remote: surface EACH family
  bundle's fiber status in the roster section (mount/failed/running).
  This turns the mount-failure class into a VISIBLE signal permanently.
- **THE KNOB FORMS** via the config schemas: the generic renderer is
  already built in phase 4. The extension is autoGenerate consumption -
  if the harness later ships a generic auto-form consumer, the per-row
  registrations can collapse to ONE (a harness-side gap, filed not
  monkey-patched; R-UI-2 residual 1).

## E2 The coach's marker-usage rule (the phase 3 step 4 scope, expanded)

- Beyond R5/R6: a persistent-section line that teaches the FULL ccr
  happy path (marker -> hash -> ccr_retrieve {hash, range?}), and the
  terminal_send parity (R7) as ONE grammar block, composed via config
  (the live-containers precedent: the coach README's profile patch
  pattern, R-INTERACT section 2.5).

## E3 The ccr_search tool (R1 expanded)

- The R1 ccr_list is read-only stats + listing. The expansion is a real
  ccr_search over the STORE's payloads (substring/type filter), keeping
  the ledgers out of it (the ledgers stay grep-tool territory per R3).
- **THE GUARDS**: ZERO changes to existing ccr smoke assertions. The
  store's LRU semantics untouched (a search must NOT refresh
  lastAccessed).

## E4 The interaction documentation

- R-INTERACT section 2.5's friction (the coach/live-containers coupling
  is invisible in code): a short Documentation/Guides/FAMILY-COMPOSING.md
  describing the load-order conventions (ccr before the normalize hooks,
  the marker guard) and the config-level couplings.

## E5 The detached panels

- R-UI-3's shell.overlay / sidebar.panellist mounts (the contract's
  "overlay"/"sidebar" PanelMounts) - phase 2 builds the mount points. The
  extension is the sidebar panel showing the roster + the coach's strikes
  WITHOUT opening the Plugins page.

## E6 The ETS parity

- The EffectTS twins get the client halves ONLY after the Classic side is
  proven (the client halves are platform code, identical for BOTH trees;
  only the host halves differ).
- A phase 8+ candidate; do NOT mix the trees (the 25-package law).

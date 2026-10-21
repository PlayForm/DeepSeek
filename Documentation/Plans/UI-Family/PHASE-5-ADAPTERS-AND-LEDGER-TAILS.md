---
title: The UI Family Implementation Plan - phase 5 (the remaining adapters + the ledger tails)
category: Plans/UI-Family
kind: queued-plan
date: 2026-10-20
status: planned
registry: Documentation/Plans/UI-Family/PHASE-5-ADAPTERS-AND-LEDGER-TAILS.md
index: Documentation/INDEX.md
statuses:
	- name: the remaining 12 adapters + the host/Typert endpoint
		state: open
		evidence: this document - the standalone spike first, the registry-only fallback pre-decided
---

# PHASE 5 - THE REMAINING ADAPTERS + THE LEDGER TAILS (THE HOST/TYPORT ENDPOINT)

> Granular document of the UI Family Implementation Plan.
> The parent hub: Documentation/Plans/UI-FAMILY-IMPLEMENTATION-PLAN.md.

---

- **THE GOAL**: the remaining 12 bundles register their visual sections
  into the central registry, and the panel gains LIVE data - the ledger
  tails and fiberPhases - through a family-host Typert remote endpoint.

## 1. Exact locations

- **THE ADAPTERS** (each bundle's client half gains a section
  registration):
  - hook-dsh-cargo-governor / hook-dsh-package-governor /
    hook-dsh-package-pinner -> governor tails + activation lines
  - hook-dsh-ccr -> store stats (ccr.log tail; the LRU count via the new
    endpoint)
  - hook-dsh-live-containers -> live block board
  - hook-dsh-normalize-* (6) -> per-flavor counters
  - plugin-dsh-normalize-file -> normalization counts
  - lib-dsh-core / plugin-dsh-factory -> family roster / build info
- **THE ENDPOINT**: a family-host service in the central package (or a
  small companion @playform/client-dsh-panel-family-host) exposing @Remote
  methods: tail(namespace, lines) -> the last N lines of the owning
  module's ~/.dsh log; stats() -> the ccr store stats + the fiberPhases
  from remote.pluginManager (already remote - prefer it; no new endpoint
  for fiberPhases).
- **THE REMOTE CONTRACT** per <DOCS>/docs/cookbook/adding-a-remote-api.md:
  TypertRemoteService + @Remote decorators + RemoteError codes + generated
  descriptors - an external package must reproduce the generation
  pipeline (the documented caveat; budget real build time for it).

## 2. Exact steps

1. Build the Typert endpoint FIRST as a standalone spike (one method:
   tail("hook-dsh-tool-coach", 20)) following adding-a-remote-api.md's
   five steps. Prove the descriptor generation from an external package.
   If the generation cannot be reproduced outside the harness repo,
   record ESCALATE or fall back to the v1 shortcut (expose ONLY existing
   remote namespaces; ledgers deferred - the pre-decided fallback from
   R-UI-1 section 3).
2. On success, extend to the full endpoint: tail(namespace, lines) for
   EACH family log + storeStats() (ccr) + nothing else (least privilege;
   the endpoint reads ~/.dsh logs ONLY).
3. Wire the endpoint into the central client: ctx.remote.<namespace> +
   ctx.remote.$on for updates. Sections consume props.open + the tail
   data.
4. Implement the 12 adapters' sections (each in its OWN bundle's client
   half; visuals live in the owner; the central package renders whatever
   is registered).
5. Each adapter: additive smoke (panel gate + section data shape), build,
   smokes, install, live-verify (section renders; data refreshes while
   the page stays open; the bundle's disable removes ONLY its section).
6. The live-containers guard: its client half must NOT be enabled by
   default (the bundle's Config.enabled is false by design - idle-forever
   until explicit ACTIVATE). Its adapter section registers but renders an
   "activate to see live blocks" placeholder when the host module is
   idle.

ANCHORS: R-UI-3 section 2.3 (the per-bundle contributions map);
adding-a-remote-api.md (the five steps); R-UI-1 section 3 (the data sources);
remote.pluginManager / pluginInventory / pluginRegistryProbe (the injected
namespaces, plugin-manager client.js:4360-4366).

## 3. Acceptance

- A5.1 All 13 family sections render in the family tab (12 new + the
  coach), each gated by its own bundle's enabled state and panel.enabled.
- A5.2 At least one ledger tail (hook-dsh-tool-coach.log's last N lines)
  refreshes in the GUI while the page stays open (R-UI-1 A4).
- A5.3 The Typert endpoint reads only ~/.dsh family logs; no write
  surface.
- A5.4 The fallback decision (if step 1 failed) is recorded with evidence
  and the sections degrade to static/registry-only data without errors.

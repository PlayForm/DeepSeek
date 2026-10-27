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

> This is a granular document of the UI Family Implementation Plan.
> The parent hub is Documentation/Plans/UI-FAMILY-IMPLEMENTATION-PLAN.md.

---

- **THE GOAL**: the remaining 12 bundles register their visual sections into the central registry, and the panel gains LIVE data, which means the ledger tails and fiberPhases, through a family-host Typert remote endpoint.

## 1. Exact locations

- **THE ADAPTERS** (each bundle's client half gains a section registration):
    - hook-dsh-cargo-governor / hook-dsh-package-governor / hook-dsh-package-pinner -> governor tails + activation lines
    - hook-dsh-ccr -> store stats (ccr.log tail; the LRU count via the new endpoint)
    - hook-dsh-live-containers -> live block board
    - hook-dsh-normalize-* (6) -> per-flavor counters
    - plugin-dsh-normalize-file -> normalization counts
    - lib-dsh-core / plugin-dsh-factory -> family roster / build info
- **THE ENDPOINT**: a family-host service in the central package, or a small companion @playform/client-dsh-panel-family-host, exposing @Remote methods.
  tail(namespace, lines) returns the last N lines of the owning module's ~/.dsh log, and stats() returns the ccr store stats plus the fiberPhases from remote.pluginManager, which is already remote, so prefer it and add no new endpoint for fiberPhases.
- **THE REMOTE CONTRACT** per <DOCS>/docs/cookbook/adding-a-remote-api.md: TypertRemoteService, the @Remote decorators, RemoteError codes, and the generated descriptors.
  An external package must reproduce the generation pipeline, which is the documented caveat, so budget real build time for it.

## 2. Exact steps

1. **Build the Typert endpoint FIRST as a standalone spike.**

    Use one method, tail("hook-dsh-tool-coach", 20), and follow the five steps in adding-a-remote-api.md.
    Prove the descriptor generation from an external package.
    If the generation cannot be reproduced outside the harness repo, record ESCALATE or fall back to the v1 shortcut that exposes ONLY existing remote namespaces and defers the ledgers, which is the pre-decided fallback from R-UI-1 section 3.

2. **Extend to the full endpoint on success.**

    Provide tail(namespace, lines) for EACH family log plus storeStats() for ccr and nothing else, following least privilege, because the endpoint reads ~/.dsh logs ONLY.

3. **Wire the endpoint into the central client.**

    Use ctx.remote.<namespace> plus ctx.remote.$on for updates, and have the sections consume props.open plus the tail data.

4. **Implement the 12 adapters' sections.**

    Put each section in its OWN bundle's client half, because the visuals live in the owner and the central package renders whatever is registered.

5. **Verify each adapter.**

    Add the additive smoke (panel gate plus section data shape), then build, run the smokes, install, and live-verify that the section renders, that the data refreshes while the page stays open, and that the bundle's disable removes ONLY its section.

6. **Honor the live-containers guard.**

    Its client half must NOT be enabled by default, because the bundle's Config.enabled is false by design and stays idle-forever until an explicit ACTIVATE.
    Its adapter section registers but renders an "activate to see live blocks" placeholder when the host module is idle.

ANCHORS: R-UI-3 section 2.3 (the per-bundle contributions map); adding-a-remote-api.md (the five steps); R-UI-1 section 3 (the data sources); remote.pluginManager / pluginInventory / pluginRegistryProbe (the injected namespaces, plugin-manager client.js:4360-4366).

## 3. Acceptance

- A5.1 All 13 family sections render in the family tab (12 new plus the coach), and each one is gated by its own bundle's enabled state and panel.enabled.
- A5.2 At least one ledger tail (hook-dsh-tool-coach.log's last N lines) refreshes in the GUI while the page stays open (R-UI-1 A4).
- A5.3 The Typert endpoint reads only ~/.dsh family logs, with no write surface.
- A5.4 The fallback decision, if step 1 failed, is recorded with evidence, and the sections degrade to static or registry-only data without errors.

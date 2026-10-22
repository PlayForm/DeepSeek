---
title: The Batch Edit Tool - the commonality split (the live-view framework)
category: Plans/Batch-Edit-Tool
kind: research-report
date: 2026-10-20
status: researched
registry: Documentation/Plans/Batch-Edit-Tool/LIVE-VIEW-FRAMEWORK.md
index: Documentation/INDEX.md
statuses:
	- name: the live-view framework extraction
		state: open
		evidence: this document only - extraction waits for two consumers (the rule of three adjusted to two)
---

# THE BATCH EDIT TOOL - THE COMMONALITY SPLIT (THE LIVE-VIEW FRAMEWORK)

> Granular section of the Batch Edit Tool feature research (R-BET-1). The parent hub:
> Documentation/Plans/BATCH-EDIT-TOOL-FEATURE.md. This document carries section 5 of the research,
> byte-preserved.

---

What the live containers and the batch tool share, extracted into a separate package (the live-view
framework style - the foundation for the layered control). In representation terms (the
vision-and-representation document): the framework IS the substrate for MANAGING REPRESENTATIONS -
the license flow, the reconciliation discipline, and the eviction rule are framework-level; each
consumer plugin instantiates its own representation kind over it:

| Shared machinery                                                            | Lives in live containers today    | Framework extraction |
| --------------------------------------------------------------------------- | --------------------------------- | -------------------- |
| The state cells (per-agent keyed Maps, volatile refresh, staleness derived) | Interface/State.ts + Execution.ts | `live-view/state`    |
| The clock + the no-timers deadline scan                                     | Clock.ts, Board.ScanDeadlines     | `live-view/clock`    |
| The G2 jobs wrapper (one wrapper, N callers)                                | Jobs.ts                           | `live-view/jobs`     |
| The evented write wrapper around Factory.Write                              | Write path usage                  | `live-view/write`    |
| The P5-style storage domain open/recovery                                   | Storage.ts                        | `live-view/storage`  |
| The assemble section parts + collapse + silence invariant                   | Render.ts, Failsafe.Collapse      | `live-view/render`   |
| The report/manifest ingestion grammar                                       | Board.ts `[live-report]` fold     | `live-view/ingest`   |
| The lease (open/stale/close, rendered-once-then-withdrawn)                  | Board lease                       | `live-view/lease`    |
| The fail-open waterfall discipline + the arming gate                        | Apply.ts patterns                 | `live-view/wiring`   |

The framework is NOT a plugin - it is a LIBRARY package (`lib-dsh-live-view` per the naming
discussion, or `@playform/lib-dsh-live-view`): no Config, no apply; the live containers and the
batch edit tool (and every future control layer) depend on it and keep their OWN ledger strings,
tools, and configs (the module-leaves-never-absorbed rule). The extraction order: build the batch
tool against the live containers' patterns FIRST (no fork of shipped code), extract the framework
SECOND once two consumers exist - the standard rule of three, adjusted to two by the family's parity
discipline. The Classic and EffectTS variants each get the framework as a sibling package (the
split-never-mixed rule).

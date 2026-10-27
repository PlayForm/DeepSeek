---
title: The Batch Edit Tool - the state machine (the sponsored execution block)
category: Plans/Batch-Edit-Tool
kind: research-report
date: 2026-10-20
status: researched
registry: Documentation/Plans/Batch-Edit-Tool/STATE-MACHINE.md
index: Documentation/INDEX.md
statuses:
	- name: the events the machine consumes
		state: open
		evidence: this document only - the sponsor wiring for the not-yet-built tool
	- name: the events the machine emits (all through the evented write path)
		state: open
		evidence: this document only - Factory.Write and nothing else
	- name: the ledger lines (the contract)
		state: open
		evidence: this document only - byte-stable strings, one log per module
	- name: the silence invariant
		state: open
		evidence: this document only - a HARD contract with smoke assertions
---

# THE BATCH EDIT TOOL - THE STATE MACHINE (THE SPONSORED EXECUTION BLOCK)

> Granular section of the Batch Edit Tool feature research (R-BET-1). The parent hub:
> Documentation/Plans/BATCH-EDIT-TOOL-FEATURE.md. This document carries section 3 of the research,
> byte-preserved.

---

## 3.1 The events it consumes

- `fs/observed` (via Factory.Wire on the root context): any external touch of a held file flips its
  cell to a stale-halt, so the machine knows that the file moved underneath BEFORE it commits.
- `tools/pre-execute` / `tools/execute`: when the model still calls bash (sed/awk) on a HELD file,
  the machine intercepts the call, tags it, offers the batch path in the result prose (it never
  denies, because v1 is advisory and the control layer comes later as its own plugin), and records
  the attempt.
- `tools/post-execute`: file-tool facts (the L4 precedent).
- `agent/pre-step`: the turn boundary, which holds the deadline scan, the settle fold of in-flight
  jobs, and the pending-commit batch (L8/L6 precedent).
- jobs events: the settle truth of each per-file job (the G2 wrapper).
- `session/event`: cross-agent reports fold into the manifest of the machine (the planted-board
  precedent), so sub-agents can participate in a batch.

## 3.2 The events it emits (all through the evented write path)

Every file operation goes through **Factory.Write and nothing else**: intent -> (optional waterfall)
-> sandbox policy -> writeText (the fresh-stat version guard) -> Stash -> root `fs/observed` emit.

The consequences: the governors see the writes of the batch exactly as they see any write, with no
special path and no hidden writes, the own ledger of the machine records each transition (one log
per module, the strings contract of the family), and the assemble section of the machine re-renders
only on real events (the silence invariant).

## 3.3 The ledger lines (the contract)

```
machine opened <id> (<n> files, scope=<glob>)
inserted <file> at version <version>
transition running <file> op=<n>/<total>
transition applied <file> version <old> -> <new>
transition errored <file> <reason>
transition halted <file> <reason>          (stale | deadline | pause | interrupted)
machine committed <id> (<applied> applied, <failed> failed, <halted> halted)
machine closed <id>
```

## 3.4 The silence invariant

The text of the assemble section changes ONLY on machine open or close, insert or remove, transition
start, apply, halt, or error, and an external touch of a held file.

It never changes on the clock, never per request, and it carries no relative ages (the KV-cache
honesty, File-Monitors-Design section 5.2, verbatim).

An idle machine with no events produces byte-identical assemblies.

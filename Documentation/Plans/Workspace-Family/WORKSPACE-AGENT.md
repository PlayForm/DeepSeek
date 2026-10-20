---
title: The Workspace Family - the workspace agent (the operational view)
category: Plans/Workspace-Family
kind: living-plan
date: 2026-10-20
status: planned
registry: Documentation/Plans/Workspace-Family/WORKSPACE-AGENT.md
index: Documentation/INDEX.md
statuses:
	- name: the workspace agent (the only conversational surface)
		state: open
		evidence: this document + the parent hub - the operational view, the orchestration contract, the visibility rule
---

# THE WORKSPACE FAMILY - THE WORKSPACE AGENT (THE OPERATIONAL VIEW)

> Granular document of the Workspace Plugin Family Decomposition.
> The parent hub: Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md.

---

## 1. The package

`@playform/plugin-dsh-workspace` (THE WORKSPACE AGENT) - the OPERATIONAL
VIEW - what the conversation sees: the graph-like projection, the agent's
actions, the systematic self-correction; orchestrates every hook; its own
Config = the family's surface knobs; the INVISIBLE internals = the plugin
flow, governed by the plugin harness.

## 2. The orchestration contract

- THE WORKSPACE AGENT is the ONLY conversational surface: the agent
  addresses the workspace (open/insert/commit/pause/resume/close/state +
  the graph-like projection). Every hook answers through it.
- THE INVISIBLE FLOW: the observe stamps -> the semantics resolve -> the
  operate proposes -> the govern gates -> the authority licenses -> the
  approve binds -> the merge commits (through Factory.Write) -> the
  journal records -> the audit lines -> the live view presents - all
  evented by the plugin system (fs/observed, the tools' waterfalls, the
  lifecycle), all governed by the plugin harness.
- The distribution law: each commonality a separate package (never one
  batch-edit monolith); each package's Config + ledger strings + tools
  its own; the recursion prevention: every event carries the operation
  identifier, the parent identifier, the event category.

## 3. The visibility rule

What the conversation sees = the workspace's operational view (the graph-
like, systematically self-correcting). Everything else (the stamps, the
indexes, the validations, the licenses, the journals, the gates) is the
invisible plugin flow - the harness-governed machinery - until an event
surfaces it. THE LIVING SYSTEM: the graph interacts with itself through
the agent's actions - the corrections propagate, the dependencies
invalidate, the evictions settle - all evented, all governed.

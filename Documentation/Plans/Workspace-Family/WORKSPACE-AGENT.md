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
> THE FRAMING (binding): the workspace family is the DEEPSEEK HARNESS'S OWN
> REFACTORING into the WORKSPACE-CENTRIC RUNTIME, powered by the @playform
> plugin family - never a single plugin.

---

## 1. The package

- `@playform/plugin-dsh-workspace` (THE WORKSPACE AGENT) - the
  OPERATIONAL VIEW - what the conversation sees: the graph-like
  projection, the agent's actions, the systematic self-correction.
- It orchestrates EVERY hook.
- Its own Config = the family's surface knobs.
- The INVISIBLE internals = the plugin flow, governed by the plugin
  harness (the `plugin-dsh-*` service-provider role - the factory
  precedent).

## 2. The orchestration contract

- **THE ONLY CONVERSATIONAL SURFACE**: the agent addresses the workspace
  (open/insert/commit/pause/resume/close/state + the graph-like
  projection). Every hook answers through it.
- **THE INVISIBLE FLOW**: the observe stamps -> the semantics resolve ->
  the operate proposes -> the govern gates -> the authority licenses ->
  the approve binds -> the merge commits (through Factory.Write) -> the
  journal records -> the audit lines -> the live view presents - all
  evented by the plugin system (fs/observed, the tools' waterfalls, the
  lifecycle), all governed by the plugin harness.
- **THE DISTRIBUTION LAW**: each commonality a separate package (never
  one batch-edit monolith); each package's Config + ledger strings +
  tools its own; the recursion prevention: every event carries the
  operation identifier, the parent identifier, the event category.

## 3. The visibility rule

- **THE VISIBLE**: the workspace's operational view (the graph-like,
  systematically self-correcting).
- **THE INVISIBLE**: everything else (the stamps, the indexes, the
  validations, the licenses, the journals, the gates) is the invisible
  plugin flow - the harness-governed machinery - until an event surfaces
  it.
- **THE LIVING SYSTEM**: the graph interacts with itself through the
  agent's actions - the corrections propagate, the dependencies
  invalidate, the evictions settle - all evented, all governed.

## 4. The three regimes (the agent's place)

- **THE PHYSICAL REGIME (the OS)**: a file on any UNIX system IS a
  halted process - the dormant default - already true everywhere (the
  file-as-halted-process is NOT our invention).
- **THE EXECUTION REGIME (the language runtimes)**: the same file
  becomes a RUNNING process when a runtime executes it - the OS's own
  process notion - the EXECUTION axis.
- **THE WORKSPACE REGIME (our plugin family - NEW)**: enabling the
  plugin makes the file an OPERABLE process - the managed representation
  (the Process<File> cells: observed/running/halted/done/errored + the
  workspace verbs + the governance + the knowledge graph).
- **THE AGENT'S ROLE**: THE WORKSPACE AGENT is the workspace regime's
  conversational surface - the OPERABLE view the conversation addresses;
  the plugin creates the OPERABILITY, not the process-ness.
- **THE ORTHOGONALITY**: the two "running" senses are DIFFERENT AXES
  (the OS execution vs the workspace cell - orthogonal, never
  exclusive): a .rs file can be halted on disk + running under rustc +
  operable in the workspace SIMULTANEOUSLY. The operational mode
  determines the regime.
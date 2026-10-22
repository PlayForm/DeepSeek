---
title: The Workspace Family - the merge hook + the tool
category: Plans/Workspace-Family
kind: living-plan
date: 2026-10-20
status: planned
registry: Documentation/Plans/Workspace-Family/MERGE.md
index: Documentation/INDEX.md
statuses:
	- name: hook-dsh-workspace-merge
		state: open
		evidence: this document + the parent hub's family map
---

# THE WORKSPACE FAMILY - THE MERGE HOOK + THE TOOL

> Granular document of the Workspace Plugin Family Decomposition. The parent hub:
> Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md. THE FRAMING (binding): the workspace
> family is the DEEPSEEK HARNESS'S OWN REFACTORING into the WORKSPACE-CENTRIC RUNTIME, powered by
> the @playform plugin family - never a single plugin.

---

- **THE PACKAGE**: `@playform/hook-dsh-workspace-merge` - the EVENT HOOK
    - the tool.
- **THE ROLE** (the family map): the batch merge - the atomic gates, the per-file commits through
  Factory.Write, the all-or-nothing / survivors.
- **THE TOOLS' HOME**: the TOOLS live inside their owning hooks - the merge registers the workspace
  tools (per the family's pattern: the ccr registers `ccr_retrieve`).
- **THE ORCHESTRATION POSITION**: "the merge commits (through Factory.Write)" - the step after the
  approve binds in the invisible flow: ... -> the approve binds -> the merge commits (through
  Factory.Write) -> the journal records -> ...
- **THE REGIME**: the workspace regime (the third axis) - the merge is the workspace's COMMIT
  interaction (the CommitReply union: Applied / Conflict / Denied / Rejected / RecoveryRequired /
  OutcomeUnknown - the reply IS part of the type); the OS execution axis stays orthogonal (the merge
  writes through Factory.Write + the OS's sandbox/licensing stack - reality stays the main
  controller). The typing home: INVERSE-REPRESENTATION.md (the situated interaction protocols
  authoritative).
- **THE PHASED DELIVERY**: the merge is part of phase 1 - the v1 engine (the schema, the state
  machine, the per-file commits, the smokes with the fake clocks), with lib-dsh-workspace-live + the
  observe + the operate.
- **THE ATOMICITY SEMANTICS**: the atomic gates + the all-or-nothing / survivors policy decide how a
  batch lands - per-file commits through the factory's write machinery.
- **THE TWINS**: the Classic + ETS twins per the family contract.

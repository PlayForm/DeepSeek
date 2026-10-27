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

> This is a granular document of the Workspace Plugin Family Decomposition. The parent hub is
> Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md. THE FRAMING (binding): the workspace
> family is the DEEPSEEK HARNESS'S OWN REFACTORING into the WORKSPACE-CENTRIC RUNTIME, powered by
> the @playform plugin family, and never a single plugin.

---

- **THE PACKAGE**: `@playform/hook-dsh-workspace-merge`, the EVENT HOOK
    - the tool.
- **THE ROLE** (the family map): the batch merge, which holds the atomic gates, the per-file commits
  through Factory.Write, and the all-or-nothing or survivors policy.
- **THE TOOLS' HOME**: the TOOLS live inside their owning hooks, so the merge registers the
  workspace tools, per the family's pattern where the ccr registers `ccr_retrieve`.
- **THE ORCHESTRATION POSITION**: "the merge commits (through Factory.Write)" is the step after the
  approve binds in the invisible flow: ... -> the approve binds -> the merge commits (through
  Factory.Write) -> the journal records -> ...
- **THE REGIME**: the merge works in the workspace regime (the third axis) as the workspace's COMMIT
  interaction, which carries the CommitReply union (Applied, Conflict, Denied, Rejected,
  RecoveryRequired, OutcomeUnknown), where the reply IS part of the type. The OS execution axis
  stays orthogonal, because the merge writes through Factory.Write and the OS's sandbox and
  licensing stack, and reality stays the main controller. The typing home is
  INVERSE-REPRESENTATION.md, where the situated interaction protocols are authoritative.
- **THE PHASED DELIVERY**: the merge is part of phase 1, the v1 engine (the schema, the state
  machine, the per-file commits, and the smokes with the fake clocks), together with
  lib-dsh-workspace-live, the observe, and the operate.
- **THE ATOMICITY SEMANTICS**: the atomic gates and the all-or-nothing or survivors policy decide
  how a batch lands, through per-file commits in the factory's write machinery.
- **THE TWINS**: the Classic and ETS twins follow the family contract.

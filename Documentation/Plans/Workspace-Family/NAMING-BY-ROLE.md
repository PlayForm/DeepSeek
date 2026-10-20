---
title: The Workspace Family - the naming by role
category: Plans/Workspace-Family
kind: living-plan
date: 2026-10-20
status: planned
registry: Documentation/Plans/Workspace-Family/NAMING-BY-ROLE.md
index: Documentation/INDEX.md
statuses:
	- name: the naming by role (refined - they are NOT all hooks)
		state: resolved
		evidence: this document - the five role prefixes
---

# THE WORKSPACE FAMILY - THE NAMING BY ROLE

> Granular document of the Workspace Plugin Family Decomposition.
> The parent hub: Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md.
> THE FRAMING (binding): the workspace family is the DEEPSEEK HARNESS'S OWN
> REFACTORING into the WORKSPACE-CENTRIC RUNTIME, powered by the @playform
> plugin family - never a single plugin.

---

- **THE PROBLEM (refined 2026-10-20)**: the family's existing conventions
  distinguish the package roles; the blanket `hook-` prefix was WRONG for
  the service + library + client members.
- **THE FIVE ROLE PREFIXES** (the naming contract, one prefix per role):

| Prefix | Role | The precedent |
|---|---|---|
| `plugin-dsh-*` | the SERVICE PROVIDERS + the agent | the factory - the shared services the others consume |
| `hook-dsh-*` | the EVENT HOOKS | the listeners the events fire |
| `client-dsh-*` | the UI/CLIENT halves | the browser half |
| `lib-dsh-*` | the LIBRARIES | no Config/apply; the consumers keep their own ledger strings, tools, configs; the module leaves never absorbed |

- **THE TOOLS' HOME**: the TOOLS live inside their owning hooks (per the
  family's pattern: the ccr registers `ccr_retrieve`) - the operate/merge
  register the workspace tools.
- **THE TWINS**: the Classic + ETS twins per the family contract - every
  workspace package ships both trees.

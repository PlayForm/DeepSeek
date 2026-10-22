---
title: The Workspace Family - the databases and the cloud (the harness lifted)
category: Plans/Workspace-Family
kind: living-plan
date: 2026-10-20
status: planned
registry: Documentation/Plans/Workspace-Family/DATABASES-AND-CLOUD.md
index: Documentation/INDEX.md
statuses:
	- name: the storage-agnostic inverse representation (the databases + the cloud)
		state: open
		evidence: this document - the storage adapters + the remote block feeds
---

# THE WORKSPACE FAMILY - THE DATABASES AND THE CLOUD (THE HARNESS LIFTED)

> Granular document of the Workspace Plugin Family Decomposition. The parent hub:
> Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md. THE FRAMING (binding): the workspace
> family is the DEEPSEEK HARNESS'S OWN REFACTORING into the WORKSPACE-CENTRIC RUNTIME, powered by
> the @playform plugin family - never a single plugin.

---

- **THE STORAGE-AGNOSTIC REPRESENTATION**: DIFFERENT DATABASES can power and connect the
  representation - the inverse representation is storage-agnostic: the local fs/observed events OR
  the remote block-based feeds.
- **THE HARNESS LIFTED**: the harness can be LIFTED ONTO THE CLOUD and fed data other than the
  normal files - the "artifact-like", block-based feeds, powered by the cloud or a remote system.
- **THE STORAGE ADAPTERS**: the representation store, the semantic index, the evidence objects, the
  journals all have their storage adapters - the SQLite, the Postgres, the object stores, the remote
  block stores.
- **THE EVENT SPONSORSHIP EXTENSION**: the events' sponsorship extends to the remote sources - the
  remote blocks emit their events through the SAME event system (the fs/observed chain's
  filesystem-centricity is a logged pitfall - the remote extension is the fix).

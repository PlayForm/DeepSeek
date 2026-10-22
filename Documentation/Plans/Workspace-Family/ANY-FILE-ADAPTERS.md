---
title: The Workspace Family - the any-file adapters (not just .ts)
category: Plans/Workspace-Family
kind: living-plan
date: 2026-10-20
status: planned
registry: Documentation/Plans/Workspace-Family/ANY-FILE-ADAPTERS.md
index: Documentation/INDEX.md
statuses:
	- name: the any-file adapters (per-type knowledge graphs)
		state: open
		evidence: this document - the adapter contract: observe/propose/reconcile
	- name: the code block as the universal atom (the main evidence)
		state: resolved
		evidence: this document - start small with the code blocks + expand
---

# THE WORKSPACE FAMILY - THE ANY-FILE ADAPTERS (NOT JUST .TS)

> Granular document of the Workspace Plugin Family Decomposition. The parent hub:
> Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md. THE FRAMING (binding): the workspace
> family is the DEEPSEEK HARNESS'S OWN REFACTORING into the WORKSPACE-CENTRIC RUNTIME, powered by
> the @playform plugin family - never a single plugin.

---

- **THE SCOPE**: the system applies to ANY TYPE of halted process - the .ts files (the TypeScript
  language service), the .rs files (the rust-analyzer), the .docx files (the OOXML/word processing),
  the images, the binaries, the data files.
- **THE REGIME**: the workspace regime (the third axis) - the adapters make ANY file type OPERABLE
  in the workspace (the file's knowledge graph); the OS execution axis stays orthogonal (a .rs file
  runs under rustc in the execution regime while its adapter serves the workspace regime).
- **THE MANTRA**: THINK ADAPTERS, THINK GRAPHS, THINK METHODOLOGY - each file type gets its adapter
  that produces the file's KNOWLEDGE GRAPH (the blocks + the references + the semantics + the
  dependencies).
- **THE MAIN EVIDENCE**: THE CODE BLOCK - the universal atom - start small with the code blocks +
  expand from there.
- **THE RESULT**: each file = a knowledge graph, managed by code fully (powered by the DeepSeek
  Harness).
- **THE ADAPTER'S CONTRACT** (the three verbs):
    - **observe** - the file's representation;
    - **propose** - the operations the type supports (rename/connect/ replace/transform per the
      type's semantics);
    - **reconcile** - the applied results.

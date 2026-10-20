---
title: The Workspace Family - the inverse representation (the user's paradigm)
category: Plans/Workspace-Family
kind: living-plan
date: 2026-10-20
status: planned
registry: Documentation/Plans/Workspace-Family/INVERSE-REPRESENTATION.md
index: Documentation/INDEX.md
statuses:
	- name: the inverse representation of the UNIX filesystem
		state: resolved
		evidence: this document + the parent hub - the roles inverted: the file holds the process, the state holds the file
---

# THE WORKSPACE FAMILY - THE INVERSE REPRESENTATION (THE USER'S PARADIGM)

> Granular document of the Workspace Plugin Family Decomposition.
> The parent hub: Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md.
> THE FRAMING (binding): the workspace family is the DEEPSEEK HARNESS'S OWN
> REFACTORING into the WORKSPACE-CENTRIC RUNTIME, powered by the @playform
> plugin family - never a single plugin.
> The user's paradigm (2026-10-20 - binding).

---

- **THE CORE IDEA**: the workspace is an INVERSE REPRESENTATION of the
  standard UNIX filesystem.
- **THE STANDARD VIEW**: the files are the passive bytes; the tools are
  the active operators.
- **THE INVERSE VIEW**: the files are the ACTIVE PROCESSES (the knowledge
  graphs, the halted processes), and the harness's managed state is the
  substrate.
- **THE ROLE INVERSION**: the representation INVERTS the roles - the
  file holds the process, the state holds the file.
- **THE THREE REGIMES** (the user's delineation, 2026-10-20 - binding):
  - **THE PHYSICAL REGIME (the OS)**: a file on any UNIX system IS a
    halted process - the dormant default - already true everywhere. The
    file-as-halted-process is NOT our invention; it is the OS's own
    truth.
  - **THE EXECUTION REGIME (the language runtimes)**: the same file
    becomes a RUNNING process when a runtime executes it - the OS's own
    process notion - the EXECUTION axis (the OS process, not the
    workspace cell).
  - **THE WORKSPACE REGIME (our plugin family - NEW)**: enabling the
    plugin makes the file an OPERABLE process - the managed
    representation (the Process<File> cells:
    observed/running/halted/done/errored + the workspace verbs + the
    governance + the knowledge graph). What we build = the workspace
    regime - THE THIRD AXIS.
- **THE CONTRADICTIONS RESOLVED**: the plugin creates the OPERABILITY,
  not the process-ness. The two "running" senses are DIFFERENT AXES (the
  OS execution vs the workspace cell - orthogonal, never exclusive): a
  .rs file can be halted on disk + running under rustc + operable in the
  workspace SIMULTANEOUSLY. The operational mode determines the regime;
  what exists today = the physical + execution regimes; what we build =
  the workspace regime.
- **THE CONNECTED FRAMINGS** (the naming candidates, the hub): THE
  LIVING FILESYSTEM (the files as the active processes - the reversed
  UNIX view) + THE PROCESS-CENTRIC HARNESS (the halted processes as the
  first-class citizens - Process<Halted>) + THE INVERSE FILESYSTEM (the
  roles inverted - the files act, the state holds) - the final name is
  the user's choice (the RATIFICATION in the hub).
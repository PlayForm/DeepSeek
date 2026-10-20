---
title: The Batch Edit Tool - the filesystem-in-state presentation
category: Plans/Batch-Edit-Tool
kind: research-report
date: 2026-10-20
status: researched
registry: Documentation/Plans/Batch-Edit-Tool/STATE-PRESENTATION.md
index: Documentation/INDEX.md
statuses:
	- name: the filesystem-in-state presentation (the why's schema)
		state: open
		evidence: this document only - the assemble section the model reads instead of ls/cat/grep
---

# THE BATCH EDIT TOOL - THE FILESYSTEM-IN-STATE PRESENTATION

> Granular section of the Batch Edit Tool feature research (R-BET-1).
> The parent hub: Documentation/Plans/BATCH-EDIT-TOOL-FEATURE.md.
> This document carries section 4 of the research, byte-preserved.

---

The state presentation is the machine's third face (besides the batch and
the process states) - the assemble section the model reads instead of
running `ls`/`cat`/`grep`:

```
--- FILE MACHINE <id> (held processes; recomputed on events) ---
HELD: 4
	[done]     src/App.ts        v12  (2 ops applied)
	[observed] src/util.ts       v7
	[halted]   src/index.ts      v3   stale - touched externally at v4; resume to re-base
	[errored]  src/missing.ts         not found at insert
SCOPE: src/**  OFF-LIMITS: none
SEARCHES: 2   PENDING OPS: 5
--- END FILE MACHINE <id> ---
```

The reads of held files flow through the harness's freshness path (a read
emits a present fs/observed - filesystem.md:224), so the presentation's
versions are the truth the guarded writes will accept. The LLM sees the
file system's held state first; the bash/tool calls become the escape hatch,
then (the layered-government roadmap) the controlled exception, per control
layer, one plugin each.

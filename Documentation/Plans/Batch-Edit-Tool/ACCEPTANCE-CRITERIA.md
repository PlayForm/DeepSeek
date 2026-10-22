---
title: The Batch Edit Tool - the acceptance criteria
category: Plans/Batch-Edit-Tool
kind: research-report
date: 2026-10-20
status: researched
registry: Documentation/Plans/Batch-Edit-Tool/ACCEPTANCE-CRITERIA.md
index: Documentation/INDEX.md
statuses:
	- name: the acceptance criteria (10 checks)
		state: open
		evidence: this document only - the checks the implementation must satisfy
---

# THE BATCH EDIT TOOL - THE ACCEPTANCE CRITERIA

> Granular section of the Batch Edit Tool feature research (R-BET-1). The parent hub:
> Documentation/Plans/BATCH-EDIT-TOOL-FEATURE.md. This document carries section 7 of the research,
> byte-preserved.

---

1. The plugin loads by the contract (name/apply/Config/inject on the default object), disabled by
   default, and fails loud on invalid config.
2. `batch_edit open` inserts files; every held file appears in the state presentation with its held
   version; misses are listed, not guessed.
3. `batch_edit commit` applies the transition table through Factory.Write ONLY: every write is
   visible as fs/observed on the root context, every governed basename is governed exactly once (the
   govern marker route), and the preview diffs match the applied result byte-for-byte.
4. A held file touched externally between insert and commit HALTS its process with the stale reason;
   the machine stays open; the agent resumes it explicitly.
5. A commit exceeding the deadline returns the typed background jobId and the settle truth arrives
   through the jobs subscription and the next presentation - no plugin-owned timers anywhere.
6. The silence invariant holds: an idle machine renders byte-identical assemblies across requests
   (smoke-asserted).
7. The ledger carries every ledger-line contract entry, byte-stable strings, one log per module.
8. The Classic and EffectTS variants ship with parity smokes; the live-view extraction waits for two
   consumers and keeps the modules' ledger strings in the modules.
9. The bash-intercept (v1 advisory) tags sed/awk calls on held files and offers the batch path
   without ever denying; enforcement stays out of scope for this plugin.
10. Zero writes outside Factory.Write and the plugin's own ledger.

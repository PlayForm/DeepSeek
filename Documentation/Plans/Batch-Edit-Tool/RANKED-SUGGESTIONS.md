---
title: The Batch Edit Tool suggestions - the ranked suggestion set for the implementation agent
category: Plans/Batch-Edit-Tool
kind: living-record
date: 2026-10-20
status: active
registry: Documentation/Plans/Batch-Edit-Tool/RANKED-SUGGESTIONS.md
index: Documentation/INDEX.md
statuses:
	- name: the ranked suggestion set for the implementation agent (agent 3)
		state: ready
		evidence: this document - 14 ranked suggestions with costs
	- name: the package shape suggestion (hook-dsh-batch-edit + the ETS twin)
		state: designed
		evidence: this document
---

# THE RANKED SUGGESTION SET FOR THE IMPLEMENTATION AGENT (AGENT 3)

> Granular section of the Batch Edit Tool suggestions research (R-BET-2).
> The parent hub: Documentation/Plans/BATCH-EDIT-TOOL-SUGGESTIONS.md.
> This document carries section 5 of the research, byte-preserved.

---

The ranking: (the paradigm correctness x the user's stated intent) first, the
trust/rollback guarantees second, the ergonomics third, the deferred ambition
last. The cost scale: S = the days-scale engine work on the existing patterns;
M = a wave of its own (the new module + the storage domain or the section
renderer + the smokes); L = the new machinery beyond the family's precedents.

	RANK  SUGGESTION                                           COST
	----  ---------------------------------------------------  ----
	1     THE ENGINE CORE: the Process<Halted> state machine
	      + the spawn/observe/transform/merge/release verbs
	      + the agent-prepared schema (the schema ergonomics) + the one-shot
	      search form + the dry-run flag. Everything else
	      hangs off this. The type system FIRST.               S-M
	2     THE GOVERNED MERGE: every file merge rides the
	      existing fs/observed chain + the batch lifecycle
	      events in the event system; the content-mutating
	      family stays non-detachable. The silence
	      discipline: the batch is tracked, never silent.      S
	3     THE ATOMIC MERGE GATE + the survivors/all-or-
	      nothing semantics: the batch completes or
	      the batch does not exist.                            S
	4     THE UNDO JOURNAL: the new storage domain
	      batch_edit_journal (the D3/M5 pattern: a new
	      domain name, one table, the plugin-owned schema,
	      the invalidRecords backup-and-skip) + revert
	      batch/file + the smokes.                             M
	5     THE STAGED PIPELINE form: plan -> review -> apply
	      with the re-validation on apply (the observe-stamp
	      freshness check) + the diff-aware per-file patches
	      (forms 2 + 9).                                       M
	6     THE LIVE VIEW: the open-batch section in the
	      system-prompt/assemble waterfall (the stable-
	      until-event stanza, the IDLE-forever posture,
	      byte-identical when no batch is open).               M
	7     THE INTERACTIVE CONFIRMATION checkpoints: the
	      per-op confirm field + the ask decision at the
	      merge checkpoints (form 4).                          S
	8     THE MONITOR/SWEEP forms: the batch holds a lease,
	      the wave-3 monitor machinery rides in verbatim
	      (the check runner sharing, the clock-based
	      schedule, the no-real-timers rule) (forms 7+8).      M
	9     THE PROCESS-TREE EDGES: the declared file
	      dependencies ordering the merge + the dependent
	      error propagation (the living-being document).       M
	10    THE OWNERSHIP LEASE with the TTL + the planted-
	      lease inheritance for the multi-agent batches.       S-M
	11    THE TWO TWINS: the Classic package first, then the
	      byte-identical-ledger ETS twin (the D2 1.1 split
	      discipline). NOT optional - the family contract.     M
	12    THE EVENT-SOURCED DEEPENING: the per-op event log
	      + the arbitrary time-travel folds. DEFERRED
	      - the journal already buys the rollback; earn the
	      schema before the time machine.                      L
	13    THE GOVERNMENT STACK: the five control layers
	      (the forms-and-governance-layers document:
	      observation / constraint / permission /
	      rollback / audit) as INDEPENDENTLY-ENABLED plugin
	      modules, each fail-open, each with its own ledger
	      line - the user's "a plugin for each layer". The
	      v1 ships the constraint + audit layers bound (the
	      engine cannot exist without them); the permission
	      + rollback + observation layers grow per the
	      ranks 4, 7, 6 above.                                 M
	14    THE ESCAPE-ELIMINATION TRACKING: the per-batch
	      ledger records the CALLS REPLACED (the round-trips
	      saved, the escaped-call count avoided) so the
	      tool-elimination direction (the why's
	      consequence b) is MEASURED,
	      not asserted - the harness-as-DSL adoption curve
	      visible in the same ledger the governors hold.       S

The package shape suggestion: ONE plugin (hook-dsh-batch-edit + the ETS twin)
following the hook-dsh-live-containers anatomy (the Config/Catalog/Apply/
Render split, the smokes as the arbiter, the ledger-string contract, the
tabs discipline), NOT a bash-wrapper: the engine is in-container state, the
shell is only the check runner's carrier.

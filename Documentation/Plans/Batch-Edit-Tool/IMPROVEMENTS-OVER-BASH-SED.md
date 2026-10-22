---
title: The Batch Edit Tool suggestions - the improvements over bash-sed and manual edits
category: Plans/Batch-Edit-Tool
kind: living-record
date: 2026-10-20
status: active
registry: Documentation/Plans/Batch-Edit-Tool/IMPROVEMENTS-OVER-BASH-SED.md
index: Documentation/INDEX.md
statuses:
	- name: the improvements over bash-sed and manual edits (seven facets)
		state: designed
		evidence: this document - atomicity, rollback, governance, ledger, live view, schema ergonomics, honest accounting
---

# THE IMPROVEMENTS OVER BASH-SED AND MANUAL EDITS

> Granular section of the Batch Edit Tool suggestions research (R-BET-2).
> The parent hub: Documentation/Plans/BATCH-EDIT-TOOL-SUGGESTIONS.md.
> This document carries section 3 of the research, byte-preserved.

---

## 3.1 The atomicity: the all-or-nothing batches

bash-sed across N files has zero atomicity: the middle of the loop dies and
the tree is half-mutated, unremembered. The batch engine loads every file into
the state machine, applies the ops IN MEMORY, and merges only when ALL files
validate. One bad file = one typed error + the whole batch either completes on
the survivors (the config choice) or rolls back entirely. Rationale: the
agent's failure mode with bash is precisely the partial state it cannot see;
the batch makes the partial state unrepresentable. Cost: S (the engine's
merge gate) - the rollback journal below is the shared prerequisite.

## 3.2 The rollback: the undo journal

Every merge writes a journal record: the batch id, the file, the pre-image
hash + the content (or the reverse patch), the ops applied, the settle time.
`revert <batchId>` or `revert <batchId> <file>` replays backward. This is the
manual edit's missing superpower: the manual edit tool has no undo across
calls; the batch remembers. The storage discipline per the family (the D3/M5
decision): a NEW storage domain (e.g. `batch_edit_journal`), ONE table, the
record schema owned by the plugin, the invalidRecords backup-and-skip - NEVER
an extension record in the shared package_governance domain (the v3 bump blast
radius). Cost: M (the domain + the revert path + the smokes).

## 3.3 The governance integration: the governors see EVERY edit in the batch

The batch's merge path must emit through the EXISTING chain: each file's
merge fires the fs/observed event the governor/pinner/normalize family
consumes, so the governors see every edit in the batch - one event per file,
fully propagated, the silence discipline preserved (the batch NEVER
bypasses the chain by writing outside the governed path). This is the
directive's "fully propagated + controlled by the plugin system - sponsored/
tracked/evented by the event system": each batch is a tracked entity with its
own event lines (the batch lifecycle events: spawned/op-applied/settled/
errored/reverted), and the per-batch ledger lines fold into the governance
ledger the way the live containers fold into the plugin_governance domain.
Rationale: a batch tool that writes raw bytes would be the FIRST plugin in
the family to orphan the governors - the direct-govern steps exist precisely
to prevent this. Cost: S (the merge already goes through the governed path;
the event lines are additive).

## 3.4 The ledger: the per-batch lines

One batch = a bounded ledger block: the batch id, the form, the file count,
the op count, the match counts, the settle/errored/reverted tallies. Rendered
in the tool result (the model sees the truth) and folded into the governance
storage (the user sees the history). The KV-cache honesty rule from D3
applies verbatim: the batch stanza is stable-until-event - its text changes
only on the batch lifecycle events, never on the clock, no relative ages.

## 3.5 The visibility: the live view, framework-style

The open batch renders as a LIVE section in the prompt (the live-containers
channel: the system-prompt/assemble waterfall, the append-only section, the
TTL cache): the spawned file table, the running ops, the match counts, the
settle state. The framework-style live view means the agent SEES its own
batch as a running process - the same paradigm, rendered. The command
precedent is the live containers' board stanza. Cost: M (the section renderer
+ the invalidation on the batch events; the IDLE-forever posture: the section
renders NOTHING until a batch is open, byte-identical behavior otherwise).

## 3.6 The schema ergonomics: the agent's self-prepared schema

The directive: "the schema the agent prepares". The tool's INPUT stays tiny -
the batch is declared by the agent in one structured argument:

	batch {
		id:          the agent-chosen id (the re-entrancy key)
		form:        one-shot | pipeline | monitor | sweep
		files:       the spawn set (the paths or the glob results from the
		             search form)
		ops:         per file: search/replace/patch/validate ops
		atomity:     all-or-nothing | survivors
		confirm:     the checkpoint list (optional)
		monitor:     the check set + the interval (the monitor/sweep forms)
	}

The agent prepares the whole schema; the plugin validates it against ITS
Config contract and rejects the unknown fields with the typed error. The tool
result stays canonical (the marker grammar discipline: the bounded, byte-exact
band the smokes assert). Rationale: the bash-sed alternative makes the agent
compose the semantics in SHELL (the fragile part); the batch makes the
semantics a typed value the plugin validates. Cost: S (the schema + the
validator; the zod/schemastery precedent).

## 3.7 The honest accounting: why this beats the status quo, precisely

	vs bash-sed:     atomicity (3.1), rollback (3.2), governance (3.3),
	                 version safety (the observe-stamp vs the race), the
	                 structured result (no stdout parsing), the schema
	                 validation (3.6), the live view (3.5).
	vs manual edits: the N-file scale, the cross-file consistency (the
	                 process-tree ordering), the journal, the per-batch
	                 ledger, the single tool call vs N tool calls (the
	                 token economics: one batch call replaces a run of
	                 read+edit round-trips. The measured runs reach 10-17
	                 on ONE file; the wide sweep averages about one
	                 mutation per file, so the round-trip saving is the
	                 narrow-rewrite shape's, not the sweep's -
	                 TRAJECTORY-EVIDENCE.md section 6).
	vs the status quo's hidden cost: the governor chain is ALREADY paid for;
	                 the batch rides it instead of bypassing it. bash-sed is
	                 the expensive option when governance is counted.

---
title: The Batch Edit Tool suggestions - the forms and the governance layers
category: Plans/Batch-Edit-Tool
kind: living-record
date: 2026-10-20
status: active
registry: Documentation/Plans/Batch-Edit-Tool/FORMS-AND-GOVERNANCE-LAYERS.md
index: Documentation/INDEX.md
statuses:
	- name: the variant/form set (nine forms)
		state: designed
		evidence: this document - one engine, forms as configurations
	- name: the government layers (the five control layers)
		state: designed
		evidence: this document - a protection around the process, a plugin per layer
---

# THE VARIANTS/FORMS AND THE GOVERNANCE LAYERS

> Granular section of the Batch Edit Tool suggestions research (R-BET-2).
> The parent hub: Documentation/Plans/BATCH-EDIT-TOOL-SUGGESTIONS.md.
> This document carries section 2 of the research, byte-preserved.

---

## 1. The batch tool's nine forms

The user's directive: break the tool into many different variants/forms. Each
form is the SAME engine (the state machine + the registry + the journal) with
a different lifecycle posture. The implementation should build the engine once
and grow the forms as configurations, not as separate tools.

	1. THE ONE-SHOT SEARCH     spawn -> observe -> report -> release. No merge.
	    The batch returns the match inventory (the per-file counts + the
	    matched regions) as ONE tool result. The cheapest form; the model's
	    replacement for chained grep/sed probes. Cost: the engine only.
	2. THE STAGED PIPELINE     plan -> review -> apply. The batch produces the
	    PLAN (the per-file per-op diff preview) as a first artifact; the model
	    (or the user) reviews; the apply run re-validates and merges. The
	    strongest form for the agent trust posture: the same tool call shape,
	    two phases, the journal ties them. Cost: M (the plan artifact + the
	    re-validation on apply).
	3. THE DRY-RUN/PREVIEW     pipeline's apply phase with merge disabled:
	    every operation executes against the loaded state, the diffs are
	    rendered, NOTHING lands. The form is a config flag, not a separate
	    tool (the smokes already use the fake-state pattern).
	4. THE INTERACTIVE         the batch pauses at the declared checkpoints
	   CONFIRMATION             (the first merge of each file class, the ops
	    above a match-count threshold) and asks. The family precedent: the
	    ask decision in the pre-execute waterfall. In the batch this becomes
	    a per-op `confirm: true` field in the agent's schema.
	5. THE ATOMIC BATCH        all-or-nothing: N files spawned, one fails ->
	    the whole batch rolls back to the pre-spawn state. The form is the
	    transaction semantics on the engine.
	6. THE ROLLBACK/JOURNAL    every batch is reversible: the journal holds
	    the per-file pre-image + the op list; `revert <batchId>` replays it
	    backward. The idempotent, replayable form.
	7. THE PERSISTENT MONITOR  the batch does not close: it holds the spawn
	    set under the observation (the wave-3 monitors ride in) and re-fires
	    the report on each fs/observed version bump. The form: the batch with
	    a lease and the heartbeat (the planted-lease pattern).
	8. THE SCHEDULED SWEEP     the monitor form plus the clock: the batch
	    re-runs its search/transform at the declared intervals (the D3
	    pattern: NO REAL TIMERS - clock-based pending records evaluated at
	    the checkpoints; the control-loop sample time documented).
	9. THE DIFF-AWARE APPLY    the per-file patch application like the code
	    execution blocks: the batch accepts either the search/replace ops or
	    whole-file patched content; the engine verifies the base version
	    before every merge (the observe-stamp must match the merge-time
	    version, else the file goes Errored with a typed conflict).

The form matrix gives the implementation a growth path: forms 1, 3, 5, 6 are
the v1 core (one engine, one tool); forms 2, 4, 9 are the wave-2 additions;
forms 7, 8 reuse the live-containers monitor machinery verbatim (the M5
storage domain pattern: a NEW domain, never an extension record).

## 2. THE GOVERNANCE LAYERS: the government of the halted processes

The user's WHY names the end shape: MANY MANY layers of control, A PLUGIN FOR
EACH ONE - "just like a government protects its people / halted processes."
Each layer is a protection AROUND the process (the file), not a feature
inside it. The layer set, ordered from the outermost to the innermost:

	1. THE OBSERVATION LAYER    the live view: every process's state,
	   version, heartbeat and ledger are PRESENTED to the LLM without any
	   call. A citizen that is always visible. (The plugin layer: the
	   assemble/section renderer.)
	2. THE CONSTRAINT LAYER     the schema validation + the path/scope rules:
	   the batch's declared universe of files is the LAW; any op outside it
	   is a typed rejection before the state is touched. (The plugin layer:
	   the Config + the schema validator.)
	3. THE PERMISSION LAYER     the checkpoints (form 4) + the lease:
	   the state transitions that require consent (the ask decisions) and
	   the ownership rules (one batch per file). (The plugin layer: the
	   pre-execute waterfall's ask kind + the lease registry.)
	4. THE ROLLBACK LAYER       the journal: every settlement is
	   reversible; the citizen's pre-state is remembered. (The plugin
	   layer: the batch_edit_journal storage domain.)
	5. THE AUDIT LAYER          the governed merge + the event lines:
	   every transition is evented, propagated, and ledgered - the record
	   the governors hold. (The plugin layer: the fs/observed chain + the
	   per-batch ledger lines.)

The COMPOSITION rule: the layers are plugins (or plugin modules), not flags
inside one monolith - each independently enabled, each fail-open on the
family's pattern, each contributing its own ledger line. The government is
the stack; the batch engine is the territory it governs.

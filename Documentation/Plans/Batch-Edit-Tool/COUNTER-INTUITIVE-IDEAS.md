---
title: The Batch Edit Tool suggestions - the counter-intuitive ideas
category: Plans/Batch-Edit-Tool
kind: living-record
date: 2026-10-20
status: active
registry: Documentation/Plans/Batch-Edit-Tool/COUNTER-INTUITIVE-IDEAS.md
index: Documentation/INDEX.md
statuses:
	- name: the counter-intuitive ideas (six wilder consequences)
		state: designed
		evidence: this document - the running files, the unescapable call, the transaction object, the event sourcing, the mutation exception, the census
---

# THE COUNTER-INTUITIVE IDEAS: THE WILDER CONSEQUENCES

> Granular section of the Batch Edit Tool suggestions research (R-BET-2). The parent hub:
> Documentation/Plans/BATCH-EDIT-TOOL-SUGGESTIONS.md. This document carries section 4 of the
> research, byte-preserved.

---

1. **The files that run.**

    A watched file with an attached handler (the check set of the monitor) is literally RUNNING,
    because it has a heartbeat, a version pulse, vital signs (the indicator band), and an error
    state.

    The reversal is complete: the monitor form of the batch tool does not "watch files" but keeps
    files alive.

    A file that stops matching its declared check set is not "changed" but SICK (the Errored state),
    and the report says so.

    **The edit call that cannot escape.** The old flow is the CALL-ESCAPE: the model writes a
    mutation call, the call leaves the world of the session, and only a stdout echo returns.

    The reversal of the batch: the call never leaves, because the mutation is a transition INSIDE
    the state machine that the harness holds and the tool result is the own rendering of the machine
    (consequence a of the why).

    The deeper consequence: the RESULT is the truth (the same object that the engine holds) and not
    a REPORT of the truth (the stdout of the shell).

    The agent and the plugin share one ground truth, and the escape is eliminated by construction
    and not by policy.

2. **The batch as a single transaction object.**

    It is not "a list of edits" but ONE object with its own identity, lifecycle, lease, and ledger,
    held by the plugin the way that the harness holds a job.

    The batch can be SAVED (the journal), PAUSED (the lease), RESUMED (the replay), INHERITED (the
    child agent picks up the batch of the parent through the G5 splice-pickup pattern), and ABORTED.

    The handle of the model to it is just the id.

3. **The event-sourced file states.**

    Every edit is an EVENT that the system can replay.

    The current content of the file is a fold over its event history, the revert is the backward
    replay, and the "what changed between version 3 and version 7" question becomes a fold query and
    not a diff of snapshots.

    The journal (the rollback improvement) is the v1 of this, because the events are the
    settled-batch records.

    The deeper stage (the per-op event log with the arbitrary time travel) is deliberately deferred,
    because the journal is enough for the rollback guarantee and the storage discipline says to earn
    the schema.

4. **Mutation as the exception.**

    The UNIX default is mutation, and the process default is halted-and-unmutated.

    The batch tool embodies it, because the merge verb is the ONLY disk toucher and everything else
    is in-container state.

    The mental model of the agent shifts from "I edit files" to "I run processes and commit
    settlements".

5. **The ownership lease as the conflict rule.**

    Two agents that edit one file are not in a "race" but in a second spawn on a claimed process,
    and it fails with the typed conflict plus the batch id of the owner.

    The lease has a TTL and the planted-lease inheritance of the live containers precedent, so an
    inherited claim keeps the second batch alive without the owner.

6. **The search form as the process census.**

    The one-shot search is not "grep" but the census of which processes match the pattern, and the
    result can FEED the spawn set of the next batch, because the search->spawn pipeline is just two
    forms of the same engine.

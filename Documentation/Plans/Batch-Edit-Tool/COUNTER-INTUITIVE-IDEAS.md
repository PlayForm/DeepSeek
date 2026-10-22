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

1. THE FILES THAT RUN. A watched file with an attached handler (the monitor's check set) is
   literally RUNNING: it has a heartbeat, a version pulse, vital signs (the indicator band), and an
   error state. The reversal complete: the batch tool's monitor form does not "watch files" - it
   keeps files alive. A file that stops matching its declared check set is not "changed"; it is SICK
   (the Errored state), and the report says so. 1b. THE EDIT CALL THAT CANNOT ESCAPE. The old flow
   is the CALL-ESCAPE: the model writes a mutation call, the call leaves the session's world, and
   only a stdout echo returns. The batch's reversal: the call never leaves
    - the mutation is a transition INSIDE the state machine the harness holds, and the tool result
      is the machine's own rendering (the why's consequence a). The deeper consequence: the RESULT
      is the truth (the same object the engine holds), not a REPORT of the truth (the shell's
      stdout). The agent and the plugin share one ground truth; the escape is eliminated by
      construction, not by policy.
2. THE BATCH AS A SINGLE TRANSACTION OBJECT. Not "a list of edits" - ONE object with its own
   identity, lifecycle, lease, and ledger, held by the plugin the way the harness holds a job. The
   batch can be SAVED (the journal), PAUSED (the lease), RESUMED (the replay), INHERITED (the child
   agent picks up the parent's batch - the G5 splice-pickup pattern), and ABORTED. The model's
   handle to it is just the id.
3. THE EVENT-SOURCED FILE STATES. Every edit is an EVENT the system can replay. The file's current
   content is a fold over its event history; the revert is the backward replay; the "what changed
   between version 3 and version 7" question becomes a fold query, not a diff of snapshots. The
   journal (the rollback improvement) is the v1 of this: the events are the settled-batch records.
   The deeper stage (the per-op event log with the arbitrary time-travel) is deliberately deferred -
   the journal is enough for the rollback guarantee, and the storage discipline says earn the
   schema.
4. MUTATION AS THE EXCEPTION. The UNIX default is mutation; the process default is
   halted-and-unmutated. The batch tool embodies it: the merge verb is the ONLY disk toucher,
   everything else is in-container state. The agent's mental model shifts from "I edit files" to "I
   run processes and commit settlements".
5. THE OWNERSHIP LEASE AS THE CONFLICT RULE. Two agents editing one file is not a "race" - it is a
   second spawn on a claimed process, and it fails with the typed conflict + the owner's batch id.
   The lease has a TTL and the planted-lease inheritance (the live containers precedent): an
   inherited claim keeps the second batch alive without the owner.
6. THE SEARCH FORM AS THE PROCESS CENSUS. The one-shot search is not "grep" - it is the census of
   which processes match the pattern, and the result can FEED the next batch's spawn set (the
   search->spawn pipeline is just two forms of the same engine).

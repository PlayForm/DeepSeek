---
title: The Batch Edit Tool suggestions - the paradigm deepening
category: Plans/Batch-Edit-Tool
kind: living-record
date: 2026-10-20
status: active
registry: Documentation/Plans/Batch-Edit-Tool/PARADIGM-DEEPENING.md
index: Documentation/INDEX.md
statuses:
	- name: the call-escape WHY (the user's binding motivation)
		state: integrated
		evidence: section 1.0 - the verbatim quote preserved
	- name: the Process type system (Halted/Spawned/Running/Observed/Settled/Errored/Resumed)
		state: designed
		evidence: section 1.1 - states, transitions, the reversed verbs
	- name: the file as a living being (identity, metadata, ownership, process-tree, heartbeat)
		state: designed
		evidence: section 1.2
	- name: the implications for the tools (no stat/read/write)
		state: designed
		evidence: section 1.3
---

# THE PARADIGM DEEPENING: THE FILE-AS-PROCESS PHILOSOPHY'S FULL CONSEQUENCES

> Granular section of the Batch Edit Tool suggestions research (R-BET-2). The parent hub:
> Documentation/Plans/BATCH-EDIT-TOOL-SUGGESTIONS.md. This document carries section 1 of the
> research, byte-preserved.

---

The default UNIX view: a file is a passive byte-sequence and the tools act ON it (stat, read, write,
and sed).

The reversed view that this feature adopts: every file on the system is a PROCESS in a lifecycle,
halted by default, and the developer or agent HOLDS the processes.

The batch edit tool is then not a "text utility" but a PROCESS CONTROL SURFACE.

This section draws out the full consequences, so the implementation agent builds the type system
first and not the string ops.

## 1.0 THE WHY: the call-escape problem is the core motivation

The user's WHY, verbatim (binding): "the previous way: commands / instructions here -> an agent
thinks -> it realises it should make edits -> writes a call to modify the file system -> THIS CALL
ESCAPES the environment the agent started from - having the option to CONSTRAIN FILE EDITS so the
agent harness can HOLD THEM ALL IN STATE means the tools will not be required - the whole editor
functionality + the ACTUAL STATE OF THE FILE SYSTEM is presented and accessible immediately to the
LLM WITHOUT the bash calls or the tool file calls, as it is represented by this new state machine -
thus ELIMINATING ENTIRELY the bash and other tools - using the agent harness's powers as a DSL

- providing MANY MANY layers of control - a PLUGIN FOR EACH ONE - just like a government protects
  its people / halted processes."

The core promise, drawn tight: EVERY file operation in the batch is a STATE TRANSITION that the
harness HOLDS.

The edit call never escapes the environment, because there is no syscall-shaped side door, and the
mutation is a transition inside a container that the harness owns, presents (the live view), and
controls (the layered governance).

The consequences, ranked by how much they should shape the implementation:

    a. THE CALL-ESCAPE ELIMINATION is the metric. The old flow (the model
       writes sed/write calls that leave the session with only a stdout
       echo of what happened) becomes impossible BY CONSTRUCTION: the batch
       engine holds the pre-state, the ops, the post-state, and the merge;
       the tool result is the STATE MACHINE's own rendering, not the shell's.
       The agent's ground truth is the same machine the plugin runs.
    b. THE EVENTUAL ELIMINATION OF THE TOOLS: the state machine is the sole
       filesystem surface. The whole editor functionality + the actual state
       of the file system is presented to the LLM immediately, without the
       bash calls or the tool file calls. This is a DIRECTION, not a v1
       deletion: the single-file read/write/edit tools remain the fallback
       for the un-batched work, but the batch tool is designed so that its
       success SHRINKS the surface of the escaped calls - the search form
       replaces the grep/sed probes, the pipeline replaces the read+edit
       round-trips, the monitor replaces the polling loops.
    c. THE HARNESS AS DSL: the agent stops programming in SHELL and starts
       programming in the harness's powers - the state machine, the event
       system, the storage domains, the jobs, the live view. Each of those
       powers is a vocabulary word the batch schema exposes; the plugin
       validates the vocabulary and executes it in-container.
    d. THE LAYERED GOVERNMENT (the plugin-per-control-layer): a halted
       process is a citizen; each control layer is a protection around it.
       The layer set is in the forms-and-governance-layers document; the ranked set carries them.

## 1.1 The Process<Halted> type system

Every file that the batch tool TOUCHES enters a typed lifecycle.

The states:

    Halted        the resting state; the file exists, is untouched, holds no
                  live claims. This is where sed/bash sees EVERY file.
    Spawned       the file has been claimed by a batch (a process handle
                  exists in the batch's registry); its content is loaded into
                  the batch's state machine.
    Running       the file has pending, in-flight operations inside an open
                  batch (the match/replace/patch steps not yet settled).
    Observed      the file is under the monitor's watch (the live-containers
                  wave-3 monitor pattern: the enrolled file with the attached
                  check set); its version is tracked, its heartbeat known.
    Settled       the batch operations completed; the file's new content is
                  committed and journaled; the batch ledger line is closed.
    Errored       one or more operations failed; the file is halted with the
                  error record; the batch's atomicity decision (commit the
                  survivors or roll back the whole batch) is pending.
    Resumed       a previously halted/errored batch is re-entered (the
                  journal replay path); the file re-enters Running.

The transitions (the state machine, typed):

    Halted    -> Spawned          the spawn verb (the batch claims the file)
    Spawned   -> Running          the first operation on the claimed file
    Running   -> Settled          all operations succeed
    Running   -> Errored          any operation fails (the type carries WHICH)
    Errored   -> Resumed          the retry/replay verb
    Resumed   -> Running|Settled  the replay continues
    Settled   -> Spawned          the next batch claims the file again
    any       -> Halted           the release verb (the batch closes; the
                                  claims dissolve; the journal persists)

The typed operations (the verbs that the tool exposes, which is the reversed-UNIX set):

    spawn(path)        claim a file into the batch (NOT "open")
    observe(path)      read-with-version (NOT "read": the result carries the
                       version stamp; the freshness is provable later)
    transform(file)    apply one operation to the claimed file (the ops below)
    halt(path)         abort the in-flight operations on one file
    resume(path)       replay the journaled operations from the last good state
    merge(file)        reconcile the file's new content back into the system
                       (the commit verb - the ONLY verb that touches disk)
    release(path)      dissolve the claim (the process returns to Halted)

The REVERSAL is precise: in UNIX, read and write happen immediately and the system is always
mutated.

In the process view, NOTHING touches the disk until merge, so the default is halted-and-unmutated
and mutation is the exceptional, explicit, and journaled act.

The bash-sed world inverts this, because every byte is a mutation and nothing remembers.

## 1.2 The file as a living being: the metadata, the ownership, the process-tree

The process view gives each file MORE than content:

    identity       the path + the version stamp (the fs/observed version the
                   normalize family already bumps; the file's "pulse")
    metadata       the schema-owned fields the batch carries per file:
                   the content hash, the match count, the last settle time,
                   the owning batch id, the applied-ops summary
    ownership      a claimed (Spawned/Running) file is OWNED by exactly one
                   open batch; a second batch's spawn on the same file fails
                   with a typed conflict (the lease discipline - the
                   PLANTED-LEASE precedent from the live containers: a claim
                   with a TTL and an explicit inheritance path)
    process-tree   the files' DEPENDENCY relations: the batch may declare the
                   edges (file A imports file B; the rename of the identifier
                   in B requires the touch of A). The merge then orders the
                   commits along the dependency graph, and a failed edge
                   marks the dependents Errored (the process-tree semantics:
                   the parent dies, the children are notified - not the UNIX
                   "children are orphaned and forgotten")
    heartbeat      the monitor form attaches the periodic checks to a file
                   (the wave-3 monitor pattern): the watched file "runs";
                   its indicator glyphs (! ~ x and the no-problem band) are
                   the file's vital signs, rendered in the prompt's live view

The governance resonance: the family ALREADY gives files a pulse through the fs/observed chain, the
governor, the pinner, and the version bump of the normalize family.

The batch tool should ride that exact pulse, so one merge gives one fs/observed event burst and one
governor pass over EVERY edit in the batch.

The files were already processes in the event system of this family, and the batch tool just names
it.

## 1.3 The implications for the tools: no stat/read/write

The reversed-UNIX consequence for the implementation: the plugin should NOT expose a generic "file
utility".

It exposes the process-control verbs above, and the existing read/write/edit tools of the harness
remain the DEFAULT for the single-file case.

The batch tool is the CONTAINER: the agent prepares the batch schema, inserts the files (spawn), the
state machine processes them (match/transform/validate), and merge commits, like a code execution
block where the language is "file operations" and the runtime is the plugin.

The verb mapping discipline (per the G2/G5 decisions in IMPLEMENTATION-DESIGN.md): the batch runs
INSIDE the own tools/execute arm of the plugin and the governed shell path only when a check needs a
command, and the content-mutating family (write/edit/raw-write/normalize-file) stays non-detachable,
because the batch is the policy-honoring caller and never the bypass.

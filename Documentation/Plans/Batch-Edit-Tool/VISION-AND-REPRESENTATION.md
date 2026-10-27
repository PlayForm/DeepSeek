---
title: The Batch Edit Tool - the why and the representation contract
category: Plans/Batch-Edit-Tool
kind: research-report
date: 2026-10-20
status: researched
registry: Documentation/Plans/Batch-Edit-Tool/VISION-AND-REPRESENTATION.md
index: Documentation/INDEX.md
statuses:
	- name: the why (the user's words, binding)
		state: resolved
		evidence: this document; the constraint and the north star as stated
	- name: the representation-vs-reality contract (management of representations)
		state: open
		evidence: this document only - the design principle for the not-yet-built tool
	- name: the representation lifecycle (birth/hold/reconcile/retire)
		state: open
		evidence: this document only
	- name: the license flow (bidirectional) and the child processes
		state: open
		evidence: this document only
	- name: the measured cost of the status quo (the trajectory evidence)
		state: resolved
		evidence: Documentation/Plans/Batch-Edit-Tool/TRAJECTORY-EVIDENCE.md - cited in section 3, the figures live there
---

# THE BATCH EDIT TOOL - THE WHY AND THE REPRESENTATION CONTRACT

> Granular section of the Batch Edit Tool feature research (R-BET-1). The parent hub:
> Documentation/Plans/BATCH-EDIT-TOOL-FEATURE.md. This document carries section 0 and 0A.1-0A.3 of
> the research, byte-preserved.

---

## 1. THE WHY (the user's words, binding)

The previous way: the agent thinks of an edit, writes a bash or tool call, and THE CALL ESCAPES THE
ENVIRONMENT that the agent started from, so it flies somewhere else.

The batch edit tool gives the option to CONSTRAIN FILE EDITS so the agent harness HOLDS THEM ALL IN
STATE: the whole editor functionality and the actual state of the file system is presented and
accessible immediately to the LLM, without bash calls or per-file tool calls, because the state
machine complex represents it.

The north star: the harness-as-DSL, which is the eventual ELIMINATION of the bash and file-tool
calls as the sole edit surface, and the LAYERED GOVERNMENT of a plugin per control layer, just like
a government protects its people and its halted processes.

Design consequence (woven through the whole research): the first duty of the tool is not "batch
edits" but THE REPRESENTATION OF THE FILESYSTEM IN STATE.

The schema models the state presentation of the file system, the edit batch is one kind of
transition over it, and the live-view framework is the foundation that every future control layer (a
plugin per protection) stands on.

## 2. THE REPRESENTATION-VS-REALITY CONTRACT (MANAGEMENT OF REPRESENTATIONS)

The paradigm of the user (binding): MANAGEMENT OF REPRESENTATIONS.

One system (the standard, UNIX, Windows, or whatever) holds one case of licenses and it is STILL THE
MAIN CONTROLLER.

We hold an ENTIRELY DIFFERENT REPRESENTATIONAL STATE that we manage entirely, which is an
abstraction layered over it.

### 2.1 The contract

- **Reality (the OS)**: the authoritative model and the licensing authority. It stays the main
  controller, so every byte, every permission, and every sandbox verdict is real. The representation
  NEVER replaces it and NEVER bypasses it, because all writes still go through Factory.Write and the
  sandbox and licensing stack of the OS (the feasibility document, the write path).
- **Representation (ours)**: the held state of the machine, which holds the process cells, the held
  versions, the pending ops, and the licenses. It is entirely ours to manage, with our lifecycle,
  our staleness discipline, and our eviction rules.
- **The reconciliation discipline** (the staleness law of the representation):
    1.  the observe-stamps - every held file carries the version stamp taken at insert through the
        freshness path (a read emits a present fs/observed, filesystem.md:224), so the stamp is
        REALITY'S OWN attestation and not our claim;
    2.  the diffs - the commit-time version check compares the held stamp to the actual stat, and a
        mismatch is a STALE HALT (the state machine document), where the representation defers to
        reality;
    3.  the refresh - `state` re-presents by re-stamping through the same path, and the
        representation never claims freshness that it did not observe.
- **The one-way rule**: reality may invalidate the representation at any moment, because an external
  touch flips the cell, and the representation may only invalidate reality through the licensed
  write path, where reality re-attests (the fresh-stat guard) before the representation records the
  new stamp.

### 2.2 The representation's lifecycle

```
birth        'open': the machine's representational state is created;
			 every file is stamped through the observe path
hold         the representation lives across turns; cells evolve only on
			 real events (the silence invariant)
reconcile    the staleness discipline (2.1) at commit, at 'state', and
			 on every fs/observed touch of a held file
retire       'close': settle-first (in-flight work halts or completes),
			 the final reconciliation, then the representation is released -
			 reality was never waiting on us
```

### 2.3 The license flow (bidirectional) and the child processes

The licenses flow TO AND FROM representations.

The main process (the harness) is the root licensor, and it grants each machine and each held
process its license, which is the right to exist and to act.

Each per-file or per-batch state machine is a CHILD PROCESS that orbits the main process, each under
its license, and each holding licenses to the representations that it manages:

```
grant   the harness grants the machine's license at 'open'
		(the machine id IS the license token); the machine grants each
		held file its process license at insert (the version stamp is
		the license's content)
hold    the license is active while the process is observed/running;
		renewal = the reconciliation stamps (2.1) - a reconciled stamp
		IS the renewal
revoke  the license ends by: 'close' (voluntary), eviction (see
		the eviction document),
		or reality's veto (the sandbox denial, the version guard)
```

---

## 3. The measured cost of the status quo (addendum, 2026-10-22)

The why above is the stated motivation of the user.

The measured case for building the tool is the cost of the status quo: 34,345 input tokens per file
mutation, over 34 sessions and 811 mutations in one workspace on one day.

The load-bearing part is the finding and not the total: cost tracks round trips and not edits.

The wide-sweep lanes paid 4,400 input tokens per mutation because their context stayed small, and a
run of 17 edits on one file paid 17 step boundaries, each of which re-sent the whole conversation.

A batch removes the step boundaries and not the reads and not the edits.

The consequences for the claims of this document:

- The worth of the tool is argued on the round-trip economics and not on the edit payload, because
  the payloads were small and the re-sent context was not.
- The read elimination in 1.0.b (the state presented to the LLM without the tool file calls) is NOT
  what the measurement shows, because the reads still happen and still enter the context, and
  whether the held representation removes them is unmeasured.
- The batch is worth building where the demand is a sweep or a rewrite, and the interleaved
  edit-verify-edit shape is where it must refuse rather than guess (the shapes table,
  TRAJECTORY-EVIDENCE.md section 6).

The method, the tables, and the caveats live in
Documentation/Plans/Batch-Edit-Tool/TRAJECTORY-EVIDENCE.md, and this document cites the headline
figure once and points there for the rest.

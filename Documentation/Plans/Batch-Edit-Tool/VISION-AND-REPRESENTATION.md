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

The previous way: the agent thinks of an edit, writes a bash/tool call, and THE CALL ESCAPES THE
ENVIRONMENT the agent started from - it flies somewhere else. The batch edit tool gives the option
to CONSTRAIN FILE EDITS so the agent harness HOLDS THEM ALL IN STATE: the whole editor functionality
and the actual state of the file system is presented and accessible immediately to the LLM, without
bash calls or per-file tool calls, because it is represented by the state machine complex. The north
star: the harness-as-DSL - the eventual ELIMINATION of the bash and file-tool calls as the sole edit
surface - and the LAYERED GOVERNMENT: a plugin per control layer, just like a government protects
its people / halted processes.

Design consequence (woven through the whole research): the tool's first duty is not "batch edits" -
it is THE FILESYSTEM'S REPRESENTATION IN STATE. The schema models the file system's state
presentation; the edit batch is one kind of transition over it; the live-view framework is the
foundation every future control layer (a plugin per protection) stands on.

## 2. THE REPRESENTATION-VS-REALITY CONTRACT (MANAGEMENT OF REPRESENTATIONS)

The user's paradigm (binding): MANAGEMENT OF REPRESENTATIONS. One system - the standard, UNIX,
windows or whatever - holds one case of licenses: it is STILL THE MAIN CONTROLLER. We hold an
ENTIRELY DIFFERENT REPRESENTATIONAL STATE, entirely managed by us - an abstraction layered over it.

### 2.1 The contract

- **Reality (the OS)**: the authoritative model and the licensing authority. It stays the main
  controller - every byte, every permission, every sandbox verdict is real. The representation NEVER
  replaces it and NEVER bypasses it: all writes still go through Factory.Write and the OS's
  sandbox/licensing stack (the feasibility document, the write path).
- **Representation (ours)**: the machine's held state - the process cells, the held versions, the
  pending ops, the licenses. Entirely ours to manage: our lifecycle, our staleness discipline, our
  eviction rules.
- **The reconciliation discipline** (the representation's staleness law):
    1.  the observe-stamps - every held file carries the version stamp taken at insert through the
        freshness path (a read emits a present fs/observed; filesystem.md:224), so the stamp is
        REALITY'S OWN attestation, not our claim;
    2.  the diffs - the commit-time version check compares the held stamp to the actual stat; a
        mismatch is a STALE HALT (the state machine document), the representation deferring to
        reality;
    3.  the refresh - `state` re-presents by re-stamping through the same path; the representation
        never claims freshness it did not observe.
- **The one-way rule**: reality may invalidate the representation at any moment (an external touch
  flips the cell); the representation may only invalidate reality through the licensed write path,
  where reality re-attests (the fresh-stat guard) before the representation records the new stamp.

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

The licenses flow TO AND FROM representations. The main process - the harness - is the root
licensor: it grants each machine and each held process its license (the right to exist and to act).
Each per-file/per-batch state machine is a CHILD PROCESS orbiting the main process, each under its
license, each holding licenses to the representations it manages:

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

The why above is the user's stated motivation. The measured case for building the tool is the cost
of the status quo: 34,345 input tokens per file mutation, over 34 sessions and 811 mutations in one
workspace on one day.

The load-bearing part is the finding, not the total: cost tracks round trips, not edits. The
wide-sweep lanes paid 4,400 input tokens per mutation because their context stayed small; a run of
17 edits on one file paid 17 step boundaries, each re-sending the whole conversation. A batch
removes the step boundaries - not the reads, not the edits.

The consequences for this document's claims:

- The tool's worth is argued on the round-trip economics, not on the edit payload: the payloads were
  small; the re-sent context was not.
- The read elimination in 1.0.b (the state presented to the LLM without the tool file calls) is NOT
  what the measurement shows. The reads still happen and still enter the context. Whether the held
  representation removes them is unmeasured.
- The batch is worth building where the demand is a sweep or a rewrite; the interleaved
  edit-verify-edit shape is where it must refuse rather than guess (the shapes table,
  TRAJECTORY-EVIDENCE.md section 6).

The method, the tables and the caveats live in
Documentation/Plans/Batch-Edit-Tool/TRAJECTORY-EVIDENCE.md; this document cites the headline figure
once and points there for the rest.

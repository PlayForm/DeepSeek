---
title: The Batch Edit Tool - the schema design (the first cut)
category: Plans/Batch-Edit-Tool
kind: research-report
date: 2026-10-20
status: researched
registry: Documentation/Plans/Batch-Edit-Tool/SCHEMA.md
index: Documentation/INDEX.md
statuses:
	- name: the tool input schema (flat, defineTool-compatible)
		state: open
		evidence: this document only - the first cut, the exact tool name needs the user's confirmation
	- name: the per-file state Process<File>
		state: open
		evidence: this document only - the Process<Halted> philosophy re-typed onto files
	- name: the dynamic insertion (prepare a schema, insert files)
		state: open
		evidence: this document only
---

# THE BATCH EDIT TOOL - THE SCHEMA DESIGN (THE FIRST CUT)

> Granular section of the Batch Edit Tool feature research (R-BET-1). The parent hub:
> Documentation/Plans/BATCH-EDIT-TOOL-FEATURE.md. This document carries section 2 of the research,
> byte-preserved.

---

## 2.1 The tool input schema (flat, defineTool-compatible)

One tool: `batch_edit` (name TBD by the user; alternatives: `file_machine`, `process_files`). Flat
parameters, grouped by prefix:

```
action        string, required   one of:
								 'open'    - open a machine: declare the scope, insert files,
											 return the state presentation (no edits yet)
								 'insert'  - add files to an open machine (the dynamic insertion)
								 'remove'  - drop files from an open machine
								 'commit'  - run the batch: apply the transition table in one go
								 'state'   - re-present the current state of every held file
								 'close'   - close the machine (halted processes settle to done)
machine       string             the machine id ('open' returns it; 'commit'
								 requires it)
files         array of strings   the inserted file paths (globs allowed on
								 'open'/'insert'; the machine resolves and records
								 each as a process)
searches      array of strings   named search patterns (literal or the
								 family's simple glob/regex marker - v1: literal
								 + regex, declared per search)
ops           array of strings   the transition table, one line per op,
								 machine grammar (like the ledger/report grammars):
								 file=search op=SEARCH [with=REPLACE] mode=first|all|count
								 (modes: replace | insert-after | insert-before |
								 remove-line | append | prepend)
opfile        string             optional: ops as a prepared file path (the
								 large-batch escape hatch; the machine ingests it
								 through the report grammar - the [live-report]
								 precedent, no schema limit)
preview       boolean            default true: 'commit' returns the per-file
								 diffs in the canonical value before writing;
								 preview=false applies directly
monitors      array of strings   per-file check-set names (the live
								 containers' monitor vocabulary, reused)
persistent    boolean            default false: false = one-shot (the machine
								 closes after 'commit'); true = the machine stays
								 open across turns (the planted-board lease semantics)
deadlineMs    number             the commit's in-line deadline, capped at
								 120000 (the composition contract)
```

The canonical output value (one JSON object):
`{ machine, state: [{ file, status, version, diff?, error? }], applied, failed, jobId? }` - a jobId
when the commit exceeds the deadline and continues as a background job (the harness's own background
branch). `output.render` turns it into the model-facing prose; `presentationMeta` carries the diffs
for the UI's diff card (the cookbook's diff-card precedent).

## 2.2 The per-file state - Process<File> (the Process<Halted> philosophy)

The typing: each inserted file IS a process the agent harness holds. The states (the live
containers' BoardMember/MonitorEntry states re-typed):

```
Process<File> ::= observed | running | halted | done | errored

	observed   the file is inserted; its version read and held in state;
			   nothing in flight
	running    a transition is executing on it (a search, a preview, a
			   write through Factory.Write, or a monitor check)
	halted     the transition is suspended: the deadline hit, the machine
			   paused, the file went stale (the version moved underneath),
			   or the agent was interrupted - the HALTED PROCESS, the state
			   the harness PROTECTS (the government analogy)
	done       the transition settled: applied + fs/observed confirmed
			   (the fresh version recorded)
	errored    the transition failed loudly: the preview mismatch, the
			   sandbox denial, the search-not-found under strict mode
```

Transitions (all event-driven, no timers):

```
observed  -> running     (commit/insert/monitor dispatch)
running   -> done        (Factory.Write outcome + the fresh version)
running   -> errored     (outcome.error / intent denial)
running   -> halted      (deadline scan / stale version / machine pause)
halted    -> running     (agent resumes: 'commit' again on the same machine)
done      -> observed    (re-inserted for a next batch)
errored   -> observed    (agent corrects the op)
any       -> halted      (machine 'close' with in-flight work: settle-first)
```

Halted processes are FIRST-CLASS: the state presentation lists them with their halt reason; the
parent/agent resumes them explicitly; nothing is silently dropped (the live containers' "rendered
once then withdrawn" discipline, generalized). Each process cell carries its LICENSE (the license
flow in the vision-and-representation document): the version stamp is the license's content, the
reconciliation stamps are the renewals, and an eviction (the eviction document) settles the cell
into the ledger before release.

## 2.3 The dynamic insertion

The agent PREPARES ITSELF A SCHEMA, then inserts files into it:

1. `action=open` with `files` (paths or globs): the machine resolves each target through the fs read
   path (which emits fs/observed - freshness for free), records every hit as `observed` with its
   held version, and returns the state presentation. Misses are listed, never guessed.
2. `action=insert` adds to the open machine mid-life (the lease stays).
3. The machine's shape (which searches exist, which ops are legal) is the agent's prepared schema,
   validated at `open` exactly like the live containers' Apply.ts Validate (fail-loud, every knob
   checked).

---
title: The Batch Edit Tool - the feasibility verdict
category: Plans/Batch-Edit-Tool
kind: research-report
date: 2026-10-20
status: researched
registry: Documentation/Plans/Batch-Edit-Tool/FEASIBILITY.md
index: Documentation/INDEX.md
statuses:
	- name: the tool-registration surface (a plugin-registered tool the model calls)
		state: implemented
		evidence: hook-dsh-live-containers MonitorTools.ts + Apply.ts:1023-1033; the cookbook's adding-a-tool contract
	- name: the event sponsorship (the state machine's hooks)
		state: implemented
		evidence: hook-dsh-live-containers Apply.ts is the map of the sponsor set
	- name: the batch machinery (the reusable inventory)
		state: implemented
		evidence: Factory.Write, Gate (g1), the G2 jobs wrapper, the state cells, the no-timers discipline, the P5 storage domain, the assemble section, the manifest ingestion
	- name: the rich nested-object tool schema
		state: open
		evidence: defineTool is flat-typed - the batch spec is flat fields or a structured string
	- name: the conversation-body rewrite seam
		state: open
		evidence: no seam rewrites the body between the session log and the request - the assemble section is v1
---

# THE BATCH EDIT TOOL - THE FEASIBILITY VERDICT

> Granular section of the Batch Edit Tool feature research (R-BET-1). The parent hub:
> Documentation/Plans/BATCH-EDIT-TOOL-FEATURE.md. This document carries section 1 of the research,
> byte-preserved.

---

**VERDICT: FEASIBLE, because the full core mechanic exists today as first-class seams.**

Three requirements, three verified answers:

## 1.1 The tool-registration surface (a plugin-registered tool the model calls)

VERIFIED, because the family already registers model-facing tools from a plugin:

- `hook-dsh-live-containers/Source/Function/MonitorTools.ts` - `defineTool` with `name`,
  `description`, `parameters` (typed, per-field `description`, `required`), `output.schema`
  (canonical JSON), `output.render` (the model-facing prose), and `execute(args, exec)`. Registered
  through `ctx.tools.register(...)` in Apply.ts:1023-1033.
- The own contract of the harness (docs/cookbook/adding-a-tool.md): `defineTool` validates the
  arguments of the model before `execute`, the registration is effect-based, the tool arrives in PTC
  mode for free (`tools.<name>(args)`), and the background branch returns a typed canonical handle
  `{ kind: 'background', jobId }` that the model reads with `job_output`, which is exactly the
  `live_monitor_check` shape of the live containers.
- The tool-coach and the ccr marker/retrieval pair prove that the model-facing grammar is live in
  this session, because the strike-3 note that the parent received is the output of the tool-coach.

Caveat: `defineTool` schemas are flat-typed (string/number/boolean/array) and not arbitrary JSON
Schema, so the batch spec must be expressed as flat fields (see the schema document) or carried as a
structured string.

This is a constraint and not a blocker, because the tools of the live containers already carry
complex semantics in flat parameters.

## 1.2 The event sponsorship (the state machine's hooks)

VERIFIED, because the family already exercises the sponsor set
(`hook-dsh-live-containers/Source/Function/Apply.ts` is the map):

| Event                                   | Mode                  | Batch tool use                                                                                                           |
| --------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `tools/pre-execute`                     | waterfall             | intercept the bash-sed call BEFORE it escapes (the Detach.PreExecute precedent) - offer the batch path, observe attempts |
| `tools/execute`                         | waterfall             | the carrier arm - a tagged call returns the machine's result without running bash (Detach.Execute precedent)             |
| `tools/post-execute`                    | waterfall             | record the file facts; mark machine cells dirty (L4 precedent)                                                           |
| `fs/observed`                           | emit, sync-only       | the transition input: every write anywhere is a state event (Factory.Wire precedent, root context)                       |
| `fs/write-intent` / `fs/edit-intent`    | single-slot waterfall | the CONTROL layer: the machine can decide/defer/deny per file (filesystem.md:185)                                        |
| `agent/pre-step`                        | waterfall             | the turn boundary: run the deadline scan, batch the pending (L8 precedent)                                               |
| `system-prompt/assemble`                | waterfall             | the state presentation: the machine renders ONE live section of the file system's state per request (L1 precedent)       |
| jobs events (`Jobs.events.subscribe`)   | host subscription     | the settle truth for each in-flight file job (L6 precedent)                                                              |
| `session/event` (`agent/inbox/spliced`) | emit, host scope      | cross-agent reports into the machine's manifest (the planted-board `[live-report]` precedent)                            |

Plus the lifecycle: `ctx.effect` for the open and close of the storage domain (the P5-style domain,
Storage.ts precedent), the volatile P10 refresh for hot config edits, and the `tools/change`
invalidation.

## 1.3 The batch machinery (what the live containers already provide)

VERIFIED, and this is the directly reusable inventory:

- **Factory.Write** (plugin-dsh-factory Source/Function/Write.ts) is THE ONE SHARED WRITE EXECUTOR:
  intent (an explicit `replaceIfVersion` skips the waterfall and `{ waterfall: true }` runs it),
  policy (`standing` or the `p4` fence rooted at the own directory of the target), a fresh-stat
  version guard through `FS.writeText`, the Stash idempotence pre-registration, and the root-context
  `fs/observed { kind: 'present', version }` emit. The batch tool writes NOTHING outside this path,
  which gives one file operation and one evented write by construction.
- **Gate (g1)** (plugin-dsh-factory Source/Function/Gate.ts) is the ordered fs/observed decision set
  that includes the `govern` actor marker route (see the package-and-governance document) and the
  Stash idempotence gate, which is the recursion protector that the batch tool rides.
- **The G2 jobs wrapper** (live containers Jobs.ts `Start`) is one wrapper with two callers:
  shell.resolve/execute and sandboxPolicy.resolve, the ring caps, outputLimitBytes, and the
  plugin-owned deadline scan. The per-file validation commands of the batch tool (searches and
  preview diffs) run through it.
- **The state cells** (BoardState / MonitorEntry / DetachRecord) are per-agent keyed Maps with
  volatile cells, staleness DERIVED at render time, and "rendered once then withdrawn" markers. The
  per-file state is this pattern re-typed as Process<File>.
- **The deadline scan / no-timers discipline** evaluates clock-based pending records at checkpoints
  only (File-Monitors-Design section 3.5), with no plugin-owned timers anywhere.
- **The P5-style storage domain** has its own open, its own recovery, an exact-version parser, and a
  NEW domain name for each new event vocabulary (Open.ts contract).
- **The assemble section + the silence invariant** give one section with one part per concern, the
  collapse, and the KV-cache honesty: the text changes only on real events and never on the clock.
- **The manifest/board ingestion** gives the `[live-report]` grammar and the session/event fold
  (Apply.ts:977-1004).

## 1.4 The gaps (what does NOT exist yet)

1. No seam rewrites the conversation body between the session log and the request
   (LIVE-CONTAINERS-RESEARCH section 2.3), so the state presentation of the machine lives in the
   assemble section and the dynamic contexts, as v1 of the live containers does. Accepted.
2. `defineTool` has no rich nested-object schema, so the batch spec is flat fields (the schema
   document). Accepted.
3. The filesystem-as-state presentation is only as complete as what the harness OBSERVES, because
   reads emit fs/observed too (filesystem.md:224), so the freshness-based presentation is real, and
   full-filesystem indexing would be an on-demand scan job and not a standing listener.

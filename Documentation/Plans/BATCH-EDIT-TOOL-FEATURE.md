---
title: The Batch Edit Tool - feasibility, schema, state machine, and the package form
category: Plans
kind: research-report
date: 2026-10-20
status: researched
registry: Documentation/Plans/BATCH-EDIT-TOOL-FEATURE.md
index: Documentation/INDEX.md
statuses:
	- name: the feasibility research (R-BET-1)
		state: complete
		evidence: this document; every seam verified against the family code and the harness docs
	- name: the batch edit tool implementation
		state: open
		evidence: awaiting the user's dispatch
---

# BATCH EDIT TOOL - THE FEASIBILITY RESEARCH (R-BET-1)

> The user's feature: a new family plugin - the batch edit tool - a tool the
> model calls INSTEAD of the bash-sed replaces and the per-file manual edits.
> It functions like a live container: the agent prepares a schema, inserts
> files into it, and the files process like a state machine in one go -
> fully sponsored, tracked, and evented by the harness's event system.
> The philosophy: each file on the system is a process (Process<Halted>);
> the files are living beings, not inert bytes - the reversed view opposing
> the default UNIX view.

## 0. THE WHY (the user's words, binding)

The previous way: the agent thinks of an edit, writes a bash/tool call, and
THE CALL ESCAPES THE ENVIRONMENT the agent started from - it flies somewhere
else. The batch edit tool gives the option to CONSTRAIN FILE EDITS so the
agent harness HOLDS THEM ALL IN STATE: the whole editor functionality and the
actual state of the file system is presented and accessible immediately to
the LLM, without bash calls or per-file tool calls, because it is represented
by the state machine complex. The north star: the harness-as-DSL - the
eventual ELIMINATION of the bash and file-tool calls as the sole edit
surface - and the LAYERED GOVERNMENT: a plugin per control layer, just like
a government protects its people / halted processes.

Design consequence (woven through this document): the tool's first duty is
not "batch edits" - it is THE FILESYSTEM'S REPRESENTATION IN STATE. The
schema models the file system's state presentation; the edit batch is one
kind of transition over it; the live-view framework extracted in section 5
is the foundation every future control layer (a plugin per protection)
stands on.

## 0A. THE REPRESENTATION-VS-REALITY CONTRACT (MANAGEMENT OF REPRESENTATIONS)

The user's paradigm (binding): MANAGEMENT OF REPRESENTATIONS. One system -
the standard, UNIX, windows or whatever - holds one case of licenses: it is
STILL THE MAIN CONTROLLER. We hold an ENTIRELY DIFFERENT REPRESENTATIONAL
STATE, entirely managed by us - an abstraction layered over it.

### 0A.1 The contract

- **Reality (the OS)**: the authoritative model and the licensing authority.
  It stays the main controller - every byte, every permission, every
  sandbox verdict is real. The representation NEVER replaces it and NEVER
  bypasses it: all writes still go through Factory.Write and the OS's
  sandbox/licensing stack (section 3.2).
- **Representation (ours)**: the machine's held state - the process cells,
  the held versions, the pending ops, the licenses. Entirely ours to
  manage: our lifecycle, our staleness discipline, our eviction rules.
- **The reconciliation discipline** (the representation's staleness law):
	1. the observe-stamps - every held file carries the version stamp taken
	   at insert through the freshness path (a read emits a present
	   fs/observed; filesystem.md:224), so the stamp is REALITY'S OWN
	   attestation, not our claim;
	2. the diffs - the commit-time version check compares the held stamp to
	   the actual stat; a mismatch is a STALE HALT (section 2.2), the
	   representation deferring to reality;
	3. the refresh - `state` re-presents by re-stamping through the same
	   path; the representation never claims freshness it did not observe.
- **The one-way rule**: reality may invalidate the representation at any
  moment (an external touch flips the cell); the representation may only
  invalidate reality through the licensed write path, where reality re-attests
  (the fresh-stat guard) before the representation records the new stamp.

### 0A.2 The representation's lifecycle

```
birth        'open': the machine's representational state is created;
			 every file is stamped through the observe path
hold         the representation lives across turns; cells evolve only on
			 real events (the silence invariant)
reconcile    the staleness discipline (0A.1) at commit, at 'state', and
			 on every fs/observed touch of a held file
retire       'close': settle-first (in-flight work halts or completes),
			 the final reconciliation, then the representation is released -
			 reality was never waiting on us
```

### 0A.3 The license flow (bidirectional) and the child processes

The licenses flow TO AND FROM representations. The main process - the
harness - is the root licensor: it grants each machine and each held process
its license (the right to exist and to act). Each per-file/per-batch state
machine is a CHILD PROCESS orbiting the main process, each under its
license, each holding licenses to the representations it manages:

```
grant   the harness grants the machine's license at 'open'
		(the machine id IS the license token); the machine grants each
		held file its process license at insert (the version stamp is
		the license's content)
hold    the license is active while the process is observed/running;
		renewal = the reconciliation stamps (0A.1) - a reconciled stamp
		IS the renewal
revoke  the license ends by: 'close' (voluntary), eviction (below),
		or reality's veto (the sandbox denial, the version guard)
```

### 0A.4 The eviction rule

The main process can EVICT a child (the license revoked + the child's state
settled and released - never dropped silently). The triggers, in order of
severity:

1. **TTL expiry** - the lease pattern (the live containers' I5 lease, the
   leaseTurns inheritance): a machine with no transitions and no reports
   across its lease window is evicted; the final state presentation renders
   once, then withdraws.
2. **Constraint violation** - a schema-law breach (an op outside the
   prepared schema, a write outside the declared scope) revokes the
   offending process's license immediately; the machine stays, the process
   goes to errored with the violation as the reason.
3. **Explicit eviction** - the main process's own action (the ccr's LRU
   evictions / the live containers' prune precedent): `close` with
   evict=true drops the machine regardless of pending state, after the
   settle-first pass.
4. **Capacity eviction (LRU)** - machinesPerAgent exceeded: the least
   recently active machine is evicted, its halted processes summarized into
   the ledger before release.

Eviction always produces ledger lines and one final state presentation -
the record survives the representation.

## 0B. THE PARADIGM CATALOG (for managing such representations)

The user's question: which paradigms are useful for managing such
representations. Ranked for THIS design (1 = core, 2 = adopt in v1/v2,
3 = the later control layers):

| Rank | Paradigm | How it lands here |
|---|---|---|
| 1 | Shadow-state / MVC (the model-view-control split) | the machine = the model; the state presentation = the view; the ops table = the control - already the section 0A split |
| 1 | Git-style staging layers (working-tree / index / HEAD) | the held stamp = index; reality = HEAD; commit = the staged write reconciled against HEAD; the stale halt = the merge conflict |
| 1 | Event-sourcing projections | the machine's state is the fold of its event stream (the fs/observed + job events + ledger lines); rebuildable from the ledger |
| 1 | Caching with invalidation | the held stamps are a cache invalidated by fs/observed; the freshness path re-fills |
| 2 | Actor-per-file mailboxes | each process cell is an actor: messages = transitions + touches; the mailbox drains at checkpoints (the no-timers discipline); v1 models it as cells, a true actor runtime is v2 |
| 2 | Materialized views / index projections | the state presentation is a materialized view over the cells, re-materialized on events only |
| 2 | Reactive / FRP signals | the assemble section as a signal graph: inputs (fs/observed, jobs) propagate to the view; v1 is pull-based at checkpoints, the push form is v2 |
| 2 | Snapshot / time-travel versions | the ledger + the held stamps give per-file version history; the time-travel UI (diff cards) rides presentationMeta |
| 2 | Double-entry journaling | every transition has two entries: the machine's ledger line + the fs/observed attestation; an unbalanced pair = the reconciliation flag |
| 3 | Virtualization (the filesystem-in-state) | the full-virtual-filesystem ambition - only the touched/held subset is represented; the north star, not v1 |
| 3 | Verified-derivation constraints | proofs that a representation matches reality (checksums, re-stamps) - the reconciliation discipline's automated form |
| 3 | DSL compilation | the ops grammar compiled to the transition plan (the BATCH-STATE pre-baked compiler model); the programmable stage |
| 3 | Delegated authority + checkpoints | sub-agents acting on the parent's machine under delegated licenses with checkpoint approval - the layered government's next step |

## 1. THE FEASIBILITY VERDICT

**VERDICT: FEASIBLE - the full core mechanic exists today as first-class
seams.** Three requirements, three verified answers:

### 1.1 The tool-registration surface (a plugin-registered tool the model calls)

VERIFIED. The family already registers model-facing tools from a plugin:

- `hook-dsh-live-containers/Source/Function/MonitorTools.ts` - `defineTool`
  with `name`, `description`, `parameters` (typed, per-field `description`,
  `required`), `output.schema` (canonical JSON), `output.render` (the
  model-facing prose), and `execute(args, exec)`. Registered through
  `ctx.tools.register(...)` in Apply.ts:1023-1033.
- The harness's own contract (docs/cookbook/adding-a-tool.md): `defineTool`
  validates the model's arguments before `execute`; the registration is
  effect-based; the tool arrives in PTC mode for free (`tools.<name>(args)`);
  the background branch returns a typed canonical handle `{ kind:
  'background', jobId }` and the model reads it with `job_output` - exactly
  the live containers' `live_monitor_check` shape.
- The tool-coach and the ccr marker/retrieval pair prove the model-facing
  grammar is live in this session (the strike-3 note the parent received is
  the tool-coach's output).

Caveat: `defineTool` schemas are flat-typed (string/number/boolean/array),
not arbitrary JSON Schema - the batch spec must be expressed as flat fields
(see section 2) or carried as a structured string. This is a constraint, not
a blocker: the live containers' tools already carry complex semantics in
flat parameters.

### 1.2 The event sponsorship (the state machine's hooks)

VERIFIED. The sponsor set is already exercised by the family
(`hook-dsh-live-containers/Source/Function/Apply.ts` is the map):

| Event | Mode | Batch tool use |
|---|---|---|
| `tools/pre-execute` | waterfall | intercept the bash-sed call BEFORE it escapes (the Detach.PreExecute precedent) - offer the batch path, observe attempts |
| `tools/execute` | waterfall | the carrier arm - a tagged call returns the machine's result without running bash (Detach.Execute precedent) |
| `tools/post-execute` | waterfall | record the file facts; mark machine cells dirty (L4 precedent) |
| `fs/observed` | emit, sync-only | the transition input: every write anywhere is a state event (Factory.Wire precedent, root context) |
| `fs/write-intent` / `fs/edit-intent` | single-slot waterfall | the CONTROL layer: the machine can decide/defer/deny per file (filesystem.md:185) |
| `agent/pre-step` | waterfall | the turn boundary: run the deadline scan, batch the pending (L8 precedent) |
| `system-prompt/assemble` | waterfall | the state presentation: the machine renders ONE live section of the file system's state per request (L1 precedent) |
| jobs events (`Jobs.events.subscribe`) | host subscription | the settle truth for each in-flight file job (L6 precedent) |
| `session/event` (`agent/inbox/spliced`) | emit, host scope | cross-agent reports into the machine's manifest (the planted-board `[live-report]` precedent) |

Plus the lifecycle: `ctx.effect` for the storage domain open/close (the
P5-style domain, Storage.ts precedent), the volatile P10 refresh for hot
config edits, and the `tools/change` invalidation.

### 1.3 The batch machinery (what the live containers already provide)

VERIFIED - the directly reusable inventory:

- **Factory.Write** (plugin-dsh-factory Source/Function/Write.ts) - THE ONE
  SHARED WRITE EXECUTOR: intent (explicit `replaceIfVersion` skips the
  waterfall / `{ waterfall: true }` runs it), policy (`standing` /
  the `p4` fence rooted at the target's own directory), fresh-stat version
  guard via `FS.writeText`, the Stash idempotence pre-registration, and the
  root-context `fs/observed { kind: 'present', version }` emit. The batch
  tool writes NOTHING outside this path - one file operation, one evented
  write, by construction.
- **Gate (g1)** (plugin-dsh-factory Source/Function/Gate.ts) - the ordered
  fs/observed decision set including the `govern` actor marker route
  (section 6.1) and the Stash idempotence gate - the recursion protector the
  batch tool rides.
- **The G2 jobs wrapper** (live containers Jobs.ts `Start`) - one wrapper,
  two callers: shell.resolve/execute + sandboxPolicy.resolve, ring caps,
  outputLimitBytes, the plugin-owned deadline scan. The batch tool's
  per-file validation commands (searches, preview diffs) run through it.
- **The state cells** - BoardState / MonitorEntry / DetachRecord: per-agent
  keyed Maps, volatile cells, staleness DERIVED at render time, "rendered
  once then withdrawn" markers. The per-file state (section 2.2) is this
  pattern re-typed as Process<File>.
- **The deadline scan / no-timers discipline** - clock-based pending records
  evaluated at checkpoints only (File-Monitors-Design section 3.5). No
  plugin-owned timers anywhere.
- **The P5-style storage domain** - own open, own recovery, exact-version
  parser, a NEW domain name per new event vocabulary (Open.ts contract).
- **The assemble section + the silence invariant** - one section, one part
  per concern, collapse, and the KV-cache honesty: the text changes only on
  real events, never on the clock.
- **The manifest/board ingestion** - the `[live-report]` grammar and the
  session/event fold (Apply.ts:977-1004).

### 1.4 The gaps (what does NOT exist yet)

1. No seam rewrites the conversation body between the session log and the
   request (LIVE-CONTAINERS-RESEARCH section 2.3) - the machine's state
   presentation lives in the assemble section + dynamic contexts, as v1 of
   the live containers does. Accepted.
2. `defineTool` has no rich nested-object schema - the batch spec is flat
   fields (2.1). Accepted.
3. The filesystem-as-state presentation is only as complete as what the
   harness OBSERVES: reads emit fs/observed too (filesystem.md:224), so the
   freshness-based presentation is real; full-filesystem indexing would be
   an on-demand scan job, not a standing listener.

## 2. THE SCHEMA DESIGN (the first cut)

### 2.1 The tool input schema (flat, defineTool-compatible)

One tool: `batch_edit` (name TBD by the user; alternatives: `file_machine`,
`process_files`). Flat parameters, grouped by prefix:

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

The canonical output value (one JSON object): `{ machine, state: [{ file,
status, version, diff?, error? }], applied, failed, jobId? }` - a jobId when
the commit exceeds the deadline and continues as a background job (the
harness's own background branch). `output.render` turns it into the
model-facing prose; `presentationMeta` carries the diffs for the UI's diff
card (the cookbook's diff-card precedent).

### 2.2 The per-file state - Process<File> (the Process<Halted> philosophy)

The typing: each inserted file IS a process the agent harness holds. The
states (the live containers' BoardMember/MonitorEntry states re-typed):

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

Halted processes are FIRST-CLASS: the state presentation lists them with
their halt reason; the parent/agent resumes them explicitly; nothing is
silently dropped (the live containers' "rendered once then withdrawn"
discipline, generalized). Each process cell carries its LICENSE (the
license flow 0A.3): the version stamp is the license's content, the
reconciliation stamps are the renewals, and an eviction (0A.4) settles the
cell into the ledger before release.

### 2.3 The dynamic insertion

The agent PREPARES ITSELF A SCHEMA, then inserts files into it:

1. `action=open` with `files` (paths or globs): the machine resolves each
   target through the fs read path (which emits fs/observed - freshness for
   free), records every hit as `observed` with its held version, and
   returns the state presentation. Misses are listed, never guessed.
2. `action=insert` adds to the open machine mid-life (the lease stays).
3. The machine's shape (which searches exist, which ops are legal) is the
   agent's prepared schema, validated at `open` exactly like the live
   containers' Apply.ts Validate (fail-loud, every knob checked).

## 3. THE STATE MACHINE (the sponsored execution block)

### 3.1 The events it consumes

- `fs/observed` (via Factory.Wire on the root context): any external touch
  of a held file flips its cell to a stale-halt - the machine knows the
  file moved underneath BEFORE committing.
- `tools/pre-execute` / `tools/execute`: when the model still calls bash
  (sed/awk) on a HELD file, the machine intercepts: it tags the call, offers
  the batch path in the result prose (never denies - v1 is advisory, the
  control layer comes later as its own plugin), and records the attempt.
- `tools/post-execute`: file-tool facts (the L4 precedent).
- `agent/pre-step`: the turn boundary - the deadline scan, the settle fold
  of in-flight jobs, the pending-commit batch (L8/L6 precedent).
- jobs events: each per-file job's settle truth (the G2 wrapper).
- `session/event`: cross-agent reports fold into the machine's manifest
  (the planted-board precedent) - sub-agents can participate in a batch.

### 3.2 The events it emits (all through the evented write path)

Every file operation goes through **Factory.Write and nothing else**:
intent -> (optional waterfall) -> sandbox policy -> writeText (the fresh-stat
version guard) -> Stash -> root `fs/observed` emit. Consequences: the
governors see the batch's writes exactly as they see any write - no special
path, no hidden writes; the machine's own ledger records each transition
(one log per module, the family strings contract); the machine's assemble
section re-renders only on real events (the silence invariant).

### 3.3 The ledger lines (the contract)

```
machine opened <id> (<n> files, scope=<glob>)
inserted <file> at version <version>
transition running <file> op=<n>/<total>
transition applied <file> version <old> -> <new>
transition errored <file> <reason>
transition halted <file> <reason>          (stale | deadline | pause | interrupted)
machine committed <id> (<applied> applied, <failed> failed, <halted> halted)
machine closed <id>
```

### 3.4 The silence invariant

The assemble section's text changes ONLY on: machine open/close, insert/
remove, transition start/apply/halt/error, and a held file's external
touch. Never on the clock, never per request, no relative ages (the
KV-cache honesty, File-Monitors-Design section 5.2, verbatim). An idle
machine with no events produces byte-identical assemblies.

## 4. THE FILESYSTEM-IN-STATE PRESENTATION (the WHY's schema)

The state presentation is the machine's third face (besides the batch and
the process states) - the assemble section the model reads instead of
running `ls`/`cat`/`grep`:

```
--- FILE MACHINE <id> (held processes; recomputed on events) ---
HELD: 4
	[done]     src/App.ts        v12  (2 ops applied)
	[observed] src/util.ts       v7
	[halted]   src/index.ts      v3   stale - touched externally at v4; resume to re-base
	[errored]  src/missing.ts         not found at insert
SCOPE: src/**  OFF-LIMITS: none
SEARCHES: 2   PENDING OPS: 5
--- END FILE MACHINE <id> ---
```

The reads of held files flow through the harness's freshness path (a read
emits a present fs/observed - filesystem.md:224), so the presentation's
versions are the truth the guarded writes will accept. The LLM sees the
file system's held state first; the bash/tool calls become the escape hatch,
then (the layered-government roadmap) the controlled exception, per control
layer, one plugin each.

## 5. THE COMMONALITY SPLIT - the live-view framework

What the live containers and the batch tool share, extracted into a separate
package (the live-view framework style - the foundation for the layered
control). In representation terms (section 0A): the framework IS the
substrate for MANAGING REPRESENTATIONS - the license flow, the reconciliation
discipline, and the eviction rule are framework-level; each consumer plugin
instantiates its own representation kind over it:

| Shared machinery | Lives in live containers today | Framework extraction |
|---|---|---|
| The state cells (per-agent keyed Maps, volatile refresh, staleness derived) | Interface/State.ts + Execution.ts | `live-view/state` |
| The clock + the no-timers deadline scan | Clock.ts, Board.ScanDeadlines | `live-view/clock` |
| The G2 jobs wrapper (one wrapper, N callers) | Jobs.ts | `live-view/jobs` |
| The evented write wrapper around Factory.Write | Write path usage | `live-view/write` |
| The P5-style storage domain open/recovery | Storage.ts | `live-view/storage` |
| The assemble section parts + collapse + silence invariant | Render.ts, Failsafe.Collapse | `live-view/render` |
| The report/manifest ingestion grammar | Board.ts `[live-report]` fold | `live-view/ingest` |
| The lease (open/stale/close, rendered-once-then-withdrawn) | Board lease | `live-view/lease` |
| The fail-open waterfall discipline + the arming gate | Apply.ts patterns | `live-view/wiring` |

The framework is NOT a plugin - it is a LIBRARY package (`lib-dsh-live-view`
per the naming discussion, or `@playform/lib-dsh-live-view`): no Config, no
apply; the live containers and the batch edit tool (and every future control
layer) depend on it and keep their OWN ledger strings, tools, and configs
(the module-leaves-never-absorbed rule). The extraction order: build the
batch tool against the live containers' patterns FIRST (no fork of shipped
code), extract the framework SECOND once two consumers exist - the standard
rule of three, adjusted to two by the family's parity discipline. The Classic
and EffectTS variants each get the framework as a sibling package (the
split-never-mixed rule).

## 6. THE PACKAGE FORM

### 6.1 The anatomy

`@playform/plugin-dsh-batch-edit` (a tool-primary plugin; the `plugin-`
prefix since a tool is the primary surface, like plugin-dsh-factory):

- **Source/Library.ts** - the loader contract: `name`, `apply`, `Config`,
  `inject = ['pluginFactory', 'tools', 'fs', 'jobs', 'systemPrompt',
  'shell', 'shellEnv', 'workingDirectory']` on the default object (the
  default-object-shadows pitfall).
- **Source/Function/** - Apply.ts (registration only), Machine.ts (the state
  machine + the process cells), Ops.ts (the transition-table executor),
  Tools.ts (the `batch_edit` defineTool), Present.ts (the state
  presentation), Ledger.ts (the strings).
- **Source/Variable/** - Config.ts (all volatile), DefaultCheckSets.ts reuse.
- **Source/Interface/** - State.ts, Process.ts (Process<File>), Events.ts.
- Config (all volatile, hot-editable, P10 refresh): enabled (default
  false - the IDLE-forever posture, like the live containers),
  machinesPerAgent, opsPerCommit, deadlineMs (<= 120000), strictMode
  (search-not-found errors vs skips), interceptBash (off by default in v1),
  monitorChecksets.
- **No client half in v1** - the Web UI gets the diff card through
  `presentationMeta` alone (the cookbook path); a client plugin is later
  work, not a dependency.
- The smokes: the fake-ctx + real-factory harness pattern (smoke-writing);
  every timing transition driven by the fake clock; the vacuously-green trap
  guarded; the Classic/EffectTS parity per the family discipline.

### 6.2 The risks and the mitigations

| Risk | Reality | Mitigation |
|---|---|---|
| Recursive governance: the batch's writes fire fs/observed INTO the governors | REAL if the writes run the plain waterfall path - the governors would try to govern package.json/Cargo.toml mid-batch | Use the **`govern` actor marker** (Gate.ts route 2): the batch tool wraps its actor with the `govern` field, runs the selected steps ITSELF through the factory's direct path (Govern + RegisterGovern), and the event path skips the marked events silently. The Stash idempotence gate (route 5) catches re-emits. Never bypass governance - RE-ROUTE it deliberately. |
| Tool-schema limits | defineTool is flat-typed; no nested objects | The flat field set (2.1) + the `opfile` ingest escape hatch (the report grammar, no schema limit) |
| Event-loop hazards | fs/observed listeners MUST be synchronous, side-effect-only; the emit is unguarded (filesystem.md:185) | The machine's fs/observed listener only flips cells and enqueues; ALL async work (reads, previews, writes) runs at checkpoints or through ctx.jobs - the no-timers discipline verbatim |
| Waterfall hazards | A throwing listener breaks the tool pipeline; missing next() swallows downstream behavior | next() FIRST everywhere; fail-open try/catch with a logger.warn; never deny in v1 (advisory intercept only) |
| Deadline vs the inline cap | The model's call has its own deadline | deadlineMs capped at 120000; overflow continues as a background job with the typed jobId handle (the cookbook's background branch) |
| Stale-version races | A held file changes between insert and commit | The held version is checked at commit time; a mismatch HALTS the file (not the machine) and re-presents state - the halted process, protected and resumable |
| The scope-of-ambition risk | "Eliminate bash entirely" cannot be enforced by this plugin alone | v1 is OPT-IN (enabled=false default), advisory interception, the layered-government roadmap: one control layer per plugin, fs/write-intent slot ownership being the future enforcement plugin's job |
| KV-cache cost | A chattering state section fragments the prompt cache | The silence invariant (3.4) as a HARD contract with smoke assertions |

## 7. THE ACCEPTANCE CRITERIA

1. The plugin loads by the contract (name/apply/Config/inject on the default
   object), disabled by default, and fails loud on invalid config.
2. `batch_edit open` inserts files; every held file appears in the state
   presentation with its held version; misses are listed, not guessed.
3. `batch_edit commit` applies the transition table through Factory.Write
   ONLY: every write is visible as fs/observed on the root context, every
   governed basename is governed exactly once (the govern marker route), and
   the preview diffs match the applied result byte-for-byte.
4. A held file touched externally between insert and commit HALTS its
   process with the stale reason; the machine stays open; the agent resumes
   it explicitly.
5. A commit exceeding the deadline returns the typed background jobId and
   the settle truth arrives through the jobs subscription and the next
   presentation - no plugin-owned timers anywhere.
6. The silence invariant holds: an idle machine renders byte-identical
   assemblies across requests (smoke-asserted).
7. The ledger carries every section-3.3 line, byte-stable strings, one log
   per module.
8. The Classic and EffectTS variants ship with parity smokes; the live-view
   extraction (section 5) waits for two consumers and keeps the modules'
   ledger strings in the modules.
9. The bash-intercept (v1 advisory) tags sed/awk calls on held files and
   offers the batch path without ever denying; enforcement stays out of
   scope for this plugin.
10. Zero writes outside Factory.Write and the plugin's own ledger.

## 8. THE RESIDUALS

1. The exact tool name and the op grammar need the user's confirmation
   (suggested: `batch_edit`; the ops above are the first cut).
2. Regex support scope: literal + simple regex in v1; the ptc-runtime
   integration (the programmable stage, LIVE-CONTAINERS-RESEARCH section 5)
   is the future host for complex transforms.
3. The multi-agent machine sharing (a sub-agent joining the parent's batch)
   rides the session/event fold but needs a scope-decision at implementation
   time.
4. The framework extraction's package name (`lib-dsh-live-view` vs
   `manifest`) is tied to the user's undecided naming refinements (#15).
5. The `fs/edit-intent` slot (the edit waterfall) as the batch tool's
   control seam is listed but unexercised - the first control-layer plugin's
   territory.
6. The eviction rule's trigger values (the lease window, the LRU cap) are
   the first-cut defaults; they need the live tuning pass the monitors got.
7. The graph stage (section 9.1) needs an edge-extraction source decision
   (the TS language service vs. the cheap import-scan) before any design.

## 9. THE LATER STAGES (the vision, per the user)

The immediate deliverable is the schema + the state machine + the license
flow + the eviction rule (sections 0A, 2, 3). The stages beyond it, in the
user's own direction:

### 9.1 The graph stage (the license carry)

Files kept as GRAPHS inside our own internal CARRY: each license carries
WEIGHT, and the weights together are a representation of the file system -
the weighted graph. The machine's flat cell map becomes an edge-typed graph
(imports, references, ownership); the license weights are the edge costs
(the protection strength, the reconciliation cost, the eviction priority).
The eviction rule and the reconciliation walk the graph by weight, not by
recency alone.

### 9.2 The code-block stage (the reflective surface)

We are primarily dealing with CODE BLOCKS, not files. From a SINGLE CALL
the agent can replace / rename / connect across the reflective API - the
TypeScript SDK's language-service class of operations: renaming
`const State: State = ...` to `const State: Operational = ...` propagates
to every reference in every held file, exactly as the VSCode rename does -
because the representation already knows the type's identity and its
references. The mutations (rename, connect, move, extract, inline) exceed
anything `write(filename, content)` offers, because the model already
holds the code's structure.

### 9.3 The token-waste elimination

The point of the reflective surface: the model KNOWS the code block it
means - presenting a full-file rewrite (or a bash sed) spends tokens,
space, and conversational length over something the model already has.
The code-block ops present the mutation directly (the symbol, the kind of
change, the scope) and the machine computes the edit - the AST layer rides
the same license/reconciliation/eviction contract; only the op vocabulary
grows.

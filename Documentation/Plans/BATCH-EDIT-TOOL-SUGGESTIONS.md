---
title: Batch Edit Tool - the suggestions and improvements
category: Plans
kind: living-record
date: 2026-10-20
status: active
registry: Documentation/Plans/BATCH-EDIT-TOOL-SUGGESTIONS.md
index: Documentation/INDEX.md
statuses:
	- name: the paradigm deepening (the Process<Halted> type system + the reversed verbs)
		state: designed
		evidence: section 1
	- name: the variant/form set (nine forms)
		state: designed
		evidence: section 2
	- name: the improvements over bash-sed and manual edits
		state: designed
		evidence: section 3
	- name: the counter-intuitive ideas
		state: designed
		evidence: section 4
	- name: the ranked suggestion set for the implementation agent (agent 3)
		state: ready
		evidence: section 5
	- name: the call-escape WHY (the user's binding motivation) + the government layers
		state: integrated
		evidence: sections 1.0, 2.1, 4.1b, the ranks 13-14
---

# BATCH EDIT TOOL - Suggestions + Improvements (R-BET-2)

Date: 2026-10-20
Status: research agent R-BET-2 - the suggestions + improvements pass; this file is the sole deliverable
Prepared by: the research agent R-BET-2 (cloudflare-workers-ai / @cf/zai-org/glm-5.3-flash / low)
Routing law: every subagent = provider cloudflare-workers-ai / model @cf/zai-org/glm-5.3-flash / reasoningEffort low.
Base: Documentation/Plans/TOMORROW-REVIEW.md (the live-containers v1 + wave 2 + wave 3 status; the user's batch-edit feature directive) + Documentation/Archive/Live-Containers/LIVE-CONTAINERS-RESEARCH.md + Documentation/Archive/Live-Containers/Design/{IMPLEMENTATION-DESIGN,FILE-MONITORS-DESIGN,APPEND-SEAM,AWAIT-MARKER,COMPLETION-ERGONOMICS,PLANTED-LEASE,SUGGESTER-CONFIGURED}.md + Documentation/Plans/BATCH-STATE-PLUGIN.md.
Note: the sibling research R-BET-1 (BATCH-EDIT-TOOL-FEATURE.md) had NOT landed at write time (checked Documentation/Plans/ - absent). This document stands alone; the merge point with R-BET-1 is section 6.
Read-only discipline: ONE file written (this one). ASCII + tabs throughout.
Thinking directive applied: think in paradigms; take the most reversed, counter-intuitive view - the file is not a byte-sequence, it is a PROCESS.

---

## 1. THE PARADIGM DEEPENING: the file-as-process philosophy's full consequences

The default UNIX view: a file is a passive byte-sequence; the tools act ON it
(stat, read, write, sed). The reversed view this feature adopts: every file on
the system is a PROCESS in a lifecycle, halted by default; the developer/agent
HOLDS the processes. The batch edit tool is then not a "text utility" - it is a
PROCESS CONTROL SURFACE. This section draws out the full consequences so the
implementation agent builds the type system first, not the string ops.

### 1.0 THE WHY: the call-escape problem is the core motivation

The user's WHY, verbatim (binding): "the previous way: commands / instructions
here -> an agent thinks -> it realises it should make edits -> writes a call
to modify the file system -> THIS CALL ESCAPES the environment the agent
started from - having the option to CONSTRAIN FILE EDITS so the agent harness
can HOLD THEM ALL IN STATE means the tools will not be required - the whole
editor functionality + the ACTUAL STATE OF THE FILE SYSTEM is presented and
accessible immediately to the LLM WITHOUT the bash calls or the tool file
calls, as it is represented by this new state machine - thus ELIMINATING
ENTIRELY the bash and other tools - using the agent harness's powers as a DSL
- providing MANY MANY layers of control - a PLUGIN FOR EACH ONE - just like a
government protects its people / halted processes."

The core promise, drawn tight: EVERY file operation in the batch is a STATE
TRANSITION the harness HOLDS. The edit call never escapes the environment -
there is no syscall-shaped side door; the mutation is a transition inside a
container the harness owns, presents (the live view), and controls (the
layered governance). The consequences, ranked by how much they should shape
the implementation:

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
	   The layer set is in section 2.1; the ranked set carries them.

### 1.1 The Process<Halted> type system

Every file the batch tool TOUCHES enters a typed lifecycle. The states:

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

The typed operations (the verbs the tool exposes, the reversed-UNIX set):

	spawn(path)        claim a file into the batch (NOT "open")
	observe(path)      read-with-version (NOT "read": the result carries the
	                   version stamp; the freshness is provable later)
	transform(file)    apply one operation to the claimed file (the ops below)
	halt(path)         abort the in-flight operations on one file
	resume(path)       replay the journaled operations from the last good state
	merge(file)        reconcile the file's new content back into the system
	                   (the commit verb - the ONLY verb that touches disk)
	release(path)      dissolve the claim (the process returns to Halted)

The REVERSAL is precise: in UNIX, read/write happen immediately and the
system is always mutated. In the process view, NOTHING touches the disk until
merge. The default is halted-and-unmutated; mutation is the exceptional,
explicit, journaled act. The bash-sed world inverts this (every byte is a
mutation; nothing remembers).

### 1.2 The file as a living being: the metadata, the ownership, the process-tree

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

The governance resonance: the family ALREADY gives files a pulse - the
fs/observed chain, the governor, the pinner, the normalize family's version
bump. The batch tool should ride that exact pulse: one merge = one fs/observed
event burst = one governor pass over EVERY edit in the batch. The files were
already processes in this family's event system; the batch tool just names it.

### 1.3 The implications for the tools: no stat/read/write

The reversed-UNIX consequence for the implementation: the plugin should NOT
expose a generic "file utility". It exposes the process-control verbs above,
and the harness's existing read/write/edit tools remain the DEFAULT for the
single-file case. The batch tool is the CONTAINER: the agent prepares the
batch schema, inserts the files (spawn), the state machine processes them
(match/transform/validate), and merge commits - like a code execution block
where the language is "file operations" and the runtime is the plugin. The
verb mapping discipline (per the G2/G5 decisions in IMPLEMENTATION-DESIGN.md):
the batch runs INSIDE the plugin's own tools/execute arm and the governed
shell path only when a check needs a command; the content-mutating family
(write/edit/raw-write/normalize-file) stays non-detachable - the batch is the
policy-honoring caller, never the bypass.

---

## 2. THE VARIANTS/FORMS: the batch tool's nine forms

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
	    transaction semantics on the engine (section 3.1).
	6. THE ROLLBACK/JOURNAL    every batch is reversible: the journal holds
	    the per-file pre-image + the op list; `revert <batchId>` replays it
	    backward. The idempotent, replayable form (section 4.3).
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

### 2.1 THE GOVERNANCE LAYERS: the government of the halted processes

The user's WHY names the end shape: MANY MANY layers of control, A PLUGIN FOR
EACH ONE - "just like a government protects its people / halted processes."
Each layer is a protection AROUND the process (the file), not a feature
inside it. The layer set, ordered from the outermost to the innermost:

	1. THE OBSERVATION LAYER    the live view (3.5): every process's state,
	   version, heartbeat and ledger are PRESENTED to the LLM without any
	   call. A citizen that is always visible. (The plugin layer: the
	   assemble/section renderer.)
	2. THE CONSTRAINT LAYER     the schema validation + the path/scope rules:
	   the batch's declared universe of files is the LAW; any op outside it
	   is a typed rejection before the state is touched. (The plugin layer:
	   the Config + the schema validator.)
	3. THE PERMISSION LAYER     the checkpoints (form 4) + the lease (4.5):
	   the state transitions that require consent (the ask decisions) and
	   the ownership rules (one batch per file). (The plugin layer: the
	   pre-execute waterfall's ask kind + the lease registry.)
	4. THE ROLLBACK LAYER       the journal (3.2): every settlement is
	   reversible; the citizen's pre-state is remembered. (The plugin
	   layer: the batch_edit_journal storage domain.)
	5. THE AUDIT LAYER          the governed merge + the event lines (3.3):
	   every transition is evented, propagated, and ledgered - the record
	   the governors hold. (The plugin layer: the fs/observed chain + the
	   per-batch ledger lines.)

The COMPOSITION rule: the layers are plugins (or plugin modules), not flags
inside one monolith - each independently enabled, each fail-open on the
family's pattern, each contributing its own ledger line. The government is
the stack; the batch engine is the territory it governs.

---

## 3. THE IMPROVEMENTS over bash-sed and manual edits

### 3.1 The atomicity: the all-or-nothing batches

bash-sed across N files has zero atomicity: the middle of the loop dies and
the tree is half-mutated, unremembered. The batch engine loads every file into
the state machine, applies the ops IN MEMORY, and merges only when ALL files
validate. One bad file = one typed error + the whole batch either completes on
the survivors (the config choice) or rolls back entirely. Rationale: the
agent's failure mode with bash is precisely the partial state it cannot see;
the batch makes the partial state unrepresentable. Cost: S (the engine's
merge gate) - the rollback journal below is the shared prerequisite.

### 3.2 The rollback: the undo journal

Every merge writes a journal record: the batch id, the file, the pre-image
hash + the content (or the reverse patch), the ops applied, the settle time.
`revert <batchId>` or `revert <batchId> <file>` replays backward. This is the
manual edit's missing superpower: the manual edit tool has no undo across
calls; the batch remembers. The storage discipline per the family (the D3/M5
decision): a NEW storage domain (e.g. `batch_edit_journal`), ONE table, the
record schema owned by the plugin, the invalidRecords backup-and-skip - NEVER
an extension record in the shared package_governance domain (the v3 bump blast
radius). Cost: M (the domain + the revert path + the smokes).

### 3.3 The governance integration: the governors see EVERY edit in the batch

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

### 3.4 The ledger: the per-batch lines

One batch = a bounded ledger block: the batch id, the form, the file count,
the op count, the match counts, the settle/errored/reverted tallies. Rendered
in the tool result (the model sees the truth) and folded into the governance
storage (the user sees the history). The KV-cache honesty rule from D3
applies verbatim: the batch stanza is stable-until-event - its text changes
only on the batch lifecycle events, never on the clock, no relative ages.

### 3.5 The visibility: the live view, framework-style

The open batch renders as a LIVE section in the prompt (the live-containers
channel: the system-prompt/assemble waterfall, the append-only section, the
TTL cache): the spawned file table, the running ops, the match counts, the
settle state. The framework-style live view means the agent SEES its own
batch as a running process - the same paradigm, rendered. The command
precedent is the live containers' board stanza. Cost: M (the section renderer
+ the invalidation on the batch events; the IDLE-forever posture: the section
renders NOTHING until a batch is open, byte-identical behavior otherwise).

### 3.6 The schema ergonomics: the agent's self-prepared schema

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

### 3.7 The honest accounting: why this beats the status quo, precisely

	vs bash-sed:     atomicity (3.1), rollback (3.2), governance (3.3),
	                 version safety (the observe-stamp vs the race), the
	                 structured result (no stdout parsing), the schema
	                 validation (3.6), the live view (3.5).
	vs manual edits: the N-file scale, the cross-file consistency (the
	                 process-tree ordering), the journal, the per-batch
	                 ledger, the single tool call vs N tool calls (the
	                 token economics: one batch call replaces the 10-30
	                 read+edit round-trips).
	vs the status quo's hidden cost: the governor chain is ALREADY paid for;
	                 the batch rides it instead of bypassing it. bash-sed is
	                 the expensive option when governance is counted.

---

## 4. THE COUNTER-INTUITIVE IDEAS: the wilder consequences

1. THE FILES THAT RUN. A watched file with an attached handler (the
	monitor's check set) is literally RUNNING: it has a heartbeat, a version
	pulse, vital signs (the indicator band), and an error state. The reversal
	complete: the batch tool's monitor form does not "watch files" - it keeps
	files alive. A file that stops matching its declared check set is not
	"changed"; it is SICK (the Errored state), and the report says so.
1b. THE EDIT CALL THAT CANNOT ESCAPE. The old flow is the CALL-ESCAPE: the
	model writes a mutation call, the call leaves the session's world, and
	only a stdout echo returns. The batch's reversal: the call never leaves
	- the mutation is a transition INSIDE the state machine the harness
	holds, and the tool result is the machine's own rendering (1.0a). The
	deeper consequence: the RESULT is the truth (the same object the engine
	holds), not a REPORT of the truth (the shell's stdout). The agent and
	the plugin share one ground truth; the escape is eliminated by
	construction, not by policy.
2. THE BATCH AS A SINGLE TRANSACTION OBJECT. Not "a list of edits" - ONE
	object with its own identity, lifecycle, lease, and ledger, held by the
	plugin the way the harness holds a job. The batch can be SAVED (the
	journal), PAUSED (the lease), RESUMED (the replay), INHERITED (the child
	agent picks up the parent's batch - the G5 splice-pickup pattern), and
	ABORTED. The model's handle to it is just the id.
3. THE EVENT-SOURCED FILE STATES. Every edit is an EVENT the system can
	replay. The file's current content is a fold over its event history; the
	revert is the backward replay; the "what changed between version 3 and
	version 7" question becomes a fold query, not a diff of snapshots. The
	journal (3.2) is the v1 of this: the events are the settled-batch
	records. The deeper stage (the per-op event log with the arbitrary
	time-travel) is deliberately deferred - the journal is enough for the
	rollback guarantee, and the storage discipline says earn the schema.
4. MUTATION AS THE EXCEPTION. The UNIX default is mutation; the process
	default is halted-and-unmutated. The batch tool embodies it: the merge
	verb is the ONLY disk toucher, everything else is in-container state.
	The agent's mental model shifts from "I edit files" to "I run processes
	and commit settlements".
5. THE OWNERSHIP LEASE AS THE CONFLICT RULE. Two agents editing one file
	is not a "race" - it is a second spawn on a claimed process, and it
	fails with the typed conflict + the owner's batch id. The lease has a
	TTL and the planted-lease inheritance (the live containers precedent):
	an inherited claim keeps the second batch alive without the owner.
6. THE SEARCH FORM AS THE PROCESS CENSUS. The one-shot search is not
	"grep" - it is the census of which processes match the pattern, and the
	result can FEED the next batch's spawn set (the search->spawn pipeline is
	just two forms of the same engine).

---

## 5. THE RANKED SUGGESTION SET for the implementation agent (agent 3)

The ranking: (the paradigm correctness x the user's stated intent) first, the
trust/rollback guarantees second, the ergonomics third, the deferred ambition
last. The cost scale: S = the days-scale engine work on the existing patterns;
M = a wave of its own (the new module + the storage domain or the section
renderer + the smokes); L = the new machinery beyond the family's precedents.

	RANK  SUGGESTION                                           COST
	----  ---------------------------------------------------  ----
	1     THE ENGINE CORE: the Process<Halted> state machine
	      + the spawn/observe/transform/merge/release verbs
	      + the agent-prepared schema (3.6) + the one-shot
	      search form + the dry-run flag. Everything else
	      hangs off this. The type system FIRST.               S-M
	2     THE GOVERNED MERGE: every file merge rides the
	      existing fs/observed chain + the batch lifecycle
	      events in the event system; the content-mutating
	      family stays non-detachable (3.3). The silence
	      discipline: the batch is tracked, never silent.      S
	3     THE ATOMIC MERGE GATE + the survivors/all-or-
	      nothing semantics (3.1): the batch completes or
	      the batch does not exist.                            S
	4     THE UNDO JOURNAL: the new storage domain
	      batch_edit_journal (the D3/M5 pattern: a new
	      domain name, one table, the plugin-owned schema,
	      the invalidRecords backup-and-skip) + revert
	      batch/file + the smokes (3.2).                       M
	5     THE STAGED PIPELINE form: plan -> review -> apply
	      with the re-validation on apply (the observe-stamp
	      freshness check) + the diff-aware per-file patches
	      (forms 2 + 9).                                       M
	6     THE LIVE VIEW: the open-batch section in the
	      system-prompt/assemble waterfall (the stable-
	      until-event stanza, the IDLE-forever posture,
	      byte-identical when no batch is open) (3.5).         M
	7     THE INTERACTIVE CONFIRMATION checkpoints: the
	      per-op confirm field + the ask decision at the
	      merge checkpoints (form 4).                          S
	8     THE MONITOR/SWEEP forms: the batch holds a lease,
	      the wave-3 monitor machinery rides in verbatim
	      (the check runner sharing, the clock-based
	      schedule, the no-real-timers rule) (forms 7+8).      M
	9     THE PROCESS-TREE EDGES: the declared file
	      dependencies ordering the merge + the dependent
	      error propagation (1.2).                             M
	10    THE OWNERSHIP LEASE with the TTL + the planted-
	      lease inheritance for the multi-agent batches
	      (4.5).                                               S-M
	11    THE TWO TWINS: the Classic package first, then the
	      byte-identical-ledger ETS twin (the D2 1.1 split
	      discipline). NOT optional - the family contract.     M
	12    THE EVENT-SOURCED DEEPENING: the per-op event log
	      + the arbitrary time-travel folds (4.3). DEFERRED
	      - the journal already buys the rollback; earn the
	      schema before the time machine.                      L
	13    THE GOVERNMENT STACK: the five control layers
	      (2.1: observation / constraint / permission /
	      rollback / audit) as INDEPENDENTLY-ENABLED plugin
	      modules, each fail-open, each with its own ledger
	      line - the user's "a plugin for each layer". The
	      v1 ships the constraint + audit layers bound (the
	      engine cannot exist without them); the permission
	      + rollback + observation layers grow per the
	      ranks 4, 7, 6 above.                                 M
	14    THE ESCAPE-ELIMINATION TRACKING: the per-batch
	      ledger records the CALLS REPLACED (the round-trips
	      saved, the escaped-call count avoided) so the
	      tool-elimination direction (1.0b) is MEASURED,
	      not asserted - the harness-as-DSL adoption curve
	      visible in the same ledger the governors hold.       S

The package shape suggestion: ONE plugin (hook-dsh-batch-edit + the ETS twin)
following the hook-dsh-live-containers anatomy (the Config/Catalog/Apply/
Render split, the smokes as the arbiter, the ledger-string contract, the
tabs discipline), NOT a bash-wrapper: the engine is in-container state, the
shell is only the check runner's carrier.

---

## 6. THE RESIDUALS + the R-BET-1 merge point

1. R-BET-1's BATCH-EDIT-TOOL-FEATURE.md had NOT landed at write time. The
	merge point: its feature inventory should map onto this document's
	sections 2 (the forms) and 5 (the ranked set); any R-BET-1 finding that
	contradicts a rank here wins on recency (the addendum-wins rule the
	family uses on the design conflicts).
2. The harness docs at ~/Developer/Documentation/Module/deepseek-harness/
	were ABSENT on this host - the seam verification here inherits the
	live-containers designs' verified anchors (the tool-coach and the
	live-containers precedents) instead of fresh asar reads. The
	implementation agent must re-verify the two seams it actually touches:
	the tools/execute arm (the D2 G1 carrier) and the system-prompt/assemble
	waterfall (the D3 section pattern), both documented in
	Documentation/Archive/Live-Containers/Design/IMPLEMENTATION-DESIGN.md
	section 3.2 and FILE-MONITORS-DESIGN.md section 5.
3. The journal's pre-image storage size: the per-file full pre-image vs the
	reverse-patch tradeoff is UNDECIDED (section 3.2). Suggestion: the full
	pre-image for the v1 (the simpler revert, the bounded ring cap like the
	live containers' outputLimitBytes), the reverse-patch as the wave-2
	compression.
4. The batch lifecycle event names: NEW event names may require a new
	storage domain version (the D3/M5 open contract). The implementation
	agent must decide: the batch events in the plugin's OWN domain (the
	journal's) vs the shared governance chain. The suggestion: the batch
	LIFECYCLE events in the plugin's own domain; the per-file merges ride
	the EXISTING fs/observed events unmodified.
5. The scheduled sweep's default posture: the IDLE-forever rule (the
	monitors: "off" default) should apply - the batch tool ships with every
	form opt-in, the one-shot search as the only always-available form.
6. The naming: "batch-edit" vs the user's approved names discipline (#15) -
	the name needs the user's ratification before the packages land.

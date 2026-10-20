# LIVE CONTAINERS - IMPLEMENTATION DESIGN (D2)

Date: 2026-10-19
Status: implementation design - the byte-ready spec the CODER (C2) executes
Prepared by: the DESIGN lane D2 (cloudflare-workers-ai / @cf/zai-org/glm-5.3-flash / low)
Base: Documentation/Plans/LIVE-CONTAINERS-RESEARCH.md (v1) + Documentation/Plans/
LiveContainers/Requirements/00-07 (wave 2) + the I1 binding constraints (00
section 5.7-5.8, 01 section 12, 07 section 5).
Scope: ONE package, two twins - Classic/packages/hook-dsh-live-containers +
EffectTS/packages/ets-hook-dsh-live-containers. Wave 2 EXTENDS THE SAME
PACKAGE (07 section 3.8); this design specifies the phase boundaries so the
v1 coders (A1/A2/A3) and the wave-2 coder (C2) never collide.
Addenda coverage: the DESIGN ADDENDA (I2-I6: AWAIT-MARKER, APPEND-SEAM,
COMPLETION-ERGONOMICS, PLANTED-LEASE, SUGGESTER-CONFIGURED) had NOT landed in
Documentation/Archive/Live-Containers/Design/ at write time (checked at start and
twice during the run). Those five areas are designed HERE (sections 4, 5, 6,
3.4 and 2) and flagged in the report for ratification against the lanes'
final texts at the C2 dispatch.

---

## 0. THE DECISIONS AT A GLANCE

1. G1 (the CAN-1 carrier): a tools/pre-execute decision CANNOT carry a
	synthetic non-error tool result. Verified in the harness:
	- dsh-tools (app.asar dsh/node_modules/@deepseek-ai/dsh-tools/lib/index.js,
		prepareExecution): the only decision kinds are allow / deny / ask /
		cancel; a deny materializes `content: [{type:"text", text:"Error:
		<reason>"}], isError: true` - the model sees an ERROR result, never a
		completed one. There is NO accept-with-content shape in pre-execute.
	- The tools/execute waterfall (dsh-tools lib/index.js
		dispatchScheduledExecution + cordis lib/index.js waterfall): "a
		listener that does not call next() vetoes the rest of the chain,
		including the built-in behavior" - a listener can REPLACE the real
		dispatch; the returned value is then normalized through
		normalizeDispatchResult -> createSuccessResult, which VALIDATES the
		value against the tool's own output schema and RENDERS it through the
		tool's own output.render.
	DECISION: the carrier is the PLUGIN'S OWN tools/execute ARM: the
	pre-execute listener decides + starts the job + tags the exec object
	(WeakMap); the tools/execute listener, seeing the tag, returns a
	fabricated canonical-value result `{ kind: "foreground", ... stdout:
	{text: <the marker bytes>} }` WITHOUT calling next() - the bash body
	never runs, and the pipeline renders a SUCCESSFUL (isError: false) tool
	result whose text is exactly the marker. The harness itself ships the
	precedent: the bash tool's renderPromoted already renders a successful
	"[still running ...]" result. The deny-with-reason shape and the
	post-execute arm and the tool-jobs notice path are each rejected with a
	reason (section 3.2).
2. G2 (the producer re-dispatch): a command-runner wrapper ONLY (I1 5.1).
	The wrapper replicates the bash tool's OWN background adapter
	(dsh-tool-bash lib/index.js startJob/processJob/processSources) over the
	same governed path: ctx.shell.resolve + ctx.shell.execute (sandbox +
	deadlines unmodified), ctx.shellEnv.collect(exec), ctx.workingDirectory
	.ensure(agent, signal), ctx.get("sandboxPolicy")?.resolve({session}),
	ctx.jobs.start({kind, label, toolCall, owner, output, run}). The
	content-mutating family (write, edit, raw-write, normalize-file) is
	PERMANENTLY NON-DETACHABLE in every mode - hardcoded in Policy.ts
	(section 5.1).
3. G5 (the child->parent report pickup): the parent's plugin listens to
	`agent/inbox/spliced` (emit mode, plain ctx.on) - verified in
	dsh-agent-loop lib/index.js: every inbox mutation commits one normalized
	`agent/inbox/spliced` event whose data is `{ target, start, removedCount?,
	inserted, outcome? }`; a child's send_message report lands in the
	parent's inbox as an insertion, so the splice's `inserted` messages are
	the pickup surface. The board's truth is settlement-first (jobs
	settled events) with the explicit report as the high-fidelity overlay
	(section 3.5).
4. The four residuals: (a) RATIFIED "honesty beats cache" - withdrawal after
	delivery is one prompt-tail rewrite per settlement, accepted; (b) the
	suggester privacy: DEFAULT "redact" for every route (first 200 chars +
	length); "verbatim" only by explicit config, with the SCHEME disclosure
	as the consent surface; (c) RATIFIED the idle-wake turn as channel 4
	(model-visible; the user sees the wake in the GUI); (d) the phase order:
	PHASE 1 = the v1 assemble-side plugin (A1/A2/A3), PHASE 2 = the wave-2
	extension (C2) on the SAME package, strictly sequential, with an exact
	file-ownership map (section 9.3).
5. The addenda (I2-I6) are designed here: AWAIT-MARKER (section 4.3),
	APPEND-SEAM (section 3.3), COMPLETION-ERGONOMICS (section 4.2),
	PLANTED-LEASE (section 3.4), SUGGESTER-CONFIGURED (section 2.6).

---

## 1. THE PACKAGE ANATOMY

### 1.1 The two twins

- Classic/packages/hook-dsh-live-containers/ (the primary, built first)
- EffectTS/packages/ets-hook-dsh-live-containers/ (the twin: the same
	contract behind Effect v4 - the ets-base-dsh + ets-plugin-dsh-factory
	layer; the ledger strings BYTE-IDENTICAL; mirror the ets-hook-dsh-tool-
	coach anatomy exactly). The ETS twin ships AFTER the Classic twin is
	accepted (phase 2's last step), per the family's split discipline.

### 1.2 The file tree (Classic twin; the ETS twin mirrors it 1:1)

	package.json
	cordis.patch.yml
	prepublishOnly.sh          (the two-step build; section 1.3)
	tsconfig.json
	Configuration/ESBuild.ts    (+ the hand-kept ESBuild.js twin)
	Configuration/Test-ESBuild.ts (+ Test-ESBuild.js twin)
	Configuration/TypeScript.noemit.json
	Configuration/TypeScript-Test.noemit.json
	Source/Library.ts
	Source/Variable/Config.ts
	Source/Variable/Catalog.ts
	Source/Variable/DefaultBlocks.ts
	Source/Function/Apply.ts
	Source/Function/Render.ts
	Source/Function/Counters.ts
	Source/Function/Policy.ts
	Source/Function/Jobs.ts
	Source/Function/Detach.ts
	Source/Function/Completion.ts
	Source/Function/Board.ts
	Source/Function/Failsafe.ts
	Source/Function/Suggester.ts
	Source/Function/Set.ts
	Source/Function/Plant.ts
	Source/Interface/Config.ts
	Source/Interface/State.ts
	Source/Interface/Execution.ts
	Source/Interface/Events.ts
	Source/Test/<phase-2 test folders> (section 7)
	README.md
	SCHEME.md

Phase 1 (A1) creates: Library.ts, Variable/Config.ts, Variable/
DefaultBlocks.ts, Function/{Apply,Render,Counters}.ts, Interface/{Config,
State,Execution}.ts, README.md, SCHEME.md, package.json, cordis.patch.yml,
tsconfig.json, Configuration/*, prepublishOnly.sh. Phase 2 (C2) ADDS:
Variable/Catalog.ts, Function/{Policy,Jobs,Detach,Completion,Board,Failsafe,
Suggester,Set,Plant}.ts, Interface/Events.ts, the Source/Test tree, and the
wave-2 sections of Config/Apply/Library/README/SCHEME (edits, never rewrites;
section 9.3).

### 1.3 The deterministic build + the two-step test compile

prepublishOnly.sh (mirror hook-dsh-core's, ORDER MANDATORY):

	set -e
	Build "Source/**/*.ts" "!Source/Test/**/*.ts" \
		--ESBuild Configuration/ESBuild.ts \
		--TypeScript Configuration/TypeScript.noemit.json
	Build "Source/Test/**/*.ts" \
		--ESBuild Configuration/Test-ESBuild.ts

The plugin build's Target plugin wipes Target/ recursively, so the test
build runs SECOND (it wipes only Target/Test). The negation is mandatory:
'Source/**/*.ts' matches the Test tree; without it the plugin build fails on
test-only syntax and ships Test output inside Target. Then, in package.json:

	"scripts": {
		"prepublishOnly": "sh prepublishOnly.sh && tsc -p tsconfig.json && tsc-alias -f -p tsconfig.json"
	}

(red tsc FAILS the build; the consumers type-check against the built Target).
The test folders follow the family per-test layout: Source/Test/<Name>/
{Test.ts, README.md} -> Target/Test/<Name>/Test.js, run standalone and under
Maintain/Run-Smokes.mjs which guards each folder's printed PASS count against
its README (the vacuously-green guard). Test-ESBuild.ts is the hook-dsh-core
file verbatim (bundle: false, outbase Source/Test, sourcemaps on, the
Target-Test wipe plugin).

### 1.4 The package.json + cordis.patch.yml

Mirror hook-dsh-tool-coach's: name @playform/hook-dsh-live-containers, version
0.0.1, type module, main ./Target/Library.js, exports { ".", "./cordis.patch
.yml", "./SCHEME.md", "./package.json" }, files [Target, cordis.patch.yml,
README.md, SCHEME.md], dsh.bundle.patch ./cordis.patch.yml. Dependencies:
@playform/hook-dsh-core 0.0.1 + @playform/plugin-dsh-factory 0.0.1.
DevDependencies: @deepseek-ai/cordis 4.0.4, @deepseek-ai/dsh-llm
0.2.0-rc.2, @deepseek-ai/dsh-system-prompt 0.2.0-rc.2, @deepseek-ai/dsh-tools
0.2.0-rc.2, @deepseek-ai/dsh-jobs 0.2.0-rc.2, @deepseek-ai/schemastery 3.18.4,
@playform/build 0.3.4, @types/node 26.6.5, tsc-alias 1.9.7, typescript 7.0.2.
(The dsh-jobs devDependency supplies the JobSpec/JobEvent TYPES for the
Source; the runtime resolves from the running dsh's own copy - the family
precedent: schemastery and dsh-tools are devDependencies too.)

cordis.patch.yml: ONE insert entry `- insert: - id: hook-dsh-live-containers`
whose config is enabled: false and NOTHING else - the plugin ships DISABLED,
never appears in the profile's bundles, the IDLE-forever posture (v1 residual
5; every spec restates it). The patch file carries the full default surface
as comments only (the schema defaults are the truth).

### 1.5 The Library.ts contract

The loader contract verbatim from the family: `export const name`,
`export const apply`, `export const Config`, `export const inject` and
`export default { name, apply, Config, inject }` - the DEFAULT OBJECT CARRIES
ALL OF THEM (a missing member on the default object throws
`cannot get property "fs" without inject` at runtime; a smoke that calls
apply directly never catches this - Library.ts:7-11 of the tool-coach).
inject (phase 2 full list): ["pluginFactory", "tools", "systemPrompt",
"shell", "shellEnv", "workingDirectory", "jobs"]. Phase 1 injects only
["pluginFactory", "tools"]; phase 2 EXTENDS it (the edit is additive). The
apply body returns NOTHING.

### 1.6 The IDLE-forever posture + the activation proof

The plugin ships DISABLED: `enabled: false` in the schema default AND in the
patch. On a cold mount the State build logs `disabled (enabled=false)` (the
byte-exact ledger line) and the listeners no-op (every listener checks
State.On first). Enabling happens ONLY by an explicit ACTIVATE (the user
edits the profile); the activation proof logs the Activate block (the
hook-dsh-core Activate helper): `bundle 0.0.1`, `blocks <n>`, `refresh
<policy>`, `detach <mode>`, `failsafes <on|off>`, `suggester <mode>`.

---

## 2. THE CONFIG SCHEMA

The Schemastery discipline (hook-dsh-normalize-dash/Variable/Config.ts is the
pattern): the schema is built with the factory's standalone helper
`Schema(shared = false, fields)` (the NON-MANIFEST posture - the plugin has
NO fs/observed machinery, so shared: false emits only the two universal
volatile cells log/logFile, overridden by the plugin's own defaults). Every
knob below is `.volatile()` unless marked (plain) - hot edits commit WITHOUT
remounting; the factory State builder unwraps `{ get }` cells and the P10
loader/volatile-update listener refreshes them in place.

### 2.1 The shared knobs (phase 1 + phase 2, all volatile)

	enabled: boolean, default false            (the IDLE-forever posture)
	log: boolean, default true
	logFile: string, default ~/.dsh/live-containers.log
	sectionName: string, default "live-containers"
	refresh: "request" | "ttl", default "request"
	ttlCalls: number, default 8
	separator: string, default "---"
	sectionBudgetBytes: number, default 4096   (failsafe 8, section 6)

### 2.2 The blocks (phase 1 + phase 3's host)

	blocks: array of block specs, the ARRAY volatile (its leaves plain -
	schemastery rejects volatile leaves under an enclosing volatile field;
	a kind change lands on the next assembly, which is safe: the render
	engine dispatches per block id and keeps NO per-kind structural state;
	the research's "except kind-changing fields" is hereby amended with this
	reason). Each spec:

		id: string (stable label; the block's key)
		kind: one of the kind registry (section 2.7)
		template: string (the rendered body; {{token}} variables)
		enabled: boolean, default true
		vars: object (per-block token values)
		trigger: "request" | "event" | "ttl" | "manual", default "request"
		ttlCalls: number, default 8 (used when trigger = "ttl")
		scope: "always" | "when-agents-active" | "when-tasks-live" | "never",
			default "always"

The DEFAULT config ships the full 14-entry catalog (03 section 3) with
sensible enablements: todo-list, command-runner, session-stats ON; the rest
dormant (enabled: false) - and the PLUGIN still disabled. The defaults live
in Variable/DefaultBlocks.ts (data, not code); Variable/Catalog.ts is the
same 14 entries as the suggester's input and the docs' block table - ONE
source, THREE consumers (03 section 2). The catalog entries ARE the config
presets: `live_container_set template=<id>` instantiates a preset into the
per-agent state (never into the config file).

### 2.3 The detach policy knobs (phase 2, all volatile)

	detach: object volatile, leaves:
		mode: "off" | "long-running" | "all" | "selected", default "off"
		allRequiresConfirm: boolean, default false - mode "all" FAILS LOUD
			at load unless this is true (01 section 5's DANGEROUS flag)
		longRunningMarkers: string[], default ["cargo build", "pnpm build",
			"npm install", "pnpm install", "pip install", "cmake", "make",
			"go build", "tsc -b", "next build"]
		minHistoricalMs: number, default 20000
		historyWindow: number, default 5
		selectedTools: string[], default []
		selectedPatterns: string[], default []
		maxLivePerAgent: number, default 5
		minLatencyMs: number, default 2000
		liveTimeoutMs: number, default 120000
		dedup: boolean, default true
		retryFailsafeCount: number, default 3

liveTimeoutMs DEFAULT IS 120000 - a DELIBERATE amendment of 01 section 7's
600000: the I1 sandbox rule (01 section 12.2) mandates liveTimeoutMs <= the
inline deadline for the tool family, and the bash executor's inline default
is timeoutMs 120000 (dsh-bash-local README config table). The schema
validates liveTimeoutMs >= 1000 and <= 600000; the SCHEME documents the
<= inline-deadline requirement as a composition contract (the plugin cannot
read the harness's inline timeout policy, so the constraint is enforced at
config-authoring time + by the smoke's timer proof).

The command-runner family and the PERMANENTLY NON-DETACHABLE family are
HARDCODED in Policy.ts (section 5.1), not config: the non-detachable family
is rejected even when listed in selectedTools (I1 5.1/12.1).

### 2.4 The planted-block knobs (phase 2, all volatile)

	plant: object volatile, leaves:
		stallMs: number, default 45000
		closeMs: number, default 300000
		reportRateMs: number, default 2000
		stallBudgetMs: number, default 180000
		stallAction: "warn-only" | "prune", default "warn-only"
		orphanBudgetMs: number, default 600000
		boardsPerAgent: number, default 4

### 2.5 The failsafe knobs (phase 2, all volatile)

	failsafes: "off" | "on", default "off"  (04 section 5: on = only templates
		render; failsafes are a second explicit flip)
	hangBudgetMs: number, default 120000
	hangAction: "warn-only" | "kill", default "warn-only"
	failsafesPerTurn: number, default 5

### 2.6 The suggester knobs (phase 2, all volatile)

	suggester: "off" | "section" | "plant", default "off"
	suggesterPrivacy: "redact" | "verbatim", default "redact"
	suggestGateMinChars: number, default 40
	maxSuggestionsPerHour: number, default 6
	maxPromptBytes: number, default 4000
	suggestTimeoutMs: number, default 8000
	autoPlant: boolean, default false
	suggesterRoute: object volatile, leaves provider (string, default
		"cloudflare-workers-ai"), model (string, default "@cf/zai-org/
		glm-5.3-flash"), reasoningEffort (string, default "low") - the
		task-routing policy's exploration strain, surfaced as config so a
		deployment may override without code change.

The privacy gate (the DESIGN decision): "redact" sends the first 200 chars
of the request plus its length only; "verbatim" forwards the whole excerpt
(<= maxPromptBytes) - and the SCHEME must carry the disclosure paragraph:
"with suggesterPrivacy: verbatim, the user's request text is forwarded to
the configured suggester route" (05 section on privacy + 07 section 4.4;
ratified below in section 11). The user's message containing the words "live
container" or "plant" skips the suggester.

### 2.7 The kind registry (phase 1 + 2)

Phase 1 kinds (the v1 research section 3): time, counter, manifest, gauge,
note, template. Wave-2 kinds (03 section 3): todo-list, agent-progress-board,
task-failsafe-guard, command-runner, countdown-expiry, session-stats,
diff-summary, constraint-reminder, scoreboard, live-manifest, memory-block,
validator, environment-drift, delegation-inbox. The kind registry maps each
kind to its trigger default + its frame (section 4). Render.ts dispatches by
kind; every kind is data-driven (no eval, no expressions - the substitution
engine, section 3.1).

---

## 3. THE LISTENER SET

Every listener: next() FIRST, fail-open try/catch, never throws into any
waterfall, ledger on the plugin's own file only. The registration order
within Apply.ts: L1..L8 in the order below (plain registration unless noted).

### 3.1 L1 - system-prompt/assemble (the standing section; phase 1 + 2)

The v1 seam: one waterfall listener appended after next() that returns the
downstream assembly with ONE appended section:

	{ name: <State.SectionName>, text: <the rendered body>, interpolate: false }

`interpolate: false` is MANDATORY (verified: dsh-system-prompt lib/index.js
carries `...section.interpolate !== void 0 ? { interpolate:
section.interpolate } : {}` on every assembled section, and the README: "Set
interpolate: false on a section or dynamic context to preserve its text
literally, including {{...}} groups") - so the plugin's OWN substitution
engine (Render.ts, {{token}} replace ONLY) is the only resolver of its
tokens; the harness's unresolved-variable failure is never inherited (v1
residual 4).

The body, in order (each part is its own byte-exact block, section 4):
1. the header line (the out-of-order caveat) - only while any job/board is
   live;
2. the fleet line (the live-jobs roster) - only while any job is live;
3. one standing frame per LIVE job (section 4.1);
4. one standing frame per settled-but-undelivered job (the completed frame,
   section 4.2) - rendered for ONE assembly after settlement, then
   withdrawn (the APPEND-SEAM, section 3.3);
5. one frame per OPEN planted board (section 4.4);
6. one frame per enabled template block (the template host, phase 1).
The TTL cache (refresh = "ttl"): the rendered body is cached and rebuilt
every ttlCalls assemblies (the tool-coach sectionTtl pattern, Apply.ts:516-
538); refresh = "request" re-renders per assembly. The per-block event
trigger wiring (03 section 2): each block carries a dirty flag; the
assemble listener recomputes dirty blocks and cache-stable others; the
settle/post-execute/pre-step listeners set the dirty flag on matching
blocks (event triggers). Section budget: when the rendered body exceeds
sectionBudgetBytes, the OLDEST frames collapse to one-line summaries (the
failsafe 8 path, section 6) - never silently dropped (ledger
`failsafe section-collapse <n>`). Fail-open: a render failure skips the
block and logs `render failed <id> -> skipped`; the assembly still resolves.

### 3.2 L2 + L3 - tools/pre-execute + tools/execute (the detach transform; phase 2)

THE G1 CARRIER (verified in section 0.1). Two listeners, one contract:

L2 tools/pre-execute (waterfall, (Exec, Next) => Promise<PreToolDecision>):
next() FIRST, then:
1. if !State.On or detach.mode === "off": return Downstream.
2. if Exec.name is in the PERMANENTLY NON-DETACHABLE family (write, edit,
   raw-write, normalize-file - Policy.ts hardcodes the set): return
   Downstream (ALWAYS inline - the I1 command-only rule; also read-only
   observation tools are inline unless mode === "selected" lists them).
3. if the __await marker is present (section 4.3): ledger
   `await marker -> inline <tool>`, return Downstream.
4. if the dedup key matches a still-live job for this agent (Policy.Dedup):
   return the SAME marker referencing the SAME job id plus the
   `[live] already running as <job-id>; job_output <job-id> to check.` line
   (via the execute arm's tag; ledger `dedup <tool> -> <job-id>`); the
   retry counter increments and the retry-loop failsafe may extend the
   marker (section 6 scenario 5).
5. if the call carries sandbox_permissions (an escalation request): return
   Downstream (the escalation approval flow stays with the bash tool's own
   execute; the transform never re-implements approval; ledger
   `transform failed <tool> -> inline` is NOT used - the ledger line is
   `escalation -> inline <tool>`).
6. Policy.Decide(Exec, State): mode "long-running" = the command contains a
   longRunningMarker OR the same-prefix history average >= minHistoricalMs
   (per-agent observed history from L4's post-execute timestamps); mode
   "all" = every command-runner call; mode "selected" = the tool is in
   selectedTools (command-runner family only - non-detachables are rejected
   EVEN HERE) and/or the command matches a selectedPatterns regex.
   Guard rails (all pass-through + ledger, never a deny): admission
   (maxLivePerAgent / the registry's per-owner cap -> `capacity full <owner>
   -> inline`), minLatencyMs (the call is too short to pay for the detach ->
   inline), interactive detection (the command needs stdin: ends with a
   pipe from a TTY-ish source or contains a read-from-stdin construct the
   policy's conservative detector flags -> inline), and the per-agent
   failsafe meta-budget (section 6 scenario 7).
7. TRANSFORM: the wrapper (Jobs.ts, section 5) starts the job with the
   exact re-dispatch spec (cwd/env/policy preserved - G2, section 5.1);
   on admission or start failure: pass-through + the matching ledger line.
   On success: record the pair (exec -> {jobId, spec, args, agentId}) in
   the per-agent WeakMap state AND tag the exec object (a WeakMap keyed on
   the exec itself: Detach.Tagged) - the tag is what the L3 arm reads; the
   per-agent record is what the completion path reads. If the marker text
   cannot be composed: kill the just-started job with reason
   `marker-failed`, untag, return Downstream (the I1 half-detached rule,
   01 section 12.2.2).
   EVERY branch wrapped; on ANY internal error: untag, kill any
   just-started job (`marker-failed`), ledger `transform failed <tool> ->
   inline`, return Downstream (the call runs inline exactly as if the
   plugin were not mounted).
   The listener NEVER denies - a transform is a replaced dispatch, never a
   block (the I1 fail-open rule; a "deny" here would render
   `Error: <marker>` to the model, which is exactly what the carrier design
   avoids).

L3 tools/execute (waterfall, (Exec, Next) => Promise<unknown>): next() is
NOT called when the tag is present:
1. if !State.On or Exec is not tagged: return Next() (pass through).
2. compose the marker text (section 4.1, the inline form).
3. return the FABRICATED RESULT (never calling Next() - the cordis
   waterfall veto, so the bash body NEVER runs):
	{ kind: "foreground", cwd: <the resolved workdir>, exitCode: 0,
	  signal: null, timedOut: false, aborted: false, timeoutMs: <the
	  call's timeoutMs ?? liveTimeoutMs>, stdout: { text: <the marker>,
	  truncated: false }, stderr: { text: "", truncated: false } }
   The dsh-tools normalizeDispatchResult path validates this value against
   the bash output schema's foreground branch and renders it through the
   bash tool's OWN renderResult: exitCode 0 and no markers -> the model
   sees EXACTLY the marker bytes as a SUCCESSFUL tool result (isError:
   false). The schema shape is pinned by the smoke (the harness's bash
   output contract is stable; a harness upgrade that changes it is caught
   by the smoke, and the SCHEME documents the coupling).
4. ANY internal error in L3 (marker compose, tagged-record read): kill the
   tagged job with reason `marker-failed`, untag, ledger
   `transform failed <tool> -> inline`, return Next() - the REAL dispatch
   runs inline (the fail-open rule, 01 section 12.2.2). L3 never leaves a
   half-detached state.

The tag lives for exactly one pipeline pass: L3 removes it (WeakMap
delete), so a retried dispatch of the same exec (a replay) cannot be
swallowed twice.

### 3.3 The completion append (G3 - the APPEND-SEAM + COMPLETION-ERGONOMICS)

Carrier decision (verified): the stock completion notice path is NOT
composable - dsh-tool-jobs composes `background job <id> (<kind>: <label>)
finished [status: ...]. Read its output with job_output.` internally
(tool-jobs lib/index.js: fitCompletionNotice + createUserMessage +
owner.followup/owner.inject) and exposes NO plugin hook for notice text.
The completion BLOCK therefore rides the STANDING SECTION (01 section 3
step 6 carrier (b) + (c)):

1. The plugin's settled subscription (L6, section 3.6) receives the
   settlement. If the job's owner agent is gone (cause teardown): ledger
   `owner gone <job-id>` and nothing renders (the tool-jobs skip contract,
   mirrored).
2. The job's per-agent record flips from running to settled; the standing
   section renders the COMPLETED FRAME (section 4.2) at the NEXT assembly
   (the frame carries status, cause, elapsed, and the tail captured by the
   producer - section 5.4).
3. AFTER that one rendering (the frame was delivered in one assembly), the
   block is WITHDRAWN (removed from the section; ledger
   `withdrawn <job-id> (completed)`). The withdrawal rewrites the prompt
   tail ONCE per settlement - the "honesty beats cache" position, ratified
   (section 11). The completed frame is rendered at most once; a restart
   before the rendering renders nothing (the ledger record is the truth),
   and a marker that survives a restart without a live registry renders
   `status: lost (process exit)` (01 section 9.10) - never silently
   disappearing (I1 12.2.3).
4. The resume hint: the completed frame's last line tells the model
   `[live] job_output <job-id> to read the full output.` (the batched
   form: several settling jobs between two steps merge into ONE section
   rebuild - the tool-jobs "several jobs settling together cost one step"
   contract, mirrored in the section; the header caveat line discloses the
   ordering).

### 3.4 L5 - the planted-block surface (CAN-2 - the PLANTED-LEASE)

The plant tool (Function/Plant.ts): `live_plant(id, plantType, template?,
expectAgents, memberIds?)` registered via defineTool (the ccr Retrieve.ts
idiom). Creates the board in the calling agent's per-agent state (the
WeakMap, tool-coach Agent() pattern); ledger `plant opened <id> (expect
<n>)`. plantType: "agent-board" | "todo-fill" | "aggregate" | "custom".
The lease (the PLANTED-LEASE design):
- the board lives in the parent's assemble section, recomputed per parent
  request (the v1 seam - a report that lands between requests shows up at
  the next ask-time automatically; NO push into history);
- the board closes when all expected members settle (renders the closing
  line for one request, then withdraws - the CAN-1 withdrawal discipline
  generalized; ledger `board closed <id> (<n>/<expect> in <n>s)`);
- a board with empty slots renders `[none]` rows; after closeMs the empty
  slots are DROPPED and the board closes (02 section 7);
- an orphaned board (no parent requests for orphanBudgetMs while members
  are live) is NOT withdrawn (the parent may return; 04 scenario 6) but
  renders the STALE declaration in its header:
  `status: STALE (no parent requests for <n>s)` (02 + the restart-honesty
  line, section 4.4);
- the board dies with the parent (per-agent WeakMap state - no orphan
  boards survive the agent);
- report flooding: per-member coalescing at reportRateMs (1 report per 2s
  counted; later reports coalesce into the last - 02 section 7).

### 3.5 L7 - the report pickup (G5)

The child->parent report channel (verified): a child's send_message to the
parent lands in the parent's inbox as an insertion; EVERY inbox mutation
commits one normalized `agent/inbox/spliced` event (dsh-agent-loop README
"Create or resume agents programmatically"; dsh-agent-loop lib/index.js
splice construction: `{ target, start, removedCount?, inserted, outcome? }`),
and each insertion additionally emits `agent/inbox/inserted { message }`.

The parent's plugin listener (emit mode, plain ctx.on, host scope - a
host listener sees every agent's events and filters by agent id):
1. on `agent/inbox/spliced` with data.inserted.length > 0: for each
   inserted message whose text content matches the report grammar
   (section 4.4, the `[live-report]` first line), fold it into the board
   of the message's OWNER agent (the agent whose inbox spliced - the event
   is scoped to the agent's ctx, so the listener reads the agent from the
   event's scope; the fallback: the message's session field). The report
   grammar: `[live-report] <plantId> <agentId> <status> <payload>` - a
   child that knows the board reports through its own send_message; the
   board updates the member's row (status/lastReport/lastReportAt) and the
   next assembly reflects it (02 section 4 carrier 3 - the highest-fidelity
   carrier; carriers 1 and 2 - the child job's settle + progress line -
   come through L6, section 3.6). Ledger `report <id> <agentId> (<n>
   bytes)`.
2. fail-open: a parse miss is silently ignored (no ledger line per miss -
   the inbox carries the model's own steering; only a MATCHING report is
   folded); the listener never throws into the emit dispatch.

### 3.6 L6 - the settled subscription (the jobs truth)

`Context.jobs.events.subscribe({ owners: "scope" }, Listener)` (registered
from the plugin's host context; verified signature: events.subscribe(filter,
listener); the settled event is `{ type: "settled", job: <view>, cause,
awaited }`). The listener:
1. skips events whose job is not in the plugin's per-agent live records
   (only OUR detached jobs and OUR board's children are tracked; the
   subscription is read-only for everything else);
2. cause "kill" (the model's own job_kill or our live-timeout/`live-hang`
   kill): the completed frame renders `status: killed` with the kill
   reason (the view's detail);
3. cause "teardown": ledger `owner gone <job-id>`, nothing renders;
4. cause "producer": the completed frame renders the outcome status
   (completed/failed) + detail (exit code / error tail);
5. `awaited: true` (the model called job_output wait: true): the completion
   frame is SKIPPED (the model already collected the outcome - the
   tool-jobs awaited contract mirrored; ledger `completion skipped <job-id>
   (awaited)`);
6. planted boards: a child job's settlement flips the member's row to
   done/error with the elapsed time and the answer's first line (capped)
   - the board truth source (02 section 4 carriers 1-2);
7. the per-job record is dropped after the completion frame renders (or
   after the skipped/awaited/owner-gone paths - the record's lifecycle:
   open on detach, closed on delivery).

The events subscription also feeds: the fleet line (live jobs), the
per-job output totals (for the hang detector, section 6), and the
withdrawal bookkeeping. `{ owners: "scope" }` is scope-layered - the
plugin's OWN jobs plus its boards' children, nothing else.

### 3.7 L4 + L8 - the counters + the cache invalidation (phase 1 + 2)

L4 tools/post-execute (plain ctx.on, after the ccr prepend listener - plain
registration order): updates the counters the gauge/template blocks read
(lastToolAt, per-turn attempt counts by tool name, the per-command-prefix
duration history the long-running heuristic reads - pure observer, returns
the downstream decision unchanged, fail-open).
L8 agent/pre-step (plain ctx.on): the user-message detection (the
tool-coach precedent Apply.ts:456-490) resets per-turn counters, and (phase
2) triggers the suggester gate (section 3.8). The same listener arms the
event-trigger dirty flags for blocks whose trigger is "event" (user
message).
L9 tools/change (emit): clears the section cache (the tool-coach L5
pattern; ledger `section rebuilt (tools/change)`).

### 3.8 L10 - the suggester trigger (CAN-5)

On a qualifying user message (the L8 detection): first message of a turn OR
length >= suggestGateMinChars, one suggestion per user turn, rate-bounded
(maxSuggestionsPerHour), skipped when the message contains "live container"
or "plant" (the user is driving manually). The suggestion runs DETACHED:
`Context.subagent.startActivation({ provider: <suggesterRoute.provider>,
label: "live-containers-suggester", request: <the composed prompt>,
signal: <an AbortController armed with suggestTimeoutMs>, delivery: none })`
(verified surface, dsh-subagent README:62 - returns { childId, result,
dispose }). The composed prompt: the request excerpt (redacted or verbatim
per suggesterPrivacy, <= maxPromptBytes) + the template catalog (name +
one-line use + shape; Catalog.ts) + the task facts the plugin already holds
(live jobs count, open boards, turn count). The output contract: the strict
JSON `{ fit: "yes" | "no" | "unknown", templateId, rationale, tokens? }`,
parse failure -> no suggestion (fail-open; ledger `suggestion parse
failed`). Delivery: the suggestion is stored in the agent's per-agent state
and rendered as the LIVE SUGGESTION frame at the NEXT assembly (the
`live-containers-suggester` section note, 05 carrier 1), then withdrawn
after one turn (cache stability). autoPlant: instantiates the suggested
template as a DORMANT planted block labeled suggested (05 carrier 3;
default false). The accept/dismiss grammar: the model ACCEPTS by
`live_container_set plant=<templateId> expect=<n>` (the instantiation
path), DISMISSES by `live_container_set dismiss=<suggestionId>` (ledger
`suggestion dismissed <id>`); doing nothing dismisses (the one-turn
withdrawal). A spawn/timeout/parse failure produces ONLY a ledger line
(`suggestion skipped (<reason>)`), never a conversation artifact.

---

## 4. THE MARKER GRAMMARS (byte-exact)

Every grammar line below is the BYTE-EXACT contract (the smokes assert the
rendered section text and the fabricated result text byte-identically; the
SCHEME carries the same list). All ASCII.

### 4.1 The "still running" marker

The inline marker (the model-visible tool result the L3 arm fabricates):

	[live] <job-id> running: <cmd-head> - output pending; proceed reasoning.

<job-id> is the registry id (`bash-<16 hex>`); <cmd-head> is the first 80
bytes of the command, single line (newlines replaced by " | "). The
dedup variant appends on a second line:

	[live] already running as <job-id>; job_output <job-id> to check.

The standing frame (the assemble section while the job runs - 01 section 4):

	--- LIVE CONTAINER <job-id> (running; not harness state) ---
	cmd: <first 120 bytes of the command>
	started: <HH:MM:SS>
	status: running (elapsed <n>s)
	--- END LIVE CONTAINER <job-id> ---

The section header + fleet line (01 section 6; only while any job/board is
live):

	--- LIVE CONTAINERS (background tasks; completions may arrive out of order) ---
	live: <job-id-a> running | <job-id-b> running | none

### 4.2 The completion block (the batched form + the resume hint)

	--- LIVE CONTAINER <job-id> completed ---
	status: <status> (<cause>: producer|kill|teardown)
	elapsed: <n>s
	output (tail up to 2 KiB):
	<tail; stderr in a [stderr] section exactly as job_output does>
	[stderr]
	<stderr tail>
	--- END LIVE CONTAINER <job-id> ---
	[live] job_output <job-id> to read the full output.

Failure variant: `status: error` with the error tail; kill variant:
`status: killed` with the kill reason (the view's detail). The frame
renders for ONE assembly, then withdraws (ledger `withdrawn <job-id>
(completed)`). The <tail> is the producer-captured bounded tail (section
5.4), at most 2 KiB total, stdout first then the stderr section.

### 4.3 The {"__await":true first-key marker (the AWAIT-MARKER design)

The per-call block-on-demand opt-out, modeled on the family's
`{"__normalize":false` first-key marker (hook-dsh-normalize-dash
Normalize.ts:41-67) but in the TOOL-CALL ARGUMENTS:

	{"__await":true, "description": "...", "command": "..."}

Grammar: `__await` is the FIRST key of the tool-call arguments JSON object,
value exactly `true`. Verified legal: the compiled parameter schemas of the
command runners carry NO `additionalProperties: false` (dsh-tools
parameterSchemaSpecToJsonSchema compiles `{ type: "object", properties,
required? }` only, and the harness validator checks declared properties and
required, never unknown keys - checkObjectSchemaTail), so the extra key
validates and reaches exec.arguments untouched; the bash body ignores it;
the executed call carries it in the log (transparency, no desync - the
"cannot rewrite arguments" limitation of dsh-tools is respected, nothing is
stripped). Policy: FIRE-AND-FORGET BY DEFAULT - the transform detaches
without the marker; the marker is the model's explicit "this call must run
inline and I need its real output" - when present, the transform skips the
detach (ledger `await marker -> inline <tool>`, the call runs inline
normally). The marker grammar is taught to the model in the standing
section's instructions line (one line, only when detach.mode != "off"):

	To run a command inline instead of detached, put {"__await":true first in the call arguments.

### 4.4 The plantType grammar (the PLANTED-LEASE design)

The agent-board frame (02 section 3, byte-exact):

	--- LIVE PLANT <id> (agent-board; expect <n>) ---
	[done]      <agentId> - <summary, first 48 bytes>
	[running]   <agentId> - <progress line, capped> (last: "<lastReport>" <n>s ago)
	[stalled]   <agentId> - no report for <n>s
	[failed]    <agentId> - <reason, first 64 bytes>
	[unboarded] <agentId> - overflow
	[none]      slot-<n> - no agent enrolled
	total: <d> done / <r> running / <s> stalled / <e> empty
	--- END LIVE PLANT <id> ---

The todo-fill variant: `[x] <item> - by <agentId> (<n>s)` / `[ ] <item>` /
`[~] <item> - in progress`. The aggregate variant: one computed line
(`files changed: 17 | tests: 3 failing`). The STALE declaration (orphaned
board, section 3.4): the header line becomes
`--- LIVE PLANT <id> (agent-board; expect <n>; status: STALE - no parent requests for <n>s) ---`.
The restart-honesty line (01 section 9.10): a board record surviving a
restart without a live registry renders
`status: lost (process exit)` in its header once, then withdraws.

The report grammar (the child->parent send_message carrier, G5):

	[live-report] <plantId> <agentId> <status> <payload>

<status> is one of "done" | "running" | "stalled" | "error"; <payload> is
free text (the last-report line, capped at 240 bytes) - todo-fill boards
use `[live-report] <plantId> <agentId> todo <itemIndex> <done|running>`
instead. The report is picked up by L7 (section 3.5).

### 4.5 The suggestion grammar (the accept/dismiss)

	--- LIVE SUGGESTION (from a small helper model; act only if useful) ---
	fit: yes | template: <templateId>
	why: <rationale, capped at 240 bytes>
	start it with: live_container_set plant=<templateId> expect=<n>
	--- END LIVE SUGGESTION ---

Accept: `live_container_set plant=<templateId> expect=<n>`; dismiss:
`live_container_set dismiss=<suggestionId>`; no action = the frame
withdraws after one turn. The autoPlant variant renders the dormant block:
`status: suggested - start it when ready` in the planted frame's header.

---

## 5. THE JOBS INTEGRATION

### 5.1 The producer re-dispatch (G2 - the command-runner wrapper)

The wrapper in Function/Jobs.ts replicates the bash tool's OWN background
adapter (dsh-tool-bash lib/index.js startJob + processJob + processSources)
against the SAME governed path - I1 12.2.1's "the producer re-dispatch runs
the command through the bash tool's own governed execution path" is
implemented by reusing the shell seam exactly:

1. resolve the spec AT DETACH TIME (the pre-execute listener, so the model
   sees the same cwd/env/policy the inline call would have):
	- standingPolicy = ctx.get("sandboxPolicy")?.resolve(exec.agent ? {
	  session: exec.agent.session } : {});
	- cwd = exec.agent ? await ctx.workingDirectory.ensure(exec.agent,
	  exec.signal) : undefined; workdir = resolveWorkdir(args.workdir, cwd)
	  (the tool-bash resolveWorkdir semantics: relative -> joined under the
	  session cwd);
	- dshEnv = ctx.shellEnv.collect(exec);
	- spec = ctx.shell.resolve({ command: args.command,
	  ...(workdir !== undefined ? { workdir } : {}),
	  ...(args.timeoutMs !== undefined ? { timeoutMs: args.timeoutMs } : {}),
	  dshEnv, ...(policy !== undefined ? { sandboxPolicy: policy } : {}),
	  onExpiry: "none" })  - onExpiry "none": the executor never kills the
	  detached process; the plugin's OWN liveTimeoutMs timer is the only
	  guard (01 section 7 - the stock inline timeout policy does not apply
	  to detached jobs).
2. start the job: ctx.jobs.start({
	kind: "bash", label: <the command, first 80 bytes>,
	toolCall: { callId: exec.callId, rootCallId: exec.rootCallId },
	...(exec.agent ? { owner: exec.agent.id } : {}),
	outputLimitBytes: 2048,  (the producer-owned output cap; the tool-jobs
	  capping contract - the complete model-facing read stays bounded)
	output: processSources(() => proc),  (the pull sources the registry
	  pumps at pumpPollMs; read from proc().observed[channel].readFrom)
	run: (handle) => processJob(async (signal) => {
		proc = await ctx.shell.execute({ ...spec, signal });
		return proc;
	}, (started) => processOutcome(started, escalationModes))
  }) - the exact tool-bash shapes: the starter receives the job-owned
  AbortController signal; the outcome maps killed/completed + exit code +
  sandbox notes; the adapter's cancel kills the process (job-owned
  cancellation, so the registry's kill -> process kill).
3. THE TAIL CAPTURE (the completion block's output source - section 3.3):
   the same observed streams feed the ring AND a bounded private tail
   (stdout + stderr, 2 KiB total, the ringDelta channel semantics: stdout
   chunks in order, then one [stderr] section). The registry's ring caps
   (262144 live / 16384 settled) remain the output caps; the private tail
   is only the completion composer's render source. Verified reason: the
   `settled` event carries NO ring content (jobs-local lib: the settled
   payload is { type, job: <view>, cause, awaited } and the view's output
   field is { total, earliest, spillPaths }), and a host plugin is not the
   job owner so readAt/read on an owned job fails authorization (jobs-local
   expect(id, caller): owner.id === caller) - the plugin's own captured
   tail is the only legal render source.
4. the per-job record (per-agent WeakMap): { jobId, spec, args, agentId,
   startedAt, tailStdout, tailStderr, status, detail, cause, cmdHead } -
   the completion composer + the fleet line + the hang detector read it.

The wrapper is command-runner-only BY CONSTRUCTION: Policy.ts's
detachable set is exactly the command runners (bash, pwsh, and the family
whose Exec is a spawned subprocess: cargo, npm, pnpm, make, ... - detected
by the tool's execution path being a shell/spawn; the non-detachable
mutation family is hardcoded and checked FIRST). Read-only observation
tools MAY detach under "selected" only (I1 5.1) - out of the default set.

### 5.2 The dedup (per-agent; the cross-agent build dedup is FUTURE)

The dedup key: (agent id, normalized command, resolved workdir) -
normalized = trim + collapse runs of whitespace + strip leading `cd x &&
` prefixes whose target equals the resolved workdir. A re-issued call whose
key matches a STILL-LIVE job for the same agent returns the same job id
with the already-running line (section 4.1) - no second job (01 section 7;
ledger `dedup <tool> -> <job-id>`). The retry counter feeds the retry-loop
failsafe (section 6 scenario 5). The cross-agent fleet dedup (06 idea 2)
is FUTURE (needs the cross-owner join record + the per-agent completion
fan-out; not in the C2 scope).

### 5.3 The failure/timeout/cancellation/retry paths

- transform failure: inline + `transform failed <tool> -> inline` (I1
  12.2.2, acceptance-tested).
- admission full (per-owner 10 or maxLivePerAgent): inline + `capacity
  full <owner> -> inline` (the registry start() THROWS on capacity -
  jobs-local start: "background job limit reached for this owner" - the
  try/catch converts it to pass-through).
- start failure (preflight/spawn): inline + `start failed <tool> -> inline`.
- job failure (producer settle, status failed): the completed frame renders
  status error with the error tail; the standing block is withdrawn the
  next assembly after delivery (I1: never fabricate a completion - the
  frame renders ONLY from the observed settled event).
- model kill (job_kill): cause kill -> the completed frame renders status
  killed with the reason; no second notice (the tool-jobs kill-set
  contract is the tool-jobs plugin's own - OUR subscription just renders
  the frame; the model already saw the kill result).
- live timeout: the plugin arms a timer per job at liveTimeoutMs ->
  ctx.jobs.kill(jobId, agentId, "live-timeout") -> the completed frame
  renders status killed (reason live-timeout). The timer is the ONLY guard
  (onExpiry "none"; the inline timeout policy does not apply).
- hang (no new output bytes past hangBudgetMs): the failsafe path
  (section 6 scenario 1) -> kill with reason `live-hang` when
  hangAction = "kill".
- owner teardown: cause teardown -> `owner gone <job-id>`, no frame (the
  tool-jobs skip contract; nobody can read it).
- model awaits (job_output wait: true): the awaited settlement -> no frame
  (awaited flag), the record closes (the model collected the outcome).
- model retries: the dedup path (above).
- restart: records are per-agent WeakMap state - they die with the
  process; nothing survives to render (the session ledger keeps the
  lifecycle events). A marker that outlives its registry (the standing
  section can only render from live records, so it cannot) renders
  `status: lost` only if the plugin keeps a RESTART-SURVIVING record - it
  does not in v2 (the pins store, 06 idea 9, is FUTURE); the orphaned-
  marker handling therefore reads: the standing section renders ONLY from
  live per-agent records, so a restarted session's section contains NO
  ghost frames - the "status: lost" line is specified for the BOARD
  records (section 4.4) and for the FUTURE pins store; the I1 requirement
  (a marker that cannot be withdrawn after restart renders `status: lost`,
  never silently disappearing) is satisfied by the honest-empty section
  PLUS the ledger's lifecycle events (the session timing records the
  user reads). The SCHEME states this explicitly.

### 5.4 The ring + the rendering caps

The registry ring is the output cap (262144 live / 16384 settled, the
jobs-local defaults - the plugin never re-implements them); outputLimitBytes
2048 caps every complete model-facing read/notice of OUR jobs (the tool-jobs
capping contract); the completion block renders at most the 2 KiB captured
tail; the standing section is capped by sectionBudgetBytes (failsafe 8).
No unbounded rendering anywhere in the append path (I1 12.2.1).

---

## 6. THE FAILSAFE ENGINE (CAN-4)

The tool-coach posture: silent, automatic, task-shaped. The five notice
channels (04 section 2), in escalating loudness - the config selects the
ceiling per scenario:

1. ledger only (the DEFAULT - CAN-4's "not even notifying the
   conversation"): a byte-exact line in the plugin's ledger file; nobody
   in the conversation knows;
2. log warn (the context logger's warn line - the fail-open catch's
   channel);
3. behavior change only (silent modification: a call detaches, a board
   plants, a threshold shifts) with no model-visible artifact;
4. model-visible note (a standing-frame line or an inline marker);
5. user-visible ONLY through existing surfaces the user already reads
   (the jobs session timing records in the GUI, the ledger file, the
   debug attachments) - NEVER a new push surface.

The eight scenarios (04 section 3), each: trigger / automatic action /
channel / containment:

1. THE BUILD HANGS - a detached command with ZERO new output bytes past
   hangBudgetMs (the hang detector: the per-job record's tail byte-count
   delta vs the clock - the producer sees every pump append, so the
   detector is a pure per-record counter; the registry's ring offsets give
   the same truth for free, tracked via the output events' total field).
   Action: ledger `failsafe hang <job-id> (<n>s no output)`; on
   hangAction "kill": ctx.jobs.kill(jobId, agentId, "live-hang").
   Channel: 1. Containment: the kill is the registry's, never a
   subprocess force-kill by our code.
2. THE DELEGATION STALLS - a board member [stalled] past stallBudgetMs:
   the row flips (channel 4, at the next request - the board render);
   on stallAction "prune": the member is dropped from the expect count so
   the board closes cleanly (ledger `member dropped <id> <agentId>
   (pruned)`).
3. THE LIMITS APPROACH - per-owner admission full / maxLivePerAgent hit /
   maxConsecutiveWakes exhausted: pass-through inline + ledger
   `failsafe admission inline <tool>` (the CAN-1 admission path).
   Channel: 1.
4. THE DRIFT - the session-stats variables cross their thresholds
   (messages > N, sinceLastTool > S while a live board is open): the
   affected frames gain a WARN line inside them. Channel: 4 + ledger.
   The validator template's automatic twin (the user did not install the
   validator; the failsafe renders the same guard from thresholds it
   owns - thresholds are the session-stats block's own vars).
5. THE RETRY LOOP - the dedup counter reaches retryFailsafeCount for the
   same normalized command: ledger `failsafe retry-loop <cmd>`; the third
   re-issued call's marker gains the line
   `[live] already running as <job-id> (3rd attempt) - use job_output.`
   Channel: 4 (model guidance) + 1.
6. THE ORPHANED BOARD - a board whose parent's requests have not run for
   orphanBudgetMs while members are live: ledger only; the board is NOT
   withdrawn (the parent may return); its members' reports keep landing;
   the frame's header gains the STALE declaration (channel 4 at the next
   parent request - disclosed by the frame itself).
7. THE SILENT-MODIFICATION BUDGET - the meta-failsafe: failsafesPerTurn
   (5) automatic modifications per turn; exceeding it disables automatic
   modification for the rest of the turn (pass-through everywhere) and
   logs one summary line `failsafe meta-budget (<turn>)`. The tool-coach
   never meta-limits; CAN-4's silence demands it (an unbounded silent
   modifier is the one unforgivable failure mode).
8. THE CONTEXT-DRIFT GUARD - the standing section's bytes exceed
   sectionBudgetBytes: the oldest frames collapse to one-line summaries
   (ledger `failsafe section-collapse <n>`; never dropped silently).

The triggers key on the task's OBSERVABLE SHAPE (04 section 4): live jobs,
boards, detached calls, their ages, their output rates, their counts -
read from ctx.jobs events, post-execute, pre-step, and the plugin's own
per-agent state. The plugin is a PURE OBSERVER: no message CONTENT is read
for trigger evaluation (the privacy gate inherited from the v1
programmable stage's `context: "full"` rule).

Safety (04 section 5): every failsafe action is fail-open wrapped; a
failsafe that cannot act logs and passes through; the layer can NEVER deny
a call, drop content, or cancel a job because of its own internal error;
killing is the only destructive action and goes through the registry's
kill, gated behind hangAction/config; the meta-budget bounds the layer's
own power; `failsafes: "off"` is the default even when the plugin is
enabled.

---

## 7. THE SMOKES PLAN

The family pattern (smoke-writing skill): the suites load the REAL built
Target/Library.js against a FAKE ctx (on capture, get serving the REAL
@playform/plugin-dsh-factory instance from its built Target, logger
capture, the `__hookDshLiveContainersState` probe attachment, the root
seam) and run with `node <name>-smoke.mjs` from Classic/smokes/ (+ the
EffectTS twin in EffectTS/smokes/). The A2 spec's coverage is the phase-1
suite; the wave-2 suite is ADDITIVE (the phase-1 assertions never weaken).

### 7.1 The fake-ctx shape (wave-2 extension)

- the fake clock: a mutable `now` injected into the plugin's time sources
  (the plugin reads time ONLY through a Clock module - Counters.ts/Render
  .ts/Detach.ts/Board.ts all call Clock.Now()/Clock.Elapsed(); the smoke
  advances the clock, never sleeps);
- the volatile flips: the config cells passed as `{ get() }` references;
  the smoke mutates the backing object and asserts the next assembly
  respects the flip without a remount (the P10 pattern);
- the jobs seam: a FAKE registry implementing the verified surface
  (start(spec) -> id with the preflight/capacity errors on demand,
  events.subscribe(filter, listener) capturing the listener, kill/wait/
  readAt/remove/attachController) plus a controllable settle trigger
  (the smoke fires the captured listener with a fabricated settled event);
- the shell seam: a fake ctx.shell (resolve captures the spec; execute
  returns a controllable process handle whose observed streams the smoke
  feeds, so the producer's pull sources and the tail capture are
  exercisable without a real process);
- the tools seam: the bash definition fetched via ctx.tools.get("bash")
  is the REAL dsh-tools fixture where the fabricated-value validation is
  exercised - the smoke imports the REAL @deepseek-ai/dsh-tools from the
  harness? NO - the smokes cannot import harness internals either; the
  smoke instead asserts the fabricated value's SHAPE (the exact keys the
  bash output schema's foreground branch requires) with a byte-exact
  expected object, and the D-series asserts the EXECUTE-ARM CONTRACT (the
  listener returns the fabricated object and NEVER calls Next; the
  downstream receives it untouched). The REAL validation/render happens
  in the harness; the smoke pins our side of the contract (the schema
  shape + the veto behavior). The SCHEME documents this fidelity gap
  explicitly (the smoke/live fidelity discipline, smoke-writing section 3).
- the agents seam: ctx.get("agents") for the board enrollment + the
  fake inbox: the smoke fires the L7 listener with a fabricated
  agent/inbox/spliced event (the { target, start, inserted } shape) and
  asserts the board fold.

### 7.2 The phase-1 suite (A2's spec, the R/D series)

R-series (render): the section appears exactly once per assembly, name
"live-containers", the LIVE CONTAINER frame bytes, a time block's value
CHANGES between two assemblies whose fake clock advances; every block kind
renders; the TTL tests (refresh "ttl" with ttlCalls=2 renders once and
reuses the cache; "request" re-renders); the interpolate: false assertion
(a template containing {{provider}} renders it LITERALLY - the harness
variable never resolves); the section budget collapse.
D-series (discipline): the byte-identity ledger assertions (every string
of section 9.2 asserted against its exact expected bytes); the fail-open
negatives (a render failure -> the assembly still resolves, the block is
skipped, ledger `render failed <id> -> skipped`); the volatile flips;
the vacuously-green guard (every test asserts on the rendered SECTION text
or ledger lines, never on "no throw"; at least one negative per block
kind); the `disabled (enabled=false)` cold-mount proof; the
live_container_set tool's per-agent-only writes.

### 7.3 The wave-2 suite (the J/B/F/S series, ADDITIVE)

J-series (jobs/detach - the I1 acceptance additions are J-tests):
J1 a cargo-build-matching bash call under "long-running" detaches: the
fake registry gained one start with the exact re-dispatch spec (cwd/env/
policy preserved - the spec's command/workdir/dshEnv/sandboxPolicy match
the intercepted call), the fabricated result's text is the byte-exact
marker, isError false, Next was NOT called;
J2 the write/edit family under mode "all" runs INLINE synchronously: the
L2 listener passes through (no start), the L3 passes through, the
governance chain (the fake fs/observed listener fixture) fires exactly as
with the plugin unmounted - the I1 12.1 acceptance addition;
J3 a sandbox-denied command fails the same way detached as inline (the
fake shell's execute returns a denied sandbox result; the producer's
outcome maps the sandbox notes identically) - the I1 12.2 acceptance (a);
J4 a thrown composer error (the smoke forces the marker compose to throw)
yields inline execution + `transform failed <tool> -> inline` + NO orphan
job (the fake registry saw a kill with reason marker-failed or no start) -
the I1 12.2 acceptance (b);
J5 no completion frame ever appears without a settled event (the smoke
renders with zero settlements -> no completed frame; then fires one
settled -> exactly one completed frame, then the withdrawal: the next
assembly has no frame) - the I1 12.2 acceptance (c);
J6 the dedup: a re-issued identical command while live returns the SAME
job id with the already-running line and starts NO second job;
J7 the liveTimeoutMs timer: the fake clock advances past liveTimeoutMs ->
the fake registry's kill received reason "live-timeout";
J8 the awaited settlement: the settled event with awaited: true -> no
frame, ledger `completion skipped <job-id> (awaited)`;
J9 the capacity path: the fake registry's start throws the capacity error
-> inline + `capacity full <owner> -> inline`;
J10 the minLatencyMs/minHistoricalMs/history heuristics (the fake clock
+ the recorded post-execute durations);
J11 the __await marker: an arguments object whose first key is __await:true
-> inline + `await marker -> inline <tool>`; the marker survives in the
logged arguments (nothing stripped).
B-series (boards): the five-row board with enrollment by settle; an
explicit [live-report] splice pickup updates the row at the next assembly
(G5); the stalled row after stallMs on the fake clock; the failed row from
a kill-caused settlement; the overflow row + the total line; the board
close + withdrawal; the STALE header; the multi-level summary (the child's
board is the child's section - the smoke mounts two agents and asserts the
sections are per-agent); the report-rate coalescing.
F-series (failsafes): the hang ledger + the hangAction kill; the stalled
member flip + prune; the admission inline ledger; the drift WARN line;
the retry-loop marker extension; the orphaned board ledger + STALE; the
meta-budget summary + the pass-through-forever remainder of the turn;
the section-collapse; with failsafes "off": ZERO behavior modification
with all templates enabled; the "not even notifying" posture provable by
asserting NO model-visible artifact on channel-1 scenarios.
S-series (suggester): with suggester off: zero spawns, zero sections;
on: one qualifying turn spawns exactly one activation with the composed
prompt (redact: the excerpt is the first 200 chars + length; verbatim: the
full excerpt - the privacy asserts); a fit=yes result renders the LIVE
SUGGESTION frame exactly once then withdraws; a parse failure produces
only the ledger line; autoPlant instantiates the dormant suggested block;
the rate bounds.

The family counts: the phase-1 suite targets the tool-coach's 129-check
size reference; the wave-2 suite is its own counted series (the README of
each Source/Test folder declares its PASS count for the Run-Smokes guard).

---

## 8. THE DOCS PLAN

The A3 spec's scope (README + SCHEME + the site page), extended for wave 2.

### 8.1 README.md (the A3 voice + the wave-2 sections)

- the one-paragraph pitch (the dynamic-recompute idea);
- the block catalog as a table (shape / trigger / knobs) - the 14
  templates, from Catalog.ts (ONE source);
- the CAN-1 section: the detach transform (modes, the command-only rule,
  the marker grammar, the completion append, the withdrawal, the
  KV-cache honesty paragraph - the inline marker is a one-time history
  line with NO cache cost; the standing section is stable-until-event;
  the withdrawal rewrites the prompt tail once per settlement - "honesty
  beats cache", stated);
- the CAN-2 section: planted blocks, the lease, the report grammar;
- the CAN-4 section: the failsafe posture + the five channels + the
  "not even notifying" default;
- the CAN-5 section: the suggester + the PRIVACY DISCLOSURE (the
  verbatim forwarding sentence, mandatory when the suggester is on);
- the IDLE-forever posture + the install line + "every knob is volatile";
- the ledger strings list (the byte-exact contract);
- the FUTURE section: the programmable stage (the ptc-runtime design of
  the v1 research section 5, clearly labeled FUTURE), the chain splitter,
  the cross-agent dedup, the pins store, the CCR composition (06 idea 5).

### 8.2 SCHEME.md

- the full config surface (every field, type, default, volatile-or-not -
  section 2 verbatim);
- the detach policy table (the modes, the non-detachable family, the
  hazards: "all" DANGEROUS + allRequiresConfirm; the sequencing
  disclosure: completions may arrive out of order; the
  __await marker);
- the ledger-string contract (the byte-exact list, section 9.2);
- the smoke battery map (R/D/J/B/F/S ids - "per the smokes' final
  inventories" for the phase-2 ids);
- the seam evidence (the verified anchors of section 12 - the harness
  version pinned);
- the privacy disclosure (the suggester);
- the programmable stage section (FUTURE - not in v2).

### 8.3 The site page

Site/Source/pages/plugins/hook-dsh-live-containers.astro (mirror the
existing plugin pages' component usage: PageHero, Concept, Seams, Card,
CodeBlock, Badge...) + the registry row in Site/Source/pages/plugins.astro
(Name/Desc/Install/FlavorBadge). Content: the one-screen pitch, the block
catalog, the safety framing (the LIVE CONTAINER frame is the plugin's OWN
output, never harness state), the detach + boards + suggester one-liners,
and the status line "planned - not yet in the profile" (the IDLE-forever
posture stated plainly). The site build is `cd Site && pnpm prepublishOnly`
and verifies via the BUILT HTML/CSS in Target/ - the docs lane NEVER runs a
dev server. NOTE: the A3 spec's "mirror the tool-coach's site files" must
be read as "mirror the normalize-dash page" - the tool-coach has NO site
page yet; the A3 surface is the NEW .astro page + the plugins.astro row.

---

## 9. THE C2 CODER BRIEF + THE A1/A2/A3 ALIGNMENT + THE PHASE ORDER

### 9.1 The phase order (the collision rule)

PHASE 1 (the v1 dispatch - A1/A2/A3, per the v1 research section 6, IDLE
until ACTIVATE): the assemble-side plugin - Library, Config (section 2.1 +
2.2), DefaultBlocks, Render, Counters, Apply (L1 + L4 + L8 + L9 only), the
Interface trio, the two-step build, README/SCHEME (phase-1 scope), the
R/D smoke suite, and the SITE page skeleton. Acceptance: the phase-1
criteria (section 10.1) all green.
PHASE 2 (the wave-2 dispatch - C2, per THIS design): the wave-2 extension
on the SAME package: Policy, Jobs, Detach, Completion, Board, Failsafe,
Suggester, Set, Plant, Events.ts, the Config/Apply/Library/README/SCHEME
extensions, the Source/Test tree, the J/B/F/S smoke suite, and the ETS
twin. Acceptance: the wave-2 criteria (section 10.2) all green.
THE COLLISION RULE: the phases are STRICTLY SEQUENTIAL - phase 2 starts
only after phase 1's acceptance is green; within phase 2, C2's edits to
phase-1 files are ADDITIVE (new listeners appended in Apply.ts's
registration block, new fields appended in Config.ts, new members in
Library.ts's inject) and NEVER rewrite phase-1 semantics; the phase-1
smoke passes with ZERO assertion changes (the family arbiter law); C2's
new modules are NEW files (the module-leaves discipline - the wave-2
behaviors live in their own Function modules, Apply.ts only REGISTERS).

### 9.2 The ledger-string contract (the byte-exact list, `live-containers: ` prefix)

Phase 1 (research section 3, verbatim; SYNCED 2026-10-20 to A1's SHIPPED form - the code ships the (bundle 0.0.1, ...) variant, canonical):
	disabled (enabled=false)
	activated (bundle 0.0.1, blocks=<n>, refresh=<policy>)
	block rendered <id> (<len> bytes)
	block skipped <id> (<reason>)
	section rebuilt (ttl <n>)
	render failed <id> -> skipped

Wave 2 (this design; the SCHEME owns the final list - C2 ships it):
	section rebuilt (tools/change)
	transform failed <tool> -> inline
	capacity full <owner> -> inline
	start failed <tool> -> inline
	escalation -> inline <tool>
	await marker -> inline <tool>
	dedup <tool> -> <job-id>
	marker failed <job-id> -> inline
	detached <tool> -> <job-id>
	owner gone <job-id>
	completion rendered <job-id> (<len> bytes)
	completion skipped <job-id> (<reason>)
	withdrawn <job-id> (completed)
	render unknown <id> <token>
	set <key>
	set unknown <name> <key>
	plant opened <id> (expect <n>)
	member enrolled <id> <agentId>
	report <id> <agentId> (<n> bytes)
	member stalled <id> <agentId>
	member dropped <id> <agentId> (<reason>)
	board closed <id> (<n>/<expect> in <n>s)
	overflow <id> <agentId>
	failsafe hang <job-id> (<n>s no output)
	failsafe admission inline <tool>
	failsafe retry-loop <cmd>
	failsafe section-collapse <n>
	failsafe meta-budget (<turn>)
	failsafe stall <id> <agentId>
	suggested <templateId> (fit <fit>)
	suggestion skipped (<reason>)
	suggestion parse failed
	suggestion dismissed <id>

### 9.3 The C2 brief (the self-contained coding spec)

ROLE: implement the wave-2 extension of @playform/hook-dsh-live-containers
(the Classic twin first; the ETS twin after Classic acceptance) per
Documentation/Archive/Live-Containers/Design/IMPLEMENTATION-DESIGN.md
sections 2-7 (the config schema, the listener set, the marker grammars,
the jobs integration, the failsafe engine, the smokes) and this brief.

SURFACE: ONLY Classic/packages/hook-dsh-live-containers/** and
EffectTS/packages/ets-hook-dsh-live-containers/** (after Classic
acceptance) + Classic/smokes/live-containers-smoke.mjs +
EffectTS/smokes/ets-live-containers-smoke.mjs + the wave-2 sections of
the package README/SCHEME + the site page's wave-2 section. READ FIRST:
this design document (sections 0-12), the v1 research sections 3-5,
Requirements/00-07 (the I1 binding constraints in 01 section 12 and 07
section 5 are HARD), Classic/packages/hook-dsh-tool-coach/Source/Function/
Apply.ts (the listener discipline), Classic/packages/hook-dsh-ccr/Source/
Function/Retrieve.ts (the defineTool idiom), Classic/packages/hook-dsh-core
/prepublishOnly.sh (the two-step build), the tool-bash reference behavior
(at /Applications/DeepSeek Harness.app/Contents/Resources/app.asar/dsh/
node_modules/@deepseek-ai/dsh-tool-bash/lib/index.js - read in place, never
extract: startJob/processJob/processSources/waitOnJob are the producer
adapter's reference), dsh-tools lib/index.js (the tools/execute veto + the
fabricated-value normalization), dsh-jobs-local lib/index.js (start/
events/settle), dsh-agent-loop lib/index.js (the inbox splice).

DELIVERABLES: the nine new Function modules + Interface/Events.ts + the
Config/Apply/Library extensions of section 2-3 + the wave-2 ledger strings
(byte-exact, section 9.2) + the Source/Test tree (the J/B/F/S folders,
each {Test.ts, README.md} with the declared PASS count) + the wave-2 smoke
suite (additive; the phase-1 assertions unchanged) + the wave-2 docs
sections + the ETS twin mirror (byte-identical ledger strings).

ARBITERS: the family smoke runner (Maintain/Run-Smokes.mjs) all green; the
phase-1 smoke passes with ZERO assertion changes; the ledger strings match
the SCHEME byte-exactly; no other package modified.

DISCIPLINES: never run git commands (checks only; report READY-TO-COMMIT);
ASCII only; tabs only; file content via the write/edit tool API only; no
builds/dev-server/test runs beyond what the smoke harness performs when
the orchestrator runs it; never enable the plugin in the profile; never
import @deepseek-ai runtime packages into the bundle's runtime path beyond
the family precedent (dsh-tools' defineTool type-only + schemastery are
devDependencies - the runtime resolves from the running dsh); every
listener next()-first + fail-open; every ledger line byte-exact.

REPORT FORMAT: one message - the files created/edited per twin, per-file
one-line summary, the exact ledger strings shipped, the smoke results
(pass/fail counts per series), and any deviation from this design with a
one-line reason.

ROUTING TRIPLE: provider cloudflare-workers-ai, model @cf/zai-org/
glm-5.3-flash, reasoningEffort low (task-routing law - C2 is a coding
delegation: GLM-5.3-Flash low for the mechanics pass, then HIGH for the
verification pass per the task-routing skill).

### 9.4 The A1/A2/A3 alignment

- A1 (the phase-1 coder) builds the package skeleton + the assemble-side
  plugin; its deliverables are UNTOUCHED by C2 except the three additive
  extension points (Apply.ts registration block, Config.ts fields,
  Library.ts inject list).
- A2 (the phase-1 smoke writer) owns the R/D suite; C2 ADDS the J/B/F/S
  series in the SAME suite file (or a sibling file - C2's choice, additive
  either way); the phase-1 assertions never weaken.
- A3 (the docs writer) owns the phase-1 README/SCHEME/site page; C2 ADDS
  the wave-2 sections (never rewrites the phase-1 paragraphs; a mismatch
  with C2's shipped strings is a defect to report, not to paper over).
- The phase boundaries are the collision rule: A1/A2/A3 complete and
  green BEFORE C2 starts; C2 extends; the two never edit the same lines
  concurrently because they never run concurrently.

---

## 10. THE ACCEPTANCE CRITERIA

### 10.1 Phase 1 (v1)

1. The plugin ships DISABLED (schema default + patch); a cold mount logs
   `disabled (enabled=false)`; the profile never lists it.
2. The assemble listener appends exactly ONE section named "live-containers"
   with interpolate: false; a time block's value changes between two
   assemblies whose clock advances; TTL reuses the cache; "request"
   re-renders.
3. Every ledger string byte-exact; a render failure leaves the assembly
   intact with `render failed <id> -> skipped`; no throw reaches any
   waterfall in any test.
4. The default config ships the 14 catalog templates (3 on, 11 dormant);
   live_container_set mutates per-agent state only; an unknown token
   renders literally + `render unknown <id> <token>`.
5. The R/D smoke suite (the 129-check size reference) is green; the
   vacuously-green guard holds (assertions on rendered text/ledger lines,
   never on "no throw").
6. The deterministic two-step build succeeds (plugin build -> test build ->
   tsc -> tsc-alias); the consumers type-check against the built Target.

### 10.2 Phase 2 (wave 2)

1. A cargo-build-matching bash call under "long-running" detaches: the
   model's tool result is a SUCCESSFUL result whose text is the byte-exact
   inline marker with a job id (isError false, no "Error:" prefix), the
   conversation continues, and the job runs in the fake registry with the
   exact re-dispatch spec (J1).
2. On settlement the owning agent's next assembly renders the completed
   frame (status, cause, elapsed, <= 2 KiB tail) exactly once, then the
   standing block is withdrawn (J5); a completion frame never appears
   without a settled event.
3. The I1 12.1 acceptance: write/edit under mode "all" execute inline,
   synchronously, governed exactly as unmounted (J2); selected's allowlist
   REJECTS the mutation family.
4. The I1 12.2 acceptance: a detached command inherits the sandbox (J3);
   a thrown composer error yields inline + `transform failed <tool> ->
   inline` + no orphan job (J4); no completion without a settled event
   (J5); liveTimeoutMs <= the inline deadline is a documented config
   contract + the timer kills with reason "live-timeout" (J7).
5. A re-issued identical command while live dedups to the same job id
   (J6); the __await first-key marker runs the call inline (J11).
6. A parent board with expectAgents: 5 sees five rows; a child settle
   flips the row at the next request; an explicit [live-report] splice
   pickup updates the row without any parent tool call (B-series); a
   stalled member renders [stalled] with no model action; a dead child
   renders [failed]; the count never lies; multi-level boards compose
   per agent; the board closes and withdraws; the STALE + lost lines
   render honestly.
7. The failsafe engine: the 8 scenarios act per the channel table; with
   failsafes "off", ZERO behavior modification with all templates enabled;
   the meta-budget caps the layer; the "not even notifying" posture is
   provable (no model-visible artifact on channel-1 scenarios).
8. The suggester: off = zero spawns; on = one detached activation per
   qualifying turn, the LIVE SUGGESTION frame exactly once, privacy
   redact by default (verbatim only by explicit config + disclosure),
   parse/timeout/spawn failures = ledger lines only.
9. All ledger strings byte-exact; no throw reaches any waterfall in any
   test; the phase-1 suite passes with ZERO assertion changes; the ETS
   twin mirrors with byte-identical strings.

---

## 11. THE RESIDUALS + THE ADDENDA COVERAGE

### 11.1 The four residuals (the decisions)

(a) THE WITHDRAWAL-AFTER-DELIVERY vs KV-CACHE CHURN: RATIFIED "honesty
beats cache" (01 section 8's position). The standing section is
stable-until-event (the cheapest cache class) and changes exactly twice
per job (start + settle/withdraw); the alternative - never withdrawing -
poisons the model's world model with still-running fictions, which costs
more than one tail rewrite per settlement. The SCHEME states the tradeoff
explicitly.
(b) THE SUGGESTER PRIVACY: default "redact" for ALL routes (first 200
chars + length); "verbatim" only when the user explicitly sets
suggesterPrivacy: verbatim (the config flag IS the consent surface; the
SCHEME + README carry the mandatory disclosure sentence naming the
forwarding). Ratified per 07 section 4.4's position.
(c) THE IDLE-WAKE TURNS: channel 4 (model-visible; the user sees the wake
in the GUI - the tool-jobs wakeup turn is a real model request the user
did not ask for). Ratified per 07 section 4.2; the SCHEME documents the
classification.
(d) THE PHASE ORDER: one package, two feature halves, strictly sequential
(section 9.1); the wave-2 extension is C2's, the assemble-side plugin is
A1/A2/A3's; the collision rule is the file-ownership map.

### 11.2 The addenda coverage (I2-I6)

NONE of the five addenda had landed by the write time (checked at start
and twice during the run). Designed here and flagged for ratification at
the C2 dispatch:
- AWAIT-MARKER -> section 4.3 (the {"__await":true first-key arguments
  marker; fire-and-forget by default; verified legal against the
  compiled parameter schemas);
- APPEND-SEAM -> section 3.3 (the completion append rides the standing
  section - the stock notice path is not composable, verified in
  dsh-tool-jobs lib/index.js; the withdrawal after one rendering);
- COMPLETION-ERGONOMICS -> section 4.2 (the batched form - several
  settling jobs merge into one section rebuild; the resume hint line;
  the out-of-order caveat header);
- PLANTED-LEASE -> sections 3.4 + 4.4 (open/close/closeMs/stall/prune/
  orphan/STALE/lost + the per-agent WeakMap ownership + the report-rate
  coalescing);
- SUGGESTER-CONFIGURED -> section 2.6 (the full knob set: mode, privacy,
  gate, rate bounds, timeout, autoPlant, the route triple).
If any addendum lands before the C2 dispatch, the orchestrator folds its
text over the corresponding section HERE (the addendum wins on conflict);
the report to the parent lists exactly which areas need that ratification.

---

## 12. THE VERIFIED ANCHORS (the evidence appendix)

All read in place from the app.asar (never extracted; the asar header is
at offset 16, the file data follows). The harness checkout:
/Applications/DeepSeek Harness.app/Contents/Resources/app.asar/dsh/

1. dsh-tools lib/index.js - prepareExecution: the pre-execute waterfall
   default `{ kind: "allow" }`; decision kinds allow/deny/ask/cancel; a
   deny materializes `{ content: [{type:"text", text: "Error: <reason>"}],
   isError: true, error: {message} }`; serviceAsk maps approval outcomes to
   deny with reasons; the monotonic ctx.tools.guard uses the same
   Error:-text path. There is NO accept-with-content pre-execute decision.
2. dsh-tools lib/index.js - dispatchScheduledExecution: the tools/execute
   waterfall default `() => this.dispatchToolBody(mutableExec)`; the
   returned value is normalized via normalizeDispatchResult ->
   createSuccessResult (validates the value against the tool's output
   schema, renders via the tool's own output.render) - a fabricated
   foreground value renders through the bash renderResult into exactly the
   marker text, isError false.
3. cordis lib/index.js - waterfall: "a listener that does not call next()
   vetoes the rest of the chain, including the built-in behavior".
4. dsh-tool-bash lib/index.js - the background adapter (startJob,
   processJob, processSources, ringDelta, processOutcome), the
   ctx.shell.resolve/execute + ctx.shellEnv.collect + ctx.workingDirectory
   .ensure + ctx.get("sandboxPolicy").resolve path, the renderPromoted
   "still running" grammar, the output schema's three branches, the
   run_in_background parameter (the harness's own fire-and-forget
   precedent).
5. dsh-jobs + dsh-jobs-local - start(spec) with preflight/capacity
   errors, JobSpec {kind, label, toolCall, owner, output, outputLimitBytes,
   run}, events.subscribe({ owner } | { owners: 'all' } | { owners:
   'scope' }), the settled event { type, job: view, cause, awaited }, the
   output signal { type: "output", id, owner, total }, kill(id, caller,
   reason), wait(id, timeoutMs, caller, signal), readAt(id, from, caller)
   (owner-fenced), attachController(name), the view projection (no ring
   content), the ring caps 262144/16384.
6. dsh-tool-jobs lib/index.js - the completion notice text +
   createUserMessage + owner.followup/owner.inject (not composable), the
   pre-execute output-limit capture, the `{ owners: "scope" }` settled
   subscription with the awaited/kill/teardown skips, maxConsecutiveWakes.
7. dsh-agent-loop lib/index.js - the inbox splice construction `{ target,
   start, removedCount?, inserted, outcome? }`, the per-message
   agent/inbox/inserted { message } emission, the README's "Every inbox
   mutation commits one normalized agent/inbox/spliced event".
8. dsh-system-prompt lib/index.js + README - the assembled section object
   carries interpolate; "Set interpolate: false ... to preserve its text
   literally, including {{...}} groups"; the KV-cache statements (an
   unchanged rendering leaves the system nodes untouched).
9. dsh-subagent README - startActivation({ provider, label, request,
   signal, delivery }) -> { childId, messageId?, result, dispose }.
10. dsh-bash-local README - ctx.shell registration; timeoutMs 120000
    default (the inline deadline the liveTimeoutMs constraint keys on).
11. dsh-tools parameterSchemaSpecToJsonSchema + checkObjectSchemaTail - the
    compiled parameter schema is { type: "object", properties, required? }
    with no additionalProperties: false and no unknown-key rejection - the
    __await marker rides legally.

---

## 13. THE ROUTING + THE LANE NOTES

- The C2 dispatch triple: cloudflare-workers-ai / @cf/zai-org/glm-5.3-flash
  / low (mechanics pass), then high (verification pass) - the task-routing
  law.
- This design is READ-ONLY executed: the single deliverable is this file
  (write tool); no builds, no dev server, no test runs, no git mutations
  (checks only; the whole work reports READY-TO-COMMIT when green).
- The normalize hooks are active in the authoring profile: this document
  is ASCII-only, tabs-only, written through the write tool API.
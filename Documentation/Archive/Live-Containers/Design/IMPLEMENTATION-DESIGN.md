---
title: Live Containers Implementation Design (D2)
category: Archive/Live-Containers
kind: one-shot-record
date: 2026-10-19
status: complete
registry: Documentation/Archive/Live-Containers/Design/IMPLEMENTATION-DESIGN.md
index: Documentation/INDEX.md
statuses:
    - name: the D2 design (14 sections, byte-ready)
      state: implemented
      evidence: C2 executed it; the phase-1 then wave-2 order held
    - name: the G1 decision (the plugin's own tools/execute arm as the carrier)
      state: implemented
      evidence: the fabricated canonical-value result via the cordis veto
    - name: the G2 decision (the command-runner wrapper only)
      state: implemented
      evidence: the mutation family non-detachable, hardcoded in Policy.ts
    - name: the G5 decision (agent/inbox/spliced pickup)
      state: implemented
      evidence: the session-event carrier correction
    - name: the addenda coverage (I2-I6 designed in)
      state: resolved
      evidence: each addendum landed; the addendum wins on conflict
    - name: the C2 residuals R1-R5 (per I3)
      state: implemented
      evidence: closed against first-hand asar verification
---

# LIVE CONTAINERS - IMPLEMENTATION DESIGN (D2)

Date: 2026-10-19.

Status: implementation design.

This document is the byte-ready specification that the CODER (C2) executes.

Prepared by: the DESIGN lane D2 (cloudflare-workers-ai / @cf/zai-org/glm-5.3-flash / low).

Base: `Documentation/Archive/Live-Containers/LIVE-CONTAINERS-RESEARCH.md` (v1),
`Documentation/Archive/Live-Containers/Requirements/00-07` (wave 2), and the I1 binding constraints
(00 section 5.7-5.8, 01 section 12, 07 section 5).

Scope: one package with two twins: `Classic/packages/hook-dsh-live-containers` and
`EffectTS/packages/ets-hook-dsh-live-containers`.

Wave 2 extends that same package (07 section 3.8).

This design fixes the phase boundaries so the v1 coders (A1/A2/A3) and the wave-2 coder (C2) never
collide.

Addenda coverage: the DESIGN lane wrote this document before the five DESIGN ADDENDA (I2-I6:
AWAIT-MARKER, APPEND-SEAM, COMPLETION-ERGONOMICS, PLANTED-LEASE, SUGGESTER-CONFIGURED) arrived in
`Documentation/Archive/Live-Containers/Design/` (checked at the start and twice during the run).

This document designs those five areas here (sections 4, 5, 6, 3.4, and 2) and marks them in the
report for ratification against the final texts of the lanes at the C2 dispatch.

---

## 0. THE DECISIONS AT A GLANCE

1. **G1: the CAN-1 carrier.**

    A tools/pre-execute decision cannot carry a synthetic non-error tool result.

    The harness verifies this limit.

    In `dsh-tools` (`app.asar` `dsh/node_modules/@deepseek-ai/dsh-tools/lib/index.js`,
    `prepareExecution`), the only decision kinds are allow, deny, ask, and cancel.

    A deny produces `content: [{type:"text", text:"Error: <reason>"}], isError: true`, so the model
    observes an ERROR result and never a completed one.

    The pre-execute surface has no accept-with-content shape.

    In the tools/execute waterfall (`dsh-tools` `lib/index.js` `dispatchScheduledExecution` +
    `cordis` `lib/index.js` waterfall), a listener that does not call `next()` vetoes the rest of
    the chain, including the built-in behavior.

    A listener can therefore replace the real dispatch.

    The harness then normalizes the returned value through `normalizeDispatchResult` ->
    `createSuccessResult`, which validates the value against the output schema of the tool and
    renders it through `output.render`.

    Decision: the carrier is the tools/execute arm of the plugin itself.

    The pre-execute listener decides, starts the job, and tags the exec object in a `WeakMap`.

    The tools/execute listener observes the tag and returns a fabricated canonical-value result
    `{ kind: "foreground", ... stdout: {text: <the marker bytes>} }` without calling `next()`.

    The bash body never runs, and the pipeline renders a SUCCESSFUL (`isError: false`) tool result
    whose text is exactly the marker.

    The harness ships the precedent: the `renderPromoted` function of the bash tool already renders
    a successful "[still running ...]" result.

    Section 3.2 rejects the deny-with-reason shape, the post-execute arm, and the tool-jobs notice
    path, each with a reason.

2. **G2: the producer re-dispatch.**

    The design applies a command-runner wrapper only (I1 5.1).

    The wrapper copies the background adapter of the bash tool (`dsh-tool-bash` `lib/index.js`
    `startJob`/`processJob`/`processSources`) over the same governed path: `ctx.shell.resolve` +
    `ctx.shell.execute` (sandbox and deadlines unchanged), `ctx.shellEnv.collect(exec)`,
    `ctx.workingDirectory.ensure(agent, signal)`, `ctx.get("sandboxPolicy")?.resolve({session})`,
    and `ctx.jobs.start({kind, label, toolCall, owner, output, run})`.

    The content-mutating family (write, edit, raw-write, normalize-file) stays permanently
    non-detachable in every mode and is hardcoded in `Policy.ts` (section 5.1).

3. **G5: the child-to-parent report pickup.**

    The parent plugin listens to `agent/inbox/spliced` (emit mode, plain `ctx.on`).

    `dsh-agent-loop` `lib/index.js` verifies that every inbox mutation commits one normalized event
    with data `{ target, start, removedCount?, inserted, outcome? }`.

    A `send_message` report from a child arrives in the parent inbox as an insertion, so the
    `inserted` messages of the splice are the pickup surface.

    The board truth is settlement-first (jobs settled events), with the explicit report as the
    high-fidelity overlay (section 3.5).

4. **The four residuals.**

    (a) The design ratifies "honesty beats cache": withdrawal after delivery is one prompt-tail
    rewrite per settlement, and the design accepts that cost.

    (b) The suggester privacy default is "redact" for every route (first 200 chars + length),
    "verbatim" applies only by explicit config, and the SCHEME disclosure is the consent surface.

    (c) The design ratifies the idle-wake turn as channel 4 (model-visible, and the user observes
    the wake in the GUI).

    (d) The phase order is PHASE 1 = the v1 assemble-side plugin (A1/A2/A3), PHASE 2 = the wave-2
    extension (C2) on the same package, strictly sequential, with an exact file-ownership map
    (section 9.3).

5. **The addenda.**

    This document designs the five addenda (I2-I6): AWAIT-MARKER (section 4.3), APPEND-SEAM (section
    3.3), COMPLETION-ERGONOMICS (section 4.2), PLANTED-LEASE (section 3.4), and SUGGESTER-CONFIGURED
    (section 2.6).

---

## 1. THE PACKAGE ANATOMY

### 1.1 The two twins

- `Classic/packages/hook-dsh-live-containers/` is the primary package, and the build makes it first.
- `EffectTS/packages/ets-hook-dsh-live-containers/` is the twin, and it holds the same contract
  behind Effect v4 (the `ets-base-dsh` + `ets-plugin-dsh-factory` layer), keeps the ledger strings
  byte-identical, and mirrors the anatomy of `ets-hook-dsh-tool-coach` exactly.

The ETS twin ships after the team accepts the Classic twin (the last step of phase 2), per the split
discipline of the family.

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

Phase 1 (A1) creates `Library.ts`, `Variable/Config.ts`, `Variable/DefaultBlocks.ts`,
`Function/{Apply,Render,Counters}.ts`, `Interface/{Config,State,Execution}.ts`, `README.md`,
`SCHEME.md`, `package.json`, `cordis.patch.yml`, `tsconfig.json`, `Configuration/*`, and
`prepublishOnly.sh`.

Phase 2 (C2) adds `Variable/Catalog.ts`,
`Function/{Policy,Jobs,Detach,Completion,Board,Failsafe,Suggester,Set,Plant}.ts`,
`Interface/Events.ts`, the `Source/Test` tree, and the wave-2 sections of
`Config`/`Apply`/`Library`/`README`/`SCHEME`.

C2 edits those files and never rewrites them (section 9.3).

### 1.3 The deterministic build + the two-step test compile

`prepublishOnly.sh` mirrors the script in `lib-dsh-core`, and the order is mandatory:

    set -e
    Build "Source/**/*.ts" "!Source/Test/**/*.ts" \
    	--ESBuild Configuration/ESBuild.ts \
    	--TypeScript Configuration/TypeScript.noemit.json
    Build "Source/Test/**/*.ts" \
    	--ESBuild Configuration/Test-ESBuild.ts

The Target plugin of the plugin build wipes `Target/` recursively, so the test build runs second and
wipes only `Target/Test`.

The negation is mandatory: `Source/**/*.ts` matches the Test tree, and without the negation the
plugin build fails on test-only syntax and ships Test output inside `Target`.

Then `package.json` holds:

    "scripts": {
    	"prepublishOnly": "sh prepublishOnly.sh && tsc -p tsconfig.json && tsc-alias -f -p tsconfig.json"
    }

A red `tsc` fails the build, and the consumers type-check against the built `Target`.

The test folders follow the per-test layout of the family:
`Source/Test/<Name>/ {Test.ts, README.md}` -> `Target/Test/<Name>/Test.js`.

The tests run standalone and under `Maintain/Run-Smokes.mjs`, which checks the printed PASS count of
each folder against its README (the vacuously-green guard).

`Test-ESBuild.ts` is the `lib-dsh-core` file verbatim (`bundle: false`, `outbase Source/Test`,
sourcemaps on, the Target-Test wipe plugin).

### 1.4 The package.json + cordis.patch.yml

Mirror `hook-dsh-tool-coach`: name `@playform/hook-dsh-live-containers`, version `0.0.1`, type
module, main `./Target/Library.js`, exports
`{ ".", "./cordis.patch.yml", "./SCHEME.md", "./package.json" }`, files
`[Target, cordis.patch.yml, README.md, SCHEME.md]`, and `dsh.bundle.patch ./cordis.patch.yml`.

Dependencies: `@playform/lib-dsh-core` `0.0.1` + `@playform/plugin-dsh-factory` `0.0.1`.

DevDependencies: `@deepseek-ai/cordis` `4.0.4`, `@deepseek-ai/dsh-llm` `0.2.0-rc.2`,
`@deepseek-ai/dsh-system-prompt` `0.2.0-rc.2`, `@deepseek-ai/dsh-tools` `0.2.0-rc.2`,
`@deepseek-ai/dsh-jobs` `0.2.0-rc.2`, `@deepseek-ai/schemastery` `3.18.4`, `@playform/build`
`0.3.4`, `@types/node` `26.6.5`, `tsc-alias` `1.9.7`, and `typescript` `7.0.2`.

The `dsh-jobs` devDependency supplies the `JobSpec`/`JobEvent` TYPES for the Source.

The runtime resolves these packages from the running `dsh` copy, the family precedent: `schemastery`
and `dsh-tools` are devDependencies too.

`cordis.patch.yml` has one insert entry `- insert: - id: hook-dsh-live-containers` whose config is
`enabled: false` and nothing else.

The plugin ships DISABLED, never appears in the profile bundles, and keeps the IDLE-forever posture
(v1 residual 5; every spec restates it).

The patch file carries the full default surface as comments only, and the schema defaults are the
truth.

### 1.5 The Library.ts contract

The loader contract is verbatim from the family: `export const name`, `export const apply`,
`export const Config`, `export const inject`, and `export default { name, apply, Config, inject }`.

The default object holds all of them.

A missing member on the default object throws `cannot get property "fs" without inject` at runtime,
and a smoke that calls `apply` directly never catches this (`Library.ts:7-11` of `tool-coach`).

The phase-2 `inject` list is
`["pluginFactory", "tools", "systemPrompt", "shell", "shellEnv", "workingDirectory", "jobs"]`.

Phase 1 injects only `["pluginFactory", "tools"]`; phase 2 extends it with an additive edit.

The `apply` body returns nothing.

### 1.6 The IDLE-forever posture + the activation proof

The plugin ships DISABLED: `enabled: false` in the schema default and in the patch.

On a cold mount, the State build logs `disabled (enabled=false)` (the byte-exact ledger line) and
the listeners do nothing (every listener checks `State.On` first).

Enabling happens only by an explicit ACTIVATE (the user edits the profile).

The activation proof logs the Activate block (the `lib-dsh-core` Activate helper): `bundle 0.0.1`,
`blocks <n>`, `refresh <policy>`, `detach <mode>`, `failsafes <on|off>`, and `suggester <mode>`.

---

## 2. THE CONFIG SCHEMA

The Schemastery discipline uses `hook-dsh-normalize-dash/Variable/Config.ts` as the pattern.

The factory's standalone helper `Schema(shared = false, fields)` builds the schema in the
NON-MANIFEST posture.

The plugin has no fs/observed machinery, so `shared: false` emits only the two universal volatile
cells `log`/`logFile`, and the plugin defaults override them.

Every knob below is `.volatile()` unless marked `(plain)`.

A hot edit commits without a remount.

The factory State builder unwraps `{ get }` cells, and the P10 loader/volatile-update listener
refreshes them in place.

### 2.1 The shared knobs (phase 1 + phase 2, all volatile)

    enabled: boolean, default false            (the IDLE-forever posture)
    log: boolean, default true
    logFile: string, default ~/.dsh/playform/hook-dsh-live-containers.log
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

The default config ships the full 14-entry catalog (03 section 3) with sensible enablements:
`todo-list`, `command-runner`, and `session-stats` ON, the rest dormant (`enabled: false`), and the
plugin still disabled.

The defaults live in `Variable/DefaultBlocks.ts` (data, not code).

`Variable/Catalog.ts` holds the same 14 entries as the suggester input and the docs block table: one
source, three consumers (03 section 2).

The catalog entries are the config presets: `live_container_set template=<id>` instantiates a preset
into the per-agent state and never into the config file.

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

The default `liveTimeoutMs` is 120000, a deliberate amendment of 600000 in 01 section 7.

The I1 sandbox rule (01 section 12.2) mandates `liveTimeoutMs <=` the inline deadline for the tool
family, and the bash executor's inline default is `timeoutMs` 120000 (`dsh-bash-local` README config
table).

The schema validates `liveTimeoutMs >= 1000` and `<= 600000`.

The SCHEME documents the `<= inline-deadline` requirement as a composition contract: the plugin
cannot read the inline timeout policy of the harness, so the team enforces the constraint at
config-authoring time and by the timer proof of the smoke.

The command-runner family and the permanently non-detachable family are hardcoded in `Policy.ts`
(section 5.1), not config.

The policy rejects the non-detachable family even when `selectedTools` lists it (I1 5.1/12.1).

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

The privacy gate is a DESIGN decision: "redact" sends the first 200 chars of the request plus its
length only, and "verbatim" forwards the whole excerpt (`<= maxPromptBytes`).

The SCHEME must carry the disclosure paragraph: "with suggesterPrivacy: verbatim, the user's request
text is forwarded to the configured suggester route" (05 section on privacy + 07 section 4.4;
ratified below in section 11).

The suggester skips a user message that contains the words "live container" or "plant".

### 2.7 The kind registry (phase 1 + 2)

Phase 1 kinds (the v1 research section 3): time, counter, manifest, gauge, note, and template.

Wave-2 kinds (03 section 3): todo-list, agent-progress-board, task-failsafe-guard, command-runner,
countdown-expiry, session-stats, diff-summary, constraint-reminder, scoreboard, live-manifest,
memory-block, validator, environment-drift, and delegation-inbox.

The kind registry maps each kind to its trigger default and its frame (section 4).

`Render.ts` dispatches by kind, and every kind is data-driven (no eval, no expressions; the
substitution engine, section 3.1).

## 3. THE LISTENER SET

Every listener calls `next()` first, wraps its body in a fail-open `try/catch`, never throws into a
waterfall, and writes only to the plugin's own ledger file.

`Apply.ts` registers L1..L8 in the order below (plain registration unless noted).

### 3.1 L1 - system-prompt/assemble (the standing section; phase 1 + 2)

The v1 seam is one waterfall listener appended after `next()`.

It returns the downstream assembly with one appended section:

    { name: <State.SectionName>, text: <the rendered body>, interpolate: false }

`interpolate: false` is mandatory.

`dsh-system-prompt` `lib/index.js` carries
`...section.interpolate !== void 0 ? { interpolate: section.interpolate } : {}` on every assembled
section, and the README states: "Set interpolate: false on a section or dynamic context to preserve
its text literally, including {{...}} groups".

Thus the plugin's own substitution engine (`Render.ts`, `{{token}}` replace only) is the only
resolver of its tokens, and the harness unresolved-variable failure is never inherited (v1 residual
4).

The body has this order (each part is its own byte-exact block, section 4):

1. **Header line.**

    The out-of-order caveat, only while any job/board is live.

2. **Fleet line.**

    The live-jobs roster, only while any job is live.

3. **Live job frames.**

    One standing frame per LIVE job (section 4.1).

4. **Settled frames.**

    One standing frame per settled-but-undelivered job (the completed frame, section 4.2), rendered
    for one assembly after settlement and then withdrawn (the APPEND-SEAM, section 3.3).

5. **Planted boards.**

    One frame per OPEN planted board (section 4.4).

6. **Template blocks.**

    One frame per enabled template block (the template host, phase 1).

    The TTL cache (`refresh = "ttl"`) caches the rendered body and rebuilds it every `ttlCalls`
    assemblies (the `tool-coach` `sectionTtl` pattern, `Apply.ts:516-538`); `refresh = "request"`
    re-renders per assembly.

    For the per-block event trigger wiring (03 section 2), each block holds a dirty flag.

    The assemble listener recomputes dirty blocks and keeps the others cache-stable.

    The settle/post-execute/pre-step listeners set the dirty flag on matching blocks (event
    triggers).

    For the section budget, when the rendered body exceeds `sectionBudgetBytes`, the oldest frames
    collapse to one-line summaries (the failsafe 8 path, section 6), and the plugin never drops them
    silently (ledger `failsafe section-collapse <n>`).

    A render failure skips the block and logs `render failed <id> -> skipped`, and the assembly
    still resolves.

### 3.2 L2 + L3 - tools/pre-execute + tools/execute (the detach transform; phase 2)

The G1 carrier (verified in section 0.1) uses two listeners and one contract.

L2 tools/pre-execute (waterfall, `(Exec, Next) => Promise<PreToolDecision>`) calls `next()` first,
then:

1. **Bypass.**

    If `!State.On` or `detach.mode === "off"`, return `Downstream`.

2. **Non-detachable.**

    If `Exec.name` is in the permanently non-detachable family (write, edit, raw-write,
    normalize-file; `Policy.ts` hardcodes the set), return `Downstream`.

    These calls always run inline (the I1 command-only rule).

    Read-only observation tools also run inline unless `mode === "selected"` lists them.

3. **Await marker.**

    If the `__await` marker is present (section 4.3), ledger `await marker -> inline <tool>` and
    return `Downstream`.

4. **Dedup.**

    If the dedup key matches a still-live job for this agent (`Policy.Dedup`), return the same
    marker with the same job id plus the line
    `[live] already running as <job-id>; job_output <job-id> to check.` (through the tag of the
    execute arm; ledger `dedup <tool> -> <job-id>`).

    The retry counter increments, and the retry-loop failsafe may extend the marker (section 6
    scenario 5).

5. **Escalation.**

    If the call carries `sandbox_permissions` (an escalation request), return `Downstream`.

    The escalation approval flow stays with the bash tool's own execute, and the transform never
    re-implements approval.

    This branch does not use `transform failed <tool> -> inline`; it writes
    `escalation -> inline <tool>`.

6. **Policy decision.**

    `Policy.Decide(Exec, State)` applies the mode.

    In `"long-running"`, the command contains a `longRunningMarker` or the same-prefix history
    average is `>= minHistoricalMs` (per-agent observed history from the L4 post-execute
    timestamps).

    In `"all"`, every command-runner call qualifies.

    In `"selected"`, the tool is in `selectedTools` (command-runner family only; non-detachables are
    rejected even here) and/or the command matches a `selectedPatterns` regex.

    The guard rails all pass through and write a ledger line, and none denies: admission
    (`maxLivePerAgent` / the registry per-owner cap -> `capacity full <owner> -> inline`),
    `minLatencyMs` (the call is too short to pay for the detach -> inline), interactive detection
    (the command needs stdin: it ends with a pipe from a TTY-ish source or contains a
    read-from-stdin construct that the conservative detector flags -> inline), and the per-agent
    failsafe meta-budget (section 6 scenario 7).

7. **Transform.**

    The wrapper (`Jobs.ts`, section 5) starts the job with the exact re-dispatch spec
    (cwd/env/policy preserved; G2, section 5.1).

    On admission or start failure, it passes through and writes the matching ledger line.

    On success, it records the pair (`exec -> {jobId, spec, args, agentId}`) in the per-agent
    `WeakMap` state and tags the exec object (a `WeakMap` keyed on the exec itself:
    `Detach.Tagged`).

    The L3 arm reads the tag, and the completion path reads the per-agent record.

    If the marker text cannot be composed, stop the just-started job with reason `marker-failed`,
    untag, and return `Downstream` (the I1 half-detached rule, 01 section 12.2.2).

    The code wraps every branch.

    On any internal error, untag, stop any just-started job (`marker-failed`), ledger
    `transform failed <tool> -> inline`, and return `Downstream`, so the call runs inline exactly as
    if the plugin were not mounted.

    The listener never denies: a transform replaces a dispatch and never blocks (the I1 fail-open
    rule).

    A "deny" here would render `Error: <marker>` to the model, and the carrier design avoids exactly
    that.

L3 tools/execute (waterfall, `(Exec, Next) => Promise<unknown>`) does not call `next()` when the tag
is present:

1. **Pass-through.**

    If `!State.On` or `Exec` is not tagged, return `Next()`.

2. **Marker.**

    Compose the marker text (section 4.1, the inline form).

3. **Fabricated result.**

    Return the fabricated result and never call `Next()` (the cordis waterfall veto, so the bash
    body never runs):
    `{ kind: "foreground", cwd: <the resolved workdir>, exitCode: 0, signal: null,  timedOut: false, aborted: false, timeoutMs: <the call's timeoutMs ?? liveTimeoutMs>, stdout: {  text: <the marker>, truncated: false }, stderr: { text: "", truncated: false } }`.

    The `dsh-tools` `normalizeDispatchResult` path validates this value against the foreground
    branch of the bash output schema and renders it through the bash tool's own `renderResult`.

    With exit code 0 and no markers, the model observes exactly the marker bytes as a SUCCESSFUL
    tool result (`isError: false`).

    The smoke pins the schema shape: the bash output contract of the harness is stable, a harness
    upgrade that changes it is caught by the smoke, and the SCHEME documents the coupling.

4. **Failure.**

    On any internal error in L3 (marker compose, tagged-record read), stop the tagged job with
    reason `marker-failed`, untag, ledger `transform failed <tool> -> inline`, and return `Next()`,
    so the real dispatch runs inline (the fail-open rule, 01 section 12.2.2).

    L3 never leaves a half-detached state.

The tag lives for exactly one pipeline pass.

L3 removes it (`WeakMap` delete), so a retried dispatch of the same exec (a replay) cannot be
swallowed twice.

### 3.3 The completion append (G3 - the APPEND-SEAM + COMPLETION-ERGONOMICS)

The carrier decision is verified: the stock completion notice path is not composable.

`dsh-tool-jobs` composes
`background job <id> (<kind>: <label>) finished [status: ...]. Read its output with job_output.`
internally (`tool-jobs` `lib/index.js`: `fitCompletionNotice` + `createUserMessage` +
`owner.followup`/`owner.inject`) and exposes no plugin hook for notice text.

The completion block therefore rides the standing section (01 section 3 step 6 carrier (b) + (c)):

1. **Settlement.**

    The settled subscription of the plugin (L6, section 3.6) receives the settlement.

    If the owner agent of the job is gone (cause teardown), ledger `owner gone <job-id>` and render
    nothing (the `tool-jobs` skip contract, mirrored).

2. **Frame.**

    The per-agent record of the job changes from running to settled.

    The standing section renders the completed frame (section 4.2) at the next assembly, and the
    frame carries status, cause, elapsed, and the tail that the producer captured (section 5.4).

3. **Withdrawal.**

    After that one rendering (the frame was delivered in one assembly), the block is withdrawn
    (removed from the section; ledger `withdrawn <job-id> (completed)`).

    The withdrawal rewrites the prompt tail once per settlement, the "honesty beats cache" position
    that section 11 ratifies.

    The completed frame renders at most once.

    A restart before the rendering renders nothing (the ledger record is the truth), and a marker
    that survives a restart without a live registry renders `status: lost (process exit)` (01
    section 9.10), never silently disappearing (I1 12.2.3).

4. **Resume hint.**

    The last line of the completed frame tells the model
    `[live] job_output <job-id> to read the full output.`.

    In the batched form, several settling jobs between two steps merge into one section rebuild (the
    `tool-jobs` "several jobs settling together cost one step" contract, mirrored in the section),
    and the header caveat line discloses the ordering.

### 3.4 L5 - the planted-block surface (CAN-2 - the PLANTED-LEASE)

The plant tool (`Function/Plant.ts`) registers
`live_plant(id, plantType, template?, expectAgents, memberIds?)` through `defineTool` (the `ccr`
`Retrieve.ts` idiom).

It creates the board in the per-agent state of the calling agent (the `WeakMap`, `tool-coach`
`Agent()` pattern) and writes ledger `plant opened <id> (expect <n>)`.

`plantType` is `"agent-board" | "todo-fill" | "aggregate" | "custom"`.

The lease (the PLANTED-LEASE design):

- The board lives in the assemble section of the parent and is recomputed per parent request (the v1
  seam), so a report that arrives between requests shows up at the next ask-time automatically, with
  no push into history.
- The board closes when all expected members settle, and it renders the closing line for one request
  and then withdraws (the CAN-1 withdrawal discipline, generalized; ledger
  `board closed <id> (<n>/<expect> in <n>s)`).
- A board with empty slots renders `[none]` rows, and after `closeMs` the empty slots are dropped
  and the board closes (02 section 7).
- An orphaned board (no parent requests for `orphanBudgetMs` while members are live) is not
  withdrawn (the parent may return; 04 scenario 6), but its header renders the STALE declaration:
  `status: STALE (no parent requests for <n>s)` (02 + the restart-honesty line, section 4.4).
- The board dies with the parent (per-agent `WeakMap` state; no orphan boards survive the agent).
- Report flooding uses per-member coalescing at `reportRateMs` (1 report per 2s counted; later
  reports coalesce into the last; 02 section 7).

### 3.5 L7 - the report pickup (G5)

The child-to-parent report channel is verified: a `send_message` from a child to the parent arrives
in the parent inbox as an insertion.

Every inbox mutation commits one normalized `agent/inbox/spliced` event (`dsh-agent-loop` README
"Create or resume agents programmatically"; `dsh-agent-loop` `lib/index.js` splice construction:
`{ target, start, removedCount?, inserted, outcome? }`), and each insertion also emits
`agent/inbox/inserted { message }`.

The parent plugin listener (emit mode, plain `ctx.on`, host scope; a host listener observes every
agent event and filters by agent id):

1. **Splice pickup.**

    On `agent/inbox/spliced` with `data.inserted.length > 0`, fold each inserted message whose text
    content matches the report grammar (section 4.4, the `[live-report]` first line) into the board
    of the owner agent of the message (the agent whose inbox spliced; the event is scoped to the
    agent `ctx`, so the listener reads the agent from the event scope, with the message `session`
    field as the fallback).

    The report grammar is `[live-report] <plantId> <agentId> <status> <payload>`.

    A child that knows the board reports through its own `send_message`, the board updates the
    member row (`status`/`lastReport`/`lastReportAt`), and the next assembly reflects it (02 section
    4 carrier 3, the highest-fidelity carrier; carriers 1 and 2, the child job settle + progress
    line, come through L6, section 3.6).

    Ledger `report <id> <agentId> (<n> bytes)`.

2. **Fail-open.**

    A parse miss is silently ignored (no ledger line per miss; the inbox holds the model's own
    steering, and only a matching report is folded), and the listener never throws into the emit
    dispatch.

### 3.6 L6 - the settled subscription (the jobs truth)

`Context.jobs.events.subscribe({ owners: "scope" }, Listener)` is registered from the host context
of the plugin.

The verified signature is `events.subscribe(filter, listener)`, and the settled event is
`{ type: "settled", job: <view>, cause, awaited }`.

The listener:

1. **Scope.**

    It skips events whose job is not in the per-agent live records of the plugin (only our detached
    jobs and the children of our boards are tracked; the subscription is read-only for everything
    else).

2. **Kill.**

    For cause "kill" (the model's own `job_kill` or our `live-timeout`/`live-hang` kill), the
    completed frame renders `status: killed` with the kill reason (the view detail).

3. **Teardown.**

    For cause "teardown", ledger `owner gone <job-id>` and render nothing.

4. **Producer.**

    For cause "producer", the completed frame renders the outcome status (completed/failed) and the
    detail (exit code / error tail).

5. **Awaited.**

    For `awaited: true` (the model called `job_output` with `wait: true`), skip the completion frame
    (the model already collected the outcome; the `tool-jobs` awaited contract, mirrored; ledger
    `completion skipped <job-id> (awaited)`).

6. **Planted boards.**

    A child job settlement changes the member row to done/error with the elapsed time and the first
    line of the answer (capped), the board truth source (02 section 4 carriers 1-2).

7. **Record cleanup.**

    The per-job record is dropped after the completion frame renders (or after the
    skipped/awaited/owner-gone paths).

    The record lifecycle is open on detach and closed on delivery.

The events subscription also feeds the fleet line (live jobs), the per-job output totals (for the
hang detector, section 6), and the withdrawal bookkeeping.

`{ owners: "scope" }` is scope-layered: the plugin's own jobs plus its boards' children, nothing
else.

### 3.7 L4 + L8 - the counters + the cache invalidation (phase 1 + 2)

L4 tools/post-execute (plain `ctx.on`, after the `ccr` prepend listener, plain registration order)
updates the counters that the gauge/template blocks read (`lastToolAt`, per-turn attempt counts by
tool name, the per-command-prefix duration history that the long-running heuristic reads).

It is a pure observer, returns the downstream decision unchanged, and is fail-open.

L8 agent/pre-step (plain `ctx.on`) runs the user-message detection (the `tool-coach` precedent
`Apply.ts:456-490`), resets per-turn counters, and (phase 2) triggers the suggester gate (section
3.8).

The same listener arms the event-trigger dirty flags for blocks whose trigger is "event" (user
message).

L9 tools/change (emit) clears the section cache (the `tool-coach` L5 pattern; ledger
`section rebuilt (tools/change)`).

### 3.8 L10 - the suggester trigger (CAN-5)

On a qualifying user message (the L8 detection; first message of a turn OR length
`>= suggestGateMinChars`), the plugin makes one suggestion per user turn, rate-bounded
(`maxSuggestionsPerHour`), and skips the suggestion when the message contains "live container" or
"plant" (the user is driving manually).

The suggestion runs detached:
`Context.subagent.startActivation({ provider: <suggesterRoute.provider>, label: "live-containers-suggester", request: <the composed prompt>, signal: <an AbortController armed with suggestTimeoutMs>, delivery: none })`
(the verified surface, `dsh-subagent` README:62, returns `{ childId, result, dispose }`).

The composed prompt holds the request excerpt (redacted or verbatim per `suggesterPrivacy`,
`<= maxPromptBytes`), the template catalog (name + one-line use + shape; `Catalog.ts`), and the task
facts that the plugin already holds (live jobs count, open boards, turn count).

The output contract is the strict JSON
`{ fit: "yes" | "no" | "unknown", templateId, rationale, tokens? }`, and a parse failure yields no
suggestion (fail-open; ledger `suggestion parse failed`).

Delivery: the plugin stores the suggestion in the per-agent state and renders it as the LIVE
SUGGESTION frame at the next assembly (the `live-containers-suggester` section note, 05 carrier 1),
then withdraws it after one turn (cache stability).

`autoPlant` instantiates the suggested template as a DORMANT planted block labeled suggested (05
carrier 3; default false).

The accept/dismiss grammar: the model accepts by `live_container_set plant=<templateId> expect=<n>`
(the instantiation path) and dismisses by `live_container_set dismiss=<suggestionId>` (ledger
`suggestion dismissed <id>`), and doing nothing dismisses (the one-turn withdrawal).

A spawn/timeout/parse failure produces only a ledger line (`suggestion skipped (<reason>)`) and
never a conversation artifact.

---

## 4. THE MARKER GRAMMARS (byte-exact)

Every grammar line below is the byte-exact contract: the smokes assert the rendered section text and
the fabricated result text byte-identically, and the SCHEME carries the same list.

All text is ASCII.

### 4.1 The "still running" marker

The inline marker is the model-visible tool result that the L3 arm fabricates:

    [live] <job-id> running: <cmd-head> - output pending; proceed reasoning.

`<job-id>` is the registry id (`bash-<16 hex>`), and `<cmd-head>` is the first 80 bytes of the
command on a single line (newlines replaced by " | ").

The dedup variant appends a second line:

    [live] already running as <job-id>; job_output <job-id> to check.

The standing frame is the assemble section while the job runs (01 section 4):

    --- LIVE CONTAINER <job-id> (running; not harness state) ---
    cmd: <first 120 bytes of the command>
    started: <HH:MM:SS>
    status: running (elapsed <n>s)
    --- END LIVE CONTAINER <job-id> ---

The section header and fleet line (01 section 6; only while any job/board is live):

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

The failure variant uses `status: error` with the error tail, and the kill variant uses
`status: killed` with the kill reason (the view detail).

The frame renders for one assembly and then withdraws (ledger `withdrawn <job-id> (completed)`).

The `<tail>` is the bounded tail that the producer captured (section 5.4), at most 2 KiB total, with
stdout first and then the stderr section.

### 4.3 The {"__await":true first-key marker (the AWAIT-MARKER design)

The per-call block-on-demand opt-out follows the family's `{"__normalize":false` first-key marker
(`hook-dsh-normalize-dash` `Normalize.ts:41-67`), but it sits in the tool-call arguments:

    {"__await":true, "description": "...", "command": "..."}

Grammar: `__await` is the first key of the tool-call arguments JSON object, and its value is exactly
`true`.

The key is legal: the compiled parameter schemas of the command runners carry no
`additionalProperties: false` (`dsh-tools` `parameterSchemaSpecToJsonSchema` compiles
`{ type: "object", properties, required? }` only, and the harness validator checks declared
properties and required, never unknown keys; `checkObjectSchemaTail`), so the extra key validates
and reaches `exec.arguments` untouched.

The bash body ignores the key, and the executed call carries it in the log (transparency, no desync;
the "cannot rewrite arguments" limitation of `dsh-tools` is respected, and nothing is stripped).

Policy: fire-and-forget by default, so the transform detaches without the marker.

The marker is the explicit model statement "this call must run inline and I need its real output";
when it is present, the transform skips the detach (ledger `await marker -> inline <tool>`, and the
call runs inline normally).

The standing section teaches the marker grammar to the model in its instructions line (one line,
only when `detach.mode != "off"`):

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

The todo-fill variant uses `[x] <item> - by <agentId> (<n>s)` / `[ ] <item>` /
`[~] <item> - in progress`.

The aggregate variant uses one computed line (`files changed: 17 | tests: 3 failing`).

The STALE declaration (orphaned board, section 3.4) changes the header line to
`--- LIVE PLANT <id> (agent-board; expect <n>; status: STALE - no parent requests for <n>s) ---`.

The restart-honesty line (01 section 9.10): a board record that survives a restart without a live
registry renders `status: lost (process exit)` in its header once and then withdraws.

The report grammar (the child-to-parent `send_message` carrier, G5):

    [live-report] <plantId> <agentId> <status> <payload>

`<status>` is one of "done" | "running" | "stalled" | "error", and `<payload>` is free text (the
last-report line, capped at 240 bytes).

Todo-fill boards use `[live-report] <plantId> <agentId> todo <itemIndex> <done|running>` instead.

L7 picks up the report (section 3.5).

### 4.5 The suggestion grammar (the accept/dismiss)

    --- LIVE SUGGESTION (from a small helper model; act only if useful) ---
    fit: yes | template: <templateId>
    why: <rationale, capped at 240 bytes>
    start it with: live_container_set plant=<templateId> expect=<n>
    --- END LIVE SUGGESTION ---

Accept with `live_container_set plant=<templateId> expect=<n>`, dismiss with
`live_container_set dismiss=<suggestionId>`, and take no action to let the frame withdraw after one
turn.

The `autoPlant` variant renders the dormant block `status: suggested - start it when ready` in the
planted frame header.

---

## 5. THE JOBS INTEGRATION

### 5.1 The producer re-dispatch (G2 - the command-runner wrapper)

The wrapper in `Function/Jobs.ts` copies the background adapter of the bash tool (`dsh-tool-bash`
`lib/index.js` `startJob` + `processJob` + `processSources`) against the same governed path.

The design implements I1 12.2.1 ("the producer re-dispatch runs the command through the bash tool's
own governed execution path") by reusing the shell seam exactly:

1. **Resolve the spec at detach time.**

    The pre-execute listener resolves the spec so the model observes the same cwd/env/policy as the
    inline call.

    - `standingPolicy = ctx.get("sandboxPolicy")?.resolve(exec.agent ? { session: exec.agent.session } : {});`
    - `cwd = exec.agent ? await ctx.workingDirectory.ensure(exec.agent, exec.signal) : undefined;`
      `workdir = resolveWorkdir(args.workdir, cwd)` (the `tool-bash` `resolveWorkdir` semantics:
      relative -> joined under the session cwd).
    - `dshEnv = ctx.shellEnv.collect(exec);`
    - `spec = ctx.shell.resolve({ command: args.command, ...(workdir !== undefined ? { workdir } : {}), ...(args.timeoutMs !== undefined ? { timeoutMs: args.timeoutMs } : {}), dshEnv, ...(policy !== undefined ? { sandboxPolicy: policy } : {}), onExpiry: "none" })`.

    `onExpiry "none"` means the executor never stops the detached process, and the plugin's own
    `liveTimeoutMs` timer is the only guard (01 section 7; the stock inline timeout policy does not
    apply to detached jobs).

2. **Start the job.**

    `ctx.jobs.start({ kind: "bash", label: <the command, first 80 bytes>, toolCall: { callId: exec.callId, rootCallId: exec.rootCallId }, ...(exec.agent ? { owner: exec.agent.id } : {}), outputLimitBytes: 2048, output: processSources(() => proc), run: (handle) => processJob(async (signal) => { proc = await ctx.shell.execute({ ...spec, signal }); return proc; }, (started) => processOutcome(started, escalationModes)) })`.

    `outputLimitBytes: 2048` is the producer-owned output cap, and the `tool-jobs` capping contract
    keeps the complete model-facing read bounded.

    `processSources(() => proc)` supplies the pull sources that the registry pumps at `pumpPollMs`,
    read from `proc().observed[channel].readFrom`.

    The shapes match `tool-bash` exactly: the starter receives the job-owned `AbortController`
    signal, the outcome maps killed/completed + exit code + sandbox notes, and the adapter cancel
    stops the process (job-owned cancellation, so the registry kill -> process kill).

3. **Capture the tail.**

    The same observed streams feed the ring and a bounded private tail (stdout + stderr, 2 KiB
    total, the `ringDelta` channel semantics: stdout chunks in order, then one `[stderr]` section).

    The registry ring caps (262144 live / 16384 settled) remain the output caps, and the private
    tail is only the render source for the completion composer.

    The reason is verified: the `settled` event carries no ring content (`jobs-local` `lib`: the
    settled payload is `{ type, job: <view>, cause, awaited }` and the view output field is
    `{ total, earliest, spillPaths }`), and a host plugin is not the job owner, so `readAt`/`read`
    on an owned job fails authorization (`jobs-local` `expect(id, caller)`: `owner.id === caller`).

    The captured tail of the plugin is therefore the only legal render source.

4. **Record the job.**

    The per-agent `WeakMap` holds
    `{ jobId, spec, args, agentId, startedAt, tailStdout, tailStderr,  status, detail, cause, cmdHead }`,
    and the completion composer, the fleet line, and the hang detector read it.

The wrapper is command-runner-only by construction.

The detachable set of `Policy.ts` is exactly the command runners (`bash`, `pwsh`, and the family
whose `Exec` is a spawned subprocess: `cargo`, `npm`, `pnpm`, `make`, ...), detected by the tool's
execution path being a shell/spawn.

The non-detachable mutation family is hardcoded and checked first.

Read-only observation tools may detach under "selected" only (I1 5.1), out of the default set.

### 5.2 The dedup (per-agent; the cross-agent build dedup is FUTURE)

The dedup key is `(agent id, normalized command, resolved workdir)`, where normalized = trim +
collapse runs of whitespace + strip leading `cd x && ` prefixes whose target equals the resolved
workdir.

A re-issued call whose key matches a still-live job for the same agent returns the same job id with
the already-running line (section 4.1), so no second job starts (01 section 7; ledger
`dedup <tool> -> <job-id>`).

The retry counter feeds the retry-loop failsafe (section 6 scenario 5).

The cross-agent fleet dedup (06 idea 2) is FUTURE: it needs the cross-owner join record + the
per-agent completion fan-out, and it is not in the C2 scope.

### 5.3 The failure/timeout/cancellation/retry paths

- **Transform failure.** Inline + `transform failed <tool> -> inline` (I1 12.2.2,
  acceptance-tested).
- **Admission full.** Per-owner 10 or `maxLivePerAgent`: inline + `capacity full <owner> -> inline`.
  The registry `start()` throws on capacity (`jobs-local` start: "background job limit reached for
  this owner"), and the `try/catch` converts the throw to pass-through.
- **Start failure.** Preflight/spawn: inline + `start failed <tool> -> inline`.
- **Job failure.** Producer settle with status failed: the completed frame renders status error with
  the error tail, and the standing block is withdrawn at the next assembly after delivery (I1: never
  fabricate a completion; the frame renders only from the observed settled event).
- **Model kill.** `job_kill` gives cause kill, and the completed frame renders status killed with
  the reason; there is no second notice (the `tool-jobs` kill-set contract belongs to the
  `tool-jobs` plugin; our subscription just renders the frame, and the model already observed the
  kill result).
- **Live timeout.** The plugin arms a timer per job at `liveTimeoutMs` ->
  `ctx.jobs.kill(jobId, agentId, "live-timeout")` -> the completed frame renders status killed
  (reason live-timeout). The timer is the only guard (`onExpiry "none"`; the inline timeout policy
  does not apply).
- **Hang.** No new output bytes past `hangBudgetMs`: the failsafe path (section 6 scenario 1) ->
  kill with reason `live-hang` when `hangAction = "kill"`.
- **Owner teardown.** Cause teardown -> `owner gone <job-id>`, no frame (the `tool-jobs` skip
  contract; nobody can read it).
- **Model awaits.** `job_output` with `wait: true`: the awaited settlement -> no frame (awaited
  flag), and the record closes (the model collected the outcome).
- **Model retries.** The dedup path (above).
- **Restart.** Records are per-agent `WeakMap` state and die with the process; nothing survives to
  render (the session ledger keeps the lifecycle events). A marker that outlives its registry (the
  standing section can only render from live records, so it cannot) renders `status: lost` only if
  the plugin keeps a restart-surviving record, and it does not in v2 (the pins store, 06 idea 9, is
  FUTURE). The orphaned-marker handling therefore reads: the standing section renders only from live
  per-agent records, so a restarted session section holds no ghost frames. The "status: lost" line
  is specified for the board records (section 4.4) and for the FUTURE pins store. The I1 requirement
  (a marker that cannot be withdrawn after restart renders `status: lost`, never silently
  disappearing) is satisfied by the honest-empty section plus the lifecycle events in the ledger
  (the session timing records the user reads). The SCHEME states this explicitly.

### 5.4 The ring + the rendering caps

The registry ring is the output cap (262144 live / 16384 settled, the `jobs-local` defaults; the
plugin never re-implements them).

`outputLimitBytes` 2048 caps every complete model-facing read/notice of our jobs (the `tool-jobs`
capping contract).

The completion block renders at most the 2 KiB captured tail, and `sectionBudgetBytes` caps the
standing section (failsafe 8).

No rendering in the append path is unbounded (I1 12.2.1).

---

## 6. THE FAILSAFE ENGINE (CAN-4)

The tool-coach posture is silent, automatic, and task-shaped.

The five notice channels (04 section 2) increase in loudness, and the config selects the ceiling per
scenario:

1. **Ledger only.**

    This is the default and CAN-4's "not even notifying the conversation" posture: a byte-exact line
    in the ledger file of the plugin, and nobody in the conversation knows.

2. **Log warn.**

    The context logger writes a warn line, the channel of the fail-open catch.

3. **Behavior change only.**

    A silent modification (a call detaches, a board plants, a threshold shifts) leaves no
    model-visible artifact.

4. **Model-visible note.**

    A standing-frame line or an inline marker.

5. **User-visible through existing surfaces only.**

    The user observes the change through surfaces that the user already reads (the jobs session
    timing records in the GUI, the ledger file, the debug attachments), never through a new push
    surface.

The eight scenarios (04 section 3) each define a trigger, an automatic action, a channel, and a
containment:

1. **The build hangs.**

    A detached command has zero new output bytes past `hangBudgetMs`.

    The hang detector compares the tail byte-count delta of the per-job record against the clock.
    The producer observes every pump append, so the detector is a pure per-record counter, and the
    ring offsets of the registry give the same truth for free through the `total` field of the
    output events.

    Action: ledger `failsafe hang <job-id> (<n>s no output)`; on `hangAction "kill"`,
    `ctx.jobs.kill(jobId, agentId, "live-hang")`.

    Channel: 1.

    Containment: the kill belongs to the registry, never to a subprocess force-kill in our code.

2. **The delegation stalls.**

    A board member stays `[stalled]` past `stallBudgetMs`, and the row changes (channel 4 at the
    next request, the board render).

    On `stallAction "prune"`, the member is dropped from the expect count so the board closes
    cleanly (ledger `member dropped <id> <agentId> (pruned)`).

3. **The limits approach.**

    Per-owner admission is full, `maxLivePerAgent` is hit, or `maxConsecutiveWakes` is exhausted:
    pass-through inline + ledger `failsafe admission inline <tool>` (the CAN-1 admission path).

    Channel: 1.

4. **The drift.**

    The session-stats variables cross their thresholds (`messages > N`, `sinceLastTool > S` while a
    live board is open), and the affected frames gain a WARN line inside them.

    Channel: 4 + ledger.

    The automatic twin of the validator template applies when the user did not install the
    validator: the failsafe renders the same guard from thresholds it owns, and the thresholds are
    the vars of the session-stats block.

5. **The retry loop.**

    The dedup counter reaches `retryFailsafeCount` for the same normalized command: ledger
    `failsafe retry-loop <cmd>`, and the marker of the third re-issued call gains the line
    `[live] already running as <job-id> (3rd attempt) - use job_output.`.

    Channel: 4 (model guidance) + 1.

6. **The orphaned board.**

    A board whose parent requests have not run for `orphanBudgetMs` while members are live: ledger
    only.

    The board is not withdrawn (the parent may return), the reports of its members keep arriving,
    and the frame header gains the STALE declaration (channel 4 at the next parent request,
    disclosed by the frame itself).

7. **The silent-modification budget.**

    The meta-failsafe allows `failsafesPerTurn` (5) automatic modifications per turn.

    Exceeding it disables automatic modification for the rest of the turn (pass-through everywhere)
    and logs one summary line `failsafe meta-budget (<turn>)`.

    The `tool-coach` never meta-limits, and CAN-4's silence demands the limit: an unbounded silent
    modifier is the one unforgivable failure mode.

8. **The context-drift guard.**

    The bytes of the standing section exceed `sectionBudgetBytes`, and the oldest frames collapse to
    one-line summaries (ledger `failsafe section-collapse <n>`; never dropped silently).

The triggers key on the observable shape of the task (04 section 4): live jobs, boards, detached
calls, their ages, their output rates, and their counts, read from `ctx.jobs` events, post-execute,
pre-step, and the per-agent state of the plugin.

The plugin is a pure observer: it reads no message content for trigger evaluation (the privacy gate
inherited from the `context: "full"` rule of the v1 programmable stage).

Safety (04 section 5): every failsafe action is fail-open wrapped, and a failsafe that cannot act
logs and passes through.

The layer can never deny a call, drop content, or cancel a job because of its own internal error.

Stopping is the only destructive action, and it goes through the registry kill, gated behind
`hangAction`/config.

The meta-budget bounds the power of the layer, and `failsafes: "off"` is the default even when the
plugin is enabled.

---

## 7. THE SMOKES PLAN

The family pattern (the `smoke-writing` skill) loads the real built `Target/Library.js` against a
fake `ctx` (on capture, get serving the real `@playform/plugin-dsh-factory` instance from its built
`Target`, logger capture, the `__hookDshLiveContainersState` probe attachment, and the root seam).

The suites run with `node <name>-smoke.mjs` from `Classic/smokes/` (plus the EffectTS twin in
`EffectTS/smokes/`).

The A2 spec covers the phase-1 suite, and the wave-2 suite is additive: the phase-1 assertions never
weaken.

### 7.1 The fake-ctx shape (wave-2 extension)

- **Fake clock.** A mutable `now` injected into the time sources of the plugin. The plugin reads
  time only through a Clock module (`Counters.ts`/`Render.ts`/`Detach.ts`/`Board.ts` all call
  `Clock.Now()`/`Clock.Elapsed()`), and the smoke advances the clock and never sleeps.
- **Volatile flips.** The config cells pass as `{ get() }` references, the smoke mutates the backing
  object, and the next assembly must respect the flip without a remount (the P10 pattern).
- **Jobs seam.** A fake registry implements the verified surface (`start(spec)` -> id with the
  preflight/capacity errors on demand, `events.subscribe(filter, listener)` capturing the listener,
  `kill`/`wait`/`readAt`/`remove`/`attachController`) plus a controllable settle trigger (the smoke
  fires the captured listener with a fabricated settled event).
- **Shell seam.** A fake `ctx.shell` (`resolve` captures the spec; `execute` returns a controllable
  process handle whose observed streams the smoke feeds), so the producer pull sources and the tail
  capture are exercisable without a real process.
- **Tools seam.** The bash definition fetched through `ctx.tools.get("bash")` is the real
  `dsh-tools` fixture where the fabricated-value validation is exercised. The smoke does not import
  the real `@deepseek-ai/dsh-tools` from the harness, because the smokes cannot import harness
  internals either. The smoke instead asserts the shape of the fabricated value (the exact keys that
  the foreground branch of the bash output schema requires) with a byte-exact expected object, and
  the D-series asserts the execute-arm contract (the listener returns the fabricated object and
  never calls `Next`; the downstream receives it untouched). The real validation/render happens in
  the harness, and the smoke pins our side of the contract (the schema shape + the veto behavior).
  The SCHEME documents this fidelity gap explicitly (the smoke/live fidelity discipline,
  `smoke-writing` section 3).
- **Agents seam.** `ctx.get("agents")` for the board enrollment, plus the fake inbox: the smoke
  fires the L7 listener with a fabricated `agent/inbox/spliced` event (the
  `{ target, start, inserted }` shape) and asserts the board fold.

### 7.2 The phase-1 suite (A2's spec, the R/D series)

The R-series (render) checks that the section appears exactly once per assembly with the name
"live-containers", the LIVE CONTAINER frame bytes, and a time block value that changes between two
assemblies whose fake clock advances.

Every block kind renders.

The TTL tests check that `refresh "ttl"` with `ttlCalls=2` renders once and reuses the cache, and
that `"request"` re-renders.

The `interpolate: false` assertion checks that a template containing `{{provider}}` renders it
literally, because the harness variable never resolves.

The section budget collapse is also covered.

The D-series (discipline) checks the byte-identity ledger assertions (every string of section 9.2
against its exact expected bytes), the fail-open negatives (a render failure -> the assembly still
resolves, the block is skipped, ledger `render failed <id> -> skipped`), the volatile flips, and the
vacuously-green guard (every test asserts on the rendered section text or ledger lines, never on "no
throw"; at least one negative per block kind).

It also checks the `disabled (enabled=false)` cold-mount proof and the per-agent-only writes of the
`live_container_set` tool.

### 7.3 The wave-2 suite (the J/B/F/S series, ADDITIVE)

J-series (jobs/detach - the I1 acceptance additions are J-tests): J1 a cargo-build-matching bash
call under "long-running" detaches: the fake registry gained one start with the exact re-dispatch
spec (cwd/env/ policy preserved - the spec's command/workdir/dshEnv/sandboxPolicy match the
intercepted call), the fabricated result's text is the byte-exact marker, isError false, Next was
NOT called; J2 the write/edit family under mode "all" runs INLINE synchronously: the L2 listener
passes through (no start), the L3 passes through, the governance chain (the fake fs/observed
listener fixture) fires exactly as with the plugin unmounted - the I1 12.1 acceptance addition; J3 a
sandbox-denied command fails the same way detached as inline (the fake shell's execute returns a
denied sandbox result; the producer's outcome maps the sandbox notes identically) - the I1 12.2
acceptance (a); J4 a thrown composer error (the smoke forces the marker compose to throw) yields
inline execution + `transform failed <tool> -> inline` + NO orphan job (the fake registry saw a kill
with reason marker-failed or no start) - the I1 12.2 acceptance (b); J5 no completion frame ever
appears without a settled event (the smoke renders with zero settlements -> no completed frame; then
fires one settled -> exactly one completed frame, then the withdrawal: the next assembly has no
frame) - the I1 12.2 acceptance (c); J6 the dedup: a re-issued identical command while live returns
the SAME job id with the already-running line and starts NO second job; J7 the liveTimeoutMs timer:
the fake clock advances past liveTimeoutMs -> the fake registry's kill received reason
"live-timeout"; J8 the awaited settlement: the settled event with awaited: true -> no frame, ledger
`completion skipped <job-id> (awaited)`; J9 the capacity path: the fake registry's start throws the
capacity error -> inline + `capacity full <owner> -> inline`; J10 the
minLatencyMs/minHistoricalMs/history heuristics (the fake clock plus the recorded post-execute
durations); J11 the __await marker: an arguments object whose first key is __await:true -> inline +
`await marker -> inline <tool>`; the marker survives in the logged arguments (nothing stripped).

B-series (boards): the five-row board with enrollment by settle; an explicit [live-report] splice
pickup updates the row at the next assembly (G5); the stalled row after stallMs on the fake clock;
the failed row from a kill-caused settlement; the overflow row + the total line; the board close +
withdrawal; the STALE header; the multi-level summary (the child's board is the child's section -
the smoke mounts two agents and asserts the sections are per-agent); the report-rate coalescing.

F-series (failsafes): the hang ledger + the hangAction kill; the stalled member flip + prune; the
admission inline ledger; the drift WARN line; the retry-loop marker extension; the orphaned board
ledger + STALE; the meta-budget summary + the pass-through-forever remainder of the turn; the
section-collapse; with failsafes "off": ZERO behavior modification with all templates enabled; the
"not even notifying" posture provable by asserting NO model-visible artifact on channel-1 scenarios.

S-series (suggester): with suggester off: zero spawns, zero sections; on: one qualifying turn spawns
exactly one activation with the composed prompt (redact: the excerpt is the first 200 chars +
length; verbatim: the full excerpt - the privacy asserts); a fit=yes result renders the LIVE
SUGGESTION frame exactly once then withdraws; a parse failure produces only the ledger line;
autoPlant instantiates the dormant suggested block; the rate bounds.

The family counts: the phase-1 suite targets the tool-coach's 129-check size reference; the wave-2
suite is its own counted series (the README of each Source/Test folder declares its PASS count for
the Run-Smokes guard).

---

## 8. THE DOCS PLAN

The A3 spec covers the README, the SCHEME, and the site page, extended for wave 2.

### 8.1 README.md (the A3 voice + the wave-2 sections)

- The one-paragraph pitch (the dynamic-recompute idea).
- The block catalog as a table (shape / trigger / knobs), with the 14 templates from `Catalog.ts`
  (one source).
- The CAN-1 section: the detach transform (modes, the command-only rule, the marker grammar, the
  completion append, the withdrawal, and the KV-cache honesty paragraph). The inline marker is a
  one-time history line with no cache cost, the standing section is stable until an event, and the
  withdrawal rewrites the prompt tail once per settlement; state "honesty beats cache".
- The CAN-2 section: planted blocks, the lease, and the report grammar.
- The CAN-4 section: the failsafe posture, the five channels, and the "not even notifying" default.
- The CAN-5 section: the suggester and the privacy disclosure (the verbatim forwarding sentence,
  mandatory when the suggester is on).
- The IDLE-forever posture, the install line, and "every knob is volatile".
- The ledger strings list (the byte-exact contract).
- The FUTURE section: the programmable stage (the `ptc-runtime` design of the v1 research section 5,
  clearly labeled FUTURE), the chain splitter, the cross-agent dedup, the pins store, and the CCR
  composition (06 idea 5).

### 8.2 SCHEME.md

- The full config surface (every field, type, default, and volatile-or-not status; section 2
  verbatim).
- The detach policy table (the modes, the non-detachable family, the hazards: "all" is DANGEROUS +
  `allRequiresConfirm`; the sequencing disclosure that completions may arrive out of order; the
  `__await` marker).
- The ledger-string contract (the byte-exact list, section 9.2).
- The smoke battery map (R/D/J/B/F/S ids; "per the final inventories of the smokes" for the phase-2
  ids).
- The seam evidence (the verified anchors of section 12; the harness version pinned).
- The privacy disclosure (the suggester).
- The programmable stage section (FUTURE; not in v2).

### 8.3 The site page

`Site/Source/pages/plugins/hook-dsh-live-containers.astro` mirrors the component usage of the
existing plugin pages (`PageHero`, `Concept`, `Seams`, `Card`, `CodeBlock`, `Badge`, ...), plus the
registry row in `Site/Source/pages/plugins.astro` (`Name`/`Desc`/`Install`/`FlavorBadge`).

Content: the one-screen pitch, the block catalog, the safety framing (the LIVE CONTAINER frame is
the plugin's own output, never harness state), the detach + boards + suggester one-liners, and the
status line "planned - not yet in the profile" (the IDLE-forever posture stated plainly).

The site build is `cd Site && pnpm prepublishOnly`, and it verifies through the built HTML/CSS in
`Target/`; the docs lane never runs a dev server.

NOTE: read the A3 spec's "mirror the tool-coach's site files" as "mirror the normalize-dash page",
because the `tool-coach` has no site page yet; the A3 surface is the new `.astro` page + the
`plugins.astro` row.

---

## 9. THE C2 CODER BRIEF + THE A1/A2/A3 ALIGNMENT + THE PHASE ORDER

### 9.1 The phase order (the collision rule)

PHASE 1 (the v1 dispatch - A1/A2/A3, per the v1 research section 6, IDLE until ACTIVATE) builds the
assemble-side plugin: `Library`, `Config` (section 2.1 + 2.2), `DefaultBlocks`, `Render`,
`Counters`, `Apply` (L1 + L4 + L8 + L9 only), the Interface trio, the two-step build,
`README`/`SCHEME` (phase-1 scope), the R/D smoke suite, and the site page skeleton.

Acceptance: the phase-1 criteria (section 10.1) all green.

PHASE 2 (the wave-2 dispatch - C2, per this design) builds the wave-2 extension on the same package:
`Policy`, `Jobs`, `Detach`, `Completion`, `Board`, `Failsafe`, `Suggester`, `Set`, `Plant`,
`Events.ts`, the `Config`/`Apply`/`Library`/`README`/`SCHEME` extensions, the `Source/Test` tree,
the J/B/F/S smoke suite, and the ETS twin.

Acceptance: the wave-2 criteria (section 10.2) all green.

THE COLLISION RULE: the phases are strictly sequential.

Phase 2 starts only after phase 1 acceptance is green.

Within phase 2, the edits of C2 to phase-1 files are additive (new listeners appended in the
registration block of `Apply.ts`, new fields appended in `Config.ts`, new members in the `inject`
list of `Library.ts`), and they never rewrite phase-1 semantics.

The phase-1 smoke passes with zero assertion changes (the family arbiter law).

The new modules of C2 are new files (the module-leaves discipline: the wave-2 behaviors live in
their own Function modules, and `Apply.ts` only registers them).

### 9.2 The ledger-string contract (the byte-exact list, `live-containers: ` prefix)

Phase 1 (research section 3, verbatim; SYNCED 2026-10-20 to A1's SHIPPED form - the code ships the
(bundle 0.0.1, ...) variant, canonical): disabled (enabled=false) activated (bundle 0.0.1,
blocks=<n>, refresh=<policy>) block rendered <id> (<len> bytes) block skipped <id> (<reason>)
section rebuilt (ttl <n>) render failed <id> -> skipped

Wave 2 (this design; the SCHEME owns the final list - C2 ships it): section rebuilt (tools/change)
transform failed <tool> -> inline capacity full <owner> -> inline start failed <tool> -> inline
escalation -> inline <tool> await marker -> inline <tool> dedup <tool> -> <job-id> marker failed
<job-id> -> inline detached <tool> -> <job-id> owner gone <job-id> completion rendered <job-id>
(<len> bytes) completion skipped <job-id> (<reason>) withdrawn <job-id> (completed) render unknown
<id> <token> set <key> set unknown <name> <key> plant opened <id> (expect <n>) member enrolled <id>
<agentId> report <id> <agentId> (<n> bytes) member stalled <id> <agentId> member dropped <id>
<agentId> (<reason>) board closed <id> (<n>/<expect> in <n>s) overflow <id> <agentId> failsafe hang
<job-id> (<n>s no output) failsafe admission inline <tool> failsafe retry-loop <cmd> failsafe
section-collapse <n> failsafe meta-budget (<turn>) failsafe stall <id> <agentId> suggested
<templateId> (fit <fit>) suggestion skipped (<reason>) suggestion parse failed suggestion dismissed
<id>

### 9.3 The C2 brief (the self-contained coding spec)

ROLE: Implement the wave-2 extension of `@playform/hook-dsh-live-containers` (the Classic twin
first, the ETS twin after Classic acceptance) per
`Documentation/Archive/Live-Containers/Design/IMPLEMENTATION-DESIGN.md` sections 2-7 (the config
schema, the listener set, the marker grammars, the jobs integration, the failsafe engine, and the
smokes) and this brief.

SURFACE: Only `Classic/packages/hook-dsh-live-containers/**` and
`EffectTS/packages/ets-hook-dsh-live-containers/**` (after Classic acceptance), plus
`Classic/smokes/live-containers-smoke.mjs`, `EffectTS/smokes/ets-live-containers-smoke.mjs`, the
wave-2 sections of the package `README`/`SCHEME`, and the wave-2 section of the site page.

READ FIRST: this design document (sections 0-12), the v1 research sections 3-5, `Requirements/00-07`
(the I1 binding constraints in 01 section 12 and 07 section 5 are hard),
`Classic/packages/hook-dsh-tool-coach/Source/Function/Apply.ts` (the listener discipline),
`Classic/packages/hook-dsh-ccr/Source/Function/Retrieve.ts` (the `defineTool` idiom),
`Classic/packages/lib-dsh-core/prepublishOnly.sh` (the two-step build), and the `tool-bash`
reference behavior at
`/Applications/DeepSeek Harness.app/Contents/Resources/app.asar/dsh/node_modules/@deepseek-ai/dsh-tool-bash/lib/index.js`
(read it in place and never extract it; `startJob`/`processJob`/`processSources`/`waitOnJob` are the
producer adapter reference), `dsh-tools` `lib/index.js` (the tools/execute veto + the
fabricated-value normalization), `dsh-jobs-local` `lib/index.js` (`start`/events/settle), and
`dsh-agent-loop` `lib/index.js` (the inbox splice).

DELIVERABLES: the nine new Function modules + `Interface/Events.ts` + the `Config`/`Apply`/`Library`
extensions of sections 2-3 + the wave-2 ledger strings (byte-exact, section 9.2) + the `Source/Test`
tree (the J/B/F/S folders, each `{Test.ts, README.md}` with the declared PASS count) + the wave-2
smoke suite (additive; the phase-1 assertions unchanged) + the wave-2 docs sections + the ETS twin
mirror (byte-identical ledger strings).

ARBITERS: the family smoke runner (`Maintain/Run-Smokes.mjs`) all green; the phase-1 smoke passes
with zero assertion changes; the ledger strings match the SCHEME byte-exactly; no other package
changes.

DISCIPLINES: never run git commands (checks only; report READY-TO-COMMIT); ASCII only; tabs only;
file content through the write/edit tool API only; no builds/dev-server/test runs beyond what the
smoke harness performs when the orchestrator runs it; never enable the plugin in the profile; never
import `@deepseek-ai` runtime packages into the runtime path of the bundle beyond the family
precedent (`dsh-tools` `defineTool` type-only + `schemastery` are devDependencies, and the runtime
resolves from the running `dsh`); every listener calls `next()` first and is fail-open; every ledger
line is byte-exact.

REPORT FORMAT: one message with the files created/edited per twin, a per-file one-line summary, the
exact ledger strings shipped, the smoke results (pass/fail counts per series), and any deviation
from this design with a one-line reason.

ROUTING TRIPLE: provider `cloudflare-workers-ai`, model `@cf/zai-org/glm-5.3-flash`, reasoning
effort low (the task-routing law: C2 is a coding delegation, with GLM-5.3-Flash low for the
mechanics pass and HIGH for the verification pass per the task-routing skill).

### 9.4 The A1/A2/A3 alignment

- A1 (the phase-1 coder) builds the package skeleton + the assemble-side plugin. C2 leaves its
  deliverables untouched except at the three additive extension points (`Apply.ts` registration
  block, `Config.ts` fields, `Library.ts` inject list).
- A2 (the phase-1 smoke writer) owns the R/D suite. C2 adds the J/B/F/S series in the same suite
  file (or a sibling file; the choice is C2's, and either way is additive), and the phase-1
  assertions never weaken.
- A3 (the docs writer) owns the phase-1 README/SCHEME/site page. C2 adds the wave-2 sections and
  never rewrites the phase-1 paragraphs; a mismatch with the shipped strings of C2 is a defect to
  report, not to paper over.
- The phase boundaries are the collision rule: A1/A2/A3 complete and green before C2 starts, and C2
  extends. The two never edit the same lines concurrently because they never run concurrently.

---

## 10. THE ACCEPTANCE CRITERIA

### 10.1 Phase 1 (v1)

1. **Disabled ship.**

    The plugin ships disabled (schema default + patch), a cold mount logs
    `disabled (enabled=false)`, and the profile never lists it.

2. **Section append.**

    The assemble listener appends exactly one section named "live-containers" with
    `interpolate: false`.

    A time block value changes between two assemblies whose clock advances, TTL reuses the cache,
    and "request" re-renders.

3. **Ledger and render failure.**

    Every ledger string is byte-exact.

    A render failure leaves the assembly intact with `render failed <id> -> skipped`, and no throw
    reaches any waterfall in any test.

4. **Catalog and state.**

    The default config ships the 14 catalog templates (3 on, 11 dormant).

    `live_container_set` mutates per-agent state only, and an unknown token renders literally +
    `render unknown <id> <token>`.

5. **Smoke suite.**

    The R/D smoke suite (the 129-check size reference) is green, and the vacuously-green guard holds
    (assertions on rendered text/ledger lines, never on "no throw").

6. **Build.**

    The deterministic two-step build succeeds (plugin build -> test build -> tsc -> tsc-alias), and
    the consumers type-check against the built `Target`.

### 10.2 Phase 2 (wave 2)

1. **Detach result.**

    A cargo-build-matching bash call under "long-running" detaches.

    The model tool result is a successful result whose text is the byte-exact inline marker with a
    job id (`isError false`, no "Error:" prefix), the conversation continues, and the job runs in
    the fake registry with the exact re-dispatch spec (J1).

2. **Completion frame.**

    On settlement, the next assembly of the owning agent renders the completed frame (status, cause,
    elapsed, `<= 2 KiB` tail) exactly once, and then the standing block is withdrawn (J5).

    A completion frame never appears without a settled event.

3. **Inline mutation.**

    The I1 12.1 acceptance: write/edit under mode "all" executes inline, synchronously, and governed
    exactly as unmounted (J2); the allowlist of "selected" rejects the mutation family.

4. **Sandbox and failure.**

    The I1 12.2 acceptance: a detached command inherits the sandbox (J3); a thrown composer error
    yields inline + `transform failed <tool> -> inline` + no orphan job (J4); no completion occurs
    without a settled event (J5); `liveTimeoutMs <=` the inline deadline is a documented config
    contract, and the timer kills with reason "live-timeout" (J7).

5. **Dedup and await.**

    A re-issued identical command while live dedups to the same job id (J6), and the `__await`
    first-key marker runs the call inline (J11).

6. **Boards.**

    A parent board with `expectAgents: 5` sees five rows.

    A child settle changes the row at the next request, and an explicit `[live-report]` splice
    pickup updates the row without any parent tool call (B-series).

    A stalled member renders `[stalled]` with no model action, a dead child renders `[failed]`, and
    the count never lies.

    Multi-level boards compose per agent, the board closes and withdraws, and the STALE + lost lines
    render honestly.

7. **Failsafes.**

    The failsafe engine runs the 8 scenarios per the channel table.

    With `failsafes "off"`, zero behavior modification occurs with all templates enabled.

    The meta-budget caps the layer, and the "not even notifying" posture is provable (no
    model-visible artifact on channel-1 scenarios).

8. **Suggester.**

    The suggester is off with zero spawns, or on with one detached activation per qualifying turn,
    the LIVE SUGGESTION frame exactly once, privacy redact by default (verbatim only by explicit
    config + disclosure), and parse/timeout/spawn failures as ledger lines only.

9. **Byte identity.**

    All ledger strings are byte-exact, no throw reaches any waterfall in any test, the phase-1 suite
    passes with zero assertion changes, and the ETS twin mirrors with byte-identical strings.

---

## 11. THE RESIDUALS + THE ADDENDA COVERAGE

### 11.1 The four residuals (the decisions)

(a) **Withdrawal after delivery vs KV-cache churn.** The design ratifies "honesty beats cache" (the
position of 01 section 8).

The standing section is stable until an event (the cheapest cache class) and changes exactly twice
per job (start + settle/withdraw).

The alternative, never withdrawing, poisons the world model of the model with still-running
fictions, and that cost is higher than one tail rewrite per settlement.

The SCHEME states the tradeoff explicitly.

(b) **Suggester privacy.** The default is "redact" for all routes (first 200 chars + length), and
"verbatim" applies only when the user explicitly sets `suggesterPrivacy: verbatim`.

The config flag is the consent surface, and the SCHEME + README carry the mandatory disclosure
sentence that names the forwarding.

The design ratifies this per the position of 07 section 4.4.

(c) **Idle-wake turns.** Channel 4 is model-visible, and the user observes the wake in the GUI; the
`tool-jobs` wakeup turn is a real model request that the user did not ask for.

The design ratifies this per 07 section 4.2, and the SCHEME documents the classification.

(d) **Phase order.** One package, two feature halves, strictly sequential (section 9.1).

The wave-2 extension belongs to C2, the assemble-side plugin belongs to A1/A2/A3, and the collision
rule is the file-ownership map.

### 11.2 The addenda coverage (I2-I6)

None of the five addenda had arrived when the DESIGN lane wrote this document (checked at the start
and twice during the run).

This document designs them here and marks them for ratification at the C2 dispatch:

- AWAIT-MARKER -> section 4.3 (the `{"__await":true` first-key arguments marker; fire-and-forget by
  default; verified legal against the compiled parameter schemas).
- APPEND-SEAM -> section 3.3 (the completion append rides the standing section; the stock notice
  path is not composable, verified in `dsh-tool-jobs` `lib/index.js`; the withdrawal after one
  rendering).
- COMPLETION-ERGONOMICS -> section 4.2 (the batched form: several settling jobs merge into one
  section rebuild; the resume hint line; the out-of-order caveat header).
- PLANTED-LEASE -> sections 3.4 + 4.4 (open/close/`closeMs`/stall/prune/orphan/STALE/lost + the
  per-agent `WeakMap` ownership + the report-rate coalescing).
- SUGGESTER-CONFIGURED -> section 2.6 (the full knob set: mode, privacy, gate, rate bounds, timeout,
  `autoPlant`, the route triple).

If any addendum arrives before the C2 dispatch, the orchestrator folds its text over the
corresponding section here (the addendum wins on conflict), and the report to the parent lists
exactly which areas need that ratification.

---

## 12. THE VERIFIED ANCHORS (the evidence appendix)

The DESIGN lane read all anchors in place from the `app.asar` and never extracted them; the asar
header sits at offset 16, and the file data follows.

The harness checkout is `/Applications/DeepSeek Harness.app/Contents/Resources/app.asar/dsh/`.

1. dsh-tools lib/index.js - prepareExecution: the pre-execute waterfall default `{ kind: "allow" }`;
   decision kinds allow/deny/ask/cancel; a deny materializes
   `{ content: [{type:"text", text: "Error: <reason>"}], isError: true, error: {message} }`;
   serviceAsk maps approval outcomes to deny with reasons; the monotonic ctx.tools.guard uses the
   same Error:-text path. There is NO accept-with-content pre-execute decision.
2. dsh-tools lib/index.js - dispatchScheduledExecution: the tools/execute waterfall default
   `() => this.dispatchToolBody(mutableExec)`; the returned value is normalized via
   normalizeDispatchResult -> createSuccessResult (validates the value against the tool's output
   schema, renders via the tool's own output.render) - a fabricated foreground value renders through
   the bash renderResult into exactly the marker text, isError false.
3. cordis lib/index.js - waterfall: "a listener that does not call next() vetoes the rest of the
   chain, including the built-in behavior".
4. dsh-tool-bash lib/index.js - the background adapter (startJob, processJob, processSources,
   ringDelta, processOutcome), the ctx.shell.resolve/execute + ctx.shellEnv.collect +
   ctx.workingDirectory .ensure + ctx.get("sandboxPolicy").resolve path, the renderPromoted "still
   running" grammar, the output schema's three branches, the run_in_background parameter (the
   harness's own fire-and-forget precedent).
5. dsh-jobs + dsh-jobs-local - start(spec) with preflight/capacity errors, JobSpec {kind, label,
   toolCall, owner, output, outputLimitBytes, run}, events.subscribe({ owner } | { owners: 'all' } |
   { owners: 'scope' }), the settled event { type, job: view, cause, awaited }, the output signal {
   type: "output", id, owner, total }, kill(id, caller, reason), wait(id, timeoutMs, caller,
   signal), readAt(id, from, caller) (owner-fenced), attachController(name), the view projection (no
   ring content), the ring caps 262144/16384.
6. dsh-tool-jobs lib/index.js - the completion notice text + createUserMessage +
   owner.followup/owner.inject (not composable), the pre-execute output-limit capture, the
   `{ owners: "scope" }` settled subscription with the awaited/kill/teardown skips,
   maxConsecutiveWakes.
7. dsh-agent-loop lib/index.js - the inbox splice construction
   `{ target, start, removedCount?, inserted, outcome? }`, the per-message agent/inbox/inserted {
   message } emission, the README's "Every inbox mutation commits one normalized agent/inbox/spliced
   event".
8. dsh-system-prompt lib/index.js + README - the assembled section object carries interpolate; "Set
   interpolate: false ... to preserve its text literally, including {{...}} groups"; the KV-cache
   statements (an unchanged rendering leaves the system nodes untouched).
9. dsh-subagent README - startActivation({ provider, label, request, signal, delivery }) -> {
   childId, messageId?, result, dispose }.
10. dsh-bash-local README - ctx.shell registration; timeoutMs 120000 default (the inline deadline
    the liveTimeoutMs constraint keys on).
11. dsh-tools parameterSchemaSpecToJsonSchema + checkObjectSchemaTail - the compiled parameter
    schema is { type: "object", properties, required? } with no additionalProperties: false and no
    unknown-key rejection - the __await marker rides legally.

---

## 13. THE ROUTING + THE LANE NOTES

- The C2 dispatch triple is `cloudflare-workers-ai` / `@cf/zai-org/glm-5.3-flash` / low (mechanics
  pass), then high (verification pass), per the task-routing law.
- The team runs this design as READ-ONLY work: the single deliverable is this file (write tool),
  with no builds, no dev server, no test runs, and no git mutations (checks only; the whole work
  reports READY-TO-COMMIT when green).
- The normalize hooks are active in the authoring profile: this document is ASCII-only, tabs-only,
  and written through the write tool API.

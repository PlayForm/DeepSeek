---
title: Live File Monitors Implementation Design (D3)
category: Archive/Live-Containers
kind: one-shot-record
date: 2026-10-20
status: complete
registry: Documentation/Archive/Live-Containers/Design/FILE-MONITORS-DESIGN.md
index: Documentation/INDEX.md
statuses:
    - name: the D3 design (the engine, the check runner, the assemble band, the persistence)
      state: implemented
      evidence: C3 executed it; the wave-3 modules
    - name: the M5 decision (a new storage domain live_containers_monitors)
      state: implemented
      evidence: extension records rejected to avoid the v3 bump
    - name: the check runner sharing (the G2 wrapper, one wrapper two callers)
      state: implemented
      evidence: checkTimeoutMs capped at 120000, validated at load
    - name: the no-problem indicator grammar (bounded hard)
      state: implemented
      evidence: observed settle + exit 0 + exact version + live provenance
    - name: the C3 brief (section 16.2)
      state: resolved
      evidence: executed; the phase alignment held
---

# LIVE FILE MONITORS - IMPLEMENTATION DESIGN (D3, CAN-7, wave 3)

Date: 2026-10-20 Status: implementation design, the byte-ready spec that the CODER (C3) executes
Prepared by: the DESIGN lane D3 (cloudflare-workers-ai / @cf/deepseek-ai/ deepseek-v4-flash-0731 /
max) Base: Documentation/Archive/Live-Containers/Requirements/08-LIVE-FILE-MONITORS.md (R3, the
durable requirement, read in full: 338 lines, all 10 consideration points + the M1-M7 gap list + the
10 acceptance criteria + the D3-DESIGN-BRIEF) + Documentation/Archive/Live-Containers/Design/
IMPLEMENTATION-DESIGN.md (D2, the wave-1+2 design: the marker grammars, the listener set, the config
schema, the jobs integration, the failsafe engine, which the monitors EXTEND) + the wave-2
requirement files as needed (01 section 12 is HARD, the I1 binding constraints; 07 section 5) + the
C2-SHIPPED package (Classic/packages/hook-dsh-live-containers/Source/** read in full: Apply.ts,
Jobs.ts, Policy.ts, Board.ts, Detach.ts, Render.ts, Failsafe.ts, Plant.ts, Clock.ts, Config.ts,
DefaultBlocks.ts, the Interface trio, the SCHEME, the Harness) + the P5 storage machinery of the
factory (plugin-dsh-factory Source/Function/{Open,Journal,Attach,State,Wire,Write}.ts, read in
full). Scope: ONE package and no fork, because the monitors are the WAVE-3 PHASE of
Classic/packages/hook-dsh-live-containers (the phase order of section 9.1 in
IMPLEMENTATION-DESIGN.md governs, and the ETS twin mirrors after the Classic acceptance per the 1.1
split discipline of D2). Deliverable: THIS file (the single write, because everything else was
read-only).

---

## 0. THE DECISIONS AT A GLANCE

1. M5 (the storage schema): a NEW storage domain `live_containers_monitors` (name/version/layout
   per-record/invalidRecords backup-and-skip, with ONE table `checks`) and NOT extension records in
   the shared `package_governance` domain, because the v2 open contract (factory Open.ts header: "a
   NEW event name requires a new domain version") makes extension records impossible WITHOUT a bump
   of the shared domain to v3. The blast radius of a v3 bump is the whole governance family, the
   single-layout parser enforces EXACT version equality, and EVERY open of a module would hard-fail
   `version-mismatch` on the v2-stamped files. A new domain name has NO collision (the harness
   enforces ONE open per domain NAME), and the plugin owns its record schema (section 1).
2. The check producer is the SHIPPED G2 wrapper (Jobs.ts `Start`) with ONE wrapper and TWO callers,
   the detach path and the monitor path. The monitor path passes a SYNTHETIC exec (a plugin-owned
   call id, the enrolled session) and the substituted command with workdir = dirname(path), and the
   12.2 inheritance is literal: the same governed path (shell.resolve/execute +
   sandboxPolicy.resolve), checkTimeoutMs <= INLINE_DEADLINE_MS (120000, validated at load), the
   ring caps + outputLimitBytes 2048, and the own deadline scan of the plugin kills overdue monitor
   jobs with the reason "monitor-deadline" and NEVER a subprocess force-kill (section 4).
3. NO REAL TIMERS in the monitor engine: the debounce and the slow schedule are clock-based PENDING
   records evaluated at CHECKPOINTS (fs/observed, jobs events, assemble passes, the tool surfaces)
   per the deadline-scan pattern of D2 (Board.ScanDeadlines). The control-loop sample time is
   documented (section 3.5 + section 5.4) as debounceMs -> admission wait -> the job -> the next
   request, and the smokes drive EVERY timing transition with the fake clock and NEVER with sleeps.
4. The band grammar is a CONTRACT (section 6, byte-exact): the indicator glyphs `\u2204` / `\u2205`
   are written in source as escapes and rendered as the characters, `!` marks a problem, `~` a stale
   band, `x` infrastructure, the STALE declarations are byte-exact, and the summary band arithmetic
   is provable. The parenthetical and trailing counts of the R3 example were internally loose, so
   the pinned form is self-consistent and the smoke asserts the sum.
5. The KV-cache honesty: the monitors stanza is stable-until-event, and its text changes ONLY on
   enrollment, settle, the fs/observed version bump, the retirement, and the mount recovery. It
   NEVER changes on the clock and NEVER per request (NO relative ages anywhere in the stanza, and
   the check time is HH:MM:SS) (section 5.2).
6. The honesty cluster is HARD (R3 points 1, 2, 7): `\u2204` renders ONLY from an observed settle
   with exit 0 of the exact check set for the exact version (checkedVersion == lastVersion,
   provenance live). EVERY listener path is fail-open, and the linked-governance check NEVER
   produces `\u2204`: it renders the `\u2205` form with the observed version facts, because a
   fabricated governance verdict is a false pass (section 6.2 + 4.4).
7. The IDLE-forever posture: `monitors: "off"` is the default even when the plugin is enabled, and
   the stanza renders NOTHING until monitors are on AND at least ONE file is enrolled. With monitors
   off the section body is byte-identical with the wave-2 behavior (the phase-1 + wave-2 smokes pass
   with ZERO assertion changes) (section 2 + 5.1).
8. The plantType synergy: a NEW plantType "monitors" on the EXISTING live_plant tool, with the
   existing report grammar gaining the "monitored" status and NO new seam. The board rows of the
   parent are fed by the L6 settle truth (the monitor jobs of the member) and the [live-report]
   monitored fold, and Board.OnSettled gains ONE guard so that a monitor settle of a member NEVER
   flips the TASK row of the member (section 8).
9. The module split: Monitors.ts (the engine), Watchlist.ts (the classification), Band.ts (the
   byte-exact renderer), Storage.ts (the P5-style domain open + recovery), MonitorTools.ts (the two
   tools), Variable/DefaultCheckSets.ts (the shipped catalog, data and NOT code), plus the additive
   Apply/Config/State/Events edits (section 10).
10. The wave-3 phase is STRICTLY SEQUENTIAL after the wave-2 acceptance of C2 (the 9.1 collision
    rule of D2). The edits of C3 are additive ONLY, and the phase-1 and wave-2 smokes pass with ZERO
    assertion changes (section 16).

---

## 1. THE M5 DECISION - THE STORAGE SCHEMA (resolved first, per the brief)

DECISION: a NEW storage domain, name `live_containers_monitors`, version 1, layout "per-record",
invalidRecords "backup-and-skip", with ONE table `checks`. The plugin opens it itself (its own
P5-style effect), because Open.ts of the factory is hardwired to `package_governance` and cannot be
reused for a second domain.

WHY NOT extension records in an existing domain (the rejected alternative):

- The v2 open contract (factory Open.ts header, verbatim) says "a NEW event name requires a new
  domain version", and the events table of the shared domain carries a FIXED enum (activated,
  governed, dispatched, update-failed, excluded, normalized). The monitor vocabulary
  (monitor-enrolled, monitor-check, monitor-retired) is a new enum, and a new enum means a new
  domain version, so the shared domain would bump to v3. The single-layout parser enforces EXACT
  version equality, so EVERY module of the governance family would hard-fail `version-mismatch` on
  the v2-stamped files until a coordinated migration lands, and ONE feature cannot carry that blast
  radius.
- The shared record shape { event, path, detail, at } cannot carry the version-keyed check results
  (checkedVersion, exit, tail, provenance), and JSON-in-detail is fragile, while the state shape of
  point 4 in the D3-DESIGN-BRIEF demands structured fields. WHY a new domain is safe: the harness
  storageDomain enforces ONE open per domain NAME (the live single-open-domain finding), so a
  different name means NO collision with `package_governance`, NO cross-module coupling, and the
  plugin owns its schema. The open is best-effort and detached exactly like the P5 arm of the
  factory (Attach.ts), an ABSENT facility is a SILENT SKIP (State.MonitorsPersist = false, and after
  a restart the bands degrade to `not run yet` per the scenario 6 honesty of R3), and a PRESENT
  facility whose open fails is LOUD (ONE best-effort ledger line
  `monitors storage open failed: <reason>` per the P5 v2 incident posture, NEVER rethrown).

THE OPEN MECHANICS (Function/Storage.ts):

1. probe ctx.get("storageDomain") once inside a ctx.effect (the shape of the factory Attach P5 arm,
   registered from Apply of the plugin, with the disposer closing the handle).
2. when present: dynamic-import @deepseek-ai/dsh-storage-domain + zod (the dynamic-import pattern of
   Open.ts, so the optional packages stay OFF the module-load path while the type-only devDeps pin
   them to the host-era versions), then facility.open(defineDomain({ name:
   "live_containers_monitors", version: 1, layout: "per-record", invalidRecords: "backup-and-skip",
   tables: { checks: domainTable( Zod.object({...})) } })).
3. on success: bind State.MonitorsJournal (the sink, in the factory Sink shape:
   put(`${Date.now()}-${Seq++}`, record) best-effort), drain the OWN pre-bind buffer of the plugin
   (State.MonitorsQueue, capped 256 exactly like the factory Queue, because "the boot-window buffer
   already exists - use it" in the R3 brief means the PATTERN: the factory-level PendingJournal
   belongs to the shared domain, and the monitor domain needs its own capped buffer drained on THIS
   open), and set State.MonitorsPersist = true.
4. absent facility: silent skip, State.MonitorsQueue.length = 0, State.MonitorsJournal = no-op (the
   Attach silent-skip posture).
5. open failure: the loud ledger line and the same degradation (best-effort, never on any caller
   path).

THE RECORD SCHEMA (the zod object of the `checks` table):

    {
    	event: Zod.enum(["monitor-enrolled", "monitor-check", "monitor-retired"]),
    	path: Zod.string(),
    	agent: Zod.string(),
    	version: Zod.string(),        // the raw fs/observed version token, verbatim
    	writer: Zod.string(),         // the writer agent id ("-" when absent)
    	checkSetId: Zod.string(),     // "" for the enrolled/retired records
    	ranAt: Zod.number(),          // the clock ms
    	exit: Zod.number().nullable(),// null = no exit (infra/killed/denied/linked)
    	infra: Zod.string().nullable(),// "killed:<reason>" | "sandbox" | "producer:<detail>" | "linked" | null
    	tail: Zod.string(),           // the bounded tail (<= 2 KiB), embedded
    	provenance: Zod.enum(["live", "recovered"]), // always "live" when persisted
    }

The `tailRef` field of the state shape in the D3-DESIGN-BRIEF is the EMBEDDED bounded tail, because
the reference semantics equal the persisted capture. The ring is owner-fenced (a host plugin cannot
readAt an owned job), so the ONLY restart-surviving render source is the persisted tail itself, and
the 2 KiB cap makes embedding cheap and honest.

THE WRITE CADENCE (best-effort, NEVER on a caller path): ONE monitor-enrolled record at enrollment,
ONE monitor-check record per settle, and ONE monitor-retired record at retirement. The records are
the DURABLE truth, and the human ledger stays the complete record (the P5 posture).

THE RECOVERY (on mount, ONCE): the plugin loads the newest monitor-check record per (path, agent)
when the facility exposes a read surface (the exact read/list surface of dsh-storage-domain is
verified IN PLACE at the C3 dispatch, per the dispatch-time checks list of the C3 brief). The loaded
entries rebuild the monitor set with their checks stamped provenance "recovered", and the enrolled
records rebuild the enrollment, so a file enrolled before the restart stays enrolled. When the read
surface is absent or fails there is NO recovery and the bands render `not run yet` (the scenario 6
honesty of R3, NEVER a fabricated clean). The recovery runs ONCE, before the FIRST band render, and
the ledger prints `monitor recovered <path> (<n> checks)` per loaded entry.

---

## 2. THE CONFIG SURFACE (the wave-3 knobs, all volatile)

The Config.ts discipline of wave 2 continues: EVERY knob is a volatile cell (the P10 in-place
refresh, where a flip lands on the next assembly). The wave-3 fields are APPENDED to the existing
schema and the phase-1/wave-2 cells stay untouched, and the `monitors` knob is the SECOND explicit
flip after the own `enabled` of the plugin (R3 acceptance 9, the CAN-4 posture).

    monitors: "off" | "on", default "off"       (the IDLE-forever posture)
    watchlist: array of { glob, checks }, default [] (EMPTY - enroll-on-write
    	only, no scan, no watch-all; the ARRAY is the volatile cell, its leaves
    	plain - the schemastery rule; the leaves: glob string required,
    	checks array of strings default [])
    checksets: dict name -> check-set spec, default DefaultCheckSets
    	(the shipped catalog from Variable/DefaultCheckSets.ts - data, not
    	code; the dict cell volatile; see section 3.2 for the spec shape)
    monitor: object volatile, leaves:
    	debounceMs: number, default 1500         (the fast-check window)
    	maxMonitors: number, default 8           (the band cap; overflow collapses)
    	maxMonitorJobs: number, default 3        (the concurrent-job admission cap)
    	retireMs: number, default 600000         (the withdrawal window)
    	staleMs: number, default 300000          (the recovered-time-stale window)
    	slowCheckIntervalMs: number, default 0   (0 = the slow schedule off)
    	bandCapBytes: number, default 2048       (the per-band render cap)
    	checkTimeoutMs: number, default 120000   (the check deadline; MUST be
    		<= the inline deadline 120000 - the 12.2 composition contract,
    		validated at load, never configurable above it)
    	linkageAlertVersions: number, default 3  (the SEVERE extension knob;
    		0 = off)
    	dedupWindowMs: number, default 30000     (the SEVERE extension knob
    		(the monitor-aware dedup note window); 0 = off)

THE VALIDATION (appended to Validate of Apply, fail-loud): monitors in ["off", "on"]; watchlist
entries with a glob that is a non-empty string and checks that are an array of strings; EVERY
watchlist check name must exist in the effective checksets (unknown names FAIL LOUD at load);
checksets entries with a command that is a non-empty string when link is absent, link ONE of "none"
| "governance" when present, fast boolean, intervalMs number >= 0; monitor.debounceMs >= 1;
monitor.maxMonitors >= 1; monitor.maxMonitorJobs >= 1; monitor.retireMs >= 1; monitor.staleMs >= 1;
monitor.bandCapBytes >= 256; monitor.checkTimeoutMs >= 1000 and <= 120000 (INLINE_DEADLINE_MS, the
12.2 deadlines rule, and the SCHEME documents the composition contract like the wave-2
liveTimeoutMs).

THE STATE DERIVATION (Apply, appended): State.Monitors = Map<agentId, Map<pathKey, MonitorEntry>>
(the per-agent monitor set); State.MonitorJobs = Map<jobId, { agentId, path, setId }> (the live
monitor jobs, read by the settle fold, the board skip guard, and the deadline scan);
State.MonitorSessions = Map<agentId, unknown> (the enrolled session for the sandbox policy
resolution of the check jobs, captured at the observed events); State.MonitorOptOuts = Map<agentId,
string[]> (the per-glob opt-outs); State.MonitorSlowLast = Map<agentId, Map<pathKey, Map<setId,
number>>> (the last-run stamps of the slow schedule); State.MonitorCallSeq = number (the synthetic
call-id counter); State.MonitorsQueue + State.MonitorsJournal + State.MonitorsPersist (section 1).

---

## 3. THE MONITOR ENGINE

### 3.1 The fs/observed listener (L11 - the enrollment + the version truth)

Registered through Wire of the factory (the governor precedent, Apply.ts:86-88):
`Factory.Wire(Context, State, (Target, Observation, Actor) => Monitors.OnObserved(State, Target, Observation, Actor))`.
That is a ROOT-context listener (Wire.ts:39 `Context.root.on("fs/observed", Observe)`), so EVERY
write that the harness emits is heard: the built-in write/edit tools', the family's
raw-write/normalize-file's, and the own emits of the factory (Write.ts:149-157:
`{ kind: "present", version: Outcome.version }`) plus the Refresh re-emits (Refresh.ts:26).

OnObserved (a pure observer, fail-open, NEVER throwing into the fs/observed dispatch):

1. if !State.On or monitors === "off": return.
2. read the target (the displayPath is the band label and the targetKey is the state key), the
   observation { kind: "present", version }, and the actor (the writing exec, where the writer =
   actor?.agent?.id and "-" when absent).
3. the version bookkeeping: the entry (if enrolled) updates lastVersion = version, lastWriter =
   writer, and lastObservedAt = now.
4. the enrollment: when the target matches a watchlist glob (the effective classification of section
   3.2), the entry enrolls (or refreshes) with the check sets of the entry, and the ledger gets
   `monitor enrolled <path> (by <writer>)` on a fresh enrollment. A file that matches NOTHING and is
   not enrolled is NEVER monitored (NO scan, NO watch-all, the 3.1 rule of R3).
5. the fast-check scheduling: for EACH FAST check set of the entry, set the pending record { since:
   now }, where an existing pending record is OVERWRITTEN by the coalescing: ONLY the newest pending
   run survives, with ONE pending per (path, checkSet). The slow sets NEVER auto-run per edit (the 3
   taxonomy of R3).
6. the checkpoint scan (section 3.4) runs after the bookkeeping, so an edit whose debounce already
   elapsed dispatches immediately.

### 3.2 The classification (Watchlist.ts - config and data, never code)

The effective check sets of a path:

1. the WATCHLIST entries whose glob matches the path (the config override), where the MOST-SPECIFIC
   glob wins (the longest pattern) and ties go to the later entry. The glob matcher is a small
   self-contained converter in Watchlist.ts (the self-contained precedent of Policy.ts): `*` within
   a segment, `**` across segments, `?` a single char, and a malformed glob matches NOTHING
   (fail-open).
2. when NO watchlist entry matches: the DEFAULT CATALOG globs, where EACH shipped check set declares
   the glob it applies to (tsc/format -> "**/\*.ts", cargo -> "**/Cargo.toml", governance ->
   "**/package.json"). This is the classification that the EXPLICIT enrollment path (live_monitor
   <path>) uses when the watchlist is empty, so the escape hatch of the model works out of the box
   while the automatic enrollment stays watchlist-gated.
3. NO match anywhere: the effective set is [], the band renders the `checks: none` form (section
   6.1), and NOTHING ever runs (honest, because with NO checks NO verification is claimed).

The check-set catalog (Variable/DefaultCheckSets.ts, DATA and NOT code, the same shape that the
`checksets` config cell holds):

    tsc:   { glob: "**/*.ts",       command: "tsc --noEmit {{path}}",          fast: true }
    format:{ glob: "**/*.ts",       command: "npx prettier --check {{path}}",  fast: true }
    cargo: { glob: "**/Cargo.toml", command: "cargo check",                    fast: false, intervalMs: 0 }
    governance: { glob: "**/package.json", link: "governance",                 fast: false }

The command is a TEMPLATE with the substitution tokens {{path}} (the absolute display path),
{{basename}}, and {{dir}} (the dirname), rendered by a Render.ts-style replace ONLY and NO eval. An
unresolved token renders literally plus the ledger line `render unknown <id> <token>` (the Render
discipline reused). The `link: "governance"` set carries NO command, so the band renders the linked
form (section 6.1) and the plugin NEVER re-runs npm (the 3.2 rule of R3: the own verbs of the
governor and pinner are not duplicated). An unknown check-set name at classification time skips that
set plus the ledger line `monitor check unknown <setId>` (runtime fail-open, because the load-time
validation already failed loud for configured names).

### 3.3 The debounce + the coalescing (the checkpoint design)

THE PENDING RECORD: per (path, checkSet) in the entry: { since }, the clock ms of the latest
scheduling edit. The pending is plugin state and is NEVER rendered (the not-run-yet form of the band
does not change when a check is pending, which is the KV stability).

THE CHECKPOINTS (the only dispatch moments, with NO real timers, per the D2 Board.ScanDeadlines
pattern): (a) EVERY fs/observed event, (b) EVERY jobs event, (c) EVERY assemble pass, (d) the tool
surfaces (live_monitor_check).

THE SCAN (Monitors.Scan, called at EVERY checkpoint, fail-open):

1. the DEBOUNCE dispatch: for EACH entry and EACH pending (setId, since), when Clock() - since >=
   debounceMs, dispatch the check (section 4) and DELETE the pending record, because the run IS the
   coalesced run and the newest pending survived. When the admission is full (live monitor jobs >=
   maxMonitorJobs), the pending record STAYS (coalesce-not-queue, the CAN-1 admission posture) and
   its `since` is NOT bumped, so it retries at the next checkpoint when admission frees.
2. the DEADLINE scan: for EACH live monitor job, when Clock() >= startedAt + checkTimeoutMs, call
   ctx.jobs.kill(jobId, agentId, "monitor-deadline") (the kill of the registry and NEVER a
   subprocess force-kill by the own code of the plugin), and the settle then records infra
   "killed:monitor-deadline".
3. the SLOW schedule: when slowCheckIntervalMs > 0, per (path, slow setId), when Clock() -
   lastRan >= intervalMs, dispatch (admission-guarded like the debounce, with the lastRan stamp
   advanced at the dispatch). The schedule runs ONLY at the assemble-pass checkpoint, because the
   slow cadence is request-aligned (the 3 rule of R3: "ONE job per slow check set per interval").
4. the RETIREMENT scan (the assemble-pass checkpoint only): an entry whose Clock() -
   lastObservedAt >= retireMs renders ONE closing line (section 6.1) at the NEXT assembly and then
   withdraws (removed from the render set, with the persisted history staying in the domain and the
   ledger line `monitor retired <path>`). The closing line renders at most ONCE.

THE CONTROL-LOOP LATENCY (the point 10 framing of R3, documented): the sample time of the loop =
debounceMs (the coalescing window) + the admission wait (the checkpoint cadence, where the next
event is the bound) + the check run + the assemble pass of the next request. The model edits, the
check runs between turns, and the band flips at the next request, which is the documented latency
story of the design with NO machinery beyond sections 3-4.

### 3.4 The retirement + the overflow

- retireMs (600000): section 3.3 step 4. The retirement clock starts at the enrollment (the
  enrollment counts as a touch) and EVERY fs/observed event resets it, so a band whose file was
  NEVER touched retires after retireMs, because standing blocks must not outlive their truth (the
  3.5 discipline of R3). The model re-enrolls when it cares.
- maxMonitors (8): the stanza renders the FULL bands of the NEWEST maxMonitors files (ordered by
  lastObservedAt DESC per the scenario 2 of R3, "ordered by last-change"), and the older files
  render the ONE-line collapsed forms (section 6.1) and are NEVER silently dropped. The ledger line
  `monitors overflow <n>` fires when the overflowed count CHANGES (the quiet-ledger discipline), and
  the summary band counts ALL enrolled files, the collapsed ones included.

### 3.5 The state shape (point 4 of the D3-DESIGN-BRIEF, verbatim shape)

    interface MonitorEntry {
    	path: string;                 // the displayPath (the band label)
    	pathKey: string;              // the targetKey (the state key)
    	agentId: string;              // the owning session
    	enrolledAt: number;
    	lastVersion: string | undefined;    // the latest observed version token (verbatim)
    	lastWriter: string | undefined;     // the latest observed writer ("-" when absent)
    	lastObservedAt: number | undefined; // the latest fs/observed touch
    	pending: Map<string, { since: number }>;  // per checkSetId
    	checks: CheckResult[];        // one per settle, newest last, per set
    }

    interface CheckResult {
    	setId: string;
    	jobId: string;                // the registry id (the job_output hint)
    	ranAt: number;                // the settle observation (clock ms)
    	checkedVersion: string;       // the version at dispatch (verbatim)
    	writer: string;               // the writer of the checked version
    	exit: number | null;
    	infra: "killed:<reason>" | "sandbox" | "producer:<detail>" | "linked" | null;
    	tail: string;                 // the bounded head-tail (<= 2 KiB)
    	provenance: "live" | "recovered";
    }

STALENESS IS DERIVED AT RENDER TIME and NEVER stored (point 4 of the brief): a check is
version-stale when checkedVersion != the lastVersion of the entry, with the raw tokens compared and
NEVER parsed (the capability rule of the family), and a recovered check is time-stale when ranAt <
now - staleMs. The STALE declaration is computed per check at render (section 6.2). The state is
per-agent, which gives the multi-agent view: a parent and a child monitor the same file
independently (scenario 7 of R3).

---

## 4. THE CHECK RUNNER (the G2 reuse + the I1 constraints + the fail-open)

### 4.1 The dispatch (Monitors.Dispatch - the ONE producer path)

The check job is started through the SHIPPED G2 wrapper (Jobs.ts `Start`), because point 6 of the R3
brief ("ONE wrapper, TWO callers") is literal and there is NO second execution path. The monitor
caller:

    Jobs.Start(Agent, AgentId, {
    	command: <the substituted check-set command>,
    	workdir: dirname(path),
    	timeoutMs: min(checkSet.timeoutMs ?? State.Monitor.checkTimeoutMs,
    		INLINE_DEADLINE_MS),
    }, {
    	callId: `monitor-<seq>`,       // the synthetic call id (State.MonitorCallSeq++)
    	rootCallId: `monitor-<seq>`,
    	agent: { id: AgentId, session: State.MonitorSessions.get(AgentId) },
    })

The G2 wrapper resolves the spec AT START: workingDirectory.ensure(agent), shellEnv.collect,
sandboxPolicy.resolve({ session }), shell.resolve({ onExpiry: "none" }), which is the SAME governed
path with the sandbox policy UNMODIFIED (the 12.2.1 rule: detachment NEVER buys weaker isolation).
The job spec is kind "monitor", label `monitor <setId> <path>` (FIRST 80 bytes), outputLimitBytes
2048, and output = the pull sources + the private tail (the SAME JobTail).

THE TAIL is the additive head mode of JobTail: the detach path keeps the newest-2KiB-per-channel
capture (unchanged, so the phase-2 assertions never weaken), and the monitor path uses the head mode
(a constructor flag) where the append keeps the FIRST cap bytes per channel and the render cuts the
combined stdout + [stderr] head to 2 KiB from the END so the earliest bytes survive. The reason is
that a problem band's diagnostic HEAD is what tells the model which edit to revert (the scenario 5
of R3, "first lines of the stderr tail"). ONE wrapper, ONE tail class, two modes.

THE VERSION CAPTURE: checkedVersion = the lastVersion of the entry AT DISPATCH, which is the version
the check runs against. A settle whose checkedVersion != the lastVersion of the entry AT SETTLE
renders STALE (an edit landed while the check ran), which is the exact-version rule.

### 4.2 The settle fold (Monitors.OnSettled - the L6 dispatch)

The existing L6 subscription (Apply.ts:678-708) dispatches the settled events, and the wave-3
addition is that `Monitors.OnSettled(State, Event, Append)` runs BEFORE Board.OnSettled, because the
monitors claim their jobs FIRST:

1. the job id of the event must be in State.MonitorJobs (the own registry of the plugin, because
   NOTHING else is folded), and the record is deleted after the fold.
2. the outcome mapping (the detail of the D2 Producer.Outcome is the source):
    - cause "producer", job.status "completed": parse the detail `exit code: <n>` (the own format of
      the producer, /^exit code: (\d+)$/) -> exit = n. exit 0 -> the clean outcome; exit != 0 -> the
      problem outcome (the tail from the captured head-tail).
    - cause "producer", job.status "killed" or "failed" with the detail carrying the sandbox-denial
      marker -> infra "sandbox" (the band renders `check denied (sandbox)`, and the J3-style fixture
      pins the denial detail that the fake shell returns).
    - cause "producer", job.status "killed"/"failed" otherwise -> infra "producer:<detail>".
    - cause "kill": infra "killed:<the reason from the view's detail, else the cause>" (the deadline
      kill -> "killed:monitor-deadline").
    - cause "teardown": the owner session died, so the check is NOT recorded, the ledger gets
      `monitor check lost <path> <setId> (teardown)`, and the band keeps the last-known result.
3. the record: the CheckResult pushes onto the checks of the entry (per set, where the newest per
   set wins the render), the monitor-check record persists (section 1), and the ledger gets
   `monitor check settled <path> <setId> (<job-id>, exit <n>)` (the exit 0 form is `exit 0`).
4. the summary/band change is an EVENT, and the next request renders the new state (the KV honesty,
   section 5.2).

### 4.3 The fail-open envelope (point 7 of R3, HARD)

- a dispatch start failure (admission/preflight): the ledger gets
  `monitor check failed <path> <setId> (start)`, the pending record DROPS (the check was attempted),
  and the band keeps its LAST-KNOWN result and, because the version moved (that is why the check was
  pending), renders the STALE form at the next request (R3 7: "the band renders last-known +
  stale"). NO last-known -> `not run yet`.
- a settle with infra: the x/denied forms (section 6.1), and the plugin NEVER renders a problem that
  came from its own plumbing as a code problem (scenario 5 of R3).
- the renderer failure: the stanza skips plus the ledger line `monitors render failed -> skipped`,
  and the assembly still resolves.
- EVERY listener path: next()-first where the event is a waterfall, try/catch, and NEVER a throw
  into any dispatch (the family discipline).

---

## 5. THE ASSEMBLE INTEGRATION

### 5.1 The stanza placement (one section, two stanzas)

The wave-2 WaveAssemble (Apply.ts:236-278) composes the section parts (boards, suggestions, drift),
and the wave-3 addition is that `Monitors.SectionParts(Agent, AgentId, Separator, Append)` returns
ONE part (the whole monitors stanza: header + summary band + the file bands, in the mandated order
with the summary band FIRST inside the stanza). The parts order in the section is boards, MONITORS,
suggestions, drift. The stanza renders when monitors are on AND at least ONE file is enrolled (or a
retirement line is due), and with monitors off or zero enrolled the section body is BYTE-IDENTICAL
with the wave-2 behavior (the phase-1 + wave-2 smokes pass with ZERO assertion changes).

WHY ONE part: the section-level collapse (Failsafe.Collapse) collapses the OLDEST parts and NEVER
the LAST, so a per-band parts order would either lose the summary band (when the header part is the
oldest) or violate the "summary band first" mandate (when the header part is last). The stanza
atomically bounds itself (section 5.3), and the section collapse treats it as ONE unit (the ledger
line `failsafe section-collapse`).

### 5.2 The KV-cache honesty (stable-until-event, point 8 of the brief)

The text of the stanza changes ONLY on these events:

1. ENROLLMENT (a band appears and the summary count grows).
2. SETTLE (a check lands: the outcome line of the band + the summary counts).
3. THE VERSION BUMP (an fs/observed event on an enrolled file: the band flips to the STALE form at
   the next request WITHOUT a re-run, per acceptance 2 of R3).
4. THE RETIREMENT (the closing line renders once and the band then disappears).
5. THE MOUNT RECOVERY (the recovered entries render once at the first post-mount assembly).

Between two events the stanza renders BYTE-IDENTICAL text: the check time is HH:MM:SS with NO
relative ages anywhere, because a "3s ago" would churn the cache per request. The band ORDER (by
lastObservedAt) changes only when an observed event lands, the pending/debounce state is NEVER
rendered, and the summary arithmetic is event-driven. The retirement is the ONE clock-driven text
change, a terminal one-time change (the mutation set of point 8 in the R3 brief + this documented
exception).

### 5.3 The token budget (point 4 of R3)

- the per-band cap: bandCapBytes (2048), where the band composer truncates the tail first (the tail
  is already 2 KiB-capped) and then the oldest set-lines to fit, with the ledger line
  `monitor band truncated <path> (<kept> bytes)` when it cuts.
- the stanza cap: the stanza is bounded by maxMonitors (the overflow collapse, section 3.4) and
  participates in the section budget (sectionBudgetBytes 4096, the wave-2 collapse pass, where the
  stanza is ONE part).
- the summary band is ONE line (section 6.1), always rendered and never collapsed.

### 5.4 The per-request recompute + the sample time

The stanza recomputes per assemble pass from the per-agent monitor state (the L1 waterfall append,
the standing-section class, the recompute seam of R3 2). The control-loop framing (point 10 of R3):
the monitor section IS the observable state vector of the system, the edits of the model are the
control inputs, the checks are the observers, and the loop closes per request. The sample time is
documented in section 3.3.

---

## 6. THE BAND GRAMMAR (byte-exact - the C3 implements to these bytes)

THE GLYPHS (point 2 of R3, written in source as escapes and rendered as the characters): `\u2204`
(U+2204 THERE DOES NOT EXIST) for clean; `!` for problem; `\u2205` (U+2205 EMPTY SET) for
not-run-yet; `~` for stale; `x` for infrastructure. The escaped forms are the ONLY source
representation (the escape discipline of the family), and the rendered section carries the
characters.

### 6.1 The stanza + the bands

THE STANZA (the header + the summary band FIRST + one frame per enrolled file):

    --- MONITORS (file checks; not harness state) ---
    monitors: <total> (\u2204<clean> !<problem> ~<stale> \u2205<pending> x<infra>) - <problem> problem, <stale> stale, <pending> not run, <infra> infra
    <one band frame per enrolled file>
    --- END MONITORS ---

THE SUMMARY BAND arithmetic (pinned, because the parenthetical and trailing counts of the R3 example
were internally loose while the pinned form is provable): EACH enrolled file contributes its PRIMARY
glyph, where the STALE state dominates (the ~ counts the stale bands regardless of the underlying
outcome), then problem (!), then infra (x), then clean (\u2204), then not-run-yet (\u2205); and
<total> = clean + problem + stale + pending + infra. The four counts of the trailing phrase mirror
the parenthetical's, and the smoke asserts the sum.

THE BAND FRAME (one frame per file, with the separator from config, default "---"):

    --- MONITOR <path> ---
    <one line per check set, the PRIMARY (worst-state) line first>
    <the tail block, only when the primary line is a problem>
    --- END MONITOR <path> ---

THE OUTCOME LINES (byte-exact, where <path> is the displayPath, <HH:MM:SS> comes from the
Jobs.StartedAt formatter, <version> is the raw fs/observed token verbatim when <= 12 bytes and
otherwise the first 12 bytes + ".." (the staleness comparison ALWAYS uses the raw tokens and never
the truncated display), <writer> is the writer of the check with "-" when absent, and <n> is the
exit code):

    clean:        clean (\u2204) | checked <HH:MM:SS> v<version> by <writer> | exit 0
    problem:      problem (!) | checked <HH:MM:SS> v<version> by <writer> | exit <n>
    infra:        check failed (infrastructure) (x) | checked <HH:MM:SS> v<version> by <writer> | <detail>
    denied:       check denied (sandbox) (x) | checked <HH:MM:SS> v<version> by <writer>
    linked:       \u2205 (linked governance; no re-run) | observed v<version> by <writer> at <HH:MM:SS>
    not-run-yet:  not run yet (\u2205?) | enrolled <HH:MM:SS> by <writer>
    no-checks:    not run yet (\u2205?) | enrolled <HH:MM:SS> by <writer> | checks: none

THE PROBLEM TAIL BLOCK (after the problem line, from the head-keep capture of section 4.1, with the
stdout head then one [stderr] section in the JobTail render shape and a total <= 2 KiB):

    tail (up to 2 KiB):
    <the captured head>

THE PRIMARY-GLYPH RULE: the PRIMARY state of the file is the worst across its check sets (order:
stale > problem > infra > clean > not-run-yet), the primary line renders FIRST, and the summary
counts the file ONCE by its primary. A stale band keeps its underlying outcome facts, because the
STALE declaration prefixes the line (the 3.6 rule of R3: "render STALE with the persisted facts").

### 6.2 The STALE + the recovered declarations (byte-exact)

The version-stale prefix (the checked version != the current lastVersion):

    ~ STALE (file changed after check) | clean (\u2204) | checked <HH:MM:SS> v<version> by <writer> | exit 0 | now v<current>

The declaration text is the R3 byte `STALE (file changed after check)`, the leading `~` is the stale
glyph, the `| now v<current>` clause appends the current version for honesty, and the underlying
outcome rides after the declaration.

The recovered forms (a check loaded from the domain with provenance "recovered", where the
`(recovered)` marker rides the outcome text and the `not re-checked this session` clause rides every
recovered line):

    recovered-fresh (ranAt >= now - staleMs):
    	clean (\u2204) (recovered) | checked <HH:MM:SS> v<version> by <writer> | exit 0 | not re-checked this session
    recovered-stale (ranAt < now - staleMs):
    	~ STALE (not re-checked this session) | checked <HH:MM:SS> v<version> by <writer> | exit <exit>
    recovered + version-stale (an edit landed after the mount):
    	~ STALE (file changed after check) | clean (\u2204) (recovered) | checked <HH:MM:SS> v<version> by <writer> | exit 0 | now v<current>

THE HONESTY BOUNDS (points 1/2/7 of R3, HARD and acceptance-testable): a `\u2204` renders ONLY when
(a) the settle of the check was observed (cause producer, status completed), (b) the parse produced
exit 0, (c) the set id matches, (d) checkedVersion == the current lastVersion (raw-token equality),
and (e) provenance is "live", with NO synthesis, NO inference, and NO carry-over across versions. A
version bump without a settle NEVER renders `\u2204` (the false-pass guard, tested by injecting a
settle-less bump).

THE RETIREMENT CLOSING LINE (one line, rendered once and then withdrawn):

    --- MONITOR <path> (retired; not touched for <n>s) ---

THE OVERFLOW COLLAPSED FORM (the maxMonitors overflow, one line per overflowed file):

    --- MONITOR <path> (collapsed, <len> bytes) ---

---

## 7. THE PERSISTENCE (the storage domain + the journal) - section 1 owns

the schema and the open mechanics; this section owns the record content.

- monitor-enrolled: { event, path, agent, version (the version at enrollment), writer, checkSetId:
  "", ranAt: enrolledAt, exit: null, infra: null, tail: "", provenance: "live" }.
- monitor-check (per settle): the full CheckResult (the checkedVersion, the exit, the infra, the
  bounded tail, provenance "live", because a persisted result is a valid fact about a version even
  when its backing process is gone, which is exactly why the provenance is per-version per point 9
  of R3).
- monitor-retired: { ..., version: the last version, writer: "", ranAt: the retirement clock, exit:
  null, infra: null, tail: "", provenance: "live" }.

The recovery (section 1): the newest monitor-check record per (path, agent) rebuilds the entry, the
loaded checks stamp provenance "recovered", the band treatment follows section 6.2, and the enrolled
records rebuild the enrollment. Job state itself NEVER resumes (the jobs-local contract, 01 9.10),
while the persisted RESULTS do, because a result whose backing process is gone is still a valid fact
about a version (the exact position of point 9 in R3).

---

## 8. THE PLANT/TYPE SYNERGY (the CAN-2 reuse - point 8 of R3)

THE MECHANICS, with no new seam and the existing Plant/Board machinery:

1. THE plantType registry EXTENDS: "agent-board" | "todo-fill" | "aggregate" | "custom" | "monitors"
   (the BoardState.plantType union, with Board.Frame gaining the monitors branch). The member slots
   of the monitors board are the CHILD AGENTS (the lease applies to them exactly as it does to the
   agent-board's), and its ROWS are the monitored FILES.
2. THE ROW: `[monitored] <path> - <outcome> by <writer>`, the R3 byte, where <outcome> is the
   primary outcome text of the file (`clean (\u2204)` etc.). The rows render from the items of the
   board (the BoardState.items slot, the todo-fill precedent: label = path, state = the primary
   outcome).
3. THE DATA CHANNELS (the two that the boards already use): a. THE L6 SETTLE TRUTH, where the {
   owners: "scope" } subscription of the parent already sees the jobs of the boards' children (the
   verified shape of D2 3.6), so a monitor job settle of a member (kind "monitor", label carrying
   the path) folds into the item of the monitors board for that path through the same OnSettled fold
   and the monitors branch. b. THE REPORT GRAMMAR gains the "monitored" status:
   `[live-report]    <plantId> <agentId> monitored <outcome> <path>` (the outcome word FIRST, ONE of
   clean | problem | stale | not-run | infra | denied, with the path = the rest of the payload so
   paths with spaces parse), and Board.Report folds it into the items of the monitors board (the
   existing Report ledger `report <id> <agentId> (<n> bytes)` covers the fold).
4. THE SKIP GUARD (the ONE additive Board.ts change): Board.OnSettled consults State.MonitorJobs
   FIRST, because a MONITOR settle of a member must NEVER flip the TASK row of the member (a check
   is not a completion). The guard is ONE early-return line and the phase-2 board semantics stay
   unchanged.
5. THE PARENT PLANTS A MONITOR INTO A CHILD'S SCOPE with `live_monitor(path, agent: <childId>)`,
   because the per-agent monitor state of the host plugin is keyed on the agent id, so the
   enrollment lands in the monitor set of the CHILD. The next assemble of the child renders the band
   in the CHILD's section (the per-agent attribution), and the check settles of the child feed the
   monitors board of the parent through channel (a) with NO transport change.

---

## 9. THE ESCAPE HATCH (point 6 of R3)

1. INLINE CHECKS UNDIMINISHED: the monitor layer adds NO tools/pre-execute listener, so the own
   `tsc --noEmit` of the model runs exactly as WITHOUT the plugin (the __await marker of the detach
   transform remains the per-call inline opt-out for the DETACH path, and the monitors NEVER gate or
   deny an edit and NEVER detach a model call). The monitors only OBSERVE writes (the fs/observed
   events), so the 12.1 rule has NO conflict here.
2. THE DEEP CHECK: `live_monitor_check <path>` (section 9.1) runs the full check set ONCE, bypassing
   the debounce, as a ctx.jobs job. The model reads the full ring via job_output (the owner of the
   job is the agent, and the tool returns the job id).
3. THE PER-GLOB OPT-OUT: `live_monitor off <glob>` retires the matching enrolled files (the closing
   line + the ledger line `monitor off <glob>`), and the glob goes into the per-agent opt-outs so a
   later fs/observed event does NOT re-enroll.
4. THE BAND'S JOB HINT: the band of a settled check carries the job id in the ledger, so the
   recovery path of the model for the full output is job_output <job-id> (the marker-side honesty in
   the spirit of 12.2.3).

### 9.1 The tool surfaces (MonitorTools.ts - the defineTool idiom, the

Plant.ts shape; read-only semantics, never a write path)

`live_monitor`: parameters { path (string), off (string), list (boolean), agent (string) }.

- path: enroll (the effective classification, section 3.2), with the ledger line
  `monitor enrolled <path> (by <agent>)` and the output render
  `monitored <path> (<n> checks) - the band renders in the live section.`
- off: the glob opt-out, with the output render `monitor off <glob> - <n> file(s) retired.`
- list: the enrolled files with their primary outcome one-liners, and the output render is those
  lines.
- agent: the target session id (the parent-into-child mechanics of section 8 point 5), defaulting to
  the caller.

`live_monitor_check`: parameters { path (string, required) }.

- the file enrolls if it is not enrolled, ALL its check sets dispatch ONCE (fast + slow, bypassing
  the debounce) admission-guarded, and when the admission is full the pending records are set
  (coalesced) and the tool answers the pending line. The settle updates the band like any check.
- output render (started):
  `[monitor] deep check started <path> (<n> checks) - job_output <job-id> for the full tail.`
- output render (pending):
  `[monitor] deep check pending <path> (<n> checks) - admission full; the band updates when it runs.`

---

## 10. THE STATE SHAPE + THE MODULE SPLIT (the expected modules)

The wave-3 modules are NEW files (the module-leaves discipline), and the existing modules get
ADDITIVE edits only:

    Source/Variable/DefaultCheckSets.ts   (NEW - the shipped catalog, data)
    Source/Function/Watchlist.ts          (NEW - the classification + the
    	glob matcher + the effective-set resolution + the opt-outs)
    Source/Function/Band.ts               (NEW - the stanza + the band +
    	the summary renderers; the outcome mapping table; the byte-exact
    	grammar of section 6)
    Source/Function/Monitors.ts           (NEW - the engine: OnObserved,
    	Scan (debounce/slow/deadline/retire), Dispatch, OnSettled,
    	SectionParts, the enrollment/retirement/overflow bookkeeping)
    Source/Function/Storage.ts            (NEW - the P5-style monitor-domain
    	open + the sink + the pre-bind buffer + the recovery load)
    Source/Function/MonitorTools.ts       (NEW - live_monitor +
    	live_monitor_check)
    Source/Function/Apply.ts              (EDITED - additive: the Validate
    	wave-3 block; the State wave-3 fields; Factory.Wire (L11); the
    	Monitors.OnSettled call in the L6 dispatch (before Board);
    	Monitors.SectionParts in WaveAssemble; the tools registration;
    	the Storage effect)
    Source/Variable/Config.ts             (EDITED - the wave-3 cells appended)
    Source/Interface/State.ts             (EDITED - MonitorEntry/
    	CheckResult fields + the MonitorConfig)
    Source/Interface/Events.ts            (EDITED - the check-set spec type,
    	the JobTail head mode type)
    Source/Interface/Config.ts            (EDITED - the wave-3 config type)
    Library.ts                            (UNCHANGED - the monitors need NO
    	new inject: the fs/observed rides Factory.Wire on the root ctx; the
    	storageDomain is probed via ctx.get - the Attach precedent)
    SCHEME.md / README.md                 (EDITED - the wave-3 sections)
    Source/Test/<the M-series folders>    (NEW - section 12)

---

## 11. THE LEDGER STRINGS (the byte-exact list, `live-containers: ` prefix)

The wave-3 strings are APPENDED to the list of the SCHEME, the phase-1/wave-2 strings stay
untouched, and the smokes assert every line byte-exact:

    monitors enabled (<n> watchlist entries)
    monitor enrolled <path> (by <agent>)
    monitor retired <path>
    monitor check unknown <setId>
    monitor check dispatched <path> <setId> -> <job-id>
    monitor check failed <path> <setId> (start)
    monitor check settled <path> <setId> (<job-id>, exit <n>)
    monitor check lost <path> <setId> (teardown)
    monitors overflow <n>
    monitor band truncated <path> (<kept> bytes)
    monitors render failed -> skipped
    monitors storage open failed: <reason>
    monitor recovered <path> (<n> checks)
    monitor off <glob>
    monitor stale <path> (<reason>)

The extension strings (SEVERE, shipped with the extension gates):

    monitor linkage <path> (<n> versions)
    monitor via <path> <from-path>
    monitor dedup <path> (<job-id>)

The board fold reuses the existing `report <id> <agentId> (<n> bytes)`, the activation of the
monitors needs no new proof line (the own activated line of the plugin is untouched, the phase-1
byte), and the on-state of the monitors is proven by the ledger lines themselves (the first
enrollment or `monitors enabled`).

---

## 12. THE SMOKES PLAN (M7 - the M-series, ADDITIVE)

The family pattern (smoke-writing skill): the suites load the REAL built Target/Library.js against
the fake ctx (the Harness.ts shape: on capture, get serving the REAL factory, logger capture, the
root seam, the `ctx.__hookDshLiveContainersState` probe) and run with
`node Target/Test/ <Folder>/Test.js` standalone AND under Maintain/Run-Smokes.mjs (the
vacuously-green guard, where EACH folder's README declares the PASS count). The phase-1 and wave-2
assertions NEVER weaken, because the monitors default off makes the section byte-identical until
they are enabled.

THE FIXTURES (extending the Harness):

- the FAKE fs/observed trigger: the smoke fires the ROOT listener with fabricated (Target {
  displayPath, targetKey }, { kind: "present", version }, actor) triples, where the actor carries {
  agent: { id, session } } for the writer/session capture;
- the FAKE clock: the existing ClockBox (advance the clock, never sleep), where every timing
  transition (debounce, retire, staleMs, the slow interval, the deadline) is a clock advance + a
  checkpoint call (an assemble pass or a jobs event);
- the FAKE registry: the existing fake (start capture + the controllable settle trigger), where the
  monitor dispatch asserts the EXACT spec (kind "monitor", workdir = dirname(path), timeoutMs <=
  120000, the substituted command, outputLimitBytes 2048);
- the FAKE storage facility: ctx.get("storageDomain") serving the fake open (captures the
  defineDomain spec: name "live_containers_monitors", version 1, per-record, backup-and-skip, the
  checks table) + the put capture + an optional read surface for the recovery tests + the absent and
  the failing variants;
- the VOLATILE FLIPS: the wave-3 cells as { get } references, where the smoke mutates the backing
  object and asserts that the next assembly respects the flip (monitors off -> on, a watchlist entry
  change, debounceMs) without a remount.

THE FOLDERS (the M-series):

1. Monitors-Engine - the enrollment (watchlist-glob fs/observed, the explicit live_monitor path, and
   the never-monitored negative where a write to a non-watchlisted, non-enrolled file creates NO
   band); the classification (watchlist override vs the default catalog globs, where the
   most-specific wins); the debounce coalescing (three edits within 1500ms -> ONE job started after
   the clock crosses the window); the admission coalesce (maxMonitorJobs 1: a second pending stays
   pending while the FIRST is live, with NO second job, and it dispatches at the next checkpoint
   after the settle); the retirement (advance past retireMs -> the closing line ONCE -> withdrawn,
   plus the ledger); the overflow (maxMonitors 8 + 9 files -> the 9th renders the collapsed
   one-liner + `monitors overflow <n>`); the opt-out (live_monitor off retires the matches and a
   later fs/observed event does not re-enroll).
2. Monitors-Band - the R-series byte-identity: EVERY outcome line of section 6.1 byte-exact (the
   \u2204/\u2205 escapes RENDERED, and the smoke asserts the character bytes); the STALE flips (a
   version bump -> `~ STALE (file changed after check)` at the next request with NO re-run, and the
   call log proves zero jobs); the recovered forms (the staleMs time rule + the
   version-stale-after-mount form); the summary arithmetic (the counts sum to the total and the
   primary-glyph rule holds); the token budget (a > 2 KiB tail renders <= bandCapBytes and the
   stanza participates in the section budget); the KV stability (two assemblies with NO event render
   byte-identical stanza text).
3. Monitors-Jobs - the runner: the dispatch through the fake registry with the exact re-dispatch
   spec (the G2 shape, the sandbox policy preserved); the settle mapping (exit 0 -> \u2204 ONLY when
   checkedVersion == lastVersion and provenance live; non-zero -> `problem (!)` with the head-tail;
   killed -> x with the detail; the sandbox-denied detail -> `check denied (sandbox)`); the
   false-pass guard (a settle-less version bump NEVER renders \u2204, the D-series honesty test);
   the deadline kill (advance the clock -> the kill of the registry with reason "monitor-deadline"
   -> the x form); the fail-open (a start throw -> `monitor check failed <path> <setId> (start)` +
   the band last-known + stale; a teardown settle -> `monitor check lost ...` + the band keeps the
   last-known); the teardown path.
4. Monitors-Persist - the storage: the open captures the defineDomain spec byte-exact
   (name/version/layout/invalidRecords/tables); the put records (the enrolled/check/retired shapes);
   the pre-bind buffer (records fired before the open buffer and drain on success); the absent
   facility (silent skip, and after a "restart" the bands render `not run yet` and NEVER a
   fabricated clean); the open failure (the loud ledger line and the degraded sink); the recovery
   (the read surface -> the recovered entries with provenance + the staleMs treatment; the read
   absent -> NO recovery).
5. Monitors-Tools - live_monitor (enroll/off/list/agent, where the per-agent enrollment lands in the
   named session's set); live_monitor_check (the deep path: the full set once, the job id in the
   output text, the band updates on settle, and the admission-full pending form).
6. Monitors-Boards - the plantType "monitors" board: the rows from the monitor settles of the member
   (the `[monitored] <path> - <outcome> by <writer>` byte); the [live-report] monitored fold (the
   outcome-first payload and the path with spaces); the SKIP GUARD (a monitor settle of a member
   does NOT flip the task row of the member, with the phase-2 board semantics intact); the unchanged
   close/withdraw lifecycle.

THE COUNTS: the wave-3 suite is its own counted series (EACH folder's README declares its PASS
count, with the reference being the 180 checks of wave 2 across 8 folders and the M-series targeting
~90-110 checks across 6 folders). The R3 M7's "R-series band renders, D-series
fail-open/honesty/sandbox- denial" maps to the Monitors-Band (R-style byte renders) and the
Monitors-Jobs/Persist (D-style negatives: the false-pass guard, the fail-open paths, the denial
mapping, the honesty of the absent store).

---

## 13. THE DOCS PLAN

README.md (the CAN-7 section, appended, with the phase-1/wave-2 paragraphs untouched): the pitch
(the "files are halted processes" framing, where the monitors put files into OPERATIONAL MODE), the
watchlist/checksets config, the band grammar (the glyphs + the STALE + the recovered forms), the
honesty rules (the `\u2204` bounds, the fail-open, the IDLE-forever posture with monitors: "off"
even when the plugin is enabled), the escape hatch (inline checks + live_monitor_check + off), the
plantType "monitors" one-liner, the ledger strings (the byte-exact contract), the latency paragraph
(the control-loop sample time), and the monitor extensions of the FUTURE section
(SEVERE/COMPREHENSIVE marked clearly).

SCHEME.md: the wave-3 config table (every field, type, default, volatile-or-not, section 2
verbatim), the band grammar (section 6 verbatim, because the coders implement to these bytes), the
ledger-string list (section 11), the smoke battery map (the M-series ids), the seam evidence (the
fs/observed root listener + the version token + the factory Wire + the storage-domain v2 contract +
the G2 reuse, with the harness version pinned), the check-deadline composition contract
(checkTimeoutMs <= the inline deadline, the 12.2 rule), the KV-cache statements (the mutation set of
section 5.2), and the extensions section (SEVERE marked "next after v1 of monitors" and
COMPREHENSIVE marked FUTURE).

The site page: the wave-3 section (the monitors one-liner + the safety framing + the status line
"planned - not yet in the profile").

---

## 14. THE EXTENSIONS (the SEVERE + COMPREHENSIVE designs - specified so

the C3 dispatches with the full picture; the C3 SHIPS NONE of them, because the v1-of-monitors scope
is sections 1-13 and the extensions land after)

SEVERE (next after the monitors' v1):

1. THE LINKAGE ALERTS (R3 7.1): when a problem of a file persists across linkageAlertVersions (3)
   version-bumps (the check results: problem at v, v+1, v+2), the band escalates to channel 4 (the
   model-visible note). The band gains ONE line
   `[live] <path>: problem unchanged across <n> edits - read the tail before the next edit.` plus
   the ledger line `monitor linkage <path> (<n> versions)`, gated on failsafes "on" +
   linkageAlertVersions > 0 and counted against failsafesPerTurn (the CAN-4 posture).
2. THE CROSS-FILE PROBLEM ATTRIBUTION (R3 7.2): config-gated (attrParse: "off" | "on", default
   "off", with the wave-3 config gaining the knob when the extension lands), where a problem tail
   whose FIRST lines match the path of another enrolled file annotates that band with
   `problem via <path>` plus the ledger line `monitor via <path> <from-path>`. Text-level parsing of
   the check tail ONLY.
3. THE CI-PARITY CHECK SET (.live-monitors.json): a project-level config that the USER authors ({
   checksets, watchlist } per project), which the plugin reads READ-ONLY at enrollment (best-effort,
   cached per project root with a TTL, NEVER written, with the read through node:fs per the
   policyFile-reading precedent of the governor).
4. THE MONITOR-AWARE DEDUP (R3 7.4, the ONLY piece touching tools/post-execute and read-only in
   effect): the L2 pre-execute arm records a note-candidate (a model command whose (normalized
   command, cwd) matches a monitor job that SETTLED within dedupWindowMs, keyed on the callId, NEVER
   a deny and NEVER a detach), and the existing L4 post-execute observer appends ONE line to the
   text of the tool result:
   `[monitor] same check ran <n>s ago (<job-id>) - job_output for the tail.` plus the ledger line
   `monitor dedup <path> (<job-id>)`. The decision passes through unchanged, so this is an
   observability note on an inline call and legal under 12.1.

COMPREHENSIVE (the later stage, design notes, FUTURE): 5. THE PROGRAMMABLE MONITORS, where per-glob
`program:` checks run under the caps of section 5 in the v1 research (2s, 16 KiB, NO fs writes, NO
network), so the "wrap the file in a sandbox" of the user is fully realized with the ptc runtime as
the sandbox, an arbitrary program, and the band grammar as the output contract. 6. THE AGGREGATE
HEALTH BLOCK, the `health` kind in the block catalog (Variable/Catalog.ts gains the entry) fed from
the monitor state, giving the session-wide `health: files=23 (\u220421 !2)` gauge. 7. THE GUI
SIDECAR, where the monitor events join the CAN-6.8 JSONL sidecar (live-containers-events.jsonl) as
monitor-enrolled / check-ran / problem-found records for user observability without conversational
presence. 8. THE CROSS-SESSION MONITOR MEMORY, where the history of the persisted bands (problem
counts per file over sessions) surfaces in the provenance line as `problems: 3 this week`, which is
cheap, comes from the domain, and is honest.

---

## 15. THE ACCEPTANCE CRITERIA (R3 section 8, mapped to the smokes)

1. An enrolled .ts edit produces at the next request a band with version, check time, exit, and
   `\u2204` on exit 0, with NO model check command (the Monitors-Band/Jobs smokes assert the call
   log).
2. A second edit before the next request flips the earlier band to `~` STALE at that request WITHOUT
   a re-run, and a later request shows the fresh result (Monitors-Band).
3. A non-zero exit renders `!` with a capped tail, and an infrastructure failure renders `x` and
   NEVER `!` (Monitors-Jobs).
4. EVERY internal error path is fail-open: NO throw reaches fs/observed or assemble in any test, and
   a broken renderer degrades to the ledger (Monitors-Jobs/Band D-series).
5. NO `\u2204` EVER renders WITHOUT a matching observed exit-0 settlement for the current version
   (the false-pass guard, Monitors-Jobs).
6. Restart: the persisted bands reload with their original provenance, an absent domain renders
   `not run yet`, and NOTHING fabricates (Monitors-Persist).
7. The command-only/sandbox rules hold: monitor jobs run through the governed G2 path, a
   sandbox-denied check renders `check denied (sandbox)`, and monitor checks NEVER detach or gate a
   content-mutating tool call (Monitors-Jobs, where the 12.1 no-conflict is structural because the
   monitors add NO tools/pre-execute listener).
8. The token budget: the band is <= 2 KiB and the section is <= 4 KiB with a recorded collapse,
   while the summary band is ONE line (Monitors-Band).
9. The plugin ships disabled, and the monitor layer is a second explicit flip after the own enable
   of the plugin (the Wiring/Defaults assertions).
10. The ledger strings are byte-exact per the SCHEME (the D-series byte-identity assertions over the
    list of section 11).

---

## 16. THE C3 CODER BRIEF + THE PHASE-ORDER ALIGNMENT

### 16.1 The phase order (the collision rule - D2 9.1, extended)

PHASE 1 (A1/A2/A3, shipped): the assemble-side plugin. PHASE 2 (C2, SHIPPED on disk): the wave-2
extension (Policy, Jobs, Detach, Completion, Board, Failsafe, Suggester, Set, Plant, the J/B/F/S
suite, the ETS twin). PHASE 3 (C3, THIS design): the wave-3 monitor layer on the SAME package,
STRICTLY SEQUENTIAL after the wave-2 acceptance is green. The edits of C3 to the existing files are
ADDITIVE ONLY: the Validate block appends, the Config cells append, the State fields append, Apply
appends the registrations (Wire, the L6 fold, the WaveAssemble part, the tools, the storage effect),
and Board gains the ONE skip-guard line. The phase-1 and wave-2 smokes pass with ZERO assertion
changes (the family arbiter law), the new behaviors live in NEW modules (the module-leaves
discipline), and the ETS twin mirrors after the Classic acceptance (the 1.1 discipline of D2, with
the ledger strings byte-identical).

### 16.2 THE C3 CODER BRIEF (self-contained - dispatch after the wave-2

acceptance)

ROLE: implement the wave-3 monitor layer of @playform/hook-dsh-live- containers (the Classic twin
first and the ETS twin after the Classic acceptance) per
Documentation/Archive/Live-Containers/Design/ FILE-MONITORS-DESIGN.md (THIS file, where sections
1-13 are the byte-ready spec) and this brief.

SURFACE: ONLY Classic/packages/hook-dsh-live-containers/** and
EffectTS/packages/ets-hook-dsh-live-containers/** (after the Classic acceptance) + the wave-3
sections of the package README/SCHEME + the wave-3 section of the site page. The C2-shipped wave-2
files are READ FIRST, because the monitors extend them: Source/Function/Apply.ts (the registration
discipline + the L6 dispatch + WaveAssemble), Source/Function/Jobs.ts (the G2 wrapper, where the
check producer REUSES Start and the JobTail head mode is the ONLY Jobs.ts edit),
Source/Function/Board.ts (the skip guard + the "monitors" plantType branch),
Source/Variable/Config.ts (the append-only cells), Source/Function/Plant.ts (the defineTool idiom
for MonitorTools), Source/Function/Policy.ts (INLINE_DEADLINE_MS, the check-deadline cap), and
Source/Function/Storage.ts, which does NOT exist yet, so Open.ts + Attach.ts of the factory are the
reference for the own P5-style open (read
Classic/packages/plugin-dsh-factory/Source/Function/{Open,Attach,Journal, Wire}.ts in place).

DELIVERABLES: the six new modules + Variable/DefaultCheckSets.ts (sections 1-10), the band grammar
implemented to the EXACT bytes of section 6 (the `\u2204`/`\u2205` escapes in source, rendered as
the characters), the ledger strings byte-exact (section 11), the wave-3 config cells + the
validation (section 2), the M-series test folders (section 12, each {Test.ts, README.md} with the
declared PASS count), the wave-3 SCHEME/ README sections (section 13), and the ETS twin mirror
(byte-identical ledger strings). NONE of the section-14 extensions ship in this phase, and the
SEVERE knobs linkageAlertVersions/dedupWindowMs are ACCEPTED in config, defaulted to 0/off, and
inert (the same posture that the wave-2 catalog kinds had in phase 1).

ARBITERS: Maintain/Run-Smokes.mjs all green; the phase-1 + wave-2 suites pass with ZERO assertion
changes; the ledger strings match the SCHEME byte-exactly; NO other package modified.

DISCIPLINES: NEVER run git commands (checks only; report READY-TO-COMMIT); ASCII only (the glyphs as
escapes); tabs only; file content via the write/edit tool API only; NO builds/dev-server/test runs
beyond what the smoke harness performs when the orchestrator runs it; NEVER enable the plugin or the
monitors in the profile; EVERY listener next()-first + fail-open; EVERY ledger line byte-exact; the
storage-domain read surface is verified IN PLACE at dispatch (the app.asar dsh-storage-domain
package, the exact read/list shape of the recovery load, and when the surface differs from the
assumption of the design, implement to the verified surface and report the deviation with ONE line).

REPORT FORMAT: ONE message with the files created/edited per twin, a per-file ONE-line summary, the
exact ledger strings shipped, the smoke results (pass/fail counts per series), and ANY deviation
from this design with a ONE-line reason.

ROUTING TRIPLE: provider cloudflare-workers-ai, model @cf/zai-org/ glm-5.3-flash, reasoningEffort
low (the task-routing law, because C3 is a coding delegation: GLM-5.3-Flash low for the mechanics
pass and then HIGH for the verification pass per the task-routing skill).

### 16.3 The C2 alignment

The shipped code of C2 is the FLOOR: the jobs of the monitors ride the G2 wrapper of C2, the stanza
rides WaveAssemble of C2, the settle of the band rides the L6 subscription of C2, and the skip guard
of the boards is the ONLY behavior edit of a C2 file (ONE early-return line in Board.OnSettled). The
ledger strings and marker grammars of C2 stay byte-untouched, and a mismatch between the shipped
bytes of C2 and the references of this design is a defect to REPORT (the deviation line of the C3
report) and NEVER to paper over (the A3/C2 precedent, D2 9.4).

---

## 17. THE RESIDUALS (the honest edges the design leaves open)

1. THE R3 SCENARIO-4 CROSS-FILE STALENESS: the v1 monitors derive staleness PER FILE (the rule of
   point 4 in the brief, the same-file version comparison, acceptance-tested). The
   Config.ts/State.ts dependency case (a check's truth about a world whose OTHER files moved) is
   served by the per-version provenance (the version stamp of the band is the honest signal) and
   fully solved only by the SEVERE cross-file attribution (config-gated tail parsing). The design
   scopes this explicitly, and the plugin NEVER CLAIMS cross-file staleness that it cannot compute.
2. THE RECOVERY READ SURFACE: the exact read/list shape of dsh-storage-domain is not pinned here,
   because the factory only uses put and the harness tree is not readable from the sandbox of this
   lane. The C3 dispatch verifies it IN PLACE, and the absent or failing read degrades to
   `not run yet` (honesty and NEVER fabrication), so the residual is contained by design.
3. THE VERSION TOKEN SHAPE: the fs/observed version token is opaque (the capability rule of the
   family), the band renders it verbatim with a 12-byte display cap and compares RAW tokens, and a
   future token-shape change cannot break the staleness logic.
4. THE RETIREMENT IS THE ONE CLOCK-DRIVEN TEXT CHANGE: the KV mutation set (section 5.2) plus this
   documented exception, the terminal one-time closing line.
5. THE R3 SUMMARY EXAMPLE'S ARITHMETIC was loose (the parenthetical and trailing counts disagreed),
   so the pinned summary (section 6.1) is self-consistent and provable, and the R3 byte
   `monitors: <n> (...glyphs...) - <n> problem, <n> stale, <n> not run` shell is preserved.
6. THE LINKED-GOVERNANCE BAND NEVER renders `\u2204`, because the plugin has NO seam into the
   verdict of the governor. The honest `\u2205 (linked governance; no re-run)` form with the
   observed version facts is the position of the design, because a fabricated governance verdict
   would violate the hard rule of point 7 in R3.

---

## 18. THE ROUTING + THE LANE NOTES

- This design executed READ-ONLY: the single deliverable is this file (write tool), with NO builds,
  NO dev server, NO test runs, and NO git mutations (checks only, and the whole work reports
  READY-TO-COMMIT when green).
- The normalize hooks are active in the authoring profile, so this document is ASCII-only and
  tabs-only, written through the write tool API, and the indicator glyphs appear ONLY as the
  `\u2204`/`\u2205` escapes.
- The C3 dispatch triple: cloudflare-workers-ai / @cf/zai-org/glm-5.3-flash / low (mechanics pass),
  then high (verification pass) per the task-routing law.

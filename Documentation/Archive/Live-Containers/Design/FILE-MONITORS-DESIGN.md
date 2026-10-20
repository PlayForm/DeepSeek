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

Date: 2026-10-20
Status: implementation design - the byte-ready spec the CODER (C3) executes
Prepared by: the DESIGN lane D3 (cloudflare-workers-ai / @cf/deepseek-ai/
deepseek-v4-flash-0731 / max)
Base: Documentation/Archive/Live-Containers/Requirements/08-LIVE-FILE-MONITORS.md
(R3, the durable requirement - read in full, 338 lines, all 10 consideration
points + the M1-M7 gap list + the 10 acceptance criteria + the
D3-DESIGN-BRIEF) + Documentation/Archive/Live-Containers/Design/
IMPLEMENTATION-DESIGN.md (D2, the wave-1+2 design - the marker grammars, the
listener set, the config schema, the jobs integration, the failsafe engine;
the monitors EXTEND it) + the wave-2 requirement files as needed (01 section
12 is HARD - the I1 binding constraints; 07 section 5) + the C2-SHIPPED
package (Classic/packages/hook-dsh-live-containers/Source/** - read in full:
Apply.ts, Jobs.ts, Policy.ts, Board.ts, Detach.ts, Render.ts, Failsafe.ts,
Plant.ts, Clock.ts, Config.ts, DefaultBlocks.ts, the Interface trio, the
SCHEME, the Harness) + the factory's P5 storage machinery (plugin-dsh-factory
Source/Function/{Open,Journal,Attach,State,Wire,Write}.ts - read in full).
Scope: ONE package, no fork - the monitors are the WAVE-3 PHASE of
Classic/packages/hook-dsh-live-containers (the phase order from D2's
IMPLEMENTATION-DESIGN.md section 9.1 governs; the ETS twin mirrors after the
Classic acceptance, the D2 1.1 split discipline).
Deliverable: THIS file (the single write; everything else was read-only).

---

## 0. THE DECISIONS AT A GLANCE

1. M5 (the storage schema): a NEW storage domain `live_containers_monitors`
   (name/version/layout per-record/invalidRecords backup-and-skip, ONE table
   `checks`) - NOT extension records in the shared `package_governance`
   domain.
   The v2 open contract (factory Open.ts header: "a NEW event name requires
   a new domain version") makes extension records impossible WITHOUT bumping
   the shared domain to v3.
   The blast radius of a v3 bump is the whole governance family.
   The single-layout parser enforces EXACT version equality.
   EVERY module's open would hard-fail `version-mismatch` on the
   v2-stamped files.
   A new domain name has NO collision (the harness enforces ONE open per
   domain NAME).
   The plugin owns its record schema (section 1).
2. The check producer is the SHIPPED G2 wrapper (Jobs.ts `Start`) - ONE
   wrapper, TWO callers: the detach path and the monitor path.
   The monitor path passes a SYNTHETIC exec (a plugin-owned call id, the
   enrolled session) and the substituted command with workdir =
   dirname(path).
   The 12.2 inheritance is literal: the same governed path
   (shell.resolve/execute + sandboxPolicy.resolve), checkTimeoutMs <=
   INLINE_DEADLINE_MS (120000, validated at load), the ring caps +
   outputLimitBytes 2048, and the plugin's OWN deadline scan kills overdue
   monitor jobs (reason "monitor-deadline").
   NEVER a subprocess force-kill (section 4).
3. NO REAL TIMERS in the monitor engine: the debounce and the slow schedule
   are clock-based PENDING records evaluated at CHECKPOINTS (fs/observed,
   jobs events, assemble passes, the tool surfaces) - the D2 deadline-scan
   pattern (Board.ScanDeadlines).
   The control-loop sample time is documented (section 3.5 + section 5.4):
   debounceMs -> admission wait -> the job -> the next request.
   The smokes drive EVERY timing transition with the fake clock, NEVER
   sleeps.
4. The band grammar is a CONTRACT (section 6, byte-exact): the indicator
   glyphs `\u2204` / `\u2205` are written in source as escapes and rendered
   as the characters.
   `!` problem, `~` stale, `x` infrastructure, the STALE declarations
   byte-exact, the summary band arithmetic provable.
   The R3 example's parenthetical/trailing counts were internally loose.
   The pinned form is self-consistent and the smoke asserts the sum.
5. The KV-cache honesty: the monitors stanza is stable-until-event.
   Its text changes ONLY on enrollment, settle, the fs/observed version
   bump, the retirement, and the mount recovery.
   NEVER on the clock, NEVER per request (NO relative ages anywhere in the
   stanza; the check time is HH:MM:SS) (section 5.2).
6. The honesty cluster is HARD (R3 points 1, 2, 7): `\u2204` renders ONLY
   from an observed settle with exit 0 of the exact check set for the exact
   version (checkedVersion == lastVersion, provenance live).
   EVERY listener path is fail-open.
   The linked-governance check NEVER produces `\u2204`.
   It renders the `\u2205` form with the observed version facts - a
   fabricated governance verdict is a false pass (section 6.2 + 4.4).
7. The IDLE-forever posture: `monitors: "off"` default even when the plugin
   is enabled.
   The stanza renders NOTHING until monitors are on AND at least ONE file
   is enrolled.
   With monitors off the section body is byte-identical with the wave-2
   behavior (the phase-1 + wave-2 smokes pass with ZERO assertion changes)
   (section 2 + 5.1).
8. The plantType synergy: a NEW plantType "monitors" on the EXISTING
   live_plant tool + the existing report grammar gains the "monitored"
   status - NO new seam.
   The parent's board rows are fed by the L6 settle truth (the member's
   monitor jobs) and the [live-report] monitored fold.
   The Board.OnSettled gains ONE guard so a member's monitor settle NEVER
   flips the member's TASK row (section 8).
9. The module split: Monitors.ts (the engine), Watchlist.ts (the
   classification), Band.ts (the byte-exact renderer), Storage.ts (the
   P5-style domain open + recovery), MonitorTools.ts (the two tools),
   Variable/DefaultCheckSets.ts (the shipped catalog - data, NOT code),
   plus the additive Apply/Config/State/Events edits (section 10).
10. The wave-3 phase is STRICTLY SEQUENTIAL after C2's wave-2 acceptance
    (the D2 9.1 collision rule).
    C3's edits are additive ONLY.
    The phase-1 and wave-2 smokes pass with ZERO assertion changes
    (section 16).

---

## 1. THE M5 DECISION - THE STORAGE SCHEMA (resolved first, per the brief)

DECISION: a NEW storage domain, name `live_containers_monitors`, version 1,
layout "per-record", invalidRecords "backup-and-skip", ONE table `checks`.
The plugin opens it itself (its own P5-style effect).
The factory's Open.ts is hardwired to `package_governance` and cannot be
reused for a second domain.

WHY NOT extension records in an existing domain (the rejected alternative):
- The v2 open contract (factory Open.ts header, verbatim): "a NEW event name
  requires a new domain version".
  The shared domain's events table carries a FIXED enum (activated, governed,
  dispatched, update-failed, excluded, normalized).
  The monitor vocabulary (monitor-enrolled, monitor-check,
  monitor-retired) is a new enum.
  A new enum -> a new domain version -> the shared domain would bump to v3.
  The single-layout parser enforces EXACT version equality.
  So EVERY module of the governance family would hard-fail
  `version-mismatch` on the v2-stamped files until a coordinated migration
  lands.
  ONE feature cannot carry that blast radius.
- The shared record shape { event, path, detail, at } cannot carry the
  version-keyed check results (checkedVersion, exit, tail, provenance).
  JSON-in-detail is fragile.
  The D3-DESIGN-BRIEF point 4's state shape demands structured fields.
WHY a new domain is safe: the harness storageDomain enforces ONE open per
domain NAME (the live single-open-domain finding).
A different name means NO collision with `package_governance`, NO
cross-module coupling, and the plugin owns its schema.
The open is best-effort and detached exactly like the factory's P5 arm
(Attach.ts).
An ABSENT facility is a SILENT SKIP (State.MonitorsPersist = false; after a
restart the bands degrade to `not run yet` - the R3 scenario 6 honesty).
A PRESENT facility whose open fails is LOUD (ONE best-effort ledger line
`monitors storage open failed: <reason>` - the P5 v2 incident posture,
NEVER rethrown).

THE OPEN MECHANICS (Function/Storage.ts):
1. probe ctx.get("storageDomain") once inside a ctx.effect (the factory
   Attach P5 arm shape, registered from the plugin's Apply; the disposer
   closes the handle).
2. when present: dynamic-import @deepseek-ai/dsh-storage-domain + zod
   (the Open.ts dynamic-import pattern - the optional packages stay OFF the
   module-load path; the type-only devDeps pin them to the host-era
   versions), then facility.open(defineDomain({ name:
   "live_containers_monitors", version: 1, layout: "per-record",
   invalidRecords: "backup-and-skip", tables: { checks: domainTable(
   Zod.object({...})) } })).
3. on success: bind State.MonitorsJournal (the sink, the factory Sink
   shape: put(`${Date.now()}-${Seq++}`, record) best-effort), drain the
   plugin's OWN pre-bind buffer (State.MonitorsQueue, capped 256 exactly
   like the factory's Queue - the R3 brief's "the boot-window buffer already
   exists - use it" means the PATTERN: the factory-level PendingJournal is
   the shared domain's; the monitor domain needs its own capped buffer,
   drained on THIS open), set State.MonitorsPersist = true.
4. absent facility: silent skip, State.MonitorsQueue.length = 0,
   State.MonitorsJournal = no-op (the Attach silent-skip posture).
5. open failure: the loud ledger line, the same degradation (best-effort,
   never on any caller path).

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

The `tailRef` field of the D3-DESIGN-BRIEF's state shape is the EMBEDDED
bounded tail (the reference semantics = the persisted capture).
The ring is owner-fenced (a host plugin cannot readAt an owned job).
So the ONLY restart-surviving render source is the persisted tail itself.
The 2 KiB cap makes embedding cheap and honest.

THE WRITE CADENCE (best-effort, NEVER on a caller path): ONE
monitor-enrolled record at enrollment, ONE monitor-check record per settle,
ONE monitor-retired record at retirement.
The records are the DURABLE truth.
The human ledger stays the complete record (the P5 posture).

THE RECOVERY (on mount, ONCE): the plugin loads the newest monitor-check
record per (path, agent) when the facility exposes a read surface (the exact
read/list surface of dsh-storage-domain is verified IN PLACE at the C3
dispatch - the C3 brief's dispatch-time checks list).
The loaded entries rebuild the monitor set with their checks stamped
provenance "recovered".
The enrolled records rebuild the enrollment (a file enrolled before the
restart stays enrolled).
When the read surface is absent or fails: NO recovery - the bands render
`not run yet` (the R3 scenario 6 honesty, NEVER a fabricated clean).
The recovery runs ONCE, before the FIRST band render.
The ledger prints `monitor recovered <path> (<n> checks)` per loaded entry.

---

## 2. THE CONFIG SURFACE (the wave-3 knobs, all volatile)

The wave-2 Config.ts discipline continues: EVERY knob is a volatile cell
(the P10 in-place refresh; a flip lands on the next assembly).
The wave-3 fields are APPENDED to the existing schema (the phase-1/wave-2
cells untouched).
The `monitors` knob is the SECOND explicit flip after the plugin's own
`enabled` (R3 acceptance 9 - the CAN-4 posture).

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

THE VALIDATION (appended to Apply's Validate, fail-loud): monitors in
["off", "on"]; watchlist entries: glob non-empty string, checks an array of
strings; EVERY watchlist check name must exist in the effective checksets
(unknown names FAIL LOUD at load); checksets entries: command non-empty
string when link is absent, link ONE of "none" | "governance" when present,
fast boolean, intervalMs number >= 0; monitor.debounceMs >= 1;
monitor.maxMonitors >= 1; monitor.maxMonitorJobs >= 1; monitor.retireMs >= 1;
monitor.staleMs >= 1; monitor.bandCapBytes >= 256;
monitor.checkTimeoutMs >= 1000 and <= 120000 (INLINE_DEADLINE_MS - the
12.2 deadlines rule; the SCHEME documents the composition contract like the
wave-2 liveTimeoutMs).

THE STATE DERIVATION (Apply, appended): State.Monitors =
Map<agentId, Map<pathKey, MonitorEntry>> (the per-agent monitor set);
State.MonitorJobs = Map<jobId, { agentId, path, setId }> (the live monitor
jobs - the settle fold + the board skip guard + the deadline scan read it);
State.MonitorSessions = Map<agentId, unknown> (the enrolled session, for the
check jobs' sandbox policy resolution - captured at the observed events);
State.MonitorOptOuts = Map<agentId, string[]> (the per-glob opt-outs);
State.MonitorSlowLast = Map<agentId, Map<pathKey, Map<setId, number>>>
(the slow-schedule last-run stamps); State.MonitorCallSeq = number (the
synthetic call-id counter); State.MonitorsQueue + State.MonitorsJournal +
State.MonitorsPersist (section 1).

---

## 3. THE MONITOR ENGINE

### 3.1 The fs/observed listener (L11 - the enrollment + the version truth)

Registered via the factory's Wire (the governor precedent, Apply.ts:86-88):
`Factory.Wire(Context, State, (Target, Observation, Actor) =>
Monitors.OnObserved(State, Target, Observation, Actor))` - a ROOT-context
listener (Wire.ts:39 `Context.root.on("fs/observed", Observe)`), so EVERY
write the harness emits is heard: the built-in write/edit tools', the
family's raw-write/normalize-file's, and the factory's own emits
(Write.ts:149-157: `{ kind: "present", version: Outcome.version }`) and the
Refresh re-emits (Refresh.ts:26).

OnObserved (pure observer, fail-open, NEVER throws into the fs/observed
dispatch):
1. if !State.On or monitors === "off": return.
2. read the target (the displayPath is the band label; the targetKey is the
   state key), the observation { kind: "present", version }, the actor (the
   writing exec; the writer = actor?.agent?.id, "-" when absent).
3. the version bookkeeping: the entry (if enrolled) updates lastVersion =
   version, lastWriter = writer, lastObservedAt = now.
4. the enrollment: when the target matches a watchlist glob (the effective
   classification, section 3.2): the entry enrolls (or refreshes) with the
   entry's check sets; ledger `monitor enrolled <path> (by <writer>)` on a
   fresh enrollment.
   A file that matches NOTHING and is not enrolled is NEVER monitored
   (NO scan, NO watch-all - the R3 3.1 rule).
5. the fast-check scheduling: for EACH FAST check set of the entry: set the
   pending record { since: now }.
   An existing pending record is OVERWRITTEN - the coalescing: ONLY the
   newest pending run survives; ONE pending per (path, checkSet).
   The slow sets NEVER auto-run per-edit (the R3 3 taxonomy).
6. the checkpoint scan (section 3.4) runs after the bookkeeping (an edit
   whose debounce already elapsed dispatches immediately).

### 3.2 The classification (Watchlist.ts - config and data, never code)

The effective check sets of a path:
1. the WATCHLIST entries whose glob matches the path (the config override);
   the MOST-SPECIFIC glob wins (the longest pattern); ties -> the later
   entry.
   The glob matcher is a small self-contained converter in Watchlist.ts (the
   Policy.ts self-contained precedent): `*` within a segment, `**` across
   segments, `?` single char; a malformed glob matches NOTHING (fail-open).
2. when NO watchlist entry matches: the DEFAULT CATALOG globs - EACH shipped
   check set declares the glob it applies to (tsc/format ->
   "**/*.ts", cargo -> "**/Cargo.toml", governance -> "**/package.json").
   This is the classification the EXPLICIT enrollment path (live_monitor
   <path>) uses when the watchlist is empty.
   The model's escape hatch works out of the box while the automatic
   enrollment stays watchlist-gated.
3. NO match anywhere: the effective set is [] - the band renders the
   `checks: none` form (section 6.1) and NOTHING ever runs (honest: with
   NO checks, NO verification is claimed).

The check-set catalog (Variable/DefaultCheckSets.ts - DATA, NOT code; the
same shape the `checksets` config cell holds):

	tsc:   { glob: "**/*.ts",       command: "tsc --noEmit {{path}}",          fast: true }
	format:{ glob: "**/*.ts",       command: "npx prettier --check {{path}}",  fast: true }
	cargo: { glob: "**/Cargo.toml", command: "cargo check",                    fast: false, intervalMs: 0 }
	governance: { glob: "**/package.json", link: "governance",                 fast: false }

The command is a TEMPLATE with the substitution tokens {{path}} (the
absolute display path), {{basename}}, {{dir}} (the dirname) - the
Render.ts-style replace ONLY, NO eval.
An unresolved token renders literally + ledger `render unknown <id>
<token>` (the Render discipline reused).
The `link: "governance"` set carries NO command - the band renders the
linked form (section 6.1) and the plugin NEVER re-runs npm (the R3 3.2
rule: the governor/pinner's own verbs are not duplicated).
An unknown check-set name at classification time skips that set + ledger
`monitor check unknown <setId>` (runtime fail-open; the load-time
validation already failed loud for configured names).

### 3.3 The debounce + the coalescing (the checkpoint design)

THE PENDING RECORD: per (path, checkSet) in the entry: { since } - the
clock ms of the latest scheduling edit.
The pending is plugin state.
It is NEVER rendered (the band's not-run-yet form does not change when a
check is pending - the KV stability).

THE CHECKPOINTS (the only dispatch moments - NO real timers, the D2
Board.ScanDeadlines pattern): (a) EVERY fs/observed event, (b) EVERY jobs
event, (c) EVERY assemble pass, (d) the tool surfaces (live_monitor_check).

THE SCAN (Monitors.Scan, called at EVERY checkpoint, fail-open):
1. the DEBOUNCE dispatch: for EACH entry, for EACH pending (setId, since):
   when Clock() - since >= debounceMs: dispatch the check (section 4) and
   DELETE the pending record (the run IS the coalesced run - the newest
   pending survived).
   When the admission is full (live monitor jobs >= maxMonitorJobs): the
   pending record STAYS (coalesce-not-queue - the CAN-1 admission posture;
   its `since` is NOT bumped, so it retries at the next checkpoint when
   admission frees).
2. the DEADLINE scan: for EACH live monitor job: when Clock() >=
   startedAt + checkTimeoutMs: ctx.jobs.kill(jobId, agentId,
   "monitor-deadline") (the registry's kill - NEVER a subprocess
   force-kill by the plugin's code; the settle then records infra
   "killed:monitor-deadline").
3. the SLOW schedule: when slowCheckIntervalMs > 0: per (path, slow setId):
   when Clock() - lastRan >= intervalMs: dispatch (admission-guarded like
   the debounce; the lastRan stamp advances at the dispatch).
   The schedule runs ONLY at the assemble-pass checkpoint (the slow cadence
   is request-aligned - the R3 3 "ONE job per slow check set per interval").
4. the RETIREMENT scan (the assemble-pass checkpoint only): an entry whose
   Clock() - lastObservedAt >= retireMs renders ONE closing line
   (section 6.1) at the NEXT assembly, then withdraws (removed from the
   render set; the persisted history stays in the domain; ledger `monitor
   retired <path>`).
   The closing line renders at most ONCE.

THE CONTROL-LOOP LATENCY (the R3 point 10 framing, documented): the loop's
sample time = debounceMs (the coalescing window) + the admission wait (the
checkpoint cadence - the next event is the bound) + the check run + the next
request's assemble pass.
The model edits; the check runs between turns; the band flips at the next
request.
This is the design's documented latency story - NO machinery beyond
sections 3-4.

### 3.4 The retirement + the overflow

- retireMs (600000): section 3.3 step 4.
  The retirement clock starts at the enrollment (the enrollment counts as a
  touch); EVERY fs/observed event resets it.
  A band whose file was NEVER touched retires after retireMs - standing
  blocks must not outlive their truth (the R3 3.5 discipline).
  The model re-enrolls when it cares.
- maxMonitors (8): the stanza renders the FULL bands of the NEWEST
  maxMonitors files (ordered by lastObservedAt DESC - the R3 scenario 2's
  "ordered by last-change").
  The older files render the ONE-line collapsed forms (section 6.1) - NEVER
  silently dropped.
  The ledger `monitors overflow <n>` fires when the overflowed count CHANGES
  (the quiet-ledger discipline).
  The summary band counts ALL enrolled files (the collapsed included).

### 3.5 The state shape (the D3-DESIGN-BRIEF point 4, verbatim shape)

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

STALENESS IS DERIVED AT RENDER TIME - NEVER stored (the brief point 4): a
check is version-stale when checkedVersion != the entry's lastVersion (the
raw tokens compared - NEVER parsed, the family's capability rule).
A recovered check is time-stale when ranAt < now - staleMs.
The STALE declaration is computed per check at render (section 6.2).
The state is per-agent (the multi-agent view: a parent and a child monitor
the same file independently - the R3 scenario 7).

---

## 4. THE CHECK RUNNER (the G2 reuse + the I1 constraints + the fail-open)

### 4.1 The dispatch (Monitors.Dispatch - the ONE producer path)

The check job is started through the SHIPPED G2 wrapper (Jobs.ts `Start`) -
the R3 brief point 6's "ONE wrapper, TWO callers" is literal: NO second
execution path.
The monitor caller:

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

The G2 wrapper resolves the spec AT START: workingDirectory.ensure(agent),
shellEnv.collect, sandboxPolicy.resolve({ session }), shell.resolve({
onExpiry: "none" }) - the SAME governed path, the sandbox policy UNMODIFIED
(the 12.2.1 rule: detachment NEVER buys weaker isolation).
The job spec: kind "monitor", label `monitor <setId> <path>` (FIRST 80
bytes), outputLimitBytes 2048, output = the pull sources + the private tail
(the SAME JobTail).

THE TAIL - the additive JobTail head mode: the detach path keeps the
newest-2KiB-per-channel capture (unchanged - the phase-2 assertions never
weaken).
The monitor path uses the head mode (a constructor flag): the append keeps
the FIRST cap bytes per channel, and the render cuts the combined stdout +
[stderr] head to 2 KiB from the END (the earliest bytes survive).
Reason: a problem band's diagnostic HEAD is what tells the model which edit
to revert (the R3 scenario 5's "first lines of the stderr tail").
ONE wrapper, ONE tail class, two modes.

THE VERSION CAPTURE: checkedVersion = the entry's lastVersion AT DISPATCH
(the version the check runs against).
A settle whose checkedVersion != the entry's lastVersion AT SETTLE renders
STALE (an edit landed while the check ran) - the exact-version rule.

### 4.2 The settle fold (Monitors.OnSettled - the L6 dispatch)

The existing L6 subscription (Apply.ts:678-708) dispatches the settled
events; the wave-3 addition: `Monitors.OnSettled(State, Event, Append)`
runs BEFORE Board.OnSettled (the monitors claim their jobs FIRST):
1. the event's job id must be in State.MonitorJobs (the plugin's own
   registry - NOTHING else is folded); the record is deleted after the fold.
2. the outcome mapping (the D2 Producer.Outcome's detail is the source):
   - cause "producer", job.status "completed": parse the detail
     `exit code: <n>` (the producer's own format, /^exit code: (\d+)$/) ->
     exit = n.
     exit 0 -> the clean outcome; exit != 0 -> the problem outcome (the
     tail from the captured head-tail).
   - cause "producer", job.status "killed" or "failed" with the detail
     carrying the sandbox-denial marker -> infra "sandbox" (the band
     renders `check denied (sandbox)` - the J3-style fixture pins the
     denial detail the fake shell returns).
   - cause "producer", job.status "killed"/"failed" otherwise -> infra
     "producer:<detail>".
   - cause "kill": infra "killed:<the reason from the view's detail, else
     the cause>" (the deadline kill -> "killed:monitor-deadline").
   - cause "teardown": the owner session died - the check is NOT recorded;
     ledger `monitor check lost <path> <setId> (teardown)`; the band keeps
     the last-known result.
3. the record: the CheckResult pushes onto the entry's checks (per set -
   the newest per set wins the render); the monitor-check record persists
   (section 1); the ledger `monitor check settled <path> <setId> (<job-id>,
   exit <n>)` (the exit 0 form: `exit 0`).
4. the summary/band change is an EVENT - the next request renders the new
   state (the KV honesty, section 5.2).

### 4.3 The fail-open envelope (the R3 point 7, HARD)

- a dispatch start failure (admission/preflight): ledger `monitor check
  failed <path> <setId> (start)`, the pending record DROPS (the check was
  attempted), the band keeps its LAST-KNOWN result and - because the
  version moved (that is why the check was pending) - renders the STALE
  form at the next request (the R3 7: "the band renders last-known +
  stale").
  NO last-known -> `not run yet`.
- a settle with infra: the x/denied forms (section 6.1) - the plugin NEVER
  renders a problem that came from its own plumbing as a code problem (the
  R3 scenario 5).
- the renderer failure: the stanza skips + ledger `monitors render failed
  -> skipped`; the assembly still resolves.
- EVERY listener path: next()-first where the event is a waterfall,
  try/catch, NEVER throws into any dispatch (the family discipline).

---

## 5. THE ASSEMBLE INTEGRATION

### 5.1 The stanza placement (one section, two stanzas)

The wave-2 WaveAssemble (Apply.ts:236-278) composes the section parts:
boards, suggestions, drift.
The wave-3 addition: `Monitors.SectionParts(Agent, AgentId, Separator,
Append)` returns ONE part (the whole monitors stanza - header + summary
band + the file bands, the mandated order: the summary band FIRST inside
the stanza).
The parts order in the section: boards, MONITORS, suggestions, drift.
The stanza renders when monitors are on AND at least ONE file is enrolled
(or a retirement line is due); with monitors off or zero enrolled the
section body is BYTE-IDENTICAL with the wave-2 behavior (the phase-1 +
wave-2 smokes pass with ZERO assertion changes).

WHY ONE part: the section-level collapse (Failsafe.Collapse) collapses the
OLDEST parts and NEVER the LAST.
A per-band parts order would either lose the summary band (the header part
is the oldest) or violate the "summary band first" mandate (the header part
last).
The stanza atomically bounds itself (section 5.3) and the section collapse
treats it as ONE unit (ledger `failsafe section-collapse`).

### 5.2 The KV-cache honesty (stable-until-event, the brief point 8)

The stanza's text changes ONLY on these events:
1. ENROLLMENT (a band appears; the summary count grows).
2. SETTLE (a check lands: the band's outcome line + the summary counts).
3. THE VERSION BUMP (an fs/observed event on an enrolled file: the band
   flips to the STALE form at the next request WITHOUT a re-run - the R3
   acceptance 2).
4. THE RETIREMENT (the closing line renders once, then the band
   disappears).
5. THE MOUNT RECOVERY (the recovered entries render once at the first
   post-mount assembly).

Between two events the stanza renders BYTE-IDENTICAL text: the check time
is HH:MM:SS (NO relative ages anywhere - a "3s ago" would churn the cache
per request).
The band ORDER (by lastObservedAt) changes only when an observed event
lands.
The pending/debounce state is NEVER rendered.
The summary arithmetic is event-driven.
The retirement is the ONE clock-driven text change - a terminal one-time
change (the R3 brief point 8's mutation set + this documented exception).

### 5.3 The token budget (the R3 point 4)

- the per-band cap: bandCapBytes (2048) - the band composer truncates the
  tail first (the tail is already 2 KiB-capped), then the oldest set-lines,
  to fit; ledger `monitor band truncated <path> (<kept> bytes)` when cut.
- the stanza cap: the stanza is bounded by maxMonitors (the overflow
  collapse, section 3.4) and participates in the section budget
  (sectionBudgetBytes 4096 - the wave-2 collapse pass; the stanza is ONE
  part).
- the summary band is ONE line (section 6.1) - always rendered, never
  collapsed.

### 5.4 The per-request recompute + the sample time

The stanza recomputes per assemble pass from the per-agent monitor state
(the L1 waterfall append - the standing-section class; the R3 2's
recompute seam).
The control-loop framing (the R3 point 10): the monitor section IS the
system's observable state vector.
The model's edits are the control inputs.
The checks are the observers.
The loop closes per request.
The sample time is documented in section 3.3.

---

## 6. THE BAND GRAMMAR (byte-exact - the C3 implements to these bytes)

THE GLYPHS (the R3 point 2, written in source as escapes, rendered as the
characters): `\u2204` (U+2204 THERE DOES NOT EXIST) clean; `!` problem;
`\u2205` (U+2205 EMPTY SET) not-run-yet; `~` stale; `x` infrastructure. The
escaped forms are the ONLY source representation - the family's escape
discipline; the rendered section carries the characters.

### 6.1 The stanza + the bands

THE STANZA (the header + the summary band FIRST + one frame per enrolled
file):

	--- MONITORS (file checks; not harness state) ---
	monitors: <total> (\u2204<clean> !<problem> ~<stale> \u2205<pending> x<infra>) - <problem> problem, <stale> stale, <pending> not run, <infra> infra
	<one band frame per enrolled file>
	--- END MONITORS ---

THE SUMMARY BAND arithmetic (pinned - the R3 example's parenthetical and
trailing counts were internally loose; the pinned form is provable): EACH
enrolled file contributes its PRIMARY glyph - the STALE state dominates
(the ~ counts the stale bands regardless of the underlying outcome), then
problem (!), then infra (x), then clean (\u2204), then not-run-yet
(\u2205); <total> = clean + problem + stale + pending + infra.
The trailing phrase's four counts mirror the parenthetical's.
The smoke asserts the sum.

THE BAND FRAME (one frame per file; the separator from config, default
"---"):

	--- MONITOR <path> ---
	<one line per check set, the PRIMARY (worst-state) line first>
	<the tail block, only when the primary line is a problem>
	--- END MONITOR <path> ---

THE OUTCOME LINES (byte-exact; the <path> is the displayPath; <HH:MM:SS>
from the Jobs.StartedAt formatter; <version> = the raw fs/observed token,
verbatim when <= 12 bytes, else the first 12 bytes + ".." - the staleness
comparison ALWAYS uses the raw tokens, never the truncated display;
<writer> = the check's writer, "-" when absent; <n> the exit code):

	clean:        clean (\u2204) | checked <HH:MM:SS> v<version> by <writer> | exit 0
	problem:      problem (!) | checked <HH:MM:SS> v<version> by <writer> | exit <n>
	infra:        check failed (infrastructure) (x) | checked <HH:MM:SS> v<version> by <writer> | <detail>
	denied:       check denied (sandbox) (x) | checked <HH:MM:SS> v<version> by <writer>
	linked:       \u2205 (linked governance; no re-run) | observed v<version> by <writer> at <HH:MM:SS>
	not-run-yet:  not run yet (\u2205?) | enrolled <HH:MM:SS> by <writer>
	no-checks:    not run yet (\u2205?) | enrolled <HH:MM:SS> by <writer> | checks: none

THE PROBLEM TAIL BLOCK (after the problem line; the head-keep capture,
section 4.1; the stdout head then one [stderr] section - the JobTail render
shape; total <= 2 KiB):

	tail (up to 2 KiB):
	<the captured head>

THE PRIMARY-GLYPH RULE: the file's PRIMARY state = the worst across its
check sets (order: stale > problem > infra > clean > not-run-yet).
The primary line renders FIRST.
The summary counts the file ONCE by its primary.
A stale band keeps its underlying outcome facts (the STALE declaration
prefixes the line - the R3 3.6's "render STALE with the persisted facts").

### 6.2 The STALE + the recovered declarations (byte-exact)

The version-stale prefix (the checked version != the current lastVersion):

	~ STALE (file changed after check) | clean (\u2204) | checked <HH:MM:SS> v<version> by <writer> | exit 0 | now v<current>

(the declaration text is the R3 byte `STALE (file changed after check)`;
the leading `~` is the stale glyph; the `| now v<current>` clause appends
the current version for honesty; the underlying outcome rides after the
declaration).

The recovered forms (a check loaded from the domain - provenance
"recovered"; the `(recovered)` marker rides the outcome text; the
`not re-checked this session` clause rides every recovered line):

	recovered-fresh (ranAt >= now - staleMs):
		clean (\u2204) (recovered) | checked <HH:MM:SS> v<version> by <writer> | exit 0 | not re-checked this session
	recovered-stale (ranAt < now - staleMs):
		~ STALE (not re-checked this session) | checked <HH:MM:SS> v<version> by <writer> | exit <exit>
	recovered + version-stale (an edit landed after the mount):
		~ STALE (file changed after check) | clean (\u2204) (recovered) | checked <HH:MM:SS> v<version> by <writer> | exit 0 | now v<current>

THE HONESTY BOUNDS (the R3 points 1/2/7, HARD - acceptance-testable): a
`\u2204` renders ONLY when (a) the check's settle was observed (cause
producer, status completed), (b) the parse produced exit 0, (c) the set id
matches, (d) checkedVersion == the current lastVersion (raw-token equality),
(e) provenance "live" - NO synthesis, NO inference, NO carry-over across
versions.
A settle-less version bump NEVER renders `\u2204` (the false-pass guard,
tested by injecting a settle-less bump).

THE RETIREMENT CLOSING LINE (one line, rendered once, then withdrawn):

	--- MONITOR <path> (retired; not touched for <n>s) ---

THE OVERFLOW COLLAPSED FORM (the maxMonitors overflow; one line per
overflowed file):

	--- MONITOR <path> (collapsed, <len> bytes) ---

---

## 7. THE PERSISTENCE (the storage domain + the journal) - section 1 owns
the schema and the open mechanics; this section owns the record content.

- monitor-enrolled: { event, path, agent, version (the version at
  enrollment), writer, checkSetId: "", ranAt: enrolledAt, exit: null,
  infra: null, tail: "", provenance: "live" }.
- monitor-check (per settle): the full CheckResult (the checkedVersion, the
  exit, the infra, the bounded tail, provenance "live" - a persisted result
  is a valid fact about a version even when its backing process is gone,
  which is exactly why the provenance is per-version; the R3 point 9).
- monitor-retired: { ..., version: the last version, writer: "", ranAt:
  the retirement clock, exit: null, infra: null, tail: "", provenance:
  "live" }.

The recovery (section 1): the newest monitor-check record per (path, agent)
rebuilds the entry; the loaded checks stamp provenance "recovered"; the
band treatment per section 6.2; the enrolled records rebuild the
enrollment.
Job state itself NEVER resumes (the jobs-local contract, 01 9.10) - the
persisted RESULTS do.
A result whose backing process is gone is still a valid fact about a
version (the R3 point 9's exact position).

---

## 8. THE PLANT/TYPE SYNERGY (the CAN-2 reuse - the R3 point 8)

THE MECHANICS - no new seam, the existing Plant/Board machinery:

1. THE plantType registry EXTENDS: "agent-board" | "todo-fill" |
   "aggregate" | "custom" | "monitors" (the BoardState.plantType union; the
   Board.Frame gains the monitors branch).
   The monitors board's member slots are the CHILD AGENTS (the lease
   applies to them exactly as the agent-board's).
   Its ROWS are the monitored FILES.
2. THE ROW: `[monitored] <path> - <outcome> by <writer>` - the R3 byte.
   The <outcome> is the file's primary outcome text (`clean (\u2204)` etc.).
   The rows render from the board's items (the BoardState.items slot, the
   todo-fill precedent: label = path, state = the primary outcome).
3. THE DATA CHANNELS (the two the boards already use):
   a. THE L6 SETTLE TRUTH: the parent's { owners: "scope" } subscription
      already sees the boards' children's jobs (the D2 3.6 verified shape).
      A member's monitor job settle (kind "monitor", label carrying the
      path) folds into the monitors board's item for that path - the same
      OnSettled fold, the monitors branch.
   b. THE REPORT GRAMMAR gains the "monitored" status: `[live-report]
      <plantId> <agentId> monitored <outcome> <path>` (the outcome word
      FIRST - ONE of clean | problem | stale | not-run | infra | denied -
      the path = the rest of the payload, so paths with spaces parse).
      The Board.Report folds it into the monitors board's items (the
      existing Report ledger `report <id> <agentId> (<n> bytes)` covers the
      fold).
4. THE SKIP GUARD (the ONE additive Board.ts change): Board.OnSettled
   consults State.MonitorJobs FIRST - a member's MONITOR settle must NEVER
   flip the member's TASK row (a check is not a completion).
   The guard is ONE early-return line, the phase-2 board semantics
   unchanged.
5. THE PARENT PLANTS A MONITOR INTO A CHILD'S SCOPE:
   `live_monitor(path, agent: <childId>)` - the host plugin's per-agent
   monitor state is keyed on the agent id, so the enrollment lands in the
   CHILD's monitor set.
   The child's next assemble renders the band in the CHILD's section (the
   per-agent attribution).
   The child's check settles feed the parent's monitors board through
   channel (a).
   NO transport change.

---

## 9. THE ESCAPE HATCH (the R3 point 6)

1. INLINE CHECKS UNDIMINISHED: the monitor layer adds NO tools/pre-execute
   listener - the model's own `tsc --noEmit` etc. run exactly as WITHOUT the
   plugin (the detach transform's __await marker remains the model's
   per-call inline opt-out for the DETACH path; the monitors NEVER gate or
   deny an edit, NEVER detach a model call).
   The monitors only OBSERVE writes (the fs/observed events) - the 12.1
   rule has NO conflict here.
2. THE DEEP CHECK: `live_monitor_check <path>` (section 9.1) - the full
   check set ONCE, bypassing the debounce, as a ctx.jobs job.
   The model reads the full ring via job_output (the job's owner is the
   agent; the tool returns the job id).
3. THE PER-GLOB OPT-OUT: `live_monitor off <glob>` - the matching enrolled
   files retire (the closing line + ledger `monitor off <glob>`).
   The glob is added to the per-agent opt-outs so a later fs/observed event
   does NOT re-enroll.
4. THE BAND'S JOB HINT: a settled check's band carries the job id in the
   ledger.
   The model's recovery path for the full output is job_output <job-id>
   (the marker-side honesty, 12.2.3's spirit).

### 9.1 The tool surfaces (MonitorTools.ts - the defineTool idiom, the
Plant.ts shape; read-only semantics, never a write path)

`live_monitor`: parameters { path (string), off (string), list (boolean),
agent (string) }.
- path: enroll (the effective classification, section 3.2); ledger `monitor
  enrolled <path> (by <agent>)`; output render: `monitored <path> (<n>
  checks) - the band renders in the live section.`
- off: the glob opt-out; output render: `monitor off <glob> - <n> file(s)
  retired.`
- list: the enrolled files with their primary outcome one-liners.
  Output render: the lines.
- agent: the target session id (the parent-into-child mechanics, section 8
  point 5); default the caller.

`live_monitor_check`: parameters { path (string, required) }.
- the file enrolls if not enrolled; ALL its check sets dispatch ONCE
  (fast + slow, bypassing the debounce), admission-guarded: when the
  admission is full the pending records are set (coalesced) and the tool
  answers the pending line; the settle updates the band like any check.
- output render (started): `[monitor] deep check started <path> (<n>
  checks) - job_output <job-id> for the full tail.`
- output render (pending): `[monitor] deep check pending <path> (<n>
  checks) - admission full; the band updates when it runs.`

---

## 10. THE STATE SHAPE + THE MODULE SPLIT (the expected modules)

The wave-3 modules are NEW files (the module-leaves discipline); the
existing modules get ADDITIVE edits only:

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

The wave-3 strings (APPENDED to the SCHEME's list; the phase-1/wave-2
strings untouched - the smokes assert every line byte-exact):

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

The extension strings (SEVERE; shipped with the extension gates):

	monitor linkage <path> (<n> versions)
	monitor via <path> <from-path>
	monitor dedup <path> (<job-id>)

The board fold reuses the existing `report <id> <agentId> (<n> bytes)`; the
monitors' activation needs no new proof line (the plugin's own activated
line is untouched - the phase-1 byte); the monitors' on-state is proven by
the ledger lines themselves (the first enrollment/`monitors enabled`).

---

## 12. THE SMOKES PLAN (M7 - the M-series, ADDITIVE)

The family pattern (smoke-writing skill): the suites load the REAL built
Target/Library.js against the fake ctx (the Harness.ts shape: on capture,
get serving the REAL factory, logger capture, the root seam, the
`ctx.__hookDshLiveContainersState` probe), run with `node Target/Test/
<Folder>/Test.js` standalone AND under Maintain/Run-Smokes.mjs (the
vacuously-green guard: EACH folder's README declares the PASS count).
The phase-1 and wave-2 assertions NEVER weaken - the monitors default off
makes the section byte-identical until enabled.

THE FIXTURES (extending the Harness):
- the FAKE fs/observed trigger: the smoke fires the ROOT listener with
  fabricated (Target { displayPath, targetKey }, { kind: "present",
  version }, actor) triples - the actor carrying { agent: { id, session } }
  for the writer/session capture;
- the FAKE clock: the existing ClockBox (advance the clock, never sleep) -
  every timing transition (debounce, retire, staleMs, the slow interval,
  the deadline) is a clock advance + a checkpoint call (an assemble pass or
  a jobs event);
- the FAKE registry: the existing fake (start capture + the controllable
  settle trigger) - the monitor dispatch asserts the EXACT spec (kind
  "monitor", workdir = dirname(path), timeoutMs <= 120000, the substituted
  command, outputLimitBytes 2048);
- the FAKE storage facility: ctx.get("storageDomain") serving the fake
  open (captures the defineDomain spec: name "live_containers_monitors",
  version 1, per-record, backup-and-skip, the checks table) + the put
  capture + an optional read surface for the recovery tests + the absent
  and the failing variants;
- the VOLATILE FLIPS: the wave-3 cells as { get } references; the smoke
  mutates the backing object and asserts the next assembly respects the
  flip (monitors off -> on, a watchlist entry change, debounceMs) without
  a remount.

THE FOLDERS (the M-series):

1. Monitors-Engine - the enrollment (watchlist-glob fs/observed; the
   explicit live_monitor path; the never-monitored negative - a write to a
   non-watchlisted, non-enrolled file creates NO band); the classification
   (watchlist override vs the default catalog globs; the most-specific
   wins); the debounce coalescing (three edits within 1500ms -> ONE job
   started after the clock crosses the window); the admission coalesce
   (maxMonitorJobs 1: a second pending stays pending while the FIRST is
   live - NO second job; it dispatches at the next checkpoint after the
   settle); the retirement (advance past retireMs -> the closing line ONCE
   -> withdrawn; the ledger); the overflow (maxMonitors 8 + 9 files -> the
   9th renders the collapsed one-liner + `monitors overflow <n>`); the
   opt-out (live_monitor off retires the matches; a later fs/observed event
   does not re-enroll).
2. Monitors-Band - the R-series byte-identity: EVERY outcome line of
   section 6.1 byte-exact (the \u2204/\u2205 escapes RENDERED - the smoke
   asserts the character bytes); the STALE flips (a version bump -> `~
   STALE (file changed after check)` at the next request with NO re-run -
   the call log proves zero jobs); the recovered forms (the staleMs time
   rule + the version-stale-after-mount form); the summary arithmetic
   (the counts sum to the total; the primary-glyph rule); the token budget
   (a > 2 KiB tail renders <= bandCapBytes; the stanza participates in the
   section budget); the KV stability (two assemblies with NO event render
   byte-identical stanza text).
3. Monitors-Jobs - the runner: the dispatch through the fake registry with
   the exact re-dispatch spec (the G2 shape; the sandbox policy preserved);
   the settle mapping (exit 0 -> \u2204 ONLY when checkedVersion ==
   lastVersion and provenance live; non-zero -> `problem (!)` with the
   head-tail; killed -> x with the detail; the sandbox-denied detail ->
   `check denied (sandbox)`); the false-pass guard (a settle-less version
   bump NEVER renders \u2204 - the D-series honesty test); the deadline
   kill (advance the clock -> the registry's kill with reason
   "monitor-deadline" -> the x form); the fail-open (a start throw ->
   `monitor check failed <path> <setId> (start)` + the band last-known +
   stale; a teardown settle -> `monitor check lost ...` + the band keeps
   the last-known); the teardown path.
4. Monitors-Persist - the storage: the open captures the defineDomain spec
   byte-exact (name/version/layout/invalidRecords/tables); the put records
   (the enrolled/check/retired shapes); the pre-bind buffer (records fired
   before the open buffer, drain on success); the absent facility (silent
   skip; after a "restart" the bands render `not run yet` - NEVER a
   fabricated clean); the open failure (the loud ledger line, the sink
   degrades); the recovery (the read surface -> the recovered entries with
   provenance + the staleMs treatment; the read absent -> NO recovery).
5. Monitors-Tools - live_monitor (enroll/off/list/agent - the per-agent
   enrollment lands in the named session's set); live_monitor_check (the
   deep path: the full set once, the job id in the output text, the band
   updates on settle; the admission-full pending form).
6. Monitors-Boards - the plantType "monitors" board: the rows from the
   member's monitor settles (the `[monitored] <path> - <outcome> by
   <writer>` byte); the [live-report] monitored fold (the outcome-first
   payload, the path with spaces); the SKIP GUARD (a member's monitor
   settle does NOT flip the member's task row - the phase-2 board
   semantics intact); the close/withdraw lifecycle unchanged.

THE COUNTS: the wave-3 suite is its own counted series (EACH folder's
README declares its PASS count - the reference: the wave-2's 180 checks
across 8 folders; the M-series targets ~90-110 checks across 6 folders).
The R3 M7's "R-series band renders, D-series fail-open/honesty/sandbox-
denial" maps to the Monitors-Band (R-style byte renders) and the
Monitors-Jobs/Persist (D-style negatives: the false-pass guard, the
fail-open paths, the denial mapping, the honesty of the absent store).

---

## 13. THE DOCS PLAN

README.md (the CAN-7 section, appended - the phase-1/wave-2 paragraphs
untouched): the pitch (the "files are halted processes" framing - the
monitors put files into OPERATIONAL MODE), the watchlist/checksets config,
the band grammar (the glyphs + the STALE + the recovered forms), the
honesty rules (the `\u2204` bounds; the fail-open; the IDLE-forever
posture: monitors: "off" even when the plugin is enabled), the escape
hatch (inline checks + live_monitor_check + off), the plantType "monitors"
one-liner, the ledger strings (the byte-exact contract), the latency
paragraph (the control-loop sample time), and the FUTURE section's monitor
extensions (SEVERE/COMPREHENSIVE marked clearly).

SCHEME.md: the wave-3 config table (every field, type, default,
volatile-or-not - section 2 verbatim), the band grammar (section 6
verbatim - the coders implement to these bytes), the ledger-string list
(section 11), the smoke battery map (the M-series ids), the seam evidence
(the fs/observed root listener + the version token + the factory Wire +
the storage-domain v2 contract + the G2 reuse - the harness version
pinned), the check-deadline composition contract (checkTimeoutMs <= the
inline deadline - the 12.2 rule), the KV-cache statements (the mutation
set of section 5.2), and the extensions section (SEVERE marked "next after
v1 of monitors"; COMPREHENSIVE marked FUTURE).

The site page: the wave-3 section (the monitors one-liner + the safety
framing + the status line "planned - not yet in the profile").

---

## 14. THE EXTENSIONS (the SEVERE + COMPREHENSIVE designs - specified so
the C3 dispatches with the full picture; the C3 SHIPS NONE of them - the
v1-of-monitors scope is sections 1-13; the extensions land after)

SEVERE (next after the monitors' v1):
1. THE LINKAGE ALERTS (the R3 7.1): when a file's problem persists across
   linkageAlertVersions (3) version-bumps (the check results: problem at
   v, v+1, v+2), the band escalates to channel 4 (the model-visible note).
   The band gains ONE line `[live] <path>: problem unchanged across <n>
   edits - read the tail before the next edit.` + ledger `monitor linkage
   <path> (<n> versions)`.
   Gated on failsafes "on" + linkageAlertVersions > 0; counted against
   failsafesPerTurn (the CAN-4 posture).
2. THE CROSS-FILE PROBLEM ATTRIBUTION (the R3 7.2): config-gated
   (attrParse: "off" | "on", default "off" - the wave-3 config gains the
   knob when the extension lands): a problem tail whose FIRST lines match
   another enrolled file's path annotates that file's band with `problem
   via <path>` + ledger `monitor via <path> <from-path>`.
   Text-level parsing of the check tail ONLY.
3. THE CI-PARITY CHECK SET (.live-monitors.json): a project-level config
   the USER authors ({ checksets, watchlist } per project); the plugin
   reads it READ-ONLY at enrollment (best-effort, cached per project root
   with a TTL; NEVER written - the read is node:fs, the governor's
   policyFile-reading precedent).
4. THE MONITOR-AWARE DEDUP (the R3 7.4 - the ONLY piece touching
   tools/post-execute; read-only-in-effect): the L2 pre-execute arm records
   a note-candidate (a model command whose (normalized command, cwd)
   matches a monitor job that SETTLED within dedupWindowMs, keyed on the
   callId - NEVER a deny, NEVER a detach); the existing L4 post-execute
   observer appends ONE line to the tool result's text: `[monitor] same
   check ran <n>s ago (<job-id>) - job_output for the tail.` + ledger
   `monitor dedup <path> (<job-id>)`.
   The decision passes through unchanged - an observability note on an
   inline call, legal under 12.1.

COMPREHENSIVE (the later stage - design notes, FUTURE):
5. THE PROGRAMMABLE MONITORS: per-glob `program:` checks executed by the
   ptc-runtime under the v1 research section 5 caps (2s, 16 KiB, NO fs
   writes, NO network) - the user's "wrap the file in a sandbox" fully
   realized: the sandbox is the ptc runtime, the program is arbitrary, the
   output contract is the band grammar.
6. THE AGGREGATE HEALTH BLOCK: the `health` kind in the block catalog
   (Variable/Catalog.ts gains the entry) fed from the monitor state - the
   session-wide `health: files=23 (\u220421 !2)` gauge.
7. THE GUI SIDECAR: the monitor events join the CAN-6.8 JSONL sidecar
   (live-containers-events.jsonl) as monitor-enrolled / check-ran /
   problem-found records - user observability without conversational
   presence.
8. THE CROSS-SESSION MONITOR MEMORY: the persisted bands' history (problem
   counts per file over sessions) surfaces in the provenance line as
   `problems: 3 this week` - cheap, from the domain, honest.

---

## 15. THE ACCEPTANCE CRITERIA (the R3 section 8, mapped to the smokes)

1. An enrolled .ts edit produces at the next request a band with version,
   check time, exit, and `\u2204` on exit 0 - with NO model check command
   (the Monitors-Band/Jobs smokes assert the call log).
2. A second edit before the next request flips the earlier band to `~`
   STALE at that request WITHOUT a re-run; a later request shows the fresh
   result (Monitors-Band).
3. A non-zero exit renders `!` with a capped tail; an infrastructure
   failure renders `x`, NEVER `!` (Monitors-Jobs).
4. EVERY internal error path is fail-open: NO throw reaches fs/observed or
   assemble in any test; a broken renderer degrades to the ledger
   (Monitors-Jobs/Band D-series).
5. NO `\u2204` EVER renders WITHOUT a matching observed exit-0 settlement
   for the current version (the false-pass guard - Monitors-Jobs).
6. Restart: persisted bands reload with original provenance; absent domain
   renders `not run yet`; NOTHING fabricates (Monitors-Persist).
7. The command-only/sandbox rules hold: monitor jobs run through the
   governed G2 path; a sandbox-denied check renders `check denied
   (sandbox)`; monitor checks NEVER detach or gate a content-mutating tool
   call (Monitors-Jobs; the 12.1 no-conflict is structural - the monitors
   add NO tools/pre-execute listener).
8. The token budget: band <= 2 KiB, the section <= 4 KiB with recorded
   collapse; the summary band is ONE line (Monitors-Band).
9. The plugin ships disabled; the monitor layer is a second explicit flip
   after the plugin's own enable (the Wiring/Defaults assertions).
10. Ledger strings byte-exact per the SCHEME (the D-series byte-identity
    assertions over section 11's list).

---

## 16. THE C3 CODER BRIEF + THE PHASE-ORDER ALIGNMENT

### 16.1 The phase order (the collision rule - the D2 9.1, extended)

PHASE 1 (A1/A2/A3 - shipped): the assemble-side plugin.
PHASE 2 (C2 - SHIPPED, on disk): the wave-2 extension (Policy, Jobs,
Detach, Completion, Board, Failsafe, Suggester, Set, Plant, the J/B/F/S
suite, the ETS twin).
PHASE 3 (C3 - THIS design): the wave-3 monitor layer on the SAME package,
STRICTLY SEQUENTIAL after the wave-2 acceptance is green.
C3's edits to the existing files are ADDITIVE ONLY: the Validate block
appends, the Config cells append, the State fields append, Apply appends
the registrations (Wire, the L6 fold, the WaveAssemble part, the tools, the
storage effect), Board gains the ONE skip-guard line.
The phase-1 and wave-2 smokes pass with ZERO assertion changes (the family
arbiter law).
The new behaviors live in NEW modules (the module-leaves discipline).
The ETS twin mirrors after the Classic acceptance (the D2 1.1 discipline;
the ledger strings byte-identical).

### 16.2 THE C3 CODER BRIEF (self-contained - dispatch after the wave-2
acceptance)

ROLE: implement the wave-3 monitor layer of @playform/hook-dsh-live-
containers (the Classic twin first; the ETS twin after the Classic
acceptance) per Documentation/Archive/Live-Containers/Design/
FILE-MONITORS-DESIGN.md (THIS file - sections 1-13 are the byte-ready
spec) and this brief.

SURFACE: ONLY Classic/packages/hook-dsh-live-containers/** and
EffectTS/packages/ets-hook-dsh-live-containers/** (after the Classic
acceptance) + the wave-3 sections of the package README/SCHEME + the site
page's wave-3 section.
The C2-shipped wave-2 files are READ FIRST (the monitors extend them):
Source/Function/Apply.ts (the registration
discipline + the L6 dispatch + WaveAssemble), Source/Function/Jobs.ts (the
G2 wrapper - the check producer REUSES Start; the JobTail head mode is the
ONLY Jobs.ts edit), Source/Function/Board.ts (the skip guard + the
"monitors" plantType branch), Source/Variable/Config.ts (the append-only
cells), Source/Function/Plant.ts (the defineTool idiom for MonitorTools),
Source/Function/Policy.ts (INLINE_DEADLINE_MS - the check-deadline cap),
Source/Function/Storage.ts does NOT exist yet - the factory's Open.ts +
Attach.ts are the reference for the plugin's own P5-style open (read
Classic/packages/plugin-dsh-factory/Source/Function/{Open,Attach,Journal,
Wire}.ts in place).

DELIVERABLES: the six new modules + Variable/DefaultCheckSets.ts
(sections 1-10), the band grammar implemented to the EXACT bytes of section
6 (the `\u2204`/`\u2205` escapes in source, rendered as the characters),
the ledger strings byte-exact (section 11), the wave-3 config cells + the
validation (section 2), the M-series test folders (section 12, each
{Test.ts, README.md} with the declared PASS count), the wave-3 SCHEME/
README sections (section 13), the ETS twin mirror (byte-identical ledger
strings). NONE of the section-14 extensions ship in this phase (the
SEVERE knobs linkageAlertVersions/dedupWindowMs are ACCEPTED in config,
defaulted to 0/off, and inert - the same posture the wave-2 catalog kinds
had in phase 1).

ARBITERS: Maintain/Run-Smokes.mjs all green; the phase-1 + wave-2 suites
pass with ZERO assertion changes; the ledger strings match the SCHEME
byte-exactly; NO other package modified.

DISCIPLINES: NEVER run git commands (checks only; report READY-TO-COMMIT);
ASCII only (the glyphs as escapes); tabs only; file content via the
write/edit tool API only; NO builds/dev-server/test runs beyond what the
smoke harness performs when the orchestrator runs it; NEVER enable the
plugin or the monitors in the profile; EVERY listener next()-first +
fail-open; EVERY ledger line byte-exact; the storage-domain read surface
is verified IN PLACE at dispatch (the app.asar dsh-storage-domain package -
the recovery load's exact read/list shape; when the surface differs from
the design's assumption, implement to the verified surface and report the
deviation with ONE line).

REPORT FORMAT: ONE message - the files created/edited per twin, per-file
ONE-line summary, the exact ledger strings shipped, the smoke results
(pass/fail counts per series), and ANY deviation from this design with a
ONE-line reason.

ROUTING TRIPLE: provider cloudflare-workers-ai, model @cf/zai-org/
glm-5.3-flash, reasoningEffort low (the task-routing law - C3 is a coding
delegation: GLM-5.3-Flash low for the mechanics pass, then HIGH for the
verification pass per the task-routing skill).

### 16.3 The C2 alignment

C2's shipped code is the FLOOR: the monitors' jobs ride C2's G2 wrapper,
the stanza rides C2's WaveAssemble, the band's settle rides C2's L6
subscription, the boards' skip guard is the ONLY C2-file behavior edit (ONE
early-return line in Board.OnSettled).
C2's ledger strings and marker grammars are byte-untouched.
A mismatch between C2's shipped bytes and this design's references is a
defect to REPORT (the C3 report's deviation line), NEVER to paper over
(the A3/C2 precedent, D2 9.4).

---

## 17. THE RESIDUALS (the honest edges the design leaves open)

1. THE R3 SCENARIO-4 CROSS-FILE STALENESS: the v1 monitors derive
   staleness PER FILE (the brief point 4's rule - the same-file version
   comparison, acceptance-tested).
   The Config.ts/State.ts dependency case (a check's truth about a world
   whose OTHER files moved) is served by the per-version provenance (the
   band's version stamp is the honest signal) and fully solved only by the
   SEVERE cross-file attribution (config-gated tail parsing).
   The design scopes this explicitly; the plugin NEVER CLAIMS cross-file
   staleness it cannot compute.
2. THE RECOVERY READ SURFACE: the exact dsh-storage-domain read/list
   shape is not pinned here (the factory only uses put; the harness tree
   is not readable from this lane's sandbox).
   The C3 dispatch verifies it IN PLACE; the absent/failing read degrades
   to `not run yet` (honesty, NEVER fabrication) - the residual is
   contained by design.
3. THE VERSION TOKEN SHAPE: the fs/observed version token is opaque (the
   family's capability rule); the band renders it verbatim (12-byte
   display cap) and compares RAW tokens - a future token-shape change
   cannot break the staleness logic.
4. THE RETIREMENT IS THE ONE CLOCK-DRIVEN TEXT CHANGE: the KV mutation set
   (section 5.2) plus this documented exception - the terminal one-time
   closing line.
5. THE R3 SUMMARY EXAMPLE'S ARITHMETIC was loose (the parenthetical and
   trailing counts disagreed); the pinned summary (section 6.1) is
   self-consistent and provable - the R3 byte `monitors: <n> (...glyphs...)
   - <n> problem, <n> stale, <n> not run` shell is preserved.
6. THE LINKED-GOVERNANCE BAND NEVER renders `\u2204`: the plugin has NO
   seam into the governor's verdict; the honest `\u2205 (linked
   governance; no re-run)` form with the observed version facts is the
   design's position (a fabricated governance verdict would violate the
   R3 point 7 hard rule).

---

## 18. THE ROUTING + THE LANE NOTES

- This design executed READ-ONLY: the single deliverable is this file
  (write tool); NO builds, NO dev server, NO test runs, NO git mutations
  (checks only; the whole work reports READY-TO-COMMIT when green).
- The normalize hooks are active in the authoring profile: this document
  is ASCII-only, tabs-only, written through the write tool API; the
  indicator glyphs appear ONLY as the `\u2204`/`\u2205` escapes.
- The C3 dispatch triple: cloudflare-workers-ai / @cf/zai-org/glm-5.3-flash
  / low (mechanics pass), then high (verification pass) - the task-routing
  law.

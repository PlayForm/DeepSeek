# CAN-7 - LIVE FILE MONITORS (operational edits over live-running software)

Date: 2026-10-20
Status: requirements only (the durable spec for the D3 DESIGN agent; written by
the wave-3 research agent, R3).
Base: Documentation/Archive/Live-Containers/LIVE-CONTAINERS-RESEARCH.md (v1) + Requirements 00-07
(wave 2, incl. 01's BINDING CONSTRAINTS 12.1/12.2 - the command-only detach and
the sandbox/fail-open rules). Wave 3 EXTENDS the same package
(Classic/packages/hook-dsh-live-containers) and never contradicts the verified
seams.

---

## 1. The requirement statement (the user's words, faithful)

"To me all of the files on my file system are halted processes. Whenever you
or other many agents at a time operate on a file - you run tsc, dum
prepublishOnly, linters, etc. - all of this requires turns and turns. A live
block can put the halted process (e.g. a file) into OPERATIONAL MODE: wrap the
file in a sandbox and have that sandbox's output propagated automatically to
the live blocks (very controllable and very granular) - the monitor-stats box
above the file the agent operates on. Each turn, the file edits + the
subsequent requests see the monitor's output changing - the harness recomputes
BEHIND THE SCENES and replaces the output, with a 'there does not exist' sign
(the mathematical indicator that there isn't anything wrong) - teaching the
LLM, by fully abstracting its view of the system over each/every file, that
these LIVE VIEWS serve as the actual operational view - more information per
turn while remaining conversational.

The problem with other harnesses: after every write (or before), the LLM
pre-bakes commands like cargo check that run after/before its edit, wasting
tokens - instead of focusing on the edit. The goal: OPERATIONAL EDITS over
live-running software - the LLM's conversation behaves like a mind that does
things, not a token-wasting back-and-forth."

Concrete reading: for every file the session (or a configured watchlist)
touches, a monitor block renders that file's check status - recomputed per
request from jobs the plugin runs BETWEEN turns, not from tool calls the model
spends on checking. The model edits; the monitor reports; the loop closes
without the model ever typing `tsc --noEmit` to find out whether it should.

## 2. The verified machinery this rides on

- **The file-change trigger**: the fs/observed event - the family's write
	executor emits `ctx.emit("fs/observed", target, { kind: "present", version
	}, actor)` after every successful tool-layer write (plugin-dsh-factory
	Source/Function/Write.ts:149-157), and the re-emit after a governance
	follow-up uses the same event (Function/Refresh.ts:26). A plugin listens on
	the ROOT context, not its own (Function/Wire.ts:39 -
	`Context.root.on("fs/observed", Observe)`) - the exact pattern the
	package.json governor uses to hear every write
	(hook-dsh-package-governor Source/Function/Apply.ts:86-88). The event
	carries target path, observation kind, and the actor (the tool's exec) -
	enough to key a monitor per file and per writing agent.
- **The background home for the checks**: ctx.jobs (dsh-jobs-local):
	`start()` with preflight, per-owner admission (default 10), bounded output
	rings (retainBytes 262144 live / settledRetainBytes 16384), first-wins
	settle, one `settled` event. The monitor's check commands are jobs owned by
	the plugin's controller (the factory P1 attach, SCHEME.md:259-261), run
	between turns - they never block a tool call.
- **The recompute seam**: the system-prompt/assemble waterfall, append-only
	sections after `next()` (hook-dsh-tool-coach Apply.ts:499-556) - the
	monitor block is re-rendered at each request from the plugin's per-file
	state. This is the same standing-section class as CAN-1/CAN-2: the block
	changes only when the underlying check state changes (stable-until-event,
	KV-cache friendly; see point 4).
- **The sandbox for the checks** (01 BINDING CONSTRAINT 12.2, inherited
	hard): every check command runs through the governed bash execution path -
	the same sandbox policy, deadlines, and output caps as an inline call.
	Detachment never buys weaker isolation or more runtime; a check job's
	deadline MUST be <= the inline deadline policy; the 2 KiB render cap
	applies to every monitor line.
- **The cross-restart persistence**: the factory P5 storage domain
	(Function/Open.ts): `ctx.get("storageDomain")` probed once, `defineDomain`
	(name/version/layout "per-record"), the shared single-open sink
	(`SharedJournal`), the pre-bind buffer (capped 256) for records that fire
	before the open, best-effort and fully contained. The monitor's check
	results and job records persist there (see point 9).
- **The teaching channel**: the tool-coach's note tiers (04 section 2's five
	channels; the tier-2 persistent section, Apply.ts:499-556) - the monitor
	participates in the same escalation grammar: ledger-only by default,
	model-visible block when a monitor has something to say.

## 3. The monitor lifecycle (severe extension)

1. **Enrollment** - a file enters the monitor set when:
	- the plugin observes an fs/observed event whose target matches an
		enrolled watchlist glob (point 5), OR
	- the model explicitly asks (`live_monitor <path>` - the escape hatch's
		positive side, point 6), OR
	- a parent plants a monitor into a child's coordination scope (point 8).
	Unobserved files are NEVER monitored (no scan, no watch-all).
2. **Classification** - the file's basename/extension maps to a check set
	from the watchlist config (point 5): `Apply.ts` -> `tsc --noEmit` + the
	format check scoped to the file's project; `Cargo.toml` -> `cargo check`;
	`package.json` -> the dependency checks (the governor/pinner's own verbs,
	not duplicated: a monitor on package.json links the GOVERNANCE outcome, it
	does not re-run npm). The map is config, not code.
3. **Debounce** - an fs/observed event schedules the file's FAST checks via
	a per-file debounce window (default 1500ms, volatile): edits landing in
	quick succession coalesce into one check run. The debounce timer is
	plugin state; the checks dispatch as ctx.jobs with kind `monitor`.
4. **Run between turns** - the jobs run whenever the registry admits them;
	their settle events update the per-file state (version checked, exit
	codes, output tails). Nothing in this path touches the conversation.
5. **Render per request** - the assemble listener renders one monitor
	standing block per enrolled file (or one compact band per file inside a
	single section, per point 4), with the freshness/provenance metadata
	(point 1) and the no-problem indicator (point 2). Blocks whose file was
	not touched for `retireMs` (default 600000) render one closing line and
	withdraw (the CAN-1/06.6 retirement discipline - standing blocks must not
	outlive their truth).
6. **Restart recovery** - on mount, the plugin loads the persisted monitor
	state (point 9): results younger than `staleMs` (default 300000) render
	as-is with their original provenance; older ones render STALE with the
	persisted facts and "not re-checked this session" - never silently fresh.

## 4. The scenarios (most varied)

1. **The single-file monitor**: the model edits Apply.ts three times in one
	turn. fs/observed fires three times; the debounce coalesces; one tsc job
	runs after the last edit; the next request's monitor block shows
	`clean (∄)` with the post-edit version stamp - the model never ran tsc.
2. **The multi-file watchlist**: five files of three types edited across a
	turn; the section renders one band per file, ordered by last-change,
	capped at `maxMonitors` (default 8; overflow collapses to a one-line
	count, never silently dropped - the ledger records the collapse).
3. **The slow check on schedule**: `cargo check` is too slow for per-edit
	debounce. It is classified slow; it runs on demand (the model's
	`live_monitor_check <path>` or the explicit deep-check path, point 6) and
	on a schedule (`slowCheckIntervalMs`, default 0 = off; when on, one job
	per slow check set per interval, admission-guarded). While a slow check
	has never run, the band renders `not run yet (∅?)` - honest initial state
	(point 7).
4. **The stale-truth edge**: the model edits Config.ts at T0 (monitor
	clean); then edits its dependency State.ts at T1. The Config.ts band's
	facts are now about an older version: the band flips to
	`STALE (file changed after check)` at the next request WITHOUT re-running
	anything - staleness is computed from the persisted version vs the
	current fs/observed version, cheap and synchronous. The model reads:
	trust the fresh bands, distrust the stale ones.
5. **The check failure**: the tsc job exits non-zero. The band renders
	`PROBLEM` with the first lines of the stderr tail (2 KiB cap), exit code,
	and the checked version. A check that itself crashes (producer error, not
	exit code) renders `check failed (infrastructure)` - the plugin never
	renders a problem that came from its own plumbing as a code problem.
6. **The restart recovery**: the session restarts between the edit and the
	next request. The persisted band renders with its original check time and
	the `recovered` provenance flag; if the domain never opened (absent
	facility - the P5 silent-skip posture), the band renders `not run yet` -
	loss of the store degrades to honesty, never to a fabricated clean.
7. **The multi-agent view**: two agents edit the same file. The band's
	provenance line lists the last writer per version; a parent whose child
	edits files in the parent's watchlist sees the bands update at the
	parent's next request - the CAN-2 board aggregation (point 8) carries the
	per-child monitor summaries.
8. **The check storm**: a loop edits 30 files rapidly. Admission guards
	cap concurrent monitor jobs (`maxMonitorJobs`, default 3); excess checks
	coalesce per (file, check set) - only the newest pending run survives.
	The ledger records every coalesced run; no check is silently lost.
9. **The sandbox denial**: the platform sandbox denies the check command.
	The band renders `check denied (sandbox)` - same as an inline denial;
	never interpreted as a code problem (the 12.2 acceptance property,
	monitor-side).
10. **The escape hatch**: the model needs the full compiler output. It runs
	tsc itself (inline, undiminished) or calls the monitor's deep-check path;
	the monitors add information, they never remove an ability (point 6).

## 5. The seam map

EXISTS (verified anchors):
- fs/observed change events: plugin-dsh-factory Source/Function/Write.ts:149-157
	(the emit), Function/Refresh.ts:26 (re-emit), Function/Wire.ts:39 (the
	root-context listener pattern), hook-dsh-package-governor
	Source/Function/Apply.ts:86-88 (the consumer precedent).
- ctx.jobs + admission + rings + settle: @deepseek-ai/dsh-jobs-local README
	(inherited, E5 of 07); job tools + notices (E6); factory P1 controller
	attach (SCHEME.md:259-261).
- assemble standing section: hook-dsh-tool-coach Apply.ts:499-556 (E3).
- sandbox/deadline/caps for detached commands: 01 section 12.2 (binding,
	inherited wholesale for monitor checks).
- storage domain: plugin-dsh-factory Function/Open.ts (the P5 contract:
	defineDomain, per-record layout, shared sink, boot-window buffer,
	backup-and-skip) + Function/Journal.ts (the routing).
- the note-channel grammar: 04 section 2 (the five channels).
- retirement/withdrawal: 01 section 8, 06.6.

MISSING (the gap list for D3):
- M1: the per-file monitor state store (per-agent or session-scoped;
	version-keyed check results; the debounce and coalescing engine).
- M2: the watchlist config schema + the file->check-set classifier (config,
	not code) + the fast/slow taxonomy.
- M3: the band renderer (provenance line, indicator grammar, 2 KiB cap,
	overflow collapse) and the section composer.
- M4: the check job launcher (governed-bash producer wrapper per 12.2,
	deadline <= inline, ring-capped) + the deep-check tool surface.
- M5: the storage schema for the monitor domain (a NEW domain name/version
	or an extension record set - D3 decides; the v2 open contract above
	constrains: a new event name requires a new domain version).
- M6: the plant/child aggregation hook (reuses CAN-2's board machinery -
	design pass against the existing Plant/Board modules, no new seam).
- M7: the smoke battery extension (R-series band renders, D-series
	fail-open/honesty/sandbox-denial tests).

## 6. The BINDING CONSIDERATION POINTS (each adopted or rejected with reason)

| # | Point | Verdict | Requirement wording / reason |
|---|---|---|---|
| 1 | Freshness + provenance metadata per line | ADOPTED | Every band carries: check time (HH:MM:SS), the file version it checked (the fs/observed version token), and the exit(s). A band whose checked version != the current version renders the `STALE (file changed after check)` prefix and is explicitly not to be trusted; fresh bands carry no qualifier. This is the planted-lease pattern: every truth declares its own lease. |
| 2 | The no-problem indicator grammar | ADOPTED | One ASCII-safe glyph per check outcome: `∄` (U+2204 THERE DOES NOT EXIST, written in source as the escaped form `\u2204` under the family's escape discipline) for clean, `!` for problem, `∅` (U+2205, `\u2205`) for not-run-yet, `~` for stale, `x` for check-failed-infrastructure. Plus a ONE-LINE summary band at the section head: `monitors: 6 (∄5 !1 ~2) - 1 problem, 2 stale, 3 not run`. The glyphs are the section's own output, framed by the LIVE CONTAINER markers (never harness state). |
| 3 | The check taxonomy (fast debounced / slow on demand + scheduled) | ADOPTED | Fast checks: per-edit, debounced 1500ms, jobs between turns. Slow checks: on demand (`live_monitor_check`) and on `slowCheckIntervalMs` when enabled; slow checks NEVER auto-run per-edit. All checks are ctx.jobs - nothing blocks a tool call. |
| 4 | The token budget | ADOPTED | 2 KiB render cap per band (the ring-tail precedent); the section cap 4 KiB with overflow collapse to one-line counts (the 04 section 3.8 pattern); per turn only the bands whose underlying state changed differ - stable-until-event for the KV cache, the same honesty rule as CAN-1 section 8. The summary band stays compact (one line). |
| 5 | The per-file watchlist config | ADOPTED | Config maps globs to check sets: `**/*.ts -> tsc --noEmit + format`, `**/Cargo.toml -> cargo check`, `**/package.json -> dependency checks (linked governance)`. Every entry volatile (hot-editable, the normalize-dash cell pattern). Default watchlist: EMPTY (enroll-on-write only) - no scan, no watch-all, privacy and cost contained. |
| 6 | The escape hatch | ADOPTED | The model can always run any check inline (undiminished) or request a deep check via the monitor tool (which runs the full check set once, uncapped beyond the ring/deadline rules, and renders the fuller tail on demand). Monitors are additive information; they never gate or deny an edit. An explicit `live_monitor off <glob>` per-glob opt-out exists. |
| 7 | The honesty (initial states, fail-open, never a false pass) | ADOPTED (hard) | Initial state `not run yet (∅?)` is rendered, never blank. Every listener path is fail-open (never throws into fs/observed or assemble; a monitor failure degrades to the ledger, the band renders last-known + `stale`). A clean `∄` is rendered ONLY from an observed exit 0 of the exact check set for the exact version - byte-identity discipline: no synthesis, no inference, no carry-over across versions. |
| 8 | The plantType synergy | ADOPTED | A child's monitor bands aggregate into the parent's CAN-2 board as monitor rows (`[monitored] Apply.ts - clean (∄) by worker-2`), via the existing Plant/Board report channel - no new seam. A parent may plant a monitor into a child's scope (the child's checks feed the parent's board row). |
| 9 | Cross-restart persistence | ADOPTED | Check results + monitor state persist through the P5 storage domain (a dedicated monitor domain or extension records - M5). On mount: reload, mark recovered bands with original provenance, degrade to `not run yet` when the domain is absent. Job state itself does not resume (jobs-local contract, 01 section 9.10) - persisted RESULTS do; a result whose backing process is gone is still a valid fact about a version, which is exactly why provenance is per-version (point 1). |
| 10 | The control-loop framing | ADOPTED (as the design mandate) | The monitor section IS the system's observable state vector; the model's edits are the control inputs; the checks are the observers; the loop closes per request. D3 must treat latency (debounce -> job -> next request) as the loop's sample time and document it; no machinery is required beyond what sections 2-4 specify - this is framing that constrains the design (band ordering by recency, the summary band as the aggregated state, staleness as observer aging), not a new subsystem. |

No point is rejected. Points 1, 2, 7 are HARD (the honesty cluster); the
others are design-binding but tunable via config.

## 7. The extensions

SEVERE (next after v1 of monitors):
1. The **linkage alerts**: when a monitored file's problem persists across
	N versions (default 3), the band escalates to the tool-coach's channel 4
	with a targeted note (`Apply.ts: problem unchanged across 3 edits - read
	the tail before the next edit`). The CAN-4 posture: ledger by default,
	note on escalation, capped by failsafesPerTurn.
2. The **cross-file problem attribution**: a check failure on file A that
	mentions file B (compiler diagnostics) annotates B's band with
	`problem via A` - the model sees which edit to revert. Text-level parsing
	of the check tail only, config-gated.
3. The **CI-parity check set**: a project-level config file
	(`.live-monitors.json`) the USER (not the model) authors, defining the
	check sets per project; the plugin reads it read-only and never writes
	it.
4. The **monitor-aware dedup**: before the model's own inline check command
	matches a pending/recent monitor job for the same (command, cwd), the
	tools pre-execute listener appends one line to the call's post-execute
	result: `[monitor] same check ran <n>s ago (<job-id>) - job_output for the
	tail.` - never a deny, never a detach (12.1: this is an observability
	note on an inline call, legal).

COMPREHENSIVE (the later stage):
5. The **programmable monitors**: per-glob `program:` checks executed by the
	ptc-runtime under the v1 research section 5 caps (2s, 16 KiB, no fs
	writes, no network) - the user's "wrap the file in a sandbox" fully
	realized: the sandbox is the ptc runtime, the program is arbitrary, the
	output contract is the band grammar.
6. The **aggregate health block**: a session-wide `health: files=23 (∄21 !2)`
	gauge template (CAN-3's catalog gains a `health` kind) fed from the
	monitor state - the user's "fully abstracting its view of the system over
	each/every file".
7. The **GUI sidecar**: the monitor events join the CAN-6.8 JSONL sidecar
	(`live-containers-events.jsonl`) as monitor-enrolled / check-ran /
	problem-found records - user observability without conversational
	presence.
8. The **cross-session monitor memory**: the persisted bands' history
	(problem counts per file over sessions) surfaces in the band's provenance
	line as `problems: 3 this week` - cheap, from the domain, honest.

## 8. The acceptance criteria

1. An enrolled `.ts` file edit produces, at the next request, a band with
	version, check time, exit, and `∄` on exit 0 - and the model issued no
	check command (provable via the smoke's call log).
2. A second edit before the next request flips the earlier band to `~`
	STALE at that request without a re-run; a later request shows the fresh
	result.
3. A non-zero exit renders `!` with a capped stderr tail; an infrastructure
	failure renders `x`, never `!`.
4. Every internal error path is fail-open: no throw reaches fs/observed or
	assemble in any test; a broken renderer degrades to the ledger.
5. No `∄` ever renders without a matching observed exit-0 job settlement
	for the current version (the false-pass guard, testable by injecting a
	settle-less version bump).
6. Restart: persisted bands reload with original provenance; absent domain
	renders `not run yet`; nothing fabricates.
7. The command-only/sandbox rules hold: monitor jobs run through the
	governed bash path; a sandbox-denied check renders `check denied
	(sandbox)`; monitor checks never detach or gate a content-mutating tool
	call (12.1 has no conflict here - monitors only OBSERVE writes).
8. The token budget: band <= 2 KiB, section <= 4 KiB with recorded
	collapse; the summary band is one line.
9. The plugin ships disabled; the monitor layer is a second explicit flip
	after the plugin's own enable (the CAN-4 posture).
10. Ledger strings byte-exact per the SCHEME (D3 authors the list; `live-
	containers: ` prefix, one log per module).

## 9. D3-DESIGN-BRIEF (the design mandate for the next lane)

You are the D3 DESIGN agent. Design the monitor layer for
Classic/packages/hook-dsh-live-containers. Constraints and openings:

1. **Reuse, do not fork**: the monitor layer lives in the SAME package. Its
	listeners join the existing Apply wiring (fs/observed joins via the
	factory's Wire pattern; the assemble section GROWS a `monitors` stanza
	inside the existing live-containers section - one section, two stanzas,
	the summary band first).
2. **Resolve M5 first**: the storage decision (new domain
	`live_containers_monitors` vs extension records in an existing one) gates
	the schema of everything persisted. Follow the Open.ts v2 contract: a new
	event name means a new domain version; per-record layout;
	backup-and-skip; the boot-window buffer already exists - use it.
3. **The band grammar is a contract**: author the byte-exact band template
	(now), the summary band template, and the ledger strings in the SCHEME as
	part of the design - the coders implement to your bytes. Keep `∄`/
	`∅` written as `\u2204`/`\u2205` escapes in source; rendered as the
	characters.
4. **State shape**: per (agent or session, path): { enrolledAt, lastVersion,
	lastWriter, checks: [{ setId, ranAt, checkedVersion, exit, tailRef,
	provenance: "live"|"recovered" }] }. Derive staleness at render time
	from lastVersion vs the latest observed version - never store staleness.
5. **Concurrency**: maxMonitorJobs admission, per-(file, checkSet)
	coalescing, the debounce window - specify the exact timer/queue mechanics
	against the jobs registry's admission behavior (jobs that cannot start
	are coalesced, not queued - the CAN-1 admission posture).
6. **The 12.2 inheritance is literal**: the check producer is the same
	governed-bash wrapper G2 specified for CAN-1 (one wrapper, two callers:
	the detach path and the monitor path). Do not design a second execution
	path.
7. **The tool surface**: `live_monitor` (enroll/off/list) and
	`live_monitor_check` (deep run) - minimal, read-only semantics, never a
	write path. The plant/child aggregation rides the existing live_plant
	report channel - extend the board row grammar, not the transport.
8. **The KV-cache budget**: the monitors stanza is stable-until-event;
	specify exactly which state changes mutate it (enrollment, settle,
	version bump, retirement) so the coders can test the change-set.
9. **The IDLE-forever posture**: monitors: "off" by default even when the
	plugin is enabled; the summary band renders only when monitors are on.
10. **Deliverables**: the design document (the band/summary templates, the
	state shape, the storage schema, the config surface with volatile
	marking, the ledger-string list, the module split against the existing
	Source/Function tree - expected new modules: Monitors.ts, Watchlist.ts,
	Band.ts or their exact placement), the updated SCHEME sections, and the
	smoke battery plan (M7) with R/D ids.

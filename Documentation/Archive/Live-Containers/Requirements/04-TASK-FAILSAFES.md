---
title: CAN-4 Task-Based Failsafes - the requirements
category: Archive/Live-Containers
kind: one-shot-record
date: 2026-10-19
status: complete
registry: Documentation/Archive/Live-Containers/Requirements/04-TASK-FAILSAFES.md
index: Documentation/INDEX.md
statuses:
    - name: the CAN-4 requirement spec
      state: resolved
      evidence: the durable spec
    - name: the CAN-4 implementation (the Failsafe module)
      state: implemented
      evidence: C2's wave-2 Failsafe module; the F-series smokes
    - name: the failsafe-trigger unification (the stale declaration IS the trigger)
      state: resolved
      evidence: the PLANTED-LEASE addendum replaced D2's parallel timer
---

# CAN-4 - TASK-BASED FAILSAFES

## 1. The requirement statement (the user's intent, faithful)

On the basis of task - NOT even notifying the conversation or the user - most tasks require
live-block-ability as failsafes in different scenarios, like the tool-coach: fully modify the
harness's behavior automatically.

## 2. The posture (severe extension)

The tool-coach is the precedent: it silently counts strikes, silently denies a bad call at tier 3
with a reason text, and silently resets on a user message - the model experiences the modification
as ordinary harness behavior (hook-dsh-tool-coach Apply.ts:392-445, 456-490).

The failsafe layer adopts that posture: when a task meets a trigger condition, the plugin modifies
behavior WITHOUT a conversational announcement.

The ledger (a file the user reads) is the ONLY notice channel besides the log.

The five notice channels, in escalating loudness (the config selects the ceiling per scenario):

1. **ledger only** (default - CAN-4's "not even notifying the conversation"): a byte-exact line in
   the plugin's ledger file. NOBODY in the conversation knows.
2. **log warn**: the context logger's warn line (the fail-open catch's channel).
3. **behavior change only** (silent modification): the harness behaves differently (a call detaches,
   a board plants, a guard threshold shifts) with no model-visible artifact at all.
4. **model-visible note**: a one-line standing block or an inline marker (the CAN-1 marker grammar).
5. **user-visible**: ONLY through existing surfaces the user already reads - the jobs session timing
   records in the GUI, the ledger file, the debug attachments. NEVER a new push notification
   surface.

## 3. The failsafe scenarios (most varied)

Each: trigger / automatic action / notice channel / containment.

1. **The build hangs.**

    A detached command's elapsed exceeds `hangBudgetMs` (default 120000) with ZERO new output bytes.

    Action: ledger `failsafe hang <job-id> (<n>s no output)`; on `hangAction: "kill"` (default
    "warn-only") kill with reason `live-hang`.

    Channel: ledger ONLY.

    Containment: the kill is the registry's, NEVER a subprocess force-kill by our code.

2. **The delegation stalls.**

    A planted board's member is [stalled] past `stallBudgetMs` (default 180000).

    Action: the board row changes (model-visible at next request - that is channel 4); if
    `stallAction: "prune"` also drop the member from the expect count so the board closes cleanly.

    Channel: 4 (+ledger).

3. **The limits approach.**

    The per-owner job admission is full, or maxConsecutiveWakes is exhausted, or maxLivePerAgent is
    hit.

    Action: pass-through inline (the CAN-1 admission failure path) + ledger
    `failsafe admission  inline <tool>`.

    Channel: 1.

4. **The drift.**

    The session-stats variables cross their configured thresholds (messages > N, sinceLastTool > S
    while a live board is open).

    Action: shift the severity rendering of the affected template blocks (a WARN line inside the
    frame).

    Channel: 4 (+ledger).

    This is the validator template's automatic twin: the user did NOT install the validator, and the
    failsafe layer renders the same guard from thresholds it owns.

5. **The retry loop.**

    The dedup counter (CAN-1 section 7) reaches `retryFailsafeCount` (default 3) for the same
    normalized command.

    Action: ledger `failsafe retry-loop <cmd>`; the third identical re-issued call gets the marker
    line extended with `[live] already running as <job-id> (3rd attempt) - use job_output.`

    Channel: 4 (model guidance), ledger 1.

6. **The orphaned board.**

    A planted board whose parent agent's requests have NOT run for `orphanBudgetMs` (default 600000)
    while members are still live.

    Action: ledger ONLY; the board is NOT withdrawn (the parent may return), and its members'
    reports keep arriving.

7. **The silent modification budget.**

    The meta-failsafe: the failsafe layer itself is capped (`failsafesPerTurn` default 5); exceeding
    it disables automatic modification for the rest of the turn (pass-through everywhere) and logs
    ONE summary line.

    The tool-coach NEVER meta-limits; we must, because CAN-4's posture is silent and an unbounded
    silent modifier is the ONE unforgivable failure mode.

8. **The context-drift guard.**

    The standing live section's bytes exceed `sectionBudgetBytes` (default 4096): the oldest blocks
    are collapsed to one-line summaries (NEVER dropped silently - the ledger records
    `failsafe  section-collapse <n>`), so the prompt tail cannot grow without bound.

## 4. The trigger conditions (the "basis of task")

The user said "on the basis of task".

Concrete reading: the triggers key on the observable shape of the task, NOT its semantic content.

- task = (conversation with) live jobs, planted boards, detached calls, their ages, their output
  rates, their counts.
- The plugin observes these through ctx.jobs events, post-execute, pre-step, and its own per-agent
  state - a pure observer; NO message content is read for trigger evaluation (privacy gate inherited
  from the v1 programmable stage's `context: "full"` rule; triggers NEVER need content).

## 5. The safety (never throw into the waterfall)

- EVERY failsafe action is wrapped in the family fail-open discipline; a failsafe that cannot act
  logs and passes through. The failsafe layer can NEVER deny a call, drop content, or cancel a job
  because of its own internal error.
- Killing is the ONLY destructive action and it goes through the registry's kill (a supported path),
  gated behind `hangAction`/explicit config.
- The silent-modification budget (scenario 7) bounds the layer's own power.
- The IDLE-forever posture applies: the failsafe layer ships disabled; `failsafes: "off"` is the
  default mode even when the plugin is enabled (on = ONLY templates render; failsafes are a second
  explicit flip).

## 6. The seam map

- EXISTS: the tool-coach's silent-modification precedent (pre-execute deny, pre-step reset,
  post-execute counters); ctx.jobs events (settle, progress) for hang/stall truth; the ledger
  contract; the registry kill path.
- MISSING: (a) the trigger engine (thresholds, budgets, the per-turn meta budget); (b) the channel
  selector; (c) the section-collapse path; (d) hang detection (output-bytes-per-job deltas - the
  ring offsets give this for free: track lastSeenOffset per job).

## 7. The acceptance criteria

1. **A hung job.**

    A hung job (no output past hangBudgetMs) produces a ledger line and, only if configured, a
    registry kill with a recorded reason.

2. **A stalled member.**

    A stalled board member changes at the next request, and a pruning action closes the board
    honestly.

3. **Admission limits.**

    ALL admission-limit events pass through inline with a ledger line - the model NEVER observes an
    unexplained inline-vs-detached inconsistency beyond the absence of the marker.

4. **The meta budget.**

    The meta budget disables automatic modification after failsafesPerTurn and logs the summary, and
    no test can drive the layer to throw.

5. **Off means off.**

    With `failsafes: "off"`, zero behavior modification occurs even with all templates enabled.

6. **Byte-exact ledger and silence.**

    Ledger strings byte-exact, and the "not even notifying" posture provable by asserting NO
    model-visible artifact on channel-1 scenarios.

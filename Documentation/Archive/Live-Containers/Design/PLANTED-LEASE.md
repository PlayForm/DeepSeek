---
title: PLANTED-LEASE (I5) - the planted-block lease + the stale declaration
category: Archive/Live-Containers
kind: one-shot-record
date: 2026-10-19
status: complete
registry: Documentation/Archive/Live-Containers/Design/PLANTED-LEASE.md
index: Documentation/INDEX.md
statuses:
    - name: the lease grammar (parent turns, N=3 default)
      state: resolved
      evidence: 10 conflict rows, all won or additive
    - name: the stale self-declaration
      state: resolved
      evidence: byte-exact; the SCHEME grammar list entry
    - name: the CAN-4 interplay (the stale declaration IS the trigger)
      state: resolved
      evidence: one truth source
    - name: the implementation
      state: implemented
      evidence: C2 closed residuals R1-R5; leaseTurns config shipped; prune never kills
---

# PLANTED-LEASE (I5) - the planted-block lease + the stale declaration, independently resolved

Status: RATIFICATION addendum for D2's IMPLEMENTATION-DESIGN.md sections 3.4 and 4.4, written
against the I3 APPEND-SEAM carrier (the registered dynamic context) and the I4 COMPLETION-ERGONOMICS
batched form.

Where this file conflicts with D2's 3.4/4.4, the RESOLVED rules below win for the C2 dispatch unless
the CONFLICT TABLE shows D2's wording survived.

ASCII + tabs throughout.

## 0. The one-paragraph decision

A planted block is not a passive board: it is a LEASE.

The board declares its reporters (the enrolled agent ids + the slot expectations) and a window of N
consecutive parent turns without a foldable report from a running member.

On expiry the block SELF-DECLARES `STALE (agent <agentId> unreported)` in its own frame - a
model-visible note that the parent's next request carries - and that declaration IS the CAN-4
delegation-stall failsafe trigger: the failsafe engine does not run a parallel timer, it reacts to
the declaration of the lease (the row flip, the prune, the re-dispatch hint).

The lease is turn-counted, with a wall-clock backstop for parents whose turns are not observable,
and both units are config, neither is invented at render time.

## 1. The verified machinery this rides on

1.1 **Board state.**

The board state is the parent's per-agent WeakMap (D2 3.4; 02 section 7 "the parent dies") - the
lease is part of that state, dies with the parent, and survives nothing else.

No lease can outlive its owning agent.

1.2 **Report channel.**

The report channel is L7 (D2 3.5): `agent/inbox/spliced` with `data.inserted.length > 0`, the
message's first line matching `[live-report] <plantId> <agentId> <status> <payload>`, and child-job
settlements and progress lines arrive through L6 (D2 3.6 step 6) and count as reports for lease
purposes.

ALL THREE carriers (02 section 4) reset the member's lease counter - a lease that ignores the
settlement carrier would declare a finished agent stale.

1.3 **Render surfaces.**

The render surfaces are two, per I3 2.6: the standing section carries running boards, and a STALE
declaration is a section change (channel 4 at the next parent request, D2 section 6 scenario 6).

There is no completion-style dynamic context for boards - a board is RUNNING state, not a settle
event; it lives in the standing section until close (I3 2.6 leaves exactly this scope there).

1.4 **Turn unit.**

A parent turn is one admission (the loop's request boundary - the same unit I4 1.1 uses for the
completion window).

The plugin observes parent turns via the assemble waterfall (the section renders once per request,
so the request count is the turn count).

A child turn is the child's own step, and the plugin does NOT observe child turns directly - only
their reports.

So the lease window is counted in PARENT turns between foldable reports from a member.

## 2. The lease grammar (the block's declared reporters + the window)

2.1 **The lease record.**

The lease record sits per board in the per-agent WeakMap state:

    lease:
    	reporters: { agentId: { turnWindow: <n>, remaining: <n>,
    		declared: false, declaredTurn: <n>, lastReportAt: <ts> } }
    	windowDefault: <N>	// plant.leaseTurns, default 3
    	clockFallbackMs: <n>	// plant.stallMs, default 45000
    	state: "open" | "stale" | "closed"

`reporters` starts as the enrolled members (expectAgents slots auto-enroll; memberIds pins them).

A member with status done/error/failed LEAVES the lease (settled members cannot go stale - 1.2).

A member with status running or stalled holds an entry.

2.2 **The window.**

`remaining` decrements by one at each parent turn (assemble) in which NO foldable report from that
member was folded since the previous parent turn.

Any foldable report (L7 match or L6 settle/progress) RESETS `remaining` to the member's window.

The declared reporter set is exactly the board's running members: the grammar is "the block declares
WHO owes it a report, and how many parent turns of silence it forgives".

2.3 **Expiry behavior.**

When `remaining` reaches 0 the member's lease EXPIRES and the member's row changes to the STALE
declaration (section 3) at the next assembly.

`declared: true` + `declaredTurn` are recorded and the ledger records
`lease expired <plantId> <agentId> (after <n> turns)`.

The declaration is emitted ONCE (declared guards it), and the row stays `[stalled]`/ STALE-flavored
on later renders without re-declaring (no per-turn nag - the count line already shows the stalled
count).

2.4 **The wall-clock backstop.**

The turn counter needs parent turns to tick, and an orphaned parent (no requests) cannot decrement
it.

The dual gate:

    stale := (remaining == 0) OR (now - lastReportAt > clockFallbackMs
    	AND at least one parent turn has occurred since open)

The clock clause alone (a parent gone for minutes) is the ORPHAN case (D2 scenario 6) and renders
the board-level STALE (section 3.4's variant), not a per-member declaration - the parent cannot act
while absent anyway, so the orphan declaration is for the parent's RETURN and the per-member
declaration is for the parent's next decision.

2.5 **Why parent turns, not wall-clock seconds, as the primary unit.**

The board's whole contract is "recomputed per parent request" (02 section 5), and the only event the
board can act on is a parent turn.

A 45 s wall clock on a parent that thinks for 90 s between tool calls declares healthy agents stale,
while a turn counter forgives slow reasoning and only punishes real silence across the board's
actual update boundaries.

The clock clause (2.4) covers the gap, and the default N=3 parent turns (~ the I4 batch window's
scale) is the ratified compromise.

## 3. The self-declaration shape (byte-exact)

3.1 **The per-member declaration.**

The per-member declaration replaces the `[stalled]` row content from D2 4.4:

    [stale]     <agentId> - unreported for <n> parent turns; re-dispatch or mark failed

The row key is `[stale]` (7 chars + spaces aligns the D2 4.4 column: done/
running/stalled/failed/unboarded are rendered with the label then spaces to column 12; `stale` is 5
chars like `failed`, so the alignment holds).

`<n>` is the expired window's turn count (the member's own N).

3.2 **The board-level declaration.**

The board-level declaration covers the orphan case (D2 4.4 verbatim - ratified):

    --- LIVE PLANT <id> (agent-board; expect <n>; status: STALE - no parent requests for <n>s) ---

3.3 **The re-dispatch hint line.**

The re-dispatch hint line is the parent-actionable form, appended as the LAST line of the board
frame when any member's lease has expired AND failsafes are "on" (the I4 2.1 idiom, one hint per
frame, composed not free-form):

    [live] next: <agentId> unreported for <n> turns - re-dispatch, or accept and prune (live_plant prune <plantId> <agentId>).

The prune action is the stallAction "prune" path (D2 section 6 scenario 2) surfaced as the model's
own tool call - the failsafe's automatic prune is config-gated, and the hint makes the manual twin
available.

With stallAction "warn-only" (the default) the hint still renders: it is channel 4 (a model-visible
note), not a silent modification, so the meta-budget (scenario 7) does not consume it.

3.4 **Restart honesty.**

A board record surviving a process restart without a live registry renders
`status: lost (process exit)` once, then withdraws (D2 4.4 verbatim).

A lease record never outlives its board; the restart path is unchanged and the lease adds no restart
surface.

## 4. The interplay with the task-based failsafes (CAN-4)

4.1 **The declaration is the trigger.**

D2 section 6 scenario 2 ("THE DELEGATION STALLS - a board member [stalled] past stallBudgetMs") runs
on a wall-clock threshold that DUPLICATES the clock clause of the lease and ignores the turn clause.

RESOLVED: the failsafe engine consumes the lease state instead of timing the board itself -

    trigger := lease.declared == true for any member (the row flip in 3.1)
    action  := stallAction ("warn-only": nothing further, the row IS the
               warn; "prune": drop the member from expect, ledger
               `member dropped <plantId> <agentId> (pruned)`, the board may
               close cleanly when the remaining count reaches done)
    channel := 4 (the model-visible row + 3.3's hint), plus channel 1
               (the ledger line from 2.3)

The `stallBudgetMs` knob becomes the BACKSTOP for the clock clause's own escalation (a member stale
past clockFallbackMs + stallBudgetMs with no declaration possible because the parent never turned =
the orphan path, 2.4).

One truth source, one trigger, no duplicate timers.

4.2 **The failsafe ordering.**

The lease expires during the assemble (the turn decrement is an assemble-time computation, before
render), the declaration renders in the SAME assembly's frame, and the failsafe's prune (if
configured) acts after the render, mutating the state for the NEXT assembly.

The declared row and the prune are therefore never in the same rendered frame - the model always
observes the stale row at least one turn before any automatic drop.

This is the disclosure discipline (D2 section 6: failsafes key on observable shape, the plugin is a
pure observer).

4.3 **The meta-budget.**

The prune is the lease's only automatic modification, and it counts against failsafesPerTurn (5).

The declaration itself is a render, not a modification, and never counts.

4.4 **`failsafes: "off"` (the default).**

The lease still expires and the row still changes (that is the board's own render, the CAN-2
surface) - only the automatic prune and the 3.3 hint line are gated off.

The board's honesty is not a failsafe; the ACTION of the failsafe is.

## 5. The multi-agent count mismatch

5.1 **Idempotent reports.**

A reporter reports twice: reports are IDEMPOTENT per (plantId, agentId, turn).

A second report from the same agent in the same parent turn resets the same lease entry (remaining
:= window) and updates lastReport, and the row shows the newest payload (the coalescing rule,
section 6).

No counter inflates, no row duplicates.

Ledger `report <plantId> <agentId> (<n> bytes)` once per folded report regardless of repeats.

5.2 **A dead agent's slot.**

The settle event (L6) changes the row to `[failed] <reason>` or `[done]` and REMOVES the lease entry
(2.1) - a dead agent cannot be stale, it is already terminal.

If the child was killed without a settlement reaching L6 (cause teardown, owner gone), the lease
WINS: the entry stays running until expiry declares it stale, and the parent then re-dispatches or
prunes.

The board never shows a phantom running agent unless the harness itself has no truth (exactly the
case the lease exists for).

5.3 **Fewer children than expectAgents.**

Empty slots render `[none] slot-<n>` (02 section 7) and hold NO lease entry - nothing owes a report.

After closeMs the empty slots are dropped and the board closes (D2 3.4, ratified).

A slot auto-enrolls LATE (a child the plugin observes while slots are free - 02 section 4): the
enrollment opens the entry with the FULL window, not a partial one, so the board's open time does
not eat the new member's grace.

5.4 **More children than slots.**

Overflow members render `[unboarded]` (02 section 7) and are NOT reporters - no lease entry, no
stale declaration, and their completions still count in the total line (D2 3.4).

An unboarded child's report (`[live-report]` with an unenrolled agentId) is folded into the total
counts only, never into a row.

5.5 **Count invariants.**

`total: <d> done / <r> running / <s> stale / <e> empty` - the third field is `stale` (declared
members) not `stalled` (pre-declaration), so the header count and the row labels cannot disagree.

D2 4.4's `<s> stalled` slot is REDEFINED to count stale-declared members (the pre-declaration
`[stalled]` row still exists between the last report and expiry, and it counts into `<s>` too; the
label distinction is row-level, the count field is the union).

## 6. The report-rate coalescing + the aggregate runner

6.1 **Coalescing.**

Coalescing (D2 3.4 + 02 section 7, ratified) is per-member at `reportRateMs` (default 2000): the
FIRST report in any 2 s window is folded and counted (it resets the lease, 2.2), and later reports
in the window coalesce into the LAST (they overwrite the row's `lastReport` payload and bump
`lastReportAt` WITHOUT resetting the lease clock again - one reset per window is the bound).

A coalesced report never expires a lease: the `lastReportAt` bump serves the clock clause (2.4).

6.2 **The aggregate runner.**

An `aggregate` board recomputes its one computed line (`files changed: 17 | tests: 3 failing`) on
EVERY fold - per report and per L6 settle, at fold time, not render time.

The lease applies to aggregate boards identically (each contributing member holds an entry), and the
computed line is NOT the report.

The recompute is pure (read members' statuses + payloads -> format), so it can run at render time
when a fold lands between the decrement and the assembly; C2 may compute lazily at render either
way - the only contract is that the line never lags its inputs by more than one fold.

6.3 **The todo-fill variant.**

The report grammar is `[live-report] <plantId> <agentId> todo <itemIndex> <done|running>` (D2 4.4).

The lease entry stays per-AGENT (not per-item): an agent working through 5 todo items reports per
item, and each fold resets the agent's lease.

An agent with no un-started items left is settled by its own final report (`todo <itemIndex> done`
for its last assignment) - the plugin marks the member done when the child's L6 settle confirms, and
until then the lease guards it.

## 7. Alignment with the I3 carrier + the I4 ergonomics

7.1 **Cache cost.**

The board is RUNNING state and stays in the standing section (I3 2.6), and the declarations of the
lease are section changes on the same surface.

The cache cost per declaration is I3 3.3's cost (in-history append of the full prompt on capable
routes; node-0 miss on incapable routes), bounded because declarations are at-most-once per member
per board (2.3), so a board costs at most (members + 1 orphan) section changes beyond its
open/close.

7.2 **The closing line.**

When the board CLOSES (all members settled), the closing line renders for one request, then
withdraws (D2 3.4).

If a board closes with stale-declared members pruned by 4.1, the closing line counts them honestly:
`board closed: 3/5 done, 2 pruned stale in 41s` (byte-exact variant of 02 section 6's closing line;
`0 pruned` renders `board closed: <n>/<n> done in <n>s` exactly as 02 wrote it).

7.3 **No completion-carrier interaction.**

Board events are not job settlements for the parent's own jobs and never produce an I3/I4 snapshot.

The only cross-surface case is 02 section 5's optional push (v1.1, the parent woken on the last
settle) - out of scope here, unchanged.

## 8. The knobs (the addition to D2 2.4's plant block)

    leaseTurns: number, default 3	// the N-turn window per member
    leaseTurns is volatile, like the rest of plant.*; clockFallbackMs is
    plant.stallMs (renamed in prose only - the knob keeps D2's name and
    default 45000; this file calls it the clock clause's budget).

No other new knob: stallBudgetMs keeps its role as the orphan-escalation backstop (4.1), and
stallAction, reportRateMs, closeMs, orphanBudgetMs, boardsPerAgent stay unchanged.

## 9. The acceptance criteria

    A1: a running member that produces no foldable report for N=3 parent
        turns renders the `[stale]` row (3.1) at the fourth turn's
        assembly, exactly once, with ledger `lease expired <plantId>
        <agentId> (after 3 turns)`.
    A2: a report folded in ANY turn (L7 match, L6 settle, L6 progress)
        resets that member's remaining to N; a member reporting every
        turn never expires.
    A3: a settled member (done/error/failed) holds no lease entry and is
        never declared stale, including a member killed without an
        observed settle only if L6 later confirms - otherwise 5.2's
        lease-wins rule applies and A1 covers it.
    A4: the wall-clock clause (2.4) declares the orphan board's header
        STALE (3.2) when the parent is silent past stallMs, without
        flipping per-member rows (the parent cannot act).
    A5: the failsafe prune fires only on `declared == true`, after the
        stale row rendered at least one assembly (4.2), ledgering
        `member dropped <plantId> <agentId> (pruned)`, and counts
        against failsafesPerTurn.
    A6: a member reporting twice in one turn yields one row, one lease
        reset, and the newest payload (5.1); total-line counts never
        double-count.
    A7: overflow members never hold lease entries and never appear in
        the stale count; late enrollees get the full window (5.3-5.4).
    A8: with failsafes "off", the `[stale]` row still renders (A1) but
        no prune and no 3.3 hint line appear (4.4).
    A9: the 3.3 hint line is one line, ASCII, <= 200 bytes, and appears
        at most once per board frame; the closing line (7.2) matches the
        byte-exact variants.
    A10: no lease path ever throws into the assemble waterfall (fail-open
        wrapped, D2 section 6's safety paragraph applies verbatim).

## 10. RESIDUALS

    R1: the parent-turn count relies on the assemble waterfall firing
        once per admission; if a route re-assembles without admitting
        (a suppressed-context read, I3 R2's shape), the counter must key
        on the admission, not the render - C2 must verify the waterfall
        pass carries an admission discriminator, or fall back to the
        clock clause as the primary (knob-flip, no grammar change).
    R2: child-turn windows (the child's own N steps) were considered and
        REJECTED for v1: child turns are unobservable to the parent's
        plugin without a child-side plugin install; the parent-turn
        window + the clock clause covers the intent. A child-side
        reporter heart-beat is FUTURE.
    R3: N=3 is a default, not a derivation; workloads with very slow
        members need leaseTurns raised (a config field, per 8). No
        per-board override surface exists in v1 - the tool signature
        `live_plant(id, plantType, template?, expectAgents, memberIds?)`
        would need a 6th optional arg; deferred to keep D2's signature.
    R4: the `[stale]` row label is a new status word in the D2 4.4
        column; the SCHEME's grammar list and the smoke byte assertions
        must add it (A2's coverage is additive per smoke-writing).
    R5: whether the prune should also ctx.jobs.kill a still-running
        child job for the pruned member (the member is dropped from
        expect but the child may still be spending tokens) is left to
        C2 with the default NO (observe, do not cancel - D2's
        containment rule: killing is the registry's, gated behind
        hangAction/config only).

## 11. CONFLICT TABLE (this file vs D2 3.4/4.4 vs the winner)

| #   | Point                      | D2 3.4/4.4                                                                                                | I5 (this file)                                                                                                                      | Winner + reason                                                                                                                                                                                                        |
| --- | -------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Staleness unit             | wall-clock only: stallMs 45 s per member, orphanBudgetMs 600 s per board, stallBudgetMs 180 s to escalate | N=3 PARENT TURNS primary + stallMs clock clause backstop (2.2-2.4)                                                                  | I5: the board acts only at parent turns (02 section 5); a 45 s clock declares slow-thinking parents' healthy agents stale; D2's knobs survive as the clock clause and the orphan escalation                            |
| 2   | Declaration trigger        | failsafe scenario 2 keys on `[stalled] past stallBudgetMs` - a parallel timer in the failsafe engine      | the stale declaration IS the failsafe trigger: the engine consumes `lease.declared`, no duplicate timer (4.1)                       | I5: one truth source; D2's parallel timer double-fires and disagrees with the row the model actually reads                                                                                                             |
| 3   | Stale row shape            | `[stalled] <agentId> - no report for <n>s`                                                                | `[stale] <agentId> - unreported for <n> parent turns; re-dispatch or mark failed` (3.1)                                             | I5: D2's row states the clock, not the decision; the retained spec names the byte shape `STALE (agent X unreported)` and the parent needs the action, not the seconds. Board-header orphan STALE stays D2 4.4 verbatim |
| 4   | Total-line third field     | `<s> stalled`                                                                                             | `<s> stale` = declared + pre-declaration stalled union (5.5)                                                                        | I5: keeps header counts consistent with row labels; D2's `<s>` slot is redefined, not removed                                                                                                                          |
| 5   | Re-dispatch path           | implicit (the parent "can re-dispatch or mark the slot failed" - no mechanism)                            | composed hint line + `live_plant prune` tool twin, prune still config-gated (3.3, 4.1)                                              | I5: the hint is I4 2.1's idiom applied to boards; D2's prose action becomes a callable, gated exactly like the automatic one                                                                                           |
| 6   | Dead agent's slot          | "the board's truth source is settlement, not hope" (02 section 7, carried)                                | lease-wins when NO settlement reaches L6 (teardown/owner-gone): running until expiry declares stale (5.2)                           | I5: D2's rule is right where truth exists; the lease covers the no-truth case without contradicting it                                                                                                                 |
| 7   | Coalescing reset semantics | per-member reportRateMs, "later reports coalesce into the last"                                           | first report in window folds + resets lease; coalesced reports bump payload/clock but reset the lease at most once per window (6.1) | I5: D2's wording would let a flood reset the lease repeatedly, defeating N; one reset per window is the bound the coalescing exists for                                                                                |
| 8   | Aggregate recompute timing | unstated in 3.4/4.4 (02 section 3 says "recomputed per report")                                           | recompute at fold time, pure function, may be lazy at render; never lags inputs by more than one fold (6.2)                         | I5: supplies the rule D2 omitted; no byte change                                                                                                                                                                       |
| 9   | Late enrollment window     | unstated                                                                                                  | a late enrollee gets the FULL lease window (5.3)                                                                                    | I5: the board's open age must not eat a new member's grace; trivial, but D2's open-time framing implies the contrary                                                                                                   |
| 10  | Failsafe gating of the row | scenario 2's row flip is a failsafe action                                                                | the row flip is the BOARD's render, always on; only prune + hint are failsafes-gated (4.4)                                          | I5: board honesty is CAN-2, not CAN-4; gating the row behind `failsafes: "off"` would hide a dead member by default                                                                                                    |

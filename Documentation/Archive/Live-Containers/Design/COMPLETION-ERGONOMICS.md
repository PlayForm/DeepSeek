---
title: COMPLETION-ERGONOMICS (I4) — the completion-block ergonomics
category: Archive/Live-Containers
kind: one-shot-record
date: 2026-10-19
status: complete
registry: Documentation/Archive/Live-Containers/Design/COMPLETION-ERGONOMICS.md
index: Documentation/INDEX.md
statuses:
    - name: the batched-append rule (per-turn aggregation, the 4 KiB cap)
      state: resolved
      evidence: 6 wins and 1 no-conflict
    - name: the resume-hint rule (one composed line, at most 200 bytes)
      state: resolved
      evidence: the D2 gap filled by this addendum
    - name: the failed-entry format (the exit code and kill reason lines)
      state: resolved
      evidence: the explicit lines
    - name: the implementation
      state: implemented
      evidence: C2 closed residuals R1-R4; completionCapBytes 4096 shipped
    - name: the failures-first sort smoke seed
      state: open
      evidence: implemented but not explicitly seeded - optional J-check
---

# COMPLETION-ERGONOMICS (I4) - the completion-block ergonomics, independently resolved

Status: RATIFICATION addendum for D2's IMPLEMENTATION-DESIGN.md section 4.2, written against the I3
APPEND-SEAM carrier (the registered dynamic context). Where this file conflicts with D2's 4.2, the
RESOLVED rules below win for the C2 dispatch unless I3 already ratified D2's bytes (the CONFLICT
TABLE at the end). ASCII + tabs throughout.

## 0. The one-paragraph decision

A detached batch of N commands must NOT produce N separate completion blocks: every settle between
two admissions merges into ONE pending text (one wrapper line + N frames + ONE resume-hint line),
delivered as ONE sourced user-role snapshot (I3 2.3). The block ends with a single "what to do next"
line so the model's next move is productive continuation (the schedule-more loop), not surprise. The
aggregation window is PER TURN (admission-to-admission), never per-count or per-time: the loop
admits when it admits, so the turn is the only boundary the carrier actually has. Ordering inside
the merged text is SETTLE ORDER (the same first-wins order I3 3.5 verified for the carrier),
disclosed by the standing caveat line; the frame's own timestamp + job id make the dispatch order
reconstructible.

## 1. The batched-append rule

1.1 The window: the pending slot (I3 2.3's per-agent slot) is the aggregation buffer. A settled job
APPENDS its wrapped frame to the slot; the slot drains to zero when the frame text is durably
delivered (consume-on-logged-snapshot) and is cleared. Everything that settles before the next
admission therefore ships as one snapshot; everything after waits for the following one.

    - window = one turn (one admission). NOT "first N then flush":
      the loop's admission cadence is not under plugin control, and a
      time-based flush would emit a snapshot no request will carry.
    - no partial-flush: an arriving settle NEVER evicts pending frames;
      it merges. The only cap is bytes (1.3).
    - no re-batching across turns: a delivered snapshot is final; a
      later settle starts a NEW pending text with a fresh wrapper line.

1.2 The merge shape: frames in settle order, blank-line separated, ONE wrapper line above the first
frame, ONE resume-hint line below the last frame (section 3). The per-job "[live] job_output ... to
read the full output." line stays INSIDE each frame (D2 4.2 verbatim, I3-ratified); the shared
resume hint is the LAST line of the merged text.

1.3 The byte cap: the pending text is bounded at 4 KiB total (N x 2 KiB-per-frame unbounded was
never acceptable). When a merge would exceed the cap, the OLDEST frames are truncated first: the
frame keeps its header, status, and elapsed lines, its output tail is shortened to the remaining
budget (minimum 256 bytes or the marker
`output (tail elided; cap reached - job_output <job-id> for the full output)`), and the ledger
records `completion truncated <job-id> (<kept> bytes)`. Failed frames are NEVER truncated before
running frames in the same batch - the error tail is the higher-value content (section 4.3).

1.4 Why batched: (a) the conversation stays lean - one user-role snapshot per turn regardless of N;
(b) the KV-cache cost is the merged text's own bytes, appended once (I3 3.1); (c) the model reads
one coherent report instead of interleaved per-command interrupts.

## 2. The resume-hint rule

2.1 Every pending text ends with EXACTLY ONE hint line, byte-exact:

    [live] next: <hint>

2.2 The hint is COMPOSED, not free-form, from the batch's aggregate state, in this priority order
(first matching rule wins):

    - any failed/killed frame:
    	[live] next: <job-id> failed (<cause>) - read job_output <job-id>, fix, and re-run the failed steps before continuing the remaining ones.
    - all frames in this batch settled and other live jobs remain:
    	[live] next: <k>/<n> done - review the output above, then continue the build steps; job_output <job-id> for details.
      where <n> = jobs dispatched in the turn-set the batch covers and
      <k> = settled so far (D2's "3 of 5 commands finished" shape,
      normalized to "k/n done").
    - the batch drained the fleet (no live jobs remain):
    	[live] next: all <n> finished - review the outputs above, then continue the build steps.
    - the batch contains only running-adjacent context (cannot occur in
      a completion text; reserved for the fallback carrier).

2.3 Grammar: the hint is ONE line, ASCII, <= 200 bytes, no job output echoed into it (the frame
carries the output; the hint only names the action). The phrase "continue the build steps" is the
template's stand-in for the batch's own command domain: the composer derives the domain noun from
the first cmdHead in the batch (its first token: cargo/npm/pnpm/make/bash -> "the <token> steps";
unknown -> "the build steps"). The schedule-more loop this enables is the point: the model gets a
concrete, cheap next action instead of deciding from silence.

2.4 The hint is part of the DELIVERED snapshot; it is not re-rendered in later turns. A hint that
turns out wrong (the model already acted) costs nothing - it is one stale line in history, like any
completion record.

## 3. The byte-exact shape

The merged pending text (N=2 example; wrapper + frames + hint):

    [live] completion report (harness-appended; not a user request):
    --- LIVE CONTAINER <job-id-a> completed ---
    status: <status> (<cause>: producer|kill|teardown)
    elapsed: <n>s
    output (tail up to 2 KiB):
    <tail; stderr in a [stderr] section exactly as job_output does>
    [stderr]
    <stderr tail>
    --- END LIVE CONTAINER <job-id-a> ---
    [live] job_output <job-id-a> to read the full output.

    --- LIVE CONTAINER <job-id-b> completed ---
    status: <status> (<cause>: producer|kill|teardown)
    elapsed: <n>s
    output (tail up to 2 KiB):
    <tail; stderr in a [stderr] section exactly as job_output does>
    [stderr]
    <stderr tail>
    --- END LIVE CONTAINER <job-id-b> ---
    [live] job_output <job-id-b> to read the full output.
    [live] next: <hint>

Rules: N=1 is the same text with one frame (degenerate batch = D2 4.2 verbatim between the wrapper
and the hint). The wrapper line is I3 2.5 byte-exact. The frame bytes are D2 4.2 byte-exact (I3
ratified). The hint line is NEW (this file, section 2). The last-line stack "[live] job_output ... /
[live] next: ..." is intentional: the per-frame pointer is per-job, the hint is per-batch. Blank
line between frames; NO blank line between the last frame's job_output line and the hint. Tab-free
render (spaces in frames exactly as D2 4.2 shows); ASCII only.

## 4. Ordering and failure entries

4.1 Ordering: SETTLE ORDER inside the merged text (the order the plugin appended frames to the
slot). Rationale: it is the only order the carrier guarantees anyway (I3 3.5 - one message in settle
order), and fabricating dispatch order would require re-sorting frames the carrier already merged.
Dispatch order is RECOVERABLE, not rendered: each frame carries the job id and elapsed, and the
standing section's fleet line plus the frame timestamps reconstruct the dispatch sequence when the
model needs it. The standing caveat line (`completions may arrive out of order`) already discloses
this; the hint's k/n counts are settle-aggregates and never imply order.

4.2 Cross-turn ordering: a job dispatched in turn T may complete in the snapshot of turn T+2
alongside a turn-T+1 job. This is correct and disclosed; no cross-turn regrouping is attempted.

4.3 Failed-command entries: a failure is a FIRST-CLASS frame, same shape as D2 4.2's failure
variant:

    --- LIVE CONTAINER <job-id> completed ---
    status: error (cause: producer)
    elapsed: <n>s
    exit: <code>
    output (tail up to 2 KiB):
    <stderr-weighted tail; stdout section after [stderr] if both present>
    [stderr]
    <stderr tail>
    --- END LIVE CONTAINER <job-id> ---
    [live] job_output <job-id> to read the full output.

    - `exit: <code>` is an ADDED line (present only when the cause is a
      process exit with a code; absent for kill/teardown) - the exit code
      is the single most diagnostic fact a failure frame can carry and
      the settled view's detail already has it (D2 5.1 step 2's process
      Outcome maps exit codes).
    - killed variant: `status: killed (cause: kill)` + the kill reason in
      place of exit, one line: `kill reason: <reason, first 80 bytes>`.
    - failure frames sort FIRST in the merged text (settled-failed before
      settled-ok within the same batch) regardless of settle order, so
      the resume hint (2.2 rule 1) matches the first thing the model
      reads. This is the ONE deliberate deviation from pure settle order;
      the caveat line covers it.
    - a failed frame is never the only content dropped by the byte cap
      (1.3): failures keep >= 512 bytes of error tail before any running
      frame's tail is shortened.

## 5. Acceptance criteria

    A1: N>=2 jobs settling between two admissions produce exactly ONE
        user-role snapshot (one wrapper line, one hint line) - verified by
        the session/event observer shape (I3 R5) + ledger
        `completion rendered <batch-len> bytes`.
    A2: a settle arriving AFTER a drain opens a new pending text with a
        fresh wrapper + hint; no carryover of the previous batch's hint.
    A3: every delivered text ends with exactly one `[live] next: ` line
        matching one of the 2.2 rules; byte count <= 200 for the line.
    A4: failed frames carry `exit: <code>` (or the kill-reason line),
        sort before ok frames in the same batch, and are truncation-
        protected per 1.3.
    A5: the merged text never exceeds 4 KiB; truncation is ledgered
        per-frame; truncation never removes the frame header/status.
    A6: frame bytes between wrapper and hint match D2 4.2 byte-exact
        except the added `exit:`/`kill reason:` lines on failure frames.
    A7: no completion text renders without an observed `settled` event
        (I3 3.6 carries over); owner-gone and awaited skips behave per
        I3 2.2 / D2 3.3 step 5.
    A8: the standing section never carries completed frames (I3 2.6);
        a completion appears in exactly one snapshot, exactly once
        (consume-on-logged-snapshot), and re-delivers only on an aborted
        attempt.

## 6. RESIDUALS

    R1: the exit code's exact source field in the settled view's detail
        (`exit code` vs `status` mapping) must be confirmed against
        jobs-local lib at C2; the frame grammar is stable either way.
    R2: the hint's domain-noun derivation (2.3) is heuristic (first
        cmdHead token); a batch mixing cargo+npm gets "the cargo steps" -
        acceptable, documented; a smarter per-domain phrase is FUTURE.
    R3: the k/n denominator (2.2 rule 2) counts the turn-set's dispatched
        jobs; a job dispatched mid-turn-set after an earlier snapshot is
        counted in the NEXT batch's n - the counts can look non-monotonic
        across turns; disclosed here, smoke A3 asserts the line shape only.
    R4: the 4 KiB cap interacts with I3's per-frame 2 KiB: a 3-frame batch
        of full-size frames truncates all three; if C2 finds real batches
        commonly exceed this, raising the cap is a Config field, not a
        grammar change.
    R5: failure-frames-sort-first (4.3) means the merged text is NOT
        byte-reconstructible from settle order alone; the smoke must seed
        the sort explicitly.

## 7. CONFLICT TABLE (this file vs D2 section 4.2 vs the winner)

| #   | Point                    | D2 4.2                                                                                      | I4 (this file)                                                                                | Winner + reason                                                                                                                              |
| --- | ------------------------ | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Batched form             | "batched form" named but the 4.2 bytes are PER-JOB only; no merge grammar defined           | explicit per-turn aggregation window, merge shape, no-partial-flush rule (1.1-1.4)            | I4: the rule D2 named but did not specify; I3 2.3's merged pending text already implies it                                                   |
| 2   | Resume hint              | absent from 4.2's bytes (the per-frame `[live] job_output ...` pointer is the closest line) | ONE composed `[live] next: <hint>` line as the LAST line of every delivered text (2.1-2.3)    | I4: the retained spec's resume-hint rule; I3 2.5 assumed a 4.2 "resume-hint line" that 4.2 does not actually contain - this file supplies it |
| 3   | Block bytes              | frame verbatim                                                                              | frame verbatim + wrapper (I3) + hint line; failure frames add `exit:`/`kill reason:` (3, 4.3) | I3+I4: additive deltas only, each one line; D2 frame bytes stand                                                                             |
| 4   | Ordering                 | unspecified inside the block                                                                | settle order, failures-first, disclosed by the standing caveat (4.1, 4.3)                     | I4: settle order is the only order the verified carrier (I3 3.5) guarantees; sorting failures first serves the resume hint                   |
| 5   | Failed-command entries   | "status: error with the error tail; killed variant with the kill reason"                    | same + explicit `exit: <code>` line and kill-reason line, truncation protection (4.3)         | I4: adds the exit code - the diagnostic fact D2's prose omitted from the bytes                                                               |
| 6   | Byte cap                 | 2 KiB per frame tail                                                                        | 4 KiB per MERGED text with ordered truncation (1.3)                                           | I4: without a merge cap the batched form is unbounded; per-frame 2 KiB (I3 5) still bounds any single frame                                  |
| 7   | Withdrawal / render-once | frame renders for ONE assembly then withdraws                                               | carried via I3: consume-on-logged-snapshot, withdrawal = absence (A8)                         | I3: carrier-verified; no conflict with D2's intent                                                                                           |

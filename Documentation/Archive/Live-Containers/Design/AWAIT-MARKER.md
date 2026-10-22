---
title: AWAIT-MARKER (I2) — the per-call block-on-demand design
category: Archive/Live-Containers
kind: one-shot-record
date: 2026-10-19
status: complete
registry: Documentation/Archive/Live-Containers/Design/AWAIT-MARKER.md
index: Documentation/INDEX.md
statuses:
    - name: the await marker (the first-key __await true prefix)
      state: resolved
      evidence: 3 wins in the conflict table; ratified
    - name: the effective-gate order
      state: resolved
      evidence:
          detach AND mode not off AND not non-detachable AND not await-marker AND policy decides
    - name: the KV-cache invariant
      state: resolved
      evidence: an awaited call's transcript shape is byte-identical to the inline shape
    - name: the implementation
      state: implemented
      evidence: the Detach module; the J-series smokes
---

# AWAIT-MARKER - The Per-Call Block-On-Demand Design (I2 Addendum)

Status: ratified design for the live tool-call transformation (CAN-1). Surface: this file is the
durable input for the C2 coder brief (D2 dispatch section 9). Where this file conflicts with
IMPLEMENTATION-DESIGN.md section 4.3, THIS FILE WINS (the conflict table is in the I2 report to the
parent).

## 1. The Principle

The LIVE transformation detaches command calls by default. The model gets a marker line back
immediately. It keeps generating while the command runs. Fire-and-forget is the DEFAULT, but it is
NOT universal. Some calls are genuinely sequential. The model reads a file because the next emitted
step depends on its content. Or a short setup command must finish before the next command makes
sense. Detaching those costs a wasted turn and a hallucinated continuation. The block-on-demand
marker is the model's per-call escape hatch. ONE byte-exact first-key in the call arguments promotes
a single call from detached back to synchronous. The marker applies per call, NEVER per session,
NEVER per tool. The default stays fire-and-forget everywhere else.

Symmetry with the normalize family: hook-dsh-normalize-dash detects the opt-out string prefix
`{"__normalize":false` on the FIRST delta of a call (Normalize.ts:65-69,
`RawCall = Original.argumentsDelta.startsWith('{"__normalize":false')`) and leaves it in the output
(transparency, NO stripping). The await marker reuses the same shape in a different carrier. It uses
NOT the text delta, the tool-call arguments delta.

## 2. The Marker Grammar (byte-exact)

The marker is a FIRST-KEY prefix of the serialized tool-call arguments:

    {"__await":true

Byte rules:

- The arguments JSON object's first serialized key is `__await`, value exactly the literal `true`
  (no quotes, no other value).
- NO whitespace variants are recognized. The detection is the same string prefix test as the
  normalize family, `argumentsDelta.startsWith('{"__await":true')`, applied to the FIRST arguments
  delta of the call (the delta that carries the first bytes of the arguments string).
  `{"__await": true` (space), `{'__await':true}`, `{"__await":"true"}` are NOT markers. They are
  ordinary argument bytes that flow through untouched.
- Detection is prefix-only. The rest of the arguments object is NEVER parsed to find the marker. If
  the model does NOT put it first, it is NOT a marker. The extra key then simply rides along as an
  unknown property and is harmless (see 3.1).
- The marker is NOT stripped. The executed call and its log carry the extra key (the same no-desync
  transparency rule as `{"__normalize":false`). dsh-tools CANNOT rewrite arguments and nothing needs
  to. The key is legal (3.1) and ignored by every runner body.
- `{"__await":false` as the first key is NOT a marker. It is treated as marker-absent (the call
  detaches per the normal policy). It exists so a model that wants to be explicit about NOT awaiting
  has a legal spelling. It must NEVER be refused or misread as an await request.

Model-facing teaching line (the standing section's instructions, rendered only when the transform is
active - detach.mode != "off"):

    To run one command inline and wait for its real output, put {"__await":true first in the call arguments.

One line, NO examples beyond the literal. The marker is self-describing. The KV-cache note (6)
forbids richer per-call explanation.

## 3. The Effective-Gate Formula

The detach decision for one tool call, in the exact evaluation order of the L2 pre-execute waterfall
(D2 section 3.2; the marker's position is fixed here):

    DETACH = TRANSFORM_ON
           AND NOT NON_DETACHABLE(tool)          -- write/edit/raw-write/normalize-file + non-command family (Policy.ts, checked FIRST)
           AND NOT AWAIT_MARKER(call)            -- the marker short-circuits: -> inline
           AND NOT DEDUP_LIVE(agent, call)       -- a still-live job for the same key -> same marker, not a detach
           AND NOT ESCALATION(call)              -- sandbox_permissions in args -> inline via the stock approval flow
           AND POLICY_DECIDE(Exec, State)        -- long-running | all | selected guards (capacity, minLatencyMs, interactive, meta-budget)

So the INLINE conditions are the negations. `AWAIT_MARKER(call)` is the prefix test of section 2
evaluated on the FIRST arguments delta. The marker check sits AFTER the non-detachable check and
BEFORE dedup/escalation/policy. After non-detachable: a marked call to a non-detachable tool is
handled by the tool-class rule (4.1), NOT the marker rule. The class rule wins because the call was
NEVER detachable anyway. Before escalation: a call carrying BOTH `{"__await":true` and
`sandbox_permissions` runs inline through the stock escalation approval flow. The marker is then
redundant but harmless. It must NOT bypass or duplicate the approval path (the transform NEVER
re-implements approval). Before policy: the marker is an explicit model override of the statistical
guards. minLatencyMs and the interactive detector do NOT veto a marked call. The marker is the model
saying "I know this looks short/interactive; I need it inline." Capacity (maxLivePerAgent) is NOT
part of the marker shortcut's concern. An inline call consumes NO live slot.

Ledger line on the marker path: `await marker -> inline <tool>` (D2 4.3 wording retained).

## 4. The Edge Cases

### 4.1 The marker in a NON-COMMAND or NON-DETACHABLE call - IGNORED, never refused

A call to a tool outside the detachable set (the mutation family, or any tool whose Exec is not a
spawned command) that carries the marker: the marker is IGNORED. The call was going to run inline
regardless. Refusing it (a validation error surfaced to the model) would penalize a harmless no-op
and teach the model to fear the marker. Ledger: `await marker ignored (tool not detachable) <tool>`,
emitted once per occurrence. The marker key itself still rides in the arguments (NEVER stripped).
The schema legality of 3.1 applies to EVERY tool, NOT only command runners. The compiled schemas all
admit unknown keys.

### 4.2 The marker arriving mid-stream, not first

If the prefix test fails on the FIRST arguments delta but the completed arguments happen to contain
`{"__await":true` as a non-first key: NOT a marker. NO re-parse, NO retroactive promotion. The call
detaches (or not) per the normal gates. The stray key is ignored by the runner body. This is the
cost of prefix detection and it is accepted. The teaching line says FIRST. Models that follow it get
the behavior. Prefix detection keeps the hot path O(prefix) with ZERO JSON parsing.

### 4.3 The marker on a DEDUP or ESCALATION collision

A marked call whose dedup key matches a still-live job: the dedup rule wins (the job is already
running; running the same command again inline would be the exact duplicate the dedup exists to
prevent). The model receives the same already-running marker as an unmarked duplicate; the retry
counter and the retry-loop failsafe apply identically. A marked call carrying an escalation request
runs the stock approval flow inline (section 3) - the approval may deny, and a denied approval is
not a transform concern.

### 4.4 The marker and the marker emission (the completed call's own tag)

An inline (marked) call produces NO live tag, NO live line, NO completion append: its result IS the
synchronous tool result the model reads in the same turn. The marker's effect is fully realized at
execute time; nothing asynchronous survives it. This is the closure property the KV-cache note (6)
depends on.

## 5. The Interplay With The Transformation Policy

- The marker is a NEGATIVE gate in the detach formula only. It does not change Policy.ts's
  detachable-set classification, the dedup key, the capacity accounting (an inline call never enters
  the registry), the per-agent history (an inline call's duration IS recorded by L4's post-execute
  listener like any inline call, and may raise the same-prefix historical average - honest, since a
  repeated marked call really is repeatedly slow), or the meta-budget failsafe.
- Policy.Decide runs only for UNMARKED calls. The marker and the mode knobs never compose: there is
  no "await-only mode", no per-tool await config. Configuration stays coarse (Policy.ts); the model
  stays the only per-call authority. This is deliberate: a config knob for await would re-create the
  per-call decision the marker already gives the model, one level lower and less honest.
- Ordering with the dedup and escalation gates is fixed (section 3) and is part of the acceptance
  criteria (7.3) - a coder must not reorder the waterfall without re-verifying 4.3 and 4.1.

## 6. The KV-Cache Honesty Note

The awaited call keeps its synchronous result: the tool result enters the transcript through the
stock execute path, in the same assistant turn boundary the model expects, with no live marker line,
no `[live]` tag, no completion append, and no live section injected before the result. The prefix
`{"__await":true` remains in the recorded arguments of the executed call (transparency), so a later
replay sees the same call the runner saw - no desync between the log and what executed.

Cache stability: because the awaited call's transcript shape is exactly the stock inline shape
(arguments + result, nothing added, nothing removed), a turn containing an awaited call contributes
the SAME prefix bytes on every re-assembly as the equivalent untransformed conversation. Detached
calls differ (marker lines, later completion appends), which is the accepted cost of the live
feature; the marker's job is to let the model opt a call OUT of that cost when the result gates the
next emission. Nothing in the design may add or reorder transcript content around an awaited call -
that is the KV-cache honesty invariant the C2 coder must preserve (7.4).

## 7. The Acceptance Criteria

7.1 Grammar: `argumentsDelta.startsWith('{"__await":true')` on the first arguments delta promotes
the call to inline; the variants `{"__await": true`, `{"__await":"true"}`, `{"__await":false`, and a
non-first `__await` key do not (fixture suite covering all five plus a clean unmarked call). 7.2
Legality: a marked call passes the compiled parameter schema of the target runner and reaches
exec.arguments with the `__await` key present; the runner body ignores it; the recorded arguments
carry it (no strip). 7.3 Order: with the marker present, the L2 waterfall returns Downstream BEFORE
the dedup, escalation, and Policy.Decide gates, and AFTER the non-detachable gate; ledger emits
`await marker -> inline <tool>`. 7.4 Closure: an awaited call produces no live tag, no completion
append, and no transcript insertion around its result (the KV-cache invariant of 6); an unmarked
otherwise-identical call in the same state detaches. 7.5 Non-command marker: a marked call to a
non-detachable tool runs inline via the stock path with ledger
`await marker ignored (tool not detachable) <tool>`; no error surfaces to the model. 7.6 Teaching
line: the instructions line renders only when the transform is active and is byte-identical to
section 2's literal. 7.7 Honesty of history: the awaited call's duration is recorded in the
per-agent history like any inline call (no marker-based exclusion). 7.8 Smoke fidelity: the
fake-ctx + real-factory smoke suite covers 7.1-7.5 with byte-identical ledger assertions; the live
gap (a real model's propensity to emit the marker first-key) is covered by the standing section's
teaching line, not by the smokes.

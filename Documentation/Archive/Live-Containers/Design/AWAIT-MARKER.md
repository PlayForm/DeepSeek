---
title: AWAIT-MARKER (I2) - the per-call block-on-demand design
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
durable input for the C2 coder brief (D2 dispatch section 9). Where this file conflicts with section
4.3 of IMPLEMENTATION-DESIGN.md, THIS FILE WINS (the conflict table is in the I2 report to the
parent).

## 1. The Principle

The LIVE transformation detaches command calls by default, so the model gets a marker line back
immediately and keeps generating while the command runs. Fire-and-forget is the DEFAULT, but it is
NOT universal, because some calls are genuinely sequential: the model reads a file because the next
emitted step depends on its content, or a short setup command must finish before the next command
makes sense. Detaching those costs a wasted turn and a hallucinated continuation, so the
block-on-demand marker is the per-call escape hatch of the model. ONE byte-exact first-key in the
call arguments promotes a single call from detached back to synchronous, and the marker applies per
call, NEVER per session, NEVER per tool, while the default stays fire-and-forget everywhere else.

Symmetry with the normalize family: hook-dsh-normalize-dash detects the opt-out string prefix
`{"__normalize":false` on the FIRST delta of a call (Normalize.ts:65-69,
`RawCall = Original.argumentsDelta.startsWith('{"__normalize":false')`) and leaves it in the output
(transparency, NO stripping). The await marker reuses the same shape in a different carrier, and it
uses NOT the text delta but the tool-call arguments delta.

## 2. The Marker Grammar (byte-exact)

The marker is a FIRST-KEY prefix of the serialized tool-call arguments:

    {"__await":true

Byte rules:

- The first serialized key of the arguments JSON object is `__await`, with the value exactly the
  literal `true` (no quotes, no other value).
- NO whitespace variants are recognized, because the detection is the same string prefix test as the
  normalize family, `argumentsDelta.startsWith('{"__await":true')`, applied to the FIRST arguments
  delta of the call (the delta that carries the first bytes of the arguments string).
  `{"__await": true` (space), `{'__await':true}`, and `{"__await":"true"}` are NOT markers, and they
  are ordinary argument bytes that flow through untouched.
- Detection is prefix-only, and the rest of the arguments object is NEVER parsed to find the marker.
  If the model does NOT put it first, it is NOT a marker, and the extra key then simply rides along
  as an unknown property and is harmless (see 3.1).
- The marker is NOT stripped, and the executed call and its log carry the extra key (the same
  no-desync transparency rule as `{"__normalize":false`). dsh-tools CANNOT rewrite arguments and
  nothing needs to, because the key is legal (3.1) and ignored by every runner body.
- `{"__await":false` as the first key is NOT a marker and is treated as marker-absent (the call
  detaches per the normal policy). It exists so that a model which wants to be explicit about NOT
  awaiting has a legal spelling, and it must NEVER be refused or misread as an await request.

Model-facing teaching line (the instructions of the standing section, rendered only when the
transform is active, that is, when detach.mode != "off"):

    To run one command inline and wait for its real output, put {"__await":true first in the call arguments.

One line, with NO examples beyond the literal, because the marker is self-describing and the
KV-cache note (6) forbids richer per-call explanation.

## 3. The Effective-Gate Formula

The detach decision for one tool call, in the exact evaluation order of the L2 pre-execute waterfall
(section 3.2 of D2, with the marker position fixed here):

    DETACH = TRANSFORM_ON
           AND NOT NON_DETACHABLE(tool)          -- write/edit/raw-write/normalize-file + non-command family (Policy.ts, checked FIRST)
           AND NOT AWAIT_MARKER(call)            -- the marker short-circuits: -> inline
           AND NOT DEDUP_LIVE(agent, call)       -- a still-live job for the same key -> same marker, not a detach
           AND NOT ESCALATION(call)              -- sandbox_permissions in args -> inline via the stock approval flow
           AND POLICY_DECIDE(Exec, State)        -- long-running | all | selected guards (capacity, minLatencyMs, interactive, meta-budget)

So the INLINE conditions are the negations, and `AWAIT_MARKER(call)` is the prefix test of section 2
evaluated on the FIRST arguments delta. The marker check sits AFTER the non-detachable check and
BEFORE dedup, escalation, and policy. After non-detachable: a marked call to a non-detachable tool
is handled by the tool-class rule (4.1) and NOT by the marker rule, because the class rule wins when
the call was NEVER detachable anyway. Before escalation: a call that carries BOTH `{"__await":true`
and `sandbox_permissions` runs inline through the stock escalation approval flow, where the marker
is redundant but harmless, and it must NOT bypass or duplicate the approval path (the transform
NEVER re-implements approval). Before policy: the marker is an explicit model override of the
statistical guards, so minLatencyMs and the interactive detector do NOT veto a marked call, because
the marker is the model saying "I know this looks short/interactive; I need it inline". Capacity
(maxLivePerAgent) is NOT part of the concern of the marker shortcut, because an inline call consumes
NO live slot.

Ledger line on the marker path: `await marker -> inline <tool>` (the wording of D2 4.3 retained).

## 4. The Edge Cases

### 4.1 The marker in a NON-COMMAND or NON-DETACHABLE call - IGNORED, never refused

A call to a tool outside the detachable set (the mutation family, or any tool whose Exec is not a
spawned command) that carries the marker is IGNORED, because the call was going to run inline
regardless. Refusing it (a validation error surfaced to the model) would penalize a harmless no-op
and teach the model to fear the marker. Ledger: `await marker ignored (tool not detachable) <tool>`,
emitted once per occurrence. The marker key itself still rides in the arguments (NEVER stripped),
the schema legality of 3.1 applies to EVERY tool and NOT only to command runners, and the compiled
schemas all admit unknown keys.

### 4.2 The marker arriving mid-stream, not first

If the prefix test fails on the FIRST arguments delta but the completed arguments happen to contain
`{"__await":true` as a non-first key, it is NOT a marker: there is NO re-parse and NO retroactive
promotion, and the call detaches (or not) per the normal gates while the stray key is ignored by the
runner body. This is the cost of prefix detection and it is accepted, because the teaching line says
FIRST, models that follow it get the behavior, and prefix detection keeps the hot path O(prefix)
with ZERO JSON parsing.

### 4.3 The marker on a DEDUP or ESCALATION collision

A marked call whose dedup key matches a still-live job loses to the dedup rule, because the job is
already running and running the same command again inline would be the exact duplicate that the
dedup exists to prevent. The model receives the same already-running marker as an unmarked
duplicate, and the retry counter and the retry-loop failsafe apply identically. A marked call that
carries an escalation request runs the stock approval flow inline (section 3), the approval may
deny, and a denied approval is not a concern of the transform.

### 4.4 The marker and the marker emission (the completed call's own tag)

An inline (marked) call produces NO live tag, NO live line, and NO completion append, because its
result IS the synchronous tool result that the model reads in the same turn. The effect of the
marker is fully realized at execute time and nothing asynchronous survives it, which is the closure
property that the KV-cache note (6) depends on.

## 5. The Interplay With The Transformation Policy

- The marker is a NEGATIVE gate in the detach formula only, and it does not change the
  detachable-set classification of Policy.ts, the dedup key, the capacity accounting (an inline call
  never enters the registry), the per-agent history (the duration of an inline call IS recorded by
  the post-execute listener of L4 like any inline call and may raise the same-prefix historical
  average, which is honest because a repeated marked call really is repeatedly slow), or the
  meta-budget failsafe.
- Policy.Decide runs only for UNMARKED calls, and the marker and the mode knobs never compose: there
  is no "await-only mode" and no per-tool await config. Configuration stays coarse (Policy.ts) and
  the model stays the only per-call authority, which is deliberate: a config knob for await would
  re-create the per-call decision that the marker already gives the model, one level lower and less
  honest.
- Ordering with the dedup and escalation gates is fixed (section 3) and is part of the acceptance
  criteria (7.3), so a coder must not reorder the waterfall without re-verifying 4.3 and 4.1.

## 6. The KV-Cache Honesty Note

The awaited call keeps its synchronous result: the tool result enters the transcript through the
stock execute path, in the same assistant turn boundary that the model expects, with no live marker
line, no `[live]` tag, no completion append, and no live section injected before the result. The
prefix `{"__await":true` remains in the recorded arguments of the executed call (transparency), so a
later replay sees the same call that the runner saw, with no desync between the log and what
executed.

Cache stability: because the transcript shape of an awaited call is exactly the stock inline shape
(arguments + result, nothing added, nothing removed), a turn that contains an awaited call
contributes the SAME prefix bytes on every re-assembly as the equivalent untransformed conversation.
Detached calls differ (marker lines, later completion appends), which is the accepted cost of the
live feature, and the job of the marker is to let the model opt a call OUT of that cost when the
result gates the next emission. Nothing in the design may add or reorder transcript content around
an awaited call, because that is the KV-cache honesty invariant that the C2 coder must preserve
(7.4).

## 7. The Acceptance Criteria

7.1 Grammar: `argumentsDelta.startsWith('{"__await":true')` on the first arguments delta promotes
the call to inline, and the variants `{"__await": true`, `{"__await":"true"}`, `{"__await":false`,
and a non-first `__await` key do not (fixture suite covering all five plus a clean unmarked call).

7.2 Legality: a marked call passes the compiled parameter schema of the target runner and reaches
exec.arguments with the `__await` key present, the runner body ignores it, and the recorded
arguments carry it (no strip).

7.3 Order: with the marker present, the L2 waterfall returns Downstream BEFORE the dedup,
escalation, and Policy.Decide gates and AFTER the non-detachable gate, and the ledger emits
`await marker -> inline <tool>`.

7.4 Closure: an awaited call produces no live tag, no completion append, and no transcript insertion
around its result (the KV-cache invariant of 6), while an unmarked otherwise-identical call in the
same state detaches.

7.5 Non-command marker: a marked call to a non-detachable tool runs inline via the stock path with
the ledger line `await marker ignored (tool not detachable) <tool>`, and no error surfaces to the
model.

7.6 Teaching line: the instructions line renders only when the transform is active and is
byte-identical to the literal of section 2.

7.7 Honesty of history: the duration of the awaited call is recorded in the per-agent history like
any inline call (no marker-based exclusion).

7.8 Smoke fidelity: the fake-ctx + real-factory smoke suite covers 7.1-7.5 with byte-identical
ledger assertions, and the live gap (the propensity of a real model to emit the marker first-key) is
covered by the teaching line of the standing section and not by the smokes.

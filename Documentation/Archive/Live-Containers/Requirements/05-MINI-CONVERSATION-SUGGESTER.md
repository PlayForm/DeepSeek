---
title: CAN-5 The Mini-Conversation Suggester - the requirements
category: Archive/Live-Containers
kind: one-shot-record
date: 2026-10-19
status: complete
registry: Documentation/Archive/Live-Containers/Requirements/05-MINI-CONVERSATION-SUGGESTER.md
index: Documentation/INDEX.md
statuses:
    - name: the CAN-5 requirement spec
      state: resolved
      evidence: the durable spec
    - name: the CAN-5 implementation (the Suggester module)
      state: implemented
      evidence: C2's wave-2 Suggester module; the S-series smokes
    - name: the suggester route (GLM flash low)
      state: implemented
      evidence: the cheapest allowed lane; no third model
    - name: the privacy default (redact)
      state: resolved
      evidence: verbatim only by explicit config and disclosure
---

# CAN-5 - THE MINI-CONVERSATION SUGGESTER

## 1. The requirement statement (the user's intent, faithful)

When the user makes a request ("implement feature X"), a side mini-conversation with a MUCH SMALLER
model infers from the idea + the templates whether a live block fits the request, and suggests to
the main conversation: "hey, you can use this live block (like a shared TODO list) or something else
to achieve this".

## 2. The design (severe extension)

### The mini-conversation

- **Implementation**: the harness's own subagent infrastructure - a delegate to a small route (the
  task-routing policy's exploration strain: cloudflare-workers-ai / @cf/zai-org/glm-5.3-flash /
  reasoningEffort low). The plugin does not embed a model client; it spawns a one-shot subagent per
  suggestion (the delegation pattern this very repo uses), keeping the plugin's blast radius tiny.
- **Trigger**: a NEW user message (the pre-step listener's user-message detection, tool-coach
  Apply.ts:464-467) that satisfies `suggestGate`: first user message of a turn OR a user message
  whose length exceeds `minPromptChars` (default 40) - the "implement feature X" shape. Debounce:
  one suggestion per user turn, never per step.
- **The inference input** (the prompt the mini-conversation receives):
    1.  the user's request text (verbatim - explicit, opt-in: see the privacy gate below);
    2.  the TEMPLATE CATALOG (CAN-3's 14 entries, name + one-line use case + shape - the catalog
        doubles as suggester input, as promised);
    3.  the conversation's task facts the plugin already holds: live jobs count, active boards, turn
        count - so the suggester never suggests a board for a conversation that already has one.
- **The output contract**: a strict, small JSON suggestion
  `{ fit: "yes" | "no" | "unknown", templateId, rationale, tokens?: {..} }`, size-capped (the
  subagent's answer is short by construction); parse failure -> no suggestion (fail-open).

### The suggestion delivery (the three candidate carriers)

1. **A system-prompt section note** (preferred v1): one labeled section `live-containers-suggester`
   appended after next() in the assemble waterfall, containing the suggestion framed as the plugin's
   output:

    ```
    --- LIVE SUGGESTION (from a small helper model; act only if useful) ---
    fit: yes | template: agent-progress-board
    why: the request will dispatch multiple subagents; a planted board
    would let you report progress without extra tool calls.
    start it with: live_container_set plant=agent-progress-board expect=5
    --- END LIVE SUGGESTION ---
    ```

    Rationale: assemble-section additions are append-only, authoritative, cache-stable once rendered
    (suggestion happens once per user turn), and never mid-conversation history surgery - the
    verified seam. The frame preserves the honesty rules (the plugin's own output, never harness
    state).

2. **A tool result** (rejected for v1): suggestions are not tool calls; inventing a synthetic tool
   result would fabricate history.
3. **A planted block** (the suggestion IS the block, prefilled): the aggressive v1.1 variant - the
   suggester's fit=yes automatically INSTANTIATES the suggested template as a dormant planted block
   (visible in the section with `status: suggested - start it when ready`), so the main model sees
   the concrete block, not a description. Gated behind `autoPlant: false` default.

### The suggestion grammar

One suggestion per turn, max one template id, rationale capped at 240 bytes. The grammar above is
the byte-exact candidate. Ledger: `suggested <templateId> (fit <fit>)` /
`suggestion skipped (<reason>)` / `suggestion parse failed`.

### The opt-in / opt-out

- `suggester: "off"` (default, IDLE-forever) | `"section"` (carrier 1) | `"plant"` (carrier 3,
  implies section).
- `suggesterPrivacy: "redact" | "verbatim"` (default "verbatim" only if the user enables the
  suggester; the DESIGN decision to surface: sending the user's prompt text to another model route
  is a privacy-relevant act and the SCHEME must name it; "redact" sends the request's first 200
  chars plus length only).
- Rate bounds: `maxSuggestionsPerHour` (default 6); a user message that already contains the words
  "live container" or "plant" skips the suggester (the user is driving manually).

### The cost + the latency bounds

- Cost: one small-model call per qualifying user turn - the exploration strain's cost profile; the
  catalog is static text, so prompt tokens are dominated by the request text. `maxPromptBytes`
  (default 4000) caps the request excerpt.
- Latency: the mini-conversation runs DETACHED (its own subagent job in ctx.jobs) - it must never
  delay the main model's step. The suggestion lands when it lands: usually before the main model's
  next assemble (the main model is mid-step); if it arrives after the turn's last assembly, it shows
  at the next turn's first request. Late suggestions are never injected into the past.
- Failure containment: subagent spawn failure, timeout (`suggestTimeoutMs` default 8000), or parse
  failure -> ledger line + no suggestion; the main conversation is never touched. The suggester is a
  pure observer of everything it cannot influence.

## 3. The seam map

- EXISTS: subagent delegation (the harness's own task-routing pattern); one-shot subagent as a
  background job (dsh-jobs-local final-output jobs); the assemble section append; the pre-step
  user-message detection; the catalog data (CAN-3).
- MISSING: (a) the suggester prompt composer; (b) the detached suggester-job runner + the delivery
  into the section state; (c) the auto-plant path; (d) the SCHEME's privacy disclosure.

## 4. The acceptance criteria

1. With suggester off: zero subagent spawns, zero sections, provable.
2. With suggester on: a qualifying user turn spawns exactly one detached suggestion job; the main
   step's latency is unchanged (the suggestion is detached - provable by timestamp delta in the
   smoke harness).
3. A fit=yes suggestion renders the LIVE SUGGESTION frame at the next assembly, exactly once, and is
   withdrawn after one turn (cache stability).
4. A parse failure, timeout, or spawn failure produces only a ledger line; the conversation shows
   nothing.
5. autoPlant=true instantiates the suggested template as a dormant planted block labeled suggested;
   it becomes active only by explicit live_container_set or the model's own action.
6. Ledger strings byte-exact; no throw into any waterfall.

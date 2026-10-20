---
title: SUGGESTER-CONFIGURED (I6) — the configured-block suggestion flow
category: Archive/Live-Containers
kind: one-shot-record
date: 2026-10-19
status: complete
registry: Documentation/Archive/Live-Containers/Design/SUGGESTER-CONFIGURED.md
index: Documentation/INDEX.md
statuses:
  - name: the strict JSON suggestion (fit/templateId/rationale)
    state: resolved
    evidence: 7 wins, 2 where D2 survives
  - name: the one-word accept/dismiss (live_container_set)
    state: resolved
    evidence: accept instantiates the clamped config verbatim
  - name: the token clamping (the ledger line per clamp)
    state: resolved
    evidence: the suggestion-clamped ledger line
  - name: the implementation
    state: implemented
    evidence: C2 closed residuals R1-R5; the S-series smokes; accept-on-expired handled
---

# SUGGESTER-CONFIGURED (I6) - the configured-block suggestion flow, independently resolved

Status: RATIFICATION addendum for D2's IMPLEMENTATION-DESIGN.md sections 2.6
+ 4.5, written against the 05 MINI-CONVERSATION-SUGGESTER research file, the
02 planted-block grammar, the 03 template catalog, and the I5 PLANTED-LEASE
addendum. Where this file conflicts with D2's 2.6/4.5, the RESOLVED rules
below win for the C2 dispatch unless the CONFLICT TABLE (section 10) shows
D2's wording survived. ASCII + tabs throughout.

## 0. The one-paragraph decision

The suggester does not suggest a template NAME; it suggests a CONFIGURED
block. The mini-conversation (one detached one-shot subagent on the
exploration strain) receives the user's request excerpt + the CAN-3 template
catalog + the plugin's own task facts, and returns a strict JSON suggestion
that carries not only the templateId but the block's opening variables: the
estimated steps, the agent count, and nothing else - the lease is NEVER
model-chosen. The suggestion then arrives AS A PLANTED BLOCK: a byte-exact
SUGGESTION frame that previews the exact configured block the main
conversation would get, and the main conversation ACCEPTS or DISMISSES it
with a ONE-WORD command (`accept=<sid>` / `dismiss=<sid>` on the existing
live_container_set tool). Accept instantiates the stored, plugin-clamped
configuration verbatim - no re-typing, no drift between what was suggested
and what was planted.

## 1. The verified machinery this rides on

1.1 The mini-conversation is the harness's own subagent infrastructure (05
section 2): one detached one-shot subagent per qualifying user turn, spawned
via ctx.subagent.startActivation (D2 2.6's route triple: cloudflare-workers-ai
/ @cf/zai-org/glm-5.3-flash / reasoningEffort low, surfaced as volatile
config). It must never delay the main model's step.

1.2 The catalog is CAN-3's 14 entries (03 section 3), each with a known
shape and known variables; the catalog doubles as the suggester's input,
compressed to `id + one-line use + variables` (<= 2000 bytes static text,
built once and cached - it never changes within a process).

1.3 The delivery surface is the assemble section (the v1 seam, D2 3.1): the
suggestion frame renders at the NEXT assembly after the detached suggestion
job settles, exactly once, then withdraws. No mid-conversation history
surgery; late suggestions are never injected into the past.

1.4 The accept/dismiss surface is the existing live_container_set tool (D2
2.7's per-agent-only writes): two new verbs on the same tool, not a new tool.
The suggestion state lives in the per-agent WeakMap and dies with the agent.

1.5 The instantiated block is D2 4.4's planted frame governed by the I5
lease; the suggestion's stored variables become the board's opening state
(expectAgents slots, todo items, report grammar unchanged).

## 2. The mini-model inference input

The composed prompt (D2 section 3.4's carrier, spelled out):

	1. the request excerpt:
	   - suggesterPrivacy "redact" (the DEFAULT, ratified): the first 200
	     chars of the request plus its total length ("... [truncated, 1842
	     chars]"). Verbatim forwarding (<= maxPromptBytes, default 4000)
	     only by explicit config, and the SCHEME must carry the disclosure
	     paragraph: "with suggesterPrivacy: verbatim, the user's request
	     text is forwarded to the configured suggester route".
	2. the template catalog, compressed: one line per template -
	   `<id>: <one-line use>. vars: <variable list>` (static, cached).
	3. the task facts the plugin already holds: live jobs count, open
	   boards, turn count - so the suggester never suggests a board for a
	   conversation that already has one, and never suggests a template
	   whose trigger the facts already satisfy.

The output contract (byte-exact JSON, size-capped by the small model's
short answer):

	{ "fit": "yes" | "no" | "unknown",
	  "templateId": "<catalog id>",
	  "rationale": "<= 240 bytes",
	  "tokens": { "expectAgents": <n>, "steps": ["<step>", ...] } }

Parse failure, a missing field, or an unknown templateId -> no suggestion
(fail-open; ledger `suggestion parse failed`). The suggestion is pure
observation: the mini-conversation can influence nothing else.

## 3. The configured-block suggestion (what "configured" means)

3.1 The suggestion pre-fills the template's OPENING variables, nothing more:

	- expectAgents: the agent count for board-shaped templates
	  (agent-progress-board, delegation-inbox). Bound: 1..8.
	- steps: the estimated steps for list-shaped templates (todo-list,
	  scoreboard). Bound: 1..8 items, each <= 64 bytes, single line.
	- everything else: the template's own defaults. The LEASE is ALWAYS
	  plant.leaseTurns (config, default 3 per I5 section 8) - the
	  mini-model never chooses lease terms; the lease is a failsafe
	  contract, not a suggestion variable.

3.2 CLAMPING (the plugin never trusts the mini-model): out-of-range or
malformed tokens are clamped to the nearest legal value and the ledger
records `suggestion clamped <sid> <field>`; a clamped suggestion is still
offerable (it is a preview, not an execution). Unknown templateId or an
empty tokens object for a template that requires it -> no suggestion.

3.3 The suggestion id: `<sid> = sug-<4 hex>`, per-agent-keyed
(`agentId/sid`, the 02 section 7 plant-id collision rule). Two agents may
hold identical-looking suggestions independently.

## 4. The suggestion arrives AS A PLANTED BLOCK (byte-exact)

The SUGGESTION frame previews the exact configured block (suggester "plant";
the "section" mode keeps D2 4.5's plain LIVE SUGGESTION note, below):

	--- LIVE SUGGESTION <sid> (template: <templateId>; configured) ---
	expect agents: <n>
	steps:
	1. <step>
	2. <step>
	lease: <n> turns (config default)
	why: <rationale, <= 240 bytes>
	accept: live_container_set accept=<sid>
	dismiss: live_container_set dismiss=<sid>
	--- END LIVE SUGGESTION <sid> ---

Line rules: `expect agents:` only for board-shaped templates; `steps:` only
for list-shaped templates (the other line is omitted, not blanked); `lease:`
always present (it names the terms the instantiated board will run under);
`why:` always present; the accept/dismiss lines always present. A
board-shaped suggestion with steps, or a list-shaped one with expectAgents,
is a parse failure (3.2). All ASCII, the whole frame <= 1200 bytes.

The "section" mode's plain note (D2 4.5 verbatim, kept for the lighter
opt-in tier):

	--- LIVE SUGGESTION (from a small helper model; act only if useful) ---
	fit: yes | template: <templateId>
	why: <rationale, capped at 240 bytes>
	start it with: live_container_set plant=<templateId> expect=<n>
	--- END LIVE SUGGESTION ---

## 5. The accept/dismiss grammar (one word each)

5.1 ACCEPT: the model calls the existing tool with the single verb

	live_container_set accept=<sid>

The plugin instantiates the STORED, CLAMPED configuration verbatim (3.2):
the planted block opens with the suggested expectAgents and steps already in
place, the lease at the config default. The model never re-types plant= or
expect= - the configured suggestion's whole point is that the parameters
travel with the suggestion. Ledger `suggestion accepted <sid> (<templateId>)`;
the frame withdraws immediately.

5.2 DISMISS: `live_container_set dismiss=<sid>`. Ledger
`suggestion dismissed <sid>`. Any OTHER live_container_set action while a
suggestion is open also dismisses it (the model moved on; ledger
`suggestion dismissed <sid> (superseded)`).

5.3 NO ACTION: the frame renders for ONE assembly, then withdraws (the
cache-stability rule, D2 4.5) - ledger `suggestion expired <sid>`. A late
suggestion that would first render at a later turn renders its one assembly
there and expires on the same terms; it is never injected into the past.

5.4 The verbs are taught in the frame itself (section 4's last two lines) -
no additional system-prompt instruction line is added; the SCHEME carries
the same grammar list (the I5 R4 discipline: additive coverage in the smokes).

5.5 autoPlant=true (D2 2.6, default false): the plugin skips the preview
frame and instantiates the suggestion DIRECTLY as a DORMANT planted block -
the planted frame's header carries `status: suggested - accept=<sid> to
start` (extending D2 4.5's `status: suggested - start it when ready` with
the one-word verb), the board renders with `[none]` rows for the suggested
slots, and the SAME accept=<sid> verb ACTIVATES the dormant block (opens the
lease, starts expecting reports). dismiss=<sid> withdraws the dormant block;
it was never live, so the ledger line is `suggestion dismissed <sid>
(dormant)`. Under autoPlant the frame cost is one planted frame instead of
one suggestion frame - the section budget accounting is unchanged.

## 6. The trigger conditions (when the suggester fires)

6.1 Fire on a NEW user message that satisfies ALL of:
	- it is the FIRST user message of a turn (the pre-step listener's
	  user-message detection, the tool-coach Apply.ts:464-467 shape);
	- its length >= suggestGateMinChars (default 40) - the "implement
	  feature X" shape;
	- it does not contain the words "live container", "plant", or
	  "suggestion" (the user is driving manually - D2 2.6's skip rule,
	  extended with "suggestion");
	- the per-agent rate cap allows it: maxSuggestionsPerHour (default 6)
	  and at most ONE suggestion per user turn (the debounce, 05 section
	  2).

6.2 A complexity gate ("fire only on complex requests") was CONSIDERED and
REJECTED for v1: complexity is not observable cheaply or reliably by a
plugin (no token counts - 03 section 3's residual 3; a keyword heuristic
would misfire silently). The rate cap + the first-message-of-turn debounce +
the skip words ARE the complexity proxy in practice: every qualifying turn
gets exactly one cheap look, and the mini-model's fit=no/unknown answer
consumes one rate slot and nothing else. Residual R3.

6.3 Zero-subagent guarantee: with suggester "off" (the default) nothing
spawns, nothing renders, provable by the smoke harness's spawn counter.

## 7. The cost + latency bounds

7.1 Cost: one mini-model call per qualifying user turn, on the exploration
strain's cost profile. The prompt is bounded: the redacted excerpt (<= 200
chars) or the verbatim excerpt (<= maxPromptBytes 4000) + the compressed
catalog (<= 2000 bytes, cached) + the facts line (<= 200 bytes). The answer
is a small JSON object by construction. The catalog and the facts are static
per process; only the excerpt varies.

7.2 Latency: DETACHED always (its own one-shot subagent job). The main
step's latency is unchanged - provable by timestamp delta in the smoke
harness (05 acceptance 2). suggestTimeoutMs (default 8000) bounds the job: a
timeout, a spawn failure, or a parse failure produces ONLY a ledger line
(`suggestion skipped (<reason>)` / `suggestion parse failed`) - never a
conversation artifact, never a retry storm (no automatic re-spawn within the
same turn).

7.3 Delivery window: the suggestion lands at the next assembly after the
job settles - usually the same turn, mid-step; if it arrives after the
turn's last assembly it renders at the next turn's first request (5.3's
late rule). The one-assembly render keeps the cache cost at exactly one
section change per suggestion (the I3 3.3 accounting).

7.4 The meta-budget: a suggestion is a render, not a modification; it never
counts against failsafesPerTurn. The instantiated block from accept=<sid> is
a normal planted block under D2 3.4's admission (boardsPerAgent).

## 8. The opt-in / opt-out

	suggester: "off" | "section" | "plant", default "off"  (D2 2.6 verbatim)
	suggesterPrivacy: "redact" | "verbatim", default "redact"
	suggestGateMinChars: number, default 40
	maxSuggestionsPerHour: number, default 6
	maxPromptBytes: number, default 4000
	suggestTimeoutMs: number, default 8000
	autoPlant: boolean, default false
	suggesterRoute: object volatile (provider / model / reasoningEffort,
		defaults = the task-routing exploration strain)

"section" = D2 4.5's plain note tier; "plant" = this file's configured-block
flow (implies section's detached mechanics). The privacy default is
"redact" per the ratified D2 2.6 decision - this RESOLVES the 05 research
file's contrary "verbatim by default when enabled" (05 section 2, opt-out
list); the conflict table records it as already settled. The SCHEME must
name the privacy behavior and the disclosure paragraph (1.2 of D2 2.6) in
both tiers.

## 9. The acceptance criteria

	A1: suggester "off" -> zero subagent spawns, zero frames, provable.
	A2: a qualifying user turn spawns exactly ONE detached suggestion job;
	    the main step's latency is unchanged (timestamp delta in the
	    smoke harness).
	A3: a fit=yes "plant" suggestion renders the section 4 frame exactly
	    once with the clamped tokens in place, then withdraws; ledger
	    lines byte-exact (`suggested <sid> <templateId> (fit yes)`).
	A4: accept=<sid> instantiates the stored configuration verbatim -
	    expectAgents slots, the suggested steps as the opening list, the
	    lease at plant.leaseTurns - with no re-typed parameters; ledger
	    `suggestion accepted <sid> (<templateId>)`.
	A5: dismiss=<sid>, any superseding action, and no-action all withdraw
	    the frame with their distinct ledger lines (5.1-5.3); a clamped
	    field ledgered `suggestion clamped <sid> <field>` before the
	    frame renders.
	A6: a timeout, spawn failure, or parse failure produces only its
	    ledger line; the conversation shows nothing; no retry within the
	    turn.
	A7: privacy "redact" forwards only the first 200 chars + length -
	    asserted by inspecting the composed prompt in the smoke harness;
	    "verbatim" is reachable only by explicit config.
	A8: autoPlant=true renders the dormant planted frame with
	    `status: suggested - accept=<sid> to start`; accept activates it,
	    dismiss withdraws it (5.5); the dormant block never collects
	    reports before activation.
	A9: the skip words, the gate length, and the rate cap are each
	    independently asserted (a short message, a message naming
	    "plant", and the 7th suggestion in an hour all spawn nothing).
	A10: no suggester path ever throws into any waterfall (fail-open
	     wrapped; D2's containment paragraph applies verbatim).

## 10. RESIDUALS

	R1: the JSON tokens object's shape is v1-frozen to expectAgents +
	    steps. Templates whose opening variables are richer (countdown
	    targetAt, validator thresholds) are NOT suggestable-configured in
	    v1 - they fall back to the "section" tier's plain note even in
	    "plant" mode. Extending the token grammar is additive but needs
	    per-template clamp rules; deferred.
	R2: the compressed catalog is built from Catalog.ts at process start;
	    a user-edited catalog mid-process is picked up only on restart.
	    Acceptable: the catalog is config data, not live state.
	R3: the complexity gate (6.2) is a deliberate non-feature; if the
	    rate cap proves too generous in practice, a
	    suggestGateMinWords-style knob is the additive fix, not a
	    classifier.
	R4: the one-word verbs extend live_container_set's surface by two
	    actions; the SCHEME's action list and the smokes must add them
	    (additive coverage, the I5 R4 discipline).
	R5: whether accept=<sid> on an EXPIRED sid (the frame already
	    withdrew) should re-render the preview instead of erroring is
	    left to C2 with the default NO - the ledger line is
	    `accept failed <sid> (expired)` and the model re-derives from
	    its own context; keeping a withdrawn suggestion resurrsectable
	    would need state retention past the one-assembly window.

## 11. CONFLICT TABLE (this file vs D2 2.6/4.5 vs the winner)

| # | Point | D2 2.6/4.5 | I6 (this file) | Winner + reason |
|---|---|---|---|---|
| 1 | Suggestion carrier in "plant" mode | the plain LIVE SUGGESTION note (4.5) + autoPlant as a separate dormant-block path | the suggestion IS the configured-block preview frame (section 4): variables visible before accept, in BOTH autoPlant states | I6: the retained spec mandates "the suggestion arrives AS A PLANTED BLOCK"; D2's note describes the block instead of showing it. The plain note survives as the "section" tier only |
| 2 | Accept grammar | `live_container_set plant=<templateId> expect=<n>` - the model re-types the parameters | `live_container_set accept=<sid>` - one word; the stored clamped config instantiates verbatim (5.1) | I6: the retained spec's one-word command; re-typing risks drift from the suggested values and burns tokens restating them. D2's form remains the manual instantiation path for the "section" tier |
| 3 | Privacy default | "redact" default, verbatim only by explicit config + SCHEME disclosure | same (section 8) | D2: already ratified in section 11 of D2; I6 aligns and explicitly settles the 05 research file's contrary "verbatim when enabled" default |
| 4 | Lease in the suggestion | unstated (D2 4.5's accept line carries no lease terms) | the lease is ALWAYS config-derived (plant.leaseTurns), never model-chosen, and the frame states it (3.1, 4) | I6: the lease is a failsafe contract (I5); letting a mini-model set failsafe windows would make the stale declarations suggestion-dependent |
| 5 | Mini-model token trust | D2 renders the suggestion's tokens with no validation rule stated | plugin CLAMPS every token to legal bounds, ledgering each clamp (3.2); malformed -> no suggestion | I6: the mini-model is untrusted input by the harness's own rule; D2's silence would let an out-of-range expectAgents open a board |
| 6 | Suggestion id | `dismiss=<suggestionId>` named but never defined | `<sid> = sug-<4 hex>`, per-agent-keyed (3.3) | I6: supplies the definition D2's grammar references but omits |
| 7 | No-action semantics | "no action = the frame withdraws after one turn" | same, plus the distinct ledger line `suggestion expired <sid>` and the late-arrival rule (5.3) | I6: extends D2 without contradicting it; D2 has no ledger line for the expiry path |
| 8 | Trigger gate | first user message of a turn OR length > minPromptChars (05/D2 2.6 wording) | first user message of a turn AND length >= gate (6.1) - conjunctive | I6: "OR" would fire on every short first message ("hi") and burn rate slots; the conjunction is the "implement feature X" shape |
| 9 | Complexity-only firing | unstated in D2; the retained spec asks the question | REJECTED for v1 - rate cap + debounce + skip words are the proxy (6.2) | I6: complexity is not cheaply observable (03's token-count residual); a heuristic misfires silently |
| 10 | autoPlant frame text | `status: suggested - start it when ready` | `status: suggested - accept=<sid> to start` (5.5) | I6: names the one-word verb so the dormant block is actionable without consulting another surface; byte-exact either way, the smokes take I6's line |

---
title: CAN-3 The Template Host - the requirements
category: Archive/Live-Containers
kind: one-shot-record
date: 2026-10-19
status: complete
registry: Documentation/Archive/Live-Containers/Requirements/03-BLOCK-TEMPLATES.md
index: Documentation/INDEX.md
statuses:
  - name: the CAN-3 requirement spec
    state: resolved
    evidence: the durable spec
  - name: the template host implementation
    state: implemented
    evidence: the events catalog and the SUGGESTER-CONFIGURED template flow; the S-series smokes
---

# CAN-3 - THE TEMPLATE HOST (block templates out of the box)

## 1. The requirement statement (the user's intent, faithful)

The plugin ships a host of block TEMPLATES/PLACEHOLDERS the user can use out of the box.
NOT a blank canvas: a catalog the user (and the suggester, CAN-5) can pick from.
EACH has a known shape, known variables, and a known recompute trigger.

## 2. The template host design (severe extension)

- **ONE host, many kinds.** A template entry is a declarative block spec (the v1 config's block shape, extended): `{ id, kind, template, enabled, vars?, trigger?, ttlCalls?, scope? }`.
	The host renders EVERY enabled entry into the single `live-containers` assemble section (the v1 section name), EACH inside the LIVE CONTAINER frame.
- **Variables**: `{{token}}` substitution ONLY - NO eval, NO expressions in v1 (v1 research section 5: the programmable stage routes expressions through the ptc-runtime, NEVER `new Function`).
	The host's variable table per block: built-in tokens (section 4), per-template tokens, and user-settable state via the `live_container_set` tool (v1 research open question 6a - the template host needs it, so v2 answers YES: the tool ships with the template host, writing into the plugin's per-agent state, NEVER into the config file).
- **Triggers** (per block): `request` (recompute EVERY assembly - cache-hostile, for small cheap bodies), `event` (stable until the named event: job settle, tool post-execute, pre-step user message - the cheap class), `ttl` with ttlCalls (the tool-coach's sectionTtl pattern), `manual` (ONLY when set through live_container_set).
- **Scopes**: `always` | `when-<predicate>` - v1 predicates: `agents-active` (ANY LIVE jobs or boards), `tasks-live` (ANY detached calls), `never` (template installed but dormant).
- **The catalog is config-driven data, NOT code**: EACH template is a plain object.
	Adding a template is a data change, NOT a listener change.
	The CATALOG doubles as the suggester's input (CAN-5) and the docs' block table (SPEC A3's site page) - ONE source, three consumers.
- **Interpolate safety**: the section must be contributed with `interpolate: false` semantics (the v1 research residual 4) so `{{...}}` inside a template body is resolved ONLY by the plugin's engine and NEVER by the harness's own prompt variables (which fail assembly on unresolved references).

## 3. The catalog (12+ concrete templates)

Each entry: rendered shape / variables / trigger / use case.

1. **todo-list** - the shared TODO list (CAN-2's todo-fill standalone variant, parent-self-maintained).
	Shape: `[x] scaffold package | [ ] write smoke R1 | [~] docs`.
	Vars: items[] (live_container_set todo). Trigger: event (live_container_set).
	Use: multi-step tasks where re-stating the list EACH turn burns tokens.
2. **agent-progress-board** - CAN-2's agent-board.
	Shape: the 5-row board of 02 section 3. Vars: members[]. Trigger: event (job settle/progress). Use: multi-agent dispatch visibility.
3. **task-failsafe-guard** - CAN-4's surfaced form.
	Shape: `GUARD: build has been running 4m > 2m budget - check job_output`.
	Vars: guard rules[]. Trigger: request (evaluates thresholds cheaply).
	Use: automatic warnings (the silent CAN-4 posture means this template is OPT-IN per user, distinct from the automatic ledger-only failsafes).
4. **command-runner** - CAN-1's standing block.
	Shape: the running-commands frame of 01 section 4. Vars: LIVE jobs[]. Trigger: event (start/settle). Use: background command visibility.
5. **countdown-expiry** - deadlines and goal rounds.
	Shape: `research deadline in 2h 14m | goal round 4 of 8`.
	Vars: targetAt, label. Trigger: ttl (cheap). Use: time-bounded tasks.
6. **session-stats** - context meters.
	Shape: `messages=17 turns=5 sinceLastTool=42s sections=6`.
	Vars: built-ins (below). Trigger: request (string concat). Use: drift awareness.
	Token counts are NOT available to plugins - approximations ONLY, labeled approximate (v1 residual 3).
7. **diff-summary** - rolling touched-files summary.
	Shape: `changed: Apply.ts +40-12, Config.ts +6`. Vars: observed file events. Trigger: ttl (expensive to build). Use: long edit sessions.
8. **constraint-reminder** - standing rules at ask-time.
	Shape: `NEVER run git mutations. ASCII only. Tabs only.` Vars: rule lines. Trigger: event (config). Use: undeniable constraints.
9. **scoreboard** - progress through a scored loop.
	Shape: `TODO 3/7 done | current: smoke C4 | next: docs`. Vars: done/current/next. Trigger: event. Use: orchestrated waves.
10. **live-manifest** - the family's own state in-conversation.
	Shape: `tool-coach=on tier=2 | ccr=on stored=41 | live=2 running`.
	Vars: plugin ledgers. Trigger: ttl. Use: debugging the plugin stack.
11. **memory-block** - the model's pinned notes, re-injected EVERY request.
	Shape: `PIN: build is pnpm -r build; tests in Target/`.
	Vars: pin text (live_container_set memory). Trigger: event.
	Use: facts that must survive context growth.
12. **validator** - the user's pseudo-code block, concrete form.
	Shape: `WARNING: conversation exceeding the set limit` when messages > threshold else `This is the first message in the conversation`.
	Vars: thresholds + echo lines (declarative if/threshold entries - NOT scripted in v1). Trigger: request. Use: guards on conversation shape.
13. **environment-drift** - cwd, branch (read-only), free disk.
	Shape: `cwd=.../DeepSeek branch=main disk-free=212G`. Vars: facts.
	Trigger: ttl. Use: workspace awareness.
14. **delegation-inbox** - the children's report inbox (CAN-2 adjacent).
	Shape: `reports: worker-2 "editing Apply.ts" | worker-3 unreported`.
	Vars: last reports. Trigger: event. Use: NOT-just-count report review.

## 4. The built-in variable table (extended from the v1 set)

`{{time}}` `{{date}}` `{{tz}}` (per v1) plus wave-2 additions:
`{{messageCount}}` `{{turnCount}}` (per v1), `{{sinceLastTool}}`,
`{{liveJobs}}` (count), `{{liveBoards}}`, `{{agentsActive}}`,
`{{sessionId}}` `{{cwd}}` (per v1), `{{nowElapsed}}` (time since block
opened), `{{set:NAME}}` user state via live_container_set. Unknown tokens
render as `{{token}}` unchanged and log `render unknown <id> <token>` - NEVER
a failure (the harness's own unresolved-variable failure must NEVER be
inherited).

## 5. The seam map

- EXISTS: the assemble section append (tool-coach Apply.ts:499-556); the TTL cache pattern (Apply.ts:516-538); volatile config cells (normalize-dash Config.ts); per-agent WeakMap state; post-execute counters (the sinceLastTool source); jobs registry facts (liveJobs, boards).
- MISSING: (a) the catalog data file + the kind registry; (b) the live_container_set tool; (c) the substitution engine (Render.ts of v1 SPEC A1 - wave 2 keeps it, extends the variable table); (d) the event-trigger wiring (settle/post-execute/pre-step -> per-block dirty flag).

## 6. The acceptance criteria

1. The default config ships ALL 14 catalog templates with sensible enablements (todo-list, command-runner, session-stats on; the rest dormant) - and the plugin still DISABLED (IDLE-forever).
2. A template renders ONLY its tokens (NO eval path exists in the module - provable by grep in the smoke suite).
3. An event-triggered block recomputes at the next assembly after its event and is cache-stable between events.
4. live_container_set mutates per-agent state ONLY; unknown set targets log and no-op.
5. A template with an unknown token renders the token literally and the assembly is NEVER failed by the plugin.
6. EVERY template's ledger strings and frame bytes match the SCHEME byte-exactly.

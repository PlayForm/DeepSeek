---
title: The Agent Tuner - runtime cross-agent parameter control
category: Researches
kind: research-output
date: 2026-10-21
status: complete
registry: Documentation/Researches/AGENT-TUNER-RESEARCH.md
index: Documentation/INDEX.md
statuses:
  - name: model and reasoning effort switching at runtime for one session
    state: implemented
    evidence: packages/api/session-controller/src/commands.ts:157; packages/client/ui-model-selection/src/client/index.ts:129
  - name: durable model selection event and projection
    state: implemented
    evidence: packages/api/session-controller/src/agent.ts:340; packages/api/session-controller/src/model-selection-projection.ts:58
  - name: default model persistence on every selection
    state: implemented
    evidence: packages/core/agent-default-model/src/index.ts:82; packages/boot/config-editor/src/index.ts:87
  - name: sampling mutation through the request waterfall
    state: implemented
    evidence: docs/subsystems/llm-streaming.md:763; packages/core/agent/src/runtime-types.ts:337
  - name: cross-agent model or effort selection through selectModel
    state: rejected
    evidence: packages/api/session-controller/src/agent.ts:402-408 and :115 refuse every subagent-origin session, live or cold
  - name: cross-agent tuning through the request waterfall and a plugin store
    state: open
    evidence: this document section 7; the seam exists at packages/core/agent/src/runtime-types.ts:337, no package uses it
  - name: child to parent tuning authority through an explicit grant
    state: open
    evidence: this document section 7.5; the harness adjacency precedent is packages/subagent/subagent/src/manager.ts:713
  - name: settled child tuning applied on its next turn
    state: open
    evidence: this document section 7.4; cold resume rebuilds the launch route at packages/subagent/subagent/src/manager.ts:1363-1374
  - name: user-facing sampling controls
    state: open
    evidence: packages/llm/llm/src/call-config.ts:16 defines the fields only - no UI, service, or command sets them
  - name: model-callable tuning tool
    state: open
    evidence: this document only - no package, no plan
  - name: named tuning profiles
    state: open
    evidence: this document only - no package, no plan
  - name: inventing or renaming reasoning effort ids
    state: rejected
    evidence: packages/llm/llm/src/index.ts:928 rejects unoffered ids; packages/llm/llm-pi-ai/src/adapter.ts:209 derives the name from the id
  - name: mid-conversation agent preset switching
    state: rejected
    evidence: docs/subsystems/core.md:560 - select applies before the first turn; recompose only for a blank Agent
  - name: cross-agent permission preset or cwd tuning
    state: rejected
    evidence: this document section 7.8 - a permissive sandbox or directory change is privilege escalation, deferred
  - name: permission preset runtime switching for one session
    state: implemented
    evidence: packages/interaction/permission-presets/src/index.ts:398
  - name: working directory runtime change for one session
    state: implemented
    evidence: packages/session/working-directory/src/index.ts:163
  - name: session title as a conversation parameter
    state: rejected
    evidence: docs/subsystems/session-title.md:11 - the title projection never enters a model request
  - name: plugin-owned tuning persistence
    state: open
    evidence: packages/core/session/src/index.ts:492 provides the plugin record mechanism; no plugin uses it for tuning
  - name: the tuner name and the doc rename
    state: resolved
    evidence: this document section 11; registry path Documentation/Researches/AGENT-TUNER-RESEARCH.md
  - name: the existing-overlap verdict
    state: resolved
    evidence: this document section 6
---

# AGENT-TUNER-RESEARCH.md - runtime cross-agent parameter control

> The user's question: "Can we, through a plugin, create / modify and update
> conversation parameters, such as the model's effort name and others, on the
> fly?" - extended by the cross-agent requirement: a parent that launched a
> child on `low` must be able to raise that RUNNING child to `max` and lower it
> again, and a child must be able to tune its parent's conversation.
>
> The verdict, stated before the evidence:
>
> - **YES for model and reasoning effort in one session** - and the harness
>   ALREADY does it without any new plugin (the `/model` command, the composer
>   seat, and `session.selectModel`).
> - **NO for cross-agent control through the built-in selection path.**
>   `selectModel` refuses EVERY subagent session, live or cold, because
>   `liveAgent` applies the same ownership test as the resume path. The
>   parent's hypothesis that a live child might slip through is refuted by
>   `packages/api/session-controller/src/agent.ts:402-408`.
> - **YES for cross-agent tuning through the request waterfall** - a host
>   plugin can hold a per-session tuning store and apply it in `agent/request`
>   for any live agent, parent or child. That is the only seam that works for
>   both directions, and the only one that does not move the deployment
>   default.
> - **NO for inventing effort ids, renaming labels, mid-conversation preset
>   switching, or cross-agent permission/cwd escalation.** Those are owned by
>   the adapter catalog, the preset lifecycle, and the security boundary.
> - The next plugin is the **Agent Tuner** (`@playform/plugin-dsh-tuner`): a
>   host service plus a `tune_agent` tool plus an authority policy plus a
>   ledger, targeting `self`, `parent`, `child`, or an authorized `sessionId`.

Verified 2026-10-21 against the harness checkout at HEAD `687f282e`
(release 0.2.1-rc.2) and the running desktop profile at
`~/.dsh/profiles/desktop/cordis.patch.yml`. Every claim below is anchored to
`packages/...:line` or `docs/...:line` as it exists at that HEAD.

## 1. Intent

The question decomposes into five questions that are easy to conflate:

1. **What is a conversation parameter in this harness?** Is it a durable
   event, a config value, a request header field, or a mounted composition?
   The answer decides which mutation is even meaningful.
2. **Which parameters can a plugin mutate while a conversation is live?**
   Not "at launch" and not "in the profile" - during an existing Session.
3. **Which of those mutations work ACROSS agents?** Parent to live child,
   child to parent, and a settled child that will run again later.
4. **Does the harness already ship this?** If it does, a new plugin must add
   something the built-in path does not, or it is duplication.
5. **What should the next family plugin actually be?** The smallest scope
   that owns a real gap.

This document answers those five, per parameter, with the seam, the owner,
the durability, the authority, and the failure mode. It is written for the
implementer of the next plugin, not as a survey of the LLM subsystem.

## 2. What a "conversation parameter" actually is

A conversation request is reconstructed from logged state, and the log has
three distinct carriers. The distinction is load-bearing: a plugin mutates
one carrier, not "the conversation".

1. **The request envelope** - `EpochHeader` = call config (provider, model,
   reasoning effort, and the sampling scalars) plus adapter-default markers
   plus the assembled tool schemas (`docs/subsystems/session.md:181-206`).
   Every field maps 1:1 onto the same-named `GenerateOptions` field
   (`packages/llm/llm/src/call-config.ts:31-34`). The loop builds each
   request from the logged header rather than accepting these per call
   (`docs/subsystems/llm-streaming.md:761`).
2. **Derived history** - the rendered system prompt is NOT part of the
   header; it is the `system/message` at surface node 0 plus any later
   in-history system node (`docs/subsystems/session.md:181`). A prompt change
   replaces or appends a system node and leaves the header unchanged
   (`packages/core/agent-loop/src/agent.ts:406-424`).
3. **The mounted composition** - the agent preset's plugins and services,
   the tool registry, the permission knobs, the working directory. These are
   not scalars in the envelope; each has its own durable event and its own
   service.

A fourth carrier matters for the UI only: **projections** (`modelSelection`,
`agentPreset`, `permissions`, `title`) fold the durable events into client
state (`packages/api/session-controller/src/model-selection-projection.ts:58-68`).

So "a conversation parameter" in this harness means: **a value carried by
the next request envelope, or a registry value the next request assembly
reads, with a durable record of the intent**. A value with no seam into
either is not a parameter - it is a wish.

Two consequences follow immediately:

- **The loop is the only writer of the envelope.** Plugins replace the
  config at the `agent/request` waterfall and the loop logs the result
  (`packages/core/agent-loop/src/agent.ts:593-596`, `:626-651`). A plugin
  that writes a `request/header` event itself would desync the loop.
- **A parameter change and a composition change are different operations.**
  Model/effort/sampling/prompt/tools are re-read per request; the agent
  preset is mounted once. Treating them as one config object is the design
  error this document exists to prevent.

A third distinction matters for cross-agent work: **a parameter change is
not an agent lifecycle change**. Tuning a child does not resume it, does not
re-parent it, and does not change its composition; it only changes the
config its next request carries.

## 3. The parameter matrix

| Parameter | Where it lives | Official mutation seam | Scope | Plugin at runtime | Cross-agent |
|---|---|---|---|---|---|
| provider + model | `model/selection` event, `request/header`, `modelSelection` projection | `ctx.sessionController.selectModel` | one Agent, next prompt assembly | YES | NO through selectModel; YES through `agent/request` |
| reasoning effort | same carriers plus the adapter catalog | `selectModel`, or `agent/request` | one Agent, next request | YES, offered ids only | YES through `agent/request` |
| temperature, maxTokens, stop | `request/header` (maxTokens also seeds from `AgentOptions`) | `agent/request` waterfall | one request, logged per change | YES, but no service or event | YES, the safest cross-agent parameter |
| system prompt + variables | `system/message` derived history; assembly `variables` | `system-prompt/assemble` waterfall | per assembly, per agent scope | YES | NO, composition-like |
| tool set + schemas | `request/header` `tools` plus `developer/message` additions | `ctx.tools.register` / `ctx.tools.restrict` | per agent scope | YES, the loop reconciles | NO, composition-like |
| agent preset | `agent-preset/selected` plus the mounted composition | `ctx.agentPresets.select` / `recompose` | before the first turn only | NO | NO |
| permission preset | `permission/preset` plus sandbox and approval knob events | `ctx.permissionPresets.set` | per Session, immediate | YES | NO by default, escalation risk |
| working directory | `working-directory/change` | `ctx.workingDirectory.set` | per Session | YES | NO in v1, scope change |
| session title | `session/title` plus the title projection | `ctx.sessionTitle.rename` | per Session | YES, but not a conversation parameter | NO |

## 4. Per-parameter evidence

### 4.1 Route - provider and model

- **Durable intent** is the `model/selection` event
  (`packages/core/session/src/known-event-types.ts:49`), appended by
  `selectForNextRequest` together with the live cache update
  (`packages/api/session-controller/src/agent.ts:339-342`).
- **The projection** folds `model/selection` into `pending`, and the next
  `request/header` into `lastUsed`, clearing `pending` when they match
  (`packages/api/session-controller/src/model-selection-projection.ts:39-56`).
- **The live selection ref** is created once per Agent by `selectionFor`
  (`packages/api/session-controller/src/agent.ts:289-332`). It reads the
  projection only at install time; afterwards the closure variable `picked`
  is the cache, cleared only by `consume` when a logged header matches
  (`:320-326`, `:352-359`; the caller is
  `packages/api/session-controller/src/index.ts:210-219`).
- **The official seam** is `SessionCommandController.selectModel`
  (`packages/api/session-controller/src/commands.ts:157-192`): it checks the
  model is advertised (`:161`, `:365-370`), normalizes through
  `ctx.llm.resolveCallConfig` (`:162-168`), commits with
  `selectForNextRequest` (`:176`), and saves the deployment default in the
  background (`:177-181`). The public Host method is the `@Remote`-marked
  `SessionController.selectModel`
  (`packages/api/session-controller/src/index.ts:310-313`), declared on
  `ctx.sessionController` at `:76-80` and constructed at `:158`.
- **When it takes effect**: the selection is snapshotted at
  `system-prompt/assemble` and applied to the request at `agent/request`, so
  a switch concurrent with an in-flight step lands on a later step instead
  of splitting prompt and request
  (`packages/core/agent/src/model-selection.ts:82-112`).
- **The model-switch notice** is appended at `agent/pre-step` only when the
  provider or model actually changed; effort-only changes add no notice
  (`packages/core/agent/src/model-selection.ts:113-126`, text at `:47-61`).
- **The header** logs a new snapshot with reason `change` whenever the
  config differs (`packages/core/agent-loop/src/agent.ts:643-648`).

**Can a plugin do it?** YES for a session it may address, by calling
`ctx.sessionController.selectModel({ sessionId, provider, model, reasoningEffort })`
in-process. The method is public and merely marked for the Remote gateway
(`packages/typert/protocol/src/index.ts:274-281`), so a Host plugin holding
`sessionController` in `inject` calls it directly. Section 7.1 shows why
"a session it may address" excludes every subagent.

**Can a plugin append `model/selection` itself?** Not safely for a live
Agent. The event would update the projection, but `selectionFor` already
returned a ref whose `picked` value is cached; the next request would still
use the old route, and the UI would show the event while the model does not
follow it. The event alone only takes effect for an Agent installed after
the append (a resume or a new Agent). Go through `selectModel` for a
non-subagent session, or through the waterfall for a subagent.

**The side effect to disclose**: `selectModel` calls
`agentDefaultModel.saveSelection` (`commands.ts:177-181`), which writes the
active profile patch through the config editor
(`packages/core/agent-default-model/src/index.ts:82-94`,
`packages/boot/config-editor/src/index.ts:87-114`; the editor is composed by
the base bundle at `packages/bundle/base/cordis.patch.yml:105-107` and the
desktop profile carries the entry at
`~/.dsh/profiles/desktop/cordis.patch.yml:123-128`). The last selection
therefore becomes the deployment default. That is exactly what the built-in
`/model` does; a cross-agent tuner doing it would be unacceptable.

### 4.2 Reasoning effort

- Effort ids are branded opaque strings with no validation in the brand
  constructor (`packages/llm/llm/src/brand.ts:66-76`); the adapter owns the
  meaning.
- The seed for the first request on a route is `AgentOptions.reasoningEffort`
  or the persisted effort, and the persisted value is restored only when the
  provider and model match and the value was not adapter-defaulted
  (`packages/core/agent-loop/src/agent.ts:573-591`). An adapter-defaulted
  effort is deliberately not restored as a conversation choice
  (`packages/api/session-controller/src/agent.ts:309-314`).
- Validation is exact: `resolveCallWithInfo` throws
  `UNSUPPORTED_REASONING_EFFORT` when the requested id is not in the
  model's `reasoning.efforts`, and the doc comment states "no clamping or
  aliasing is performed"
  (`packages/llm/llm/src/index.ts:884-889`, `:918-936`).
- `prepareCall` marks which values came from the adapter rather than the
  caller (`packages/llm/llm/src/index.ts:956-983`), which is what keeps an
  unchanged default from reading as a request change on the next step.
- The UI never invents an effort: the Host catalog copies id and name from
  `resolveModelInfo` (`packages/api/session-controller/src/catalog.ts:28-47`;
  the type is `packages/api/session-controller/src/types.ts:123-134`), and
  the seat renders `effort.name` (`packages/client/ui-model-selection/src/client/ModelSelect.tsx:137-147`).

See section 5 for the name question.

### 4.3 Sampling - temperature, maxTokens, stop

- The fields are declared once, as `LlmCallControls`
  (`packages/llm/llm/src/call-config.ts:16-21`), and included in
  `LlmCallConfig` (`:31-34`). `callConfigEquals` compares all of them,
  including `stop` element-wise (`:67-77`), so any change is a real header
  change.
- The module doc says the quiet part: these values "are request-header state
  that can affect cache reuse; request waterfalls replace them and the loop
  logs changed snapshots instead of allowing silent per-call drift"
  (`packages/llm/llm/src/call-config.ts:1-7`). The docs carry a matching
  FIXME about which fields are genuinely epoch-level, noting that the
  sampling scalars sit in the header "out of caution"
  (`docs/subsystems/llm-streaming.md:767`).
- **The only seam is `agent/request`**: it "receives a frozen call-config
  seed and may return a replacement to switch provider, model, reasoning
  effort, or sampling" (`docs/subsystems/llm-streaming.md:763`; declaration
  at `packages/core/agent/src/runtime-types.ts:337`, mode and ordering at
  `docs/subsystems/core.md:955-977`).
- **The loop seeds almost nothing**: on a fresh loop instance the seed is
  the route, the restored effort, and `maxTokens` from the agent options
  only (`packages/core/agent-loop/src/agent.ts:111`, `:583-592`).
  `temperature` and `stop` are never seeded, and after a resume the previous
  header's sampling values are not re-proposed - only `requestHeaderLogged`
  instances reuse the full proposal (`:64-70`, `:584-586`). A plugin must
  therefore re-apply sampling after a resume.
- **Validation is thin**: `resolveCallConfig` materializes the adapter's
  default `maxTokens` and validates effort; it does not range-check
  `temperature`, `stop`, or a caller-supplied `maxTokens`
  (`packages/llm/llm/src/index.ts:908-942`). Only the agent-option
  `maxTokens` has a shape check
  (`packages/core/agent-loop/src/index.ts:205`). A plugin owns its own
  bounds.
- **What already sets it**: exactly one production call sets a temperature,
  and it is an auxiliary auto-review request outside any Session log
  (`packages/experimental/auto-review/src/index.ts:624-634`). No
  conversation path does.
- **The UI would show it if set**: the assistant request config record
  already carries `temperature`, `maxTokens`, and `stop`
  (`packages/client/ui-conversation/src/client/contract/records.ts:15-25`).
- **Compatibility with the built-in selection**: `installModelSelection`'s
  request listener removes only the inherited effort and replaces provider,
  model, and effort; every other field of the resolved config survives
  (`packages/core/agent/src/model-selection.ts:96-111`). A sampling listener
  and the controller's listener therefore compose in either order.

### 4.4 System prompt and prompt variables

- `system-prompt/assemble` is an expert waterfall over sections, contexts,
  tools, and variables; the returned assembly is authoritative, and scoped
  listeners receive only that scope's assemblies
  (`docs/subsystems/system-prompt.md:214-231`, declaration at
  `packages/core/system-prompt/src/index.ts:31`).
- Prompt variables live on the assembly (`packages/core/system-prompt/src/index.ts:128`)
  and are interpolated into sections unless a section opts out (`:287-299`).
  `installModelSelection` writes `provider` and `model` into those variables
  (`packages/core/agent/src/model-selection.ts:82-95`), which is why the
  prompt can name the route.
- The prompt is re-rendered per step (`packages/core/agent-loop/src/agent.ts:406-407`)
  and committed as surface nodes; the `systemPromptUpdate` mode from
  `request/context` decides replace versus append
  (`packages/core/agent-loop/src/agent.ts:416-424`;
  `docs/subsystems/session.md:208-210`).

**Can a plugin do it?** YES, per request, in its own scope. The family
already ships two examples: `hook-dsh-tool-coach` and
`hook-dsh-live-containers` both consume `system-prompt/assemble`
(`Documentation/Plugins/PLUGIN-FAMILY.md:76-77`). This is a composition-like
seam (the returned assembly is authoritative), not a scalar setter, and it
is NOT in scope for cross-agent tuning (section 7.8).

### 4.5 Tool set and tool schemas

- `ctx.tools.register` registers globally or in the calling agent scope, and
  `ctx.tools.restrict` masks global tools for the calling scope
  (`docs/subsystems/tools.md:524-539`).
- The loop records tool changes in two places: the header's `tools` array
  (compared schema-wise by `headerEquals`,
  `packages/core/session/src/request-header.ts:43-52`) and a
  `developer/message` carrying `tool-addition` / `tool-removal` blocks
  (`packages/core/agent-loop/src/agent.ts:652-664`).

**Can a plugin do it?** YES for its own agent scope, but this is not a
scalar. It is a scoped registry mutation that the loop reconciles into the
header and the derived history. A tool can target the current agent because
every execution carries `exec.agent` (`docs/subsystems/tools.md:207-208`).
It is a composition change and is rejected cross-agent.

### 4.6 Agent preset

- `select` applies "before a session starts its first turn"
  (`docs/subsystems/core.md:560-567`); `recompose` rebinds a blank Agent and
  the caller owns the blank-session check (`:553-558`); `mount` binds an
  unpublished Agent in its setup callback (`:526-531`).
- The durable record is `agent-preset/selected`
  (`packages/core/session/src/known-event-types.ts:23`).

**Can a plugin switch it mid-conversation?** NO. There is no seam that
rebinds a running composition, and doing so would swap the services and
tools the conversation already used. This is a rejected capability, not a
missing one.

### 4.7 Permission preset

- `set(session, name)` resolves the preset, appends a log-only
  `permission/preset` event unless it is already effective, then writes each
  knob through its own setter (`docs/subsystems/permission-presets.md:71-75`;
  the method is at
  `packages/interaction/permission-presets/src/index.ts:398`).
- The `permissions` projection folds the selection with the sandbox and
  approval knob events (`docs/subsystems/permission-presets.md:53-57`).

**Can a plugin do it?** YES for a session it may address, and it takes
effect for subsequent tool calls. It is NOT safe cross-agent: a child
raising its parent's sandbox is privilege escalation (section 7.6).

### 4.8 Working directory

- `get(session)` reads the logged value; `set(agent, path)` validates and
  records a change (`docs/subsystems/working-directory.md:9`; method at
  `packages/session/working-directory/src/index.ts:163`).
- Changes are local to one Session; the immutable header keeps the original
  project, and the model sees the current value as a required user-context
  snapshot (`docs/subsystems/working-directory.md:11-15`).

**Can a plugin do it?** YES for one session. Cross-agent it is a scope
change (a child redirecting the parent's file operations), so v1 rejects it.

### 4.9 Session title - explicitly NOT a conversation parameter

- `rename(session, title)` appends a `session/title` event with the user
  source and pins the title against automatic generation
  (`packages/session/session-title/src/index.ts:407`;
  `docs/subsystems/session-title.md:179-189`).
- The title projection contains only the title string
  (`docs/subsystems/session-title.md:11`); it never enters a model request.
  The title generator's own model call is a separate auxiliary request whose
  route is recorded in `session/title-llm-request`
  (`docs/subsystems/session-title.md:67`).

**Can a plugin do it?** YES, and it should not be counted as a conversation
parameter. It is display metadata.

## 5. The "effort name" question

This is the part of the user's original question that most needs a precise
answer, because "effort name" conflates three different things.

**Where the ids come from.** The adapter's `resolveModel` returns the
ordered efforts for one exact model; `LlmRuntime.normalizeModelInfo`
validates them (non-empty id and name, no duplicates) and requires a
declared default to be one of them
(`packages/llm/llm/src/index.ts:839-881`). The pi-ai adapter builds them
from the model's thinking-level map
(`packages/llm/llm-pi-ai/src/adapter.ts:199-214`). The Host catalog copies
them verbatim into the client model directory
(`packages/api/session-controller/src/catalog.ts:28-47`).

**The vocabulary is fixed by the adapter, not by the model.** pi-ai declares
`off`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max` in escalation
order, behind a compile-time drift gate
(`packages/llm/llm-pi-ai/src/catalog.ts:69-86`). Which of those a given
model OFFERS is per model: a profile declares a `reasoningEfforts` map
whose keys are the offered levels and whose values are the wire spellings
(`packages/llm/llm-pi-ai/src/catalog.ts:719-772`). The running desktop
profile declares exactly four for its single model - `off: null`, `low`,
`high`, `max` (`~/.dsh/profiles/desktop/cordis.patch.yml:70-74`). `off` is
a real offered id whose wire value is `null`, meaning "send nothing"; the
parser rejects a `null` wire value on any level other than `off`, and
rejects a map that offers no thinking level at all
(`packages/llm/llm-pi-ai/src/catalog.ts:749-761`).

**The display name is mechanical.** The pi-ai adapter sets
`name = capitalized id` (`packages/llm/llm-pi-ai/src/adapter.ts:207-210`),
so the built-in UI shows `Off`, `Low`, `High`, `Max`, `Xhigh`. Nothing in
the profile or the plugin config renames them; there is no name field to
set.

**What a plugin can and cannot do:**

- **Cannot create a new id.** `resolveCallConfig` rejects any id the model
  does not offer, with `UNSUPPORTED_REASONING_EFFORT`, before provider I/O
  (`packages/llm/llm/src/index.ts:926-933`). ACP enforces the same rule
  against the offered list (`packages/acp/acp/src/model-control.ts:114-128`).
- **Cannot rename an existing id in the built-in UI.** The label is the
  catalog's `name` (`packages/client/ui-model-selection/src/client/ModelSelect.tsx:137-147`,
  retained-label lookup at
  `packages/client/ui-model-selection/src/client/directory.ts:157-166`).
- **Can choose any offered id** through `selectModel` for a non-subagent
  session, or per request through `agent/request` for any live agent.
- **Can alias labels only in its own UI.** A plugin's own client surface
  may render whatever text it likes for a known id; it cannot change the
  built-in seat.
- **Can change the offered set only as configuration**, by editing the
  profile's `reasoningEfforts` map and reloading - not at runtime, and not
  per conversation.

**What happens on an unsupported value:** a thrown
`UNSUPPORTED_REASONING_EFFORT` before dispatch
(`packages/llm/llm/src/index.ts:928-933`), surfaced by `selectModel` as
`session/model-unavailable` with the provider and model attached
(`packages/api/session-controller/src/commands.ts:183-190`). No clamping, no
silent fallback. In the Tuner's own path, `prepareCall` runs inside
`prepareRequest` and the same rejection closes the step
(`packages/core/agent-loop/src/agent.ts:601-610`), so the Tuner must
validate before it stores or applies a value.

## 6. What already exists upstream - the overlap, plainly

The harness ships a complete model/effort switching system, in two entry
points over one state:

- **The Host seam**: `ctx.sessionController.selectModel`
  (`packages/api/session-controller/src/index.ts:310-313`) with the
  validation, durable event, cache commit, and default save described in
  4.1. It is documented as a public service method
  (`docs/subsystems/session.md:867-872`).
- **The client seam**: `session.selectModel` over the Remote gateway, used
  by the shared per-session `ModelDirectory`
  (`packages/client/ui-model-selection/src/client/directory.ts:98-105`).
- **Two UI entries over that one directory**: the `/model` command
  (`packages/client/ui-model-selection/src/client/index.ts:124-166`) and the
  composer seat `conversation.input.model`
  (`:168-193`), which is registered with one single child
  `conversation.input.model.label` (`:172-177`). A switch in either entry is
  what the other shows next (`:1-11`).
- **A two-level Model/Effort menu** whose effort rows come from the Host
  catalog, never from a local list
  (`packages/client/ui-model-selection/src/client/ModelSelect.tsx:137-147`,
  `:629-658`).
- **A durable default** that follows the last selection
  (`packages/core/agent-default-model/src/index.ts:82-94`).
- **Other entry points using the same mechanism**: ACP session config
  options install the same `installModelSelection`
  (`packages/acp/acp/src/model-control.ts:58-60`, effort validation at
  `:114-128`); the headless bundle installs a launch-time selection
  (`packages/bundle/headless/src/index.ts:334-343`); subagents select at
  launch through `provider`, `model`, and `reasoning_effort` on the tool
  call, validated against the configured allowed routes
  (`packages/subagent/tool-subagent/src/model-selection.ts:99-128`,
  `:139-153`, `:176-196`; the durable policy event is
  `subagent/model-selection-policy`,
  `packages/subagent/tool-subagent/src/model-selection-state.ts:17`).
- **A worked plugin example** of the request seam:
  `packages/experimental/webhook/src/session.ts:92-104` registers an
  agent-scoped `agent/request` listener that applies a creation-time
  selection only until the first durable header exists. The event catalog
  lists exactly two consumers of `agent/request`: the agent itself and the
  webhook (`docs/event-producer-consumer.md:21`).
- **An existing cross-agent control precedent**: `send_message` and
  `interrupt_agent` already let a parent and its direct continuable child
  address each other. The service authorizes "the exact live sender" and
  "adjacent local agents" only (`packages/subagent/subagent/src/manager.ts:549-574`),
  the durable direct-parent lineage is checked separately
  (`:713-722`), and the tools pass `exec.agent` as both sender and authority
  (`packages/subagent/tool-subagent-control/README.md:70`). The documented
  rule is: any exact live Agent may target its direct continuable child,
  while a resident continuable child may also target its direct parent;
  siblings and deeper descendants are not targets
  (`packages/subagent/tool-subagent-control/README.md:48`, `:169`). The
  Tuner should mirror this authority shape exactly.

**The overlap question answered directly:** YES, we already have model and
reasoning-effort switching for one conversation, and it is the harness's own
feature, not a family plugin. YES, we already have adjacent cross-agent
messaging, which proves the authority model but changes no parameter. NO, we
do not have cross-agent parameter tuning: `selectModel` refuses subagent
sessions, nothing exposes sampling as a user-facing control, nothing lets a
child tune a parent, and nothing audits parameter changes in one ledger.
Those are the parts a new plugin can own without duplicating the built-in
path.

## 7. Cross-agent tuning - the core of this research

### 7.1 The live-child finding: `selectModel` refuses every subagent session

The parent's hypothesis was that a LIVE child might slip through
`selectModel`, because `resolve` checks `liveAgent` before the attached
ownership check (`packages/api/session-controller/src/agent.ts:213-222`).
The code refutes it: `liveAgent` applies the same ownership test.

- `resolve` calls `liveAgent(sessionId)` first
  (`packages/api/session-controller/src/agent.ts:217-218`).
- `liveAgent` returns an error - not the agent - when
  `hasApiSessionSubagentOwner` is true (`:402-408`).
- `hasApiSessionSubagentOwner` returns true immediately for any session whose
  header `origin` is `'subagent'` (`:110-120`, the check at `:115`).
- Local children are created with exactly that header metadata:
  `childSessionMeta` sets `origin: 'subagent'` and `parentSession`
  (`packages/subagent/subagent/src/child-agent.ts:135-153`, line 150).

So a live child reaches `{ error: apiSessionSubagentOwnershipError }` at
`liveAgent`, and `resolve` returns it at line 218 without ever reaching the
resume path. The failure code is `session/agent-busy` with the reason "use
subagent delivery for this child session"
(`packages/api/session-controller/src/agent.ts:127-133`). A cold child that
is still attached is refused on the attached check at `:219-222`; a fully
cold child is refused in `resumeObserved` at `:431-433`.

**Corrected verdict: `ctx.sessionController.selectModel` cannot target a
subagent session at all, live or cold.** The earlier reading of this
research (that the live fast path might bypass the guard) is withdrawn. The
practical consequence is stronger and simpler: cross-agent tuning has no
built-in selection path, so the Tuner must own its seam.

### 7.2 Parent -> live child

**Does `selectModel` work while the child is live?** No (7.1). The child's
model and effort are fixed by its launch `agentOptions`, recorded in the
durable descriptor (`packages/subagent/subagent/src/descriptor.ts:76-81`,
written at `packages/subagent/subagent/src/manager.ts:390-401`), and there
is no selection ref installed for a local child - no subagent package calls
`installModelSelection`. Its requests are seeded from `AgentOptions` and the
logged header (`packages/core/agent-loop/src/agent.ts:573-592`).

**The working seam** is a host-level `agent/request` listener plus a
per-session tuning store:

- A listener registered on the plugin's own (host) context receives every
  agent's requests; only agent-scoped listeners are narrowed to one agent
  (`docs/subsystems/core.md:973`). The Tuner filters on `payload.agent`.
- The listener calls `next()` first and returns a replacement config with
  only the tuned fields changed, preserving the rest - the discipline
  `installModelSelection` uses
  (`packages/core/agent/src/model-selection.ts:96-111`).
- The loop logs the result as a `request/header` snapshot with reason
  `change` (`packages/core/agent-loop/src/agent.ts:643-648`), so the change
  is durable and reconstructable even though no `model/selection` event was
  appended.

**When does it land?** On the child's NEXT request, never the in-flight one:
`agent/request` runs on step admission, after assembly and `step/start`,
before the system prompt and the accepted user batch are committed
(`docs/subsystems/core.md:955-977`). A child that is mid-stream keeps its
current response; the tuning applies at its next step boundary. A child that
is idle applies it when the next turn starts.

**Effort-only versus model change.** The built-in model-switch notice is
`installModelSelection`'s own `agent/pre-step` listener comparing its
assembled selection with the previous header
(`packages/core/agent/src/model-selection.ts:113-126`). A Tuner change is
invisible to that listener, so no notice is appended. The Tuner should emit
its own notice for a provider/model change (borrowing the same pattern and
the same `model-selection` message source, `:47-61`) and stay silent for an
effort-only change, matching the harness rule.

**What the child's projection and UI show.** The `modelSelection`
projection's `lastUsed` is folded from the logged `request/header`
(`packages/api/session-controller/src/model-selection-projection.ts:44-52`)
and its client view is `pending ?? lastUsed` (`:63-66`), so a client reading
the child's projection sees the tuned route after the next request. Two
limits remain: the durable `subagent/descriptor` keeps the LAUNCH route
(`packages/subagent/subagent/src/descriptor.ts:76-81`), and the addressed
subagent UI exposes no model seat at all
(`packages/client/ui-model-selection/src/client/index.ts:9-11`). The
parent's child card therefore reports the launch route, not the tuned one -
a display residual, not a correctness bug.

### 7.3 Child -> parent

**Can the child call `selectModel` on the parent?** Mechanically, yes. The
parent is a root session: `origin` is absent and `parentSession` is absent,
so `hasApiSessionSubagentOwner` is false
(`packages/api/session-controller/src/agent.ts:115-119`), `liveAgent`
returns the agent (`:402-408`), and `selectModel` proceeds. There is no
in-process caller identity anywhere in that path: `selectModel` takes only a
`sessionId` (`packages/api/session-controller/src/commands.ts:157-158`), and
an in-process Host call carries no Peer principal.

The Remote path is narrower, but it does not help the tool path. The
SessionController registers the `session` default wire field
(`packages/api/session-controller/src/index.ts:159`), and
`SessionSelectModelRequest` carries `sessionId`
(`packages/api/session-controller/src/types.ts:308-310`), so a Remote
`selectModel` call DOES resolve the `session` resource and a non-owner Peer
is checked by `remoteAccess` (`docs/subsystems/typert.md:289`;
`packages/typert/protocol/README.md:63`). That check governs remote Peers
only: an in-process Host plugin call bypasses the Gateway entirely, carries
no principal, and is never asked of `remoteAccess`. The Tuner's policy, not
the Gateway, is therefore the boundary for the tool path.

That is precisely why the Tuner must not expose a raw "session id" switch.
The authority has to be the Tuner's own, and it must mirror the harness's
adjacency rule:

- **Caller identity** comes from `exec.agent` in the tool execution
  (`docs/subsystems/tools.md:207-208`) - never from a tool argument.
- **Direct parent only.** `exec.agent.session.header.parentSession` is the
  durable parent id (`packages/core/session/src/types.ts:95-124`); the child
  may address exactly that id, and only while the child is a resident
  continuable activation of it. This is the same test `send_message` uses:
  the sender activation's `parent.id` must equal the target, the exact live
  sender is required, and anything else is `subagent/unauthorized`
  (`packages/subagent/subagent/src/manager.ts:549-574`).
- **No siblings, no grandparents, no arbitrary ids.** `send_message` refuses
  them (`packages/subagent/tool-subagent-control/README.md:169`), and the
  Tuner must too.
- **The parent must remain live.** `authorizeLineage` requires
  `parentSession === parent.id` and the exact live parent
  (`packages/subagent/subagent/src/manager.ts:713-731`).
- **Explicit grant, default deny.** Parent -> child is natural ownership.
  Child -> parent is not: the child may only tune the parent after the
  parent granted it, per child, naming the allowed parameters. The grant is
  a Tuner-owned record (section 10.4), checked on every call; absent a
  grant, the tool refuses with a stable code and never silently no-ops.

### 7.4 Idle and settled children

A settled child has no live activation; `list_agents` reports it as
`inactive` (`docs/subsystems/subagent.md:377`), and `send_message` cold
resumes it from persistence (`:176`, `:457-458`). Tuning must not force a
resume, and it must not be lost.

- **No direct mutation.** `selectModel` would take the resume path and then
  fail the ownership check on the observed header
  (`packages/api/session-controller/src/agent.ts:431-433`), so it cannot be
  used to "pre-set" a cold child.
- **Store and apply.** The Tuner records the desired tuning keyed by the
  child's durable session id and applies it at the child's next
  `agent/request`, whenever that happens. A cold resume rebuilds the child's
  `agentOptions` from the descriptor
  (`packages/subagent/subagent/src/manager.ts:1363-1374`), so the launch
  route returns first and the Tuner's layer re-applies on the first request
  of the new activation. No resume is triggered by tuning.
- **Authority for a cold child.** The durable `parentSession` is readable
  from the attached session (`ctx.sessions.get`) or, when fully cold, from
  `ctx.sessionQuery.observeSession` (the same read path the controller uses
  at `packages/api/session-controller/src/agent.ts:413`). The parent must
  still be the exact live caller, mirroring `authorizeLineage`.
- **Refusing is the alternative** and is acceptable for v1: a settled child
  cannot be tuned until it runs again. Storing is strictly better for the
  user's stated use case (tune, then dispatch the next task) and costs only
  a record.

### 7.5 The authority model

| Caller -> target | Rule | Basis |
|---|---|---|
| self | always | `exec.agent.session.id` |
| parent -> direct live child | allowed | `ctx.agents.isOwnedBy(childId, caller)` (`packages/core/agent/src/index.ts:580-582`) or the child's `parentSession` while live |
| parent -> direct settled child | allowed, stored and applied later | durable `parentSession` in the child header |
| child -> direct parent | denied unless granted | `exec.agent.session.header.parentSession` + grant record |
| child -> sibling or grandparent | denied | adjacency rule (`packages/subagent/tool-subagent-control/README.md:169`) |
| anyone -> arbitrary `sessionId` | denied unless it resolves to one of the rows above | explicit resolution, never a free pass |
| remote client -> any session | out of scope for v1 | `remoteAccess` applies to Peers, not to the tool (`docs/subsystems/typert.md:289`) |

`ctx.agents.isOwnedBy` is the runtime truth: it returns true only while the
exact child entry is live under that exact owner
(`packages/core/agent/src/index.ts:572-582`). It is the right check for a
live child and the wrong check for a settled one, which is why the durable
`parentSession` is the second leg.

### 7.6 Security and privilege escalation

- **There is no in-process caller identity in `selectModel`.** Any host
  plugin or tool can address any non-subagent session by id. The model only
  reaches that power through a tool, so the tool's policy is the entire
  boundary. A Tuner that accepts an arbitrary `sessionId` from the model
  without resolving it to self/parent/child is a confused-deputy hole.
- **Permission presets are the dangerous parameter.** `permissionPresets.set`
  writes the sandbox and approval knobs
  (`packages/interaction/permission-presets/src/index.ts:398`); a child
  raising its parent to `danger-full-access` is escalation. Cross-agent
  permission tuning is rejected in v1. If it is ever added, it must be
  monotonic: a cross-agent change may only make the target MORE restrictive,
  never less.
- **cwd is a scope change.** Redirecting the parent's file operations from a
  child changes what the parent reads and writes. Rejected cross-agent in
  v1.
- **Direction matters.** Even for effort and sampling, a policy may bound
  the direction (for example, a child may lower the parent's effort but not
  raise it) or the range. The grant should carry the allowed parameter set,
  not a boolean.
- **No silent success.** Every refusal is a stable code
  (`tuner/unauthorized`, `tuner/unsupported-target`, `tuner/out-of-range`)
  returned to the model, and every accepted change is a ledger line naming
  caller, target, parameter, and old -> new value.
- **The Remote face, if added later**, must make the session resource
  explicit for every method (a `resources` reader, or a `sessionId` field
  covered by the registered default the built-in `selectModel` already uses
  at `packages/api/session-controller/src/index.ts:159`) and must read the
  caller from `this.ctx.invocation`, never from arguments
  (`docs/defensive-patterns/remote-and-api.md:53`). The existing
  `selectModel` Remote is already covered this way; the Tuner must not be
  the exception.

### 7.7 The default-save problem and the four options

`selectModel` always calls `agentDefaultModel.saveSelection`
(`packages/api/session-controller/src/commands.ts:177-181`), which writes the
profile patch (`packages/boot/config-editor/src/index.ts:87-114`). A
cross-agent tuner that used it would let a child rewrite the user's
deployment default. The alternatives:

- **(a) Call `selectModel` and disclose the default move.** Cheapest for a
  root session, impossible for a child (7.1), and unacceptable for the
  child -> parent direction. Rejected as the primary path.
- **(b) A sidecar `agent/request` listener plus a plugin-owned store.** No
  default save, works for every target including children, and the logged
  header remains the durable effect. Costs: no `model/selection` event (the
  intent lives in the Tuner's record), the UI projection follows the header
  only after the next request, and the Tuner must emit its own switch
  notice. This is the recommendation.
- **(c) Append `model/selection` plus a sidecar selection ref.** The
  controller's per-Agent `picked` cache is not invalidated by the event
  (`packages/api/session-controller/src/agent.ts:289-332`), so the
  controller's listener would keep applying the old route under the
  Tuner's override. Worse, a later user `/model` sets a new `picked`, the
  logged header no longer matches it, `consumeSelection` never clears it
  (`:352-359`), and the Tuner's outer listener silently defeats the user's
  explicit choice. Rejected.
- **(d) An upstream session-only selection option.** The clean fix: a
  `selectModel` variant that skips `saveSelection` and accepts an explicit
  authority for a subagent target. Nothing like it exists today
  (`commands.ts:157-192` has no such flag, and the ownership refusal is
  unconditional). Recommend filing it as the long-term ask; the Tuner's
  seam should be written so it can delegate to it later.

**Recommendation: (b) now, (d) upstream.** The Tuner never calls
`selectModel`, so the deployment default never moves, and the same code
path serves self, parent, and child.

### 7.8 Which parameters are safe cross-agent

- **Safe:** reasoning effort, sampling (`temperature`, `maxTokens`, `stop`),
  and the route (provider + model) with the precedence rules of 7.7.
- **Conditional:** permission preset only as a monotonic restriction and
  only parent -> child, behind a flag - deferred. cwd only parent -> child,
  behind a flag - deferred.
- **Rejected:** the system prompt, the tool set, and the agent preset. They
  are composition, not parameters: the prompt assembly is authoritative
  (`docs/subsystems/system-prompt.md:214-231`), the tool registry is scoped
  and reconciled by the loop
  (`packages/core/agent-loop/src/agent.ts:652-664`), and the preset is
  mounted before the first turn (`docs/subsystems/core.md:560-567`). A child
  must never be able to swap its parent's composition, and the harness has
  no seam for it anyway.

### 7.9 What the target's UI shows

- The `modelSelection` projection updates `lastUsed` from the next
  `request/header`, so the parent's own model seat follows a Tuner change
  after the next request
  (`packages/api/session-controller/src/model-selection-projection.ts:44-66`).
- The parent's child card keeps the launch route from the descriptor
  (`packages/subagent/subagent/src/descriptor.ts:76-81`) and has no model
  seat to update (`packages/client/ui-model-selection/src/client/index.ts:9-11`).
- Sampling values are already part of the assistant request config the UI
  records (`packages/client/ui-conversation/src/client/contract/records.ts:15-25`).
- The Tuner's own ledger is the only surface that shows the full history of
  who tuned what, when, and to which value.

## 8. The family's position

- **The registry has no conversation-parameter plugin.** The 31 published
  packages are the machinery library, the factory service, the governance
  trio, the seven normalize flavors, and the guardians/live block
  (`Documentation/Plugins/PLUGIN-FAMILY.md:51-97`). Their event surfaces are
  `llm/stream`, `fs/observed`, the tool pipeline, and the loader
  (`:46-49`) - none touches `agent/request`, `session.selectModel`, or a
  cross-agent authority.
- **The installed desktop set is the same 15 Classic packages**
  (`~/.dsh/profiles/desktop/package.json:6-29`); nothing parameter-related
  is installed.
- **`ROUTING-ENFORCER-PLUGIN.md` is launch-time routing, not runtime
  mutation.** It resolves a route for a subagent LAUNCH from the user's
  policy and silently injects or corrects `provider`/`model`/`effort` at the
  launch path (`Documentation/Plans/ROUTING-ENFORCER-PLUGIN.md:56-84`;
  summary at `Documentation/Plugins/ORCHESTRATION-PLUGINS.md:67-82`). It
  changes what a NEW child starts with; it does not change a running
  conversation, a settled child's next turn, or a parent from a child.
- **`SUBAGENT-QUEUE-PLUGIN.md` is dispatch capacity**, and it explicitly
  leaves routing to the routing-enforcer
  (`Documentation/Plans/SUBAGENT-QUEUE-PLUGIN.md:98`); it notes the subagent
  launch options carry provider, model, effort, and maxTokens only
  (`:45`).
- **The built-in `/model` and `agent-default-model` are the existing
  "something like this"** for one session. The Agent Tuner is the missing
  cross-agent layer, not a replacement for them.

## 9. The gap, separated into three buckets

**A. Already possible with no plugin**

- Switch model and effort in the composer seat or with `/model`; the choice
  is durable, projected, and becomes the default.
- Switch effort only; no model-switch notice is appended.
- Read the current selection from the `modelSelection` projection in any
  client.
- Change the permission preset, the working directory, and the title for
  one session.
- Change the system prompt and the tool set from a plugin for its own
  scope, though not as "one parameter".
- Message or interrupt an adjacent child (`send_message`,
  `interrupt_agent`), which proves the authority model but changes no
  parameter.
- Set sampling from a plugin's `agent/request` listener (mechanism exists;
  no product surface).

**B. Possible only with a new plugin**

- Parent -> live child tuning of effort, sampling, and route.
- Child -> parent tuning, gated by an explicit parent grant.
- Settled child tuning stored and applied on the child's next turn.
- A user-facing sampling control (temperature, maxTokens, stop) with
  validation, bounds, and a durable per-conversation intent.
- Sampling and tuning that survive resume (the loop does not re-seed them).
- A model-callable tuning tool, so the agent can adjust its own or an
  adjacent conversation within a policy.
- Named tuning profiles (for example "review", "fast", "careful") applied
  per conversation instead of editing the profile.
- One unified tuning service with one ledger line per change and one
  read-back of the effective values.
- Per-session overrides that do not move the deployment default.

**C. Not possible, or unsafe**

- **Cross-agent selection through `selectModel`.** Every subagent session is
  refused, live or cold (`packages/api/session-controller/src/agent.ts:402-408`).
- **Inventing effort ids or renaming the built-in labels.** Adapter-owned;
  rejected before dispatch (`packages/llm/llm/src/index.ts:928-933`), name
  derived from the id (`packages/llm/llm-pi-ai/src/adapter.ts:207-210`).
- **Switching the agent preset mid-conversation.** `select` is before the
  first turn, `recompose` is for a blank Agent
  (`docs/subsystems/core.md:553-567`).
- **Changing tools or the prompt as one config object.** They are a scoped
  registry and an authoritative assembly with separate reconciliation
  (`packages/core/agent-loop/src/agent.ts:406-424`, `:652-664`).
- **Cross-agent permission or cwd escalation.** A child must not widen its
  parent's sandbox or redirect its files (section 7.6).
- **Appending `model/selection` directly.** The controller's per-Agent
  selection cache is not invalidated by the event, so the live Agent keeps
  the old route (section 4.1), and a later `/model` can be silently defeated
  (section 7.7c).
- **Writing `request/header` directly.** The loop owns the snapshot and the
  equality check (`packages/core/agent-loop/src/agent.ts:626-651`); a
  second writer desyncs reconstruction.
- **Varying sampling per step.** Every change appends a `change` header and
  the sampling scalars are already flagged as a cache concern
  (`docs/subsystems/llm-streaming.md:767`); per-step churn is silent cache
  damage.

## 10. The Agent Tuner - the recommended plugin

**Package:** `@playform/plugin-dsh-tuner`. **Human name:** Agent Tuner.
**Tool:** `tune_agent`.

### 10.1 Scope options

- **A. Command only.** A `/tune` client command plus a Host method. Smallest,
  but it needs a client half and a Remote, which no family package does
  today, and it leaves the model unable to tune.
- **B. Host service + `tune_agent` tool + authority policy + ledger
  (recommended).** One Host plugin, one `agent/request` listener, one tool,
  one store, one ledger. No client code, no new seat, no duplication of
  `/model`.
- **C. B plus a settings page, named profiles UI, and per-role inheritance.**
  Larger; only worth it after B is proven live.

**Recommendation: B**, with named profiles living in the plugin config in
v1 and a client surface deferred.

### 10.2 Host/client split and the exact seams

- **Host only in v1.** `export const inject = ['agents', 'sessionController',
  'sessionProjections', 'llm', 'tools']` (sessionController only for the
  read/validation helpers and for a future session-only selection method;
  the Tuner does not call `selectModel` in v1). The family's loader contract
  (name, apply, Config, inject) applies
  (`Documentation/Skill/plugin-system/SKILL.md`, the loader section).
- **Tuning** - one `agent/request` listener on the plugin's own context,
  filtered by `payload.agent`. It calls `next()` first and replaces only the
  tuned fields, preserving provider, model, effort, and the rest
  (`packages/core/agent/src/model-selection.ts:96-111` is the model).
- **Notice** - one `agent/pre-step` listener, prepended, emitting a durable
  user-role notice for a provider/model change only, with the same
  `model-selection` message source the harness uses
  (`packages/core/agent/src/model-selection.ts:47-61`, `:113-126`). Effort
  and sampling changes stay silent, matching the harness.
- **Conflict observation** - one `session/event` listener for
  `model/selection`, clearing the Tuner's route tuning for that session so
  the user's explicit `/model` always wins (the same event the controller
  consumes at `packages/api/session-controller/src/index.ts:210-219`).
- **Do NOT hook `system-prompt/assemble` in v1.** It is not needed to tune,
  and the assembly is authoritative
  (`docs/subsystems/system-prompt.md:214-231`).
- **Do NOT register `conversation.input.model` or its label child.** The
  seat is already owned by `ui-model-selection` with a single child
  (`packages/client/ui-model-selection/src/client/index.ts:172-177`); a
  second registration would conflict.

### 10.3 The tool

`tune_agent`, registered globally, acting on `exec.agent`
(`docs/subsystems/tools.md:207-208`). The name is chosen over
`set_agent_parameters` because it names the act and does not imply a fixed
parameter set (section 11).

Inputs:

- `target`: `self` | `parent` | `child` | `sessionId` (the last one is
  resolved through the authority policy and is never a free pass).
- `agent_id`: required only for `target: 'child'`.
- `action`: `get` | `set` | `clear` | `grant` (the last is parent-only).
- `parameters`: `reasoningEffort`, `temperature`, `maxTokens`, `stop`,
  `profile` (at least one for `set`).

Behaviour:

- Resolve the caller from `exec.agent`; resolve the target through the
  policy table (7.5). Refuse with a stable code on any failure.
- Validate effort and route with `ctx.llm.resolveCallConfig` before storing
  (`packages/llm/llm/src/index.ts:884-896`); validate sampling against the
  plugin's bounds (section 4.3 explains why the runtime does not).
- Store the tuning and return the effective values plus the previous ones.
  The change applies at the target's next request; the tool result says so.
- `get` reads the stored tuning plus the target's logged header, so the
  model sees the truth even after a resume.
- `grant` records a child -> parent grant on the parent's call, naming the
  allowed parameters; `clear` removes a tuning and returns the target to its
  launch/selected values.

### 10.4 The authority policy

- **Default deny for child -> parent.** A grant is a Tuner-owned record
  naming `(childSessionId, parentSessionId, allowedParameters)`. It is
  created only by the parent (`target: 'child'`, `action: 'grant'`), checked
  on every child call, and revoked when either session ends or the parent
  clears it.
- **Parent -> child is natural ownership**, checked with
  `ctx.agents.isOwnedBy(childId, caller)` for a live child
  (`packages/core/agent/src/index.ts:580-582`) and the durable
  `parentSession` for a settled one.
- **No arbitrary ids.** `target: 'sessionId'` resolves to self, direct
  parent (with grant), or direct child (with ownership); anything else is
  `tuner/unauthorized`.
- **Parameter allow-list per direction.** v1: effort, sampling, and route.
  Permission and cwd are refused cross-agent (section 7.8). A grant may
  narrow the set but never widen it beyond the plugin's own allow-list.

### 10.5 Config schema sketch

```
enabled              boolean   default false        (family defaults-off posture)
log                  boolean   default true
logFile              string    default '~/.dsh/plugin-dsh-tuner.log'
profiles             map of name -> { reasoningEffort?, temperature?, maxTokens?, stop? }
defaultProfile       string    default ''
allowed              string[]  default [reasoningEffort, temperature, maxTokens, stop]
crossAgent           object    { parentToChild: true, childToParent: false,
                                requireGrant: true, allowRoute: true }
bounds               object    { temperatureMin 0, temperatureMax 2, maxTokensMax 131072,
                                stopMax 4, stopMaxChars 64 }
toolName             string    default 'tune_agent'
```

Validation: the schema at load (fail loud), `llm.resolveCallConfig` per
effort/route application, the plugin's own bounds for sampling, and a
refusal - never a clamp - for anything outside them.

### 10.6 Persistence and resume

- **Tuning intent**: a plugin-owned record per change via
  `appendPluginRecord` - an ignorable `plugin:` event that survives fork and
  resume and never enters the model surface
  (`packages/core/session/src/index.ts:468-498`;
  `packages/core/session/src/types.ts:519-533`). The API is marked
  experimental and the in-repo caller gate only allows
  `packages/experimental/` (`packages/core/session/src/index.ts:478-481`),
  which an out-of-repo family plugin is outside of but should treat as a
  stability warning. A sidecar store keyed by session id is the fallback.
- **Tuning effect**: the logged `request/header`, which is the authoritative
  record of what was actually used (`docs/subsystems/session.md:181-206`).
  If the plugin record is lost, the header still shows the truth; if the
  header is old, the next request re-applies the stored intent.
- **Grants**: the same record mechanism, keyed by the child session id.
- **Launch route**: for a child, the descriptor's `agentProvider`,
  `agentModel`, and `agentReasoningEffort`
  (`packages/subagent/subagent/src/descriptor.ts:76-81`) are what a cold
  resume restores (`packages/subagent/subagent/src/manager.ts:1363-1374`);
  the Tuner's layer re-applies on the first request of the new activation.
- **No silent drift**: the ledger line and the tool result both name the
  effective values; the header is the audit trail the user can read back.

### 10.7 Precedence and conflict rules

1. **The user's explicit selection wins.** A `model/selection` event for a
   session clears the Tuner's route and effort tuning for that session
   before the next request, so `/model` is never silently defeated and the
   controller's pending selection is consumed normally
   (`packages/api/session-controller/src/index.ts:210-219`).
2. **The Tuner never writes `model/selection`.** It observes the event; it
   does not produce it (section 7.7c).
3. **The Tuner yields to a pending controller selection.** If
   `ctx.sessionProjections.stateOf(session, 'modelSelection')` reports a
   pending selection (the read the controller itself uses at
   `packages/api/session-controller/src/agent.ts:292`), the Tuner skips its
   route override for that request.
4. **A tuning never outlives its target.** Clearing a tuning or ending the
   session removes the record; a resumed session starts from its launch or
   selected route unless a tuning record still exists.

### 10.8 Constraints the implementation must respect

- **Header and epoch semantics**: apply a change once per intent, never per
  step. Each change appends a `request/header` snapshot with reason `change`
  (`packages/core/agent-loop/src/agent.ts:643-648`) and can affect provider
  cache reuse (`packages/llm/llm/src/call-config.ts:1-7`,
  `docs/subsystems/llm-streaming.md:767`).
- **Next request only**: a running target is tuned at its next step
  boundary, never mid-stream
  (`docs/subsystems/core.md:955-977`).
- **Per-agent, not per-session-only**: the loop is per Agent; key tunings by
  the Agent/Session id and expect each subagent to have its own.
- **Concurrency**: the store needs a per-Agent promise chain or the
  generation-counter pattern the client directory uses
  (`packages/client/ui-model-selection/src/client/directory.ts:44-45`,
  `:96-108`).
- **HMR**: register every listener and the store through `ctx.effect` so a
  reload disposes cleanly; re-read persisted records when the Agent is next
  assembled.
- **No silent default moves**: the Tuner never calls `selectModel`, so the
  deployment default never moves (section 7.7).

### 10.9 What to borrow

- `installModelSelection` - the snapshot-at-assemble plus replace-at-request
  pattern, and the "do not split prompt and request" rule
  (`packages/core/agent/src/model-selection.ts:63-81`).
- The model-switch notice - text, source, and the pre-step prepend
  (`packages/core/agent/src/model-selection.ts:47-61`, `:113-126`).
- `send_message` - the adjacent-agent authority shape: exact live sender,
  direct parent or direct child only, durable lineage checked separately
  (`packages/subagent/subagent/src/manager.ts:549-574`, `:713-731`).
- The webhook's scoped `agent/request` listener with a "until the first
  header exists" guard (`packages/experimental/webhook/src/session.ts:91-104`).
- `ModelDirectory`'s generation counter for last-write-wins
  (`packages/client/ui-model-selection/src/client/directory.ts:44-45`).
- `agentPresets.select`'s "before the first turn" rule as the model for
  refusing composition changes (`docs/subsystems/core.md:560-567`).
- The family conventions: loader contract, factory `Schema`, one ledger per
  plugin, byte-asserted ledger strings, and the smokes as the arbiter
  (`Documentation/Plugins/PLUGIN-FAMILY.md:175-233`).

## 11. Naming

**Recommended: `tuner` / Agent Tuner** - `@playform/plugin-dsh-tuner`, tool
`tune_agent`, this document `AGENT-TUNER-RESEARCH.md`.

Rationale: it names the ACT (tuning a running agent) without implying
governance, a fixed parameter set, or one direction of control. It scales
from self-tuning to parent <-> child, and it reads correctly for a settled
child that is tuned for its next turn rather than "controlled" now.

Rejected in one line: `params` (generic, and it implies a fixed parameter
set), `agent-tuning` (redundant with the family namespace),
`cross-agent-tuning` (too narrow - self and parent tuning are first-class),
`live-tuning` (settled children are tuned for their next turn), `dial` (a
metaphor, not a verb the model can act on), `governor` (taken by the
governance trio), `control` (too broad, and it collides with the subagent
control tools), and `effort` (too narrow for route and sampling). `tuner`
won because it names the act without implying governance or a fixed
parameter set.

The document was renamed from `CONVERSATION-PARAMETERS-RESEARCH.md` to
`AGENT-TUNER-RESEARCH.md`; the registry path, the INDEX row, and every
cross-reference use the new name.

## 12. Residuals and open questions

1. **Does the deployment's provider honor `temperature`?** The pi-ai
   adapter sends it when set (`packages/llm/llm-pi-ai/src/adapter.ts:418`),
   but the compat field that declares temperature support is
   anthropic-messages-specific
   (`packages/llm/llm-pi-ai/src/catalog.ts:452-453`) and the desktop profile
   does not declare it. Verify against the live Workers AI endpoint before
   shipping a UI control.
2. **Should a session-only selection method be filed upstream?** Option (d)
   in 7.7 is the clean fix: skip `saveSelection` and accept an explicit
   authority for a subagent target. The Tuner's seam should be able to
   delegate to it later.
3. **Should the parent grant child -> parent tuning by default?** The
   recommendation is no. If the user wants a child that can lower the
   parent's effort when it is stuck, that is a per-launch decision the
   parent should make explicitly.
4. **Should a grant bound direction?** For example, a child may lower the
   parent's effort but not raise it, or raise it only to `max`. The record
   supports it; the default policy is undecided.
5. **Is `appendPluginRecord` acceptable for an out-of-repo plugin?** The
   mechanism is right; the in-repo caller gate says experimental only
   (`packages/core/session/src/index.ts:478-481`). Decide whether to depend
   on it or use a sidecar.
6. **Should tuning inherit to grandchildren?** The adjacency rule says no
   (`packages/subagent/tool-subagent-control/README.md:169`). A parent that
   wants a grandchild tuned should tune its child and let the child tune
   downward.
7. **What is the UI surface?** The composer seat is taken. Options are a
   `/tune` command (needs a client half and a Remote, a first for the
   family), a settings page, or a new seat contributed upstream. v1 can ship
   without one.
8. **Where is the boundary with the routing-enforcer?** That plugin owns
   launch-time policy; the Tuner owns runtime tuning. They should share the
   profile vocabulary but not the code path.
9. **Should the Tuner announce active tuning to the model?** A small
   `system-prompt/assemble` section would tell the model what is in force,
   at a token cost. Not needed for correctness; decide after live use.
10. **Should the tool require approval?** A `tools/pre-execute` `ask` is
    available (`docs/subsystems/tools.md:398-428`), but adds friction; the
    config flag and the authority policy may be enough for a single-user
    desktop deployment.

## 13. Verification

Run on 2026-10-21. Harness checkout HEAD `687f282e` (0.2.1-rc.2).

1. `test -f Documentation/Researches/AGENT-TUNER-RESEARCH.md` - exit 0.
2. `grep -n AGENT-TUNER Documentation/INDEX.md` - the new row is present in
   the Researches table, and the old `CONVERSATION-PARAMETERS` row is gone.
3. The two Researches counts read 8 (the tree block and the section
   heading).
4. `git -C <family repo> status --short` - this work is the rename pair
   (`D Documentation/Researches/CONVERSATION-PARAMETERS-RESEARCH.md`,
   `?? Documentation/Researches/AGENT-TUNER-RESEARCH.md`) plus
   `M Documentation/INDEX.md`. A concurrent one-line change in
   `Maintain/Generate-NPM-Placeholders.mjs` is not part of this work and was
   not touched.
5. `git -C <harness checkout> status --short` - empty (the source checkout
   was not modified).
6. ASCII check on this document - only tab and newline outside the ASCII
   range.
7. Frontmatter parses; every status uses the seven-value vocabulary; every
   `registry` and `index` path resolves.
8. Spot-checked anchors, re-read at the cited lines: the live-child refusal
   (`packages/api/session-controller/src/agent.ts:402-408` and `:115`), the
   `selectModel` body (`packages/api/session-controller/src/commands.ts:157-192`),
   the `agent/request` declaration
   (`packages/core/agent/src/runtime-types.ts:337`), `isOwnedBy`
   (`packages/core/agent/src/index.ts:580-582`), `exec.agent`
   (`docs/subsystems/tools.md:207-208`), the subagent adjacency rule
   (`packages/subagent/subagent/src/manager.ts:549-574`, `:713-731`), the
   cold-resume route rebuild
   (`packages/subagent/subagent/src/manager.ts:1363-1374`), and the
   session default-field registration that puts a Remote `selectModel` call
   under `remoteAccess` (`packages/api/session-controller/src/index.ts:159`,
   `packages/typert/protocol/README.md:63`).

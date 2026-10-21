---
title: Conversation Parameters - what a plugin can change at runtime
category: Researches
kind: research-output
date: 2026-10-21
status: complete
registry: Documentation/Researches/CONVERSATION-PARAMETERS-RESEARCH.md
index: Documentation/INDEX.md
statuses:
  - name: model and reasoning effort switching at runtime
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
  - name: user-facing sampling controls
    state: open
    evidence: packages/llm/llm/src/call-config.ts:16 defines the fields only - no UI, service, or command sets them
  - name: model-callable parameter tool
    state: open
    evidence: this document only - no package, no plan
  - name: named parameter profiles
    state: open
    evidence: this document only - no package, no plan
  - name: inventing or renaming reasoning effort ids
    state: rejected
    evidence: packages/llm/llm/src/index.ts:928 rejects unoffered ids; packages/llm/llm-pi-ai/src/adapter.ts:209 derives the name from the id
  - name: mid-conversation agent preset switching
    state: rejected
    evidence: docs/subsystems/core.md:560 - select applies before the first turn; recompose only for a blank Agent
  - name: permission preset runtime switching
    state: implemented
    evidence: packages/interaction/permission-presets/src/index.ts:398
  - name: working directory runtime change
    state: implemented
    evidence: packages/session/working-directory/src/index.ts:163
  - name: session title as a conversation parameter
    state: rejected
    evidence: docs/subsystems/session-title.md:11 - the title projection never enters a model request
  - name: plugin-owned sampling persistence
    state: open
    evidence: packages/core/session/src/index.ts:492 provides the plugin record mechanism; no plugin uses it for parameters
  - name: the existing-overlap verdict
    state: resolved
    evidence: this document, section 6
---

# CONVERSATION-PARAMETERS-RESEARCH.md - can a plugin create, modify, and update conversation parameters at runtime?

> The user's question: "Can we, through a plugin, create / modify and update
> conversation parameters, such as the model's effort name and others, on the
> fly?"
>
> The short answer, stated before the evidence:
>
> - **YES for model and reasoning effort** - and the harness ALREADY does it
>   without any new plugin (the `/model` command, the composer seat, and
>   `session.selectModel`).
> - **YES for sampling** (temperature, maxTokens, stop) through the
>   `agent/request` waterfall - but nothing in the harness exposes it as a
>   user-facing parameter, and it does not survive a resume by itself.
> - **YES for the system prompt, the tool set, the permission preset, and the
>   working directory** - each through its own seam, not through one
>   "parameter object".
> - **NO for inventing effort ids, renaming effort labels in the built-in UI,
>   or switching an agent preset mid-conversation** - those are owned by the
>   adapter catalog and by the preset lifecycle.
> - The honest gap a new plugin can own: sampling controls, named parameter
>   profiles, a model-callable parameter tool, and one audited parameter
>   service - not model/effort switching, which is built in.

Verified 2026-10-21 against the harness checkout at HEAD `687f282e`
(release 0.2.1-rc.2) and the running desktop profile at
`~/.dsh/profiles/desktop/cordis.patch.yml`. Every claim below is anchored to
`packages/...:line` or `docs/...:line` as it exists at that HEAD.

## 1. Intent

The question decomposes into four separate questions that are easy to
conflate:

1. **What is a conversation parameter in this harness?** Is it a durable
   event, a config value, a request header field, or a mounted composition?
   The answer decides which mutation is even meaningful.
2. **Which parameters can a plugin mutate while a conversation is live?**
   Not "at launch" and not "in the profile" - during an existing Session.
3. **Does the harness already ship this?** If it does, a new plugin must add
   something the built-in path does not, or it is duplication.
4. **What should the next family plugin actually be?** The smallest scope
   that owns a real gap.

This document answers those four, per parameter, with the seam, the owner,
the durability, and the failure mode. It is written for the implementer of
the next plugin, not as a survey of the LLM subsystem.

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

## 3. The parameter matrix

| Parameter | Where it lives | Official mutation seam | Scope | Plugin at runtime |
|---|---|---|---|---|
| provider + model | `model/selection` event, `request/header`, `modelSelection` projection | `ctx.sessionController.selectModel` | one Agent, next prompt assembly | YES |
| reasoning effort | same carriers plus the adapter catalog | `selectModel`, or `agent/request` | one Agent, next request | YES, offered ids only |
| temperature, maxTokens, stop | `request/header` (maxTokens also seeds from `AgentOptions`) | `agent/request` waterfall | one request, logged per change | YES, but no service or event |
| system prompt + variables | `system/message` derived history; assembly `variables` | `system-prompt/assemble` waterfall | per assembly, per agent scope | YES |
| tool set + schemas | `request/header` `tools` plus `developer/message` additions | `ctx.tools.register` / `ctx.tools.restrict` | per agent scope | YES, the loop reconciles |
| agent preset | `agent-preset/selected` plus the mounted composition | `ctx.agentPresets.select` / `recompose` | before the first turn only | NO |
| permission preset | `permission/preset` plus sandbox and approval knob events | `ctx.permissionPresets.set` | per Session, immediate | YES |
| working directory | `working-directory/change` | `ctx.workingDirectory.set` | per Session | YES |
| session title | `session/title` plus the title projection | `ctx.sessionTitle.rename` | per Session | YES, but not a conversation parameter |

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

**Can a plugin do it?** YES, by calling
`ctx.sessionController.selectModel({ sessionId, provider, model, reasoningEffort })`
in-process. The method is public and merely marked for the Remote gateway
(`packages/typert/protocol/src/index.ts:274-281`), so a Host plugin holding
`sessionController` in `inject` calls it directly.

**Can a plugin append `model/selection` itself?** Not safely for a live
Agent. The event would update the projection, but `selectionFor` already
returned a ref whose `picked` value is cached; the next request would still
use the old route, and the UI would show the event while the model does not
follow it. The event alone only takes effect for an Agent installed after
the append (a resume or a new Agent). Go through `selectModel`.

**The side effect to disclose**: `selectModel` calls
`agentDefaultModel.saveSelection` (`commands.ts:177-181`), which writes the
active profile patch through the config editor
(`packages/core/agent-default-model/src/index.ts:82-94`,
`packages/boot/config-editor/src/index.ts:87-114`; the editor is composed by
the base bundle at `packages/bundle/base/cordis.patch.yml:105-107` and the
desktop profile carries the entry at
`~/.dsh/profiles/desktop/cordis.patch.yml:123-128`). The last selection
therefore becomes the deployment default. That is exactly what the built-in
`/model` does; a model-callable tool doing it silently is a different act.

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
seam (the returned assembly is authoritative), not a scalar setter.

### 4.5 Tool set and tool schemas

- `ctx.tools.register` registers globally or in the calling agent scope, and
  `ctx.tools.restrict` masks global tools for the calling scope
  (`docs/subsystems/tools.md:524-539`).
- The loop records tool changes in two places: the header's `tools` array
  (compared schema-wise by `headerEquals`,
  `packages/core/session/src/request-header.ts:43-52`) and a
  `developer/message` carrying `tool-addition` / `tool-removal` blocks
  (`packages/core/agent-loop/src/agent.ts:652-664`).

**Can a plugin do it?** YES, but this is not a scalar. It is a scoped
registry mutation that the loop reconciles into the header and the derived
history. A tool can also target the current agent because every execution
carries `exec.agent` (`docs/subsystems/tools.md:207-208`).

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

**Can a plugin do it?** YES, per Session, and it takes effect for subsequent
tool calls. This is a real runtime parameter a parameter plugin could
legitimately include.

### 4.8 Working directory

- `get(session)` reads the logged value; `set(agent, path)` validates and
  records a change (`docs/subsystems/working-directory.md:9`; method at
  `packages/session/working-directory/src/index.ts:163`).
- Changes are local to one Session; the immutable header keeps the original
  project, and the model sees the current value as a required user-context
  snapshot (`docs/subsystems/working-directory.md:11-15`).

**Can a plugin do it?** YES. The `working_directory` tool already exposes
the same operation to the model.

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

This is the part of the user's question that most needs a precise answer,
because "effort name" conflates three different things.

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
- **Can choose any offered id** through `selectModel`, or per request
  through `agent/request`.
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
silent fallback. The UI shows the failure on its own retry surface
(`packages/client/ui-model-selection/src/client/directory.ts:109-116`).

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

**The overlap question answered directly:** YES, we already have model and
reasoning-effort switching, and it is the harness's own feature, not a
family plugin. NO, we do not have a broader parameter surface: nothing
exposes sampling as a user-facing control, nothing lets the model set
conversation parameters through a tool, nothing provides named parameter
profiles, and nothing audits parameter changes in one ledger. Those are the
parts a new plugin can own without duplicating the built-in path.

## 7. The family's position

- **The registry has no conversation-parameter plugin.** The 31 published
  packages are the machinery library, the factory service, the governance
  trio, the seven normalize flavors, and the guardians/live block
  (`Documentation/Plugins/PLUGIN-FAMILY.md:51-97`). Their event surfaces are
  `llm/stream`, `fs/observed`, the tool pipeline, and the loader
  (`:46-49`) - none touches `agent/request` or `session.selectModel`.
- **The installed desktop set is the same 15 Classic packages**
  (`~/.dsh/profiles/desktop/package.json:6-29`); nothing parameter-related
  is installed.
- **`ROUTING-ENFORCER-PLUGIN.md` is launch-time routing, not runtime
  mutation.** It resolves a route for a subagent LAUNCH from the user's
  policy and silently injects or corrects `provider`/`model`/`effort` at the
  launch path (`Documentation/Plans/ROUTING-ENFORCER-PLUGIN.md:56-84`;
  summary at `Documentation/Plugins/ORCHESTRATION-PLUGINS.md:67-82`). It
  changes what a NEW child starts with; it does not change the parameters of
  a running conversation, and it never touches sampling, the prompt, the
  tool set, or the permission preset. The overlap with this research is the
  policy vocabulary (roles and efforts), not the mechanism.
- **`SUBAGENT-QUEUE-PLUGIN.md` is dispatch capacity**, and it explicitly
  leaves routing to the routing-enforcer
  (`Documentation/Plans/SUBAGENT-QUEUE-PLUGIN.md:98`); it notes the subagent
  launch options carry provider, model, effort, and maxTokens only
  (`:45`) - again launch-time.
- **The built-in `/model` and `agent-default-model` are the existing
  "something like this".** If the user only wants model and effort
  switching, the honest answer is that the harness already does it, better
  than a plugin would, because it also maintains the projection, the switch
  notice, and the default.

## 8. The gap, separated into three buckets

**A. Already possible with no plugin**

- Switch model and effort in the composer seat or with `/model`; the choice
  is durable, projected, and becomes the default.
- Switch effort only; no model-switch notice is appended.
- Read the current selection from the `modelSelection` projection in any
  client.
- Change the permission preset, the working directory, and the title.
- Change the system prompt and the tool set from a plugin (already done by
  family hooks), though not as "one parameter".
- Set sampling from a plugin's `agent/request` listener (mechanism exists;
  no product surface).

**B. Possible only with a new plugin**

- A user-facing sampling control (temperature, maxTokens, stop) with
  validation, bounds, and a durable per-conversation intent.
- Sampling that survives resume (the loop does not re-seed it).
- A model-callable parameter tool, so the agent can adjust its own
  conversation within a policy.
- Named parameter profiles (for example "review", "fast", "careful")
  applied per conversation instead of editing the profile.
- One unified parameter service with one ledger line per change and one
  read-back of the effective values.
- Per-session overrides that do not move the deployment default.

**C. Not possible, or unsafe**

- **Inventing effort ids or renaming the built-in labels.** Adapter-owned;
  rejected before dispatch (`packages/llm/llm/src/index.ts:928-933`), name
  derived from the id (`packages/llm/llm-pi-ai/src/adapter.ts:207-210`).
- **Switching the agent preset mid-conversation.** `select` is before the
  first turn, `recompose` is for a blank Agent
  (`docs/subsystems/core.md:553-567`).
- **Changing tools or the prompt "as one config object".** They are a
  scoped registry and an authoritative assembly with separate
  reconciliation (`packages/core/agent-loop/src/agent.ts:406-424`,
  `:652-664`); a single parameter write cannot represent them.
- **Appending `model/selection` directly.** The controller's per-Agent
  selection cache is not invalidated by the event, so the live Agent keeps
  the old route (section 4.1).
- **Writing `request/header` directly.** The loop owns the snapshot and the
  equality check (`packages/core/agent-loop/src/agent.ts:626-651`); a
  second writer desyncs reconstruction.
- **Varying sampling per step.** Every change appends a `change` header and
  the sampling scalars are already flagged as a cache concern
  (`docs/subsystems/llm-streaming.md:767`); per-step churn is silent cache
  damage.

## 9. The recommended next plugin

### 9.1 Scope options

- **A. Command only.** A `/params` client command plus a Host method that
  applies a named profile. Smallest, but it needs a client half and a
  Remote, which no family package does today, and it leaves the model
  unable to use the feature.
- **B. Host service + model-callable tool + config profiles (recommended).**
  One Host plugin, one `agent/request` listener, one tool, one ledger. No
  client code, no new seat, no duplication of `/model`.
- **C. B plus a settings page and per-role inheritance.** Larger; only
  worth it after B is proven live.

**Recommendation: B**, with named profiles living in the plugin config in
v1 and a client surface deferred.

### 9.2 Host/client split and the exact seams

- **Host only in v1.** `export const inject = ['sessionController', 'llm', 'tools']`.
  The family's loader contract (name, apply, Config, inject) applies
  (`Documentation/Skill/plugin-system/SKILL.md`, the loader section).
- **Sampling** - one `agent/request` listener, registered on the plugin's
  own context and filtered by `payload.agent` (the waterfall is
  scope-filtered to the agent, `docs/subsystems/core.md:973`). It must call
  `next()` first and replace only the sampling fields, preserving provider,
  model, effort, and the rest - the same discipline
  `installModelSelection` uses (`packages/core/agent/src/model-selection.ts:96-111`).
- **Effort** - `ctx.sessionController.selectModel`, behind
  `allowEffortSwitch` (default false). This is the only safe seam; the
  tool result must state that the deployment default moved, because the
  seam saves it (`packages/api/session-controller/src/commands.ts:177-181`).
- **Do NOT hook `system-prompt/assemble` in v1.** It is not needed to set
  parameters, and the assembly is authoritative, so a listener risks
  disturbing other contributors (`docs/subsystems/system-prompt.md:214-231`).
- **Do NOT register `conversation.input.model` or its label child.** The
  seat is already owned by `ui-model-selection` with a single child
  (`packages/client/ui-model-selection/src/client/index.ts:172-177`); a
  second registration would conflict. A future sampling control needs a new
  named seat contributed by `ui-conversation`, or a settings page - neither
  is in v1.

### 9.3 The tool

`set_conversation_parameters`, registered globally, acting on `exec.agent`
(`docs/subsystems/tools.md:207-208`). Inputs, all optional, at least one
required: `profile`, `reasoningEffort`, `temperature`, `maxTokens`, `stop`,
`reset`. The tool returns the effective values plus what changed, and it
never returns silently on a partial application.

- Model/effort: validate with `ctx.llm.resolveCallConfig` first, then call
  `selectModel`. If `allowEffortSwitch` is false, refuse with a reason that
  names the built-in `/model` instead of pretending to apply it.
- Sampling: validate against the plugin's bounds, then store the override;
  the next `agent/request` applies it. The loop logs the header.
- Addressed subagent sessions: `selectModel` refuses them with
  `session/agent-busy` (`packages/api/session-controller/src/agent.ts:127-133`),
  so the tool must report that model/effort is unavailable there while
  sampling still applies (the waterfall runs for every agent).

### 9.4 Config schema sketch

```
enabled              boolean   default false        (family defaults-off posture)
log                  boolean   default true
logFile              string    default '~/.dsh/plugin-dsh-params.log'
profiles             map of name -> { reasoningEffort?, temperature?, maxTokens?, stop? }
defaultProfile       string    default ''
allowed              string[]  default [temperature, maxTokens, stop]
allowEffortSwitch    boolean   default false
allowModelCallable   boolean   default true
bounds               object    { temperatureMin 0, temperatureMax 2, maxTokensMax 131072,
                                stopMax 4, stopMaxChars 64 }
toolName             string    default 'set_conversation_parameters'
```

Validation: the schema at load (fail loud), `llm.resolveCallConfig` per
effort/route application, the plugin's own bounds for sampling, and a
refusal - never a clamp - for anything outside them.

### 9.5 Persistence and resume

- **Model and effort**: harness-owned. `model/selection` plus the header,
  restored by the projection on resume (section 4.1). The plugin stores
  nothing.
- **Sampling**: the header records what was used, but the loop does not
  re-seed `temperature` or `stop` on a new loop instance
  (`packages/core/agent-loop/src/agent.ts:111`, `:583-592`). The plugin must
  persist its per-session binding. Two options:
  1. a plugin-owned record via `appendPluginRecord` - an ignorable
     `plugin:` event that survives fork and resume and never enters the
     model surface (`packages/core/session/src/index.ts:468-498`;
     `packages/core/session/src/types.ts:519-533`). The API is marked
     experimental and the in-repo caller gate only allows
     `packages/experimental/` (`packages/core/session/src/index.ts:478-481`),
     which an out-of-repo family plugin is outside of but should treat as a
     stability warning;
  2. re-apply the configured default profile at every request and keep
     per-session overrides in memory only (simpler, loses overrides on
     resume).
  Recommend (1) for the per-session binding, with the header remaining the
  authoritative record of what was actually applied, and (2) as the
  documented fallback if the record API is judged unstable.
- **No silent drift**: the ledger line and the tool result both name the
  effective values; the header is the audit trail the user can read back.

### 9.6 Constraints the implementation must respect

- **Header and epoch semantics**: apply a sampling change once per user
  intent, never per step. Each change appends a `request/header` snapshot
  with reason `change` (`packages/core/agent-loop/src/agent.ts:643-648`)
  and can affect provider cache reuse
  (`packages/llm/llm/src/call-config.ts:1-7`,
  `docs/subsystems/llm-streaming.md:767`).
- **Model-switch notice**: provider/model changes already append a durable
  user notice; effort-only changes do not
  (`packages/core/agent/src/model-selection.ts:113-126`). Do not duplicate
  the notice; write a ledger line instead.
- **Per-agent, not per-session-only**: the loop is per Agent; key overrides
  by the Agent (or its Session id) and expect subagents to have their own.
- **Concurrency**: `selectModel` already serializes per Agent
  (`packages/api/session-controller/src/agent.ts:370-380`). The plugin's own
  store should use a per-Agent promise chain or the generation-counter
  pattern the client directory uses
  (`packages/client/ui-model-selection/src/client/directory.ts:44-45`,
  `:96-108`).
- **HMR**: register every listener and the store through `ctx.effect` so a
  reload disposes cleanly; re-read the persisted binding when the Agent is
  next assembled.
- **No silent default moves**: `selectModel` saves the deployment default.
  Gate effort changes behind an explicit config flag and disclose the
  effect in the tool result.

### 9.7 What to borrow

- `installModelSelection` - the snapshot-at-assemble plus replace-at-request
  pattern, and the "do not split prompt and request" rule
  (`packages/core/agent/src/model-selection.ts:63-81`).
- `selectModel` - validate, commit, then save; and its per-Agent
  serialization (`packages/api/session-controller/src/commands.ts:157-192`).
- The webhook's scoped `agent/request` listener with a "until the first
  header exists" guard (`packages/experimental/webhook/src/session.ts:91-104`).
- `ModelDirectory`'s generation counter for last-write-wins
  (`packages/client/ui-model-selection/src/client/directory.ts:44-45`).
- `agentPresets.select`'s "before the first turn" rule as the model for
  refusing composition changes (`docs/subsystems/core.md:560-567`).
- The family conventions: loader contract, factory `Schema`, one ledger per
  plugin, byte-asserted ledger strings, and the smokes as the arbiter
  (`Documentation/Plugins/PLUGIN-FAMILY.md:175-233`).

## 10. Residuals and open questions

1. **Does the deployment's provider honor `temperature`?** The pi-ai
   adapter sends it when set (`packages/llm/llm-pi-ai/src/adapter.ts:418`),
   but the compat field that declares temperature support is
   anthropic-messages-specific
   (`packages/llm/llm-pi-ai/src/catalog.ts:452-453`) and the desktop profile
   does not declare it. Verify against the live Workers AI endpoint before
   shipping a UI control.
2. **Should an effort change move the deployment default?** `selectModel`
   always saves it (`packages/api/session-controller/src/commands.ts:177-181`).
   If the answer is no, the plugin either accepts the side effect, or the
   harness needs a session-only selection seam. This is the one decision
   that can change the plugin's seam.
3. **Is `appendPluginRecord` acceptable for an out-of-repo plugin?** The
   mechanism is right; the in-repo caller gate says experimental only
   (`packages/core/session/src/index.ts:478-481`). Decide whether to depend
   on it or use a sidecar.
4. **Should sampling inherit to subagents?** Launch options carry provider,
   model, effort, and maxTokens only
   (`Documentation/Plans/SUBAGENT-QUEUE-PLUGIN.md:45`); sampling is not
   inherited and the loop does not seed it.
5. **What is the UI surface?** The composer seat is taken. Options are a
   `/params` command (needs a client half and a Remote, a first for the
   family), a settings page, or a new seat contributed upstream. v1 can ship
   without one.
6. **Where is the boundary with the routing-enforcer?** That plugin owns
   launch-time policy; this one owns runtime parameters. They should share
   the profile vocabulary but not the code path.
7. **Should the plugin announce active parameters to the model?** A small
   `system-prompt/assemble` section would tell the model what is in force,
   at a token cost. Not needed for correctness; decide after live use.
8. **Should the tool require approval?** A `tools/pre-execute` `ask` is
   available (`docs/subsystems/tools.md:398-428`), but adds friction; the
   config flag may be enough for a single-user desktop deployment.

## 11. Verification

Run on 2026-10-21. Harness checkout HEAD `687f282e` (0.2.1-rc.2).

1. `test -f Documentation/Researches/CONVERSATION-PARAMETERS-RESEARCH.md` -
   exit 0.
2. `grep -n CONVERSATION-PARAMETERS Documentation/INDEX.md` - the new row
   is present in the Researches table.
3. The two Researches counts read 8 (the tree block and the section
   heading).
4. `git -C <family repo> status --short` - only the new document and
   `Documentation/INDEX.md`.
5. `git -C <harness checkout> status --short` - empty (the source checkout
   was not modified).
6. ASCII check on this document - only tab and newline outside the ASCII
   range.
7. Spot-checked anchors, re-read at the cited lines: the `selectModel`
   body (`packages/api/session-controller/src/commands.ts:157-192`), the
   `agent/request` declaration
   (`packages/core/agent/src/runtime-types.ts:337`), the effort rejection
   (`packages/llm/llm/src/index.ts:926-933`), the projection fold
   (`packages/api/session-controller/src/model-selection-projection.ts:39-56`),
   and the preset rules (`docs/subsystems/core.md:553-567`).

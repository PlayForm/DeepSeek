---
title: 05-live-context - the system prompt, kept current
category: Diagram
kind: reference
date: 2026-10-21
status: active
---

# 05-live-context

> **The capability.** The system prompt gains one section whose labeled stanzas are recomputed at request time: a clock that always holds the current time at ask-time, counters that hold the live message, turn and since-last-tool numbers, the working directory and session id, and any free-form note or template the user wants. Each stanza sits inside a fixed frame that says it is not harness state, so the model reads it as live context rather than as a fact of the machine. The plugin ships disabled and enables only by an explicit activate.

## The harness surfaces

| Surface | Direction | What the group does there |
| --- | --- | --- |
| `system-prompt/assemble` | listens | Appends exactly one section named `live-containers` with `interpolate: false`, so only the plugin's own `{{token}}` engine touches its text. |
| `agent/pre-step` | listens | Updates the message, turn and since-last-tool counters; the wave-2 batch arm uses the same seam. |
| `tools/post-execute` | listens | Updates the since-last-tool counter from observed tool activity. |
| `tools/pre-execute` / `tools/execute` | listens | The wave-2 detach arm decides and carries a detachable command call. |
| tool execution surface | registers | `live_container_set` (the per-agent state writer with accept/dismiss/plant/prune verbs) and `live_plant`; one registered dynamic context, `live-containers-completion`. |

## The packages

| Package | Tree | Role | Trigger | Ledger file | Diagram |
| --- | --- | --- | --- | --- | --- |
| `@playform/hook-dsh-live-containers` | Classic | hook (live block) | `system-prompt/assemble`; `agent/pre-step` and `tools/post-execute` update state | `~/.dsh/live-containers.log` | [live-containers.mmd](Classic/live-containers.mmd) ([SVG](Classic/live-containers.svg)) |
| `@playform/ets-hook-dsh-live-containers` | EffectTS | hook (live block) | same surfaces | `~/.dsh/live-containers.log` (same file as Classic) | [live-containers.mmd](EffectTS/live-containers.mmd) ([SVG](EffectTS/live-containers.svg)) |

## How each plugin works

### @playform/hook-dsh-live-containers

**Classic.** What it does. The live-containers hook keeps dynamic, modifiable conversation blocks in the system prompt. Each enabled block is a labeled stanza recomputed at every request - the canonical example is a `time` block that always holds the current time at ask-time while the rest of the conversation stays static. The section is appended after `next()` and touches nothing else in the assembly.

**The chain.**
1. `system-prompt/assemble` fires for a request; the listener checks `enabled` first and passes through when the plugin is off.
2. Each enabled block in the block table renders its body from the current state: `time` from the clock, `counter` from the plugin's own observers, `manifest` from `cwd` and the session id, `note` and `template` from the configured text and vars.
3. The substitution engine is token replace only - no eval, no expressions. An unknown token renders literally and logs `render unknown <id> <token>`.
4. Each body is wrapped in the fixed frame (`--- LIVE CONTAINER <id> (recomputed each request; not harness state) ---` ... `--- END LIVE CONTAINER <id> ---`) and the whole set becomes one `live-containers` section with `interpolate: false`.
5. If the rendered section exceeds `sectionBudgetBytes` (4096), the oldest frames collapse to one-line summaries - never silently dropped - and the collapse is logged.
6. `refresh: "request"` recomputes every assembly; `refresh: "ttl"` holds the section for `ttlCalls` assemblies (8 by default) so the provider's prefix cache stays reusable.

**The config that matters.** `enabled` (`false` in the package's own row), `sectionName` (`live-containers`), `refresh` (`request`; `ttl` is the cache-friendly choice), `ttlCalls` (`8`), `separator` (`---`), `sectionBudgetBytes` (`4096`), and the block table (14 default entries, with `todo-list`, `command-runner` and `session-stats` enabled). Every knob is volatile.

**The safety.** The plugin ships disabled: a cold mount logs `disabled (enabled=false)` and every listener no-ops to a passthrough, because each checks the state's on flag first. A render failure skips that block and logs `render failed <id> -> skipped` rather than failing the assembly. Wave-2 catalog kinds that the v1 render engine does not know are accepted in config and render as skipped blocks with reason `unknown kind` - they cost nothing and render nothing. The detach arm ships off (`detach.mode: "off"`), and the mutation family (`write`, `edit`, `raw-write`, `normalize-file`) is permanently non-detachable.

**The ledger.** `~/.dsh/live-containers.log`. Activation (`live-containers: activated (bundle 0.1.0, blocks=<n>, refresh=<policy>)`), the disabled proof (`live-containers: disabled (enabled=false)`), per-block lines (`block rendered <id> (<len> bytes)`, `block skipped <id> (<reason>)`), section lines (`section rebuilt (ttl <n>)`, `section rebuilt (tools/change)`), and the budget line (`failsafe section-collapse <n>`). Skip lines log only when the reason changes, so the ledger stays quiet on steady state.

**The diagram.** [live-containers.mmd](Classic/live-containers.mmd) and ([SVG](Classic/live-containers.svg)).

### @playform/ets-hook-dsh-live-containers

**EffectTS twin.** The exact package is `@playform/ets-hook-dsh-live-containers`, built on `@playform/ets-base-dsh`, `@playform/ets-lib-dsh-core` and the `@playform/ets-plugin-dsh-factory` service. It has no Effect-native stage of its own: the section assembly, the block table and the token engine are the Classic pipeline, consuming the Effect-backed factory for state and the ledger. The behavior contract is byte-identical, and the ledger path is the same file as the Classic twin, `~/.dsh/live-containers.log`, which is safe only because the two trees are never active in one graph. The diagram is [live-containers.mmd](EffectTS/live-containers.mmd) and ([SVG](EffectTS/live-containers.svg)).

## How the group composes

There is one member per tree and no sibling to compose with. The composition rule that matters is the activation rule: the package's own patch row is `enabled: false` and nothing else, so a cold mount is a no-op and the only way in is an explicit activate - edit the profile, set `enabled: true`, restart. The desktop profile does exactly that: it lists the bundle in `dsh.profile.bundles` and its own patch sets `enabled: true`, so in *this* profile the plugin is activated rather than cold. At authoring time no `~/.dsh/live-containers.log` exists, so the ledger carries no activation proof yet; the activation line is the place to look after the next restart.

The refresh policy is the second composition rule. `refresh: "request"` is cache-hostile for an always-differing block: the provider's prefix reuse is invalidated from the first changed token, and everything after it is re-priced. `refresh: "ttl"` with `ttlCalls >= 8` is the recommended cadence, and stable-until-event blocks (notes, counters under their triggers) cost nothing extra. The design says this plainly rather than pretending per-request recomputation is free.

The budget rule is the third: over `sectionBudgetBytes`, the oldest frames collapse to one-line summaries. The section never silently loses a block, so a model reading it knows which stanzas are summarized.

## How it plugs into the harness

The bundle is one `insert:` row. The package's own row is `enabled: false`; a profile that wants the plugin writes `enabled: true` in its own patch. The plugin registers its `system-prompt/assemble` listener, its `agent/pre-step` and `tools/post-execute` observers, and - in the wave-2 half - the detach arms and the two tools. Its counters are its own observations: exact token counts are not available to plugins, so the gauge variables are honest approximations.

Boot order is: profile bundles → the plugin mounts → a cold mount logs `disabled (enabled=false)`, an activated mount logs the activation line and renders on the first assembly. The model observes the framed section; the user observes a clock and counters that are correct at ask-time, and a prompt whose static part is unchanged.

A `file:` dependency alone is not activation. The package must be listed in `dsh.profile.bundles`, its row must say `enabled: true`, and the host must be restarted.

## What the user experiences

- The model knows the current time at ask-time without the user pasting it.
- The model knows how many messages and turns have passed and how long since the last tool call.
- A note or template block keeps a standing instruction in front of the model without editing the system prompt.
- The section is clearly framed as live context, so the model does not mistake it for harness state.
- A disabled install costs nothing: every listener passes through and the ledger says so.

## Sources

- [live-containers README](../../Classic/packages/hook-dsh-live-containers/README.md), [SCHEME.md](../../Classic/packages/hook-dsh-live-containers/SCHEME.md), [cordis.patch.yml](../../Classic/packages/hook-dsh-live-containers/cordis.patch.yml)
- [ets live-containers README](../../EffectTS/packages/ets-hook-dsh-live-containers/README.md), [SCHEME.md](../../EffectTS/packages/ets-hook-dsh-live-containers/SCHEME.md), [cordis.patch.yml](../../EffectTS/packages/ets-hook-dsh-live-containers/cordis.patch.yml)

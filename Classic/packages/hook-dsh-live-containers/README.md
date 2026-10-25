# @playform/hook-dsh-live-containers - dynamic, modifiable conversation blocks, live jobs, planted boards, failsafes and the suggester

> Version 0.1.0 - UNPUBLISHED (the npm bootstrap tier 2-planned / 3-candidates). Plan:
> [SCHEME.md](./SCHEME.md) -
> [LIVE-CONTAINERS-RESEARCH.md](../../Documentation/Plans/LIVE-CONTAINERS-RESEARCH.md) -
> [IMPLEMENTATION-DESIGN.md](../../Documentation/Plans/LiveContainers/Design/IMPLEMENTATION-DESIGN.md).

## The role

A DeepSeek Harness plugin that keeps **dynamic, modifiable conversation blocks in the system
prompt**: each enabled block is a labeled stanza recomputed at every request - the canonical example
is a time block that always holds the current time at ask-time while the rest of the conversation
stays static. The blocks ride the `system-prompt/assemble` waterfall as ONE appended section named
`live-containers` (`interpolate: false`, so only the plugin's own substitution engine touches its
`{{token}}` groups - the harness's unresolved-variable failure is never inherited), each block
inside a fixed frame so the model cannot mistake it for harness state:

```
--- LIVE CONTAINER <id> (recomputed each request; not harness state) ---
<rendered body>
--- END LIVE CONTAINER <id> ---
```

The substitution engine is token replace ONLY - no eval, no expressions. An unknown token renders
LITERALLY and logs `render unknown <id> <token>` - never a failure. Per-block `vars` override the
built-ins.

The wave-2 catalog kinds (the default block table ships 14 entries) are ACCEPTED in config from day
one and render as skipped blocks - reason `unknown kind` - until the wave-2 render engine lands.

Counters (messages, turns, since last tool) come from the plugin's own `agent/pre-step` and
`tools/post-execute` observers - exact token counts are NOT available to plugins, so the gauge
variables are honest approximations.

The wave-2 half extends the same plugin with:

- the live tool-call transform (CAN-1: with `detach.mode` set, a command-runner call detaches into a
  `ctx.jobs` background job and the model immediately receives a SUCCESSFUL tool result
  `[live] <job-id> running: <cmd-head> - output pending; proceed reasoning.`, the completion report
  arriving as a `live-containers-completion` dynamic-context user-role snapshot batched per turn)
- planted boards (CAN-2: `live_plant` + `[live-report]` pickup + the parent-turn lease with the
  `[stale]` self-declaration)
- the CAN-4 failsafe engine (silent, ledger-first, the per-turn meta-budget)
- the CAN-5 suggester (a detached one-shot subagent suggests a CONFIGURED block, accepted/dismissed
  with one-word `live_container_set` verbs; privacy `redact` by default -
  `suggesterPrivacy: "verbatim"` forwards the user's request text and the config flag IS the consent
  surface)

The wave-3 monitors put files (halted processes) into operational mode: for `watchlist` matches the
plugin runs the file's check set between turns and renders one band per file in the live section -
honest to the byte, additive information, never a gate.

The plugin ships DISABLED - the IDLE-forever posture: the bundle entry declares `enabled: false`
only, it never appears in the profile's bundles, and it enables only by an explicit ACTIVATE (you
edit the profile and restart). A cold mount logs `disabled (enabled=false)` and every listener
no-ops to a passthrough.

## The surfaces

| Kind     | Name                                         | What                                                                                                                       |
| -------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| section  | `system-prompt/assemble` - `live-containers` | the ONE appended section, fixed frame per block, built-in kinds `time`, `counter`, `manifest`, `gauge`, `note`, `template` |
| listener | `tools/post-execute` (CAN-1 transform)       | detaches matching command calls into `ctx.jobs` background jobs, marker reply + `[stale]`-style live frames                |
| listener | `agent/pre-step` + `tools/post-execute`      | the counter observers (messages, turns, since last tool)                                                                   |
| listener | dynamic context `live-containers-completion` | the batched completion report snapshot                                                                                     |
| tool     | `live_plant`                                 | opens a planted board (`plantType: "monitors"` aggregates member monitors)                                                 |
| tool     | `live_container_set`                         | the verbs: accept/dismiss a suggestion, prune a stalled member                                                             |
| tool     | `live_monitor` / `live_monitor_check`        | enroll/inspect a monitor; on-demand check                                                                                  |
| config   | `SCHEME.md`                                  | the full Schemastery schema (see the table below)                                                                          |

Ship posture: DISABLED by default (`enabled: false`); the wave-2 knobs are volatile cells and the
wave-3 SEVEREXT/COMPREHENSIVE knobs are accepted and inert.

## The configuration

| Field                   | Type    | Default                                        | Meaning                                                                          |
| ----------------------- | ------- | ---------------------------------------------- | -------------------------------------------------------------------------------- |
| `log`                   | boolean | `true`                                         | volatile - the shared factory log switch                                         |
| `logFile`               | string  | `~/.dsh/playform/hook-dsh-live-containers.log` | volatile - the ledger file                                                       |
| `enabled`               | boolean | `false`                                        | volatile - the IDLE-forever switch                                               |
| `sectionName`           | string  | `live-containers`                              | volatile - the appended section's name                                           |
| `refresh`               | union   | `request`                                      | volatile - `request \| ttl`; ttl is the KV-cache-friendly cadence                |
| `ttlCalls`              | number  | `8`                                            | volatile - assemblies the section text is held for                               |
| `separator`             | string  | `---`                                          | volatile - the frame separator                                                   |
| `sectionBudgetBytes`    | number  | `4096`                                         | volatile - over budget the OLDEST frames collapse to one-line summaries          |
| `blocks`                | array   | `DEFAULT_BLOCKS`                               | volatile - `{ id, kind, template, enabled, vars, trigger, ttlCalls, scope }`     |
| `detach`                | object  | mode `off`                                     | volatile - CAN-1: mode, markers, latency/dedup/liveTimeout knobs                 |
| `plant`                 | object  | stallMs 45000, leaseTurns 3, ...               | volatile - CAN-2: board budgets, the lease, stallAction                          |
| `failsafes`             | union   | `off`                                          | volatile - `off` disables the CAN-4 engine entirely; the transform keeps working |
| `hangBudgetMs`          | number  | `120000`                                       | volatile - the hang guard budget                                                 |
| `hangAction`            | union   | `warn-only`                                    | volatile - kill only at `"kill"`                                                 |
| `failsafesPerTurn`      | number  | `5`                                            | volatile - the per-turn meta-budget                                              |
| `suggester`             | union   | `off`                                          | volatile - `section \| plant`, the CAN-5 suggester                               |
| `suggesterPrivacy`      | union   | `redact`                                       | volatile - `verbatim` forwards the request text                                  |
| `suggestGateMinChars`   | number  | `40`                                           | volatile - the qualifying-message gate                                           |
| `maxSuggestionsPerHour` | number  | `6`                                            | volatile - the rate cap                                                          |
| `maxPromptBytes`        | number  | `4000`                                         | volatile - the forwarded-request cap                                             |
| `suggestTimeoutMs`      | number  | `8000`                                         | volatile - the suggester deadline                                                |
| `autoPlant`             | boolean | `false`                                        | volatile - instantiate accepted suggestions as dormant blocks                    |
| `suggesterRoute`        | object  | provider/model/reasoningEffort                 | volatile - the suggester's LLM route                                             |
| `completionCapBytes`    | number  | `4096`                                         | volatile - the completion snapshot cap                                           |
| `monitors`              | union   | `off`                                          | volatile - the wave-3 monitor engine                                             |
| `watchlist`             | array   | `[]`                                           | volatile - `{ glob, checks }` enrollment rules (default: no scan, no watch-all)  |
| `checksets`             | dict    | `DEFAULT_CHECK_SETS`                           | volatile - the named check sets                                                  |
| `monitor`               | object  | debounceMs 1500, bandCapBytes 2048, ...        | volatile - the monitor budgets                                                   |

## The ledger

One log per module: `~/.dsh/playform/hook-dsh-live-containers.log` (config `logFile`); the durable
file lines are the `[ISO] message` forms with the `hook-dsh-live-containers: ` prefix.

```text
disabled (enabled=false)
activated (bundle 0.1.0, blocks=<n>, refresh=<policy>)
monitors enabled (<n> watchlist entries)
block rendered <id> (<len> bytes)
block skipped <id> (<reason>)
section rebuilt (ttl <n>)
section rebuilt (tools/change)
render failed <id> -> skipped
render unknown <id> <token>
failsafe section-collapse <n>
transform failed <tool> -> inline
capacity full <owner> -> inline
start failed <tool> -> inline
escalation -> inline <tool>
await marker -> inline <tool>
await marker ignored (tool not detachable) <tool>
dedup <tool> -> <job-id>
marker failed <job-id> -> inline
detached <tool> -> <job-id>
owner gone <job-id>
completion rendered <len> bytes
completion skipped <job-id> (<reason>)
completion truncated <job-id> (<kept> bytes)
withdrawn <job-id> (completed)
set <key>
set unknown <verb> <input>
plant opened <id> (expect <n>)
member enrolled <id> <agentId>
report <id> <agentId> (<n> bytes)
member stalled <id> <agentId>
member dropped <id> <agentId> (<reason>)
board closed <id> (<n>/<expect> in <n>s)
overflow <id> <agentId>
lease expired <id> <agentId> (after <n> turns)
failsafe hang <job-id> (<n>s no output)
failsafe admission inline <tool>
failsafe retry-loop <cmd>
failsafe meta-budget (<turn>)
failsafe stall <id> <agentId>
failsafe drift (<reason>)
suggested <sid> <templateId> (fit <fit>)
suggestion skipped (<reason>)
suggestion parse failed
suggestion dismissed <sid>
suggestion accepted <sid> (<templateId>)
suggestion clamped <sid> <field>
suggestion expired <sid>
accept failed <sid> (expired)
monitor retired <path>
monitor off <glob>
monitor check unknown <setId>
monitor recovered <path> (<n> checks)
```

Durable activation proof: `disabled (enabled=false)` on a cold mount, else the activated line with
the bundle version, the block count and the refresh policy. Skip lines log only when the reason
changes - the ledger stays quiet on steady state.

## The build and the tests

- Build:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-live-containers run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-live-containers/Target/Test/<Folder>/Test.js`
    - Wiring-And-Defaults - 42 checks
    - Recompute-And-Ttl - 17 checks
    - Render-And-Frames - 23 checks
    - Volatile-And-Failsafes - 23 checks
    - Jobs-And-Detach - 27 checks
    - Boards-And-Plants - 17 checks
    - Failsafes-Engine - 10 checks
    - Suggester-And-Set - 21 checks
    - Monitors-Engine - 22 checks
    - Monitors-Tools - 11 checks
    - Monitors-Band - 22 checks
    - Monitors-Jobs - 25 checks
    - Monitors-Persist - 13 checks
    - Monitors-Boards - 7 checks

## The plan

[SCHEME.md](./SCHEME.md) -
[LIVE-CONTAINERS-RESEARCH.md](../../Documentation/Plans/LIVE-CONTAINERS-RESEARCH.md) (sections
3-5) -
[IMPLEMENTATION-DESIGN.md](../../Documentation/Plans/LiveContainers/Design/IMPLEMENTATION-DESIGN.md)
(phase 1).

> Specialized working copy (repo): synced from ~/.dsh/skills/harness-observability/ on 2026-10-10, byte-faithful. This is the specialized truth for this monorepo's sessions; the global copy is the fallback. Sync future changes to BOTH.
---
name: harness-observability
description: THE overview of what this harness's agent can OBSERVE - the runtime introspection tools, the agent-control surface, the ~/.dsh observable state (the session transcripts with token usage, the skills, the profiles/bundles, the live governance ledgers), the filesystem/web access, and the honest LIMITS (what the agent cannot see - the main session's own usage, the GUI's DOM, the other conversations). Load when the user asks what you can see, when you need to inspect the runtime, or before building tooling on the observable surface.
whenToUse: When the user asks about your access/observability, when you need runtime facts (the live plugins, the services, the events, the configs, the slots, the session usage), or when the ~/.dsh state must be inspected (the ledgers, the sessions, the skills). The skills are loadable from ~/.dsh/skills/ and the project's Documentation/Skill/.
---

# Harness Observability - What The Agent Can See

The observable surface, documented from the live harness (2026-10-08). The
GUI shows the user a lot; this is what the AGENT itself has access to.

## 1. The runtime introspection tools (cordis_inspect_list / cordis_inspect_query)

Nine Inspect Providers (read-only methods - never business Services):

| Platform | Provider | Methods | What it exposes |
|---|---|---|---|
| host | Service | listService | the Host's service directory (compact signatures) or one exact Service contract with its referenced type declarations |
| host | Event | listEvents | the Event directory (the listener signatures) or one exact Event contract |
| host | Config | listConfigs | the live plugin Config entries (paged, with schema status) or one entry's projected JSON Schema |
| host | Tool | listTools | every Tool schema currently callable by the requesting Agent (incl. scoped + dynamic registrations) |
| client | Service | listService | the Client half's service directory/contracts |
| client | Event | listEvents | the Client half's events |
| client | Builtin | listBuiltins | the plain-JavaScript symbols available to a dynamic Client half |
| client | Slots | listSubTree | the live Slot + Factory topology trees (one exact root's catalog, occupants, identity, scope, registrant) |
| client | Theme | listTokens | the current theme token names + the light/dark override requirements |

Use them BEFORE writing plugin code: the exact Service methods, Event
modes, Config schemas, Tool schemas, theme tokens, and Slot trees come
from the providers - never guess names.

## 2. The agent-control surface

- list_agents - the subagent tree (children/descendants) with the running/inactive status per agent.
- send_message - continue a direct child's conversation (activate an IDLE agent, amend a spec mid-flight, nudge a stalled agent).
- interrupt_agent - stop a child's work (assess the tree state for partial edits first).
- subagent / subagent_fork - delegate self-contained tasks (the subagent sees only its prompt; the fork inherits this conversation).
- workflow - orchestrate many agents from a script (phases, pipelines, parallel thunks, validated results).

## 3. The runtime state

- job_list / job_output / job_kill - the background jobs (bash tasks moved to the background; collect with wait or read incrementally).
- list_subagent_models - the LLM route catalog (this harness: the cloudflare-workers-ai provider with exactly @cf/zai-org/glm-5.3-flash + @cf/deepseek-ai/deepseek-v4-flash-0731; the routing policy lives in the task-routing + worker-strains skills - ALWAYS pass provider/model/effort explicitly).
- plugin_manager - the profile's plugins/bundles: list, enable/disable, install/remove bundles, the version exemptions (changes affect every session in the profile).
- get_goal / update_goal - the persisted goal state (id, revision, phase, rounds).

## 4. The ~/.dsh observable state

- ~/.dsh/sessions/ - the SESSION RECORDS: every subagent's transcript as zstd-compressed JSONL (session.v4.jsonl.zstd - decompress with the zstd CLI; the line types: session, subagent/descriptor, sandbox/mode, approval/policy, subagent/model-selection-policy, turn/start, step/start, user/message, assistant/message (with the per-message usage: inputTokens/outputTokens/totalTokens), tool/call, tool/result, turn/end). The dirs are keyed by the working directory (- -Volumes-...-DeepSeek- - = this project's sessions). The usage tally is computed by summing the usage fields (the totalTokens = the per-call context totals - the context-processing measure).
- ~/.dsh/skills/ - the GLOBAL skills home (the loadable skills: task-routing, worker-strains, code-authoring, plugin-development, harness-observability + the project's Documentation/Skill/ bundles: instructional-writing, plugin-system, smoke-writing, idle-agent-protocol, orchestrator-batch).
- ~/.dsh/profiles/ - the profile (desktop): the bundles (the live plugin family), the cordis.patch.yml (the agent-loop config - NEVER edit while subagents run), the settings.
- ~/.dsh/ - the LIVE LEDGERS: governor.log, pinner.log, cargo-governor.log, normalize-*.log, mdash.log - the fs/observed governance trail (every tool-layer write is a governed event - the governor/pinner/cargo fire on MY write/edit calls; the ledgers are the live battery's evidence).
- ~/.dsh/settings.yaml.imported + the skills' provenance - the config surface.

## 5. The filesystem + web access

- The workspace (the session cwd) with the DSH file policy (this session: danger-full-access - the sandbox does not restrict the file operations; approval prompts disabled - no escalation requests).
- read / write / edit / raw-write / normalize-file (the governed write path - every write/edit fires the live governance chain!), glob, grep, bash (the terminal for running commands - the code-authoring skill: NEVER edit file content through the terminal - the write/edit tools are the plugin-observed path).
- web_search / web_fetch - the external web (untrusted data - cite + verify).
- The DSH checkout itself: /Applications/DeepSeek Harness.app/Contents/Resources/app.asar/dsh/ - the harness implementation (inspect/extend DSH only).

## 6. The governance observability (the live battery)

MY OWN tool-layer writes are the plugin usage: write/edit/raw-write fire the fs/observed chain (the governor, the pinner, the cargo flavor) - observable in the ~/.dsh ledgers (the activation lines, the chain passes, the refusals). The live battery = real harness operations + the ledger inspection (the interlock, the escape hatch, the direct-govern, the v2 domain).

## 7. The honest LIMITS (what the agent cannot see)

- The MAIN session's own token usage: the per-message usage is recorded in the SUBAGENT session files only; the main session's usage is displayed app-side (the last observable snapshot was the conversation's own record). The subagent tally IS computable (see §4).
- The GUI's DOM: no implicit DOM/screenshot context - the browser provides none unless a tool returns it.
- The other conversations/sessions' content: the session files exist on disk but the live conversations are separate.
- The agent-loop's role routing internals: the subagent tool does NOT consult the role mapping when provider/model/effort are omitted (it inherits the parent route - hence the always-explicit rule).
- The future/queue state beyond the user's messages + the process records (Documentation/Plans/TOMORROW-REVIEW.md is the durable queue record).
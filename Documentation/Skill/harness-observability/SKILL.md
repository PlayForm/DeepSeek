> Specialized working copy (repo): synced from ~/.dsh/skills/harness-observability/ on 2026-10-20, byte-faithful. This is the specialized truth for this monorepo's sessions; the global copy is the fallback. Sync future changes to BOTH.

---
name: harness-observability
description: THE overview of what this harness's agent can OBSERVE - the runtime introspection tools, the agent-control surface, the ~/.dsh observable state (the session transcripts with token usage, the skills, the profiles/bundles, the live governance ledgers), the filesystem/web access, and the honest LIMITS (what the agent cannot see - the main session's own usage, the GUI's DOM, the other conversations). Load when the user asks what you can see, when you need to inspect the runtime, or before building tooling on the observable surface.
whenToUse: When the user asks about your access/observability, when you need runtime facts (the live plugins, the services, the events, the configs, the slots, the session usage), or when the ~/.dsh state must be inspected (the ledgers, the sessions, the skills). The skills are loadable from ~/.dsh/skills/ and the project's Documentation/Skill/.
---

# Harness Observability - What The Agent Can See

The observable surface of this harness, documented from the live harness
(2026-10-08): what the AGENT itself can access - not what the GUI shows the
user. The full philosophy lives in the references; this file is the index.

## 1. The runtime introspection tools

1. **The nine Inspect Providers** - see ./references/runtime-inspect-providers.md
   cordis_inspect_list + cordis_inspect_query over the host (Service, Event, Config, Tool) and client (Service, Event, Builtin, Slots, Theme) providers - the full provider/method/exposure table.
2. **Inspect before code, never guess** - see ./references/runtime-inspect-providers.md
   exact Service methods, Event modes, Config schemas, Tool schemas, tokens, and Slot trees come from the providers; inspect methods are read-only and never business Services.

## 2. The agent-control surface

1. **list_agents** - see ./references/agent-control-surface.md
   the subagent tree (children/descendants) with the running/inactive status per agent.
2. **send_message** - see ./references/agent-control-surface.md
   continue a direct child's conversation - activate an IDLE agent, amend a spec mid-flight, nudge a stalled agent.
3. **interrupt_agent** - see ./references/agent-control-surface.md
   stop a child's work - assess the tree state for partial edits first.
4. **subagent / subagent_fork** - see ./references/agent-control-surface.md
   delegate self-contained tasks (the subagent sees only its prompt; the fork inherits this conversation).
5. **workflow** - see ./references/agent-control-surface.md
   orchestrate many agents from a script (phases, pipelines, parallel thunks, validated results).

## 3. The runtime state

1. **job_list / job_output / job_kill** - see ./references/background-job-tools.md
   the background jobs (bash tasks moved to the background; collect with wait or read incrementally).
2. **list_subagent_models** - see ./references/llm-route-catalog.md
   the LLM route catalog (this harness: cloudflare-workers-ai with exactly @cf/zai-org/glm-5.3-flash + @cf/deepseek-ai/deepseek-v4-flash-0731 + @cf/deepseek-ai/deepseek-v4.1-flash-1017 (added 2026-10-20); the routing policy lives in the task-routing + worker-strains skills - ALWAYS pass provider/model/effort explicitly).
3. **plugin_manager** - see ./references/plugin-manager.md
   the profile's plugins/bundles: list, enable/disable, install/remove bundles, the version exemptions (changes affect every session in the profile).
4. **get_goal / update_goal** - see ./references/goal-state-tools.md
   the persisted goal state (id, revision, phase, rounds).

## 4. The ~/.dsh observable state

1. **~/.dsh/sessions/** - see ./references/session-records.md
   the SESSION RECORDS: every subagent's transcript as zstd-compressed JSONL (session.v4.jsonl.zstd; the line types; the per-message usage inputTokens/outputTokens/totalTokens; dirs keyed by the working directory; the tally = the sum of the usage fields, totalTokens = the per-call context totals).
2. **~/.dsh/skills/** - see ./references/skills-and-profiles.md
   the GLOBAL skills home (task-routing, worker-strains, code-authoring, plugin-development, harness-observability + the project's Documentation/Skill/ bundles: instructional-writing, plugin-system, smoke-writing, idle-agent-protocol, orchestrator-batch).
3. **~/.dsh/profiles/** - see ./references/skills-and-profiles.md
   the profile (desktop): the bundles (the live plugin family), the cordis.patch.yml (the agent-loop config - NEVER edit while subagents run), the settings.
4. **The LIVE LEDGERS** - see ./references/governance-ledgers.md
   governor.log, pinner.log, cargo-governor.log, normalize-*.log, mdash.log - the fs/observed governance trail (every tool-layer write is a governed event; they fire on MY write/edit calls).
5. **settings.yaml.imported + the skills' provenance** - see ./references/skills-and-profiles.md
   the config surface.

## 5. The filesystem + web access

1. **The workspace + the DSH file policy** - see ./references/filesystem-web-access.md
   the session cwd under the policy (as documented: danger-full-access, no sandbox restriction on file operations, approval prompts disabled).
2. **The write path + the scan tools + the terminal** - see ./references/filesystem-web-access.md
   read / write / edit / raw-write / normalize-file (the governed write path - every write/edit fires the live governance chain), glob, grep, bash (the code-authoring law: NEVER edit file content through the terminal).
3. **web_search / web_fetch** - see ./references/filesystem-web-access.md
   the external web (untrusted data - cite + verify).
4. **The DSH checkout** - see ./references/filesystem-web-access.md
   /Applications/DeepSeek Harness.app/Contents/Resources/app.asar/dsh/ - the harness implementation (inspect/extend DSH only).

## 6. The governance observability (the live battery)

1. **The live battery** - see ./references/governance-ledgers.md
   MY OWN tool-layer writes are the plugin usage: write/edit/raw-write fire the fs/observed chain (the governor, the pinner, the cargo flavor), observable in the ~/.dsh ledgers (the activation lines, the chain passes, the refusals); the battery = real harness operations + ledger inspection (the interlock, the escape hatch, the direct-govern, the v2 domain).

## 7. The honest LIMITS (what the agent cannot see)

1. **The MAIN session's own token usage** - see ./references/honest-limits.md
   the per-message usage is recorded in the SUBAGENT session files only; the main session's usage is displayed app-side (the last observable snapshot was the conversation's own record); the subagent tally IS computable (see ./references/session-records.md).
2. **The GUI's DOM** - see ./references/honest-limits.md
   no implicit DOM/screenshot context - the browser provides none unless a tool returns it.
3. **The other conversations/sessions' content** - see ./references/honest-limits.md
   the session files exist on disk but the live conversations are separate.
4. **The agent-loop's role routing internals** - see ./references/honest-limits.md
   the subagent tool does NOT consult the role mapping when provider/model/effort are omitted (it inherits the parent route - hence the always-explicit rule).
5. **The future/queue state** - see ./references/honest-limits.md
   beyond the user's messages + the process records (Documentation/Plans/TOMORROW-REVIEW.md is the durable queue record).

# The Non-Negotiables (Apply to Every Delegation, Always)

> Source: SKILL.md, section 0 "Non-negotiables", rules 1-4.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

Four rules bind every delegation, in every context, with no
task-type-dependent exceptions:

1. **Always pass `provider`, `model`, and `reasoning_effort` EXPLICITLY**
   on every `subagent` call and every workflow `agent()` call. Never rely
   on child defaults, inheritance, or "the configured default".
   - provider: `cloudflare-workers-ai`
   - reasoning_effort values: `low` | `high` | `max` (exact strings)
2. **Never use a model outside `allowedModels`** in the profile patch
   (`subagent-model-selection-settings`). The allowed set is exactly the
   three models in the model catalog (./references/model-catalog.md).
3. **The user's explicit override wins** for the task it names. Nothing
   else overrides this policy.
4. **If the harness crashes or an agent dies mid-run** (e.g.
   `400 INVALID_REQUEST`, projection errors): completed runs' sessions
   and artifacts persist on disk - recover from the workspace and session
   logs; do not re-run finished work. Never edit `agent-loop` config
   while subagents are running (live re-apply destroys running agents'
   inbox projections and can crash the host - config changes to
   `agent-loop` require a restart with no active subagents).

## Why: The Full Philosophy

1. **Rule 1 - explicitness is auditability.** Inherited or defaulted
   routing is invisible: the parent cannot say which model a child ran
   on without digging into session logs. Explicit fields make every
   delegation self-documenting and checkable against the routing table.
   The three fields form a complete route (who provides the model, which
   model, how hard it thinks); omitting any one of them reintroduces the
   default that this policy exists to replace.
2. **Rule 1 - the exact strings matter.** `low`, `high`, `max` are the
   adapter's exact effort tokens. Substitutes like `medium` or `LOW` risk
   silent rejection or silent fallback to a default.
3. **Rule 2 - the allowlist is the crash guard.** The profile patch's
   `allowedModels` exists because off-list models have already caused
   hard failures (qwen3-30b-a3b-fp8 died with `400 INVALID_REQUEST` in
   agentic loops - see model-catalog). Requesting outside the three-model
   set bypasses that guard.
4. **Rule 3 - user sovereignty.** The policy is derived from benchmarks,
   but the user's explicit instruction is the higher authority for the
   task it names. Note the scope: "for the task it names" - an override
   does not silently extend to other tasks or become a new default.
5. **Rule 4 - crash recovery is read-only reuse.** Dead agents leave
   durable state (session logs, workspace artifacts). Re-running
   completed work wastes the very tokens this policy economizes. The
   second half is operational: `agent-loop` live re-apply destroys
   running agents' inbox projections and can crash the host; config
   changes need a restart with no active subagents.

## Examples

### Good

```
subagent(
  description: "Repo survey",
  provider: "cloudflare-workers-ai",
  model: "@cf/zai-org/glm-5.3-flash",
  reasoning_effort: "low",
  prompt: "...")
```

- User says "use deepseek for this refactor"; the parent routes that one
  task to `@cf/deepseek-ai/deepseek-v4-flash-0731` at `max` and cites
  the override.
- Agent dies after 3 of 5 phases: parent reads the finished phases'
  artifacts from the workspace and session logs, resumes only phase 4.

### Bad

- `subagent({ description, prompt })` with no route fields - inherits
  configured child defaults.
- `reasoning_effort: "medium"` - not a valid effort string.
- Requesting `@cf/moonshotai/kimi-k2.6` because it "sounds strong" -
  removed from the catalog, outside `allowedModels`.
- Editing `agent-loop` in the profile patch while three subagents are
  mid-run - destroys inbox projections, can crash the host.

## Exceptions

- Rule 3 is itself the exception mechanism: the user's explicit
  instruction overrides the policy for the named task. Nothing else
  overrides the policy - not importance, not stakes, not habit.

## Failure Modes

- **Partial explicitness**: passing `model` but not `reasoning_effort`.
  Cost: effort silently inherited; the route is no longer what the
  routing table mandates.
- **Override leakage**: applying the user's one-task override to
  subsequent unrelated tasks. Cost: policy quietly replaced by mood.
- **Re-run after crash**: duplicating finished work because the parent
  did not check persisted sessions/artifacts first. Cost: full double
  spend on identical tokens.
- **Hot config edit**: touching `agent-loop` during active subagents.
  Cost: destroyed inbox projections, possible host crash, lost runs.

## Arbiters

- Post-hoc audit: every subagent's session log records the route
  actually used (`~/.dsh/sessions/<workspace>/<agent-id>/`; fields in
  ./references/adjudication-protocol.md). A route that does not
  match the routing table is a violation, whoever initiated it.
- Profile check: `allowedModels` in the
  `subagent-model-selection-settings` patch must contain exactly the
  three catalog models. More or fewer entries = drift.

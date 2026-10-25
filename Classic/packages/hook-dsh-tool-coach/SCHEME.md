# SCHEME.md - @playform/hook-dsh-tool-coach (v0.2.0, TypeScript, function plugin)

Status: **IMPLEMENTED and VERIFIED** (deterministic build zero errors; minified build;
`tool-coach-smoke.mjs` green - fake ctx + the REAL factory + the REAL built Target; 129 checks:
R1-R6 + D1-D5 plus wiring, fail-open and fail-loud coverage).

## 0. What this plugin is

The tool-coach hook. The model "is still regressing to use bash and sed for simple read write calls
which can be tool calls". Terminal file edits are invisible to the plugin system - the harness's
`fs/observed` chain fires ONLY on tool-layer writes, so a `sed -i`/`python -c` edit bypasses the
governor, the pinner and the normalize plugins entirely. The coach goes where that regression flows
and teaches the full harness toolset through a four-tier ladder over the TERMINAL tool calls
(`bash`, `pwsh`; the dedicated tools are never judged).

Source of truth: `Documentation/Plans/TOOL-COACH-OPERATIVE-PLAN.md` (the operative spec),
`TOOL-COACH-PLAN.md` (the integration plan) and `TOOL-COACH-RESEARCH.md` (the background; the
repeat-tool-reminder mechanics are the borrowed precedent).

## 1. The five listeners (all plain `ctx.on`, all fail-open, all `next()`-first)

| #   | Event                    | Mode                                                                       | Purpose                                                       |
| --- | ------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 1   | `tools/post-execute`     | waterfall, plain (AFTER the ccr `{prepend:true}` listener)                 | detect + count + tier-1 note + tier-2 strike accounting       |
| 2   | `tools/pre-execute`      | waterfall, plain, registered unconditionally, no-op unless `enforce ≠ off` | tier-3 deny (`{kind:'deny', reason}`)                         |
| 3   | `agent/pre-step`         | plain                                                                      | the user-message reset of the per-agent chain (RTR precedent) |
| 4   | `system-prompt/assemble` | waterfall, after `next()`, append-only                                     | the tier-2 persistent section                                 |
| 5   | `tools/change`           | emit                                                                       | tier-2 section-cache invalidation                             |

Plus the factory's own `loader/volatile-update` refresh (P10) registered by the State builder.
`apply` returns NOTHING; the state is exposed via `ctx.__hookDshToolCoachState`.
`inject: ["pluginFactory", "tools"]`. No fs/observed Wire, no Attach, no factory Schema - the coach
owns its schema and its strings (a NON-MANIFEST module, the ccr precedent).

## 2. The ladder (counting in judged calls; per-agent WeakMap keyed on the Agent object)

- **Tier 0**: every offense logs `offense <tool> <class> <pattern>` (tool = the judged terminal
  tool). Exemptions log `exempt <tool> <pattern>` only when a row would have matched, at most once
  per distinct pattern per agent.
- **Tier 1** (note): the offense's CLASS reaches `threshold` strikes within the sliding `window` AND
  `cooldown` judged calls have passed since the last note. The note is a `UserMessage` with the
  load-bearing source `{kind: 'tool-coach', form: 'notice', summary: '<tool> <class> × <n>'}`
  prepended to the downstream `additionalContexts`. Counters reset (the note IS the last note). The
  trigger class reaching threshold while the cooldown holds logs `cooldown suppressed`.
- **Tier 2** (persistent section): total offenses since the last note reach `escalateThreshold` →
  the section turns on (idempotent), `escalated persistent section (<n> strikes)`. The
  `system-prompt/assemble` listener appends ONE section (`{name: 'hook-dsh-tool-coach', text}`) to
  `next()`'s assembly - touching nothing else (PTC + structured-output preserved). The text is
  cached for `sectionTtl` judged calls (`section rebuilt (ttl <n>)`) and invalidated on
  `tools/change` (`section rebuilt (tools/change)`). After `cleanWindow` consecutive clean judged
  calls: `persistent section cleared (<n> clean calls)`.
- **Tier 3** (deny): `enforce` (`off | write | all`), per-class strikes since the last note reach
  `enforceThreshold` → the pre-execute listener returns `{kind:'deny', reason}` and logs
  `denied <tool> <class> <pattern> -> use <tool>`. The reason is the model-facing NOTE_DENIED text.
  A deny resets the note counters; the denied call still flows through post-execute, so counting
  continues. Discovery and control are NEVER denied.

## 3. Detection (Function/Detect + Function/Normalize)

Per pipeline (segments split on `;`/`&&`/`||`/`&`): normalize → classify (rows, then markers) →
exempt override → highest class priority wins (`write > read > search > discovery > control`).

- **Normalize**: heredoc bodies stripped; `$(…)`/backticks → `«sub»`; `$VAR`/`${VAR}` → `«var»`;
  `$IFS` → space; quote layers removed; leading command word lowercased.
- **Rows**: 24 built-in `DEFAULT_PATTERNS` (write/read/search/discovery/control; the user's
  `patternTable` rows are APPENDED and may not duplicate a built-in pattern - fail-loud).
- **Markers/craft**: redirect to a non-`/dev/null` path = write catch-all (`<catch-all>`); pipe into
  a shell = write; `--in-place` = write; `«var» -i` (env-var indirection) = write; wrappers
  (`sh -c`, `xargs`, `find -exec`) never exempt - the inner payload is re-scanned.
- **Exemptions**: `DEFAULT_EXEMPTS` + the user's, matched per pipeline anchored at the head (an
  exempt head dominates its pipe; a bare `echo x > file` still fires).

## 4. The dynamic fetch (Function/Fetch + Function/Compose)

`ctx.tools.schemas()` → name + first-sentence(description, ≤120 chars, parenthesis-aware) + primary
parameter key (`parameters.properties[0]`). Tier 1/3 fetch per note; tier 2 caches per
`sectionTtl` + `tools/change`. Any failure → `STATIC_TOOL_LINES` +
`schema fetch failed -> static fallback`. `fetchLive: false` = static only, no failure line.
Template fills are single-pass; user data is escaped (`${` → `$${`) before insertion, so composed
output never gains an unfilled placeholder.

## 5. Config (Variable/Config.ts - the plan's §3.4 schema verbatim; every cell volatile)

`log`/`logFile` (the shared minimal block; the DURABLE ledger), `enabled` (the MASTER switch,
distinct from `log`), `judgeTools ['bash','pwsh']`, `threshold 3`, `window 8`, `cooldown 10`,
`escalateThreshold 6`, `cleanWindow 12`, `enforce 'off'`, `enforceThreshold 4`,
`exemptPatterns DEFAULT_EXEMPTS`, `patternTable DEFAULT_PATTERNS`,
`notes {first, persistent, denied}` (volatile object, plain leaves - the schemastery nesting rule),
`fetchLive true`, `maxSectionTools 8`, `sectionTtl 20`. Fail-loud validation in `apply`: threshold ≥
1, window ≥ threshold, cooldown ≥ 1, escalateThreshold ≥ threshold, cleanWindow ≥ 1,
enforceThreshold ≥ 1, maxSectionTools 1-24, sectionTtl ≥ 1, every row pattern compiles + tool
non-empty, no built-in duplicates, notes templates non-empty.

## 6. The ledger strings (byte-exact, prefix `hook-dsh-tool-coach: `)

```
offense <tool> <class> <pattern>
strike <n>/<threshold> <tool> <class> -> note <tool>
cooldown suppressed <n> <tool> <class>
escalated persistent section (<strikes> strikes)
persistent section cleared (<clean> clean calls)
section rebuilt (ttl <calls>) | section rebuilt (tools/change)
denied <tool> <class> <pattern> -> use <tool>
exempt <tool> <pattern-head>
schema fetch failed -> static fallback
disabled (enabled=false)
```

The durable ledger file carries the same strings in `[ISO] <message>` form.

## 7. The smoke battery

Same assertion set as the Classic suite, plus the tracing-hygiene mode (the suite spawns itself with
`FACTORY_SMOKE_TRACING=1` and requires byte-identical stdout and ledger).
(EffectTS/smokes/tool-coach-smoke.mjs, 129 checks)

- **R1** legitimate bash passthrough (10 calls, zero lines).
- **R2** detect + strike (3 offenses below threshold, the 4th same-class offense notes; byte-exact
  note text with the LIVE fetch; source label; `strike 4/3 bash read -> note read`).
- **R3** cooldown (suppressed lines; tier-2 escalation on the way; the second note exactly at the
  cooldown; window capped at 8).
- **R4** tier 2 (escalation line; exactly one appended section, everything else deep-equal; the ≤
  8-row table with mapped-class priority; clean-window clearing).
- **R5** enforce (byte-exact deny reason; read not denied under `write`; denied under `all`; never
  under `off`).
- **R6** exempt + enabled=false + N=0 (empty pattern table; the `cat | jq` carve-out dedup).
- **D1** no literal `${` in any composed note; the live description and key parameter present.
- **D2** throwing `schemas()` → static fallback + the fetch-failure line, waterfall continues.
- **D3** `maxSectionTools: 3` → exactly 3 rows, mapped-class priority; cap-24 → mapped tools +
  alphabetical top-up.
- **D4** rebuild at `sectionTtl` judged calls and on `tools/change` (one line per path).
- **D5** `fetchLive: false` → static only, no failure line; volatile flips (fake cells + the P10
  `loader/volatile-update` dispatch) land on the next judged call.
- Plus: the six registrations, apply-returns-nothing, fail-open on a cyclic payload, fail-loud
  validation errors, dedicated tools never judged.

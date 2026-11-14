# SCHEME.md - @playform/hook-dsh-tool-coach (v0.2.1, TypeScript, function plugin)

Status: **IMPLEMENTED and VERIFIED**.

The deterministic build has zero errors and the minified build succeeds, and `tool-coach-smoke.mjs`
is green with fake ctx + the REAL factory + the REAL built Target across 129 checks: R1-R6 + D1-D5
plus wiring, fail-open, and fail-loud coverage.

## 0. What this plugin is

The tool-coach hook exists because the model "is still regressing to use bash and sed for simple
read write calls which can be tool calls".

Terminal file edits are invisible to the plugin system, because the harness's `fs/observed` chain
fires ONLY on tool-layer writes, so a `sed -i` or `python -c` edit bypasses the governor, the
pinner, and the normalize plugins entirely.

The coach goes where that regression flows and teaches the full harness toolset through a four-tier
ladder over the TERMINAL tool calls (`bash`, `pwsh`, while the dedicated tools are never judged).

Source of truth: `Documentation/Plans/TOOL-COACH-OPERATIVE-PLAN.md` (the operative spec),
`TOOL-COACH-PLAN.md` (the integration plan), and `TOOL-COACH-RESEARCH.md` (the background, where the
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

`apply` returns NOTHING, and the state is exposed via `ctx.__hookDshToolCoachState`.

`inject: ["pluginFactory", "tools"]`.

There is no fs/observed Wire, no Attach, and no factory Schema, because the coach owns its schema
and its strings (a NON-MANIFEST module, the ccr precedent).

## 2. The ladder (counting in judged calls; per-agent WeakMap keyed on the Agent object)

- **Tier 0**: every offense logs `offense <tool> <class> <pattern>` (tool = the judged terminal
  tool), and exemptions log `exempt <tool> <pattern>` only when a row would have matched, at most
  once per distinct pattern per agent.
- **Tier 1** (note): the offense's CLASS reaches `threshold` strikes within the sliding `window` AND
  `cooldown` judged calls have passed since the last note. The note is a `UserMessage` with the
  load-bearing source `{kind: 'tool-coach', form: 'notice', summary: '<tool> <class> × <n>'}`
  prepended to the downstream `additionalContexts`. Counters reset (the note IS the last note). The
  trigger class reaching threshold while the cooldown holds logs `cooldown suppressed`.
- **Tier 2** (persistent section): total offenses since the last note reach `escalateThreshold` →
  the section turns on (idempotent), `escalated persistent section (<n> strikes)`. The
  `system-prompt/assemble` listener appends ONE section (`{name: 'hook-dsh-tool-coach', text}`) to
  `next()`'s assembly and touches nothing else (PTC + structured-output preserved). The text is
  cached for `sectionTtl` judged calls (`section rebuilt (ttl <n>)`) and invalidated on
  `tools/change` (`section rebuilt (tools/change)`). After `cleanWindow` consecutive clean judged
  calls: `persistent section cleared (<n> clean calls)`.
- **Tier 3** (deny): `enforce` (`off | write | all`), per-class strikes since the last note reach
  `enforceThreshold` → the pre-execute listener returns `{kind:'deny', reason}` and logs
  `denied <tool> <class> <pattern> -> use <tool>`. The reason is the model-facing NOTE_DENIED text.
  A deny resets the note counters, and the denied call still flows through post-execute, so counting
  continues. Discovery and control are NEVER denied.

## 3. Detection (Function/Detect + Function/Normalize)

Per pipeline (segments split on `;`/`&&`/`||`/`&`): normalize → classify (rows, then markers) →
exempt override → highest class priority wins (`write > read > search > discovery > control`).

- **Normalize**: heredoc bodies stripped; `$(...)`/backticks → `«sub»`; `$VAR`/`${VAR}` → `«var»`;
  `$IFS` → space; quote layers removed; leading command word lowercased.
- **Rows**: 24 built-in `DEFAULT_PATTERNS` (write/read/search/discovery/control; the user's
  `patternTable` rows are APPENDED and may not duplicate a built-in pattern - fail-loud).
- **Markers/craft**: redirect to a non-`/dev/null` path = write catch-all (`<catch-all>`); pipe into
  a shell = write; `--in-place` = write; `«var» -i` (env-var indirection) = write; wrappers
  (`sh -c`, `xargs`, `find -exec`) never exempt, because the inner payload is re-scanned.
- **Exemptions**: `DEFAULT_EXEMPTS` + the user's, matched per pipeline anchored at the head (an
  exempt head dominates its pipe, while a bare `echo x > file` still fires).

## 4. The dynamic fetch (Function/Fetch + Function/Compose + Function/Override)

`ctx.tools.schemas()` yields the name, the first sentence of the description (≤120 chars,
parenthesis-aware), and the FULL parameter surface: every key in `parameters.properties`, with
requiredness from `parameters.required` and the default from the parameter's `default` annotation or
its "Defaults to X." description sentence (the harness's house convention; a continuation clause
like "Defaults to and is capped by configuration." states no default and is rejected).

`${tool.params}` renders that surface
(`file_path (required), offset (default 1), limit (default 2000)`, capped at `maxNoteParams` with a
`+N more` tail) and `${tool.shape}` renders the call (`read { file_path, offset?, limit? }`);
`${tool.param}` is the first REQUIRED key (the schema's own answer, not the first declared one -
`edit` declares `file_path` first but requires `old_string`/`new_string` too).

Tier 1 and 3 fetch per note, and tier 2 caches per `sectionTtl` + `tools/change`.

Any failure produces the GENERATED `Variable/Catalog` table +
`schema fetch failed -> static fallback`, and `fetchLive: false` means static only with no failure
line. The generated table is a projection of the harness's own `docs/tool-catalog.md` (from the
`Module/deepseek-harness` submodule) through the SAME code path as the live fetch, so the fallback
carries the harness's parameter surface and defaults rather than a hand-maintained approximation.

`toolDescriptions` is the last layer: a per-tool `{ description?, params? }` override applied on top
of live AND static data, per field, so a user can reword a line, pin a parameter surface, or both.
An empty `params` list means "not provided" (the schema's array default), so a description-only
override keeps the harness's parameters.

Template fills are single-pass, and user data is escaped (`${` → `$${`) before insertion, so
composed output never gains an unfilled placeholder.

## 5. Config (Variable/Config.ts - the plan's §3.4 schema verbatim; every cell volatile)

The Config base sits first: `enabled` (the MASTER switch, distinct from `log` - a disabled mount
logs `disabled (enabled=false)` and every listener passes through), then `log`/`logFile` (the
DURABLE ledger switch and path). Then the domain knobs: `judgeTools ['bash','pwsh']`, `threshold 3`,
`window 8`, `cooldown 10`, `escalateThreshold 6`, `cleanWindow 12`, `enforce 'off'`,
`enforceThreshold 4`, `exemptPatterns DEFAULT_EXEMPTS`, `patternTable DEFAULT_PATTERNS`,
`notes {first, persistent, denied}` (volatile object, plain leaves - the schemastery nesting rule),
`fetchLive true`, `toolDescriptions {}`, `maxNoteParams 4`, `maxSectionTools 5`, `sectionTtl 20`.

Fail-loud validation in `apply`: threshold ≥ 1, window ≥ threshold, cooldown ≥ 1, escalateThreshold
≥ threshold, cleanWindow ≥ 1, enforceThreshold ≥ 1, maxSectionTools 1-24, maxNoteParams 1-12,
sectionTtl ≥ 1, every row pattern compiles + tool non-empty, no built-in duplicates, notes templates
non-empty, every `toolDescriptions` entry an object with a string description and named params.

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

The per-test folders under `Source/Test` (each compiled to `Target/Test/<Folder>/Test.js` and
guarded by its README's expected PASS count, 168 checks across eight folders): Wiring-And-Defaults
40, Passthrough-And-Guards 6, Notes-And-Cooldown 16, Persistent-Section 16, Enforce-And-Exempts 15,
Dynamic-And-Craft 40, Deny-Tools 10, Defaults-And-Overrides 25. The retired `.mjs` fallback suites
(the former `EffectTS/smokes/tool-coach-smoke.mjs`) are superseded by these folders.

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

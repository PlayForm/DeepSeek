# @playform/ets-hook-dsh-tool-coach

The tool-coach hook for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)
plugin family (the EffectTS release; the Classic twin behind Effect v4). A DeepSeek Harness plugin that teaches the model to stop
using the terminal for file content: it watches the **terminal tool calls** (`bash`, `pwsh` —
config `judgeToolTools`'s siblings; the dedicated tools are never judged) and runs a four-tier
coaching ladder that escalates from silent observation to a persistent system-prompt section to
an optional hard deny.

The one-sentence rule the coach enforces: **the terminal runs COMMANDS (builds, tests, git,
package managers); the tools handle CONTENT.** Any bash segment that reads file content into the
conversation or mutates file content on disk is a regression class match — because terminal file
edits are invisible to the plugin system: the harness's `fs/observed` chain (the trigger of the
governor, pinner, and normalize plugins) fires ONLY on tool-layer writes.

## The four tiers

| Tier | Channel | When it fires | What the model sees |
|---|---|---|---|
| 0 | Ledger only | every detected offense, immediately | nothing (the durable log line) |
| 1 | `tools/post-execute` `additionalContexts` | a class reaches `threshold` (3) strikes within `window` (8) judged calls, `cooldown` (10) between notes | a labeled notice (source `{kind: 'tool-coach', form: 'notice', summary: '<tool> <class> × <n>'}`) naming the correct tool with its LIVE registry description |
| 2 | `system-prompt/assemble` section | `escalateThreshold` (6) offenses since the last note | the persistent "Tool discipline" section: 3 fixed rules + a live-fetched tool table (≤ `maxSectionTools` 8 rows); off again after `cleanWindow` (12) clean calls |
| 3 | `tools/pre-execute` deny | `enforce` ≠ off, class matches, `enforceThreshold` (4) strikes since the last note | the call is blocked; the deny reason IS the lesson ("…use the edit tool…") |

Tier 3 is off by default (`enforce: 'off'`); `write` denies only write-class segments, `all` adds
read and search. Discovery and control are **never denied**, even at `all` — flagging them hard
would dilute the write/read signal.

## The dynamic instruction engine

Every note names the correct tool with its LIVE registry data, fetched through
`ctx.tools.schemas()` (the same way the model itself is given tools): the tool name, the FIRST
SENTENCE of its description (≤ 120 chars), and the primary parameter key. Tier 1/3 fetch per
note; tier 2 caches the section for `sectionTtl` (20) judged calls and rebuilds on `tools/change`.
Any fetch failure degrades to the static `STATIC_TOOL_LINES` table and logs
`schema fetch failed -> static fallback` — a note never fails a waterfall. `fetch: false`
(the escape hatch) uses the static table unconditionally.

## The note configuration

The coach's four delivery channels (tier 0 ledger, tier 1 notice, tier 2
section, tier 3 deny) carry three model-facing note texts - `notes.first`
(the tier-1 notice), `notes.persistent` (the tier-2 section) and
`notes.denied` (the tier-3 deny reason). All three are volatile config
cells: a profile patch that lists the coach entry's bare `id:` and replaces
any of them retexts a tier without touching the package (the `notes` object
is the volatile cell and its leaves stay plain - one template edit commits
one update that the State's refresh listener re-reads; an empty template
fails loud at apply). The templates keep the placeholder grammar of
`Function/Compose` (`${command}`, `${class}`, `${count}`, `${traceability}`,
`${tool.name}`, `${tool.description}`, `${tool.param}`, `${table}`); inserted
user data is escaped before substitution, so a composed note never gains an
unfilled placeholder.

### The grammar override (the live-containers teaching)

The one intended override in this family: the profile patch replaces
`notes.persistent` with the shipped template plus the appended
"Live-container grammar" block, so the tier-2 section also teaches the
live-containers machinery - the per-call markers (`{"__normalize":false`
opens a call whose arguments the normalize family leaves byte-untouched, so
a deliberate search for an irregular character survives; `{"__await":true`
opens a detachable command call and blocks on its result instead of the
default fire-and-forget), the planted-block conventions (children report
with `[live-report]`, an unreported member self-declares `[stale]`,
suggestions are resolved with `live_container_set accept=<sid>` /
`dismiss=<sid>`, stalled members dropped with `prune=<plantId>/<agentId>`)
and the 14 CAN-3 template names. The lesson is "use the markers instead of
extraneous methods": a model that does not know the machinery exists
improvises (wrappers to stay synchronous, file copies to dodge
normalization, hand-rolled progress boards).

The tier is the SECTION, not the notice. The lesson is standing reference
material (two markers, four verbs, fourteen names), while the notice channel
is a one-shot correction sized to a single mistake; the section is
TTL-cached and stable across assemblies, and it appears exactly when the
model is misusing the terminal. The trigger conditions are the shipped
tier-2 machinery, unchanged by the override: the section turns on at
`escalateThreshold` (6) offenses since the last note, turns off after
`cleanWindow` (12) consecutive clean judged calls, and rebuilds its text
every `sectionTtl` (20) judged calls or on `tools/change`. `notes.first` and
`notes.denied` stay at their defaults - the notice and the deny remain short
corrections. The live-containers twin of this section is the live-containers
README's "Teaching the grammar (the tool-coach note)".

Ready-to-insert snippet (the profile patch, one cell):

```yaml
- id: ets-hook-dsh-tool-coach
  config:
    notes:
      persistent: "Tool discipline (persistent, from tool-coach):\n- NEVER read file content through the terminal: \"${command}-style\" commands (cat/head/tail/sed -n/grep <file>) are forbidden \u2014 use the read and grep/glob tools.\n- NEVER mutate file content through the terminal: ${command}-style commands (sed -i/awk/echo >/tee/heredoc >) are forbidden \u2014 use the write and edit tools. ${traceability}.\n- The terminal is for COMMANDS (builds, tests, git, package managers, process/service control).\nMapped tools (live from the harness registry):\n| tool | purpose |\n| --- | --- |\n${table}\nLive-container grammar (use these markers and verbs instead of extraneous methods):\n- {\"__normalize\":false as the FIRST key of a tool call's arguments: that one call passes the normalize family untouched, marker entry stripped before execution - a deliberate search for an irregular dash, quote or space survives byte-exact.\n- {\"__await\":true as the FIRST key of a detachable command (bash) call: that one call runs inline and blocks on its result instead of the default fire-and-forget detach.\n- Planted boards: children report with [live-report] <plantId> <agentId> <status> <payload>; an unreported member self-declares [stale] <agentId> - unreported for <n> parent turns; accept or dismiss a suggestion with live_container_set accept=<sid> / dismiss=<sid>; drop a stalled member with live_container_set prune=<plantId>/<agentId>.\n- Templates (the CAN-3 catalog, installed with live_container_set): todo-list, agent-progress-board, task-failsafe-guard, command-runner, countdown-expiry, session-stats, diff-summary, constraint-reminder, scoreboard, live-manifest, memory-block, validator, environment-drift, delegation-inbox."
```

## Detection is deliberately adversarial

The pattern table is one input, not the authority. Before any matching, the command is
normalized: heredoc bodies stripped, `$(…)`/backticks → `«sub»`, `$VAR`/`${VAR}` → `«var»`,
`$IFS` → space, quote layers removed. Then: the pattern rows, an intent-marker scan (redirect to
a real path = write; pipe into a shell = write; `--in-place` = write), a craft library for the
obfuscated variants, and a **catch-all** — any write-intent marker on a non-`/dev/null` path lands as
write even when no row matches, so novel zero-day forms still count. Exemptions (builds, tests,
git, package managers, file lifecycle) are checked per pipeline AFTER normalization: an exempt
head dominates its pipe (`git diff > patch.txt` is exempt), a bare `echo x > tracked.md` is not.

The five classes: **write, read, search, discovery, control** — with class-priority resolution
across chained segments (`cat a; sed -i …` counts once, as write).

## Install

```sh
pnpm add @playform/hook-dsh-tool-coach
```

Activate by listing the package in the profile's `dsh.profile.bundles` (the bundle's
`cordis.patch.yml` is applied at boot). Every knob is **volatile** — hot-edited without
remounting; a flip lands on the next judged call.

## The ledger

One log per module: `~/.dsh/hook-dsh-tool-coach.log` (config `logFile`). The ten strings are the
contract (byte-exact, `hook-dsh-tool-coach: ` prefix): `offense`, `strike … -> note`,
`cooldown suppressed`, `escalated persistent section`, `persistent section cleared`,
`section rebuilt`, `denied … -> use`, `exempt`, `schema fetch failed -> static fallback`,
`disabled (enabled=false)`.

See [SCHEME.md](SCHEME.md) for the full scheme, the config surface, and the smoke battery
(R1–R6 + D1–D5, 129 checks; same assertion set as the Classic suite, plus the tracing-hygiene mode: the suite spawns itself with `FACTORY_SMOKE_TRACING=1` and requires byte-identical stdout and ledger).

## The Test tree

The package's unit tests live in `Source/Test/` - one folder per test, each holding one
singular TypeScript test file (`Test.ts`, the assertions moved verbatim from
`EffectTS/smokes/tool-coach-smoke.mjs`, generated from the Classic folders under the
tree-identity substitutions only) and a `README.md` describing the intent, the scenario
tree, the fixtures, the expected ledger strings and the expected PASS count. The six
folders (`Wiring-And-Defaults`, `Passthrough-And-Guards`, `Notes-And-Cooldown`,
`Persistent-Section`, `Enforce-And-Exempts`, `Dynamic-And-Craft`) sum to the 129-check
baseline exactly; the tracing-hygiene coverage is suite-level (silent, no checks) and
stays in `EffectTS/smokes/tool-coach-smoke.mjs`. The shared harness
(`Source/Test/Harness.ts`) owns the Check counter, the tmpdir ledger and the
live-registry fixture. The tests compile to `Target/Test/` in a separate ESBuild step
(`Configuration/Test-ESBuild.ts`) that runs SECOND in `prepublishOnly.sh`, after the
plugin build (which wipes `Target/` recursively). Each test runs standalone
(`node Target/Test/<Name>/Test.js`) and under the aggregate
(`node Maintain/Run-Smokes.mjs`, which guards each folder's printed PASS count against
its README). Neither tree is ever published: `.npmignore` excludes `Source/Test/` and
`Target/Test/`, and the package `files` field negates `Target/Test`. The smoke suite
`EffectTS/smokes/tool-coach-smoke.mjs` stays in place as the migration fallback until a
later lane retires it.

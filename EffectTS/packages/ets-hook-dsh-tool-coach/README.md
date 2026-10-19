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

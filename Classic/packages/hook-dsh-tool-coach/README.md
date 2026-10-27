# @playform/hook-dsh-tool-coach - the four-tier ladder that teaches the model to keep file content out of the terminal

> Version 0.2.0 - UNPUBLISHED (the npm bootstrap tier 2-planned / 3-candidates).
>
> Plan: [SCHEME.md](./SCHEME.md) -
> [TOOL-COACH-OPERATIVE-PLAN.md](../../Documentation/Plans/TOOL-COACH-OPERATIVE-PLAN.md) -
> [TOOL-COACH-PLAN.md](../../Documentation/Plans/TOOL-COACH-PLAN.md) -
> [TOOL-COACH-RESEARCH.md](../../Documentation/Plans/TOOL-COACH-RESEARCH.md).

## The role

A DeepSeek Harness plugin that teaches the model to stop using the terminal for file content: it
watches the **terminal tool calls** (`bash`, `pwsh` - config `judgeTools`; the dedicated tools are
never judged) and runs a four-tier coaching ladder that escalates from silent observation to a
persistent system-prompt section to an optional hard deny.

The one-sentence rule the coach enforces: **the terminal runs COMMANDS (builds, tests, git, package
managers); the tools handle CONTENT.**

Any bash segment that reads file content into the conversation or mutates file content on disk is a
regression class match - because terminal file edits are invisible to the plugin system: the
harness's `fs/observed` chain (the trigger of the governor, pinner, and normalize plugins) fires
ONLY on tool-layer writes.

Detection is deliberately adversarial: the command is normalized before any matching (heredoc bodies
stripped, `$(...)`/backticks -> `«sub»`, `$VAR`/`${VAR}` -> `«var»`, `$IFS` -> space, quote layers
removed), then the pattern rows, an intent-marker scan (redirect to a real path = write; pipe into a
shell = write; `--in-place` = write), a craft library for the obfuscated variants, and a
**catch-all** - any write-intent marker on a non-`/dev/null` path lands as write even when no row
matches, so novel zero-day forms still count.

Exemptions (builds, tests, git, package managers, file lifecycle) are checked per pipeline AFTER
normalization: an exempt head dominates its pipe (`git diff > patch.txt` is exempt), a bare
`echo x > tracked.md` is not.

The five classes: **write, read, search, discovery, control** - with class-priority resolution
across chained segments (`cat a; sed -i ...` counts once, as write).

Every note names the correct tool with its LIVE registry data, fetched through
`ctx.tools.schemas()`: the tool name, the FIRST SENTENCE of its description (≤ 120 chars), and the
primary parameter key.

Any fetch failure degrades to the static `STATIC_TOOL_LINES` table and logs
`schema fetch failed -> static fallback` - a note never fails a waterfall.

`fetchLive: false` (the escape hatch) uses the static table unconditionally.

The three model-facing note texts (`notes.first` the tier-1 notice, `notes.persistent` the tier-2
section, `notes.denied` the tier-3 deny reason) are volatile config cells: a profile patch that
replaces any of them retexts a tier without touching the package.

The templates keep the placeholder grammar of `Function/Compose` (`${command}`, `${class}`,
`${count}`, `${traceability}`, `${tool.name}`, `${tool.description}`, `${tool.param}`, `${table}`);
inserted user data is escaped before substitution, so a composed note never gains an unfilled
placeholder.

The intended override appends the "Live-container grammar" block to `notes.persistent` so the tier-2
section also teaches the live-containers machinery - the lesson is the SECTION, not the notice; see
the live-containers README's "Teaching the grammar (the tool-coach note)".

## The surfaces

| Kind     | Name                     | What                                                                                                                                                                |
| -------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| listener | `tools/post-execute`     | judges every terminal call; tier-0 ledger + tier-1 notice via `additionalContexts` (source `{kind: 'tool-coach', form: 'notice', summary: '<tool> <class> × <n>'}`) |
| listener | `tools/pre-execute`      | tier 3: denies the terminal call with the lesson as the deny reason                                                                                                 |
| listener | `agent/pre-step`         | the clean-window accounting between judged calls                                                                                                                    |
| listener | `system-prompt/assemble` | tier 2: the persistent "Tool discipline" section                                                                                                                    |
| listener | `tools/change`           | rebuilds the cached section when the registry changes                                                                                                               |
| config   | `SCHEME.md`              | the full Schemastery schema (see the table below)                                                                                                                   |

The four tiers: tier 0 fires on every detected offense (ledger only, the model sees nothing); tier 1
fires when a class reaches `threshold` (3) strikes within `window` (8) judged calls, `cooldown` (10)
between notes; tier 2 escalates at `escalateThreshold` (6) offenses since the last note and turns
off again after `cleanWindow` (12) clean calls; tier 3 fires at `enforceThreshold` (4) strikes.

Tier 3 is off by default (`enforce: 'off'`); `write` denies only write-class segments, `all` adds
read and search.

Discovery and control are **never denied**, even at `all` - flagging them hard would dilute the
write/read signal.

Every knob is **volatile** - hot-edited without remounting; a flip lands on the next judged call.

## The configuration

| Field               | Type    | Default                                     | Meaning                                                     |
| ------------------- | ------- | ------------------------------------------- | ----------------------------------------------------------- |
| `log`               | boolean | `true`                                      | volatile - the shared factory log switch                    |
| `logFile`           | string  | `~/.dsh/playform/hook-dsh-tool-coach.log`   | volatile - the ledger file                                  |
| `enabled`           | boolean | `true`                                      | volatile - the coach switch                                 |
| `judgeTools`        | array   | `["bash", "pwsh"]`                          | volatile - the terminal tools that are judged               |
| `threshold`         | number  | `3`                                         | volatile - tier-1 strikes within the window                 |
| `window`            | number  | `8`                                         | volatile - the sliding judged-call window                   |
| `cooldown`          | number  | `10`                                        | volatile - judged calls between tier-1 notes                |
| `escalateThreshold` | number  | `6`                                         | volatile - offenses since the last note that turn tier 2 on |
| `cleanWindow`       | number  | `12`                                        | volatile - clean calls that turn tier 2 off                 |
| `enforce`           | union   | `off`                                       | volatile - `off` / `write` / `all`, the tier-3 deny scope   |
| `enforceThreshold`  | number  | `4`                                         | volatile - strikes since the last note that deny            |
| `exemptPatterns`    | array   | `DEFAULT_EXEMPTS`                           | volatile - the exempt command heads                         |
| `patternTable`      | array   | `DEFAULT_PATTERNS`                          | volatile - `{ pattern, class, tool, note? }` rows           |
| `notes`             | object  | `first` / `persistent` / `denied` templates | volatile - the three model-facing note texts                |
| `fetchLive`         | boolean | `true`                                      | volatile - fetch tool data from the live registry           |
| `maxSectionTools`   | number  | `5`                                         | volatile - the tier-2 tool-table row cap                    |
| `sectionTtl`        | number  | `20`                                        | volatile - judged calls between tier-2 section rebuilds     |

## The ledger

One log per module: `~/.dsh/playform/hook-dsh-tool-coach.log` (config `logFile`); the durable file
lines are the `[ISO] message` forms with the `hook-dsh-tool-coach: ` prefix.

```text
activated (bundle 0.2.0, threshold=<t>/<w>, cooldown=<c>, escalate=<e>, clean=<cl>, enforce=<off|write|all>@<et>, judge=<list>, fetch=live|static)
disabled (enabled=false)
offense <tool> <class> <pattern>
strike <n>/<t> <tool> <class> -> note <tool>
cooldown suppressed <n> <tool> <class>
escalated persistent section (<n> strikes)
persistent section cleared (<n> clean calls)
section rebuilt (ttl <n>)
section rebuilt (tools/change)
denied <tool> <class> <pattern> -> use <tool>
exempt <tool> <pattern>
schema fetch failed -> static fallback
```

## The build and the tests

- Build:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-tool-coach run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-tool-coach/Target/Test/<Folder>/Test.js` - the six folders
  sum to the 129-check baseline exactly
    - Wiring-And-Defaults - 36 checks
    - Passthrough-And-Guards - 6 checks
    - Notes-And-Cooldown - 16 checks
    - Persistent-Section - 16 checks
    - Enforce-And-Exempts - 15 checks
    - Dynamic-And-Craft - 40 checks

## The plan

[SCHEME.md](./SCHEME.md) -
[TOOL-COACH-OPERATIVE-PLAN.md](../../Documentation/Plans/TOOL-COACH-OPERATIVE-PLAN.md) (Part 3) -
[TOOL-COACH-PLAN.md](../../Documentation/Plans/TOOL-COACH-PLAN.md) -
[TOOL-COACH-RESEARCH.md](../../Documentation/Plans/TOOL-COACH-RESEARCH.md).

---
title: 04-guardians - the context budget, defended
category: Diagram
kind: reference
date: 2026-10-21
status: active
---

# 04-guardians

> **The capability.** The context window stops filling with raw tool output and stops filling with
> terminal misuse. CCR replaces an oversized tool result with a one-line type-aware preview plus a
> retrieval marker, keeps the original in an LRU store, and hands it back byte-exactly through
> `ccr_retrieve` when the model asks. Tool-coach watches terminal calls and escalates through four
> independent coaching channels (a ledger line, a notice, a persistent system-prompt section, and an
> optional hard deny) that name the dedicated tool with its live registry description.

## The harness surfaces

| Surface                  | Direction | What the group does there                                                                                                                                                                                       |
| ------------------------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tools/post-execute`     | listens   | CCR registers one prepended listener: `next()` first, pass-through unchanged, only an accepted non-value-carrying decision replaced. Tool-coach registers a plain listener that detects, classifies and counts. |
| `tools/pre-execute`      | listens   | Tool-coach registers the tier-3 deny listener unconditionally; it is a no-op unless `enforce` is not `off`.                                                                                                     |
| `system-prompt/assemble` | listens   | Tool-coach appends its persistent "Tool discipline" section after `next()`, touching nothing else.                                                                                                              |
| `agent/pre-step`         | listens   | Tool-coach resets its per-agent chain on a user message; CCR's context engine, when enabled, runs its middle-turn archive decision here.                                                                        |
| `tools/change`           | listens   | Tool-coach invalidates its cached section when the tool registry changes.                                                                                                                                       |
| tool execution surface   | registers | CCR registers the `ccr_retrieve` tool; the model calls it with an exact hash and an optional line range.                                                                                                        |

## The packages

| Package                             | Tree     | Role            | Trigger                                                                                               | Ledger file                                         | Diagram                                                                    |
| ----------------------------------- | -------- | --------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------- |
| `@playform/hook-dsh-ccr`            | Classic  | hook (guardian) | `tools/post-execute`, `agent/pre-step` when the engine is on                                          | `~/.dsh/ccr.log`                                    | [ccr.mmd](Classic/ccr.mmd) ([SVG](Classic/ccr.svg))                        |
| `@playform/hook-dsh-tool-coach`     | Classic  | hook (guardian) | `tools/post-execute`, `tools/pre-execute`, `system-prompt/assemble`, `agent/pre-step`, `tools/change` | `~/.dsh/hook-dsh-tool-coach.log`                    | [tool-coach.mmd](Classic/tool-coach.mmd) ([SVG](Classic/tool-coach.svg))   |
| `@playform/ets-hook-dsh-ccr`        | EffectTS | hook (guardian) | same surfaces                                                                                         | `~/.dsh/ccr.log` (same file as Classic)             | [ccr.mmd](EffectTS/ccr.mmd) ([SVG](EffectTS/ccr.svg))                      |
| `@playform/ets-hook-dsh-tool-coach` | EffectTS | hook (guardian) | same surfaces                                                                                         | `~/.dsh/hook-dsh-tool-coach.log` (no `ets-` prefix) | [tool-coach.mmd](EffectTS/tool-coach.mmd) ([SVG](EffectTS/tool-coach.svg)) |

## How each plugin works

### @playform/hook-dsh-ccr

**Classic.** What it does. CCR is compress-cache-retrieve for tool output. It hooks the
`tools/post-execute` waterfall (the interceptable wrapper around every normalized dispatch result,
before that result becomes model content) and replaces an oversized result with a one-line
type-aware preview plus a `<<<CCR:<24hex>|<type>|<size>>>` marker. The original stays in an
in-memory LRU keyed by a sha256-24 hash of the full serialized content, and `ccr_retrieve` restores
it byte-exactly.

**The chain.**

1. **Downstream decision.**

    The listener awaits `next()` first and keeps the downstream decision for every pass-through, and
    only an accepted decision with no `value` key is eligible for replacement.

2. **Gate.**

    The gate runs in order: empty content passes, an exempt tool passes, a failure passes unless
    `compressFailures` is on, a tool outside `targets` passes, and a result at or under
    `thresholdBytes` × the multiplier of the classified type passes.

3. **Classify.**

    The classifier reduces the result to one of seven types (`error`, `terminal`, `grep`, `paths`,
    `file`, `json`, `web`) by failure status, name table, and shape fallback.

4. **Store.**

    Over the gate, the store keeps the original under the hash, and with `autoExpand` on and the
    size at or under `autoExpandLimitBytes`, the full content returns and no marker reaches the
    model.

5. **Preview and retrieval.**

    Otherwise the result becomes the preview line plus the marker, and the model retrieves the
    original with `ccr_retrieve(hash, range?)`, where the hash is matched exactly and a
    `range { start, count }` slices lines.

6. **Ledger.**

    On normal completion the ledger records `compressed` or `stored`, plus `evicted (budget)` and
    `evicted (ttl)` as the store turns over.

**The config that matters.** The keys are `targets` (the eight default tools), `thresholdBytes`
(`2048`), `autoExpand` (`true`) with `autoExpandLimitBytes` (`102400`), `previewMaxChars` (`240`),
`storeBudgetBytes` (`268435456`, 256 MiB), `ttlSeconds` (`3600`), `compressFailures` (`false`),
`journalPath` (`""` = memory-only), and `contextEngine` (`false`). `thresholdBytes`,
`previewMaxChars`, and `multipliers` are volatile, and the structural knobs remount on edit.

**The safety.** The whole transform is one contained try/catch: an internal error logs a warning and
keeps the inline content, and it never throws into the waterfall. A value-carrying decision is
canonical and is never replaced. `ccr_retrieve` is exempt from compression, so a retrieval can never
be compressed into another retrieval.

**The ledger.** The file `~/.dsh/ccr.log` holds the activation line
(`ccr: activated (bundle 0.1.0, targets 8, budget 268435456)`), the compression line
(`ccr: compressed <tool> <type> <bytes> -> <hash>`), the storage line (`ccr: stored ...`), the
eviction lines (`ccr: evicted <hash> (budget)` / `(ttl)`), the retrieval lines
(`ccr: retrieved <hash>`, `ccr: retrieval miss <hash> (expired|unknown)`), and the one aggregate
line of the engine (`ccr: engine archived <n> results`).

**The diagram.** [ccr.mmd](Classic/ccr.mmd) and ([SVG](Classic/ccr.svg)).

### @playform/hook-dsh-tool-coach

**Classic.** What it does. Tool-coach teaches the model to stop using the terminal for file content.
It judges terminal calls (`bash`, `pwsh`), detects content reads and content mutations after it
normalizes away heredocs, substitutions, variables, and quote layers, classifies each pipeline into
one of five classes, and escalates through four independent channels. The rule it enforces is
simple: the terminal runs commands, and the tools handle content.

**The chain.**

1. **Detection.**

    A judged terminal call arrives at `tools/post-execute`, and the detector normalizes the command,
    matches the pattern rows, scans the intent markers, applies the craft library and the write
    catch-all, and then resolves the highest class priority
    (`write > read > search > discovery > control`).

2. **Exemption.**

    An exempt head (builds, tests, git, package managers, file lifecycle) dominates its pipe and the
    call is not an offense, and an exemption line is written at most once per distinct pattern per
    agent.

3. **Tier 0.**

    Tier 0 writes `offense <tool> <class> <pattern>` for every detected offense.

4. **Tier 1.**

    Tier 1 fires when a class reaches `threshold` (3) strikes within `window` (8) judged calls and
    `cooldown` (10) calls have passed since the last note, and a notice is prepended to the
    downstream `additionalContexts` with the source
    `{kind: 'tool-coach', form: 'notice', summary: '<tool> <class> × <n>'}` and the correct tool
    named from the live registry.

5. **Tier 2.**

    Tier 2 fires when the total offenses since the last note reach `escalateThreshold` (6), and the
    `system-prompt/assemble` listener appends one persistent section with three fixed rules and a
    live tool table of at most `maxSectionTools` (8) rows, cached for `sectionTtl` (20) judged calls
    and invalidated on `tools/change`, which turns off after `cleanWindow` (12) clean calls.

6. **Tier 3.**

    Tier 3 fires on `tools/pre-execute` only when `enforce` is not `off` and a class reaches
    `enforceThreshold` (4) strikes since the last note, and the call is denied with the model-facing
    deny reason that names the tool to use instead.

**The config that matters.** The keys are `enabled` (the master switch, distinct from `log`),
`judgeTools` (`['bash','pwsh']`), `threshold` (`3`), `window` (`8`), `cooldown` (`10`),
`escalateThreshold` (`6`), `cleanWindow` (`12`), `enforce` (`'off'`; `write` or `all` to opt in),
`enforceThreshold` (`4`), `maxSectionTools` (`8`), `sectionTtl` (`20`), and `fetchLive` (`true`).
Every cell is volatile.

**The safety.** Every listener fails open and calls `next()` first. A schema fetch failure degrades
to the static table and logs `schema fetch failed -> static fallback`, so a note never fails a
waterfall. Tier 3 ships off, and discovery and control are never denied even at `all`. Validation is
fail-loud at apply: `threshold ≥ 1`, `window ≥ threshold`, `cooldown ≥ 1`,
`escalateThreshold ≥ threshold`, `cleanWindow ≥ 1`, `enforceThreshold ≥ 1`, `maxSectionTools` 1-24,
`sectionTtl ≥ 1`, every pattern compiles, no built-in duplicates, and no empty note template.

**The ledger.** The file `~/.dsh/hook-dsh-tool-coach.log` holds ten byte-exact strings: `offense`,
`strike <n>/<threshold> <tool> <class> -> note <tool>`, `cooldown suppressed`,
`escalated persistent section (<strikes> strikes)`,
`persistent section cleared (<clean> clean calls)`, `section rebuilt (ttl <calls>)` /
`section rebuilt (tools/change)`, `denied <tool> <class> <pattern> -> use <tool>`,
`exempt <tool> <pattern-head>`, `schema fetch failed -> static fallback`, and
`disabled (enabled=false)`.

**The diagram.** [tool-coach.mmd](Classic/tool-coach.mmd) and ([SVG](Classic/tool-coach.svg)).

### @playform/ets-hook-dsh-ccr

**EffectTS twin.** The exact package is `@playform/ets-hook-dsh-ccr`, built on
`@playform/ets-base-dsh`, `@playform/ets-lib-dsh-core`, and the `@playform/ets-plugin-dsh-factory`
service.

It has no Effect-native stage of its own: the listener, the gate, the classifier, and the LRU are
the Classic pipeline, and it consumes the Effect-backed factory for state and the ledger.

The ledger strings stay byte-identical, and the ledger path is the same file as the Classic CCR
(`~/.dsh/ccr.log`), which is safe only because the two trees are never active in one graph.

The diagram is [ccr.mmd](EffectTS/ccr.mmd) and ([SVG](EffectTS/ccr.svg)).

### @playform/ets-hook-dsh-tool-coach

**EffectTS twin.** The exact package is `@playform/ets-hook-dsh-tool-coach`, built on the same three
ETS packages.

The five listeners and the four channels keep the Classic shape, and the Effect delta is only the
factory service behind `State` and `Append`.

The ten ledger strings stay byte-identical, and the ledger path is `~/.dsh/hook-dsh-tool-coach.log`
(the Classic path, with no `ets-` prefix) in both the patch row and `Source/Variable/Config.ts`. The
diagram is [tool-coach.mmd](EffectTS/tool-coach.mmd) and ([SVG](EffectTS/tool-coach.svg)).

## How the group composes

CCR prepends its `tools/post-execute` listener, so its gate sees the pristine result before any
other post-execute listener has shaped it. That is what keeps the compression decision stable: a
later listener can still append context, but the size that CCR measured is the size that the tool
produced.

`ccr_retrieve` is exempt from compression. A retrieval result is the original bytes coming back
through the same waterfall, and if it were eligible, a large retrieval would be compressed into a
second marker and the model could never reach the content. The exempt list also covers `write`,
`edit`, `raw-write`, `subagent`, and `ask_user_question`, whose results are small or load-bearing.

The `<<<CCR:` marker guard makes load order safe. CCR and the tool-results arm of the normalize
flavors share `tools/post-execute`, the normalize arm prepends outermost, so CCR compresses the
normalized bytes, and a result that already carries a `<<<CCR:` marker is recognized and not
re-compressed.

The four channels of tool-coach are independent and not a ladder that an offense must climb. One
offense can write a tier-0 line, fire a tier-1 notice, and trip a tier-2 section in the same turn,
because each channel has its own counter and its own condition.

The tiers are ordered only by intrusiveness: ledger, notice, persistent section, deny. Tier 3 is
opt-in through `enforce`, and even at `all` it never denies discovery or control calls.

Both guardians can be active together: CCR defends the size of a tool result, and tool-coach defends
the choice of tool. Neither depends on the state of the other, and each writes its own ledger.

## How it plugs into the harness

CCR is one `insert:` row with its targets, thresholds, store, and engine flags, and tool-coach is
one row with its ladder knobs and note templates.

Neither injects a filesystem or a factory service for a write path: CCR injects the tool service for
`ccr_retrieve`, and tool-coach injects `["pluginFactory", "tools"]` and owns its own schema. The
listeners are plain `ctx.on` registrations, fiber-owned and removed on unload, and the CCR listener
is `{ prepend: true }`.

The boot order is: profile bundles → the services that the bundle injects → each guardian registers
its listeners and tools → each writes its activation line.

The model observes CCR as the preview plus the marker and tool-coach as a notice, a section, or a
deny reason, and the user observes shorter transcripts and, when the coach is right, fewer terminal
file reads.

A `file:` dependency alone is not activation. The package must go in `dsh.profile.bundles` and the
host must restart.

## What the user experiences

- A 5 KB `bash` result becomes one preview line and a marker, and `ccr_retrieve` gives back the
  exact original when the model needs it.
- The model can ask for a slice of a stored result instead of the whole thing.
- A model that keeps using `sed -i` sees a notice that names the `edit` tool, then a persistent
  discipline section, and a deny only if the operator opted in.
- A legitimate build or git command is never flagged, and an exempt head dominates its pipe.
- The context window stays smaller without losing a byte, because everything compressed is
  retrievable.

## Sources

- [ccr README](../../Classic/packages/hook-dsh-ccr/README.md),
  [SCHEME.md](../../Classic/packages/hook-dsh-ccr/SCHEME.md),
  [cordis.patch.yml](../../Classic/packages/hook-dsh-ccr/cordis.patch.yml)
- [tool-coach README](../../Classic/packages/hook-dsh-tool-coach/README.md),
  [SCHEME.md](../../Classic/packages/hook-dsh-tool-coach/SCHEME.md),
  [cordis.patch.yml](../../Classic/packages/hook-dsh-tool-coach/cordis.patch.yml)
- [ets ccr README](../../EffectTS/packages/ets-hook-dsh-ccr/README.md),
  [SCHEME.md](../../EffectTS/packages/ets-hook-dsh-ccr/SCHEME.md),
  [cordis.patch.yml](../../EffectTS/packages/ets-hook-dsh-ccr/cordis.patch.yml)
- [ets tool-coach README](../../EffectTS/packages/ets-hook-dsh-tool-coach/README.md),
  [SCHEME.md](../../EffectTS/packages/ets-hook-dsh-tool-coach/SCHEME.md),
  [cordis.patch.yml](../../EffectTS/packages/ets-hook-dsh-tool-coach/cordis.patch.yml)

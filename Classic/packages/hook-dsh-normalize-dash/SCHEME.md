# SCHEME.md — @playform/hook-dsh-normalize-dash (v0.1.0, TypeScript, function plugin)

Status: **IMPLEMENTED and VERIFIED** (`tsc --noEmit` zero errors; a minified build; a smoke of ≥22
checks with a fake ctx and the REAL factory - ALL PASS).

## 0. What this plugin is

The dash normalizer for **model output**.

The file-hook precedent rewrites the unicode dash family to ASCII hyphen-minus **in files, after the
fact**.

A DSH plugin can go where a file hook cannot: the **`llm/stream` waterfall** - the interceptable
wrapper around every streaming model call (retry, replay, routing), which is bound to the LlmRuntime
(`docs/subsystems/llm-streaming.md:1108-1125`).

The rewrite flows into the live UI and into the durable transcript - **the normalization is
deliberately VISIBLE** (it IS the feature), which is the opposite of the silence of the governance
family.

## 1. The transform (exact fidelity)

Per text segment, verbatim from the core's Dashes class:

```
[\u058A\u05BE\u1400\u1806\u2010-\u2015\u2E17\u2E1A\u2E3A-\u2E3B\u2E40
 \u2E5D\u301C\u3030\u30A0\uFE31-\uFE32\uFE58\uFE63\uFF0D]  →  replacement
```

| U+ codepoints | Characters (official Unicode names)                                        |
| ------------- | -------------------------------------------------------------------------- |
| 058A          | ARMENIAN HYPHEN                                                            |
| 05BE          | HEBREW PUNCTUATION MAQAF                                                   |
| 1400          | CANADIAN SYLLABICS HYPHEN                                                  |
| 1806          | MONGOLIAN TODO SOFT HYPHEN                                                 |
| 2010–2015     | HYPHEN, NON-BREAKING HYPHEN, FIGURE DASH, EN DASH, EM DASH, HORIZONTAL BAR |
| 2E17          | DOUBLE OBLIQUE HYPHEN                                                      |
| 2E1A          | HYPHEN WITH DIAERESIS                                                      |
| 2E3A–2E3B     | TWO-EM DASH, THREE-EM DASH                                                 |
| 2E40          | DOUBLE HYPHEN                                                              |
| 2E5D          | (Supplementary Punctuation hyphen - unnamed in older Unicode tables)       |
| 301C          | WAVE DASH                                                                  |
| 3030          | WAVY DASH                                                                  |
| 30A0          | KATAKANA-HIRAGANA DOUBLE HYPHEN                                            |
| FE31–FE32     | PRESENTATION FORM FOR VERTICAL EM DASH / EN DASH                           |
| FE58          | SMALL EM DASH                                                              |
| FE63          | SMALL HYPHEN-MINUS                                                         |
| FF0D          | FULLWIDTH HYPHEN-MINUS                                                     |

All → the config `replacement` (default `-`, ASCII hyphen-minus U+002D).

No context rules - none.

Whole-chunk replacement of a single character is **chunk-boundary-safe**: there is no lookahead or
lookbehind and no multi-character sequence, so application per chunk can never disagree with
application over the whole text.

The replacement uses a **function replacer**, so a custom `replacement` that contains `$` patterns
is inserted literally.

The count of replaced characters is kept per stream for the ledger line.

## 2. The injection point - the llm/stream waterfall

```ts
ctx.on("llm/stream", (Request, Next) => {
	const Upstream = Next();
	return Normalize(Upstream, State);
});
```

- **`next()` is ALWAYS called** first and unconditionally - if you omit it, the waterfall
  short-circuits and **the model call never happens** (docs/cordis-api/events.md:97-123;
  docs/user/develop/framework/events.md:64-81).
- **`options` (Request) is NEVER touched**: a request that the LOOP builds arrives **deep-frozen**
  (mutation throws), so listeners read it and never rewrite it (llm-streaming.md:1117-1122).
- One chunk goes in and one chunk comes out: **order is preserved, with no buffering**, and upstream
  throws propagate (the LlmRuntime normalizes adapter failures; a stream that is thrown away writes
  no ledger line).

Chunk handling:

| Chunk                              | Action                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text-delta`                       | rewrite the `text` field (always)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `reasoning-delta`                  | rewrite the `text` field when `normalizeReasoning` is on (the default)                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `block-end`                        | rewrite the assembled `TextBlock.text` / `ReasoningBlock.text` (and the runtime `thinking` string field, defensively) - the deltas AND the block must agree                                                                                                                                                                                                                                                                                                                                                                         |
| `tool-call-delta`                  | rewrite `argumentsDelta` when `normalizeToolArguments` is on (IMPLEMENTED, default OFF - execution-critical raw JSON; the assembled ToolCallBlock.arguments follows the same flag through `block-end`). With the flag on the gate is THREE-WAY: an `edit` call passes through BY IDENTITY (the `old_string` must match the real file bytes), and a call whose arguments open with the `{"__normalize":false` first-key marker passes through UNNORMALIZED with the marker entry stripped (the executed call carries no unknown key) |
| `block-start` / `usage` / `finish` | **passthrough by identity** (usage before finish, nothing after - the adapter contract)                                                                                                                                                                                                                                                                                                                                                                                                                                             |

With the flag on, the gate is **three-way**, not two-way:

1. **normalize** - the default: the same transform rewrites the `argumentsDelta` text and the
   assembled `ToolCallBlock.arguments`.
2. **edit-exempt** - a call whose tool `name` is `edit` passes through BY IDENTITY on every chunk
   and every block: the `old_string` of the edit tool must match the real file bytes, so a character
   that is rewritten inside an edit call would break every edit without a warning.
3. **raw-marked** - a call whose arguments JSON opens with the `{"__normalize":false` marker (the
   FIRST key; tracked per tool-call id by `Function/Normalize`, which passes `RawCall` into the
   dispatch) passes through UNNORMALIZED, and the marker entry itself is STRIPPED from the text
   (`{"__normalize":false,` → `{`; `{"__normalize":false}` → `{}`) so the executed call carries no
   unknown key (the harness's tools validate with `additionalProperties: false`). The strip is not
   counted by the ledger: marker removal is not normalization. A first delta shorter than the whole
   marker is the documented edge (the split text is invisible to the detection probe).

`normalizeToolArguments` is **IMPLEMENTED, and the SCHEMA default is OFF** (tool-call arguments are
execution-critical raw JSON, so enabling it is a risk that the user accepts - the example patch yml
turns it on).

## 3. Factory consumption (the second consumer, non-manifest module)

It consumes from `@playform/plugin-dsh-factory` (the service, through `inject: ["pluginFactory"]`):

| Method                                         | Use                                                                                                                                                                |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `State(ctx, config, {module, fields})` (§2.10) | cell unwrap (the volatile log/logFile/replacement), the shared mappings `Ledger←logFile`/`Enabled←log`, and the module fields `Replacement`/`Reasoning`/`ToolArgs` |
| `Append(state, message)` (§2.1)                | the ledger lines: `hook-dsh-normalize-dash: activated (...)` and `hook-dsh-normalize-dash: normalized N dash char(s) in one stream`                                |

Deliberately not consumed: `Wire` (§2.11 - fs/observed-hardwired; the normalize-dash makes its own
plain registration with `ctx.on("llm/stream", ...)`), `Attach` (§2.12 - no jobs/inflight/storage),
`Journal` (§2.13 - consumed: the P5 `normalized` record on every pass with N > 0), and
`Gate`/`GuardedWrite`/`Refresh`/`Continue` (§2.6-2.9 - no fs/observed path).

This is the factory's **first NON-MANIFEST module** and its **second consumer**.

The chunk vocabulary (`StreamChunk`, `ContentBlock`, `GenerateOptions`) comes from
`@deepseek-ai/dsh-llm` (a host-pinned devDep with type-only imports - erased at build, so the Target
has no runtime import of it).

## 4. The Config (the minimal shared block)

The factory's STANDALONE helper COMPOSES the schema (factory v0.1.1, P1 - `Schema(shared?, module?)`
as a module-level named export, the module-load use): the normalize-dash passes `shared: false` -
the MINIMAL shared block, which holds ONLY the two universal volatile cells (`log`, `logFile`).

The deviation that existed before v0.1.1 (the schema was defined by hand here, because the factory's
Schema always emitted the shared block of the family - `updateCooldownMs`, `mutationTools`,
`policyFile`, `exclude` - fs/observed machinery that the normalize-dash does not have) is gone:
`shared: false` emits nothing that the module does not use.

The normalize-dash supplies its own `logFile` default (its SEPARATE ledger) through its own fields,
which override those of the minimal block.

The shape: `log` (bool, true, volatile), `logFile` (`~/.dsh/playform/hook-dsh-normalize-dash.log`,
volatile), `replacement` (`-`, volatile - the only knob of the transform), `normalizeReasoning`
(bool, true), `normalizeToolArguments` (bool, false), `scopes` (object, volatile - the granular
scope gates of §7), `toolResultsExempt` (string array, volatile - the tool-results exemption list of
§7). The `scopes` object itself carries the volatile marker (its leaves stay plain, because
schemastery rejects volatile leaves under an enclosing volatile field), so a change to one leaf
commits one update, and the refresh listener of the State re-reads the whole object.

## 5. Ledger lines (stable, asserted by the smoke)

```
hook-dsh-normalize-dash: activated (replacement=-, reasoning=on, toolArgs=off, logFile=~/.dsh/playform/hook-dsh-normalize-dash.log)
hook-dsh-normalize-dash: normalized 4 dash char(s) in one stream
```

The line is written only when N > 0, and the count line follows a normal stream completion only. The
overpass arms add their own N > 0 lines (§7); the activation line NEVER changes for a volatile edit
(observability lives in the read-only `normalize-overpass scopes` report).

## 6. Interplay

- **The trio (fs/observed modules) and the factory**: pure additive - no shared event, no shared
  state, no conflict. The normalize-dash touches no files, so the fs/write-intent guard and the
  fs/observed observation never see it.
- **The LlmRuntime / other llm/stream listeners**: the normalize-dash wraps the downstream result
  and always calls `next()`, so it composes with other waterfall listeners regardless of
  registration order; it neither short-circuits nor yields its own chunks.
- **Chunk identity**: untouched chunks pass through by object identity; a delta or block that is
  rewritten is a shallow copy with only the text field replaced (the one exception: the raw-marker
  strip rewrites the arguments text while the count stays 0 - marker removal is not normalization).

## 7. The granular scopes, the overpass arms and the command (P10–P12)

**The scopes.** One `scopes` object (whole-object volatile) gates every arm of the hook
independently: `conversation` (text-delta text plus the assembled text/reasoning blocks, default
ON), `reasoning` (the reasoning-delta sub-gate, ANDed with `normalizeReasoning`, default ON),
`toolInput` (the tool-call arguments arm, OR-ed with the deprecated `normalizeToolArguments` - the
old field keeps working, effective toolInput = field || scope - default OFF), `toolResults` (the
`tools/post-execute` arm, default OFF), `files` (inert in a stream flavor but present in the schema
so one patch override drives the whole family), `batch` (the `agent/pre-step` arm, default OFF).
Defaults are exactly the behavior before the scopes. `toolResultsExempt` (volatile string array,
default `read, edit, raw-write, normalize-file, ccr_retrieve, subagent, ask_user_question`) passes a
listed tool result by identity. The factory's P10 `loader/volatile-update` listener refreshes
`Scopes` / `Exempt` / `Replacement` in place - no remount, no new activation line.

**The overpass arms.** Two additional listeners, both registered at apply and both opt-in (gated at
runtime on the scope cells, so flipping a scope lands through the volatile-refresh without any
re-registration):

- `tools/post-execute`, `{ prepend: true }` - OUTERMOST against the prepended gate of the ccr hook
  (the bundle order of the family places ccr before the normalize hooks, so the arm that prepends
  later compresses AFTER normalization; the `<<<CCR:` marker guard makes ANY load order safe).
  Accepted, non-value-carrying decisions only; the content basis is
  `decision.content ?? result.content`; TEXT blocks only (never tool-call/argument blocks); N = 0 is
  a true no-op; fail-open.
- `agent/pre-step`, default order - while `scopes.batch` is on, every incoming batch is normalized;
  the one-shot arm of the command (`State.Overpass`) fires once regardless of the scope value and is
  cleared after one use. Only an `enter` decision can be replaced; text blocks only; never the
  assistant/tool history; re-normalizing injected content across steps is harmless (the transforms
  are idempotent on their own output).

**The command.** `normalize-overpass` (registered through the probe-once `commands` Seam - silently
skipped when the service is absent): `files <path...>` is declined by a stream flavor (owned by
normalize-file), `batch` arms the one-shot flag, `results on|off` flips `scopes.toolResults` through
the settings service / config editor (never direct State mutation; absent services → reports the
settings-UI path), and `scopes` is the read-only report of effective values.

**The new ledger lines (N > 0 only, byte-asserted by the smoke):**

```
hook-dsh-normalize-dash: overpass: normalized N char(s) in tool result <toolName> <callId>
hook-dsh-normalize-dash: overpass: normalized N char(s) in step batch (turn T step S)
```

**The patch-level global off.** The `scopes` shape is identical in every family hook, so one grouped
override in `cordis.patch.yml` turns the whole family off in one edit - live and silent:

```yaml
- id: hook-dsh-normalize-dash
  config:
      scopes:
          conversation: false
          reasoning: false
          toolInput: false
          toolResults: false
          files: false
          batch: false
```

# SCHEME.md — @playform/hook-dsh-normalize-dash (v0.1.0, TypeScript, function plugin)

Status: **IMPLEMENTED and VERIFIED** (`tsc --noEmit` zero errors; minified build; ≥22-check smoke
with a fake ctx + the REAL factory — ALL PASS).

## 0. What this plugin is

The dash normalizer for **model output**.

The file-hook precedent rewrites the unicode dash family to ASCII hyphen-minus **in files after the
fact**.

A DSH plugin can go where a file hook cannot: the **`llm/stream` waterfall** — the interceptable
wrapper around every streaming model call (retry, replay, routing), bound to the LlmRuntime
(`docs/subsystems/llm-streaming.md:1108-1125`).

The rewrite flows into both the live UI and the durable transcript — **the normalization is
deliberately VISIBLE** (it IS the feature), the opposite of the governance family's silence.

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
| 2E5D          | (Supplementary Punctuation hyphen — unnamed in older Unicode tables)       |
| 301C          | WAVE DASH                                                                  |
| 3030          | WAVY DASH                                                                  |
| 30A0          | KATAKANA-HIRAGANA DOUBLE HYPHEN                                            |
| FE31–FE32     | PRESENTATION FORM FOR VERTICAL EM DASH / EN DASH                           |
| FE58          | SMALL EM DASH                                                              |
| FE63          | SMALL HYPHEN-MINUS                                                         |
| FF0D          | FULLWIDTH HYPHEN-MINUS                                                     |

All → the config `replacement` (default `-`, ASCII hyphen-minus U+002D).

No context rules — none.

Whole-chunk single-character replacement is **chunk-boundary-safe**: no lookahead/lookbehind, no
multi-character sequences, so per-chunk application can never disagree with whole-text application.

The replacement uses a **function replacer**, so a custom `replacement` containing `$` patterns is
inserted literally.

The replaced characters are counted per stream for the ledger line.

## 2. The injection point — the llm/stream waterfall

```ts
ctx.on("llm/stream", (Request, Next) => {
	const Upstream = Next();
	return Normalize(Upstream, State);
});
```

- **`next()` is ALWAYS called**, unconditionally, first — omitting it short-circuits the waterfall
  and **the model call never happens** (docs/cordis-api/events.md:97-123;
  docs/user/develop/framework/events.md:64-81).
- **`options` (Request) is NEVER touched**: a LOOP-built request arrives **deep-frozen** (mutation
  throws) — listeners read it, never rewrite it (llm-streaming.md:1117-1122).
- One chunk in, one chunk out: **order preserved, no buffering**, upstream throws propagate (the
  LlmRuntime normalizes adapter failures; a thrown-away stream writes no ledger line).

Chunk handling:

| Chunk                              | Action                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text-delta`                       | rewrite `text` (always)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `reasoning-delta`                  | rewrite `text` when `normalizeReasoning` (default ON)                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `block-end`                        | rewrite assembled `TextBlock.text` / `ReasoningBlock.text` (+ runtime `thinking` string field, defensively) — the deltas AND the block must agree                                                                                                                                                                                                                                                                                                                                                                         |
| `tool-call-delta`                  | rewrite `argumentsDelta` when `normalizeToolArguments` (IMPLEMENTED, default OFF — execution-critical raw JSON; the assembled ToolCallBlock.arguments follows the same flag via `block-end`). With the flag on the gate is THREE-WAY: an `edit` call passes through BY IDENTITY (the `old_string` must match the real file bytes), and a call whose arguments open with the `{"__normalize":false` first-key marker passes through UNNORMALIZED with the marker entry stripped (the executed call carries no unknown key) |
| `block-start` / `usage` / `finish` | **passthrough by identity** (usage before finish, nothing after — the adapter contract)                                                                                                                                                                                                                                                                                                                                                                                                                                   |

With the flag on, the gate is **three-way**, not two-way:

1. **normalize** - the default: the `argumentsDelta` text and the assembled
   `ToolCallBlock.arguments` are rewritten by the same transform.
2. **edit-exempt** - a call whose tool `name` is `edit` passes through BY IDENTITY on every chunk
   and block: the edit tool's `old_string` must match the real file bytes, so a rewritten character
   inside an edit call would silently break every edit.
3. **raw-marked** - a call whose arguments JSON opens with the `{"__normalize":false` marker (the
   FIRST key; tracked per tool-call id by `Function/Normalize`, which passes `RawCall` into the
   dispatch) passes through UNNORMALIZED, and the marker entry itself is STRIPPED from the text
   (`{"__normalize":false,` → `{`; `{"__normalize":false}` → `{}`) so the executed call carries no
   unknown key (the harness's tools validate with `additionalProperties: false`). The strip is not
   counted by the ledger: marker removal is not normalization. A first delta shorter than the whole
   marker is the documented edge (the split text is invisible to the detection probe).

`normalizeToolArguments` is **IMPLEMENTED with the SCHEMA default OFF** (tool-call arguments are
execution-critical raw JSON; enabling it is the user's accepted risk — the example patch yml turns
it on).

## 3. Factory consumption (the second consumer, non-manifest module)

Consumes from `@playform/plugin-dsh-factory` (the service, via `inject: ["pluginFactory"]`):

| Method                                         | Use                                                                                                                                                |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `State(ctx, config, {module, fields})` (§2.10) | cell unwrap (volatile log/logFile/replacement), shared mappings `Ledger←logFile`/`Enabled←log`, module fields `Replacement`/`Reasoning`/`ToolArgs` |
| `Append(state, message)` (§2.1)                | the ledger: `hook-dsh-normalize-dash: activated (…)` and `hook-dsh-normalize-dash: normalized N dash char(s) in one stream`                        |

Not consumed, deliberately: `Wire` (§2.11 — fs/observed-hardwired; the normalize-dash implements its
own `ctx.on("llm/stream", …)` plain registration), `Attach` (§2.12 — no jobs/inflight/storage),
`Journal` (§2.13 — consumed: the P5 `normalized` record on every N > 0 pass), `Gate`/
`GuardedWrite`/`Refresh`/`Continue` (§2.6-2.9 — no fs/observed path).

This is the factory's **first NON-MANIFEST module** and its **second consumer**.

The chunk vocabulary (`StreamChunk`, `ContentBlock`, `GenerateOptions`) comes from
`@deepseek-ai/dsh-llm` (host-pinned devDep, type-only imports — erased at build, so the Target has
no runtime import of it).

## 4. The Config (the minimal shared block)

The schema is COMPOSED by the factory's STANDALONE helper (factory v0.1.1, P1 —
`Schema(shared?, module?)` as a module-level named export, the module-load use): the normalize-dash
passes `shared: false` — the MINIMAL shared block, ONLY the two universal volatile cells (`log`,
`logFile`).

The pre-v0.1.1 deviation (hand-defining the schema here, because the factory's Schema always emitted
the family's shared block — `updateCooldownMs`, `mutationTools`, `policyFile`, `exclude` —
fs/observed machinery the normalize-dash has none of) is gone: `shared: false` emits nothing the
module does not use.

The normalize-dash's own `logFile` default (its SEPARATE ledger) is supplied through its own fields,
which override the minimal block's.

The shape: `log` (bool, true, volatile), `logFile` (`~/.dsh/playform/hook-dsh-normalize-dash.log`,
volatile), `replacement` (`-`, volatile — the transform's only knob), `normalizeReasoning` (bool,
true), `normalizeToolArguments` (bool, false), `scopes` (object, volatile — the granular scope gates
of §7), `toolResultsExempt` (string array, volatile — the tool-results exemption list of §7). The
`scopes` object itself carries the volatile marker (its leaves stay plain — schemastery rejects
volatile leaves under an enclosing volatile field), so one leaf change commits one update whose
whole object the State's refresh listener re-reads.

## 5. Ledger lines (stable, asserted by the smoke)

```
hook-dsh-normalize-dash: activated (replacement=-, reasoning=on, toolArgs=off, logFile=~/.dsh/playform/hook-dsh-normalize-dash.log)
hook-dsh-normalize-dash: normalized 4 dash char(s) in one stream
```

Written only when N > 0; the count line follows a normal stream completion only. The overpass arms
add their own N > 0 lines (§7); the activation line NEVER changes for a volatile edit (observability
lives in the read-only `normalize-overpass scopes` report).

## 6. Interplay

- **The trio (fs/observed modules) and the factory**: pure additive — no shared event, no shared
  state, no conflict. The normalize-dash touches no files, so the fs/write-intent guard and the
  fs/observed observation never see it.
- **The LlmRuntime / other llm/stream listeners**: the normalize-dash wraps the downstream result
  and always calls `next()`, so it composes with other waterfall listeners regardless of
  registration order; it neither short-circuits nor yields its own chunks.
- **Chunk identity**: untouched chunks pass through by object identity; a rewritten delta/block is a
  shallow copy with only the text field replaced (the one exception: the raw-marker strip rewrites
  the arguments text while the count stays 0 - marker removal is not normalization).

## 7. The granular scopes, the overpass arms and the command (P10–P12)

**The scopes.** One `scopes` object (whole-object volatile) gates every arm of the hook
independently: `conversation` (text-delta text + the assembled text/reasoning blocks, default ON),
`reasoning` (the reasoning-delta sub-gate, ANDed with `normalizeReasoning`, default ON), `toolInput`
(the tool-call arguments arm, OR-ed with the deprecated `normalizeToolArguments` — the old field
keeps working, effective toolInput = field || scope — default OFF), `toolResults` (the
`tools/post-execute` arm, default OFF), `files` (inert in a stream flavor but present in the schema
so one patch override drives the whole family), `batch` (the `agent/pre-step` arm, default OFF).
Defaults are exactly the pre-scopes behavior. `toolResultsExempt` (volatile string array, default
`read, edit, raw-write, normalize-file, ccr_retrieve, subagent, ask_user_question`) passes a listed
tool result by identity. The factory's P10 `loader/volatile-update` listener refreshes `Scopes` /
`Exempt` / `Replacement` in place — no remount, no new activation line.

**The overpass arms.** Two additional listeners, both registered at apply and both opt-in (gated at
runtime on the scope cells, so flipping a scope lands through the volatile-refresh without any
re-registration):

- `tools/post-execute`, `{ prepend: true }` — OUTERMOST vs the ccr hook's own prepended gate (the
  family's bundle order places ccr before the normalize hooks, so the arm that prepends later
  compresses AFTER normalization; the `<<<CCR:` marker guard makes ANY load order safe). Accepted,
  non-value-carrying decisions only; the content basis is `decision.content ?? result.content`; TEXT
  blocks only (never tool-call/argument blocks); N = 0 is a true no-op; fail-open.
- `agent/pre-step`, default order — while `scopes.batch` is on every incoming batch is normalized;
  the command's one-shot arm (`State.Overpass`) fires once regardless of the scope value and is
  cleared after one use. Only an `enter` decision can be replaced; text blocks only; never the
  assistant/tool history; re-normalizing injected content across steps is harmless (the transforms
  are idempotent on their own output).

**The command.** `normalize-overpass` (registered through the probe-once `commands` Seam — silently
skipped when the service is absent): `files <path…>` is declined by a stream flavor (owned by
normalize-file), `batch` arms the one-shot flag, `results on|off` flips `scopes.toolResults` through
the settings service / config editor (never direct State mutation; absent services → reports the
settings-UI path), `scopes` is the read-only effective-values report.

**The new ledger lines (N > 0 only, byte-asserted by the smoke):**

```
hook-dsh-normalize-dash: overpass: normalized N char(s) in tool result <toolName> <callId>
hook-dsh-normalize-dash: overpass: normalized N char(s) in step batch (turn T step S)
```

**The patch-level global off.** The `scopes` shape is identical in every family hook, so one grouped
override in `cordis.patch.yml` turns the whole family off in one edit — live and silent:

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

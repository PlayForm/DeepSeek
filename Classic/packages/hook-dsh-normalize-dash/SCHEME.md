# SCHEME.md — @playform/hook-dsh-normalize-dash (v0.1.0, TypeScript, function plugin)

Status: **IMPLEMENTED and VERIFIED** (`tsc --noEmit` zero errors; minified build; ≥22-check smoke
with a fake ctx + the REAL factory — ALL PASS).

## 0. What this plugin is

The dash normalizer for **model output**. The user's hermes hook
(`~/.hermes/agent-hooks/normalize-dashes.sh`) rewrites the unicode dash family to ASCII hyphen-minus
**in files after the fact**. A DSH plugin can go where hermes cannot: the **`llm/stream` waterfall**
— the interceptable wrapper around every streaming model call (retry, replay, routing), bound to the
LlmRuntime (`docs/subsystems/llm-streaming.md:1108-1125`). The rewrite flows into both the live UI
and the durable transcript — **the normalization is deliberately VISIBLE** (it IS the feature), the
opposite of the governance family's silence.

## 1. The transform (exact hermes fidelity)

Per text segment, verbatim from the hermes hook's perl pattern:

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

All → the config `replacement` (default `-`, ASCII hyphen-minus U+002D). No context rules — hermes
has none. Whole-chunk single-character replacement is **chunk-boundary-safe**: no
lookahead/lookbehind, no multi-character sequences, so per-chunk application can never disagree with
whole-text application. The replacement uses a **function replacer**, so a custom `replacement`
containing `$` patterns is inserted literally. The replaced characters are counted per stream for
the ledger line.

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
`Journal` (§2.13 — governance domain; the normalize-dash logs via Append only), `Gate`/
`GuardedWrite`/`Refresh`/`Continue` (§2.6-2.9 — no fs/observed path). This is the factory's **first
NON-MANIFEST module** and its **second consumer**. The chunk vocabulary (`StreamChunk`,
`ContentBlock`, `GenerateOptions`) comes from `@deepseek-ai/dsh-llm` (host-pinned devDep, type-only
imports — erased at build, so the Target has no runtime import of it).

## 4. The Config (the minimal shared block)

The schema is COMPOSED by the factory's STANDALONE helper (factory v0.1.1, P1 —
`Schema(shared?, module?)` as a module-level named export, the module-load use): the normalize-dash
passes `shared: false` — the MINIMAL shared block, ONLY the two universal volatile cells (`log`,
`logFile`). The pre-v0.1.1 deviation (hand-defining the schema here, because the factory's Schema
always emitted the family's shared block — `updateCooldownMs`, `mutationTools`, `policyFile`,
`exclude` — fs/observed machinery the normalize-dash has none of) is gone: `shared: false` emits
nothing the module does not use. The normalize-dash's own `logFile` default (its SEPARATE ledger) is
supplied through its own fields, which override the minimal block's. The shape: `log` (bool, true,
volatile), `logFile` (`~/.dsh/hook-dsh-normalize-dash.log`, volatile), `replacement` (`-`, volatile
— the transform's only knob), `normalizeReasoning` (bool, true), `normalizeToolArguments` (bool,
false).

## 5. Ledger lines (stable, asserted by the smoke)

```
hook-dsh-normalize-dash: activated (replacement=-, reasoning=on, toolArgs=off, logFile=~/.dsh/hook-dsh-normalize-dash.log)
hook-dsh-normalize-dash: normalized 4 dash char(s) in one stream
```

Written only when N > 0; the count line follows a normal stream completion only.

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

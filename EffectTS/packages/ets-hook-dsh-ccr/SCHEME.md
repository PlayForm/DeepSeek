# SCHEME.md - @playform/ets-hook-dsh-ccr (v0.0.1, TypeScript, function plugin)

Status: **IMPLEMENTED and VERIFIED** (deterministic build zero errors; minified build;
`ccr-smoke.mjs` green - fake ctx + the REAL factory + the REAL built Target).

This is the **Effect-v4 variant** (`@playform/ets-hook-dsh-ccr`) of the CCR
hook: the identical contract, configuration surface and ccr_retrieve tool
behind the `@playform/ets-plugin-dsh-factory` shell (Effect v4), with the
**same ledger contract** - every string below is byte-identical with the
Boilerplate reference (`@playform/dsh-hook-ccr`) and the Classic sibling.

## 0. What this plugin is

The CCR hook (compress-cache-retrieve) for **tool output**. The file-hook
precedent rewrites files after the fact and the normalize family rewrites
model output; neither can shrink the model's CONTEXT: every agent turn floods
it with raw tool output. A DSH plugin can go where a proxy cannot: the
**`tools/post-execute` waterfall** - the interceptable wrapper around every
NORMALIZED dispatch result, bound to the ToolRuntime, before it becomes model
content ([docs/subsystems/tools.md §toolspost-execute--waterfall](https://github.com/deepseek-ai/deepseek-harness/tree/master/docs/subsystems/tools.md)).
Oversized results are replaced with a one-line type-aware preview plus a
retrieval marker; the original stays retrievable through the registered
`ccr_retrieve` tool. The compression is deliberately VISIBLE at the result
layer (it IS the feature), the opposite of the governance family's silence.

Source of truth: `Documentation/Plans/APHRODITE-TOOL-COMPRESSION-PLUGIN.md`
(the approved plan, sections 1-6) and
`Aphrodite/docs/research/2026-10-19-hermes-aphrodite-research.md` (R§n).

## 1. The injection point - the tools/post-execute waterfall

```ts
ctx.on("tools/post-execute", async (Exec, Result, Next) => {
	const Decision = await Next();            // ALWAYS awaited FIRST
	try {
		if (Decision.kind !== "accept" || Object.hasOwn(Decision, "value")) return Decision;
		const Content = Decision.content ?? Result.content;
		const Verdict = Compress(State, Exec.name, Result.isError, Content);
		switch (Verdict.action) {
			case "pass": return Decision;      // pass-through = the downstream decision
			case "store": { /* ledger + */ return Decision; }  // auto-expand
			default: return { kind: "accept", content: [preview + marker] };
		}
	} catch (Error) {
		warn(`ccr: ${Error}; keeping the inline content`);
		return Decision;                       // fail-open, never throw into the waterfall
	}
}, { prepend: true });
```

- **`next()` is ALWAYS awaited first** - omitting it short-circuits the
  downstream post-execute listeners (the spill-policy precedent, a live
  post-execute rewriter).
- **Pass-through is `return decision`** - byte-identical semantics: the
  decision the downstream listeners shaped.
- Only an **accepted, non-value-carrying** decision is replaced
  (`Object.hasOwn(decision, "value")` - a value-carrying decision is
  canonical; its union branch forbids `content`).
- **Fail-open**: the transform is one contained try/catch; on error the
  inline content is kept and a warning logged - never throw into the
  waterfall (a thrown listener would fail the tool result).
- `{ prepend: true }` - the gate runs before the other post-execute
  listeners, so it sees the pristine result.
- `exec.signal` needs no extra observation: the listener's own work is
  synchronous (classify, hash, map ops, the ledger append); the only await
  is `next()` itself.

## 2. The gate (plan §2)

| Step | Condition | Action |
| --- | --- | --- |
| 1 | empty content | pass (Aphrodite skips empty) |
| 2 | tool in `exempt` | pass, always |
| 3 | failure and `compressFailures` off | pass |
| 4 | tool not in `targets` | pass (the allow-list) |
| 5 | size ≤ `thresholdBytes` × multiplier | pass |
| 6a | over gate, `autoExpand` on, size ≤ `autoExpandLimitBytes` | **store** + return FULL content (no marker) |
| 6b | over gate, otherwise | **replace**: preview line + marker |

Size = UTF-8 byte length of `JSON.stringify(content)`. Multipliers (the
`multipliers` map, volatile): `terminal` 1, `error` 8, `grep` 2, `paths` 2,
`file` 1, `json` 1, `web` 2, `default` 1. Exempt: `write`, `edit`,
`raw-write`, `subagent`, `ask_user_question`, `ccr_retrieve`.

## 3. The classifier (the reduced 7-type set, plan §2.2)

1. `error` - a failure result (the ×8 tier), when failures are compressed;
2. name table: `bash` → `terminal`; `grep`, `search` → `grep`; `glob`,
   `list` → `paths`; `read` → `file`; `web_fetch`, `web_search` → `web`;
3. shape fallback for other gated names: joined text parsing as a JSON
   object/array → `json`; else `default`.

## 4. The previews (plan §4.2)

Pure per-type one-liners, hard-cut to `previewMaxChars` (default 240):

| Type | Preview |
| --- | --- |
| `terminal` | `exit <code> \| <N> lines \| <first significant line>` |
| `grep` | `<N matches> matches \| <first significant line>` |
| `paths` | `<N paths> paths \| <first path>` |
| `file` | `<N lines> lines \| <first significant line>` |
| `json` | `<N items> items` / `<N keys> keys` / `<N bytes> bytes` | `<first line>` |
| `web` | `<N lines> lines \| <first line>` |
| `error` | `<first significant line>` (the message IS the preview) |
| `default` | `<N bytes> bytes \| <first significant line>` |

The replacement content is ONE text block:

```
[<type>:<preview>]
<<<CCR:<24hex>|<type>|<size>>>
```

The marker is pure ASCII (digits, lowercase hex, letters, pipes) and passes
through the whole normalize family untouched; the model can re-read it from
its own transcript intact.

## 5. The store (plan §3)

In-memory LRU + TTL + optional JSONL journal - NOT the factory's storage
journal (that is a typed lifecycle ledger; MB-size BLOBs would corrupt the
governance domain's contract).

- **Hash**: SHA-256 (`node:crypto`) of the full serialized bytes, truncated
  to 24 lowercase hex chars (96 bits). Matched EXACTLY on retrieval - no
  prefix or fuzzy matching.
- **LRU**: `storeBudgetBytes` cap (default 268435456 = 256 MiB); the victim
  is the smallest `lastAccessed`; the just-inserted entry is never evicted
  (an oversized single entry may exceed the budget alone - its marker must
  stay retrievable).
- **TTL**: `ttlSeconds` (default 3600); an entry at or past `ttlAt` is
  dropped on insert (sweep) and on access (`gone: "expired"`).
- **Entry**: `{hash, type, size, content, createdAt, ttlAt, lastAccessed}` -
  `content` is a deep copy (the post-execute result is read-only and
  caller-owned).
- **Journal** (`journalPath`, default `""` = memory-only): one JSONL record
  `{hash, type, size, ttlAt, payload}` per store, payload = base64 of the
  content's JSON; loaded and TTL-compacted on boot (surviving records
  restored, the file rewritten). Plain-fs like the ledger append - the
  plugin's own diagnostic file, never a governed write; best-effort and
  contained (a journal failure degrades to memory-only).

## 6. The retrieval tool (plan §4.3)

`ccr_retrieve(hash, range?)` - one registered ToolDefinition
(`ToolRuntime.register`, the same injection the family's raw-write uses):

- success value: `{hash, type, size, text}`; `render` projects `text`
  verbatim (the model sees the original bytes, not an envelope); `text` is
  the original content's text blocks newline-joined;
- `range {start, count}`: a 0-based granular line slice (out-of-range bounds
  clamp; a retrieval never fails for asking past the end);
- unknown hash → self-describing error (re-run the original tool); expired
  hash → ditto, with the TTL reason; every hit refreshes `lastAccessed`
  (the LRU clock) and logs `retrieved <hash>`; every miss logs
  `retrieval miss <hash> (expired|unknown)`.

## 7. The ledger strings (the contract)

One log per module - `logFile` (default `~/.dsh/ccr.log`),
volatile. The strings are the module's OWN (the factory never owns them) and
asserted byte-identical by the smoke:

```
ccr: activated (bundle 0.0.1, targets 8, budget 268435456)
ccr: compressed <tool> <type> <bytes> -> <hash>
ccr: stored <tool> <type> <bytes> -> <hash>
ccr: evicted <hash> (budget)
ccr: evicted <hash> (ttl)
ccr: retrieved <hash>
ccr: retrieval miss <hash> (expired)
ccr: retrieval miss <hash> (unknown)
ccr: engine archived <n> results
```

The durable file lines are the `[ISO] message` forms (the factory's Append
layer adds the prefix and the timestamp - never the module).

## 8. Config (plan §5, verbatim)

`log`/`logFile` (volatile, the shared universal cells), `targets`,
`exempt`, `thresholdBytes` (volatile), `inlineThresholdBytes`,
`autoExpand`, `autoExpandLimitBytes`, `compressFailures`, `multipliers`
(volatile), `previewMaxChars` (volatile), `ttlSeconds`, `storeBudgetBytes`,
`journalPath`, `contextEngine` + `contextEngineThresholdPct` +
`protectFirstTurns` + `protectLastTurns` (phase 4: the context engine,
implemented and OFF by default - see §9; enabling it is config-only).
Composed via the factory's `Schema(false, {...})` - the NON-MANIFEST posture
(no fs/observed machinery advertised). `inlineThresholdBytes` is parsed but
inert under the default thresholds (1024 < 2048: anything at or below it
never reaches the gate) - it maps Aphrodite's `inline_threshold` and stays
in the schema for the store-shape parity.

## 9. The context engine (phase 4, feature-flagged OFF by default)

`contextEngine: true` adds ONE `agent/pre-step` waterfall listener and turns
the post-execute listener into an observer; `false` (the default) registers
NO pre-step listener and observes nothing - the engine is fully inert.

**The event (verified, not invented).** `agent/pre-step` is a real waterfall:
the harness's own shipped type (`@deepseek-ai/dsh-agent`
`lib/types/runtime-types.d.ts:304`, mirrored by
[docs/event-producer-consumer.md](https://github.com/deepseek-ai/deepseek-harness/tree/master/docs/event-producer-consumer.md)'s
`agent/pre-step` row - mode `waterfall`, produced by `agent-loop`) declares
`'agent/pre-step'(payload: { agent, messages, turn, step, signal }, next)`.
Listeners must call `next()`; the returned decision is authoritative. The
engine is a PURE OBSERVER: `next()` awaited first, the downstream decision
returned unchanged, fail-open on internal errors (a `warn`, never a throw
into the waterfall). No family precedent existed (grep of all three trees'
Sources and the live profile bundles, 2026-10-19) - this is the first such
listener, registered with default ordering.

**The decision math** (pure functions in `Function/Engine.ts`, driven
directly by the smoke):

- `ThresholdBytes(budget, pct)` - the fill limit: `pct`% of the **nominal
  budget**, which is the STORE's `storeBudgetBytes` (default 256 MiB; the
  plan's only byte-scale reference for "how full is full" - a dedicated
  constant would duplicate it). 30% of 268435456 = 80530636 bytes.
- `Eligible(records, currentTurn, protectFirst, protectLast)` - the MIDDLE
  records only: a record is eligible when its turn is past the first
  `protectFirstTurns` turns (protected head) and at or before
  `currentTurn − protectLastTurns` (protected tail window).
- `Decide(...)` - the per-pre-step verdict: threshold crossed AND middle
  records exist, else `undefined` (a deliberate no-op, including the
  crossing-with-no-middles case).

**The runtime.** Per-apply, built only when the flag is on
(`State.EngineRuntime`): a turn cursor plus an observation log. The
post-execute listener tags every non-empty result with the current turn and
either its CONTENT (a pass-through verdict - never stored, the archivable
kind) or its HASH (already stored by the gate - nothing to re-store). At the
next pre-step the decision runs; archived content records are pushed through
the EXISTING compress path (`Function/Compress` with the gate opened:
threshold 0, autoExpand off - same classify/exempt/targets rules, same store,
same TTL + LRU accounting, evictions onto the same ledger lines) and leave
the accumulator; hash records leave it directly. One aggregate ledger line
per archive event: `ccr: engine archived <n> results`.

**The documented limitation (the honest MVP).** Archiving here means "stored
+ tracked", NOT "removed from the model's context". The pre-step decision
contract covers only the newly claimed input messages
([docs/architecture.md](https://github.com/deepseek-ai/deepseek-harness/tree/master/docs/architecture.md):
"Listeners may rewrite or reject claimed messages"), not the history, so the
engine cannot legally rewrite past turns; the marker replacement into
history (Aphrodite's real context shrink, R:173-179) needs a history-rewrite
channel phase 4 does not have. What the engine delivers: the fill
accounting, the protect windows, and the store integration - every archived
result is retrievable via `ccr_retrieve` through the same compress path, and
the decision output is ready to drive a replacement channel when one exists.
Further documented approximations: turn numbers come from the pre-step
payload (`turn`, trusted when a finite number ≥ 1, else cursor+1); results
observed before any pre-step are tagged turn 1 and are head-protected under
the default `protectFirstTurns: 2` (they stay in the log and keep counting
toward the fill - they remain inline by definition); the accumulator is the
sum of the observed record sizes, and archiving subtracts the archived
bytes.

## 10. What this plugin does NOT do (phase scoping, plan §8)

The context engine is implemented but OFF by default (§9) - and its honest
MVP does not remove bytes from the model's context (see §9's limitation). No
proxy mode, no live containers (the post-execute point sees finalized results
only), no poll worker, no chain split, no Rhai, no TOML templates, no
centers. `tools/ptc-dispatch-log` (the durable PTC log copy) is not hooked -
PTC mode is a harness transport concern; the model-visible result is covered.
The `system-prompt/assemble` CCR-handling directive section (plan §4.3,
phase-4 optional item) remains unimplemented - a separate, later item.

## 11. The smoke (Boilerplate/smokes/ccr-smoke.mjs)

Fake ctx + REAL factory + REAL built Target; the plan §6 assertions:
under-threshold pass-through AND a compressed case (the vacuously-green
trap), oversized bash compression with exact marker bytes and round-trip
retrieval, auto-expand full-content pass, exempt identity, TTL + budget
eviction, byte-identical ledger strings, all 7 classifier types hitting
their multiplier gates, the journal round-trip plus the boot-compaction
edges (empty file, all-expired file, missing file), and the context engine:
flag-off inertness, the pure decision math (threshold, protect windows,
middle-only selection) and the flag-on end-to-end archive (decision
unchanged at post-execute, head/tail protection respected, the archive
storing through the real compress path and retrievable via `ccr_retrieve`).

# SCHEME.md - @playform/hook-dsh-ccr (v0.2.1, TypeScript, function plugin)

Status: **IMPLEMENTED and VERIFIED**, with a deterministic build of zero errors, a minified build,
and a green `ccr-smoke.mjs` that runs a fake ctx against the REAL factory and the REAL built Target.

## 0. What this plugin is

The CCR hook (compress-cache-retrieve) works on **tool output**.

The file-hook precedent rewrites files after the fact and the normalize family rewrites model
output, and neither can shrink the CONTEXT of the model, which every agent turn floods with raw tool
output.

A DSH plugin can go where a proxy cannot, through the **`tools/post-execute` waterfall**, which is
the interceptable wrapper around every NORMALIZED dispatch result, bound to the ToolRuntime and
running before the result becomes model content
([docs/subsystems/tools.md §toolspost-execute--waterfall](https://github.com/deepseek-ai/deepseek-harness/tree/master/docs/subsystems/tools.md)).

Oversized results are replaced with a one-line type-aware preview plus a retrieval marker, and the
original stays retrievable through the registered `ccr_retrieve` tool.

The compression is deliberately VISIBLE at the result layer, because it IS the feature, and that is
the opposite of the silence of the governance family.

The source of truth is `Documentation/Plans/APHRODITE-TOOL-COMPRESSION-PLUGIN.md`, the approved plan
in sections 1-6, and `Aphrodite/docs/research/2026-10-19-hermes-aphrodite-research.md` (R§n).

## 1. The injection point - the tools/post-execute waterfall

```ts
ctx.on(
	"tools/post-execute",
	async (Exec, Result, Next) => {
		const Decision = await Next(); // ALWAYS awaited FIRST
		try {
			if (Decision.kind !== "accept" || Object.hasOwn(Decision, "value")) return Decision;
			const Content = Decision.content ?? Result.content;
			const Verdict = Compress(State, Exec.name, Result.isError, Content);
			switch (Verdict.action) {
				case "pass":
					return Decision; // pass-through = the downstream decision
				case "store": {
					/* ledger + */ return Decision;
				} // auto-expand
				default:
					return { kind: "accept", content: [preview + marker] };
			}
		} catch (Error) {
			warn(`ccr: ${Error}; keeping the inline content`);
			return Decision; // fail-open, never throw into the waterfall
		}
	},
	{ prepend: true },
);
```

- **`next()` is ALWAYS awaited first**, because omitting it short-circuits the downstream
  post-execute listeners, which is the spill-policy precedent and a live post-execute rewriter.
- **Pass-through is `return decision`**, with byte-identical semantics for the decision that the
  downstream listeners shaped.
- Only an **accepted, non-value-carrying** decision is replaced, because
  `Object.hasOwn(decision, "value")` marks a value-carrying decision as canonical and its union
  branch forbids `content`.
- **Fail-open**: the transform is one contained try/catch, so on error the inline content is kept
  and a warning is logged, and the code never throws into the waterfall, because a thrown listener
  would fail the tool result.
- `{ prepend: true }` makes the gate run before the other post-execute listeners, so it sees the
  pristine result.
- `exec.signal` needs no extra observation, because the listener work is synchronous (classify,
  hash, map ops, the ledger append) and the only await is `next()` itself.

## 2. The gate (plan §2)

| Step | Condition                                                 | Action                                      |
| ---- | --------------------------------------------------------- | ------------------------------------------- |
| 1    | empty content                                             | pass (Aphrodite skips empty)                |
| 2    | tool in `exempt`                                          | pass, always                                |
| 3    | failure and `compressFailures` off                        | pass                                        |
| 4    | tool not in `targets`                                     | pass (the allow-list)                       |
| 5    | size ≤ `thresholdBytes` × multiplier                      | pass                                        |
| 6a   | over gate, `autoExpand` on, size ≤ `autoExpandLimitBytes` | **store** + return FULL content (no marker) |
| 6b   | over gate, otherwise                                      | **replace**: preview line + marker          |

Size is the UTF-8 byte length of `JSON.stringify(content)`.

The multipliers (the `multipliers` map, volatile) are `terminal` 1, `error` 8, `grep` 2, `paths` 2,
`file` 1, `json` 1, `web` 2, and `default` 1.

The exempt list is `write`, `edit`, `raw-write`, `subagent`, `ask_user_question`, and
`ccr_retrieve`.

## 3. The classifier (the reduced 7-type set, plan §2.2)

1. `error` covers a failure result in the ×8 tier, when failures are compressed;
2. the name table maps `bash` to `terminal`, `grep` and `search` to `grep`, `glob` and `list` to
   `paths`, `read` to `file`, and `web_fetch` and `web_search` to `web`;
3. the shape fallback covers other gated names, where joined text that parses as a JSON object or
   array becomes `json` and everything else becomes `default`.

## 4. The previews (plan §4.2)

The previews are pure per-type one-liners, hard-cut to `previewMaxChars`, which defaults to 240.

| Type       | Preview                                                 |
| ---------- | ------------------------------------------------------- |
| `terminal` | `exit <code> \| <N> lines \| <first significant line>`  |
| `grep`     | `<N matches> matches \| <first significant line>`       |
| `paths`    | `<N paths> paths \| <first path>`                       |
| `file`     | `<N lines> lines \| <first significant line>`           |
| `json`     | `<N items> items` / `<N keys> keys` / `<N bytes> bytes` | `<first line>` |
| `web`      | `<N lines> lines \| <first line>`                       |
| `error`    | `<first significant line>` (the message IS the preview) |
| `default`  | `<N bytes> bytes \| <first significant line>`           |

The replacement content is ONE text block:

```
[<type>:<preview>]
<<<CCR:<24hex>|<type>|<size>>>
```

The marker is pure ASCII (digits, lowercase hex, letters, pipes), so it passes through the whole
normalize family untouched and the model can re-read it from its own transcript intact.

## 5. The store (plan §3)

The store is an in-memory LRU with a TTL and an optional JSONL journal, and it is NOT the storage
journal of the factory, because that journal is a typed lifecycle ledger and MB-size BLOBs would
corrupt the contract of the governance domain.

- **Hash**: SHA-256 from `node:crypto` over the full serialized bytes, truncated to 24 lowercase hex
  chars (96 bits), and matched EXACTLY on retrieval with no prefix or fuzzy matching.
- **LRU**: the `storeBudgetBytes` cap defaults to 268435456, which is 256 MiB; the victim is the
  smallest `lastAccessed`, and the just-inserted entry is never evicted, because an oversized single
  entry may exceed the budget alone and its marker must stay retrievable.
- **TTL**: `ttlSeconds` defaults to 3600, and an entry at or past `ttlAt` is dropped on insert
  (sweep) and on access with `gone: "expired"`.
- **Entry**: `{hash, type, size, content, createdAt, ttlAt, lastAccessed}`, where `content` is a
  deep copy because the post-execute result is read-only and caller-owned.
- **Journal** (`journalPath`, default `""` for memory-only): one JSONL record
  `{hash, type, size, ttlAt, payload}` per store, with payload as the base64 of the content JSON,
  loaded and TTL-compacted on boot so surviving records are restored and the file is rewritten.
- The journal is plain-fs like the ledger append, it is the diagnostic file of the plugin and never
  a governed write, and it is best-effort and contained, so a journal failure degrades to
  memory-only.

## 6. The retrieval tool (plan §4.3)

`ccr_retrieve(hash, range?)` is one registered ToolDefinition through `ToolRuntime.register`, which
is the same injection that the raw-write of the family uses.

- The success value is `{hash, type, size, text}`, `render` projects `text` verbatim so the model
  sees the original bytes and not an envelope, and `text` is the text blocks of the original content
  newline-joined.
- `range {start, count}` is a 0-based granular line slice, out-of-range bounds clamp, and a
  retrieval never fails for asking past the end.
- An unknown hash gives a self-describing error that tells the reader to re-run the original tool,
  and an expired hash gives the same with the TTL reason.
- Every hit refreshes `lastAccessed`, which is the LRU clock, and logs `retrieved <hash>`, and every
  miss logs `retrieval miss <hash> (expired|unknown)`.

## 7. The ledger strings (the contract)

One log covers each module, at `logFile` (default `~/.dsh/playform/hook-dsh-ccr.log`), volatile.

The strings are the module's OWN, because the factory never owns them, and the smoke asserts them
byte-identical:

```
ccr: activated (bundle 0.2.1, targets 8, budget 268435456)
ccr: compressed <tool> <type> <bytes> -> <hash>
ccr: stored <tool> <type> <bytes> -> <hash>
ccr: evicted <hash> (budget)
ccr: evicted <hash> (ttl)
ccr: retrieved <hash>
ccr: retrieval miss <hash> (expired)
ccr: retrieval miss <hash> (unknown)
ccr: engine archived <n> results
```

The durable file lines are the `[ISO] message` forms, and the Append layer of the factory adds the
prefix and the timestamp, never the module.

## 8. Config (plan §5, verbatim)

The config holds `log`/`logFile` as the shared universal volatile cells, `targets`, `exempt`,
`thresholdBytes` (volatile), `inlineThresholdBytes`, `autoExpand`, `autoExpandLimitBytes`,
`compressFailures`, `multipliers` (volatile), `previewMaxChars` (volatile), `ttlSeconds`,
`storeBudgetBytes`, `journalPath`, and `contextEngine` with `contextEngineThresholdPct`,
`protectFirstTurns`, and `protectLastTurns` for phase 4, which is implemented and OFF by default in
§9, so enabling it is config-only.

It is composed through `Schema(false, {...})` of the factory, which is the NON-MANIFEST posture that
advertises no fs/observed machinery.

`inlineThresholdBytes` is parsed but inert under the default thresholds (1024 = 1024), so anything
at or below it never reaches the gate, and it maps `inline_threshold` of Aphrodite while it stays in
the schema for the store-shape parity.

## 9. The context engine (phase 4, feature-flagged OFF by default)

`contextEngine: true` adds ONE `agent/pre-step` waterfall listener and turns the post-execute
listener into an observer, while `false`, the default, registers NO pre-step listener and observes
nothing, so the engine is fully inert.

**The event (verified, not invented).**

`agent/pre-step` is a real waterfall: the shipped type of the harness (`@deepseek-ai/dsh-agent`
`lib/types/runtime-types.d.ts:304`, mirrored by the `agent/pre-step` row of
[docs/event-producer-consumer.md](https://github.com/deepseek-ai/deepseek-harness/tree/master/docs/event-producer-consumer.md),
with mode `waterfall` and produced by `agent-loop`) declares
`'agent/pre-step'(payload: { agent, messages, turn, step, signal }, next)`.

Listeners must call `next()`, and the returned decision is authoritative.

The engine is a PURE OBSERVER: `next()` is awaited first, the downstream decision is returned
unchanged, and internal errors fail open with a `warn` and never a throw into the waterfall.

No family precedent existed at the grep of all three trees' Sources and the live profile bundles on
2026-10-19, so this is the first such listener and it registers with default ordering.

**The decision math** (pure functions in `Function/Engine.ts`, driven directly by the smoke):

- `ThresholdBytes(budget, pct)` gives the fill limit as `pct`% of the **nominal budget**, which is
  the `storeBudgetBytes` of the STORE (default 256 MiB and the only byte-scale reference in the plan
  for "how full is full", because a dedicated constant would duplicate it); 30% of 268435456 is
  80530636 bytes.
- `Eligible(records, currentTurn, protectFirst, protectLast)` selects the MIDDLE records only, so a
  record is eligible when its turn is past the first `protectFirstTurns` turns of the protected head
  and at or before `currentTurn − protectLastTurns` of the protected tail window.
- `Decide(...)` gives the per-pre-step verdict, which is a threshold crossed AND middle records
  exist, and otherwise `undefined`, a deliberate no-op that includes the crossing-with-no-middles
  case.

**The runtime.**

It is built per-apply only when the flag is on (`State.EngineRuntime`) and holds a turn cursor plus
an observation log.

The post-execute listener tags every non-empty result with the current turn and either its CONTENT,
for a pass-through verdict that is never stored and is the archivable kind, or its HASH, which the
gate already stored so nothing is re-stored.

At the next pre-step the decision runs, archived content records are pushed through the EXISTING
compress path (`Function/Compress` with the gate opened to threshold 0 and autoExpand off, the same
classify/exempt/targets rules, the same store, the same TTL and LRU accounting, and evictions onto
the same ledger lines) and leave the accumulator, while hash records leave it directly.

One aggregate ledger line covers each archive event: `ccr: engine archived <n> results`.

**The documented limitation (the honest MVP).**

Archiving here means "stored and tracked", NOT "removed from the context of the model".

The pre-step decision contract covers only the newly claimed input messages
([docs/architecture.md](https://github.com/deepseek-ai/deepseek-harness/tree/master/docs/architecture.md):
"Listeners may rewrite or reject claimed messages") and not the history, so the engine cannot
legally rewrite past turns, and the marker replacement into history, which is the real context
shrink of Aphrodite (R:173-179), needs a history-rewrite channel that phase 4 does not have.

What the engine delivers is the fill accounting, the protect windows, and the store integration:
every archived result is retrievable via `ccr_retrieve` through the same compress path, and the
decision output is ready to drive a replacement channel when one exists.

Further documented approximations: turn numbers come from the pre-step payload `turn`, trusted when
it is a finite number ≥ 1 and otherwise cursor+1; results observed before any pre-step are tagged
turn 1 and are head-protected under the default `protectFirstTurns: 2`, so they stay in the log and
keep counting toward the fill because they remain inline by definition; and the accumulator is the
sum of the observed record sizes, with archiving subtracting the archived bytes.

## 10. What this plugin does NOT do (phase scoping, plan §8)

The context engine is implemented but OFF by default in §9, and its honest MVP does not remove bytes
from the context of the model, as the limitation of §9 states.

No proxy mode, no live containers (the post-execute point sees finalized results only), no poll
worker, no chain split, no Rhai, no TOML templates, and no centers.

`tools/ptc-dispatch-log`, the durable PTC log copy, is not hooked, because PTC mode is a transport
concern of the harness and the model-visible result is covered.

The `system-prompt/assemble` CCR-handling directive section (plan §4.3, a phase-4 optional item)
remains unimplemented as a separate and later item.

## 11. The smoke (Classic/smokes/ccr-smoke.mjs)

The smoke uses a fake ctx, the REAL factory, and the REAL built Target, and it asserts the plan §6
items.

Those items are the under-threshold pass-through AND a compressed case, which is the vacuously-green
trap, oversized bash compression with exact marker bytes and round-trip retrieval, the auto-expand
full-content pass, the exempt identity, TTL and budget eviction, byte-identical ledger strings, all
7 classifier types hitting their multiplier gates, the journal round-trip with the boot-compaction
edges (empty file, all-expired file, missing file), and the context engine: flag-off inertness, the
pure decision math (threshold, protect windows, middle-only selection), and the flag-on end-to-end
archive, where the decision stays unchanged at post-execute, the head and tail protection is
respected, and the archive stores through the real compress path and is retrievable via
`ccr_retrieve`.

The suite is the Boilerplate reference copied with ONLY the import paths
(`../packages/hook-dsh-ccr/...`, `../packages/plugin-dsh-factory/...`) and the identity-driven
activation version (`bundle 0.2.1`, the package convention of the Classic tree) changed, so every
other assertion is byte-identical.

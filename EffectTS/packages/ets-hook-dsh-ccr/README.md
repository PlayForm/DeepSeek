# @playform/ets-hook-dsh-ccr

The CCR hook (compress-cache-retrieve) for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)
plugin family - the **Effect-v4 variant** of the CCR hook (the identical
contract behind the `@playform/ets-plugin-dsh-factory` shell, with the same
byte-identical ledger contract). A DeepSeek Harness plugin that hooks the **`tools/post-execute`
waterfall** - the interceptable wrapper around every normalized dispatch
result, before it becomes model content - and replaces oversized tool output
with a one-line type-aware preview plus a retrieval marker:

```
[terminal:exit 0 | 142 lines | make: *** Error 1]
<<<CCR:9d3c1f0a7b2e4d5c6a8b9c0d|terminal|5231>>>
```

... while keeping the original retrievable through the registered
**`ccr_retrieve`** tool. Ported from Aphrodite's CCR pipeline
([research](../../Documentation/Plans/APHRODITE-TOOL-COMPRESSION-PLUGIN.md)):
compress, cache, retrieve - at the injection point a proxy cannot reach, the
tool result itself.

## Why

Every agent turn floods the context with raw tool output: `bash` runs, `grep`
matches, `read` slices, `web_fetch` pages, `glob` paths. Aphrodite intercepts
tool output before it reaches the LLM and replaces it with a ~15-token
preview plus a marker; this plugin ports that pipeline to the harness - not
the proxy. `tools/post-execute` sees the normalized result of EVERY tool with
name + parsed arguments + caller agent, and is the only point that can
legally replace model-visible output for all tools.

## The gate

Compress only results of tools in `targets` (default: `bash`, `glob`, `grep`,
`read`, `web_fetch`, `web_search`, `list`, `search`) whose serialized content
exceeds `thresholdBytes` (2048) × the classified type's multiplier - errors
×8 (high-signal, compress late), `grep`/`paths`/`web` ×2, the rest ×1. Never
compress the `exempt` tools: `write`, `edit`, `raw-write`, `subagent`,
`ask_user_question`, and `ccr_retrieve` itself. Failures pass through unless
`compressFailures` is on. With `autoExpand` on (the default), a result at or
under `autoExpandLimitBytes` (102400) is stored but returned FULL - no marker
reaches the model while the content is cheap enough to keep inline.

## The store

An in-memory LRU keyed by a sha256-24 hash of the full serialized content
bytes (`node:crypto`, no native deps), with a `storeBudgetBytes` budget
(default 256 MiB, least-recently-accessed eviction), a `ttlSeconds` TTL
(default 3600), and an optional JSONL disk journal (`journalPath`, default
`""` = memory-only): one `{hash, type, size, ttlAt, payload}` record per
store, loaded and TTL-compacted on boot, payload base64. SQLite (Aphrodite's
`ccr.db`) was deliberately adapted to JSONL - a native dep the family does
not carry.

## The retrieval

One registered tool: `ccr_retrieve(hash, range?)`. The hash is matched
exactly - no prefix or fuzzy matching. `range { start, count }` slices lines
granularly. Unknown/expired hashes return a self-describing error telling the
model to re-run the original tool.

## The waterfall discipline

`next()` is always awaited first; pass-through returns the downstream
decision unchanged; only an accepted, non-value-carrying decision is
replaced; the whole transform is fail-open (an internal error logs a warning
and keeps the inline content - never throws into the waterfall); the listener
prepends so the gate sees the pristine result. Verified against the harness
pipeline docs and the production spill-policy precedent. The ccr hook and the
normalize flavors' tool-results arm share the `tools/post-execute` waterfall;
the `<<<CCR:` marker guard makes any load order safe.

## Config

See [SCHEME.md](./SCHEME.md) for the full schema. Volatile (hot-editable,
no remount): `log`, `logFile`, `thresholdBytes`, `previewMaxChars`,
`multipliers`. Everything else remounts on edit.

## License

CC0-1.0.

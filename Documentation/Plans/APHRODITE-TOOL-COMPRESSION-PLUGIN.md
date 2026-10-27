---
title: Aphrodite Tool-Compression Plugin - the CCR adaptation plan
category: Plans
kind: queued-plan
date: 2026-10-19
status: planned
registry: Documentation/Plans/APHRODITE-TOOL-COMPRESSION-PLUGIN.md
index: Documentation/INDEX.md
statuses:
    - name: the ccr adaptation plan for Aphrodite
      state: open
      evidence: this document only - no implementation
    - name: the sibling precedent in this monorepo (hook-dsh-ccr)
      state: implemented
      evidence: Documentation/Archive/CCR/CCR-FAMILY-GAP-REPORT.md; the ccr live-proven
    - name: the open questions (section 10)
      state: open
      evidence: four questions listed, unresolved
---

# APHRODITE TOOL-COMPRESSION PLUGIN - the CCR adaptation plan (dedicated 2026-10-19)

> Source of truth: `Aphrodite/docs/research/2026-10-19-hermes-aphrodite-research.md`, cited below as
> **Rsectionn**. Target: the DeepSeek Harness Plugin Family monorepo (`Documentation/FRAMEWORK.md`,
> `Documentation/Plugins/PLUGIN-FAMILY.md`). Goal: bring the CCR pipeline of Aphrodite (compress,
> cache, and retrieve) to DSH agent loops as ONE new family hook bundle, per Rsection 0 and section
> 1 (R:7-33, 37-53).

## 0. The problem

EVERY DSH agent turn floods the context with raw tool output: `bash` runs, `grep` matches, `read`
file slices, `web_fetch` pages, and `glob` paths, which is the same problem that Aphrodite states
for Hermes (Rsection 1, R:40-44).

Aphrodite intercepts tool output before it reaches the LLM and replaces it with a ~15-token preview
plus a retrieval marker (Rsection 0, R:9-14).

We port that pipeline to the harness and NOT the proxy, because the proxy mode is a separate verdict
in section 8.

## 1. Where interception happens in DSH (the decision)

### 1.1 The extension points that actually exist (verified live, 2026-10-19)

The LIVE Host `Event` directory (cordis inspect `Event.listEvents`, this profile) declares these
tool-traffic waterfalls:

- `tools/pre-execute` - allow/deny/cancel/ask before dispatch (NOT our point).
- `tools/execute` - around-dispatch waterfall for timeout, retry, metrics. Wrappers may change ONLY
  `exec.signal`, call identity immutable.
- **`tools/post-execute`** - "Accept, replace, enrich, or block a normalized dispatch result"; a
  listener returns `PostToolDecision`: `{kind:'accept', content?: ContentBlock[]}` /
  `{kind:'accept', value: JsonValue}` / `{kind:'block', feedback}`. Scope-filtered per agent
  (`@deepseek-ai/dsh-scope`).
- `tools/result` - emit-only observation of the frozen final outcome (too late).
- `tools/ptc-dispatch-log` - ONLY the durable log copy of `run_code` sub-calls.

The precedent for hooking family plugins into harness machinery is the `llm/stream` waterfall
listener (normalize-dash: `Boilerplate/packages/dsh-hook-normalize-dash/Source/Library.ts:44-52`,
"CARD-BOUNDARY-SAFE ... one waterfall listener", bound to the LlmRuntime), and the retry plugin
executes "on the agent loop's recovery extension point"
(`~/.dsh/profiles/desktop/cordis.patch.yml:17-19`).

The `agent-loop` entry (`cordis.patch.yml:132-147`) is where loop agents are configured and NOT
where tool traffic flows.

Tool results flow through the ToolRuntime scheduler, and its normalized result passes
`tools/post-execute` before it becomes model content.

### 1.2 Recommendation: host-side `tools/post-execute` waterfall (option a)

**Primary mechanism: a host-side plugin that registers ONE `tools/post-execute` waterfall listener**
and REPLACES oversized results with preview and marker content blocks (the exact analog of
`transform_tool_result` in Aphrodite, Rsection 3, R:120-135 and `hooks.rs:317-426`).

The rationale:

1. It sees the normalized result of EVERY tool (bash, grep, read, glob, web_fetch, subagent) with
   name, parsed arguments, and caller agent, which is the full data that the gate of Aphrodite
   needs, and it can legally replace the content per the event contract above. NO other point can
   replace model-visible output for ALL tools.
2. It matches the plugin anatomy of the family: ONE waterfall listener, like the `llm/stream`
   listener of normalize-dash (SCHEME.md section 2, `dsh-hook-normalize-dash/SCHEME.md`).
3. Option (b), the client `tool.call.toolview` keyed slots, ONLY changes what the USER sees in the
   GUI. It cannot shrink the context of the model, so it is a complementary display nicety at most
   (deferred, section 8).
4. Option (c), wrapping the `Tool` registry (`ToolRuntime.register`), would require wrapping EVERY
   tool definition at agent setup and re-fusing signals, and `tools/execute` explicitly forbids
   result replacement. Registry-level work is needed ONLY to REGISTER the retrieval tool, which is
   separate (section 4.3).

## 2. What gets compressed (the gate, mapped from Aphrodite)

### 2.1 Targets

Rsection 3: bash/cargo/glob/grep/read are the big consumers.

The DSH equivalents, as the default `targets` allow-list: `bash`, `glob`, `grep`, `read`,
`web_fetch`, `web_search`, `list`, `search` (the terminal, search, and fetch family; the
`ToolCallKind` union of read/edit/delete/move/search/execute/fetch/other is the coarse fallback when
a name is unknown).

Exemptions mirror R:352-361: `write`, `edit`, `raw-write` (execution-critical, being mutating tools
and their own echo), the retrieval tool of the plugin itself, and `subagent`/`ask_user_question`
(NEVER compress the brief of another agent or a user gate).

### 2.2 Threshold mapping (Rsection 3 + Rsection 6, R:293-304)

| Aphrodite knob (R:293-298)                               | DSH knob (this plan)                               | Default   | Meaning                                                                                                           |
| -------------------------------------------------------- | -------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------- |
| `tool_threshold_token` 256 / `tool_threshold_cache` 2048 | `thresholdBytes`                                   | 2048      | ONE byte gate for ALL tools (DSH has NO cache/token proxy split)                                                  |
| `terminal_threshold` 256                                 | `terminalThresholdBytes`                           | 2048      | bash results; 256 was aggressive, DSH bash keeps parity with the general gate                                     |
| `inline_threshold` 1024                                  | `inlineThresholdBytes`                             | 1024      | results at/below this are inlined in the store and previewed fully                                                |
| `code_multiplier` 1.0                                    | `multipliers` map                                  | see below | per-type multiplier on the byte gate                                                                              |
| error x8 tier (R:213-135 -> R:134)                       | `multipliers.error: 8`                             | 8         | errors are high-signal, compress late                                                                             |
| diff/git/text x2                                         | `multipliers.diff: 2`, `multipliers.text: 2`       | 2         |                                                                                                                   |
| protect first/last (context engine, R:173-179)           | `protectFirstTurns: 2`, `protectLastTurns: 4`      | 2 / 4     | phase 4 (context engine), NOT the tool gate                                                                       |
| `auto_expand` / `auto_expand_limit` 102400 (R:181-186)   | `autoExpand: true`, `autoExpandLimitBytes: 102400` | true      | identical semantics: store + preview, but return full content while under the limit - NO marker reaches the model |
| TTL 3600 (R:167-168)                                     | `ttlSeconds: 3600`                                 | 3600      |                                                                                                                   |
| inline LRU 256 MB (R:109-111)                            | `storeBudgetBytes: 268435456`                      | 256 MiB   |                                                                                                                   |

Type tiers: a DSH classifier with a REDUCED set (NOT 30, section 8): `terminal` (bash), `grep`,
`paths` (glob/list), `file` (read), `json`, `web`, and `default`, which gives 7 types, EACH with a
one-line preview builder and a multiplier, seeded from the preview formats of Aphrodite (Rsection 3
step 2, R:105-106; for example `[build:1E 1W 142L | ...]` becomes
`[terminal:exit 0 | 142 lines | first error line]`).

## 3. The compression store

Aphrodite uses an inline LRU (<=256 MB) or the SQLite `ccr.db` (hash, original BLOB, TTL,
last_accessed) (Rsection 3, R:107-115; schema R:152-160).

Decision for DSH: **an in-memory LRU keyed by hash plus an optional JSONL disk journal, and NOT the
storage journal of the factory.**

- Hash: **SHA-256 (node:crypto), truncated to 24 hex chars**. BLAKE3 needs a wasm or native dep, and
  the family is zero-framework TypeScript (README.md:140-141) with `node:crypto` free. 24 hex (96
  bits) is collision-safe at the practical entry counts of the LRU and keeps markers short.
- The factory journal (`Boilerplate/packages/dsh-plugin-factory/Source/Function/Journal.ts:1-25`) is
  a typed LIFECYCLE ledger (activated/governed/dispatched with Event, Path, and Detail strings)
  routed through a shared sink with a 256-record pre-bind buffer. It is the wrong shape for MB-size
  BLOBs and for retrieval, so reusing it would corrupt the contract of the governance domain.
  Verdict: **keep the factory journal ONLY for the lifecycle and ledger lines of the plugin**
  (compressed-count, eviction, and retrieval counts, the "one log per module" convention of the
  family, normalize-dash `Variable/Config.ts:39-42`), and add a SEPARATE optional disk journal file
  that is off by default: JSONL with ONE record per entry
  `{hash, type, size, ttlAt, payload-base64}`, appended on store and compacted on boot past the TTL.
  This is `journalPath: ""` in the Config, and empty means memory-only (the inline mode of
  Aphrodite).
- LRU: a `storeBudgetBytes` cap (default 256 MiB), an insert-time TTL (`ttlSeconds`), `lastAccessed`
  refreshed on retrieval, and expired entries evicted (R:167-168).

## 4. The preview + marker + retrieval contract

### 4.1 Marker format

Aphrodite uses `<<<CCR:hash|type|size>>>` (R:116-118, R:139-146), and DSH uses:

```
<<<CCR:<24hex>|<type>|<size>>>
```

The shape stays byte-identical so the research vocabulary carries over, but:

- It is pure ASCII (digits, lowercase hex, letters, and pipes), so it passes through EVERY member of
  the normalize family of the harness untouched (the dash class rewrites ONLY unicode dashes to `-`,
  the quotes, ellipsis, and space classes NEVER touch ASCII pipes, and `normalize-file` normalizes
  existing files and NOT model output, `dsh-hook-normalize-dash/SCHEME.md` section 1). The model can
  also re-read the marker from its own transcript intact.
- The 24-hex hash is lowercase, and "no prefix or fuzzy matching" carries over (R:142-146).

### 4.2 Preview + replacement result

The replaced `tools/post-execute` decision returns `kind:'accept'` with content blocks shaped like
the JSON payload of Aphrodite (R:127-128):

```
[type:<preview>]  (the preview line)
<<<CCR:hash|type|size>>>
```

For `value`-carrying successes the listener emits the accepted decision with replaced `content`.

Failures (isError) pass through unless `compressFailures` is set, and ONLY the error x8 tier
benefits, so the default is true for `terminal` errors and false otherwise.

### 4.3 Retrieval

Aphrodite: the model calls `aphrodite_retrieve(hash)` (R:117-118, R:190-194).

DSH: **the plugin registers ONE dynamic tool at apply time**, `ccr_retrieve(hash)`, through the
`tools` service that the family already injects (normalize-dash uses the same injection to register
its raw-write tool, `Source/Library.ts:62-71`, and `ToolRuntime.register` accepts a `ToolDefinition`
per the LIVE contract).

That is ONE tool, ONE hash parameter, and an optional `range` (start, count lines) for granular
retrieval (R:199-203: prefer granular and batch retrievals).

Retrievals over expired or unknown hashes return a self-describing error that tells the model the
entry is gone (re-run the tool), with NO prefix matching.

The directive doc becomes a small system-prompt section that the plugin can append through the
`system-prompt/assemble` waterfall (LIVE Event directory), an optional phase 4 item that mirrors
`ccr-handling.md` of Aphrodite (Rsection 3, R:199-203).

## 5. Config schema (Schemastery, family conventions)

Composed with the `Schema(shared?, module?)` helper of the factory with `shared: false` (ONLY the
`log`/`logFile` volatile cells), which is the exact pattern of
`dsh-hook-normalize-dash/Source/Variable/Config.ts:35-57`.

All knobs:

```ts
Schema(false, {
	logFile: Schema.string().default("/Users/nikola/.dsh/ccr.log").volatile(),
	targets: Schema.array(String).default([
		"bash",
		"glob",
		"grep",
		"read",
		"web_fetch",
		"web_search",
		"list",
		"search",
	]),
	exempt: Schema.array(String).default([
		"write",
		"edit",
		"raw-write",
		"subagent",
		"ask_user_question",
		"ccr_retrieve",
	]),
	thresholdBytes: Schema.number().default(2048),
	inlineThresholdBytes: Schema.number().default(1024),
	autoExpand: Schema.boolean().default(true),
	autoExpandLimitBytes: Schema.number().default(102400),
	compressFailures: Schema.boolean().default(false),
	multipliers: Schema.object({
		terminal: Schema.number().default(1),
		error: Schema.number().default(8),
		grep: Schema.number().default(2),
		paths: Schema.number().default(2),
		file: Schema.number().default(1),
		json: Schema.number().default(1),
		web: Schema.number().default(2),
		default: Schema.number().default(1),
	}),
	previewMaxChars: Schema.number().default(240),
	ttlSeconds: Schema.number().default(3600),
	storeBudgetBytes: Schema.number().default(268435456),
	journalPath: Schema.string().default(""), // "" = memory-only
	contextEngine: Schema.boolean().default(false), // phase 4
	contextEngineThresholdPct: Schema.number().default(30),
	protectFirstTurns: Schema.number().default(2),
	protectLastTurns: Schema.number().default(4),
});
```

Volatile (hot-edit, NO remount): `logFile`, `previewMaxChars`, `thresholdBytes`, and `multipliers`,
which matches the hot-reload thresholds of Aphrodite (R:293-296).

Structural knobs (targets, store, and journal) remount.

## 6. Bundle layout

New family member (Boilerplate, then Classic/EffectTS later): **`dsh-hook-ccr`** (published as
`@playform/dsh-hook-ccr`, loader id `ccr`), which mirrors the anatomy of `dsh-hook-normalize-dash`:

```
dsh-hook-ccr/
  package.json  cordis.patch.yml  tsconfig.json  README.md  SCHEME.md
  Source/
    Library.ts          // name:"ccr", apply, Config, inject - the loader contract
    Function/
      Apply.ts          // listener + tool registration + wiring
      Classify.ts       // the 7-type classifier + multipliers
      Preview.ts        // per-type preview builders
      Compress.ts       // the gate: thresholds, exemptions, auto-expand
      Store.ts          // LRU + TTL + optional JSONL journal
      Hash.ts           // sha256-24
      Marker.ts         // parse/format  <<<CCR:h|t|s>>>
      Retrieve.ts       // ccr_retrieve tool body (+ range)
  Interface/Config.ts Interface/State.ts Interface/Entry.ts
  Variable/Config.ts    // the Schemastery schema (section 5)
```

`cordis.patch.yml` follows the bundle-patch pattern
(`dsh-hook-normalize-dash/cordis.patch.yml:32-40`): `insert:` with id `ccr`, name
`@playform/dsh-hook-ccr`, and the section 5 config.

### Smoke suite plan (`Classic/smokes/ccr-smoke.mjs`)

The family discipline (`Classic/smokes/README.md:1-14`): the smoke loads the REAL built
`Target/Library.js`, instantiates the REAL factory against a fake ctx, and EVERY ledger string stays
byte-identical, with zero changes to the twelve existing suites because coverage is additive.

The `ccr-smoke` must prove:

1. under-threshold results pass through byte-identical (the vacuously-green trap: assert the
   pass-through AND a compressed case, NEVER only ONE);
2. an oversized `bash` result compresses to a preview line plus the correct marker bytes, and the
   original is retrievable through `ccr_retrieve` (round-trip);
3. auto-expand: content under `autoExpandLimitBytes` returns FULL content and no marker;
4. exempt tools pass through (write/edit/raw-write identity);
5. TTL expiry evicts and retrieval reports gone, and LRU eviction happens at the budget;
6. ledger strings stay byte-identical (`ccr: activated (...)`, plus the per-compress lines);
7. all 7 classifier types hit their multiplier gates.

## 7. Implementation phases

Build command per phase (deterministic and workspace serialized; README.md:38-45):

```
cd <tree>/packages/dsh-hook-ccr
pnpm install --ignore-scripts
pnpm run prepublishOnly   # Build 'Source/**/*.ts' --ESBuild
                          # Configuration/ESBuild.ts --TypeScript
                          # Configuration/TypeScript.noemit.json
                          # && tsc -p tsconfig.json && tsc-alias -f -p tsconfig.json
node ../../smokes/ccr-smoke.mjs        # from Classic/smokes/
pnpm run test --workspace-concurrency=1   # all smokes, the arbiter
```

1. **Skeleton + config** - the bundle layout, Library.ts, Variable/Config.ts, Interface/, and an
   `apply` that logs the activation ledger line, with NO interception. Files: package.json,
   cordis.patch.yml, Source/Library.ts, Variable/Config.ts, Interface/*. Arbiter: the build plus
   `node Classic/smokes/ccr-smoke.mjs` (activation and schema-default assertions). Accept: zero
   build errors, a green smoke, and ALL 12 existing suites untouched and green.
2. **The gate + classifier + store** - Classify/Preview/Hash/Store/Compress, the
   `tools/post-execute` listener registered in Apply, and LRU + TTL with NO journal. Arbiter: the
   build plus ccr-smoke assertions 1, 2, 4, 5, and 7. Accept: oversized results compress with
   byte-exact markers, and under-threshold and exempt results pass through byte-identical.
3. **Retrieval tool + auto-expand** - Retrieve.ts, the `ccr_retrieve` registration, the auto-expand
   path, the granular `range`, and the ledger retrieval counts. Arbiter: the build plus ccr-smoke
   assertion 3 and the round-trip. Accept: the model-visible marker retrieves the original bytes,
   and NO marker appears under the autoExpand limit.
4. **Disk journal + context engine (optional per config)** - the JSONL journal (`journalPath`) and
   boot compaction, plus middle-turn archiving next to `agent/pre-step` under `contextEngine`
   (protectFirst/last per R:173-179) behind a feature flag that is off by default. Arbiter: the
   build plus the ccr-smoke journal round-trip and the existing suites. Accept: the journal survives
   a fake restart (re-instantiate the store from the file) and the TTL compaction is proven.
5. **Profile wiring + LIVE verification** - add the plugin to the package.json bundles and
   cordis.patch.yml of the desktop profile, restart, and verify the activation ledger line and ONE
   LIVE compressed bash result. Accept: the ledger shows `ccr: activated (...)`, the transcript
   shows a preview plus marker for a >2048 byte tool result, and `ccr_retrieve` works in the LIVE
   loop.

Phases 1-3 are the MVP, and 4-5 complete it.

The EffectTS sibling (`ets-hook-dsh-ccr`) is a separate later item per the SPLICE-ETS pattern
(Documentation/Archive/Split/SPLICE-ETS.md).

## 8. Feature scoping table (Rsection 3/section 4/section 6)

| Aphrodite feature                      | Verdict | One line                                                                                     |
| -------------------------------------- | ------- | -------------------------------------------------------------------------------------------- |
| Tool-output compression (CCR core)     | PORT    | the whole point: gate -> classify -> hash -> store -> preview + marker                       |
| Auto-expand                            | PORT    | identical semantics, cheap once the store exists (R:181-186)                                 |
| 30-type classifier                     | ADAPT   | 7 DSH types (section 2.2) - the 30-type taxonomy is proxy-shaped                             |
| Threshold tiers + multipliers          | ADAPT   | error x8 etc. carried into the `multipliers` map                                             |
| Inline LRU store                       | PORT    | memory LRU with budget cap                                                                   |
| SQLite ccr.db                          | ADAPT   | JSONL disk journal instead; SQLite is a native dep the family does NOT carry                 |
| Retrieval tool                         | ADAPT   | `ccr_retrieve` as ONE registered ToolDefinition (Aphrodite's 13 relays -> 1)                 |
| Directives                             | ADAPT   | a `system-prompt/assemble` CCR-handling section, phase 4                                     |
| Context engine (middle-turn archiving) | ADAPT   | `agent/pre-step`-adjacent, feature-flagged, phase 4                                          |
| Proxy mode (:9797/:9798)               | SKIP    | DSH is NOT an OpenAI-compatible relay; interception at the runtime is strictly better placed |
| Live containers (progressive markers)  | DEFER   | requires streaming tool results; the post-execute point sees finalized results ONLY          |
| Poll worker (auto-backgrounding)       | DEFER   | needs scheduler integration beyond post-execute                                              |
| Chain split                            | SKIP    | command splitting is Hermes shell-specific                                                   |
| Rhai scripting                         | SKIP    | NO scripting runtime in the family                                                           |
| Metrics/health/stats                   | ADAPT   | ledger lines carry compressed/evicted/retrieved counts (family convention)                   |
| TOML templates                         | SKIP    | the DSH Config schema replaces TOML; NO template engine                                      |
| Centers                                | SKIP    | v1-only in Aphrodite, roadmap elsewhere (R:233-235)                                          |
| Flow budget / injected context         | DEFER   | ONLY if the context engine lands (phase 4)                                                   |
| Prefetch                               | DEFER   | low value while compression already caps the flood                                           |

## 9. Acceptance (the whole plugin)

- Build: the deterministic three-step build is zero-error on EVERY touched tree.
- Smokes: `node Classic/smokes/ccr-smoke.mjs` is green with byte-identical ledger assertions, the
  twelve existing suites stay unchanged and green, and `pnpm run test --workspace-concurrency=1` is
  green overall.
- LIVE: the activation line appears in `~/.dsh/playform/hook-dsh-ccr.log`, a >2048-byte bash result
  renders as a preview plus marker in the transcript, retrieval restores the bytes, and exempt tools
  stay untouched.
- Git: read-only checks ONLY, so the deliverable is reported READY-TO-COMMIT (routing law,
  `session-orientation` section 3).

## 10. Open questions

1. Does the `tools/post-execute` replacement update the GUI card views (`presentResult`) or ONLY the
   model-visible content? If the cards show stale originals, a `tool.call.toolview` client slot
   (option b) is the display fix.
2. Should `read` be compressed at ALL in phase 3 when its result carries line numbers that the model
   already navigated, since compressing a `read` can break the `old_string` context of a later edit?
   The default is yes (hash of the full content, and retrieval restores it), but the pilot should
   confirm NO edit-failure regression.
3. Does the JSONL journal want rotation or capping (file growth at a 256 MiB budget with TTL churn),
   or is boot compaction enough?
4. The result of the `subagent` tool often embeds the full report of a child, so should it be
   compressed? It is the single largest consumer in orchestrator sessions, and it is currently
   exempt (section 2.1), so review it after LIVE data.

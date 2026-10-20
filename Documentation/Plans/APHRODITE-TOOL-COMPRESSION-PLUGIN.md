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

> Source of truth: `Aphrodite/docs/research/2026-10-19-hermes-aphrodite-research.md`
> (cited below as **R§n**). Target: the DeepSeek Harness Plugin Family monorepo
> (`Documentation/FRAMEWORK.md`, `Documentation/Plugins/PLUGIN-FAMILY.md`).
> Goal: bring Aphrodite's CCR pipeline - compress, cache, retrieve - to DSH agent
> loops as one new family hook bundle, R§0/§1 (R:7-33, 37-53).

## 0. The problem

Every DSH agent turn floods the context with raw tool output: `bash` runs,
`grep` matches, `read` file slices, `web_fetch` pages, `glob` paths - the same
problem Aphrodite states for Hermes (R§1, R:40-44). Aphrodite intercepts tool
output before it reaches the LLM and replaces it with a ~15-token preview plus a
retrieval marker (R§0, R:9-14); we port that pipeline to the harness, not the
proxy (the proxy mode is a separate verdict, §8).

## 1. Where interception happens in DSH (the decision)

### 1.1 The extension points that actually exist (verified live, 2026-10-19)

The live Host `Event` directory (cordis inspect `Event.listEvents`, this
profile) declares these tool-traffic waterfalls:

- `tools/pre-execute` - allow/deny/cancel/ask before dispatch (not our point).
- `tools/execute` - around-dispatch waterfall for timeout, retry, metrics;
  wrappers may change only `exec.signal`, call identity immutable.
- **`tools/post-execute`** - "Accept, replace, enrich, or block a normalized
  dispatch result"; a listener returns `PostToolDecision`: `{kind:'accept',
  content?: ContentBlock[]}` / `{kind:'accept', value: JsonValue}` /
  `{kind:'block', feedback}`. Scope-filtered per agent (`@deepseek-ai/dsh-scope`).
- `tools/result` - emit-only observation of the frozen final outcome (too late).
- `tools/ptc-dispatch-log` - only the durable log copy of `run_code` sub-calls.

The precedent for hooking family plugins into harness machinery is the
`llm/stream` waterfall listener (normalize-dash: `Boilerplate/packages/dsh-hook-normalize-dash/Source/Library.ts:44-52`,
"CARD-BOUNDARY-SAFE ... one waterfall listener", bound to the LlmRuntime), and
the retry plugin executes "on the agent loop's recovery extension point"
(`~/.dsh/profiles/desktop/cordis.patch.yml:17-19`). The `agent-loop` entry
(`cordis.patch.yml:132-147`) is where loop agents are configured, not where tool
traffic flows - tool results flow through the ToolRuntime scheduler, and its
normalized result passes `tools/post-execute` before it becomes model content.

### 1.2 Recommendation: host-side `tools/post-execute` waterfall (option a)

**Primary mechanism: a host-side plugin that registers one `tools/post-execute`
waterfall listener** and REPLACES oversized results with preview + marker
content blocks (the exact analog of Aphrodite's `transform_tool_result`,
R§3, R:120-135 and `hooks.rs:317-426`). Rationale:

1. It sees the normalized result of EVERY tool (bash, grep, read, glob,
   web_fetch, subagent) with name + parsed arguments + caller agent - the full
   data Aphrodite's gate needs - and can legally replace the content, per the
   event contract above. No other point can replace model-visible output for
   all tools.
2. It matches the family's plugin anatomy: one waterfall listener, like
   normalize-dash's `llm/stream` listener (SCHEME.md §2,
   `dsh-hook-normalize-dash/SCHEME.md`).
3. Option (b) - the client `tool.call.toolview` keyed slots - only changes what
   the USER sees in the GUI; it cannot shrink the model's context, so it is a
   complementary display nicety at most (deferred, §8).
4. Option (c) - wrapping the `Tool` registry (`ToolRuntime.register`) would
   require wrapping every tool definition at agent setup and re-fusing signals;
   `tools/execute` explicitly forbids result replacement. Registry-level work
   is needed only to REGISTER the retrieval tool, which is separate (§4.3).

## 2. What gets compressed (the gate, mapped from Aphrodite)

### 2.1 Targets

R§3: bash/cargo/glob/grep/read are the big consumers. DSH equivalents, default
`targets` allow-list: `bash`, `glob`, `grep`, `read`, `web_fetch`,
`web_search`, `list`, `search` (the terminal/search/fetch family; the
`ToolCallKind` union - read/edit/delete/move/search/execute/fetch/other - is the
coarse fallback when a name is unknown). Exemptions mirror R:352-361:
`write`, `edit`, `raw-write` (execution-critical; mutating tools and their own
echo), the plugin's own retrieval tool, and `subagent`/`ask_user_question`
(never compress another agent's brief or a user gate).

### 2.2 Threshold mapping (R§3 + R§6, R:293-304)

| Aphrodite knob (R:293-298) | DSH knob (this plan) | Default | Meaning |
| --- | --- | --- | --- |
| `tool_threshold_token` 256 / `tool_threshold_cache` 2048 | `thresholdBytes` | 2048 | one byte gate for all tools (DSH has no cache/token proxy split) |
| `terminal_threshold` 256 | `terminalThresholdBytes` | 2048 | bash results; 256 was aggressive, DSH bash keeps parity with the general gate |
| `inline_threshold` 1024 | `inlineThresholdBytes` | 1024 | results at/below this are inlined in the store and previewed fully |
| `code_multiplier` 1.0 | `multipliers` map | see below | per-type multiplier on the byte gate |
| error ×8 tier (R:213-135 → R:134) | `multipliers.error: 8` | 8 | errors are high-signal, compress late |
| diff/git/text ×2 | `multipliers.diff: 2`, `multipliers.text: 2` | 2 | |
| protect first/last (context engine, R:173-179) | `protectFirstTurns: 2`, `protectLastTurns: 4` | 2 / 4 | phase 4 (context engine), not the tool gate |
| `auto_expand` / `auto_expand_limit` 102400 (R:181-186) | `autoExpand: true`, `autoExpandLimitBytes: 102400` | true | identical semantics: store + preview, but return full content while under the limit - no marker reaches the model |
| TTL 3600 (R:167-168) | `ttlSeconds: 3600` | 3600 | |
| inline LRU 256 MB (R:109-111) | `storeBudgetBytes: 268435456` | 256 MiB | |

Type tiers: a DSH classifier with a REDUCED set (not 30, §8): `terminal`
(bash), `grep`, `paths` (glob/list), `file` (read), `json`, `web`, `default` -
7 types, each with a one-line preview builder and a multiplier, seeded from
Aphrodite's preview formats (R§3 step 2, R:105-106; e.g.
`[build:1E 1W 142L | ...]` becomes `[terminal:exit 0 | 142 lines | first
error line]`).

## 3. The compression store

Aphrodite: inline LRU (<=256 MB) or SQLite `ccr.db` (hash, original BLOB, TTL,
last_accessed) (R§3, R:107-115; schema R:152-160).

Decision for DSH: **in-memory LRU keyed by hash + optional JSONL disk journal,
NOT the factory's storage journal.**

- Hash: **SHA-256 (node:crypto), truncated to 24 hex chars**. BLAKE3 needs a
  wasm/native dep - the family is zero-framework TypeScript (README.md:140-141)
  and `node:crypto` is free; 24 hex (96 bits) is collision-safe at the LRU's
  practical entry counts and keeps markers short.
- The factory's journal (`Boilerplate/packages/dsh-plugin-factory/Source/Function/Journal.ts:1-25`)
  is a typed LIFECYCLE ledger (activated/governed/dispatched - Event, Path,
  Detail strings) routed through a shared sink with a 256-record pre-bind
  buffer. It is the wrong shape for MB-size BLOBs and for retrieval; reusing it
  would corrupt the governance domain's contract. Verdict: **keep the factory
  journal only for the plugin's lifecycle/ledger lines** (compressed-count,
  eviction, retrieval counts - the family's "one log per module" convention,
  normalize-dash `Variable/Config.ts:39-42`), and add a SEPARATE optional disk
  journal file (default off): JSONL, one record per entry
  `{hash, type, size, ttlAt, payload-base64}`, appended on store, compacted on
  boot past TTL. This is `journalPath: ""` in the Config; empty = memory-only
  (Aphrodite's inline mode).
- LRU: `storeBudgetBytes` cap (default 256 MiB), insert-time TTL
  (`ttlSeconds`), `lastAccessed` refreshed on retrieval, expired entries evicted
  (R:167-168).

## 4. The preview + marker + retrieval contract

### 4.1 Marker format

Aphrodite: `<<<CCR:hash|type|size>>>` (R:116-118, R:139-146). DSH:

```
<<<CCR:<24hex>|<type>|<size>>>
```

Kept byte-identical in shape so the research vocabulary carries over, but:

- Pure ASCII (digits, lowercase hex, letters, pipes) - it passes through every
  member of the harness's normalize family untouched (the dash class rewrites
  only unicode dashes to `-`; the quotes/ellipsis/space classes never touch
  ASCII pipes; `normalize-file` normalizes existing files, not model output -
  `dsh-hook-normalize-dash/SCHEME.md` §1). The model can also re-read the
  marker from its own transcript intact.
- The 24-hex hash is lowercase; "no prefix or fuzzy matching" carries over
  (R:142-146).

### 4.2 Preview + replacement result

The replaced `tools/post-execute` decision returns `kind:'accept'` with content
blocks shaped like Aphrodite's JSON payload (R:127-128):

```
[type:<preview>]  (the preview line)
<<<CCR:hash|type|size>>>
```

For `value`-carrying successes the listener emits the accepted decision with
replaced `content`; failures (isError) pass through unless `compressFailures`
(only the error ×8 tier benefits - default true for `terminal` errors, false
otherwise).

### 4.3 Retrieval

Aphrodite: the model calls `aphrodite_retrieve(hash)` (R:117-118, R:190-194).
DSH: **the plugin registers one dynamic tool at apply time** -
`ccr_retrieve(hash)` - through the `tools` service the family already injects
(the normalize-dash uses the same injection to register its raw-write tool,
`Source/Library.ts:62-71`; `ToolRuntime.register` accepts a `ToolDefinition`
per the live contract). One tool, one hash parameter, optional `range`
(start,count lines) for granular retrieval (R:199-203: prefer granular,
batch retrievals). Retrievals over expired/unknown hashes return a
self-describing error telling the model the entry is gone (re-run the tool) -
no prefix matching.

The directive doc becomes a small system-prompt section the plugin can append
via the `system-prompt/assemble` waterfall (live Event directory) - phase 4
optional item, mirroring Aphrodite's `ccr-handling.md` (R§3, R:199-203).

## 5. Config schema (Schemastery, family conventions)

Composed with the factory's `Schema(shared?, module?)` helper with `shared:
false` (only `log`/`logFile` volatile cells) - the exact pattern of
`dsh-hook-normalize-dash/Source/Variable/Config.ts:35-57`. All knobs:

```ts
Schema(false, {
  logFile: Schema.string().default("/Users/nikola/.dsh/ccr.log").volatile(),
  targets: Schema.array(String).default([
    "bash","glob","grep","read","web_fetch","web_search","list","search"]),
  exempt: Schema.array(String).default(["write","edit","raw-write","subagent",
    "ask_user_question","ccr_retrieve"]),
  thresholdBytes: Schema.number().default(2048),
  inlineThresholdBytes: Schema.number().default(1024),
  autoExpand: Schema.boolean().default(true),
  autoExpandLimitBytes: Schema.number().default(102400),
  compressFailures: Schema.boolean().default(false),
  multipliers: Schema.object({
    terminal: Schema.number().default(1), error: Schema.number().default(8),
    grep: Schema.number().default(2), paths: Schema.number().default(2),
    file: Schema.number().default(1), json: Schema.number().default(1),
    web: Schema.number().default(2), default: Schema.number().default(1),
  }),
  previewMaxChars: Schema.number().default(240),
  ttlSeconds: Schema.number().default(3600),
  storeBudgetBytes: Schema.number().default(268435456),
  journalPath: Schema.string().default(""),          // "" = memory-only
  contextEngine: Schema.boolean().default(false),    // phase 4
  contextEngineThresholdPct: Schema.number().default(30),
  protectFirstTurns: Schema.number().default(2),
  protectLastTurns: Schema.number().default(4),
})
```

Volatile (hot-edit, no remount): `logFile`, `previewMaxChars`,
`thresholdBytes`, `multipliers` - matching Aphrodite's hot-reload thresholds
(R:293-296). Structural knobs (targets, store, journal) remount.

## 6. Bundle layout

New family member (Boilerplate → Classic/EffectTS later): **`dsh-hook-ccr`**
(published `@playform/dsh-hook-ccr`, loader id `ccr`), mirroring
`dsh-hook-normalize-dash` anatomy:

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
  Variable/Config.ts    // the Schemastery schema (§5)
```

`cordis.patch.yml` follows the bundle-patch pattern
(`dsh-hook-normalize-dash/cordis.patch.yml:32-40`): `insert:` with id `ccr`,
name `@playform/dsh-hook-ccr`, the §5 config.

### Smoke suite plan (`Classic/smokes/ccr-smoke.mjs`)

The family discipline (`Classic/smokes/README.md:1-14`): the smoke loads the
REAL built `Target/Library.js`, instantiates the REAL factory against a fake
ctx, and every ledger string is byte-identical; zero changes to the twelve
existing suites - coverage is additive. The `ccr-smoke` must prove:

1. under-threshold results pass through byte-identical (the vacuously-green
   trap: assert the pass-through AND a compressed case, never only one);
2. an oversized `bash` result compresses: preview line + correct marker bytes
   + the original retrievable via `ccr_retrieve` (round-trip);
3. auto-expand: content under `autoExpandLimitBytes` returns FULL content, no
   marker;
4. exempt tools pass through (write/edit/raw-write identity);
5. TTL expiry evicts and retrieval reports gone; LRU eviction at budget;
6. ledger strings byte-identical (`ccr: activated (...)`, per-compress lines);
7. all 7 classifier types hit their multiplier gates.

## 7. Implementation phases

Build command per phase (deterministic, workspace serialized; README.md:38-45):

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

1. **Skeleton + config** - bundle layout, Library.ts, Variable/Config.ts,
   Interface/, `apply` that logs the activation ledger line; no interception.
   Files: package.json, cordis.patch.yml, Source/Library.ts, Variable/Config.ts,
   Interface/*. Arbiter: build + `node Classic/smokes/ccr-smoke.mjs`
   (activation + schema-default assertions). Accept: build zero errors, smoke
   green, all 12 existing suites untouched and green.
2. **The gate + classifier + store** - Classify/Preview/Hash/Store/Compress,
   the `tools/post-execute` listener registered in Apply, LRU + TTL, no journal.
   Arbiter: build + ccr-smoke assertions 1,2,4,5,7. Accept: oversized results
   compress with byte-exact markers; under-threshold and exempt results
   byte-identical pass-through.
3. **Retrieval tool + auto-expand** - Retrieve.ts, `ccr_retrieve` registration,
   auto-expand path, granular `range`, ledger retrieval counts. Arbiter: build +
   ccr-smoke assertion 3 + round-trip. Accept: model-visible marker is
   retrievable to the original bytes; no marker under autoExpand limit.
4. **Disk journal + context engine (optional per config)** - JSONL journal
   (`journalPath`), boot compaction; `agent/pre-step`-adjacent middle-turn
   archiving under `contextEngine` (protectFirst/last per R:173-179) -
   feature-flagged off by default. Arbiter: build + ccr-smoke journal
   round-trip + existing suites. Accept: journal survives a fake restart
   (re-instantiate store from file), TTL compaction proven.
5. **Profile wiring + live verification** - add to the desktop profile's
   package.json bundles + cordis.patch.yml, restart, verify the activation
   ledger line and one live compressed bash result. Accept: the ledger shows
   `ccr: activated (...)`; the transcript shows preview + marker for a >2048
   byte tool result; `ccr_retrieve` works in the live loop.

Phases 1-3 are the MVP; 4-5 complete it. The EffectTS sibling
(`ets-hook-dsh-ccr`) is a separate later item per the SPLICE-ETS pattern
(Documentation/Archive/Split/SPLICE-ETS.md).

## 8. Feature scoping table (R§3/§4/§6)

| Aphrodite feature | Verdict | One line |
| --- | --- | --- |
| Tool-output compression (CCR core) | PORT | the whole point: gate → classify → hash → store → preview + marker |
| Auto-expand | PORT | identical semantics, cheap once the store exists (R:181-186) |
| 30-type classifier | ADAPT | 7 DSH types (§2.2) - the 30-type taxonomy is proxy-shaped |
| Threshold tiers + multipliers | ADAPT | error ×8 etc. carried into the `multipliers` map |
| Inline LRU store | PORT | memory LRU with budget cap |
| SQLite ccr.db | ADAPT | JSONL disk journal instead; SQLite is a native dep the family does not carry |
| Retrieval tool | ADAPT | `ccr_retrieve` as one registered ToolDefinition (Aphrodite's 13 relays → 1) |
| Directives | ADAPT | a `system-prompt/assemble` CCR-handling section, phase 4 |
| Context engine (middle-turn archiving) | ADAPT | `agent/pre-step`-adjacent, feature-flagged, phase 4 |
| Proxy mode (:9797/:9798) | SKIP | DSH is not an OpenAI-compatible relay; interception at the runtime is strictly better placed |
| Live containers (progressive markers) | DEFER | requires streaming tool results; the post-execute point sees finalized results only |
| Poll worker (auto-backgrounding) | DEFER | needs scheduler integration beyond post-execute |
| Chain split | SKIP | command splitting is Hermes shell-specific |
| Rhai scripting | SKIP | no scripting runtime in the family |
| Metrics/health/stats | ADAPT | ledger lines carry compressed/evicted/retrieved counts (family convention) |
| TOML templates | SKIP | the DSH Config schema replaces TOML; no template engine |
| Centers | SKIP | v1-only in Aphrodite, roadmap elsewhere (R:233-235) |
| Flow budget / injected context | DEFER | only if the context engine lands (phase 4) |
| Prefetch | DEFER | low value while compression already caps the flood |

## 9. Acceptance (the whole plugin)

- Build: deterministic three-step build zero-error on every touched tree.
- Smokes: `node Classic/smokes/ccr-smoke.mjs` green with byte-identical ledger
  assertions; the twelve existing suites unchanged and green; `pnpm run test
  --workspace-concurrency=1` green overall.
- Live: activation line in `~/.dsh/ccr.log`; a >2048-byte bash result renders
  as preview + marker in the transcript; retrieval restores the bytes; exempt
  tools untouched.
- Git: read-only checks only - the deliverable is reported READY-TO-COMMIT
  (routing law, `session-orientation` §3).

## 10. Open questions

1. Does `tools/post-execute` replacement update the GUI card views
   (`presentResult`) or only model-visible content? If cards show stale
   originals, a `tool.call.toolview` client slot (option b) is the display fix.
2. Should `read` be compressed at all in phase 3 when its result carries line
   numbers the model already navigated (compressing a `read` can break a later
   edit's `old_string` context)? Default yes (hash of full content, retrieval
   restores it) but the pilot should confirm no edit-failure regression.
3. Does the JSONL journal want rotation/capping (file growth at 256 MiB budget
   × TTL churn), or is boot-compaction enough?
4. The `subagent` tool's result often embeds a child's full report - compress
   it? It is the single largest consumer in orchestrator sessions; currently
   exempt (§2.1), review after live data.

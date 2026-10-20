---
title: Normalize Family — Config Surfaces & Live-Toggling Research
category: Researches
kind: research-output
date: 2026-10-19
status: complete
registry: Documentation/Researches/NORMALIZE-GRANULAR-CONFIG-RESEARCH.md
index: Documentation/INDEX.md
statuses:
  - name: the granular scopes (conversation/reasoning/toolInput/toolResults/files/batch)
    state: implemented
    evidence: landed via Archive/Normalize/NORMALIZE-GRANULAR-PLAN.md; in every family hook
  - name: the live toggling (volatile fields, no remount)
    state: implemented
    evidence: the settings service and the control panel flips proven live
  - name: the open questions (section 5)
    state: open
    evidence: five questions listed, unresolved
---

# Normalize Family — Config Surfaces & Live-Toggling Research

Date: 2026-10-19 · Explorer research for a granular per-scope normalization control
(conversation / tool input / tool output / files) with live toggling while the harness is open.

All paths below are anchored in the two trees under
`DeepSeek/Classic/packages/` and `DeepSeek/EffectTS/packages/` (verified on disk),
the harness docs sparse checkout (`~/Developer/Documentation/Module/deepseek-harness/docs/`),
the live profile `~/.dsh/profiles/desktop/`, and live `cordis_inspect` queries.

## 1. Executive summary

The family has **7 Classic + 7 EffectTS hooks** plus two factories. Six stream hooks
register exactly one `llm/stream` waterfall listener; `normalize-file` registers no
event at all — only the `normalize-file` **tool**. Config is small and uniform
(`log`/`logFile` volatile cells + a per-flavor `replacement` for 5 of 7 flavors +
`normalizeReasoning`/`normalizeToolArguments` on the 6 stream flavors).

Live toggling today is possible **via config edits, not via the loader's `disabled` flag**
(disabled is a boot/mount decision). The runtime already exposes a full config-update
path: the `settings` service (`describe/update/mutate/replace`) and the `configEditor`
service (`edit`) reconcile profile patches through the normal Loader path at runtime;
the Web settings UI and `ui-settings-plugin-inventory` project them. **However, the
family's volatile hot-edit story is currently broken by design**: the factory's
`State` builder *snapshots* every volatile cell once at mount (`Unwrap` collapses
`{ get }` cells into plain values), so a mid-session volatile edit updates the running
reference but **never reaches the running plugin's State** — a remount-triggering
(non-volatile) edit is the only way new values arrive.

Scope map today: conversation = `llm/stream` rewrite (6 hooks, all currently
`disabled: true` in the live profile); tool input = `normalizeToolArguments` flag
inside the same `llm/stream` listeners (implemented in all 6, default OFF, gated by
name exemptions + the `{"__normalize":false` raw marker); tool output to files =
the `normalize-file` tool (explicit, only-on-invocation); **tool results in the
transcript = no coverage at all** (no `tools/post-execute` listener exists in the family).

## 2. Knob inventory (both trees)

### 2.1 Classic tree (`DeepSeek/Classic/packages/`)

| Hook | Config fields (defaults) | Volatile | Events registered | Ledger strings (asserted by smokes) |
|---|---|---|---|---|
| `hook-dsh-normalize-dash` | `logFile "~/.dsh/hook-dsh-normalize-dash.log"`, `replacement "-"`, `normalizeReasoning true`, `normalizeToolArguments false` | `log`,`logFile`,`replacement` | `llm/stream` (dash `Source/Function/Apply.ts:94`), plus the `raw-write` tool (`Apply.ts:102`) | `hook-dsh-normalize-dash: activated (replacement=-, reasoning=on, toolArgs=off, logFile=…)` (`Apply.ts:69`); `normalized N dash char(s) in one stream` (`Normalize.ts:77`) |
| `hook-dsh-normalize-ellipsis` | `logFile "…/hook-dsh-normalize-ellipsis.log"`, `replacement "..."`, `normalizeReasoning true`, `normalizeToolArguments false` | `log`,`logFile`,`replacement` | `llm/stream` (`Apply.ts:85`) | `activated (replacement=..., reasoning=on, toolArgs=off, logFile=…)` (`Apply.ts:61`); `normalized N ellipsis char(s) in one stream` (`Normalize.ts:79`) |
| `hook-dsh-normalize-quotes` | `logFile`, `normalizeReasoning true`, `normalizeToolArguments false` — **no `replacement`** (fixed quote table) | `log`,`logFile` | `llm/stream` (`Apply.ts:85`) | `activated (reasoning=on, toolArgs=off, logFile=…)` (`Apply.ts:61`); `normalized N quote char(s) in one stream` (`Normalize.ts:77`) |
| `hook-dsh-normalize-spaces` | `logFile`, `replacement " "`, both flags | `log`,`logFile`,`replacement` | `llm/stream` (`Apply.ts:85`) | `activated (replacement= , …)`; `normalized N space char(s) in one stream` (`Normalize.ts:77`) |
| `hook-dsh-normalize-invisible` | `logFile`, `replacement ""` (removal), both flags | `log`,`logFile`,`replacement` | `llm/stream` (`Apply.ts:89`) | `activated (replacement=, …)`; `normalized N invisible char(s) in one stream` (`Normalize.ts:77`) |
| `hook-dsh-normalize-fullwidth` | `logFile`, both flags — **no `replacement`** (fixed table) | `log`,`logFile` | `llm/stream` (`Apply.ts:85`) | `activated (reasoning=on, toolArgs=off, logFile=…)`; `normalized N fullwidth char(s) in one stream` (`Normalize.ts:77`) |
| `hook-dsh-normalize-file` | `logFile`, `replacement "-"` — no flags | `log`,`logFile`,`replacement` | **none** — only `tools.register(normalize-file)` (`Apply.ts:6,15-22`; `Write.ts:26-32`) | `activated (replacement=-, logFile=...)` (`Apply.ts:72`); `normalized N char(s) in <path>` (`Normalize.ts:146`) |

Notes:
- `log` (boolean, default `true`) is never re-declared per-hook; it arrives from the
  factory's minimal shared block (`plugin-dsh-factory/Source/Function/Schema.ts:59-68`).
- All hooks call `Compose(false, {...})` — `shared: false` emits **only** `log` +
  `logFile` volatile cells, deliberately omitting `updateCooldownMs`/`mutationTools`/
  `policyFile`/`exclude` because none of these hooks use fs/observed machinery
  (`Schema.ts:18-23`; per-hook `Config.ts` header, e.g. dash `Config.ts:9-20`).
- `normalizeReasoning`/`normalizeToolArguments` are deliberately **plain** fields
  ("they change the dispatch SEMANTICS, so they remount on edit", dash `Config.ts:27-28`).
- The activation-line composer is `hook-dsh-core/Source/Function/Activate.ts:23-34`
  (`undefined` pair → absent; empty key → bare segment; empty string → present).

### 2.2 EffectTS tree (`DeepSeek/EffectTS/packages/ets-hook-*`)

- Every `Source/Variable/Config.ts` is **byte-identical to its Classic twin except the
  single import line** (`@playform/plugin-dsh-factory` → `@playform/ets-plugin-dsh-factory`;
  verified by diff for all 7). Same fields, same defaults, same volatile markers.
- `Apply.ts` differs structurally (the R7c Effect three-adapter waterfall:
  `Stream.fromAsyncIterable` → core `Gate` transformer → `Stream.toAsyncIterable`,
  `ets-hook-dsh-normalize-dash/Source/Function/Apply.ts:27-60`) but registers the same
  `llm/stream` listener and the `raw-write` tool (`Apply.ts:154,180`).
- The ets factory's `Schema.ts` is identical to Classic (0 diff lines);
  `State.ts` differs only in type imports (`@playform/ets-base-dsh`); `Unwrap.ts`
  is identical (0 diff lines) — so **the snapshot bug below applies to both trees**.
- The ets dash comment claims the replacement is "read from State at chunk time, so a
  volatile hot-edit takes effect mid-listener exactly like the Classic per-chunk read"
  (`ets-hook-dsh-normalize-dash/Source/Function/Apply.ts:44-46`) — that claim is only
  true *relative to reading State per chunk*; the State value itself is a mount-time
  snapshot (§4a).

## 3. The scope map (what each scope means, event-wise)

Live harness events verified via the Host Event provider and
`docs/event-producer-consumer.md:50,57,79`:

| Scope | Event / mechanism | Current coverage |
|---|---|---|
| **Conversation** (model prose output) | `llm/stream` waterfall (`llm/llm/src/index.ts:75`; live Event catalog: "Waterfall around every streaming model call") | **Yes** — the 6 stream hooks rewrite `text-delta.text` + `block-end` TextBlock (`hook-dsh-core/Source/Stream/Chunk.ts:12,46-51`; `Stream/Block.ts`). Currently all 6 are `disabled: true` in the live profile (`cordis.patch.yml:161-185`, comment: user wants literal unicode in conversation) |
| **Reasoning** (model thinking output) | same `llm/stream` chunks (`reasoning-delta`, ReasoningBlock + runtime `thinking` defense) | Yes, gated by `normalizeReasoning` (default true) — part of the conversation scope (`Chunk.ts:13-15`) |
| **Tool input** (the model's tool-call arguments) | same `llm/stream` chunks: `tool-call-delta.argumentsDelta` + assembled `ToolCallBlock.arguments` (`Chunk.ts:16-38`) | **Partially** — `normalizeToolArguments` flag (default OFF) on all 6 stream flavors; three-way gate: name-exempt (`edit`, `raw-write`, `normalize-file`), per-call raw marker `{"__normalize":false` stripped by `Stream/Strip`, else normalize (`Chunk.ts:21-38`) |
| **Tool output → files** (what a write tool puts on disk) | `fs/write-intent` waterfall + `fs/observed` emit (`event-producer-consumer.md:50-51`); the family instead uses its **own tool** | Yes — `normalize-file` tool: read → six-transform count → write **only if N>0** through the factory's shared write executor (`normalize-file/Write.ts:3-25`, `Normalize.ts:51-148`). The 6 stream hooks are also registered as the `raw-write` tool (dash only) with an explicit `normalize` parameter defaulting verbatim (dash `Apply.ts:7-10`, `Write.ts`) |
| **Tool results in the transcript** | `tools/post-execute` waterfall ("Accept, replace, enrich, or block a normalized dispatch result", live Event catalog; `core/tools/src/index.ts:177`) and `tools/ptc-dispatch-log` (run_code only) | **None.** No family hook registers `tools/post-execute`; the patch-yml comment states it explicitly: "Tool output is NOT affected by these hooks (tool results are request-side content)" (`cordis.patch.yml:164-165`) |

So the user's four scopes map to: conversation = `llm/stream` (6 hooks), tool input =
`normalizeToolArguments` inside the same listeners, tool output→files = `normalize-file`
tool / write path, tool results = **gap**.

## 4. Live-toggling mechanics

### 4a. Volatile cells — the semantics and the snapshot gap

- Harness semantics (docs/cordis-tutorial/05-config.md:70-95): a `.volatile()` field
  is a *stable reference*; "A change to that field updates its stable reference without
  remounting the plugin. Read it with `.get()`." The Loader compares raw config while
  ignoring volatile fields; a volatile-only change is validated and "committed into the
  running references and emits one instance-local `loader/volatile-update` … bypassing
  the target plugin's `internal/update`" (05-config.md:93). Inherited event documented
  at docs/cordis-api/inherited.md:38. Equal values do not notify; a changed
  **ordinary** field retains the normal update flow (remount; apply re-runs).
- **The family never holds the cell.** `plugin-dsh-factory/Source/Function/Unwrap.ts:11-22`
  iterates the config once at apply time and replaces any `{ get }` cell with
  `Value.get()` — a **snapshot**. `State.ts:70-75` then copies `Plain[Source]` into
  State. Since a volatile edit does not re-run `apply` (05-config.md:93), the new value
  lands in the running reference but the plugin's `State.Replacement` / `State.Ledger` /
  `State.Enabled` keep the mount-time values.
- Consequence: the "hot-editable, the next stream picks it up with no remount" comments
  in every hook's `Config.ts` (e.g. dash `Config.ts:43-46`) describe what volatile
  marking *prevents* (no remount), not what it *delivers*; the actual delivery is
  missing. The live Host Config projection confirms the volatile markers are real
  (`x-cordis.volatile: true` on `log`, `logFile`, `replacement` in the projected JSON
  Schema of `include:hook-dsh-normalize-file`, live `cordis_inspect` query).
- Contrast: `@deepseek-ai/dsh-agent-default-model` declares its whole config as
  `Volatile<T>` and reads the references at use time (docs/config-catalog.md:44-55) —
  that is the working pattern the factory should adopt.

### 4b. UI/service surfaces for editing plugin configs while the app is open

All verified live (services exist in the running host; doc anchors from
docs/capability-seams.md:113-117,651,652,641):

- `ctx.settings` (package `settings`): "Project Config schemas into forms and own
  optional instance-level UI policy." Methods (live Service contract):
  `describe()` → `{ns, schema, value, revision, applies:'live', secrets[]}`,
  `update(ns, patch, expectedRevision?)`, `mutate(ns, ops, expectedRevision?)` (path
  ops, unset removes array elements), `replace(ns, section, expectedRevision?)`,
  `prepareDocument()` (the profile patch path), `configure({auto})`. Emits
  `settings/document-updated` (live Event catalog).
- `ctx.configEditor` (package `boot/config-editor`): "Persists profile config patches
  under the application file lock and HMR queue, then reconciles Loader entries"
  (capability-seams.md:651). Methods: `entries()`, `configuration()` (inherited vs
  override layers), `edit(entry, change)` — "Validate, persist, and reconcile a
  plugin's next config; ordinary fields keep normal lifecycle rules."
- `ctx.settingsController` / `ctx.credentialsController` (`api/settings-controller`):
  Remote/GUI projection of the settings seam (capability-seams.md:641,652 — "Forms
  project volatile Config fields from active profile entries and delegate validated
  edits to config-editor").
- Web UI: `ui-settings` (`enabled: true` in the live profile patch, `cordis.patch.yml:55-58`)
  and `ui-settings-plugin-inventory` (capability-seams.md:21,507) expose per-plugin
  config pages; `ctx.pluginManager` feeds the inventory (capability-seams.md:618).

**So: yes, a live config-update path exists today** — `settings.update/mutate` against
the entry id (e.g. `include:hook-dsh-normalize-dash`) persists to `cordis.patch.yml`
and reconciles through the Loader without an app restart.

### 4c. The loader's `disabled` semantics

`disabled: true` "unmounts a plugin without deleting its entry — flip it back and the
plugin (and everything PENDING on its services) loads again"
(docs/cordis-tutorial/06-composition-and-hmr.md:16,19). `disabled` is interpolated
"at every mount decision, against the loader context" (docs/cordis-primer.md:39).
The live profile currently disables exactly the 6 model-output hooks with bare `id:`
rows in the patch layer (`cordis.patch.yml:159-185`). This is the **existing toggle
mechanism** for whole plugins; bundle layers compose at boot, so enable/disable is a
composition change (an HMR reload), not an in-place switch. Granular per-scope control
should therefore be **config**, not `disabled`.

### 4d. Can config changes reach `apply()` mid-session?

Two routes, with opposite outcomes:
1. **Ordinary (non-volatile) field edit** → Loader normal update flow → plugin
   remount → `apply` re-runs with the new config (05-config.md:93). Works today, but
   drops and re-registers the `llm/stream` listener (momentary gap; also re-emits an
   `activated (…)` ledger line — smoke-visible).
2. **Volatile-only edit** → no remount, values committed to the running references +
   `loader/volatile-update` … but the family's `State` snapshot (§4a) never sees them.
   **Route 2 is the one that should power live toggling and is currently dead** for
   anything routed through `Factory.State`.

The Host Inspect surface for config is read-only: the `Config` provider lists paged
entries (`patchId`, `status: "schema"`) and one entry's projected JSON Schema (verified
live for `include:hook-dsh-normalize-file`); it exposes no update method — updates go
through `settings`/`configEditor` services.

## 5. Gap analysis (top items)

1. **Volatile snapshot bug (blocking for live toggling).** `Unwrap.ts:11-22` +
   `State.ts:70-75` flatten `{ get }` cells at mount; no per-call re-read anywhere
   (the hooks read `State.Replacement` per chunk, but the field itself is frozen).
   Fix: keep the cell in State (a `Volatile<T>`-style accessor) or subscribe to
   `loader/volatile-update` and refresh State.
2. **No per-scope switches.** The family's only scope granularity is
   `normalizeReasoning` / `normalizeToolArguments` (model-output sub-scopes) — there
   is no conversation-vs-tool-input-vs-tool-output-vs-files switch, and no
   `tools/post-execute` arm at all for tool results in the transcript (§3).
3. **Scope flags are plain fields → every toggle remounts.** Editing
   `normalizeToolArguments` triggers the ordinary update flow (remount + listener
   re-registration + new activation line), making per-scope live toggling disruptive
   unless the new flags are made volatile *and* gap 1 is fixed.
4. **Per-hook vs family-level control.** Six separate plugins each own their config;
   there is no shared "normalize" config object a single settings form could drive
   across all scopes/flavors (the factory's `Compose(false, module)` pattern is
   per-module by design, `Schema.ts:14-27`).
5. **`normalizeToolArguments` risk gating is implicit.** Default OFF with a
   "user's accepted risk" comment (dash `Config.ts:51-56`) and name exemptions
   (`edit`, `raw-write`, `normalize-file`) that are hard-coded in the core
   (`Stream/Chunk.ts:21-32`) — not configurable per tool.

## 6. Recommendations for the granular config schema

```ts
export default Compose(false, {
  log: Schema.boolean().default(true).volatile(),
  logFile: Schema.string().default("~/.dsh/hook-dsh-normalize-dash.log").volatile(),
  replacement: Schema.string().default("-").volatile(),
  scopes: Schema.object({
    conversation: Schema.boolean().default(true).volatile(),   // text/reasoning deltas+blocks
    reasoning:    Schema.boolean().default(true).volatile(),   // sub-gate of conversation
    toolInput:    Schema.boolean().default(false).volatile(),  // argumentsDelta + ToolCallBlock.arguments
    toolResults:  Schema.boolean().default(false).volatile(),  // NEW: tools/post-execute arm
    files:        Schema.boolean().default(true).volatile(),   // normalize-file tool / write path
  }),
  // toolInput exemptions stay explicit and configurable:
  toolInputExemptions: Schema.array(Schema.string())
    .default(["edit", "raw-write", "normalize-file"]).volatile(),
});
```

- Make every scope flag **volatile** and fix the State snapshot first (§5.1); then
  toggling is live, silent, and remount-free. The dispatcher already receives the
  flags per chunk (`Chunk(Input, Replacement, Reasoning, ToolArgs, Raw)`, dash
  `Normalize.ts:71`), so a State that reflects hot edits propagates for free.
- Add `tools/post-execute` (waterfall, `tools/src/index.ts:177`) as the new
  `toolResults` arm: rewrite `ToolExecutionResult` content blocks in place; keep the
  ledger contract `normalized N … char(s) in one tool result` additive to the smoke.
- If a single family-wide control surface is wanted, prefer one aggregate config
  (or a preset-level patch entry driving all seven entries through the `settings`
  service) over new shared machinery in the factory.
- Smoke parity: every new flag must appear in the `activated (…)` ledger line
  (`hook-dsh-core/Source/Function/Activate.ts:23-34`) and the count-line vocabulary
  must stay byte-identical per flavor (§2.1 ledger column).

## 7. Open questions

1. Does a volatile-only edit ever re-run `apply` in practice on the pinned loader
   (docs say no, tutorial 05-config.md:93)? A live probe (edit `replacement` while
   watching `~/.dsh/hook-dsh-normalize-file.log`) would settle the snapshot-gap
   claim empirically.
2. Should per-scope flags live per-flavor (7× duplication, current pattern) or in
   one new family aggregator plugin reading/writing the others via `configEditor`?
3. Does `tools/post-execute` allow content rewriting of text blocks without breaking
   the `old_string` edit-contract invariants the family documents for the file
   rewriter (`normalize-file/Apply.ts:13-22`)? The same concern applies to results
   of `edit`/`read` (byte-matching tools) — an exemption list will be needed there too.
4. The EffectTS tree's R7c Gate reads State per chunk; after fixing the snapshot, is
   any ets-side change needed beyond the shared factory, given `State.ts` already
   imports the shared ets-base types?
5. `settings.mutate` path-op edits against volatile fields — confirm the revision/
   redaction contract (`SettingsDescriptor.secrets`) does not block boolean patches
   for these entries in the Web settings UI.

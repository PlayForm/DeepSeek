---
title: The full-granularity normalization control plan
category: Archive/Normalize
kind: one-shot-record
date: 2026-10-19
status: complete
registry: Documentation/Archive/Normalize/NORMALIZE-GRANULAR-PLAN.md
index: Documentation/INDEX.md
statuses:
  - name: the granular scope gates (six scopes, all volatile)
    state: implemented
    evidence: in every family hook, both trees
  - name: the overpass arms (tools/post-execute + agent/pre-step)
    state: implemented
    evidence: off by default; the marker guard keeps the arm order-safe
  - name: the normalize-overpass command
    state: implemented
    evidence: registered per flavor; the I9 fail-open on collision
  - name: the I9 fail-open registration fix
    state: implemented
    evidence: 14 Apply.ts files; one new ledger line; zero assertion changes
---

# NORMALIZE-GRANULAR-PLAN — full-granularity normalization control for the DSH plugin family

Date: 2026-10-19 · Author: PLAN agent (drafting lane) · Inputs:
`Documentation/Researches/NORMALIZE-GRANULAR-CONFIG-RESEARCH.md` (R1) and
`Documentation/Researches/NORMALIZE-OVERPASS-RESEARCH.md` (R2). All code claims verified
on disk in this repo (`Classic/packages/`, `EffectTS/packages/`); harness-doc claims
anchored to `/Users/nikola/Developer/Documentation/Module/deepseek-harness/docs/`.

---

## 1. Executive summary

The family today normalizes exactly two things: model output (the six `llm/stream`
flavors, gated by `normalizeReasoning` / `normalizeToolArguments`) and files on
explicit request (the `normalize-file` tool); tool results in the transcript and the
incoming step batch are uncovered (R1 §3, R2 §5.1). Live toggling is broken: every
volatile config cell is collapsed to a mount-time snapshot by
`plugin-dsh-factory/Source/Function/Unwrap.ts:11-22` + `State.ts:31,37-75`, so a
volatile-only edit commits into the loader's running reference and emits
`loader/volatile-update` (docs/cordis-tutorial/05-config.md:88-95) but never reaches
the running plugin's State (R1 §4a). This plan makes three changes, mirrored in
both trees:

1. **The volatile fix (base-plugin change, both factories)**: `State` keeps the raw
   config's `{ get }` cells and registers an instance-local
   `loader/volatile-update` listener that refreshes the affected State fields **in
   place**. Consumers (which already read `State.Replacement` etc. at use time)
   change nothing; existing smokes stay byte-identical. Choice (b) of the two
   candidates — rationale in §2.
2. **The `scopes` config surface (per-hook change, all 14 hooks)**: a volatile
   `scopes` object `{ conversation, reasoning, toolInput, toolResults, files, batch }`
   that gates every arm of the hook, plus a configurable exemption list for the
   tool-results arm. `normalizeToolArguments` is kept and OR-ed in (§3).
3. **The overpass arms**: a `tools/post-execute` tool-results arm and an
   `agent/pre-step` step-batch arm per hook, plus a `normalize-overpass <scope>`
   human command. Text blocks only; N=0 → pass-through; the durable transcript is
   never rewritten (R2 §5).

Four phases (§8), each arbitrated by the deterministic build + smokes + the full
serialized suite.

---

## 2. The volatile fix (both factories)

### 2.1 The bug, precisely

`Unwrap.ts:11-22` iterates the config once and replaces every `{ get }` cell with
`Value.get()` — a snapshot taken at apply time. `State.ts:31` feeds that plain object
into the State builder; `State.ts:40-45` copies `Ledger←logFile`, `Enabled←log`,
`List←exclude`, `Tool←mutationTools`, `Policy←policyFile`; `State.ts:70-75` copies the
module's own fields via the `fields` map (`Replacement←replacement`,
`Reasoning←normalizeReasoning`, `ToolArgs←normalizeToolArguments`). A volatile-only
edit does not re-run apply (05-config.md:93), so `State.*` keeps mount-time values
forever. The twins are identical (`EffectTS/packages/ets-plugin-dsh-factory/Source/
Function/Unwrap.ts` is byte-identical; `State.ts` differs only in type imports).

Consumers already read State fields at use time — every stream wrapper reads
`State.Replacement` per chunk (dash `Normalize.ts:71`), `Factory.Append` reads
`State.Enabled`/`State.Ledger` per call (`plugin-dsh-factory/Source/Function/
Append.ts:24,27`), the file hook reads `State.Replacement` per tool call
(`hook-dsh-normalize-file/Source/Function/Normalize.ts:133`). Only the State
fields themselves are stale.

### 2.2 Decision: option (b) — in-place refresh via `loader/volatile-update`

- **(a) State holds the cells; consumers call `.get()`** — rejected: it changes the
  type of `State.Replacement`/`State.Ledger`/`State.Enabled` from plain values to
  accessors, breaking every existing smoke assertion that reads them as values
  (`Classic/smokes/normalize-dash-smoke.mjs:167-176`, `:341`, `:424` and the same
  pattern in all 7 per-tree hook smokes + `core-smoke.mjs:923`), touching ~40
  consumer read sites, and contradicting the byte-identical-assertions rule.
- **(b) State stays plain; a listener refreshes it in place** — chosen. The event
  payload is "the changed paths as arrays of keys" (05-config.md:90;
  docs/cordis-api/inherited.md, `loader/volatile-update`), dispatched to the owning
  fiber only — the listener maps changed keys back to State fields and re-reads
  the current value from the retained cells.

### 2.3 Exact changes (file-level, both factories)

In `Classic/packages/plugin-dsh-factory/Source/Function/State.ts` (and the
`ets-plugin-dsh-factory` twin, same lines modulo imports):

1. Keep `Unwrap` exactly as is (it still produces the initial plain values; the
   function is byte-identical in both trees today and stays so).
2. Additionally retain the raw cells: build `const Cells = Config as Record<string,
   { get?: () => unknown }>`, and build a reverse map `Key→Field` from the fixed
   shared mappings (`logFile→Ledger`, `log→Enabled`, `exclude→List`,
   `mutationTools→Tool`, `policyFile→Policy`) plus `Setup.fields` inverted
   (`replacement→Replacement`, …).
3. Register one listener on the plugin's own context:
   `Context.on("loader/volatile-update", (Paths) => { for each key path in Paths:
   const Field = Map[key]; if (Field && Cells[key]?.get) State[Field] = Cells[key].get(); })`.
   The listener is fiber-owned (removed on unload), synchronous, never throws
   (a failed `.get()` keeps the previous value — the same defensive rule as
   `Unwrap.ts:15-19`). Unknown key paths are ignored. Nested paths (e.g. the future
   `scopes` object, §3) are handled by keying the map on the top-level key and
   re-reading the whole object cell — an object volatile value is a frozen detached
   snapshot (05-config.md:93), so re-reading it wholesale is correct.
4. Consumers change **not at all**. `State.ts`'s returned object identity is
   preserved (in-place field writes, no re-`Object.assign`), so consumers that hold
   the State reference see updates immediately.

Consumers inventory (all keep working unchanged, verified by grep over both trees):
`State.Replacement` (per chunk in 6 Classic + 6 ets stream hooks;
`hook-dsh-normalize-file/Normalize.ts:133`; dash `Write.ts:131`),
`State.Reasoning`/`State.ToolArgs` (each hook's `Apply.ts` activation line +
`Normalize.ts:71`), `State.Ledger`/`State.Enabled` (`Factory.Append`,
`ets-base-dsh/Source/Function/Append.ts:24,27`), `State.List` (`Gate.ts:68`),
`State.Policy` (governor `Resolve.ts:16-17`), `State.Tool` (gate's mutation-tool
check). Activation lines are emitted once at apply from the mount-time snapshot;
a later volatile edit does not re-emit one (no remount), which is why the existing
byte assertions are safe. Ledger/smoke implications: **no activation line changes;
zero existing assertions change.** The only new behavior is that the *next* use
after a volatile edit sees the new value.

---

## 3. The `scopes` config surface (per-hook, all 14 hooks)

### 3.1 Verbatim schema for one hook (Classic dash; every other hook differs only in
its existing fields — the `scopes` block is identical in all 14)

`Classic/packages/hook-dsh-normalize-dash/Source/Variable/Config.ts`, appended after
the existing fields:

```ts
	// Granular scope gates — ALL volatile (live toggling, no remount):
	// conversation=text/block-end, reasoning=its sub-gate, toolInput=tool-call
	// arguments arm, toolResults=tools/post-execute arm (§4.1), files=the
	// normalize-file tool (inert in stream flavors so one patch override drives
	// the whole family — §3.4), batch=agent/pre-step arm (§4.2).
	scopes: Schema.object({
		conversation: Schema.boolean().default(true).volatile(),
		reasoning: Schema.boolean().default(true).volatile(),
		toolInput: Schema.boolean().default(false).volatile(),
		toolResults: Schema.boolean().default(false).volatile(),
		files: Schema.boolean().default(true).volatile(),
		batch: Schema.boolean().default(false).volatile(),
	}).volatile(),
	// Tool-results exemption list (the name-exempt precedent of
	// hook-dsh-core/Source/Stream/Chunk.ts:19-32, made configurable): a result
	// whose Exec.name is listed passes through by identity.
	toolResultsExempt: Schema.array(Schema.string())
		.default(["read", "edit", "raw-write", "normalize-file", "ccr_retrieve", "subagent", "ask_user_question"])
		.volatile(),
```

Defaults = current behavior: conversation+reasoning true (every stream hook
rewrites text today), `toolInput` false (=`normalizeToolArguments`'s default),
`toolResults` false (new arm, opt-in), `batch` false (new arm, opt-in), `files`
true (only consumed by normalize-file). The `scopes` object itself is declared
volatile as well as its leaves, so one changed leaf emits one update with the whole
object re-read (§2.3 step 3).

### 3.2 `normalizeToolArguments` compatibility — decision: keep and OR

The old field stays, exactly as today (plain, remount-on-change, dash
`Config.ts:27-28`). The hook computes the **effective** toolInput gate as
`State.ToolArgs || State.Scopes.toolInput` and passes that where `State.ToolArgs`
goes today (`Normalize.ts:71`, `Apply.ts` activation line keeps reporting the
*effective* value via the existing `State.ToolArgs ? "on" : "off"` expression
changed to the effective OR — the *format* is unchanged; when the field is absent
from old configs the value is identical, so existing assertions stay byte-identical).
Deprecation note in each `Config.ts`: new configs should use `scopes.toolInput`.
No schema migration, no `deprecate()` call — Cordis has no deprecation helper in
use in this repo, and the OR keeps every existing profile working.

### 3.3 Master toggle — decision: per-hook `scopes` + one patch-level override, no
aggregator plugin

R1's open question 2 and the task's master-toggle question are decided as follows:
each hook keeps its own `scopes` (per-plugin granularity is the requirement); the
"easy global off" is **not** a new plugin or a family config object (the factory's
`Compose(false, module)` is per-module by design, R1 §2.1 note) — it is a single
grouped override block in the profile patch (`cordis.patch.yml`) that sets
`scopes: { conversation: false, reasoning: false, toolInput: false, toolResults:
false, files: false, batch: false }` on all seven entries at once. Because the
`scopes` schema shape is identical in all 14 hooks, one override fragment validates
everywhere; because every scope is volatile, flipping it is live and silent. The
plan adds this fragment to the family README/config docs, not to code. A future
aggregator plugin reading/writing the seven entries via `configEditor.edit`
(R1 §4b) is explicitly out of scope.

### 3.4 `replacement` stays per-hook

Each flavor's `replacement` (or fixed table) is untouched — scopes change only
*where* the transform applies, never *what* it does. normalize-file gains the same
`scopes` block and gates its tool body on `scopes.files` (off → returns the
unchanged `changed:false` result, no write, no ledger line).

---

## 4. The overpass arms

Principle (R2 §5): overpass normalizes only what re-enters the model or lands in a
file; it never rewrites the durable transcript and never runs silently in the
background on files.

### 4.1 The tool-results arm — `tools/post-execute`

- **Per-hook listener, not a shared dispatcher** — decided (R2 §7.1). The "one log
  per module" convention (R2 §6.1) means the ledger strings are the module's own,
  and each hook's `scopes.toolResults` + `toolResultsExempt` are the module's own
  config. Each hook registers one listener in its `Apply.ts` next to the existing
  `llm/stream` registration:
  `Context.on("tools/post-execute", (Exec, Result, Next) => Overpass(Exec, Result, Next, State))`.
- **Semantics**: `next()` first, always (waterfall discipline, dash
  `Apply.ts:86-87`); if `State.Scopes.toolResults` is off → return the downstream
  decision untouched. Only an accepted, non-value-carrying decision is considered
  (the ccr precedent, `hook-dsh-ccr/Source/Function/Apply.ts:209-218`); only
  `type === "text"` content blocks are rewritten (never tool-call/argument blocks —
  the execution-critical-JSON rule of `Chunk.ts:12-16`); the rewrite runs the hook's
  own single transform (each flavor transforms only its own class, exactly like the
  stream arm — dash normalizes dashes only); N=0 → return the decision unchanged
  (no ledger line, the normalize-file precedent, `Normalize.ts:135-137`); N>0 →
  return `{ kind: "accept", content: <rewritten blocks> }` and emit
  `overpass: normalized N char(s) in tool result <toolName> <callId>` via
  `Factory.Append` + the `normalized` journal event (R2 §6.1; format identical to
  `hook-dsh-normalize-file/Normalize.ts:146-148` otherwise).
- **Exemptions**: `toolResultsExempt` (§3.1). `read`/`edit` are exempt because
  their text is byte-contracted (`old_string` must match real file bytes, the same
  rationale as `Chunk.ts:21-32`); `raw-write`/`normalize-file` own their own
  normalization; `ccr_retrieve` returns stored raw payloads whose bytes are the
  retrieval contract (the ccr marker/hash round-trip); `subagent`/`ask_user_question`
  are exempt because their text is prompt/contract material the delegating agent
  matched verbatim (the name-exempt precedent generalized).
- **Ordering rule vs the ccr arm** — decided: **normalize first, compress second.**
  The ccr hook registers `tools/post-execute` with `{ prepend: true }` and calls
  `Next()` before deciding (`hook-dsh-ccr/Source/Function/Apply.ts:27,201-218`), so
  its gate runs outermost today. The normalize hooks register their arm **also with
  `{ prepend: true }`**; with registration order determined by bundle load order,
  the arm that prepends later is outermost. The family's bundle order places the
  ccr hook before the normalize hooks, so the normalize arm lands outermost and the
  ccr gate compresses the *normalized* bytes (its size stats then describe what the
  model actually sees, and ccr's preview/marker text is never itself normalized).
  Defensive guard for any load order: the normalize arm passes through unchanged
  when the downstream decision's content already contains the ccr spill marker
  bytes — normalization never touches a ccr replacement. Smoke asserts the ordering
  (§7.5).

### 4.2 The step-batch arm — `agent/pre-step`

- One per-hook listener: `Context.on("agent/pre-step", (Payload, Next) => …)`,
  gated on `State.Scopes.batch`.
- **Semantics — decided, given pre-step fires per step** (R2 §7.2): the arm
  normalizes **every** incoming batch while `batch` is on (continuous mode), and
  additionally honors a one-shot arm set by the command (§5) regardless of the
  scope value: one-shot armed → normalize the next batch once, clear the flag
  (the flag lives on the hook's State object, a plain boolean — volatile-edit safe,
  HMR-safe because State is rebuilt per mount). Rewrite only `type === "text"` text
  inside `Payload.messages` (`UserMessage[]`); N=0 → plain `next()`; N>0 →
  `{ kind: "enter", messages: <normalized> }` + ledger line
  `overpass: normalized N char(s) in step batch (turn T step S)` from
  `Payload.turn`/`Payload.step` (R2 §6.1). Re-normalizing injected content across
  steps is harmless: the transforms are idempotent on their own output
  (ASCII-replacement maps are fixed points).
- The batch arm normalizes the *incoming* batch only — never assistant/tool
  history (append-only, R2 §3b).

### 4.3 What is explicitly NOT built

No `llm/stream` request rewriting (deep-frozen, R2 §2a); no transcript rewriting
(R2 §3b); no background file watching (`hook-dsh-normalize-file/Apply.ts:12-20`); no `SurfaceOp.replace` use (compaction-owned, R2 §3b).

## 5. The command and the tool

- **Command**: each of the 14 hooks (both trees) registers, in `Apply.ts`, via
  `Context.commands.register({ name: "normalize-overpass", description: "Arm a one-shot
  overpass: 'files' <path…> | 'batch' | 'results on|off' | 'scopes'", handler })`
  (service contract: `register(definition: CommandDefinition): () => void`,
  name lowercase without slash, `rawInput` parsed by the handler —
  docs/subsystems/commands.md:31-57,143-150; capability-seams.md:675). Handlers:
  `files <path…>` → run the normalize-file pipeline (`Function/Normalize`) per path
  through `Factory.Write`, ledger `overpass: swept K file(s), normalized M char(s)`
  (R2 §6.1; only the normalize-file hook implements the sweep — other flavors
  decline that scope); `batch` → set the one-shot batch flag (§4.2); `results
  on|off` → flip `scopes.toolResults` via `ctx.configEditor.edit`/`ctx.settings.update`
  when present, otherwise report the settings-UI path (the command never mutates
  State directly — config stays the single source of truth, R1 §4b); `scopes` →
  report the current effective values (read-only).
- **Tool**: the existing `normalize-file` tool stays exactly as is
  (`hook-dsh-normalize-file/Apply.ts:6,15-22`), now gated by `scopes.files`. No new
  tool: R2 §4c concluded an extra tool adds nothing the command and config cells
  do not already provide.

---

## 6. EffectTS parity

Every change is mirrored in the `ets-*` tree:

- `ets-plugin-dsh-factory/Source/Function/State.ts` gains the identical
  `loader/volatile-update` refresh listener (the file differs from Classic only in
  type imports today; keep it that way). Each `ets-hook-dsh-normalize-*/Source/
  Variable/Config.ts` gains the byte-identical `scopes` + `toolResultsExempt` block
  (byte-identical to the Classic twins except the factory import line today — R1
  §2.2 — and staying so). Each ets hook's `Apply.ts` gains the same two overpass
  listeners and the command; the R7c Gate already reads State per use, so no
  further ets-side change is needed beyond the shared factory (R1 §7.4). Ledger
  strings stay byte-identical in both trees (R2 §5.5), so the ets smokes assert
  byte-equality against the Classic strings.

---

## 7. Smoke plan (additive only; zero changes to existing assertions)

Pattern: fake ctx + real factory (`plugin-system`/`smoke-writing` discipline). New
assertions per tree, additive at the end of each existing smoke file:

1. **Volatile live-flip (the KEY new smoke, proves the fix)** — in each hook smoke:
   after `Run1` (mount), dispatch the fake `loader/volatile-update` event with the
   changed key (the fake ctx's event registry exposes the listener the factory
   registered), then assert the next use picks the new value up: flip
   `replacement` → the next stream chunk normalizes with the new replacement
   without remount; flip `scopes.toolInput`/`conversation` → the next chunk's gate
   changes; assert `State.Replacement` itself was mutated in place (identity of the
   State object preserved).
2. **Scope gates** — for each scope, on/off pair: conversation off → text-delta
   passes by identity (count 0); reasoning off → reasoning-delta passes; toolInput
   effective-OR test (`normalizeToolArguments: true` with `scopes.toolInput: false`
   still normalizes; both off does not); files off → the normalize-file tool
   returns `changed:false` without touching the file.
3. **Tool-results arm** — accept-with-content normalization of a text block
   (dash smoke: an em-dash payload → `accept`, content rewritten, ledger line
   `overpass: normalized N char(s) in tool result <toolName> <callId>`); exempt
   tool name (`read`) → pass-through; non-text blocks untouched; N=0 payload →
   bare decision unchanged, no ledger line; value-carrying decision → untouched.
4. **Batch arm** — `agent/pre-step` with curly quotes → `enter` with normalized
   messages + ledger line `overpass: normalized N char(s) in step batch (turn T
   step S)`; scope off → pass-through; one-shot arm from the command → normalizes
   exactly one batch then clears.
5. **Ordering** — fake ctx with both the ccr-style prepended listener and the
   normalize arm: assert the normalize arm runs before the compression decision and
   that marker-bearing content passes through the normalize arm unchanged.
6. **Command** — register through the fake ctx, invoke the handler, assert the
   one-shot flag / sweep result / read-only report.
7. **Ledger contract** — all new lines byte-asserted; every pre-existing assertion
   (activation lines, `normalized N … char(s) in one stream`, `… in <path>`)
   untouched and still green.
8. **History safety** — assert zero writes to any session-log surface from the
   overpass paths (R2 §6.2.5).

---

## 8. Phases with arbiters

- **Workspace serialized** (`pnpm run test --workspace-concurrency=1`). Each
  phase's arbiter: the deterministic build, the named smokes, then the full suite.

- **Phase 1 — the volatile fix (both factories).** `State.ts` refresh listener +
  retained cells in `plugin-dsh-factory` and `ets-plugin-dsh-factory`; the
  live-flip smoke added to both trees' coverage. *Arbiter*: build; `node
  Classic/smokes/normalize-dash-smoke.mjs` + `normalize-file-smoke.mjs` and the ets
  twins (they already assert the unwrap behavior — they must still pass
  byte-identically, plus the new flip assertions); full suite.
- **Phase 2 — the `scopes` surface (all 14 hooks).** Config blocks (§3), effective
  toolInput OR, gating of the stream paths on `scopes.conversation/reasoning`,
  `scopes.files` in normalize-file, State mapping extended (`Scopes←scopes`,
  `Exempt←toolResultsExempt`). *Arbiter*: build; per-hook smokes with the new
  scope-gate tests (§7.2); full suite.
- **Phase 3 — the overpass arms (both trees).** `tools/post-execute` + exemption
  list + prepend registration and the ccr ordering guard (§4.1); `agent/pre-step`
  + one-shot flag (§4.2); ledger strings. *Arbiter*: build; new overpass smokes
  (§7.3, §7.5, §7.8); full suite.
- **Phase 4 — the command + docs + parity sweep.** `normalize-overpass` command in
  all 14 hooks; command smoke (§7.6); batch-arm smoke (§7.4); the patch-level
  global-off fragment documented; final byte-equality pass of ets vs Classic
  strings. *Arbiter*: build; `node <tree>/smokes/<name>-smoke.mjs` for every touched
  smoke; full suite.

---

## 9. Acceptance

1. A volatile-only edit to `replacement`, `scopes.*`, or `toolResultsExempt`
   changes the next use with no remount, no new activation line, no listener gap.
2. Every scope is independently live-toggleable per hook; the grouped patch
   override turns the whole family off in one edit.
3. Tool results and step batches are normalized at the documented boundaries with
   the documented ledger strings; text blocks only; N=0 is a true no-op.
4. The durable transcript, assistant/tool history, and `llm/stream` requests are
   never rewritten.
5. All existing smokes pass byte-identically; every new behavior has an additive
   assertion; both trees assert byte-equal strings.
## 10. Risks

- **Volatile-update payload shape** — "changed paths as arrays of keys"
  (05-config.md:90) is documented, but the exact path notation for the nested
  `scopes` object should be confirmed against `vendor/loader/src/index.ts:34` in
  Phase 1 (the listener keys on the top-level key, robust to either notation).
- **ccr/normalize load order** — the prepend rule depends on bundle order; the
  marker-content guard (§4.1) makes any order safe, and the smoke locks the order in.
- **`pre-step` per-step re-sighting** — injected content is re-read each step;
  harmless (idempotent transforms) but doubles work in multi-step turns (R2 §7.2).
- **settings redaction/revision** — if `settings.mutate` refuses boolean patches
  (R1 §7.5), the command's `results on|off` falls back to reporting the settings-UI
  path; config remains the single source of truth either way.
- **Activation-line temptation** — adding scope fields to the `activated (…)` line
  (as R2 §6.1 sketched) would break the byte contract; this plan does NOT do it.

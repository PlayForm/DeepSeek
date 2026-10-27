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

# NORMALIZE-GRANULAR-PLAN - full-granularity normalization control for the DSH plugin family

Date: 2026-10-19.

Author: the PLAN agent (drafting lane).

Inputs: `Documentation/Researches/NORMALIZE-GRANULAR-CONFIG-RESEARCH.md` (R1) and
`Documentation/Researches/NORMALIZE-OVERPASS-RESEARCH.md` (R2).

Every code claim was verified on disk in this repo (`Classic/packages/`, `EffectTS/packages/`).

Harness-doc claims are anchored to
`/Users/nikola/Developer/Documentation/Module/deepseek-harness/docs/`.

---

## 1. Executive summary

Today the family normalizes two things only: model output (the six `llm/stream` flavors, gated by
`normalizeReasoning` / `normalizeToolArguments`) and files on explicit request (the `normalize-file`
tool).

The tool results in the transcript and the incoming step batch have no coverage (R1 §3, R2 §5.1).

Live toggling does not work.

`plugin-dsh-factory/Source/Function/Unwrap.ts:11-22` together with `State.ts:31,37-75` reduces every
volatile config cell to a snapshot taken at mount time.

A volatile-only edit therefore commits into the running reference of the loader and emits
`loader/volatile-update` (docs/cordis-tutorial/05-config.md:88-95), but it never arrives at the
State of the running plugin (R1 §4a).

This plan introduces three changes and mirrors them in both trees.

1. **The volatile fix.**

    The change is a base-plugin change that applies to both factories. `State` retains the `{ get }`
    cells of the raw config. It registers an instance-local `loader/volatile-update` listener that
    refreshes the affected State fields **IN PLACE**. Consumers, which already read
    `State.Replacement` and the other fields at use time, change nothing. The existing smokes stay
    byte-identical. The plan selects choice (b) of the two candidates, and §2 gives the rationale.

2. **The `scopes` config surface.**

    The change is a per-hook change across all 14 hooks. It adds a volatile `scopes` object
    `{ conversation, reasoning, toolInput, toolResults, files, batch }` that gates every arm of the
    hook, plus a configurable exemption list for the tool-results arm. The plan keeps
    `normalizeToolArguments` and ORs it in (§3).

3. **The overpass arms.**

    The change adds a `tools/post-execute` tool-results arm and an `agent/pre-step` step-batch arm
    per hook. It also adds a `normalize-overpass <scope>` human command. The arms touch text blocks
    only. When N=0 the arm passes the content through. The plan never rewrites the durable
    transcript (R2 §5).

The work runs in four phases (§8), and the deterministic build, the smokes, and the full serialized
suite arbitrate each phase.

---

## 2. The volatile fix (both factories)

### 2.1 The bug, precisely

`Unwrap.ts:11-22` walks the config one time and replaces every `{ get }` cell with `Value.get()`,
which is a snapshot taken at apply time.

`State.ts:31` gives that plain object to the State builder.

`State.ts:40-45` copies `Ledger←logFile`, `Enabled←log`, `List←exclude`, `Tool←mutationTools`, and
`Policy←policyFile`.

`State.ts:70-75` copies the module's own fields through the `fields` map (`Replacement←replacement`,
`Reasoning←normalizeReasoning`, `ToolArgs←normalizeToolArguments`).

A volatile-only edit does not run apply again (05-config.md:93), so `State.*` keeps the mount-time
values permanently.

The twins are identical: `EffectTS/packages/ets-plugin-dsh-factory/Source/ Function/Unwrap.ts` is
byte-identical, and `State.ts` differs only in the type imports.

Consumers already read State fields at use time.

Every stream wrapper reads `State.Replacement` per chunk (dash `Normalize.ts:71`), `Factory.Append`
reads `State.Enabled`/`State.Ledger` per call
(`plugin-dsh-factory/Source/Function/ Append.ts:24,27`), and the file hook reads `State.Replacement`
per tool call (`plugin-dsh-normalize-file/Source/Function/Normalize.ts:133`).

Only the State fields themselves are stale.

### 2.2 Decision: option (b) - in-place refresh via `loader/volatile-update`

- **(a) State holds the cells; consumers call `.get()`** - not selected.

    The change would alter the type of `State.Replacement`/`State.Ledger`/`State.Enabled` from plain
    values to accessors. That breaks every existing smoke assertion that reads them as values
    (`Classic/smokes/normalize-dash-smoke.mjs:167-176`, `:341`, `:424` and the same pattern in all 7
    per-tree hook smokes plus `core-smoke.mjs:923`). It would touch about 40 consumer read sites. It
    contradicts the byte-identical-assertions rule.

- **(b) State stays plain; a listener refreshes it in place** - selected.

    The event payload is "the changed paths as arrays of keys" (05-config.md:90;
    docs/cordis-api/inherited.md, `loader/volatile-update`), and the runtime dispatches it to the
    owning fiber only. The listener maps the changed keys back to State fields and reads the current
    value again from the retained cells.

### 2.3 Exact changes (file-level, both factories)

The edits land in `Classic/packages/plugin-dsh-factory/Source/Function/State.ts` and in the
`ets-plugin-dsh-factory` twin at the same lines, modulo the imports.

1. **Keep `Unwrap` as it is.**

    The function still produces the initial plain values. It is byte-identical in both trees today
    and stays that way.

2. **Retain the raw cells.**

    Build `const Cells = Config as Record<string, { get?: () => unknown }>`, and build a reverse map
    `Key→Field` from the fixed shared mappings (`logFile→Ledger`, `log→Enabled`, `exclude→List`,
    `mutationTools→Tool`, `policyFile→Policy`) plus the inverted `Setup.fields`
    (`replacement→Replacement`, ...).

3. **Register one listener on the plugin's own context.**

    The call is
    `Context.on("loader/volatile-update", (Paths) => { for each key path in Paths: const Field = Map[key]; if (Field && Cells[key]?.get) State[Field] = Cells[key].get(); })`.
    The listener is fiber-owned, so it is removed on unload. It is synchronous and never throws: a
    failed `.get()` keeps the previous value, the same defensive rule as `Unwrap.ts:15-19`. Unknown
    key paths are ignored. Nested paths (for example the future `scopes` object, §3) work because
    the map is keyed on the top-level key and the whole object cell is read again. An object
    volatile value is a frozen detached snapshot (05-config.md:93), so a wholesale re-read is
    correct.

4. **Consumers change not at all.**

    The returned object identity of `State.ts` is preserved through in-place field writes with no
    second `Object.assign`, so consumers that hold the State reference see the updates immediately.

The consumer inventory follows, and every entry keeps working unchanged, as a grep over both trees
verified: `State.Replacement` (per chunk in 6 Classic and 6 ets stream hooks;
`plugin-dsh-normalize-file/Normalize.ts:133`; dash `Write.ts:131`),
`State.Reasoning`/`State.ToolArgs` (the `Apply.ts` activation line of each hook plus
`Normalize.ts:71`), `State.Ledger`/`State.Enabled` (`Factory.Append`,
`ets-base-dsh/Source/Function/Append.ts:24,27`), `State.List` (`Gate.ts:68`), `State.Policy`
(governor `Resolve.ts:16-17`), and `State.Tool` (the mutation-tool check of the gate).

Apply emits the activation lines one time from the mount-time snapshot.

A later volatile edit does not emit another one, because no remount occurs, which is why the
existing byte assertions are safe.

Ledger and smoke implications: no activation line changes, and zero existing assertions change.

The only new behavior is that the _next_ use after a volatile edit sees the new value.

---

## 3. The `scopes` config surface (per-hook, all 14 hooks)

### 3.1 Verbatim schema for one hook (Classic dash; every other hook differs only in its existing fields - the `scopes` block is identical in all 14)

`Classic/packages/hook-dsh-normalize-dash/Source/Variable/Config.ts`, appended after the existing
fields:

```ts
	// Granular scope gates - ALL volatile (live toggling, no remount):
	// conversation=text/block-end, reasoning=its sub-gate, toolInput=tool-call
	// arguments arm, toolResults=tools/post-execute arm (§4.1), files=the
	// normalize-file tool (inert in stream flavors so one patch override drives
	// the whole family - §3.4), batch=agent/pre-step arm (§4.2).
	scopes: Schema.object({
		conversation: Schema.boolean().default(true).volatile(),
		reasoning: Schema.boolean().default(true).volatile(),
		toolInput: Schema.boolean().default(false).volatile(),
		toolResults: Schema.boolean().default(false).volatile(),
		files: Schema.boolean().default(true).volatile(),
		batch: Schema.boolean().default(false).volatile(),
	}).volatile(),
	// Tool-results exemption list (the name-exempt precedent of
	// lib-dsh-core/Source/Stream/Chunk.ts:19-32, made configurable): a result
	// whose Exec.name is listed passes through by identity.
	toolResultsExempt: Schema.array(Schema.string())
		.default(["read", "edit", "raw-write", "normalize-file", "ccr_retrieve", "subagent", "ask_user_question"])
		.volatile(),
```

The defaults match the current behavior.

The values are conversation and reasoning true (every stream hook rewrites text today), `toolInput`
false (the default of `normalizeToolArguments`), `toolResults` false (a new arm, opt-in), `batch`
false (a new arm, opt-in), and `files` true (consumed by normalize-file only).

The `scopes` object itself is declared volatile as well as its leaves, so one changed leaf emits one
update with the whole object read again (§2.3 step 3).

### 3.2 `normalizeToolArguments` compatibility - decision: keep and OR

The old field stays as it is today (plain, remount-on-change, dash `Config.ts:27-28`).

The hook computes the **effective** toolInput gate as `State.ToolArgs || State.Scopes.toolInput`.

It passes that value where `State.ToolArgs` goes today (`Normalize.ts:71`).

The `Apply.ts` activation line keeps reporting the _effective_ value, because the existing
`State.ToolArgs ? "on" : "off"` expression becomes the effective OR.

The _format_ is unchanged.

When the field is absent from old configs the value is identical, so the existing assertions stay
byte-identical.

Each `Config.ts` carries a deprecation note: new configs should use `scopes.toolInput`.

The plan makes no schema migration and no `deprecate()` call, because Cordis has no deprecation
helper in use in this repo, and the OR keeps every existing profile working.

### 3.3 Master toggle - decision: per-hook `scopes` + one patch-level override, no aggregator plugin

The plan answers R1's open question 2 and the master-toggle question of the task as follows: each
hook keeps its own `scopes`, because per-plugin granularity is the requirement.

The "easy global off" is **not** a new plugin or a family config object, since the factory's
`Compose(false, module)` is per-module by design (R1 §2.1 note).

It is a single grouped override block in the profile patch (`cordis.patch.yml`) that sets
`scopes: { conversation: false, reasoning: false, toolInput: false, toolResults: false, files: false, batch: false }`
on all seven entries at once.

One override fragment validates everywhere, because the `scopes` schema shape is identical in all 14
hooks.

Flipping it is live and silent, because every scope is volatile.

The plan adds this fragment to the family README and config docs, not to code.

A future aggregator plugin that reads and writes the seven entries through `configEditor.edit` (R1
§4b) is explicitly out of scope.

### 3.4 `replacement` stays per-hook

The `replacement` of each flavor (or its fixed table) is untouched.

Scopes change only _where_ the transform applies and never _what_ it does.

normalize-file gains the same `scopes` block and gates its tool body on `scopes.files`.

When the scope is off, the tool returns the unchanged `changed:false` result with no write and no
ledger line.

---

## 4. The overpass arms

Principle (R2 §5): overpass normalizes only what re-enters the model or lands in a file.

It never rewrites the durable transcript and never runs silently in the background on files.

### 4.1 The tool-results arm - `tools/post-execute`

- **Per-hook listener, not a shared dispatcher** - selected (R2 §7.1).

    The "one log per module" convention (R2 §6.1) means the ledger strings belong to the module, and
    `scopes.toolResults` plus `toolResultsExempt` are the module's own config. Each hook registers
    one listener in its `Apply.ts` next to the existing `llm/stream` registration:
    `Context.on("tools/post-execute", (Exec, Result, Next) => Overpass(Exec, Result, Next, State))`.

- **Semantics.**

    `next()` runs first, always (waterfall discipline, dash `Apply.ts:86-87`). If
    `State.Scopes.toolResults` is off, the arm returns the downstream decision untouched. The arm
    considers only an accepted, non-value-carrying decision (the ccr precedent,
    `hook-dsh-ccr/Source/Function/Apply.ts:209-218`). It rewrites only `type === "text"` content
    blocks and never tool-call or argument blocks (the execution-critical-JSON rule of
    `Chunk.ts:12-16`). The rewrite runs the hook's own single transform, and each flavor transforms
    only its own class, exactly like the stream arm, so dash normalizes dashes only. When N=0 the
    arm returns the decision unchanged with no ledger line (the normalize-file precedent,
    `Normalize.ts:135-137`). When N>0 the arm returns
    `{ kind: "accept", content: <rewritten blocks> }` and emits
    `overpass: normalized N char(s) in tool result <toolName> <callId>` through `Factory.Append`
    plus the `normalized` journal event (R2 §6.1; the format is otherwise identical to
    `plugin-dsh-normalize-file/Normalize.ts:146-148`).

- **Exemptions.**

    The list comes from `toolResultsExempt` (§3.1). `read` and `edit` are exempt because their text
    is byte-contracted (`old_string` must match the real file bytes, the same rationale as
    `Chunk.ts:21-32`). `raw-write` and `normalize-file` own their own normalization. `ccr_retrieve`
    returns stored raw payloads whose bytes are the retrieval contract (the ccr marker and hash
    round-trip). `subagent` and `ask_user_question` are exempt because their text is prompt or
    contract material that the delegating agent matched verbatim (the generalized name-exempt
    precedent).

- **Ordering rule vs the ccr arm** - selected: normalize first, compress second.

    The ccr hook registers `tools/post-execute` with `{ prepend: true }` and calls `Next()` before
    it decides (`hook-dsh-ccr/Source/Function/Apply.ts:27,201-218`), so its gate runs outermost
    today. The normalize hooks register their arm also with `{ prepend: true }`. Registration order
    follows the bundle load order, so the arm that prepends later is outermost. The bundle order of
    the family places the ccr hook before the normalize hooks, so the normalize arm lands outermost
    and the ccr gate compresses the _normalized_ bytes. The size stats of ccr then describe what the
    model actually sees, and the preview and marker text of ccr is never itself normalized. A
    defensive guard covers any load order: the normalize arm passes through unchanged when the
    downstream decision's content already contains the ccr spill marker bytes, so normalization
    never touches a ccr replacement. A smoke asserts the ordering (§7.5).

### 4.2 The step-batch arm - `agent/pre-step`

The arm is one per-hook listener, `Context.on("agent/pre-step", (Payload, Next) => ...)`, gated on
`State.Scopes.batch`.

- **Semantics** - selected, given that pre-step fires per step (R2 §7.2).

    The arm normalizes every incoming batch while `batch` is on (continuous mode). It also honors a
    one-shot arm that the command sets (§5) regardless of the scope value: when the one-shot is
    armed, the arm normalizes the next batch one time and clears the flag. The flag lives on the
    State object of the hook as a plain boolean, so it is volatile-edit safe and HMR-safe because
    State is rebuilt per mount. The arm rewrites only `type === "text"` text inside
    `Payload.messages` (`UserMessage[]`). When N=0 the arm calls plain `next()`. When N>0 the arm
    returns `{ kind: "enter", messages: <normalized> }` plus the ledger line
    `overpass: normalized N char(s) in step batch (turn T step S)` from
    `Payload.turn`/`Payload.step` (R2 §6.1). Re-normalizing injected content across steps is
    harmless, because the transforms are idempotent on their own output (ASCII-replacement maps are
    fixed points).

- **Scope of the rewrite.**

    The batch arm normalizes the _incoming_ batch only and never the assistant or tool history
    (append-only, R2 §3b).

### 4.3 What is explicitly NOT built

The plan does no `llm/stream` request rewriting (deep-frozen, R2 §2a).

It does no transcript rewriting (R2 §3b).

It does no background file watching (`plugin-dsh-normalize-file/Apply.ts:12-20`).

It does no `SurfaceOp.replace` use (compaction-owned, R2 §3b).

## 5. The command and the tool

- **Command.**

    Each of the 14 hooks in both trees registers the command in `Apply.ts` through
    `Context.commands.register({ name: "normalize-overpass", description: "Arm a one-shot overpass: 'files' <path...> | 'batch' | 'results on|off' | 'scopes'", handler })`.
    The service contract is `register(definition: CommandDefinition): () => void`, the name is
    lowercase without a slash, and the handler parses `rawInput`
    (docs/subsystems/commands.md:31-57,143-150; capability-seams.md:675). The handlers work as
    follows. `files <path...>` runs the normalize-file pipeline (`Function/Normalize`) per path
    through `Factory.Write` and writes the ledger line
    `overpass: swept K file(s), normalized M char(s)` (R2 §6.1); only the normalize-file hook
    implements the sweep and the other flavors decline that scope. `batch` sets the one-shot batch
    flag (§4.2). `results on|off` flips `scopes.toolResults` through
    `ctx.configEditor.edit`/`ctx.settings.update` when present, and otherwise reports the
    settings-UI path. The command never mutates State directly, because config stays the single
    source of truth (R1 §4b). `scopes` reports the current effective values (read-only).

- **Tool.**

    The existing `normalize-file` tool stays exactly as it is
    (`plugin-dsh-normalize-file/Apply.ts:6,15-22`), now gated by `scopes.files`. The plan adds no
    tool, because R2 §4c concluded that an extra tool adds nothing the command and the config cells
    do not already provide.

---

## 6. EffectTS parity

Every change is mirrored in the `ets-*` tree.

`ets-plugin-dsh-factory/Source/Function/State.ts` gains the identical `loader/volatile-update`
refresh listener; the file differs from Classic only in the type imports today, and it stays that
way.

Each `ets-hook-dsh-normalize-*/Source/ Variable/Config.ts` gains the byte-identical `scopes` and
`toolResultsExempt` block, byte-identical to the Classic twins except the factory import line today
(R1 §2.2), and it stays so.

Each ets `Apply.ts` gains the same two overpass listeners and the command.

The R7c Gate already reads State per use, so no further ets-side change is needed beyond the shared
factory (R1 §7.4).

Ledger strings stay byte-identical in both trees (R2 §5.5), so the ets smokes assert byte-equality
against the Classic strings.

---

## 7. Smoke plan (additive only; zero changes to existing assertions)

The pattern is a fake ctx plus the real factory (`plugin-system`/`smoke-writing` discipline).

The new assertions go per tree, additive at the end of each existing smoke file.

1. **Volatile live-flip.**

    This is the key new smoke, and it proves the fix. In each hook smoke, after `Run1` (mount),
    dispatch the fake `loader/volatile-update` event with the changed key; the event registry of the
    fake ctx exposes the listener that the factory registered. Then assert that the next use picks
    the new value up. Flip `replacement` and the next stream chunk normalizes with the new
    replacement without a remount. Flip `scopes.toolInput`/`conversation` and the gate of the next
    chunk changes. Assert that `State.Replacement` itself was mutated **IN PLACE** and that the
    identity of the State object is preserved.

2. **Scope gates.**

    Test the on and off pair of every scope. Conversation off makes a text-delta pass by identity
    (count 0). Reasoning off makes a reasoning-delta pass. The toolInput effective-OR test shows
    that `normalizeToolArguments: true` with `scopes.toolInput: false` still normalizes, and that
    both off does not. Files off makes the normalize-file tool return `changed:false` without
    touching the file.

3. **Tool-results arm.**

    Test accept-with-content normalization of a text block: in the dash smoke an em-dash payload
    becomes `accept` with rewritten content and the ledger line
    `overpass: normalized N char(s) in tool result <toolName> <callId>`. An exempt tool name
    (`read`) passes through. Non-text blocks stay untouched. An N=0 payload returns the bare
    decision unchanged with no ledger line. A value-carrying decision stays untouched.

4. **Batch arm.**

    An `agent/pre-step` call with curly quotes returns `enter` with normalized messages plus the
    ledger line `overpass: normalized N char(s) in step batch (turn T step S)`. A scope that is off
    passes through. A one-shot arm from the command normalizes exactly one batch and then clears.

5. **Ordering.**

    Use a fake ctx with both the ccr-style prepended listener and the normalize arm. Assert that the
    normalize arm runs before the compression decision and that marker-bearing content passes
    through the normalize arm unchanged.

6. **Command.**

    Register through the fake ctx, invoke the handler, and assert the one-shot flag, the sweep
    result, and the read-only report.

7. **Ledger contract.**

    Byte-assert all new lines. Every pre-existing assertion (activation lines,
    `normalized N ... char(s) in one stream`, `... in <path>`) stays untouched and still passes.

8. **History safety.**

    Assert zero writes to any session-log surface from the overpass paths (R2 §6.2.5).

---

## 8. Phases with arbiters

The workspace is serialized (`pnpm run test --workspace-concurrency=1`).

The arbiter of each phase is the deterministic build, then the named smokes, then the full suite.

- **Phase 1 - the volatile fix (both factories).**

    The work adds the `State.ts` refresh listener and the retained cells in `plugin-dsh-factory` and
    `ets-plugin-dsh-factory`, and adds the live-flip smoke to the coverage of both trees. _Arbiter_:
    build; `node Classic/smokes/normalize-dash-smoke.mjs` plus `normalize-file-smoke.mjs` and the
    ets twins, which already assert the unwrap behavior and must still pass byte-identically along
    with the new flip assertions; full suite.

- **Phase 2 - the `scopes` surface (all 14 hooks).**

    The work adds the config blocks (§3), the effective toolInput OR, the gating of the stream paths
    on `scopes.conversation/reasoning`, `scopes.files` in normalize-file, and the extended State
    mapping (`Scopes←scopes`, `Exempt←toolResultsExempt`). _Arbiter_: build; per-hook smokes with
    the new scope-gate tests (§7.2); full suite.

- **Phase 3 - the overpass arms (both trees).**

    The work adds `tools/post-execute` with the exemption list, the prepend registration, and the
    ccr ordering guard (§4.1), plus `agent/pre-step` with the one-shot flag (§4.2) and the ledger
    strings. _Arbiter_: build; new overpass smokes (§7.3, §7.5, §7.8); full suite.

- **Phase 4 - the command + docs + parity sweep.**

    The work adds the `normalize-overpass` command in all 14 hooks, the command smoke (§7.6), the
    batch-arm smoke (§7.4), the documented patch-level global-off fragment, and the final
    byte-equality pass of the ets strings against the Classic strings. _Arbiter_: build;
    `node <tree>/smokes/<name>-smoke.mjs` for every touched smoke; full suite.

---

## 9. Acceptance

1. **Live volatile edits.**

    A volatile-only edit to `replacement`, `scopes.*`, or `toolResultsExempt` changes the next use
    with no remount, no new activation line, and no listener gap.

2. **Independent scopes.**

    Every scope is independently live-toggleable per hook, and the grouped patch override turns the
    whole family off in one edit.

3. **Boundary coverage.**

    Tool results and step batches are normalized at the documented boundaries with the documented
    ledger strings, text blocks only, and N=0 is a true no-op.

4. **History is read-only.**

    The durable transcript, the assistant and tool history, and the `llm/stream` requests are never
    rewritten.

5. **Byte parity.**

    All existing smokes pass byte-identically, every new behavior has an additive assertion, and
    both trees assert byte-equal strings.

## 10. Risks

- **Volatile-update payload shape.**

    "Changed paths as arrays of keys" (05-config.md:90) is documented, but Phase 1 should confirm
    the exact path notation for the nested `scopes` object against `vendor/loader/src/index.ts:34`.
    The listener keys on the top-level key, so it is robust to either notation.

- **ccr/normalize load order.**

    The prepend rule depends on the bundle order. The marker-content guard (§4.1) makes any order
    safe, and the smoke locks the order in.

- **`pre-step` per-step re-sighting.**

    The arm re-reads injected content each step. This is harmless because the transforms are
    idempotent, but it doubles the work in multi-step turns (R2 §7.2).

- **settings redaction/revision.**

    If `settings.mutate` refuses boolean patches (R1 §7.5), the `results on|off` command falls back
    to reporting the settings-UI path. Config remains the single source of truth either way.

- **Activation-line temptation.**

    Adding scope fields to the `activated (...)` line (as R2 §6.1 sketched) would break the byte
    contract, and this plan does not do it.

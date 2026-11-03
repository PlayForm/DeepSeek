# @playform/hook-dsh-test-suggester

> v0.2.1 - UNPUBLISHED - plan:
> [SEARCH-SUGGESTER-PLUGIN](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md)

## The role

The test-suggester hook is a DeepSeek Harness plugin that answers the **test task intent** with a
target set.

When the model searches for proof (a grep for `PASS`/`FAIL`/`error TS`, a read of a `Test.ts`, a
bash error sweep), the hook names the files the session touched right after this one in this
workspace, **before** the model finishes searching.

The candidates come from the agent's **own previous tool calls**, never from a literal built-in
pack. A pack is an explicit user/repo override only (see below).

It is the test consumer of the suggester family
([SEARCH-SUGGESTER-PLUGIN.md](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md), sections 3, 4,
8): a hook with no public API, one delivery surface, and a deterministic classifier in the hot path.

## How it works

1. **The history fold.**

    The fold is a `ctx.sessionProjections` unit (key `testHistory`): the registry subscribes to
    `session/event` once and passes every committed event through the unit's `apply`, which turns
    each `tool/call` that names a path into one `Touch` (the sequence number, the normalized path
    and the tool) in that session's cell, capped at 512 touches. Reads count, because every
    committed call is folded.

    The history is keyed per session and rebuilt from the log on first touch. The hook holds no
    subscription of its own: a raw `ctx.on("session/event", ...)` listener received nothing in the
    live harness, and the projection registry is the supported plugin-facing form of that seam. The
    unit is registered through the optional `ctx.inject(['sessionProjections'], ...)` form, so a
    mount without the registry still loads and simply has no history.

2. **The post-execute listener.**

    The `tools/post-execute` listener (waterfall, plain registration, running **after** the CCR's
    `{ prepend: true }` listener) calls `next()` first.

    Then the reconciliation runs, the session history is read through `stateOf(session, key)` and
    folded into one synthetic family, the deterministic classifier and the gate apply, and **one**
    `additionalContexts` notice is prepended to the downstream decision.

    It appends nothing to the history: the current call's `tool/call` is committed before dispatch,
    so the state it reads already carries the anchor's prior touches.

    Content is never replaced, so a ccr-compressed result is unaffected.

3. **The pre-step listener.**

    The `agent/pre-step` listener resets the note counter each turn when a user message enters.

Every listener is fail-open: on any error a warning is logged and the downstream decision is
returned unchanged.

The registered listener list is exactly `loader/volatile-update`, `tools/post-execute` and
`agent/pre-step`; the projection unit registers separately, on `ctx.sessionProjections`.

A note never fails a tool call.

## The candidates (the session history)

On a judged call, `Adjacent(touches, callPath, { limit: maxCandidates })` scores the paths that
followed the anchor within a window of 8 calls: `1 / (1 + distance)` per occurrence, one count per
occurrence.

A repeatedly co-touched path outranks a single one, and a near neighbor outranks a far one.

Those rows become ONE synthetic `History` family (priority 0, threshold 0.75, one signal of weight
2.5, companions with prior 0.6 and the reason `touched <count> time(s) after this file`), so the
existing deterministic classifier, existence filter, gate and note judge it exactly like a pack row.

Its confidence is `k = sigmoid(2.5 - 0.6) = 0.87`.

## The pack override

The families are **pack-driven only when a pack is explicit**: `<repo>/.dsh/pack.yml` (or
`.yaml`/`.json`) or the user-layer pack at `~/.dsh/playform/workspaces/<slug>.yml`.

The listener resolves it with `Resolve(root, { home, builtin: false })`, so the literal built-in
pack is never a candidate source.

A repository that ships a pack gets its OWN `test/` families, placed after the synthetic `History`
family, and they drive the same classifier and note.

A repository that ships no pack and has no session history abstains with the byte-exact line
`abstained no-history  0.00`.

## The reconciliation

On a judged call in a package, the **smoke claims** of the package are reconciled with the tree it
actually has (the wave 2c re-spec of the completion spec,
[03-SUGGESTERS.md](../../Documentation/Plans/Completion-Spec/03-SUGGESTERS.md)).

The evidence is each `## Expected count` of `Source/Test/<Folder>/README.md`, the folders that
exist, each `Test.ts` of a folder, the roster of the aggregate runner
(`Target/Test/<Folder>/Test.js`), and, when the workspace graph service is present, its `Test` nodes
for the package.

A drift (a folder without a README count, a README count whose `Test.ts` is gone, a suite the runner
never runs, a graph node whose file is gone) emits ONE note naming the drifted files and the
expected/actual counts.

It is **read-only**: `node:fs` reads, never a write.

A consistent tree logs one clear line per package root and stays silent, and the note is gated
exactly like the candidate notes (`enabled`, cooldown, dedupe, per-turn cap).

The reconciliation runs before the candidates: a drift takes the call, and the candidate note yields
to the next call.

## The noise controls

- **Confidence gate.** `k ≥ max(threshold, family threshold)` for an explicit pack (default 0.75);
  the synthetic `History` family carries its own 0.75.
- **Cooldown.** No second note for the same family within `cooldownCalls` (6) judged calls, per
  agent.
- **Per-turn cap.** At most `maxNotesPerTurn` (3) notes between user turns.
- **Exclusion.** Candidates under `Target/`, `node_modules`, `.git`, `dist` are never suggested,
  because the build mirror is generated and never edited.
- **Fail-open and abstention.** An empty surviving candidate set logs
  `<name>: abstained ambiguous <Family> <k>` and emits nothing.
- **Workspace gate.** The root is PACK-INDEPENDENT: the nearest ancestor of the call path carrying
  `.git` or `package.json`, from the call path plus the session cwd. A call that belongs to another
  workspace logs `abstained foreign-workspace  0.00` and emits nothing, and a target absent from the
  workspace is dropped before the gate (`abstained no-companions` when the whole target set of the
  family is gone).

Every activation, refusal, and suggestion is a ledger line in the own ledger of the hook (one log
per module), asserted byte-exactly by the end-phase smokes.

## The ledger

```
test-suggester: activated (bundle 0.2.1, history, threshold 0.75)
test-suggester: disabled (enabled=false)
test-suggester: suggest History 0.87 2 candidates call read
test-suggester: abstained ambiguous History 0.87
test-suggester: abstained no-companions History 0.87
test-suggester: abstained foreign-workspace  0.00
test-suggester: abstained no-history  0.00
test-suggester: suppressed cooldown History
test-suggester: suppressed cap History
test-suggester: reconciliation clear <package> (<e> expected, <a> actual)
test-suggester: reconciliation drift <n> drifts <package> (<e> expected, <a> actual) call <tool>
test-suggester: reconciliation skipped deduped <package>
test-suggester: reconciliation skipped cooldown <package>
test-suggester: reconciliation skipped cap <package>
```

## The configuration

See [SCHEME.md](./SCHEME.md) for the full table.

Every knob is volatile (hot-editable without remounting).

The hook ships **disabled** (`enabled: false` in `cordis.patch.yml`), because the acceptance rate
must be measured (the §10.3 kill criterion of the plan) before it is trusted.

## The plan

The package, the Source, the smoke suites (five folders), and the build pass are complete, the
reconciliation landed (the wave 2c re-spec of the completion spec), and the candidates now come from
the session history with the pack as an explicit override only.

The ETS twin and the live activation (the profile row flip and the restart) are the remaining
end-phase steps (Documentation/Plans/POC-BRIEF.md section 8).

- [SEARCH-SUGGESTER-PLUGIN](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md) - sections 3, 4,
  8, the test consumer.

## License

CC0-1.0.

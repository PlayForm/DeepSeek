# @playform/hook-dsh-search-suggester

> v0.3.0 - UNPUBLISHED - plan:
> [SEARCH-SUGGESTER-PLUGIN](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md)

## The role

The search-intent **target suggester** serves the
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin family (the Classic
release).

A DeepSeek Harness plugin hooks the **`tools/post-execute` waterfall** and, when a search-class call
(`grep`, `glob`, `read`, or a search-shaped `bash`) matches one of the ten intent kinds, prepends
ONE labeled `additionalContexts` note naming the likely target set (the standard locations where
that intent lives in this repo) **before** the model burns the searches.

Plan: [SEARCH-SUGGESTER-PLUGIN.md](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md).

## The surfaces

- The `tools/post-execute` waterfall listener (plain registration, after the ccr's `{prepend: true}`
  listener) adds one `additionalContexts` note and never a content replacement.
- The `suggestion_dismiss` tool (registered through the loader's tool API when the host exposes
  `ctx.tools`) keeps the durable dismissal record.
- The optional second surface (`sectionMode: "sticky"`, off by default) adds one
  `system-prompt/assemble` section, rebuilt on a TTL and invalidated on `tools/change`.
- The knowledge file (`persistPath`, `~/.dsh/search-suggester/knowledge.json`) is written
  atomically.
- No service is provided, and the optional `ctx.workspaceGraph` is probed through `ctx.get` (no
  inject).

## Why

In the measured sessions, 46% of every tool call is a search-class call, and the discovery is late:
in the release lane only 6% of the files the model eventually edited had been read before its first
edit.

The repetition is not mostly literal but semantic, because the same intent is reached through a
dozen different literals and a hundred different paths.

The deliverable is not a better search but a **target set**: a compact, ordered, intent-keyed list
of the standard locations, delivered at the first call of an intent.

## The intents

Ten kinds run in priority order (destructive first): `Version`, `Path`, `Ledger`, `Config`,
`Dependency`, `Test`, `Symbol`, `Doc`, `Usage`, `Owner`.

Each kind is a pack row: its signal table (regex rules with weights), its per-intent threshold
(`0.85` for the destructive `Version`/`Path`/`Ledger`, `0.75` for the rest), and its ordered
candidate set, where each candidate is a path or glob with a prior and **one reason phrase** ("the
monorepo manifest", "the const Version", "the build mirror - never edit").

A candidate without a reason is not emitted.

The intents are **pack-driven**: the built-in pack (this monorepo's default) lives in
[`@playform/lib-dsh-pack`](../lib-dsh-pack) and is projected here as the `search/` domain.

A repository that ships `.dsh/pack.yml` (or a user-layer pack at
`~/.dsh/playform/workspaces/<slug>.yml`) gets its OWN `search/` intents, and a repository without a
pack stays silent.

## The gate

`k = sigmoid(sum(weights) + b)`, `b = -0.6`, so a single weak signal never crosses the default
threshold.

The noise control uses a cooldown (no second note for the same intent within `cooldownCalls`), a
dedupe (the same intent + candidate set is one note), a per-turn cap (`maxNotesPerTurn`), and the
already-recent filter.

Every abstention and suppression is a ledger line, so the precision is measured, not assumed.

The algebra's identity element is silence.

## The delivery

One note, never a content replacement: the post-execute listener runs AFTER the ccr's
`{prepend: true}` listener and only adds `additionalContexts`, so a ccr-compressed result is
unaffected.

The note carries the plugin's own source label
(`{kind: "search-suggester", form: "notice", summary}`), because an unlabeled context would render
as a user prompt in derived history.

The optional second surface (`sectionMode: "sticky"`, off by default) is one
`system-prompt/assemble` section carrying the current intent's target list, rebuilt on a TTL and
invalidated on `tools/change`.

## The graph projection (P2)

The plan's generated repo index is superseded by a projection of the workspace graph (the approved
re-spec, Completion-Spec/03-SUGGESTERS.md section 3): the optional `ctx.workspaceGraph` is probed
through `ctx.get` (no inject, so a repo without the graph still emits) and one `snapshot()` read
becomes the projection.

A candidate's literal score is the graph's proof (the node exists, its kind matches the intent's
expected kinds, and its recency is the node's version-token rank), and its scope is the path's depth
tier (the plan's 1.0 / 0.7 tiers).

When the graph is absent or empty, the candidate scores the documented **neutral** literal `0.5` and
scope `1.0` (the PoC values, byte-identical).

The projection is cached and rebuilt on `tools/change` while `refreshOnBoot` holds.

The sticky section renders the projected index (the top graph paths per intent) instead of the
static pack list whenever the graph proves a candidate.

The projection adds **no** ledger string, because the note and the section are the evidence.

## The learning

Two layers exist, both deterministic and LLM-free:

- the **offline seed** (`Function/Seed`) runs at load and warms the knowledge from the built-in
  pack's canonical candidates (prior 1.0) plus the graph projection (a proven candidate is seeded
  twice).

    It never overwrites an existing row, does not save (the next real write persists it), and is
    switched off by `learn: false` or `seed: false`;

- the **online learning**: after a note, a candidate the model actually touches within the window is
  a `followed` (counts move, the journal closes), and an untouched window closes as `ignored`.

    The knowledge file (`persistPath`, `~/.dsh/search-suggester/knowledge.json`) is written
    atomically (temp + rename, mode 0600) and bounded, and a corrupt file degrades to the cold
    start, because the static pack alone is enough to emit.

## The dismissal

The `suggestion_dismiss` tool (registered through the loader's tool API when the host exposes
`ctx.tools`) records a durable dismissal: pass the suggestion family (the intent id a note named)
and optionally one candidate path.

A family dismissal suppresses the note (`suppressed dismissed <Intent>`), and a path dismissal drops
that candidate.

The record line is `dismissed <Intent> <path|*>`.

The dismissal lives in the knowledge file and expires after `dismissTtl` seconds (default 86400),
with no timer because the read prunes it.

## The benchmark

The fixed fifty-call replay (`Variable/Sequence`) runs through the real built listener and is scored
by `Function/Benchmark`: the recorded baseline is
`calls=50 notes=5 precision=1.00 recall=0.70 first-note=1`.

The `Source/Test/Benchmark` folder asserts the numbers and their determinism, so a rule change that
loses a target shows up as a recall drop.

## The waterfall discipline

`next()` is always awaited first, pass-through returns the downstream decision unchanged, and the
whole transform is fail-open (an internal error logs a warning and the decision passes through, so a
note never fails a tool call); registration is plain, after the ccr and the normalize family.

The `write`/`edit`/`raw-write` calls are learning signals only, because a note after the edit is too
late.

## The ledger

The lines go to `logFile` (the factory's `Append`; each line is `[<ISO>] <message>`):

```text
activated (... intents <n> ... threshold <k>)
suggest <intent> <k> <n> targets <path>
suppressed <reason> <intent>
abstained foreign-workspace
abstained no-companions <intent> <k>
followed <intent> <path>
ignored <intent>
dismissed <intent> <path|*>
section rebuilt (ttl <n>)
```

## The configuration

See [SCHEME.md](./SCHEME.md) for the full schema.

Every tuning knob is volatile (hot-editable, no remount), the structural knobs (`persistPath`,
`refreshOnBoot`) remount on edit, and `indexPath` is retired by the P2 re-spec (kept so an existing
profile loads unchanged).

The plugin ships **disabled**, so enable it by explicit ACTIVATE in the profile.

## The build and the tests

The build is `pnpm prepublishOnly` (Source/prepublishOnly.sh): the plugin build (ESM `Target/`, Test
tree excluded), the Test build, the harness selfcheck, and the Test type-check.

Fifteen folders live under `Source/Test/`, each standalone and under `Maintain/Run-Smokes.mjs`, each
with its own `## Expected count`:

- the five original folders (Pack-Driven, Post-Execute-And-Learning, Sticky-Section-And-Ring,
  Wiring-And-Ledger, Workspace-Gate),
- the four capability folders of this wave (Projection, Dismiss, Seed, Benchmark),
- the plan's nine suites, of which three are covered by the original folders (Delivery-And-Label and
  Learning-Update by Post-Execute-And-Learning, Ledger by Wiring-And-Ledger) and six are added here
  (Classification, Threshold-And-Cooldown, Abstention, Persistence, Index-Refresh, Noise).

The aggregate prints 126 PASS.

## The plan

- [SEARCH-SUGGESTER-PLUGIN](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md) - the pattern
  algebra.
- [Completion-Spec/03-SUGGESTERS](../../Documentation/Plans/Completion-Spec/03-SUGGESTERS.md) - the
  approved re-spec (section 3, the graph projection).

## License

CC0-1.0.

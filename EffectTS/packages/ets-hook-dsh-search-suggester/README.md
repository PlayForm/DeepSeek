# @playform/hook-dsh-search-suggester

> v0.2.1 - UNPUBLISHED - plan:
> [SEARCH-SUGGESTER-PLUGIN](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md)

## The role

The search-intent **companion suggester** for the
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin family (the Classic
release).

It is a DeepSeek Harness plugin that hooks the **`tools/post-execute` waterfall** and, when a
search-class call (`grep`, `glob`, `read`, or a search-shaped `bash`) lands on a path whose session
history knows the next files, prepends ONE labeled `additionalContexts` note naming them.

That target set is what the agent itself touched right after a similar call in this workspace,
delivered **before** the model burns the searches.

The candidates come from the agent's **own previous tool calls**, never from a literal built-in
pack. A pack is an explicit user/repo override only (see below).

Plan: [SEARCH-SUGGESTER-PLUGIN.md](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md).

## Why

In the measured sessions, 46% of every tool call is a search-class call, and the discovery is late:
in the release lane only 6% of the files the model eventually edited had been read before its first
edit.

The repetition is not mostly literal; it is semantic, with the same intent reached through a dozen
different literals and a hundred different paths.

The deliverable is not a better search but a **target set**: the companions this workspace's own
history proves, delivered at the first call of a task.

## The candidates (the session history)

The `session/event` listener folds every `tool/call` event into the session's history: one touch per
call (the sequence number, the normalized path and the tool), capped at 512, oldest first.

On a judged call, `Adjacent(touches, anchor, { limit: maxCandidates })` scores the paths that
followed the anchor within a window of 8 calls: `1 / (1 + distance)` per occurrence, one count per
occurrence.

The anchor is the call's own `path`/`file_path` argument when it carries one, otherwise the
directory of the call's path-shaped target argument, otherwise the session cwd.

A repeatedly co-touched path outranks a single one, and a near neighbour outranks a far one.

Those rows become ONE synthetic `History` family (priority 0, threshold 0.75, one signal of weight
2.5, companions with prior 0.6 and the reason `touched <count> time(s) after a similar call`), so
the existing deterministic classifier, existence filter, scorer and decision record judge it exactly
like a pack row.

Its confidence is `k = sigmoid(2.5 - 0.6) = 0.87`.

## The pack override

The families are **pack-driven only when a pack is explicit**: `<repo>/.dsh/pack.yml` (or
`.yaml`/`.json`) or the user-layer pack at `~/.dsh/playform/workspaces/<slug>.yml`.

The listener resolves it with `Resolve(root, { home, builtin: false })`, so the literal built-in
pack is never a candidate source.

A repository that ships no pack and has no session history abstains with the byte-exact line
`abstained no-history  0.00`.

A repository that ships a pack gets its OWN `search/` families, placed after the synthetic `History`
family, and they drive the same classifier and note.

## The gate

`k = sigmoid(sum(weights) + b)`, `b = -0.6`, so a single weak signal never crosses the default
threshold.

The noise control combines a cooldown (no second note for the same family within `cooldownCalls`), a
dedupe (the same family + candidate set is one note), a per-turn cap (`maxNotesPerTurn`), and the
already-recent filter.

Every abstention and suppression is a ledger line, so the precision is measured, not assumed.

The identity element of the algebra is silence.

## The delivery

One note, never a content replacement: the post-execute listener runs AFTER the ccr's
`{prepend: true}` listener and only adds `additionalContexts`, so a ccr-compressed result is
unaffected.

The note carries the own source label of the plugin
(`{kind: "search-suggester", form: "notice", summary}`), because an unlabeled context would render
as a user prompt in derived history.

The optional second surface (`sectionMode: "sticky"`, off by default) is one
`system-prompt/assemble` section carrying the last family's target list, rebuilt on a TTL and
invalidated on `tools/change`.

## The graph projection (P2)

The generated repo index of the plan is superseded by a projection of the workspace graph (the
approved re-spec, Completion-Spec/03-SUGGESTERS.md section 3): the optional `ctx.workspaceGraph` is
probed through `ctx.get` (no inject, because a repo without the graph still emits) and one
`snapshot()` read becomes the projection.

A candidate's literal score is the proof of the graph (the node exists, its kind matches the
expected kinds of the family, and its recency is the version-token rank of the node), and its scope
is the depth tier of the path (the plan's 1.0 / 0.7 tiers).

When the graph is absent or empty, the candidate scores the documented **neutral** literal `0.5` and
scope `1.0` (the PoC values, byte-identical).

The projection is cached and rebuilt on `tools/change` while `refreshOnBoot` holds.

The sticky section renders the projected index (the top graph paths for the family) instead of the
plain candidate list whenever the graph proves a candidate.

The projection adds **no** ledger string, because the note and the section are the evidence.

## The learning

Two layers, both deterministic and LLM-free.

- **The offline seed** (`Function/Seed`) runs at load and warms the knowledge from the canonical
  candidates of an EXPLICIT pack (prior 1.0) plus the graph projection (a proven candidate is seeded
  twice).

    The built-in pack is retired, so a repo without an explicit pack seeds nothing.

    It never overwrites an existing row, does not save (the next real write persists it), and is
    switched off by `learn: false` or `seed: false`.

- **The online learning**: after a note, a candidate the model actually touches within the window is
  a `followed` (counts move and the journal closes), while an untouched window closes as `ignored`.

    The knowledge file (`persistPath`, `~/.dsh/search-suggester/knowledge.json`) is written
    atomically (temp + rename, mode 0600) and bounded, and a corrupt file degrades to the cold
    start, where the session history alone is enough to emit.

## The dismissal

The `suggestion_dismiss` tool (registered through the tool API of the loader when the host exposes
`ctx.tools`) records a durable dismissal: pass the suggestion family (`History`, or a family of the
repo's own pack) and optionally one candidate path.

A family dismissal suppresses the note (`suppressed dismissed <Family>`), and a path dismissal drops
that candidate.

The record line is `dismissed <Family> <path|*>`.

The dismissal lives in the knowledge file and expires after `dismissTtl` seconds (default 86400),
with no timer because the read prunes it.

## The benchmark

The fixed fifty-call replay (`Variable/Sequence`) runs through the real built listener with a seeded
session history per lane, is scored by `Function/Benchmark`, and the recorded baseline is
`calls=50 notes=5 precision=1.00 recall=1.00 first-note=1`.

The expected set IS the seed, so a change that loses a companion shows up as a recall drop.

## The waterfall discipline

`next()` is always awaited first, pass-through returns the downstream decision unchanged, and the
whole transform is fail-open: an internal error logs a warning and the decision passes through, so a
note never fails a tool call.

The registration is plain, after the ccr and the normalize family.

The `write`/`edit`/`raw-write` calls are learning signals only, because a note after the edit is too
late.

## The configuration

See [SCHEME.md](./SCHEME.md) for the full schema.

Every tuning knob is volatile (hot-editable, no remount); the structural knobs (`persistPath`,
`refreshOnBoot`) remount on edit, and `indexPath` is retired by the P2 re-spec (kept so an existing
profile loads unchanged).

`intents` filters only an explicit pack's families; the synthetic `History` row is never filtered.

Ships **disabled**: enable by explicit ACTIVATE in the profile.

## The build and the tests

Fifteen folders under `Source/Test/`, each standalone and under `Maintain/Run/Smokes/Index.mjs`,
each with its own `## Expected count`:

- the five original folders (Pack-Driven, Post-Execute-And-Learning, Sticky-Section-And-Ring,
  Wiring-And-Ledger, Workspace-Gate);
- the four capability folders (Projection, Dismiss, Seed, Benchmark);
- the six added suites (Classification, Threshold-And-Cooldown, Abstention, Persistence,
  Index-Refresh, Noise).

Every candidate scenario seeds the session history (or writes an explicit `.dsh/pack.yml`), and
every silence asserts the `no-history` line - no suite names a built-in pack literal.

The aggregate prints 126 PASS.

## The plan

- [SEARCH-SUGGESTER-PLUGIN](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md) - the pattern
  algebra.
- [Completion-Spec/03-SUGGESTERS](../../Documentation/Plans/Completion-Spec/03-SUGGESTERS.md) - the
  approved re-spec (section 3, the graph projection).

## License

CC0-1.0.

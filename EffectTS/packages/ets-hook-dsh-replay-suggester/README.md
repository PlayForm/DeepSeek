# @playform/hook-dsh-replay-suggester

> v0.2.1 - UNPUBLISHED - plan:
> [SEARCH-SUGGESTER-PLUGIN](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md)

## The role

The replay-suggester hook is a DeepSeek Harness plugin that answers the question **"the last time
this was done, what did the model actually touch and how did it verify?"**
([SEARCH-SUGGESTER-PLUGIN.md](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md) §9.3).

When the model searches with an intent it has pursued before, the hook recalls the matching record
from the agent's OWN previous tool calls and prepends ONE labeled `additionalContexts` notice: the
files touched last time and the verification command.

- **The candidates come from the recall, never from a literal pack.** The recall names the files
  that accompanied a similar prior call, and the hook synthesizes that record into one `Repeat`
  family per call, so the classifier, the gate and the note treat it exactly like a pack family.
- **The recall is validated against the tree.** The store is cross-session by design, so a record
  may name a path that no longer exists, a bare directory, or the call's own anchor. The anchor is
  excluded and only existing regular files are named, so a missing path and a directory are never
  named. A recalled file in the anchor's OWN directory wins outright and the rest are dropped
  (precision first); without one, same-tree paths (Classic with Classic, EffectTS with EffectTS)
  rank first; a record with no surviving file abstains `no-companions`.
- **The recall store has a producer** (the wave 2c re-spec,
  [03-SUGGESTERS.md](../../Documentation/Plans/Completion-Spec/03-SUGGESTERS.md)).

    Every judged call is recorded, and a later call recalls the paths that accompanied a similar
    prior call.

    The producer's store is its own (the `replay_history` storage domain, or the JSON fallback
    beside the seeded store).

- **The seeded store is an OPTIONAL user seed.** `~/.dsh/replay-suggester/history.json` is the seed
  of the journal of the search-suggester per §9.3, it is read-only, it is loaded once at apply, and
  it keeps precedence when it matches.

    A missing or corrupt store degrades to silence with a ledger line, never to a guess, and the
    live history still speaks.

- **Without a record and without an explicit pack the hook abstains** (`replay no-history`), because
  a replay answer without a record is a guess and the plan forbids the guess (§2.4).
- **Privacy posture (plan §5.4).** Repo-relative paths only, no file contents, no user text, local
  only.

## How it works

1. **The post-execute listener.**

    The `tools/post-execute` listener (waterfall, plain registration, after the ccr's
    `{prepend: true}` listener) calls `next()` first.

    Then the hook runs record (the producer) -> recall (the seeded store, then the live history) ->
    the synthesized `Repeat` family -> the explicit pack -> detect -> gate -> prepend ONE notice.

    Content is never replaced.

2. **The pre-step listener.**

    The `agent/pre-step` listener resets the note counter each turn when a user message enters.

## The recall store (the producer)

On every judged call that names a path, the hook appends one entry
`{ seq, path, intent, outcome, at, probe }` to the recall history, in the per-agent ring plus the
durable tier.

The durable tier is the storage-domain KV domain `replay_history` (version 1, per-record, tables
`history` and `meta`) when the harness provides a storage facility, and the JSON fallback at
`recordPath` (`~/.dsh/replay-suggester/replay_history.json`) otherwise.

Both are bounded by `historyDepth` and both are awaited through `State.Flush()`.

The store is cross-session by design: it outlives the session that wrote it, which is why every
recalled path is validated against the current tree before it is named.

The recall matches the most recent prior entry with the same tool and either a contained probe
literal or the same path directory, then names the paths recorded within `learnWindow` calls of it
(the episode): "the last time this area was touched, these files were touched".

The record is then synthesized into the `Repeat` family (`priority` 0, `threshold` 0.75, one
`history` signal of weight 2.5, the recalled files as its targets), so the note reads
`intent=Repeat confidence=0.87` and the ledger keeps its
`suggest Repeat 0.87 <n> candidates call <tool>` line.

The `recorded` line, the recovery lines (`store recovered <n> entries (replay_history|file)` and
`store empty (starting fresh)`), and the failure lines are byte-exact in [SCHEME.md](./SCHEME.md).

## The pack (an explicit override only)

The built-in pack (the default of this monorepo) lives in
[`@playform/ets-lib-dsh-pack`](../ets-lib-dsh-pack), but this package no longer projects it: its
`Source/Variable/Defaults.ts` projection was removed, so a literal pack is never a candidate source
and the only pack source is an explicit repo/user pack.

A repository that ships `.dsh/pack.yml` (or a user-layer pack at
`~/.dsh/playform/workspaces/<slug>.yml`) gets its OWN `replay/` family, resolved with
`builtin: false`; its id, threshold and caveat join the synthesized family, and it may outrank it.

The recalled companion still comes from the record, because the pack supplies the gate and the
caveat, never the companion.

A workspace with no pack layer and no record abstains with the byte-exact
`abstained no-history  0.00`, and a call outside any workspace (no `.git`/`package.json` root)
abstains `abstained foreign-workspace  0.00`.

## The plan

The package, the Source, the smoke suites (five folders), and the build pass are complete, and the
producer of the recall store landed (the wave 2c re-spec of the completion spec).

The live activation (the profile row flip and the restart) is the remaining end-phase step
(POC-BRIEF.md §8).

Ships `enabled: false` in the bundle patch.

- [SEARCH-SUGGESTER-PLUGIN](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md) - §9.3, the recall
  answer.

## License

CC0-1.0.

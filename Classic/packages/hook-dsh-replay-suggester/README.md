# @playform/hook-dsh-replay-suggester

The replay-suggester hook: a DeepSeek Harness plugin that answers the question **"the last time this
was done, what did the model actually touch and how did it verify?"**
([SEARCH-SUGGESTER-PLUGIN.md](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md) §9.3). When the
model searches with an intent it has pursued before, the hook recalls the matching record from its
history store and prepends ONE labeled `additionalContexts` notice: the files touched last time and
the verification command.

- The history store: `~/.dsh/replay-suggester/history.json` (the seed of the search-suggester's
  journal per §9.3; the offline learner and the journal adapter are the end-phase wiring). Loaded
  once at apply; a missing or corrupt store degrades to silence with a ledger line, never to a
  guess.
- The recall store has a **producer** (the wave 2c re-spec,
  [03-SUGGESTERS.md](../../Documentation/Plans/Completion-Spec/03-SUGGESTERS.md)): every judged call
  is recorded, and a later call recalls the paths that accompanied a similar prior call. The
  producer's store is its own (the `replay_history` storage domain, or the JSON fallback beside the
  seeded store); the seeded store still wins when it matches.
- Without a recalled record the hook **abstains** (`replay no-memory`): a replay answer without a
  record is a guess, and the plan forbids the guess (§2.4).
- Privacy posture (plan §5.4): repo-relative paths only, no file contents, no user text, local only.

## How it works

1. `tools/post-execute` (waterfall, plain registration - after the ccr's `{prepend: true}`
   listener): `next()` first; record (the producer) → recall (the seeded store, then the live
   history) → detect → gate → prepend ONE notice. Content is never replaced.
2. `agent/pre-step`: the per-turn reset of the note counter when a user message enters.

## The recall store (the producer)

On every judged call that names a path, the hook appends one entry
`{ seq, path, intent, outcome, at, probe }` to the recall history - the per-agent ring plus the
durable tier. The durable tier is the storage-domain KV domain `replay_history` (version 1,
per-record, tables `history` and `meta`) when the harness provides a storage facility, and the JSON
fallback at `recordPath` (`~/.dsh/replay-suggester/replay_history.json`) otherwise; both are bounded
by `historyDepth` and both are awaited through `State.Flush()`.

The recall matches the most recent prior entry with the same tool and either a contained probe
literal or the same path directory, then names the paths recorded within `learnWindow` calls of it
(the episode) - "the last time this area was touched, these files were touched". The `recorded`
line, the recovery lines (`store recovered <n> entries (replay_history|file)`,
`store empty (starting fresh)`), and the failure lines are byte-exact in [SCHEME.md](./SCHEME.md).

## The pack

The `Repeat` intent is **pack-driven**: the built-in pack (this monorepo's default) lives in
[`@playform/lib-dsh-pack`](../lib-dsh-pack) and is projected here as the `replay/` domain. A
repository that ships `.dsh/pack.yml` (or a user-layer pack at
`~/.dsh/playform/workspaces/<slug>.yml`) gets its OWN `replay/` intent and caveat; a repository
without a pack stays silent. The recalled companion still comes from the history store - the pack
supplies the gate and the caveat, never the companion.

## Status

The package, the Source, the smoke suites (five folders) and the build pass are complete, and the
recall store's producer landed (the completion spec's wave 2c re-spec); the live activation (the
profile row flip and the restart) is the remaining end-phase step (POC-BRIEF.md §8). Ships
`enabled: false` in the bundle patch.

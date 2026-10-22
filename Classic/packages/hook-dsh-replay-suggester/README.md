# @playform/hook-dsh-replay-suggester

The replay-suggester hook: a DeepSeek Harness plugin that answers the
question **"the last time this was done, what did the model actually touch
and how did it verify?"**
([SEARCH-SUGGESTER-PLUGIN.md](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md)
§9.3). When the model searches with an intent it has pursued before, the
hook recalls the matching record from its history store and prepends ONE
labeled `additionalContexts` notice: the files touched last time and the
verification command.

- The history store: `~/.dsh/replay-suggester/history.json` (the seed of
  the search-suggester's journal per §9.3; the offline learner and the
  journal adapter are the end-phase wiring). Loaded once at apply; a
  missing or corrupt store degrades to silence with a ledger line, never to
  a guess.
- Without a recalled record the hook **abstains** (`replay no-memory`): a
  replay answer without a record is a guess, and the plan forbids the guess
  (§2.4).
- Privacy posture (plan §5.4): repo-relative paths only, no file contents,
  no user text, local only.

## How it works

1. `tools/post-execute` (waterfall, plain registration - after the ccr's
   `{prepend: true}` listener): `next()` first; recall (the history signal)
   → detect → gate → prepend ONE notice. Content is never replaced.
2. `agent/pre-step`: the per-turn reset of the note counter when a user
   message enters.

## Status

PoC phase: the package and Source are complete; the smoke suites, the build
pass, the journal-seed adapter, and the wiring are the end-phase
(POC-BRIEF.md §8). Ships `enabled: false` in the bundle patch.

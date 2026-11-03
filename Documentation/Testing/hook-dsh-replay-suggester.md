# hook-dsh-replay-suggester - the live test plan

## Identity

- Package: `@playform/hook-dsh-replay-suggester` (Classic/packages/hook-dsh-replay-suggester).
- Profile row id: `replay-suggester` (bundled in the desktop profile).
- Exposes no tools or services: it hooks `tools/post-execute` for `emitOn`: bash, edit, glob, grep,
  read, write. When the model searches with an intent it has pursued before, the hook recalls the
  matching record from its history store and prepends ONE labeled `additionalContexts` notice: the
  files touched last time and the command that verified. The store is loaded once at apply, and a
  missing or corrupt store degrades to silence, never to a guess.
- RECALL-FIRST: the existing producer + recall is the candidate source. On every judged call that
  names a path, the call is appended to the recall history BEFORE the recall runs (the sequence
  fence keeps the call out of its own recall), and an entry carries `seq`, `path`, `intent` (the
  `replay` family until the classifier matches), `outcome`, `at` and `probe` (the tool name plus the
  arguments JSON). It stores repo-relative paths only, with no file contents and no user text. Two
  tiers exist: the in-memory ring (per agent + the durable mirror, newest first, bounded by
  `historyDepth`) and the durable tier - the storage-domain KV domain `replay_history` (probed via
  `ctx.get('storage').domain` or `ctx.get('storageDomain')`, never injected) with the JSON fallback
  (`recordPath`) otherwise. The synthesized `Repeat` family (threshold 0.75, the recalled record's
  `files` as candidates, `verify` as the caveat line of the note, confidence
  `k = sigmoid(2.5 - 0.6) = 0.87`) is always first in the rules the classifier consumes.
- The built-in pack is retired and unimported (`Source/Variable/Defaults.ts` keeps the projection as
  the domain's reference table and nothing imports it). A pack is an EXPLICIT override only:
  `<repo>/.dsh/pack.yml` (or the user layer `~/.dsh/playform/workspaces/<slug>.yml`) resolved with
  `Resolve(root, { home, builtin: false })`. A pack family supplies the gate and the caveat, never
  the candidates; a pack family that matches with no record abstains
  `replay-suggester: abstained no-memory <Intent> <k>`. Without a record and without a pack layer
  the hook abstains `replay-suggester: abstained no-history  0.00`. The seeded history store
  (`historyPath`, read-only fixtures) keeps precedence when it matches, and recalled files are
  history records that stay exempt from the existence filter.
- The workspace root is pack-independent: the nearest ancestor of the call path carrying `.git` or
  `package.json`, and a call path with no such ancestor and no session cwd logs
  `replay-suggester: abstained foreign-workspace  0.00` before the producer runs (a foreign call is
  never recorded).
- Ledger prefix: `replay-suggester:`; logFile `~/.dsh/playform/hook-dsh-replay-suggester.log`.

## Activation checks

1. **The Config.**

    Inspect the Config with `cordis_inspect_query` host/Config/listConfigs
    `{"name": "@playform/hook-dsh-replay-suggester"}` for one entry with status schema (defaults:
    threshold 0.75, maxCandidates 7, maxNoteChars 1200, cooldownCalls 6, maxNotesPerTurn 3, intents
    `[]` (all of an explicit pack's intents enabled; the synthesized `Repeat` family is always on),
    emitOn bash/edit/glob/grep/read/write, exclude node_modules/Target/.git/dist, historyPath
    ~/.dsh/replay-suggester/history.json, learnWindow 2, recordPath
    ~/.dsh/replay-suggester/replay_history.json, historyDepth 32).

2. **The tool check.**

    No tool is expected, because the hook registers none.

3. **The ledger line.**

    The activated line appears in `~/.dsh/playform/hook-dsh-replay-suggester.log` as the byte-exact
    `replay-suggester: activated (bundle 0.2.1, history, threshold 0.75, history <n>)` (the second
    segment is `history`, not an intent count: there is no boot pack; the fourth segment stays the
    seeded store's record count, so a cold mount reads `history 0`), and a cold mount logs the
    byte-exact `replay-suggester: disabled (enabled=false)`.

## Test cases

| #   | Trigger                                                                           | Expected                                                                                                              | Pass criteria                                                                                                                                                       |
| --- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T1  | listConfigs query above                                                           | one entry, `status: "schema"`                                                                                         | the defaults match, including recordPath and historyDepth 32                                                                                                        |
| T1  | A search call whose intent has a seeded history record (seed `historyPath` first) | ONE note with the files touched and the verify command                                                                | the seeded store wins; the recalled files are history records, exempt from the existence filter                                                                     |
| T1  | The same query with NO store / a corrupt store                                    | silence + `replay-suggester: history missing (starting empty)` / `replay-suggester: history corrupt (starting empty)` | degrade to silence, never a guess; the live history still speaks                                                                                                    |
| T2  | A judged call that names a path                                                   | `replay-suggester: recorded <intent> <path> (<n> in store)`                                                           | recorded BEFORE the recall runs; `<n>` is the bounded store size captured at record time (a historyDepth of 2 reads `(1 in store)`, `(2 in store)`, `(2 in store)`) |
| T2  | A repeat of a previously recorded call (or the same path directory)               | ONE note with the anchor plus the entries within learnWindow (2) positions of it                                      | the recall is producer-fed; the store recovered line names the tier: `replay-suggester: store recovered <n> entries (replay_history)` or `(file)`                   |
| T3  | A judged call in a workspace with no record and no pack layer                     | `replay-suggester: abstained no-history  0.00`                                                                        | the built-in pack is not a fallback; the honest silence is the new behavior                                                                                         |
| T1  | `write` a file after a note                                                       | no note on the write itself (learning-only signal)                                                                    | the write never triggers a note                                                                                                                                     |
| T5  | A call path with no `.git`/`package.json` root and no session cwd                 | `replay-suggester: abstained foreign-workspace  0.00`                                                                 | the gate runs before the intent is known and before the producer, so a foreign call is never recorded; the workspace gate still runs on the note path               |

## Known live gaps

- The producer is live (wave 2c): without a manual seed the hook now records as it goes, so the
  first pass through an area may still abstain `no-memory`, which is correct behavior and not a bug.
  Watch for the storage facility probing (the `replay_history` domain is primary, the JSON fallback
  secondary), the seeded-store lines staying distinct from the producer's (`history ...` vs
  `store ...`/`recorded ...`), and `State.Flush()` awaiting every scheduled write.

## Fix loop

- Fix files: `Source/Function/` (the recall matcher, the producer, the note builder),
  `Source/Library.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-replay-suggester run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-replay-suggester/Target/Test/<Folder>/Test.js` per folder
  under `Source/Test/` (`History-Producer`, `Loader-And-History`, `Pack-Driven`,
  `Pipeline-And-Recall`, `Workspace-Gate`), then restart the app.

## Report stub

- Plugin: `@playform/hook-dsh-replay-suggester`
- Tests run: T1 config - / T1 seeded recall - / T1 corrupt-store silence - / T2 recording - / T2
  producer recall - / T3 no-history - / T5 foreign workspace -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -

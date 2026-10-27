# hook-dsh-replay-suggester - the live test plan

## Identity

- Package: `@playform/hook-dsh-replay-suggester` (Classic/packages/hook-dsh-replay-suggester).
- Profile row id: `replay-suggester` (bundled in the desktop profile).
- Exposes no tools or services: it hooks `tools/post-execute` for `emitOn`: bash, edit, glob, grep,
  read, write. When the model searches with an intent it has pursued before, the hook recalls the
  matching record from its history store and prepends ONE labeled `additionalContexts` notice: the
  files touched last time and the command that verified. The store is loaded once at apply, and a
  missing or corrupt store degrades to silence, never to a guess.
- PRODUCER (wave 2c): the hook is the producer of the recall store. On every judged call that names
  a path, the call is appended to the recall history BEFORE the recall runs (the sequence fence
  keeps the call out of its own recall), and an entry carries `seq`, `path`, `intent` (the `replay`
  family until the classifier matches), `outcome`, `at` and `probe` (the tool name plus the
  arguments JSON). It stores repo-relative paths only, with no file contents and no user text. Two
  tiers exist: the in-memory ring (per agent + the durable mirror, newest first, bounded by
  `historyDepth`) and the durable tier - the storage-domain KV domain `replay_history` (probed via
  `ctx.get('storage').domain` or `ctx.get('storageDomain')`, never injected) with the JSON fallback
  (`recordPath`) otherwise.
- PACK-DRIVEN: the intent is the `replay/` projection of the BUILT-IN pack
  (`@playform/lib-dsh-pack`; `Source/Variable/Defaults.ts` selects it with
  `Families(Builtin, "replay")`): `Repeat` (threshold 0.75, the recalled record's `files` as
  candidates, `verify` as the caveat line of the note). A workspace pack (`.dsh/pack.yml` -> the
  user layer -> the built-in pack) overrides it per repo. Without a record the sum stays at 1.2 (k
  0.62) and the hook abstains `no-memory`. The seeded history store (`historyPath`, read-only
  fixtures) keeps precedence when it matches, and recalled files are history records that stay
  exempt from the existence filter.
- Ledger prefix: `replay-suggester:`; logFile `~/.dsh/playform/hook-dsh-replay-suggester.log`.

## Activation checks

1. **The Config.**

    Inspect the Config with `cordis_inspect_query` host/Config/listConfigs
    `{"name": "@playform/hook-dsh-replay-suggester"}` for one entry with status schema (defaults:
    threshold 0.75, maxCandidates 7, maxNoteChars 1200, cooldownCalls 6, maxNotesPerTurn 3, intents
    `[]` (all pack intents enabled), emitOn bash/edit/glob/grep/read/write, exclude
    node_modules/Target/.git/dist, historyPath ~/.dsh/replay-suggester/history.json, learnWindow 2,
    recordPath ~/.dsh/replay-suggester/replay_history.json, historyDepth 32).

2. **The tool check.**

    No tool is expected, because the hook registers none.

3. **The ledger line.**

    The activated line appears in `~/.dsh/playform/hook-dsh-replay-suggester.log` as
    `replay-suggester: activated (bundle 0.1.0, intents <n>, threshold <t>, history <h>)`, and a
    cold mount logs the byte-exact `replay-suggester: disabled (enabled=false)`.

## Test cases

| #   | Trigger                                                                           | Expected                                                                                                              | Pass criteria                                                                                                                                                       |
| --- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T1  | listConfigs query above                                                           | one entry, `status: "schema"`                                                                                         | the defaults match, including recordPath and historyDepth 32                                                                                                        |
| T1  | A search call whose intent has a seeded history record (seed `historyPath` first) | ONE note with the files touched and the verify command                                                                | the seeded store wins; the recalled files are history records, exempt from the existence filter                                                                     |
| T1  | The same query with NO store / a corrupt store                                    | silence + `replay-suggester: history missing (starting empty)` / `replay-suggester: history corrupt (starting empty)` | degrade to silence, never a guess                                                                                                                                   |
| T2  | A judged call that names a path                                                   | `replay-suggester: recorded <intent> <path> (<n> in store)`                                                           | recorded BEFORE the recall runs; `<n>` is the bounded store size captured at record time (a historyDepth of 2 reads `(1 in store)`, `(2 in store)`, `(2 in store)`) |
| T2  | A repeat of a previously recorded call (or the same path directory)               | ONE note with the anchor plus the entries within learnWindow (2) positions of it                                      | the recall is producer-fed; the store recovered line names the tier: `replay-suggester: store recovered <n> entries (replay_history)` or `(file)`                   |
| T1  | `write` a file after a note                                                       | no note on the write itself (learning-only signal)                                                                    | the write never triggers a note                                                                                                                                     |
| T5  | A foreign workspace (no pack layer)                                               | `replay-suggester: abstained foreign-workspace  0.00`                                                                 | the gate runs before the intent is known; the workspace gate still runs on the note path                                                                            |

## Known live gaps

- The producer is live (wave 2c): without a manual seed the hook now records as it goes, so the
  first pass through an area may still abstain `no-memory`, which is correct behavior and not a bug.
  Watch for the storage facility probing (the `replay_history` domain is primary, the JSON fallback
  secondary), the seeded-store lines staying distinct from the producer's (`history ...` vs
  `store ...`/`recorded ...`), and `State.Flush()` awaiting every scheduled write.

## Fix loop

- Fix files: `Source/Function/` (the recall matcher, the producer, the note builder),
  `Source/Variable/Defaults.ts`, `Source/Library.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-replay-suggester run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-replay-suggester/Target/Test/<Folder>/Test.js` per folder
  under `Source/Test/` (`Loader-And-History`, `Pipeline-And-Recall`, `History-Producer`,
  `Workspace-Gate`, `Pack-Driven`), then restart the app.

## Report stub

- Plugin: `@playform/hook-dsh-replay-suggester`
- Tests run: T1 config - / T1 seeded recall - / T1 corrupt-store silence - / T2 recording - / T2
  producer recall - / T5 foreign workspace -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -

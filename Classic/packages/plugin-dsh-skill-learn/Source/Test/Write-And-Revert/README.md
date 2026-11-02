# Write-And-Revert

This folder covers the fence and the undo: the three write intents, the root fence, the drift check,
the ledger's delta manifests, the revert, and the replay gate.

## Intent

The fence is asserted AS DATA, not as a message: which intent a write carried, which version an edit
carried, and whether a write was attempted at all. That is the only way to prove the three
properties the whole write path rests on:

1. **A create uses `createIfAbsent`**, so an existing path is refused by the harness rather than
   overwritten. `W1` asserts the intent on the recorded call; `W2` asserts the harness's own
   `FS_NOT_OBSERVED` refusal and that the existing bytes are untouched.
2. **A patch stats immediately before the edit and passes THAT version.** `W3` asserts one `stat`,
   on the file the edit then writes, and that the version handed to `editText` is the one the stat
   returned - not a value the caller supplied. `W4` makes the version move after the stat and
   asserts `FS_STALE_VERSION`, which the harness raises BEFORE it matches a character.
3. **A body that drifted is refused before any call.** `W9` asserts `body-carried` with the clause
   `body-drifted` and an EMPTY `editText` log, and `W10` asserts the uncarried arm.

`W5` is the third harness rule: `editText` with `replaceAll: false` refuses a non-unique anchor with
`FS_AMBIGUOUS_EDIT`, so the judge's `anchor-unique` rule and the harness agree.

The root fence (`W6`, `W7`, `W8`) is the plugin's own `contains` check, never the resolver: a target
outside `skillsRoot`, a target inside `archiveRoot`, and a support path that leaves its own skill
directory are all `foreign-root` and none of them records a write.

The ledger row's `before` and `after` are DELTAS (`W11`): a path whose hash is identical on both
sides is dropped, a path present on one side only is kept, so a creation stays visible while an
unchanged sibling disappears. `W12` puts a patch row's bytes back; `W13` proves an undone create is
ARCHIVED rather than removed, because this plugin never deletes.

## Scenario

- "W1: a create writes with `createIfAbsent`".
- "W2: `createIfAbsent` refuses an existing path".
- "W3: a patch stats immediately before the edit and passes THAT version".
- "W4: a stale version is refused before the match".
- "W5: `editText` refuses a non-unique anchor".
- "W6: the root fence refuses a target outside `skillsRoot`".
- "W7: the root fence refuses the archive root".
- "W8: a support file stays inside its skill, and an escape is refused".
- "W9: a body that drifted is refused before any call".
- "W10: a patch whose body was never carried is `body-uncarried`".
- "W11: the ledger row's manifests are deltas".
- "W12: a revert restores the bytes a patch row captured".
- "W13: a revert of a create archives the skill instead of removing it".
- "W14: the replay gate - one run over a recorded transcript and corpus".

## The replay gate

`W14` is the replay the `smoke-writing` skill requires of a pipeline of more than four stages. It
runs the REAL leaves end to end over a recorded transcript (four messages, one tool call) and a
recorded corpus (one skill with one unique anchor), with a two-reply fake model:

`Transcript` -> `Digest` -> `Catalog` -> `Plan` -> `Parse` -> the views carried from the catalog ->
`Confirm` -> `Parse` -> `Judge` -> `Write` -> `Ledger`.

It prints two lines and asserts the numbers behind them:

```text
replay: messages=4 toolCalls=1 digest kept=3 collapsed=1
replay: applied 1 (0 refused) patch loader-flag
```

The digest counts are printed because they are the shape proof the fixtures cannot give: the tail
grew past a tool result and one older turn collapsed. The applied operations are printed because the
defect the replay exists to find is a pipeline that reports success and writes nothing.

The VIEW UNION - `views` plus every patch and support target - is computed in `Source/Library.ts`
(a parallel lane), so this run carries the views the plan named and asserts the judge's `body-carried`
rule over them. The union's own folder is the service's, once `Library.ts` lands.

## Fixtures

The fixtures are the shared Harness: `FakeFs` (an in-memory tree that enforces the two guarded
intents and the literal edit, records every call with its intent and version, and can bump a version
after a `stat`), `CorpusView` for the corpus a leaf reads, and the real built
`Target/Function/{Write,Revert,Ledger}.js` leaves. The replay also uses `Transcript`, `Digest`,
`Catalog`, `Plan`, `Confirm`, `Prompt`, `Parse` and `Judge`.

The corpus lives in the fake tree because every corpus read goes through `ctx.fs`; the ledger, the
blobs and the snapshots are the plugin's own files and are written with `node:fs` under the temp
home, which is why `State("w11")` and friends exist - no two checks share a ledger.

## Expected ledger strings (byte-exact)

None of the service's own lines: `Source/Library.ts` owns them. The fence's refusal codes are the
harness's, and they are asserted exactly: `FS_NOT_OBSERVED`, `FS_STALE_VERSION`, `FS_AMBIGUOUS_EDIT`,
`body-drifted`, `body-uncarried`, `foreign-root`.

## Expected count

14 PASS.

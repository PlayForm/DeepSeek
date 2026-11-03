# SCHEME - @playform/hook-dsh-replay-suggester

The complete scheme: every config field, every surface, every ledger string.

## Config (Schemastery, validated at load)

| Field             | Type     | Default                                             | Volatile        | Notes                                                                                                                                  |
| ----------------- | -------- | --------------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `log`             | boolean  | `true`                                              | yes             | The shared universal cell (the factory's minimal block).                                                                               |
| `logFile`         | string   | `~/.dsh/playform/ets-hook-dsh-replay-suggester.log` | yes             | The hook's OWN ledger, one log per module.                                                                                             |
| `enabled`         | boolean  | `true`                                              | yes             | `false` logs `disabled (enabled=false)` and every listener passes through. The patch row ships `false`.                                |
| `threshold`       | number   | `0.75`                                              | yes             | The default confidence gate; a pack family's own threshold may raise it, never lower it.                                               |
| `maxCandidates`   | number   | `7`                                                 | yes             | The note's candidate cap (the plan §3.7).                                                                                              |
| `maxNoteChars`    | number   | `1200`                                              | yes             | Hard character cap on the note text.                                                                                                   |
| `cooldownCalls`   | number   | `6`                                                 | yes             | No second note for the same intent within this many judged calls, per agent.                                                           |
| `maxNotesPerTurn` | number   | `3`                                                 | yes             | Reset per user turn (`agent/pre-step`).                                                                                                |
| `intents`         | string[] | `[]` (all pack intents enabled)                     | yes             | The enabled intent ids of an EXPLICIT pack; unknown ids are ignored. The synthesized `Repeat` family is always on.                     |
| `emitOn`          | string[] | `["bash","edit","glob","grep","read","write"]`      | yes             | The judged tool names (search + edit families).                                                                                        |
| `exclude`         | string[] | `["node_modules","Target",".git","dist"]`           | yes             | Substrings; a candidate whose path matches one is never suggested.                                                                     |
| `historyPath`     | string   | `~/.dsh/replay-suggester/history.json`              | no (structural) | The OPTIONAL seeded history store (read-only): the user seed. Loaded once at apply, so a change remounts.                              |
| `learnWindow`     | number   | `2`                                                 | yes             | The follow/ignore observation window, and the recall's EPISODE RADIUS (the paths recorded within this many calls of the matched one).  |
| `recordPath`      | string   | `~/.dsh/replay-suggester/replay_history.json`       | no (structural) | The PRODUCER's JSON fallback store; the storage domain `replay_history` is the primary tier. Read once at apply, so a change remounts. |
| `historyDepth`    | number   | `32`                                                | yes             | The recall history's bound: the per-agent ring, the durable mirror and the KV table keep at most this many entries.                    |

## Surfaces

| Surface              | Mode                          | What it does                                                                                                                                                                                                                              |
| -------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tools/post-execute` | waterfall, plain registration | `next()` first; record (the producer) → recall (the seeded store, then the live history) → the synthesized `Repeat` family → the explicit pack → detect → gate → prepend ONE labeled `additionalContexts` notice; never replaces content. |
| `agent/pre-step`     | waterfall, plain              | Pure observer: resets the per-turn note counter when the step ends with a user message.                                                                                                                                                   |

## The recall store - the producer (wave 2c re-spec)

The recall reader had no producer, so recall was always empty.

THE STORE IS CROSS-SESSION BY DESIGN: it is durable (the `replay_history` domain or the JSON
fallback), so it outlives the session that wrote it and a later session in the same workspace reads
it back. That is the point of the recall, and it is also why every recalled path is validated
against the CURRENT tree before it is named.

The hook is now the PRODUCER of the store
([03-SUGGESTERS.md](../../../Documentation/Plans/Completion-Spec/03-SUGGESTERS.md)): on every judged
call that names a path, the call is appended to the recall history BEFORE the recall runs, so it is
on every return path and the sequence fence keeps the call out of its own recall.

A call that names no path touched nothing to recall and is not recorded.

THE ENTRY (`Source/Interface/Entry.ts`):

```json
{
	"seq": 7,
	"path": "src/Core.ts",
	"intent": "Repeat",
	"outcome": "allow",
	"at": 1792534226000,
	"probe": "read {\"file_path\":\"src/Core.ts\"}"
}
```

`intent` is the family (`replay`) until the classifier matches, then the winning intent id
(`Repeat`); `outcome` is the kind of the downstream tool decision; `probe` is the similarity key
(the tool name plus the arguments JSON, the text the classifier sees).

Repo-relative paths only, no file contents, no user text (the plan §5.4 privacy posture).

THE TWO TIERS:

1. **The in-memory ring.**

    It is per agent (`AgentMemory.History`) and the durable mirror (`State.History`), both newest
    first and both bounded by `historyDepth`.

2. **The durable tier.**

    It is the storage-domain KV domain `replay_history` (version 1, per-record layout,
    backup-and-skip, tables `history` keyed by `String(seq)` and `meta.__savedAt`) when the harness
    provides a storage facility (`ctx.get('storage').domain` or `ctx.get('storageDomain')`, PROBED
    and never injected), and the JSON fallback (`recordPath`, `{version: 1, savedAt, entries}`)
    otherwise.

    The open and recovery run on the store chain at apply, and every write is scheduled on the same
    chain, so `State.Flush()` awaits them all (the smoke seam, no sleeps).

THE RECALL (`Source/Function/RecallHistory.ts`): the most recent prior entry that is SIMILAR, with
the same tool and either a probe literal contained in the other probe (the repeated identical call)
or the same path directory (the same area was touched before).

The answer is the ANCHOR plus the entries within `learnWindow` positions of it (the episode), most
recent first and distinct: the paths that accompanied the similar call.

The SEEDED store still wins when it matches (the precedence of the optional user seed).

## The recall is the only default source

The candidates come from the agent's OWN previous tool calls, never from a literal pack.

When a recall exists, the listener synthesizes it into ONE pack family and places it FIRST in the
rules the classifier consumes, so the existing Detect/gate/note pipeline judges it exactly like a
resolved pack's family:

```ts
{
  id: "Repeat",
  priority: 0,
  threshold: 0.75,
  note: "the last time this call was made, these files were touched",
  signals: [{ rule: "history", pattern: ".", weight: 2.5 }],
  targets: selected.map((file) => ({
    path: file,
    prior: 1.0,
    reason: `touched last time (${recalled.intent})`,
  })),
}
```

Its confidence is therefore `k = sigmoid(2.5 - 0.6) = 0.87`, and the note keeps the
`[replay-suggester] intent=Repeat confidence=0.87` header, the
`suggest Repeat 0.87 <n> candidates call <tool>` ledger line, and the caveat line above when the
record carries no `verify` command.

THE RECALL IS VALIDATED AGAINST THE TREE. The store is cross-session by design - it outlives the
session that wrote it - so a record may name a path that has since been deleted, a bare directory,
or the call's own anchor. Before the record becomes a target set, `Function/Apply` (`Select`):

1. drops the ANCHOR path itself (the file the current call names);
2. keeps only paths that EXIST and are REGULAR FILES (`Function/Exists`'s `IsFile`, the `existsSync`
   plus `statSync(...).isFile()` predicate), so a missing path and a bare directory are never named;
3. prefers the ANCHOR'S OWN DIRECTORY: when at least one surviving path sits in the `dirname` of the
   resolved anchor, ONLY those paths are named - precision first, because a recall from the same
   directory is the strong signal (the anchor itself need not exist: a brand-new file still has a
   folder);
4. otherwise falls back to the SAME RELEASE TREE: a call under `<...>/Classic/...` keeps the recalled
   paths under the same `<...>/Classic/...` prefix ahead of the others (the same for
   `.../EffectTS/...`), with a STABLE partition that never drops a valid file only because it sits in
   the other tree.

A record whose file set is EMPTY, or whose files ALL vanish, logs
`abstained no-companions <Intent> <k>`, which is distinct from `no-memory`, the case where the
winning intent matched but there was no record at all.

The `note` above is the caveat: a recalled record that carries a `verify` command shows
`note: last time verified with <command>` instead.

## The optional seeded history store (`Source/Interface/History.ts`, schema 1)

```json
{
	"schema": 1,
	"records": [
		{
			"intent": "Version",
			"probe": "0.1.0",
			"files": ["package.json", "CHANGELOG.md"],
			"verify": "pnpm run build:classic",
			"at": 1792534226
		}
	]
}
```

Repo-relative paths only; the offline learner or the journal of the search-suggester seeds it.

The store is an OPTIONAL user seed, not a required input: the live history (the producer's ring and
durable tier) is the default source, and the seed keeps precedence when it matches.

The hook never writes THIS store: the producer writes its own store (`recordPath` or the
`replay_history` domain).

A missing or corrupt store degrades to silence (`history missing (starting empty)` or
`history corrupt (starting empty)`), and the live history still speaks.

## The explicit pack (the built-in projection was removed)

The built-in pack (`@playform/ets-lib-dsh-pack`, the `replay/` domain) is NO LONGER a candidate
source: its projection (`Source/Variable/Defaults.ts`) was removed from this package, so the only
pack source is an explicit repo/user pack.

The listener compiles the rules from two sources per call:

1. the synthesized `Repeat` family of the recall (always first), and
2. the families of an EXPLICIT pack, resolved with
   `Resolve(root, { home: Home(), builtin: false })`: `<repo>/.dsh/pack.yml` or the user layer
   `~/.dsh/playform/workspaces/<slug>.yml`.

A workspace with neither a record nor a pack layer has no candidate source at all and abstains
`abstained no-history  0.00` (the double space is the empty-family shape).

A pack family is compiled once per (root, threshold, intents) tuple, with the configured `intents`
list as the filter and the config threshold as a floor.

A pack family may outrank the synthesized one (a higher signal weight), and then its `id` and its
`note` drive the note - but its targets are still the recalled files, because a pack supplies the
gate and the caveat, never the candidates. A pack family that matches with no record abstains
`abstained no-memory <Intent> <k>`.

The declared `signature:` of a pack no longer gates anything: the workspace root is pack-independent
(below).

## The workspace gate

The root is PACK-INDEPENDENT: the nearest ancestor of the call path carrying `.git` or
`package.json`, from the call path plus the session cwd (`Root` of `@playform/ets-lib-dsh-pack`).

A call path with no such ancestor and no session cwd has no history to mine here: the listener
appends `abstained foreign-workspace  0.00` and returns the downstream decision unchanged, because
the gate runs before the intent is known, so the intent segment is empty and the kappa is the
no-signal 0.00.

The gate runs before the producer, so a foreign call is never recorded either.

Any future static pack target is checked against the three bases of the call (repo root, package
root, package parent), and a `<...>` placeholder target is illustrative and never checked. The
recalled files are not checked against those bases - their bases are the record's own - but they
must still be existing regular files, as the validation above says.

## Ledger strings (byte-exact, module-owned)

```
replay-suggester: activated (bundle 0.2.1, history, threshold 0.75, history <n>)
replay-suggester: disabled (enabled=false)
replay-suggester: history loaded <n> records
replay-suggester: history missing (starting empty)
replay-suggester: history corrupt (starting empty)
replay-suggester: history corrupt (starting empty) <reason>
replay-suggester: store recovered <n> entries (replay_history)
replay-suggester: store recovered <n> entries (file)
replay-suggester: store empty (starting fresh)
replay-suggester: store open failed: <reason>
replay-suggester: store write failed: <reason>
replay-suggester: recorded <intent> <path> (<n> in store)
replay-suggester: suggest <Intent> <k> <n> candidates call <tool>
replay-suggester: abstained no-history  0.00
replay-suggester: abstained no-memory <Intent> <k>
replay-suggester: abstained ambiguous <Intent> <k>
replay-suggester: abstained no-companions <Intent> <k>
replay-suggester: abstained foreign-workspace  0.00
replay-suggester: suppressed cooldown <Intent>
replay-suggester: suppressed cap <Intent>
```

The activation line's SECOND segment is `history` (not an intent count): there is no boot pack,
because the candidates come from the recall and only an explicit pack may still speak. Its FOURTH
segment stays the seeded store's record count, so a cold mount reads
`activated (bundle <version>, history, threshold 0.75, history 0)`.

The seeded-store lines (`history ...`) are unchanged and distinct from the producer's (`store ...`,
`recorded ...`): the first reports the read-only seed, and the second the live recall history.

The `<n>` of the `recorded` line is the BOUNDED store size right after that append (captured at
record time, not at write time), so a `historyDepth` of 2 reads `(1 in store)`, `(2 in store)`,
`(2 in store)`.

The abstention order is the gate (`foreign-workspace`), the empty rule set (`no-history`), the
record's empty file set (`no-companions`), the gate's cooldown/cap (`suppressed ...`), the missing
record (`no-memory`), and the fully excluded candidate set (`ambiguous`).

## Identity (the four agreeing places)

1. **Package name.**

    `@playform/hook-dsh-replay-suggester`.

2. **The `name` export.**

    `replay-suggester`.

3. **The `module:` option of the State build.**

    `replay-suggester`.

4. **The ledger `logFile` default.**

    `~/.dsh/playform/ets-hook-dsh-replay-suggester.log`.

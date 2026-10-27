# SCHEME - @playform/hook-dsh-replay-suggester

The complete scheme: every config field, every surface, every ledger string.

## Config (Schemastery, validated at load)

| Field             | Type     | Default                                         | Volatile        | Notes                                                                                                                                  |
| ----------------- | -------- | ----------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `log`             | boolean  | `true`                                          | yes             | The shared universal cell (the factory's minimal block).                                                                               |
| `logFile`         | string   | `~/.dsh/playform/hook-dsh-replay-suggester.log` | yes             | The hook's OWN ledger, one log per module.                                                                                             |
| `enabled`         | boolean  | `true`                                          | yes             | `false` logs `disabled (enabled=false)` and every listener passes through. The patch row ships `false`.                                |
| `threshold`       | number   | `0.75`                                          | yes             | The default confidence gate; per-intent thresholds may raise it, never lower it.                                                       |
| `maxCandidates`   | number   | `7`                                             | yes             | The note's candidate cap (the plan §3.7).                                                                                              |
| `maxNoteChars`    | number   | `1200`                                          | yes             | Hard character cap on the note text.                                                                                                   |
| `cooldownCalls`   | number   | `6`                                             | yes             | No second note for the same intent within this many judged calls, per agent.                                                           |
| `maxNotesPerTurn` | number   | `3`                                             | yes             | Reset per user turn (`agent/pre-step`).                                                                                                |
| `intents`         | string[] | `[]` (all pack intents enabled)                 | yes             | The enabled intent ids; unknown ids are ignored.                                                                                       |
| `emitOn`          | string[] | `["bash","edit","glob","grep","read","write"]`  | yes             | The judged tool names (search + edit families).                                                                                        |
| `exclude`         | string[] | `["node_modules","Target",".git","dist"]`       | yes             | Substrings; a candidate whose path matches one is never suggested.                                                                     |
| `historyPath`     | string   | `~/.dsh/replay-suggester/history.json`          | no (structural) | The SEEDED history store (read-only fixtures); loaded once at apply, so a change remounts.                                             |
| `learnWindow`     | number   | `2`                                             | yes             | The follow/ignore observation window, and the recall's EPISODE RADIUS (the paths recorded within this many calls of the matched one).  |
| `recordPath`      | string   | `~/.dsh/replay-suggester/replay_history.json`   | no (structural) | The PRODUCER's JSON fallback store; the storage domain `replay_history` is the primary tier. Read once at apply, so a change remounts. |
| `historyDepth`    | number   | `32`                                            | yes             | The recall history's bound: the per-agent ring, the durable mirror and the KV table keep at most this many entries.                    |

## Surfaces

| Surface              | Mode                          | What it does                                                                                                                                                                                                                                                   |
| -------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tools/post-execute` | waterfall, plain registration | `next()` first; record (the producer) → recall (seeded store, then the live history) → detect → gate → prepend ONE labeled `additionalContexts` notice (source `{kind: 'replay-suggester', form: 'notice', summary: '<Intent> <k>'}`); never replaces content. |
| `agent/pre-step`     | waterfall, plain              | Pure observer: resets the per-turn note counter when the step ends with a user message.                                                                                                                                                                        |

## The recall store - the producer (wave 2c re-spec)

The recall reader had no producer, so recall was always empty. The hook is now the store's PRODUCER
([03-SUGGESTERS.md](../../../Documentation/Plans/Completion-Spec/03-SUGGESTERS.md)): on every judged
call that names a path, the call is appended to the recall history BEFORE the recall runs (so it is
on every return path, and the sequence fence keeps the call out of its own recall). A call that
names no path touched nothing to recall and is not recorded.

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
(`Repeat`); `outcome` is the downstream tool decision's kind; `probe` is the similarity key (the
tool name plus the arguments JSON - the text the classifier sees). Repo-relative paths only, no file
contents, no user text (the plan §5.4 privacy posture).

THE TWO TIERS:

1. the IN-MEMORY RING - per agent (`AgentMemory.History`) and the durable mirror (`State.History`),
   both newest first and both bounded by `historyDepth`; and
2. the DURABLE tier - the storage-domain KV domain `replay_history` (version 1, per-record layout,
   backup-and-skip, tables `history` keyed by `String(seq)` and `meta.__savedAt`) when the harness
   provides a storage facility (`ctx.get('storage').domain` or `ctx.get('storageDomain')` - PROBED,
   never injected), and the JSON fallback (`recordPath`, `{version: 1, savedAt, entries}`)
   otherwise. The open and recovery run on the store chain at apply; every write is scheduled on the
   same chain, so `State.Flush()` awaits them all (the smoke seam - no sleeps).

THE RECALL (`Source/Function/RecallHistory.ts`): the most recent prior entry that is SIMILAR - the
same tool, and either a probe literal contained in the other probe (the repeated identical call) or
the same path directory (the same area was touched before). The answer is the ANCHOR plus the
entries within `learnWindow` positions of it (the episode), most recent first, distinct - the paths
that accompanied the similar call. The SEEDED store still wins when it matches (the fixtures'
precedence). The recalled files are HISTORY RECORDS: they stay exempt from the existence filter.

## The seeded history store (`Source/Interface/History.ts`, schema 1)

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

Repo-relative paths only; seeded by the offline learner / the search-suggester journal (the
end-phase wiring). The hook still never writes THIS store - the producer writes its own store
(`recordPath` / the `replay_history` domain), and the seeded store keeps precedence when it matches.
A missing or corrupt store degrades to silence (`history missing (starting empty)` /
`history corrupt (starting empty)`).

## The built-in pack (`@playform/lib-dsh-pack`, the `replay/` domain)

The table below is the BUILT-IN pack's `replay/` projection (`Source/Variable/Defaults.ts` selects
it with `Families(Builtin, "replay")`). A workspace pack (`<repo>/.dsh/pack.yml` or the user layer
`~/.dsh/playform/workspaces/<slug>.yml`) overrides it per repo; the Apply compiles the resolved
pack's intents once per workspace root, and a repo without a pack keeps this set. The pack's `note`
is the caveat used when a recalled record carries no `verify` command.

| Intent   | Priority | Threshold | Signals (weight)                                                                  | Resolution                                                                                           |
| -------- | -------- | --------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `Repeat` | 1        | 0.75      | search-shape (0.5), literal-shape (0.4), context-shape (0.3) + history lift (0.6) | The recalled record's `files` as candidates; `verify` as the note's caveat line; no record → abstain |

Confidence: `k = sigmoid(Σ weights + lift − 0.6)`; without a record the sum stays at 1.2 (k 0.62)
and the hook abstains - the replay answer requires the memory, never a guess.

## Ledger strings (byte-exact, module-owned)

```
replay-suggester: activated (bundle 0.3.0, intents <n>, threshold <t>, history <h>)
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
replay-suggester: abstained no-memory <Intent> <k>
replay-suggester: abstained ambiguous <Intent> <k>
replay-suggester: abstained no-companions <Intent> <k>
replay-suggester: abstained foreign-workspace <Intent> <k>
replay-suggester: suppressed cooldown <Intent>
replay-suggester: suppressed cap <Intent>
```

The seeded-store lines (`history ...`) are unchanged and distinct from the producer's (`store ...`,
`recorded ...`): the first reports the fixtures' read-only seed, the second the live recall history.
The `recorded` line's `<n>` is the BOUNDED store size right after that append (captured at record
time, not at write time), so a `historyDepth` of 2 reads `(1 in store)`, `(2 in store)`,
`(2 in store)`.

The post-execute listener resolves the workspace root before the gate (the nearest ancestor whose
PACK SIGNATURE matches; the signature is the resolved pack's `signature` list, defaulting to
`Documentation/ARCHIVE-STYLE.md`, from the call path plus the session cwd). A foreign workspace has
no pack and logs `abstained foreign-workspace  0.00` (the gate runs before the intent is known, so
the intent segment is empty and the kappa is the no-signal 0.00). The resolved pack's `replay/`
intent (compiled once per root) and its `note` caveat drive the note, so a repo pack overrides the
built-in intent without a restart. The RECALLED-history targets are history records, not workspace
paths: they are EXEMPT from the existence filter (the workspace gate still runs on the note path). A
record with an EMPTY file set logs `abstained no-companions <Intent> <k>` (distinct from
`no-memory`, which means there was no record at all). Any future static pack target is checked
against the call's three bases (repo root, package root, package parent), and a `<...>` placeholder
target is illustrative and never checked.

## Identity (the four agreeing places)

1. Package name: `@playform/hook-dsh-replay-suggester`.
2. The `name` export: `replay-suggester`.
3. The State build's `module:` option: `replay-suggester`.
4. The ledger `logFile` default: `~/.dsh/playform/hook-dsh-replay-suggester.log`.

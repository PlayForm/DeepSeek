# SCHEME - @playform/hook-dsh-replay-suggester

The complete scheme: every config field, every surface, every ledger string.

## Config (Schemastery, validated at load)

| Field             | Type     | Default                                        | Volatile        | Notes                                                                                                   |
| ----------------- | -------- | ---------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------- |
| `log`             | boolean  | `true`                                         | yes             | The shared universal cell (the factory's minimal block).                                                |
| `logFile`         | string   | `~/.dsh/replay-suggester.log`                  | yes             | The hook's OWN ledger, one log per module.                                                              |
| `enabled`         | boolean  | `true`                                         | yes             | `false` logs `disabled (enabled=false)` and every listener passes through. The patch row ships `false`. |
| `threshold`       | number   | `0.75`                                         | yes             | The default confidence gate; per-intent thresholds may raise it, never lower it.                        |
| `maxCandidates`   | number   | `7`                                            | yes             | The note's candidate cap (the plan §3.7).                                                               |
| `maxNoteChars`    | number   | `1200`                                         | yes             | Hard character cap on the note text.                                                                    |
| `cooldownCalls`   | number   | `6`                                            | yes             | No second note for the same intent within this many judged calls, per agent.                            |
| `maxNotesPerTurn` | number   | `3`                                            | yes             | Reset per user turn (`agent/pre-step`).                                                                 |
| `intents`         | string[] | `[]` (all pack intents enabled)                | yes             | The enabled intent ids; unknown ids are ignored.                                                        |
| `emitOn`          | string[] | `["bash","edit","glob","grep","read","write"]` | yes             | The judged tool names (search + edit families).                                                         |
| `exclude`         | string[] | `["node_modules","Target",".git","dist"]`      | yes             | Substrings; a candidate whose path matches one is never suggested.                                      |
| `historyPath`     | string   | `~/.dsh/replay-suggester/history.json`         | no (structural) | The history store; loaded once at apply, so a change remounts.                                          |
| `learnWindow`     | number   | `2`                                            | yes             | The follow/ignore observation window (parsed only in the PoC).                                          |

## Surfaces

| Surface              | Mode                          | What it does                                                                                                                                                                                                      |
| -------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tools/post-execute` | waterfall, plain registration | `next()` first; recall (history signal) → detect → gate → prepend ONE labeled `additionalContexts` notice (source `{kind: 'replay-suggester', form: 'notice', summary: '<Intent> <k>'}`); never replaces content. |
| `agent/pre-step`     | waterfall, plain              | Pure observer: resets the per-turn note counter when the step ends with a user message.                                                                                                                           |

## The history store (`Source/Interface/History.ts`, schema 1)

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
end-phase wiring); this hook never writes it in v1. A missing or corrupt store degrades to silence
(`history missing (starting empty)` / `history corrupt (starting empty)`).

## The embedded pack (`Source/Variable/Defaults.ts`, pack `replay` v1)

| Intent   | Priority | Threshold | Signals (weight)                                                                  | Resolution                                                                                           |
| -------- | -------- | --------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `Repeat` | 1        | 0.75      | search-shape (0.5), literal-shape (0.4), context-shape (0.3) + history lift (0.6) | The recalled record's `files` as candidates; `verify` as the note's caveat line; no record → abstain |

Confidence: `k = sigmoid(Σ weights + lift − 0.6)`; without a record the sum stays at 1.2 (k 0.62)
and the hook abstains - the replay answer requires the memory, never a guess.

## Ledger strings (byte-exact, module-owned)

```
replay-suggester: activated (bundle 0.1.0, intents <n>, threshold <t>, history <h>)
replay-suggester: disabled (enabled=false)
replay-suggester: history loaded <n> records
replay-suggester: history missing (starting empty)
replay-suggester: history corrupt (starting empty)
replay-suggester: history corrupt (starting empty) <reason>
replay-suggester: suggest <Intent> <k> <n> candidates call <tool>
replay-suggester: abstained no-memory <Intent> <k>
replay-suggester: abstained ambiguous <Intent> <k>
replay-suggester: suppressed cooldown <Intent>
replay-suggester: suppressed cap <Intent>
```

## Identity (the four agreeing places)

1. Package name: `@playform/hook-dsh-replay-suggester`.
2. The `name` export: `replay-suggester`.
3. The State build's `module:` option: `replay-suggester`.
4. The ledger `logFile` default: `~/.dsh/replay-suggester.log`.

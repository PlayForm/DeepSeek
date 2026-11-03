# SCHEME - @playform/hook-dsh-convention-suggester

The complete scheme: every config field, every surface, every ledger string.

## The candidates (the session history)

The suggestions come from the agent's OWN PREVIOUS TOOL CALLS in this workspace, never from a
literal built-in pack.

- **The fold.**

    The `session/event` listener folds every `tool/call` event into one `Touch` (the sequence
    number, the normalized path and the tool) in the SESSION's history, through the pack library's
    `Touch` fold unit (`Fold` here). One entry per session object, created lazily; the touch array
    is capped at 512, oldest first.

    The path comes from the first path-shaped argument (`file_path`, `path`, `filePath`), with
    backslashes normalized to slashes and a leading `./` stripped.

- **The adjacency.**

    On a judged call, `Adjacent(touches, callPath, { limit: maxCandidates })` scores the paths that
    followed the anchor within a window of 8 calls: `1 / (1 + distance)` per occurrence, one count
    per occurrence. A repeatedly co-touched path outranks a single one, and a near neighbour
    outranks a far one. The anchor itself is never a candidate.

- **The confidence.**

    `k = min(0.95, 0.6 + 0.05 * Σcounts)` - the total co-touch count, not a pack weight.

- **The filter.**

    Each co-touch path passes the base-aware existence filter (`Exists`) and the exclude prefixes,
    then the list is capped at `maxCandidates`. An empty surviving set abstains `ambiguous`.

- **The note.**

    ONE labeled `additionalContexts` notice (source
    `{kind: 'convention-suggester', form: 'notice', summary: 'History <k>'}`):

    ```text
    [convention-suggester] intent=History confidence=<k>
    targets (<n>):
    - <path> - touched <count> time(s) after this file
    note: these files were touched right after this one in this workspace
    ```

## The explicit pack override

A pack is an EXPLICIT user/repo override, never a fallback:

- `<repo>/.dsh/pack.yml` (or `.yaml`/`.json`), or
- the user layer `~/.dsh/playform/workspaces/<slug>.yml`.

The listener resolves it with `Resolve(root, { home, builtin: false })`, so a workspace with no pack
layer resolves to `undefined` and abstains `no-history`. The package's own built-in projection
(`Source/Variable/Defaults.ts`) was removed, so the built-in pack no longer exists here and an
explicit pack is the only pack source. When a layer exists, its `convention/` families drive the
existing deterministic classifier (`Detect`), the existence filter, the gate and the notice - so a
repo that ships a hand-written pack still gets its own intents and caveats.

The pack's own `signature` gates it (`Locate`): a pack whose declared marker is absent under the
workspace root abstains `foreign-workspace`.

## The learner was removed

The literal pack learner (D4) was removed: its `Source/Function/Learn/` source and its three Learn-*
smoke folders are gone, so no proposal file is written and no `learned proposal` ledger line exists
any more. The `learning` config field remains in the schema as a retired compatibility field, until
the history-driven proposal lands.

## Config (Schemastery, validated at load)

| Field             | Type     | Default                                             | Volatile | Notes                                                                                                                         |
| ----------------- | -------- | --------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `log`             | boolean  | `true`                                              | yes      | The shared universal cell (the factory's minimal block).                                                                      |
| `logFile`         | string   | `~/.dsh/playform/hook-dsh-convention-suggester.log` | yes      | The hook's OWN ledger, one log per module.                                                                                    |
| `enabled`         | boolean  | `true`                                              | yes      | `false` logs `disabled (enabled=false)` and every listener passes through. The patch row ships `false`.                       |
| `threshold`       | number   | `0.75`                                              | yes      | The default confidence gate for an EXPLICIT pack; per-intent thresholds may raise it, never lower it.                         |
| `maxCandidates`   | number   | `7`                                                 | yes      | The note's candidate cap (the plan §3.7), and the `Adjacent` limit.                                                           |
| `maxNoteChars`    | number   | `1200`                                              | yes      | Hard character cap on the note text.                                                                                          |
| `cooldownCalls`   | number   | `6`                                                 | yes      | No second note for the same intent within this many judged calls, per agent.                                                  |
| `maxNotesPerTurn` | number   | `3`                                                 | yes      | Reset per user turn (`agent/pre-step`).                                                                                       |
| `intents`         | string[] | `[]` (all pack intents enabled)                     | yes      | The enabled intent ids for an explicit pack; unknown ids are ignored.                                                         |
| `emitOn`          | string[] | `["edit","raw-write","write"]`                      | yes      | The judged tool names (the modification family).                                                                              |
| `exclude`         | string[] | `["node_modules","Target",".git","dist"]`           | yes      | Substrings; a candidate whose path matches one is never suggested.                                                            |
| `learning`        | boolean  | `false`                                             | yes      | Retired: the literal pack learner was removed; kept for config compatibility until the history-driven proposal lands.          |

## Surfaces

| Surface              | Mode                          | What it does                                                                                                                                                           |
| -------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `session/event`      | plain                         | Folds every `tool/call` event into the session's history (one `Touch` per call, capped at 512). Fail-open: a malformed event is skipped.                               |
| `tools/post-execute` | waterfall, plain registration | `next()` first; the history candidates (or, with an empty history, an explicit pack) → gate → prepend ONE labeled `additionalContexts` notice; never replaces content. |
| `agent/pre-step`     | waterfall, plain              | Pure observer: resets the per-turn note counter when the step ends with a user message.                                                                                |

## The workspace root

The root is PACK-INDEPENDENT: the nearest ancestor of the call path carrying `.git` or
`package.json` (the pack library's `Root`), from the call path plus the session cwd.

A call path with no such ancestor and no session cwd abstains `abstained foreign-workspace  0.00`
before any candidate work (and never touches the per-agent memory).

With the root known, a target is kept when it exists under ANY of the three bases of the call: the
root, the package root (the nearest ancestor of the resolved call path carrying `package.json`, at
or below the root) and the package parent.

Targets carrying a `<...>` placeholder are illustrative and are never existence-checked.

## Ledger strings (byte-exact, module-owned)

```
convention-suggester: activated (bundle 0.2.1, history, threshold <t>)
convention-suggester: disabled (enabled=false)
convention-suggester: suggest History <k> <n> candidates call <tool>
convention-suggester: suggest <Intent> <k> <n> candidates call <tool>
convention-suggester: abstained ambiguous <Intent> <k>
convention-suggester: abstained no-companions <Intent> <k>
convention-suggester: abstained foreign-workspace  0.00
convention-suggester: abstained no-history  0.00
convention-suggester: suppressed cooldown <Intent>
convention-suggester: suppressed cap <Intent>
```

The activation proof names the `history` segment where the old line counted the compiled intents:
the boot compile is EMPTY, because no literal pack is a candidate source.

A workspace with no pack layer and no session history abstains `abstained no-history  0.00` (the
double space is the family's empty-intent shape).

The `History` intent id is the cooldown key for the history note; an explicit pack's note uses its
own intent id.

## Identity (the four agreeing places)

1. **Package name.**

    `@playform/hook-dsh-convention-suggester`.

2. **The `name` export.**

    `convention-suggester`.

3. **The `module:` option of the State build.**

    `convention-suggester`.

4. **The `logFile` default of the ledger.**

    `~/.dsh/playform/hook-dsh-convention-suggester.log`.

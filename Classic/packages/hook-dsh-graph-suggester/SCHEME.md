# SCHEME - @playform/hook-dsh-graph-suggester

The complete scheme: every config field, every surface, every ledger string.

## Config (Schemastery, validated at load)

| Field             | Type     | Default                                        | Volatile | Notes                                                                                                                               |
| ----------------- | -------- | ---------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `log`             | boolean  | `true`                                         | yes      | The shared universal cell (the factory's minimal block).                                                                            |
| `logFile`         | string   | `~/.dsh/playform/hook-dsh-graph-suggester.log` | yes      | The hook's OWN ledger, one log per module.                                                                                          |
| `enabled`         | boolean  | `true`                                         | yes      | `false` logs `disabled (enabled=false)` and every listener passes through. The patch row ships `false`.                             |
| `threshold`       | number   | `0.75`                                         | yes      | The confidence gate. The effective gate is `max(0.75, threshold)`: the graph floor raises a lower value, never lowers a higher one. |
| `maxCandidates`   | number   | `7`                                            | yes      | The note's candidate cap and the `neighborhood` limit.                                                                              |
| `maxNoteChars`    | number   | `1200`                                         | yes      | Hard character cap on the note text.                                                                                                |
| `cooldownCalls`   | number   | `6`                                            | yes      | No second note for the same intent within this many judged calls, per agent.                                                        |
| `maxNotesPerTurn` | number   | `3`                                            | yes      | Reset per user turn (`agent/pre-step`).                                                                                             |
| `intents`         | string[] | `[]` (both graph intents enabled)              | yes      | The enabled graph intent ids; an id left out is never synthesized.                                                                  |
| `emitOn`          | string[] | `["glob","grep","read"]`                       | yes      | The judged tool names (the discovery family).                                                                                       |
| `exclude`         | string[] | `["node_modules","Target",".git","dist"]`      | yes      | Substrings; a candidate whose path matches one is never suggested.                                                                  |
| `graph`           | boolean  | `true`                                         | yes      | Whether the graph intents may fire; `false` = they abstain through the unavailable path, and nothing is guessed.                    |

## Services

| Injected         | Declared in            | Consumed for                                                                                                                     |
| ---------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `pluginFactory`  | `Interface/Factory.ts` | The State builder (cell unwrap + volatile refresh) and the ledger.                                                               |
| `workspaceGraph` | `Interface/Graph.ts`   | `neighborhood(path, limit)` - the connected component, the only candidate source. Declared in this package (self-contained PoC). |

## The real graph (the consumer chain, verified 2026-10-23)

`@playform/plugin-dsh-workspace-graph` now SERVES the declared query: `ctx.workspaceGraph` exposes
`neighborhood(path, limit)` (and `indexWorkspace` to populate the graph in the first place), derived
from the W1 `contains`/`imports` edges.

The `Real-Graph-Neighborhood` folder proves the chain against the real service: the note lists the
anchor (definition), the importing test file (tests) and the other importer, and an anchor that the
graph does not know abstains `abstained no-companions` - the hook no longer carries a literal target
set to fall back to.

The anchor is the first quoted path-looking value of the tool's arguments (`file_path`, `path`,
`pattern`, `glob`) ending in `.ts`, `.tsx`, `.js`, `.mjs` or `.md`, and the graph matches it by
exact display path, else by path suffix (a repo-relative anchor works). A judged call whose
arguments carry no such value has nothing to ask, so the graph intent stays silent: no line, because
no intent applies.

W1 still has no `calls`/`references` edges, so the component carries importers rather than callers:
the note text still says "callers", and the own SCHEME of the graph documents the deferral.

## Surfaces

| Surface              | Mode                          | What it does                                                                                                                                                                    |
| -------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tools/post-execute` | waterfall, plain registration | `next()` first; the anchor probe → the graph query → the synthetic intents → detect → gate → resolve → prepend ONE labeled `additionalContexts` notice; never replaces content. |
| `agent/pre-step`     | waterfall, plain              | Pure observer: resets the per-turn note counter when the step ends with a user message.                                                                                         |

## The graph intents (synthesized per call, no pack)

There is no boot pack: `State.Rules` is empty at apply, and the two intents are built per judged
call from the graph query's own answer and prepended as data, so the classifier, the gate and the
note judge them exactly like a compiled pack. The retired literal pack
(`Source/Variable/Defaults.ts`) is unimported and is never a candidate source.

| Intent         | Priority | Threshold | Signal                     | Targets                                                                              |
| -------------- | -------- | --------- | -------------------------- | ------------------------------------------------------------------------------------ |
| `Neighborhood` | 1        | 0.75      | `graph` (pattern `.`, 2.5) | every entry of `workspaceGraph.neighborhood(anchor, maxCandidates)`, prior 1.0       |
| `Sibling`      | 2        | 0.75      | `graph` (pattern `.`, 2.5) | the same-directory projection of the same component (the anchor excluded), prior 1.0 |

Confidence is `k = sigmoid(2.5 - 0.6) = 0.87` for either intent, and the note emits only if
`k ≥ gate`, the candidate set survives the cap and the exclusion, and the cooldown and cap allow it.

The config `threshold` is a FLOOR: the effective gate is `max(0.75, threshold)`, so it may raise the
0.75 floor and never lower it.

`Neighborhood` is prepended first and `Detect` keeps the first winner on a tie, so `Sibling` speaks
when the config's `intents` list selects it alone (the narrower same-directory answer).

An intent whose projection is empty is not synthesized: `Sibling` with no same-directory peer is not
built, and `Neighborhood` is built with an empty target set only when there is no graph answer at
all, so the abstention can name it.

## The candidate source (graph only)

The graph answer is the ONLY candidate source, and every abstention is a ledger line:

- **No answer** (the config switch is off, the service is absent, or `neighborhood` throws): the
  intent abstains `abstained graph-unavailable <Intent> <k>`, and the absent/throw case logs
  `graph unavailable` (with the throw's reason) ONCE per apply.
- **Empty component** (the service answered with nothing): the intent abstains
  `abstained no-companions <Intent> <k>`. The hook names no path of its own.
- **Every candidate excluded** (the component exists but the `exclude` prefixes drop it): the intent
  abstains `abstained ambiguous <Intent> <k>`.

## Ledger strings (byte-exact, module-owned)

```
graph-suggester: activated (bundle 0.2.1, graph, threshold <t>)
graph-suggester: disabled (enabled=false)
graph-suggester: suggest <Intent> <k> <n> candidates call <tool>
graph-suggester: abstained graph-unavailable <Intent> <k>
graph-suggester: abstained no-companions <Intent> <k>
graph-suggester: abstained ambiguous <Intent> <k>
graph-suggester: graph unavailable
graph-suggester: graph unavailable <reason>
graph-suggester: suppressed cooldown <Intent>
graph-suggester: suppressed cap <Intent>
```

The activation line's second segment is `graph` (not an intent count): there is no boot pack,
because every candidate comes from the graph query. The `k` is the graph intent's own confidence,
`0.87` at the default gate.

## Identity (the four agreeing places)

1. **Package name.**

    `@playform/hook-dsh-graph-suggester`.

2. **The `name` export.**

    `graph-suggester`.

3. **The `module:` option of the State build.**

    `graph-suggester`.

4. **The `logFile` default of the ledger.**

    `~/.dsh/playform/hook-dsh-graph-suggester.log`.

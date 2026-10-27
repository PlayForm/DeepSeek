# SCHEME - @playform/hook-dsh-graph-suggester

The complete scheme: every config field, every surface, every ledger string.

## Config (Schemastery, validated at load)

| Field             | Type     | Default                                        | Volatile | Notes                                                                                                   |
| ----------------- | -------- | ---------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `log`             | boolean  | `true`                                         | yes      | The shared universal cell (the factory's minimal block).                                                |
| `logFile`         | string   | `~/.dsh/playform/hook-dsh-graph-suggester.log` | yes      | The hook's OWN ledger, one log per module.                                                              |
| `enabled`         | boolean  | `true`                                         | yes      | `false` logs `disabled (enabled=false)` and every listener passes through. The patch row ships `false`. |
| `threshold`       | number   | `0.75`                                         | yes      | The default confidence gate; per-intent thresholds may raise it, never lower it.                        |
| `maxCandidates`   | number   | `7`                                            | yes      | The note's candidate cap (the plan §3.7).                                                               |
| `maxNoteChars`    | number   | `1200`                                         | yes      | Hard character cap on the note text.                                                                    |
| `cooldownCalls`   | number   | `6`                                            | yes      | No second note for the same intent within this many judged calls, per agent.                            |
| `maxNotesPerTurn` | number   | `3`                                            | yes      | Reset per user turn (`agent/pre-step`).                                                                 |
| `intents`         | string[] | `[]` (all pack intents enabled)                | yes      | The enabled intent ids; unknown ids are ignored.                                                        |
| `emitOn`          | string[] | `["glob","grep","read"]`                       | yes      | The judged tool names (the discovery family).                                                           |
| `exclude`         | string[] | `["node_modules","Target",".git","dist"]`      | yes      | Substrings; a candidate whose path matches one is never suggested.                                      |
| `graph`           | boolean  | `true`                                         | yes      | Whether the graph-based Neighborhood intent may fire; false = static intents only.                      |

## Services

| Injected         | Declared in            | Consumed for                                                                                                                      |
| ---------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `pluginFactory`  | `Interface/Factory.ts` | The State builder (cell unwrap + volatile refresh) and the ledger.                                                                |
| `workspaceGraph` | `Interface/Graph.ts`   | `neighborhood(path, limit)` - the connected component for the Neighborhood intent. Declared in this package (self-contained PoC). |

## The real graph (the consumer chain, verified 2026-10-23)

`@playform/plugin-dsh-workspace-graph` now SERVES the declared query: `ctx.workspaceGraph` exposes
`neighborhood(path, limit)` (and `indexWorkspace` to populate the graph in the first place), derived
from the W1 `contains`/`imports` edges. The `Real-Graph-Neighborhood` folder proves the chain
against the real service - the note lists the anchor (definition), the importing test file (tests)
and the other importer, and an anchor the graph does not know honestly falls back to the static set.
The anchor is the first quoted `.ts` path in the tool's arguments; the graph matches it by exact
display path, else by path suffix (a repo-relative anchor works).

W1 still has no `calls`/`references` edges, so the component carries importers rather than callers:
the pack's note text still says "callers", and the graph's own SCHEME documents the deferral.

## Surfaces

| Surface              | Mode                          | What it does                                                                                                                                      |
| -------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tools/post-execute` | waterfall, plain registration | `next()` first; detect → gate → resolve (graph query for Neighborhood) → prepend ONE labeled `additionalContexts` notice; never replaces content. |
| `agent/pre-step`     | waterfall, plain              | Pure observer: resets the per-turn note counter when the step ends with a user message.                                                           |

## The embedded pack (`Source/Variable/Defaults.ts`, pack `graph` v1)

| Intent         | Priority | Threshold | Signals (weight)                                       | Resolution                                                                                        |
| -------------- | -------- | --------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `Neighborhood` | 1        | 0.6       | path-shape (0.4), symbol-shape (0.5), glob-shape (0.3) | `workspaceGraph.neighborhood(anchor)`; empty component → static fallback; absent/failed → abstain |
| `Sibling`      | 2        | 0.5       | usage-shape (0.5), family-shape (0.3)                  | Static: `Documentation/Plugins/PLUGIN-FAMILY.md`, the inventory, `**/README.md`                   |

Confidence: `k = sigmoid(Σ weights − 0.6)`; the note emits iff `k ≥ gate`, the candidate set
survives the cap and the exclusion, and the cooldown/cap allow it. The pack's per-intent thresholds
(0.6 / 0.5) are set so that only full-evidence probes cross them (Neighborhood needs all three
signals: k 0.65; Sibling needs both: k 0.55) - the config `threshold` may raise the gate, never
lower it below the pack floor.

## Ledger strings (byte-exact, module-owned)

```
graph-suggester: activated (bundle 0.3.0, intents <n>, threshold <t>)
graph-suggester: disabled (enabled=false)
graph-suggester: suggest <Intent> <k> <n> candidates call <tool>
graph-suggester: abstained graph-unavailable <Intent> <k>
graph-suggester: abstained ambiguous <Intent> <k>
graph-suggester: graph unavailable
graph-suggester: graph unavailable <reason>
graph-suggester: suppressed cooldown <Intent>
graph-suggester: suppressed cap <Intent>
```

## Identity (the four agreeing places)

1. Package name: `@playform/hook-dsh-graph-suggester`.
2. The `name` export: `graph-suggester`.
3. The State build's `module:` option: `graph-suggester`.
4. The ledger `logFile` default: `~/.dsh/playform/hook-dsh-graph-suggester.log`.

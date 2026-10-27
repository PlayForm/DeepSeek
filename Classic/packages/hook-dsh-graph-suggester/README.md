# @playform/hook-dsh-graph-suggester

> v0.2.0 - UNPUBLISHED - plan:
> [SEARCH-SUGGESTER-PLUGIN](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md)

## The role

The graph-suggester hook: a DeepSeek Harness plugin that upgrades the suggester family's candidate
list from paths and globs to the **connected component around the symbol**
([SEARCH-SUGGESTER-PLUGIN.md](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md) §9.2).

When the model reads or greps a source file, the hook asks the workspace v4.1 graph service for the
code-block neighborhood (the definition, the callers, the tests, the doc block) and prepends ONE
labeled `additionalContexts` notice naming it.

Two intents in the embedded pack (`Source/Variable/Defaults.ts`):

- **Neighborhood** - resolved through the graph service; a static fallback set is appended only when
  the graph answers with an _empty_ component. When the service is absent or throws, the intent
  **abstains** with a `graph unavailable` ledger line (once per apply) - the graph intent never
  guesses.
- **Sibling** - a package-name grep resolves statically (the family roster, the inventory, the
  sibling README).

The graph service shape is declared in this package's own `Source/Interface/Graph.ts` (the
self-contained PoC rule): no import from sibling workspace packages.

The real service (`@playform/plugin-dsh-workspace-graph`) now exposes the same
`neighborhood(path, limit)` query - served from its W1 `contains`/`imports` edges, so W1 gives
importers and tests rather than callers - and the `Real-Graph-Neighborhood` smoke folder proves this
hook against the real populated graph (the real graph's own `indexWorkspace` fills it).

## The surfaces

- The `tools/post-execute` waterfall listener (after the ccr's `{prepend: true}` listener): one
  `additionalContexts` notice, never a content replacement.
- The `agent/pre-step` listener: the per-turn reset of the note counter.
- Injected services: `pluginFactory`, `workspaceGraph` (the `neighborhood(path, limit)` query;
  absent or throwing means the graph intent abstains).
- No tool, no provided service.

## How it works

1. **The post-execute listener.**

    The `tools/post-execute` listener (waterfall, plain registration - after the ccr's
    `{prepend: true}` listener) calls `next()` first.

    Then the hook runs detect -> gate -> resolve (graph query for Neighborhood) -> prepend ONE
    notice.

    Content is never replaced.

2. **The pre-step listener.**

    The `agent/pre-step` listener resets the note counter each turn when a user message enters.

## The ledger

The lines are prefixed `graph-suggester: ` and go to `logFile`:

```text
activated (...)
suggest <id> <k> <n> candidates call <tool>
suppressed <verdict> <id>
abstained ambiguous <id> <k>
abstained graph-unavailable <id> <k>
graph unavailable <error>
graph-suggester: <error>; the note is skipped
```

## The configuration

| Field             | Default                                        | Meaning                         |
| ----------------- | ---------------------------------------------- | ------------------------------- |
| `enabled`         | `true`                                         | the plugin ships enabled        |
| `log`             | `true`                                         | the ledger switch (shared cell) |
| `logFile`         | `~/.dsh/playform/hook-dsh-graph-suggester.log` | the ledger                      |
| `threshold`       | `0.75`                                         | the gate threshold `k`          |
| `maxCandidates`   | `7`                                            | the bound on named candidates   |
| `maxNoteChars`    | `1200`                                         | the note length bound           |
| `cooldownCalls`   | `6`                                            | the cooldown between notes      |
| `maxNotesPerTurn` | `3`                                            | the per-turn cap                |
| `intents`         | `[]`                                           | the intent filter               |
| `emitOn`          | `["glob", "grep", "read"]`                     | the tools that trigger the gate |
| `exclude`         | `["node_modules", "Target", ".git", "dist"]`   | the excluded paths              |
| `graph`           | `true`                                         | the graph query switch          |

Every field is a volatile cell.

## The build and the tests

The build is `pnpm prepublishOnly` (Source/prepublishOnly.sh): the plugin build (ESM `Target/`, Test
tree excluded), the Test build, the harness selfcheck, and the Test type-check. The smoke folders:
`Loader-And-Activation`, `Pipeline-And-Graph` (the FakeGraph contract), `Real-Graph-Neighborhood`
(the real service).

## The plan

- [SEARCH-SUGGESTER-PLUGIN](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md) - section 9.2, the
  graph-resolved candidate list.
- Built and smoked (the suite is the arbiter); ships `enabled: false` in the bundle patch.

## License

CC0-1.0.

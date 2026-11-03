# @playform/hook-dsh-graph-suggester

> v0.2.1 - UNPUBLISHED - plan:
> [SEARCH-SUGGESTER-PLUGIN](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md)

## The role

The graph-suggester hook: a DeepSeek Harness plugin that upgrades the candidate list of the
suggester family from paths and globs to the **connected component around the symbol**
([SEARCH-SUGGESTER-PLUGIN.md](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md) §9.2).

When the model reads or greps a source file, the hook asks the workspace v4.1 graph service for the
code-block neighborhood (the definition, the callers, the tests, the doc block) and prepends ONE
labeled `additionalContexts` notice that names it.

Two intents are synthesized per call from that query (`Source/Function/Apply.ts`), and the graph is
their only candidate source:

- **Neighborhood** - the whole connected component of the anchor.

- **Sibling** - the same-directory projection of the same component, with the anchor excluded. It
  speaks when the config's `intents` list selects it alone, because the Neighborhood intent outranks
  it on the tie.

The private literal pack and its static fallback targets were removed:
`Source/Variable/Defaults.ts` is gone, so the built-in projection no longer exists in this package
and nothing names a path of its own.

When the service is absent or throws, the intent **abstains** with a `graph unavailable` ledger line
(once per apply) and an `abstained graph-unavailable` line per call, because the graph intent never
guesses.

When the component is **empty**, the intent abstains `abstained no-companions` instead of falling
back to literal targets.

The graph service shape is declared in the own `Source/Interface/Graph.ts` of this package (the
self-contained PoC rule): no import from sibling workspace packages.

The real service (`@playform/plugin-dsh-workspace-graph`) now exposes the same
`neighborhood(path, limit)` query, served from its W1 `contains`/`imports` edges, so W1 gives
importers and tests rather than callers.

The `Real-Graph-Neighborhood` smoke folder proves this hook against the real populated graph, which
the `indexWorkspace` of the real graph fills.

## How it works

1. **The post-execute listener.**

    The `tools/post-execute` listener (waterfall, plain registration - after the `{prepend: true}`
    listener of ccr) calls `next()` first.

    Then the hook probes the anchor, queries the graph, builds the synthetic intents, runs detect ->
    gate -> resolve, and prepends ONE notice.

    Content is never replaced.

2. **The pre-step listener.**

    The `agent/pre-step` listener resets the note counter each turn when a user message enters.

## The plan

Built and smoked, with the suite as the arbiter: `Loader-And-Activation`, `Pipeline-And-Graph` (the
FakeGraph contract) and `Real-Graph-Neighborhood` (the real service).

Ships `enabled: false` in the bundle patch.

Plan: [SEARCH-SUGGESTER-PLUGIN](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md) §9.2.

## License

CC0-1.0.

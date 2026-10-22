# @playform/hook-dsh-graph-suggester

The graph-suggester hook: a DeepSeek Harness plugin that upgrades the suggester family's candidate
list from paths and globs to the **connected component around the symbol**
([SEARCH-SUGGESTER-PLUGIN.md](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md) §9.2). When the
model reads or greps a source file, the hook asks the workspace v4.1 graph service for the
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
self-contained PoC rule): no import from sibling workspace packages; the end-phase wires the real
import.

## How it works

1. `tools/post-execute` (waterfall, plain registration - after the ccr's `{prepend: true}`
   listener): `next()` first; detect → gate → resolve (graph query for Neighborhood) → prepend ONE
   notice. Content is never replaced.
2. `agent/pre-step`: the per-turn reset of the note counter when a user message enters.

## Status

PoC phase: the package and Source are complete; the smoke suites, the build pass, and the wiring are
the end-phase (POC-BRIEF.md §8). Ships `enabled: false` in the bundle patch.

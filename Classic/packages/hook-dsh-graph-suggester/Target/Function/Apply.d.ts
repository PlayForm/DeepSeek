/**
 * @module Apply
 *
 * The plugin entry function, a THIN MODULE WIRE-UP in the factory family's shape: build the
 * State through `Factory.State`, emit the durable activation proof, and register the hook's OWN
 * listeners.
 *
 * @remarks
 * The graph-suggester's special step: the candidate list comes from the WORKSPACE GRAPH SERVICE
 * (`ctx.workspaceGraph.neighborhood(anchor, limit)`) - the instantiated connected component with
 * the ANCHOR EXCLUDED (the importers, the dependencies, the tests, the doc block) - and from
 * NOWHERE else. The file the agent just touched is never a target, so the note names the files
 * around it, never the one it already read. The private literal pack and its static fallback
 * targets are RETIRED (`Variable/Defaults.ts` is unimported): when the graph answers with an
 * empty component the hook abstains `abstained no-companions <id> <k>` instead of naming a
 * literal path, and when the service is absent or throws it abstains
 * `abstained graph-unavailable <id> <k>` after ONE `graph unavailable` line per apply. The graph
 * intent never guesses.
 *
 * 1. `tools/post-execute` (waterfall, plain ctx.on): next() first, the anchor probe, the graph
 *    query, the synthetic intents of this call, detect, gate, resolve, and ONE
 *    additionalContexts notice. Never replaces content.
 * 2. `agent/pre-step` (waterfall, plain): the per-turn reset of the per-turn note counter when
 *    a user message enters.
 *
 * THE INTENTS ARE SYNTHESIZED FROM THE QUERY, NOT FROM A TABLE: one graph answer yields at most
 * two intents, prepended as data so the existing Detect/gate/note pipeline judges them exactly
 * like a compiled pack:
 *
 * - `Neighborhood` - priority 1: the whole connected component, the anchor excluded;
 * - `Sibling` - priority 2: its same-directory projection (the anchor excluded), the directory
 *   peers the same component names.
 *
 * Both carry ONE signal (`rule: "graph"`, the literal `.` pattern, weight 2.5) and the 0.75
 * floor, so `k = sigmoid(2.5 - 0.6) = 0.87` for either. The Neighborhood intent outranks
 * Sibling on the tie, so Sibling speaks when the config's `intents` list selects it alone.
 *
 * THE WATERFALL DISCIPLINE (the ccr/tool-coach precedent, live-verified):
 *
 * - `next()` is ALWAYS awaited FIRST, before any decision;
 * - pass-through is `return decision` unchanged;
 * - FAIL-OPEN: every listener body is one try/catch - on any error a logger.warn records it and
 *   the downstream decision is returned UNCHANGED. A note never fails a tool call.
 *
 * `inject: ["pluginFactory", "workspaceGraph"]` (Library.ts) - the loader's PENDING state orders
 * the graph service first; a runtime absence still routes through the abstention path, never
 * through a throw into the waterfall. The function returns NOTHING.
 */
import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default _default;
declare function _default(Context: Context, Options: Config): void;

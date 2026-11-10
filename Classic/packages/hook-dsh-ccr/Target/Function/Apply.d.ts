/**
 * @module Apply
 *
 * The plugin entry function: a thin module wire-up in the factory family's
 * shape that builds the State, emits the durable activation proof, builds the
 * store and registers the post-execute listener and the `ccr_retrieve` tool.
 *
 * @remarks
 * The wire-up: build the State through `Factory.State` (the cell unwrap, the
 * shared mappings Ledger←logFile / Enabled←log and the module's own fields
 * via the setup `fields` map - factory SCHEME.md §2.10), emit the durable
 * activation proof (the module's own string, via Factory.Append - the factory
 * never owns ledger strings), build the store, register the CCR hook's OWN
 * tools/post-execute listener, and register the `ccr_retrieve` TOOL (the one
 * retrieval relay; Aphrodite's 13 relays become 1).
 *
 * THE WATERFALL DISCIPLINE (verified against the harness pipeline docs and
 * the production spill-policy precedent, a live tools/post-execute
 * result-rewriter):
 *   - `next()` is ALWAYS awaited FIRST, before any decision - omitting it
 *     would short-circuit the downstream post-execute listeners;
 *   - pass-through is `return decision` - the decision as the downstream
 *     listeners shaped it, byte-identical;
 *   - a decision is replaced only when it is an `accept` WITHOUT a `value`
 *     (`Object.hasOwn(decision, "value")` - a value-carrying decision is
 *     canonical; its content is a derived projection and cannot be replaced,
 *     the PostToolDecision union's `content?: never`);
 *   - the content basis is `decision.content ?? result.content` - what the
 *     downstream listeners already shaped, or the raw result;
 *   - FAIL-OPEN: the whole transform is one try/catch - on any error a
 *     `logger.warn` records it and the downstream decision is returned
 *     UNCHANGED. Never throw into the waterfall: a thrown listener would
 *     turn a good tool result into a pipeline failure;
 *   - `{ prepend: true }` - the CCR gate runs before the other post-execute
 *     listeners (the spill-policy's posture: a compression policy wants the
 *     pristine result, not a downstream one);
 *   - `exec.signal` is not observed by an extra await: the listener's own
 *     work is synchronous (classify, hash, map ops, the ledger append) - the
 *     only await is `next()` itself.
 *
 * THE CONTEXT ENGINE (phase 4, config `contextEngine`, OFF by default): when
 * the flag is on, the engine runtime is built (Function/Engine for the
 * decision math and the documented limitations), the post-execute listener
 * OBSERVES every result (its content for a pass-through, its hash for an
 * already-stored one), and ONE `agent/pre-step` waterfall listener runs the
 * archive decision at each step boundary - pushing the archived content
 * through the EXISTING compress path (the same gate with the threshold
 * opened, the same store, the same evictions) and emitting
 * `ccr: engine archived <n> results`. When the flag is off, NO pre-step
 * listener is registered and nothing is observed: the engine is fully inert
 * (the smoke asserts the inertness).
 *
 * NOT factory machinery, deliberately:
 *   - Factory.Wire is fs/observed-hardwired (the family's SILENCE) - the CCR
 *     hook registers its own plain `ctx.on("tools/post-execute", ...)`,
 *     fiber-owned, removed on unload, no manual bookkeeping;
 *   - Factory.Attach has no consumer here: no jobs, no inflight
 *     continuations, no storage-domain journal traffic through the FACTORY
 *     (the compression store is the plugin's OWN LRU, not the factory's
 *     lifecycle journal); the P4 arm below opens the plugin's OWN `ccr_store`
 *     domain for the store's durable mirror, with the JSONL file as the
 *     recovery fallback for one release; the activation record still reaches
 *     the shared domain best-effort via Factory.Journal like every module's
 *     lifecycle line.
 *   - Factory.Schema is not used for Config: the module owns its schema
 *     (Variable/Config.ts, the plan §5 verbatim).
 *
 * The function returns NOTHING - never a value: the loader treats apply
 * return values specially, and a returned State object silently killed event
 * delivery (live-verified, plugin-development skill pitfall 16). Test probes
 * read the state through the `ctx.__ccrState` attachment instead.
 *
 * `inject: ["pluginFactory", "tools"]` (Library.ts) - the factory is a
 * REQUIRED service (the State builder + the ledger); the loader's PENDING
 * state handles the ordering, so bundle-layer order never matters. `tools`
 * serves the ccr_retrieve registration (ToolRuntime.register). Nothing else:
 * the ledger append is the factory's own plain-fs exemption, and the store's
 * optional journal is the store's own plain-fs exemption (Function/Store).
 */
import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default _default;
declare function _default(Context: Context, Options: Config): void;

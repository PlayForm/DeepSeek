/**
 * @module Apply
 *
 * The plugin entry function: fail-loud validation, the State build, the
 * durable activation proof, and the FIVE listeners of the coaching ladder.
 *
 * @remarks
 * The State build uses the factory's cell unwrap + the P10 volatile refresh.
 * Plan Part 3 §3.2 + Part 4 §4.1:
 *
 *   1. tools/post-execute  (waterfall, plain ctx.on - AFTER the CCR
 *      {prepend:true} listener and normalize's post-execute, since plain
 *      registration order guarantees it; detection is order-independent
 *      because exec is immutable): tier 0 ledger + tier 1 note + tier 2
 *      strike accounting;
 *   2. tools/pre-execute   (waterfall, plain ctx.on, registered
 *      unconditionally, no-op unless enforce != "off"): tier 3 deny;
 *   3. agent/pre-step      (plain): the user-message reset of the chain
 *      (repeat-tool-reminder precedent);
 *   4. system-prompt/assemble (waterfall, after next(), append-only): the
 *      tier-2 persistent section, TTL-rebuilt, cache-invalidated on
 *      tools/change;
 *   5. tools/change        (emit): tier-2 section-cache invalidation only.
 *
 * THE WATERFALL DISCIPLINE: `next()` is ALWAYS awaited first; pass-through
 * returns the downstream decision unchanged; FAIL-OPEN: every listener body
 * is one try/catch - on any error a logger.warn records it and the downstream
 * result is returned UNCHANGED. A note never fails a waterfall.
 *
 * NOT factory machinery, deliberately: no fs/observed Wire, no Attach, no
 * factory Schema - the coach owns its schema (Variable/Config) and its
 * strings. The function returns NOTHING; test probes read the state through
 * the `ctx.__hookDshToolCoachState` attachment.
 *
 * `inject: ["pluginFactory", "tools"]` (Library.ts) - the factory provides
 * the State builder + the ledger; `tools` provides the live registry fetch
 * (ctx.tools.schemas(), plan Part 3 §3.1).
 */
import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default _default;
declare function _default(Context: Context, Options: Config): void;

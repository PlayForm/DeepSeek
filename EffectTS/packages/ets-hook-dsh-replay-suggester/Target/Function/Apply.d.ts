/**
 * @module Apply
 *
 * The plugin entry function, a THIN MODULE WIRE-UP in the factory family's
 * shape: build the State through `Factory.State`, emit the durable activation
 * proof, load the SEEDED history store ONCE (the optional boot seed), probe
 * the storage facility for the PRODUCER's durable tier, and register the
 * hook's OWN listeners.
 *
 * @remarks
 * The replay-suggester's special steps:
 * - THE PRODUCER (the wave 2c re-spec): every judged call that names a path is
 *   appended to the recall history (Function/Record) - the per-agent ring, the
 *   durable mirror, and the durable tier (the `replay_history` domain or the
 *   JSON fallback, Function/Storage/Recover/Persist). The append happens
 *   BEFORE the recall, and the sequence fence keeps the call out of its own
 *   recall.
 * - THE RECALL IS THE ONLY DEFAULT SOURCE: the seeded store first (the
 *   optional user seed), then the live history (the agent ring, then the
 *   durable mirror). When a recall exists it is SYNTHESIZED into ONE pack
 *   family (`Repeat`) whose targets are the files touched last time, so the
 *   note's candidates are the agent's OWN previous tool calls and never a
 *   literal pack. The synthesized family's note keeps the caveat line, and a
 *   record with no verification still falls back to it. Without a record and
 *   without an explicit pack the hook ABSTAINS (`replay no-history`): a replay
 *   answer without a record is a guess, and the plan forbids the guess (§2.4).
 * - THE EXPLICIT PACK IS THE ONLY OVERRIDE: `Resolve(root, { builtin: false
 *   })`, so a hand-written `replay/` family still speaks (it may outrank the
 *   synthesized one) and the built-in pack is never consulted.
 *
 * The listeners, in registered order:
 * 1. tools/post-execute (waterfall, plain ctx.on): next() first, record,
 *    recall, the synthesized family, the explicit pack, detect, gate, and
 *    prepend ONE additionalContexts notice. Never replaces content.
 * 2. agent/pre-step (waterfall, plain): the per-turn reset of the per-turn
 *    note counter when a user message enters.
 *
 * THE WATERFALL DISCIPLINE (the ccr/tool-coach precedent, live-verified):
 * - `next()` is ALWAYS awaited FIRST, before any decision;
 * - pass-through is `return decision` unchanged;
 * - FAIL-OPEN: every listener body is one try/catch - on any error a
 *   logger.warn records it and the downstream decision is returned UNCHANGED.
 *   A note never fails a tool call.
 *
 * THE WORKSPACE GATE: the root is PACK-INDEPENDENT (the nearest ancestor of
 * the call path carrying `.git` or `package.json`, from the call path plus the
 * session cwd). A call outside any workspace has no history to mine here and
 * abstains (`abstained foreign-workspace`). THE RECALL IS VALIDATED AGAINST
 * THE TREE: the store is cross-session by design, so a record may name a path
 * that was deleted, a bare directory, or the call's own anchor - the anchor is
 * excluded, only an existing regular file survives (Function/Exists's
 * `IsFile`), a path in the anchor's OWN DIRECTORY wins outright (precision
 * first), and without one the same release tree (Classic with Classic,
 * EffectTS with EffectTS) ranks ahead of the other in a stable order. A record
 * with no surviving path logs `abstained no-companions`. The explicit pack's
 * families come from the RESOLVED pack per call (Families(pack, "replay")),
 * compiled once per root, so a repo pack's own replay family joins the
 * synthesized one without a restart.
 *
 * `inject: ["pluginFactory"]` (Library.ts) - the factory is a REQUIRED
 * service (the State builder + the ledger); the loader's PENDING state handles
 * the ordering. The function returns NOTHING.
 */
import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default _default;
declare function _default(Context: Context, Options: Config): void;

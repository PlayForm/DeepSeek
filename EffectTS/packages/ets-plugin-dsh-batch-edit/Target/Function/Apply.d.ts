/**
 * @module Apply
 *
 * Runs the plugin entry function: fail-loud validation, the State build (the
 * factory's cell unwrap + the P10 volatile refresh), the durable activation
 * proof, and the listener set.
 *
 * @remarks
 * Registration ONLY - every behavior lives in its own Function module
 * (Machine, Ops, Tools, Present, Ledger).
 *
 * - T1: the batch_edit tool registration (the tools seam, probed - the live
 *   containers' register pattern)
 * - L11: fs/observed via the factory's Wire (ROOT context): the stale-halt
 *   observer - a SYNCHRONOUS cell flipper, no awaits, no I/O (the event-loop
 *   hazard mitigation)
 * - L2: tools/pre-execute (waterfall, `next()` FIRST, fail-open): the
 *   ADVISORY bash intercept (config interceptBash, OFF by default in v1) - it
 *   tags the exec and records the attempt, NEVER denies (the control layer
 *   comes later as its own plugin)
 * - L8: agent/pre-step (waterfall, `next()` FIRST, fail-open): the turn
 *   boundary seam (the deadline scan and the settle fold - the inline commit
 *   path leaves nothing in flight, so v1 is a pass-through that holds the
 *   seam for the background-branch checkpoints)
 *
 * THE WATERFALL DISCIPLINE: `next()` is ALWAYS awaited first; pass-through
 * returns the downstream decision unchanged; FAIL-OPEN: every listener body
 * is one try/catch - on any error a logger.warn records it and the downstream
 * result is returned UNCHANGED. The function returns NOTHING (a returned
 * value silently kills event delivery).
 */
import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default _default;
declare function _default(Context: Context, Options: Config): void;

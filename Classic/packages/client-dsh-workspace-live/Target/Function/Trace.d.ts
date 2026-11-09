/**
 * @module Trace
 *
 * The live view's source over the D5 bus.
 *
 * @remarks
 * The bus is the factory's `ctx.trace` service; the client half resolves it
 * structurally (only `on` is required, `ring` is used when present), seeds
 * the tail from the recent ring when the bus exposes one (the panel attaches
 * mid-session, so the held history is the honest starting state), then
 * subscribes to the names in `Variable/Trace.ts` and keeps the envelopes
 * NEWEST FIRST, bounded by the Config maxEvents - the tail is a status
 * surface, not a log store. Every new envelope notifies the subscribers (the
 * stable-until-event rule: no polling, no timer). Without a bus the tail is
 * empty, `live` is false, and every subscription is a no-op - the documented
 * static state, never an error.
 *
 * THE BUS IS RESOLVED ON FIRST USE, NOT AT CONSTRUCTION. The client graph is
 * composed in dependency order, so the panel-family host that provides the
 * browser `trace` service may apply AFTER this plugin; a construction-time
 * capture would freeze the static face forever. The tab mounts on a click,
 * long after every plugin applied, so the first `tail()` / `live` read is the
 * earliest moment the bus is guaranteed to be observable.
 */
import type { Context } from "@deepseek-ai/cordis";
import type LiveTrace from "@Interface/Trace.js";
export default function Trace(ctx: Context, Bound: number): LiveTrace;

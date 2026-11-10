/**
 * @module Trace
 *
 * The live view's source over the D5 bus.
 *
 * @remarks
 * The bus is the factory's `ctx.trace` service; the client half resolves it
 * structurally (only `on` is required, `ring` is used when present), seeds the
 * tail from the recent ring when the bus exposes one (the panel attaches
 * mid-session, so the held history is the honest starting state), then
 * subscribes to the names in Variable/Trace.ts and keeps the envelopes NEWEST
 * FIRST, bounded by the Config maxEvents - the tail is a status surface, not a
 * log store. Every new envelope notifies the subscribers (the
 * stable-until-event rule: no polling, no timer). Without a bus the tail is
 * empty, `live` is false, and every subscription is a no-op - the documented
 * static state, never an error.
 */
import type { Context } from "@deepseek-ai/cordis";
import type LiveTrace from "../Interface/Trace.js";
export default function Trace(ctx: Context, Bound: number): LiveTrace;

/**
 * @module Trace
 *
 * Resolve the panel's live status source from the client context.
 *
 * @remarks
 * The D5 bus is the factory's `ctx.trace` service on the host; a client-side
 * host that exposes it in the browser registers a service under the same name
 * (Variable/Trace.ts `service`). The panel reads it structurally: only the
 * `on` face is required, so a bridge that forwards the bus can answer without
 * importing the factory. A missing service (or one without `on`) is the
 * documented static fallback - the panel never throws over an absent trace.
 */
import type { Context } from "@deepseek-ai/cordis";
import type { PanelTrace } from "../Interface/Trace.js";
export default function Trace(ctx: Context): PanelTrace | undefined;

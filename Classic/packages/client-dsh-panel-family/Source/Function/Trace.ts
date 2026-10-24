// Trace - resolve the panel's live status source from the client context.
// The D5 bus is the factory's `ctx.trace` service on the host; a client-side
// host that exposes it in the browser registers a service under the same name
// (Variable/Trace.ts `service`). The panel reads it structurally: only the
// `on` face is required, so a bridge that forwards the bus can answer without
// importing the factory. A missing service (or one without `on`) is the
// documented static fallback - the panel never throws over an absent trace.
import type { Context } from "@deepseek-ai/cordis";
import type { PanelTrace } from "@Interface/Trace.js";
import Names from "@Variable/Trace.js";

const IsTrace = (Candidate: unknown): Candidate is PanelTrace =>
	typeof Candidate === "object" &&
	Candidate !== null &&
	typeof (Candidate as PanelTrace).on === "function";

export default function Trace(ctx: Context): PanelTrace | undefined {
	const Candidate: unknown = ctx.get(Names.service);
	switch (true) {
		case IsTrace(Candidate):
			return Candidate;
		default:
			return undefined;
	}
}

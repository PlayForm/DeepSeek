// Trace - the host's forwarding face over the D5 bus. The bus itself is
// `ctx.trace` (provided once by @playform/plugin-dsh-factory); the host
// context already owns that service name, so the package exposes the
// forwarder as `panelFamilyTrace` and the browser half re-publishes it under
// the panel's `trace` name (Source/Function/Client.ts). The forwarder reads
// the bus structurally - only `on` is required, `ring` is used when the bus
// has one - so the package never imports the factory or the trace library.
// A composition without the bus exposes no forwarder: the panel's documented
// static fallback (empty tail, `live: false`) is the honest state.
import type { Context } from "@deepseek-ai/cordis";
import type HostTrace from "@Interface/Trace.js";
import type { PanelEnvelope } from "@Interface/Trace.js";

type Bus = {
	on(kind: string, listener: (envelope: PanelEnvelope) => void): () => void;
	ring?(limit?: number): PanelEnvelope[];
};

const IsBus = (Candidate: unknown): Candidate is Bus =>
	typeof Candidate === "object" &&
	Candidate !== null &&
	typeof (Candidate as Bus).on === "function";

export default function Trace(ctx: Context): HostTrace | undefined {
	const Bus = ctx.get("trace");
	switch (true) {
		case !IsBus(Bus):
			return undefined;
		default:
			return {
				on: (kind, listener) => Bus.on(kind, listener),
				ring: (limit) => (typeof Bus.ring === "function" ? Bus.ring(limit) : []),
			};
	}
}

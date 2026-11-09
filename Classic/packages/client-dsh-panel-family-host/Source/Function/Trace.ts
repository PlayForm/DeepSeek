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

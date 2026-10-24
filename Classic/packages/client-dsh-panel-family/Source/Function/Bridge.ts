// Bridge - resolve the plain-field bridge from the client context. PHASE-7's
// bridge is the ONE trusted full-config write surface: the host half
// implements `editFull(namespace, patch)` over ctx.configEditor.edit() and
// exposes it to the browser. The panel accepts either exposure, in order:
//   1. a client-side service named `panelFamilyBridge` (an in-page host);
//   2. the gateway's `remote.playformFamilyPanel.editFull` face.
// A missing bridge is not an error: the form marks every plain field
// read-only with the documented "applies on remount" note, and a write
// attempt logs the byte-exact missing-bridge line (Variable/Lines.ts).
import type { Context } from "@deepseek-ai/cordis";
import type { PanelBridge } from "@Interface/Bridge.js";

const IsBridge = (Candidate: unknown): Candidate is PanelBridge =>
	typeof Candidate === "object" &&
	Candidate !== null &&
	typeof (Candidate as PanelBridge).editFull === "function";

export default function Bridge(ctx: Context): PanelBridge | undefined {
	const Direct: unknown = ctx.get("panelFamilyBridge");
	switch (true) {
		case IsBridge(Direct):
			return Direct;
		default: {
			const Remote = ctx.get("remote") as { playformFamilyPanel?: unknown } | undefined;
			const Candidate = Remote?.playformFamilyPanel;
			switch (true) {
				case IsBridge(Candidate):
					return Candidate as PanelBridge;
				default:
					return undefined;
			}
		}
	}
}

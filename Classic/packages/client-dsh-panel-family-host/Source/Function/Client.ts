// Client - the browser half of @playform/client-dsh-panel-family-host (the
// built `./client` export; the module system serves it as a lazy-CJS
// factory). The host process owns the implementations: `panelFamilyBridge`
// over ctx.configEditor.edit() and `panelFamilyTrace` over ctx.trace. This
// half is the FORWARDING PATH into the browser: it waits for the harness's
// generated Remote namespace `playformFamilyPanel` (the gateway face) and
// re-publishes its two members under the names the panel resolves -
// `panelFamilyBridge.editFull` and `trace.on/ring`. The remote namespace is
// the documented residual (a generated Typert contribution cannot be built
// from a Classic package); without it this half provides nothing and the
// panel keeps its documented fallbacks (plain fields read-only, static
// status).
import type { Context } from "@deepseek-ai/cordis";
import type HostTrace from "@Interface/Trace.js";

type RemoteFace = {
	editFull?(namespace: string, patch: Record<string, unknown>): Promise<unknown>;
	trace?: HostTrace;
};

type Remote = {
	playformFamilyPanel?: RemoteFace;
};

const IsRecord = (Value: unknown): Value is Record<string, unknown> =>
	typeof Value === "object" && Value !== null && !Array.isArray(Value);

/** A Remote method's answer is a boolean or the gateway's `{ ok }` envelope. */
const Accepted = (Result: unknown): boolean =>
	Result === true || (IsRecord(Result) && Result["ok"] === true);

/** Re-publish the host's two faces under the names the panel resolves. */
const Provide = (ctx: Context): void => {
	const Remote = ctx.get("remote") as Remote | undefined;
	const Panel = Remote?.playformFamilyPanel;
	const EditFull = Panel?.editFull;
	switch (true) {
		case EditFull !== undefined && ctx.get("panelFamilyBridge") === undefined:
			ctx.provide("panelFamilyBridge", {
				editFull: async (namespace: string, patch: Record<string, unknown>) =>
					Accepted(await EditFull.call(Panel, namespace, patch)),
			});
			break;
		default:
			break;
	}
	const TraceFace = Panel?.trace;
	const On = TraceFace?.on;
	switch (true) {
		case On !== undefined && ctx.get("trace") === undefined:
			ctx.provide("trace", {
				on: (kind: string, listener: (envelope: unknown) => void) =>
					On.call(TraceFace, kind, listener),
				ring: (limit?: number) =>
					typeof TraceFace?.ring === "function" ? TraceFace.ring(limit) : [],
			});
			break;
		default:
			break;
	}
};

export default function Client(ctx: Context): void {
	// The namespace service appears after the Remote assembly mounts its
	// contribution; `inject` is the service-ready seam for it.
	ctx.inject(["remote.playformFamilyPanel"], (Ready) => {
		Provide(Ready);
	});
}

// Apply - the host package's apply body: provide the three services and log
// the activation. Every service is provided with ctx.provide, so it is
// removed with the plugin. When the Config enabled is false the READ endpoints
// still register but every method returns a `rejected` failure, and the
// plain-field bridge refuses too (the idle posture never silently passes: a
// disabled package answers, it just refuses to read and to write).
//
//   * `panelFamilyHost` - tail(namespace, lines) / stats() (Interface/Host.ts);
//   * `panelFamilyBridge` - editFull(namespace, patch) over
//     ctx.configEditor.edit() (Interface/Bridge.ts, Function/Bridge.ts);
//   * `panelFamilyTrace` - the D5 bus forwarder (Interface/Trace.ts,
//     Function/Trace.ts), provided only when `ctx.trace` exists.
//
// The host context already owns the `trace` service name (the factory's D5
// bus), so the forwarder is named `panelFamilyTrace` here; the browser half
// re-publishes it as `trace` (Source/Function/Client.ts).
import type { Context } from "@deepseek-ai/cordis";
import BridgeFn from "@Function/Bridge.js";
import StatsFn from "@Function/Stats.js";
import StreamFn from "@Function/Stream.js";
import TailFn from "@Function/Tail.js";
import TraceFn from "@Function/Trace.js";
import type Config from "@Interface/Config.js";
import Lines from "@Variable/Lines.js";

export default function Apply(ctx: Context, config: Config): void {
	// Unwrap one possibly-volatile config cell (`{ get }` reference or value):
	// the loader delivers every volatile knob as a cell object, and both the
	// enabled gate and the numeric limit need the PLAIN value (the
	// gitguard/batchstate pattern: `Cell(...)` before the use).
	const Cell = (Value: unknown): unknown =>
		typeof (Value as { get?: unknown } | null)?.get === "function"
			? (Value as { get: () => unknown }).get()
			: Value;
	const logRoot = Cell(config.logRoot) as string;
	const maxLines = Cell(config.maxLines) as number;
	const enabled = Cell(config.enabled) === true;
	const ccrLog = Cell(config.ccrLog) as string;
	ctx.provide("panelFamilyHost", {
		tail: async (namespace: string, lines: number) =>
			// The enabled gate: a disabled endpoint refuses to read.
			enabled
				? TailFn(logRoot, maxLines, namespace, lines)
				: {
						ok: false,
						code: "rejected" as const,
						message: "the panel-family host is disabled (enabled=false)",
					},
		stats: async () =>
			enabled
				? StatsFn(ccrLog)
				: {
						ok: false,
						code: "rejected" as const,
						message: "the panel-family host is disabled (enabled=false)",
					},
	});
	// The plain-field bridge: the ONE trusted full-config write surface. The
	// disabled gate refuses before the editor is ever resolved.
	ctx.provide("panelFamilyBridge", {
		editFull: async (namespace: string, patch: Record<string, unknown>) => {
			switch (true) {
				case !enabled:
					ctx.logger.warn(Lines.disabled());
					return false;
				default:
					return BridgeFn(ctx, namespace, patch);
			}
		},
	});
	// The D5 forwarder: only when the host process carries the bus.
	const HostTrace = TraceFn(ctx);
	switch (true) {
		case HostTrace !== undefined:
			ctx.provide("panelFamilyTrace", HostTrace);
			break;
		default:
			break;
	}
	// The SSE bridge: the static `inject` in Library.ts orders this apply after
	// the harness webServer, so the route registers here and its disposer rides
	// the fiber (one teardown, no leak). A composition without a webServer
	// never reaches apply at all - the loader keeps the row PENDING.
	ctx.effect(() => StreamFn(ctx) ?? (() => {}), "panel: trace stream");
	// The activation line (ledger string, byte-stable):
	// `host: activated (enabled=<enabled>)`.
	ctx.logger.info(`host: activated (enabled=${String(enabled)})`);
}

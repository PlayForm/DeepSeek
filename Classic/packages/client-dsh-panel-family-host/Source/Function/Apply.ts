// Apply - the host package's apply body: provide the panelFamilyHost
// service (Interface/Host.ts) and log the activation. The service is
// provided with ctx.provide so it is removed with the plugin. When the
// Config enabled is false the service still registers but every method
// returns a `rejected` failure (the idle posture never silently passes:
// a disabled endpoint answers, it just refuses to read).
import type { Context } from "@deepseek-ai/cordis";
import StatsFn from "@Function/Stats.js";
import TailFn from "@Function/Tail.js";
import type Config from "@Interface/Config.js";

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
	// The activation line (ledger string, byte-stable):
	// `host: activated (enabled=<enabled>)`.
	ctx.logger.info(`host: activated (enabled=${String(enabled)})`);
}

// Config - the plugin's Schemastery Config schema (a Variable: one constant
// built once at load). Cordis validates the exported schema while the plugin
// loads and fills every default, so invalid configuration fails LOUD at load,
// and `apply` receives a validated plain config object. The shape this schema
// produces is Interface/Config.ts.
//
// COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as
// a MODULE-LEVEL named export, imported as Compose): the NON-MANIFEST posture
// uses `shared: false` - the MINIMAL shared block, ONLY the two universal
// volatile cells (`log`, `logFile`).
//
// VOLATILE CELLS: every knob is `.volatile()` - a capacity or policy edit
// lands on the next dispatch without a remount.
//
// `enabled` defaults to FALSE - the IDLE-forever posture: the plugin ships
// disabled, never appears in the profile's bundles, and enables only by an
// explicit ACTIVATE.
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose } from "@playform/ets-plugin-dsh-factory";

export default Compose(false, {
	logFile: Schema.string().default("~/.dsh/queue.log").volatile(),
	enabled: Schema.boolean().default(false).volatile(),
	// The user's capacity model is the law (SUBAGENT-QUEUE-PLUGIN.md section
	// 2.2): the MAIN conversation holds up to 10 subagents (the pool's
	// reserved slots, including the IDLE-held lanes); EVERY spawned agent's
	// own child fan-out is capped at 2 - the two-active regime. The
	// harness's own maxActiveSubagents knob stays the backstop; the plugin
	// enforces its model at the dispatch level.
	capacity: Schema.object({
		main: Schema.number().default(10).min(1),
		child: Schema.number().default(2).min(1),
	}).volatile(),
	// When a slot frees (a task completes, fails or is interrupted), the
	// dispatcher automatically assigns the next task (the IDLE coexistence:
	// the settled IDLE children release their active slots and the queue
	// fills them).
	autoDispatch: Schema.boolean().default(true).volatile(),
	// The routed dispatch: when the routing enforcer's `dshRoute` service is
	// present, each dispatch resolves the route per the user's policy
	// (silently); absent, the dispatch proceeds unrouted (the contained skip).
	routedDispatch: Schema.boolean().default(true).volatile(),
});

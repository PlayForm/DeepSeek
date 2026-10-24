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
import { Schema as Compose, Policy } from "@playform/plugin-dsh-factory";

export default Compose(false, {
	logFile: Schema.string().default("~/.dsh/playform/plugin-dsh-queue.log").volatile(),
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
	// THE SPAWN (the completion spec's D6 approval posture): when true, an
	// assignment actually STARTS a subagent through the harness's own
	// `ctx.subagents` service (never a private spawn, never a shell), with
	// the resolved route as the child's agentOptions. Shipped FALSE: a spawn
	// is a privileged action, so the plugin assigns seats only until the user
	// turns it on. False = the manual posture - the dispatch still assigns
	// and still ledgers, it just never launches.
	autoSpawn: Schema.boolean().default(false).volatile(),
	// The harness subagent provider the spawn selects by name
	// (`ctx.subagents.startActivation({ provider })`). The in-process spawn
	// backend registers as "spawn" (subagent-spawn-in-process's
	// `providerName` default); another backend (fork/acp/dsh-sdk) is selected
	// by naming it here.
	spawnProvider: Schema.string().default("spawn").volatile(),
	// THE POLICY BLOCK (D6): the per-action allowlist, the OUTER gate in front
	// of `autoSpawn` - `spawn` defaults to `approve`, so even with the knob on
	// an assignment waits for the user (the `spawn held` line). Composed from
	// the factory's shared block: read/index/record/suggest/message = auto,
	// write/commit/spawn = approve. Volatile as one object (a policy flip is
	// hot-editable); a resolved pack's `policy` section overrides the defaults
	// per action (the wiring is the next refinement; the type already exists).
	policy: Policy(),
});

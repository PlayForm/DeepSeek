// Library - the entry module of the SUBAGENT QUEUE
// (@playform/plugin-dsh-queue). Loader contract: `export const name` +
// `export const apply` + `export const Config` + `export const inject` +
// `export default { name, apply, Config, inject }` - the ONLY named exports
// in the tree (cordis requires them); every other module is a nameless
// default export composed Rust-style.
//
// THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }`
// SHADOWS the named exports - inject and Config MUST also sit on the default
// object, or service accessors throw `cannot get property "..." without
// inject` (the live-verified lesson recorded in the plugin-development skill
// and in the live-containers entry).
//
// @playform/plugin-dsh-queue - the subagent queue: subagent work becomes a
// QUEUE (the tasks as data, not the agents as contexts). The user's capacity
// model is the law:
//
//   - The MAIN conversation holds up to 10 subagents (the pool's reserved
//     slots); every spawned agent's own child fan-out is capped at 2 - the
//     two-active regime that prevents the workflow flood structurally.
//   - The orchestrator QUEUES tasks: each carries the id, the self-contained
//     spec (never altered - the dispatcher only schedules), the role for the
//     routing, the priority, the dependencies, the state (queued ->
//     dispatched -> running -> completed/failed/interrupted), the assigned
//     agent and the result hash.
//   - The dispatcher assigns tasks in a DETERMINISTIC order (dependencies
//     satisfied first, then priority descending, then FIFO by enqueue
//     sequence) when a slot frees; the settled IDLE children release their
//     active slots and the dispatcher fills them automatically.
//   - An assignment LAUNCHES through the harness's own subagent service
//     (`ctx.subagents.startActivation`) when `autoSpawn` is on - never a
//     private spawn, never a shell. The spec goes to the child verbatim, the
//     resolved route goes as its `agentOptions`, the parent is the exact live
//     Agent from `ctx.agents.currentInitiator()`, and the child's own result
//     settles the task. `autoSpawn` ships FALSE (the D6 approval posture: a
//     spawn is a privileged action), so the default mount assigns and ledgers
//     only; the idle-slot pull is gated on the same switch.
//   - The dispatched tasks carry their routes: the dispatcher consults the
//     routing enforcer's `dshRoute` service when it is present (probed at
//     dispatch time, never an injection dependency) and skips routing when
//     it is absent - the routed dispatch, silently per the user's policy.
//   - A restart reconciles: `Reconcile(persisted?)` compares the restored
//     queue record with the live agents and requeues an orphan once, then
//     fails it honestly - a task is never silently dropped.
//   - The queue's state compiles into the batch-state context block as one
//     TOC line (Function/Board).
//
// The store rides the family's journal conventions: every state flip writes
// a P5 journal record (best-effort through the factory) plus one byte-stable
// ledger line. The plugin ships DISABLED - the IDLE-forever posture: it never
// appears in the profile's bundles and enables only by an explicit ACTIVATE;
// a cold mount logs `disabled (enabled=false)` and the tools and the service
// no-op.
//
// Sits NEXT TO the BATCH-STATE and ROUTING-ENFORCER plugins in the
// orchestration layer (Documentation/Plans/ORCHESTRATION-FAMILY.md: the state
// compiles, the queue dispatches, the routing resolves). The self-contained
// PoC rule: the routing enforcer's service shape is declared in the queue's
// own Interface/Route.ts, never imported from the sibling package.
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";
import Version from "./Variable/Version.js";

export const name = "plugin-dsh-queue";

// Loader contract (cordis): the exported schema is validated and defaulted
// while the plugin loads; apply receives a plain validated config object.
export const Config = Definition;

// The compiled package version (Source/Variable/Version, built in by the
// ESBuild define) - NOT a loader key: the contract's four names (name, apply,
// Config, inject) are unchanged, and the default object below stays exactly
// { name, apply, Config, inject }.
export { Version };

// Required services. The factory (@playform/plugin-dsh-factory) provides the
// State builder (cell unwrap + shared fields + the P10 volatile refresh), the
// ledger and the P5 journal. `tools` serves the queue_enqueue/queue_status
// registrations. The routing enforcer is NOT an injection dependency (it
// ships disabled independently); it is probed at dispatch time through
// Context.get (the tool-jobs precedent). The plugin registers NO fs/observed
// listener and never touches the factory executor; it never writes files
// outside its own ledger.
export const inject = ["pluginFactory", "tools"];

export const apply = Apply;

export default { name, apply, Config, inject };

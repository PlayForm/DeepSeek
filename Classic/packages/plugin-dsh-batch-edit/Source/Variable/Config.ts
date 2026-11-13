import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose, Policy } from "@playform/plugin-dsh-factory";

/**
 * @module Config
 *
 * The plugin's Schemastery Config schema (a Variable: one constant built once
 * at load).
 *
 * @remarks
 *
 * Cordis validates the exported schema while the plugin loads and fills every
 * default, so invalid configuration fails LOUD at load instead of silently
 * falling back per-field, and `apply` receives a validated plain config
 * object. The shape this schema produces is Interface/Config.ts.
 *
 * COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as a
 * MODULE-LEVEL named export, imported as Compose): the tool-primary plugin is
 * a NON-MANIFEST module (no fs/observed exclusion machinery), so
 * `shared: false` - the MINIMAL shared block, ONLY the two universal volatile
 * cells (`log`, `logFile`). The plugin's own `logFile` default (its SEPARATE
 * ledger, one log per module) is supplied through its own fields.
 *
 * VOLATILE CELLS: every knob in this schema is `.volatile()` - hot edits
 * commit WITHOUT remounting the plugin; the factory's State builder refreshes
 * the mapped State fields IN PLACE, so a flip (enabled, machinesPerAgent,
 * opsPerCommit, deadlineMs, strictMode, interceptBash, monitorChecksets) lands
 * on the next tool call without a remount.
 *
 * `enabled` defaults to TRUE - the LIVE DISABLED posture: every listener, the
 * tool and the root observer register unconditionally on every mount (a
 * disabled mount writes only the byte-exact `disabled (enabled=false)` ledger
 * line instead of the activation proof), and every registered surface reads
 * the volatile `On` cell at CALL time, so a flip lands on the next tool call
 * without a remount.
 *
 * The runtime import of @deepseek-ai/schemastery (the schema must be a real
 * schemastery instance - the loader consumes it through the Standard Schema
 * `~standard` interface).
 */
const DefaultEnabled = true;
const DefaultLog = true;
const DefaultLogFile = "~/.dsh/playform/plugin-dsh-batch-edit.log";
const DefaultMachinesPerAgent = 2;
const DefaultOpsPerCommit = 64;
const DefaultDeadlineMs = 120000;
const DefaultStrictMode = false;
const DefaultInterceptBash = false;
const DefaultMonitorChecksets: string[] = [];

export default Compose(false, {
	// The MASTER SWITCH (volatile: a flip is read on the next call): false =
	// the mount writes `disabled (enabled=false)` to the ledger while every
	// registered surface passes through silently. Distinct from the shared
	// `log` cell, which governs only the durable ledger file.
	enabled: Schema.boolean().default(DefaultEnabled).volatile(),
	// Ledger enabled - write the durable log file (volatile).
	log: Schema.boolean().default(DefaultLog).volatile(),
	// Ledger file - the plugin's SEPARATE ledger, one log per module -
	// volatile: hot-editable without remounting (overrides the minimal
	// shared block's empty default).
	logFile: Schema.string().default(DefaultLogFile).volatile(),
	// The per-agent machine capacity (the planted-board lease semantics).
	machinesPerAgent: Schema.number().default(DefaultMachinesPerAgent).volatile(),
	// The op-line cap per commit; larger batches use the opfile path (the
	// [live-report] ingest precedent, no schema limit).
	opsPerCommit: Schema.number().default(DefaultOpsPerCommit).volatile(),
	// The in-line deadline, capped at 120000 (the composition contract); the
	// schema accepts 1000..120000 and validation fails loud outside it.
	deadlineMs: Schema.number().default(DefaultDeadlineMs).volatile(),
	// Search-not-found: error the file (true) or skip the op (false).
	strictMode: Schema.boolean().default(DefaultStrictMode).volatile(),
	// The advisory bash intercept: OFF in v1 (never denies; enforcement
	// stays out of scope for this plugin).
	interceptBash: Schema.boolean().default(DefaultInterceptBash).volatile(),
	// Per-file check-set names (the live containers' monitor vocabulary,
	// reused as labels in v1).
	monitorChecksets: Schema.array(Schema.string()).default(DefaultMonitorChecksets).volatile(),
	// THE POLICY BLOCK (D6): the per-action allowlist, the OUTER gate in front
	// of an apply - `write` defaults to `approve`, so a commit refuses before
	// planning or writing (the documented `apply refused` line) until the user
	// opens the gate or approves the batch through the existing approve
	// binding. Composed from the factory's shared block:
	// read/index/record/suggest/message = auto, write/commit/spawn = approve.
	// Volatile as one object; a resolved pack's `policy` section overrides the
	// defaults per action (the wiring is the next refinement).
	policy: Policy(),
});

import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose, Policy } from "@playform/plugin-dsh-factory";

/**
 * @module Config
 *
 * The plugin's Schemastery Config schema: a Variable, one constant built once at load.
 *
 * @remarks
 *
 * Cordis validates the exported schema while the plugin loads and fills every default, so invalid
 * configuration fails LOUD at load, and `apply` receives a validated plain config object. The shape
 * this schema produces is Interface/Config.ts; the contract is BATCH-STATE-PLUGIN.md sections 2.1
 * and 7.
 *
 * COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as a MODULE-LEVEL named
 * export, imported as Compose): the NON-MANIFEST posture uses `shared: false` - the MINIMAL shared
 * block, ONLY the two universal volatile cells (`log`, `logFile`). The plugin's own `logFile`
 * default (its SEPARATE ledger, one log per module) is supplied through its own fields, which
 * override the minimal block's.
 *
 * VOLATILE CELLS: every knob in this schema is `.volatile()` - hot edits commit WITHOUT remounting
 * the plugin via the loader's loader/volatile-update event; the factory's State builder refreshes
 * the mapped State fields IN PLACE, so a flip (enabled, batch, stateFile, maxRecent) takes effect
 * on the next write or read.
 *
 * `enabled` defaults to TRUE - the LIVE DISABLED posture: the service, the store probe and the
 * inbox splice register unconditionally on every mount, a disabled mount writes only the byte-exact
 * `disabled (enabled=false)` ledger line instead of the activation proof, and every surface reads
 * the volatile cell at CALL time.
 *
 * This is one of the modules in the tree with a runtime import of @deepseek-ai/schemastery (the
 * schema must be a real schemastery instance - the loader consumes it through the Standard Schema
 * `~standard` interface).
 */
const DefaultEnabled = true;
const DefaultLog = true;
const DefaultLogFile = "~/.dsh/playform/plugin-dsh-batchstate.log";
const DefaultBatch = "default";
const DefaultDomain = "batch_state";
const DefaultStateFile = "~/.dsh/batch-state.json";
const DefaultMaxRecent = 8;
const DefaultMaxProposals = 16;

/**
 * The plugin's Config schema: composed by the factory's helper, every knob volatile.
 */
export default Compose(false, {
	// The MASTER SWITCH (volatile: a flip is read at the next call): false =
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
	// The batch key: ONE state store serves every batch, isolated by this
	// key (the plan's multi-batch support, section 7.3).
	batch: Schema.string().default(DefaultBatch).volatile(),
	// The KV domain name: the storage-domain PRIMARY store (the JSON file
	// below is the fallback). A lowercase unit name (the library's
	// UNIT_NAME_RE); the fail-loud check lives in Function/Apply.
	domain: Schema.string().default(DefaultDomain).volatile(),
	// The well-known JSON state file: the FALLBACK store (plan section 3
	// item 1), engaged only when no storage facility is provided (or its
	// open fails) - every write then persists the full snapshot here, so the
	// agents' prompts can read the LIVE state from the file when the storage
	// domain is unavailable.
	stateFile: Schema.string().default(DefaultStateFile).volatile(),
	// The completions ring bound: the last maxRecent completions survive
	// (compact, never the histories - plan section 3 item 5).
	maxRecent: Schema.number().default(DefaultMaxRecent).volatile(),
	// The spliced-proposal ring bound: the last maxProposals proposals the
	// inbox splice projected survive (the board's memory stays bounded).
	maxProposals: Schema.number().default(DefaultMaxProposals).volatile(),
	// THE POLICY BLOCK (D6): the per-action allowlist, the shared factory
	// block composed into this schema. The board is a RECORDER/projection: it
	// reads, records and suggests (all automatic) and never writes files,
	// commits or spawns - those verdicts are declared for family uniformity
	// and stay the shipped `approve`. A resolved pack's `policy` section
	// overrides the defaults per action (the wiring is the next refinement).
	policy: Policy(),
});

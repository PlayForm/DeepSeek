// Config - the plugin's Schemastery Config schema (a Variable: one constant
// built once at load). Cordis validates the exported schema while the plugin
// loads and fills every default, so invalid configuration fails LOUD at
// load, and `apply` receives a validated plain config object. The shape this
// schema produces is Interface/Config.ts; the contract is
// BATCH-STATE-PLUGIN.md sections 2.1 and 7.
//
// COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as
// a MODULE-LEVEL named export, imported as Compose): the NON-MANIFEST
// posture uses `shared: false` - the MINIMAL shared block, ONLY the two
// universal volatile cells (`log`, `logFile`). The plugin's own `logFile`
// default (its SEPARATE ledger, one log per module) is supplied through its
// own fields, which override the minimal block's.
//
// VOLATILE CELLS: every knob in this schema is `.volatile()` - hot edits
// commit WITHOUT remounting the plugin via the loader's loader/volatile-update
// event; the factory's State builder refreshes the mapped State fields IN
// PLACE, so a flip (enabled, batch, stateFile, maxRecent) takes effect on
// the next write or read.
//
// `enabled` defaults to FALSE - the IDLE-forever posture: the plugin ships
// disabled, never appears in the profile's bundles, and enables only by an
// explicit ACTIVATE.
//
// This is one of the modules in the tree with a runtime import of
// @deepseek-ai/schemastery (the schema must be a real schemastery instance -
// the loader consumes it through the Standard Schema `~standard` interface).
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose, Policy } from "@playform/ets-plugin-dsh-factory";

export default Compose(false, {
	logFile: Schema.string().default("~/.dsh/playform/ets-plugin-dsh-batchstate.log").volatile(),
	enabled: Schema.boolean().default(false).volatile(),
	// The batch key: ONE state store serves every batch, isolated by this
	// key (the plan's multi-batch support, section 7.3).
	batch: Schema.string().default("default").volatile(),
	// The KV domain name: the storage-domain PRIMARY store (the JSON file
	// below is the fallback). A lowercase unit name (the library's
	// UNIT_NAME_RE); the fail-loud check lives in Function/Apply.
	domain: Schema.string().default("batch_state").volatile(),
	// The well-known JSON state file: the FALLBACK store (plan section 3
	// item 1), engaged only when no storage facility is provided (or its
	// open fails) - every write then persists the full snapshot here, so the
	// agents' prompts can read the LIVE state from the file when the storage
	// domain is unavailable.
	stateFile: Schema.string().default("~/.dsh/batch-state.json").volatile(),
	// The completions ring bound: the last maxRecent completions survive
	// (compact, never the histories - plan section 3 item 5).
	maxRecent: Schema.number().default(8).volatile(),
	// The spliced-proposal ring bound: the last maxProposals proposals the
	// inbox splice projected survive (the board's memory stays bounded).
	maxProposals: Schema.number().default(16).volatile(),
	// THE POLICY BLOCK (D6): the per-action allowlist, the shared factory
	// block composed into this schema. The board is a RECORDER/projection: it
	// reads, records and suggests (all automatic) and never writes files,
	// commits or spawns - those verdicts are declared for family uniformity
	// and stay the shipped `approve`. A resolved pack's `policy` section
	// overrides the defaults per action (the wiring is the next refinement).
	policy: Policy(),
});

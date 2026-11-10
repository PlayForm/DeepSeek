/**
 * @module Config
 *
 * The plugin's Schemastery Config schema, a Variable: one constant built once
 * at load.
 *
 * @remarks
 * Cordis validates the exported schema while the plugin loads and fills every
 * default, so invalid configuration fails LOUD at load instead of silently
 * falling back per-field, and `apply` receives a validated plain config object.
 * The shape this schema produces is Interface/Config.ts.
 *
 * COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as a
 * MODULE-LEVEL named export, imported as Compose): the NON-MANIFEST posture uses
 * `shared: false` - the MINIMAL shared block, ONLY the two universal volatile
 * cells (`log`, `logFile`), with the plugin's own `logFile` default (its
 * SEPARATE ledger, one log per module) supplied through its own fields, which
 * override the minimal block's.
 *
 * VOLATILE CELLS: every knob in this schema is `.volatile()` - hot edits commit
 * WITHOUT remounting the plugin via the loader's loader/volatile-update event;
 * the factory's State builder refreshes the mapped State fields IN PLACE, so a
 * flip (enabled, mapDepth, findLimit, packetTokenBudget, ...) takes effect on
 * the next tool call.
 *
 * `enabled` defaults to FALSE - the IDLE-forever posture: the plugin ships
 * disabled, never appears in the profile's bundles, and enables only by an
 * explicit ACTIVATE.
 */
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose, Policy } from "@playform/plugin-dsh-factory";

const DefaultLogFile = "~/.dsh/playform/plugin-dsh-workspace.log";
const DefaultEnabled = false;
const DefaultMapDepth = 2;
const DefaultMapMaxModules = 20;
const DefaultFindLimit = 50;
const DefaultFindLimitMax = 500;
const DefaultExpandDepth = 1;
const DefaultExpandMaxNeighbors = 50;
const DefaultPacketTokenBudget = 2000;
const DefaultPacketTokenMax = 4000;
const DefaultTokenCharsPerToken = 4;
const DefaultKinds: Array<"File" | "Symbol" | "Block" | "Test" | "DocSection"> = [];

export default Compose(false, {
	logFile: Schema.string().default(DefaultLogFile).volatile(),
	enabled: Schema.boolean().default(DefaultEnabled).volatile(),
	// The workspace_map knobs (V4-1 §3.4: the top-level modules, depth).
	mapDepth: Schema.number().default(DefaultMapDepth).volatile(),
	mapMaxModules: Schema.number().default(DefaultMapMaxModules).volatile(),
	// The workspace_find knobs (the limits match the graph service's own
	// contract defaults: limitDefault 50, limitMaximum 500, W1 §4.5).
	findLimit: Schema.number().default(DefaultFindLimit).volatile(),
	findLimitMax: Schema.number().default(DefaultFindLimitMax).volatile(),
	// The workspace_expand knobs (the graph caps depth at 3, W1 §4.3).
	expandDepth: Schema.number().default(DefaultExpandDepth).volatile(),
	expandMaxNeighbors: Schema.number().default(DefaultExpandMaxNeighbors).volatile(),
	// The workspace_context packet budget (V4-1 §3.5: target 2k tokens, the
	// hard cap configurable). No token counter is injected in v0 - the budget
	// is enforced through the characters-per-token estimate, honest and
	// documented in the SCHEME.
	packetTokenBudget: Schema.number().default(DefaultPacketTokenBudget).volatile(),
	packetTokenMax: Schema.number().default(DefaultPacketTokenMax).volatile(),
	tokenCharsPerToken: Schema.number().default(DefaultTokenCharsPerToken).volatile(),
	// The node kinds filter (empty = all kinds).
	kinds: Schema.array(Schema.union(["File", "Symbol", "Block", "Test", "DocSection"]))
		.default(DefaultKinds)
		.volatile(),
	// THE POLICY BLOCK (D6): the per-action allowlist. The workspace agent's
	// actions are READ-ONLY (automatic), so this package has NO gated action:
	// it never writes a file, commits a batch or spawns an agent, and no
	// verdict can refuse it. read/index/record/suggest/message are automatic;

	// write/commit/spawn wait for approval for the family's write paths.
	// Volatile as one object; a resolved pack's `policy` section overrides the
	// defaults per action (the wiring is the next refinement; the type already
	// exists).
	policy: Policy(),
});

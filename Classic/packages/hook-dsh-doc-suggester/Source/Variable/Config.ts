/**
 * @module Config
 *
 * Builds the plugin's Schemastery Config schema once at load.
 *
 * @remarks
 * A Variable: one constant built once at load. Cordis validates the exported schema while
 * the plugin loads and fills every default, so invalid configuration fails LOUD at load,
 * and `apply` receives a validated plain config object.
 *
 * COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as a
 * MODULE-LEVEL named export): the NON-MANIFEST posture uses `shared: false` - the MINIMAL
 * shared block, ONLY the two universal volatile cells (`log`, `logFile`). The doc suggester
 * hooks tools/post-execute, not fs/observed, so the schema never advertises
 * `updateCooldownMs`/`mutationTools`/`policyFile`/`exclude`. The suggester's own `logFile`
 * default (its SEPARATE ledger, one log per module) is supplied through its own fields.
 *
 * VOLATILE CELLS: every tuning knob is `.volatile()` - hot-editable without a remount,
 * matching the tool-coach's posture. There is no structural knob: the pack is an explicit
 * repo/user file resolved per call, never a config path.
 */
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose } from "@playform/plugin-dsh-factory";

import Names from "./Heuristics.js";
import Defaults from "./Weights.js";

const DefaultLogFile = "~/.dsh/playform/hook-dsh-doc-suggester.log";
const DefaultEnabled = true;
const DefaultThreshold = 0.75;
const DefaultTools = ["read", "grep", "glob", "write", "edit", "raw-write"];
const DefaultMaxCompanions = 7;
const DefaultMaxNoteChars = 1200;
const DefaultCooldownCalls = 6;
const DefaultMaxNotesPerTurn = 3;
const DefaultExclude = ["node_modules", "Target", ".git", "dist"];
const DefaultLearn = true;
const DefaultLearnWindow = 3;
const DefaultStoreLimit = 512;

export default Compose(false, {
	// Ledger file - the doc suggester's ledger, SEPARATE from the family's
	// logs (one log per module) - volatile: hot-editable without remounting.
	logFile: Schema.string().default(DefaultLogFile).volatile(),
	// The master switch (volatile): false mutes every listener to a passthrough.
	enabled: Schema.boolean().default(DefaultEnabled).volatile(),
	// The confidence gate (volatile); the pack's per-family thresholds override.
	threshold: Schema.number().default(DefaultThreshold).volatile(),
	// The judged doc-task tools (volatile): the read/search calls that touch
	// documentation plus the edits that land on it.
	tools: Schema.array(String).default(DefaultTools).volatile(),
	// Maximum companions in one note (volatile).
	maxCompanions: Schema.number().default(DefaultMaxCompanions).volatile(),
	// Hard character cap on the note text (volatile).
	maxNoteChars: Schema.number().default(DefaultMaxNoteChars).volatile(),
	// No second note for the same family within this many judged calls (volatile).
	cooldownCalls: Schema.number().default(DefaultCooldownCalls).volatile(),
	// Maximum notes per turn, per agent (volatile).
	maxNotesPerTurn: Schema.number().default(DefaultMaxNotesPerTurn).volatile(),
	// The excluded directories - a doc task inside them never notes (volatile).
	exclude: Schema.array(String).default(DefaultExclude).volatile(),
	// The learning layer's master switch (volatile): false keeps the pure PoC
	// posture - no decision records, no outcome records, the neutral history.
	learn: Schema.boolean().default(DefaultLearn).volatile(),
	// The follow-through window, in JUDGED CALLS (volatile; no timers): an
	// emitted note's companions must be touched within this many judged calls,
	// or the note closes as a soft reject on the call that reaches the window.
	learnWindow: Schema.number().default(DefaultLearnWindow).volatile(),
	// The ENABLED pickable heuristics (volatile): a name left out of this list
	// is dropped from the score (its effective weight becomes 0) and the
	// decision record's `enabled` list. The canonical six live in
	// Variable/Heuristics; an unknown name is ignored by Function/Weights.
	heuristics: Schema.array(String)
		.default([...Names])
		.volatile(),
	// The pickable weight table (volatile): a name the table carries overrides
	// Variable/Weights; a missing name falls back to that default, so a partial
	// table is a partial override.
	weights: Schema.dict(Schema.number())
		.default({ ...Defaults })
		.volatile(),
	// The in-memory fallback's bound (volatile): the learned-rate rows and the
	// decision ring evict the oldest entry past this count.
	storeLimit: Schema.number().default(DefaultStoreLimit).volatile(),
});

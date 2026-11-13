import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose } from "@playform/plugin-dsh-factory";

/**
 * @module Config
 *
 * The plugin's Schemastery Config schema (a Variable: one constant built once at load).
 *
 * @remarks
 *
 * Cordis validates the exported schema while the plugin loads and fills every default, so
 * invalid configuration fails LOUD at load instead of silently falling back per-field, and
 * `apply` receives a validated plain config object. The shape this schema produces is
 * Interface/Config.ts.
 *
 * COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as a MODULE-LEVEL
 * named export): the NON-MANIFEST posture uses `shared: false` - the MINIMAL shared block, ONLY
 * the two universal volatile cells (`log`, `logFile`). The hook hooks `tools/post-execute`, not
 * fs/observed, so the schema never advertises the factory's fs machinery. The hook's own
 * `logFile` default (its SEPARATE ledger, one log per module) is supplied through its own
 * fields, which override the minimal block's.
 *
 * EVERY knob is volatile (hot-editable without remounting), matching the search plan's §4.8
 * posture - the noise-control knobs need mid-session retuning without a rebuild.
 *
 * Runtime import of @deepseek-ai/schemastery (the schema must be a real schemastery instance -
 * the loader consumes it through the Standard Schema `~standard` interface; the import resolves
 * from the running dsh's own copy, docs/user/develop/basic/publish.md:103).
 */
const DefaultEnabled = true;
const DefaultLog = true;
const DefaultLogFile = "~/.dsh/playform/hook-dsh-convention-suggester.log";
const DefaultThreshold = 0.75;
const DefaultMaxCandidates = 7;
const DefaultMaxNoteChars = 1200;
const DefaultNoiseFloor = 0.5;
const DefaultCooldownCalls = 6;
const DefaultMaxNotesPerTurn = 3;
const DefaultIntents: string[] = [];
const DefaultEmitOn = ["edit", "raw-write", "write"];
const DefaultExclude = ["node_modules", "Target", ".git", "dist"];
const DefaultLearning = false;

export default Compose(false, {
	// Master switch (volatile: the kill-criterion flip is a hot edit). False
	// appends `disabled (enabled=false)` to the ledger and every listener
	// passes through - distinct from the shared `log` cell, which governs
	// only the durable ledger file.
	enabled: Schema.boolean().default(DefaultEnabled).volatile(),
	// Ledger enabled - write the durable log file (volatile).
	log: Schema.boolean().default(DefaultLog).volatile(),
	// Ledger file - the hook's own ledger, SEPARATE from the family's logs (one
	// log per module) - volatile: hot-editable without remounting.
	logFile: Schema.string().default(DefaultLogFile).volatile(),
	// The default confidence gate (volatile). The pack's per-intent thresholds
	// may raise it; they may never lower it (the gate is max of the two).
	threshold: Schema.number().default(DefaultThreshold).volatile(),
	// Maximum candidates in one note (volatile).
	maxCandidates: Schema.number().default(DefaultMaxCandidates).volatile(),
	// Hard character cap on the note text (volatile).
	maxNoteChars: Schema.number().default(DefaultMaxNoteChars).volatile(),
	// Minimum confidence a candidate must have to be considered at all - candidates
	// scoring below this are background noise and are dropped (volatile).
	noiseFloor: Schema.number().default(DefaultNoiseFloor).volatile(),
	// No second note for the same intent within this many judged calls (volatile).
	cooldownCalls: Schema.number().default(DefaultCooldownCalls).volatile(),
	// Maximum notes per agent turn (volatile).
	maxNotesPerTurn: Schema.number().default(DefaultMaxNotesPerTurn).volatile(),
	// The enabled intent ids (volatile). Empty = all pack intents enabled.
	intents: Schema.array(String).default(DefaultIntents).volatile(),
	// The judged tool names - the write/edit family (the convention pack's
	// trigger is the modification call, SEARCH-SUGGESTER-PLUGIN.md §9.4).
	emitOn: Schema.array(String).default(DefaultEmitOn).volatile(),
	// Path prefixes a candidate is never drawn from (volatile).
	exclude: Schema.array(String).default(DefaultExclude).volatile(),

	/**
	 * Retired: the literal pack learner is no longer called; kept for config compatibility until
	 * the history-driven proposal lands.
	 */
	learning: Schema.boolean().default(DefaultLearning).volatile(),
});

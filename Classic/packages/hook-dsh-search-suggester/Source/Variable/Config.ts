// Config - the plugin's Schemastery Config schema (a Variable: one constant
// built once at load). Cordis validates the exported schema while the plugin
// loads and fills every default, so invalid configuration fails LOUD at load,
// and `apply` receives a validated plain config object. The shape this schema
// produces is Interface/Config.ts; every default below is the schema-level
// home of that shape's field values (the plan's section 4.8 schema,
// Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md).
//
// COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as
// a MODULE-LEVEL named export): the NON-MANIFEST posture uses `shared: false`
// - the MINIMAL shared block, ONLY the two universal volatile cells (`log`,
// `logFile`). The suggester hooks tools/post-execute, not fs/observed, so the
// schema never advertises updateCooldownMs/mutationTools/policyFile/exclude.
// The suggester's own `logFile` default (its SEPARATE ledger, one log per
// module) is supplied through its own fields.
//
// VOLATILE CELLS: every tuning knob is `.volatile()` - hot-editable without a
// remount, matching the tool-coach's posture. The structural knobs
// (`persistPath`, `indexPath`, `refreshOnBoot`) change the memory layout, so
// they remount on edit (plain fields).
//
// This is one of the modules in the tree with a runtime import of
// @deepseek-ai/schemastery (the schema must be a real schemastery instance -
// the loader consumes it through the Standard Schema `~standard` interface).
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose } from "@playform/plugin-dsh-factory";

const DefaultLogFile = "~/.dsh/playform/hook-dsh-search-suggester.log";
const DefaultEnabled = true;
const DefaultThreshold = 0.75;
const DefaultMaxCandidates = 7;
const DefaultMaxNoteChars = 1200;
const DefaultCooldownCalls = 6;
const DefaultMaxNotesPerTurn = 3;
const DefaultIntents = [
	"Version",
	"Path",
	"Ledger",
	"Config",
	"Dependency",
	"Test",
	"Symbol",
	"Doc",
	"Usage",
	"Owner",
];
const DefaultEmitOn = ["grep", "glob", "read", "bash"];
const DefaultScopeRoots = ["."];
const DefaultExclude = ["node_modules", "Target", ".git", "Site/Target", "dist"];
const DefaultLearn = true;
const DefaultLearnWindow = 2;
const DefaultPersistPath = "~/.dsh/search-suggester/knowledge.json";
const DefaultIndexPath = "~/.dsh/search-suggester/index.json";
const DefaultRefreshOnBoot = true;
const DefaultDismissTtl = 86400;
const DefaultSeed = true;
const DefaultSectionMode = "off";
const DefaultSectionTtl = 20;

export default Compose(false, {
	// Ledger file - the search suggester's ledger, SEPARATE from the family's
	// logs (one log per module) - volatile: hot-editable without remounting.
	logFile: Schema.string().default(DefaultLogFile).volatile(),
	// The master switch (volatile): false mutes every listener to a passthrough.
	enabled: Schema.boolean().default(DefaultEnabled).volatile(),
	// The confidence gate (volatile). The destructive intents (Version, Path,
	// Ledger) carry 0.85 in their pack rows and always override this default.
	threshold: Schema.number().default(DefaultThreshold).volatile(),
	// Maximum candidates in one note (volatile).
	maxCandidates: Schema.number().default(DefaultMaxCandidates).volatile(),
	// Hard character cap on the note text (volatile).
	maxNoteChars: Schema.number().default(DefaultMaxNoteChars).volatile(),
	// No second note for the same intent within this many judged calls (volatile).
	cooldownCalls: Schema.number().default(DefaultCooldownCalls).volatile(),
	// Maximum notes per turn, per agent (volatile).
	maxNotesPerTurn: Schema.number().default(DefaultMaxNotesPerTurn).volatile(),
	// The enabled intent kinds of an EXPLICIT pack, in priority order
	// (volatile; the pack's rows not listed here are inert, and the synthetic
	// History row is never filtered).
	intents: Schema.array(String).default(DefaultIntents).volatile(),
	// The tools whose calls are judged (volatile; write/edit/raw-write are
	// learning-only signals, never noted).
	emitOn: Schema.array(String).default(DefaultEmitOn).volatile(),
	// The scope roots the answers can live in (volatile).
	scopeRoots: Schema.array(String).default(DefaultScopeRoots).volatile(),
	// The excluded directories - a search inside them never notes unless the
	// intent is Dependency (volatile).
	exclude: Schema.array(String).default(DefaultExclude).volatile(),
	// The online learner switch (volatile).
	learn: Schema.boolean().default(DefaultLearn).volatile(),
	// The learner's observation window after a note, in judged calls (volatile).
	learnWindow: Schema.number().default(DefaultLearnWindow).volatile(),
	// The learned knowledge file (structural; remounts on edit).
	persistPath: Schema.string().default(DefaultPersistPath),
	// RETIRED by the P2 re-spec: the generated repo index is superseded by the
	// graph projection (Function/Projection reads ctx.workspaceGraph). The
	// field stays so an existing profile loads unchanged; it is never read.
	indexPath: Schema.string().default(DefaultIndexPath),
	// The projection refresh switch (structural): true rebuilds the graph
	// projection on every tools/change (the graph may have re-indexed); false
	// builds it once per apply. The lazy first read is always attempted.
	refreshOnBoot: Schema.boolean().default(DefaultRefreshOnBoot),
	// The dismissal TTL in seconds (volatile): the `suggestion_dismiss` tool
	// records `until = now + dismissTtl`; at or after it the dismissal is
	// forgotten and the suggestion may return.
	dismissTtl: Schema.number().default(DefaultDismissTtl).volatile(),
	// The offline seed switch (volatile): at load the knowledge is seeded from
	// an EXPLICIT pack's canonical candidates plus the graph projection
	// (Function/Seed); a repo without an explicit pack seeds nothing, and
	// false keeps the deterministic cold start.
	seed: Schema.boolean().default(DefaultSeed).volatile(),
	// The second surface (volatile): "off" (the default) or "sticky".
	sectionMode: Schema.string().default(DefaultSectionMode).volatile(),
	// The sticky section's TTL in judged calls (volatile).
	sectionTtl: Schema.number().default(DefaultSectionTtl).volatile(),
});

/**
 * @module Config
 *
 * The plugin's Schemastery Config schema (a Variable: one constant built once
 * at load).
 *
 * @remarks
 * Cordis validates the exported schema while the plugin loads and fills every
 * default, so invalid configuration fails LOUD at load instead of silently
 * falling back per-field, and `apply` receives a validated plain config
 * object. The shape this schema produces is Interface/Config.ts; this is the
 * plan's Part 3 §3.4 schema, VERBATIM (the parent's binding decision), with
 * the three template constants, the default pattern rows and the default
 * exemptions supplied from the sibling Variables.
 *
 * COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as a
 * MODULE-LEVEL named export, imported as Compose): the NON-MANIFEST posture
 * uses `shared: false` - the MINIMAL shared block, ONLY the two universal
 * volatile cells (`log`, `logFile`). The coach hooks the tool waterfalls, not
 * fs/observed, so the schema never advertises updateCooldownMs/mutationTools/
 * policyFile/exclude - machinery the module has none of. The coach's own
 * `logFile` default (its SEPARATE ledger, one log per module) is supplied
 * through its own fields, which override the minimal block's.
 *
 * VOLATILE CELLS: every knob in this schema is `.volatile()` - hot edits
 * commit WITHOUT remounting the plugin via the loader's
 * loader/volatile-update event; the factory's State builder refreshes the
 * mapped State fields IN PLACE, so a flip (enabled, enforce, threshold,
 * fetchLive, maxSectionTools, sectionTtl, ...) takes effect on the next judged
 * call. `enabled` is the coach's MASTER SWITCH (distinct from the shared `log`
 * cell, which governs only the durable ledger file).
 *
 * This is one of the modules in the tree with a runtime import of
 * @deepseek-ai/schemastery (the schema must be a real schemastery instance -
 * the loader consumes it through the Standard Schema `~standard` interface).
 */
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose } from "@playform/plugin-dsh-factory";
import { NOTE_DENIED, NOTE_DENIED_TOOL, NOTE_FIRST, NOTE_PERSISTENT } from "@Variable/Notes.js";
import { DEFAULT_EXEMPTS, DEFAULT_PATTERNS } from "@Variable/Patterns.js";

const DefaultLogFile = "~/.dsh/playform/hook-dsh-tool-coach.log";
const DefaultEnabled = true;
const DefaultJudgeTools = ["bash", "pwsh"];
const DefaultDenyTools: string[] = [];
const DefaultThreshold = 3;
const DefaultWindow = 8;
const DefaultCooldown = 10;
const DefaultEscalateThreshold = 6;
const DefaultCleanWindow = 12;
const DefaultEnforce = "off";
const DefaultEnforceThreshold = 4;

export default Compose(false, {
	logFile: Schema.string().default(DefaultLogFile).volatile(),
	enabled: Schema.boolean().default(DefaultEnabled).volatile(),
	judgeTools: Schema.array(Schema.string()).default(DefaultJudgeTools).volatile(),
	denyTools: Schema.array(Schema.string()).default(DefaultDenyTools).volatile(),
	threshold: Schema.number().default(DefaultThreshold).volatile(),
	window: Schema.number().default(DefaultWindow).volatile(),
	cooldown: Schema.number().default(DefaultCooldown).volatile(),
	escalateThreshold: Schema.number().default(DefaultEscalateThreshold).volatile(),
	cleanWindow: Schema.number().default(DefaultCleanWindow).volatile(),
	enforce: Schema.union(["off", "write", "all"]).default(DefaultEnforce).volatile(),
	enforceThreshold: Schema.number().default(DefaultEnforceThreshold).volatile(),
	exemptPatterns: Schema.array(Schema.string()).default(DEFAULT_EXEMPTS).volatile(),
	patternTable: Schema.array(
		Schema.object({
			pattern: Schema.string().required(),
			class: Schema.union(["write", "read", "search", "discovery", "control"]).required(),
			tool: Schema.string().required(),
			note: Schema.string(), // optional per-row override of the tier-1 note body
		}),
	)
		.default(DEFAULT_PATTERNS)
		.volatile(),
	// The three note templates. The OBJECT carries the volatile marker and
	// its leaves stay PLAIN - schemastery rejects volatile leaves under an
	// enclosing volatile field (the normalize family's scopes precedent);

	// one template edit commits one update whose whole object the State's
	// refresh listener re-reads.
	notes: Schema.object({
		first: Schema.string().default(NOTE_FIRST),
		persistent: Schema.string().default(NOTE_PERSISTENT),
		denied: Schema.string().default(NOTE_DENIED),
		deniedTool: Schema.string().default(NOTE_DENIED_TOOL),
	}).volatile(),
	// The dynamic-instruction knobs (plan Part 3 §3.4):
	fetchLive: Schema.boolean().default(true).volatile(),
	maxSectionTools: Schema.number().default(5).volatile(),
	sectionTtl: Schema.number().default(20).volatile(), // judged calls between tier-2 rebuilds
});

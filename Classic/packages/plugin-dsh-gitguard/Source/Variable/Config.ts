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
 * default, so invalid configuration fails LOUD at load, and `apply` receives a
 * validated plain config object. The shape this schema produces is
 * Interface/Config.ts; the contract is ORCHESTRATION-PLUGINS.md section 3.
 *
 * COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as a
 * MODULE-LEVEL named export, imported as Compose): the NON-MANIFEST posture
 * uses `shared: false` - the MINIMAL shared block, ONLY the two universal
 * volatile cells (`log`, `logFile`). The plugin's own `logFile` default (its
 * SEPARATE ledger, one log per module) is supplied through its own fields,
 * which override the minimal block's.
 *
 * VOLATILE CELLS: every knob in this schema is `.volatile()` - hot edits
 * commit WITHOUT remounting the plugin via the loader's loader/volatile-update
 * event; the factory's State builder refreshes the mapped State fields IN
 * PLACE, so a flip (enabled, strict, the deny/allow lists, exclude) takes
 * effect on the next dispatch.
 *
 * `enabled` defaults to TRUE - the LIVE DISABLED posture: the tools/pre-execute
 * listener registers unconditionally on every mount, a disabled mount writes
 * only the byte-exact `disabled (enabled=false)` ledger line instead of the
 * activation proof, and the guard reads the volatile `On` cell at CALL time,
 * so a flip lands on the next dispatch with no remount.
 *
 * This is one of the modules in the tree with a runtime import of
 * @deepseek-ai/schemastery (the schema must be a real schemastery instance -
 * the loader consumes it through the Standard Schema `~standard` interface).
 */
/**
 * The default DENY-LIST (the plan's list, section 3): every git mutation
 * pattern. The MUTATIONS ONLY - the read-only checks are never listed.
 */
const DEFAULT_DENY = [
	"add",
	"commit",
	"reset",
	"push",
	"tag",
	"rm",
	"checkout",
	"branch",
	"merge",
	"stash",
	"clean",
	"rebase",
	"revert",
	"cherry-pick",
	"mv",
	"apply",
	"am",
	"bisect",
	"gc",
	"prune",
	"worktree",
	"submodule",
	"notes",
];

/**
 * The default ALLOW-LIST (the plan's list): the read-only checks + fetch. The
 * allow-list wins over the deny-list, so `fetch` (a network operation but not
 * a mutation) passes, and a user can re-allow a denied subcommand explicitly.
 */
const DEFAULT_ALLOW = ["status", "log", "diff", "show", "rev-parse", "ls-files", "fetch"];

const DefaultEnabled = true;
const DefaultLog = true;
const DefaultLogFile = "~/.dsh/playform/plugin-dsh-gitguard.log";
const DefaultStrict = false;
const DefaultExclude: string[] = [];

export default Compose(false, {
	// The MASTER SWITCH (volatile: a flip is read at the next dispatch):
	// false = the mount writes `disabled (enabled=false)` to the ledger while
	// the guard passes every dispatch through silently. Distinct from the
	// shared `log` cell, which governs only the durable ledger file.
	enabled: Schema.boolean().default(DefaultEnabled).volatile(),
	// Ledger enabled - write the durable log file (volatile).
	log: Schema.boolean().default(DefaultLog).volatile(),
	// Ledger file - the plugin's SEPARATE ledger, one log per module -
	// volatile: hot-editable without remounting (overrides the minimal
	// shared block's empty default).
	logFile: Schema.string().default(DefaultLogFile).volatile(),
	// The deny-list: the git subcommands that are always refused. Setting
	// the field REPLACES the default list (not merge).
	denyPatterns: Schema.array(Schema.string()).default(DEFAULT_DENY).volatile(),
	// The allow-list: the git subcommands that pass even when deny-listed.
	allowPatterns: Schema.array(Schema.string()).default(DEFAULT_ALLOW).volatile(),
	// Strict mode: deny EVERY git command (the plan's "deny ALL git
	// commands vs deny-list only" - default deny-list).
	strict: Schema.boolean().default(DefaultStrict).volatile(),
	// The paths the guard ignores (the factory's segment match): a dispatch
	// whose working directory matches skips the guard entirely.
	exclude: Schema.array(Schema.string()).default(DefaultExclude).volatile(),
	// THE POLICY BLOCK (D6): the per-action allowlist. The guard itself is a
	// READ-ONLY gate (it never writes, commits or spawns), so its own action
	// classes are `read` (the classification) and `record` (the denial
	// ledger) - both automatic; the write/commit/spawn verdicts are declared
	// for uniformity with the family's block and stay the shipped `approve`.
	// Volatile as one object; a resolved pack's `policy` section overrides the
	// defaults per action (the wiring is the next refinement).
	policy: Policy(),
});

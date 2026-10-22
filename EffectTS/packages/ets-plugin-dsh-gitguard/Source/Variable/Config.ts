// Config - the plugin's Schemastery Config schema (a Variable: one constant
// built once at load). Cordis validates the exported schema while the plugin
// loads and fills every default, so invalid configuration fails LOUD at
// load, and `apply` receives a validated plain config object. The shape this
// schema produces is Interface/Config.ts; the contract is
// ORCHESTRATION-PLUGINS.md section 3.
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
// PLACE, so a flip (enabled, strict, the deny/allow lists, exclude) takes
// effect on the next dispatch.
//
// `enabled` defaults to FALSE - the IDLE-forever posture: the plugin ships
// disabled, never appears in the profile's bundles, and enables only by an
// explicit ACTIVATE.
//
// This is one of the modules in the tree with a runtime import of
// @deepseek-ai/schemastery (the schema must be a real schemastery instance -
// the loader consumes it through the Standard Schema `~standard` interface).
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose } from "@playform/ets-plugin-dsh-factory";

// The default DENY-LIST (the plan's list, section 3): every git mutation
// pattern. The MUTATIONS ONLY - the read-only checks are never listed.
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

// The default ALLOW-LIST (the plan's list): the read-only checks + fetch.
// The allow-list wins over the deny-list, so `fetch` (a network operation
// but not a mutation) passes, and a user can re-allow a denied subcommand
// explicitly.
const DEFAULT_ALLOW = ["status", "log", "diff", "show", "rev-parse", "ls-files", "fetch"];

export default Compose(false, {
	logFile: Schema.string().default("~/.dsh/plugin-dsh-gitguard.log").volatile(),
	enabled: Schema.boolean().default(false).volatile(),
	// The deny-list: the git subcommands that are always refused. Setting
	// the field REPLACES the default list (not merge).
	denyPatterns: Schema.array(Schema.string()).default(DEFAULT_DENY).volatile(),
	// The allow-list: the git subcommands that pass even when deny-listed.
	allowPatterns: Schema.array(Schema.string()).default(DEFAULT_ALLOW).volatile(),
	// Strict mode: deny EVERY git command (the plan's "deny ALL git
	// commands vs deny-list only" - default deny-list).
	strict: Schema.boolean().default(false).volatile(),
	// The paths the guard ignores (the factory's segment match): a dispatch
	// whose working directory matches skips the guard entirely.
	exclude: Schema.array(Schema.string()).default([]).volatile(),
});

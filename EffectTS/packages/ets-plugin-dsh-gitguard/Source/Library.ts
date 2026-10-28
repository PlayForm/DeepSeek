// Library - the entry module of the GIT-GUARD plugin
// (@playform/plugin-dsh-gitguard), ORCHESTRATION-PLUGINS.md section 3.
// Loader contract: `export const name` + `export const apply` +
// `export const Config` + `export const inject` + `export default { name,
// apply, Config, inject }` - the ONLY named exports in the tree (cordis
// requires them); every other module is a nameless default export composed
// Rust-style.
//
// THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }`
// SHADOWS the named exports - inject and Config MUST also sit on the
// default object, or service accessors throw `cannot get property ...
// without inject` (live-verified in the factory; a smoke that calls apply
// directly never catches this).
//
// THE ROLE: the git-mutation guard - the tools/pre-execute DENY-LIST on
// the terminal/exec tool surface. It intercepts terminal commands before
// execution and denies ANY git mutation pattern (git add, commit, reset,
// push, tag, rm, checkout, branch, merge, stash, clean, rebase, revert,
// ...) while allowing the read-only checks (git status, log, diff, show,
// rev-parse, ls-files, fetch). Denials surface ONCE as the refusal line
// (the tool result), never punish; every denied attempt is ledgered for
// the user's audit. The git checks-only law stays in the skills (the WHY);
// the plugin carries the CANNOT.
//
// The plugin is the OBJECT form (name/apply/Config/inject); it registers
// NO service (a plugin with no service is a valid archetype) and NO
// fs/observed listener.
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";
import Version from "./Variable/Version.js";

export const name = "plugin-dsh-gitguard";

// Loader contract (cordis): the exported schema is validated and defaulted
// while the plugin loads; apply receives a plain validated config object.
export const Config = Definition;

// The compiled package version (Source/Variable/Version, built in by the
// ESBuild define) - NOT a loader key: the contract's four names (name, apply,
// Config, inject) are unchanged, and the default object below stays exactly
// { name, apply, Config, inject }.
export { Version };

// Required services. `pluginFactory` provides the State builder (cell
// unwrap + shared fields + the P10 volatile refresh), the ledger, and the
// exclusion match. No other service is consumed.
export const inject = ["pluginFactory"];

export const apply = Apply;

export default { name, apply, Config, inject };

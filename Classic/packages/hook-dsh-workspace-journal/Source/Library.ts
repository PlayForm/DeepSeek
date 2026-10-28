// Library - the entry module of the WORKSPACE-JOURNAL hook
// (@playform/hook-dsh-workspace-journal). Loader contract: `export const
// name` + `export const apply` + `export const Config` + `export const
// inject` + `export default { name, apply, Config, inject }` - the ONLY
// named exports in the tree (cordis requires them); every other module is a
// nameless default export composed Rust-style.
//
// THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }`
// SHADOWS the named exports - inject and Config MUST also sit on the default
// object, or service accessors throw `cannot get property ... without
// inject` (live-verified in the factory).
//
// THE ROLE (JOURNAL.md, the family map): the undo + the recovery checkpoints
// + the crash recovery - the workspace's EVIDENCE record. In the invisible
// flow the journal is the step right after the merge commits (through
// Factory.Write): the merge journals the batch BEFORE its writes land
// (workspaceJournal.open with the per-file pre-images), the writes go
// through the factory's version-fenced executor, the merge seals the batch
// (workspaceJournal.seal 'verified'), and a crash in between leaves the
// batch `applying` - marked `recovery-required` at the next boot, with the
// fs/observed-driven progress checkpoint showing how far it got. The
// workspaceJournal.revert replay restores the pre-images backward through
// the factory's version-fenced write: recoverable partial states, never an
// invisible intermediate state.
//
// The plugin is the OBJECT form (name/apply/Config/inject); the
// `workspaceJournal` service is a Service subclass in its own module
// (Function/Service) and is registered from apply.
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";
import Version from "./Variable/Version.js";

export const name = "hook-dsh-workspace-journal";

// Loader contract (cordis): the exported schema is validated and defaulted
// while the plugin loads; apply receives a plain validated config object.
export const Config = Definition;

// The compiled package version (Source/Variable/Version, built in by the
// ESBuild define) - NOT a loader key: the contract's four names (name, apply,
// Config, inject) are unchanged, and the default object below stays exactly
// { name, apply, Config, inject }.
export { Version };

// Required services. `pluginFactory` provides the State builder, the ledger,
// the match, the Wire registration and the shared write executor (the
// revert's version-fenced replay). `fs` backs the service's resolve/stat on
// the replay path. `storageDomain` is NOT an inject: it is probed once
// inside the storage effect (the factory's P5 pattern) because the facility
// is optional - an absent facility is a silent skip, the batches live in
// memory only.
export const inject = ["pluginFactory", "fs"];

export const apply = Apply;

export default { name, apply, Config, inject };

// Library - the entry module (mirrors Source/Library.rs). Loader contract:
// `export const name` + `export const apply` + `export const Config` +
// `export const inject` + `export default { name, apply, Config, inject }`
// - the ONLY named exports in the tree (cordis requires them); every other
// module is a nameless default export composed Rust-style.
//
// THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }`
// SHADOWS the named exports - inject and Config MUST also sit on the default
// object, or service accessors throw `cannot get property "..." without inject`.
//
// @playform/hook-dsh-lesson-nudge - the post-turn NUDGE of the lesson-review
// family. It owns no corpus and no prompt: it watches `agent/status`, asks the
// review service whether a review is due, and runs that review from the true
// idle phase (`agent.runMaintenance`). The split is the family's: a SERVICE
// (`plugin-dsh-lesson-review`) owns the state and the writes, a HOOK owns the
// event surface. Either can be replaced without the other.
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";
import Version from "./Variable/Version.js";

export const name = "hook-dsh-lesson-nudge";

// Loader contract (cordis): the exported schema is validated and defaulted
// while the plugin loads; apply receives a plain validated config object.
export const Config = Definition;

// The compiled package version (Source/Variable/Version, built in by the
// ESBuild define) - NOT a loader key: the contract's four names (name, apply,
// Config, inject) are unchanged, and the default object below stays exactly
// { name, apply, Config, inject }.
export { Version };

// Required services (skill: declare, never rely on load order). The factory
// provides the State builder and the ledger. The REVIEW service is NOT injected
// - it is probed per transition, so a profile that enables the hook without the
// service gets one warning instead of a load failure.
export const inject = ["pluginFactory"];

export const apply = Apply;

export default { name, apply, Config, inject };

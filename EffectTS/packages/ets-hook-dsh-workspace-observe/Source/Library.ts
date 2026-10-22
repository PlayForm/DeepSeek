// Library - the entry module of the WORKSPACE-OBSERVE hook
// (@playform/hook-dsh-workspace-observe), WAVE-1-BRIEF.md section 5. Loader
// contract: `export const name` + `export const apply` + `export const
// Config` + `export const inject` + `export default { name, apply, Config,
// inject }` - the ONLY named exports in the tree (cordis requires them);
// every other module is a nameless default export composed Rust-style.
//
// THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }`
// SHADOWS the named exports - inject and Config MUST also sit on the default
// object, or service accessors throw `cannot get property ... without
// inject` (live-verified in the factory; a smoke that calls apply directly
// never catches this).
//
// THE ROLE: the first step of the invisible flow - on every fs/observed
// event (heard on the ROOT context, the factory's Wire registration) the
// hook records one observation stamp (path, observed version, origin, the
// plugin's own monotonic sequence) in its own KV domain
// (config `domain`, default workspace_observe). The conversation never sees
// the stamps; a later wave's events surface them. The hook reads the event
// only: it never reads file content, never writes a file, and its sequence
// is never a wall clock.
//
// The plugin is the OBJECT form (name/apply/Config/inject); the
// `workspaceObserve` service is a Service subclass in its own module
// (Function/Service) and is registered from apply.
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";

export const name = "hook-dsh-workspace-observe";

// Loader contract (cordis): the exported schema is validated and defaulted
// while the plugin loads; apply receives a plain validated config object.
export const Config = Definition;

// Required services. `pluginFactory` provides the State builder (cell unwrap
// + shared fields + the P10 volatile refresh), the ledger, the match and the
// Wire registration. `fs` backs the service's manual path (resolve + stat).
// `storageDomain` is NOT an inject: it is probed once inside the storage
// effect (the factory's P5 pattern) because the facility is optional - an
// absent facility is a silent skip, the stamps live in memory only.
export const inject = ["pluginFactory", "fs"];

export const apply = Apply;

export default { name, apply, Config, inject };

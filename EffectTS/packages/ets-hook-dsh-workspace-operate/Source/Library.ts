// Library - the entry module of the WORKSPACE-OPERATE hook
// (@playform/hook-dsh-workspace-operate), OPERATE.md. Loader contract:
// `export const name` + `export const apply` + `export const Config` +
// `export const inject` + `export default { name, apply, Config, inject }` -
// the ONLY named exports in the tree (cordis requires them); every other
// module is a nameless default export composed Rust-style.
//
// THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }`
// SHADOWS the named exports - inject and Config MUST also sit on the default
// object, or service accessors throw `cannot get property ... without
// inject` (live-verified in the factory).
//
// THE ROLE: the third step of the invisible flow ("the operate proposes"):
// the typed proposals - rename/connect/replace - with the resolution rules
// that decide what CAN be proposed and the first-class refusal-to-guess
// that declares what CANNOT. The tools live here (workspace_propose +
// workspace_proposals, registered from apply). The hook never writes a
// file: its proposals are recorded, the approve and merge steps apply them.
//
// The plugin is the OBJECT form (name/apply/Config/inject); the
// `workspaceOperate` service is a Service subclass in its own module
// (Function/Service) and is registered from apply.
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";

export const name = "hook-dsh-workspace-operate";

// Loader contract (cordis): the exported schema is validated and defaulted
// while the plugin loads; apply receives a plain validated config object.
export const Config = Definition;

// Required services. `pluginFactory` provides the State builder, the
// ledger, the match and the Wire registration. `fs` backs the resolution
// rules' fence checks (resolve, stat, readText). The tools service and the
// optional workspaceGraph service are probed at apply/run time (host
// facility / sibling service, self-contained per the PoC contract).
export const inject = ["pluginFactory", "fs"];

export const apply = Apply;

export default { name, apply, Config, inject };

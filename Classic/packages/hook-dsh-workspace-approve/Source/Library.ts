// Library - the entry module of the WORKSPACE-APPROVE hook
// (@playform/hook-dsh-workspace-approve), the approve step of the invisible
// flow (APPROVE.md; the family map: the authority licenses -> the approve
// binds -> the merge commits). Loader contract: `export const name` +
// `export const apply` + `export const Config` + `export const inject` +
// `export default { name, apply, Config, inject }` - the ONLY named exports
// in the tree (cordis requires them); every other module is a nameless
// default export composed Rust-style.
//
// THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }`
// SHADOWS the named exports - inject and Config MUST also sit on the default
// object, or service accessors throw `cannot get property ... without
// inject` (live-verified in the factory; a smoke that calls apply directly
// never catches this).
//
// THE ROLE: the EXACT HUMAN APPROVAL - the candidate-bound approval + the
// constraints. An approval binds to the EXACT candidate (path + content
// fingerprint + the observed file version), never a fuzzy intent; the
// constraints travel with the approval, and a changed constraint set is a
// rejection. The decision records the Commitment (who accepted
// responsibility) and the merge/execute side derives its AuthorizationDecision
// from the service's check: an approved binding whose file version moved is
// stale, never authorized. AN INTENT MUST NOT AUTHORIZE ITS OWN MEANS -
// the approval of an intention never authorizes the implementation the agent
// later produces; the check only validates the implementation against the
// approved candidate.
//
// The plugin is the OBJECT form (name/apply/Config/inject); the
// `workspaceApprove` service is a Service subclass in its own module
// (Function/Service) and is registered from apply. The plugin is a
// NON-MANIFEST module (no fs/observed machinery of its own): it consumes the
// factory for the State builder, the ledger and the Wire registration, and
// it writes nothing outside its own KV domain and its ledger.
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";

export const name = "hook-dsh-workspace-approve";

// Loader contract (cordis): the exported schema is validated and defaulted
// while the plugin loads; apply receives a plain validated config object.
export const Config = Definition;

// Required services. `pluginFactory` provides the State builder (cell unwrap
// + shared fields + the P10 volatile refresh), the ledger and the Wire
// registration. `fs` is not used: the hook never touches the filesystem
// except through the factory's ledger append (the documented exemption).
export const inject = ["pluginFactory"];

export const apply = Apply;

export default { name, apply, Config, inject };

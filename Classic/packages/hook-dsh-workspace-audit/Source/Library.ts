// Library - the entry module of the WORKSPACE-AUDIT hook
// (@playform/hook-dsh-workspace-audit). Loader contract: `export const
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
// THE ROLE (AUDIT.md, the family map): the event records + the ledger lines
// - the ACCOUNTABILITY. In the invisible flow the audit is the step right
// after the journal records: every observed write becomes an OutcomeEvidence
// line on the traceability graph, and ctx.workspaceAudit records the rest of
// the graph (Announcement through ExecutionAttempt) as the other services
// feed it. The IntentAssessment closes the loop against the
// IntentSpecification's satisfaction contract. THE RECURSION-PREVENTION
// LAW: every line carries the operation identifier, the parent identifier,
// and the event category - the chains compose without recursion.
//
// The plugin is the OBJECT form (name/apply/Config/inject); the
// `workspaceAudit` service is a Service subclass in its own module
// (Function/Service) and is registered from apply.
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";
import Version from "./Variable/Version.js";

export const name = "hook-dsh-workspace-audit";

// Loader contract (cordis): the exported schema is validated and defaulted
// while the plugin loads; apply receives a plain validated config object.
export const Config = Definition;

// The compiled package version (Source/Variable/Version, built in by the
// ESBuild define) - NOT a loader key: the contract's four names (name, apply,
// Config, inject) are unchanged, and the default object below stays exactly
// { name, apply, Config, inject }.
export { Version };

// Required services. `pluginFactory` provides the State builder, the ledger,
// the match and the Wire registration. `storageDomain` is NOT an inject: it
// is probed once inside the storage effect (the factory's P5 pattern)
// because the facility is optional - an absent facility is a silent skip,
// the lines live in memory only.
export const inject = ["pluginFactory"];

export const apply = Apply;

export default { name, apply, Config, inject };

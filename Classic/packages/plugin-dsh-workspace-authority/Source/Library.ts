// Library - the entry module of the WORKSPACE-AUTHORITY service
// (@playform/plugin-dsh-workspace-authority). Loader contract: `export const
// name` + `export const apply` + `export const Config` + `export const
// inject` + `export default { name, apply, Config, inject }` - the ONLY named
// exports in the tree (cordis requires them); every other module is a
// nameless default export composed Rust-style.
//
// THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }`
// SHADOWS the named exports - inject and Config MUST also sit on the default
// object, or service accessors throw `cannot get property ... without inject`
// (live-verified in the factory; a smoke that calls apply directly never
// catches this).
//
// THE ROLE: the authority step of the invisible flow - the licenses. The
// service keeps the THREE SEPARATE AUTHORITY RECORDS (v4.1 section 3.9,
// correcting the corpus's own conflation):
//
//   CAPABILITY - what the actor may do: the holder, the resource, the
//                permitted operations, the expiration, the delegation rule,
//                the revocation (grant / revoke / authorize);
//   LEASE      - for how long: the holder, the resource, the acquisition,
//                the expiry, the lazy sweep (acquire / release);
//   RESIDENCY  - what stays in the store: the resource, the kind, the
//                weight (residence / evict).
//
// Three records, three owners; the capability, the lease and the residency
// are never one object. THE EVICTION DISPOSITIONS are keep, defer, evict,
// discard, promote - decided by the policy table (a small table of rules per
// resource kind, with defaults, TTLs and the revocation timing); THE LICENSE
// DECIDES, THE WEIGHT ONLY RANKS (the license/weight conflation is a logged
// pitfall: the residency record carries the weight in its own field and the
// policy never reads it except to order candidates).
//
// The plugin is the OBJECT form (name/apply/Config/inject); the
// `workspaceAuthority` service is a Service subclass in its own module
// (Function/Service) and is registered from apply - the same posture the
// workspace-observe hook uses, so the mandatory Config schema and inject list
// ride the loader contract (the factory's class-default form stays reserved
// for a no-config service; the authority's tunables are real config).
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";
import Version from "./Variable/Version.js";

export const name = "plugin-dsh-workspace-authority";

// Loader contract (cordis): the exported schema is validated and defaulted
// while the plugin loads; apply receives a plain validated config object.
export const Config = Definition;

// The compiled package version (Source/Variable/Version, built in by the
// ESBuild define) - NOT a loader key: the contract's four names (name, apply,
// Config, inject) are unchanged, and the default object below stays exactly
// { name, apply, Config, inject }.
export { Version };

// Required services. `pluginFactory` provides the State builder (cell unwrap
// + shared fields + the P10 volatile refresh) and the ledger. No `fs` inject:
// the authority records live in memory and in the ledger in this slice.
export const inject = ["pluginFactory"];

export const apply = Apply;

export default { name, apply, Config, inject };

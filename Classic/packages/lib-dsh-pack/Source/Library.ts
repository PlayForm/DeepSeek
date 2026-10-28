// Library - the entry module of the PACKS (@playform/lib-dsh-pack): the
// pure, dependency-light, harness-free workspace-pack library of the
// suggester family, as named exports (the harness convention - the packs are
// NOT a plugin bundle: no cordis patch, no loader contract, publishable on
// its own).
//
// Three halves:
//
//   Variable - the built-in pack for this monorepo (the union of the six
//   suggesters' former embedded packs, keyed by `<domain>/<id>`), the default
//   signature and the two layer locations.
//
//   Function - the machinery: the strict YAML-subset parser, the pack reader,
//   the normalizer, the merge rules, the cycle-guarded extends chain, the
//   layered resolver, the process memo, the per-domain families projection
//   and the workspace locator (the gate whose signature comes from the pack).
//
//   Interface - the pack schema (Pack, Family, Signal, Target, Indexer,
//   Policy, Learning), the locator's answer and the resolution seam.
import Version from "./Variable/Version.js";

export { default as Builtin } from "./Variable/Builtin.js";
export { default as Signature } from "./Variable/Signature.js";
export { default as Placement } from "./Variable/Placement.js";
export { default as Parse } from "./Function/Parse.js";
export { default as Read } from "./Function/Read.js";
export { default as Normalize } from "./Function/Normalize.js";
export { default as Merge } from "./Function/Merge.js";
export { default as Extends } from "./Function/Extends.js";
export { default as Chain } from "./Function/Chain.js";
export { default as Resolve } from "./Function/Resolve.js";
export { default as Load } from "./Function/Load.js";
export { default as Families } from "./Function/Families.js";
export { default as Locate } from "./Function/Locate.js";
export { default as Present } from "./Function/Present.js";
export { default as Matches } from "./Function/Signature.js";
export { default as Slug } from "./Function/Slug.js";
export { default as Home } from "./Function/Home.js";
export { default as User } from "./Function/User.js";
export { default as Repository } from "./Function/Repository.js";
export { default as Pick } from "./Function/Pick.js";
export type { default as Pack } from "./Interface/Pack.js";
export type { default as Family } from "./Interface/Family.js";
export type { default as Signal } from "./Interface/Signal.js";
export type { default as Target } from "./Interface/Target.js";
export type { default as Indexer } from "./Interface/Indexer.js";
export type { default as Policy } from "./Interface/Policy.js";
export type { default as Learning } from "./Interface/Learning.js";
export type { default as Located } from "./Interface/Located.js";
export type { default as Options } from "./Interface/Options.js";

// The compiled package version (Source/Variable/Version, built in by the
// ESBuild define). This is a LIBRARY, not a plugin bundle: no cordis patch,
// no loader contract and no Config export - Version sits beside the other
// named exports rather than after a `Config` export, and the contract's four
// names do not exist here to keep unchanged.
export { Version };

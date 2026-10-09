// Library — the entry module (mirrors Source/Library.rs). Loader contract:
// `export const name` + `export const apply` + `export const Config` +
// `export const inject` + `export default { name, apply, Config, inject }`
// — the ONLY named exports in the tree (cordis requires them); every other
// module is a nameless default export composed Rust-style.
//
// THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }`
// SHADOWS the named exports — inject and Config MUST also sit on the default
// object, or service accessors throw `cannot get property "fs" without
// inject` (live-verified 2026-10-03; a smoke that calls apply directly never
// catches this).
//
// @playform/ets-hook-dsh-governor-cargo — THE CARGO TOML MODULE of the silent
// package.json governor, now a CONSUMER of the @playform/ets-dsh-plugin-factory
// service (the family's first service provider): the shared machinery — the
// State builder (cell unwrap, fixed shared mappings, the P9 probe-once
// "subprocess" seam), the g1 gate set, the auxiliary registry discovery, the
// union keep-list resolution (sidecars + the P3 chain keys), the detached
// contained continuation with its guarded version-protected write and P₃
// re-emit, the ledger, the fs/observed wiring, the lifecycle effects (P1
// jobs / P2 in-flight / P5 storage) and the Config schema factory — all come
// from `ctx.pluginFactory`. The MODULE owns: the transform (the TOML
// pipeline — smol-toml identification, the chain semantics, the full-version
// normalization, the SURGICAL LINE-LEVEL rewrite that preserves comments and
// formatting byte-for-byte, and the refusal guard), the update stage (the
// gates, the cargo upgrade engine via the exclusionary Rust-side CLI, the
// Settle/breaker), the policy path pick (engine input) and every ledger
// string. The factory composes with the prefix `hook-dsh-governor-cargo`
// (State.Module), so every factory-owned line stays byte-identical.
//
// Trigger (verified against the live runtime, 2026-10-02): the tool layer
// (dsh-tool-fs, dsh-tool-str-replace-editor) is the ONLY dispatcher of the
// fs/* events. Every write/edit issued through the harness fs tools —
// by the main agent, a subagent, or a workflow child — runs
//   ctx.waterfall("fs/write-intent", …)   (version guard only, no content)
//   ctx.fs.writeText(…)                    (atomic backend write, NO events)
//   ctx.emit("fs/observed", target, {kind:"present", version}, exec)
// and then builds the model-facing result from the AUTHOR'S OWN content
// (after = normalizeLineEndings(content), never a disk re-read; no checksum).
//
// ANYWHERE MODE, EXCLUSION-FIRST: there is NO roots allowlist. Every
// tool-layer write of a file named Cargo.toml is governed UNLESS its path
// contains an excluded segment (config `exclude`; the factory's built-in
// list: node_modules, .git, .dsh — the harness home — .pnpm, .store, and the
// app bundle). For everything else:
//   * the chain pass (the factory's Continue + the module's Transform): the
//     nearest registry.json is discovered by the factory (walking UP from
//     the written file's directory, stopping at node_modules boundaries and
//     the filesystem root — THE SAME USER REGISTRY as the package.json
//     governor). If one exists (and parses), chain-governed pins (deps in
//     registry.effectiveLatest) are canonicalized to the CARGO CARET FORM —
//     the bare version string `version = "0.1.0-rc.6"` (a bare requirement IS
//     Cargo's implicit caret); with the policy's pinStyle "exact" the
//     canonical form is `=<resolved>` (cargo-edit 0.13.13 has NO --exact
//     flag — verified live — so exact pins are a manifest-level concern).
//     With strict:true unknown deps are STRIPPED (the whole `name = "…"`
//     entry removed — the documented Cargo-specific decision). If none
//     exists, the chain pass performs normalization alone (nothing to
//     canonicalize, nothing to strip) and everything is public.
//   * THE REWRITE PRESERVES COMMENTS AND FORMATTING: smol-toml (the ONE
//     runtime dependency) parses ONLY to identify dep entries (Function/
//     Decode — [dependencies], [dev-dependencies], [build-dependencies],
//     [target.'cfg(...)'.dependencies], [workspace.dependencies] — the shared
//     dep table handled alongside the member tables); the rewrite
//     (Function/Pin, driven by the module's Transform) is SURGICAL
//     LINE-LEVEL string manipulation on the raw text — an internal
//     calculation, not a TOML stringify. Non-dependency sections are NEVER
//     touched — the refusal guard applies (the module's Transform REFUSES
//     and logs when a plan entry would change one).
//   * update stage (Function/Dispatch → Function/Run →
//     Function/Update/Upgrade): `cargo upgrade` (cargo-edit) for the
//     policy-configured packages, with the REJECT/EXCLUSION LIST ENFORCED AT
//     THE CLI LEVEL (`--exclude <crate>`, ONE argv pair per crate — the
//     comma form is silently ignored by cargo upgrade; chain deps are always
//     merged in, the cordis-trap analog), policy fields mapped to the CLI
//     flags where they exist (--compatible/--incompatible/--pinned; -p for
//     allow; depGroups/targets/concurrency have no cargo-edit equivalent),
//     and the policy's verifyCommand (e.g. `cargo check`) spawned via
//     ctx.subprocess, exit 127 non-fatal. Cooldown + in-flight + breaker per
//     directory (mirror the governor). Without cargo-edit the stage fails
//     gracefully with a clear ledger line
//     (`update: cargo-edit unavailable: …`).
//   * ledger: one SEPARATE log (config logFile, default
//     ~/.dsh/hook-dsh-governor-cargo.log — never the package governor's
//     log), written through the factory's Append.
//
// Silence: the parent thread sees exactly what it wrote. The model-facing
// write result is built from the author's own content; the governor's
// rewrites go through the ctx.fs service (which dispatches no fs/* events —
// only the tool layer does), and the observation-policy's version record is
// refreshed by re-emitting fs/observed with the service-issued fresh version
// (P₃ after the chain rewrite — the factory's Continue/Refresh; U₂ after the
// cargo upgrade — Function/Settle via the factory's Refresh), so the
// author's next guarded write/edit never fails FS_STALE_VERSION.
//
// Pipeline: G = U ∘ P. P is idempotent: P(P(c)) = P(c); the refresh re-emit
// re-enters the listener and is a no-op via the Stash token gate.
//
// FULLY API-AWARE: the governed manifest is read and rewritten through
// `ctx.fs` (readText / writeText with a version-guarded replaceIfVersion
// intent; the service owns version tokens — never computed or parsed
// locally), the update stage runs as the DETACHED CONTAINED async
// continuation (never `ctx.jobs` — agent-scoped; a root plugin has no job
// controller; the cargo CLI is spawned through the probed, optional
// `ctx.subprocess` with resolveExecutable + a fully-specified argv,
// collect-mode output appended to the ledger), and configuration is a
// validated Schemastery schema (Variable/Config via the factory's Schema)
// whose defaults Cordis fills at load. The standing exemptions: the
// smol-toml parse (identification only) and the surgical line rewrite (pure
// internal calculations), the cargo CLI itself, auxiliary discovery reads
// (registry.json, update-policy.json, pin-policy.json), and the ledger
// append (ctx.fs has no append operation).
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";

export const name = "hook-dsh-governor-cargo";

// Loader contract (cordis): the exported schema is validated and defaulted
// while the plugin loads; apply receives a plain validated config object.
export const Config = Definition;

// Required services (skill: declare, never rely on load order). `fs` — the
// factory's primitives read and rewrite the governed manifest and stat for
// the U₂ refresh. `pluginFactory` — the family's shared service provider
// (the factory bundle; the plugin stays PENDING until both services exist —
// load order never matters). `ctx.jobs` is AGENT-SCOPED (verified live: "no
// job controller serves this agent" for a root plugin) so the update stage
// runs as the detached contained continuation instead; `ctx.subprocess` (the
// cargo CLI) is probed ONCE at State build time through the factory's
// probe-once seam accessor (never injected, never the direct accessor).
export const inject = ["fs", "pluginFactory"];

export const apply = Apply;

export default { name, apply, Config, inject };

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
// @playform/hook-dsh-package-governor — silent package.json governor
// (anywhere mode). A FACTORY MODULE (SCHEME.md §3): the shared machinery —
// the ledger (Append), the exclusion match, the registry/policy discovery,
// the union keep-list, the g1 gate set, the version-guarded sandbox-fenced
// write, the observation-policy refresh, the detached contained continuation,
// the State builder, the wiring, the lifecycle effects (jobs controller,
// in-flight disposal, storage domain) — is CONSUMED from the injected
// @playform/dsh-plugin-factory service (ctx.pluginFactory); the module keeps
// only its own vocabulary: the Config extension, the chain-pass transform
// (Function/Transform), the update engine (Function/Dispatch → Execute →
// the Update/ family, Function/Settle) and every ledger string. The module
// contract reduces to: Config extension + transform + observe + update
// engine; the factory owns the scaffolding and never the ledger strings.
//
// The update stage is dual-mode — config `updateMode` selects "programmatic"
// (the npm-check-updates library in-process, the default) or "bin" (the ncu
// binary from ncuBin).
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
// tool-layer write of a file named package.json is governed UNLESS its path
// contains an excluded segment (config `exclude`; defaults in Variable/
// Default: node_modules, .git, .dsh — the harness home — and the app bundle).
// For everything else:
//   * chain pass (Factory.Continue + Function/Transform): the nearest
//     registry.json is discovered by walking UP from the written file's
//     directory (Factory.Discover, stopping at node_modules boundaries and
//     the filesystem root). If one exists (and parses), chain-governed pins
//     (deps in registry.effectiveLatest) are canonicalized to "^<resolved>";
//     with strict:true unknown deps are stripped. If none exists, the chain
//     pass is skipped (nothing to canonicalize) and everything is public.
//   * update stage (Function/Follow → Function/Dispatch → Function/Execute):
//     ncu under the nearest update-policy.json (Function/Resolve — the
//     FIRST-WINS engine-input path pick, deliberately NOT the factory's union
//     keep-list discovery: the file's own directory, else co-located with the
//     discovered registry, else the configured global policyFile, else a
//     built-in default: reject the learned tailwindcss exception, all dep
//     groups, target latest, NO verifyCommand). Chain deps are always merged
//     into ncu's reject list (the cordis-trap guard: ncu must never bump a
//     chain pin to public npm latest — -x is one comma-delimited argument,
//     ncu 23.0.0).
//   * ledger (Factory.Append): one global log (config logFile, default
//     ~/.dsh/hook-dsh-governor-package.log) — there is no per-root ledger anymore.
//
// Silence: the parent thread sees exactly what it wrote. The model-facing
// write result is built from the author's own content; the governor's
// rewrites go through the ctx.fs service (which dispatches no fs/* events —
// only the tool layer does), and the observation-policy's version record is
// refreshed by re-emitting fs/observed with the service-issued fresh version
// (Factory.Continue's post-write refresh; Function/Settle's U₂ via
// Factory.Refresh), so the author's next guarded write/edit never fails
// FS_STALE_VERSION.
//
// Pipeline: G = U ∘ P. P is idempotent: P(P(c)) = P(c); the refresh re-emit
// re-enters the listener and is a no-op via the Stash token gate.
//
// FULLY API-AWARE: the governed manifest is read and rewritten through
// `ctx.fs` (readText / writeText with a version-guarded replaceIfVersion
// intent; the service owns version tokens — never computed or parsed
// locally), the update stage runs through the jobs controller attached by
// Factory.Attach (P1 — root-context registrations serve every owner), the
// subprocess seam (bin mode) is probed once by the factory's State builder
// (P9), and configuration is a validated Schemastery schema (Variable/
// Config) whose defaults Cordis fills at load. The standing exemptions: the
// npm-check-updates library/binary itself, pure internal calculations (the
// chain pass, string gates, ledger formatting), auxiliary discovery reads
// (registry.json, update-policy.json), and the ledger append (ctx.fs has no
// append operation — the factory's Append).
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";

export const name = "hook-dsh-governor-package";

// Loader contract (cordis): the exported schema is validated and defaulted
// while the plugin loads; apply receives a plain validated config object.
export const Config = Definition;

// Required services (skill: declare, never rely on load order). `fs` — read
// and rewrite the governed manifest, stat for the U₂ refresh. `pluginFactory`
// — the injected family factory (@playform/dsh-plugin-factory): the loader
// holds this plugin PENDING until both services exist. `ctx.jobs` is
// AGENT-SCOPED (verified live: "no job controller serves this agent" for a
// root plugin) so the update stage runs through the P1 controller
// Factory.Attach registers from the root context; `ctx.subprocess` (bin
// mode) is probed once by the factory's State builder (not injected).
export const inject = ["fs", "pluginFactory"];

export const apply = Apply;

export default { name, apply, Config, inject };

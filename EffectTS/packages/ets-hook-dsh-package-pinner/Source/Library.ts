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
// @playform/ets-hook-dsh-package-pinner — silent package.json VERSION PINNER
// (anywhere mode). A thin MODULE over the family's first service provider,
// @playform/ets-dsh-plugin-factory (`ctx.pluginFactory`, injectable): the factory
// owns the shared machinery — the ledger (Append), the exclusion match, the
// auxiliary registry/policy discovery, the union keep-list resolution with
// the P3 chain-keys interlock, the g1 gate set, the version-guarded
// sandbox-fenced write, the observation-policy refresh, the detached
// contained continuation (read → keep-list → transform → write → message →
// re-emit), the State builder, the wiring, the P1/P2/P5 lifecycle effects and
// the Schemastery schema factory. The pinner supplies only the module: its
// identity ("hook-dsh-pinner-package" — also the logger/ledger prefix), its Config
// extension (`sections`), its TRANSFORM (the range law) and its ledger
// strings.
//
// Mission: pin every dependency version in a WRITTEN package.json to its
// STATIC version — `"@playform/build": "^0.3.4"` becomes `"0.3.4"` (strip ONE
// leading range prefix: `^`, `~`, or `=`), in every dependency section the
// config declares (dependencies, devDependencies, peerDependencies,
// optionalDependencies). Already-static versions are untouched (idempotent:
// pinning a pinned file is a no-op rewrite); compound/space ranges, wildcards
// without a prefix, and protocol dependencies (workspace:*, file:, link:,
// git+, npm: aliases) are LEFT AS-IS; a pin-policy.json keep-list protects
// the packages whose ranges must stay exactly as authored.
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
// tool-layer write of a file named package.json is pinned UNLESS its path
// contains an excluded segment (config `exclude`; defaults in Variable/
// Default: node_modules, .git, .dsh — the harness home — and the app bundle).
// There is NO update stage: the pinner is a pure deterministic rewrite
// (P-only) — no ncu, no jobs, no subprocess, no cooldown/breaker. The async
// ctx.fs stage runs as the factory's DETACHED CONTAINED continuation
// (Function/Continue of the factory: Inflight register → ctx.fs.readText →
// union keep-list with the P3 chain-keys → the transform (Function/Transform,
// the module leaf) → GuardedWrite → the module's message → Refresh →
// Inflight removal → throw containment); the listener stays await-free +
// throw-free.
//
// Silence: the parent thread sees exactly what it wrote. The model-facing
// write result is built from the author's own content; the pinner's rewrites
// go through the ctx.fs service (which dispatches no fs/* events — only the
// tool layer does), and the observation-policy's version record is refreshed
// by re-emitting fs/observed with the service-issued fresh version (the
// factory's GuardedWrite + Refresh, P₃), so the author's next guarded
// write/edit never fails FS_STALE_VERSION. The re-emit re-enters the listener
// and is a no-op via the Stash token gate.
//
// Refusal guard: non-dependency sections (name, version, description,
// scripts, …) are NEVER touched; if the pinner's own logic would ever change
// one, the transform refuses and logs instead of rewriting (Function/
// Transform).
//
// FULLY API-AWARE: the pinned manifest is read and rewritten through
// `ctx.fs` (readText / the factory's GuardedWrite with a version-guarded
// replaceIfVersion intent; the service owns version tokens — never computed
// or parsed locally), the transform runs as the factory's DETACHED CONTAINED
// async continuation, and configuration is the factory's validated Schemastery
// schema extended with `sections` (Variable/Config). The standing exemptions
// (now owned by the factory, unchanged): pure internal calculations (string
// gates, exclusion matching, policy discovery, ledger formatting), auxiliary
// discovery reads (the registry.json walk-up, pin-policy.json sidecars), and
// the ledger append (ctx.fs has no append operation).
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";

export const name = "hook-dsh-pinner-package";

// Loader contract (cordis): the exported schema is validated and defaulted
// while the plugin loads; apply receives a plain validated config object.
export const Config = Definition;

// Required services (skill: declare, never rely on load order). `fs` — read
// and rewrite the pinned manifest (the factory's primitives call it too).
// `pluginFactory` — the governance family's shared machinery; the loader
// holds this bundle PENDING until the factory bundle has registered the
// service. `ctx.jobs` is AGENT-SCOPED but the pinner needs no background work
// at all — the pin stage runs as the factory's detached contained
// continuation (and the factory's Attach registers the root jobs-controller
// effect proactively); `ctx.subprocess` is never needed (P-only, no ncu).
export const inject = ["fs", "pluginFactory"];

export const apply = Apply;

export default { name, apply, Config, inject };

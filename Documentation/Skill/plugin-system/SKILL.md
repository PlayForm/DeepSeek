> Specialized working copy (repo): synced from ~/.dsh/skills/plugin-system/ on 2026-10-20, byte-faithful. This is the specialized truth for this monorepo's sessions; the global copy is the fallback. Sync future changes to BOTH.

---
name: plugin-system
description: THE operating manual for developing and extending the DeepSeek Harness Plugin Family (the @playform/plugin-dsh-factory + hook-dsh-* packages) - the DSH plugin contract this family implements, the bundle anatomy, the deterministic build, the smokes as the arbiter, the ledger-string contract, the module leaves vs the shared machinery, and the direct-govern steps. Load before writing, extending, or debugging any family plugin code.
whenToUse: Mandatory before ANY plugin code work in this family - the twelve packages under the monorepo (Boilerplate/, Classic/, EffectTS/) or the live profile bundles. If you are about to touch a bundle's Source without knowing the contract (the loader surface, the build, the smoke arbiter, the ledger strings), STOP and read this manual first.
---

# Plugin System - Operating Manual

The DeepSeek Harness Plugin Family: twelve packages, one contract. This
manual states the conventions directly - it does not deliberate. The
full philosophy lives in the references; this file is the index.

## The Family Overview

- **Twelve packages, one contract** - see ./references/family-overview.md
  One contract binds the factory and every hook-dsh-* module; the
  three tiers (live `~/.dsh`, Boilerplate/ reference, Classic/EffectTS/
  releases) stay distinct.

## 1. The loader contract (every plugin)

1. **The default export is a cordis plugin** - see ./references/loader-contract.md
   `name`, `apply` (returns NOTHING - a returned value silently kills
   event delivery), `Config` (Schemastery; validated + defaults at
   load, invalid fails LOUD), `inject` (factory + fs + tools; PENDING
   orders the loads).
2. **The identity lives in four agreeing places** - see ./references/identity-and-ledger-ownership.md
   The package name, the `name` export, the `module:` option of the
   State build, and the ledger logFile default; the ledger strings are
   the module's OWN - the factory never owns them.
3. **Bundle layers compose at boot** - see ./references/bundle-activation-and-patches.md
   The profile's `dsh.profile.bundles` list + `link:` dependencies are
   activation; `file:` alone is not; `cordis.patch.yml` declares
   (`insert:`) or patches (bare `id:` row - config REPLACES wholesale,
   unknown ids rejected).

## 2. The bundle anatomy

1. **The four-layer Source/** - see ./references/bundle-anatomy.md
   `Library.ts` (the entry), `Function/`, `Interface/`, `Variable/`
   (Config schema + defaults); the tsconfig `paths` aliases
   `@Function/*`, `@Interface/*`, `@Variable/*` are rewritten to
   relative output paths by the build.
2. **Configuration/ holds the build config** - see ./references/build-configuration.md
   `ESBuild.ts` plus the hand-kept `ESBuild.js` twin the build loader
   swaps to, and `TypeScript.noemit.json`; the build wipes +
   regenerates `Target/`.
3. **The deterministic build (`prepublishOnly`)** - see ./references/deterministic-build.md
   `Build 'Source/**/*.ts' --ESBuild Configuration/ESBuild.ts
   --TypeScript Configuration/TypeScript.noemit.json && tsc -p
   tsconfig.json && tsc-alias -f -p tsconfig.json`; a red tsc FAILS
   the build; consumers type-check against the factory's BUILT Target
   (rebuild the factory first); workspace builds run serialized
   (`--workspace-concurrency=1`) - concurrent builds race the shared
   Targets.

## 3. The family architecture (module leaves vs shared machinery)

1. **The FACTORY owns the shared machinery** - see ./references/factory-owns-machinery.md
   The ledger (Append), the storage journal (Journal - the v2
   per-record domain, the 3-stage routing), the write executor (Write
   - the ONE shared path: fresh-stat version guard, P4 fence, Stash,
   root-emit), the direct-govern fold (Govern + RegisterGovern steps),
   the gate, the continuation (Continue/Refresh), the State builder,
   the wire/attach.
2. **The MODULE leaves are NEVER absorbed** - see ./references/module-leaves-never-absorbed.md
   The transforms, the update engines, the update gates + breaker
   maps, the ledger STRINGS, the config extensions + docs stay in the
   modules.
3. **Governance modules register their steps at apply** - see ./references/governance-steps-registration.md
   Canonicalize/pin/cargo/update run through the direct fold
   (sequential by default; the parallel marker is gated on proven
   disjointness).
4. **The direct path is the raw-write's ONLY governance channel** - see ./references/direct-govern-channel.md
   The actor carries the `govern` marker; the gate's `govern` reason
   skips the marked events; absent/false = the escape hatch (no
   chain).
5. **The EffectTS variant keeps the SAME contract behind Effect v4** - see ./references/effectts-variant.md
   The cordis shell + the Effect services/layers + the tracing (the
   no-op default); the ledger strings byte-identical.

## 4. The smokes are the arbiter

1. **Every Source change passes its bundle's smoke with ZERO assertion changes** - see ./references/smoke-arbiter.md
   Exceptions: identity-driven strings change BY DESIGN (the module's
   own identity) and additive coverage for new features.
2. **Smokes prove the MECHANICS; the live battery proves the WIRING** - see ./references/smokes-prove-mechanics.md
   The smokes load the REAL built Targets (fake ctx + real factory);
   they do not cover the patch layers, the load order, or the
   version-guard interplay - the live findings came from the battery.
3. **The vacuously-green trap** - see ./references/vacuously-green-trap.md
   A smoke whose fixture wiring is wrong can pass without exercising
   the code - when a smoke "passes but the world is weird", verify the
   harness wiring first.
4. **The ledger strings are the contract: byte-identical everywhere** - see ./references/ledger-strings-byte-identical.md
   Rename ONLY the mechanics, never the strings.

## 5. The working conventions

1. **One file per response; read before editing** - see ./references/working-conventions.md
   Content via write/edit; the terminal for builds/tests/metadata only.
2. **No commits by agents** - see ./references/working-conventions.md
   The user commits.
3. **The family runs LIVE in the profile** - see ./references/working-conventions.md
   The `~/.dsh` originals are never modified by monorepo development -
   the copies (Boilerplate/) are the reference; the releases
   (Classic/EffectTS) derive from it.

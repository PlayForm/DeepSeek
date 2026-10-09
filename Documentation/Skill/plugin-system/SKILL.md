---
name: plugin-system
description: THE operating manual for developing and extending the DeepSeek Harness Plugin Family (the @playform/dsh-plugin-factory + dsh-hook-* packages) - the DSH plugin contract this family implements, the bundle anatomy, the deterministic build, the smokes as the arbiter, the ledger-string contract, the module leaves vs the shared machinery, and the direct-govern steps. Load before writing, extending, or debugging any family plugin code.
whenToUse: Mandatory before ANY plugin code work in this family - the twelve packages under the monorepo (Boilerplate/, Classic/, EffectTS/) or the live profile bundles. If you are about to touch a bundle's Source without knowing the contract (the loader surface, the build, the smoke arbiter, the ledger strings), STOP and read this manual first.
---

# Plugin System - Operating Manual

The DeepSeek Harness Plugin Family: twelve packages, one contract. This
manual states the conventions directly - it does not deliberate.

## 1. The loader contract (every plugin)

1. The default export is a cordis plugin: `name` (the identity), `apply`
   (returns NOTHING - a returned value silently kills event delivery),
   `Config` (a Schemastery schema; the loader validates + fills defaults
   at load - invalid config fails LOUD), `inject` (the service list: the
   factory + fs + tools where needed; the loader's PENDING state orders
   the loads).
2. The identity lives in the package name, the `name` export, the
   `module:` option of the State build, and the ledger logFile default.
   The ledger strings are the module's OWN - the factory never owns them.
3. The bundle layers compose at boot: the profile's `dsh.profile.bundles`
   list + the `link:` dependencies are the activation; a `file:`
   dependency alone is not activation; the cordis.patch.yml entries
   declare (`insert:`) or patch (a bare `id:` row - the config REPLACES
   the entry config wholesale, unknown ids are rejected).

## 2. The bundle anatomy

1. `Source/` - `Library.ts` (the plugin entry: name/apply/Config/inject),
   `Function/` (the behaviors), `Interface/` (the structural types),
   `Variable/` (the Config schema + the defaults).
2. The tsconfig `paths` aliases: `@Function/*`, `@Interface/*`,
   `@Variable/*` → `./Source/...` (the build rewrites them to relative
   output paths).
3. `Configuration/` - `ESBuild.ts` (+ the hand-kept `ESBuild.js` twin the
   build loader swaps to), `TypeScript.noemit.json`; the build wipes +
   regenerates `Target/`.
4. The deterministic build (`prepublishOnly`): `Build 'Source/**/*.ts'
   --ESBuild Configuration/ESBuild.ts --TypeScript
   Configuration/TypeScript.noemit.json && tsc -p tsconfig.json &&
   tsc-alias -f -p tsconfig.json` - a red tsc FAILS the build. The
   consumers type-check against the factory's BUILT Target - rebuild the
   factory first; the recursive workspace builds must run serialized
   (`--workspace-concurrency=1`) - the concurrent builds race the shared
   Targets.

## 3. The family architecture (the module leaves vs the shared machinery)

1. The FACTORY owns the shared machinery: the ledger (Append), the
   storage journal (Journal - the v2 per-record domain, the 3-stage
   routing), the write executor (Write - the ONE shared path: the
   fresh-stat version guard, the P4 fence, the Stash, the root-emit), the
   direct-govern fold (Govern + the RegisterGovern steps), the gate, the
   continuation (Continue/Refresh), the State builder, the wire/attach.
2. The MODULE leaves are NEVER absorbed: the transforms, the update
   engines, the update gates + breaker maps, the ledger STRINGS, the
   config extensions + docs.
3. The governance modules register their steps with the factory at apply
   (canonicalize/pin/cargo/update) - the raw-write's `govern` selection
   runs them through the direct fold (sequential by default; the
   parallel marker is gated on proven disjointness).
4. The direct path is the raw-write's ONLY governance channel: its actor
   carries the `govern` marker; the gate's `govern` reason skips the
   marked events; absent/false = the escape hatch (no chain).
5. The EffectTS variant keeps the SAME contract behind Effect v4: the
   cordis shell + the Effect services/layers + the tracing (the no-op
   default) - the ledger strings byte-identical.

## 4. The smokes are the arbiter

1. Every change to a bundle's Source must pass the bundle's smoke with
   ZERO assertion changes (the exceptions: the identity-driven strings
   change BY DESIGN - the module's own identity - and the additive
   coverage for new features).
2. The smokes load the REAL built Targets (the fake ctx + the real
   factory); they prove the MECHANICS - the live battery proves the
   WIRING (the smokes do not cover the profile's patch layers, the
   load order, or the version-guard interplay - the live findings came
   from the battery).
3. The vacuously-green trap: a smoke whose fixture wiring is wrong can
   pass without exercising the code - when a smoke "passes but the world
   is weird", verify the harness wiring first.
4. The ledger strings are the contract: byte-identical everywhere -
   rename ONLY the mechanics, never the strings.

## 5. The working conventions

1. One file per response; read before editing; content via write/edit;
   the terminal for builds/tests/metadata only.
2. No commits by agents - the user commits.
3. The family runs LIVE in the profile: the `~/.dsh` originals are never
   modified by monorepo development - the copies (Boilerplate/) are the
   reference; the releases (Classic/EffectTS) derive from it.
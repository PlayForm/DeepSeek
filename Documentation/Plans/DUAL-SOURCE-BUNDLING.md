# DUAL-SOURCE-BUNDLING - The one-name, two-builds publish mechanism (batch #7)

> The dual-source bundling design + prep for the family: ONE npm package name per identity
> (`@playform/hook-dsh-core`, `@playform/plugin-dsh-factory`, ...) carries BOTH the Classic build
> and the Effect-TS build in the same tarball; the user installs ONCE and TOGGLES at the loader
> level - fully npm-native (no postinstall builds, no user-side compilation). This resolves the
> #15 naming collision (the Classic tree and the EffectTS tree share the twelve names): the SAME
> name carries both - the `-effectts` suffix placeholder is overridden by the user's directive;
> the dual-build layout is documented here instead. Prepared by the DUAL-SOURCE BUNDLING AGENT
> (batch #7 of 10, pair 4 of 5; the Compress-borrow agent runs the workflows + the scaffolding in
> parallel). NOT the publishing - the npm agent publishes later. Nothing committed (the user
> commits).

---

## 1. THE MECHANISM (the researched npm semantics + the chosen approach)

### 1.1 The npm semantics, verified

- **Conditional exports** (`package.json` `exports`): the resolver walks the condition keys in
  object order; the FIRST matching condition wins; `"default"` matches always and comes last
  ([nodejs.org/api/packages.html#conditional-exports](https://nodejs.org/api/packages.html#conditional-exports)).
- **Custom user conditions**: any alphanumeric condition (not starting with `.`, no commas) can be
  activated per process with the `--conditions` flag - repeatable, and allowed via
  `NODE_OPTIONS`; verified locally: `node --conditions=effect-ts` and
  `NODE_OPTIONS="--conditions=effect-ts"` both flip the resolution
  ([nodejs.org/api/packages.html#resolving-user-conditions](https://nodejs.org/api/packages.html#resolving-user-conditions)).
- **Subpath exports**: extensionless subpaths (`./classic`, `./effect-ts`) resolve unconditionally -
  the deterministic per-import escape hatch in every toolchain
  ([nodejs.org/api/packages.html#subpath-exports](https://nodejs.org/api/packages.html#subpath-exports)).
- **Types per branch**: the `types` condition is matched first by TypeScript; the per-branch
  objects (`{ "types": ..., "default": ... }`) keep the declarations variant-correct; TypeScript
  routes via `compilerOptions.customConditions` (TS 5.0+, `moduleResolution` bundler/node16/
  nodenext) - verified locally with tsc 7.0.2
  ([typescriptlang.org/tsconfig/#customConditions](https://www.typescriptlang.org/tsconfig/#customConditions)).
- **Bundlers**: esbuild `conditions`, Vite `resolve.conditions`, webpack `resolve.conditionNames`
  accept the custom condition list the same way.
- **The `files` whitelist**: `npm pack` ships exactly the listed dirs - both variant targets fit
  in one tarball; the resolution is load-time only, so the install is variant-agnostic.
- **The dependency side**: the Effect-TS build imports `effect` at runtime; `effect@4.0.2` is
  declared in `dependencies` (NOT an optional peer) so the toggle resolves with the same single
  install. Tradeoff, documented: a classic-only user carries the unused effect dep (~small); the
  optional-peer alternative would break the toggle for a classic-only install.

### 1.2 The chosen approach: the dual-target layout + the conditions-first exports map

Each package name ships TWO built target trees and selects them at LOAD time:

```jsonc
// the canonical manifest shape (Classic tree; the EffectTS tree is the mirror)
"main": "./Target/Library.js",
"types": "./Target/Library.d.ts",
"exports": {
    ".": {
        "effect-ts": { "types": "./Target-EffectTS/Library.d.ts", "default": "./Target-EffectTS/Library.js" },
        "classic":   { "types": "./Target/Library.d.ts",         "default": "./Target/Library.js" },
        "default":   { "types": "./Target/Library.d.ts",         "default": "./Target/Library.js" }
    },
    "./classic":   { "types": "./Target/Library.d.ts",         "default": "./Target/Library.js" },
    "./effect-ts": { "types": "./Target-EffectTS/Library.d.ts", "default": "./Target-EffectTS/Library.js" },
    "./cordis.patch.yml": "./cordis.patch.yml",   // the bundle packages only
    "./SCHEME.md": "./SCHEME.md",                 // the bundle packages only
    "./package.json": "./package.json"
},
"files": ["Target", "Target-EffectTS", "README.md", /* cordis.patch.yml, SCHEME.md */],
"dependencies": { /* ... */ "effect": "4.0.2", /* the @playform siblings */ }
```

Resolution facts (all verified by `Maintain/Verify-DualSource.mjs`, 110 checks):

| How the user loads                          | Resolves to (the published package / the Classic tree) |
| ------------------------------------------- | --------------------------------- |
| bare import (no flags)                      | the CLASSIC build (`Target/`)     |
| `node --conditions=effect-ts` / NODE_OPTIONS | the EFFECT-TS build (`Target-EffectTS/`) |
| `import ... from "pkg/effect-ts"` (subpath) | the EFFECT-TS build, unconditionally |
| `import ... from "pkg/classic"` (subpath)   | the CLASSIC build, unconditionally |

- The published `default` is the CLASSIC build - backward compatible, zero behavior change for
  existing consumers; the effect-ts variant is the opt-in.
- **The tree-local default (the dev trees):** each tree's `default` condition routes to ITS OWN
  build (`Target/`) - the dev-tree consumers were built against it, and the smokes import the
  relative Targets. The canonical published default (the Classic tree, the publish home) is the
  CLASSIC build; the EffectTS tree's in-tree default is its own EFFECT build (the mirror).
- Condition precedence: `effect-ts` is declared BEFORE `classic` in the `"."` object - if a loader
  passes both flags, effect-ts wins (the first match rule).
- The whole-graph coherence: every family package reads the same conditions, so a toggled graph is
  ALL effect-ts or ALL classic - never mixed (the effect-ts `Update` returns Effect envelopes, not
  the classic dispatch envelope; mixing is unsupported and documented as such).

### 1.3 The mirror layout (where the builds live)

The two dev trees keep their OWN build in `Target/` (the smoke contract: every suite imports
`../packages/<name>/Target/Library.js` directly - untouched). The SIBLING variant is assembled in
byte-exactly by `Maintain/DualSource.sh`:

| Tree      | own build (Target/)       | assembled sibling                      |
| --------- | ------------------------- | -------------------------------------- |
| Classic   | the CLASSIC build         | `Target-EffectTS/` (the EffectTS tree's build) |
| EffectTS  | the EFFECT-TS build       | `Target-Classic/` (the Classic tree's build)   |

The published tarball (the npm agent publishes from the CLASSIC tree - the canonical home) ships
`Target/` + `Target-EffectTS/` - the spec's `files: ["Target", "Target-EffectTS", ...]` example.
The EffectTS tree's tarball would be the mirror (`Target/` + `Target-Classic/`) - both are
publishable; the Classic tree is documented as canonical.

## 2. THE PER-PACKAGE PREP INVENTORY (the 24 manifests)

All 24 `package.json` files (12 names x 2 trees) were rewritten to the dual-source mirror shape:

| Field         | Change per package                                                                 |
| ------------- | ---------------------------------------------------------------------------------- |
| `exports`     | the conditions map (`effect-ts` / `classic` / `default`) + the `./classic` + `./effect-ts` subpaths; the bundle packages keep `./cordis.patch.yml` + `./SCHEME.md` |
| `files`       | the sibling variant dir added right after `Target`                                  |
| `main`/`types`| the CLASSIC build entry (the default) - `./Target/...` (Classic) / `./Target-Classic/...` (EffectTS mirror) |
| `dependencies`| the union: the existing deps + `effect: 4.0.2` + the runtime-imported @playform siblings (`@playform/hook-dsh-core`, `@playform/plugin-dsh-factory` at the exact `0.0.1`) for the ten consumers |
| `description` | `hook-dsh-core` only: the dual-build @-sentence (the merged canonical wording, both trees) |
| everything else (name, version 0.0.1, scripts, devDependencies, license CC0-1.0, `dsh`) | unchanged |

The merged dependency sets (the union of the built Targets' runtime imports - the inventory came
from grepping the minified Target files):

| Package                     | dependencies                                                                  |
| --------------------------- | ----------------------------------------------------------------------------- |
| `hook-dsh-core`             | `effect: 4.0.2`                                                               |
| `plugin-dsh-factory`        | `effect: 4.0.2`                                                               |
| `hook-dsh-governor-package` | `npm-check-updates: 23.1.0`, `effect: 4.0.2`, the two @playform siblings       |
| `hook-dsh-governor-cargo`   | `smol-toml: 1.9.0`, `effect: 4.0.2`, the two @playform siblings               |
| `hook-dsh-pinner-package`   | `effect: 4.0.2`, the two @playform siblings                                   |
| the seven normalize flavors | `effect: 4.0.2`, the two @playform siblings                                   |

Notes:

- The `@deepseek-ai/*` runtime imports (cordis, schemastery, dsh-tools) stay in `devDependencies`
  per the family convention - they are harness-provided at runtime. The dependency-vs-peer decision
  for them is the register #16 "release packages' conventions" item - flagged for the release lane.
- The new `@playform/*` dependency entries are the publish-time fix: the built Targets import the
  siblings BY NAME, and a published tarball must declare them (the workspace links do not travel).
  Caveat, documented: BEFORE the family publishes, a per-bundle standalone install
  (`pnpm install` inside a bundle with its own `pnpm-workspace.yaml`) cannot resolve the
  @playform names from the registry (404) - the family's publication closes the window. The
  workspace install itself is unaffected (the links already exist).
- The workspace duplicate-name reality (the #15 collision's residue): pnpm tolerates the two
  trees' identical names and links a consumer's `@playform/*` dependency to ONE tree. VERIFIED
  EMPIRICALLY: a pnpm install (2026-10-08 ~10:21, before this batch) relinked the CLASSIC
  consumers to the EffectTS tree (glob-last) - which silently broke the Classic suites (the
  classic governors resolve the effect core's `Update` envelope, whose Dispatch is an Effect, not
  the classic callable; the cargo smoke's "no registry -> built-in default policy" check failed
  with the manifests at HEAD too - proven pre-existing, not this batch's regression). The fix
  applied: the Classic tree's ten consumers' `node_modules/@playform` links were restored to the
  README-documented same-tree form (`../../../<name>`); the tree is green again (1479 checks).
  The dual-source manifests make EVERY link route variant-coherent - this IS the collision's
  answer. WARNING for the workflows: ANY future `pnpm install` can re-relink (glob-last) and
  re-break the Classic suites - the workflow gates MUST re-run the 24 smokes after every install;
  the eventual structural fix is the merged single-dir workspace layout (one package dir per
  name, both builds inside), which removes the ambiguity.

The build machinery: `Maintain/DualSource.sh` (the assembly, byte-exact `cp -R`) and
`Maintain/Verify-DualSource.mjs` (the 108-check resolution verifier), wired as the root scripts
`build:dual-source` and `verify:dual-source`. The `.gitignore` files (root + 24 per-package) now
ignore the variant dirs (`Target-Classic/`, `Target-EffectTS/`).

## 3. THE TOGGLE'S USER STORY (the prepared wording)

The setup-page/README wording, PREPARED (the actual edits landed in the 12 CLASSIC package
READMEs - the canonical published docs; the root README + the tree READMEs + the Site are the
other lanes' surface - the wording below is the next pass's text):

> **Install once, toggle at the loader.**
>
> ```sh
> pnpm add @playform/hook-dsh-core @playform/plugin-dsh-factory @playform/hook-dsh-governor-package
> ```
>
> One install - every package ships BOTH the CLASSIC build (plain TypeScript, the default) and
> the EFFECT-TS build (effect-backed, the same contract) in the same tarball. No postinstall
> builds, no user-side compilation - the toggle is pure resolution:
>
> - **CLASSIC (default):** just import - `import { Govern } from "@playform/plugin-dsh-factory"`.
> - **EFFECT-TS (whole family, one flag):**
>   - Node: `node --conditions=effect-ts` (or `NODE_OPTIONS="--conditions=effect-ts"`)
>   - TypeScript: `"customConditions": ["effect-ts"]` in `compilerOptions`
>   - esbuild: `conditions: ["effect-ts"]`; Vite: `resolve.conditions: ["effect-ts"]`;
>     webpack: `resolve.conditionNames: ["effect-ts"]`
> - **Per-import escape hatch** (no loader config): `import { ... } from "@playform/hook-dsh-core/effect-ts"`
>   (or `/classic`) - deterministic in every toolchain.
>
> The whole family toggles together - never mix variants in one graph (the effect-ts `Update`
> returns Effect envelopes, not the classic dispatch envelope). `effect` v4.0.2 comes as a
> dependency with the same single install.

## 4. THE VERIFICATION

- `Maintain/Verify-DualSource.mjs`: **110 checks, 0 failures** - the default condition, the
  `effect-ts` condition, both subpaths, per package x per tree (96) + the cross-package graph
  coherence in both configurations + the whole-graph flip (8) + the variant fingerprints + real
  entry loads (6).
- The 24 smokes: **1479 checks green in BOTH configurations - Classic 733 + EffectTS 746,
  zero failures** (re-run after the prep; the printed per-suite totals: core 14/17, factory
  34/41, governor 78/81, pinner 32, cargo 62, dash 132, five flavors 62, file 71 - per tree).
- Ledger strings: untouched (no Source edits; the manifests + the docs only). Tabs everywhere;
  the variant dirs are byte-exact copies of the built Targets (`cmp`-verified).
- One pre-existing break surfaced and was fixed during the verification: the 2026-10-08 ~10:21
  pnpm relink (the duplicate-name workspace resolution, §2) had silently pointed the Classic
  consumers at the EffectTS tree; the Classic suites failed WITH THE MANIFESTS AT HEAD TOO
  (proven by a targeted revert test). The same-tree links were restored; the suite is green
  again. Any future install can re-break it - the workflows must re-run the smokes after
  installs (§5).

## 5. THE COORDINATION NOTES (the other lanes)

- **The Compress-borrow agent (the .github workflows + the scaffolding):** the publish gate must
  run `pnpm build:classic && pnpm build:effect-ts && bash Maintain/DualSource.sh` before packing;
  the drift-guard's manifest expectations must allow the dual exports map + the new
  dependencies; any workflow that runs `pnpm install` MUST re-run the 24 smokes afterwards (the
  duplicate-name relink hazard is now PROVEN: the 10:21 install broke the Classic suites until
  the same-tree links were restored - §2/§4).
- **The npm agent (later):** publish the 12 CLASSIC-tree packages (the canonical manifests);
  the tarball = `Target` + `Target-EffectTS` + README (+ cordis.patch.yml/SCHEME.md for the
  bundles); no manifest patching needed - the sibling deps are already declared.
- **The Site/docs lanes:** the prepared toggle wording (§3) is ready for the setup page; the root
  README + the tree READMEs were NOT edited (uncommitted work from other lanes in those files).
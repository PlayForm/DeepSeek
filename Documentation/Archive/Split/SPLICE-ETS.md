---
title: The symlink split and the ets-* namespace (the splice plan)
category: Archive/Split
kind: one-shot-record
date: 2026-10-09
status: complete
registry: Documentation/Archive/Split/SPLICE-ETS.md
index: Documentation/INDEX.md
statuses:
    - name: the ets-* namespace split
      state: implemented
      evidence: the 12 EffectTS packages ship distinct names; the relink hazard resolved
    - name: the supersession of the one-name dual-build idea
      state: resolved
      evidence: DUAL-SOURCE-BUNDLING marked superseded; this plan replaced it
    - name: the shared base package (ets-base-dsh)
      state: implemented
      evidence: the plumbing every ets-* package builds on
    - name: the never-mix rule (one dependency graph per split)
      state: implemented
      evidence: documented; the packages enforce it
---

# SPLICE-ETS - The complete symlink split + the ets-* namespace (the splice plan)

> The splice: the module family splits into TWO groups with DISTINCT names so the pnpm workspace can
> never cross-link again - the classical group (the plain `@playform/dsh-*` names, no effect
> dependency) + the effect-ts powered group (the `@playform/ets-*` names) under the new shared base
> `@playform/ets-base-dsh`. The symlink break dies at the root: no postinstall relink, no preinstall
> hooks. The whole build triggers from inside this monorepo via REGULAR dependencies (no sh scripts,
> no shell glue); the packages stay nested for development; npm publishing happens from this SINGLE
> repository (25 packages); the per-package submodule repos are the later best case (mapped, not
> executed). Prepared by the SPLICE-PLAN lane. DOCUMENTATION ONLY - the only tree edit is this plan
> file; nothing is committed (the user commits).

> **NAMING UPDATE (post-execution, locked):** the final naming scheme supersedes the intermediate
> names used during this plan's execution and in the tables below: the classical group is
> `@playform/hook-dsh-*` (+ `@playform/plugin-dsh-factory`), the Effect-TS group is
> `@playform/ets-hook-dsh-*` (+ `@playform/ets-plugin-dsh-factory`), the base stays
> `@playform/ets-base-dsh`. The tables record the names as they were at execution time (the
> classical intermediate `dsh-hook-*`, the ets intermediate `ets-hook-dsh-*`); read every classical
> `dsh-hook-*` below as `hook-dsh-*`.

---

## 0. THE SUPERSEDED PLAN (marked per the binding decision #4)

- **`Documentation/Archive/Split/DUAL-SOURCE-BUNDLING.md` is SUPERSEDED by this plan.**

    The one-name, two-builds publish mechanism is REPLACED by the complete split: separate sources,
    separate names.

    That mechanism put one npm name per identity carrying the Classic and the Effect-TS builds in
    the same tarball, toggled via the `effect-ts`/`classic` exports conditions, and assembled by
    `Maintain/DualSource.sh`.

- The dual-source residue still in the tree is REVERTED or REMOVED as part of this plan's execution
  (§4.2, §8).

    The residue list: the 24 manifests' condition exports maps, the
    `Target-Classic`/`Target-EffectTS` sibling dirs in `files`, the `effect: 4.0.2` entries in the
    CLASSICAL manifests (proven residue, because the Classical Sources contain ZERO `effect`
    imports), the root scripts `build:dual-source` + `verify:dual-source`, `Maintain/DualSource.sh`,
    `Maintain/Verify-DualSource.mjs`, and the `.prettierignore`/per-package `.gitignore` dual-source
    entries.

---

## 1. THE BINDING DECISIONS (formalized - the plan executes them, it does not re-open them)

1. **COMPLETELY SPLIT the symlink.**

    The module family splices into TWO GROUPS with distinct names per group: the classical
    (`@playform/dsh-*`, no effect dependency) and the effect-ts powered (`@playform/ets-*`).

    The pnpm workspace can then never cross-link, because the duplicate-name resolution, glob-last,
    is impossible once every name is unique.

    THE SYMLINK BREAK DIES AT THE ROOT: the workspace install itself resolves correctly, there is NO
    postinstall relink and NO preinstall hook anywhere in the tree, and the per-package `scripts`
    stay exactly `prepublishOnly`.

2. **THE NAMESPACE PER VERSION.**

    `ets-` is the standard pre-pendage inside the ONLY available scope `@playform`:
    `@playform/ets-lib-dsh-core`, `@playform/ets-plugin-dsh-factory`,
    `@playform/ets-hook-dsh-cargo-governor`, ... (the twelve current EffectTS names with `ets-`
    prepended).

    The base package is `@playform/ets-base-dsh`, the shared Effect-TS plumbing (the runtime wiring,
    the fiber/stream machinery, the hook contract types, with the full inventory in §2.3) that EVERY
    ets-* package depends on.

    The classical group keeps the plain `@playform/dsh-*` names, exactly the Boilerplate baseline's
    naming (§2.1).

3. **COMPLETELY UNLINK, regular-dependency build trigger.**

    The packages stay NESTED in this monorepo for development, and the whole build triggers from
    INSIDE the monorepo via REGULAR dependencies.

    The root build scripts are pure `pnpm -r` invocations whose ORDER comes from the packages' own
    dependency graph (§3), with NO sh scripts and NO shell glue for the build.

    Publishing to npm happens from this SINGLE repository, because the packages are inter-dependent
    and that is the best case.

    LATER, each package converts into its own submodule repository if feasible, where the best case
    is to publish through their own submodule repos; §5.2 maps the migration path but does not
    execute it.

4. **NO DUAL-SOURCE BUNDLING.**

    Separate sources, separate names, and `DUAL-SOURCE-BUNDLING.md` is superseded (§0).

---

## 2. THE RENAME MATRIX

Current state (verified 2026-10-09): the Classic tree and the EffectTS tree carry IDENTICAL names
(`@playform/hook-dsh-*` x12, version 0.0.1), which is the #15 collision.

The Boilerplate baseline carries the plain `@playform/dsh-*` names (12 packages, internal only,
never published).

### 2.1 The classical group (12) - Classic/packages/_, the plain @playform/dsh-_ names

The classical target names ARE the Boilerplate baseline names (the "plain" names per decision 2).

Run `git mv` on the package DIRECTORY and the manifest `name` together, and the smoke paths and the
docs follow (§6, §7).

| #   | Current (`Classic/packages/<dir>`) | New name + dir                                                            | Note                  |
| --- | ---------------------------------- | ------------------------------------------------------------------------- | --------------------- |
| 1   | `lib-dsh-core`                     | `@playform/lib-dsh-core` / `lib-dsh-core`                                 | unchanged token order |
| 2   | `hook-dsh-governor-cargo`          | `@playform/hook-dsh-cargo-governor` / `hook-dsh-cargo-governor`           | **tokens REORDERED**  |
| 3   | `hook-dsh-governor-package`        | `@playform/hook-dsh-package-governor` / `hook-dsh-package-governor`       | **tokens REORDERED**  |
| 4   | `hook-dsh-normalize-dash`          | `@playform/hook-dsh-normalize-dash` / `hook-dsh-normalize-dash`           |                       |
| 5   | `hook-dsh-normalize-ellipsis`      | `@playform/hook-dsh-normalize-ellipsis` / `hook-dsh-normalize-ellipsis`   |                       |
| 6   | `plugin-dsh-normalize-file`        | `@playform/plugin-dsh-normalize-file` / `plugin-dsh-normalize-file`       |                       |
| 7   | `hook-dsh-normalize-fullwidth`     | `@playform/hook-dsh-normalize-fullwidth` / `hook-dsh-normalize-fullwidth` |                       |
| 8   | `hook-dsh-normalize-invisible`     | `@playform/hook-dsh-normalize-invisible` / `hook-dsh-normalize-invisible` |                       |
| 9   | `hook-dsh-normalize-quotes`        | `@playform/hook-dsh-normalize-quotes` / `hook-dsh-normalize-quotes`       |                       |
| 10  | `hook-dsh-normalize-spaces`        | `@playform/hook-dsh-normalize-spaces` / `hook-dsh-normalize-spaces`       |                       |
| 11  | `hook-dsh-pinner-package`          | `@playform/hook-dsh-package-pinner` / `hook-dsh-package-pinner`           | **tokens REORDERED**  |
| 12  | `plugin-dsh-factory`               | `@playform/plugin-dsh-factory` / `plugin-dsh-factory`                     |                       |

- The classical manifests DROP the residue `effect: 4.0.2` dependency, because the Classical Sources
  never import effect (verified) and the entry is dual-source prep residue (§0).

- The ten classical consumers keep depending on their group's `lib-dsh-core` + `plugin-dsh-factory`,
  and the by-name imports rewrite per §4.1.

### 2.2 The effect-ts group (12) - EffectTS/packages/_, the @playform/ets-_ names

The `ets-` pre-pendage applies to the CURRENT names (decision 2's standard):

| #   | Current (`EffectTS/packages/<dir>`) | New name + dir                                                                    |
| --- | ----------------------------------- | --------------------------------------------------------------------------------- |
| 1   | `lib-dsh-core`                      | `@playform/ets-lib-dsh-core` / `ets-lib-dsh-core`                                 |
| 2   | `hook-dsh-governor-cargo`           | `@playform/ets-hook-dsh-cargo-governor` / `ets-hook-dsh-cargo-governor`           |
| 3   | `hook-dsh-governor-package`         | `@playform/ets-hook-dsh-package-governor` / `ets-hook-dsh-package-governor`       |
| 4   | `hook-dsh-normalize-dash`           | `@playform/ets-hook-dsh-normalize-dash` / `ets-hook-dsh-normalize-dash`           |
| 5   | `hook-dsh-normalize-ellipsis`       | `@playform/ets-hook-dsh-normalize-ellipsis` / `ets-hook-dsh-normalize-ellipsis`   |
| 6   | `plugin-dsh-normalize-file`         | `@playform/ets-plugin-dsh-normalize-file` / `ets-plugin-dsh-normalize-file`       |
| 7   | `hook-dsh-normalize-fullwidth`      | `@playform/ets-hook-dsh-normalize-fullwidth` / `ets-hook-dsh-normalize-fullwidth` |
| 8   | `hook-dsh-normalize-invisible`      | `@playform/ets-hook-dsh-normalize-invisible` / `ets-hook-dsh-normalize-invisible` |
| 9   | `hook-dsh-normalize-quotes`         | `@playform/ets-hook-dsh-normalize-quotes` / `ets-hook-dsh-normalize-quotes`       |
| 10  | `hook-dsh-normalize-spaces`         | `@playform/ets-hook-dsh-normalize-spaces` / `ets-hook-dsh-normalize-spaces`       |
| 11  | `hook-dsh-pinner-package`           | `@playform/ets-hook-dsh-package-pinner` / `ets-hook-dsh-package-pinner`           |
| 12  | `plugin-dsh-factory`                | `@playform/ets-plugin-dsh-factory` / `ets-plugin-dsh-factory`                     |

- Every ets-* package keeps its exact `effect: 4.0.2` pin (the pin stays, §9.4).

- The ten ets consumers depend on `@playform/ets-lib-dsh-core` + `@playform/ets-plugin-dsh-factory`
  AND on the new base `@playform/ets-base-dsh`.

    The two foundations (ets-lib-dsh-core, ets-plugin-dsh-factory) depend on the base only, plus
    effect.

### 2.3 The new base `@playform/ets-base-dsh` (the scope inventory)

The base is a NEW package at `EffectTS/packages/ets-base-dsh` (version 0.0.1, with `effect: 4.0.2`
as the only external dependency).

Its scope is what it EXTRACTS from the current EffectTS tree, the shared Effect-TS plumbing, at
verified locations:

| The plumbing class             | The current location (what moves)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **The runtime wiring**         | `EffectTS/packages/plugin-dsh-factory/Source/Service/Runtime.ts` - the ONLY module owning the Effect runtime today: the `Context`/`Effect`/`Layer`/`Scope` construction, the layer graph, `materialize()`, the `Services` type - plus its five `Service/*.ts` siblings (`Govern`, `Ledger`, `Journal`, `Write` - the `Context` services + the `Layer` wiring that `Runtime.ts` assembles)                                                                                                                                                                                                                                                         |
| **The fiber/stream machinery** | `EffectTS/packages/lib-dsh-core/Source/Stream/{Gate,Strip,Block,Chunk}.ts` - the `Gate` (the per-materialization `Stream.suspend` gate; the harness adapter seam `Stream.fromAsyncIterable -> Gate -> Stream.toAsyncIterable`), the stream utilities; `lib-dsh-core/Source/Function/Update.ts` - the Update envelope (the Dispatch/Settle pair, `Effect`+`Exit`+`Scope`); the governors' fiber-home pattern (`State.Scope ?? Scope.makeUnsafe("sequential")` - currently DUPLICATED in `hook-dsh-governor-cargo/Source/Function/Dispatch.ts` + `hook-dsh-governor-package/Source/Function/Dispatch.ts`) - the duplication collapses into the base |
| **The hook contract types**    | `lib-dsh-core/Source/Library.ts`'s named exports (the contract: `Section`, `Default`, `Suppress`, `Refusal`, `Policy`, `Activate`, `Update`, the `Normalize/*` maps, the `Stream/*` machinery) + `plugin-dsh-factory/Source/Interface/*` (`Transform`, `Actor`, `Gate`, `Jobs`, `State`, `Journal`, `Options`, `Output`)                                                                                                                                                                                                                                                                                                                          |

- **The dependency rule:** EVERY ets-* package (all 12) depends on `@playform/ets-base-dsh`, and the
  ten consumers additionally depend on `ets-lib-dsh-core` + `ets-plugin-dsh-factory`.

    The base is the single owner of the shared plumbing, and `ets-lib-dsh-core` may keep re-export
    shims ONLY where its public contract requires, flagged per export during the extraction, while
    the consumers' imports move to the base (§4.1).

- The extraction is `git mv` + import-rewrite ONLY, with no behavior edits per the byte-integrity
  discipline (§10).

    The EffectTS 746-check suite is the arbiter between the extraction and the renames (§8-S1).

### 2.4 The collision arithmetic (why the break dies at the root)

- Post-splice the workspace holds 37 UNIQUE package names (12 Boilerplate + 12 classical + 12 ets +
  the base).

    pnpm's duplicate-name resolution (glob-last, the 2026-10-08 10:21 relink that silently pointed
    the Classic consumers at the EffectTS tree) cannot fire, because every `@playform/*` dependency
    resolves to exactly one workspace package.

    The manually-restored same-tree links (the Classic consumers' `node_modules/@playform` symlinks,
    restored 2026-10-09) become unnecessary, and the fresh install regenerates correct links by
    construction.

- No postinstall relink and no preinstall hooks exist anywhere, because the package `scripts` stay
  `prepublishOnly` only (§1.1).

---

## 3. THE WORKSPACE WIRING

### 3.1 pnpm-workspace.yaml (root) - verified UNCHANGED

```yaml
packages:
    - "Boilerplate/packages/*"
    - "Classic/packages/*"
    - "EffectTS/packages/*"

preferWorkspacePackages: true

linkWorkspacePackages: deep

minimumReleaseAge: 0

nodeLinker: hoisted

onlyBuiltDependencies:
    - puppeteer
```

The globs already cover the renamed dirs, because `Classic/packages/*` + `EffectTS/packages/*` match
the new `dsh-*`/`ets-*` dirs, and the uniqueness (§2.4) makes the resolution deterministic.

The per-package `pnpm-workspace.yaml` files stay untouched: `packages: [.]`, `nodeLinker: hoisted`,
`autoInstallPeers: false`, `allowBuilds: { esbuild: true }`, the standalone mode each package
already ships with its own `pnpm-lock.yaml`.

They are the submodule-repo readiness (§5.2) and do not interfere with the root install.

### 3.2 The root package.json scripts (the no-sh mechanism)

Current → proposed:

```jsonc
// KEEP (pure pnpm -r invocations - the build trigger itself):
"build:classic":  "pnpm -r --workspace-concurrency=1 --filter \"./Classic/packages/**\" run prepublishOnly",
"build:effect-ts": "pnpm -r --workspace-concurrency=1 --filter \"./EffectTS/packages/**\" run prepublishOnly",

// NEW - the whole-build trigger (decision 3; the composition is the minimal JSON-script
// `&&`, no loops, no conditionals, no external scripts):
"build": "pnpm run build:classic && pnpm run build:effect-ts",

// NEW - the smoke runner (replaces the bash for-loop `for Smoke in ...; do node "$Smoke" ...; done`
// - the one shell-glue construct in the root scripts; a maintained Node runner, the
// Maintain/Run/Smokes/Index.mjs pattern already used by Check-Newlines.mjs):
"test": "node Maintain/Run/Smokes/Index.mjs",

// REMOVED (the superseded dual-source machinery):
//   "build:dual-source"  -> deleted
//   "verify:dual-source" -> deleted
//   Maintain/DualSource.sh + Maintain/Verify-DualSource.mjs -> deleted

// KEEP (site + tooling, not build triggers):
"site": "pnpm --dir Site run Run",
"lychee": "bash Maintain/Check/Lychee/Index.sh",
"format": "bash Maintain/Format/Index.sh",
"format:prettier": "bash Maintain/Format/Index.sh prettier",
"format:newlines": "bash Maintain/Format/Index.sh newlines",
"format:check": "prettier --check --ignore-path .prettierignore . && node Maintain/Check/Newlines/Index.mjs"
```

Notes:

- `Maintain/Run/Smokes/Index.mjs` (the new file, exec lane) reads `Classic/smokes/*-smoke.mjs` +
  `EffectTS/smokes/*-smoke.mjs` (the 24 suites, the Classic twelve first), spawns each with `node`,
  and exits non-zero on the first failing suite.

    Those are the exact semantics of today's loop, shell-free.

- The `lychee`/`format` sh scripts are site/tooling conveniences, NOT part of the build trigger,
  because decision 3 targets the build; they stay.

- `.github/workflows/Node.yml` needs NO change to its steps: it already runs `pnpm install` →
  `pnpm run build:classic && pnpm run build:effect-ts` → `pnpm test` (verified).

    The fresh-checkout install is where the old relink hazard fired, and post-splice it is safe by
    construction (§9.1).

    Its comment lines mentioning the totals stay valid (§6.1).

### 3.3 The build order (dependency-driven, topological)

The mechanism (decision 3, "ordering the trees via their package dependencies"): `pnpm -r run`
executes the selected packages in TOPOLOGICAL order, dependencies first, by default.

The order therefore comes from the packages' own `dependencies` edges, with no scripts:

```
Classic tree  (build:classic):   { lib-dsh-core, plugin-dsh-factory }            (no @playform deps)
                                -> the ten dsh-hook-* consumers                    (edges: core + factory)

EffectTS tree (build:effect-ts): ets-base-dsh                                      (the base, L0)
                                -> { ets-lib-dsh-core, ets-plugin-dsh-factory }   (edges: the base)
                                -> the ten ets-hook-* consumers                    (edges: base + core + factory)
```

The consumer builds always run after their siblings' Targets exist, which is required because the
built Targets import the siblings BY NAME (`bundle: false` in every `Configuration/ESBuild.ts`, so
the imports stay external and resolve at smoke/run time through the workspace links).

Pre-splice the duplicate names could create spurious cross-tree edges in the topological sort;
post-splice each tree is a clean DAG and the two groups are completely independent, which is the
splice's guarantee.

---

## 4. THE INTERNAL IMPORT / ALIAS / CONFIG UPDATES (the renames force)

### 4.1 The by-name sibling imports

- **EffectTS tree: 105 import sites across the ten consumers** import `@playform/lib-dsh-core` and
  `@playform/plugin-dsh-factory` (verified, with type-only imports included, because they resolve by
  package name too).

    The rewrite rules, in order:

    1. `@playform/lib-dsh-core` -> `@playform/ets-lib-dsh-core` (the core contract imports that STAY
       in the core: `Suppress`, `Refusal`, `Section`, `Default`, `Policy`, `Replace*`, the
       `Normalize/*` maps, `Dashes`, `Chunk`...);
    2. `@playform/plugin-dsh-factory` -> `@playform/ets-plugin-dsh-factory` (the factory contract
       imports: `Schema as Compose`, the `Interface/*` re-exports, the `Factory`/`State` types);
    3. the MOVED plumbing imports -> `@playform/ets-base-dsh` (the machinery §2.3: `Activate`,
       `Gate`, `Update`, the `Stream/*` utilities, the `Scope` types, the runtime/service layer
       imports).

- **Classic tree: 90 files** import the two names (47 core + 58 factory), and they move to the §2.1
  names (`@playform/lib-dsh-core` -> `@playform/lib-dsh-core`, `@playform/plugin-dsh-factory` ->
  `@playform/plugin-dsh-factory`).

- The moved modules' INTERNAL relative imports (inside the base's own file graph) are rewritten to
  the base's layout, and the base's `Library.ts` re-exports the contract (§2.3).

### 4.2 The manifest rewrites (the 24 + the base)

- `name`: per §2.1/§2.2, and the base gets the new manifest (§2.3).

- `dependencies`: the sibling entries take the NEW names at the EXACT `0.0.1`.

    The ets consumers and the ets foundations ADD `@playform/ets-base-dsh: 0.0.1`, and the classical
    manifests DROP `effect: 4.0.2` as residue.

    `smol-toml: 1.9.0` and `npm-check-updates: 23.1.0` stay in their governors, and the
    `@deepseek-ai/*` runtime imports stay in `devDependencies` per the family convention.

- **The dual-source exports simplification (all 24):** the condition maps (`effect-ts`/`classic` +
  `default`), the `./classic` + `./effect-ts` subpaths, and the sibling variant dir in `files`
  (`Target-Classic`/`Target-EffectTS`) are REMOVED.

    Each package keeps the plain `"." -> ./Target/Library.js (+ types)` map and
    `files: ["Target", "README.md", "cordis.patch.yml", "SCHEME.md"]` for the bundle packages only.

    The per-package `.gitignore` variant-dir rules and `.prettierignore`'s dual-source entries are
    cleaned by the exec lane.

- `description`: the `lib-dsh-core` dual-build @-sentence is replaced per group, so the classical
  `lib-dsh-core` description drops the dual-build wording and the ets descriptions state the ets-*
  identity.

### 4.3 The tsconfig + build configs

- The per-package `tsconfig.json` tree-local `paths` aliases (`@Function/*`, `@Interface/*`,
  `@Variable/*`) are UNTOUCHED by the renames, because they are relative to each package's own
  `Source`, and `@playform/build` rewrites them to relative output paths at build time.

- The NEW base package scaffolds the standard shape by cloning `lib-dsh-core`'s: `package.json`
  (`"prepublishOnly": "Build 'Source/**/*.ts' --ESBuild Configuration/ESBuild.ts"`),
  `tsconfig.json`, `Configuration/ESBuild.ts` + `Configuration/TypeScript.noemit.json`, `Source/`,
  `README.md`, `LICENSE`, `.gitignore`, and the per-package `pnpm-workspace.yaml` + `pnpm-lock.yaml`
  (standalone mode).

- Nothing else in the build configs changes: `@playform/build: 0.3.4`, `typescript: 7.0.2`,
  `tsc-alias: 1.9.7`, `bundle: false`, `minify: true` per package.

---

## 5. THE PUBLISHING SHAPE

### 5.1 The single-repo npm publishing (the 25 packages - decision 3, the best case)

All 25 publish from THIS monorepo: 12 classical (`@playform/dsh-*`), 12 ets (`@playform/ets-*`), and
the base (`@playform/ets-base-dsh`).

The publish order is the dependency graph, in layers:

| Layer | The packages (publish in this order; within a layer, arbitrary)                                                                                                                                  |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| L0    | `@playform/ets-base-dsh` (the base; deps: `effect` only)                                                                                                                                         |
| L1    | `@playform/lib-dsh-core`, `@playform/plugin-dsh-factory` (classical foundations) AND `@playform/ets-lib-dsh-core`, `@playform/ets-plugin-dsh-factory` (ets foundations; deps: the base + effect) |
| L2    | the twenty consumers (ten per group; each deps: its group's core + factory + the base for ets + `smol-toml`/`npm-check-updates` for the governors)                                               |

- The two groups are INDEPENDENT, with no cross-group edges, so they are publishable in parallel by
  group, and the intra-group order equals the build order (§3.3).

    Versions stay `0.0.1`, because this plan holds no bump decision and that is the npm lane's call.

- The mechanism: the root `.github/workflows/NPM.yml` is currently PUBLISH-PENDING (the `if: false`
  guard) with the comment "the root monorepo itself is private and never publishes".

    It is ARMED to the single-repo shape: build (`pnpm run build`) -> pack -> publish per layer, one
    registry identity.

    The comment and the guard are updated by the exec/npm lane, and the per-package
    `.github/workflows/NPM.yml` copies stay dormant, because they belong to the submodule phase.

### 5.2 The per-package submodule migration path (the LATER best case - mapped, NOT executed)

- The `.gitmodules.draft` already anticipates per-package repos at `github.com/PlayForm/<name>`, and
  its naming placeholder (the `-effectts` suffix note) is REPLACED by the decided names.

    The classical repos are `github.com/PlayForm/lib-dsh-core` ... `plugin-dsh-factory` (12), and
    the ets repos are `github.com/PlayForm/ets-lib-dsh-core` ... `ets-plugin-dsh-factory` (12) plus
    `github.com/PlayForm/ets-base-dsh` (the base).

- The readiness already exists: every package ships its own `pnpm-workspace.yaml` (`packages: [.]`),
  its own `pnpm-lock.yaml`, its own `.github/workflows/` (the per-repo NPM/Node/Dependabot/Auto/
  GitHub workflows), and its own `.gitignore`.

    Each package is standalone-installable and standalone-publishable today, and the smoke READMEs
    document the per-bundle `pnpm install --ignore-scripts`.

- The migration triggers, later and per package when feasible: create the per-package repo, run
  `git submodule add` at the package dir (the `.gitmodules.draft` entries), retire the package from
  the root workspace glob if and when the tree structure changes, and publish from the package's own
  NPM.yml.

    The classical and ets groups migrate independently, and the base `ets-base-dsh` migrates with
    the ets group.

    This is NOT part of this plan's execution.

---

## 6. THE SMOKE IMPACT (733 / 746 stay)

### 6.1 The totals - the renames change NOTHING

The 24 suites stay (12 per tree), and the totals stay EXACTLY:

- **Classic: 733 checks** = core 14 / factory 34 / governor 78 / pinner 32 / cargo 62 /
  normalize-dash 132 / quotes 62 / ellipsis 62 / spaces 62 / invisible 62 / fullwidth 62 /
  normalize-file 71 (the per-suite breakdown documented in `Classic/smokes/README.md`).

- **EffectTS: 746 checks** = the Classic numbers plus the additive EffectTS coverage (core +3,
  factory +7, governor +3): core 17 / factory 41 / governor 81 / the same rest (documented in
  `EffectTS/smokes/README.md`).

The ledger strings are the byte-identical contract: the suites' ASSERTIONS and totals are untouched,
and only the reference strings change (§6.2).

### 6.2 The suite-file reference updates (per the rename matrix)

Each of the 24 suite files and the two READMEs needs these updates:

- The relative bundle paths `../packages/<dir>/Target/...` -> the renamed dirs.

    For example, `EffectTS/smokes/quotes-smoke.mjs` moves
    `../packages/hook-dsh-normalize-quotes/Target/Library.js` ->
    `../packages/ets-hook-dsh-normalize-quotes/Target/Library.js`, and
    `../packages/plugin-dsh-factory/Target/Library.js` -> `../packages/ets-plugin-dsh-factory/...`;
    the Classic suite files mirror with the `dsh-*` dirs.

- The suite header comments naming the packages, for example `governor-smoke.mjs` line 1's
  `@playform/hook-dsh-governor-package`, `pinner-smoke.mjs`, `cargo-smoke.mjs`, `core-smoke.mjs`,
  `factory-smoke.mjs`, and the normalize suite headers' `@playform/plugin-dsh-factory` mentions.

- The core suite's effect import path: `../packages/lib-dsh-core/node_modules/effect/dist/index.js`
  -> `../packages/ets-lib-dsh-core/node_modules/effect/dist/index.js` (EffectTS) or
  `../packages/lib-dsh-core/...` (Classic, whose own effect import disappears with the classical
  residue removal if the suite imports effect; verify per suite).

- The two `smokes/README.md` files: the bundle-path wording, while the 733/746 total sentences stay
  verbatim.

### 6.3 The verification gate

`pnpm install` (fresh) -> `pnpm run build` -> `pnpm test` = **733 + 746, zero failures**.

The old post-install same-tree link-restore discipline (the 2026-10-09 manual restores) is RETIRED,
because the unique names make every install correct (§2.4).

`.github/workflows/Node.yml` already runs exactly this sequence and its 733/746 comment stays true.

---

## 7. THE SITE + DOCS SURFACES (the SITE-DOCS-RENAME lane list)

The surfaces below carry the current names, and the SITE-DOCS-RENAME lane rewrites them to the new
names (per §2).

`Site/Target/**` is BUILD OUTPUT: the site build regenerates it, and nobody hand-edits it.

### 7.1 Site/Source (the site source tree)

| File                                                     | The name-bearing content                                                                                                                                                                                                                                                                              |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Site/Source/Layout/Base.astro`                          | the 12-name family list (lines 51-62) + the derived nav                                                                                                                                                                                                                                               |
| `Site/Source/pages/plugins.astro`                        | the 12-card inventory (`Name`, `Install`, `Desc` + the `Ours:Classic/packages/...` links, the diagram strings, the `/plugins/...` hrefs)                                                                                                                                                              |
| `Site/Source/pages/plugins/<name>.astro` x12             | titles, hero names, the `Terminal Command="pnpm add @playform/..."` install rows, the `hook-tally` spans, the flavor arrays, the ledger-path strings, the `cordis.patch.yml` snippets, the `Link(Links.OurRepo, "Classic/packages/...")` source links, the diagram strings, the related-package lists |
| `Site/Source/pages/setup.astro`                          | the `link:../bundles/<name>` rows + the plugin config examples (`id:`/`name:`/`logFile: ~/.dsh/hook-dsh-*.log`)                                                                                                                                                                                       |
| `Site/Source/pages/case-study.astro`                     | the `pnpm add @playform/lib-dsh-core` START HERE terminal                                                                                                                                                                                                                                             |
| `Site/Source/pages/matrix.astro`                         | the `Package` column + the `Pipeline` array                                                                                                                                                                                                                                                           |
| `Site/Source/pages/flavors.astro`                        | the flavor `Package` fields + the `hook-dsh-governor-*`/`hook-dsh-pinner-*` badges                                                                                                                                                                                                                    |
| `Site/Source/pages/models.astro`                         | the `hook-dsh-*` prose                                                                                                                                                                                                                                                                                |
| `Site/Source/pages/versions.astro`                       | the `Name` fields                                                                                                                                                                                                                                                                                     |
| `Site/Source/pages/workbench.astro`                      | the workbench labels                                                                                                                                                                                                                                                                                  |
| `Site/Source/Component/Terminal.astro`                   | the default `pnpm add @playform/lib-dsh-core` command                                                                                                                                                                                                                                                 |
| `Site/Source/Content/Mermaid/*.mmd` + the paired `*.svg` | the `@playform/lib-dsh-core` labels                                                                                                                                                                                                                                                                   |

### 7.2 The repo docs

- `README.md` (root): the `link:../bundles/...` rows (lines 62-73, 93-111), the install command
  (line 140), and the CLASSIC/effect-ts toggle wording (lines 147-153).

    The toggle wording is REPLACED by the two-group install wording: `pnpm add @playform/dsh-...` vs
    `pnpm add @playform/ets-...`, plus the `@playform/ets-base-dsh` base line; the `/effect-ts`
    subpath escape hatch disappears with the dual-source shape.

- `Documentation/Guides/Governor-README.md` + `Governor-SCHEME.md`: the `@playform/hook-dsh-*`
  names, the `/effect-ts` subpath, and the variant-toggle wording.

- `Documentation/Skill/plugin-system/SKILL.md`: the `@playform/plugin-dsh-factory` + `hook-dsh-*`
  references.

- `Documentation/Archive/Split/DUAL-SOURCE-BUNDLING.md`: the SUPERSEDED banner + the cross-reference
  to this plan (§0); `TOMORROW-REVIEW.md` (line 307) + `DSH-MONOREPO-PLAN.md` (register #15) get the
  annotation.

- `.github/workflows/Node.yml` + `NPM.yml`: the comments, where the totals sentence stays and the
  NPM.yml publish-shape comment + guard change per §5.1.

- `CHANGELOG.md`: the 0.0.1 entry, optionally annotated.

- `.gitmodules.draft`: the naming-placeholder note -> the decided names (§5.2).

### 7.3 The per-package surfaces (24)

Each package's `README.md` (its own name, the sibling mentions, the npm badge URLs) needs the new
names.

The `variant: EFFECT-TS`/`sibling: CLASSIC` badge pair in the ets+classic READMEs is dual-source
residue and is REMOVED, and the ets READMEs state the ets-* identity plus the base dependency.

The same applies to `CHANGELOG.md` and `.github/Update.md` (the package-name references, if any).

### 7.4 The historical records (annotate, DO NOT rewrite)

`Documentation/Handoff/**` (Overview.md, Packages/*.md) already uses the OLD baseline names
(`@playform/dsh-hook-*`).

They are historical records of the pre-release naming, so annotate them as historical and leave the
content.

---

## 8. THE SEQUENCING (the exec lane runs this; the user commits per phase)

| Phase  | What happens                                                                                                                                                                                                                                                                        | The gate                                                   |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **S0** | The baseline lock: `pnpm test` = 733 + 746 (the CURRENT tree, before any edit); `git status` clean; the working tree's manually-restored links documented. NO install in S0 (any install can re-break the pre-splice tree - §9.1).                                                  | the 733/746 run + the user's commit                        |
| **S1** | The base extraction: `git mv` the §2.3 plumbing into `EffectTS/packages/ets-base-dsh`; scaffold the manifest/tsconfig/Configuration; rewrite the moved modules' internal imports + the consumers' plumbing imports (rule 3, §4.1); build + run the 12 EffectTS suites.              | **746 green BEFORE any rename**                            |
| **S2** | The rename pass (one atomic change set): the 24 dir renames + the 24 manifest renames (§2.1/§2.2) + the by-name import rewrites (§4.1) + the manifest deps (§4.2) + the dual-source exports simplification + the classical effect-dep removal + the smoke reference updates (§6.2). | the renamed tree builds; `git status` reviewed by the user |
| **S3** | The workspace wiring: the root scripts (§3.2); `Maintain/Run/Smokes/Index.mjs`; delete `Maintain/DualSource.sh` + `Maintain/Verify-DualSource.mjs`; the `.prettierignore`/`.gitignore` residue cleanup; `pnpm-workspace.yaml` verified unchanged (§3.1).                                  | `pnpm format:check` green                                  |
| **S4** | The fresh-install gate: `pnpm install` -> `pnpm run build` -> `pnpm test`.                                                                                                                                                                                                          | **733 + 746, zero failures** (the splice is proven)        |
| **S5** | The SITE-DOCS-RENAME lane: the §7 list (parallel with S2..S4 or after; the site build regenerates `Site/Target`).                                                                                                                                                                   | the site build + the lychee gate                           |
| **S6** | The single-repo publish prep: the NPM.yml arm + the layer order (§5.1) - the npm lane, AFTER the S4 gate.                                                                                                                                                                           | the publish dry-run per layer                              |
| **S7** | The submodule migration mapping: the `.gitmodules.draft` update (§5.2).                                                                                                                                                                                                             | LATER - never now                                          |

---

## 9. THE RISKS

1. **The symlink-break recurrence.**

    The history: 2026-10-08 ~10:21 a pnpm install relinked the Classic consumers to the EffectTS
    tree (the duplicate-name glob-last resolution) and silently broke the Classic suites.

    The stopgap was manually restoring the same-tree `node_modules/@playform` links (2026-10-09),
    and the DUAL-SOURCE plan's warning was "ANY future install can re-break".

    Post-splice this dies at the root (§2.4).

    Residual risk: an install BETWEEN now and the S2 rename-pass can still re-break, so S0 forbids
    installing and S2..S4 land as one continuous pass.

2. **The base-extraction behavioral drift.**

    Moving the runtime wiring (the `Runtime.ts` materialize singleton, the layer graph), the stream
    machinery (the Gate's per-materialization state), and the fiber-home pattern changes module
    identity.

    Mitigation: `git mv` + import-only rewrites, zero behavior edits, and the S1 gate (746 green)
    before any rename touches the tree.

3. **The publish order.**

    25 inter-dependent packages exist, so a premature L2 publish ships a broken tarball, because its
    `@playform/*` siblings at the exact `0.0.1` must exist on the registry first.

    The L0 -> L1 -> L2 layer order (§5.1) is the enforcement, and the sibling entries are pinned at
    the EXACT `0.0.1`.

4. **The effect pin 4.0.2.**

    The pin is exact (no range) across the base, the 12 ets packages, and the factory's
    `@effect/opentelemetry: 4.0.2` devDep.

    Any future bump is a coordinated 13-manifest change, and the rename must not drift the pin,
    which the exec checklist pins per manifest.

5. **The classical identity shift + the token-reordered names.**

    The old `@playform/hook-dsh-*` names were NEVER published (NPM.yml PUBLISH-PENDING, everything
    at 0.0.1), so there is no registry breakage.

    The three REORDERED classical names (`hook-dsh-cargo-governor`, `hook-dsh-package-governor`,
    `hook-dsh-package-pinner`) are the easy-to-miss mappings, and §2.1 is the checklist.

6. **The smoke totals.**

    733/746 must not change, because the suite assertions and the ledger strings are the
    byte-identical contract.

    The exec edits paths and comments only (§6.2), and the S4 gate re-verifies.

7. **The dual-source residue.**

    All 24 manifests still carry the conditions exports and the sibling `files` dirs, so forgetting
    one leaves a broken exports map.

    The simplification is a checklist item in §4.2, verified by the S4 build: a leftover
    `./classic`/`./effect-ts` subpath or a `Target-Classic` `files` entry fails loudly or ships dead
    weight, and the exec removes all 24.

8. **CI.**

    Node.yml's fresh-checkout `pnpm install` was the historical hazard site, and post-splice the
    same step is safe and the workflow needs no link-restore step, which it never had because the
    restores were manual.

    The 733/746 comment lines stay valid.

---

## 10. THE COORDINATION + DISCIPLINES

- **The lanes:** the SPLICE-EXEC lane runs §8 (the renames + the wiring + the S4 gate); the
  SITE-DOCS-RENAME lane runs §7; the npm lane runs §5.1 (after S4); the submodule mapping (§5.2) is
  a later batch.

- **Documentation-only for this lane:** the only tree edit of THIS plan is `SPLICE-ETS.md` itself,
  and §0's superseded banner is carried HERE, because `DUAL-SOURCE-BUNDLING.md` is not edited by
  this lane.

- **Never commit - the user commits** (per phase, §8).

- **The byte-integrity rule:** every move is `git mv`, and the only content edits are the
  name/import rewrites plus the dual-source manifest simplification.

    The ledger strings and the smoke assertions stay byte-identical, because the smokes are the
    arbiter.

- **The child-subagent cap:** at most 2 child subagents for this lane (0 used, because the inventory
  and the matrix were verified directly against the tree).

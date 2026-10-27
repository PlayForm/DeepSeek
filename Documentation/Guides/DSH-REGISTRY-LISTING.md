---
title: The npm registry listing for the DSH plugin family
category: Guides
kind: guide
date: 2026-10-10
status: active
registry: Documentation/Guides/DSH-REGISTRY-LISTING.md
index: Documentation/INDEX.md
statuses:
    - name: the registry identity and the roster (the two groups + the base)
      state: resolved
      evidence: documented in this file
    - name: the npm publish
      state: deferred
      evidence:
          publish-pending until the npm lane arms it; see Documentation/Plans/TRUSTED-PUBLISHER.md
    - name: the GitHub repo topics
      state: open
      evidence: a repo-settings action - the user's call
---

# DSH-REGISTRY-LISTING - the npm registry listing for the DSH plugin family

> The listing that the family publishes under once the npm lane arms the publish.
>
> `.github/workflows/NPM.yml` is armed for the 0.1.0 release, and the publish itself is the user's
> call.
>
> Everything sits at version `0.1.0`, and the 0.0.1 release stays on the registry and is immutable.
>
> This file is the filled template: the registry identity, the package roster with the exact install
> commands, and the byte-exact rule that the listing text must obey.
>
> The PLUGIN-REG lane prepared it.
>
> DOCUMENTATION ONLY - nothing is committed (the user commits).

---

## 1. THE REGISTRY IDENTITY

- **The scope.** `@playform` is the ONLY available scope, and the whole family shares it (SPLICE-ETS
  section 1.2).
- **The topic.** The family lists under the **`dsh-plugin`** topic, which the registry surfaces (npm
  keywords + the GitHub repo topics) carry.
- EVERY package's `keywords` include `dsh-plugin` alongside `deepseek`, `harness`, and `plugin`.
- **The version.** `0.1.0` covers the family, and the sibling entries in EVERY manifest pin the
  EXACT `0.1.0`.
- The FIRST publish must land the layers in the dependency order (SPLICE-ETS section 5.1), or the
  dependent tarballs resolve against nothing.
- **The source of the install form.** The site already ships the final command shape on EVERY plugin
  page and in the hero: `pnpm add @playform/<pkg>`.
- `Site/Source/Component/Terminal.astro` defaults to `pnpm add @playform/lib-dsh-core`, and
  `Site/Source/pages/plugins.astro` carries ONE install row per package.
- The listing below repeats that form BYTE-EXACT.

## 2. THE ROSTER - the OPERATING NAMES (the original groups + the base)

The splice has run (SPLICE-ETS section 8 S2/S4), so the trees now carry UNIQUE names.

The Classic tree keeps the plain `@playform/{lib,hook,plugin}-dsh-*` names.

The EffectTS tree keeps the `@playform/ets-*` names plus the base `@playform/ets-base-dsh`, as the
manifests verify.

The registry listing uses exactly these names.

**This roster covers the ORIGINAL 31 packages.**

The 2026-10-22 delivery adds 36 Classic packages and 30 EffectTS twins (the workspace family, the
suggesters, the orchestration set, the client family), and
Documentation/Plugins/PLUGIN-SUITE-SUMMARY.md holds the full inventory with one-line roles.

Every new package follows the same install form (`pnpm add @playform/<pkg>`) and the same bootstrap
tier (2-planned / 3-candidates).

**The classical group (15, `Classic/packages/*`):**

| #   | Package                                  | Install command (byte-exact)                      | Role                                              |
| --- | ---------------------------------------- | ------------------------------------------------- | ------------------------------------------------- |
| 1   | `@playform/lib-dsh-core`                 | `pnpm add @playform/lib-dsh-core`                 | the core contract + the normalize machinery       |
| 2   | `@playform/plugin-dsh-factory`           | `pnpm add @playform/plugin-dsh-factory`           | the factory service (`ctx.pluginFactory`)         |
| 3   | `@playform/hook-dsh-package-governor`    | `pnpm add @playform/hook-dsh-package-governor`    | the package.json governor                         |
| 4   | `@playform/hook-dsh-package-pinner`      | `pnpm add @playform/hook-dsh-package-pinner`      | the package.json pinner                           |
| 5   | `@playform/hook-dsh-cargo-governor`      | `pnpm add @playform/hook-dsh-cargo-governor`      | the Cargo.toml governor                           |
| 6   | `@playform/hook-dsh-normalize-dash`      | `pnpm add @playform/hook-dsh-normalize-dash`      | dashes -> the module's replacement                |
| 7   | `@playform/hook-dsh-normalize-quotes`    | `pnpm add @playform/hook-dsh-normalize-quotes`    | curly -> straight quotes                          |
| 8   | `@playform/hook-dsh-normalize-ellipsis`  | `pnpm add @playform/hook-dsh-normalize-ellipsis`  | ... -> ...                                        |
| 9   | `@playform/hook-dsh-normalize-spaces`    | `pnpm add @playform/hook-dsh-normalize-spaces`    | unicode -> ASCII spaces                           |
| 10  | `@playform/hook-dsh-normalize-invisible` | `pnpm add @playform/hook-dsh-normalize-invisible` | invisible characters removed                      |
| 11  | `@playform/hook-dsh-normalize-fullwidth` | `pnpm add @playform/hook-dsh-normalize-fullwidth` | fullwidth -> halfwidth                            |
| 12  | `@playform/plugin-dsh-normalize-file`    | `pnpm add @playform/plugin-dsh-normalize-file`    | the file normalize composition                    |
| 13  | `@playform/hook-dsh-ccr`                 | `pnpm add @playform/hook-dsh-ccr`                 | the CCR compressor and the `ccr_retrieve` tool    |
| 14  | `@playform/hook-dsh-tool-coach`          | `pnpm add @playform/hook-dsh-tool-coach`          | the terminal-content coaching guardian            |
| 15  | `@playform/hook-dsh-live-containers`     | `pnpm add @playform/hook-dsh-live-containers`     | the dynamic system-prompt blocks (ships disabled) |

**The effect-ts group (15 + the base, `EffectTS/packages/ets-*`):**

| #   | Package                                      | Install command (byte-exact)                          | Role                                              |
| --- | -------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------- |
| 1   | `@playform/ets-base-dsh`                     | `pnpm add @playform/ets-base-dsh`                     | the shared Effect-TS plumbing (the base)          |
| 2   | `@playform/ets-lib-dsh-core`                 | `pnpm add @playform/ets-lib-dsh-core`                 | the core contract + the normalize machinery       |
| 3   | `@playform/ets-plugin-dsh-factory`           | `pnpm add @playform/ets-plugin-dsh-factory`           | the factory service (`ctx.pluginFactory`)         |
| 4   | `@playform/ets-hook-dsh-package-governor`    | `pnpm add @playform/ets-hook-dsh-package-governor`    | the package.json governor                         |
| 5   | `@playform/ets-hook-dsh-package-pinner`      | `pnpm add @playform/ets-hook-dsh-package-pinner`      | the package.json pinner                           |
| 6   | `@playform/ets-hook-dsh-cargo-governor`      | `pnpm add @playform/ets-hook-dsh-cargo-governor`      | the Cargo.toml governor                           |
| 7   | `@playform/ets-hook-dsh-normalize-dash`      | `pnpm add @playform/ets-hook-dsh-normalize-dash`      | dashes -> the module's replacement                |
| 8   | `@playform/ets-hook-dsh-normalize-quotes`    | `pnpm add @playform/ets-hook-dsh-normalize-quotes`    | curly -> straight quotes                          |
| 9   | `@playform/ets-hook-dsh-normalize-ellipsis`  | `pnpm add @playform/ets-hook-dsh-normalize-ellipsis`  | ... -> ...                                        |
| 10  | `@playform/ets-hook-dsh-normalize-spaces`    | `pnpm add @playform/ets-hook-dsh-normalize-spaces`    | unicode -> ASCII spaces                           |
| 11  | `@playform/ets-hook-dsh-normalize-invisible` | `pnpm add @playform/ets-hook-dsh-normalize-invisible` | invisible characters removed                      |
| 12  | `@playform/ets-hook-dsh-normalize-fullwidth` | `pnpm add @playform/ets-hook-dsh-normalize-fullwidth` | fullwidth -> halfwidth                            |
| 13  | `@playform/ets-plugin-dsh-normalize-file`    | `pnpm add @playform/ets-plugin-dsh-normalize-file`    | the file normalize composition                    |
| 14  | `@playform/ets-hook-dsh-ccr`                 | `pnpm add @playform/ets-hook-dsh-ccr`                 | the CCR compressor and the `ccr_retrieve` tool    |
| 15  | `@playform/ets-hook-dsh-tool-coach`          | `pnpm add @playform/ets-hook-dsh-tool-coach`          | the terminal-content coaching guardian            |
| 16  | `@playform/ets-hook-dsh-live-containers`     | `pnpm add @playform/ets-hook-dsh-live-containers`     | the dynamic system-prompt blocks (ships disabled) |

The duplicate-name collision (#15) is resolved.

Every `@playform/*` dependency resolves to exactly ONE workspace package.

So the publish order is the layer order (section 5).

## 4. THE BYTE-EXACT RULE

The install command strings in this listing, on the site, and in the READMEs form the byte-identical
contract:

- Every install row is exactly `pnpm add @playform/<pkg>` - NO `--save`, NO `-D`, NO registry URL,
  NO version suffix in the display form.
- The package tokens must match the manifest `name` byte-for-byte.
- A renamed package (the splice) rewrites the command AND the listing row in the same change set.
- The smoke suite reference strings and the ledger totals (359 suites / 5,337 checks across both
  trees) are untouched by ANY listing edit.
- The suites are the arbiter (SPLICE-ETS section 6.1, section 10).
- `Site/Target/**` is build output.
- The site's install rows are edited in `Site/Source/**` ONLY, NEVER hand-edited in Target.

## 5. THE PUBLISH GATES (the residual checklist)

1. **The splice.**

    The splice lands first with the unique names, because a pre-splice publish would ship the
    collision into the registry.

2. **The workflow arming.**

    `NPM.yml` is armed per layer: L0 `@playform/ets-base-dsh` -> L1 the four foundations -> L2 the
    twenty-six consumers (SPLICE-ETS section 5.1).

3. **The fresh-install gate.**

    The fresh-install gate is green: `pnpm install` -> `pnpm run build` -> `pnpm test` = 97/97
    packages, 359 suites / 5,337 checks, zero failures.

4. **The site rows.**

    The site's `Install:` rows and the `/setup/` flow copy already match the `pnpm add` form,
    verified byte-exact against this roster at publish time.

## 6. THE RESIDUALS

- ~~The listing's Section 2 names are PRE-SPLICE~~ Resolved: the splice landed (SPLICE-ETS section 8
  S2/S4).
- Section 2 now carries BOTH groups' operating names, and the PENDING_NAMESPACES section collapses
  into the roster.
- The per-package `keywords: ["dsh-plugin", ...]` entries are NOT yet in the manifests.
- Adding them is part of the npm lane's manifest pass, NOT this lane.
- The GitHub repo topics (`dsh-plugin` et al.) are a repo-settings action, the user's call, outside
  the tree.
- The publish remains the user's call (`NPM.yml` runs only via `workflow_dispatch`/`release`, and
  the workflow is armed for 0.1.0).

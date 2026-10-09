# DSH-REGISTRY-LISTING - the npm registry listing for the DSH plugin family

> The listing the family publishes under once the npm lane arms the publish
> (`.github/workflows/NPM.yml` is PUBLISH-PENDING behind the `if: false` guard;
> everything sits at version `0.0.1`, never published). This file is the filled
> template: the registry identity, the package roster with the exact install
> commands, and the byte-exact rule the listing text must obey. Prepared by the
> PLUGIN-REG lane. DOCUMENTATION ONLY - nothing is committed (the user commits).

---

## 1. THE REGISTRY IDENTITY

- **The scope:** `@playform` - the only available scope, shared by the whole
  family (SPLICE-ETS §1.2).
- **The topic:** the family lists under the **`dsh-plugin`** topic - the DeepSeek
  Harness plugin topic that the registry surfaces (npm keywords + the GitHub
  repo topics) carry. Every package's `keywords` include `dsh-plugin` alongside
  `deepseek`, `harness`, and `plugin`.
- **The version:** `0.0.1` across the family - the sibling entries in every
  manifest pin the EXACT `0.0.1`, so the first publish must land the layers in
  the dependency order (SPLICE-ETS §5.1) or the dependent tarballs resolve
  against nothing.
- **The source of the install form:** the site already ships the final command
  shape on every plugin page and in the hero: `pnpm add @playform/<pkg>`
  (`Site/Source/Component/Terminal.astro` defaults to
  `pnpm add @playform/dsh-core-hook`; `Site/Source/pages/plugins.astro` carries
  one install row per package). The listing below repeats that form BYTE-EXACT.

## 2. THE ROSTER - the OPERATING NAMES (the two groups + the base)

The splice has executed (SPLICE-ETS §8 S2/S4): the trees carry UNIQUE names - the Classic
tree the plain `@playform/dsh-*` names, the EffectTS tree the `@playform/ets-hook-dsh-*` /
`@playform/ets-dsh-plugin-factory` names plus the base `@playform/ets-dsh-hook` (verified in the
manifests). The registry listing uses exactly these.

**The classical group (12, `Classic/packages/*`):**

| # | Package | Install command (byte-exact) | Role |
| - | ------- | ---------------------------- | ---- |
| 1 | `@playform/dsh-core-hook` | `pnpm add @playform/dsh-core-hook` | the core contract + the normalize machinery |
| 2 | `@playform/dsh-plugin-factory` | `pnpm add @playform/dsh-plugin-factory` | the factory service (`ctx.pluginFactory`) |
| 3 | `@playform/dsh-package-governor-hook` | `pnpm add @playform/dsh-package-governor-hook` | the package.json governor |
| 4 | `@playform/dsh-package-pinner-hook` | `pnpm add @playform/dsh-package-pinner-hook` | the package.json pinner |
| 5 | `@playform/dsh-cargo-governor-hook` | `pnpm add @playform/dsh-cargo-governor-hook` | the Cargo.toml governor |
| 6 | `@playform/dsh-normalize-dash-hook` | `pnpm add @playform/dsh-normalize-dash-hook` | dashes → the module's replacement |
| 7 | `@playform/dsh-normalize-quotes-hook` | `pnpm add @playform/dsh-normalize-quotes-hook` | curly → straight quotes |
| 8 | `@playform/dsh-normalize-ellipsis-hook` | `pnpm add @playform/dsh-normalize-ellipsis-hook` | ... → ... |
| 9 | `@playform/dsh-normalize-spaces-hook` | `pnpm add @playform/dsh-normalize-spaces-hook` | unicode → ASCII spaces |
| 10 | `@playform/dsh-normalize-invisible-hook` | `pnpm add @playform/dsh-normalize-invisible-hook` | invisible characters removed |
| 11 | `@playform/dsh-normalize-fullwidth-hook` | `pnpm add @playform/dsh-normalize-fullwidth-hook` | fullwidth → halfwidth |
| 12 | `@playform/dsh-normalize-file-hook` | `pnpm add @playform/dsh-normalize-file-hook` | the file normalize composition |

**The effect-ts group (12 + the base, `EffectTS/packages/ets-*`):**

| # | Package | Install command (byte-exact) | Role |
| - | ------- | ---------------------------- | ---- |
| 1 | `@playform/ets-dsh-hook` | `pnpm add @playform/ets-dsh-hook` | the shared Effect-TS plumbing (the base) |
| 2 | `@playform/ets-dsh-core-hook` | `pnpm add @playform/ets-dsh-core-hook` | the core contract + the normalize machinery |
| 3 | `@playform/ets-dsh-plugin-factory` | `pnpm add @playform/ets-dsh-plugin-factory` | the factory service (`ctx.pluginFactory`) |
| 4 | `@playform/ets-hook-dsh-governor-package` | `pnpm add @playform/ets-hook-dsh-governor-package` | the package.json governor |
| 5 | `@playform/ets-hook-dsh-pinner-package` | `pnpm add @playform/ets-hook-dsh-pinner-package` | the package.json pinner |
| 6 | `@playform/ets-hook-dsh-governor-cargo` | `pnpm add @playform/ets-hook-dsh-governor-cargo` | the Cargo.toml governor |
| 7 | `@playform/ets-dsh-normalize-dash-hook` | `pnpm add @playform/ets-dsh-normalize-dash-hook` | dashes → the module's replacement |
| 8 | `@playform/ets-dsh-normalize-quotes-hook` | `pnpm add @playform/ets-dsh-normalize-quotes-hook` | curly → straight quotes |
| 9 | `@playform/ets-dsh-normalize-ellipsis-hook` | `pnpm add @playform/ets-dsh-normalize-ellipsis-hook` | ... → ... |
| 10 | `@playform/ets-dsh-normalize-spaces-hook` | `pnpm add @playform/ets-dsh-normalize-spaces-hook` | unicode → ASCII spaces |
| 11 | `@playform/ets-dsh-normalize-invisible-hook` | `pnpm add @playform/ets-dsh-normalize-invisible-hook` | invisible characters removed |
| 12 | `@playform/ets-dsh-normalize-fullwidth-hook` | `pnpm add @playform/ets-dsh-normalize-fullwidth-hook` | fullwidth → halfwidth |
| 13 | `@playform/ets-dsh-normalize-file-hook` | `pnpm add @playform/ets-dsh-normalize-file-hook` | the file normalize composition |

The duplicate-name collision (#15) is resolved: every `@playform/*` dependency resolves to
exactly one workspace package, so the publish order is the layer order (§5).

## 4. THE BYTE-EXACT RULE

The install command strings in this listing, on the site, and in the READMEs are
the byte-identical contract:

- Every install row is exactly `pnpm add @playform/<pkg>` - no `--save`, no
  `-D`, no registry URL, no version suffix in the display form.
- The package tokens must match the manifest `name` byte-for-byte - a renamed
  package (the splice) rewrites the command AND the listing row in the same
  change set.
- The smoke suite reference strings and the ledger totals (733 Classic / 746
  EffectTS) are untouched by any listing edit - the suites are the arbiter
  (SPLICE-ETS §6.1, §10).
- `Site/Target/**` is build output - the site's install rows are edited in
  `Site/Source/**` only, never hand-edited in Target.

## 5. THE PUBLISH GATES (the residual checklist)

1. The splice lands first (the unique names) - a pre-splice publish would ship
   the collision into the registry.
2. `NPM.yml` armed per layer: L0 `@playform/ets-dsh-hook` → L1 the four
   foundations → L2 the twenty consumers (SPLICE-ETS §5.1).
3. Fresh-install gate green: `pnpm install` → `pnpm run build` → `pnpm test` =
   733 + 746, zero failures (SPLICE-ETS §6.3).
4. The site's `Install:` rows + the `/setup/` flow copy already match the
   `pnpm add` form - verified byte-exact against this roster at publish time.

## 6. THE RESIDUALS

- ~~The listing's Section 2 names are PRE-SPLICE~~ Resolved: the splice landed (SPLICE-ETS §8
  S2/S4) and Section 2 now carries both groups' operating names; the PENDING_NAMESPACES section is
  collapsed into the roster.
- The per-package `keywords: ["dsh-plugin", ...]` entries are NOT yet in the manifests - adding
  them is part of the npm lane's manifest pass, not this lane.
- The GitHub repo topics (`dsh-plugin` et al.) are a repo-settings action - the user's call,
  outside the tree.
- The publish remains PUBLISH-PENDING (`NPM.yml` `if: false`) until the npm lane arms it after
  the S4 gate.

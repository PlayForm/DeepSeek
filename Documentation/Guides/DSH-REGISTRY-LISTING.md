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
  `pnpm add @playform/hook-dsh-core`; `Site/Source/pages/plugins.astro` carries
  one install row per package). The listing below repeats that form BYTE-EXACT.

## 2. THE ROSTER - the CURRENT OPERATING NAMES (12)

The trees today carry the `@playform/hook-dsh-*` + `@playform/plugin-dsh-factory`
names (verified in the manifests, `Classic/packages/*/package.json` and
`EffectTS/packages/*/package.json`); the site installs by these names. Until the
splice executes, THIS is the namespace the registry listing uses.

| # | Package | Install command (byte-exact) | Role |
| - | ------- | ---------------------------- | ---- |
| 1 | `@playform/hook-dsh-core` | `pnpm add @playform/hook-dsh-core` | the core contract + the normalize machinery |
| 2 | `@playform/plugin-dsh-factory` | `pnpm add @playform/plugin-dsh-factory` | the factory service (`ctx.pluginFactory`) |
| 3 | `@playform/hook-dsh-governor-package` | `pnpm add @playform/hook-dsh-governor-package` | the package.json governor |
| 4 | `@playform/hook-dsh-pinner-package` | `pnpm add @playform/hook-dsh-pinner-package` | the package.json pinner |
| 5 | `@playform/hook-dsh-governor-cargo` | `pnpm add @playform/hook-dsh-governor-cargo` | the Cargo.toml governor |
| 6 | `@playform/hook-dsh-normalize-dash` | `pnpm add @playform/hook-dsh-normalize-dash` | dashes → the module's replacement |
| 7 | `@playform/hook-dsh-normalize-quotes` | `pnpm add @playform/hook-dsh-normalize-quotes` | curly → straight quotes |
| 8 | `@playform/hook-dsh-normalize-ellipsis` | `pnpm add @playform/hook-dsh-normalize-ellipsis` | ... → ... |
| 9 | `@playform/hook-dsh-normalize-spaces` | `pnpm add @playform/hook-dsh-normalize-spaces` | unicode → ASCII spaces |
| 10 | `@playform/hook-dsh-normalize-invisible` | `pnpm add @playform/hook-dsh-normalize-invisible` | invisible characters removed |
| 11 | `@playform/hook-dsh-normalize-fullwidth` | `pnpm add @playform/hook-dsh-normalize-fullwidth` | fullwidth → halfwidth |
| 12 | `@playform/hook-dsh-normalize-file` | `pnpm add @playform/hook-dsh-normalize-file` | the file normalize composition |

Both trees (Classic + EffectTS) carry these SAME twelve names today - the
duplicate-name collision is the #15 registration (SPLICE-ETS §2 preamble); only
ONE of the two can publish under a given name, which is exactly what the splice
resolves.

## 3. THE PENDING NAMESPACES (after the splice - SPLICE-ETS §2)

Once SPLICE-ETS executes, the roster renames and the listing updates to:

- **The classical group (12):** the plain `@playform/dsh-*` names -
  `@playform/dsh-hook-core`, `@playform/dsh-plugin-factory`,
  `@playform/dsh-hook-cargo-governor`, `@playform/dsh-hook-package-governor`,
  `@playform/dsh-hook-package-pinner`, `@playform/dsh-hook-normalize-*` x7,
  `@playform/dsh-hook-normalize-file` (the three token-REORDERED names are the
  easy-to-miss mappings - SPLICE-ETS §2.1 is the checklist).
- **The effect-ts group (12):** the `ets-` pre-pendage - `@playform/ets-hook-dsh-core`,
  `@playform/ets-plugin-dsh-factory`, `@playform/ets-hook-dsh-governor-*`,
  `@playform/ets-hook-dsh-pinner-package`, `@playform/ets-hook-dsh-normalize-*` x8.
- **The base (1):** `@playform/ets-dsh-hook` - the shared Effect-TS plumbing
  every ets-* package depends on (the L0 publish).

Install form after the splice, unchanged in shape:
`pnpm add @playform/dsh-...` (classical) / `pnpm add @playform/ets-...` (effect-ts).

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

- The listing's Section 2 names are PRE-SPLICE - after SPLICE-ETS §8 S2 lands,
  Section 2 rewrites to the §2.1/§2.2 names and Section 3 collapses.
- The per-package `keywords: ["dsh-plugin", ...]` entries are NOT yet in the
  manifests - adding them is part of the npm lane's manifest pass, not this
  lane.
- The GitHub repo topics (`dsh-plugin` et al.) are a repo-settings action - the
  user's call, outside the tree.
- The publish remains PUBLISH-PENDING (`NPM.yml` `if: false`) until the npm
  lane arms it after the S4 gate.

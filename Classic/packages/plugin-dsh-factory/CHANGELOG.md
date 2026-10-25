# Changelog

All notable changes to this package will be documented in this file.

## 0.2.0

### Changed

- The D4-D8 release pass (the pack and trace libraries ship across both trees): the factory's write
  executor, its scheme and its bundle patch move with it.
- The role-prefix contract applied to the factory's ledger strings and manifest.
- The `@deepseek-ai/dsh-fs`, `@deepseek-ai/dsh-sandbox` and `@deepseek-ai/dsh-subprocess`
  devDependencies bumped to the 0.2.1-rc.2 line (Dependabot).
- Line endings normalised and the LICENSE text wrapped.
- The repository-wide markdown clean-up and the README role / surfaces / ledger pass.

## 0.1.0

### Changed

- The 0.1.0 family release: the package ships at 0.1.0 with the 31-package family, every
  `@playform/` sibling pin reads 0.1.0, and the role-prefix contract settles its
  `@playform/plugin-dsh-factory` identity.

## 0.0.1

### Added

- The initial release of @playform/plugin-dsh-factory: the factory service (ctx.pluginFactory): the
  shared machinery of the governance and normalization families (the ledger, the exclusions, the
  storage journal, the activation and the 19-method tool surface) (the Classic release of the
  DeepSeek Harness Plugin Family).

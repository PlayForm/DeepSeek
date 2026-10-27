# Changelog

All notable changes to this package will be documented in this file.

## 0.3.0

### Changed

- The 0.3.0 release line: the manifest version, the `@playform/` sibling pins and the host
  devDependencies move together - the host line to `0.2.1-rc.4` and zod to 4.6.7.
- The storage-domain table cast: the zod 4.6.7 schemas are cast to the host library's `domainTable`
  parameter type, because `@deepseek-ai/dsh-storage-domain` types its tables against its own zod
  4.4.3 and the inference otherwise fails with TS2589.

## 0.2.0

### Changed

- The D4-D8 release pass (the pack and trace libraries ship across both trees): the factory's write
  executor, its trace surface, its scheme and its bundle patch move with it.
- The role-prefix contract applied to the factory's ledger strings and manifest.
- The `@deepseek-ai/dsh-fs`, `@deepseek-ai/dsh-sandbox` and `@deepseek-ai/dsh-subprocess`
  devDependencies bumped to the 0.2.1-rc.2 line (Dependabot).
- Line endings normalized and the LICENSE text wrapped.
- The repository-wide markdown clean-up, the prettier reflow, and the README role / surfaces /
  ledger pass with the static market index committed alongside.

## 0.1.0

### Changed

- The 0.1.0 family release: the package ships at 0.1.0 with the 31-package family, every
  `@playform/` sibling pin reads 0.1.0, and the role-prefix contract settles its
  `@playform/ets-plugin-dsh-factory` identity.

## 0.0.1

### Added

- The initial release of @playform/ets-plugin-dsh-factory: the factory service (ctx.pluginFactory):
  the shared machinery of the governance and normalization families (the ledger, the exclusions, the
  storage journal, the activation and the 19-method tool surface) (the Effect-TS release of the
  DeepSeek Harness Plugin Family).

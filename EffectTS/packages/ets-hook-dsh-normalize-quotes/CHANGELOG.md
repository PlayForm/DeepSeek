# Changelog

All notable changes to this package will be documented in this file.

## 0.3.0

### Changed

- The 0.3.0 release line: the manifest version, the `@playform/` sibling pins and the host
  devDependencies move together - the host line to `0.2.1-rc.4` and zod to 4.6.7.

## 0.2.0

### Changed

- The D4-D8 release pass (the pack and trace libraries ship across both trees): the hook's source,
  its scheme and its bundle patch move with it.
- The internal imports migrated to the `@Interface` alias.
- The role-prefix contract applied to the hook's ledger strings and manifest.
- Line endings normalized and the LICENSE text wrapped.
- The repository-wide markdown clean-up, the prettier reflow, and the README role / surfaces /
  ledger pass.

### Fixed

- The internal import paths adjusted for the hook's local interfaces.

## 0.1.0

### Changed

- The 0.1.0 family release: the package ships at 0.1.0 with the 31-package family, every
  `@playform/` sibling pin reads 0.1.0, and the role-prefix contract settles its
  `@playform/ets-hook-dsh-normalize-quotes` identity.

## 0.0.1

### Added

- The initial release of @playform/ets-hook-dsh-normalize-quotes: the stream hook normalizing the
  curly quote family in model output (the Effect-TS release of the DeepSeek Harness Plugin Family).

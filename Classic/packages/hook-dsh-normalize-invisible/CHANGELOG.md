# Changelog

All notable changes to this package will be documented in this file.

## 0.2.1

### Changed

- The release line is renumbered to `0.2.1`, one patch above the `0.2.0` published on npm, so the
  whole family shares a single version again.
- The build-time version constant (`process.env.VERSION_PACKAGE`) compiles in `0.2.1`.

## 0.3.0

### Changed

- The 0.3.0 release line: the manifest version, the `@playform/` sibling pins and the host
  devDependencies move together - the host line to `0.2.1-rc.4` and zod to 4.6.7.

## 0.2.0

### Changed

- The D4-D8 release pass (the pack and trace libraries ship across both trees): the hook's
  `Source/Function/Apply.ts`, its config variables, its scheme and its bundle patch move with it.
- The role-prefix contract applied to the hook's ledger strings and manifest.
- Line endings normalized and the LICENSE text wrapped.
- The repository-wide markdown clean-up standardized the README, SCHEME, CONTRIBUTING,
  CODE_OF_CONDUCT and CHANGELOG.
- The README restructured onto the role / surfaces / ledger template, then finished and committed
  with the static market index.

## 0.1.0

### Changed

- The 0.1.0 family release: the package ships at 0.1.0 with the 31-package family, every
  `@playform/` sibling pin reads 0.1.0, and the role-prefix contract settles its
  `@playform/hook-dsh-normalize-invisible` identity.

## 0.0.1

### Added

- The initial release of @playform/hook-dsh-normalize-invisible: the stream hook normalizing the
  zero-width and invisible character family in model output (the Classic release of the DeepSeek
  Harness Plugin Family).

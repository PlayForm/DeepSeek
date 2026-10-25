# Changelog

All notable changes to this package will be documented in this file.

## 0.2.0

### Changed

- The D4-D8 release pass (the pack and trace libraries ship across both trees): the governor's
  source, its scheme and its bundle patch move with it.
- The role-prefix contract applied to the governor's ledger strings and manifest.
- Line endings normalised and the LICENSE text wrapped.
- The repository-wide markdown clean-up, and the README restructured onto the role / surfaces /
  ledger template with the static market index committed alongside.

## 0.1.0

### Changed

- The 0.1.0 family release: the package ships at 0.1.0 with the 31-package family, every
  `@playform/` sibling pin reads 0.1.0, and the role-prefix contract settles its
  `@playform/hook-dsh-cargo-governor` identity.

## 0.0.1

### Added

- The initial release of @playform/hook-dsh-cargo-governor: the silent Cargo.toml governor: the
  rust-sided flavor of the package.json governor, hooking fs/observed and deterministically
  governing the rust manifest's dependencies (the Classic release of the DeepSeek Harness Plugin
  Family).

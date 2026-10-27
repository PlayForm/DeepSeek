# Changelog

This file documents all notable changes to this package.

## 0.3.0

### Changed

- The 0.3.0 release line moves the manifest version, the `@playform/` sibling pins, and the host
  devDependencies together - the host line to `0.2.1-rc.4` and zod to 4.6.7.

## 0.2.0

### Changed

- The D4-D8 release pass moves the source of the governor, its scheme, and its bundle patch, and the
  pack and trace libraries ship across both trees.
- The role-prefix contract is applied to the ledger strings and the manifest of the governor.
- Line endings are normalized and the LICENSE text is wrapped.
- The markdown clean-up runs across the repository, the README is restructured onto the role /
  surfaces / ledger template, and the static market index is committed alongside.

## 0.1.0

### Changed

- This is the 0.1.0 family release: the package ships at 0.1.0 with the 31-package family, every
  `@playform/` sibling pin reads 0.1.0, and the role-prefix contract settles its
  `@playform/hook-dsh-cargo-governor` identity.

## 0.0.1

### Added

- This is the initial release of @playform/hook-dsh-cargo-governor, the silent Cargo.toml governor,
  which is the rust-sided flavor of the package.json governor and hooks fs/observed to govern the
  dependencies of the rust manifest deterministically, in the Classic release of the DeepSeek
  Harness Plugin Family.

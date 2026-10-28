# Changelog

This file records all notable changes to this package.

## 0.2.1

### Changed

- The release line is renumbered to `0.2.1`, one patch above the `0.2.0` published on npm, so the
  whole family shares a single version again.
- The build-time version constant (`process.env.VERSION_PACKAGE`) compiles in `0.2.1`.

## 0.3.0

### Changed

- The 0.3.0 release line moves the manifest version, the `@playform/` sibling pins, and the host
  devDependencies together, with the host line at `0.2.1-rc.4` and zod at 4.6.7.

## 0.2.0

### Changed

- The role-prefix rename makes the package read `@playform/plugin-dsh-normalize-file`, while the
  previous name stays in git history, and the manifest, the README, and the source identifiers
  follow.
- The D4-D8 release pass ships the pack and trace libraries across both trees, and the source of the
  tool, its scheme, and its bundle patch move with it.
- The repository-wide markdown clean-up lands with the README role, surfaces, and ledger pass.

## 0.1.0

### Changed

- The 0.1.0 family release ships the package at 0.1.0 with the 31-package family and every
  `@playform/` sibling pin at 0.1.0, under the role-prefix contract.

## 0.0.1

### Added

- The initial release of @playform/plugin-dsh-normalize-file ships the file-content normalizer,
  which is the normalize-file tool of the normalize family over files already on disk, in the
  Classic release of the DeepSeek Harness Plugin Family.

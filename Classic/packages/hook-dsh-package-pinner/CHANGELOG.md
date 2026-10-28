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
  devDependencies together to the `0.2.1-rc.4` host line and zod 4.6.7.

## 0.2.0

### Changed

- The D4-D8 release pass ships the pack and trace libraries across both trees, and the pinner's
  source, scheme, and bundle patch move with it.
- The role-prefix contract now applies to the pinner's ledger strings and manifest.
- Dependabot bumps the `@deepseek-ai/dsh-fs`, `@deepseek-ai/dsh-sandbox`, and
  `@deepseek-ai/dsh-subprocess` devDependencies to the 0.2.1-rc.2 line.
- Line endings are normalized, and the LICENSE text is wrapped.
- The repository-wide markdown clean-up and the README role, surfaces, and ledger pass land.

## 0.1.0

### Changed

- The 0.1.0 family release ships this package at 0.1.0 with the 31-package family, and every
  `@playform/` sibling pin reads 0.1.0.
- The role-prefix contract settles its `@playform/hook-dsh-package-pinner` identity.

## 0.0.1

### Added

- The initial release of @playform/hook-dsh-package-pinner is the silent package.json version
  pinner, which hooks fs/observed and deterministically rewrites every ranged dependency version to
  its static version (the Classic release of the DeepSeek Harness Plugin Family).

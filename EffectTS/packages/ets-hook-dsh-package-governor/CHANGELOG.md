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

- The D4-D8 release pass (the pack and trace libraries ship across both trees): the governor's
  source, its scheme and its bundle patch move with it.
- The role-prefix contract applied to the governor's ledger strings and manifest.
- The `@deepseek-ai/dsh-fs`, `@deepseek-ai/dsh-sandbox` and `@deepseek-ai/dsh-subprocess`
  devDependencies bumped to the 0.2.1-rc.2 line (Dependabot).
- Line endings normalized and the LICENSE text wrapped.
- The repository-wide markdown clean-up, the prettier reflow, and the README role / surfaces /
  ledger pass with the static market index committed alongside.

## 0.1.0

### Changed

- The 0.1.0 family release: the package ships at 0.1.0 with the 31-package family, every
  `@playform/` sibling pin reads 0.1.0, and the role-prefix contract settles its
  `@playform/ets-hook-dsh-package-governor` identity.

## 0.0.1

### Added

- The initial release of @playform/ets-hook-dsh-package-governor: the silent package.json governor:
  hooking fs/observed, rewriting the chain-governed pins to the effective registry's resolved ranges
  and running the update stage (the Effect-TS release of the DeepSeek Harness Plugin Family).

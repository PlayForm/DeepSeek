# Changelog

All notable changes to this package will be documented in this file.

## 0.2.0

### Changed

- The D4-D8 release pass (the pack and trace libraries ship across both trees): the pinner's source,
  its scheme and its bundle patch move with it.
- The role-prefix contract applied to the pinner's ledger strings and manifest.
- The `@deepseek-ai/dsh-fs`, `@deepseek-ai/dsh-sandbox` and `@deepseek-ai/dsh-subprocess`
  devDependencies bumped to the 0.2.1-rc.2 line (Dependabot).
- Line endings normalized and the LICENSE text wrapped.
- The repository-wide markdown clean-up, the prettier reflow, and the README role / surfaces /
  ledger pass with the static market index committed alongside.

### Fixed

- The `State-And-Activation` expectation now takes the factory constructor's D5 `trace` effect ahead
  of the flavor's three lifecycle effects (the test predated the trace bus).

## 0.1.0

### Changed

- The 0.1.0 family release: the package ships at 0.1.0 with the 31-package family, every
  `@playform/` sibling pin reads 0.1.0, and the role-prefix contract settles its
  `@playform/ets-hook-dsh-package-pinner` identity.

## 0.0.1

### Added

- The initial release of @playform/ets-hook-dsh-package-pinner: the silent package.json version
  pinner: hooking fs/observed and deterministically rewriting every ranged dependency version to its
  static version (the Effect-TS release of the DeepSeek Harness Plugin Family).

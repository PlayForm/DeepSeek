# Changelog

All notable changes to this package will be documented in this file.

## 0.2.0

### Changed

- The D4-D8 release pass (the pack and trace libraries ship across both trees): the base's source,
  its scheme and its bundle patch move with it.
- The role-prefix contract applied to the base's identity strings and manifest.
- The `@deepseek-ai/dsh-fs`, `@deepseek-ai/dsh-sandbox` and `@deepseek-ai/dsh-subprocess`
  devDependencies bumped to the 0.2.1-rc.2 line (Dependabot).
- Line endings normalized and the LICENSE text wrapped.
- The repository-wide markdown clean-up, the prettier reflow across `Source`, `SCHEME.md`,
  `README.md` and `Target`, and the README role / surfaces / ledger pass.

## 0.1.0

### Changed

- The 0.1.0 family release: the package ships at 0.1.0 with the 31-package family, every
  `@playform/` sibling pin reads 0.1.0, and the role-prefix contract settles its
  `@playform/ets-base-dsh` identity.

## 0.0.1

### Added

- The initial release of @playform/ets-base-dsh: the base of the ets-* group - the shared Effect-TS
  plumbing every `@playform/ets-*` package depends on: the runtime wiring (the Context services, the
  layer graph and the `materialize()` runtime assembled for the factory shell), the fiber/stream
  machinery (the Gate transformer and the pure reducers, the Update envelope) and the hook contract
  types (the factory's `Interface/*` structural contracts) - the Effect-TS release of the DeepSeek
  Harness Plugin Family (the base extraction per Documentation/Plans/SPLICE-ETS.md §2.3).

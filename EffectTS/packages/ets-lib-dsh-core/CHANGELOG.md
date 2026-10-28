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

- The role-prefix rename: the package reads `@playform/ets-lib-dsh-core` (the previous name stays in
  git history), and its manifest, README and source identifiers follow.
- The repository-wide markdown clean-up standardized the README, CONTRIBUTING, CODE_OF_CONDUCT and
  CHANGELOG.
- The README restructured onto the role / surfaces / ledger template.

## 0.1.0

### Changed

- The 0.1.0 family release: the package ships at 0.1.0 with the 31-package family and every
  `@playform/` sibling pin at 0.1.0, under the role-prefix contract.

## 0.0.1

### Added

- The initial release of @playform/ets-lib-dsh-core: the pure, effect-backed, harness-free
  commonalities of the families: the governance mechanics (the dependency-section list, the
  exclusion-segment list, the suppression-line composer, the update-policy loader, the refusal guard
  and the update engine) and the stream-normalization machinery (the Effect-TS release of the
  DeepSeek Harness Plugin Family).

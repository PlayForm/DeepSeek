# Changelog

All notable changes to this package will be documented in this file.

## 0.2.0

### Changed

- The role-prefix rename: the package reads `@playform/lib-dsh-core` (the previous name stays in git
  history), and its manifest, README and source identifiers follow.
- The D4-D8 pass adds the `Expand` overpass function (`Source/Function/Expand.ts`) with its own test
  folder, alongside the pack and trace libraries shipping across both trees.
- The repository-wide markdown clean-up standardised the README, CONTRIBUTING, CODE_OF_CONDUCT and
  CHANGELOG.
- The README restructured onto the role / surfaces / ledger template.

## 0.1.0

### Changed

- The 0.1.0 family release: the package ships at 0.1.0 with the 31-package family and every
  `@playform/` sibling pin at 0.1.0, under the role-prefix contract.

## 0.0.1

### Added

- The initial release of @playform/lib-dsh-core: the pure, dependency-free, harness-free
  commonalities of the families: the governance mechanics (the dependency-section list, the
  exclusion-segment list, the suppression-line composer, the update-policy loader, the refusal guard
  and the update engine) and the stream-normalization machinery (the Classic release of the DeepSeek
  Harness Plugin Family).

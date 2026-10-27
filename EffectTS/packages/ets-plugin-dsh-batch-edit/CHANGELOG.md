# Changelog

All notable changes to this package will be documented in this file.

## 0.3.0

### Changed

- The 0.3.0 release line: the manifest version, the `@playform/` sibling pins and the host
  devDependencies move together - the host line to `0.2.1-rc.4` and zod to 4.6.7.
- The activation version constant moves to 0.3.0, with the byte-identical ledger assertions moved in
  the same change.

## 0.2.0

### Added

- The batch-edit tool for the Effect-TS tree: the machine contract, the transition table and the
  atomic gate, with the configuration, the tests and the documentation.

### Changed

- The D4-D8 release pass (the pack and trace libraries ship across both trees) refines the tool's
  source, its scheme and its bundle patch.
- The documentation passes: the repository-wide markdown clean-up, the prettier reflow, the README
  restructured onto the role / surfaces / ledger template, and the README paragraphs split.

### Fixed

- The inject list gains `fs`, so the tool's file operations resolve instead of failing on the
  missing service.

## 0.1.0

### Changed

- No package-local history: the package does not exist in the 0.1.0 release and lands afterwards
  with the 2026-10-22 PoC delivery.

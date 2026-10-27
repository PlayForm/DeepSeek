# Changelog

All notable changes to this package will be documented in this file.

## 0.3.0

### Changed

- The 0.3.0 release line: the manifest version, the `@playform/` sibling pins and the host
  devDependencies move together - the host line to `0.2.1-rc.4` and zod to 4.6.7.
- The storage-domain table cast: the zod 4.6.7 schemas are cast to the host library's `domainTable`
  parameter type, because `@deepseek-ai/dsh-storage-domain` types its tables against its own zod
  4.4.3 and the inference otherwise fails with TS2589.

## 0.2.0

### Added

- The batch-state plugin for the Effect-TS tree: the live batch state and its tools, with the
  implementation and the tests.

### Changed

- The D4-D8 release pass (the pack and trace libraries ship across both trees) refines the plugin's
  source, its scheme and its bundle patch.
- The documentation passes: the repository-wide markdown clean-up, the prettier reflow, and the
  README restructured onto the role / surfaces / ledger template with the static market index
  committed alongside.

## 0.1.0

### Changed

- No package-local history: the package does not exist in the 0.1.0 release and lands afterwards
  with the 2026-10-22 PoC delivery.

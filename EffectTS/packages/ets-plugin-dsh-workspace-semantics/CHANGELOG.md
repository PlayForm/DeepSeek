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
- The storage-domain table cast: the zod 4.6.7 schemas are cast to the host library's `domainTable`
  parameter type, because `@deepseek-ai/dsh-storage-domain` types its tables against its own zod
  4.4.3 and the inference otherwise fails with TS2589.

## 0.2.0

### Added

- The workspace-semantics service plugin for the Effect-TS tree: the semantic layer over the
  workspace, with its build, its tests and its bundle patch.

### Changed

- The D4-D8 release pass (the pack and trace libraries ship across both trees) refines the plugin's
  source, its scheme and its bundle patch.
- The documentation passes: the repository-wide markdown clean-up, the prettier reflow, the README
  restructured onto the role / surfaces / ledger template, and the README paragraphs split.

### Fixed

- The workspace index root defaults to the session working directory, and the find contract is
  corrected.

## 0.1.0

### Changed

- No package-local history: the package does not exist in the 0.1.0 release and lands afterwards
  with the 2026-10-22 PoC delivery.

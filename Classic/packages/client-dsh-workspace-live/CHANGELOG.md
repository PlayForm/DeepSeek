# Changelog

This file documents all notable changes to this package.

## 0.2.1

### Changed

- The release line is renumbered to `0.2.1`, one patch above the `0.2.0` published on npm, so the
  whole family shares a single version again.
- The build-time version constant (`process.env.VERSION_PACKAGE`) compiles in `0.2.1`.

## 0.3.0

### Changed

- The 0.3.0 release line moves the manifest version, the `@playform/` sibling pins, and the host
  devDependencies together - the host line to `0.2.1-rc.4` and zod to 4.6.7.

## 0.2.0

### Added

- This release adds the live workspace client plugin, with its build configuration, its
  documentation, and its test suite.

### Changed

- The client bundle is now generated and the package exports are updated.
- The client tab rendering is adjusted and the TypeScript imports are normalized by the
  workflow/client/types pass.
- The D4-D8 release pass refines the source of the package, its scheme, and its bundle patch, and
  the pack and trace libraries ship across both trees.
- The documentation passes clean up the markdown across the repository, restructure the README onto
  the role / surfaces / ledger template, and commit the static market index alongside.

## 0.1.0

### Changed

- This package has no local history, because it does not exist in the 0.1.0 release and it lands
  afterwards with the 2026-10-22 PoC delivery.

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
- The activation version constant moves to 0.3.0.

## 0.2.0

### Added

- The search-intent suggester adds the intent classification and projection surfaces with their
  build, tests, and documentation.

### Changed

- The internal imports migrate to the `@Interface` alias.
- The D4-D8 release pass (the pack and trace libraries ship across both trees) refines the hook's
  source, its scheme, and its bundle patch.
- The documentation passes include the repository-wide markdown clean-up, the README restructure
  onto the role / surfaces / ledger template, and the static market index committed alongside.

## 0.1.0

### Changed

- No package-local history exists, because the package does not exist in the 0.1.0 release and lands
  afterwards with the 2026-10-22 PoC delivery.

# Changelog

All notable changes to this package will be documented in this file.

## 0.3.0

### Changed

- The 0.3.0 release line: the manifest version, the `@playform/` sibling pins and the host
  devDependencies move together - the host line to `0.2.1-rc.4` and zod to 4.6.7.
- The activation version constant moves to 0.3.0.

## 0.2.0

### Changed

- The activation version constant moves to 0.2.0 (`const Version` in `Source/Function/Apply.ts`),
  with the byte-identical ledger assertions (`Source/Test/Config-And-Activation/Test.ts`), the suite
  README and the package README/SCHEME strings updated in the same change.
- The D4-D8 release pass (the pack and trace libraries ship across both trees) refines the hook's
  store, its config variables, its scheme and its bundle patch.
- The role-prefix contract applied to the hook's ledger strings and manifest.
- The documentation passes: the repository-wide markdown clean-up, the README restructured onto the
  role / surfaces / ledger template, and the README paragraphs split to the house wrapping.

## 0.1.0

### Changed

- The 0.1.0 family release: the package ships at 0.1.0 with the 31-package family, every
  `@playform/` sibling pin reads 0.1.0, and the role-prefix contract settles its
  `@playform/hook-dsh-ccr` identity.

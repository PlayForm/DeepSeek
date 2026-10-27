# Changelog

This file records all notable changes to this package.

## 0.3.0

### Changed

- The 0.3.0 release line moves the manifest version, the `@playform/` sibling pins, and the host
  devDependencies together to the `0.2.1-rc.4` host line and zod 4.6.7.
- The activation version constant moves to 0.3.0.

## 0.2.0

### Changed

- The activation version constant moves to 0.2.0 (`const Version` in `Source/Function/Apply.ts`),
  and the byte-identical ledger assertions (`Source/Test/Wiring-And-Defaults/Test.ts` and
  `Source/Test/Passthrough-And-Guards/README.md`), the suite READMEs, and the package README/SCHEME
  strings change in the same pass.
- The D4-D8 release pass (the pack and trace libraries ship across both trees) refines the hook's
  source, its scheme, and its bundle patch.
- The role-prefix contract applies to the hook's ledger strings and manifest.
- The documentation passes include the repository-wide markdown clean-up, the README restructure
  onto the role / surfaces / ledger template, and the README paragraph split to the house wrapping.

## 0.1.0

### Changed

- The 0.1.0 family release ships this package at 0.1.0 with the 31-package family, every
  `@playform/` sibling pin reads 0.1.0, and the role-prefix contract settles its
  `@playform/hook-dsh-tool-coach` identity.

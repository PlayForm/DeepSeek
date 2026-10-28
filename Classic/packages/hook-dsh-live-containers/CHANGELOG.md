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
- The activation version constant moves to 0.3.0.
- The storage-domain table cast arrives, because the zod 4.6.7 schemas are cast to the `domainTable`
  parameter type of the host library: `@deepseek-ai/dsh-storage-domain` types its tables against its
  own zod 4.4.3, and the inference otherwise fails with TS2589.

## 0.2.0

### Changed

- The activation version constant moves to 0.2.0 (`const Version` in `Source/Function/Apply.ts`),
  and the byte-identical ledger assertions (`Source/Test/Wiring-And-Defaults/Test.ts`), the suite
  README, and the package README/SCHEME strings are updated in the same change.
- The D4-D8 release pass refines the source of the hook, its scheme, and its bundle patch, and the
  pack and trace libraries ship across both trees.
- The role-prefix contract is applied to the ledger strings and the manifest of the hook.
- The documentation passes clean up the markdown across the repository, restructure the README onto
  the role / surfaces / ledger template, and split the README paragraphs to the house wrapping.

## 0.1.0

### Changed

- This is the 0.1.0 family release: the package ships at 0.1.0 with the 31-package family, every
  `@playform/` sibling pin reads 0.1.0, and the role-prefix contract settles its
  `@playform/hook-dsh-live-containers` identity.

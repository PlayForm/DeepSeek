# Contributing Guidelines

Welcome to our community! This repository holds @playform/hook-dsh-normalize-file (0.0.1), one
of the release packages of the DeepSeek Harness Plugin Family: the file-content normalizer: the normalize family's normalize-file tool over files already on disk.
Contributions are welcome under the CC0 dedication in the LICENSE file.

## Before You Start

Please read and adhere to the Code of Conduct (CODE_OF_CONDUCT.md in this
repository; the same Contributor Covenant, version 2.1, is adopted at the
monorepo root). By participating in our community, you agree to abide by
these guidelines.

## Development

- The source lives in `Source/`; the build configuration in `Configuration/`
  (`ESBuild.ts`, `TypeScript.noemit.json`) and `tsconfig.json`.
- The build runs through the package's `prepublishOnly` script from the
  package directory and emits to `Target/` (regenerated per build).
- The dependencies restore with pnpm from the package directory
  (`pnpm install --ignore-scripts`).
- The family's smoke suites are the arbiter after every change: they run
  against the built `Target/` output and must stay green.
- The style is the family's: the ledger strings and the source comments are
  part of the contract; tabs for indentation; no personal paths in any
  release-facing file.

## Reporting Issues

Report issues, questions, and unacceptable behavior to the community leaders
at Community@PlayForm.Cloud.

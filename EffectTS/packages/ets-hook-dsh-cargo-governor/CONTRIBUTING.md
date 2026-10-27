# Contributing Guidelines

Welcome to our community! This repository holds @playform/ets-hook-dsh-cargo-governor (0.1.0), one
of the release packages of the DeepSeek Harness Plugin Family: the silent Cargo.toml governor, which
is the rust-sided flavor of the package.json governor that hooks fs/observed and deterministically
governs the dependencies of the rust manifest.

Contributions are welcome under the CC0 dedication in the LICENSE file.

## Before You Start

Please read and adhere to the Code of Conduct (CODE_OF_CONDUCT.md in this repository; the same
Contributor Covenant, version 2.1, is adopted at the monorepo root).

By participating in our community, you agree to abide by these guidelines.

## Development

- The source lives in `Source/`, and the build configuration lives in `Configuration/`
  (`ESBuild.ts`, `TypeScript.noemit.json`) and `tsconfig.json`.
- The build runs through the `prepublishOnly` script of the package from the package directory and
  emits to `Target/`, which is regenerated per build.
- The dependencies restore with pnpm from the package directory (`pnpm install --ignore-scripts`).
- The smoke suites of the family are the arbiter after every change: they run against the built
  `Target/` output and must stay green.
- The style is the family's: the ledger strings and the source comments are part of the contract,
  indentation uses tabs, and no release-facing file carries a personal path.

## Reporting Issues

Report issues, questions, and unacceptable behavior to the community leaders at
Community@PlayForm.Cloud.

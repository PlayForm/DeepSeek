# Contributing Guidelines

Welcome to our community!

This repository holds @playform/plugin-dsh-factory (0.1.0), one of the release packages of the
DeepSeek Harness Plugin Family: the factory service (ctx.pluginFactory).

The service carries the shared machinery of the governance and normalization families: the ledger,
the exclusions, the storage journal, the activation, and the 19-method tool surface.

Contributions are welcome under the CC0 dedication in the LICENSE file.

## Before You Start

Read and obey the Code of Conduct (CODE_OF_CONDUCT.md in this repository; the same Contributor
Covenant, version 2.1, is adopted at the monorepo root).

By taking part in our community, you agree to follow these guidelines.

## Development

- The source lives in `Source/`, and the build configuration lives in `Configuration/`
  (`ESBuild.ts`, `TypeScript.noemit.json`) and `tsconfig.json`.
- The build runs through the package's `prepublishOnly` script from the package directory and emits
  to `Target/`, which each build regenerates.
- The dependencies restore with pnpm from the package directory (`pnpm install --ignore-scripts`).
- The family's smoke suites are the arbiter after every change, and they run against the built
  `Target/` output and must stay green.
- The style is the family's: the ledger strings and the source comments are part of the contract,
  indentation uses tabs, and no release-facing file carries a personal path.

## Reporting Issues

Report issues, questions, and unacceptable behavior to the community leaders at
Community@PlayForm.Cloud.

# Contributing Guidelines

Welcome to our community!

This repository holds @playform/ets-hook-dsh-package-governor (0.1.0), one of the release packages
of the DeepSeek Harness Plugin Family: the silent package.json governor, which hooks fs/observed,
rewrites the chain-governed pins to the resolved ranges of the effective registry, and runs the
update stage.

The LICENSE file holds the CC0 dedication that covers contributions.

## Before You Start

Read and obey the Code of Conduct (CODE_OF_CONDUCT.md in this repository; the same Contributor
Covenant, version 2.1, is adopted at the monorepo root).

By taking part in our community, you agree to obey these guidelines.

## Development

- The source lives in `Source/`, and the build configuration lives in `Configuration/`
  (`ESBuild.ts`, `TypeScript.noemit.json`) and `tsconfig.json`.
- The build runs through the `prepublishOnly` script of the package from the package directory and
  writes to `Target/`, which each build regenerates.
- The dependencies restore with pnpm from the package directory (`pnpm install --ignore-scripts`).
- The smoke suites of the family are the arbiter after every change: they run against the built
  `Target/` output and must stay green.
- The style is the family's: the ledger strings and the source comments are part of the contract,
  with tabs for indentation and no personal paths in any release-facing file.

## Reporting Issues

Report issues, questions, and unacceptable behavior to the community leaders at
Community@PlayForm.Cloud.

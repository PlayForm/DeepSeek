# Contributing Guidelines

Welcome to our community! This repository holds @playform/hook-dsh-normalize-ellipsis (0.1.0), one
of the release packages of the DeepSeek Harness Plugin Family: the stream hook that normalizes the
horizontal ellipsis in model output. Contributions are welcome under the CC0 dedication in the
LICENSE file.

## Before You Start

Please read the Code of Conduct and follow it (CODE_OF_CONDUCT.md in this repository; the same
Contributor Covenant, version 2.1, is adopted at the monorepo root). When you take part in our
community, you agree to obey these guidelines.

## Development

- The source code lives in `Source/`, and the build configuration lives in `Configuration/`
  (`ESBuild.ts`, `TypeScript.noemit.json`) and `tsconfig.json`.
- The build runs through the `prepublishOnly` script of the package from the package directory, and
  it emits to `Target/` (regenerated on each build).
- The dependencies restore with pnpm from the package directory (`pnpm install --ignore-scripts`).
- The smoke suites of the family are the arbiter after each change: they run against the built
  `Target/` output and must stay green.
- The style is the style of the family: the ledger strings and the source comments are part of the
  contract; tabs for indentation; and no personal paths in any release-facing file.

## Reporting Issues

Send issues, questions, and reports of unacceptable behavior to the community leaders at
Community@PlayForm.Cloud.

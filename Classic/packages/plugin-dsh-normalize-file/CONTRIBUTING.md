# Contributing Guidelines

Welcome to the community of this repository, which holds @playform/plugin-dsh-normalize-file
(0.1.0), one of the release packages of the DeepSeek Harness Plugin Family: the file-content
normalizer, which is the normalize-file tool of the normalize family over files already on disk.

Contributions are welcome under the CC0 dedication in the LICENSE file.

## Before You Start

Read and adhere to the Code of Conduct in CODE_OF_CONDUCT.md in this repository, where the same
Contributor Covenant, version 2.1, is adopted at the monorepo root.

By participating in this community, you agree to abide by these guidelines.

## Development

- The source lives in `Source/`, and the build configuration lives in `Configuration/` with
  `ESBuild.ts` and `TypeScript.noemit.json`, plus `tsconfig.json`.
- The build runs through the `prepublishOnly` script of the package from the package directory and
  emits to `Target/`, which is regenerated per build.
- The dependencies restore with pnpm from the package directory through
  `pnpm install --ignore-scripts`.
- The smoke suites of the family are the arbiter after every change, because they run against the
  built `Target/` output and must stay green.
- The style is the style of the family: the ledger strings and the source comments are part of the
  contract, indentation uses tabs, and no personal path appears in any release-facing file.

## Reporting Issues

Report issues, questions, and unacceptable behavior to the community leaders at
Community@PlayForm.Cloud.

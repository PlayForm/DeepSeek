---
title: Diagram - the DSH plugin family, drawn package by package
category: Diagram
kind: reference
date: 2026-10-21
status: active
---

# The DSH plugin family in diagrams

This folder is the reference for all **31 packages** of the DeepSeek Harness plugin family,
generated **2026-10-21**. Six folders group the packages by function, and each folder has one
Mermaid flowchart per package, a group overview, and a rendered `.svg` sibling for every `.mmd`, so
the library reads without the Line9 CLI. Four integration diagrams and a root map complete the set.

The family is published at **0.1.0** in two trees: **Classic** (plain TypeScript, 15 packages) and
**EffectTS** (Effect 4.0.5, 16 packages). The host bundles (`dsh-base`, `dsh-web-app`, the
experimental bundles) appear as "the DSH host", with no per-package folder.

## The family in one page

**Two trees, one contract.** Classic is `lib-dsh-core`, `plugin-dsh-factory`, and thirteen
`hook-dsh-*` / `plugin-dsh-*` bundles; EffectTS is `ets-base-dsh`, `ets-lib-dsh-core`,
`ets-plugin-dsh-factory`, and thirteen `ets-*` bundles. Both implement the same loader contract,
event surfaces, config keys, and ledger strings.

**The loader contract** is four fields on the default export: `name` (the identity, in agreement
with the package name), `apply` (returns nothing, because a returned value silently kills event
delivery), `Config` (a Schemastery schema, validated at load and failing loud), and `inject` (the
services that the plugin needs, which also orders the loads, because the loader holds a consumer
PENDING until its services exist).

**`ctx.pluginFactory`** is the one service of the family: nineteen methods that cover the ledger,
the exclusion match, discovery, the union keep-list, the gate set, the write executor, the
`fs/observed` re-emit, the continuation, the state builder, the wiring, the lifecycle effects, the
journal, the schema factory, the seam, the inflight key, and the direct-govern registry and entry.
The factory owns the shared mechanism, and each module owns its leaves and its ledger strings.

**The ledger-string law.** The smoke suites assert every activation line, refusal line, chain-pass
line, and journal record byte-identically, in both trees. One ledger per plugin at
`~/.dsh/<identity>.log`, and the activation line answers "did it activate".

**14 Classic bundles are active in this desktop profile, and the 16 ETS packages are a parallel
release that is not active there.** `lib-dsh-core` is a library and not a bundle. The ETS tree is
published, built, and smoke-tested, and it does not run in this profile.

## The map

| Folder                                                     | Capability                                                                                                        |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| [01-foundation](01-foundation/README.md)                   | the service and libraries every plugin is built on: ledger, gate, write executor, state, wiring, stream machinery |
| [02-governance](02-governance/README.md)                   | hands-off dependency hygiene: `package.json` and `Cargo.toml` canonicalized, pinned, optionally updated, silently |
| [03-normalize](03-normalize/README.md)                     | the model's typography tamed live: six character families in the stream, and on disk                              |
| [04-guardians](04-guardians/README.md)                     | the context budget defended: tool output compressed and retrievable, terminal misuse coached                      |
| [05-live-context](05-live-context/README.md)               | the system prompt kept current: labeled stanzas recomputed at request time                                        |
| [06-harness-integration](06-harness-integration/README.md) | how the family attaches to the host: loader, five surfaces, write path, stream path                               |

## The 31 packages

| #   | Package                                      | Tree     | Group           | Role       | Diagram                                             |
| --- | -------------------------------------------- | -------- | --------------- | ---------- | --------------------------------------------------- |
| 1   | `@playform/lib-dsh-core`                     | Classic  | 01-foundation   | library    | [mmd](01-foundation/Classic/lib-core.mmd)           |
| 2   | `@playform/plugin-dsh-factory`               | Classic  | 01-foundation   | service    | [mmd](01-foundation/Classic/factory.mmd)            |
| 3   | `@playform/ets-base-dsh`                     | EffectTS | 01-foundation   | library    | [mmd](01-foundation/EffectTS/base.mmd)              |
| 4   | `@playform/ets-lib-dsh-core`                 | EffectTS | 01-foundation   | library    | [mmd](01-foundation/EffectTS/lib-core.mmd)          |
| 5   | `@playform/ets-plugin-dsh-factory`           | EffectTS | 01-foundation   | service    | [mmd](01-foundation/EffectTS/factory.mmd)           |
| 6   | `@playform/hook-dsh-package-governor`        | Classic  | 02-governance   | governor   | [mmd](02-governance/Classic/package-governor.mmd)   |
| 7   | `@playform/hook-dsh-package-pinner`          | Classic  | 02-governance   | pinner     | [mmd](02-governance/Classic/package-pinner.mmd)     |
| 8   | `@playform/hook-dsh-cargo-governor`          | Classic  | 02-governance   | cargo      | [mmd](02-governance/Classic/cargo-governor.mmd)     |
| 9   | `@playform/ets-hook-dsh-package-governor`    | EffectTS | 02-governance   | twin       | [mmd](02-governance/EffectTS/package-governor.mmd)  |
| 10  | `@playform/ets-hook-dsh-package-pinner`      | EffectTS | 02-governance   | twin       | [mmd](02-governance/EffectTS/package-pinner.mmd)    |
| 11  | `@playform/ets-hook-dsh-cargo-governor`      | EffectTS | 02-governance   | twin       | [mmd](02-governance/EffectTS/cargo-governor.mmd)    |
| 12  | `@playform/hook-dsh-normalize-dash`          | Classic  | 03-normalize    | dash       | [mmd](03-normalize/Classic/dash.mmd)                |
| 13  | `@playform/hook-dsh-normalize-quotes`        | Classic  | 03-normalize    | quotes     | [mmd](03-normalize/Classic/quotes.mmd)              |
| 14  | `@playform/hook-dsh-normalize-ellipsis`      | Classic  | 03-normalize    | ellipsis   | [mmd](03-normalize/Classic/ellipsis.mmd)            |
| 15  | `@playform/hook-dsh-normalize-spaces`        | Classic  | 03-normalize    | spaces     | [mmd](03-normalize/Classic/spaces.mmd)              |
| 16  | `@playform/hook-dsh-normalize-invisible`     | Classic  | 03-normalize    | invisible  | [mmd](03-normalize/Classic/invisible.mmd)           |
| 17  | `@playform/hook-dsh-normalize-fullwidth`     | Classic  | 03-normalize    | fullwidth  | [mmd](03-normalize/Classic/fullwidth.mmd)           |
| 18  | `@playform/plugin-dsh-normalize-file`        | Classic  | 03-normalize    | file tool  | [mmd](03-normalize/Classic/normalize-file.mmd)      |
| 19  | `@playform/ets-hook-dsh-normalize-dash`      | EffectTS | 03-normalize    | twin       | [mmd](03-normalize/EffectTS/dash.mmd)               |
| 20  | `@playform/ets-hook-dsh-normalize-quotes`    | EffectTS | 03-normalize    | twin       | [mmd](03-normalize/EffectTS/quotes.mmd)             |
| 21  | `@playform/ets-hook-dsh-normalize-ellipsis`  | EffectTS | 03-normalize    | twin       | [mmd](03-normalize/EffectTS/ellipsis.mmd)           |
| 22  | `@playform/ets-hook-dsh-normalize-spaces`    | EffectTS | 03-normalize    | twin       | [mmd](03-normalize/EffectTS/spaces.mmd)             |
| 23  | `@playform/ets-hook-dsh-normalize-invisible` | EffectTS | 03-normalize    | twin       | [mmd](03-normalize/EffectTS/invisible.mmd)          |
| 24  | `@playform/ets-hook-dsh-normalize-fullwidth` | EffectTS | 03-normalize    | twin       | [mmd](03-normalize/EffectTS/fullwidth.mmd)          |
| 25  | `@playform/ets-plugin-dsh-normalize-file`    | EffectTS | 03-normalize    | file tool  | [mmd](03-normalize/EffectTS/normalize-file.mmd)     |
| 26  | `@playform/hook-dsh-ccr`                     | Classic  | 04-guardians    | ccr        | [mmd](04-guardians/Classic/ccr.mmd)                 |
| 27  | `@playform/hook-dsh-tool-coach`              | Classic  | 04-guardians    | tool-coach | [mmd](04-guardians/Classic/tool-coach.mmd)          |
| 28  | `@playform/ets-hook-dsh-ccr`                 | EffectTS | 04-guardians    | twin       | [mmd](04-guardians/EffectTS/ccr.mmd)                |
| 29  | `@playform/ets-hook-dsh-tool-coach`          | EffectTS | 04-guardians    | twin       | [mmd](04-guardians/EffectTS/tool-coach.mmd)         |
| 30  | `@playform/hook-dsh-live-containers`         | Classic  | 05-live-context | live       | [mmd](05-live-context/Classic/live-containers.mmd)  |
| 31  | `@playform/ets-hook-dsh-live-containers`     | EffectTS | 05-live-context | twin       | [mmd](05-live-context/EffectTS/live-containers.mmd) |

## The five surfaces

| Surface                                     | Mode      | Which groups attach                                                                                    |
| ------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------ |
| `llm/stream`                                | waterfall | 03-normalize - six flavors rewrite their character family.                                             |
| `fs/observed`                               | event     | 02-governance - the trio gates on basename; 01-foundation - `Wire` registers, `Write` emits.           |
| `tools/pre-execute` + `tools/post-execute`  | waterfall | 04-guardians - CCR compresses, tool-coach counts and denies; 03-normalize - optional tool-results arm. |
| `system-prompt/assemble` + `agent/pre-step` | waterfall | 04-guardians - discipline section, per-agent reset; 05-live-context - recomputed stanzas and counters. |
| loader / service surface                    | registers | 01-foundation - `ctx.pluginFactory`; every `apply` registers listeners, tools and its activation line. |

## How to read this library

Read `01-foundation` first, because it explains the ledger, the gate, the write executor, and the
state builder that every other folder assumes. Then read `02-governance` (write path),
`03-normalize` (stream path), `04-guardians` (tool pipeline), `05-live-context` (prompt), and
`06-harness-integration` (the seams).

## Rendering

`line9 render <file>` opens the viewer, and `line9 render <file> --out <file>.svg` renders headless.
The rendered `.svg` siblings let the library browse without the CLI, and the `.mmd` source wins when
they disagree. The sources are ASCII-only and 2-space indented, with `title:` and
`line9.theme: boardroom` frontmatter.

## Sources and accuracy

The authoritative registry is
[Documentation/Plugins/PLUGIN-FAMILY.md](../Documentation/Plugins/PLUGIN-FAMILY.md). Every claim
traces to a package `README.md`, `SCHEME.md`, `cordis.patch.yml`, or `Source/` file, or to that
registry. Where a package document and its source tree disagree, the source tree wins, and the known
cases are the `effect` version (the manifests pin `4.0.5`, and some prose says `4.0.2`) and the ETS
lib-core export list (thirteen names in source and four stale ones in its README). The planned
orchestration plugins are not implemented and are out of scope.

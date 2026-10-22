# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

### Changed

- The package renames under the role-prefix contract (2026-10-21): the core library is now
  `@playform/lib-dsh-core` (`ets-lib-dsh-core` in the Effect-TS tree), the file-content tool is now
  `@playform/plugin-dsh-normalize-file` (`ets-plugin-dsh-normalize-file`), and the planned UI
  packages read `@playform/client-dsh-panel-family` and `@playform/client-dsh-panel-family-host`.
  The `lib-` kind is decided: `plugin-` for the service and tool plugins, `hook-` for the event
  listeners, `client-` for the UI halves, `lib-` for the shared libraries.
- The ledger-string identity: every ledger line, log path and activation line that carries a renamed
  package's identity now carries the new name (`~/.dsh/plugin-dsh-normalize-file.log`, the
  `plugin-dsh-normalize-file:` prefix, and the `lib-dsh-core` package identity in the governance and
  normalize samples). The strings stay byte-identical between the package READMEs, the smoke
  batteries and the site samples - only the name inside them changed.
- The site: the two plugin detail pages move to `/plugins/lib-dsh-core/` and
  `/plugins/plugin-dsh-normalize-file/`, with every nav entry, install command, diagram label and
  repository link following the rename.
- The docs: the @-sentence identity reads `Lib @ DSH @ Core` and `Plugin @ DSH @ Normalize @ File`;
  the original names remain in git history.

## 0.1.0

### Changed

- The family version: all 31 packages (15 Classic, 16 Effect-TS) ship at 0.1.0, and every internal
  sibling pin moves with them.
- The ledger defaults: the cargo governor, the package governor, the pinner and the ccr hook write
  the documented `~/.dsh/<identity>.log` paths; the ccr default replaces the absolute
  `/Users/nikola/...` form.
- The default-path assertions: the ccr suite (24 to 25 PASS) and the governor suite (3 to 4 PASS)
  pin the documented ledger defaults, so the schema default, the patch row and the README cannot
  drift apart.
- The overpass move: the shared overpass scaffolding (the text-block rewrite, the two arm factories
  and the `normalize-overpass` handler) lives in the Classic core and the EffectTS base; each flavor
  keeps its transform, its ledger strings and its listener signature.
- The Effect-TS cleanup: the four unused direct `effect` dependencies (ccr, tool-coach,
  live-containers, core) are removed; the `ets-*` packages ride on `@playform/ets-base-dsh`, and the
  core's stream-gate claim is corrected.
- The site corrections: the site reads the release version from the manifests, the fallbacks agree
  at 0.1.0, and the install and ledger samples carry the new version.

## 0.0.1

### Added

- The initial release of the DeepSeek Harness Plugin Family for PlayForm: the twelve packages in the
  three implementations (the Boilerplate reference, the Classic release, the Effect-TS release), the
  Site, and the archived fixtures.
- The governance trio (governor, pinner, cargo) with the direct-govern fold and the fine-grained
  raw-write flags.
- The stream-normalization family (dash, quotes, ellipsis, spaces, invisible, fullwidth) with the
  three-way tool-args gate and the raw-marker opt-out.
- The file-content normalizer (normalize-file) and the raw-write tool with the normalize/govern
  selections.
- The shared factory machinery (the write executor, the govern fold, the P5 storage journal, the
  activation composer).
- The site (the static landing with the products, versions, flavors, models, setup, case study, and
  workbench pages).
- The skills (instructional-writing, plugin-system, smoke-writing) and the documentation tree.

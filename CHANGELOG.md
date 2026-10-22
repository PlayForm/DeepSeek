# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

### Added

- The 2026-10-22 PoC delivery: 36 new Classic packages and 30 new EffectTS twins, all at 0.1.0 and
  unpublished (the npm bootstrap tiers: 2-planned / 3-candidates):
    - the workspace family (15 + the `lib-dsh-workspace-live` library): `plugin-dsh-workspace`,
      `hook-dsh-workspace-{observe,operate,govern,approve,merge,journal,audit,monitor}`,
      `plugin-dsh-workspace-{semantics,authority,context,evidence,graph,reflect}`;
    - the client family: `client-dsh-panel-family`, `client-dsh-panel-family-host`,
      `client-dsh-workspace-live`;
    - the suggesters: `hook-dsh-{search,edit,doc,convention,graph,replay,test}-suggester`;
    - the orchestration set: `plugin-dsh-batch-edit`, `plugin-dsh-batchstate`,
      `plugin-dsh-gitguard`, `plugin-dsh-route`, `plugin-dsh-queue`, `plugin-dsh-feedback`,
      `plugin-dsh-pass-on`, `plugin-dsh-ingester`, `plugin-dsh-pattern`, and
      `hook-dsh-batch-decision`.
- The delivery's documentation: `Documentation/Plugins/PLUGIN-SUITE-SUMMARY.md` (the one-file suite
  summary), `Documentation/Reports/POC-GAP-ANALYSIS.md` (the PoC-vs-plan grades),
  `Documentation/Testing/` (the README plus 35 per-plugin live test plans),
  `Documentation/Plans/POC-BRIEF.md`, `POC-LEDGER.md`, `ETS-TWINS-BRIEF.md`, `SMOKE-PASS-BRIEF.md`,
  and `Documentation/Plans/Workspace-Family/WAVE-1-BRIEF.md`.
- The verification: 97/97 package builds green; the aggregate `node Maintain/Run-Smokes.mjs` = 359
  smoke suites / 5,337 checks, all green; the live desktop profile has 54 bundles enabled.
- The live dogfood's first catch: `plugin-dsh-batch-edit`'s inject list was missing `"fs"` (fixed);
  the empty-graph gap (no indexing trigger) is documented and open.

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

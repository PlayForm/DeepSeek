# Changelog

This file records all notable changes to this project.

## Unreleased

### Known issues

- The empty-graph gap: the workspace family has no indexing trigger yet, so a fresh workspace graph
  stays empty until a call to `workspace_index` (documented and open).

## 0.3.0 - 2026-10-27

### Changed

- The 105-package family takes one minor version step: every manifest, every `@playform/` sibling
  pin, and the activation version constant (`const Version`) now read 0.3.0.
- The host devDependencies now use the `0.2.1-rc.4` line and zod 4.6.7, because the `ncu` pass over
  the workspace takes the host packages from their `next` tag while their npm `latest` tag stays
  stale at 0.0.1-rc.1.
- Every package `CHANGELOG.md` gets its 0.3.0 section.

### Fixed

- The 27 packages that failed with TS2589
  (`Type instantiation is excessively deep and possibly infinite`) after the zod 4.6.7 bump now
  pass, because `@deepseek-ai/dsh-storage-domain` types `domainTable` against its own zod 4.4.3, so
  the 54 zod 4.6.7 table schemas take a cast to the parameter type of that library.

## 0.2.0 - 2026-10-25

### Added

- The 102-package family at 0.2.0 holds 54 Classic packages and 48 Effect-TS packages, with every
  `@playform/` sibling pin at 0.2.0 and every package holding its own `CHANGELOG.md` with a 0.2.0
  section and a 0.1.0 backfill.
- The 2026-10-22 PoC delivery adds 36 Classic packages and 30 EffectTS twins, all at 0.1.0 and
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
- The documentation of the delivery covers `Documentation/Plugins/PLUGIN-SUITE-SUMMARY.md` (the
  one-file suite summary), `Documentation/Reports/POC-GAP-ANALYSIS.md` (the PoC-vs-plan grades),
  `Documentation/Testing/` (the README plus 35 per-plugin live test plans),
  `Documentation/Plans/POC-BRIEF.md`, `POC-LEDGER.md`, `ETS-TWINS-BRIEF.md`, `SMOKE-PASS-BRIEF.md`,
  and `Documentation/Plans/Workspace-Family/WAVE-1-BRIEF.md`.
- The verification shows 97/97 package builds green, the aggregate `node Maintain/Run-Smokes.mjs` at
  359 smoke suites / 5,337 checks all green, and 54 bundles enabled in the live desktop profile.
- The first catch of the live dogfood was a missing `"fs"` entry in the inject list of
  `plugin-dsh-batch-edit` (fixed), and the empty-graph gap (no indexing trigger) stays documented
  and open.
- The derived publish scaffold comes from `Maintain/Generate-NPM-Placeholders.mjs`, which sorts the
  family names into `1-missing` / `2-placeholder` / `3-published` from the registry and writes the
  `0.0.0` empty-first-publish scaffold (the placeholder manifests, `MANIFEST.json`, the `README.md`
  and `Publish.sh`) under `Temporary/npm-bootstrap/`.

### Changed

- The registry state shows 0.1.0 as the published release of the family under the trusted publishers
  bound to `PlayForm/DeepSeek`, `NPM.yml`, and environment `Release`, with
  `@playform/client-dsh-panel-family` as the one name already published at 0.2.0 and every other
  0.2.0 in the tree unpublished at preparation.
- The publish route now runs `node Maintain/Publish-Packages.mjs` from `.github/workflows/NPM.yml`
  in place of a hard-coded package list, so the workflow derives the layer order from the workspace
  dependency graph (L0 -> L1 -> L2, cycles refused) and publishes each package whose version is not
  yet on the registry, while it skips the ones that are.
- The package renames under the role-prefix contract (2026-10-21) give the core library the name
  `@playform/lib-dsh-core` (`ets-lib-dsh-core` in the Effect-TS tree), the file-content tool the
  name `@playform/plugin-dsh-normalize-file` (`ets-plugin-dsh-normalize-file`), and the planned UI
  packages the names `@playform/client-dsh-panel-family` and
  `@playform/client-dsh-panel-family-host`.
- The `lib-` kind is now decided: `plugin-` for the service and tool plugins, `hook-` for the event
  listeners, `client-` for the UI halves, and `lib-` for the shared libraries.
- The ledger-string identity now carries the new name in every ledger line, log path, and activation
  line that holds the identity of a renamed package (`~/.dsh/plugin-dsh-normalize-file.log`, the
  `plugin-dsh-normalize-file:` prefix, and the `lib-dsh-core` package identity in the governance and
  normalize samples).
- The strings stay byte-identical between the package READMEs, the smoke batteries, and the site
  samples, and only the name inside them changed.
- The site moves the two plugin detail pages to `/plugins/lib-dsh-core/` and
  `/plugins/plugin-dsh-normalize-file/`, with every nav entry, install command, diagram label, and
  repository link following the rename.
- The docs show the @-sentence identity as `Lib @ DSH @ Core` and `Plugin @ DSH @ Normalize @ File`,
  and the original names stay in git history.

## 0.1.0

### Changed

- The family version puts all 31 packages (15 Classic, 16 Effect-TS) at 0.1.0, and every internal
  sibling pin moves with them.
- The ledger defaults make the cargo governor, the package governor, the pinner, and the ccr hook
  write the documented `~/.dsh/<identity>.log` paths, and the ccr default replaces the absolute
  `/Users/nikola/...` form.
- The default-path assertions pin the documented ledger defaults in the ccr suite (24 to 25 PASS)
  and the governor suite (3 to 4 PASS), so the schema default, the patch row, and the README cannot
  drift apart.
- The overpass move puts the shared overpass scaffolding (the text-block rewrite, the two arm
  factories, and the `normalize-overpass` handler) in the Classic core and the EffectTS base, while
  each flavor keeps its transform, its ledger strings, and its listener signature.
- The Effect-TS cleanup removes the four unused direct `effect` dependencies (ccr, tool-coach,
  live-containers, core), so the `ets-*` packages ride on `@playform/ets-base-dsh`, and the core's
  stream-gate claim is corrected.
- The site corrections make the site read the release version from the manifests, keep the fallbacks
  in agreement at 0.1.0, and put the new version in the install and ledger samples.

## 0.0.1

### Added

- The initial release of the DeepSeek Harness Plugin Family for PlayForm holds the twelve packages
  in the three implementations (the Boilerplate reference, the Classic release, the Effect-TS
  release), the Site, and the archived fixtures.
- The governance trio (governor, pinner, cargo) comes with the direct-govern fold and the
  fine-grained raw-write flags.
- The stream-normalization family (dash, quotes, ellipsis, spaces, invisible, fullwidth) comes with
  the three-way tool-args gate and the raw-marker opt-out.
- The file-content normalizer (normalize-file) and the raw-write tool come with the normalize/govern
  selections.
- The shared factory machinery holds the write executor, the govern fold, the P5 storage journal,
  and the activation composer.
- The site is a static landing with the products, versions, flavors, models, setup, case study, and
  workbench pages.
- The skills (instructional-writing, plugin-system, smoke-writing) and the documentation tree
  complete the release.

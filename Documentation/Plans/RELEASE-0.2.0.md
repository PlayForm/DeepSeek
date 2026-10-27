---
title: Release 0.2.0 - the whole-family release of the DSH plugin family
category: Plans
kind: one-shot-record
date: 2026-10-25
status: active
registry: Documentation/Plans/RELEASE-0.2.0.md
index: Documentation/INDEX.md
statuses:
    - name: the version bump across both trees (102 packages)
      state: implemented
      evidence:
          every manifest carries 0.2.0 and every sibling pin is 0.2.0; the two greps below return 0
          matches in the tracked manifests
    - name: the per-package changelogs (102 files)
      state: implemented
      evidence:
          ls Classic/packages/*/CHANGELOG.md EffectTS/packages/*/CHANGELOG.md | wc -l = 102; every
          file carries a 0.2.0 and a 0.1.0 section
    - name: the six activation version constants
      state: implemented
      evidence:
          const Version = "0.2.0" in the six Apply.ts files; the byte-identical assertions and the
          READMEs updated, rebuilt and green
    - name: the market index
      state: implemented
      evidence:
          node Maintain/Generate-Marketplace.mjs --check exits 0 (102 plugins, 123 npm versions, 101
          git versions)
    - name: the verification run (build + smokes + publish dry-run)
      state: implemented
      evidence: the evidence table in section 3a
    - name: the publish itself (npm + git)
      state: deferred
      evidence: the user's commands; nothing is published, committed, tagged, or pushed by this lane
---

# RELEASE 0.2.0 - the whole-family release

> The family moves from **0.1.0** to **0.2.0** across the Classic and Effect-TS trees: 102 packages,
> with 54 Classic and 48 Effect-TS. The publish, the commit, the tag, and the push are the calls of
> the USER. This document is the runbook and the evidence record, and it changes nothing in the
> registry.

## 0. The version and the rationale

**0.2.0** is the second feature release and the first one that ships the whole family.

- 0.1.0 is published and a published version is immutable, so the next release cannot reuse it.
- The family grew from 31 packages at 0.1.0 to 102 at this release, which is 71 new packages created
  after the 0.1.0 commit `d9f3585a` in the 2026-10-22 PoC delivery and its follow-ups.
- The changes since 0.1.0 are additive features (the workspace family, the seven suggesters, the
  client family, the orchestration set, and the `pack` and `trace` libraries) and corrections (the
  workspace index root and find contract and the batch-edit `fs` inject), and not a breaking
  rewrite.
- Pre-1.0 SemVer puts a feature release at the minor position, so 0.1.0 becomes 0.2.0.
- One exception applies: `@playform/client-dsh-panel-family` is already PUBLISHED at 0.2.0, and a
  published version cannot be republished, so the package keeps 0.2.0 and the family aligns on that
  number instead of bumping to 0.3.0. Its sibling pins move to 0.2.0 like every other manifest.
- The documented placeholder rule still holds, because the empty placeholder is 0.0.0 and every real
  release is above it. 0.2.0 satisfies that rule, and 0.0.0 and 0.1.0 stay on the registry as
  immutable historical releases.

## 1. The 102 packages

All 102 manifests carry `"version": "0.2.0"`, and every dependency entry whose key starts with
`@playform/` carries `"0.2.0"`.

The publish order is derived and not listed (section 2).

### Classic - 54 packages

| #   | Package                                    |
| --- | ------------------------------------------ |
| 1   | `@playform/client-dsh-panel-family`        |
| 2   | `@playform/client-dsh-panel-family-host`   |
| 3   | `@playform/client-dsh-workspace-live`      |
| 4   | `@playform/hook-dsh-batch-decision`        |
| 5   | `@playform/hook-dsh-cargo-governor`        |
| 6   | `@playform/hook-dsh-ccr`                   |
| 7   | `@playform/hook-dsh-comment-filter`        |
| 8   | `@playform/hook-dsh-convention-suggester`  |
| 9   | `@playform/hook-dsh-doc-suggester`         |
| 10  | `@playform/hook-dsh-edit-suggester`        |
| 11  | `@playform/hook-dsh-graph-suggester`       |
| 12  | `@playform/hook-dsh-live-containers`       |
| 13  | `@playform/hook-dsh-normalize-dash`        |
| 14  | `@playform/hook-dsh-normalize-ellipsis`    |
| 15  | `@playform/hook-dsh-normalize-fullwidth`   |
| 16  | `@playform/hook-dsh-normalize-invisible`   |
| 17  | `@playform/hook-dsh-normalize-quotes`      |
| 18  | `@playform/hook-dsh-normalize-spaces`      |
| 19  | `@playform/hook-dsh-package-governor`      |
| 20  | `@playform/hook-dsh-package-pinner`        |
| 21  | `@playform/hook-dsh-replay-suggester`      |
| 22  | `@playform/hook-dsh-search-suggester`      |
| 23  | `@playform/hook-dsh-test-suggester`        |
| 24  | `@playform/hook-dsh-tool-coach`            |
| 25  | `@playform/hook-dsh-workspace-approve`     |
| 26  | `@playform/hook-dsh-workspace-audit`       |
| 27  | `@playform/hook-dsh-workspace-govern`      |
| 28  | `@playform/hook-dsh-workspace-journal`     |
| 29  | `@playform/hook-dsh-workspace-merge`       |
| 30  | `@playform/hook-dsh-workspace-monitor`     |
| 31  | `@playform/hook-dsh-workspace-observe`     |
| 32  | `@playform/hook-dsh-workspace-operate`     |
| 33  | `@playform/lib-dsh-core`                   |
| 34  | `@playform/lib-dsh-pack`                   |
| 35  | `@playform/lib-dsh-trace`                  |
| 36  | `@playform/lib-dsh-workspace-live`         |
| 37  | `@playform/plugin-dsh-batch-edit`          |
| 38  | `@playform/plugin-dsh-batchstate`          |
| 39  | `@playform/plugin-dsh-factory`             |
| 40  | `@playform/plugin-dsh-feedback`            |
| 41  | `@playform/plugin-dsh-gitguard`            |
| 42  | `@playform/plugin-dsh-ingester`            |
| 43  | `@playform/plugin-dsh-normalize-file`      |
| 44  | `@playform/plugin-dsh-pass-on`             |
| 45  | `@playform/plugin-dsh-pattern`             |
| 46  | `@playform/plugin-dsh-queue`               |
| 47  | `@playform/plugin-dsh-route`               |
| 48  | `@playform/plugin-dsh-workspace`           |
| 49  | `@playform/plugin-dsh-workspace-authority` |
| 50  | `@playform/plugin-dsh-workspace-context`   |
| 51  | `@playform/plugin-dsh-workspace-evidence`  |
| 52  | `@playform/plugin-dsh-workspace-graph`     |
| 53  | `@playform/plugin-dsh-workspace-reflect`   |
| 54  | `@playform/plugin-dsh-workspace-semantics` |

### Effect-TS - 48 packages

| #   | Package                                        |
| --- | ---------------------------------------------- |
| 1   | `@playform/ets-base-dsh`                       |
| 2   | `@playform/ets-client-dsh-workspace-live`      |
| 3   | `@playform/ets-hook-dsh-cargo-governor`        |
| 4   | `@playform/ets-hook-dsh-ccr`                   |
| 5   | `@playform/ets-hook-dsh-convention-suggester`  |
| 6   | `@playform/ets-hook-dsh-doc-suggester`         |
| 7   | `@playform/ets-hook-dsh-edit-suggester`        |
| 8   | `@playform/ets-hook-dsh-graph-suggester`       |
| 9   | `@playform/ets-hook-dsh-live-containers`       |
| 10  | `@playform/ets-hook-dsh-normalize-dash`        |
| 11  | `@playform/ets-hook-dsh-normalize-ellipsis`    |
| 12  | `@playform/ets-hook-dsh-normalize-fullwidth`   |
| 13  | `@playform/ets-hook-dsh-normalize-invisible`   |
| 14  | `@playform/ets-hook-dsh-normalize-quotes`      |
| 15  | `@playform/ets-hook-dsh-normalize-spaces`      |
| 16  | `@playform/ets-hook-dsh-package-governor`      |
| 17  | `@playform/ets-hook-dsh-package-pinner`        |
| 18  | `@playform/ets-hook-dsh-replay-suggester`      |
| 19  | `@playform/ets-hook-dsh-search-suggester`      |
| 20  | `@playform/ets-hook-dsh-test-suggester`        |
| 21  | `@playform/ets-hook-dsh-tool-coach`            |
| 22  | `@playform/ets-hook-dsh-workspace-approve`     |
| 23  | `@playform/ets-hook-dsh-workspace-audit`       |
| 24  | `@playform/ets-hook-dsh-workspace-govern`      |
| 25  | `@playform/ets-hook-dsh-workspace-journal`     |
| 26  | `@playform/ets-hook-dsh-workspace-merge`       |
| 27  | `@playform/ets-hook-dsh-workspace-monitor`     |
| 28  | `@playform/ets-hook-dsh-workspace-observe`     |
| 29  | `@playform/ets-hook-dsh-workspace-operate`     |
| 30  | `@playform/ets-lib-dsh-core`                   |
| 31  | `@playform/ets-lib-dsh-pack`                   |
| 32  | `@playform/ets-lib-dsh-trace`                  |
| 33  | `@playform/ets-lib-dsh-workspace-live`         |
| 34  | `@playform/ets-plugin-dsh-batch-edit`          |
| 35  | `@playform/ets-plugin-dsh-batchstate`          |
| 36  | `@playform/ets-plugin-dsh-factory`             |
| 37  | `@playform/ets-plugin-dsh-feedback`            |
| 38  | `@playform/ets-plugin-dsh-gitguard`            |
| 39  | `@playform/ets-plugin-dsh-normalize-file`      |
| 40  | `@playform/ets-plugin-dsh-queue`               |
| 41  | `@playform/ets-plugin-dsh-route`               |
| 42  | `@playform/ets-plugin-dsh-workspace`           |
| 43  | `@playform/ets-plugin-dsh-workspace-authority` |
| 44  | `@playform/ets-plugin-dsh-workspace-context`   |
| 45  | `@playform/ets-plugin-dsh-workspace-evidence`  |
| 46  | `@playform/ets-plugin-dsh-workspace-graph`     |
| 47  | `@playform/ets-plugin-dsh-workspace-reflect`   |
| 48  | `@playform/ets-plugin-dsh-workspace-semantics` |

## 2. The publish route

### NPM.yml runs the dynamic publisher

`.github/workflows/NPM.yml` carries no hard-coded package list, because it checks out, installs,
runs `pnpm run build`, and then runs:

```bash
node Maintain/Publish-Packages.mjs
```

`Maintain/Publish-Packages.mjs` derives everything from the workspace:

- it reads every `Classic/packages/*/package.json` and `EffectTS/packages/*/package.json`;
- it builds the dependency depth from each manifest's `@playform/` dependencies and refuses a cycle;
- it publishes layer by layer with L0 first, so a package is never published before its siblings;
- it probes the registry per package and **skips** a version that is already published, **blocks** a
  package whose dependency failed, and publishes the rest with
  `npm publish --provenance --access public --ignore-scripts`.

The observed layer sizes at preparation in the dry run are L0 = 12, L1 = 3, and L2 = 87, for a total
of 102.

The workflow keeps `id-token: write`, the `Release` environment, and the `workflow_dispatch`,
`release`, and `workflow_call` triggers, and it is armed while running it is the step of the user.

### The placeholder scaffold is derived

`Maintain/Generate-NPM-Placeholders.mjs` classifies the 102 names against the registry into
`1-missing` (absent, which needs the 0.0.0 empty-first-publish), `2-placeholder` (a placeholder
only), and `3-published` (the repo version is on the registry), and it writes the scaffold under
`Temporary/npm-bootstrap/` with the placeholder manifests, `MANIFEST.json`, the `README.md`, and
`Publish.sh`.

The trusted-publisher binding needs the name to exist first, so the scaffold is the bootstrap step
and the publish order above is the real release step.

### The trusted-publisher state

Every package page binds the trusted publisher to `PlayForm/DeepSeek`, workflow `NPM.yml`, and
environment `Release` under `Documentation/Plans/TRUSTED-PUBLISHER.md`.

The `Release` environment must exist in the repository settings and `NPM.yml` must be on the default
branch.

## 3. The registry checks

Run after the publish, per package:

```bash
for n in $(node -e 'const fs=require("fs"),path=require("path");for(const t of ["Classic","EffectTS"])for(const d of fs.readdirSync(t+"/packages")){const p=t+"/packages/"+d+"/package.json";if(fs.existsSync(p))console.log(JSON.parse(fs.readFileSync(p,"utf8")).name)}'); do
	printf '%s -> ' "$n"
	npm view "$n@0.2.0" version 2> /dev/null || echo MISSING
done
```

Every line must print `0.2.0`.

Then check one provenance chain and the tags:

```bash
npm view @playform/hook-dsh-ccr@0.2.0 dist.attestations.provenance.predicateType
npm view @playform/hook-dsh-ccr dist-tags
npm view @playform/client-dsh-panel-family@0.2.0 version # already published before this release
```

The registry facts recorded at release preparation are these: `@playform/client-dsh-panel-family` is
the one name whose 0.2.0 is already on the registry, and the other 101 names have no 0.2.0 yet,
which the dry run shows as 101 `DRY` lines and 1 `SKIP`.

The 0.0.0 placeholders and the 0.1.0 release stay immutable.

## 3a. The verification evidence

| Gate                   | Command                                                                                           | Result                                                                                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Manifest version grep  | `grep -rn '"version": "0.1.0"' Classic/packages EffectTS/packages --include=package.json`         | 1 match - the gitignored pnpm artifact `EffectTS/packages/ets-lib-dsh-core/node_modules/@playform/.ignored_ets-base-dsh/package.json`; 0 matches in the 102 tracked manifests |
| Sibling-pin grep       | `grep -rn '"@playform/[^"]*": "0.1.0"' Classic/packages EffectTS/packages --include=package.json` | 0 matches                                                                                                                                                                     |
| Per-package changelogs | `ls Classic/packages/*/CHANGELOG.md EffectTS/packages/*/CHANGELOG.md \| wc -l`                    | 102                                                                                                                                                                           |
| Build, both trees      | `pnpm run build`                                                                                  | exit 0 (102 packages, workspace-concurrency 1)                                                                                                                                |
| Full aggregate         | `node Maintain/Run-Smokes.mjs`                                                                    | exit 0, `All 513 smoke suites passed`                                                                                                                                         |
| Market index           | `node Maintain/Generate-Marketplace.mjs --check`                                                  | exit 0, `marketplace.json is up to date`                                                                                                                                      |
| Publish plan           | `node Maintain/Publish-Packages.mjs --dry-run`                                                    | exit 0, 101 `DRY`, 1 `SKIP`, `0 published, 1 skipped, 0 blocked, 0 failed`                                                                                                    |
| Activation constants   | the six `Source/Function/Apply.ts`                                                                | `const Version = "0.2.0"`; the rebuilt `Target` carries `bundle 0.2.0`                                                                                                        |
| Activation assertions  | the six suites                                                                                    | ccr 25 PASS, live-containers 42 PASS, tool-coach 36 PASS, both trees                                                                                                          |

The build regenerates every `Target/` tree, so the compiled bundles carry the 0.2.0 activation line,
which is `const m="0.2.0"` in `Classic/packages/hook-dsh-ccr/Target/Function/Apply.js`.

## 4. The READY-TO-RELEASE checklist

- [x] 102 manifests at 0.2.0, zero 0.1.0 sibling pins.
- [x] The root `package.json` at 0.2.0; the Site `package.json` at 0.2.0.
- [x] `@playform/client-dsh-panel-family` keeps 0.2.0 (already published) and its pins move to
      0.2.0.
- [x] The six activation `const Version` constants at 0.2.0, with their byte-identical assertions
      (including the escaped regex forms) and their READMEs/SCHEMEs updated in the same change.
- [x] All 102 packages carry a `CHANGELOG.md` with a 0.2.0 section and a 0.1.0 section.
- [x] The root `CHANGELOG.md` carries `## 0.2.0 - 2026-10-25`, with the still-unreleased items moved
      into it.
- [x] `pnpm run build` exits 0.
- [x] `node Maintain/Run-Smokes.mjs` exits 0.
- [x] `node Maintain/Generate-Marketplace.mjs --check` exits 0.
- [x] `node Maintain/Publish-Packages.mjs --dry-run` prints 101 `DRY` and 1 `SKIP`.
- [ ] The git commit, the tag, and the push are the user's commands (section 5).
- [ ] The npm publish is the user's command; this lane never runs it.

## 5. The git commands (the user runs them)

```bash
# the root repository
git add -A
git commit -m "release: 0.2.0 across the 102-package family"
git tag -a v0.2.0 -m "DeepSeek Harness Plugin Family 0.2.0"
git push origin HEAD --follow-tags

# Site/ is its own repository
cd Site
git add -A
git commit -m "release: 0.2.0 market index"
git push origin HEAD
```

## 6. The residuals

- The active package governor refreshed a devDependency on every manifest that it wrote during the
  version bump: `tsc-alias` 1.9.8 to 1.9.9 in 67 manifests, `effect` 4.0.5 to 4.0.6 in 12 Effect-TS
  manifests, `@effect/opentelemetry` in one, and `@deepseek-ai/dsh-plugin-market-index` plus
  `prettier-plugin-packagejson` in the root manifest. The Site manifest got the same treatment with
  `astro` 7.4.1 to 7.4.2, `dotenv` 18.0.8 to 18.0.9, `firebase` 13.0.0 to 13.1.0, and `puppeteer`
  25.15.0 to 25.16.0. These updates are the designed update policy of the governor and not a manual
  edit, so revert the lines if the release should not carry the dependency refresh.
- The nested per-package `pnpm-lock.yaml` files (six Classic and six Effect-TS) still record the
  0.1.0 sibling tarballs. They are registry-resolved install artifacts and not the workspace graph,
  and they cannot resolve 0.2.0 until it is published. Regenerate them after the publish with
  `(cd <package> && pnpm install --lockfile-only)`.
- 23 further packages carry `const Version = "0.1.0"` in their `Source/Function/Apply.ts`, which
  covers the suggester set, the batch and orchestration set, and the workspace plugins. This release
  moves the six activation constants that the 0.1.0 runbook covers, and the other 23 announce 0.1.0
  in their own ledger lines until a later sweep.
- The 77 packages that had no `CHANGELOG.md` before this release get their first one, and their
  0.1.0 section records that they did not exist in that release.

## 7. The files changed

- **Manifests (102 changed, 103 in scope):** 101 of the 102 package manifests (all but
  `client-dsh-panel-family`, already at 0.2.0 with 0.2.0 pins) plus the root `package.json`, and
  `Site/package.json` in its separate repository at 0.2.0.
- **Activation code and assertions (32 files):** the six `Source/Function/Apply.ts` version
  constants; the ccr `Config-And-Activation` and the live-containers and tool-coach
  `Wiring-And-Defaults` suites plus the tool-coach `Passthrough-And-Guards` README; the six package
  `README.md` and `SCHEME.md` files.
- **Changelogs (103):** 77 new `Classic|EffectTS/packages/*/CHANGELOG.md`, 25 updated, and the root
  `CHANGELOG.md`.
- **Market index (2):** `marketplace.json` and `Site/Public/marketplace.json`.
- **Release docs (2):** this runbook and the `Documentation/INDEX.md` row.
- **Built output:** the regenerated `Target/` trees.

## 8. The commit suggestion

```text
release: 0.2.0 across the 102-package family

- Bump all 102 manifests and every sibling pin to 0.2.0.
- Move the six activation version constants and their byte-identical assertions to 0.2.0.
- Add the per-package CHANGELOGs (77 new, 25 backfilled with 0.1.0) and the root 0.2.0 section.
- Regenerate the market index and record the 0.2.0 runbook.
```

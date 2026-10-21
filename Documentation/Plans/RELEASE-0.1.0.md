---
title: Release 0.1.0 - the first feature release of the DSH plugin family
category: Plans
kind: one-shot-record
date: 2026-10-21
status: active
registry: Documentation/Plans/RELEASE-0.1.0.md
index: Documentation/INDEX.md
statuses:
  - name: the version bump across both trees (31 packages)
    state: implemented
    evidence: every package.json carries 0.1.0; every sibling pin is 0.1.0
  - name: the verification run (the aggregate + the site build + Drift)
    state: implemented
    evidence: the evidence section below
  - name: the publish itself (npm + git)
    state: deferred
    evidence: the user's commands; nothing is published, committed, tagged, or pushed by this lane
---

# RELEASE 0.1.0 - the first feature release

> The family moves from 0.0.1 to **0.1.0** across the Classic and Effect-TS trees.
> 31 packages: 15 Classic, 15 Effect-TS, and the shared Effect-TS base.
> The publish, the commit, the tag, and the push are the USER'S calls.
> This document is the runbook and the evidence record; it changes nothing in the registry.

## 0. The version and the rationale

**0.1.0** - the first feature release.

- The family has shipped 0.0.1. A published version is immutable, so the next release cannot reuse it.
- The changes since 0.0.1 are additive features and corrections, not a breaking rewrite: the overpass
  scaffolding moved into the core, the ledger defaults aligned with the documented paths, the
  Effect-TS direct `effect` dependencies were removed, and the site figures were corrected.
- Pre-1.0 SemVer puts a feature release at the minor position: 0.0.1 -> 0.1.0.
- The documented rule the release must not break is the placeholder rule: the empty placeholder is
  0.0.0 and every real release is above it. 0.1.0 satisfies that rule; the old 0.0.1 stays on the
  registry as an immutable historical release.

## 1. The 31 packages in publish order

The order is the dependency graph: the base, then the four foundations, then the consumers. Within a
layer the order is arbitrary.

### L0 - the base (1)

| # | Package | Tree |
| - | ------- | ---- |
| 1 | `@playform/ets-base-dsh` | EffectTS |

### L1 - the four foundations (4)

| # | Package | Tree |
| - | ------- | ---- |
| 2 | `@playform/lib-dsh-core` | Classic |
| 3 | `@playform/plugin-dsh-factory` | Classic |
| 4 | `@playform/ets-lib-dsh-core` | EffectTS |
| 5 | `@playform/ets-plugin-dsh-factory` | EffectTS |

### L2 - the twenty-six consumers (26)

| # | Package | Tree |
| - | ------- | ---- |
| 6 | `@playform/hook-dsh-cargo-governor` | Classic |
| 7 | `@playform/hook-dsh-ccr` | Classic |
| 8 | `@playform/hook-dsh-live-containers` | Classic |
| 9 | `@playform/hook-dsh-normalize-dash` | Classic |
| 10 | `@playform/hook-dsh-normalize-ellipsis` | Classic |
| 11 | `@playform/plugin-dsh-normalize-file` | Classic |
| 12 | `@playform/hook-dsh-normalize-fullwidth` | Classic |
| 13 | `@playform/hook-dsh-normalize-invisible` | Classic |
| 14 | `@playform/hook-dsh-normalize-quotes` | Classic |
| 15 | `@playform/hook-dsh-normalize-spaces` | Classic |
| 16 | `@playform/hook-dsh-package-governor` | Classic |
| 17 | `@playform/hook-dsh-package-pinner` | Classic |
| 18 | `@playform/hook-dsh-tool-coach` | Classic |
| 19 | `@playform/ets-hook-dsh-cargo-governor` | EffectTS |
| 20 | `@playform/ets-hook-dsh-ccr` | EffectTS |
| 21 | `@playform/ets-hook-dsh-live-containers` | EffectTS |
| 22 | `@playform/ets-hook-dsh-normalize-dash` | EffectTS |
| 23 | `@playform/ets-hook-dsh-normalize-ellipsis` | EffectTS |
| 24 | `@playform/ets-plugin-dsh-normalize-file` | EffectTS |
| 25 | `@playform/ets-hook-dsh-normalize-fullwidth` | EffectTS |
| 26 | `@playform/ets-hook-dsh-normalize-invisible` | EffectTS |
| 27 | `@playform/ets-hook-dsh-normalize-quotes` | EffectTS |
| 28 | `@playform/ets-hook-dsh-normalize-spaces` | EffectTS |
| 29 | `@playform/ets-hook-dsh-package-governor` | EffectTS |
| 30 | `@playform/ets-hook-dsh-package-pinner` | EffectTS |
| 31 | `@playform/ets-hook-dsh-tool-coach` | EffectTS |

## 2. The publish commands

### The NPM.yml route (recommended)

`.github/workflows/NPM.yml` already publishes in the L0 -> L1 -> L2 order with
`npm publish --provenance --access public --ignore-scripts`, the `Release` environment, and
`id-token: write`.

1. Confirm the workflow is on the default branch and the `Release` environment exists.
2. Run it: GitHub -> Actions -> NPM -> Run workflow (or create the release, which also triggers it).
3. Each of the 31 package pages must have the trusted publisher bound to
   `PlayForm/DeepSeek`, `NPM.yml`, environment `Release`.

The workflow currently carries NO `if: false` guard: it is armed. The release brief expected an
`if: false` guard; the committed workflow has none, so there is nothing to flip. This lane did not
add or remove the guard. Running the workflow is the user's step.

### The local route (one tree at a time, with the user's token)

The tree-level commands run the same publish form in the L0 -> L1 -> L2 order:

```bash
# L0 - the base
(cd EffectTS/packages/ets-base-dsh && npm publish --provenance --access public --ignore-scripts)

# L1 - the four foundations
for d in lib-dsh-core plugin-dsh-factory; do
  (cd "Classic/packages/$d" && npm publish --provenance --access public --ignore-scripts)
done
for d in ets-lib-dsh-core ets-plugin-dsh-factory; do
  (cd "EffectTS/packages/$d" && npm publish --provenance --access public --ignore-scripts)
done

# L2 - the thirteen Classic consumers
for d in hook-dsh-cargo-governor hook-dsh-ccr hook-dsh-live-containers \
  hook-dsh-normalize-dash hook-dsh-normalize-ellipsis plugin-dsh-normalize-file \
  hook-dsh-normalize-fullwidth hook-dsh-normalize-invisible hook-dsh-normalize-quotes \
  hook-dsh-normalize-spaces hook-dsh-package-governor hook-dsh-package-pinner \
  hook-dsh-tool-coach; do
  (cd "Classic/packages/$d" && npm publish --provenance --access public --ignore-scripts)
done

# L2 - the thirteen Effect-TS consumers
for d in ets-hook-dsh-cargo-governor ets-hook-dsh-ccr ets-hook-dsh-live-containers \
  ets-hook-dsh-normalize-dash ets-hook-dsh-normalize-ellipsis ets-plugin-dsh-normalize-file \
  ets-hook-dsh-normalize-fullwidth ets-hook-dsh-normalize-invisible ets-hook-dsh-normalize-quotes \
  ets-hook-dsh-normalize-spaces ets-hook-dsh-package-governor ets-hook-dsh-package-pinner \
  ets-hook-dsh-tool-coach; do
  (cd "EffectTS/packages/$d" && npm publish --provenance --access public --ignore-scripts)
done
```

The local route has no OIDC provenance unless the user runs it from a CI context; the NPM.yml route
is the provenance route.

### The six new names

`@playform/hook-dsh-ccr`, `@playform/hook-dsh-live-containers`,
`@playform/hook-dsh-tool-coach`, and their three `ets-` twins have never been published. A trusted
publisher can only bind to an existing package, so these six names need the empty-first-publish
bootstrap in `Documentation/Plans/TRUSTED-PUBLISHER.md` section 1 (placeholder 0.0.0) before the
0.1.0 publish. The other 25 names already exist at 0.0.1.

## 3. The registry checks

Run after the publish, per package:

```bash
for n in $(node -e 'const fs=require("fs"),path=require("path");for(const t of ["Classic","EffectTS"])for(const d of fs.readdirSync(t+"/packages")){const p=t+"/packages/"+d+"/package.json";if(fs.existsSync(p))console.log(JSON.parse(fs.readFileSync(p,"utf8")).name)}'); do
  printf '%s -> ' "$n"
  npm view "$n@0.1.0" version 2>/dev/null || echo MISSING
done
```

Every line must print `0.1.0`. Then check:

```bash
npm view @playform/hook-dsh-ccr@0.1.0 dist.attestations.provenance.predicateType
npm view @playform/hook-dsh-ccr dist-tags
npm view @playform/lib-dsh-core@0.0.1 version   # expected 404 - 0.0.1 shipped under the pre-rename name (git history)
```

The registry facts recorded at release preparation: 25 of the 31 names resolve at `0.0.1`;
`@playform/hook-dsh-ccr`, `@playform/hook-dsh-live-containers`,
`@playform/hook-dsh-tool-coach`, and their three `ets-` twins return `MISSING`. The old `0.0.1`
release stays immutable.

## 3a. The verification evidence

| Gate | Command | Result |
| ---- | ------- | ------ |
| Build, both trees | `pnpm run build` | exit 0, 31 packages |
| Full aggregate | `node Maintain/Run-Smokes.mjs` | exit 0, `All 207 smoke suites passed` |
| Site build | `pnpm prepublishOnly` (in `Site/`) | exit 0, 24 pages (25 HTML files including `404.html`) |
| Site drift | `pnpm Drift` (in `Site/`) | exit 0, 310 checks, zero content failures |
| Manifest version grep | `grep -rn "0.0.1" Classic/packages EffectTS/packages --include=package.json` | 0 matches |
| Sibling-pin grep | `grep -rn '"@playform/[^"]*": "0.0.1"' ... --include=package.json` | 0 matches |
| Built ccr bundle | `grep -r "0.1.0" Classic/packages/hook-dsh-ccr/Target EffectTS/packages/ets-hook-dsh-ccr/Target` | present in both `Function/Apply.js` files |
| Built site | `grep -rl "0.1.0" Site/Target --include="*.html"` | 24 pages; the one `0.0.1` page is the historical changelog entry |
| Workflow coverage | the L0 + L1 + L2 lists vs the 31 directories | 1 + 4 + 26 = 31, zero missing |
| Registry snapshot | `npm view <pkg> version` for all 31 | 25 at 0.0.1; 6 `MISSING` (the new names) |

The one build-log caveat: the Classic cargo-governor's `tsc` step prints duplicate
`@deepseek-ai/dsh-fs` type errors (the package-local 0.2.1-rc.2 copy against the root 0.2.0-rc.2
copy). The build exits 0, the package's smoke suite is green, and the package source is untouched
by this release. This is an environment install mismatch, not a release regression; a clean
`pnpm install` aligns the copies.

## 4. The READY-TO-RELEASE checklist

- [x] 31 manifests at 0.1.0, zero 0.0.1 sibling pins.
- [x] The root `package.json` at 0.1.0; the Site `package.json` at 0.1.0.
- [x] The six activation `const Version` constants at 0.1.0 (ccr, tool-coach, live-containers, both
      trees), with their byte-identical assertions and READMEs updated in the same change.
- [x] `node Maintain/Run-Smokes.mjs` exits 0 and every folder's printed count matches its README.
- [x] `pnpm prepublishOnly` in `Site/` exits 0 with 24 pages.
- [x] `pnpm Drift` in `Site/` reports zero content failures (freshness lines are package mtimes).
- [x] `grep -rn "0.0.1" Classic/packages EffectTS/packages --include=package.json` returns zero.
- [x] The built ccr `Target` carries `bundle 0.1.0`; the built site carries `0.1.0`.
- [x] `CHANGELOG.md` carries the 0.1.0 entry; the per-package CHANGELOGs keep their 0.0.1 history.
- [x] `.github/workflows/NPM.yml` names all 31 packages in L0 -> L1 -> L2.
- [ ] The git commit, the tag, and the push are the user's commands (section 5).
- [ ] The npm publish is the user's command; this lane never runs it.

## 5. The git commands (the user runs them)

```bash
# the root repository
git add -A
git commit -m "release: 0.1.0 across the Classic and Effect-TS trees"
git tag -a v0.1.0 -m "DeepSeek Harness Plugin Family 0.1.0"
git push origin HEAD --follow-tags

# Site/ is its own repository
cd Site
git add -A
git commit -m "release: 0.1.0 figures and samples"
git push origin HEAD
```

## 6. The residuals

- The nested per-package `pnpm-lock.yaml` files (six Classic, six Effect-TS) still record the
  0.0.1 sibling tarballs. They are registry-resolved install artifacts, not the workspace graph, and
  cannot resolve 0.1.0 until it is published. Regenerate them after the publish:
  `(cd <package> && pnpm install --lockfile-only)`.
- The root `pnpm-lock.yaml` is gitignored; it was regenerated locally at 0.1.0.
- `@playform/hook-dsh-ccr`, `@playform/hook-dsh-live-containers`, and
  `@playform/hook-dsh-tool-coach` (and the three `ets-` twins) need the empty-first-publish bootstrap
  before a trusted publisher can bind.

## 7. The files changed

`git status` is the exact manifest (160 paths at preparation); the groups below are the complete set.

- **Manifests (32):** all 15 `Classic/packages/*/package.json`, all 16
  `EffectTS/packages/*/package.json`, and `Site/package.json`. The root manifest was already at
  0.1.0.
- **Activation code and assertions:** the six `Source/Function/Apply.ts` version constants (ccr,
  tool-coach, live-containers, both trees); the ccr, tool-coach, and live-containers test
  `Test.ts`/`README.md` pairs in both trees; and the six
  `smokes/Test/Introspection/Live-Assertions` files (`Test.ts`, `Test.mjs`, `README.md` per tree).
- **Package docs (56):** 26 README badges/examples, 24 CONTRIBUTING version lines, and 6 SCHEME
  headers.
- **Site source (15):** `Source/Library/Content.ts`; the versions, setup, index, and case-study
  pages; the ccr and live-containers detail pages; the Configurator, FlavorBadge, StatsBand, and
  Terminal components; `Global.css`; `README.md`; `CHANGELOG.md`; and the regenerated
  `Source/Content/Mermaid/case-p6-naming.svg`.
- **Release and registry docs (13):** the root `README.md` (the release badge and the 31-package,
  1314/1324 figures), the root `CHANGELOG.md`, `Documentation/INDEX.md`, `FRAMEWORK.md`,
  `Guides/DSH-REGISTRY-LISTING.md`, `Guides/DOGFOOD-TESTING.md`, `Guides/Governor-README.md`,
  `Plans/DSH-MONOREPO-PLAN.md`, `Plans/TRUSTED-PUBLISHER.md`, `Plugins/PLUGIN-FAMILY.md`,
  `Researches/FAMILY-INTERACTIONS-RESEARCH.md`, and the two skill references
  (`plugin-system/inventory.md`, `session-orientation/repository-map.md`).
- **Workflow (1):** `.github/workflows/NPM.yml` (the 31-package L0/L1/L2 lists).
- **Built output:** the regenerated `Target/` files for the version-bearing bundles and the Site
  `Target/` pages.
- **New:** `Documentation/Plans/RELEASE-0.1.0.md`.

Two working-tree notes:

- The Site's active package governor updated `puppeteer` from 25.14.0 to 25.15.0 when the manifest
  was written. The site build and Drift passed with 25.15.0. Revert the one line if the release
  should not carry the dependency refresh.
- The working tree already carried unrelated uncommitted plan docs and EffectTS `Target/*.d.ts`
  edits before this lane. `git add -A` would include them; review the full diff or stage the
  release paths explicitly.

## 8. The commit suggestion

```text
release: 0.1.0 across the Classic and Effect-TS trees

- Bump all 31 packages and every sibling pin to 0.1.0.
- Update the ccr, tool-coach, and live-containers activation proofs and assertions.
- Align the site figures, samples, changelog, and diagrams.
- Correct the registry docs and the NPM workflow to 31 packages.
```

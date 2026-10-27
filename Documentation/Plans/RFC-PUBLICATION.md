---
title: Publication - release 0.3.0 of the 106-package family and make every install claim true
category: Plans
kind: queued-plan
date: 2026-10-27
status: planned
registry: Documentation/Plans/RFC-PUBLICATION.md
index: Documentation/INDEX.md
statuses:
    - name: the problem (the tree moved to 106 packages at 0.3.0 while the publication record disagrees with itself)
      state: resolved
      evidence: section 1
    - name: why this beat the shortlist (the drift gate, the smoke aggregate, cost consumers)
      state: resolved
      evidence: section 2
    - name: what publishing requires (names, placeholders, provenance, trusted publishers)
      state: resolved
      evidence: section 3
    - name: what publishing breaks (the site's install promise, the market index)
      state: resolved
      evidence: section 4
    - name: the staged path that keeps the site truthful at every step
      state: resolved
      evidence: section 5
    - name: the acceptance checks
      state: resolved
      evidence: section 6
    - name: the implementation
      state: open
      evidence: section 7 - the publish itself is the user's command, per the runbook's law
---

# Publication - release 0.3.0 of the 106-package family and make every install claim true

> The tree is 106 packages, every manifest at 0.3.0, while the registry's newest recorded release
> is 0.2.0 over the previous 102 names. Between those two states the repository's own install
> claims contradict each other: the site's pages say every package is unpublished and
> build-from-source only, and the market documentation records the 0.2.0 family as published on
> npm. This RFC stages the 0.3.0 publication so that at every step the site says only what the
> registry can prove.

## 1. The problem

The tree: a version-line grep over both trees returns 106 matches, every one `"version": "0.3.0"`
(58 under `Classic/packages/`, 48 under `EffectTS/packages/`).

The registry record, as committed: the root `marketplace.json` carries 102 plugin entries whose
version rows are npm-source with registry publish times (for example `client-dsh-panel-family`
0.2.0 at timestamp 1792937834, line 87, and `client-dsh-panel-family-host` 0.1.0 then 0.2.0 at
lines 125-134), and every version row in the file is 0.2.0 or older - a grep for `"0.3.0"` in the
index returns nothing. `Documentation/Plugins/MARKETPLACE.md` section 6 (dated 2026-10-25) records
the consequence: "102 packages in the tree, all published at 0.2.0 on npm", 224 npm versions in
the index, and no git pins, because a pin appears only when a tree version is unpublished.

The contradiction, also committed: `Site/Source/pages/plugins.astro` renders "ALL 102 packages are
UNPUBLISHED" in both the description and the sub-line (lines 341 and 363); `case-study.astro`
line 1486 calls the build-from-source route the only route "all {Counts.Packages} packages" allow;
`ModulePlate.astro` line 63 renders "Not on the registry yet. Build it from source";
`Configurator.astro` line 20 states no npm install appears in its output and lines 449-660 emit
only the build-from-source add; `setup.astro` line 372 titles "Every route is a build-from-source
route" and line 961 says `pnpm install` has no registry to install from. The drift guard
enforces part of this posture as checks: zero `npm install @playform/` commands in
`Source/Component` (Drift-Guard.mjs lines 1247-1257) and on the catalog pages (lines 1315-1320).
One of the two records - the site's copy or the market's - is stale, and the tree's move to
0.3.0/106 does not wait for the disagreement to be settled.

Two gaps follow, both measurable. First, 0.3.0 is unpublished for all 106 packages. Second, four
names were never published at any version and are absent from the index's 102 entries:
`plugin-dsh-cost`, `plugin-dsh-cost-analysis`, `hook-dsh-lesson-nudge`, `plugin-dsh-lesson-review`.
For those four the site's "not on the registry" line is true and the market's npm truth is
incomplete in the other direction - they have no entry at all, not even a git pin.

## 2. Why this beat the shortlist

1. **Above the cost family.** The cost plan's frontmatter records the live install as open
   (COST-TRACK-PLUGIN.md), so nothing consumes the ledger yet; publication has a written,
   once-executed runbook waiting for its next pass.
2. **Above the smoke aggregate.** Both are checks-and-truth work, but publication moves a public
   registry and the site's install promise with it; the smoke audit is internal and reversible.
3. **Below the drift gate.** The gate is red today (139 failing checks); publication is a staged
   run whose first stage is itself a reconciliation the drift-gate RFC depends on, since the
   generated fallback constants must encode the post-publication truth.

## 3. What publishing would require

- **Names.** 106 npm names in the `@playform` scope, each `@playform/` plus its directory name -
  the identity contract the drift guard checks per package (Drift-Guard.mjs lines 976-982).
- **Placeholders.** The four never-published names need the empty-first publish at 0.0.0 before
  trusted publishers can bind (TRUSTED-PUBLISHER.md section 0: "The packages must EXIST on npm
  before the trusted publishers can bind"; a published version is immutable and the placeholder
  must stay below the real release).
- **Trusted-publisher bindings.** The runbook's per-package page binding (account PlayForm,
  repository DeepSeek, workflow NPM.yml, environment Release) currently covers the original 31
  names only (TRUSTED-PUBLISHER.md lines 48-83 and 122-138). The other 75 names - the 2026-10-22
  delivery and the four cost and lesson packages - were published at 0.2.0 without this RFC's
  authorship of their bindings; the 0.3.0 pass should extend the runbook's list to 106 so the
  document matches what the registry requires for provenance.
- **Provenance.** The armed publisher already publishes with
  `npm publish --provenance --access public --ignore-scripts` and derives the layer order
  (L0 first) from the manifests' own `@playform/` dependencies, skipping versions already on the
  registry and blocking a package whose dependency failed (RELEASE-0.2.0.md lines 194-207). At
  0.2.0 the dry run printed 101 `DRY` and 1 `SKIP` (line 265); at 0.3.0 with 106 manifests the
  equivalent dry run is the gate to reproduce.
- **The release collateral the 0.2.0 runbook established:** per-package CHANGELOGs (102 at 0.2.0,
  line 261 - 106 at 0.3.0), the activation `const Version` constants (six at 0.2.0, line 266;
  23 further packages still announce 0.1.0 in their own ledger lines, lines 319-322), and the
  market regeneration.

## 4. What publishing would break, and what is already broken

- **The site's install promise.** Publishing 0.3.0 makes the six unpublished claims in section 1
  false in the other direction: the site would deny an install that exists. The promise to keep is
  not "unpublished" but "the site says only what the registry proves" - the copy and the two guard
  checks that enforce the unpublished posture must change in the same change set as the publish,
  never before it and never long after it.
- **The market index.** The committed `marketplace.json` is stale by its own standard right now:
  102 entries, newest version 0.2.0, against a 106-manifest 0.3.0 tree, so `pnpm marketplace:check`
  (MARKETPLACE.md section 4) cannot pass. Regeneration adds the four missing entries and, until the
  publish lands, re-adds git pins for every tree version the registry does not hold - which per
  MARKETPLACE.md section 5 "works only for a published closure", so the pins must not be presented
  as an install route for the unpublished 0.3.0.
- **The placeholders' law.** 0.0.0 and the earlier real releases stay immutable; the four new
  placeholders are permanent history beneath a 0.3.0 that must land after them (TRUSTED-PUBLISHER.md
  section 0 and section 4).

## 5. The staged path

| Stage | Step                                                                                                                                                      | The site stays truthful because                                                                                                   |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 0     | Reconcile the record: run the release runbook's registry loop (`npm view <name>@0.2.0 version`, RELEASE-0.2.0.md lines 232-247) and correct whichever claim is stale | the first change is the one that makes the two records agree, before any new publish                                                  |
| 1     | Bootstrap the four missing names: 0.0.0 placeholders, then trusted-publisher bindings; extend TRUSTED-PUBLISHER.md's list to 106                                | the site is untouched; the runbook document grows to match the registry's requirement                                                  |
| 2     | Cut 0.3.0: changelogs, activation constants, the dry run (expect 106 `DRY`), then the NPM.yml publish with provenance in dependency order                      | the site still says unpublished, which remains true until the publish completes                                                        |
| 3     | Regenerate the market (`pnpm marketplace`): 106 entries, npm versions at 0.3.0, no git pins, the four new names present                                      | the index becomes the registry's mirror again; the stale-index state ends                                                              |
| 4     | Flip the site's install copy and the two guard checks to the npm route, in the change set that records the publish                                            | the "unpublished" claims leave the tree in the same commit that makes them false, and the guard enforces the new posture instead        |

The runbook's law is kept throughout: the commit, the tag, the push, and the npm publish are the
user's commands (RELEASE-0.2.0.md lines 287-288 and section 5).

## 6. The acceptance checks

1. The registry loop prints 0.3.0 for all 106 names (the 0.2.0 runbook's section 3, re-run).
2. At least one provenance chain per tree resolves
   (`npm view <name>@0.3.0 dist.attestations.provenance.predicateType`).
3. `pnpm marketplace` writes an index with 106 entries, npm-source versions at 0.3.0, no git pins,
   and `pnpm marketplace:check` exits 0.
4. The site contains zero "unpublished" or "build-from-source only" claims for a package whose
   0.3.0 is on the registry, and the drift guard's two npm-install checks read the new posture.
5. No 0.0.0 placeholder was ever republished, and each of the four new names' placeholder predates
   its real release.
6. A fresh install of one leaf package resolves its whole `@playform/` dependency closure from the
   registry at 0.3.0, because the publish order put L0 first (RELEASE-0.2.0.md lines 197-201).

## 7. What this RFC does not do

It does not publish anything, run any registry command, or settle stage 0's question by assertion -
the RFC records both claims with their sources and leaves the `npm view` loop as the arbiter. It
does not rewrite the site's install copy, remove the guard's npm-install checks, or regenerate
`marketplace.json`; those are stages 3 and 4, after the publish. It does not change the package
names, the versioning scheme, the placeholder strategy, or the trusted-publisher configuration
beyond extending its documented list to 106. It does not touch the drift gate's generator
(RFC-DRIFT-GATE.md) or the smoke runner (RFC-SMOKE-AGGREGATE.md), beyond depending on their
acceptance states.

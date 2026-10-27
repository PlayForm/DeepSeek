---
title: The Site Update Spec - the completion program's content delta
category: Plans
kind: living-plan
date: 2026-10-24
status: active
registry: Documentation/Plans/SITE-UPDATE-SPEC.md
index: Documentation/INDEX.md
statuses:
    - name: the audit (the per-file delta, verified against the tree)
      state: resolved
      evidence:
          this document; Site/Source and Site/Target read at 2026-10-24 11:21-11:58; the readers
          Site/Source/Library/Content.ts + Live.ts + Scripts/Drift-Guard.mjs
    - name: the P0 false facts and false promises
      state: open
      evidence:
          the 86 stale ledger paths in Source (67 rendered), the 141 npm install commands, the 47
          "fifteen" claims, the live-containers status inversion, the three "byte-exact" claims that
          are not
    - name: the P1 missing completion content
      state: open
      evidence:
          the 36 new packages, the trace bus, the pack layer + learner, the policy block, the
          storage domains, the client family, the workspace tools, the 0.2.0 panel, the delivery record
    - name: the P2 wording
      state: open
      evidence:
          the banned words, the false absolutes, the labels-as-headings, the internal notes, the one
          broken sentence
    - name: the build and drift gate
      state: open
      evidence:
          `cd Site && pnpm prepublishOnly` then `pnpm Drift` - the Drift-Guard currently reports 626
          checks / 13 failures, all 13 the stale ledger samples
---

# SITE-UPDATE-SPEC - the site's per-file content delta

> The binding worklist for the website lane after the completion program. The site still tells a
> fifteen-package story inside a 101-package tree, because the ledger paths point at files that no
> plugin writes, every install box promises an npm release that does not exist, and the 36 new
> packages plus the trace bus, the pack layer, the policy block, the storage domains, and the client
> family are absent from the copy. This document is the delta: every finding keeps its file and line,
> the corrected fact and its source in the tree, and the acceptance check that proves the fix. The
> auditor was read-only, so nothing under `Site/` was edited by the audit.

## 0. How to use this document

1. Read section 1 (the verdict), because it is the measured state and not an impression.
2. Execute section 7 in order: P0, then P1, then P2, where every item names its files, its corrected
   facts, and its acceptance check.
3. The gate is always the same two commands plus one grep:

```sh
cd Site && pnpm prepublishOnly                                                 # the only verification: the build
cd Site && pnpm Drift                                                          # the content-integrity guard
grep -r '~/\.dsh/[a-z-]*\.log' Site/Target --include=*.html | grep -v playform # must be empty
```

4. The lane laws still apply: no `astro dev`, no `tsc`, no git mutation, the build is the arbiter,
   every dynamic figure comes from `Source/Library/Content.ts`, and a claim about packages, counts,
   versions, npm, or features is verified against the tree and never against a document.

### 0.1 The state this spec is written against

The `site-content` lane rewrote the content model during the audit, while the pages are untouched.

| Artifact                                             | State at the audit           | Meaning                                                             |
| ---------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------- |
| `Site/Source/Library/Content.ts`                     | rewritten (11:45), 592 lines | the census + the completion figures are in                          |
| `Site/Source/Library/Live.ts`                        | rewritten (11:43), 677 lines | the readers for the census, the completion surfaces and the profile |
| `Site/Scripts/Drift-Guard.mjs`                       | rewritten                    | 626 checks; the gate list mirrors the new figures                   |
| `Site/Target/`                                       | rebuilt (11:51), 25 HTML     | the shipped artifact; 24 pages + 404                                |
| `Site/Source/pages/*.astro`, `Layout/`, `Component/` | untouched since 11:21        | every finding below still stands                                    |

A second lane (`site-content`) may still be editing the model while this spec executes, so re-run the
gate after every change set and do not hand-edit a figure that the model already publishes.

## 1. The verdict

The content model is now essentially correct, but the pages are not, and the site ships a broken
install path and a stale ledger vocabulary.

| Measure                                          | In `Site/Target/` (built 11:51)          | The tree's truth                             | Source                                                                           |
| ------------------------------------------------ | ---------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------- |
| Concrete stale ledger paths (`~/.dsh/<pkg>.log`) | 67 rendered; 0 correct `playform/` paths | every default is `~/.dsh/playform/<pkg>.log` | each package's `Source/Variable/Config.ts`; 49 `cordis.patch.yml` files          |
| `npm install @playform/...` commands             | 141                                      | 0 of 101 packages are published              | `Documentation/Plugins/PLUGIN-FAMILY.md:36-37,48`; `PLUGIN-SUITE-SUMMARY.md:118` |
| "fifteen"                                        | 47                                       | 101 packages (53 Classic + 48 EffectTS)      | `ls Classic/packages`; `ls EffectTS/packages`                                    |
| `pnpm Drift`                                     | 626 checks, 13 FAIL                      | 0 expected                                   | `node Site/Scripts/Drift-Guard.mjs`                                              |
| HTML pages                                       | 25                                       | 24 pages + the 404                           | `find Site/Target -name "*.html"`                                                |
| Nav / 404 / sitemap parity                       | 9 / 9 / 9                                | holds                                        | `Layout/Base.astro:24-34`; `Public/404.html:105-115`                             |

What the numbers mean, in the terms of the site:

- The install box is the primary conversion path, and it 404s on 141 surfaces.
- The ledger is the "did it activate" proof of the site, and every sample points at a file that no
  plugin writes any more, because wave 0b standardised the log path to
  `~/.dsh/playform/<package>.log`.
- The family grew from 15 to 101 packages, and the copy still says fifteen in 47 places.
- The 13 Drift failures are exactly the stale ledger samples, so fixing them turns the guard green.

## 2. The content model

### 2.1 The verified figures (do not re-derive by hand)

Every figure below was re-derived from the tree by the audit and independently reproduced. The
readers in `Live.ts` compute them, `Content.ts` publishes them, and the pages must read them.

| Export                                                         | Value                                                                                | Derivation                                                                                                                        |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `Counts.Packages` / `PackagesClassic` / `PackagesEffectTS`     | 101 / 53 / 48                                                                        | the two trees' package directories                                                                                                |
| `Counts.Suites` / `SuitesClassic` / `SuitesEffectTS`           | 511 / 269 / 242                                                                      | `*/Source/Test/*` folder count, both trees                                                                                        |
| `Totals.Classic` / `Totals.EffectTS` / `Totals.Both`           | 3454 / 3158 / 6612                                                                   | the sum of every folder README's `## Expected count` -> `N PASS`                                                                  |
| `Counts.Factory` pair                                          | 54 / 43                                                                              | the factory's 8 and 7 folders (the smoke README manifests say 53/42 and lag the folders by one each; the folders are the arbiter) |
| `Totals.Mechanics`                                             | 1334 / 1325                                                                          | the sum of the 14 mechanics pairs (NOT 1333/1324: the factory adds one per tree)                                                  |
| `Counts.Twins`                                                 | 47                                                                                   | 48 EffectTS packages minus `ets-base-dsh`; six Classic packages have no twin                                                      |
| `Counts.Libraries` / `NewLibraries`                            | 4 / 2                                                                                | the Classic `lib-*` packages: core, pack, trace, workspace-live                                                                   |
| `Methods.Count`                                                | 19                                                                                   | the SCHEME's 18 method sections plus the shared section 2.7; 2.19 is module-level                                                 |
| `Versions.Release` / `PanelFamily` / `Effect` / `EffectPinned` | 0.1.0 (the mode) / 0.2.0 / 4.0.5 / 12                                                | the 101 manifests; 12 EffectTS packages declare `effect`                                                                          |
| `Trace`                                                        | 3 events / 5 envelope fields / 256 ring / 5 service methods / 3 adapters / 10 checks | `lib-dsh-trace`; the factory's `Interface/Trace.ts`                                                                               |
| `Pack`                                                         | 31 families / 6 domains / 3 layers / 4 folders / 30 checks                           | `lib-dsh-pack/Source/Variable/Builtin.ts`; the four test folders (6+8+6+10)                                                       |
| `Learner`                                                      | 10 modules / 9 families / 3 markers                                                  | `hook-dsh-convention-suggester/Source/Function/Learn/`                                                                            |
| `Workspace`                                                    | 5 tools / 17 packages                                                                | `workspace_index`, `_map`, `_find`, `_expand`, `_context`                                                                         |
| `Policy`                                                       | 8 actions / 5 auto / 3 approve / 25 packages                                         | `plugin-dsh-factory/Source/Variable/Policy.ts`; 25 `Policy-Defaults` folders                                                      |
| `Storage.Domains`                                              | 15                                                                                   | 12 `domain:` config defaults plus 3 `defineDomain` names                                                                          |
| `Client`                                                       | 3 packages / 13 adapters                                                             | `client-dsh-panel-family/Source/Variable/Reference/*.ts`                                                                          |
| `Suggesters`                                                   | 7 / 6 / 6 / 2                                                                        | seven packages; six pack-driven; six `Workspace-Gate`; two `Learning-Loop`                                                        |
| `Profile`                                                      | 49 rows / 48 enabled / 1 factory                                                     | the desktop `cordis.patch.yml`: 49 `name: "@playform/` rows, 48 with `enabled: true`, the factory row `config: {}`                |

The six Classic-only packages (no ETS twin): `client-dsh-panel-family`,
`client-dsh-panel-family-host`, `hook-dsh-batch-decision`, `plugin-dsh-ingester`,
`plugin-dsh-pass-on`, `plugin-dsh-pattern`.

The two ledger identities that differ from the package names (see 5.1): the governor's line prefix
is `hook-dsh-governor-package`, the pinner's is `hook-dsh-pinner-package`, the cargo governor's is
`hook-dsh-governor-cargo`, the ccr hook's is `ccr`.

### 2.2 The residual defects in the model

**CM-1. `Content.ts:304` - the dead re-assignment.**

```ts
Totals.Both = Totals.Classic + Totals.EffectTS;
```

`Both` is already a key of the object literal at `Content.ts:290`. Delete the line (or the key).

Acceptance: `Site/Source/Library/Content.ts` declares `Both` once; the build renders 6612.

**CM-2. Stale doc comments in the model.**

- `Content.ts:475` - "the register #15 identities: the @-sentence release names of **the fifteen
  packages**" (101 now).
- `Content.ts:3-8` is correct; re-grep the whole file for `fifteen|thirty-one|31` before commit.
- `Component/StatsBand.astro:3` - "31 packages / 1314 + 1324 checks".
- `Component/Terminal.astro:5` - "The family is on npm (v0.1.0, ALL 31 packages,
  provenance-verified)" - false twice.
- `Layout/Base.astro:46` - "the fifteen packages as parts".
- `Library/Screens.ts:3-12` - "the fifteen release packages' fourteen hooks".
- `Library/FileIcon.ts:198` - a comment naming `~/.dsh/<name>.log`.
- `DESIGN.md:12` - "31 npm packages".

Acceptance: `grep -rn 'fifteen\|thirty-one\|31 packages' Site/Source Site/DESIGN.md` returns only
historical or explicitly scoped sentences.

**CM-3. `Families.CCR` is a three-segment identity.**

`Content.ts:489` publishes `"Hook @ DSH @ CCR"` against the register's four-segment law
`<kind> @ <platform> @ <role> @ <domain>` (`Documentation/Plugins/PLUGIN-FAMILY.md:67-68`). No tree
source assigns the CCR hook an @-sentence. Same check for `Families.Trace` and `Families.Pack`
(`Content.ts:493,495`): cite the package README or drop the field.

Acceptance: every `Families.*` value either matches a documented identity or is removed; the pages
render no invented identity.

**CM-4. `Live.ReadProfile()` reads the build machine's home.**

`Live.ts:571-592` reads `$DSH_HOME` or `~/.dsh` and picks the profile with the most `@playform`
rows. This is the site's only figure outside the monorepo: the build output becomes machine
dependent, and the Drift-Guard can only re-check it on the same host. Choose one:

- (a) keep the figure and label it on every page as a live-profile observation with the documented
  fallback, or
- (b) drop the profile figures from page copy and keep them out of the model.

Acceptance: no page states a profile count as a tree fact; or the page states the source and the
fallback in the same sentence.

**CM-5. New figures the pages need and the model lacks.**

- The delivery census: 36 new Classic plugins and 30 ETS twins for the 2026-10-22 delivery, the 2
  completion libraries, the 11 approved re-specs.
- The installed/enabled split in the profile _package.json_ (a different figure from the patch
  rows): 51 `@playform` dependencies, 48 bundle rows, 3 installed but not enabled (`hook-dsh-ccr`,
  `lib-dsh-core`, `lib-dsh-workspace-live`).

Add as `Delivery` / `Profile.Installed` constants with a live reader and a documented fallback.

Acceptance: the P1 pages read these figures from the model; no page hardcodes 36, 30, 11, 51 or 3.

**CM-6. The Drift-Guard scans only `Source/pages`.**

`Scripts/Drift-Guard.mjs` walks `Site/Source/pages` for the ledger samples.
`Component/Configurator.astro` carries 23 stale paths and `Component/Terminal.astro` carries the npm
promise, both unchecked.

Acceptance: the sample walk covers `Source/pages` and `Source/Component`; the guard's count grows
and passes.

### 2.3 The links, the icons, the registry screens

- `Library/Links.ts` - correct; no change. `Link()` / `Resolve()` compose every repository URL and
  no page hardcodes one. Keep the branch forms (`tree/Current`, `tree/master`).
- `Library/DiagramNav.ts` - correct for the current diagram set; if a P1 diagram names one of the
  new packages (`lib-dsh-trace`, `lib-dsh-pack`, `plugin-dsh-workspace`), add its node pattern.
- `Library/Screens.ts` - the registry plates. Three defects: 14 slots (the family has 15 legacy
  modules plus 86 more), `Install()` returns `npm install ...` for 12 packages (all unpublished),
  `PendingNames` names 3 packages as pending (all 101 are). Rework to: a plate per legacy module
  with a `PUBLISHED: NO` state and the build-from-source route, or scope the screen to "the 15
  legacy modules" explicitly.

## 3. The layout, the nav, the 404, the public files

### 3.1 `Site/Source/Layout/Base.astro`

| Line     | Finding                                                               | Fix                                                                                                                                                                                                         |
| -------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `:24-34` | the nav's 9 entries                                                   | correct; no change                                                                                                                                                                                          |
| `:46`    | comment "the fifteen packages as parts"                               | 101                                                                                                                                                                                                         |
| `:51-70` | `CanonicalPackages` hardcodes 15 npm names; `:71-74` appends the rest | the JSON-LD `hasPart` now lists 53 while the description says fifteen. Either list all 101 from `Live.PackageNames` in a stable order, or scope `hasPart` to the Classic tree and say so in the description |
| `:81`    | JSON-LD description "Fifteen packages, fourteen smoke suites."        | "101 packages, 511 smoke suites", from `Content.ts`, not a literal                                                                                                                                          |
| `:85`    | `softwareVersion: Versions.Release` on a 101-part application         | use `Versions.Release` for the 100 and name the 0.2.0 outlier (`Versions.PanelFamily`) in the description, or put the outlier's version on its own part                                                     |

Acceptance: the JSON-LD parses (`node -e` over the built HTML), `hasPart` length equals the stated
package count, and no JSON-LD string says fifteen.

### 3.2 The public files

| File                       | Finding                                                 |
| -------------------------- | ------------------------------------------------------- |
| `Public/404.html:105-115`  | the 9 links equal the nav and the sitemap; parity holds |
| `Public/Manifest.json`     | no counts; correct                                      |
| `Public/robots.txt`        | correct                                                 |
| `Public/_headers`          | correct                                                 |
| `Public/assets/badges.svg` | 11 `<symbol>` elements; `Sprite.Badges` = 11 verified   |

Acceptance: `pnpm prepublishOnly` emits 25 HTML files; the 404's link set equals `Base.astro`'s nav.

## 4. The nine top-level pages

### 4.1 `Site/Source/pages/index.astro` (1714 lines; the body ends at 737)

STALE

- `:226` the Base Description: "**fifteen** TypeScript packages - the core, the factory service, the
  governance trio, the seven-member normalize family, the CCR compressor and tool-coach guardians,
  and the live-containers hook". The family is 101 packages across seven kinds.
- `:255` "**fifteen** TypeScript packages, smoke-arbitrated" (the hero sub).
- `:406` "The **fifteen** contracts in plain TypeScript"; `:425` "The same **fifteen** contracts
  re-expressed on Effect-TS". Correct: 53 Classic, 48 EffectTS, 47 shared contracts.
- `:733` the notation "the **fifteen** packages: pinned and governed by the manifest hooks".
- `:17` the comment "The fifteen packages".
- `:316-318` the comment "15 packages, the derived check totals, the 0.1.0 release" (`StatsBand` now
  renders 101 / 3454 + 3158 / 0.1.0).

MISSING

- The completion has no home on the landing page. Add one band after the use cases (`:523`), "The
  workspace runtime", with one card per surface, each figure from the model:
    - the workspace tools (`Workspace.Tools` = 5: `workspace_index`, `_map`, `_find`, `_expand`,
      `_context`);
    - the trace bus (`Trace`: 3 events, `observe/stamp`, `graph/indexed`, `graph/invalidated`; the
      `ctx.trace` service; the 256-entry ring);
    - the pack layer (`Pack`: 31 families over 6 domains, the user layer, the repo layer, the
      extends chain);
    - the policy block (`Policy`: 8 actions, 5 auto, 3 approve).
- The two new libraries (`lib-dsh-trace`, `lib-dsh-pack`) in the Plugins section, and the client
  family (3 packages, 13 adapters) as a new group.

FALSE PROMISE

- `:259` `<Terminal Pkg="lib-dsh-core" Rail />` renders `npm install @playform/lib-dsh-core@0.1.0`.
  See P0-2.

VOICE

- `:255` "smoke-arbitrated" is jargon for a landing page; `:729-733` the notation repeats "the
  complete deterministic stream governor matrix" (a slogan, rule 3/8); `:543-546` states an absolute
  ("Terminal file edits are invisible to the plugin system") without the one-line reason.

Acceptance: the built page carries no "fifteen"; the band's four figures equal the model; the hero
install box states the unpublished state.

### 4.2 `Site/Source/pages/plugins.astro` (1160 lines)

FALSE PROMISE (P0)

- `:19-23` `PublishPending` names three packages, so the other twelve cards render a live install
  snippet. `:225` the hero says "hook-dsh-ccr, hook-dsh-tool-coach, and hook-dsh-live-containers are
  publish-pending - build those three from source until they land", which implies the other twelve
  are on npm. All 101 packages are unpublished.
- Fix: one `Published` state from the model (all unpublished), and every card shows the
  build-from-source route plus the repository link instead of an npm command.

STALE

- `:25`, `:164`, `:203`, `:225`, `:235`, `:455`, `:456`, `:473`, `:629` - "fifteen" nine times.
- `:455` "The **ten** seams the fifteen live on". The family now also uses the trace bus, the
  storage domains, the agent-team inbox, the LSP/AST service (semantics, reflect) and the client
  slots. Add three rows: the trace bus, the storage domains (`pattern`, `batch_state`,
  `replay_history`, `package_governance`, `live_containers_monitors`), the client slot registry.
- `:193` `Seq: "15"` and the registry table's 15 rows: keep as "the 15 legacy modules" with that
  label, or extend.
- `:835-851` the smoke-counts Concept renders `Totals.EffectTS` / `Totals.Classic` (now the folder
  totals, 3454/3158) while the sentence frames them as the fourteen mechanics suites. Use
  `Totals.Mechanics` for that sentence and `Totals.Both` for the family figure.

MISSING

- The page is the registry: it must list the 36 new packages. Add five groups after Normalize:
  Workspace (15 + 1 library), Suggesters (7), Orchestration (10), Client (3), Libraries (2). Each
  with its twin marker (47 twins, 6 Classic-only).

VOICE

- `:861` "EVERY defect below was found live, not by the smokes" is unverifiable; `:646` "EVERY suite
  loads the REAL built Target" is true and checkable, keep it.

Acceptance: the page lists 101 packages in seven groups; no card renders an npm command; the group
metadata equals the model.

### 4.3 `Site/Source/pages/setup.astro` (889 lines)

FALSE PROMISE (P0)

- `:355-356` "`npm install @playform/<pkg>@{release}` in the profile directory **for a published
  package**. hook-dsh-ccr, hook-dsh-tool-coach, and hook-dsh-live-containers are publish-pending".
  The only working routes are `dsh plugin --profile <name> add <tarball>` and the `link:`
  dependency.

STALE (P0 - the ledger vocabulary)

- `:68` the demo card's Metadata `~/.dsh/<name>.log` (a placeholder, but the example below it is
  stale).
- `:161-164` `VerifyLines`: four activation lines, all with the old paths.
- `:114`, `:128`, `:137`, `:149` the patch example's `logFile:` values.
- `:746-777` the ledger table: seven rows, all old paths.
- Replace every concrete `~/.dsh/<pkg>.log` with `~/.dsh/playform/<pkg>.log` (15 occurrences in this
  file) and re-copy the activation lines byte-exact from the READMEs (the table in 5.1).

MISSING

- The D6 policy block (`policy: {action: auto|approve}`, 8 actions) in "The configurable surface".
- The pack files (`~/.dsh/playform/workspaces/<repo-slug>.yml`, `<repo>/.dsh/pack.yml`, `extends:`)
  as a new step 2b, "Teach the workspace".
- The storage domains (`pattern`, `batch_state`, `replay_history`) in "One ledger per plugin".
- The client bundles (`client-dsh-panel-family`, `client-dsh-panel-family-host`,
  `client-dsh-workspace-live`) in step 1.
- The profile scale (49 patch rows, 48 with `enabled: true`, the factory row carrying none; 51
  installed dependencies, 3 installed-not-enabled), with the machine-local caveat of CM-4.

VOICE

- `:294` two absolutes in one sentence ("EVERY step ... NO separate configuration UI exists") - both
  true, acceptable; `:608` "PLANNED - DEFAULT SEQUENTIAL": confirm the parallel toggle is still
  unshipped before keeping the word.

Acceptance: the ledger table and the verify block carry only `playform/` paths; the policy and pack
sections render their figures from the model; `pnpm Drift`'s ledger checks pass.

### 4.4 `Site/Source/pages/versions.astro` (495 lines)

STALE (P0)

- `:15` "The **fifteen** contracts are identical across the two trees."
- `:47` `Detail: "@playform/hook-dsh-* x 14 + @playform/plugin-dsh-factory"` - the Classic tree is
  53 packages (4 `lib-*`, 13 `plugin-*`, 33 `hook-*`, 3 `client-*`).
- `:54` `Detail: "@playform/ets-hook-dsh-* x 14 + ets-plugin-dsh-factory + ets-base-dsh"` - 48
  packages, 47 twins, six Classic-only.
- `:73` the changelog "all **31** packages (15 Classic, **16** Effect-TS) ship at 0.1.0" - 101
  packages (53 + 48) and the 0.2.0 outlier. The root `CHANGELOG.md` also has a whole `## Unreleased`
  section that the site omits.
- `:168` `STATE: DUAL TREE · IDENTICAL {Counts.Packages} CONTRACTS` renders "IDENTICAL 101
  CONTRACTS", which is false. Correct: 47 SHARED CONTRACTS, 53 CLASSIC, 48 EFFECT-TS.
- `:146` "the same fifteen contracts, built twice".
- `:222` "The totals count the fourteen mechanics suites" - true, but the figure must be labelled as
  the mechanics subtotal now that `Totals` is the folder sum.

FALSE CLAIM (P0)

- `:183-184` "The shipped entries above are **byte-exact from the repository file**." They are not:
  the site's 0.0.1 carries guardians-era entries the root file does not, and the root's "the twelve
  packages in the three implementations (the Boilerplate reference, the Classic release, the
  Effect-TS release)" line is absent from the site. Copy the root file verbatim (including
  `Unreleased`) or drop the claim.

MISSING

- The record for the 2026-10-22 delivery (36 Classic + 30 ETS) and the 2026-10-23/24 completion
  program (waves 0-2 landed, wave 3 in flight, waves 4-5 open), the 0.2.0 panel, the two new
  libraries, and the 511/6612 verification.

Acceptance: no "fifteen" and no "IDENTICAL 101"; the changelog matches the root file byte for byte
or the claim is gone; the operating-set rows name the real package counts.

### 4.5 `Site/Source/pages/flavors.astro` (226 lines)

STALE

- `:83` "**Eleven** capabilities, three kinds." The family now has seven kinds (flavor, role,
  guardian, library, workspace, suggester, orchestration, client). Either scope the page ("the
  normalize flavors and the governance roles of the 101-package family") or extend it.
- `:69` the Description frames the family as the seven flavors, two roles and two guardians - true
  for the 15 legacy modules only; add the scoping words.

VERIFIED-OK (do not touch)

- `Sprite.Badges` = 11 (the SVG has 11 `<symbol>`); the six-flavor fixed order; `Counts.Normalizers`
  = 7; `Counts.Roles` = 2; `Counts.Groups.Guardians` = 2.

MISSING

- The role taxonomy is the natural home for the completion's kinds. Add "the workspace runtime
  roles" after "The roles" (`:191`): librarian (the two libraries), suggester (7), orchestrator
  (10), panel (3).

Acceptance: the page's kind count equals the kinds it actually describes; the sprite count still
renders 11.

### 4.6 `Site/Source/pages/models.astro` (153 lines)

STALE (P0)

- The model catalog has **three** routes
  (`Documentation/Skill/task-routing/references/catalog.md:5-9`: `@cf/zai-org/glm-5.3-flash`,
  `@cf/deepseek-ai/deepseek-v4.1-flash-1017`, `@cf/deepseek-ai/deepseek-v4-flash-0731`). The page
  lists two and calls them "the two battle-tested routes" (`:105`).

UNVERIFIED - do not ship

- `:16`, `:110-113` "Extensively battle-tested on DeepSeek V4.1 Flash & GLM 5.3 Flash token output
  streams." No tree source records a model-stream battle test; the catalog records routing roles.

STALE

- `:149` the notation "the fifteen packages".
- `:43` "the same seven normalizers and three governance hooks" - keep, but scope it to the 15
  legacy modules.

VOICE

- `:42` "Built to serve any LLM." and `:38` the badge "ANY LLM" are unverifiable absolutes. The
  accurate sentence is already on the page (`:101`): the normalizers sit on the harness stream, not
  the model.

Acceptance: three routes; no unverifiable battle-testing claim; no "fifteen".

### 4.7 `Site/Source/pages/workbench.astro` (860 lines)

STALE

- `:87-89` the engine labels "DeepSeek Engine v4" and "GLM Engine 5.3" - the catalog names are
  DeepSeek V4.1 Flash 1017, DeepSeek V4 Flash 0731, GLM 5.3 Flash. Add the third route.

VERIFIED-OK

- The seven flavor hooks, `Counts.Normalizers` = 7, `Counts.StreamFlavors` = 6 armed, the five
  pipeline stages.

MISSING (P1, optional)

- No completion surface is demonstrated. The natural one is the trace bus: a live `observe/stamp` ->
  `graph/indexed` strip. Place it after the ledger stage (`:101`).

Acceptance: the engine list matches the catalog; if the trace strip is added, it names the three
events from `Trace`.

### 4.8 `Site/Source/pages/matrix.astro` (461 lines)

STALE

- `:92` the badge `SMOKES: {Counts.Suites} SUITES` now renders 511, but the page frames the suites
  as "the smoke suites backing the demo rules" (`:46-47`), which are the seven flavor suites.
  Relabel to "511 SUITES FAMILY-WIDE".
- `:287` "That makes **fourteen** suites family-wide." Correct: 511 folders (269 + 242).

VERIFIED-OK

- The seven per-flavor `Counts.*.Classic` values (184, 104 x5, 112) and the sample payloads.

Acceptance: the page states 511; the seven suite figures still render their per-suite values.

### 4.9 `Site/Source/pages/case-study.astro` (1268 lines)

STALE (P0)

- `:278` the Description "How the **twelve-package** family was built".
- `:291` "The development story of the **twelve** packages".
- `:317-318` "From five bundles to **twelve** packages".
- `:322-323` "It is the base that the guardians era (Phase VII) extended to **fifteen** packages".
- `:1248` "twelve packages, twelve green suites".

The history (five bundles to twelve) may stay as history. Every sentence that lands it in the
present must say 101 packages, 511 suites, 6612 checks.

FALSE CLAIM

- `:92-104` `JournalExcerpt` is presented as byte-exact, but its three activation lines carry the
  pre-wave-0b paths, which is three of the 13 Drift failures. Re-copy from the READMEs (5.1).

MISSING (P1)

- No chapter for the completion program. Add "Phase VIII - the completion program": the interview
  decisions D1-D10, the trace bus, the pack layer and its learner, the policy block, the workspace
  tools, the client family, the eleven approved re-specs, and the verification (511 / 6612). Place
  it after Phase VII and extend the in-page index (`:26-36`).
- The decision index (`Decisions.Index` = 12, `Decisions.Count` = 13) stops at the abort-signal fix.
  Add the D1-D10 decisions and the eleven re-specs as a second table, and update `Decisions` in
  `Content.ts`.

VOICE

- `:236` a single 120-word sentence (the voice standard allows one longer sentence per paragraph);
  split it.

Acceptance: no present-tense "twelve"/"fifteen"; the journal excerpt passes Drift; Phase VIII exists
and its figures equal the model.

## 5. The fifteen detail pages

### 5.1 The cross-page fixes (do these once, centrally)

**D-1. The npm install box.**

`Site/Source/Component/Terminal.astro:3-5,24-33` composes `npm install @playform/<pkg>@<release>`
and labels it `CLI INSTALL · NPM · <release>`. Its comment claims the family is on npm with 31
packages. All 101 are unpublished (`PLUGIN-FAMILY.md:36-37,48`). Every detail page renders the box:
`cargo:133`, `ccr:308`, `live:237`, `dash:340`, `ellipsis:262`, `fullwidth:280`, `invisible:284`,
`quotes:267`, `spaces:277`, `governor:211`, `pinner:190`, `tool-coach:343`, `core:96`,
`factory:167`, `file:265`.

Fix: the component renders the build-from-source route (`dsh plugin --profile <name> add <tarball>`,
or the `link:` dependency in the profile) with a `PUBLISHED: NO` state, and the comment states the
unpublished truth. The three "publish-pending ... until the npm release lands" notes go
(`ccr:311-312`, `tool-coach:346-347`, `live-containers:240-241`): they imply the rest are published.

**D-2. The ledger paths (86 concrete occurrences in Source, 67 rendered).**

Replace every concrete `~/.dsh/<pkg>.log` with `~/.dsh/playform/<pkg>.log`. The per-file counts:

| File                                                              | Occurrences      |
| ----------------------------------------------------------------- | ---------------- |
| `Component/Configurator.astro`                                    | 23               |
| `pages/setup.astro`                                               | 15               |
| `pages/plugins/hook-dsh-package-governor.astro`                   | 5                |
| `pages/plugins/hook-dsh-tool-coach.astro`                         | 4                |
| `pages/plugins/hook-dsh-cargo-governor.astro`                     | 4                |
| `pages/plugins/hook-dsh-package-pinner.astro`                     | 3                |
| the six `hook-dsh-normalize-*.astro` pages                        | 3 each           |
| `pages/plugins/hook-dsh-live-containers.astro`                    | 3                |
| `pages/case-study.astro`                                          | 3                |
| `pages/plugins/plugin-dsh-normalize-file.astro`                   | 2                |
| `pages/plugins/hook-dsh-ccr.astro`                                | 2                |
| `Library/FileIcon.ts` (the comment at line 198)                   | 1                |
| `Content/Mermaid/{setup-ledger-verify,live-ledger-log}.{mmd,svg}` | 1 each (4 files) |

The 82 occurrences in the `.astro`/`.ts` files plus the 4 diagram files give the 86 concrete paths.
Five further occurrences are placeholder templates (`~/.dsh/<name>.log`, `~/.dsh/<identity>.log`):
keep the template, fix the example. One of them is `pages/versions.astro:76`, inside the changelog
quote that must stay byte-exact from the root `CHANGELOG.md`; the root file itself still carries the
pre-wave-0b `~/.dsh/<identity>.log` form, so correct the root `CHANGELOG.md` first (a Documentation
change) and re-copy it here - do not edit the site's changelog text in isolation.

Six diagram sources mention a log path and need editing plus `pnpm Diagrams`:
`coach-ledger-log.mmd`, `govcargo-ledger-log.mmd`, `govpkg-ledger-log.mmd`,
`independent-ledgers.mmd`, `live-ledger-log.mmd`, `setup-ledger-verify.mmd`. Two of them also name
the wrong file: `govpkg-ledger-log.mmd:2` says `~/.dsh/hook-dsh-governor-package.log` and
`govcargo-ledger-log.mmd:2` says `~/.dsh/hook-dsh-governor-cargo.log` - those are the logger
prefixes, not the file names; the files are `hook-dsh-package-governor.log` and
`hook-dsh-cargo-governor.log`. `independent-ledgers.mmd:2-3` says `pinner.log` and `governor.log`;
the real files are `hook-dsh-package-pinner.log` and `hook-dsh-package-governor.log`.

**D-3. The byte-exact activation lines.**

The current README lines (copy these bytes; the ledger file form has no module prefix):

```text
[2026-10-03T09:15:22.411Z] activated (anywhere mode, logFile=~/.dsh/playform/hook-dsh-package-governor.log, updateMode=programmatic, ncuBin=/usr/local/bin/ncu, exclude=[node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app], policyFile=(discovery))
[2026-10-03T09:15:22.411Z] activated (pinner, logFile=~/.dsh/playform/hook-dsh-package-pinner.log, sections=[dependencies, devDependencies, peerDependencies, optionalDependencies], exclude=[node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app])
[2026-10-03T09:15:22.411Z] activated (cargo flavor, logFile=~/.dsh/playform/hook-dsh-cargo-governor.log, updateMode=cargo, cargoBin=/usr/local/bin/cargo, exclude=[node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app], policyFile=(discovery), keepFile=(discovery))
hook-dsh-normalize-dash: activated (replacement=-, reasoning=on, toolArgs=off, logFile=~/.dsh/playform/hook-dsh-normalize-dash.log)
hook-dsh-normalize-ellipsis: activated (replacement=..., reasoning=on, toolArgs=off, logFile=~/.dsh/playform/hook-dsh-normalize-ellipsis.log)
hook-dsh-normalize-fullwidth: activated (reasoning=on, toolArgs=off, logFile=~/.dsh/playform/hook-dsh-normalize-fullwidth.log)
hook-dsh-normalize-invisible: activated (replacement=, reasoning=on, toolArgs=off, logFile=~/.dsh/playform/hook-dsh-normalize-invisible.log)
hook-dsh-normalize-quotes: activated (reasoning=on, toolArgs=off, logFile=~/.dsh/playform/hook-dsh-normalize-quotes.log)
hook-dsh-normalize-spaces: activated (replacement= , reasoning=on, toolArgs=off, logFile=~/.dsh/playform/hook-dsh-normalize-spaces.log)
plugin-dsh-normalize-file: activated (replacement=-, logFile=~/.dsh/playform/plugin-dsh-normalize-file.log)
ccr: activated (bundle 0.1.0, targets 8, budget 268435456)
```

Note the four flavors that carry no `replacement=` field (fullwidth, quotes) or an empty/space value
(invisible, spaces), and that the ccr line is unchanged (its source is `hook-dsh-ccr/SCHEME.md:153`,
not the README - the audit verified the other ten lines byte-exact in the package READMEs).

**D-4. The inverted logger prefixes.**

The factory composes every logger line as `<module>: <message>`. The module identities differ from
the package names for four packages:

| Package                     | Logger prefix               | Ledger file                                     |
| --------------------------- | --------------------------- | ----------------------------------------------- |
| `hook-dsh-package-governor` | `hook-dsh-governor-package` | `~/.dsh/playform/hook-dsh-package-governor.log` |
| `hook-dsh-cargo-governor`   | `hook-dsh-governor-cargo`   | `~/.dsh/playform/hook-dsh-cargo-governor.log`   |
| `hook-dsh-package-pinner`   | `hook-dsh-pinner-package`   | `~/.dsh/playform/hook-dsh-package-pinner.log`   |
| `hook-dsh-ccr`              | `ccr`                       | `~/.dsh/playform/hook-dsh-ccr.log`              |

Sources: `hook-dsh-package-governor/Source/Function/Apply.ts:45`,
`hook-dsh-cargo-governor/Source/Function/Apply.ts:47`,
`hook-dsh-package-pinner/Source/Function/Apply.ts:41`, `hook-dsh-ccr/Source/Function/Apply.ts:95`;
smoke-asserted at `hook-dsh-package-governor/Source/Test/Chain-Pass/Test.ts:127` and
`Update-Stage/Test.ts:537`. Any page line written as `hook-dsh-package-governor: ...` or
`hook-dsh-package-pinner: ...` is wrong.

**D-5. The P5 journal record.**

No page mentions the shared `package_governance` v2 record. The normalize hooks journal `normalized`
on every N > 0 pass (`hook-dsh-normalize-*/Source/Function/Normalize.ts:99-108`); the governors
journal `activated`, `excluded`, `governed` and the update events
(`hook-dsh-package-governor/Source/Function/{Apply.ts:83,Observe.ts:46-47,Transform.ts:93,Dispatch.ts:65}`);
the cargo governor at `Apply.ts:89`; the ccr hook at `Apply.ts:146-152`. The pages say "Two lines,
both written through the factory's Append" and "uses only State ... and Append" - both now false.

**D-6. The ETS twin.**

None of the 15 pages names its `ets-*` twin (47 exist). Add one line per page, in the hero or the
"Where It Fits" section: `@playform/ets-<name>`.

**D-7. The family total.**

`${Counts.Packages} TOTAL` in the "Related plugins" metadata now renders 101. Verify in the built
page; do not hand-edit the figure.

### 5.2 The per-page table

Line numbers are stable (the pages are untouched since 11:21). "Verified" means the audit re-derived
the fact from the tree.

| Page                                                | Stale                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Missing                                                                                                                                                                                                                                       | Verified-OK (do not touch)                                                                                                                                                                 |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `lib-dsh-core.astro` (908)                          | `:69`,`:129` "Consumed by **thirteen** packages" - verified 46 Classic dependents plus 12 EffectTS; `:89-90`,`:112`,`:302`,`:307` "TWO HALVES" - the library documents three (governance, normalize/stream, overpass); `:252` "ALL fifteen plugins"; `:173` "same behavior, same smokes" - the core pair is 15/14; `:896-900` "core-smoke.mjs ... exercises EVERY helper" - the `.mjs` suites are retired; the nine folders cover Block/Chunk/Data-Lists/Expand/Policy/Refusal/Replace/Suppress/Tables, not Activate/Update/Overpass                                                        | the Overpass half (RewriteBlocks, StepBatch, ToolResults, Command, the `normalize-overpass` command); `Expand`; the consumer map                                                                                                              | the six tables (Quotes 8, Fullwidth 94, the four classes); Replace/ReplaceMap; the three structural exemptions; zero Classic runtime deps; the 15/14 pair                                  |
| `plugin-dsh-factory.astro` (567)                    | `:19`,`:158` methods - the reader is fixed to 19, verify the render; `:204`,`:260` "EVERY other package consumes it" - verified 45 Classic dependents, seven do not (the three `client-*`, `lib-dsh-core`, `lib-dsh-pack`, `lib-dsh-trace`, `lib-dsh-workspace-live`); `:56-77` the consumers table has four rows, the real surface is 45; `:265` the mutation tools omit `raw-write`; `:393-398` "node factory-smoke.mjs" - retired; `:442`,`:445` "shared:false emits no logFile" - it emits `log` and `logFile` (default `""`)                                                           | the D5 trace bus (`ctx.trace`, the envelope, the three events, the ring, the adapters); the D6 policy block (section 2.19, 8 actions); the pack layer; the 45-consumer surface                                                                | the 19 method names; the class/inject contract; the Schema/Write/GuardedWrite/Refresh/Continue/State/Wire/Attach/Journal/Seam/UpdateKey/RegisterGovern/Govern semantics; 54 Classic checks |
| `plugin-dsh-normalize-file.astro` (912)             | `:179`,`:205` the ledger path; `:230` "LISTENER-LESS TOOL" - it registers two listeners; `:249-254`,`:413-414`,`:511-512` "no listener of any kind / Zero background activity" - the overpass arms; `:601-610` the config surface omits `scopes` and `toolResultsExempt`; `:831-838` "Two lines" - a third line exists (`command "normalize-overpass" registration skipped ...`)                                                                                                                                                                                                            | the core overpass scaffolding; the third ledger line; the two config rows                                                                                                                                                                     | the pipeline; the six-fold order; the standing policy; the exec actor; the seven siblings; the command grammar                                                                             |
| `hook-dsh-package-governor.astro` (749)             | `:27`,`:34` `governor.log` / `pinner.log` - the real files are `hook-dsh-package-governor.log` / `hook-dsh-package-pinner.log`; `:53` the path; `:71`,`:555` the mutation tools omit `raw-write`; `:108-110` the excerpt uses `<project>/` where the README uses `~/Projects/`; `:130` the registry-miss string omits ` - chain pass skipped`; `:133` `update: DONE` / `update: FAILED` shorthand; `:391` "ncuBin is absolute" - the default is bare `ncu`                                                                                                                                  | the P5 journal; the Refusal guard and the REFUSED line; the 24-string ledger vocabulary (the page has six)                                                                                                                                    | the three-hook table; the composition semantics; the direct-govern registration; the gate pipeline; the verifyCommand trap lines; the em-dash claim is correct                             |
| `hook-dsh-package-pinner.astro` (862)               | `:97`,`:689`,`:740-741` the path; `:690` the mutation tools; `:744-746` the logger prefix (must be `hook-dsh-pinner-package`); `:662-665` "replaceIfVersion at the observed version" - the basis is a fresh stat; `:57-64` the pipeline omits the fresh-stat probe                                                                                                                                                                                                                                                                                                                          | the tilde-expanded ledger path (`Expand`); the `Activate` composer; the P5 `activated` record                                                                                                                                                 | the range law; the keep-list union; the refusals; the four sections; the six ledger strings; idempotence                                                                                   |
| `hook-dsh-cargo-governor.astro` (685)               | `:45`,`:481`,`:596`,`:600` the path; `:484` the mutation tools; `:56` the registry-miss string; `:53-62` eight of the README's 24 ledger strings; `:125` "Every claim below is live-verified (2026-10-03)" - a stamp that predates the completion program; `:649-651` the "fixture display forms" claim has no tree source                                                                                                                                                                                                                                                                  | the P5 journal; the G4 Dispatch/Settle envelope's real home (core `Function/Update`); the 16 missing ledger strings                                                                                                                           | the full-version table; the cargo/cargo-edit claims; the RegisterGovern pairs; the four Verify lines (byte-exact in both trees); the serde/tokio example                                   |
| `hook-dsh-ccr.astro` (928)                          | `:98`,`:701` `~/.dsh/ccr.log` - the default is `~/.dsh/playform/hook-dsh-ccr.log`; `:223-232` eight of the nine ledger strings (missing `ccr: evicted <hash> (ttl)`); `:174-178`,`:714` three phase-4 knobs missing (`contextEngineThresholdPct` 30, `protectFirstTurns` 2, `protectLastTurns` 4); `:353` "THE FIRST family member on tools/post-execute" - no source; `:877-878` "NO live containers" - false since the detach transform                                                                                                                                                   | the P5 activation record; the live-containers sibling on the same waterfall; the three knobs                                                                                                                                                  | the targets/exempt lists; the thresholds and multipliers; the gate order; the sha256-24 retrieval; the activation line                                                                     |
| `hook-dsh-live-containers.astro` (582) - most stale | `:218` "Planned - not yet in the profile" - it is in the profile's bundles (`~/.dsh/profiles/desktop/package.json:25`) and its patch row sets `enabled: true` (`cordis.patch.yml:627-630`); `:220-223` "NEVER appears in the profile's bundles"; `:198` "STATUS: SHIPS DISABLED" - the bundle default, presented as the live status; `:86`,`:347`,`:493` the path; `:262` the inject list (now seven services); `:273`,`:277` "NON-MANIFEST (no fs/observed Wire)" - the wave-3 Wire; `:474`,`:477` "the time block re-renders" - the default table has no `kind: "time"` entry             | the wave-2/3 surface: the detach transform, the completion report, the planted boards and lease, the failsafes, the suggester, the wave-3 monitors and their storage domain, the four tools, the seven-service inject, the ~45 ledger strings | the 14-entry default table (three enabled); the six rendered kinds; the frame bytes; the phase-1 config defaults; the nine phase-1 strings; "the programmable stage is FUTURE" is correct  |
| `hook-dsh-tool-coach.astro` (794)                   | `:113`,`:499`,`:642`,`:726` the path; `:362-365` the inspect card lists three events (the page's own table lists five); `:630-655` the config example omits `exemptPatterns`, `patternTable`, `notes`                                                                                                                                                                                                                                                                                                                                                                                       | the live-containers grammar teaching (the shipped profile overrides `notes.persistent`); the complete config example                                                                                                                          | the five-listener table; the tiers and thresholds; the 24 built-in patterns; the ten ledger strings; the inject list                                                                       |
| `hook-dsh-normalize-dash.astro` (1188)              | `:151`,`:264`,`:842` the path; `:321-322` "seventeen exotic relatives" - the class has 24 code points (em + en + 22); `:357-358` the inject list (now `pluginFactory`, `fs`, `tools`); `:355-356` the event list omits the two overpass arms and the command; `:289`,`:44-54`,`:114-122` the name exemptions list `edit`/`raw-write` but the core exempts three (`edit`, `raw-write`, `normalize-file`, `Chunk.ts:184-186`); `:436` "fs/write-intent and fs/observed NEVER see it" - the plugin registers `raw-write`; `:1107-1112` "Two lines"; `:1033-1034` a duplicated, broken sentence | the journal record; the `scopes` and `toolResultsExempt` rows; the global-off snippet                                                                                                                                                         | the six scopes and defaults; the `toolResultsExempt` list; the dashes class; the six-fold order; the overpass lines; the command grammar                                                   |
| `hook-dsh-normalize-quotes.astro` (839)             | `:184`,`:218`,`:575` the path; `:219` `normalized 10 quote char(s)` - the sample has six and the README prints 6; `:201` the exemption; `:358-359` "ONLY State and Append"; `:789-793` "Two lines"; `:54-57` the pipeline                                                                                                                                                                                                                                                                                                                                                                   | the journal record; the "six of the eight forms" caveat; the global-off snippet                                                                                                                                                               | the eight quote entries; no `replacement` field; the scopes tables; the overpass arms                                                                                                      |
| `hook-dsh-normalize-ellipsis.astro` (831)           | `:175`,`:217`,`:554` the path; `:248` "EVERY typographic three-dot ellipsis code point" - only U+2026; `:200`,`:43-50`,`:766` the exemption; `:782-792` "Two lines"                                                                                                                                                                                                                                                                                                                                                                                                                         | the journal record; the config rows; the global-off snippet                                                                                                                                                                                   | the ellipsis class; the per-code-point counting; the inject list; the scopes                                                                                                               |
| `hook-dsh-normalize-fullwidth.astro` (859)          | `:199`,`:233`,`:583` the path; `:216` the exemption; `:371-372` "uses only State ... and Append"; `:809-811` "Two lines"; `:42-45` the pipeline; `:185` the swept-overpass line belongs to `plugin-dsh-normalize-file` (`Command.ts:78`)                                                                                                                                                                                                                                                                                                                                                    | the journal record; the global-off snippet                                                                                                                                                                                                    | the fullwidth range; the seven range rows; the sibling table; the count 4                                                                                                                  |
| `hook-dsh-normalize-invisible.astro` (874)          | `:193`,`:235`,`:593` the path; `:217` the exemption; `:375-376` "uses ONLY State ... and Append"; `:821-825` "Two lines"; `:43-45` the pipeline; `:179` the swept line                                                                                                                                                                                                                                                                                                                                                                                                                      | the journal record; the global-off snippet                                                                                                                                                                                                    | the invisible class; the removal default; the sample's seven characters; the scopes                                                                                                        |
| `hook-dsh-normalize-spaces.astro` (870)             | `:188`,`:231`,`:586` the path; `:213` the exemption; `:368-369` "uses only State ... and Append"; `:816-820` "Two lines"; `:43-45` the pipeline; `:174` the swept line; `:772`,`:787` "echo a - b" - the README's example is `echo a b` with a no-break space between the arguments, no hyphen                                                                                                                                                                                                                                                                                              | the journal record; the global-off snippet                                                                                                                                                                                                    | the spaces class; Zs minus ASCII; `replacement` a single space; the count 3                                                                                                                |

Also on the four normalize pages: the YAML "Example cordis.patch.yml row" omits
`normalizeToolArguments: true` while the prose says the example patch turns it on. The shipped
`cordis.patch.yml` sets it.

## 6. The components, the diagrams, the design docs

| File                           | Finding                                                                                                                                        | Fix                                                                                 |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `Component/Terminal.astro`     | the npm promise (`:3-5`,`:24-33`)                                                                                                              | D-1                                                                                 |
| `Component/Configurator.astro` | 23 stale ledger paths; 14 slots (omits `hook-dsh-live-containers` and the 36 new packages); `:656` the comment "The commands are the npm form" | D-2; decide the slot set (the 15 legacy modules or the 101) and state it            |
| `Component/StatsBand.astro`    | `:3` the comment "31 packages / 1314 + 1324 checks"                                                                                            | the comment only; the render is correct                                             |
| `Content/Mermaid/*.mmd`        | six sources name a log path (5.1 D-2)                                                                                                          | edit, then `pnpm Diagrams`, then verify the containment law on the re-rendered SVGs |
| `Scripts/Drift-Guard.mjs`      | scans only `Source/pages`                                                                                                                      | CM-6                                                                                |
| `Library/Screens.ts`           | the registry plates (2.3)                                                                                                                      | rework the publish state and the module count                                       |
| `DESIGN.md:12`                 | "31 npm packages"                                                                                                                              | 101                                                                                 |
| `README.md` (site)             | verify it carries no 15-package framing                                                                                                        | re-grep                                                                             |

## 7. The ranked worklist

### P0 - the false facts and the false promises (ship-blocking)

**P0-1. The ledger vocabulary.** D-2, D-3, D-4, plus the six diagrams.

- Files: the 16 `.astro`/`.ts` files in the D-2 table, `Screens.ts`, `FileIcon.ts`, the six `.mmd`
  sources, then `pnpm Diagrams`.
- Acceptance: `pnpm Drift` reports 0 failures (the 13 ledger checks are this item);
  `grep -r '~/\.dsh/[a-z-]*\.log' Site/Target --include=*.html | grep -v playform` is empty; the six
  SVGs are re-rendered and no label sits outside the viewBox.

**P0-2. The npm promise.** D-1, plus `plugins.astro:19-23,225,345,347,369,371`,
`setup.astro:355-356`, `ccr:311-312`, `tool-coach:346-347`, `live-containers:240-241`,
`Screens.ts:72-81`.

- Acceptance: `grep -r 'npm install @playform' Site/Target --include=*.html` is empty; every install
  surface states "unpublished - build from source" and links the repository.

**P0-3. The count claims.** 47 "fifteen" occurrences plus the explicit false numbers:
`versions.astro:15,47,54,73,168`; `lib-dsh-core:69,129,252`; `factory:204,260,56-77`;
`index:226,255,406,425,733`; `models:149`; `plugins:25,164,203,225,235,455,456,473,629`;
`case-study:278,291,317,318,322,323,1248`; `flavors:83`. Read every number from the model.

- Acceptance: `grep -rioE '\b(fifteen|31 packages|fourteen|twelve)\b' Site/Target --include=*.html`
  returns only the historical case-study sentences; the rendered numbers equal the model.

**P0-4. The "byte-exact" claims that are not.** `versions.astro:183-184` (the changelog),
`case-study.astro:92-104` (the journal excerpt), `setup.astro:464` (`ncuBin=ncu` versus the README's
`/usr/local/bin/ncu`), `case-study.astro:98-104` (`<project>/` versus `~/Projects/`).

- Acceptance: no page claims byte-exactness for a string that differs from its source; Drift's
  ledger checks pass.

**P0-5. The live-containers status inversion.** `live-containers:198,218,220-223`.

- Acceptance: the page's status matches the profile's bundles list and patch row, or the claim is
  removed (see CM-4).

**P0-6. The ccr "no live containers" claim.** `ccr:877-878`.

- Acceptance: the sentence states the detach-result fact or is deleted.

**P0-7. The models page.** three routes; delete the unverified battle-testing sentence
(`models:16,105,110-113`).

- Acceptance: three routes render; no unverifiable model claim.

### P1 - the missing completion content

1. `plugins.astro` - the 36 new packages in five groups, the twin markers, the three new seams.
2. `index.astro` - the "workspace runtime" band, the two libraries, the client family.
3. `versions.astro` - the delivery and completion record, the `Unreleased` changelog, the 0.2.0
   panel.
4. `case-study.astro` - Phase VIII and the D1-D10 decision table.
5. `setup.astro` - the policy block, the pack files, the storage domains, the client bundles, the
   profile scale with the machine-local caveat.
6. `lib-dsh-core` - the Overpass half and `Expand`.
7. `plugin-dsh-factory` - the trace bus, the policy block, the pack layer, the 45-consumer table.
8. `plugin-dsh-normalize-file` and the six flavors - the `package_governance` journal record.
9. `hook-dsh-live-containers` - the wave-2/3 surface.
10. All 15 detail pages - the ETS twin line.
11. `models.astro` - the third route; `workbench.astro` - the third route (optional).
12. `flavors.astro` - the completion's role kinds.

- Acceptance per item: the new section's figures come from the model (no literal), the build emits
  the page, and `grep` in `Target/` finds the new surface's name and its figure.

### P2 - the wording

- The banned word "by construction" - `hook-dsh-normalize-dash:614`.
- False absolutes: `live-containers:211,212,222,477`; `ccr:877`; `ellipsis:248,427`;
  `quotes:426-427`; `fullwidth:441,645-646`; `invisible:451-452,633,655-656`;
  `pinner:466-468,499,638`; `tool-coach:490,601`; `factory:401,529-536`; `file:414,426,452-456`;
  `models:42`; `matrix:287`.
- Passive voice: `file:846`; `pinner:754`; `factory:301,331`; `cargo:259,473`; `quotes:500`;
  `spaces:517`; `dash:583-584`.
- Internal notes rendered in the shipped HTML: `cargo:628,649-651`; `ccr:853`; `live:509,544`;
  `dash:849-853,1121`; `ellipsis:560-564`; the 18 imperative diagram briefs on `lib-dsh-core` (for
  example `:308` "Do not depict the core as a registered plugin.").
- Labels-as-headings on every detail page: "Where It Fits", "In the DeepSeek Harness", "The
  Problem", "How It Works", "The Config", "In Action", "The Ledger", "Known limits", "Related
  plugins".
- The broken sentence: `hook-dsh-normalize-dash:1033-1034`.
- The stale comments in 2.2 CM-2.

- Acceptance: no banned word in `Site/Target`; no rendered HTML comment (Astro keeps `<!-- -->`);
  every heading is a claim; the built pages contain no "fifteen" and no broken duplication.

## 8. The residual unknowns - do not ship

1. **The build itself.** The audit did not run `pnpm prepublishOnly` (read-only lane). Re-run it
   after the P0 edits; it is the only verification.
2. **The @-sentence identities for `lib-dsh-trace`, `lib-dsh-pack`, `hook-dsh-ccr`.** No tree source
   assigns them a four-segment identity; cite the package README or drop the field (CM-3).
3. **The profile figures are machine-local.** `Live.ReadProfile()` reads `~/.dsh`; a machine without
   the desktop profile silently serves the fallback. Label it or drop it (CM-4).
4. **The models' "battle-tested" claim.** No tree source; the catalog records routing roles only.
5. **The parallel-govern toggle.** `setup.astro:608` says PLANNED; confirm it is still unshipped
   before keeping the word.
6. **The cargo "fixture display forms (`<repo-root>/`, `$DSH_HOME/`)"** (`cargo:649-651`) and the
   governor's "documented cordis registry trap" (`:700`): no corpus source. Do not ship.
7. **`hook-dsh-ccr:353` "THE FIRST family member hooked on tools/post-execute"**: no source assigns
   "first". Drop the word.
8. **ETS behavioural parity ("same behavior")**: not tree-verifiable, and the counts already diverge
   (15/14, 54/43, 79/82). Say "the same contracts".
9. **The ccr live state.** `hook-dsh-ccr` is installed in the desktop profile but absent from the 48
   bundle rows; any page claiming ccr is live is wrong, and the "outermost prepend" ordering is
   load-order dependent.
10. **The live-containers "time block" example.** The default block table has no `time` entry (14
    wave-2 catalog kinds, three enabled). Re-derive the example from `DefaultBlocks.ts`.

## 9. The execution order and the gate

1. P0-1 (the ledger vocabulary) - it clears 13 of the 13 Drift failures.
2. P0-2 (the npm promise) - it clears the primary conversion path.
3. P0-3 to P0-7 - the counts and the five false claims.
4. Run the gate: `pnpm prepublishOnly`; `pnpm Drift`; the three greps (the ledger path, the npm
   command, the count words). Report the built page count (25) and the Drift count.
5. P1 in the order listed, re-running the gate after each page.
6. P2 last, in one pass, re-running the gate.

### 9.1 The lane sequencing (the build is a shared resource)

`Site/Target/` is ONE artifact. Two lanes building it at once overwrite each other's output, and a
gate run against a mixed build proves nothing. The build turn is serialised:

1. **`site-pages-top`** (the nine top-level pages) is running now and holds the build turn. It
   builds `Site/Target/` and reports.
2. **The detail-pages lane** (the fifteen `plugins/*.astro` pages) edits its pages but must NOT run
   `pnpm prepublishOnly` until the top lane reports its build complete. It waits for the turn.
3. **The final verification lane** runs LAST: one build over the combined tree, then `pnpm Drift`
   and the three greps of section 7. Its report is the READY-TO-COMMIT evidence.

The turn passes top -> detail -> verification. Never two builds at once, and no lane reports a gate
result from a build it did not make. The 11:51 `Site/Target/` build belongs to the model lane and is
superseded by the top lane's build.

The lane reports READY-TO-COMMIT for `Site/` only when all three gate commands are clean and the
page count is 25.

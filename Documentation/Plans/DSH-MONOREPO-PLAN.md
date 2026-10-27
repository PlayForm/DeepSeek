---
title: The DeepSeek Harness Plugin Family Monorepo
category: Plans
kind: living-plan
date: 2026-10-07
status: active
registry: Documentation/Plans/DSH-MONOREPO-PLAN.md
index: Documentation/INDEX.md
statuses:
    - name: the monorepo layout (Classic/EffectTS/Site/Test/Documentation/Maintain)
      state: implemented
      evidence: the directories exist; 51 + 46 packages at 0.1.0, all unpublished
    - name: the Classic release (the anonymized packages)
      state: implemented
      evidence:
          Classic/packages - 51 packages at 0.1.0 (14 original plugins + the core library + the 36
          packages of the 2026-10-22 delivery)
    - name: the EffectTS release (the ets-* split)
      state: implemented
      evidence:
          EffectTS/packages - 46 packages including ets-base-dsh (30 new twins in the delivery)
    - name: the Site (the static showcase)
      state: implemented
      evidence: 24 pages, build green
    - name: the Test archive (the curated fixtures)
      state: implemented
      evidence: Test/fixtures plus the README index
    - name: the submodule structure (each package its own repo)
      state: open
      evidence: not started
    - name: the npm publishing
      state: deferred
      evidence: a later session - see Documentation/Plans/TRUSTED-PUBLISHER.md
---

# DSH-MONOREPO-PLAN - The DeepSeek Harness Plugin Family Monorepo

> ONE of the planning documents migrated to `Documentation/Plans/`. The BRANDING constraints it
> cites live in `../Brand/BRANDING.md`. See also `TOMORROW-REVIEW.md` (the descriptive state of the
> monorepo as built) and `CASE-STUDY-PLAN.md` (the Site's case-study dimension).

The plan for `~/Developer/Application/PlayForm/DeepSeek/` as the family monorepo covers the
boilerplate reference, the two official releases (Classic and Effect-TS), the static Site, and the
Test archive.

The `~/.dsh` originals STAY LIVE, and the functionality survives every restart.

The monorepo hosts the copies and the new implementations.

The outer `~/Developer/Application/PlayForm/` remains the broader monorepo, where the DeepSeek dir
is ONE of its projects, like Aphrodite.

---

## 1. THE STRATEGY

- **The `~/.dsh` profile stays untouched and LIVE.** The twelve bundles, the smokes, and the profile
  wiring keep running on EVERY restart, and nothing in the monorepo development ever changes
  `~/.dsh`.
- **`DeepSeek/Boilerplate` = the reference copy** of the twelve bundles (the Sources, the configs,
  the built Targets, the smokes), which is the frozen baseline that the releases derive from. The
  copy EXCLUDES the per-bundle `node_modules`, which the per-bundle `pnpm install` reproduces, and
  it EXCLUDES the profile-specific wiring, where the `cordis.patch.yml` values stay as the shipped
  examples and the personal paths are the job of the #12 anonymization on the release side and NOT
  on the reference side.
- **`DeepSeek/Classic` = the Classic release** (ONE package per repository at publish time,
  developed inside the monorepo first), which holds the cleaned, de-personalized, restructured
  implementations through register #12 (anonymization plus the Aphrodite README borrow) and #15 (the
  reversed hierarchical names such as `hook-dsh-cargo-governor`). [ANNOTATED 2026-10-09:
  SPLICE-ETS.md resolved #15 - the trees now carry unique names. The Classic carries the plain
  @playform/dsh-* forms with the three token-reordered names, and the EffectTS carries the
  @playform/ets-* forms plus the base @playform/ets-base-dsh.]
- **`DeepSeek/EffectTS` = the Effect-TS v4 release** (register #13), with the same package
  identities as the Classic and internals that are re-implemented on Effect-TS (the tracing, the
  ecosystem interop, and the parallel-govern toggle from #14 designed in from the start). Its smokes
  prove parity against the behavior of the Classic, where the ledger strings stay the contract.
- **`DeepSeek/Site` = the static hosting site**, which adopts the
  `~/Downloads/stitch_playform_dsh_plugin_branding_system` design (DESIGN.md with the "Technical
  Minimalist Harness" blue and white tokens, Inter and JetBrains Mono, and the Material-style
  spacing; code.html with the family landing page; screen.png as the visual reference). The Site is
  blue and white ONLY, with clean headers under the `Documentation/Brand/BRANDING.md` constraints.
- **`DeepSeek/Test` = the archive**, where everything currently in
  `~/Developer/Application/PlayForm/DeepSeek/` moves. The archive takes the live fixtures: the
  governed-chain, cargo-fixture, the locktree, prun, and coder trees, the fixture .md files, and the
  probes. The content is organized, so the monorepo root is clean.
- **The monorepo tooling** is a pnpm workspace with the packages globs for the three package sets,
  the root scripts that build and test per set, and the shared docs.

## 2. THE LAYOUT (the full tree)

```
~/Developer/Application/PlayForm/DeepSeek/
├── package.json                      # the private root: workspaces + scripts
├── pnpm-workspace.yaml               # packages: Boilerplate/packages/*, Classic/packages/*, EffectTS/packages/*
├── README.md                         # the family monorepo readme (the @-sentence identity)
├── Documentation/                    # the family docs, topically separated:
│                                     #   Handoff/ (the restructured handoff: Overview, Packages/, Register, Lessons),
│                                     #   Reports/ (the AUDIT/DELIVERY/DIAGNOSIS/FLAVOR-DESIGN reports),
│                                     #   Plans/ (the monorepo plan, the case-study plan, the TOMORROW-REVIEW),
│                                     #   Guides/ (the Governor-*.md bundle guides), Brand/ (the BRANDING brief),
│                                     #   Skill/ (the three skills)
├── Boilerplate/                      # THE REFERENCE (frozen at 5982aa8)
│   ├── README.md                     # the boilerplate readme (the package inventory table)
│   ├── packages/                     # the twelve bundles, as-is:
│   │   ├── plugin-dsh-factory/       #   (Source/, Target/, Configuration/, package.json,
│   │   ├── lib-dsh-core/            #    cordis.patch.yml example, pnpm-workspace.yaml,
│   │   ├── hook-dsh-package-governor/ #   tsconfig.json - NO node_modules)
│   │   ├── hook-dsh-package-pinner/
│   │   ├── hook-dsh-cargo-governor/
│   │   ├── hook-dsh-normalize-dash/
│   │   ├── hook-dsh-normalize-quotes/
│   │   ├── hook-dsh-normalize-ellipsis/
│   │   ├── hook-dsh-normalize-spaces/
│   │   ├── hook-dsh-normalize-invisible/
│   │   ├── hook-dsh-normalize-fullwidth/
│   │   └── plugin-dsh-normalize-file/
│   └── smokes/                       # the twelve smoke suites (the paths adapted to the monorepo)
│       ├── core-smoke.mjs · factory-smoke.mjs · governor-smoke.mjs · pinner-smoke.mjs
│       ├── cargo-smoke.mjs · normalize-dash-smoke.mjs · the five flavor smokes
│       └── normalize-file-smoke.mjs
├── Classic/                          # THE CLASSIC RELEASE (developed here, published per-repo)
│   └── packages/                     # the twelve release packages (the #15 names, the #12 cleanup):
│       ├── plugin-dsh-factory/       #   lib-dsh-core, hook-dsh-package-governor,
│       ├── lib-dsh-core/             #   hook-dsh-package-pinner, hook-dsh-cargo-governor,
│       ├── hook-dsh-package-governor/ #  hook-dsh-normalize-{dash,quotes,ellipsis,spaces,
│       ├── hook-dsh-package-pinner/  #    invisible,fullwidth,file}
│       ├── hook-dsh-cargo-governor/
│       └── hook-dsh-normalize-*/     #   (each: the de-personalized Sources, the Aphrodite
│                                     #    README, the smoke, the publish config)
├── EffectTS/                         # THE EFFECT-TS V4 RELEASE (register #13 + #14)
│   └── packages/                     # the same package identities, the Effect internals:
│       ├── plugin-dsh-factory/       #   the service as Effect layers; the tracing spans
│       ├── lib-dsh-core/             #   the pure helpers as Effect pipelines/Streams
│       ├── hook-dsh-package-governor/ #  the chain as typed effects; the parallel-govern toggle
│       ├── ... (the same twelve)     #   the smokes proving parity (the ledger strings)
├── Site/                             # THE STATIC SITE (the stitch design)
│   ├── index.html                    # the landing (the stitch code.html adopted: the hero,
│   │                                 #   the CLASSIC/EFFECT-TS badges, the terminal install)
│   ├── DESIGN.md                     # the design system (the stitch DESIGN.md adopted/evolved:
│   │                                 #   the blue/white tokens, Inter + JetBrains Mono, the scale)
│   ├── assets/                       # the branding assets (the stitch screen.png, the logos,
│   │                                 #   the flavor/role/version badges)
│   ├── pages/                        # the sub-pages: products, versions, flavors, models
│   ├── styles/                       # the tokens.css (the DESIGN.md tokens), the layout.css
│   └── README.md                     # the site's readme (how the design maps to the family)
├── Test/                             # THE ARCHIVE (the current DeepSeek contents moved here)
│   ├── fixtures/                     # the governed-chain/, cargo-fixture/, governed-test/,
│   │                                 #   locktree*/· prun-*/, coder-*/, node_modules/
│   ├── fixtures-md/                  # the fixture .md files (mdash, raw-write, tool-args,
│   │                                 #   raw-marker, granular-normalize, normalize-file)
│   ├── probes/                       # the raw-write-probe/ + the excluded probes
│   └── README.md                     # the archive index (what each fixture proves)
└── LICENSE.md                        # the family license (the @playform conventions)
```

## 3. THE MONOREPO TOOLING

- **The pnpm workspace** holds
  `packages: [Boilerplate/packages/*, Classic/packages/*, EffectTS/packages/*]` with the Aphrodite
  conventions (the hoisted linker and the min release age). The per-bundle `pnpm-workspace.yaml`
  files (`packages: [.]`) keep the bundles self-contained for the standalone builds and publishes.
- **The root scripts** are `build:boilerplate`, `build:classic`, `build:effect-ts`, `test` (the
  twelve-suite runner per set), and `smoke` (the archive runner).
- **The naming**: the Boilerplate keeps the current names, the Classic and the EffectTS use the #15
  reversed names (the @-sentences), and the packages are separate repositories at publish time while
  the monorepo stays the development home.

## 4. THE SITE DESIGN (the stitch adoption)

- The `~/Downloads/stitch_playform_dsh_plugin_branding_system/` package is the source: DESIGN.md
  with the tokens (primary #003ec7, primary-container #0052ff, the white surfaces, Inter and
  JetBrains Mono, headline-lg-md-xl, and the spacing scale), code.html with the working page (the
  fixed header "@playform / DSH Family", the eyebrow badges (ECOSYSTEM: @PLAYFORM / CLASSIC /
  EFFECT-TS), the hero sentence, the terminal install box, and the products and flavors sections),
  and screen.png.
- The Site adapts it into the landing (index.html), the sub-pages (products, versions, flavors,
  models), the tokens as CSS custom properties, blue and white ONLY, and the clean headers under the
  exact `Documentation/Brand/BRANDING.md` constraints.

## 5. THE EXECUTION ORDER

1. **Phase 0 - the archive.**

    Move the current `DeepSeek/` contents (the fixtures) into `DeepSeek/Test/` in an organized form,
    and create the monorepo skeleton with the root package.json, pnpm-workspace.yaml,
    Documentation/, and README.

2. **Phase 1 - the boilerplate.**

    Copy the twelve bundles and the smokes into `DeepSeek/Boilerplate/` with NO node_modules, and
    adapt the paths of the smokes to the monorepo.

    Verify that the boilerplate smokes pass standalone with the Targets copied, that the `~/.dsh`
    originals stay untouched, and that the live family is still green.

3. **Phase 2 - the Classic.**

    Scaffold the twelve release packages under `Classic/packages/` from the boilerplate copies, and
    then execute #12 (anonymize plus the Aphrodite READMEs) and #15 (the names) per package.

4. **Phase 3 - the EffectTS.**

    Scaffold the twelve packages under `EffectTS/packages/` with the same identities, and
    re-implement the internals on Effect v4 through the #13 mapping: the core helpers as Effect
    pipelines, the factory as layers, the chain as typed effects plus the tracing spans, and the #14
    parallel toggle.

    The parity smokes are the arbiter.

5. **Phase 4 - the Site.**

    Adopt the stitch design into `Site/` with the tokens, the landing, the sub-pages, and the
    assets.

6. **Phase 5 - the docs and the handoff.**

    Update the monorepo docs and the handoff with the new layout, the paths, and the live-test
    references.

## 6. THE CONSTRAINTS

- The `~/.dsh` originals NEVER change during this work, and the live family is verified green after
  EVERY phase through the smokes and the ledgers.
- The ledger strings stay the byte-identical smoke contract in ALL three implementations (the
  Boilerplate, the Classic, and the EffectTS).
- The Site is blue and white ONLY, with the clean headers of the `Documentation/Brand/BRANDING.md`.
- The development runs through coder subagents, the smokes are the arbiter, and the USER commits,
  while agents commit nothing.
- The new home of the live fixtures (`DeepSeek/Test/`) becomes the sandbox fixtures root for the
  future live batteries, and the fixture references of the handoff update.

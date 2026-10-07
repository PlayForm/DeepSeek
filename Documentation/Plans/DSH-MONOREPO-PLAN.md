# DSH-MONOREPO-PLAN - The DeepSeek Harness Plugin Family Monorepo

> One of the planning documents migrated to `Documentation/Plans/` (the BRANDING constraints it
> cites live in `../Brand/BRANDING.md`). See also `TOMORROW-REVIEW.md` (the descriptive state of the
> monorepo as built) and `CASE-STUDY-PLAN.md` (the Site's case-study dimension).

The plan for `~/Developer/Application/PlayForm/DeepSeek/` as the family monorepo: the boilerplate
reference, the two official releases (Classic + Effect-TS), the static Site, and the Test archive.
The `~/.dsh` originals STAY LIVE (the functionality survives every restart); the monorepo hosts the
copies + the new implementations. The outer `~/Developer/Application/PlayForm/` remains the broader
monorepo (the DeepSeek dir is one of its projects, like Aphrodite).

---

## 1. THE STRATEGY

- **The `~/.dsh` profile stays untouched and live.** The twelve bundles + the smokes + the profile
  wiring keep running on every restart. Nothing in the monorepo development ever changes `~/.dsh`.
- **`DeepSeek/Boilerplate` = the reference copy** of the twelve bundles (the Sources, the configs,
  the built Targets, the smokes) - the frozen baseline the releases derive from. The copy EXCLUDES
  the per-bundle `node_modules` (reproducible via the per-bundle `pnpm install`) and the
  profile-specific wiring (`cordis.patch.yml` values stay as the shipped examples; the personal
  paths are the #12 anonymization's job on the release side, not the reference side).
- **`DeepSeek/Classic` = the Classic release** (one package per repository at publish time;
  developed inside the monorepo first): the cleaned, de-personalized, restructured implementations -
  register #12 (anonymization + the Aphrodite README borrow), #15 (the reversed hierarchical names:
  `hook-dsh-governor-cargo` etc.).
- **`DeepSeek/EffectTS` = the Effect-TS v4 release** (register #13): the same package identities as
  the Classic, the internals re-implemented on Effect-TS (the tracing, the ecosystem interop, the
  parallel-govern toggle from #14 designed in from the start). Its smokes prove parity against the
  Classic's behavior (the ledger strings stay the contract).
- **`DeepSeek/Site` = the static hosting site**: adopts the
  `~/Downloads/stitch_playform_dsh_plugin_branding_system` design (DESIGN.md - the "Technical
  Minimalist Harness" blue/white tokens, Inter + JetBrains Mono, the Material-style spacing;
  code.html - the family landing page; screen.png - the visual reference). Blue + white only, clean
  headers (the `Documentation/Brand/BRANDING.md` constraints).
- **`DeepSeek/Test` = the archive**: everything currently in
  `~/Developer/Application/PlayForm/DeepSeek/` (the live fixtures: the governed-chain,
  cargo-fixture, the locktree/prun/coder trees, the fixture .md files, the probes) moves here,
  organized, so the monorepo root is clean.
- **The monorepo tooling**: a pnpm workspace (the packages globs for the three package sets), the
  root scripts (build/test per set), the shared docs.

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
│   │   ├── dsh-plugin-factory/       #   (Source/, Target/, Configuration/, package.json,
│   │   ├── dsh-hook-core/            #    cordis.patch.yml example, pnpm-workspace.yaml,
│   │   ├── dsh-hook-package-governor/ #   tsconfig.json - NO node_modules)
│   │   ├── dsh-hook-package-pinner/
│   │   ├── dsh-hook-cargo-governor/
│   │   ├── dsh-hook-normalize-dash/
│   │   ├── dsh-hook-normalize-quotes/
│   │   ├── dsh-hook-normalize-ellipsis/
│   │   ├── dsh-hook-normalize-spaces/
│   │   ├── dsh-hook-normalize-invisible/
│   │   ├── dsh-hook-normalize-fullwidth/
│   │   └── dsh-hook-normalize-file/
│   └── smokes/                       # the twelve smoke suites (the paths adapted to the monorepo)
│       ├── core-smoke.mjs · factory-smoke.mjs · governor-smoke.mjs · pinner-smoke.mjs
│       ├── cargo-smoke.mjs · normalize-dash-smoke.mjs · the five flavor smokes
│       └── normalize-file-smoke.mjs
├── Classic/                          # THE CLASSIC RELEASE (developed here, published per-repo)
│   └── packages/                     # the twelve release packages (the #15 names, the #12 cleanup):
│       ├── plugin-dsh-factory/       #   lib-dsh-core, hook-dsh-governor-package,
│       ├── lib-dsh-core/             #   hook-dsh-pinner-package, hook-dsh-governor-cargo,
│       ├── hook-dsh-governor-package/ #  hook-dsh-normalize-{dash,quotes,ellipsis,spaces,
│       ├── hook-dsh-pinner-package/  #    invisible,fullwidth,file}
│       ├── hook-dsh-governor-cargo/
│       └── hook-dsh-normalize-*/     #   (each: the de-personalized Sources, the Aphrodite
│                                     #    README, the smoke, the publish config)
├── EffectTS/                         # THE EFFECT-TS V4 RELEASE (register #13 + #14)
│   └── packages/                     # the same package identities, the Effect internals:
│       ├── plugin-dsh-factory/       #   the service as Effect layers; the tracing spans
│       ├── lib-dsh-core/             #   the pure helpers as Effect pipelines/Streams
│       ├── hook-dsh-governor-package/ #  the chain as typed effects; the parallel-govern toggle
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

- **The pnpm workspace**:
  `packages: [Boilerplate/packages/*, Classic/packages/*, EffectTS/packages/*]` with the Aphrodite
  conventions (the hoisted linker, the min release age). The per-bundle `pnpm-workspace.yaml` files
  (`packages: [.]`) keep the bundles self-contained for the standalone builds/publishes.
- **The root scripts**: `build:boilerplate`, `build:classic`, `build:effect-ts`, `test` (the
  twelve-suite runner per set), `smoke` (the archive-runner).
- **The naming**: the Boilerplate keeps the current names; the Classic + the EffectTS use the #15
  reversed names (the @-sentences). The packages are separate repositories at publish time - the
  monorepo is the development home.

## 4. THE SITE DESIGN (the stitch adoption)

- The `~/Downloads/stitch_playform_dsh_plugin_branding_system/` package is the source: DESIGN.md
  (the tokens: primary #003ec7 / primary- container #0052ff / the white surfaces / Inter + JetBrains
  Mono / headline-lg-md-xl / the spacing scale) + code.html (the working page: the fixed header
  "@playform / DSH Family", the eyebrow badges (ECOSYSTEM: @PLAYFORM / CLASSIC / EFFECT-TS), the
  hero sentence, the terminal install box, the products/flavors sections) + screen.png.
- The Site adapts it: the landing (index.html), the sub-pages (products, versions, flavors, models),
  the tokens as CSS custom properties, blue/white only, the clean headers - the exact
  `Documentation/Brand/BRANDING.md` constraints.

## 5. THE EXECUTION ORDER

1. **Phase 0 - the archive**: move the current `DeepSeek/` contents (the fixtures) into
   `DeepSeek/Test/` (organized), create the monorepo skeleton (the root package.json,
   pnpm-workspace.yaml, Documentation/, README).
2. **Phase 1 - the boilerplate**: copy the twelve bundles + the smokes into `DeepSeek/Boilerplate/`
   (no node_modules), adapt the smokes' paths to the monorepo, verify: the boilerplate smokes pass
   standalone (the Targets copied) - the `~/.dsh` originals untouched + the live family verified
   still green.
3. **Phase 2 - the Classic**: scaffold the twelve release packages under `Classic/packages/` from
   the boilerplate copies, then execute #12 (anonymize + the Aphrodite READMEs) + #15 (the names)
   per package.
4. **Phase 3 - the EffectTS**: scaffold the twelve packages under `EffectTS/packages/` (same
   identities), re-implement the internals on Effect v4 (the #13 mapping: the core helpers as Effect
   pipelines, the factory as layers, the chain as typed effects + the tracing spans, the #14
   parallel toggle), the parity smokes as the arbiter.
5. **Phase 4 - the Site**: adopt the stitch design into `Site/` (the tokens, the landing, the
   sub-pages, the assets).
6. **Phase 5 - the docs + the handoff**: the monorepo docs + the handoff update (the new layout, the
   paths, the live-test references).

## 6. THE CONSTRAINTS

- The `~/.dsh` originals NEVER change during this work; the live family is verified green after
  every phase (the smokes + the ledgers).
- The ledger strings stay the byte-identical smoke contract in all three implementations (the
  Boilerplate, the Classic, the EffectTS).
- The Site is blue/white only + the clean headers (the `Documentation/Brand/BRANDING.md`).
- The development through coder subagents; the smokes as the arbiter; the USER commits; nothing
  committed by agents.
- The live fixtures' new home (`DeepSeek/Test/`) becomes the sandbox fixtures root for the future
  live batteries - the handoff's fixture references update.

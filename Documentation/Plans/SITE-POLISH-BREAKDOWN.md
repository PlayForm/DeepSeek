---
title: The Site Polish Breakdown - content, wording, and structure
category: Plans
kind: queued-plan
date: 2026-10-20
status: planned
registry: Documentation/Plans/SITE-POLISH-BREAKDOWN.md
index: Documentation/INDEX.md
statuses:
    - name: the content and wording audit across 24 content pages
      state: resolved
      evidence: this document - every claim checked against Site/Source
    - name: the P0 correctness fixes
      state: in-progress
      evidence:
          landed - the count bugs, the false absolutes, the ccr prefix, the profile path, the pinner
          captions, the model page; open - the npm claim, the hero CTA, the totals, the verify step
    - name: the P1 structure fixes
      state: in-progress
      evidence:
          landed - the nav and 404 parity, the demo distinction, the self-hosted 404; open - the
          detail template, the registry affordances, the setup completeness
    - name: the P2 wording rewrite
      state: open
      evidence: the voice standard and the per-page briefs in this document
    - name: the content-model de-hardcoding
      state: open
      evidence: Site/Source/Library/Content.ts and Live.ts - figures still hardcoded in pages
    - name: the site build as the arbiter
      state: implemented
      evidence: cd Site and pnpm prepublishOnly - the only verification surface
---

# The Site Polish Breakdown

The site is current on its big figures of 1008/1021 and fifteen packages, and it still ships broken promises in specific places.

This document is the worklist of content, wording, and structure, where every item is anchored to a file that I checked, every rewrite brief carries the voice standard, and every task names its acceptance check.

The scope is the 24 content pages (9 top-level and 15 plugin detail pages) plus the 404, the nav, the registry, and the content model.

Not in scope: the design system, the Mermaid pipeline, and the build configuration, which are working.

## 1. The voice standard (mine, applied to every rewrite)

1. **One claim per sentence.**

    The claim is checkable.

2. **Active voice with a named actor.**

    The actor is the hook, the factory, the build, or the reader.

3. **Concrete verbs.**

    Write rewrites, refuses, appends, gates, and normalizes, and never "leverage", "seamless", "robust", "powerful", or "by construction".

4. **No absolutes unless they are literally true.**

    Every, always, zero, and never are verified or cut.

5. **One term per concept.**

    Plugin is the package, hook is the event listener, flavor is a transform, normalizer is the family, ledger is the log, and family is the whole, and a glossary lands with the rewrite.

6. **Short declaratives.**

    Use at most one longer sentence per paragraph.

7. **Headings as claims.**

    Write "The build is the arbiter" and not "Build".

8. **Second person for instructions, third person for descriptions.**

9. **Cut the page about itself.**

    No "this page shows" and no internal notes.

10. **The so-what test.**

    Every paragraph tells the reader something that they can do or know afterwards.

A sample makes the standard concrete. The current `models.astro` hero sub reads:

> The family is model-agnostic by construction. It hooks the harness's token output stream, NOT the
> model. Whatever LLM produced the text - DeepSeek, GLM, or the next one - the same six stream
> flavors and two governance roles apply.

The rewrite:

> The family hooks the harness's token stream, not the model. Any model that writes through the
> harness gets the same six stream normalizers and the same two governance roles.

## 2. P0 - correctness (fix before any polish)

### P0.1 The npm claim is false for three packages

- Files: `Site/Source/pages/plugins.astro:205` and `Site/Source/pages/setup.astro:350-357`.
- The claim: "ALL fifteen packages are on npm at the v0.0.1 release."
- The truth: `hook-dsh-ccr`, `hook-dsh-tool-coach`, and `hook-dsh-live-containers` return 404 on the
  registry, so the install snippets on their detail pages fail.
- Fix: publish the three packages, or change the copy to the verified set and mark those three
  snippets "publish pending - build from source", and use `${Versions.Release}` and not the literal
  `0.0.1`.
- Acceptance: every install snippet on `/plugins/` resolves, the copy matches the registry state, and
  the version comes from `Content.ts`.

### P0.2 The newest model is missing

- Files: `models.astro:12-23,31,53-59`, `index.astro:713-715`, `matrix.astro:84,111,114`, and
  `workbench.astro:88`.
- The site names DeepSeek V4 Flash and GLM 5.3 Flash, while the catalog added
  `deepseek-v4.1-flash-1017` on 2026-10-20 and the profile now allows only that model.
- Fix: add DeepSeek V4.1 Flash 1017 as the current route, keep 0731 as the fallback and GLM as the
  second tested vendor, and rewrite the "reference models" section as "routes the family has been
  tested on" and not as a vendor ranking.
- Acceptance: the page names the current route and the fallback, and no page claims a model that the
  catalog no longer allows as the primary.

### P0.3 The pinner page renders drafting notes

- File: `Site/Source/pages/plugins/hook-dsh-package-pinner.astro`, with 14 paragraphs beginning
  "Show ..." at lines 230, 261, 263, 293, 320, 353, 405, 430, 454, 570, 595, 629, 656, and 683.
- Fix: replace each one with a one-sentence caption that states what the diagram or block shows in
  the terms of the reader.
- Acceptance: no "Show " paragraphs remain, and every diagram has a caption that stands alone.

### P0.4 Package-count drift

- Files: `versions.astro:145` with "IDENTICAL FOURTEEN CONTRACTS" and `versions.astro:87` with "the
  twelve packages" inside the current 0.0.1 entry, `lib-dsh-core.astro:69,129` with "ALL thirteen
  other packages", `Site/README.md:12,13,30,71`, and root `README.md:7-16,35,222,281-282,442`.
- The "twelve" of the case study is deliberate history, because it describes the Oct 3-6 era and
  reconciles to fifteen on the same page at 318 and 323, so leave it.
- The "thirteen" of core is the dependent count of 14 dependency rows minus its own name, since the
  factory has none, but "ALL thirteen other packages" is false because there are fourteen other
  packages, so say "thirteen dependents" or "fourteen other packages".
- Fix: fifteen packages, the derived suite count, and 24 content pages plus the 404, and prefer
  `${Counts.Packages}` and `${Counts.Suites}`.
- Acceptance: a grep for `twelve|thirteen|fourteen` returns only the era section of the case study
  and the corrected dependent wording.

### P0.5 The hero CTA has no next step

- File: `index.astro:260` with `<Terminal Pkg="lib-dsh-core" Rail />`, which renders
  `npm install @playform/lib-dsh-core@0.0.1` at `Terminal.astro:31-32`.
- Installing core is legitimate because core is the library, and the defect is that the only CTA of
  the hero installs a package that activates nothing: core has no `cordis.patch.yml`, no ledger, and
  no tool. The working first action is `/setup/` with bundles, patch, and restart.
- Fix: make the CTA the setup path with the install as step 0 of 4, and if a package command stays,
  say that it does nothing until the profile is wired.
- Acceptance: the next click of a first-time reader leads to a working activation and not to a no-op
  install.

### P0.6 False absolutes

- Files: `index.astro:255` with "EVERY model's output", `models.astro:122-123` with "run on EVERY
  token batch", `hook-dsh-normalize-ellipsis.astro:248` with "EVERY typographic three-dot ellipsis
  code point", `setup.astro:716` with "EACH plugin writes its own durable ledger", `index.astro:729`
  and `models.astro:147` with "zero runtime overhead", and `lib-dsh-core.astro:74,77` with "PLUGIN
  DETAIL" beside "NOT A PLUGIN".
- The stream claims are false under the shipped defaults, because `toolInput`, `toolResults`, and
  `batch` default off and six flavors replace six classes and not all non-ASCII. "Zero runtime
  overhead" is contradicted by `appendFileSync` on every changed delta when `log` is on, and every
  shipped patch sets `log: true`. The core and the factory write no ledger, and core is a library.
- Fix: state the arms that are on, the classes that the flavors cover, and the actual log cost, and
  write "LIBRARY DETAIL" for core.
- Acceptance: every "every", "each", "zero", and "never" is true in the code or is gone.

### P0.7 The smoke totals are understated

- Files: `Site/Source/Library/Content.ts:73-76` with the 1008/1021 fallback,
  `Site/Source/Library/Live.ts` which parses the manifest line, and the manifest itself in
  `Classic/smokes/README.md` and `EffectTS/smokes/README.md`.
- The manifest line is stale against the per-folder tests: dash 184 against 132, each small flavor
  104 against 62, normalize-file 112 against 71, and factory 35 against 34. Core, governor, pinner,
  cargo, ccr, and tool-coach match, and the per-folder READMEs are the arbiter of the runner
  (`Maintain/Run-Smokes.mjs`).
- The real Classic total is 1,314 across the manifest suites and 1,594 with the live-containers
  folders, while the EffectTS total needs the same per-folder sum, so do not assume the additive
  delta alone.
- Fix: make `Live.ts` sum the per-folder `## Expected count` values or regenerate the manifest from
  them, and then let every page read the derived total, and do not hardcode a new number.
- Acceptance: the displayed total equals the sum that the runner guards, `pnpm Drift` passes, and the
  root README and `Site/README.md` quote the same derived number.

### P0.8 "ALL PASS" is a partial green

- Files: `Site/Source/Library/Content.ts:213-214` with the "14 SUITES · 1008 CHECKS · ALL PASS"
  banner, and `versions.astro:19` with "EVERY suite loads the real built Target".
- The seven wiring suites (scratch-profile, profile-assembly, patch-layer, live-ledger,
  governed-write, refusal-path, and introspection) exercise the live `~/.dsh` harness, skip with exit
  0 when `DSH_TEST_SCRATCH` is unset, and are never forced green in the aggregate. The totals sum
  only the 14 mechanics suites, so the banner claims a green that was never executed.
- Fix: make the banner state the coverage as "14 mechanics suites green; 7 wiring suites skipped
  without a scratch home; live-containers 280 checks", and derive it and do not hardcode it.
- Acceptance: the banner names what ran and what skipped, and no page says "ALL PASS" without the
  scope.

### P0.9 The generated profile does not resolve as printed

- Files: `Configurator.astro:479` and `setup.astro:84` emit `"<pkg>": "link:../bundles/<pkg>"`
  inside `~/.dsh/profiles/<name>/package.json`, which resolves to `~/.dsh/profiles/bundles/<pkg>`
  while the documented layout is `~/.dsh/profiles/<name>/bundles/<pkg>`.
- The same block emits `ncuBin: /usr/local/bin/ncu`, which contradicts the shipped default `"ncu"`
  and the "personal-path constant gone" of the case study.
- Fix: emit the correct relative link and `ncuBin: ncu`, and add a copy-paste check to the page.
- Do not edit the ledger excerpts to match, because they are byte-exact Drift samples: fix the
  default and the generated config, and leave the samples as captured.
- Acceptance: the generated package.json resolves from the profile directory, and no personal path
  appears.

### P0.10 The verify step greps the wrong shape and files

- Files: `setup.astro:747-777` and `Configurator.astro:511-522`.
- The table lists patch-name ledgers that differ from the schema defaults, `setup.astro:772` points
  at `~/.dsh/playform/hook-dsh-ccr.log` which the hardcoded path never creates off-nikola, and the
  Configurator labels logger-form strings as "the activation ledger lines" while the file form is
  `[ISO] activated (...)` with no plugin prefix.
- Fix: one canonical ledger path and one canonical line shape in the table, the Configurator, and the
  verify instructions, and add a default-path assertion to the smoke.
- Acceptance: the documented path and shape match what the code writes.

### P0.11 The ccr page names the wrong ledger prefix

- File: `hook-dsh-ccr.astro:831` says that Append adds "the hook-dsh-ccr prefix", while `State.Module`
  is `"ccr"`, so logger lines read `ccr: ...` and the file line has no prefix.
- Fix: say `ccr: ...`.
- Acceptance: the page matches the smoke-asserted string.

## 3. P1 - structure and discovery

### P1.1 One detail-page template

- The 15 detail pages share Where It Fits, In the DeepSeek Harness, Config, In Action, Ledger, and
  Related, but 8 omit Known limits (core, factory, ellipsis, file, fullwidth, invisible, quotes, and
  spaces), `live-containers` omits Problem and How It Works, `tool-coach` and `core` replace
  sections, and `pinner` uses hand-rolled markup instead of `Concept`.
- Fix: define the template in the `site-authoring` skill and apply it as hero, what it is, where it
  fits, how it works, config, in action, ledger, known limits, and related, then convert pinner to
  `Concept` and use `PageHero` and `SectionHeader` everywhere.
- Acceptance: the 15 pages have the same section set, and the only variation is content and not
  markup.

### P1.2 Nav, 404, and sitemap parity

- `Base.astro:24-33` omits `/matrix/`, `Public/404.html:111-117` lists five of the nine top-level
  pages, and the sitemap has 24 URLs.
- Fix: one page set drives the nav and the 404, and add Matrix next to Workbench.
- Acceptance: every top-level page appears in the nav and the 404, and the sitemap matches.

### P1.3 Workbench vs Matrix

- Both demos show raw against normalized output, and neither says which one to use.
- Fix: one sentence at the top of each, where the workbench is the full gate of six hooks, metrics,
  and trace, and the matrix is the per-engine inspector of raw payload against armed hooks.
- Acceptance: a reader can choose in one sentence.

### P1.4 Registry affordances

- `plugins.astro:209-264`: the chips omit CARGO, GUARDIANS, and FILE, every tag contains "hook" so a
  search for "hook" returns all 15, and the filter state is not in the URL.
- Fix: add the missing chips, make the tags specific, and put the filter in the query string.
- Acceptance: a filtered view is linkable, and "cargo" and "file" find their packages.

### P1.5 Setup completeness

- The configurator covers 14 slots and omits `live-containers`, and the ledger table lists 7 of 15
  under "One ledger per plugin".
- Fix: add the disabled package with an explicit "ships disabled" note, and retitle the ledger table
  "Ledgers for the hooks that write one" with the writers listed.
- Acceptance: the one shipped-disabled package has a wiring path, and the table matches the code.

## 4. P2 - the wording rewrite

### P2.1 Cross-page duplication to remove

- The three notation lines are verbatim on `index.astro:726-732` and `models.astro:145-149`.
- The 15 plugin cards on `index.astro` duplicate the `plugins.astro` cards.
- The version cards duplicate `versions.astro`.
- The landing use cases lift the pinner, governor, dash, and ccr In Action pairs.
- The smoke baseline appears on both `plugins.astro` and `versions.astro`.
- The failure cases appear on `plugins.astro`, `case-study.astro`, and `versions.astro`.
- The "profile wiring is on the setup page" paragraph is verbatim on 13 hook pages, the scopes and
  overpass section repeats on 7 normalize pages, "Chunk-boundary-safe" appears on 5, and "Volatile
  cells commit without remounting" appears on 4.
- Fix: one canonical statement per fact and links from the other pages, where the detail pages keep
  the specific config and ledger and link the shared setup and scopes text to `/setup/`.
- Acceptance: no paragraph longer than one sentence appears verbatim on two pages.

### P2.2 Terminology

- Fix the pairs: "clean ASCII" against "normalized", "canonical sanitized" against "normalized",
  "products" as the retired route against "plugins", "capabilities" against "packages", and
  "governor-package" against `hook-dsh-package-governor`.
- Fix `hook-dsh-cargo-governor.astro:176,179` with "governor-package" and "pinner-package" to the
  package names.
- Fix `hook-dsh-ccr.astro:292` "Ported from Aphrodite's CCR pipeline", which is an internal codename
  on a public page, and say "ported from an earlier proxy-side compressor".
- Acceptance: a glossary term list in the `site-authoring` skill, and a grep for the retired terms
  returns nothing.

### P2.3 Per-page rewrite briefs

| Page         | The brief                                                                                                                           |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `index`      | Lead with the two jobs (normalize output, govern manifests); install a bundle; cut the duplicated cards to a short grid with links. |
| `plugins`    | The registry is the install surface: verified snippets, specific chips, no "ALL on npm" until true.                                 |
| `setup`      | Four steps, each one action and one check; the configurator is the shortcut, not the tutorial.                                      |
| `versions`   | State the release and the invariants; move the changelog to a compact record; fix fourteen to fifteen.                              |
| `flavors`    | Fifteen packages, four groups; the seven normalizers, the three governance hooks, the two guardians, the live blocks.               |
| `models`     | The family hooks the stream, not the model; the routes tested, current and fallback.                                                |
| `workbench`  | The full gate demo; say what the metrics mean.                                                                                      |
| `matrix`     | The per-engine inspector; say which arm it models.                                                                                  |
| `case-study` | The history is era-bound; keep "twelve" only where the era is the subject, and say so.                                              |
| detail pages | What it is, where it fits, how it works, config, in action, ledger, limits, related; no drafting notes.                             |

## 5. P3 - the content model

- Move the hardcoded figures to `Content.ts`: fifteen and 15, 0.0.1, 146/129, "Four steps", and
  "Eleven". Keep the era "twelve" of the case study because it is history, and core's "thirteen" is a
  dependent count and not a package count.
- Derive the totals and the green scope from the per-folder counts and the wiring-suite state under
  P0.7 and P0.8.
- Remove the unused exports (`Methods.Metadata`, `Copyright.Year`, and `Fallback.Totals`) or use them.
- Fix the stale comments: `StatsBand.astro:3` "12 packages / 733 + 746", `Terminal.astro:5` "ALL 25
  packages", and `Site/README.md:71` "21 pages".
- Run `pnpm Drift` after every figure change.
- Acceptance: `pnpm Drift` passes, and a grep for the retired numbers in `Site/Source` returns only
  historical prose.

## 6. Sequencing

1. **The install and the model.**

    P0.1 and P0.2, which cover the broken install and the missing model.

2. **The partial green.**

    P0.8, the partial-green banner, because trust damage comes first.

3. **The drafting notes and the counts.**

    P0.3 and P0.4.

4. **The hero and the absolutes.**

    P0.5 and P0.6.

5. **The generated profile, the verify step, and the ccr prefix.**

    P0.9 to P0.11.

6. **The template and the nav.**

    P1.1 and P1.2.

7. **The demos, the registry, and the setup.**

    P1.3 to P1.5.

8. **The rewrite.**

    P2, page by page, with the build after each page.

9. **The content model.**

    P3, and then `pnpm Drift`.

## 7. Acceptance (every item)

- `cd Site && pnpm prepublishOnly` exits zero.
- `find Site/Target -name "*.html" | wc -l` is 25, or the new count.
- The changed string appears in `Site/Target/`.
- `pnpm Drift` passes.
- The nav, the 404, and the sitemap agree.

## 8. What not to change

The design system of blue and white, hairlines, and zero elevation, the `Content.ts` and `Live.ts` model, the Mermaid pipeline, and the per-page structure are working.

This is an accuracy, wording, and discovery pass and not a redesign.

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

The site is current on its big figures (1008/1021, fifteen packages) and still ships broken promises
in specific places. This document is the content, wording, and structure worklist: every item is
anchored to a file I checked, every rewrite brief carries the voice standard, and every task names
its acceptance check.

Scope: the 24 content pages (9 top-level + 15 plugin detail pages) plus the 404, the nav, the
registry, and the content model. Not in scope: the design system, the Mermaid pipeline, and the
build configuration, which are working.

## 1. The voice standard (mine, applied to every rewrite)

1. One claim per sentence, and the claim is checkable.
2. Active voice, named actor: the hook, the factory, the build, the reader.
3. Concrete verbs: rewrites, refuses, appends, gates, normalizes. No "leverage", "seamless",
   "robust", "powerful", "by construction".
4. No absolutes unless literally true: every, always, zero, never. Verify or cut.
5. One term per concept: plugin (the package), hook (the event listener), flavor (a transform),
   normalizer (the family), ledger (the log), family (the whole). A glossary lands with the rewrite.
6. Short declaratives; at most one longer sentence per paragraph.
7. Headings as claims: "The build is the arbiter", not "Build".
8. Second person for instructions, third person for descriptions.
9. Cut the page about itself: no "this page shows", no internal notes.
10. The so-what test: every paragraph tells the reader something they can do or know afterwards.

Sample, so the standard is concrete. Current `models.astro` hero sub:

> The family is model-agnostic by construction. It hooks the harness's token output stream, NOT the
> model. Whatever LLM produced the text - DeepSeek, GLM, or the next one - the same six stream
> flavors and two governance roles apply.

Rewrite:

> The family hooks the harness's token stream, not the model. Any model that writes through the
> harness gets the same six stream normalizers and the same two governance roles.

## 2. P0 - correctness (fix before any polish)

### P0.1 The npm claim is false for three packages

- Files: `Site/Source/pages/plugins.astro:205`, `Site/Source/pages/setup.astro:350-357`.
- The claim: "ALL fifteen packages are on npm at the v0.0.1 release."
- The truth: `hook-dsh-ccr`, `hook-dsh-tool-coach`, and `hook-dsh-live-containers` return 404 on the
  registry; the install snippets on their detail pages fail.
- Fix: either publish the three packages, or change the copy to the verified set and mark those
  three snippets "publish pending - build from source". Use `${Versions.Release}`, not the literal
  `0.0.1`.
- Acceptance: every install snippet on `/plugins/` resolves; the copy matches the registry state;
  the version comes from `Content.ts`.

### P0.2 The newest model is missing

- Files: `models.astro:12-23,31,53-59`, `index.astro:713-715`, `matrix.astro:84,111,114`,
  `workbench.astro:88`.
- The site names DeepSeek V4 Flash and GLM 5.3 Flash; the catalog added `deepseek-v4.1-flash-1017`
  on 2026-10-20, and the profile now allows only that model.
- Fix: add DeepSeek V4.1 Flash 1017 as the current route; keep 0731 as the fallback and GLM as the
  second tested vendor. Rewrite the "reference models" section as "routes the family has been tested
  on", not a vendor ranking.
- Acceptance: the page names the current route and the fallback; no page claims a model the catalog
  no longer allows as the primary.

### P0.3 The pinner page renders drafting notes

- File: `Site/Source/pages/plugins/hook-dsh-package-pinner.astro`, 14 paragraphs beginning "Show
  ..." (lines 230, 261, 263, 293, 320, 353, 405, 430, 454, 570, 595, 629, 656, 683).
- Fix: replace each with a one-sentence caption that states what the diagram or block shows, in the
  reader's terms.
- Acceptance: no "Show " paragraphs remain; every diagram has a caption that stands alone.

### P0.4 Package-count drift

- Files: `versions.astro:145` ("IDENTICAL FOURTEEN CONTRACTS") and `versions.astro:87` ("the twelve
  packages" inside the current 0.0.1 entry); `lib-dsh-core.astro:69,129` ("ALL thirteen other
  packages"); `Site/README.md:12,13,30,71`; root `README.md:7-16,35,222,281-282,442`.
- The case-study's "twelve" is deliberate history: it describes the Oct 3-6 era and reconciles to
  fifteen on the same page (318, 323). Leave it.
- Core's "thirteen" is the dependent count (14 dependency rows minus its own name; the factory has
  none), but "ALL thirteen other packages" is false because there are fourteen other packages. Say
  "thirteen dependents" or "fourteen other packages".
- Fix: fifteen packages, the derived suite count, 24 content pages + the 404. Prefer
  `${Counts.Packages}` and `${Counts.Suites}`.
- Acceptance: a grep for `twelve|thirteen|fourteen` returns only the case-study's era section and
  the corrected dependent wording.

### P0.5 The hero CTA has no next step

- File: `index.astro:260` `<Terminal Pkg="lib-dsh-core" Rail />`, which renders
  `npm install @playform/lib-dsh-core@0.0.1` (`Terminal.astro:31-32`).
- Installing core is legitimate; core is the library. The defect is that the hero's only CTA
  installs a package that activates nothing: core has no `cordis.patch.yml`, no ledger, and no tool.
  The working first action is `/setup/`: bundles, patch, restart.
- Fix: make the CTA the setup path, with the install as step 0 of 4. If a package command stays, say
  that it does nothing until the profile is wired.
- Acceptance: a first-time reader's next click leads to a working activation, not a no-op install.

### P0.6 False absolutes

- Files: `index.astro:255` "EVERY model's output"; `models.astro:122-123` "run on EVERY token
  batch"; `hook-dsh-normalize-ellipsis.astro:248` "EVERY typographic three-dot ellipsis code point";
  `setup.astro:716` "EACH plugin writes its own durable ledger"; `index.astro:729` and
  `models.astro:147` "zero runtime overhead"; `lib-dsh-core.astro:74,77` "PLUGIN DETAIL" beside "NOT
  A PLUGIN".
- The stream claims are false under shipped defaults: `toolInput`, `toolResults`, and `batch`
  default off, and six flavors replace six classes, not all non-ASCII. "Zero runtime overhead" is
  contradicted by `appendFileSync` on every changed delta when `log` is on, and every shipped patch
  sets `log: true`. The core and factory write no ledger; core is a library.
- Fix: state the arms that are on, the classes the flavors cover, and the actual log cost; "LIBRARY
  DETAIL" for core.
- Acceptance: every "every/each/zero/never" is true in code or gone.

### P0.7 The smoke totals are understated

- Files: `Site/Source/Library/Content.ts:73-76` (the 1008/1021 fallback),
  `Site/Source/Library/Live.ts` (parses the manifest line), and the manifest itself in
  `Classic/smokes/README.md` and `EffectTS/smokes/README.md`.
- The manifest line is stale against the per-folder tests: dash 184 vs 132, each small flavor 104 vs
  62, normalize-file 112 vs 71, factory 35 vs 34. Core, governor, pinner, cargo, ccr, and tool-coach
  match. The per-folder READMEs are the runner's arbiter (`Maintain/Run-Smokes.mjs`).
- The real Classic total is 1,314 across the manifest suites, 1,594 with the live-containers
  folders. The EffectTS total needs the same per-folder sum; do not assume the additive delta alone.
- Fix: make `Live.ts` sum the per-folder `## Expected count` values (or regenerate the manifest from
  them), then let every page read the derived total. Do not hardcode a new number.
- Acceptance: the displayed total equals the sum the runner guards; `pnpm Drift` passes; the root
  README and `Site/README.md` quote the same derived number.

### P0.8 "ALL PASS" is a partial green

- Files: `Site/Source/Library/Content.ts:213-214` (the "14 SUITES · 1008 CHECKS · ALL PASS" banner)
  and `versions.astro:19` ("EVERY suite loads the real built Target").
- The seven wiring suites (scratch-profile, profile-assembly, patch-layer, live-ledger,
  governed-write, refusal-path, introspection) exercise the live `~/.dsh` harness, skip with exit 0
  when `DSH_TEST_SCRATCH` is unset, and are never forced green in the aggregate. The totals sum only
  the 14 mechanics suites. The banner therefore claims a green that was never executed.
- Fix: make the banner state the coverage: "14 mechanics suites green; 7 wiring suites skipped
  without a scratch home; live-containers 280 checks" - and derive it, do not hardcode.
- Acceptance: the banner names what ran and what skipped; no page says "ALL PASS" without the scope.

### P0.9 The generated profile does not resolve as printed

- Files: `Configurator.astro:479` and `setup.astro:84` emit `"<pkg>": "link:../bundles/<pkg>"`
  inside `~/.dsh/profiles/<name>/package.json`, which resolves to `~/.dsh/profiles/bundles/<pkg>`;
  the documented layout is `~/.dsh/profiles/<name>/bundles/<pkg>`.
- The same block emits `ncuBin: /usr/local/bin/ncu`, contradicting the shipped default `"ncu"` and
  the case study's "personal-path constant gone".
- Fix: emit the correct relative link and `ncuBin: ncu`; add a copy-paste check to the page.
- Do not edit the ledger excerpts to match: they are byte-exact Drift samples. Fix the default and
  the generated config, and leave the samples as captured.
- Acceptance: the generated package.json resolves from the profile directory; no personal path
  appears.

### P0.10 The verify step greps the wrong shape and files

- Files: `setup.astro:747-777`, `Configurator.astro:511-522`.
- The table lists patch-name ledgers that differ from the schema defaults; `setup.astro:772` points
  at `~/.dsh/ccr.log`, which the hardcoded path never creates off-nikola; the Configurator labels
  logger-form strings as "the activation ledger lines", while the file form is
  `[ISO] activated (...)` with no plugin prefix.
- Fix: one canonical ledger path and one canonical line shape in the table, the Configurator, and
  the verify instructions; add a default-path assertion to the smoke.
- Acceptance: the documented path and shape match what the code writes.

### P0.11 The ccr page names the wrong ledger prefix

- File: `hook-dsh-ccr.astro:831` says Append adds "the hook-dsh-ccr prefix"; `State.Module` is
  `"ccr"`, so logger lines read `ccr: ...` and the file line has no prefix.
- Fix: say `ccr: ...`.
- Acceptance: the page matches the smoke-asserted string.

## 3. P1 - structure and discovery

### P1.1 One detail-page template

- The 15 detail pages share Where It Fits / In the DeepSeek Harness / Config / In Action / Ledger /
  Related, but 8 omit Known limits (core, factory, ellipsis, file, fullwidth, invisible, quotes,
  spaces), `live-containers` omits Problem and How It Works, `tool-coach` and `core` replace
  sections, and `pinner` uses hand-rolled markup instead of `Concept`.
- Fix: define the template in the `site-authoring` skill and apply it: hero, what it is, where it
  fits, how it works, config, in action, ledger, known limits, related. Convert pinner to `Concept`;
  use `PageHero` and `SectionHeader` everywhere.
- Acceptance: the 15 pages have the same section set; the only variation is content, not markup.

### P1.2 Nav, 404, and sitemap parity

- `Base.astro:24-33` omits `/matrix/`; `Public/404.html:111-117` lists five of the nine top-level
  pages; the sitemap has 24 URLs.
- Fix: one page set drives the nav and the 404; add Matrix next to Workbench.
- Acceptance: every top-level page appears in the nav and the 404; the sitemap matches.

### P1.3 Workbench vs Matrix

- Both demo raw-vs-normalized output; neither says which to use.
- Fix: one sentence at the top of each: the workbench is the full gate (six hooks, metrics, trace);
  the matrix is the per-engine inspector (raw payload vs armed hooks).
- Acceptance: a reader can choose in one sentence.

### P1.4 Registry affordances

- `plugins.astro:209-264`: chips omit CARGO, GUARDIANS, FILE; every tag contains "hook", so
  searching "hook" returns all 15; the filter state is not in the URL.
- Fix: add the missing chips, make the tags specific, put the filter in the query string.
- Acceptance: a filtered view is linkable; "cargo" and "file" find their packages.

### P1.5 Setup completeness

- The configurator covers 14 slots and omits `live-containers`; the ledger table lists 7 of 15 under
  "One ledger per plugin".
- Fix: add the disabled package with an explicit "ships disabled" note; retitle the ledger table
  "Ledgers for the hooks that write one" and list the writers.
- Acceptance: the one shipped-disabled package has a wiring path; the table matches the code.

## 4. P2 - the wording rewrite

### P2.1 Cross-page duplication to remove

- The three notation lines are verbatim on `index.astro:726-732` and `models.astro:145-149`.
- The 15 plugin cards on `index.astro` duplicate the `plugins.astro` cards.
- The version cards duplicate `versions.astro`.
- The landing use cases lift the pinner/governor/dash/ccr In Action pairs.
- The smoke baseline appears on both `plugins.astro` and `versions.astro`.
- The failure cases appear on `plugins.astro`, `case-study.astro`, and `versions.astro`.
- The "profile wiring is on the setup page" paragraph is verbatim on 13 hook pages; the
  scopes/overpass section repeats on 7 normalize pages; "Chunk-boundary-safe" on 5; "Volatile cells
  commit without remounting" on 4.
- Fix: one canonical statement per fact; the other pages link to it. The detail pages keep the
  specific config and ledger, and link the shared setup/scopes text to `/setup/`.
- Acceptance: no paragraph longer than one sentence appears verbatim on two pages.

### P2.2 Terminology

- Fix the pairs: "clean ASCII" vs "normalized"; "canonical sanitized" vs "normalized"; "products"
  (retired route) vs "plugins"; "capabilities" vs "packages"; "governor-package" vs
  `hook-dsh-package-governor`.
- Fix `hook-dsh-cargo-governor.astro:176,179` ("governor-package", "pinner-package") to the package
  names.
- Fix `hook-dsh-ccr.astro:292` "Ported from Aphrodite's CCR pipeline" - an internal codename on a
  public page; say "ported from an earlier proxy-side compressor".
- Acceptance: a glossary term list in the `site-authoring` skill; a grep for the retired terms
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

- Move hardcoded figures to `Content.ts`: fifteen/15, 0.0.1, 146/129, "Four steps", "Eleven". Keep
  the case-study's era "twelve" (it is history); core's "thirteen" is a dependent count, not a
  package count.
- Derive the totals and the green scope from the per-folder counts and the wiring-suite state (P0.7
  and P0.8).
- Remove the unused exports (`Methods.Metadata`, `Copyright.Year`, `Fallback.Totals`) or use them.
- Fix the stale comments: `StatsBand.astro:3` "12 packages / 733 + 746"; `Terminal.astro:5` "ALL 25
  packages"; `Site/README.md:71` "21 pages".
- Run `pnpm Drift` after every figure change.
- Acceptance: `pnpm Drift` passes; a grep for the retired numbers in `Site/Source` returns only
  historical prose.

## 6. Sequencing

1. P0.1 and P0.2 - the broken install and the missing model.
2. P0.8 - the partial-green banner (trust damage first).
3. P0.3 and P0.4 - the drafting notes and the real count bugs.
4. P0.5 and P0.6 - the hero CTA and the absolutes.
5. P0.9 to P0.11 - the generated profile, the verify step, the ccr prefix.
6. P1.1 and P1.2 - the template and the nav/404.
7. P1.3 to P1.5 - the demos, the registry, the setup.
8. P2 - the rewrite, page by page, with the build after each page.
9. P3 - the content model, then `pnpm Drift`.

## 7. Acceptance (every item)

- `cd Site && pnpm prepublishOnly` exits zero.
- `find Site/Target -name "*.html" | wc -l` is 25 (or the new count).
- The changed string appears in `Site/Target/`.
- `pnpm Drift` passes.
- The nav, the 404, and the sitemap agree.

## 8. What not to change

The design system (blue and white, hairlines, zero elevation), the `Content.ts`/`Live.ts` model, the
Mermaid pipeline, and the per-page structure are working. This is an accuracy, wording, and
discovery pass, not a redesign.

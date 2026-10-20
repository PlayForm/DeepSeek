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
    state: open
    evidence: the npm claim, the missing model, the count drift, the pinner notes, the hero install, the false absolutes
  - name: the P1 structure fixes
    state: open
    evidence: the detail template, the nav and 404 parity, the demo split, the registry affordances
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

The site is current on its big figures (1008/1021, fifteen packages) and
still ships broken promises in specific places. This document is the
content, wording, and structure worklist: every item is anchored to a file
I checked, every rewrite brief carries the voice standard, and every task
names its acceptance check.

Scope: the 24 content pages (9 top-level + 15 plugin detail pages) plus the
404, the nav, the registry, and the content model. Not in scope: the
design system, the Mermaid pipeline, and the build configuration, which are
working.

## 1. The voice standard (mine, applied to every rewrite)

1. One claim per sentence, and the claim is checkable.
2. Active voice, named actor: the hook, the factory, the build, the reader.
3. Concrete verbs: rewrites, refuses, appends, gates, normalizes. No
   "leverage", "seamless", "robust", "powerful", "by construction".
4. No absolutes unless literally true: every, always, zero, never. Verify
   or cut.
5. One term per concept: plugin (the package), hook (the event listener),
   flavor (a transform), normalizer (the family), ledger (the log), family
   (the whole). A glossary lands with the rewrite.
6. Short declaratives; at most one longer sentence per paragraph.
7. Headings as claims: "The build is the arbiter", not "Build".
8. Second person for instructions, third person for descriptions.
9. Cut the page about itself: no "this page shows", no internal notes.
10. The so-what test: every paragraph tells the reader something they can
    do or know afterwards.

Sample, so the standard is concrete. Current `models.astro` hero sub:

> The family is model-agnostic by construction. It hooks the harness's token
> output stream, NOT the model. Whatever LLM produced the text - DeepSeek,
> GLM, or the next one - the same six stream flavors and two governance
> roles apply.

Rewrite:

> The family hooks the harness's token stream, not the model. Any model that
> writes through the harness gets the same six stream normalizers and the
> same two governance roles.

## 2. P0 - correctness (fix before any polish)

### P0.1 The npm claim is false for three packages

- Files: `Site/Source/pages/plugins.astro:205`, `Site/Source/pages/setup.astro:350-357`.
- The claim: "ALL fifteen packages are on npm at the v0.0.1 release."
- The truth: `hook-dsh-ccr`, `hook-dsh-tool-coach`, and
  `hook-dsh-live-containers` return 404 on the registry; the install
  snippets on their detail pages fail.
- Fix: either publish the three packages, or change the copy to the
  verified set and mark those three snippets "publish pending - build from
  source". Use `${Versions.Release}`, not the literal `0.0.1`.
- Acceptance: every install snippet on `/plugins/` resolves; the copy
  matches the registry state; the version comes from `Content.ts`.

### P0.2 The newest model is missing

- Files: `models.astro:12-23,31,53-59`, `index.astro:713-715`,
  `matrix.astro:84,111,114`, `workbench.astro:88`.
- The site names DeepSeek V4 Flash and GLM 5.3 Flash; the catalog added
  `deepseek-v4.1-flash-1017` on 2026-10-20, and the profile now allows
  only that model.
- Fix: add DeepSeek V4.1 Flash 1017 as the current route; keep 0731 as the
  fallback and GLM as the second tested vendor. Rewrite the "reference
  models" section as "routes the family has been tested on", not a vendor
  ranking.
- Acceptance: the page names the current route and the fallback; no page
  claims a model the catalog no longer allows as the primary.

### P0.3 The pinner page renders drafting notes

- File: `Site/Source/pages/plugins/hook-dsh-package-pinner.astro`, 14
  paragraphs beginning "Show ..." (lines 230, 261, 263, 293, 320, 353,
  405, 430, 454, 570, 595, 629, 656, 683).
- Fix: replace each with a one-sentence caption that states what the
  diagram or block shows, in the reader's terms.
- Acceptance: no "Show " paragraphs remain; every diagram has a caption
  that stands alone.

### P0.4 Package-count drift

- Files: `case-study.astro:278,291,317,318,1248`; `versions.astro:87,145`
  ("IDENTICAL FOURTEEN CONTRACTS"); `hook-dsh-core.astro:69,129`
  ("thirteen other packages"); `Site/README.md:12,13,30,71`; root
  `README.md:7-16,35,222,281-282,442`.
- Fix: fifteen packages, fourteen manifest suites, 24 content pages + the
  404. Prefer `${Counts.Packages}` and `${Counts.Suites}` where the page
  can import them.
- Acceptance: a grep for `twelve|thirteen|fourteen` in `Site/Source/pages`
  returns only legitimate historical uses (the case-study's era section,
  where the number is the point).

### P0.5 The landing installs a library

- File: `index.astro:260` `<Terminal Pkg="hook-dsh-core" Rail />`.
- Core is a library, not a plugin; a reader who copies the hero command
  activates nothing.
- Fix: install a bundle (the pinner or the factory) and link `/setup/` as
  the next step. Say what the command does.
- Acceptance: the hero command is a loader-activatable package; the next
  step is one click away.

### P0.6 False absolutes

- Files: `index.astro:255` "EVERY model's output"; `models.astro:122-123`
  "run on EVERY token batch"; `hook-dsh-normalize-ellipsis.astro:248`
  "EVERY typographic three-dot ellipsis code point"; `setup.astro:716`
  "EACH plugin writes its own durable ledger"; `hook-dsh-core.astro:74,77`
  "PLUGIN DETAIL" beside "NOT A PLUGIN".
- Fix: the tool-argument and step-batch arms are opt-in, so the stream
  claims are false as written; the core and factory write no ledger; core
  is a library, so its eyebrow should read "LIBRARY DETAIL".
- Acceptance: every "every/each/zero/never" is either true in code or
  gone.

### P0.7 The smoke totals are understated

- Files: `Site/Source/Library/Content.ts:73-76` (the 1008/1021 fallback),
  `Site/Source/Library/Live.ts` (parses the manifest line), and the manifest
  itself in `Classic/smokes/README.md` and `EffectTS/smokes/README.md`.
- The manifest line is stale against the per-folder tests: dash 184 vs 132,
  each small flavor 104 vs 62, normalize-file 112 vs 71, factory 35 vs 34.
  Core, governor, pinner, cargo, ccr, and tool-coach match. The per-folder
  READMEs are the runner's arbiter (`Maintain/Run-Smokes.mjs`).
- The real Classic total is 1,312 across the manifest suites, 1,592 with the
  live-containers folders. The EffectTS total needs the same per-folder sum;
  do not assume the additive delta alone.
- Fix: make `Live.ts` sum the per-folder `## Expected count` values (or
  regenerate the manifest from them), then let every page read the derived
  total. Do not hardcode a new number.
- Acceptance: the displayed total equals the sum the runner guards;
  `pnpm Drift` passes; the root README and `Site/README.md` quote the same
  derived number.

## 3. P1 - structure and discovery

### P1.1 One detail-page template

- The 15 detail pages share Where It Fits / In the DeepSeek Harness /
  Config / In Action / Ledger / Related, but 8 omit Known limits (core,
  factory, ellipsis, file, fullwidth, invisible, quotes, spaces),
  `live-containers` omits Problem and How It Works, `tool-coach` and
  `core` replace sections, and `pinner` uses hand-rolled markup instead of
  `Concept`.
- Fix: define the template in the `site-authoring` skill and apply it:
  hero, what it is, where it fits, how it works, config, in action, ledger,
  known limits, related. Convert pinner to `Concept`; use `PageHero` and
  `SectionHeader` everywhere.
- Acceptance: the 15 pages have the same section set; the only variation
  is content, not markup.

### P1.2 Nav, 404, and sitemap parity

- `Base.astro:24-33` omits `/matrix/`; `Public/404.html:111-117` lists
  five of the nine top-level pages; the sitemap has 24 URLs.
- Fix: one page set drives the nav and the 404; add Matrix next to
  Workbench.
- Acceptance: every top-level page appears in the nav and the 404; the
  sitemap matches.

### P1.3 Workbench vs Matrix

- Both demo raw-vs-normalized output; neither says which to use.
- Fix: one sentence at the top of each: the workbench is the full gate
  (six hooks, metrics, trace); the matrix is the per-engine inspector
  (raw payload vs armed hooks).
- Acceptance: a reader can choose in one sentence.

### P1.4 Registry affordances

- `plugins.astro:209-264`: chips omit CARGO, GUARDIANS, FILE; every tag
  contains "hook", so searching "hook" returns all 15; the filter state is
  not in the URL.
- Fix: add the missing chips, make the tags specific, put the filter in
  the query string.
- Acceptance: a filtered view is linkable; "cargo" and "file" find their
  packages.

### P1.5 Setup completeness

- The configurator covers 14 slots and omits `live-containers`; the ledger
  table lists 7 of 15 under "One ledger per plugin".
- Fix: add the disabled package with an explicit "ships disabled" note;
  retitle the ledger table "Ledgers for the hooks that write one" and list
  the writers.
- Acceptance: the one shipped-disabled package has a wiring path; the
  table matches the code.

## 4. P2 - the wording rewrite

### P2.1 Cross-page duplication to remove

- The three notation lines are verbatim on `index.astro:726-732` and
  `models.astro:145-149`.
- The 15 plugin cards on `index.astro` duplicate the `plugins.astro`
  cards.
- The version cards duplicate `versions.astro`.
- The landing use cases lift the pinner/governor/dash/ccr In Action pairs.
- The smoke baseline appears on both `plugins.astro` and `versions.astro`.
- The failure cases appear on `plugins.astro`, `case-study.astro`, and
  `versions.astro`.
- The "profile wiring is on the setup page" paragraph is verbatim on 13
  hook pages; the scopes/overpass section repeats on 7 normalize pages;
  "Chunk-boundary-safe" on 5; "Volatile cells commit without remounting"
  on 4.
- Fix: one canonical statement per fact; the other pages link to it. The
  detail pages keep the specific config and ledger, and link the shared
  setup/scopes text to `/setup/`.
- Acceptance: no paragraph longer than one sentence appears verbatim on
  two pages.

### P2.2 Terminology

- Fix the pairs: "clean ASCII" vs "normalized"; "canonical sanitized" vs
  "normalized"; "products" (retired route) vs "plugins"; "capabilities"
  vs "packages"; "governor-package" vs `hook-dsh-package-governor`.
- Fix `hook-dsh-cargo-governor.astro:176,179` ("governor-package",
  "pinner-package") to the package names.
- Fix `hook-dsh-ccr.astro:292` "Ported from Aphrodite's CCR pipeline" -
  an internal codename on a public page; say "ported from an earlier
  proxy-side compressor".
- Acceptance: a glossary term list in the `site-authoring` skill; a grep
  for the retired terms returns nothing.

### P2.3 Per-page rewrite briefs

| Page | The brief |
| --- | --- |
| `index` | Lead with the two jobs (normalize output, govern manifests); install a bundle; cut the duplicated cards to a short grid with links. |
| `plugins` | The registry is the install surface: verified snippets, specific chips, no "ALL on npm" until true. |
| `setup` | Four steps, each one action and one check; the configurator is the shortcut, not the tutorial. |
| `versions` | State the release and the invariants; move the changelog to a compact record; fix fourteen to fifteen. |
| `flavors` | Fifteen packages, four groups; the seven normalizers, the three governance hooks, the two guardians, the live blocks. |
| `models` | The family hooks the stream, not the model; the routes tested, current and fallback. |
| `workbench` | The full gate demo; say what the metrics mean. |
| `matrix` | The per-engine inspector; say which arm it models. |
| `case-study` | The history is era-bound; keep "twelve" only where the era is the subject, and say so. |
| detail pages | What it is, where it fits, how it works, config, in action, ledger, limits, related; no drafting notes. |

## 5. P3 - the content model

- Move hardcoded figures to `Content.ts`: fifteen/15, 0.0.1, 146/129,
  "Four steps", "Eleven", "twelve", "thirteen other".
- Remove the unused exports (`Methods.Metadata`, `Copyright.Year`,
  `Fallback.Totals`) or use them.
- Fix the stale comments: `StatsBand.astro:3` "12 packages / 733 + 746";
  `Terminal.astro:5` "ALL 25 packages"; `Site/README.md:71` "21 pages".
- Run `pnpm Drift` after every figure change.
- Acceptance: `pnpm Drift` passes; a grep for the retired numbers in
  `Site/Source` returns only historical prose.

## 6. Sequencing

1. P0.1 and P0.2 - the broken install and the missing model.
2. P0.3 and P0.4 - the drafting notes and the counts.
3. P0.5 and P0.6 - the hero and the absolutes.
4. P1.1 and P1.2 - the template and the nav/404.
5. P1.3 to P1.5 - the demos, the registry, the setup.
6. P2 - the rewrite, page by page, with the build after each page.
7. P3 - the content model, then `pnpm Drift`.

## 7. Acceptance (every item)

- `cd Site && pnpm prepublishOnly` exits zero.
- `find Site/Target -name "*.html" | wc -l` is 25 (or the new count).
- The changed string appears in `Site/Target/`.
- `pnpm Drift` passes.
- The nav, the 404, and the sitemap agree.

## 8. What not to change

The design system (blue and white, hairlines, zero elevation), the
`Content.ts`/`Live.ts` model, the Mermaid pipeline, and the per-page
structure are working. This is an accuracy, wording, and discovery pass,
not a redesign.

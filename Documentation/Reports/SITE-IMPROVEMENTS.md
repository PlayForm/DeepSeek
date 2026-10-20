# Site Improvements (2026-10-20)

A grounded proposal for the Site/ website after the recent family changes:
the four new packages (`cargo-governor`, `ccr`, `live-containers`,
`tool-coach`), the model-catalog addition (`deepseek-v4.1-flash-1017`), and
the smoke-manifest growth. The built site is already current on the counts
(1008/1021, fifteen packages); the defects are in specific claims, not in
the whole content model.

This is a proposal. Nothing in Site/ has been changed.

## What is already right

- The built pages carry 1008/1021 and "fifteen"; the 733/746 staleness lives
  in the READMEs, not in `Target/`.
- All four new packages have detail pages (`plugins/hook-dsh-{cargo-governor,
  ccr,tool-coach,live-containers}/`).
- Per-page `h1`, focus states, reduced-motion guards, canonical/OG/JSON-LD,
  and the sitemap all check out.
- The content model (`Content.ts` + `Live.ts`) reads the real manifests and
  smoke READMEs at build time.

## P0 - the broken promises

### 1. The false npm-publication claim

Evidence: `Source/pages/plugins.astro:205` says "ALL fifteen packages are on
npm at the v0.0.1 release"; `Source/pages/setup.astro:350,355` repeats the
claim. Three packages return 404 on the registry: `hook-dsh-ccr`,
`hook-dsh-tool-coach`, `hook-dsh-live-containers`. Their install snippets
(`plugins.astro:71,79,90`) fail.

Fix, in order of preference:

1. Publish the three packages, then keep the claim.
2. Otherwise, mark those three install snippets "publish pending - build
   from source" and change the page copy from "ALL fifteen" to the verified
   set. The setup page keeps the `link:` + bundles-list route as the primary
   path, which is already correct.

Why first: the install snippet is the primary conversion path; a 404 there
is the most expensive defect on the site.

### 2. The missing model

Evidence: `models.astro:12-23,31,53-59`, `index.astro:713-715`,
`matrix.astro:84,111,114`, `workbench.astro:88` name only DeepSeek V4 Flash
and GLM 5.3 Flash. The catalog added `deepseek-v4.1-flash-1017` on
2026-10-20 (`Documentation/Skill/task-routing/references/catalog.md`).

Fix: add DeepSeek V4.1 Flash 1017 as the current DeepSeek route, with the
V4 Flash 0731 fallback noted. Keep the model-agnostic argument; the point is
which routes are battle-tested, not a vendor ranking.

## P1 - the stale surfaces

### 3. `Site/README.md`

Evidence: lines 12-13 and 30 say twelve plugins / twelve detail pages; line
71 says 21 pages. Reality: fifteen detail pages, 25 built HTML pages.

Fix: update the counts and the page table; state that the README is
verified against the build, not against memory.

### 4. The root `README.md`

Evidence: lines 7-9, 15-16, 35, 222, 281-282, 442 still say twelve packages,
733/746 assertions, 24 smokes, 21 site pages.

Fix: fifteen packages per tree plus the base; 1008/1021 manifest totals with
the live-containers caveat; 25 site pages. This is the family's public
front door and it contradicts the site.

### 5. The 404 page

Evidence: `Public/404.html:111-117` lists Overview, Plugins, Versions,
Flavors, Models - missing Setup, Workbench, Case Study, Matrix, and the
plugin index. Lines 8-11 load Google Fonts while the site self-hosts.

Fix: generate the 404 nav from the same page set as `Base.astro` (or copy
the full list), and self-host the fonts or use the system stack on the
error page.

### 6. The primary nav

Evidence: `Source/Layout/Base.astro:24-33` lists eight entries; `/matrix/`
is reachable only from the footer. `/workbench/` is in the nav.

Fix: add Matrix next to Workbench, or state the footer-only convention and
apply it to both interactive pages consistently.

## P2 - the infrastructure

### 7. The link check

Evidence: `Site/lychee.toml:5` documents `pnpm lychee`; `Site/package.json`
has no such script. The documented command cannot run.

Fix: add a `lychee` script (or point the config at `Maintain/Lychee.sh`),
then run it to catch the dead registry links.

### 8. The headers

Evidence: `Public/_headers` has cache rules, `nosniff`, and a referrer
policy, but no CSP, frame protection, or permissions policy.

Fix: add `Content-Security-Policy` (at least `default-src 'self'` with the
inline-script exceptions the site actually needs), `X-Frame-Options: DENY`
or `frame-ancestors 'none'`, and a minimal `Permissions-Policy`.

### 9. `robots.txt`

Evidence: the file is two lines and has no `Sitemap:` entry.

Fix: add `Sitemap: https://deepseek.playform.cloud/sitemap-index.xml`.

### 10. The stylesheet weight

Evidence: `Source/Stylesheet/Global.css` is about 113 KB and ships to every
page; Beasties runs with `pruneSource: false`.

Fix: audit unused selectors, split page-specific blocks (workbench, matrix,
compare) into per-page styles, and keep the shared token layer small. This
is the highest-effort item; do it after the accuracy fixes.

## The recommended sequence

1. P0.1 (the npm claim) - one page pair, high impact.
2. P0.2 (the model) - one page plus the labels.
3. P1.3 and P1.4 (the READMEs) - the documents that contradict the site.
4. P1.5 and P1.6 (the 404 and the nav) - small, visible.
5. P2.7-P2.9 (the link check, headers, robots) - deploy hygiene.
6. P2.10 (the CSS) - a measured performance pass.

## Verification for every item

- `cd Site && pnpm prepublishOnly` exits zero.
- `find Site/Target -name "*.html" | wc -l` is 25 (or the new count).
- The changed string appears in `Site/Target/`.
- `pnpm Drift` passes.
- The nav, the 404, and the sitemap agree on the page set.

## What not to change

The design system (blue + white, hairlines, zero elevation), the content
model (`Content.ts`/`Live.ts`), the Mermaid pipeline, and the per-page
structure are working. The improvements above are accuracy, discovery, and
deploy hygiene; they do not need a redesign.

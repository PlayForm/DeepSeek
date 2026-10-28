[**2** Branches](https://github.com/PlayForm/Site-DeepSeek/branches)[](https://github.com/PlayForm/Site-DeepSeek/tags)
Go to file
Open more actions menu
[feat: add showcase walkthroughs, new components, and rebuild static a…](https://github.com/PlayForm/Site-DeepSeek/commit/c4f46e14d5bfb220e4f45c118ab640c624547c9c)
Open commit detailsfailure
Oct 28, 2026
[c4f46e1](https://github.com/PlayForm/Site-DeepSeek/commit/c4f46e14d5bfb220e4f45c118ab640c624547c9c) · Oct 28, 2026
[6,049 Commits](https://github.com/PlayForm/Site-DeepSeek/commits/Current/)
Open commit details
6,049 Commits  
| Name  | Name  | Last commit message  | Last commit date  |  
| --- | --- | --- | --- |  
|   |   | [build: regenerate static site assets and icons](https://github.com/PlayForm/Site-DeepSeek/commit/eba6dcece330139f6d323f9af620a33ca23729b4 "build: regenerate static site assets and icons

This commit rebuilds the entire static site output under the `Target/` directory, including updated HTML pages, SVG icons, CSS, JavaScript bundles, and service worker. The changes reflect a full regeneration of the build artifacts, ensuring that all assets are up-to-date with the latest source code and configuration.

Key updates:
- Added new SVG icon for `lib-dsh-conversation` and updated existing icon paths.
- Regenerated all Astro-generated JavaScript and CSS files, including runtime, router, and page bundles.
- Updated all HTML pages across the site \(case study, explore, marketplace, plugins, reference, setup\) to reflect new content and navigation.
- Rebuilt the service worker and sitemap to match the updated asset set.
- Adjusted icon colors and paths in the `Color` directory.
- Updated the `404.html` page and other static assets.

This rebuild is part of the continuous integration pipeline to ensure that the deployed site reflects the latest code changes.")  | Oct 28, 2026  |  
|   |   | [feat: add new SVG icons and update existing ones](https://github.com/PlayForm/Site-DeepSeek/commit/84709e4f36dd0de729b0de2c8e3cc73b451852f2 "feat: add new SVG icons and update existing ones

- Added new SVG icon for lib-dsh-conversation.
- Updated client-dsh-panel-family-host SVG with new paths and adjusted fill opacities.
- Created a new SVG file for lib-dsh-conversation with updated structure and styles.

feat: implement Groups and Model for graph management

- Introduced Groups module to categorize various plugins and hooks.
- Developed Model module to handle validation and serialization of catalogue and graph data.
- Added functions for parsing imports and projecting catalogues based on tree structure.

chore: update package dependencies

- Bumped versions for @playform/build, astro, autoprefixer, postcss, and added new dependencies for cytoscape and elkjs.
- Adjusted pnpm workspace configuration to include new minimum release age exclusions.

Signed-off-by: Nikola Hristov <Nikola@PlayForm.Cloud>")  | Oct 28, 2026  |  
|   |   | [feat(reference): consolidate reference pages and enrich plugin pages …](https://github.com/PlayForm/Site-DeepSeek/commit/a809359c4710c3dcaa8c39d7967bbf2b36baaf38 "feat\(reference\): consolidate reference pages and enrich plugin pages with per‑package facts

Implemented a major refactor of the site’s reference surface:

* Created a single `Reference` page that merges the former `/models/`, `/flavors/`, `/matrix/`, `/versions/`, and `/workbench/` routes into one anchored sectioned page.
* Updated all internal links to use the new `#` anchors, removing the now‑deleted legacy pages.
* Added a compact facts table to `PluginPage.astro` that displays version, tree, kind, dependencies, exports, modules, smoke‑check counts, and twin information, rendering each row only when the source data exists.
* Introduced a “Why it exists” section that pulls the first paragraph from a package’s README or falls back to its `package.json` description, quoting up to two sentences.
* Added helper functions `SentencesOf`, `ReadPackageText`, `ReadDescription`, and `FirstParagraph` to `Live.ts` for parsing README content.
* Updated component markup and styling to support the new facts table and fact rows.
* Added a `.prettierignore` file to exclude the `Target/` tree and other generated artifacts from formatting.
* Minor adjustments to `.github/workflows/Dependabot.yml` and `.astro/preview.json`/`.astro/settings.json` to keep the build context tidy.
* Updated various page links \(`/reference/#...`\) and removed references to the deleted routes.

All changes keep the site’s visual consistency while improving maintainability, accessibility, and SEO by consolidating reference content and enriching plugin documentation.")  | Oct 27, 2026  |  
|   |   | [feat: Enhance navigation and add new features](https://github.com/PlayForm/Site-DeepSeek/commit/6eb59b7f15156dd8c4deeff07896533d76b24a74 "feat: Enhance navigation and add new features

- Updated Base.astro to include new primary navigation links for "Showcase" and "Observatory".
- Expanded the sitemap in Base.astro to include "Timeline" and "Connect" links.
- Introduced SumKnown function in Content.ts to handle null values in package census calculations.
- Added Catalogue.server.mjs to scan and validate package manifests in source trees.
- Created ElkModel.mjs for converting graph data to ELK format and reading positions.
- Enhanced Groups.mjs with improved formatting and organization of plugin groups.
- Updated Model.mjs to include new validation and census calculation logic.
- Added comprehensive tests for the new features in Catalogue.test.mjs and Model.test.mjs.
- Implemented helper functions in Helpers.mjs for test fixtures and package writing.
- Updated pnpm-workspace.yaml for better dependency management.

Signed-off-by: Nikola Hristov <Nikola@PlayForm.Cloud>")  | Oct 28, 2026  |  
|   |   | [Refactor code structure for improved readability and maintainability](https://github.com/PlayForm/Site-DeepSeek/commit/90085f2b8bf5c886c4bdfbb2c364c1634f37073a "Refactor code structure for improved readability and maintainability

Signed-off-by: Nikola Hristov <Nikola@PlayForm.Cloud>")  | Oct 28, 2026  |  
|   |   | [feat: Enhance navigation and add new features](https://github.com/PlayForm/Site-DeepSeek/commit/6eb59b7f15156dd8c4deeff07896533d76b24a74 "feat: Enhance navigation and add new features

- Updated Base.astro to include new primary navigation links for "Showcase" and "Observatory".
- Expanded the sitemap in Base.astro to include "Timeline" and "Connect" links.
- Introduced SumKnown function in Content.ts to handle null values in package census calculations.
- Added Catalogue.server.mjs to scan and validate package manifests in source trees.
- Created ElkModel.mjs for converting graph data to ELK format and reading positions.
- Enhanced Groups.mjs with improved formatting and organization of plugin groups.
- Updated Model.mjs to include new validation and census calculation logic.
- Added comprehensive tests for the new features in Catalogue.test.mjs and Model.test.mjs.
- Implemented helper functions in Helpers.mjs for test fixtures and package writing.
- Updated pnpm-workspace.yaml for better dependency management.

Signed-off-by: Nikola Hristov <Nikola@PlayForm.Cloud>")  | Oct 28, 2026  |  
|   |   | [feat: add showcase walkthroughs, new components, and rebuild static a…](https://github.com/PlayForm/Site-DeepSeek/commit/c4f46e14d5bfb220e4f45c118ab640c624547c9c "feat: add showcase walkthroughs, new components, and rebuild static assets

Implemented a comprehensive set of new UI components and pages to support the
“Showcase” section of the site. Added `EvidenceStrip`, `Explorer` compact mode,
`GraphPreview`, and `ScenarioCard` components, along with pages for
`connect`, `reference`, `showcase`, and dynamic walkthrough routes. Introduced
`Stories.mjs` to expose walkthrough metadata and updated the changelog to
`0.2.1`.

The change also regenerates all static assets in the `Target/` directory:
SVG icons, CSS bundles, JavaScript, service worker, and sitemap. Existing
plugin and reference pages were removed in favor of the new component‑based
approach, and the build output was updated to reflect the new structure and
styles.")  | Oct 28, 2026  |  
|   |   | [feat: add showcase walkthroughs, new components, and rebuild static a…](https://github.com/PlayForm/Site-DeepSeek/commit/c4f46e14d5bfb220e4f45c118ab640c624547c9c "feat: add showcase walkthroughs, new components, and rebuild static assets

Implemented a comprehensive set of new UI components and pages to support the
“Showcase” section of the site. Added `EvidenceStrip`, `Explorer` compact mode,
`GraphPreview`, and `ScenarioCard` components, along with pages for
`connect`, `reference`, `showcase`, and dynamic walkthrough routes. Introduced
`Stories.mjs` to expose walkthrough metadata and updated the changelog to
`0.2.1`.

The change also regenerates all static assets in the `Target/` directory:
SVG icons, CSS bundles, JavaScript, service worker, and sitemap. Existing
plugin and reference pages were removed in favor of the new component‑based
approach, and the build output was updated to reflect the new structure and
styles.")  | Oct 28, 2026  |  
| [Tests/Observatory](https://github.com/PlayForm/Site-DeepSeek/tree/Current/Tests/Observatory "This path skips through empty directories")  | [Tests/Observatory](https://github.com/PlayForm/Site-DeepSeek/tree/Current/Tests/Observatory "This path skips through empty directories")  | [Refactor code structure for improved readability and maintainability](https://github.com/PlayForm/Site-DeepSeek/commit/90085f2b8bf5c886c4bdfbb2c364c1634f37073a "Refactor code structure for improved readability and maintainability

Signed-off-by: Nikola Hristov <Nikola@PlayForm.Cloud>")  | Oct 28, 2026  |  
| [Refactor code structure for improved readability and maintainability](https://github.com/PlayForm/Site-DeepSeek/commit/90085f2b8bf5c886c4bdfbb2c364c1634f37073a "Refactor code structure for improved readability and maintainability

Signed-off-by: Nikola Hristov <Nikola@PlayForm.Cloud>")  | Oct 28, 2026  |  
|   |   | [refactor(reference): add modular reference components and update giti…](https://github.com/PlayForm/Site-DeepSeek/commit/251405ab662ebf33d92ae953acd0002e4e837a95 "refactor\(reference\): add modular reference components and update gitignore

Implemented a modular refactor of the Reference section by extracting the former `/flavors/`, `/matrix/`, `/models/`, `/versions/`, and `/workbench/` pages into dedicated Astro components \(`Flavors.astro`, `Matrix.astro`, `Models.astro`, `Versions.astro`, `Workbench.astro`\). These components are now composed into a single consolidated Reference page, improving maintainability and reducing duplication.

Key changes:
- Created new Astro components for each reference section with verbatim content and minimal edits \(hero level adjustment\).
- Updated `.gitignore` to correctly exclude the root `Reference/` directory, preventing accidental omission of reference files from the repository.
- Updated generated `.astro` collection, content, and types files to reflect new component structure.
- Adjusted internal links and hero titles to align with the new consolidated layout.
- Added explanatory comments and preserved original styling and scripts within each component.

This refactor enhances the site’s architecture, making the reference surface easier to extend and debug while ensuring consistent build behavior.")  | Oct 27, 2026  |  
|   |   | [chore: add .node-version file with Node.js version 24.15.0](https://github.com/PlayForm/Site-DeepSeek/commit/af76a7befda58ab203992b50a2c7d6a7eaf41110 "chore: add .node-version file with Node.js version 24.15.0

Signed-off-by: Nikola Hristov <Nikola@PlayForm.Cloud>")  | Oct 20, 2026  |  
|   |   |   | Oct 6, 2026  |  
|   |   | Jan 15, 2025  |  
|   |   | [feat(reference): consolidate reference pages and enrich plugin pages …](https://github.com/PlayForm/Site-DeepSeek/commit/a809359c4710c3dcaa8c39d7967bbf2b36baaf38 "feat\(reference\): consolidate reference pages and enrich plugin pages with per‑package facts

Implemented a major refactor of the site’s reference surface:

* Created a single `Reference` page that merges the former `/models/`, `/flavors/`, `/matrix/`, `/versions/`, and `/workbench/` routes into one anchored sectioned page.
* Updated all internal links to use the new `#` anchors, removing the now‑deleted legacy pages.
* Added a compact facts table to `PluginPage.astro` that displays version, tree, kind, dependencies, exports, modules, smoke‑check counts, and twin information, rendering each row only when the source data exists.
* Introduced a “Why it exists” section that pulls the first paragraph from a package’s README or falls back to its `package.json` description, quoting up to two sentences.
* Added helper functions `SentencesOf`, `ReadPackageText`, `ReadDescription`, and `FirstParagraph` to `Live.ts` for parsing README content.
* Updated component markup and styling to support the new facts table and fact rows.
* Added a `.prettierignore` file to exclude the `Target/` tree and other generated artifacts from formatting.
* Minor adjustments to `.github/workflows/Dependabot.yml` and `.astro/preview.json`/`.astro/settings.json` to keep the build context tidy.
* Updated various page links \(`/reference/#...`\) and removed references to the deleted routes.

All changes keep the site’s visual consistency while improving maintainability, accessibility, and SEO by consolidating reference content and enriching plugin documentation.")  | Oct 27, 2026  |  
|   |   | [chore(docs): update design docs, changelog formatting, and rename pre…](https://github.com/PlayForm/Site-DeepSeek/commit/a7e76df09acfeb020b51d19e720ccdf3353e5be2 "chore\(docs\): update design docs, changelog formatting, and rename prerender chunks

This commit cleans up and modernises the design documentation and changelog, aligning them with the current design language and project structure. Key changes include:

* **CHANGELOG.md** – Minor wording corrections, improved sentence structure, and removal of redundant line breaks for clearer readability.
* **DESIGN.md** – Re‑formatted the entire document for consistency, added line breaks, and clarified the design thesis and scope. Updated section headings, improved paragraph flow, and fixed typographical errors.
* **Design folder** – Updated all design markdown files \(`00-BRIEF.md`, `01-DESIGN-LANGUAGE.md`, `02-COMPONENT-MAP.md`, `03-PAGE-TRANSFORMATION.md`, `04-IMPLEMENTATION-TASKS.md`, `05-REFERENCES-AND-DECISIONS.md`, `06-THE-BIG-CABINET.md`, `07-REVIEW-AMENDMENTS.md`, `08-FINAL-DECISIONS.md`, `09-CANARY-RESULT.md`, `README.md`\) to reflect the latest design decisions, improve clarity, and remove legacy wording.
* **Source/Content/CHANGELOG.md** – Updated formatting and added a new 0.3.0 section with change notes.
* **Source/Content/Mermaid SVGs** – Minor updates to keep them in sync with the latest diagram changes.
* **Target/.prerender chunks** – Renamed multiple prerender chunk files to match the new naming scheme, ensuring consistency across the build output.

All documentation now follows a consistent style, uses the new design language, and is easier to maintain. The commit preserves the functional content while improving readability and alignment with the current project state.")  | Oct 27, 2026  |  
|   |   | [chore(site): tidy docs, update icons, and prune obsolete pages](https://github.com/PlayForm/Site-DeepSeek/commit/cb2788bb49d2e76911b7b7dc4da95541052d0323 "chore\(site\): tidy docs, update icons, and prune obsolete pages

This commit cleans up the project’s documentation and design files for better readability, updates icon assets to larger, higher‑resolution versions, and removes a large number of outdated or unused HTML pages and service‑worker files from the build output.

Key changes:
- Re‑formatted README, CHANGELOG, CODE_OF_CONDUCT, CONTRIBUTING, and all Design/*.md files, adding blank lines, correcting line breaks, and improving paragraph structure.
- Updated Target/Icons/*.svg to larger, higher‑resolution graphics and adjusted related references.
- Pruned obsolete Target/* pages \(case‑study, flavors, marketplace, matrix, models, plugins, service‑worker, setup, sitemap, versions, workbench\) and removed service‑worker.js and workbox‑0bb07689.js.
- Minor adjustments to Target/_astro assets and Manifest.json to reflect the new icon set and removed pages.

These changes improve maintainability, visual fidelity, and keep the build output lean.")  | Oct 27, 2026  |  
|   |   | [chore(site): tidy docs, update icons, and prune obsolete pages](https://github.com/PlayForm/Site-DeepSeek/commit/cb2788bb49d2e76911b7b7dc4da95541052d0323 "chore\(site\): tidy docs, update icons, and prune obsolete pages

This commit cleans up the project’s documentation and design files for better readability, updates icon assets to larger, higher‑resolution versions, and removes a large number of outdated or unused HTML pages and service‑worker files from the build output.

Key changes:
- Re‑formatted README, CHANGELOG, CODE_OF_CONDUCT, CONTRIBUTING, and all Design/*.md files, adding blank lines, correcting line breaks, and improving paragraph structure.
- Updated Target/Icons/*.svg to larger, higher‑resolution graphics and adjusted related references.
- Pruned obsolete Target/* pages \(case‑study, flavors, marketplace, matrix, models, plugins, service‑worker, setup, sitemap, versions, workbench\) and removed service‑worker.js and workbox‑0bb07689.js.
- Minor adjustments to Target/_astro assets and Manifest.json to reflect the new icon set and removed pages.

These changes improve maintainability, visual fidelity, and keep the build output lean.")  | Oct 27, 2026  |  
|   |   | [feat(reference): consolidate reference pages and enrich plugin pages …](https://github.com/PlayForm/Site-DeepSeek/commit/a809359c4710c3dcaa8c39d7967bbf2b36baaf38 "feat\(reference\): consolidate reference pages and enrich plugin pages with per‑package facts

Implemented a major refactor of the site’s reference surface:

* Created a single `Reference` page that merges the former `/models/`, `/flavors/`, `/matrix/`, `/versions/`, and `/workbench/` routes into one anchored sectioned page.
* Updated all internal links to use the new `#` anchors, removing the now‑deleted legacy pages.
* Added a compact facts table to `PluginPage.astro` that displays version, tree, kind, dependencies, exports, modules, smoke‑check counts, and twin information, rendering each row only when the source data exists.
* Introduced a “Why it exists” section that pulls the first paragraph from a package’s README or falls back to its `package.json` description, quoting up to two sentences.
* Added helper functions `SentencesOf`, `ReadPackageText`, `ReadDescription`, and `FirstParagraph` to `Live.ts` for parsing README content.
* Updated component markup and styling to support the new facts table and fact rows.
* Added a `.prettierignore` file to exclude the `Target/` tree and other generated artifacts from formatting.
* Minor adjustments to `.github/workflows/Dependabot.yml` and `.astro/preview.json`/`.astro/settings.json` to keep the build context tidy.
* Updated various page links \(`/reference/#...`\) and removed references to the deleted routes.

All changes keep the site’s visual consistency while improving maintainability, accessibility, and SEO by consolidating reference content and enriching plugin documentation.")  | Oct 27, 2026  |  
|   |   | Oct 9, 2024  |  
|   |   | [feat(reference): consolidate reference pages and enrich plugin pages …](https://github.com/PlayForm/Site-DeepSeek/commit/a809359c4710c3dcaa8c39d7967bbf2b36baaf38 "feat\(reference\): consolidate reference pages and enrich plugin pages with per‑package facts

Implemented a major refactor of the site’s reference surface:

* Created a single `Reference` page that merges the former `/models/`, `/flavors/`, `/matrix/`, `/versions/`, and `/workbench/` routes into one anchored sectioned page.
* Updated all internal links to use the new `#` anchors, removing the now‑deleted legacy pages.
* Added a compact facts table to `PluginPage.astro` that displays version, tree, kind, dependencies, exports, modules, smoke‑check counts, and twin information, rendering each row only when the source data exists.
* Introduced a “Why it exists” section that pulls the first paragraph from a package’s README or falls back to its `package.json` description, quoting up to two sentences.
* Added helper functions `SentencesOf`, `ReadPackageText`, `ReadDescription`, and `FirstParagraph` to `Live.ts` for parsing README content.
* Updated component markup and styling to support the new facts table and fact rows.
* Added a `.prettierignore` file to exclude the `Target/` tree and other generated artifacts from formatting.
* Minor adjustments to `.github/workflows/Dependabot.yml` and `.astro/preview.json`/`.astro/settings.json` to keep the build context tidy.
* Updated various page links \(`/reference/#...`\) and removed references to the deleted routes.

All changes keep the site’s visual consistency while improving maintainability, accessibility, and SEO by consolidating reference content and enriching plugin documentation.")  | Oct 27, 2026  |  
|   |   | [style(site): Normalize trailing whitespace and end-of-file newlines](https://github.com/PlayForm/Site-DeepSeek/commit/f950a69b847333e8b0b1e1da2cc1d24f8f51bbe5 "style\(site\): Normalize trailing whitespace and end-of-file newlines

A formatting pass over the DeepSeek Harness Plugin Family site removes the blank trailing lines that accumulated inside the `page-hero__sub` and narrative paragraphs across the case-study, index, plugins listing and every plugin detail page, and restores the missing final newline on the components and scripts that lacked one.

The stale indentation-only lines disappear from `case-study.astro`, `index.astro`, `plugins.astro` and the cargo-governor, core, dash, ellipsis, file, fullwidth, invisible, quotes, spaces, package-governor and package-pinner pages, where each `<p>` previously carried a whitespace-only line before its closing tag; `grid-measure.cjs`, `ArrowIcon`, `BrandIcon`, `Compare`, `FlavorBadge`, `InstallDemo`, `Showcase`, `StatsBand`, `TerminalTray`, the two generated docs scripts and `docs/assets/navigation.js` and `search.js` gain the terminating newline. `Update.sh` gets the same treatment in its own idiom: the doubled blank lines after the `print_warning` helper and before the absorb-verification block collapse, the `DiscoveredActions` array tightens its spacing, the `read -r` fallback branch expands to one statement per line, and the failure counter reads `FAILED=$\(\(FAILED + 1\)\)`.

`Public/assets/badges.svg` and `docs/assets/icons.svg` re-render at their new byte sizes as the generated art is regenerated from the same sources. Every diff in `Target/` is the uniform rebuilt static output \(regenerated per-page HTML, the rehashed Configurator bundle and service worker\) reflecting the whitespace-only source edits; no page logic or copy changes.")  | Oct 20, 2026  |  
|   |   | [feat(site): Key the site URL to the environment, drive the workbench …](https://github.com/PlayForm/Site-DeepSeek/commit/d038d2f6ddd7902f66efa14d411ecb89f702f86f "feat\(site\): Key the site URL to the environment, drive the workbench simulation by the runtime selection, add the DotSep separator renderer and the governor-package pipeline diagram, and rebuild Target

Why: three disjoint problems converge in this commit. First, every URL the site emits - the canonical tags, og:url, the sitemap and the JSON-LD - was hardcoded to https://deepseek.playform.cloud, so a dev build served locally still pointed at the production origin and leaked a dead canonical onto any page inspected from localhost. Second, the workbench's runtime selection was cosmetic: switching the runtime changed the toast and highlight but the pipeline simulation kept ingesting one chunk per tick, so the runtime switch advertised a divergence the stream never showed. Third, the site's designed separator - the grayed-out, larger dot the metas, kickers and badges use - had no shared renderer, and the DeepSeek engine labels still carried a stale "\(120 tps\)" figure that no longer reflected the model's claimed throughput.

What:
- Source/Library/Links.ts and astro.config.ts: the Site base URL is now environment-keyed on NODE_ENV \(the same key the service-worker gate already uses\). In development every URL the site emits resolves against http://localhost:9999 so all links, canonicals and og:url hit the dev server; the build \(NODE_ENV unset\) keeps the canonical https://deepseek.playform.cloud, so the published SEO surface never leaks localhost. The config repeats the expression \(it cannot import Links.ts at config-eval time\) with the comment updated to point at the source of truth.
- Source/pages/workbench.astro: the runtime selection now actually drives the simulation. Push is split into PushChunk \(one ingest\) and Push, which pushes RuntimeBatch\[Runtime\] chunks per tick - the Classic pipeline ingests one chunk per tick while the Effect-TS v4 Fiber runtime ingests two, mirroring the sequential for-await loop vs the fibered concurrent ingestion. Selecting a runtime sets the batch, updates the stream-status line, then follows with the highlight and toast. The priming loop uses PushChunk directly so the three initial chunks land regardless of runtime, and the "\(120 tps\)" figure is dropped from the engine label.
- Source/Library/FileIcon.ts: a new DotSep\(\) renderer replaces every "·" separator in a rendered string \(metas, kickers, badges, labels\) with the site's designed grayed-out, bigger .dot-sep span \(~1.5x the middle-dot glyph, vertically centered, aria-hidden\). The surrounding spaces are consumed by the span's margins so the visible word bytes stay byte-exact - only the separator glyph changes. It is markup output for HTML contexts only; the JS status strings that must remain textContent keep their own handling.
- Source/pages/matrix.astro and Source/pages/models.astro: the DeepSeek engine pill labels drop the stale "\(120 tps\)" suffix so they match the workbench's engine and runtime labels.
- Source/pages/plugins/hook-dsh-governor-package.astro and Source/Content/Mermaid/govpkg-pipeline.mmd/.svg: a new Concept on the governor-package page introduces the full pipeline as mechanics - the TOOL-layer-only fs/observed trigger, the exclusion-first G1 gate \(the excluded path takes the ledger line; every other gate outcome is silent\), the G2 registry discovery, the detached G3 chain pass ending in the GuardedWrite and P3 re-emit, and the G4 update stage with the first-wins policy pick, the programmatic-or-bin dispatch, the verify and the U2 refresh. The Mermaid source is tightened \(the "^<resolved>" and "`governed <path>" markup is simplified to plain text\) and rendered to SVG.
- Source/Component/Concept.astro and Source/pages/plugins/hook-dsh-pinner-package.astro: the descriptive-title icon gap steps up from the sm \(8px\) to the md \(12px\) token - the user asked the circled-i to push the title text further inward, so the icon reads as its own optical unit, and both blocks stay consistent with each other on both themes.
- Target/ is rebuilt: every page re-renders \(the governor-package page grows most, 390268 -> 436394, as the new pipeline Concept and inline SVG land; the remaining pages shrink by a uniform ~113 bytes each as the stale "\(120 tps\)" and collapsed text ride the rebuild\), the workbench bundle is re-emitted as CHAu5kMS.js \(6458 -> 6711 bytes\) with the runtime-batch logic, and the service worker is re-emitted at unchanged size.

No plugin behavior changes; this commit keys the site URL to the environment, drives the workbench simulation by the runtime selection, adds the DotSep separator renderer and the governor-package pipeline diagram, drops the stale throughput figure, widens the descriptive-title icon gap, and rebuilds the static target.

Signed-off-by: Nikola Hristov <Nikola@PlayForm.Cloud>")  | Oct 9, 2026  |  
|   |   | [fix(site): Preserve rendered Mermaid label spaces, enforce label cont…](https://github.com/PlayForm/Site-DeepSeek/commit/fbcc5449fb340b00ad28eabe643d29469976ec50 "fix\(site\): Preserve rendered Mermaid label spaces, enforce label containment, and crop the brand icons to their ink

Mermaid's word-wrapped labels were silently losing their joining spaces and shipping clipped, while the site's icons each carried a sizing quirk that broke optical uniformity.

Why: with htmlLabels:false, Mermaid word-wraps every label into per-word <tspan> runs and separates the words only through a leading space before each run after the first. SVG whitespace rules treat each <tspan> as its own chunk, so those joining spaces collapse away both in the rendered output \(labels read "Hook@DSH@Core", "Governancehelpers"\) and in Mermaid's own width measurement \(getComputedTextLength collapses the same way\) - so every label box was sized too narrow and edge-adjacent labels spilled past the viewBox, clipping their first characters. The existing label-presence check could not catch this: it compared whitespace-free forms, so glued-together words still matched and a drifting render shipped silently. Separately, the icons were not uniform: the official 144x144 Rust canvas carries ~30% padding that shrank the gear's visual mass at a given em, the PlayForm slot was still a hand-drawn monogram rather than the official mark, and the mechanics icons' strokes were drawn on a full 24px viewBox.

What:
- Source/Content/Mermaid/Render.mjs: a new Space Law intercepts the SVG Node.prototype.textContent setter and rewrites a leading space on each leaf label <tspan> to a non-breaking space \(U+00A0\) the moment Mermaid writes it - NBSP is not collapsible, so the joining spaces survive chunk boundaries in every SVG consumer, measure at full space width \(layout stays in sync with what renders\), and still read as spaces when extracted or copied. The render is now injected into the stage so labels can be measured as actually laid out: when the layout's measured widths drift, the viewBox is grown to cover every label's bounding box plus a margin, and a containment law is enforced on the final geometry \(every label's bbox must sit fully inside the viewBox or the source fails\). The label-presence law is now space-exact: rendered lines are joined with single spaces \(line wraps collapse to one\) and each source label must match that single-space form; a label present only in whitespace-free form is reported as "spaces dropped" and fails the pipeline, never ships. A failing source also dumps a debug SVG to /tmp.
- Source/Content/Mermaid/*.svg: all nine vendored diagrams are regenerated under the corrected renderer so no label is clipped and every joining space survives.
- Source/Component/BrandIcon.astro: the playform slot now renders the official PlayForm glyph from the PlayForm/Asset repository \(path verbatim, official light stroke #151515 at 0.21 opacity, viewBox 561x1727\) instead of the geometric "P" monogram, with an explicit width keeping the tall aspect; the rust/cargo gear mark's viewBox is cropped to the gear's ink \(18 18 106 106\) so it reads at the same optical size as the other marks at the same em; and the four mechanics icons have their viewBoxes cropped to their ink with stroke-width compensated \(0.875-1.375 depending on the crop\) so the rendered stroke keeps the family's original 1.5-on-24 weight \(0.0625em\).
- Target/ is rebuilt: every page and the service worker carry the regenerated diagrams and icons.
- lychee.toml: a new pass-2 link-checker config for the production build and generated API docs \(run via pnpm lychee / Maintain/Lychee.sh\), and components.json's schema pointer is corrected to the current ui.shadcn.com endpoint.

No plugin behavior changes; this is purely the diagram pipeline's space and containment integrity and the site's optical icon sizing.

Signed-off-by: Nikola Hristov <Nikola@PlayForm.Cloud>")  | Oct 8, 2026  |  
|   |   | May 5, 2026  |  
|   |   | [fix(site): Feed the hero subtitles their newline breaks and split bod…](https://github.com/PlayForm/Site-DeepSeek/commit/ea6d9e995fb95dc44facdf2d48a54b05ca23ffef "fix\(site\): Feed the hero subtitles their newline breaks and split body prose at sentence boundaries

A rendering pass so the intended sentence breaks actually appear on the page: every page-hero Sub that was written as a single collapsed paragraph now carries literal newlines in its prop, and a handful of body paragraphs get explicit <br /> breaks at the sentence seams the copy already implied. The README is lightly reflowed and the link-checker is taught to verify root-relative build links.

Why: the shared PageHero component splits its Sub on newlines and joins the lines with <br />, but five hero subtitles \(flavors, matrix, models, versions, index\) were still passed as one flat string, so the sentence breaks the copy intended were silently flattened into a single run of prose. The same collapse happened in body copy where a paragraph carried two distinct sentences \(the index hero lead, the version-card descriptions, the independence and matrix notes\): the newlines in the source were whitespace-collapsed and the intended break never rendered. Separately, the README crammed two independent statements into one paragraph, and lychee was skipping the root-relative build links entirely because its scheme list only allowed http/https.

What:
- Source/pages/flavors.astro, matrix.astro, models.astro, versions.astro, index.astro: the PageHero Sub props are now multi-line strings \(Sub={"...\\n..."}\), letting the shared component's newline splitter render each sentence on its own line.
- Source/pages/index.astro \(hero lead, version-card body, independence body\), matrix.astro \(inspector footnote\), versions.astro \(version-card bodies and the proof note\): body paragraphs gain <br /> at the intended sentence break so the two-sentence layout renders visibly instead of a collapsed run.
- README.md: the Pages deployment notes are reflowed so the cache-rules/404 sentence and the directory-style-routes sentence each stand on their own line instead of sharing one paragraph.
- lychee.toml: "file" is added to the scheme list \(with a comment noting it is required\) so root-relative build links are verified against the build root rather than skipped; http/https remain.
- Target/ is rebuilt: every page and the service worker carry the corrected markup and the regenerated assets under the updated pages.

No plugin behavior changes; this is purely the site's copy rendering so intended line breaks are no longer collapsed.

Signed-off-by: Nikola Hristov <Nikola@PlayForm.Cloud>")  | Oct 8, 2026  |  
|   |   | [feat: add new SVG icons and update existing ones](https://github.com/PlayForm/Site-DeepSeek/commit/84709e4f36dd0de729b0de2c8e3cc73b451852f2 "feat: add new SVG icons and update existing ones

- Added new SVG icon for lib-dsh-conversation.
- Updated client-dsh-panel-family-host SVG with new paths and adjusted fill opacities.
- Created a new SVG file for lib-dsh-conversation with updated structure and styles.

feat: implement Groups and Model for graph management

- Introduced Groups module to categorize various plugins and hooks.
- Developed Model module to handle validation and serialization of catalogue and graph data.
- Added functions for parsing imports and projecting catalogues based on tree structure.

chore: update package dependencies

- Bumped versions for @playform/build, astro, autoprefixer, postcss, and added new dependencies for cytoscape and elkjs.
- Adjusted pnpm workspace configuration to include new minimum release age exclusions.

Signed-off-by: Nikola Hristov <Nikola@PlayForm.Cloud>")  | Oct 28, 2026  |  
|   |   | [feat: Enhance navigation and add new features](https://github.com/PlayForm/Site-DeepSeek/commit/6eb59b7f15156dd8c4deeff07896533d76b24a74 "feat: Enhance navigation and add new features

- Updated Base.astro to include new primary navigation links for "Showcase" and "Observatory".
- Expanded the sitemap in Base.astro to include "Timeline" and "Connect" links.
- Introduced SumKnown function in Content.ts to handle null values in package census calculations.
- Added Catalogue.server.mjs to scan and validate package manifests in source trees.
- Created ElkModel.mjs for converting graph data to ELK format and reading positions.
- Enhanced Groups.mjs with improved formatting and organization of plugin groups.
- Updated Model.mjs to include new validation and census calculation logic.
- Added comprehensive tests for the new features in Catalogue.test.mjs and Model.test.mjs.
- Implemented helper functions in Helpers.mjs for test fixtures and package writing.
- Updated pnpm-workspace.yaml for better dependency management.

Signed-off-by: Nikola Hristov <Nikola@PlayForm.Cloud>")  | Oct 28, 2026  |  
|   |   | [refactor: extensive formatting and whitespace cleanup across site](https://github.com/PlayForm/Site-DeepSeek/commit/b7ee6cf2b6c3383f5b8c52bd7bf028f170a45a45 "refactor: extensive formatting and whitespace cleanup across site

Implemented a comprehensive style and formatting overhaul throughout the codebase.
Key changes include:

- Normalized whitespace, indentation, and line breaks in all Astro components, pages, and scripts.
- Updated front‑matter and JSX/TSX syntax for consistency, adding missing blank lines and closing tags.
- Re‑formatted generated content files \(.astro/collections, .astro/content‑*.mjs, .astro/content.d.ts, .astro/types.d.ts\) to improve readability.
- Refactored utility scripts \(Drift-Guard, baseline-measure, dbg, engine-pill-measure, grid-measure, index-overflow-measure, toggle-clip-measure\) with clearer variable names and added comments.
- Updated documentation assets \(highlight.css, icons.js, navigation.js, search.js, style.css\) and HTML templates for proper formatting and readability.
- Adjusted Tailwind, PostCSS, and Puppeteer configuration files for consistent style.

These changes do not alter functionality but significantly improve maintainability, visual consistency, and developer experience across the project.")  | Oct 27, 2026  |  
|   |   | [refactor(content): add npm publication record support and update inst…](https://github.com/PlayForm/Site-DeepSeek/commit/9d1ade1dbb3559831ea01583faf7dcb0d09949b2 "refactor\(content\): add npm publication record support and update install routes

Implemented a comprehensive update to the site’s publication logic:

* Added a new `Published.ts` module that reads the committed npm registry index and exposes the highest published version for a package.
* Extended `Content.ts` to expose a `Registry` object that aggregates the number of published packages and the newest published release.
* Updated `Configurator.astro`, `PluginPage.astro`, and `Terminal.astro` to use the new `Published` helper, rendering registry‑based install commands when a package is published and falling back to the build‑from‑source route otherwise.
* Adjusted the `Configurator` note to reflect the publication state and the tree’s release status.
* Updated the `PluginPage` install section to show the appropriate registry or build‑from‑source command and updated explanatory text.
* Updated `Terminal` to compute the default command and label based on the publication record.
* Updated `Screens.ts` to mark packages as published when the registry record exists.
* Updated various page components \(`case-study`, `plugins`, `reference`, `setup`\) to display the publication split and adjust descriptions accordingly.
* Minor formatting and documentation updates to keep the site consistent with the new data model.

These changes modernise the site’s handling of npm publication status, improve accuracy of install instructions, and keep the UI in sync with the actual registry state.")  | Oct 27, 2026  |  
|   |   | [refactor: extensive formatting and whitespace cleanup across site](https://github.com/PlayForm/Site-DeepSeek/commit/b7ee6cf2b6c3383f5b8c52bd7bf028f170a45a45 "refactor: extensive formatting and whitespace cleanup across site

Implemented a comprehensive style and formatting overhaul throughout the codebase.
Key changes include:

- Normalized whitespace, indentation, and line breaks in all Astro components, pages, and scripts.
- Updated front‑matter and JSX/TSX syntax for consistency, adding missing blank lines and closing tags.
- Re‑formatted generated content files \(.astro/collections, .astro/content‑*.mjs, .astro/content.d.ts, .astro/types.d.ts\) to improve readability.
- Refactored utility scripts \(Drift-Guard, baseline-measure, dbg, engine-pill-measure, grid-measure, index-overflow-measure, toggle-clip-measure\) with clearer variable names and added comments.
- Updated documentation assets \(highlight.css, icons.js, navigation.js, search.js, style.css\) and HTML templates for proper formatting and readability.
- Adjusted Tailwind, PostCSS, and Puppeteer configuration files for consistent style.

These changes do not alter functionality but significantly improve maintainability, visual consistency, and developer experience across the project.")  | Oct 27, 2026  |  
|   |   | [refactor: extensive formatting and whitespace cleanup across site](https://github.com/PlayForm/Site-DeepSeek/commit/b7ee6cf2b6c3383f5b8c52bd7bf028f170a45a45 "refactor: extensive formatting and whitespace cleanup across site

Implemented a comprehensive style and formatting overhaul throughout the codebase.
Key changes include:

- Normalized whitespace, indentation, and line breaks in all Astro components, pages, and scripts.
- Updated front‑matter and JSX/TSX syntax for consistency, adding missing blank lines and closing tags.
- Re‑formatted generated content files \(.astro/collections, .astro/content‑*.mjs, .astro/content.d.ts, .astro/types.d.ts\) to improve readability.
- Refactored utility scripts \(Drift-Guard, baseline-measure, dbg, engine-pill-measure, grid-measure, index-overflow-measure, toggle-clip-measure\) with clearer variable names and added comments.
- Updated documentation assets \(highlight.css, icons.js, navigation.js, search.js, style.css\) and HTML templates for proper formatting and readability.
- Adjusted Tailwind, PostCSS, and Puppeteer configuration files for consistent style.

These changes do not alter functionality but significantly improve maintainability, visual consistency, and developer experience across the project.")  | Oct 27, 2026  |  
|   |   | [chore(starter): Bump @playform/build to 0.3.4 and drop baseUrl from t…](https://github.com/PlayForm/Site-DeepSeek/commit/3048cb5289ac43d7b443b10c4cfa11ed2f6d0aec "chore\(starter\): Bump @playform/build to 0.3.4 and drop baseUrl from tsconfig

Update the Starter project's dependency and TypeScript configuration to keep the template in sync with the current PlayForm toolchain defaults.

- package.json: bump @playform/build from 0.3.3 to 0.3.4, pulling in the latest build pipeline fixes.
- tsconfig.json: remove the redundant `baseUrl` compiler option so the configuration no longer anchors module resolution to the project root; this aligns the starter with the cleaner relative-import resolution used elsewhere.

Both changes are internal toolchain/configuration updates with no user-facing behavior change.")  | Sep 23, 2026  |  
| View all files |  
# @playform / DSH Family - Site
The website for the **DeepSeek Harness Plugin Family for[PlayForm](https://PlayForm.Cloud)**.
The site is a static Astro build in the "Technical Minimalist Harness" design: blue and white only, Inter and IBM Plex Mono, clean headers, and zero elevation.
Zero elevation means 1px hairlines, no shadows, and no gradients.
## Pages  
| Route  | Contents  |  
| --- | --- |  
| The landing page: eyebrow badges, hero (the mission), terminal install, action row, plugins grid, versions cards, flavor strip, model independence, notation  |  
| `/plugins/`  | The fifteen plugins with their @-sentence identities, the install snippets (the `npm install` form, pinned at the v0.1.0 release), a filterable registry, the pipeline manifest table, the harness seams, the smoke baseline and the architecture-in-action cards  |  
| `/plugins/<name>/`  | Fifteen plugin detail pages (one per package) built from the packages' real documentation: the install bar, the harness seams, Where It Fits, the Problem, How It Works, the Config, In Action (literal characters) and the Ledger  |  
| `/setup/`  | The four-step profile setup (bundles list, cordis.patch.yml entries, restart, ledger verification), the configurable surface and the defaults-off optionality  |  
| `/versions/`  | The dual engine distribution: CLASSIC (plain TypeScript) vs EFFECT-TS (services & layers), both 0.1.0, the shared invariants and the smoke baseline  |  
| `/flavors/`  | The seven normalize flavors (dash, quotes, ellipsis, spaces, invisible, fullwidth, file), the two governance roles, and the 11-badge sprite  |  
| `/models/`  | The model-agnostic story: the family normalizes any LLM's output; battle-tested on DeepSeek V4 Flash and GLM 5.3 Flash  |  
| `/workbench/`  | The interactive Stream Gate & Normalization Workbench: live raw-vs-clean terminals, flavor hook switchboard, telemetry metrics, trace ribbon  |  
| `/matrix/`  | The interactive Matrix Stream Inspector: raw model emission vs normalized output, flavor checkboxes, the smoke suites backing the demo rules  |  
The old `/products/` routes are gone; they are now `/plugins/`.
A stale link lands on the styled `/404` page, which lists the current navigation.
## Structure

```
Source/
	Layout/          the layout shell (Base: header, footer, fonts, meta)
	Component/       the UI components (Badge, Card, SectionHeader, PageHero, Terminal)
	pages/           the Astro pages (index, plugins, versions, flavors, models, workbench, matrix, plugins/<15 detail pages>)
	Script/          the client scripts
	Stylesheet/      the design system (Base.css: Tailwind; Global.css: tokens + layout)
Public/            static assets copied verbatim (404.html, _headers, Manifest.json, robots.txt, assets/)
Target/            the built static site (the deployment artifact)

```

`components.json` declares the component aliases (`./Source/Component`, `./Source/Layout`, `./Source/pages`, `./Source/Stylesheet`), and `prettier.config.js` carries the formatting standard (tabs, width 100) with optional Astro/Tailwind plugins detected when installed.
The site adapts the design tokens and component styles in `Source/Stylesheet/Global.css` from the Reference design system: `--color-primary` `#003ec7`, `--color-primary-container` `#0052ff`, white/near-white surfaces, the `--radius-*` scale, the 8pt spacing rhythm, and the exact Inter / IBM Plex Mono type scale.
Every surface boundary is a 1px `outline-variant` hairline.
## Pitfalls (building the site)
The engineering lessons from building this site, where they bit - the corrected claims stay.
  * **The phantom-icon-space class.** An inline icon next to prose never relies on source whitespace. 
    * Astro's inter-expression whitespace is not part of the layout contract: an icon inside an expression renders glued to the adjacent word, and a literal space beside an inline-block box renders as a gap of unpredictable width.
    * The icon-to-text gap is always the CSS token (`--gap-icon`, `margin-right` on `.brand-icon`), never a source space.
  * **The mermaid label limits.** The diagram pipeline (`Source/Content/Mermaid/Render.mjs`) has hard limits that the `.mmd` sources must respect. 
    * **The wrap budget.** Mermaid word-wraps every label into per-word `tspan` runs, and a label beyond the budget wraps (allowed as a line break). 
      * The label-presence law compares the single-space form, so a label must survive wrapping with its spaces.
    * **The list markers.** A label that opens with syntax-shaped characters is parsed as flowchart syntax; the quoted forms (`["..."]` / `{"..."}`) are the safe carriers.
    * **The`<>` /quote limits.** , and quotes inside labels must be entity-escaped (`&lt;`, `&gt;`, `&quot;`); the renderer decodes the entities for the presence law.
  * **The space law.** With `htmlLabels: false`, Mermaid writes each wrapped word as a `tspan` run joined by a leading space. 
    * SVG whitespace rules collapse that leading space away, which glues the words ("Hook@DSH@Core") and shrinks the measured label boxes.
    * The renderer rewrites the joining spaces to no-break spaces (U+00A0) at render time; the `.mmd` sources stay plain ASCII.
  * **The containment law.** Every label's bounding box must sit fully inside the viewBox. 
    * The pipeline fails a render whose label pokes out rather than shipping a cropped diagram.
  * **The build is the arbiter.** Run `pnpm run prepublishOnly` (astro build, 24 pages) after every change; the dev server (`pnpm run Run`, :9999) serves the same tree.


## Build

```
pnpm install
pnpm run prepublishOnly   # astro build → Target/
pnpm run Run              # astro dev on :9999

```

## Deployment - Cloudflare Pages
The site is fully static (`output: "static"`, `outDir: "./Target"`).
To deploy, point Cloudflare Pages at this repository:
  * **Build command:** `pnpm run prepublishOnly`
  * **Build output directory:** `Target/`
  * **Framework preset:** none - it is a static site.


A Git-connected Pages project works with no extra configuration: the build command and the output directory above are all that Pages needs.
`Public/_headers` ships cache rules for the content-hashed `_astro/` assets, and `Public/404.html` provides the styled not-found page that Cloudflare Pages serves automatically.
Routes are emitted directory-style (`plugins/index.html`), which Pages serves natively.
## About
Site for the DeepSeek 🐳 Harness Plugin family for PlayForm ☁️
[deepseek](https://github.com/topics/deepseek)[deepseek-harness](https://github.com/topics/deepseek-harness)[website](https://github.com/topics/website)
**1** star
**0** watching
[ forks](https://github.com/PlayForm/Site-DeepSeek/forks)
## 
No releases published
## 
  * [**NikolaRHristov** Nikola Hristov](https://github.com/NikolaRHristov)
  *   * 

## Languages
  * [JavaScript89%](https://github.com/PlayForm/Site-DeepSeek/search?l=javascript)
  * [Astro7.8%](https://github.com/PlayForm/Site-DeepSeek/search?l=astro)
  * [Mermaid1.1%](https://github.com/PlayForm/Site-DeepSeek/search?l=mermaid)
  * [CSS1.1%](https://github.com/PlayForm/Site-DeepSeek/search?l=css)
  * [TypeScript1%](https://github.com/PlayForm/Site-DeepSeek/search?l=typescript)
  * [HTML0%](https://github.com/PlayForm/Site-DeepSeek/search?l=html)


You can’t perform that action at this time. 

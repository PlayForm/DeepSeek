[**2** Branches](https://github.com/PlayForm/Site-DeepSeek/branches)[](https://github.com/PlayForm/Site-DeepSeek/tags)
Go to file
Open more actions menu
[feat(read‑only readers): add comprehensive static‑markup readers and …](https://github.com/PlayForm/Site-DeepSeek/commit/8df1fa4f391294e3067fdb7813f92d30371935cf)
Open commit detailsfailure
Oct 29, 2026
[8df1fa4](https://github.com/PlayForm/Site-DeepSeek/commit/8df1fa4f391294e3067fdb7813f92d30371935cf) · Oct 29, 2026
[6,077 Commits](https://github.com/PlayForm/Site-DeepSeek/commits/Current/)
Open commit details
6,077 Commits  
| Name  | Name  | Last commit message  | Last commit date  |  
| --- | --- | --- | --- |  
|   |   | [refactor(ui): overhaul component architecture and add comprehensive r…](https://github.com/PlayForm/Site-DeepSeek/commit/9fadcbdf2e36fcd4a871a7eaaa3997457e5d4fd6 "refactor\(ui\): overhaul component architecture and add comprehensive read‑only readers

Implemented a large‑scale UI redesign that introduces a new “Observatory” shell with status line, five mode tabs \(Guide, Activity, Internals, Configuration, Source\) and corresponding panels. Added a `CaptureManifest` object and `Modes` array to drive the shell, plus CSS and scripts for tab state synchronization.

Introduced a mechanism registry \(`MechanismFor`\) to map package stems to the appropriate read‑only reader components, providing clear empty‑state handling when no reader exists. Created a suite of new read‑only components that document specific behaviours and data structures:
- `EventReader` – generic event summary view with tabbed panes.
- `BatchStateProjection`, `CommentOmissionPreview`, `CostAttributionExplorer`,
  `FeedbackProvenance`, `GitCommandDecision`, `LessonAdmissionPipeline`,
  `PatternScoreInspector`, `BusDeliveryRecord`, `EdgeProvenance`, `FileSymbolPeek`.
- `GraphCapabilityLegend`, `IndexCoverageAndCaps`, `ObservationStampTable`,
  `SequenceVsClock`, `StampRetentionRecord`, `SuppressionDecisionReader`,
  `WorkspaceIndexRun`.

Added new Observatory readers describing connection states, host capability matrix, data‑path boundaries, provider comparison, and transport diagnostics. Refactored status panels, evidence badges, and workspace readers for authorization, budgeting, binding, capability, disposition, handoff, lease, memo freshness, neighbor ranking, packet orientation, proposal lifecycle, effect preview, recovery behavior, recursion chain, admission, resolution checks, tool scope coverage, typed proposal, version basis, lineage, and residency.

Updated JSON/TS definitions, added accessibility improvements \(aria‑labels, `:has\(\)` fallbacks\), and replaced legacy CSS with modern utilities. Updated plugin assets and documentation to reflect the new UI components.

These changes provide a unified, read‑only documentation layer for the system’s internal data, improve developer visibility, and simplify future maintenance.")  | Oct 29, 2026  |  
|   |   | [feat(Node.yml): add testing steps before prepublishOnly in CI workflow](https://github.com/PlayForm/Site-DeepSeek/commit/21b5481a312f75cf330ca23d4f9ccee2db027eb0 "feat\(Node.yml\): add testing steps before prepublishOnly in CI workflow

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
|   |   | [refactor(ui): clean up assets and update inspector UI](https://github.com/PlayForm/Site-DeepSeek/commit/b91e97d2247703e0c504925471b0722d30e201cb "refactor\(ui\): clean up assets and update inspector UI

Implemented a comprehensive cleanup of the UI asset tree and updated the Inspector component for better accessibility and styling. The changes include:

- Removed obsolete icon, font, and branding assets from the Target directory to reduce bundle size.
- Added an `aria-label` to the Inspector's clear pins button for improved screen‑reader support.
- Updated the Inspector markup to use a dedicated CSS class \(`explorer__inspector-body`\) for the body section.
- Adjusted the zoom note styling in `Observatory.css` to right‑align the margin.
- Re‑structured the `case-study` page to use a new `Chapters` data structure, replacing the old hard‑coded index. This introduces a single source of truth for chapter metadata, ensuring consistency between the index, headers, and narrative.
- Updated the `showcase` pages to reference the dynamic `Stories` count instead of a hard‑coded number.
- Minor updates to the `showcase/\[slug\]` page to reflect the new stage‑based narrative format.
- Updated related CSS to support the new inspector layout and chapter styling.

These changes streamline the asset tree, improve accessibility, and provide a more maintainable structure for future content updates.")  | Oct 29, 2026  |  
|   |   | [refactor(ui): overhaul component architecture and UI flow](https://github.com/PlayForm/Site-DeepSeek/commit/a7d9a599533c22835ac9006eef04c4d772dae5bf "refactor\(ui\): overhaul component architecture and UI flow

Implemented a comprehensive redesign of the site’s UI components and page structure:

- Replaced legacy badge, card, and configurator components with new status‑tag, capability‑aware card, and a detailed configurator that handles activation, verification, and export states.
- Added new Graph components \(Explorer, Legend, Inspector, SourceBadge, StageRail, Toolbar\) with full‑screen support, updated layout, and improved visual cues.
- Introduced PageHero, SectionHeader, and new UI primitives \(ArtifactComparison, Breadcrumbs, EvidenceLabel, SectionNav\) with enhanced props, styling, and accessibility.
- Overhauled layout and navigation in `Layout/Base.astro`, updated skip‑link logic, and refreshed global styles.
- Refactored content constants in `Library/Content.ts` and added helper functions in `Library/Graph/Client.mjs` for evidence labeling, URL state, and playback control.
- Updated all pages \(`behavior`, `connect`, `explore`, `index`, `marketplace`, `plugins`, `reference`, `setup`, `tl`\) to use the new components and layout patterns.
- Generated new plugin pages, updated target assets, and reduced page sizes through optimized assets and streamlined markup.

These changes unify the UI logic, improve maintainability, and prepare the codebase for future feature additions.")  | Oct 29, 2026  |  
|   |   | [feat(read‑only readers): add comprehensive static‑markup readers and …](https://github.com/PlayForm/Site-DeepSeek/commit/8df1fa4f391294e3067fdb7813f92d30371935cf "feat\(read‑only readers\): add comprehensive static‑markup readers and selection strip

Implemented a large suite of new static‑markup reader components across the Suggesters and Layout directories. Each reader exposes a consistent data‑contract, renders missing‑state blocks, and contains no runtime JavaScript. The new readers cover a wide range of internal system concepts such as async calls, block assembly, candidate evidence, command normalization, companion existence, completion delivery, configuration layers, and many more.

Added a browser‑side `SelectionStrip` component that tracks the current package, level, and artifact state across routes, updates the URL query, and synchronizes lane chips and table rows. The strip is now integrated into the behavior, explore, plugins, and showcase pages, providing a consistent ladder state across the site.

Other notable changes include:
- New layout frames \(Absence, ArtifactComparison, DecisionExplanation, etc.\) that enforce a single‑column rhythm and consistent spacing.
- Updated `MechanismFor` to include a `Suggesters` map for classic package stems.
- Refactored `PluginPage` and `PluginTimeline` to support a new pipeline‑summary variant.
- Added teaching interaction in `Reference/Workbench` with transform checkboxes and dynamic output.
- Updated pages to use `EvidenceLabel` and improved wording for clarity.
- Added new CSS for artifact sections and updated UI labels for interactive comparison.

These additions provide a unified, read‑only documentation layer, improve developer visibility into system internals, and enable consistent selection state across the site.")  | Oct 29, 2026  |  
| [Tests/Observatory](https://github.com/PlayForm/Site-DeepSeek/tree/Current/Tests/Observatory "This path skips through empty directories")  | [Tests/Observatory](https://github.com/PlayForm/Site-DeepSeek/tree/Current/Tests/Observatory "This path skips through empty directories")  | [refactor(icons): regenerate and resize SVG assets for all Color icons](https://github.com/PlayForm/Site-DeepSeek/commit/1835924909b52bbb7d96e2b1e3f42bb07dc41a21 "refactor\(icons\): regenerate and resize SVG assets for all Color icons

Replaced the entire set of Color SVG icons in both `Public/Icons/Color` and `Target/Icons/Color`. Each icon was regenerated with a larger viewBox and improved path data, resulting in 50–100 % size increases for most files. The new icons are now embedded directly in component markup, eliminating runtime fetches and simplifying the `PluginIcon.astro` component.

Key changes:
- Updated all icon components to inline SVG markup with motion blocks for reduced‑motion users.
- Simplified `BehaviourLane.astro`, `BehaviourMap.astro`, `Card.astro`, and `Configurator.astro` with cleaner logic and removed duplicated branches.
- Rewrote `Graph/Toolbar.astro` to use a concise `select` for detail level and added missing option labels.
- Refactored `PluginTimeline.astro` rendering logic and added explanatory comments.
- Reformatted page layouts \(`behavior.astro`, `explore.astro`, `index.astro`, `showcase/\[slug\].astro`\) for readability and removed redundant checks.
- Cleaned up `Global.css` selectors and collapsed redundant rules.
- Simplified `Graph/Client.mjs` and `Graph/Lane.mjs` helper functions for clearer projection and stem handling.

All generated HTML pages were regenerated to include the updated assets and scripts, causing moderate increases in page sizes across the site. This refactor improves icon quality, reduces runtime overhead, and streamlines component logic.")  | Oct 29, 2026  |  
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
|   |   | [refactor(components, pages): improve formatting and whitespace across…](https://github.com/PlayForm/Site-DeepSeek/commit/3f4294dbf9fd711767d846563c628236e65265c8 "refactor\(components, pages\): improve formatting and whitespace across the site

This commit cleans up a large number of component and page files to enhance readability and consistency.
Key changes include:
- Reformatting JSX/HTML blocks to use explicit line breaks for attributes and nested elements.
- Adjusting string interpolation and template literals for clearer intent.
- Adding missing line breaks and indentation in Astro component scripts and markup.
- Normalizing table and list formatting in README and page files.
- Updating comments and documentation strings for better clarity.
- Minor spacing adjustments in the client library to improve code legibility.

These changes do not alter functionality but make the codebase easier to maintain and review.")  | Oct 28, 2026  |  
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
|   |   | [refactor(components, pages): improve formatting and whitespace across…](https://github.com/PlayForm/Site-DeepSeek/commit/3f4294dbf9fd711767d846563c628236e65265c8 "refactor\(components, pages\): improve formatting and whitespace across the site

This commit cleans up a large number of component and page files to enhance readability and consistency.
Key changes include:
- Reformatting JSX/HTML blocks to use explicit line breaks for attributes and nested elements.
- Adjusting string interpolation and template literals for clearer intent.
- Adding missing line breaks and indentation in Astro component scripts and markup.
- Normalizing table and list formatting in README and page files.
- Updating comments and documentation strings for better clarity.
- Minor spacing adjustments in the client library to improve code legibility.

These changes do not alter functionality but make the codebase easier to maintain and review.")  | Oct 28, 2026  |  
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
# The site
The site for the **DeepSeek Harness Plugin Family for[PlayForm](https://PlayForm.Cloud)** (@playform/dsh-family-site), a static Astro build in the "Technical Minimalist Harness" design.
The site now carries an observatory: one graph application with a free/world projection and a timeline/progression projection over the same node identities. The free projection lays out the package catalogue and the story worlds; the timeline projection reads the same nodes and orders them along the temporal edges. The site runs on one honesty rule: no page claims a runtime observation that the data does not carry. Every node and package carries an evidence label, the story records are labeled authored, and the catalogue is labeled a source inventory rather than a runtime composition.
## Routes  
| Route  | What it serves  | Indexable  |  
| --- | --- | --- |  
| The landing page, with the compact observatory mount  | Yes  |  
| `/showcase/`  | The sixteen story records with their claims, checkpoints and limits  | Yes  |  
| `/showcase/[slug]/`  | One story page, with an authored two-world trace beside the narrative for the two stories that ship one  | Yes  |  
| `/explore/`  | The full-viewport observatory: the graph explorer over the catalogue and the story worlds  | Yes  |  
| `/tl/`  | The timeline projection: the progression view over the same node identities  | Yes  |  
| `/plugins/`  | The registry: one detail page per package in the committed catalogue snapshot  | Yes  |  
| `/plugins/[name]/`  | One detail page per package, built from the package's manifest and documentation  | Yes  |  
| `/reference/`  | The five reference surfaces plus the graph vocabulary: nodes, edges and lenses  | Yes  |  
| `/setup/`  | The profile setup walkthrough  | Yes  |  
| `/case-study/`  | The PlayForm case study  | Yes  |  
| `/marketplace/`  | The marketplace page  | Yes  |  
| `/connect/`  | The connector terms: what works now, what is planned, and the trust boundary  | Yes  |  
## The data model
The catalogue snapshot, `Source/Content/Graph/Catalogue.snapshot.json`, is a source inventory: every package directory in the DeepSeek Harness checkout, read from its `package.json` manifest at export time. The committed snapshot was generated at 2026-10-28T20:21:52.040Z from source revision 38a76c3d444a52dd3613ea8042deae5e54d244ca, and its census is 107 packages: 59 Classic and 48 Effect-TS. Each package record carries its id, directory name, tree, version, role and dependency names. The snapshot is a source inventory and not a runtime composition: it records what the checkout contains, not what any session loaded or observed.
The authored traces are the two-world interchange format: a trace record holds one or two worlds, and each world is a graph of nodes and edges with an evidence label per node (`catalogue`, `documented`, `observed`, `derived`, `illustrative` or `unavailable`). Traces validate at build time through `Source/Library/Graph/Traces.mjs`, so a malformed trace fails the build instead of failing in the browser. The showcase traces label their live nodes illustrative rather than observed: they illustrate the flow the packages document.
The story records, `Source/Library/Graph/Stories.mjs`, are sixteen authored walkthroughs of the harness. Each record names its groups, its packages (the stems the committed snapshot names), its checkpoints and its limits sentence, which states what the story does not prove. Two stories ship a committed two-world trace file; the other fourteen ship the narrative alone. No record claims that a stage was observed in a captured session.
## The graph stack
Cytoscape.js renders the graph. The free/world projection positions the nodes with fCoSE; the timeline projection positions them with ELK Layered, loaded through the elkjs worker bridge (`Source/Library/Graph/Timeline.browser.mjs`). The layout controller (`Source/Library/Graph/TimelineController.mjs`) fences stale results: each layout carries a generation ticket, and a result from an older generation is discarded. Navigation cancels a pending layout and terminates the worker. One limit stands: ELK positions nodes and does not supply a time axis; the progression reading comes from the temporal edges, not from a coordinate that means time.
## Scripts  
| Script  | Command  | What it does  |  
| --- | --- | --- |  
| `Run`  | `astro dev --host`  | The dev server on :9999. Not the arbiter.  |  
| `Diagrams`  | `node Source/Content/Mermaid/Render.mjs`  | Renders the `.mmd` diagram sources to SVG.  |  
| `Drift`  | `node Scripts/Drift-Guard.mjs`  | Re-derives every dynamic figure the site renders from the primary sources and compares; includes the built-page-count check against `Target/`.  |  
| `Test`  | `node Source/Library/Iso.test.mjs`  | Runs the library's own test file.  |  
| `Graph:Export`  | `node Scripts/Export-Graph-Catalogue.mjs`  | Re-scans the Harness checkout (`--source` or `DSH_SOURCE_ROOT`) and rewrites the committed catalogue snapshot.  |  
| `Graph:Test`  | `node --test Tests/Observatory/*.test.mjs`  | Runs the observatory tests: the model, the catalogue scanner and the timeline controller.  |  
| `prepublishOnly`  | `node Scripts/Sync-Changelog.mjs && astro build`  | The build: syncs the changelog, then builds the static site into `Target/`.  |  
## Building and verifying

```
pnpm install
pnpm run prepublishOnly   # the build, into Target/
pnpm run Graph:Test       # the model, the scanner, the controller
pnpm run Drift            # the rendered site vs the repository

```

`astro dev` is not the arbiter. The built output in `Target/` is: the Drift guard counts the built HTML pages against the static route sources plus the 404, and it checks the freshness of the compiled bundles against their Source modules. The site is a static Cloudflare Pages build: build command `pnpm run prepublishOnly`, output directory `Target/`, no framework preset. The package is private; its license is `SEE LICENSE IN LICENSE`.
## Design laws
  * Blue and white only.
  * Hairlines for every surface boundary: 1px, no shadows, no gradients, zero elevation.
  * Inter for prose, IBM Plex Mono for labels.
  * The 13px type floor.
  * Reduced-motion guards on the animated surfaces.
  * One `h1` per page.


## Adding a package
  1. Add the package directory and its `package.json` manifest to the `Classic/packages/` or `EffectTS/packages/` tree in the Harness checkout.
  2. Run `pnpm run Graph:Export` to re-export the catalogue snapshot.
  3. Place the package in a group in `Source/Library/Graph/Groups.mjs` by adding its stem to a group's stems. A package the roster does not name renders as Unclassified rather than disappearing.


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
  * [Astro81.4%](https://github.com/PlayForm/Site-DeepSeek/search?l=astro)
  * [JavaScript6.7%](https://github.com/PlayForm/Site-DeepSeek/search?l=javascript)
  * [CSS4.7%](https://github.com/PlayForm/Site-DeepSeek/search?l=css)
  * [TypeScript3.6%](https://github.com/PlayForm/Site-DeepSeek/search?l=typescript)
  * [Mermaid3.5%](https://github.com/PlayForm/Site-DeepSeek/search?l=mermaid)
  * [Shell0.1%](https://github.com/PlayForm/Site-DeepSeek/search?l=shell)


You can’t perform that action at this time. 

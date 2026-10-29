[**4** Branches](https://github.com/PlayForm/DeepSeek/branches)[](https://github.com/PlayForm/DeepSeek/tags)
Go to file
Open more actions menu
[refactor: add missing .js.map files for EffectTS test targets](https://github.com/PlayForm/DeepSeek/commit/a3b9499a707169bbf7bca1104b63540bfb4839cc)
Open commit detailsfailure
Oct 29, 2026
[a3b9499](https://github.com/PlayForm/DeepSeek/commit/a3b9499a707169bbf7bca1104b63540bfb4839cc) · Oct 29, 2026
[467 Commits](https://github.com/PlayForm/DeepSeek/commits/Current/)
Open commit details
467 Commits  
| Name  | Name  | Last commit message  | Last commit date  |  
| --- | --- | --- | --- |  
|   |   | Oct 29, 2026  |  
|   |   | [chore: update GitHub Actions workflow and VSCode settings](https://github.com/PlayForm/DeepSeek/commit/40549bf5fce514c5805d95d99ce7adae6b9ba676 "chore: update GitHub Actions workflow and VSCode settings

- Refactor Rust.yml for improved readability and maintainability.
- Add .prettierignore to exclude specific file types and directories from formatting.
- Create .vscode/extensions.json to recommend Prettier and custom format extensions.
- Enhance .vscode/settings.json with additional formatting options and exclusions.
- Introduce .vscode/tasks.json for formatting tasks using pnpm.

Signed-off-by: Nikola Hristov <Nikola@PlayForm.Cloud>")  | Oct 28, 2026  |  
|   |   | [refactor(test-config): migrate smoke runner and add dynamic package v…](https://github.com/PlayForm/DeepSeek/commit/5f6de87a53dd29d495ff259c37804249d56e1ac1 "refactor\(test-config\): migrate smoke runner and add dynamic package version

Implemented a comprehensive migration from the legacy `Maintain/Run-Smokes.mjs` to the new aggregate smoke runner `Maintain/Run/Smokes/Index.mjs` across all Classic and EffectTS hook packages. Every `Run.sh`, test harness, and source file now references the updated entry point, ensuring the test execution pipeline uses the correct runner and preventing dev twins from shipping stale test output.

Added a consistent build‑time constant `process.env.VERSION_PACKAGE` to all Test‑ESBuild configuration files \(both JavaScript and TypeScript variants\). The constant is populated from the local `package.json` at configuration load time, replacing hard‑coded version strings in activation logs, bundle version comments, and documentation. This guarantees that test targets compile with the accurate package version and aligns the build, test, and release artifacts.

Updated marketplace metadata timestamps and commit hashes to reflect the new release commit, and adjusted documentation badges, package tables, and release notes to match the current 0.2.1 release and the new smoke‑runner structure.")  | Oct 29, 2026  |  
|   |   | [feat: set private field to false in package.json for multiple plugins…](https://github.com/PlayForm/DeepSeek/commit/e79f5e95a43ef603f2dea680dd959507910ee9c8 "feat: set private field to false in package.json for multiple plugins and libraries

- Updated package.json files across various plugins and libraries in the EffectTS project to set "private": false.
- This change allows the packages to be published to the npm registry, enabling broader distribution and usage.

Signed-off-by: Nikola Hristov <Nikola@PlayForm.Cloud>")  | Oct 28, 2026  |  
|   |   | [refactor(test-config): add package‑version define to Test‑ESBuild con…](https://github.com/PlayForm/DeepSeek/commit/ec660f54d03cfff55cf2bd106a30a3c269848f28 "refactor\(test-config\): add package‑version define to Test‑ESBuild configs and migrate smoke runner to new path

Implemented a consistent build‑time constant for the package version across all Test‑ESBuild configuration files \(both JavaScript and TypeScript variants\) for the batch‑decision, graph‑suggester, lesson‑nudge, replay‑suggester, test‑suggester, and related packages. The new `process.env.VERSION_PACKAGE` define is populated from the local `package.json` at configuration load time, ensuring that test targets compile with the accurate version string.

Updated every `Run.sh` script in the Classic and EffectTS trees to reference the new aggregate smoke runner `Maintain/Run/Smokes/Index.mjs` instead of the legacy `Maintain/Run-Smokes.mjs`. This change aligns the test execution pipeline with the current smoke‑runner structure and prevents dev twins from shipping test output.

All affected documentation and build scripts were updated to reflect the new paths and version handling, bringing the codebase, configuration, and documentation into sync with the 0.2.1 release.")  | Oct 29, 2026  |  
|   |   | [refactor: add missing .js.map files for EffectTS test targets](https://github.com/PlayForm/DeepSeek/commit/a3b9499a707169bbf7bca1104b63540bfb4839cc "refactor: add missing .js.map files for EffectTS test targets

Added the compiled source map files for all test modules in the EffectTS packages. These files were previously omitted, causing incomplete source mapping for test execution and debugging. The new `.js.map` files provide accurate mapping between the generated JavaScript and the original TypeScript sources, improving traceability and developer experience during test runs.")  | Oct 29, 2026  |  
|   |   | [docs: Update icon grammar and hash values for icon assets](https://github.com/PlayForm/DeepSeek/commit/f6a755ebb862456f8ef764fbb20617a6d72982c1 "docs: Update icon grammar and hash values for icon assets

Updated the ICON-GRAMMAR documentation to reflect new motion semantics for injected services and changelog rings, switching from “orbit” to “breathe” and adding explanatory notes about ring breathing. Updated the motion mapping in Motion.mjs to match the new grammar. Adjusted the hash values in Ledger.json to match the rebuilt icon assets. These changes keep the documentation and asset hashes in sync with the latest icon rendering pipeline.")  | Oct 29, 2026  |  
|   |   | [docs: update documentation archive and formatting](https://github.com/PlayForm/DeepSeek/commit/2fb4555c2f8ea96de77c07ea8c3a29f069d2793a "docs: update documentation archive and formatting

Implemented comprehensive updates to the DeepSeek documentation archive, including:

- Reformatted Markdown and HTML files for improved readability and consistency.
- Added missing newline terminators to numerous archived HTML files to satisfy POSIX standards.
- Updated the Flywheel graph model page with new sections, TOC, SEO meta tags, and navigation entries.
- Replaced inline filter script in index.html with a cleaned‑up, modular implementation.
- Enhanced terminal preview documentation with a new “Over SSH” section and improved command examples.
- Re‑formatted and corrected line breaks, tables, and bullet lists across curated Observatory markdown files.
- Minor whitespace cleanup in Reference/README.md.

These changes ensure a cleaner, more maintainable documentation set and improve user experience across the site.")  | Oct 28, 2026  |  
| [refactor(icon): improve SVG rendering and twin selection logic](https://github.com/PlayForm/DeepSeek/commit/85ea0af93de65a636e50b88301011b900c00f01a "refactor\(icon\): improve SVG rendering and twin selection logic

Implemented a comprehensive refactor of the icon rendering pipeline and twin generation logic:

- Added `Motion.mjs` to encapsulate motion vocabulary, clock calculation, and style generation for SVGs.
- Updated `RenderScene.mjs` to use motion data, generate scoped style blocks, and support staggered fire animations.
- Simplified and clarified the `documentOf` function, separating group creation and rendering logic.
- Enhanced twin generation in `Index.mjs` with `--only` support, validating provided names against the MANIFEST.
- Updated `Twins.mjs` to exclude the base package and to be tier‑agnostic.
- Adjusted related imports and constants, removed obsolete code, and ensured consistent naming conventions.
- Updated documentation files to reflect new motion descriptions and rendering behavior.

All tests pass and the icon SVGs now include motion classes and reduced‑motion guards.")  | Oct 29, 2026  |  
|   |   |   | Oct 28, 2026  |  
|   |   | [chore(dsh): Scrub remaining personal and machine-specific references](https://github.com/PlayForm/DeepSeek/commit/7ecb5a9e693918483f2ea2aa51fdb34e3c41073c "chore\(dsh\): Scrub remaining personal and machine-specific references

Continues the prior relicensing/portability pass by removing the last internal-environment references from the monorepo's root config files and a package fixture.

- .editorconfig: drop the "Land + Aphrodite" attribution from the tab-standard comment, leaving the plain rationale.
- .npmrc: remove the "\(adapted from CodeEditorLand/Land .npmrc\)" provenance note, keeping the pnpm settings self-contained.
- Classic/packages/hook-dsh-core/README.md: replace the machine-specific example path \(/Volumes/...\) in the refusal-guard comment with a neutral placeholder \(/x/package.json\) so the docs stay host-independent.
- Test/fixtures/manifest/governed-test/update-policy.json: shorten the provenance comment from the absolute ~/Developer/Maintain/Fn/Update/NPM.sh path to the portable Maintain/Fn/Update/NPM.sh.

These edits keep all tracked configuration and documentation free of developer-host artifacts, consistent with the public-facing scrub from the CC0-1.0 relicensing commit.")  | Oct 7, 2026  |  
|   |   | [feat: enhance icon rendering with angle-based component shifting and …](https://github.com/PlayForm/DeepSeek/commit/91a4a6c54a639df6e8c587244e1ff4c1f75cf2b1 "feat: enhance icon rendering with angle-based component shifting and add firelit palette direction documentation

- Implemented angle-based shifting of component centerlines in RenderScene.mjs to improve visual representation based on the Plan.view angle.
- Updated the SVG rendering logic to conditionally apply stroke properties based on the Mono flag.
- Added a new documentation file PALETTE-DIRECTION.md outlining the color palette logic inspired by the fire-lit cavern image, including a proposed second palette family for icons.

Signed-off-by: Nikola Hristov <Nikola@PlayForm.Cloud>")  | Oct 25, 2026  |  
|   |   | [refactor(naming): Apply the role-prefix contract to the family packages](https://github.com/PlayForm/DeepSeek/commit/06ccbe7d4f62d5fd59a26563821c2f6fc1bc6a84 "refactor\(naming\): Apply the role-prefix contract to the family packages

The family's package names carried a blanket `hook-` prefix that was wrong for the service, library and client roles: the core is a dependency-free library with no loader contract, and the file normalizer is a tool plugin, yet both read as event hooks. This commit applies the four-role naming contract \(plugin / hook / client / lib\) to the existing family and to the planned UI packages.

The core is renamed to `lib-dsh-core` \(`ets-lib-dsh-core` in the Effect-TS tree\) and the file-content normalizer to `plugin-dsh-normalize-file` \(`ets-plugin-dsh-normalize-file`\), in both release trees. The directories, package manifests, npm names, dependency edges of the thirteen consumers, the dual-source build scripts, the cordis bundle patches and the generated Target output follow the rename. The @-sentence identities read `Lib @ DSH @ Core` and `Plugin @ DSH @ Normalize @ File`.

The ledger-string identity moves with the package: the durable ledger paths \(`~/.dsh/plugin-dsh-normalize-file.log`\), the module prefixes, the activation lines, the overpass count lines and the test-probe attachments \(`__pluginDshNormalizeFileState`\) carry the new name byte-identically across the READMEs, the smoke suites and the live-wiring scripts, so the smoke counts remain the arbiter. The planned panel packages are renamed to `client-dsh-panel-family` and `client-dsh-panel-family-host`, and the pattern service's archetype is settled as `plugin-dsh-pattern`.

The release tooling is updated to match: the NPM workflow publishes the renamed L1 foundations and L2 consumers in the same topological order, the placeholder generator emits the new planned names, the overpass drift baseline is regenerated for the renamed paths, and the ETS live-containers generator substitutes the new core import.

The documentation carries the applied names throughout - the root README, the tree READMEs, the framework and branding docs, the plans, the research reports, the archive notes and the two documentation skills - with the original names left to git history. The role-prefix contract itself is recorded in `Documentation/Plans/Workspace-Family/NAMING-BY-ROLE.md` and the CHANGELOG's Unreleased section.")  | Oct 21, 2026  |  
|   |   | [refactor(maintain): overhaul build, check and documentation scripts a…](https://github.com/PlayForm/DeepSeek/commit/b528dc0879a2bd5e6c02f0a68c56dc0ff41d67b4 "refactor\(maintain\): overhaul build, check and documentation scripts and update import aliases

Implemented a comprehensive migration of the monorepo’s maintenance tooling to the new
`Maintain/Build/Client-Bundle/Index.mjs`, `Maintain/Check/Lychee/Index.sh`,
`Maintain/Check/Newlines/Index.mjs`, and `Maintain/Format/Index.sh` scripts.
The
refactor\(maintain\): overhaul build, check and documentation scripts and update import aliases

Implemented a comprehensive migration of the monorepo’s maintenance tooling to the new
`Maintain/Build/Client-Bundle/Index.mjs`, `Maintain/Check/Lychee/Index.sh`,
`Maintain/Check/Newlines/Index.mjs`, and `Maintain/Format/Index.sh` scripts.
All workflow references in `package.json` and internal scripts have been updated
to point to the new locations, and the implementation now uses
ESBuild‑based client bundle generation, a Bash‑based lychee runner, a
Node‑based newline gate, and a unified formatting wrapper that handles
line‑endings, Prettier, and the new newline check.

Key changes:
- Added `Maintain/Build/Client-Bundle/Index.mjs` to replace the old
  `Maintain/Build-Client-Bundle.mjs`.  It bundles a package’s client entry
  into a CommonJS bundle wrapped in a `window.__ModuleLoader__` contract
  and writes `Target/Client.bundle.js`.
- Replaced `Maintain/Run-Smokes.mjs` with `Maintain/Run/Smokes/Index.mjs` and
  updated all references to the new path, including the GitHub Actions
  workflow.
- Introduced `Maintain/Check/Lychee/Index.sh` to replace the old
  `Maintain/Lychee.sh`.  It now runs two passes \(repo sources and built
  site\) and composes a detailed `lychee-report.md`.
- Created `Maintain/Check/Newlines/Index.mjs` \(with helper modules\) to
  enforce EOF‑newline, trailing‑whitespace, CRLF, and empty‑line rules
  across all tracked text files, with a `--fix` flag.
- Consolidated formatting into `Maintain/Format/Index.sh`, adding sub‑commands
  for line‑endings, Prettier, and newlines, and updated the
  `.prettierignore` and `prettier.config.mjs` references.
- Updated all `Run` scripts that invoke the old build/maintenance scripts,
  including the `pnpm` scripts in `package.json`, to use the new paths.
- Adjusted import aliases in all generated client bundles and updated the
  `Run` scripts to reference `Maintain/Build/Client-Bundle/Index.mjs`.
- Minor documentation updates to reflect the new script locations and
  command usage.

These changes modernize the maintenance workflow, improve clarity,
and eliminate legacy script paths while preserving behavior.")  | Oct 25, 2026  |  
|   |   | [chore(dsh): Add per-package repo scaffolding and the lychee link checker](https://github.com/PlayForm/DeepSeek/commit/c8a104766d31f1cb8d112836b57794661a818486 "chore\(dsh\): Add per-package repo scaffolding and the lychee link checker

Prepare every release package for its extraction into its own repository \(the submodule plan, #16\) and stand up the monorepo's lychee link-verification infrastructure.

Why: the family's twelve packages across the two implementations \(Classic and EffectTS\) are each meant to become a standalone repository added back as a git submodule at its package directory. Each standalone repo needs the standard five-file surface - a .gitignore, LICENSE, CODE_OF_CONDUCT, CONTRIBUTING, and CHANGELOG - that the monorepo never carried per-package before. Without this scaffolding the extraction would land each package without its governance, license, and contribution docs. Separately, the docs pass \(the link-heavy READMEs and Documentation tree\) left no automated check that every URL resolves, so dead links could slip in silently.

What changed:
- Add the five standard repo files to all 24 release packages \(the 12 packages in each of Classic/packages and EffectTS/packages\): a per-package .gitignore that already anticipates the extraction \(node_modules/, Target/, dist/, *.tsbuildinfo, *.log, pnpm-lock.yaml, .DS_Store\), a CC0-1.0 LICENSE, the Contributor Covenant 2.1 CODE_OF_CONDUCT, a CONTRIBUTING guide \(CC0 dedication, build-from-Source, prepublishOnly to Target, pnpm restore, family smoke suites as the arbiter, tabs + no personal paths as style\), and a 0.0.1 CHANGELOG entry naming the package.
- Add .gitmodules.draft, a non-active proposal \(git does not read it\) listing every planned submodule - the Classic/EffectTS pairs, with <package>-effectts names as a placeholder until the naming refinement \(#15\) - and the activation steps per entry.
- Introduce lychee link verification: .lychee.toml \(two-pass config for the repo sources; extensions .md/.ts/.tsx/.js/.json, exclusions for node_modules/Target/dist/.git/.astro/Test fixtures/lockfiles, GitHub #readme/#L<n> anchors excluded as client-side-hydrated, accepted statuses including 429, anchor-only fragment verification\), .lycheeignore \(shields.io badges, social/donation endpoints, placeholder domains\), Maintain/Lychee.sh \(runs pass 1 on the sources plus pass 2 on the built Site/Target and Site/docs, composes lychee-report.md, exits non-zero to gate CI\), the lychee script in package.json, and the generated lychee-report.md recording the run's summaries.
- Refresh the source comments that still described the pre-v0.1.1 16-method factory surface to the current 19-method surface \(hook-dsh-core Source/Library.ts and hook-dsh-governor-package Source/Interface/Factory.ts, in both Classic and EffectTS\).
- Update README.md.

No runtime behavior changes: the .gitmodules.draft is inert by design \(activation happens only once the per-package repositories exist\), and the only source edits are comment-only. This is release-prep infrastructure plus link verification.")  | Oct 8, 2026  |  
|   |   | [chore(dsh): Scrub remaining personal and machine-specific references](https://github.com/PlayForm/DeepSeek/commit/7ecb5a9e693918483f2ea2aa51fdb34e3c41073c "chore\(dsh\): Scrub remaining personal and machine-specific references

Continues the prior relicensing/portability pass by removing the last internal-environment references from the monorepo's root config files and a package fixture.

- .editorconfig: drop the "Land + Aphrodite" attribution from the tab-standard comment, leaving the plain rationale.
- .npmrc: remove the "\(adapted from CodeEditorLand/Land .npmrc\)" provenance note, keeping the pnpm settings self-contained.
- Classic/packages/hook-dsh-core/README.md: replace the machine-specific example path \(/Volumes/...\) in the refusal-guard comment with a neutral placeholder \(/x/package.json\) so the docs stay host-independent.
- Test/fixtures/manifest/governed-test/update-policy.json: shorten the provenance comment from the absolute ~/Developer/Maintain/Fn/Update/NPM.sh path to the portable Maintain/Fn/Update/NPM.sh.

These edits keep all tracked configuration and documentation free of developer-host artifacts, consistent with the public-facing scrub from the CC0-1.0 relicensing commit.")  | Oct 7, 2026  |  
|   |   | [chore: update GitHub Actions workflow and VSCode settings](https://github.com/PlayForm/DeepSeek/commit/40549bf5fce514c5805d95d99ce7adae6b9ba676 "chore: update GitHub Actions workflow and VSCode settings

- Refactor Rust.yml for improved readability and maintainability.
- Add .prettierignore to exclude specific file types and directories from formatting.
- Create .vscode/extensions.json to recommend Prettier and custom format extensions.
- Enhance .vscode/settings.json with additional formatting options and exclusions.
- Introduce .vscode/tasks.json for formatting tasks using pnpm.

Signed-off-by: Nikola Hristov <Nikola@PlayForm.Cloud>")  | Oct 28, 2026  |  
|   |   | [docs: update documentation and test config for smoke runner migration](https://github.com/PlayForm/DeepSeek/commit/24bcd35248e3984b422c0f568169ee79e3c302d9 "docs: update documentation and test config for smoke runner migration

Updated the release badge to 0.2.1 and adjusted the smokes badge to reflect the current suite count.
Replaced all references to the legacy `Maintain/Run-Smokes.mjs` runner with the new `Maintain/Run/Smokes/Index.mjs` across the entire documentation tree, including plan, spec, archive, and README files.
Added version constants to the `Test-ESBuild` configurations so the test targets compile with the package version.
Modified the smoke runner invocation in the `Classic/packages/hook-dsh-search-suggester` test configuration to include the new `process.env.VERSION_PACKAGE` define.
Updated the `Maintain/Generate/Placeholders/Index.mjs` reference in the formatting section of the tomorrow‑review documentation.
These changes bring the docs and test configuration in sync with the new smoke runner structure and release version.")  | Oct 29, 2026  |  
|   |   | [refactor(monorepo): bump to v0.3.0 and unify import paths](https://github.com/PlayForm/DeepSeek/commit/0907da1039641da88c5345c57bfcd4e3184ef905 "refactor\(monorepo\): bump to v0.3.0 and unify import paths

Implemented a comprehensive 0.3.0 release across the entire monorepo.
Key changes include:

* Updated package versions to 0.3.0 and aligned all internal dependencies \(`@playform/lib-dsh-core`, `@playform/plugin-dsh-factory`, etc.\) to the new release.
* Replaced legacy import aliases with the new `@Interface` and relative paths throughout EffectTS, Classic, and plugin packages, ensuring consistent module resolution.
* Bumped `zod` to 4.6.7 and added necessary type casts for `domainTable` schemas to avoid TS2589 errors.
* Updated all `Version` constants and activation ledger strings from `0.2.0` to `0.3.0` in source, test, and documentation files.
* Adjusted README, SCHEME, and CHANGELOG files to reflect the new version and dependency changes.
* Expanded documentation: added cost‑tracking guide, inference‑cost attribution research, and updated reference index counts.
* Minor refactor of plugin source files \(e.g., renamed default export in `Open.js`, fixed import paths in `.d.ts` files\).
* Updated dev‑dependencies to `0.2.1‑rc.4` for all `@deepseek-ai/dsh-*` packages.
* Cleaned up reference archive and status JSON, removing obsolete entries.

This commit brings the codebase, documentation, and tooling into a unified 0.3.0 state, improving consistency, type safety, and future maintainability.")  | Oct 27, 2026  |  
|   |   | [refactor(monorepo): bump to v0.3.0 and unify import paths](https://github.com/PlayForm/DeepSeek/commit/0907da1039641da88c5345c57bfcd4e3184ef905 "refactor\(monorepo\): bump to v0.3.0 and unify import paths

Implemented a comprehensive 0.3.0 release across the entire monorepo.
Key changes include:

* Updated package versions to 0.3.0 and aligned all internal dependencies \(`@playform/lib-dsh-core`, `@playform/plugin-dsh-factory`, etc.\) to the new release.
* Replaced legacy import aliases with the new `@Interface` and relative paths throughout EffectTS, Classic, and plugin packages, ensuring consistent module resolution.
* Bumped `zod` to 4.6.7 and added necessary type casts for `domainTable` schemas to avoid TS2589 errors.
* Updated all `Version` constants and activation ledger strings from `0.2.0` to `0.3.0` in source, test, and documentation files.
* Adjusted README, SCHEME, and CHANGELOG files to reflect the new version and dependency changes.
* Expanded documentation: added cost‑tracking guide, inference‑cost attribution research, and updated reference index counts.
* Minor refactor of plugin source files \(e.g., renamed default export in `Open.js`, fixed import paths in `.d.ts` files\).
* Updated dev‑dependencies to `0.2.1‑rc.4` for all `@deepseek-ai/dsh-*` packages.
* Cleaned up reference archive and status JSON, removing obsolete entries.

This commit brings the codebase, documentation, and tooling into a unified 0.3.0 state, improving consistency, type safety, and future maintainability.")  | Oct 27, 2026  |  
|   |   | [style: Normalize line endings, wrap LICENSE text, and rewire the Effe…](https://github.com/PlayForm/DeepSeek/commit/6785e1e851672840db188e7677b362e698e573b2 "style: Normalize line endings, wrap LICENSE text, and rewire the EffectTS declaration imports

The tree carried a large volume of files whose last line had no terminating newline, and the twelve LICENSE copies were hard-wrapped at a narrow column that did not match the project's formatting. Both are corrected in place: every affected Markdown, JSON, Rust fixture and changelog gains its final newline, and the CC0 text is reflowed to the wider column used elsewhere in the tree. No prose, no legal wording and no fixture bytes change - only the wrapping and the trailing newline, so the normalization fixtures keep testing exactly what they tested before.

The generated declarations in `ets-base-dsh` and the six ETS hook packages are re-aligned with the overpass extraction. In `ets-base-dsh` the sibling-relative `../Interface/State.js` and `./Journal.js` references resolve through the `@Interface` alias, and the same rule applies to `Interface/Transform.d.ts` for its `Output` sibling. The normalize flavors move in both directions: dash, file, quotes and spaces now point at their own tree with relative paths, while ellipsis and fullwidth move onto the alias, matching where their files actually sit after the scaffolding moved into the base. `ets-hook-dsh-cargo-governor` moves its whole `Interface/` set onto relative paths \(including the `../../` and `../../../` hops from `Function/Transform/` and `Function/Update/Upgrade/`\), `Jobs.d.ts` and `Passage.d.ts` use `./`, and `ets-hook-dsh-tool-coach` moves its `Execution` and `Config` references onto the alias. The relative `../Function/Write.js` import in `ets-base-dsh/Target/Service/Write.d.ts` is deliberately left alone, since it crosses from `Service/` into `Function/` and the alias does not cover that hop. Declarations only - no runtime code, no exported `name`, no ledger string and no config key changes.")  | Oct 20, 2026  |  
|   |   | [refactor: add package version define to Test‑ESBuild configs and upda…](https://github.com/PlayForm/DeepSeek/commit/c69abeac32af8ff6b24dbf637bc9674dcb22531f "refactor: add package version define to Test‑ESBuild configs and update documentation

Implemented a consistent build‑time constant for the package version across all Test‑ESBuild configuration files \(both JavaScript and TypeScript variants\) for the convention, doc, and edit suggester hooks. The new `process.env.VERSION_PACKAGE` define is populated from the local `package.json` at configuration load time, ensuring that test targets compile with the correct version string.

Updated the plugin family documentation to reflect the new total of 119 packages \(59 Classic + 60 Effect‑TS\) and the corresponding smoke‑suite counts \(595 suites / 7,288 checks\). Adjusted the README badges, package tables, and release notes to match the updated counts and the new 0.2.1 release. The marketplace.json entries for all affected packages were bumped to version 0.2.1, and new entries were added for the newly introduced plugins and hooks.

These changes bring the configuration, documentation, and package metadata into sync with the current release, improving consistency and preventing mismatches between build artifacts and published versions.")  | Oct 29, 2026  |  
|   |   | [refactor(test-config): update smoke runner references to Maintain/Run…](https://github.com/PlayForm/DeepSeek/commit/1971e00b2ae7f3d5c70ac99a5d62ec20b3fa5064 "refactor\(test-config\): update smoke runner references to Maintain/Run/Smokes/Index.mjs

All test harnesses and source files across the EffectTS hook packages have been updated to reference the new aggregate smoke runner path `Maintain/Run/Smokes/Index.mjs` instead of the legacy `Maintain/Run-Smokes.mjs`. This change ensures that the test execution pipeline uses the current runner, preventing stale test output from being shipped and keeping the build, test, and release artifacts in sync.

Key modifications include:
- Replacing every occurrence of `Maintain/Run-Smokes.mjs` with `Maintain/Run/Smokes/Index.mjs` in test files, documentation comments, and README snippets.
- Updating the `marketplace.json` metadata to point to the new commit hash and publish timestamp for the 0.2.1 release.
- Adjusting all test `.ts` and `.js.map` files to reflect the updated path and maintain accurate build references.

This commit consolidates the smoke runner migration, aligning the codebase with the latest architecture and ensuring consistent test behavior across all packages.")  | Oct 29, 2026  |  
|   |   | [refactor: bump version to 0.2.1 across the monorepo](https://github.com/PlayForm/DeepSeek/commit/8445cd0fbff1431371d73de0c8a8a12c8b5a095f "refactor: bump version to 0.2.1 across the monorepo

The release line for the entire DeepSeek Harness Plugin Family has been incremented from `0.2.0` to `0.2.1`. This update propagates the new version number to:

- The root `package.json`
- All Classic client, hook, and workspace packages
- Their respective `CHANGELOG.md` files
- The global icon ledger \(`Maintain/Icon/Ledger.json`\)

The change ensures that every package, its changelog, and the build‑time `process.env.VERSION_PACKAGE` constant all reference the same, consistent version. It also updates icon metadata to reflect the new package version and counts. No functional changes were made; this is a coordinated version bump to keep the monorepo in sync.")  | Oct 28, 2026  |  
|   |   | [chore(repo-tooling): Adopt the expanded Prettier import-sorting confi…](https://github.com/PlayForm/DeepSeek/commit/01fd918276d719eae3ffef99ddc18d1cfc8f4105 "chore\(repo-tooling\): Adopt the expanded Prettier import-sorting config and retire the Boilerplate tree

Replace the minimal .prettierrc with a full prettier.config.mjs and drop the internal Boilerplate baseline tree from the monorepo, then apply the resulting formatting sweep across the family.

Why: the previous config only carried prettier-plugin-sh. The new config centralizes the PlayForm house style and the toolchain that enforces it - import sorting \(via @ianvs/prettier-plugin-sort-imports\), package.json key sorting \(prettier-plugin-packagejson\), plus the shell/TOML/Tailwind/astro/svelte plugins and per-parser overrides - so a single `pnpm format` pass produces the canonical ordering everywhere. That ordering \(external/third-party modules and @Interface/@Variable/@Function/@playform aliases grouped first, relative ./ imports last\) is what the bulk of this diff mechanically applies to every Source file. The Boilerplate/ tree, by contrast, was the personal internal baseline \(live ~/.dsh source, personal paths kept by design\) that is never released; keeping it in the workspace forced every package.json, workspace glob, gitignore, lychee scan and README to account for a tree that ships nothing, so it is removed and its gitignore entries retired alongside.

What changed:
- prettier.config.mjs is added \(printWidth 100, tabs, double quotes, trailing commas, LF\) with the plugin list - @ianvs import sorting first, tailwindcss last - and per-file overrides \(json-stringify strict parser for package.json, loose json for others, astro/svelte/lua/toml/markdown\). .prettierrc is deleted and root package.json gains the prettier plugin/toolchain devDependencies, reorders scripts, and updates the description to drop the Boilerplate reference.
- Every Classic/ and EffectTS/ package.json is reordered to the config's canonical key order \(license/type/exports/main/types/files/scripts/devDependencies/publishConfig/dsh\) with the devDependencies blocks alphabetically sorted; the packagedef is non-behavioral.
- Every Source .ts across both trees is re-ordered to the canonical import grouping - external packages and @-aliases first, relative ./ imports last, inline `import X, { type Y }` / named type joins where the sorter collapsed separate statements - with no symbol or behavior change. The factory entry points \(Classic and ets plugin-dsh-factory Library.ts\) get the largest reordering.
- The Boilerplate/ tree is removed from pnpm-workspace.yaml, .gitignore, .prettierignore, .lychee.toml \(comment text only\), and README \(table row + layout diagram\).
- Maintain/Check-Newlines.mjs, Run-Smokes.mjs and Run-Wiring.mjs get the same import reordering; Maintain/Format.sh's configuration comment now documents prettier.config.mjs in place of .prettierrc.
- Documentation/Plans/TOMORROW-REVIEW.md gains the LIVE-TESTING FINDINGS \(2026-10-20\) record: the mount incident \(17 package.json with unresolved merge-conflict markers blocking plugin registration, user-resolved, all 30 valid\), the governance trio / CCR / tool-coach live-probe results, and the two flagged CCR anomalies \(retrieve range coordinate space, preview header count\) plus the current knob state \(autoExpandLimitBytes at 1024\).

Tooling, formatting and documentation only - no hook behavior is changed and no test assertion is altered.")  | Oct 20, 2026  |  
|   |   | [chore(repo-tooling): Adopt the expanded Prettier import-sorting confi…](https://github.com/PlayForm/DeepSeek/commit/01fd918276d719eae3ffef99ddc18d1cfc8f4105 "chore\(repo-tooling\): Adopt the expanded Prettier import-sorting config and retire the Boilerplate tree

Replace the minimal .prettierrc with a full prettier.config.mjs and drop the internal Boilerplate baseline tree from the monorepo, then apply the resulting formatting sweep across the family.

Why: the previous config only carried prettier-plugin-sh. The new config centralizes the PlayForm house style and the toolchain that enforces it - import sorting \(via @ianvs/prettier-plugin-sort-imports\), package.json key sorting \(prettier-plugin-packagejson\), plus the shell/TOML/Tailwind/astro/svelte plugins and per-parser overrides - so a single `pnpm format` pass produces the canonical ordering everywhere. That ordering \(external/third-party modules and @Interface/@Variable/@Function/@playform aliases grouped first, relative ./ imports last\) is what the bulk of this diff mechanically applies to every Source file. The Boilerplate/ tree, by contrast, was the personal internal baseline \(live ~/.dsh source, personal paths kept by design\) that is never released; keeping it in the workspace forced every package.json, workspace glob, gitignore, lychee scan and README to account for a tree that ships nothing, so it is removed and its gitignore entries retired alongside.

What changed:
- prettier.config.mjs is added \(printWidth 100, tabs, double quotes, trailing commas, LF\) with the plugin list - @ianvs import sorting first, tailwindcss last - and per-file overrides \(json-stringify strict parser for package.json, loose json for others, astro/svelte/lua/toml/markdown\). .prettierrc is deleted and root package.json gains the prettier plugin/toolchain devDependencies, reorders scripts, and updates the description to drop the Boilerplate reference.
- Every Classic/ and EffectTS/ package.json is reordered to the config's canonical key order \(license/type/exports/main/types/files/scripts/devDependencies/publishConfig/dsh\) with the devDependencies blocks alphabetically sorted; the packagedef is non-behavioral.
- Every Source .ts across both trees is re-ordered to the canonical import grouping - external packages and @-aliases first, relative ./ imports last, inline `import X, { type Y }` / named type joins where the sorter collapsed separate statements - with no symbol or behavior change. The factory entry points \(Classic and ets plugin-dsh-factory Library.ts\) get the largest reordering.
- The Boilerplate/ tree is removed from pnpm-workspace.yaml, .gitignore, .prettierignore, .lychee.toml \(comment text only\), and README \(table row + layout diagram\).
- Maintain/Check-Newlines.mjs, Run-Smokes.mjs and Run-Wiring.mjs get the same import reordering; Maintain/Format.sh's configuration comment now documents prettier.config.mjs in place of .prettierrc.
- Documentation/Plans/TOMORROW-REVIEW.md gains the LIVE-TESTING FINDINGS \(2026-10-20\) record: the mount incident \(17 package.json with unresolved merge-conflict markers blocking plugin registration, user-resolved, all 30 valid\), the governance trio / CCR / tool-coach live-probe results, and the two flagged CCR anomalies \(retrieve range coordinate space, preview header count\) plus the current knob state \(autoExpandLimitBytes at 1024\).

Tooling, formatting and documentation only - no hook behavior is changed and no test assertion is altered.")  | Oct 20, 2026  |  
|   |   | [refactor(monorepo): migrate to Turbo and clean up workspace configura…](https://github.com/PlayForm/DeepSeek/commit/8f3d0e590039d370646154402c86d2b05d54d470 "refactor\(monorepo\): migrate to Turbo and clean up workspace configuration

The classic and Effect‑TS packages previously relied on pnpm workspace files and custom build scripts. This commit removes all legacy `pnpm-workspace.yaml` files, replaces the build workflow with Turbo, and updates the package.json scripts to use `turbo run prepublishOnly`. The new `turbo.json` defines the prepublish task and a persistent Run task, simplifying CI and local builds.

Key changes:
- Delete all `pnpm-workspace.yaml` files across Classic and EffectTS.
- Add `turbo.json` with global dependencies and task definitions.
- Update `package.json` build scripts to use Turbo with framework inference disabled and proper filters.
- Minor formatting updates to keep the repository consistent.

This refactor streamlines the monorepo build process, removes unused configuration, and prepares the project for future Turbo-based tooling.")  | Oct 28, 2026  |  
| View all files |  
# DeepSeek Harness Plugin Family for PlayForm
Tame the model's output and govern the project's files with one hundred and nineteen TypeScript packages - 59 Classic and 60 EffectTS.
The set holds the original 14 plugins (the factory, the core, the governance trio, the seven-member normalize family, the two guardians and the live block) plus the 36 plugins of the 2026-10-22 delivery (the workspace family, the suggesters, the orchestration set, the client panels) and their ETS twins, plus the completion-program libraries (lib-dsh-trace, lib-dsh-pack) and the comment filter.
All of it arrives in two implementations ([the Classic release](https://github.com/PlayForm/DeepSeek/tree/Current/Classic), [the Effect-TS release](https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS)) under one ledger-string contract, with 595 smoke folders / 7,288 checks.
Note
_One monorepo. Every ledger byte-checked._
## Table of contents
  1. [The suite at a glance](https://github.com/PlayForm/DeepSeek#the-suite-at-a-glance)
  2. [Tools and configuration](https://github.com/PlayForm/DeepSeek#tools-and-configuration)
  3. [Troubleshooting](https://github.com/PlayForm/DeepSeek#troubleshooting)
  4. [Relationship to deepseek-ai/deepseek-harness](https://github.com/PlayForm/DeepSeek#relationship-to-deepseek-aideepseek-harness)


## Quick start
The family is published from source: each bundle is a self-contained TypeScript package built deterministically and wired into a DeepSeek Harness profile by hand, with no registry install and no setup binary.
### Build from source
**`Terminal`**(the workspace root, then the bundles)

```
pnpm install --ignore-scripts
pnpm run build:classic   # the 59 Classic packages, one workspace pass
pnpm run build:effect-ts # the 60 EffectTS packages
pnpm run test            # all 595 smoke folders - the arbiter
```

Per bundle the build keeps the same three steps (`Source/` -> `Target/` via ESBuild + `tsc` + `tsc-alias`, minified with `.d.ts` twins):

```
cd Classic/packages/bundle
pnpm install --ignore-scripts
pnpm run prepublishOnly
```

The base library and the factory come first (`lib-dsh-core`, [plugin-dsh-factory](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source)), then the consumers, and the consumers import their siblings through directory links under their own `node_modules/`.
### Into a DeepSeek Harness profile
Four steps follow, and every step below is the actual wiring that the loader reads, because no separate configuration UI exists.
  1. **Add the bundles to the profile** (`~/.dsh/profiles/<name>/package.json`) - the bundles listed as `link:` dependencies and in the `dsh.profile.bundles` list; the list is what activates them:

```
{
	"name": "my-dsh-profile",
	"dependencies": {
		"@playform/plugin-dsh-factory": "link:../bundles/plugin-dsh-factory",
		"@playform/hook-dsh-package-governor": "link:../bundles/hook-dsh-package-governor",
		"@playform/hook-dsh-package-pinner": "link:../bundles/hook-dsh-package-pinner",
		"@playform/hook-dsh-normalize-dash": "link:../bundles/hook-dsh-normalize-dash"
	},
	"dsh": {
		"profile": {
			"bundles": [
				"@playform/plugin-dsh-factory",
				"@playform/hook-dsh-package-governor",
				"@playform/hook-dsh-package-pinner",
				"@playform/hook-dsh-normalize-dash"
			]
		}
	}
}
```

The linked checkout carries its own `node_modules` and its own `pnpm-workspace.yaml` (`packages: [.]`), so an install inside a bundle under the workspace of the profile acts on the workspace root and does nothing to the bundle.
Remote routes enter the same list through `dsh plugin --profile <name> add <tarball>` for a built bundle today, or through `pnpm add @playform/<pkg>` in the profile directory once the family publishes to npm (the publishing is a later item).
  2. **Add the patch entries** (the profile's [cordis.patch.yml](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/cordis.patch.yml)) - one insert row per bundle, the config fields straight from the bundle's schema:

```
- insert:
      - id: plugin-dsh-factory
        name: "@playform/plugin-dsh-factory"
        config: {}
- insert:
      - id: hook-dsh-package-governor
        name: "@playform/hook-dsh-package-governor"
        config:
            log: true
            logFile: ~/.dsh/playform/hook-dsh-package-governor.log
            updateCooldownMs: 3000
            strict: false
            mutationTools: [write, edit, str_replace_editor, raw-write]
            maxUpdateFailures: 3
            ncuBin: /usr/local/bin/ncu
            updateMode: programmatic
            policyFile: 
            exclude: [node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app]
- insert:
      - id: hook-dsh-normalize-dash
        name: "@playform/hook-dsh-normalize-dash"
        config:
            log: true
            logFile: ~/.dsh/playform/hook-dsh-normalize-dash.log
            replacement: 
            normalizeReasoning: true
```

  3. **Restart the host** - the loader activates the entry from `Target/Library.js` and inserts the patch rows at startup.
  4. **Verify the ledgers** - each plugin writes its activation line to its own `~/.dsh/<identity>.log` at boot, and that line is the "did it activate" answer, readable from the ledger alone:

```
hook-dsh-package-governor: activated (anywhere mode, logFile=~/.dsh/playform/hook-dsh-package-governor.log, updateMode=programmatic, ncuBin=/usr/local/bin/ncu, exclude=[node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app], policyFile=(discovery))
hook-dsh-package-pinner: activated (pinner, logFile=~/.dsh/playform/hook-dsh-package-pinner.log, sections=[dependencies, devDependencies, peerDependencies, optionalDependencies], exclude=[node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app])
hook-dsh-normalize-dash: activated (replacement=-, reasoning=on, toolArgs=off, logFile=~/.dsh/playform/hook-dsh-normalize-dash.log)

```



## The suite at a glance
Two published groups share one contract: the CLASSIC packages (`@playform/dsh-*`, plain TypeScript) and the EFFECT-TS packages (`@playform/ets-*`, effect-backed).
Install the group you run and never mix the groups in one graph, because the effect-ts `Update` returns Effect envelopes and not the classic dispatch envelope:
  * **CLASSIC:** `pnpm add @playform/lib-dsh-core @playform/plugin-dsh-factory @playform/hook-dsh-package-governor` - plain TypeScript, zero framework dependencies; `import { Govern } from "@playform/plugin-dsh-factory"`.
  * **EFFECT-TS:** `pnpm add @playform/ets-lib-dsh-core @playform/ets-plugin-dsh-factory @playform/ets-hook-dsh-package-governor` - the same contracts on Effect-TS services and layers, with `effect` v4.0.7 as the shared runtime dependency and the base `@playform/ets-base-dsh` package carrying the plumbing every ets-* package builds on.


The one-line roster lives in [Documentation/Plugins/PLUGIN-SUITE-SUMMARY.md](https://github.com/PlayForm/DeepSeek/blob/Current/Documentation/Plugins/PLUGIN-SUITE-SUMMARY.md), and the per-plugin live test plans live in [Documentation/Testing/](https://github.com/PlayForm/DeepSeek/blob/Current/Documentation/Testing/README.md).
By area:  
| Area  | Count  | What  |  
| --- | --- | --- |  
| The original plugins  | 14  | the factory, the governance trio, the six stream flavors + the file normalizer, ccr, tool-coach, live-containers  |  
| The workspace family  | 15 + 1 library  | the ten-step invisible flow: observe → semantics → operate → govern → authority → approve → merge → journal → audit → context/monitor/evidence/graph/reflect, plus `lib-dsh-workspace-live`  |  
| The client family  | 3  |  `client-dsh-panel-family`, `client-dsh-panel-family-host`, `client-dsh-workspace-live`  |  
| The suggesters  | 7  | `hook-dsh-{search,edit,doc,convention,graph,replay,test}-suggester`  |  
| The orchestration set  | 10  |  `plugin-dsh-batch-edit`, `plugin-dsh-batchstate`, `plugin-dsh-gitguard`, `plugin-dsh-route`, `plugin-dsh-queue`, `plugin-dsh-feedback`, `plugin-dsh-pass-on`, `plugin-dsh-ingester`, `plugin-dsh-pattern`, `hook-dsh-batch-decision`  |  
| The completion libraries  | 2  |  `lib-dsh-trace` (the trace bus's library half), `lib-dsh-pack` (the pack layer)  |  
| The cost family  | 2  |  `plugin-dsh-cost` (the per-file inference cost ledger), `plugin-dsh-cost-analysis` (the read-only ledger analysis)  |  
| The learning family  | 2  |  `plugin-dsh-lesson-review` (the post-turn self-improvement review), `hook-dsh-lesson-nudge` (the idle-transition nudge)  |  
| The overpass filter  | 1  |  `hook-dsh-comment-filter` (the comment-stripping overpass)  |  
| The conversation spine  | 1 library  |  `lib-dsh-conversation` (the conversation vocabulary and the pure fold)  |  
Every one of the 59 Classic packages has an ETS twin.
## Architecture
### The problem
Two quiet kinds of rot appear in every agent session:
  * **The model's typography.** Every streamed transcript accumulates the unicode that the model reaches for: em and en dashes, curly quotes, the horizontal ellipsis, exotic spaces, zero-width characters, fullwidth forms. Those characters survive into files, diffs, searches and terminals, where they break byte-exact comparisons and look wrong everywhere else.
  * **The project's manifests.** `package.json` chain pins point at resolutions that drifted out from under them, ranged dependencies resolve differently on every machine, and `Cargo.toml` entries accumulate versions that no one canonicalized.


The DeepSeek Harness exposes the seams to fix both ([`fs/observed`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts) for file events and the [`llm/stream`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts) waterfall for model output) and ships no plugins that use them for this work.
The family is those plugins.
### How it works
Three seams, three behaviors, and one service underneath:

```
    MODEL STREAM ───► the stream gate (the llm/stream waterfall) ───► the transcript, normalized
                          │  one flavor, one table: em dash → -   " → "   ... → ...
    FILE EVENT ─────► the seam (fs/observed) ───► the gate set ───► the ledger + the chain
                          │  target → actor → kind → idempotence → basename → exclusion
    RAW-WRITE ──────► the direct-govern registry (factory.Govern) ─► the same chain, per call

```

  * - each normalize flavor hooks the [`llm/stream`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts) waterfall (the interceptable wrapper around every streaming model call) and rewrites its character family live in the transcript: the dash family to `-`, the eight curly quote code points to their straight counterparts, the ellipsis to `...`, the unicode space family to the plain space, the zero-width/invisible family removed, and the fullwidth forms to their ASCII half-width counterparts. The dispatch machinery (`Chunk`/`Block`, the assembled reasoning block, the tool-arguments gate) is shared from the core, and each flavor contributes one table and one replacement.
  * **The observed-file seam** - the governance trio hooks [`fs/observed`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts): a governed write by a mutation tool passes the gate set, then the pass runs as a detached, contained continuation (the chain pass for the governor, the pin pass for the pinner, the TOML surgery for the cargo governor), and the update stage dispatches on a cooldown with a circuit breaker. Every plugin writes its own ledger (`~/.dsh/<identity>.log`) and journals to the shared `package_governance` [storage domain](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/storage/storage-domain).
  * **[The direct-govern registry](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source/Function/Govern.ts)** - the per-call `govern` selection of the `raw-write` tool drives the same chain directly through [factory.Govern](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source/Function/Govern.ts) ([the sequential fold](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source/Function/Govern.ts): one step's chain completes before the next step reads the file), instead of waiting for an event.


### The original 14 plugins (plus the core library)
The original 14 plugins (plus `lib-dsh-core`) each read as an @-sentence: `<kind> @ <platform> @ <role> @ <domain>`.
  * (Plugin @ DSH @ Factory) - the first service of the family: loading it registers one class plugin (`static inject = ["fs"]`) that exposes `ctx.pluginFactory` with nineteen callable methods covering everything the hooks used to duplicate - the ledger (`Append`), the exclusion match (`Match`), the registry discovery (`Discover`/`Parse`), the union keep-list (`ResolvePolicy`), the gate set (`Gate`), [the shared write executor](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source/Function/Write.ts) (`Write`/`GuardedWrite`, the version-guarded fenced writes), the [fs/observed](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts) re-emit (`Refresh`), the detached contained continuation (`Continue`), the State builder, the fiber-owned wiring (`Wire`), the effect registrations (`Attach` - jobs, inflight, storage), the P5 journal (`Journal`), the schema factory (`Schema`), the probe-once seam (`Seam`), the Inflight key (`UpdateKey`), and [the direct-govern registry](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source/Function/Govern.ts) and entry (`RegisterGovern`/`Govern`, the sequential fold).
  * **`lib-dsh-core`**(Lib @ DSH @ Core) - the pure library layer with zero runtime dependencies, not a plugin: the dependency-section lists, the exclusion segments, the suppression-line composer, the update-policy loader,[the refusal guard](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/lib-dsh-core/Source/Function/Refusal.ts), the update envelope, the activation-line composer, and the normalize/stream machinery (the six tables, `Replace`/`ReplaceMap`, `Chunk`/`Block`).
  * **[hook-dsh-package-governor](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-package-governor/Source)** (Hook @ DSH @ Governor @ Package) - the silent `package.json` governor: it hooks [`fs/observed`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts), rewrites chain-governed pins (`^x`, `~x`, `workspace:*`) to the resolved versions of the effective registry, and runs the update stage (`ncu`, programmatic library or external binary through [the subprocess seam](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/subprocess/subprocess)) on a cooldown with a circuit breaker; `strict` strips unknown dependencies, explicitly only and never as a default delete.
  * **[hook-dsh-package-pinner](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-package-pinner/Source)** (Hook @ DSH @ Pinner @ Package) - the silent version pinner: it deterministically rewrites every ranged dependency version to its static version (`^0.3.4` -> `0.3.4`), protected by the [pin-policy.json](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-package-pinner/Source/Function/Transform.ts) keep-list, where the keep-list wins over pinning and never over the chain.
  * **[hook-dsh-cargo-governor](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-cargo-governor/Source)** (Hook @ DSH @ Governor @ Cargo) - the Rust-sided flavor of the governor: surgical chain-pin rewrites on the raw TOML lines (comments survive), full-version normalization (`1.0` -> `1.0.0`), and `cargo upgrade` (cargo-edit) through [the subprocess seam](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/subprocess/subprocess) as the only update path, because Rust does not co-opt into the TypeScript ecosystem; `strict` removes the whole `name = "..."` entry and never an inherited or path/git entry.
  * **[hook-dsh-normalize-dash](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-dash/Source)** (Hook @ DSH @ Normalize @ Dash) - the dash flavor: em and en dashes and their exotic relatives to ASCII hyphen-minus, at the injection point that the reference tooling lacks.
  * **[hook-dsh-normalize-quotes](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-quotes/Source)** (Hook @ DSH @ Normalize @ Quotes) - the quotes flavor: the eight curly quote code points to their ASCII straight counterparts.
  * **[hook-dsh-normalize-ellipsis](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-ellipsis/Source)** (Hook @ DSH @ Normalize @ Ellipsis) - the ellipsis flavor: the horizontal ellipsis (U+2026) to the plain three-dot sequence.
  * **[hook-dsh-normalize-spaces](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-spaces/Source)** (Hook @ DSH @ Normalize @ Spaces) - the spaces flavor: the unicode space family (Zs minus the ASCII space) to the plain space.
  * **[hook-dsh-normalize-invisible](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-invisible/Source)** (Hook @ DSH @ Normalize @ Invisible) - the invisible flavor: the zero-width/invisible character family (soft hyphen, zero-width spaces and joiners, bidi controls, BOM) removed.
  * **[hook-dsh-normalize-fullwidth](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-fullwidth/Source)** (Hook @ DSH @ Normalize @ Fullwidth) - the fullwidth flavor: the entire FULLWIDTH FORMS range (U+FF01-FF5E) to its ASCII half-width counterparts.
  * **[plugin-dsh-normalize-file](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-normalize-file/Source)** (Plugin @ DSH @ Normalize @ File) - the file-content normalizer plugin: the read, count, write pipeline that applies all six transforms to a file already on disk and writes only when something changed.
  * (Hook @ DSH @ CCR) - the compress-cache-retrieve guardian: oversized allow-listed tool results become a one-line type-aware preview plus a retrieval marker, with the original bytes restored on demand by the `ccr_retrieve` tool.
  * (Hook @ DSH @ Tool @ Coach) - the terminal-content coaching guardian: the four-tier ladder (ledger, notice, persistent section, opt-in deny) over terminal calls, naming the correct dedicated tool with its live registry description.
  * **[hook-dsh-live-containers](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-live-containers/Source)** (Hook @ DSH @ Live @ Containers) - the dynamic system-prompt blocks: one `live-containers` section whose labeled stanzas are recomputed at request time, shipped disabled and enabled only by an explicit activate.


### The 36 packages of the 2026-10-22 delivery
  * **The workspace family (15 + the library)** - `plugin-dsh-workspace` (the operational view and the map/find/expand/context tools), `hook-dsh-workspace-observe` (the version stamps), `plugin-dsh-workspace-semantics` (symbol resolution and rename planning), `hook-dsh-workspace-operate` (typed proposals), `hook-dsh-workspace-govern` (the means-check gates), `plugin-dsh-workspace-authority` (capability/lease/residency), `hook-dsh-workspace-approve` (the approval binder), `hook-dsh-workspace-merge` (the atomic batch merge), `hook-dsh-workspace-journal` (pre-images, revert, crash recovery), `hook-dsh-workspace-audit` (the accountability records), `plugin-dsh-workspace-context` (the orientation packet), `hook-dsh-workspace-monitor` (check-set watchers), `plugin-dsh-workspace-evidence` (the truth records), `plugin-dsh-workspace-graph` (the file/symbol/block index), `plugin-dsh-workspace-reflect` (one-call reflective ops), plus `lib-dsh-workspace-live` (the shared client library).
  * **The client family (3)** - `client-dsh-panel-family`, `client-dsh-panel-family-host`, `client-dsh-workspace-live`.
  * **The suggesters (7)** - `hook-dsh-{search,edit,doc,convention,graph,replay,test}-suggester`.
  * **The orchestration set (10)** - `plugin-dsh-batch-edit` (the batch edit engine), `plugin-dsh-batchstate` (the live board), `plugin-dsh-gitguard`, `plugin-dsh-route`, `plugin-dsh-queue`, `plugin-dsh-feedback`, `plugin-dsh-pass-on`, `plugin-dsh-ingester`, `plugin-dsh-pattern`, and `hook-dsh-batch-decision`.


Every one of the 59 Classic packages has an ETS twin.
### The two trees and the layout  
| Tree  | What it is  |  
| --- | --- |  
| `Classic/`  | The plain-TypeScript release - classes, Maps and plain functions, zero runtime framework dependencies. 59 packages; 299 smoke folders.  |  
| `EffectTS/`  | The Effect v4 port - the same contracts re-expressed on Effect-TS services and layers (the `effect` 4.0.7 pin). 60 packages; 296 smoke folders.  |  
Every package carries an `ets-*` twin, which gives 59 twins for the 59 Classic packages.

```
    Classic/         the plain-TypeScript release: 59 packages + smokes
    EffectTS/        the Effect v4 port: 60 packages + smokes
    Site/            the static site (its own repository)
    Test/            the fixture archive: the governance batteries, the markdown proofs, the probes
    Documentation/   the framework, the guides, the skills, the plans, the reports, the test plans
    Maintain/        the formatting entry point and the aggregate runner

```

### The factory and the ledger-string contract
Every activation line, refusal line, chain-pass line and journal record is asserted byte-identically by the smokes.
The strings are the contract: they must not change, and they are the same strings in both trees.
One ledger per plugin lives at `~/.dsh/<identity>.log`, and the smokes load the real built `Target/Library.js` of each bundle and assert the full behavioral contract on top of the strings (the loader contract, the identity assertions, the effect wiring).
## Tools and configuration
### Tools
Two tools ship with the family:  
| Tool  | What it does  |  
| --- | --- |  
| `raw-write`  | The write wrapper registered by the stream flavors: an explicit `normalize` parameter (default **false = verbatim**) - absent/false writes byte-for-byte, `true` applies all six transforms, an array applies the named flavors only. Exempt from stream normalization by name, like `edit`. The per-call `govern` selection (`true`, a name array, or `false` = the escape hatch) drives [the direct-govern fold](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source/Function/Govern.ts).  |  
| `normalize-file`  | The whole-file pass: reads the file, applies the transforms (all six by default, or the flavor selection), reports the count, writes only when something changed.  |  
### Configuration
Every plugin's config schema is built through the `Schema` factory of the factory: one shared volatile block (`log`, `logFile`, `updateCooldownMs`, `mutationTools`) plus the own fields of the module.
The surface, grouped by plugin kind:  
| Kind  | Field  | Effect  |  
| --- | --- | --- |  
| The governance trio  |  `log` / `logFile`  | the durable ledger file (each plugin keeps its own, separate by default)  |  
| `mutationTools`  | which actor tools count as triggers - the deployed layers set `[write, edit, str_replace_editor, raw-write]`  |  
| `exclude`  | the exclusion segments - the plugin's own fence (`node_modules`, `.git`, `.dsh`, ...)  |  
|  `updateCooldownMs` / `maxUpdateFailures`  | the update stage's pacing and its circuit breaker (3 failures pause a directory)  |  
|  `updateMode` + `ncuBin` / `cargoBin`  | programmatic (library) vs bin (external binary via [the subprocess seam](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/subprocess/subprocess)); absolute paths - host PATH != shell PATH  |  
| `strict`  | strip unknown dependencies - explicit only, never a default-delete  |  
|  `policyFile` / `keepFile` / `sections`  | the update-policy and keep-list sidecars, and which dependency sections the pinner touches  |  
| The stream flavors  | `replacement`  | the transform's only knob on class flavors (`-`, `"`, `...`, plain space, empty) - hot-editable, no remount  |  
| `normalizeReasoning`  | default ON - normalize reasoning deltas and the assembled reasoning block too  |  
| `normalizeToolArguments`  | default OFF - tool-call arguments are execution-critical raw JSON; opt-in (deprecated in favor of `scopes.toolInput`, kept and OR-ed in)  |  
| `scopes`  | the granular scope gates - all volatile, per hook: `conversation` (text/block-end, ON), `reasoning` (sub-gate, ON), `toolInput` (OR-ed with `normalizeToolArguments`, OFF), `toolResults` (the `tools/post-execute` arm, OFF), `files` (the `normalize-file` tool, ON), `batch` (the `agent/pre-step` arm, OFF)  |  
| `toolResultsExempt`  | volatile list of exec names that pass the tool-results arm by identity (`read`, `edit`, `raw-write`, `normalize-file`, `ccr_retrieve`, `subagent`, `ask_user_question`)  |  
| The file tool  |  `normalize` (per call)  | absent/false = verbatim, `true` = all six transforms, or the flavor-name array  |  
The defaults-off posture keeps `strict` off, `normalizeToolArguments` off, `raw-write` `normalize` off, and `scopes.toolInput` / `scopes.toolResults` / `scopes.batch` off, so the family changes nothing until it is told to.
The escape hatches are the `exclude` fence, the keep-list sidecars, the raw-marker opt-out, and the `govern: false` selection.
### The granular scopes and the overpass arms
Because the `scopes` schema shape is identical in every family hook, one grouped override in the profile patch (`cordis.patch.yml`) turns the whole family off in one edit, live and silent, with no remount and no new activation line:

```
- id: hook-dsh-normalize-dash
  config:
      scopes:
          conversation: false
          reasoning: false
          toolInput: false
          toolResults: false
          files: false
          batch: false
```

Repeat the block for the other flavors (or just the ones you want dark), because every scope is volatile and flipping it applies to the next dispatch.
The overpass arms (both opt-in and off by default) normalize content at its natural boundaries without ever rewriting the durable transcript:
  * `tools/post-execute` - the tool result is normalized before it re-enters the model and is appended to the transcript going forward (text blocks only; the `read`/`edit`/`raw-write`/`normalize-file`/ `ccr_retrieve`/`subagent`/`ask_user_question` exec names pass by identity via `toolResultsExempt`, and the `<<<CCR:` marker bytes make the arm order-safe against the ccr hook).
  * `agent/pre-step` - the incoming user-role batch is normalized before the model sees it, never the assistant/tool history, which is append-only.


Each hook also registers a human command, `normalize-overpass`:

```
normalize-overpass batch          # arm a one-shot step-batch overpass (one use)
normalize-overpass results on     # flip scopes.toolResults via the settings service
normalize-overpass results off
normalize-overpass scopes         # read-only report of the current effective values
normalize-overpass files <path...>  # the file sweep - implemented by the normalize-file hook only

```

The command writes one ledger line per action: `overpass: normalized N char(s) in tool result <toolName> <callId>`, `overpass: normalized N char(s) in step batch (turn T step S)`, and `overpass: swept K file(s), normalized M char(s)`.
## Verification
The suites are the speed and coverage story:
  * **299 Classic / 296 EffectTS folders, 7,288 checks, all green.** The aggregate runner is `node Maintain/Run/Smokes/Index.mjs`, and the heaviest single original suite (cargo, 62 checks including the real TOML surgery and the subprocess-seam stubs) runs in ~0.6 s.
  * **Zero runtime framework dependencies in Classic** - the release tree runs on plain TypeScript, and EffectTS adds the single `effect` 4.0.7 dependency.
  * **Deterministic builds** - ESBuild + `tsc` + `tsc-alias`, minified `Target/` with `.d.ts` twins, and byte-identical ledger strings on every rebuild.


One suite per test folder per tree runs with the aggregate `node Maintain/Run/Smokes/Index.mjs`, which also guards each folder's printed PASS count against its folder README (the vacuously-green guard):  
| Measure  | Value  |  
| --- | --- |  
| Test folders (Classic)  | 299  |  
| Test folders (EffectTS)  | 296  |  
| Total suites  | **595**  |  
| Total checks (both trees)  | **7,288**  |  
| The wiring battery  |  `<tree>/smokes/Test/`, run by `Maintain/Run/Wiring/Index.mjs` under `DSH_TEST_SCRATCH`  |  
The per-suite before/after totals live in the totals ledger of `Documentation/Plans/SMOKE-SUITE-RESTRUCTURE-BLUEPRINT.md`, where the original 14 mechanics suites total 1314 Classic / 1324 EffectTS checks and the rest is the suites of the 2026-10-22 delivery.
The counts are the release contract: they must not change.
## The docs map
Everything is documented under [Documentation/](https://github.com/PlayForm/DeepSeek/blob/Current/Documentation/INDEX.md), and the index lists every document with its status:  
| Section  | Contents  |  
| --- | --- |  
|  `Documentation/` root  |  [INDEX.md](https://github.com/PlayForm/DeepSeek/blob/Current/Documentation/INDEX.md), [ARCHIVE-STYLE.md](https://github.com/PlayForm/DeepSeek/blob/Current/Documentation/ARCHIVE-STYLE.md) (the frontmatter template), [FRAMEWORK.md](https://github.com/PlayForm/DeepSeek/blob/Current/Documentation/FRAMEWORK.md)  |  
| `Brand/`  |  
| `Plans/`  | the living + queued plans (30) and the granular families (`Batch-Edit-Tool/`, `Representation-First/`, `UI-Family/`, `Workspace-Family/`, `Completion-Spec/`)  |  
| `Researches/`  | the research outputs (8)  |  
| `Guides/`  | the operating manuals (7)  |  
| `Reports/`  | the audits and diagnoses (6)  |  
| `Plugins/`  | the registry documents (3): PLUGIN-FAMILY.md, ORCHESTRATION-PLUGINS.md, PLUGIN-SUITE-SUMMARY.md  |  
| `Testing/`  | the per-plugin live test plans: [README.md](https://github.com/PlayForm/DeepSeek/blob/Current/Documentation/Testing/README.md) + 35 per-plugin files  |  
| `Archive/`  | the one-shot records (45, in 8 topics)  |  
|  `Handoff/`, `Skill/`  | untouched trees (the delivery record; the loadable skills)  |  
## Development
The workflow, root-first - every step is a root `package.json` script:  
| Script  | What it does  |  
| --- | --- |  
| `pnpm install`  | the workspace install (`--ignore-scripts`); the per-bundle standalone workspaces take their own install  |  
|  `pnpm run build:classic` / `build:effect-ts`  | the packages of one tree, one workspace pass (`prepublishOnly` per package)  |  
| `pnpm run build`  | both trees in order (`build:classic` then `build:effect-ts`) - the whole-build trigger  |  
| `pnpm test`  | all 595 smoke suites via `Maintain/Run/Smokes/Index.mjs` - the behavioral arbiter, exit non-zero on any failure  |  
| `pnpm run test:types`  |  `Maintain/Run/Types/Index.mjs` - the type check across the trees  |  
| `pnpm run test:wiring`  |  `Maintain/Run/Wiring/Index.mjs` - the live wiring battery under `DSH_TEST_SCRATCH`  |  
| `pnpm site`  | the static site build (`Site/`)  |  
| `pnpm lychee`  |  `Maintain/Check/Lychee/Index.sh` - the three-pass link check composing `lychee-report.md`  |  
|  `pnpm format` / `format:check`  |  `Maintain/Format/Index.sh` - line endings + Prettier (never the markdown - byte-integrity-protected)  |  
The regime: the smokes (and the site build) are the arbiter after every change, the ledger strings stay byte-identical at the same counts, the byte-scan stays clean (no NUL bytes in the tracked tree), and the tree is committed by the maintainer, never by tooling.
The hazards, documented:
  * ~~The duplicate-name relink.~~ Resolved by the namespace split (SPLICE-ETS.md): the two trees now carry unique names (`@playform/dsh-*` vs `@playform/ets-*`), so no install can re-relink a consumer's `@playform/*` links to the other tree. Re-run the smokes after every install anyway.
  * **The verifyCommand trap.** An update-policy `verifyCommand` fails on a vendored-fork workspace (no registry to install from), and the ledger records it, which is the expected outcome.
  * **The smoke/live fidelity gap.** The smokes prove the mechanics, the live battery proves the wiring, and the ledgers answer "did it activate".


## Troubleshooting
The known gaps stay stated as they are, with the corrected claims kept and no marketing gloss.
  * **Load order is not list order.** The pinner can activate before the governor at boot, because the registration order is not controlled. Never rely on the bundle-list order for step ordering: the sequential fold and the fresh-version writes make the order irrelevant, and each plugin's ledger answers for its own activation.
  * **The verifyCommand trap.** An update-policy `verifyCommand` can fail with a non-zero status: on a vendored-fork workspace (the live battery of the family), `pnpm install` has no registry to install from, and the ledger records the failure as the documented cordis registry trap, the expected outcome and not a bug. Exit 127 (the runner unavailable) is non-fatal, while any other failure fails the stage and counts toward the circuit breaker (`maxUpdateFailures`):

```
update: running verifyCommand: pnpm install
update: verifyCommand failed (status 1)
update: verifyCommand runner unavailable (exit 127) - skipped, non-fatal
update stage FAILED (1) for <dir>; consecutive=2

```

  * **The smoke/live fidelity gap.** The smokes prove the mechanics and the live battery proves the wiring. Every real bug (the patch layers, the v2 journal open, the version guard) was found live and not by the smokes, so both green does not prove the profile wiring; the ledgers do.
  * **The fixture paths.** The `Test/` fixtures carry the neutralized display forms (`<repo-root>/`, `$DSH_HOME/`), and the personal absolute paths exist only in the internal Boilerplate copies. Never copy a live battery into the release archive as-is.
  * **The byte-integrity law.** The NUL-byte incident class: a write that emits bytes the format of the file forbids (NUL bytes) corrupts the file, which is the URL-registry corruption lesson. Verbatim is the default, the normalize family restores the integrity, and the byte-scan is the arbiter.
  * **The timestamp confusion.** The ledger lines are ISO UTC, the storage records are epoch milliseconds, and the local display adds +03, so the "missing records" scares were filter mistakes and not lost data.
  * **The raw-write marker semantics.** An absent `govern` means no chain (the escape hatch), and the raw marker (`__normalize: false`) passes a call through unnormalized. Markers are stripped before the tool validates, because the harness tools reject unknown argument keys.


## Relationship to deepseek-ai/deepseek-harness
The family extends the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH), the desktop agent platform published as the `@deepseek-ai` packages.
Everything the family builds on is the public plugin API of the harness:  
| Harness package  | What the family uses it for  |  
| --- | --- |  
| the loader contract: the service/class plugins, the patch inserts, the fiber-owned hooks  |  
| [`@deepseek-ai/schemastery`](https://github.com/deepseek-ai/deepseek-harness/tree/master/vendor/schemastery)  | the config schemas (the factory's `Schema` factory emits real schemastery instances)  |  
|  `ctx.fs` - the governed reads, the version-guarded writes, the [`fs/observed`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts) event vocabulary  |  
| [`@deepseek-ai/dsh-subprocess`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/subprocess/subprocess)  |  [the subprocess seam](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/subprocess/subprocess) - the `ncu` and `cargo upgrade` dispatches  |  
| [`@deepseek-ai/dsh-sandbox`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/sandbox/sandbox)  | the sandbox policy - the fenced write postures  |  
The harness ships the seams and no plugins that use them this way, so the family adds the normalization and the governance on top.
## Contributing  
| Want to...  | Start here  |  
| --- | --- |  
| Fix a plugin  | the bundle's `README.md` + `SCHEME.md` under `Classic/packages/<bundle>/`  |  
| Add a flavor  |  `lib-dsh-core` (one table) + a new `hook-dsh-normalize-<name>` bundle  |  
| Change behavior  | the smokes first - the counts (595 suites / 7,288 checks) and the ledger strings are the contract  |  
| Understand the design  |  `Documentation/FRAMEWORK.md` and the skills under `Documentation/Skill/`  |  
The regime: the smokes (and the site build) are the arbiter after every change, the ledger strings stay byte-identical, and the tree is committed by the maintainer, never by tooling.
## License
Released under [CC0-1.0](https://github.com/PlayForm/DeepSeek/blob/Current/LICENSE) - public domain.
## About
DeepSeek 🐳
[deepseek](https://github.com/topics/deepseek)[deepseek-harness](https://github.com/topics/deepseek-harness)[deepseek-harness-plugin](https://github.com/topics/deepseek-harness-plugin)[dsh-plugin](https://github.com/topics/dsh-plugin)
**2** stars
**0** watching
[ forks](https://github.com/PlayForm/DeepSeek/forks)
## 
[ v0.2.1Latest Oct 28, 2026 ](https://github.com/PlayForm/DeepSeek/releases/tag/v0.2.1)
## 
  * [**NikolaRHristov** Nikola Hristov](https://github.com/NikolaRHristov)
  *   * 

## Languages
  * [HTML91.9%](https://github.com/PlayForm/DeepSeek/search?l=html)
  * [TypeScript7.5%](https://github.com/PlayForm/DeepSeek/search?l=typescript)
  * [Other0.6%](https://github.com/PlayForm/DeepSeek/search?l=Other)


You can’t perform that action at this time. 

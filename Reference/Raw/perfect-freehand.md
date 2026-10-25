[**28** Branches](https://github.com/steveruizok/perfect-freehand/branches)[](https://github.com/steveruizok/perfect-freehand/tags)
Go to file Open more actions menu and
[Update README to link to new Rust port (](https://github.com/steveruizok/perfect-freehand/commit/176e00f2399f4969e1b0965c5921d96a3e50ce9f)[#95](https://github.com/steveruizok/perfect-freehand/pull/95)[)](https://github.com/steveruizok/perfect-freehand/commit/176e00f2399f4969e1b0965c5921d96a3e50ce9f)
Open commit detailsfailure Feb 1, 2026
[176e00f](https://github.com/steveruizok/perfect-freehand/commit/176e00f2399f4969e1b0965c5921d96a3e50ce9f)
· Feb 1, 2026 [241 Commits](https://github.com/steveruizok/perfect-freehand/commits/main/) Open
commit details 241 Commits

| Name | Name | Last commit message                                                                                                                                                                                                          | Last commit date |
| ---- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
|      |      | [Modernize build tooling and dev infrastructure for 2026 (](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2 "Modernize build tooling and dev infrastructure for 2026 \(#96\) |

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5
<noreply@anthropic.com>")[#96](https://github.com/steveruizok/perfect-freehand/pull/96)[)](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
"Modernize build tooling and dev infrastructure for 2026 \(#96\)

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5 <noreply@anthropic.com>") | Feb 1, 2026 |  
| | | [Modernize build tooling and dev infrastructure for 2026
(](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
"Modernize build tooling and dev infrastructure for 2026 \(#96\)

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5
<noreply@anthropic.com>")[#96](https://github.com/steveruizok/perfect-freehand/pull/96)[)](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
"Modernize build tooling and dev infrastructure for 2026 \(#96\)

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5 <noreply@anthropic.com>") | Feb 1, 2026 |  
| | | | Sep 16, 2021 |  
| | | | Oct 5, 2021 |  
| | | [chore: bump version to
1.2.3](https://github.com/steveruizok/perfect-freehand/commit/b6a6c8aa4dbd3883b26dcd21d6b8dc82ba89f76d
"chore: bump version to 1.2.3

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>") | Feb 1, 2026 |  
| | | | Oct 5, 2021 |  
| | | [Modernize build tooling and dev infrastructure for 2026
(](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
"Modernize build tooling and dev infrastructure for 2026 \(#96\)

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5
<noreply@anthropic.com>")[#96](https://github.com/steveruizok/perfect-freehand/pull/96)[)](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
"Modernize build tooling and dev infrastructure for 2026 \(#96\)

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5 <noreply@anthropic.com>") | Feb 1, 2026 |  
| | | | Feb 16, 2021 |  
| | | [Modernize build tooling and dev infrastructure for 2026
(](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
"Modernize build tooling and dev infrastructure for 2026 \(#96\)

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5
<noreply@anthropic.com>")[#96](https://github.com/steveruizok/perfect-freehand/pull/96)[)](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
"Modernize build tooling and dev infrastructure for 2026 \(#96\)

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5 <noreply@anthropic.com>") | Feb 1, 2026 |  
| | | [Moves to a monorepo with esbuild
(](https://github.com/steveruizok/perfect-freehand/commit/07ba771ecb45f560576a722ce966399ef10a55a9
"Moves to a monorepo with esbuild \(#28\)

- hello

- Fix redo bug

- Fix dot error

- Update index.ts

- Adds options, improves styling

- Update index.test.ts.snap

- updates deep merge

- Adds menu toggle

- Adds husky

- v0.5.0")[#28](https://github.com/steveruizok/perfect-freehand/pull/28)[)](https://github.com/steveruizok/perfect-freehand/commit/07ba771ecb45f560576a722ce966399ef10a55a9
  "Moves to a monorepo with esbuild \(#28\)

- hello

- Fix redo bug

- Fix dot error

- Update index.ts

- Adds options, improves styling

- Update index.test.ts.snap

- updates deep merge

- Adds menu toggle

- Adds husky

- v0.5.0") | Aug 23, 2021 |  
  | | | [Modernize build tooling and dev infrastructure for 2026
  (](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
  "Modernize build tooling and dev infrastructure for 2026 \(#96\)

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5
<noreply@anthropic.com>")[#96](https://github.com/steveruizok/perfect-freehand/pull/96)[)](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
"Modernize build tooling and dev infrastructure for 2026 \(#96\)

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5 <noreply@anthropic.com>") | Feb 1, 2026 |  
| | | [Modernize build tooling and dev infrastructure for 2026
(](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
"Modernize build tooling and dev infrastructure for 2026 \(#96\)

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5
<noreply@anthropic.com>")[#96](https://github.com/steveruizok/perfect-freehand/pull/96)[)](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
"Modernize build tooling and dev infrastructure for 2026 \(#96\)

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5 <noreply@anthropic.com>") | Feb 1, 2026 |  
| | | [Modernize build tooling and dev infrastructure for 2026
(](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
"Modernize build tooling and dev infrastructure for 2026 \(#96\)

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5
<noreply@anthropic.com>")[#96](https://github.com/steveruizok/perfect-freehand/pull/96)[)](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
"Modernize build tooling and dev infrastructure for 2026 \(#96\)

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5 <noreply@anthropic.com>") | Feb 1, 2026 |  
| | | [Modernize build tooling and dev infrastructure for 2026
(](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
"Modernize build tooling and dev infrastructure for 2026 \(#96\)

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5
<noreply@anthropic.com>")[#96](https://github.com/steveruizok/perfect-freehand/pull/96)[)](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
"Modernize build tooling and dev infrastructure for 2026 \(#96\)

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5 <noreply@anthropic.com>") | Feb 1, 2026 |  
| | | | Feb 1, 2026 |  
| | | | Sep 24, 2021 |  
| | | [Update README to link to new Rust port
(](https://github.com/steveruizok/perfect-freehand/commit/176e00f2399f4969e1b0965c5921d96a3e50ce9f
"Update README to link to new Rust port \(#95\)

Previous port had geometry inaccuracies.

Co-authored-by: Steve Ruiz
<steveruizok@gmail.com>")[#95](https://github.com/steveruizok/perfect-freehand/pull/95)[)](https://github.com/steveruizok/perfect-freehand/commit/176e00f2399f4969e1b0965c5921d96a3e50ce9f
"Update README to link to new Rust port \(#95\)

Previous port had geometry inaccuracies.

Co-authored-by: Steve Ruiz <steveruizok@gmail.com>") | Feb 1, 2026 |  
| | | | Oct 5, 2021 |  
| | | [Modernize build tooling and dev infrastructure for 2026
(](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
"Modernize build tooling and dev infrastructure for 2026 \(#96\)

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5
<noreply@anthropic.com>")[#96](https://github.com/steveruizok/perfect-freehand/pull/96)[)](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
"Modernize build tooling and dev infrastructure for 2026 \(#96\)

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5 <noreply@anthropic.com>") | Feb 1, 2026 |  
| | | [Modernize build tooling and dev infrastructure for 2026
(](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
"Modernize build tooling and dev infrastructure for 2026 \(#96\)

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5
<noreply@anthropic.com>")[#96](https://github.com/steveruizok/perfect-freehand/pull/96)[)](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
"Modernize build tooling and dev infrastructure for 2026 \(#96\)

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5 <noreply@anthropic.com>") | Feb 1, 2026 |  
| | | | Oct 5, 2021 |  
| | | [Modernize build tooling and dev infrastructure for 2026
(](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
"Modernize build tooling and dev infrastructure for 2026 \(#96\)

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5
<noreply@anthropic.com>")[#96](https://github.com/steveruizok/perfect-freehand/pull/96)[)](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
"Modernize build tooling and dev infrastructure for 2026 \(#96\)

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5 <noreply@anthropic.com>") | Feb 1, 2026 |  
| | | [Modernize build tooling and dev infrastructure for 2026
(](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
"Modernize build tooling and dev infrastructure for 2026 \(#96\)

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5
<noreply@anthropic.com>")[#96](https://github.com/steveruizok/perfect-freehand/pull/96)[)](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
"Modernize build tooling and dev infrastructure for 2026 \(#96\)

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5 <noreply@anthropic.com>") | Feb 1, 2026 |  
| [perfect-freehand-card.png](https://github.com/steveruizok/perfect-freehand/blob/main/perfect-freehand-card.png "perfect-freehand-card.png")
|
[perfect-freehand-card.png](https://github.com/steveruizok/perfect-freehand/blob/main/perfect-freehand-card.png "perfect-freehand-card.png")
| | Sep 15, 2021 |  
| [perfect-freehand-logo.svg](https://github.com/steveruizok/perfect-freehand/blob/main/perfect-freehand-logo.svg "perfect-freehand-logo.svg")
|
[perfect-freehand-logo.svg](https://github.com/steveruizok/perfect-freehand/blob/main/perfect-freehand-logo.svg "perfect-freehand-logo.svg")
|
[Update perfect-freehand-logo.svg](https://github.com/steveruizok/perfect-freehand/commit/7e3a982cc7125b6436be7df8345a665601f546ca "Update perfect-freehand-logo.svg")
| Sep 15, 2021 |  
| | | | Oct 5, 2021 |  
| | | [Modernize build tooling and dev infrastructure for 2026
(](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
"Modernize build tooling and dev infrastructure for 2026 \(#96\)

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5
<noreply@anthropic.com>")[#96](https://github.com/steveruizok/perfect-freehand/pull/96)[)](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
"Modernize build tooling and dev infrastructure for 2026 \(#96\)

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5 <noreply@anthropic.com>") | Feb 1, 2026 |  
| | | [Modernize build tooling and dev infrastructure for 2026
(](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
"Modernize build tooling and dev infrastructure for 2026 \(#96\)

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5
<noreply@anthropic.com>")[#96](https://github.com/steveruizok/perfect-freehand/pull/96)[)](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
"Modernize build tooling and dev infrastructure for 2026 \(#96\)

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5 <noreply@anthropic.com>") | Feb 1, 2026 |  
| | | [Modernize build tooling and dev infrastructure for 2026
(](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
"Modernize build tooling and dev infrastructure for 2026 \(#96\)

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5
<noreply@anthropic.com>")[#96](https://github.com/steveruizok/perfect-freehand/pull/96)[)](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
"Modernize build tooling and dev infrastructure for 2026 \(#96\)

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5 <noreply@anthropic.com>") | Feb 1, 2026 |  
| | | [Modernize build tooling and dev infrastructure for 2026
(](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
"Modernize build tooling and dev infrastructure for 2026 \(#96\)

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5
<noreply@anthropic.com>")[#96](https://github.com/steveruizok/perfect-freehand/pull/96)[)](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
"Modernize build tooling and dev infrastructure for 2026 \(#96\)

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5 <noreply@anthropic.com>") | Feb 1, 2026 |  
| | | [Modernize build tooling and dev infrastructure for 2026
(](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
"Modernize build tooling and dev infrastructure for 2026 \(#96\)

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5
<noreply@anthropic.com>")[#96](https://github.com/steveruizok/perfect-freehand/pull/96)[)](https://github.com/steveruizok/perfect-freehand/commit/a2433b166608f1e36ca744a670cfc072a30ea4b2
"Modernize build tooling and dev infrastructure for 2026 \(#96\)

- Add CLAUDE.md and modernization todo list

Introduced CLAUDE.md to provide guidance for Claude Code and added todo.md outlining infrastructure
and tooling improvements for the repository. These additions document project architecture and
planned modernization tasks without affecting core algorithm code.

- Upgrade TypeScript from 4.4.2 to 5.7.0 with strict mode

* Update typescript to ^5.7.0 in all packages
* Update @types/node from ^15.0.1 to ^20.11.0
* Enable strict: true in tsconfig.base.json
* Remove deprecated importsNotUsedAsValues option
* Update target to ES2020 and lib to ES2021
* Fix type errors in controls.tsx for strict mode compatibility

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Replace Lerna with lazyrepo for task orchestration

* Remove lerna dependency and lerna.json configuration
* Add lazyrepo \(0.0.0-alpha.27\) for task orchestration and caching
* Create lazy.config.js with build, test, lint, and start tasks
* Update start script to use lazy run
* Update publish script to use npm publish directly
* Add .lazy to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade ESLint from 7.32.0 to 9.19.0 with flat config

* Update eslint to ^9.19.0
* Replace @typescript-eslint/parser and plugin with typescript-eslint ^8.23.0
* Migrate from .eslintrc.js to eslint.config.mjs \(flat config\)
* Add eslint-config-prettier to avoid formatting conflicts
* Fix unused import and expression issues in test file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate from Jest to Vitest for testing

* Replace Jest with Vitest ^3.0.0 for native ESM and TypeScript support
* Remove Jest, ts-jest, babel-jest, and all Babel dependencies
* Update @testing-library/jest-dom to ^6.6.0 \(Vitest compatible\)
* Add jsdom ^26.0.0 for DOM testing environment
* Create vitest.config.ts with jsdom environment and globals
* Update setupTests.ts to import from @testing-library/jest-dom/vitest
* Remove Jest types from tsconfig.base.json
* Update test snapshots to Vitest format

Tests now run in ~1.8s vs previous ~3s with Jest/ts-jest

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate library build from esbuild to Rolldown

* Replace custom esbuild scripts with Rolldown ^1.0.0-beta.1
* Create rolldown.config.mjs with dual CJS/ESM output
* Enable minification and source maps for both builds
* Add custom plugin to report bundle sizes
* Remove packages/perfect-freehand/scripts/build.js and dev.js
* Update lazy.config.js cache inputs

Build time: ~11ms, output: 3.73kb ESM \(1.74kb gzipped\)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Migrate dev app from esbuild to Vite

* Replace custom esbuild dev server with Vite ^6.0.0
* Create packages/dev/vite.config.ts with React plugin
* Configure path aliases for bare imports \(components, hooks, state\)
* Set dev server port to 5420 \(same as original\)
* Remove esbuild.config.mjs and related dependencies
* Update index.html to use Vite-style script imports

Dev server starts in ~100ms with instant HMR

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Modernize CI/CD pipeline with v4 actions and Node matrix

* Update actions/checkout and actions/setup-node to v4
* Replace Jest GitHub Action with direct Vitest execution
* Add Node.js version matrix testing \(18.x, 20.x, 22.x\)
* Add dependency caching via setup-node cache option
* Add branch filtering for main branch only
* Create publish.yml workflow for automated npm releases on GitHub release

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Extract Prettier config and add format scripts

* Move Prettier config from package.json to .prettierrc
* Add .prettierignore for dist, node_modules, lock files, etc.
* Add prettier ^3.4.0 as devDependency
* Add format and format:check scripts to package.json
* Add formatting check step to CI pipeline

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Upgrade TypeDoc from 0.21.9 to 0.28.0

* Update typedoc to ^0.28.0 in root and library package.json
* Create packages/perfect-freehand/typedoc.json with modern config
* Configure TypeDoc with navigation, sorting, and visibility options
* Add docs generation step to CI \(runs on Node 20.x only\)
* Simplify docs script to use config file

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- Add missing configuration files

* Add .editorconfig for consistent editor settings \(2-space indent, UTF-8\)
* Add .nvmrc pinning Node.js to version 20 \(LTS\)
* Add engines field to package.json \(>=18.0.0\)
* Add .github/dependabot.yml for automated dependency updates
    - Weekly schedule with grouped dependencies
    - Monitors both npm and GitHub Actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- build: upgrade Husky to 9.x with lint-staged and commitlint

* Update husky from ^7.0.0 to ^9.1.0
* Change postinstall to prepare script \(Husky 9 syntax\)
* Add lint-staged ^15.4.0 for faster pre-commit checks
* Add @commitlint/cli and @commitlint/config-conventional ^19.7.0
* Update pre-commit hook to run lint-staged instead of full test
* Add pre-push hook to run tests before push
* Add commit-msg hook for conventional commit linting
* Create commitlint.config.js extending conventional config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: update dev app dependencies to latest versions

* Update zustand from ^4.0.0-rc.1 to ^5.0.0
* Update @testing-library/react from ^12.0.0 to ^16.0.0
* Update @radix-ui/react-checkbox from ^0.1.0 to ^1.1.0
* Update @radix-ui/react-icons from ^1.0.3 to ^1.3.0
* Update @radix-ui/react-label from ^0.1.0 to ^2.1.0
* Update @radix-ui/react-slider from ^0.1.0 to ^1.2.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: clean up package.json files and remove unused dependencies

* Remove unused dependencies: cac, fake-indexeddb, tslib, @modulz/radix-icons
* Add packageManager field \(yarn@4.12.0\) for Corepack support
* Disable importHelpers since tslib was removed
* Remove unused fake-indexeddb import from setupTests.ts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- ci: add security audit job to CI pipeline

* Add separate audit job running yarn npm audit on Node 20.x
* Job runs in parallel with build matrix for efficiency
* No vulnerabilities found in current dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add Yarn 4 configuration with node-modules linker

* Add .yarnrc.yml configuring node-modules linker
* Add .yarn/install-state.gz to .gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- docs: update README for Dart port and fix API naming

Highlight the Dart port of the library and correct the API name from getOutlinePoints to
getStrokeOutlinePoints. Simplified the community ports section.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add tsbuildinfo to gitignore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): enable Corepack before setup-node for Yarn 4

The setup-node action with cache: 'yarn' runs yarn internally before any other steps, which fails
when packageManager field specifies Yarn 4. Enable Corepack first and use manual caching instead.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix: exclude test files from library tsconfig

Test files use Vitest globals which TypeScript doesn't know about. Vitest handles type-checking for
test files separately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- chore: add dev script to package.json

Introduces a 'dev' script that runs 'lazy run start' for development purposes.

- style: fix formatting and lint issues

* Format 16 files with Prettier
* Fix unused variable in rolldown config
* Add global console directive for ESLint flat config

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- fix\(ci\): require Node.js 20+ for rolldown compatibility

Rolldown uses `styleText` from `node:util` which was added in Node.js 20.1.0. Update CI matrix and
engines field accordingly.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract default pressure constants

Extract magic pressure values \(0.25 and 0.5\) to named constants DEFAULT_FIRST_PRESSURE and
DEFAULT_PRESSURE in constants.ts. Documents why first point uses lower pressure \(prevents fat
starts\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): extract unit offset constant

Extract magic vector \[1, 1\] to UNIT_OFFSET constant in constants.ts. Used as placeholder for
initial vector and for creating a second point when only one input point is provided.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokePoints\): add explicit pressure validation helper

Add isValidPressure\(\) type guard function that explicitly checks for undefined, NaN, and negative
pressure values. Makes the intent clearer compared to the implicit `>= 0` check which returns false
for undefined.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- perf\(getStrokePoints\): use mutable vector operation in hot loop

Use subInto with a scratch buffer for the vector difference calculation in the main loop to reduce
array allocations. The intermediate result from sub\(\) was being discarded after uni\(\) normalized
it.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor: use Vec2 type and optimize vector operations

- refactor\(getStrokeOutlinePoints\): rename cryptic variables

Improve readability by renaming single-letter and abbreviated variables:

- ts, te → taperStartStrength, taperEndStrength
- pl, pr → prevLeftPoint, prevRightPoint
- tl, tr → tempLeftPoint, tempRightPoint

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract cap generation helpers

Extract cap drawing logic into dedicated helper functions for clarity:

- drawDot\(\): generates circular dot for single-point strokes
- drawRoundStartCap\(\): generates rounded start cap
- drawFlatStartCap\(\): generates squared-off start cap
- drawRoundEndCap\(\): generates rounded end cap \(1.5 turns\)
- drawFlatEndCap\(\): generates squared-off end cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract taper distance calculation

Replace nested ternary expressions for taper calculation with a dedicated computeTaperDistance\(\)
helper function. Improves readability and documents the three possible taper option values \(false,
true, number\).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- refactor\(getStrokeOutlinePoints\): extract initial pressure and add isLastPoint

* Add computeInitialPressure\(\) helper to encapsulate the pressure averaging logic that prevents
  fat starts
* Add isLastPoint variable in loop to replace repeated i === points.length - 1 checks, improving
  readability

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

- feat: add Vitest benchmark support and stroke benchmarks

Introduces 'bench' scripts to root and perfect-freehand package.json files and configures Vitest to
include benchmark files. Adds a comprehensive stroke.bench.ts for benchmarking stroke-related
functions with various datasets and options.

---

Co-authored-by: Claude Opus 4.5 <noreply@anthropic.com>") | Feb 1, 2026 |  
| | | | Feb 1, 2026 |  
| View all files |  
Draw perfect pressure-sensitive freehand lines. 🔗 Curious? Try out a
[demo](https://perfect-freehand-example.vercel.app/). 💅 Designer? Check out the
[Figma Plugin](https://www.figma.com/community/plugin/950892731860805817). 🕊 This library is written
in TypeScript but are community ports in:

- ...and probably more. Make a pull request!

💕 Love this library? Consider
[becoming a sponsor](https://github.com/sponsors/steveruizok?frequency=recurring&sponsor=steveruizok).

## Table of Contents

- [Documentation](https://github.com/steveruizok/perfect-freehand#documentation)

## Installation

```
npm install perfect-freehand
```

or

```
yarn add perfect-freehand
```

## Introduction

This package exports a function named `getStroke` that will generate the points for a polygon based
on an array of points. To do this work, `getStroke` first creates a set of spline points (red) based
on the input points (grey) and then creates outline points (blue). You can render the result any way
you like, using whichever technology you prefer.

## Usage

To use this library, import the `getStroke` function and pass it an array of **input points** , such
as those recorded from a user's mouse movement. The `getStroke` function will return a new array of
**outline points**. These outline points will form a polygon (called a "stroke") that surrounds the
input points.

```
import { getStroke } from 'perfect-freehand'

const inputPoints = [
  [0, 0],
  [10, 5],
  [20, 8],
  // ...
]

const outlinePoints = getStroke(inputPoints)
```

You then can **render** your stroke points using your technology of choice. See the
[Rendering](https://github.com/steveruizok/perfect-freehand#rendering) section for examples in SVG
and HTML Canvas. You can **customize** the appearance of the stroke shape by passing `getStroke` a
second parameter: an options object containing one or more options. See the
[Options](https://github.com/steveruizok/perfect-freehand#options) section for a full list of
available options.

```
const stroke = getStroke(myPoints, {
  size: 32,
  thinning: 0.7,
})
```

The appearance of a stroke is effected by the **pressure** associated with each input point. By
default, the `getStroke` function will simulate pressure based on the distance between input points.
To use **real pressure** , such as that from a pen or stylus, provide the pressure as the third
number for each input point, and set the `simulatePressure` option to `false`.

```
const inputPoints = [
  [0, 0, 0.5],
  [10, 5, 0.7],
  [20, 8, 0.8],
  // ...
]

const outlinePoints = getStroke(inputPoints, {
  simulatePressure: false,
})
```

In addition to providing points as an array of arrays, you may also provide your points as an
**array of objects** as show in the example below. In both cases, the value for pressure is optional
(it will default to `.5`).

```
const inputPoints = [
  { x: 0, y: 0, pressure: 0.5 },
  { x: 10, y: 5, pressure: 0.7 },
  { x: 20, y: 8, pressure: 0.8 },
  // ...
]

const outlinePoints = getStroke(inputPoints, {
  simulatePressure: false,
})
```

**Note:** Internally, the `getStroke` function will convert your object points to array points,
which will have an effect on performance. If you're using this library ambitiously and want to
format your points as objects, consider modifying this library's `getStrokeOutlinePoints` to use the
object syntax instead (e.g. replacing all `[0]` with `.x`, `[1]` with `.y`, and `[2]` with
`.pressure`).

## Example

```
import * as React from 'react'
import { getStroke } from 'perfect-freehand'
import { getSvgPathFromStroke } from './utils'

export default function Example() {
  const [points, setPoints] = React.useState([])

  function handlePointerDown(e) {
    e.target.setPointerCapture(e.pointerId)
    setPoints([[e.pageX, e.pageY, e.pressure]])
  }

  function handlePointerMove(e) {
    if (e.buttons !== 1) return
    setPoints([...points, [e.pageX, e.pageY, e.pressure]])
  }

  const stroke = getStroke(points, {
    size: 16,
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
  })

  const pathData = getSvgPathFromStroke(stroke)

  return (
    svg
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      style={{ touchAction: 'none' }}

      {points  path d={pathData} />}
    </svg
  )
}
```

> **Tip:** For implementations in Typescript, see the example project included in this repository.

## Documentation

### Options

The options object is optional, as are each of its properties.

| Property                                                                                                                            | Type              | Default                                     | Description                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `size`                                                                                                                              | number            | 8                                           | The base size (diameter) of the stroke.                                                  |
| `thinning`                                                                                                                          | number            | .5                                          | The effect of pressure on the stroke's size.                                             |
| `smoothing`                                                                                                                         | number            | .5                                          | How much to soften the stroke's edges.                                                   |
| `streamline`                                                                                                                        | number            | .5                                          | How much to streamline the stroke.                                                       |
| `simulatePressure`                                                                                                                  | boolean           | true                                        | Whether to simulate pressure based on velocity.                                          |
| `easing`                                                                                                                            | function          | t => t                                      | An easing function to apply to each point's pressure.                                    |
| `start`                                                                                                                             | { }               | Tapering options for the start of the line. |
| `end`                                                                                                                               | { }               | Tapering options for the end of the line.   |
| `last`                                                                                                                              | boolean           | true                                        | Whether the stroke is complete.                                                          |
| **Note:** When the `last` property is `true`, the line's end will be drawn at the last input point, rather than slightly behind it. |
| The `start` and `end` options accept an object:                                                                                     |
| Property                                                                                                                            | Type              | Default                                     | Description                                                                              |
| ---                                                                                                                                 | ---               | ---                                         | ---                                                                                      |
| `cap`                                                                                                                               | boolean           | true                                        | Whether to draw a cap.                                                                   |
| `taper`                                                                                                                             | number or boolean | 0                                           | The distance to taper. If set to true, the taper will be the total length of the stroke. |
| `easing`                                                                                                                            | function          | t => t                                      | An easing function for the tapering effect.                                              |
| **Note:** The `cap` property has no effect when `taper` is more than zero.                                                          |

```
getStroke(myPoints, {
  size: 8,
  thinning: 0.5,
  smoothing: 0.5,
  streamline: 0.5,
  easing: (t) => t,
  simulatePressure: true,
  last: true,
  start: {
    cap: true,
    taper: 0,
    easing: (t) => t,
  },
  end: {
    cap: true,
    taper: 0,
    easing: (t) => t,
  },
})
```

> **Tip:** To create a stroke with a steady line, set the `thinning` option to `0`. **Tip:** To
> create a stroke that gets thinner with pressure instead of thicker, use a negative number for the
> `thinning` option.

### Other Exports

For advanced usage, the library also exports smaller functions that `getStroke` uses to generate its
outline points.

#### `getStrokePoints`

A function that accepts an array of points (formatted either as `[x, y, pressure]` or
`{ x: number, y: number, pressure: number}`) and (optionally) an options object. Returns a set of
adjusted points as `{ point, pressure, vector, distance, runningLength }`. The path's total length
will be the `runningLength` of the last point in the array.

```
import { getStrokePoints } from 'perfect-freehand'
import samplePoints from "./samplePoints.json'

const strokePoints = getStrokePoints(samplePoints)
```

#### `getStrokeOutlinePoints`

A function that accepts an array of points (formatted as
`{ point, pressure, vector, distance, runningLength }`, i.e. the output of `getStrokePoints`) and
(optionally) an options object, and returns an array of points (`[x, y]`) defining the outline of a
pressure-sensitive stroke.

```
import { getStrokePoints, getStrokeOutlinePoints } from 'perfect-freehand'
import samplePoints from "./samplePoints.json'

const strokePoints = getStrokePoints(samplePoints)

const outlinePoints = getStrokeOutlinePoints(strokePoints)
```

**Note:** Internally, the `getStroke` function passes the result of `getStrokePoints` to
`getStrokeOutlinePoints`, just as shown in this example. This means that, in this example, the
result of `outlinePoints` will be the same as if the `samplePoints` array had been passed to
`getStroke`.

#### `StrokeOptions`

A TypeScript type for the options object. Useful if you're defining your options outside of the
`getStroke` function.

```
import { StrokeOptions, getStroke } from 'perfect-freehand'

const options: StrokeOptions = {
  size: 16,
}

const stroke = getStroke(options)
```

## Tips & Tricks

### Freehand Anything

While this library was designed for rendering the types of input points generated by the movement of
a human hand, you can pass any set of points into the library's functions. For example, here's what
you get when running [Feather Icons](https://feathericons.com/) through `getStroke`.

### Rendering

While `getStroke` returns an array of points representing the outline of a stroke, it's up to you to
decide how you will render these points. The function below will turn the points returned by
`getStroke` into SVG path data.

```
const average = (a, b) => (a + b) / 2

function getSvgPathFromStroke(points, closed = true) {
  const len = points.length

  if (len  4) {
    return ``
  }

  let a = points[0]
  let b = points[1]
  const c = points[2]

  let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(

,${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(


  ).toFixed(2)} T`

  for (let i = 2, max = len - 1; i  max; i++) {
    a = points[i]
    b = points[i + 1]
    result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(


  }

  if (closed) {
    result += 'Z'
  }

  return result
}
```

To use this function, first run your input points through `getStroke`, then pass the result to
`getSvgPathFromStroke`.

```
const outlinePoints = getStroke(inputPoints)

const pathData = getSvgPathFromStroke(outlinePoints)
```

You could then pass this string of SVG path data either to an
[SVG path](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d) element:

```
path d={pathData} />
```

Or, if you are rendering with HTML Canvas, you can pass the string to a
[`Path2D` constructor](https://developer.mozilla.org/en-US/docs/Web/API/Path2D/Path2D#using_svg_paths)).

```
const myPath = new Path2D(pathData)

ctx.fill(myPath)
```

### Flattening

By default, the polygon's paths include self-crossings. You may wish to remove these crossings and
render a stroke as a "flattened" polygon. To do this, install the
[`polygon-clipping`](https://github.com/mfogel/polygon-clipping) package and use the following
function together with the `getSvgPathFromStroke`.

```
import polygonClipping from 'polygon-clipping'

function getFlatSvgPathFromStroke(stroke) {
  const faces = polygonClipping.union([stroke])

  const d = []

  faces.forEach((face) =>
    face.forEach((points) => {
      d.push(getSvgPathFromStroke(points))
    })
  )

  return d.join(' ')
}
```

## Development & Contributions

To work on this library:

- clone this repo
- run `yarn` in the folder root to install dependencies
- run `yarn start` to start the local development server

The development server is located at `packages/dev`. The library and its tests are located at
`packages/perfect-freehand`. Pull requests are very welcome!

## Community

### Support

Need help? Please [open an issue](https://github.com/steveruizok/perfect-freehand/issues/new) for
support.

### Discussion

Have an idea or casual question? Visit the
[discussion page](https://github.com/steveruizok/perfect-freehand/discussions).

### License

- MIT
- ...but if you're using `perfect-freehand` in a commercial product, consider
  [becoming a sponsor](https://github.com/sponsors/steveruizok?frequency=recurring&sponsor=steveruizok).
  💰

## Author

## About

Draw perfect pressure-sensitive freehand lines.
[drawing](https://github.com/topics/drawing)[graphics](https://github.com/topics/graphics)[html-canvas](https://github.com/topics/html-canvas)[lines](https://github.com/topics/lines)[pressure](https://github.com/topics/pressure)[stroke](https://github.com/topics/stroke)[svg](https://github.com/topics/svg)[variable-width](https://github.com/topics/variable-width)
**5.8k** stars **19** watching [ forks](https://github.com/steveruizok/perfect-freehand/forks)

## Sponsor this project

- [**steveruizok**](https://github.com/steveruizok) Steve RuizSponsor @steveruizok

[Learn more about GitHub Sponsors](https://github.com/sponsors)

##

[+ 30,027](https://github.com/steveruizok/perfect-freehand/network/dependents)

##

## Languages

- [HTML53.1%](https://github.com/steveruizok/perfect-freehand/search?l=html)
- [TypeScript42.9%](https://github.com/steveruizok/perfect-freehand/search?l=typescript)
- [CSS2.2%](https://github.com/steveruizok/perfect-freehand/search?l=css)
- [JavaScript1.8%](https://github.com/steveruizok/perfect-freehand/search?l=javascript)

You can’t perform that action at this time.

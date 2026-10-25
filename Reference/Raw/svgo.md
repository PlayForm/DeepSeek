[**6** Branches](https://github.com/svg/svgo/branches)[**113** Tags](https://github.com/svg/svgo/tags)
Go to file Open more actions menu and
[chore(regression): make screenshots deterministic and stop ignoring f…](https://github.com/svg/svgo/commit/96e756b1c5aedeb3d6b8532033060bcd17bbb76e)
Open commit detailssuccess Oct 24, 2026
[96e756b](https://github.com/svg/svgo/commit/96e756b1c5aedeb3d6b8532033060bcd17bbb76e) · Oct 24,
2026 [1,649 Commits](https://github.com/svg/svgo/commits/main/) Open commit details 1,649 Commits

| Name                                                                                                                                                                                                                                           | Name        | Last commit message | Last commit date |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------- | ---------------- |
|                                                                                                                                                                                                                                                |             |                     | Aug 24, 2026     |
| [chore: convert project to us ECMAScript modules (preserving CJS compa…](https://github.com/svg/svgo/commit/2442f742398f6c40bcf83b5c34e4a71a023adae1 "chore: convert project to us ECMAScript modules (preserving CJS compatibility) (#1905)") | Jan 3, 2024 |
| [fix(removeScripts): sanitize foreignObject content (](https://github.com/svg/svgo/commit/fd51e474a300417d9361d9302d596b1763146327 "fix\(removeScripts\): sanitize foreignObject content \(#2264\)                                             |

## Summary

- preserve visual HTML inside SVG `foreignObject` elements
- remove `srcdoc`, all HTML `on*` event attributes, and executable URLs from active HTML URL
  attributes
- continue removing SVG and XHTML `script` elements
- add namespace-aware regression coverage and documentation

## Security

Addresses
\[GHSA-4vpr-x523-8j87\]\(https://github.com/svg/svgo/security/advisories/GHSA-4vpr-x523-8j87\).

Rather than removing the entire `foreignObject`, this strips known execution paths while retaining
non-executable HTML and visual content.

## Validation

- `pnpm test` — 1,555 passed, 9 skipped
- `pnpm typecheck`
- ESLint
- Prettier
- `git diff --check`")[#2264](https://github.com/svg/svgo/pull/2264)[)](https://github.com/svg/svgo/commit/fd51e474a300417d9361d9302d596b1763146327
  "fix\(removeScripts\): sanitize foreignObject content \(#2264\)

## Summary

- preserve visual HTML inside SVG `foreignObject` elements
- remove `srcdoc`, all HTML `on*` event attributes, and executable URLs from active HTML URL
  attributes
- continue removing SVG and XHTML `script` elements
- add namespace-aware regression coverage and documentation

## Security

Addresses
\[GHSA-4vpr-x523-8j87\]\(https://github.com/svg/svgo/security/advisories/GHSA-4vpr-x523-8j87\).

Rather than removing the entire `foreignObject`, this strips known execution paths while retaining
non-executable HTML and visual content.

## Validation

- `pnpm test` — 1,555 passed, 9 skipped
- `pnpm typecheck`
- ESLint
- Prettier
- `git diff --check`") | Aug 22, 2026 |  
  | [perf: cache parsed inline style declarations
  (](https://github.com/svg/svgo/commit/68c0660ad3c95f3a6f2aa7fd24e7236bb9ed61ce "perf: cache parsed
  inline style declarations \(#2281\)

## Summary

Cache parsed inline style declarations by their exact `style` attribute string for the lifetime of
an AST.

**Overall, this improves end-to-end SVG optimization time by 20% on the 4,592-icon benchmark
\(186.94s → 149.55s\), increasing throughput by approximately 25% \(24.6 → 30.7 SVGs/sec\).**

Nine default plugins collect their own stylesheet snapshot. Previously, every style computation
reparsed inline declarations with `css-tree`, including repeated ancestor computations. The new
cache is shared by all stylesheet snapshots for the same AST.

The cache stores declarations rather than computed styles. Updated style attributes use a different
string key, while selectors, presentation attributes, and inheritance continue to be computed
normally. The cache is released with its AST through a `WeakMap`.

## Alternatives explored

A deterministic 460-icon sample was used to compare cache strategies:

| Variant                                 | Runtime | Style CPU | Inline parsing | Runtime change |
| --------------------------------------- | ------: | --------: | -------------: | -------------: |
| Baseline                                |  36.45s |     9.60s |          6.44s |              — |
| Per stylesheet/value                    |  30.16s |     4.23s |          1.21s |         -17.3% |
| Per node                                |  28.92s |     3.91s |          0.95s |         -20.7% |
| Per node + inherited-property filtering |  29.54s |     3.79s |          1.03s |
| -19.0%                                  |
| **Per AST/value**                       |  29.49s | **3.24s** |      **0.38s** |         -19.1% |

The AST/value variant had the lowest style-processing cost and avoids stale data after attribute
updates.

## Full benchmark

Benchmark configuration:

- SVGO Test Suite `77ba065b4e4b4902c8795921287f9cf7`
- all 4,592 Charm and Oxygen icon fixtures
- default preset, single pass, `floatPrecision: 4`
- two workers
- Node.js 22.23.2 on Linux x86-64
- CPU timings summed across workers

| Metric                 |  Before |   After |                Change |
| ---------------------- | ------: | ------: | --------------------: |
| Wall time              | 186.94s | 149.55s |            **-20.0%** |
| Profiled CPU           | 371.74s | 297.27s |            **-20.0%** |
| Style computation      |  98.87s |  29.63s |            **-70.0%** |
| Stylesheet collection  |   3.95s |   4.00s | effectively unchanged |
| Total style processing | 102.82s |  33.63s |            **-67.3%** |

### Memory

The regression optimization step already records peak RSS as `metrics.peakMemoryAlloc` using
`process.resourceUsage\(\).maxRSS`. I repeated the same 4,592-icon, two-worker benchmark without the
CPU profiler to compare that metric:

| Metric    |     Before |      After |     Change |
| --------- | ---------: | ---------: | ---------: |
| Wall time |    191.97s |    154.71s | **-19.4%** |
| Peak RSS  | 763.41 MiB | 692.12 MiB |  **-9.3%** |

### Plugin impact

| Plugin | Before | After | Change | Style CPU before | Style CPU after | | --- | ---: | ---: | ---:
| ---: | ---: | | `convertPathData` | 73.06s | 61.51s | -15.8% | 13.05s | 2.95s | |
`removeHiddenElems` | 59.97s | 28.62s | **-52.3%** | 42.32s | 12.78s | | `mergePaths` | 28.33s |
18.77s | **-33.7%** | 11.02s | 2.04s | | `removeUselessStrokeAndFill` | 26.14s | 13.32s | **-49.0%**
| 21.28s | 8.87s | | `removeUnknownsAndDefaults` | 13.80s | 7.65s | **-44.6%** | 9.93s | 4.28s | |
`removeEmptyContainers` | 6.81s | 4.51s | -33.8% | 3.49s | 1.44s | | `collapseGroups` | 1.46s |
1.08s | -26.4% | 0.82s | 0.40s |

A deterministic 460-file output comparison against the baseline found no differences.

## Tests

- `pnpm typecheck`
- `pnpm exec vitest run lib/style.test.js test/plugins/_index.test.js --exclude '.worktrees/**'`
  \(386 tests\)
- ESLint and Prettier on changed
  files")[#2281](https://github.com/svg/svgo/pull/2281)[)](https://github.com/svg/svgo/commit/68c0660ad3c95f3a6f2aa7fd24e7236bb9ed61ce
  "perf: cache parsed inline style declarations \(#2281\)

## Summary

Cache parsed inline style declarations by their exact `style` attribute string for the lifetime of
an AST.

**Overall, this improves end-to-end SVG optimization time by 20% on the 4,592-icon benchmark
\(186.94s → 149.55s\), increasing throughput by approximately 25% \(24.6 → 30.7 SVGs/sec\).**

Nine default plugins collect their own stylesheet snapshot. Previously, every style computation
reparsed inline declarations with `css-tree`, including repeated ancestor computations. The new
cache is shared by all stylesheet snapshots for the same AST.

The cache stores declarations rather than computed styles. Updated style attributes use a different
string key, while selectors, presentation attributes, and inheritance continue to be computed
normally. The cache is released with its AST through a `WeakMap`.

## Alternatives explored

A deterministic 460-icon sample was used to compare cache strategies:

| Variant                                 | Runtime | Style CPU | Inline parsing | Runtime change |
| --------------------------------------- | ------: | --------: | -------------: | -------------: |
| Baseline                                |  36.45s |     9.60s |          6.44s |              — |
| Per stylesheet/value                    |  30.16s |     4.23s |          1.21s |         -17.3% |
| Per node                                |  28.92s |     3.91s |          0.95s |         -20.7% |
| Per node + inherited-property filtering |  29.54s |     3.79s |          1.03s |
| -19.0%                                  |
| **Per AST/value**                       |  29.49s | **3.24s** |      **0.38s** |         -19.1% |

The AST/value variant had the lowest style-processing cost and avoids stale data after attribute
updates.

## Full benchmark

Benchmark configuration:

- SVGO Test Suite `77ba065b4e4b4902c8795921287f9cf7`
- all 4,592 Charm and Oxygen icon fixtures
- default preset, single pass, `floatPrecision: 4`
- two workers
- Node.js 22.23.2 on Linux x86-64
- CPU timings summed across workers

| Metric                 |  Before |   After |                Change |
| ---------------------- | ------: | ------: | --------------------: |
| Wall time              | 186.94s | 149.55s |            **-20.0%** |
| Profiled CPU           | 371.74s | 297.27s |            **-20.0%** |
| Style computation      |  98.87s |  29.63s |            **-70.0%** |
| Stylesheet collection  |   3.95s |   4.00s | effectively unchanged |
| Total style processing | 102.82s |  33.63s |            **-67.3%** |

### Memory

The regression optimization step already records peak RSS as `metrics.peakMemoryAlloc` using
`process.resourceUsage\(\).maxRSS`. I repeated the same 4,592-icon, two-worker benchmark without the
CPU profiler to compare that metric:

| Metric    |     Before |      After |     Change |
| --------- | ---------: | ---------: | ---------: |
| Wall time |    191.97s |    154.71s | **-19.4%** |
| Peak RSS  | 763.41 MiB | 692.12 MiB |  **-9.3%** |

### Plugin impact

| Plugin | Before | After | Change | Style CPU before | Style CPU after | | --- | ---: | ---: | ---:
| ---: | ---: | | `convertPathData` | 73.06s | 61.51s | -15.8% | 13.05s | 2.95s | |
`removeHiddenElems` | 59.97s | 28.62s | **-52.3%** | 42.32s | 12.78s | | `mergePaths` | 28.33s |
18.77s | **-33.7%** | 11.02s | 2.04s | | `removeUselessStrokeAndFill` | 26.14s | 13.32s | **-49.0%**
| 21.28s | 8.87s | | `removeUnknownsAndDefaults` | 13.80s | 7.65s | **-44.6%** | 9.93s | 4.28s | |
`removeEmptyContainers` | 6.81s | 4.51s | -33.8% | 3.49s | 1.44s | | `collapseGroups` | 1.46s |
1.08s | -26.4% | 0.82s | 0.40s |

A deterministic 460-file output comparison against the baseline found no differences.

## Tests

- `pnpm typecheck`
- `pnpm exec vitest run lib/style.test.js test/plugins/_index.test.js --exclude '.worktrees/**'`
  \(386 tests\)
- ESLint and Prettier on changed files") | Aug 25, 2026 |  
  | [Remove the executable flag from files. (](https://github.com/svg/svgo/commit/21d24006fd1bc97e6a47723d983b0b428d50a7a9 "Remove the executable flag from files. (#1439)")[#1439](https://github.com/svg/svgo/pull/1439)[)](https://github.com/svg/svgo/commit/21d24006fd1bc97e6a47723d983b0b428d50a7a9 "Remove the executable flag from files. (#1439)")
  | Mar 20, 2021 |  
  | | | | Aug 15, 2026 |  
  | | | [perf: compile removeAttrs patterns once per run
  (](https://github.com/svg/svgo/commit/7dac404f83608ab552c6e784e8dfa3ad04264b28 "perf: compile
  removeAttrs patterns once per run \(#2284\)

We saw some minor slowdowns when benchmarking our SVG icons workflow with complex SVGs. This is one
of two hot paths that recompile static patterns per element; split out from #2279 so each can be
reviewed and tested in isolation. The other half is https://github.com/svg/svgo/pull/2283.

Pure performance change: no API change, no config change, byte-identical output.

The element, name and value regexes in `removeAttrs` were built inside the element visitor,
recompiling every configured pattern for every element in the document, though the patterns come
from static config. Moved to plugin init.

Adds two fixtures covering the paths the hoisting touches: multi-pattern element/name/value
matching, and the `elemSeparator` form.

## Benchmarks

600-element document where every element carries all four target attributes, so the name and value
matching paths actually run. Node 24, best of 15.

| Case                                  | before       | after        |     |
| ------------------------------------- | ------------ | ------------ | --- |
| `removeAttrs`, 600 elems × 4 patterns | 9.32–9.72 ms | 5.65–6.08 ms |
| ~1.6×                                 |

Range is across three alternating before/after rounds on the same machine.

<details>
<summary>Benchmark script \(repo root, <code>node
bench-pr.mjs</code>\)</summary>

```js
import { optimize } from './lib/svgo.js';

const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">` +
      Array.from\(
              { length: 600 },
              \(_, i\) =>
                      `<path fill="red" stroke="blue" class="st0" style="opacity:1" d="M${i % 32} ${Math.floor\(i / 32\) % 32}h4v4h-4z"/>`,
      \).join\(''\) +
      `</svg>`;

const config = {
      plugins: \[
              {
                      name: 'removeAttrs',
                      params: { attrs: \['fill', 'stroke', 'class', 'style'\] },
              },
      \],
};

for \(let i = 0; i < 50; i++\) optimize\(svg, config\);

let best = Infinity;
for \(let r = 0; r < 15; r++\) {
      const t = performance.now\(\);
      for \(let i = 0; i < 40; i++\) optimize\(svg, config\);
      best = Math.min\(best, \(performance.now\(\) - t\) / 40\);
}
console.log\(`removeAttrs 600 elems x 4 patterns: ${best.toFixed\(2\)} ms`\);
```

</details>")[#2284](https://github.com/svg/svgo/pull/2284)[)](https://github.com/svg/svgo/commit/7dac404f83608ab552c6e784e8dfa3ad04264b28 "perf: compile removeAttrs patterns once per run \(#2284\)

We saw some minor slowdowns when benchmarking our SVG icons workflow with complex SVGs. This is one
of two hot paths that recompile static patterns per element; split out from #2279 so each can be
reviewed and tested in isolation. The other half is https://github.com/svg/svgo/pull/2283.

Pure performance change: no API change, no config change, byte-identical output.

The element, name and value regexes in `removeAttrs` were built inside the element visitor,
recompiling every configured pattern for every element in the document, though the patterns come
from static config. Moved to plugin init.

Adds two fixtures covering the paths the hoisting touches: multi-pattern element/name/value
matching, and the `elemSeparator` form.

## Benchmarks

600-element document where every element carries all four target attributes, so the name and value
matching paths actually run. Node 24, best of 15.

| Case                                  | before       | after        |     |
| ------------------------------------- | ------------ | ------------ | --- |
| `removeAttrs`, 600 elems × 4 patterns | 9.32–9.72 ms | 5.65–6.08 ms |
| ~1.6×                                 |

Range is across three alternating before/after rounds on the same machine.

<details>
<summary>Benchmark script \(repo root, <code>node
bench-pr.mjs</code>\)</summary>

```js
import { optimize } from './lib/svgo.js';

const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">` +
      Array.from\(
              { length: 600 },
              \(_, i\) =>
                      `<path fill="red" stroke="blue" class="st0" style="opacity:1" d="M${i % 32} ${Math.floor\(i / 32\) % 32}h4v4h-4z"/>`,
      \).join\(''\) +
      `</svg>`;

const config = {
      plugins: \[
              {
                      name: 'removeAttrs',
                      params: { attrs: \['fill', 'stroke', 'class', 'style'\] },
              },
      \],
};

for \(let i = 0; i < 50; i++\) optimize\(svg, config\);

let best = Infinity;
for \(let r = 0; r < 15; r++\) {
      const t = performance.now\(\);
      for \(let i = 0; i < 40; i++\) optimize\(svg, config\);
      best = Math.min\(best, \(performance.now\(\) - t\) / 40\);
}
console.log\(`removeAttrs 600 elems x 4 patterns: ${best.toFixed\(2\)} ms`\);
```

</details>")  | Aug 25, 2026  |  
|   |   |  [chore: revamp how we export types (](https://github.com/svg/svgo/commit/747cc722d933cb49058eb32b494acd43b6a4ad03 "chore: revamp how we export types \(#2118\)")[#2118](https://github.com/svg/svgo/pull/2118)[)](https://github.com/svg/svgo/commit/747cc722d933cb49058eb32b494acd43b6a4ad03 "chore: revamp how we export types \(#2118\)")  | May 4, 2025  |  
| [chore(regression): make screenshots deterministic and stop ignoring f…](https://github.com/svg/svgo/commit/96e756b1c5aedeb3d6b8532033060bcd17bbb76e "chore\(regression\): make screenshots deterministic and stop ignoring files \(#2313\)

## Summary

- pause the SMIL timeline at t=0 before taking each regression screenshot
- launch Chromium with `--disable-lcd-text`
- include both in the screenshot cache key
- empty `ignore.txt`: none of its files are nondeterministic anymore
- update `expect-mismatch.txt` to match

## Motivation

`ignore.txt` says its files "sometimes pass, sometimes fail, we'll figure out why eventually". 80 of
its 81 files contain SMIL animations \(the 78 `animate-*` files, plus `filters-composite-05-f` and
`filters-light-04-f`\). Playwright's `animations: 'disabled'` only affects CSS animations and
transitions, so SMIL keeps running on the wall clock and each screenshot captures whatever frame is
current \(SMIL time 0.075–1.66s in local measurements\). The original and optimized SVGs are
captured at different moments, so the result depends on runner load. The screenshot cache then hides
this, since one random sample gets reused until the cache key changes.

Freezing the timeline makes every animated file deterministic:

- 60 match at t=0, so they no longer need an entry
- 20 mismatch at t=0 and move to `expect-mismatch.txt`

`filters-conv-05-f.svg` \("strange artifact inconsistently breaks regression tests"\) is the
remaining entry. It has no animation, and its artifact no longer reproduces, so it's removed.

LCD \(subpixel\) text antialiasing is toggled by Chromium based on layer contents. For example,
converting a `<rect>` to a `<path>` can switch unrelated text from LCD to grayscale antialiasing. 29
entries in `expect-mismatch.txt` only mismatched because of this, and they match with
`--disable-lcd-text`.

Freezing at t=0 only checks the first frame. Some animated files only break later in the animation,
mostly because `convertShapeToPath` converts shapes with animated geometry \(#1634\). Checking
several timestamps would catch those, but it's a separate change.

## Verification

- full regression pipeline, run twice on `ubuntu-latest` from this branch, with identical results
  both times: 4,995 / 4,995 match, 130 / 130 expected mismatches, 0 ignored, no errors \(the
  optimize step needed `--max-old-space-size=3584` there because those runners only had 8 GB\)
- `pnpm test` \(520 passed, 3 skipped\)
- `pnpm lint`, `pnpm typecheck`, `pnpm spellcheck`
- `git diff --check`

Changing the cache key means the first run after merging re-renders every screenshot instead of
reusing cached ones.

🤖 Generated with \[Claude Code\]\(https://claude.com/claude-code\)

Co-authored-by: Claude Opus 5.5 <noreply@anthropic.com>") | Oct 24, 2026 |  
| | | [chore: migrate package management to pnpm
(](https://github.com/svg/svgo/commit/1f5faf541281beb8ccf5fae31cd3ca0b1afcd6e0 "chore: migrate
package management to pnpm \(#2243\)

## Summary

- replace Yarn 3 and its TypeScript compatibility workaround with pnpm 10
- migrate scripts, CI caching, publishing, and contributor documentation to pnpm
- preserve the patched `sax@1.5.0` dependency and Node.js 16 runtime coverage
- quarantine newly published dependency versions for seven days, with exact bootstrap exemptions for
  versions already reviewed on `main`

## Testing

- `pnpm install --frozen-lockfile`
- `pnpm lint`
- `pnpm spellcheck`
- `pnpm test:types`
- `pnpm test`
- `pnpm test:bundles`
- `pnpm publish --dry-run --no-git-checks` \(package build and tarball validation; registry rejected
  the already-published `4.0.2` version as
  expected\)")[#2243](https://github.com/svg/svgo/pull/2243)[)](https://github.com/svg/svgo/commit/1f5faf541281beb8ccf5fae31cd3ca0b1afcd6e0
  "chore: migrate package management to pnpm \(#2243\)

## Summary

- replace Yarn 3 and its TypeScript compatibility workaround with pnpm 10
- migrate scripts, CI caching, publishing, and contributor documentation to pnpm
- preserve the patched `sax@1.5.0` dependency and Node.js 16 runtime coverage
- quarantine newly published dependency versions for seven days, with exact bootstrap exemptions for
  versions already reviewed on `main`

## Testing

- `pnpm install --frozen-lockfile`
- `pnpm lint`
- `pnpm spellcheck`
- `pnpm test:types`
- `pnpm test`
- `pnpm test:bundles`
- `pnpm publish --dry-run --no-git-checks` \(package build and tarball validation; registry rejected
  the already-published `4.0.2` version as expected\)") | Aug 10, 2026 |  
  | | | [chore: cache regression screenshots
  (](https://github.com/svg/svgo/commit/4e9b9aed2a4607cf28025871151421d5bfe86484 "chore: cache
  regression screenshots \(#2267\)

## Summary

- cache rendering is down to zero, whole regression is 17min -> 7min
- cache Chromium screenshots by renderer, test-suite version, fixture name, and optimized SVG
  checksum
- skip Chromium rendering whenever the corresponding PNG already exists
- store local regression data under the repository `.cache` directory instead of the system
  temporary directory
- restore compatible screenshot caches in CI with `actions/cache`
- use one regression workflow for both PR validation and the canonical main-branch report

No separate cache manifest is required: the screenshot path itself identifies the exact input and
rendering environment. Original screenshots are shared for a fixture, while each distinct optimized
checksum gets its own cached PNG. The comparison phase continues to process all fixtures and remains
the source of regression results.

On pull requests, the workflow uploads a short-lived commit report and compares it with main. On
pushes to main, the same workflow uploads the stable `svgo-test-report` baseline.

## Verification

- `pnpm test` \(1,548 passed, 9 skipped\)
- `pnpm typecheck`
- focused ESLint and Prettier checks
- Chromium smoke test confirming both screenshot files are preserved and reused

The full regression corpus was left for CI because it requires downloading and processing roughly
1.3 GB of
fixtures.")[#2267](https://github.com/svg/svgo/pull/2267)[)](https://github.com/svg/svgo/commit/4e9b9aed2a4607cf28025871151421d5bfe86484
"chore: cache regression screenshots \(#2267\)

## Summary

- cache rendering is down to zero, whole regression is 17min -> 7min
- cache Chromium screenshots by renderer, test-suite version, fixture name, and optimized SVG
  checksum
- skip Chromium rendering whenever the corresponding PNG already exists
- store local regression data under the repository `.cache` directory instead of the system
  temporary directory
- restore compatible screenshot caches in CI with `actions/cache`
- use one regression workflow for both PR validation and the canonical main-branch report

No separate cache manifest is required: the screenshot path itself identifies the exact input and
rendering environment. Original screenshots are shared for a fixture, while each distinct optimized
checksum gets its own cached PNG. The comparison phase continues to process all fixtures and remains
the source of regression results.

On pull requests, the workflow uploads a short-lived commit report and compares it with main. On
pushes to main, the same workflow uploads the stable `svgo-test-report` baseline.

## Verification

- `pnpm test` \(1,548 passed, 9 skipped\)
- `pnpm typecheck`
- focused ESLint and Prettier checks
- Chromium smoke test confirming both screenshot files are preserved and reused

The full regression corpus was left for CI because it requires downloading and processing roughly
1.3 GB of fixtures.") | Aug 23, 2026 |  
| | | [chore: migrate package management to pnpm
(](https://github.com/svg/svgo/commit/1f5faf541281beb8ccf5fae31cd3ca0b1afcd6e0 "chore: migrate
package management to pnpm \(#2243\)

## Summary

- replace Yarn 3 and its TypeScript compatibility workaround with pnpm 10
- migrate scripts, CI caching, publishing, and contributor documentation to pnpm
- preserve the patched `sax@1.5.0` dependency and Node.js 16 runtime coverage
- quarantine newly published dependency versions for seven days, with exact bootstrap exemptions for
  versions already reviewed on `main`

## Testing

- `pnpm install --frozen-lockfile`
- `pnpm lint`
- `pnpm spellcheck`
- `pnpm test:types`
- `pnpm test`
- `pnpm test:bundles`
- `pnpm publish --dry-run --no-git-checks` \(package build and tarball validation; registry rejected
  the already-published `4.0.2` version as
  expected\)")[#2243](https://github.com/svg/svgo/pull/2243)[)](https://github.com/svg/svgo/commit/1f5faf541281beb8ccf5fae31cd3ca0b1afcd6e0
  "chore: migrate package management to pnpm \(#2243\)

## Summary

- replace Yarn 3 and its TypeScript compatibility workaround with pnpm 10
- migrate scripts, CI caching, publishing, and contributor documentation to pnpm
- preserve the patched `sax@1.5.0` dependency and Node.js 16 runtime coverage
- quarantine newly published dependency versions for seven days, with exact bootstrap exemptions for
  versions already reviewed on `main`

## Testing

- `pnpm install --frozen-lockfile`
- `pnpm lint`
- `pnpm spellcheck`
- `pnpm test:types`
- `pnpm test`
- `pnpm test:bundles`
- `pnpm publish --dry-run --no-git-checks` \(package build and tarball validation; registry rejected
  the already-published `4.0.2` version as expected\)") | Aug 10, 2026 |  
  | | |
  [chore: update prettier and eslint (](https://github.com/svg/svgo/commit/22533f1ffe82978e0d4c6ff502bf3651eaaf13fe "chore: update prettier and eslint (#1885)")[#1885](https://github.com/svg/svgo/pull/1885)[)](https://github.com/svg/svgo/commit/22533f1ffe82978e0d4c6ff502bf3651eaaf13fe "chore: update prettier and eslint (#1885)")
  | Dec 15, 2023 |  
  | | | [chore: cache regression screenshots
  (](https://github.com/svg/svgo/commit/4e9b9aed2a4607cf28025871151421d5bfe86484 "chore: cache
  regression screenshots \(#2267\)

## Summary

- cache rendering is down to zero, whole regression is 17min -> 7min
- cache Chromium screenshots by renderer, test-suite version, fixture name, and optimized SVG
  checksum
- skip Chromium rendering whenever the corresponding PNG already exists
- store local regression data under the repository `.cache` directory instead of the system
  temporary directory
- restore compatible screenshot caches in CI with `actions/cache`
- use one regression workflow for both PR validation and the canonical main-branch report

No separate cache manifest is required: the screenshot path itself identifies the exact input and
rendering environment. Original screenshots are shared for a fixture, while each distinct optimized
checksum gets its own cached PNG. The comparison phase continues to process all fixtures and remains
the source of regression results.

On pull requests, the workflow uploads a short-lived commit report and compares it with main. On
pushes to main, the same workflow uploads the stable `svgo-test-report` baseline.

## Verification

- `pnpm test` \(1,548 passed, 9 skipped\)
- `pnpm typecheck`
- focused ESLint and Prettier checks
- Chromium smoke test confirming both screenshot files are preserved and reused

The full regression corpus was left for CI because it requires downloading and processing roughly
1.3 GB of
fixtures.")[#2267](https://github.com/svg/svgo/pull/2267)[)](https://github.com/svg/svgo/commit/4e9b9aed2a4607cf28025871151421d5bfe86484
"chore: cache regression screenshots \(#2267\)

## Summary

- cache rendering is down to zero, whole regression is 17min -> 7min
- cache Chromium screenshots by renderer, test-suite version, fixture name, and optimized SVG
  checksum
- skip Chromium rendering whenever the corresponding PNG already exists
- store local regression data under the repository `.cache` directory instead of the system
  temporary directory
- restore compatible screenshot caches in CI with `actions/cache`
- use one regression workflow for both PR validation and the canonical main-branch report

No separate cache manifest is required: the screenshot path itself identifies the exact input and
rendering environment. Original screenshots are shared for a fixture, while each distinct optimized
checksum gets its own cached PNG. The comparison phase continues to process all fixtures and remains
the source of regression results.

On pull requests, the workflow uploads a short-lived commit report and compares it with main. On
pushes to main, the same workflow uploads the stable `svgo-test-report` baseline.

## Verification

- `pnpm test` \(1,548 passed, 9 skipped\)
- `pnpm typecheck`
- focused ESLint and Prettier checks
- Chromium smoke test confirming both screenshot files are preserved and reused

The full regression corpus was left for CI because it requires downloading and processing roughly
1.3 GB of fixtures.") | Aug 23, 2026 |  
| | | | Feb 13, 2021 |  
| | | [docs: add sponsor message to readme
(](https://github.com/svg/svgo/commit/e4cb29bebcc9820ac979dfc05106b512cc5de986 "docs: add sponsor
message to readme \(#2285\)

## Summary

- add a sponsorship callout near the top of the README
- highlight continued stability and performance improvements
- remove the legacy donors section

## Testing

Not applicable \(documentation-only
change\).")[#2285](https://github.com/svg/svgo/pull/2285)[)](https://github.com/svg/svgo/commit/e4cb29bebcc9820ac979dfc05106b512cc5de986
"docs: add sponsor message to readme \(#2285\)

## Summary

- add a sponsorship callout near the top of the README
- highlight continued stability and performance improvements
- remove the legacy donors section

## Testing

Not applicable \(documentation-only change\).") | Aug 27, 2026 |  
| | | [chore(regression): make screenshots deterministic and stop ignoring
f…](https://github.com/svg/svgo/commit/96e756b1c5aedeb3d6b8532033060bcd17bbb76e
"chore\(regression\): make screenshots deterministic and stop ignoring files \(#2313\)

## Summary

- pause the SMIL timeline at t=0 before taking each regression screenshot
- launch Chromium with `--disable-lcd-text`
- include both in the screenshot cache key
- empty `ignore.txt`: none of its files are nondeterministic anymore
- update `expect-mismatch.txt` to match

## Motivation

`ignore.txt` says its files "sometimes pass, sometimes fail, we'll figure out why eventually". 80 of
its 81 files contain SMIL animations \(the 78 `animate-*` files, plus `filters-composite-05-f` and
`filters-light-04-f`\). Playwright's `animations: 'disabled'` only affects CSS animations and
transitions, so SMIL keeps running on the wall clock and each screenshot captures whatever frame is
current \(SMIL time 0.075–1.66s in local measurements\). The original and optimized SVGs are
captured at different moments, so the result depends on runner load. The screenshot cache then hides
this, since one random sample gets reused until the cache key changes.

Freezing the timeline makes every animated file deterministic:

- 60 match at t=0, so they no longer need an entry
- 20 mismatch at t=0 and move to `expect-mismatch.txt`

`filters-conv-05-f.svg` \("strange artifact inconsistently breaks regression tests"\) is the
remaining entry. It has no animation, and its artifact no longer reproduces, so it's removed.

LCD \(subpixel\) text antialiasing is toggled by Chromium based on layer contents. For example,
converting a `<rect>` to a `<path>` can switch unrelated text from LCD to grayscale antialiasing. 29
entries in `expect-mismatch.txt` only mismatched because of this, and they match with
`--disable-lcd-text`.

Freezing at t=0 only checks the first frame. Some animated files only break later in the animation,
mostly because `convertShapeToPath` converts shapes with animated geometry \(#1634\). Checking
several timestamps would catch those, but it's a separate change.

## Verification

- full regression pipeline, run twice on `ubuntu-latest` from this branch, with identical results
  both times: 4,995 / 4,995 match, 130 / 130 expected mismatches, 0 ignored, no errors \(the
  optimize step needed `--max-old-space-size=3584` there because those runners only had 8 GB\)
- `pnpm test` \(520 passed, 3 skipped\)
- `pnpm lint`, `pnpm typecheck`, `pnpm spellcheck`
- `git diff --check`

Changing the cache key means the first run after merging re-renders every screenshot instead of
reusing cached ones.

🤖 Generated with \[Claude Code\]\(https://claude.com/claude-code\)

Co-authored-by: Claude Opus 5.5 <noreply@anthropic.com>") | Oct 24, 2026 |  
| | | [test: migrate from Jest to Vitest
(](https://github.com/svg/svgo/commit/318a6322593398fd271dfa2615a01776041ba95c "test: migrate from
Jest to Vitest \(#2252\)

## Summary

- replace Jest with Vitest for the JavaScript test suite
- explicitly import Vitest APIs in each test module
- remove Jest coverage collection and configuration
- preserve the four-worker limit and existing regression tooling

## Testing

- pnpm test
- pnpm lint
- pnpm test:types
- pnpm
  test:bundles")[#2252](https://github.com/svg/svgo/pull/2252)[)](https://github.com/svg/svgo/commit/318a6322593398fd271dfa2615a01776041ba95c
  "test: migrate from Jest to Vitest \(#2252\)

## Summary

- replace Jest with Vitest for the JavaScript test suite
- explicitly import Vitest APIs in each test module
- remove Jest coverage collection and configuration
- preserve the four-worker limit and existing regression tooling

## Testing

- pnpm test
- pnpm lint
- pnpm test:types
- pnpm test:bundles") | Aug 13, 2026 |  
  | | | | Aug 24, 2026 |  
  | | | [chore: optimize fixtures in a bounded worker pool
  (](https://github.com/svg/svgo/commit/dcaf957c6eb34832844de11ef2792e3e0e8db5dd "chore: optimize
  fixtures in a bounded worker pool \(#2265\)

## Summary

- optimize regression fixtures in worker threads orchestrated by Tinypool
- cap optimization at two concurrent workers on memory-constrained CI runners
- move fixture reads, synchronous optimization, checksumming, and writes into the worker
- avoid retaining fixture contents or optimized SVGs on the main thread
- report optimization, rendering, and comparison durations separately

## Motivation

`optimize\(\)` is synchronous, so the previous `os.cpus\(\).length * 2` async functions did not
provide CPU parallelism. They only allowed multiple fixture reads to complete around the active
optimization, increasing peak memory without parallelizing the expensive work.

This uses actual worker threads while bounding the number of concurrent large ASTs to two. Tasks
contain only file paths, and workers return only checksums and byte counts.

## Benchmark

A local run over 256 fixtures sampled across the regression corpus:

- one Tinypool worker: 11.7 seconds
- two Tinypool workers: 6.6 seconds
- wall-time reduction: about 43%

The benchmark excludes the corpus's seven extreme 20–90 MB fixtures. The two-worker cap is
intentionally conservative for those files and the 8 GiB CI environment.

## Verification

- `pnpm test` — 1,554 passed, 9 skipped
- `pnpm typecheck`
- `pnpm exec eslint test/regression/optimize.js test/regression/optimize-worker.js`
- `pnpm exec prettier --check test/regression/optimize.js test/regression/optimize-worker.js package.json pnpm-lock.yaml`
- `git diff --check`
- Tinypool worker smoke test verified optimization output, checksum, and byte metrics

The full regression corpus was not run locally because it is host-dependent and includes several
very large
fixtures.")[#2265](https://github.com/svg/svgo/pull/2265)[)](https://github.com/svg/svgo/commit/dcaf957c6eb34832844de11ef2792e3e0e8db5dd
"chore: optimize fixtures in a bounded worker pool \(#2265\)

## Summary

- optimize regression fixtures in worker threads orchestrated by Tinypool
- cap optimization at two concurrent workers on memory-constrained CI runners
- move fixture reads, synchronous optimization, checksumming, and writes into the worker
- avoid retaining fixture contents or optimized SVGs on the main thread
- report optimization, rendering, and comparison durations separately

## Motivation

`optimize\(\)` is synchronous, so the previous `os.cpus\(\).length * 2` async functions did not
provide CPU parallelism. They only allowed multiple fixture reads to complete around the active
optimization, increasing peak memory without parallelizing the expensive work.

This uses actual worker threads while bounding the number of concurrent large ASTs to two. Tasks
contain only file paths, and workers return only checksums and byte counts.

## Benchmark

A local run over 256 fixtures sampled across the regression corpus:

- one Tinypool worker: 11.7 seconds
- two Tinypool workers: 6.6 seconds
- wall-time reduction: about 43%

The benchmark excludes the corpus's seven extreme 20–90 MB fixtures. The two-worker cap is
intentionally conservative for those files and the 8 GiB CI environment.

## Verification

- `pnpm test` — 1,554 passed, 9 skipped
- `pnpm typecheck`
- `pnpm exec eslint test/regression/optimize.js test/regression/optimize-worker.js`
- `pnpm exec prettier --check test/regression/optimize.js test/regression/optimize-worker.js package.json pnpm-lock.yaml`
- `git diff --check`
- Tinypool worker smoke test verified optimization output, checksum, and byte metrics

The full regression corpus was not run locally because it is host-dependent and includes several
very large fixtures.") | Aug 22, 2026 |  
| | | | Aug 15, 2026 |  
| | |
[docs: write v2 to v3 migration guide (](https://github.com/svg/svgo/commit/a9d27dfe25422cdc97c02e9742c94a3a76ea9dbb "docs: write v2 to v3 migration guide (#2177)")[#2177](https://github.com/svg/svgo/pull/2177)[)](https://github.com/svg/svgo/commit/a9d27dfe25422cdc97c02e9742c94a3a76ea9dbb "docs: write v2 to v3 migration guide (#2177)")
| Oct 11, 2025 |  
| | |
[chore: revamp how we export types (](https://github.com/svg/svgo/commit/747cc722d933cb49058eb32b494acd43b6a4ad03 "chore: revamp how we export types (#2118)")[#2118](https://github.com/svg/svgo/pull/2118)[)](https://github.com/svg/svgo/commit/747cc722d933cb49058eb32b494acd43b6a4ad03 "chore: revamp how we export types (#2118)")
| May 4, 2025 |  
| | | [test(typescript): drop tsd for vitest type testing
API](https://github.com/svg/svgo/commit/0b97fedd00a3001f1da616f61578c2c12e6cde1f
"test\(typescript\): drop tsd for vitest type testing API

Now that we are using vitest for tests anyway, it comes with an experimental type testing API which
is worth using.

This doesn't affect users, but as maintainers, this drops the total dependencies \(including
transitive dependencies\) from 610 to 486. So ideally that means 124 fewer things that can go wrong.
😅

I did also explore if we truly needed type testing, or if tsc would be enough, but indeed, a real
type testing library would still be useful as tsc has no way to evaluate exact types without
plumbing. As in, tsc natively only checks if types overlap or satisfy each other, but not if the
types precisely match the assertion.

Useful article: https://www.totaltypescript.com/how-to-test-your-types") | Aug 16, 2026 |  
| | | [test(typescript): drop tsd for vitest type testing
API](https://github.com/svg/svgo/commit/0b97fedd00a3001f1da616f61578c2c12e6cde1f
"test\(typescript\): drop tsd for vitest type testing API

Now that we are using vitest for tests anyway, it comes with an experimental type testing API which
is worth using.

This doesn't affect users, but as maintainers, this drops the total dependencies \(including
transitive dependencies\) from 610 to 486. So ideally that means 124 fewer things that can go wrong.
😅

I did also explore if we truly needed type testing, or if tsc would be enough, but indeed, a real
type testing library would still be useful as tsc has no way to evaluate exact types without
plumbing. As in, tsc natively only checks if types overlap or satisfy each other, but not if the
types precisely match the assertion.

Useful article: https://www.totaltypescript.com/how-to-test-your-types") | Aug 16, 2026 |  
| View all files |  
SVGO, short for SVG Optimizer, is a Node.js library and command-line application for optimizing SVG
files.

> 💖 [Sponsor SVGO on Open Collective](https://opencollective.com/svgo) to support continued
> improvements in stability and performance. SVG files, especially those exported from vector
> editors, usually contain a lot of redundant information. This includes editor metadata, comments,
> hidden elements, default or suboptimal values, and other stuff that can be safely removed or
> converted without impacting rendering.

## Installation

You can install SVGO globally through npm, yarn, or pnpm. Alternatively, drop the global flag
(`global`/`-g`) to use it in your Node.js project.

```

npm install -g svgo

# yarn
yarn global add svgo

# pnpm
pnpm add -g svgo
```

## Command-line usage

Process single files:

```
svgo one.svg two.svg -o one.min.svg two.min.svg
```

Process a directory of files recursively with `-r`/`--recursive` and `-f`/`--folder`:

```
svgo -rf path/to/directory_with_svgs -o path/to/output_directory
```

Help for advanced usage:

```
svgo --help
```

## Configuration

SVGO has a plugin architecture. You can read more about all plugins in
[Plugins | SVGO Documentation](https://svgo.dev/docs/plugins/), and the default plugins in
[Preset Default | SVGO Documentation](https://svgo.dev/docs/preset-default/). SVGO reads the
configuration from `svgo.config.mjs` or the `--config path/to/config.mjs` command-line option. Some
other parameters can be configured though command-line options too. **`svgo.config.mjs`**

```
export default {
  multipass: false, // boolean
  datauri: 'base64', // 'base64'|'enc'|'unenc'
  js2svg: {
    indent: 4, // number
    pretty: false, // boolean
  },
  plugins: [
    'preset-default', // built-in plugins enabled by default
    'prefixIds', // enable built-in plugins by name

    // enable built-in plugins with an object to configure plugins
    {
      name: 'prefixIds',
      params: {
        prefix: 'uwu',
      },
    },
  ],
};
```

### Default preset

Instead of configuring SVGO from scratch, you can tweak the default preset to suit your needs by
configuring or disabling the respective plugin. **`svgo.config.mjs`**

```
export default {
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // disable a default plugin
          cleanupIds: false,

          // customize the params of a default plugin
          inlineStyles: {
            onlyMatchedOnce: false,
          },
        },
      },
    },
  ],
};
```

You can find a list of the default plugins in the order they run in
[Preset Default | SVGO Documentation](https://svgo.dev/docs/preset-default/#plugins-list).

### Custom plugins

You can also specify custom plugins: **`svgo.config.mjs`**

```
import importedPlugin from './imported-plugin';

export default {
  plugins: [
    // plugin imported from another JavaScript file
    importedPlugin,

    // plugin defined inline
    {
      name: 'customPlugin',
      params: {
        paramName: 'paramValue',
      },
      fn: (ast, params, info) => {},
    },
  ],
};
```

## API usage

SVGO provides a few low level utilities.

### optimize

The core of SVGO is `optimize` function.

```
import { optimize } from 'svgo';

const result = optimize(svgString, {
  path: 'path-to.svg', // recommended
  multipass: true, // all other config fields are available here
});

const optimizedSvgString = result.data;
```

### loadConfig

If you write a tool on top of SVGO you may want to resolve the `svgo.config.mjs` file.

```
import { loadConfig } from 'svgo';

const config = await loadConfig();
```

You can also specify a path and customize the current working directory.

```
const config = await loadConfig(configFile, cwd);
```

## License and Copyright

This software is released under the terms of the
[MIT license](https://github.com/svg/svgo/blob/main/LICENSE). Logo by
[André Castillo](https://github.com/DerianAndre).

## About

SVG Optimizer for Node.js and CLI. ⚙️
[cli](https://github.com/topics/cli)[hacktoberfest](https://github.com/topics/hacktoberfest)[javascript](https://github.com/topics/javascript)[minification](https://github.com/topics/minification)[nodejs](https://github.com/topics/nodejs)[optimization](https://github.com/topics/optimization)[svg](https://github.com/topics/svg)[svgo](https://github.com/topics/svgo)
**22.8k** stars **235** watching [**1.5k** forks](https://github.com/svg/svgo/forks)

##

[ v4.1.0Latest Aug 24, 2026 ](https://github.com/svg/svgo/releases/tag/v4.1.0)

## Sponsor this project

-

##

[+ 17,053,079](https://github.com/svg/svgo/network/dependents)

##

## Languages

- [JavaScript97.9%](https://github.com/svg/svgo/search?l=javascript)
- [TypeScript2.1%](https://github.com/svg/svgo/search?l=typescript)

You can’t perform that action at this time.

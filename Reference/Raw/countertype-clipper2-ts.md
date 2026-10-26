# clipper2-ts

[![npm version](https://camo.githubusercontent.com/4c592663170f482be0474a48d1805ead72c1ebd9b131d4a3a14b1a768ec1dd2c/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f636c6970706572322d74732e737667)](https://www.npmjs.com/package/clipper2-ts)
[![license](https://camo.githubusercontent.com/ef21178d7cd2f44da4f1325531d106d2b2ea8d96319bfb17e56afa5778d0770f/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f6c2f636c6970706572322d74732e737667)](https://github.com/countertype/clipper2-ts/blob/main/LICENSE)

TypeScript port of Angus Johnson's [Clipper2](https://github.com/AngusJohnson/Clipper2) library for
polygon clipping, offsetting, and triangulation

## Installation

npm install clipper2-ts

## Usage

import { intersect, union, difference, xor, inflatePaths, FillRule, JoinType, EndType } from 'clipper2-ts';\
\
// Define polygons as arrays of points\
const subject = \[\[\
  { x: 0, y: 0 },\
  { x: 100, y: 0 },\
  { x: 100, y: 100 },\
  { x: 0, y: 100 }\
\]\];\
\
const clip = \[\[\
  { x: 50, y: 50 },\
  { x: 150, y: 50 },\
  { x: 150, y: 150 },\
  { x: 50, y: 150 }\
\]\];\
\
// Boolean operations\
const intersection = intersect(subject, clip, FillRule.NonZero);\
const unionResult = union(subject, clip, FillRule.NonZero);\
const diff = difference(subject, clip, FillRule.NonZero);\
const xorResult = xor(subject, clip, FillRule.NonZero);\
\
// Polygon offsetting (inflate/deflate)\
const offset = inflatePaths(subject, 10, JoinType.Round, EndType.Polygon);

### Triangulation

Convert polygons into triangles using constrained Delaunay triangulation:

import { triangulate, triangulateD, TriangulateResult } from 'clipper2-ts';\
\
const polygon = \[\[\
  { x: 0, y: 0 },\
  { x: 100, y: 0 },\
  { x: 100, y: 100 },\
  { x: 0, y: 100 }\
\]\];\
\
const { result, solution } = triangulate(polygon);\
if (result === TriangulateResult.success) {\
  // solution contains triangles (each with 3 vertices)\
  console.log(\`Created \${solution.length} triangles\`);\
}\
\
// For floating-point coordinates:\
const { result: resultD, solution: solutionD } = triangulateD(polygon, 2);

### Z-coordinate support

Points can optionally carry a Z value (e.g., elevation, layer index, color). Z callbacks allow you
to assign Z values to new vertices created at intersection points. See
[Clipper2 Z Docs](https://www.angusj.com/clipper2/Docs/Overview.htm) for details

## Examples

Try the [interactive example](https://countertype.github.io/clipper2-ts/) showing all Clipper2
operations

To run locally:

npm install\
npm run serve\
\# Then open http://localhost:3000/example/

## API

This port follows the structure and functionality of Clipper2's C# implementation, with method names
adapted to JavaScript conventions. Where C# uses `PascalCase` for methods (`AddPath`, `Execute`),
this port uses `camelCase` (`addPath`, `execute`). Class names remain unchanged

For detailed API documentation, see the
[official Clipper2 docs](https://www.angusj.com/clipper2/Docs/Overview.htm)

## Testing

The port includes 258 tests validating against Clipper2's reference test suite:

npm test              # Run all tests\
npm test:coverage     # Run with coverage report

The test suite validates clipping, offsetting, triangulation, and Z-callbacks against Clipper2's
reference implementation. Polygon test 16 (bow-tie) uses relaxed tolerances as this edge case also
fails in the C# reference

## Numeric precision

Unlike C# Clipper2, which has full int64 support, this library uses JavaScript's `Number` rather
than `BigInt` for performance, with `BigInt` used for some intermediate arithmetic where needed.
Coordinates must stay within the
[safe integer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger)
range (2^53); the library throws on overflow

If you have a use case that requires the full 64-bit range, and Clipper2-WASM isn't an option,
please open an issue and we can discuss!

### Bundlers / minifiers (terser)

This library uses `BigInt` internally. Some versions/configurations of terser have had issues when
compressing `BigInt` literals (eg `0n`). `clipper2-ts` avoids BigInt literal syntax in its source to
improve compatibility

If you still hit terser issues in a consuming build, one workaround is
`terserOptions: { compress: { evaluate: false } }`

## Performance

Faster than JavaScript-based Clipper (Clipper1) ports, slower than Clipper2-WASM; choose based on
your constraints

## License

Boost Software License 1.0 (same as Clipper2)

## Credits

Original Clipper2 library by Angus Johnson. TypeScript port maintained by Jeremy Tribby

Benchmark polygon data from [Poly2Tri](https://github.com/jhasse/poly2tri) (BSD 3-clause). See
`LICENSE_THIRD_PARTY` for details

<!--
## Source links

- [/](./index.md) - source: /
- [Sign in](./login?return_to=https%3A%2F%2Fgithub.com%2Fcountertype%2Fclipper2-ts.md) - source: /login?return_to=https%3A%2F%2Fgithub.com%2Fcountertype%2Fclipper2-ts
- [GitHub Copilot Write better code with AI](https://github.com/features/copilot)
- [GitHub Copilot app Direct agents from issue to merge](https://github.com/features/ai/github-app)
- [MCP Registry Integrate external tools](https://github.com/mcp)
- [Actions Automate any workflow](https://github.com/features/actions)
- [Codespaces Instant dev environments](https://github.com/features/codespaces)
- [Issues Plan and track work](https://github.com/features/issues)
- [Code Review Manage code changes](https://github.com/features/code-review)
- [Code Quality Enforce quality at merge](https://github.com/features/code-quality)
- [GitHub Advanced Security Find and fix vulnerabilities](https://github.com/security/advanced-security)
- [Code security Secure your code as you build](https://github.com/security/advanced-security/code-security)
- [Secret protection Stop leaks before they start](https://github.com/security/advanced-security/secret-protection)
- [Why GitHub](https://github.com/why-github)
- [Documentation](https://docs.github.com)
- [Blog](https://github.blog)
- [Changelog](https://github.blog/changelog)
- [Marketplace](https://github.com/marketplace)
- [View all features](https://github.com/features)
- [Enterprises](https://github.com/enterprise)
- [Small and medium teams](https://github.com/team)
- [Startups](https://github.com/enterprise/startups)
- [Nonprofits](https://github.com/solutions/industry/nonprofits)
- [App Modernization](https://github.com/solutions/use-case/app-modernization)
- [DevSecOps](https://github.com/solutions/use-case/devsecops)
- [DevOps](https://github.com/solutions/use-case/devops)
- [CI/CD](https://github.com/solutions/use-case/ci-cd)
- [View all use cases](https://github.com/solutions/use-case)
- [Healthcare](https://github.com/solutions/industry/healthcare)
- [Financial services](https://github.com/solutions/industry/financial-services)
- [Manufacturing](https://github.com/solutions/industry/manufacturing)
- [Government](https://github.com/solutions/industry/government)
- [See all industries](https://github.com/solutions/industry)
- [View all solutions](https://github.com/solutions)
- [AI](https://github.com/resources/articles?topic=ai)
- [Software Development](https://github.com/resources/articles?topic=software-development)
- [DevOps](https://github.com/resources/articles?topic=devops)
- [Security](https://github.com/resources/articles?topic=security)
- [View all topics](https://github.com/resources/articles)
- [Customer stories](https://github.com/customer-stories)
- [Events & webinars](https://github.com/resources/events)
- [Ebooks & reports](https://github.com/resources/whitepapers)
- [Business insights](https://github.com/solutions/executive-insights)
- [GitHub Skills](https://skills.github.com)
- [Customer support](https://support.github.com)
- [Community forum](https://github.com/orgs/community/discussions)
- [Trust center](https://github.com/trust-center)
- [Partners](https://github.com/partners)
- [View all resources](https://github.com/resources)
- [GitHub Sponsors Fund open source developers](https://github.com/open-source/sponsors)
- [Security Lab](https://securitylab.github.com)
- [Maintainer Community](https://maintainers.github.com)
- [GitHub Stars](https://stars.github.com)
- [Archive Program](https://archiveprogram.github.com)
- [Topics](https://github.com/topics)
- [Trending](https://github.com/trending)
- [Collections](https://github.com/collections)
- [Copilot for Business Enterprise-grade AI features](https://github.com/features/copilot/copilot-business)
- [Premium Support Enterprise-grade 24/7 support](https://github.com/enterprise/premium-support)
- [Pricing](https://github.com/pricing)
- [Sign up](./signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E&source=header-repo&source_repo=countertype%2Fclipper2-ts.md) - source: /signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E&source=header-repo&source_repo=countertype%2Fclipper2-ts
- [countertype](./countertype.md) - source: /countertype
- [clipper2-ts](./countertype-clipper2-ts.md) - source: /countertype/clipper2-ts
- [Issues 3](./countertype-clipper2-ts-issues.md) - source: /countertype/clipper2-ts/issues
- [Pull requests 2](./countertype-clipper2-ts-pulls.md) - source: /countertype/clipper2-ts/pulls
- [Actions](./countertype-clipper2-ts-actions.md) - source: /countertype/clipper2-ts/actions
- [Projects](./countertype-clipper2-ts-projects.md) - source: /countertype/clipper2-ts/projects
- [Security and quality](./countertype-clipper2-ts-security.md) - source: /countertype/clipper2-ts/security
- [Insights](./countertype-clipper2-ts-pulse.md) - source: /countertype/clipper2-ts/pulse
- [Notifications](./login?return_to=%2Fcountertype%2Fclipper2-ts.md) - source: /login?return_to=%2Fcountertype%2Fclipper2-ts
- [countertype.github.io/clipper2-ts/](https://countertype.github.io/clipper2-ts/)
- [boolean-operations](./topics-boolean-operations.md) - source: /topics/boolean-operations
- [clipper](./topics-clipper.md) - source: /topics/clipper
- [clipper2](./topics-clipper2.md) - source: /topics/clipper2
- [delaunay-triangulation](./topics-delaunay-triangulation.md) - source: /topics/delaunay-triangulation
- [minkowski](./topics-minkowski.md) - source: /topics/minkowski
- [offsetting](./topics-offsetting.md) - source: /topics/offsetting
- [polygon-clipping](./topics-polygon-clipping.md) - source: /topics/polygon-clipping
- [self-intersection](./topics-self-intersection.md) - source: /topics/self-intersection
- [triangulation](./topics-triangulation.md) - source: /topics/triangulation
- [vatti](./topics-vatti.md) - source: /topics/vatti
- [vatti-clipping](./topics-vatti-clipping.md) - source: /topics/vatti-clipping
- [Activity](./countertype-clipper2-ts-activity.md) - source: /countertype/clipper2-ts/activity
- [Custom properties](./countertype-clipper2-ts-custom-properties.md) - source: /countertype/clipper2-ts/custom-properties
- [7 forks](./countertype-clipper2-ts-forks.md) - source: /countertype/clipper2-ts/forks
- [Report repository](./contact-report-content?content_url=https%3A%2F%2Fgithub.com%2Fcountertype%2Fclipper2-ts&report=countertype+%28user%29.md) - source: /contact/report-content?content_url=https%3A%2F%2Fgithub.com%2Fcountertype%2Fclipper2-ts&report=countertype+%28user%29
- [2 Branches](./countertype-clipper2-ts-branches.md) - source: /countertype/clipper2-ts/branches
- [0 Tags](./countertype-clipper2-ts-tags.md) - source: /countertype/clipper2-ts/tags
- [/jpt](./jpt.md) - source: /jpt
- [jpt](./countertype-clipper2-ts-commits?author=jpt.md) - source: /countertype/clipper2-ts/commits?author=jpt
- [Merge pull request](./countertype-clipper2-ts-commit-bf6e0303217bdffcbe2f03ab7f6218194df8e7e4.md) - source: /countertype/clipper2-ts/commit/bf6e0303217bdffcbe2f03ab7f6218194df8e7e4
- [#34](https://github.com/countertype/clipper2-ts/pull/34)
- [100 Commits](./countertype-clipper2-ts-commits-main.md) - source: /countertype/clipper2-ts/commits/main/
- [bench](./countertype-clipper2-ts-tree-main-bench.md) - source: /countertype/clipper2-ts/tree/main/bench
- [hole-heavy testing](./countertype-clipper2-ts-commit-f75f16baa045f9c5c059b9a751bd783e98b8688c.md) - source: /countertype/clipper2-ts/commit/f75f16baa045f9c5c059b9a751bd783e98b8688c
- [src](./countertype-clipper2-ts-tree-main-src.md) - source: /countertype/clipper2-ts/tree/main/src
- [scanbeam fast paths](./countertype-clipper2-ts-commit-a6711505084faeacd2f9b6d91ccfda888c23a85c.md) - source: /countertype/clipper2-ts/commit/a6711505084faeacd2f9b6d91ccfda888c23a85c
- [tests](./countertype-clipper2-ts-tree-main-tests.md) - source: /countertype/clipper2-ts/tree/main/tests
- [invoke zCallback in doSplitOp (](./countertype-clipper2-ts-commit-329f7b4926fc709e04bb82da59e422c72fce7d0b.md) - source: /countertype/clipper2-ts/commit/329f7b4926fc709e04bb82da59e422c72fce7d0b
- [#31](https://github.com/countertype/clipper2-ts/issues/31)
- [.gitignore](./countertype-clipper2-ts-blob-main-.gitignore.md) - source: /countertype/clipper2-ts/blob/main/.gitignore
- [2.0.1-1](./countertype-clipper2-ts-commit-64a0c771e3402aebbd49006770f5e203ed464c0f.md) - source: /countertype/clipper2-ts/commit/64a0c771e3402aebbd49006770f5e203ed464c0f
- [.npmignore](./countertype-clipper2-ts-blob-main-.npmignore.md) - source: /countertype/clipper2-ts/blob/main/.npmignore
- [init](./countertype-clipper2-ts-commit-f4db5b1f392aa922738757bc67fd678300856fe3.md) - source: /countertype/clipper2-ts/commit/f4db5b1f392aa922738757bc67fd678300856fe3
- [CHANGELOG.md](./countertype-clipper2-ts-blob-main-CHANGELOG.md.md) - source: /countertype/clipper2-ts/blob/main/CHANGELOG.md
- [bump version](./countertype-clipper2-ts-commit-23462827eb2c3877a6c9b3e5c850bfd5af061ddc.md) - source: /countertype/clipper2-ts/commit/23462827eb2c3877a6c9b3e5c850bfd5af061ddc
- [LICENSE](./countertype-clipper2-ts-blob-main-LICENSE.md) - source: /countertype/clipper2-ts/blob/main/LICENSE
- [LICENSE_THIRD_PARTY](./countertype-clipper2-ts-blob-main-LICENSE_THIRD_PARTY.md) - source: /countertype/clipper2-ts/blob/main/LICENSE_THIRD_PARTY
- [add benchmarks, rolldown, license 3rd party](./countertype-clipper2-ts-commit-da477324b651b800ba097b570e1008c323dd5d97.md) - source: /countertype/clipper2-ts/commit/da477324b651b800ba097b570e1008c323dd5d97
- [README.md](./countertype-clipper2-ts-blob-main-README.md.md) - source: /countertype/clipper2-ts/blob/main/README.md
- [fix z propagation](./countertype-clipper2-ts-commit-6186553591e962ba213e59fee3dd20d4ac36205e.md) - source: /countertype/clipper2-ts/commit/6186553591e962ba213e59fee3dd20d4ac36205e
- [package.json](./countertype-clipper2-ts-blob-main-package.json.md) - source: /countertype/clipper2-ts/blob/main/package.json
- [rolldown.config.ts](./countertype-clipper2-ts-blob-main-rolldown.config.ts.md) - source: /countertype/clipper2-ts/blob/main/rolldown.config.ts
- [tsconfig.json](./countertype-clipper2-ts-blob-main-tsconfig.json.md) - source: /countertype/clipper2-ts/blob/main/tsconfig.json
- [ESM](./countertype-clipper2-ts-commit-42ae42b95888198b61179a0ecc0cd30648a1c841.md) - source: /countertype/clipper2-ts/commit/42ae42b95888198b61179a0ecc0cd30648a1c841
- [vitest.config.ts](./countertype-clipper2-ts-blob-main-vitest.config.ts.md) - source: /countertype/clipper2-ts/blob/main/vitest.config.ts
- [https://www.npmjs.com/package/clipper2-ts](https://www.npmjs.com/package/clipper2-ts)
- [https://github.com/countertype/clipper2-ts/blob/main/LICENSE](https://github.com/countertype/clipper2-ts/blob/main/LICENSE)
- [Clipper2](https://github.com/AngusJohnson/Clipper2)
- [Clipper2 Z Docs](https://www.angusj.com/clipper2/Docs/Overview.htm)
- [safe integer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger)
- [Poly2Tri](https://github.com/jhasse/poly2tri)
- [Releases](./countertype-clipper2-ts-releases.md) - source: /countertype/clipper2-ts/releases
- [Contributors](./countertype-clipper2-ts-graphs-contributors.md) - source: /countertype/clipper2-ts/graphs/contributors
- [TypeScript 100%](./countertype-clipper2-ts-search?l=typescript.md) - source: /countertype/clipper2-ts/search?l=typescript
- [https://github.com](https://github.com)
- [Terms](https://docs.github.com/site-policy/github-terms/github-terms-of-service)
- [Privacy](https://docs.github.com/site-policy/privacy-policies/github-privacy-statement)
- [Security](https://github.com/security)
- [Status](https://www.githubstatus.com/)
- [Community](https://github.community/)
- [Docs](https://docs.github.com/)
- [Contact](https://support.github.com?tags=dotcom-footer)
-->

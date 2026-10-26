# polygon-clipping


Apply boolean Polygon clipping operations (`intersection`, `union`, `difference`, `xor`) to your Polygons & MultiPolygons.

[![CI](https://github.com/mfogel/polygon-clipping/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/mfogel/polygon-clipping/actions) [![codecov](https://camo.githubusercontent.com/79c4edad59470eda99f870ec6d196b3ac36258fce4b2a5b7f24f283545ca0ab0/68747470733a2f2f636f6465636f762e696f2f67682f6d666f67656c2f706f6c79676f6e2d636c697070696e672f6272616e63682f6d61696e2f67726170682f62616467652e7376673f746f6b656e3d69733933696e4451694a)](https://codecov.io/gh/mfogel/polygon-clipping) [![License: MIT](https://camo.githubusercontent.com/784362b26e4b3546254f1893e778ba64616e362bd6ac791991d2c9e880a3a64e/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f4c6963656e73652d4d49542d677265656e2e737667)](https://opensource.org/licenses/MIT) [![npm](https://camo.githubusercontent.com/a456f6e14d1f59efe9926b1542261effe914db823b8ea3e6a48a346c70034122/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f706f6c79676f6e2d636c697070696e672e737667)](https://www.npmjs.com/package/polygon-clipping)

## Quickstart


const polygonClipping = require('polygon-clipping')\
\
const poly1 = \[\[\[0,0\],\[2,0\],\[0,2\],\[0,0\]\]\]\
const poly2 = \[\[\[-1,0\],\[1,0\],\[0,1\],\[-1,0\]\]\]\
\
polygonClipping.union       (poly1, poly2 /\* , poly3, ... \*/)\
polygonClipping.intersection(poly1, poly2 /\* , poly3, ... \*/)\
polygonClipping.xor         (poly1, poly2 /\* , poly3, ... \*/)\
polygonClipping.difference  (poly1, poly2 /\* , poly3, ... \*/)

## API


/\* All functions take one or more \[multi\]polygon(s) as input \*/\
\
polygonClipping.union       (\<geom\>, ...\<geoms\>)\
polygonClipping.intersection(\<geom\>, ...\<geoms\>)\
polygonClipping.xor         (\<geom\>, ...\<geoms\>)\
\
/\* The clipGeoms will be subtracted from the subjectGeom \*/\
polygonClipping.difference(\<subjectGeom\>, ...\<clipGeoms\>)

### Input


Each positional argument (`<geom>`) may be either a Polygon or a MultiPolygon. The [GeoJSON spec](https://tools.ietf.org/html/rfc7946#section-3.1) is followed, with the following notes/modifications:

- MultiPolygons may contain touching or overlapping Polygons.
- rings are not required to be self-closing.
- rings may contain repeated points, which are ignored.
- rings may be self-touching and/or self-crossing. Self-crossing rings will be interpreted using the [non-zero rule](https://en.wikipedia.org/wiki/Nonzero-rule).
- winding order of rings does not matter.
- inner rings may extend outside their outer ring. The portion of inner rings outside their outer ring is dropped.
- inner rings may touch or overlap each other.

### Output


For non-empty results, output will always be a MultiPolygon containing one or more non-overlapping, non-edge-sharing Polygons. The [GeoJSON spec](https://tools.ietf.org/html/rfc7946#section-3.1) is followed, with the following notes/modifications:

- outer rings will be wound counter-clockwise, and inner rings clockwise.
- inner rings will not extend outside their outer ring.
- rings will not overlap, nor share an edge with each other.
- rings will be self-closing.
- rings will not contain repeated points.
- rings will not contain superfluous points (intermediate points along a straight line).
- rings will not be self-touching nor self-crossing.
- rings *may* touch each other, but *may not* cross each other.

In the event that the result of the operation is the empty set, output will be a MultiPolygon with no Polygons: `[]`.

## Correctness


Run: `npm test`

The tests are broken up into unit tests and end-to-end tests. The end-to-end tests are organized as GeoJSON files, to make them easy to visualize thanks to [GitHub's helpful rendering of GeoJSON files](https://help.github.com/articles/mapping-geojson-files-on-github/). Browse those tests here.

## Performance


The Martinez-Rueda-Feito polygon clipping algorithm is used to compute the result in `O((n+k)*log(n))` time, where `n` is the total number of edges in all polygons involved and `k` is the number of intersections between edges.

## Settings


Global settings are set via environment variables.

- **POLYGON_CLIPPING_MAX_QUEUE_SIZE** and **POLYGON_CLIPPING_MAX_SWEEPLINE_SEGMENTS**: Aims to prevent infinite loops - usually caused by floating-point math round-off errors. Defaults are 1,000,000.

## Changelog


This project adheres to [Semantic Versioning](https://semver.org/).

The full changelog is available at [CHANGELOG.md](https://github.com/mfogel/polygon-clipping/blob/master/CHANGELOG.md).

## Authors


- [Mike Fogel](https://github.com/mfogel)
- [Alexander Milevski](https://github.com/w8r)
- [Vladimir Ovsyannikov](https://github.com/sh1ng)

## Sponsors


- [Alantgeo](https://www.alantgeo.com.au/)
- [EasyTerritory](https://www.easyterritory.com/)

Please contact [Mike Fogel](https://github.com/mfogel) if you or your company is interested in sponsoring work on specific bug fixes or feature requests.

## Based on


- A new algorithm for computing Boolean operations on polygons by Francisco Martinez, Antonio Jesus Rueda, Francisco Ramon Feito (2009)

<!--
## Source links

- / - source: `/`
- Sign in - source: `/login?return_to=https%3A%2F%2Fgithub.com%2Fmfogel%2Fpolygon-clipping`
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
- Sign up - source: `/signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E&source=header-repo&source_repo=mfogel%2Fpolygon-clipping`
- mfogel - source: `/mfogel`
- [polygon-clipping](./mfogel-polygon-clipping.md) - source: /mfogel/polygon-clipping
- Issues 45 - source: `/mfogel/polygon-clipping/issues`
- Pull requests 1 - source: `/mfogel/polygon-clipping/pulls`
- Actions - source: `/mfogel/polygon-clipping/actions`
- Projects - source: `/mfogel/polygon-clipping/projects`
- Wiki - source: `/mfogel/polygon-clipping/wiki`
- Security and quality - source: `/mfogel/polygon-clipping/security`
- Insights - source: `/mfogel/polygon-clipping/pulse`
- Notifications - source: `/login?return_to=%2Fmfogel%2Fpolygon-clipping`
- boolean-operations - source: `/topics/boolean-operations`
- difference - source: `/topics/difference`
- intersection - source: `/topics/intersection`
- polygon - source: `/topics/polygon`
- polygon-clipping - source: `/topics/polygon-clipping`
- union - source: `/topics/union`
- xor - source: `/topics/xor`
- Activity - source: `/mfogel/polygon-clipping/activity`
- 68 forks - source: `/mfogel/polygon-clipping/forks`
- Report repository - source: `/contact/report-content?content_url=https%3A%2F%2Fgithub.com%2Fmfogel%2Fpolygon-clipping&report=mfogel+%28user%29`
- 7 Branches - source: `/mfogel/polygon-clipping/branches`
- 37 Tags - source: `/mfogel/polygon-clipping/tags`
- artemrsx - source: `/mfogel/polygon-clipping/commits?author=artemrsx`
- Fix for - source: `/mfogel/polygon-clipping/commit/82b0ac2c35304bfea9cac24eabcbda32a808ee55`
- [#165](https://github.com/mfogel/polygon-clipping/issues/165)
- [#167](https://github.com/mfogel/polygon-clipping/pull/167)
- 516 Commits - source: `/mfogel/polygon-clipping/commits/main/`
- .github/ workflows - source: `/mfogel/polygon-clipping/tree/main/.github/workflows`
- Use private codecov token - source: `/mfogel/polygon-clipping/commit/e2c6aed942a37c3fe5476dac1e3f1b91632e396e`
- bench - source: `/mfogel/polygon-clipping/tree/main/bench`
- Release v0.15.7 - source: `/mfogel/polygon-clipping/commit/25f2a460ca7bd750d958d3d83b0037a32fcf75f6`
- dist - source: `/mfogel/polygon-clipping/tree/main/dist`
- Fix packaging ( - source: `/mfogel/polygon-clipping/commit/ffa5bae12abd31a4c27690ee70b022e901fda2a7`
- [#161](https://github.com/mfogel/polygon-clipping/pull/161)
- docs - source: `/mfogel/polygon-clipping/tree/main/docs`
- Tidy up robust-predicates import, and tidy vite config ( - source: `/mfogel/polygon-clipping/commit/96b7774245bfdc2594405456df543651f8130d00`
- [#147](https://github.com/mfogel/polygon-clipping/pull/147)
- src - source: `/mfogel/polygon-clipping/tree/main/src`
- test - source: `/mfogel/polygon-clipping/tree/main/test`
- .eslintrc.cjs - source: `/mfogel/polygon-clipping/blob/main/.eslintrc.cjs`
- .gitignore - source: `/mfogel/polygon-clipping/blob/main/.gitignore`
- Set up CI: travis, coveralls - source: `/mfogel/polygon-clipping/commit/91e4dd52f98b0d2c1cdec84f7c2f784fd6253d37`
- .prettierignore - source: `/mfogel/polygon-clipping/blob/main/.prettierignore`
- Formating: use prettier, adjust configs - source: `/mfogel/polygon-clipping/commit/d371557fd146d0f51ec61be6071608445b163a13`
- CHANGELOG.md - source: `/mfogel/polygon-clipping/blob/main/CHANGELOG.md`
- LICENSE.md - source: `/mfogel/polygon-clipping/blob/main/LICENSE.md`
- Move license, change name, add copyright - source: `/mfogel/polygon-clipping/commit/90b9bdc6155b09495bb9346a602a673a49940204`
- README.md - source: `/mfogel/polygon-clipping/blob/main/README.md`
- Fix typo in codecov badge url - source: `/mfogel/polygon-clipping/commit/b064f942061e9820c53a462ebcccda7407330007`
- babel.config.cjs - source: `/mfogel/polygon-clipping/blob/main/babel.config.cjs`
- package-lock.json - source: `/mfogel/polygon-clipping/blob/main/package-lock.json`
- package.json - source: `/mfogel/polygon-clipping/blob/main/package.json`
- Update package.json:respository format - source: `/mfogel/polygon-clipping/commit/289151d5cf7413d215d38cc7d42bf10ac26df586`
- paper.pdf - source: `/mfogel/polygon-clipping/blob/main/paper.pdf`
- Update README, add paper describing algorithm - source: `/mfogel/polygon-clipping/commit/ea2d64b301801257913b29775a3ed85183269dcd`
- prettier.config.cjs - source: `/mfogel/polygon-clipping/blob/main/prettier.config.cjs`
- rollup.config.js - source: `/mfogel/polygon-clipping/blob/main/rollup.config.js`
- [https://github.com/mfogel/polygon-clipping/actions](https://github.com/mfogel/polygon-clipping/actions)
- [https://codecov.io/gh/mfogel/polygon-clipping](https://codecov.io/gh/mfogel/polygon-clipping)
- [https://opensource.org/licenses/MIT](https://opensource.org/licenses/MIT)
- [https://www.npmjs.com/package/polygon-clipping](https://www.npmjs.com/package/polygon-clipping)
- [GeoJSON spec](https://tools.ietf.org/html/rfc7946#section-3.1)
- [non-zero rule](https://en.wikipedia.org/wiki/Nonzero-rule)
- [GitHub's helpful rendering of GeoJSON files](https://help.github.com/articles/mapping-geojson-files-on-github/)
- here - source: `/mfogel/polygon-clipping/blob/main/test/end-to-end`
- [Semantic Versioning](https://semver.org/)
- [CHANGELOG.md](https://github.com/mfogel/polygon-clipping/blob/master/CHANGELOG.md)
- [Mike Fogel](https://github.com/mfogel)
- [Alexander Milevski](https://github.com/w8r)
- [Vladimir Ovsyannikov](https://github.com/sh1ng)
- [Alantgeo](https://www.alantgeo.com.au/)
- [EasyTerritory](https://www.easyterritory.com/)
- Releases - source: `/mfogel/polygon-clipping/releases`
- Used by - source: `/mfogel/polygon-clipping/network/dependents`
- Contributors - source: `/mfogel/polygon-clipping/graphs/contributors`
- /w8r - source: `/w8r`
- /rowanwins - source: `/rowanwins`
- /DenisCarriere - source: `/DenisCarriere`
- /erf - source: `/erf`
- /barnabas-avalara - source: `/barnabas-avalara`
- /dependabot[bot] - source: `/dependabot[bot]`
- /sh1ng - source: `/sh1ng`
- /jliebrand - source: `/jliebrand`
- /OliverColeman - source: `/OliverColeman`
- /joelgallant - source: `/joelgallant`
- /bgschiller - source: `/bgschiller`
- /lyrachord - source: `/lyrachord`
- /mfedderly - source: `/mfedderly`
- JavaScript 100% - source: `/mfogel/polygon-clipping/search?l=javascript`
- [https://github.com](https://github.com)
- [Terms](https://docs.github.com/site-policy/github-terms/github-terms-of-service)
- [Privacy](https://docs.github.com/site-policy/privacy-policies/github-privacy-statement)
- [Security](https://github.com/security)
- [Status](https://www.githubstatus.com/)
- [Community](https://github.community/)
- [Docs](https://docs.github.com/)
- [Contact](https://support.github.com?tags=dotcom-footer)
-->

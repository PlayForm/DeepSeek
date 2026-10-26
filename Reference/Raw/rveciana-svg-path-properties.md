# svg-path-properties

Pure Javascript alternative to getPointAtLength(t) and getTotalLength() functions. Works with Canvas
objects and when Node

JavaScript can access to path elements properties in a browser, such as its length and the point at
a given length. Unfortunately, this can't be achieved using a Canvas element or when working with
node. This library can be used to replace this need. It has no dependencies on other JavaScript
libraries.

## INSTALL

To use with npm, just type

```
npm install svg-path-properties
```

The package is lightweight with no dependencies (~20KB gzipped).

You can use it in the browser directly by including _svg-path-properties.min.js_ from the dist
directory

```
<script src="svg-path-properties.min.js"></script>
```

## USAGE

The available methods are:

```
const path = require("svg-path-properties");
const properties = new path.svgPathProperties("M0,100 Q50,-50 100,100 T200,100");
const length = properties.getTotalLength();
const point = properties.getPointAtLength(200);
const tangent = properties.getTangentAtLength(200);
const allProperties = properties.getPropertiesAtLength(200);
const parts = properties.getParts();
```

### `getTotalLength()`

Returns the total length of the path.

### `getPointAtLength(pos)`

Returns `{ x, y }` — the coordinates at the given distance along the path.

### `getTangentAtLength(pos)`

Returns `{ x, y }` — the normalized tangent vector at the given distance.

### `getPropertiesAtLength(pos)`

Returns `{ x, y, tangentX, tangentY }` — point and tangent combined.

### `getParts()`

Returns an array of segment objects, one per path command (move commands are skipped). Each object
has:

| Property                     | Description                                  |
| ---------------------------- | -------------------------------------------- |
| `start`                      | `{ x, y }` — start point of the segment      |
| `end`                        | `{ x, y }` — end point of the segment        |
| `length`                     | Arc length of the segment                    |
| `getPointAtLength(pos)`      | Point at local distance within the segment   |
| `getTangentAtLength(pos)`    | Tangent at local distance within the segment |
| `getPropertiesAtLength(pos)` | Point and tangent combined                   |
| `details`                    | Raw segment parameters (see below)           |

#### `details` — segment parameters

Each segment's `details` is a tuple in SVG notation with the **uppercase command letter** and all
coordinates in **absolute form**:

| Tuple                                                     | Segment type                                                   |
| --------------------------------------------------------- | -------------------------------------------------------------- |
| `['L', x, y]`                                             | Line to                                                        |
| `['H', x]`                                                | Horizontal line to                                             |
| `['V', y]`                                                | Vertical line to                                               |
| `['Z']`                                                   | Close path                                                     |
| `['C', cp1x, cp1y, cp2x, cp2y, x, y]`                     | Cubic Bézier                                                   |
| `['Q', cpx, cpy, x, y]`                                   | Quadratic Bézier                                               |
| `['A', rx, ry, xRotation, largeArcFlag, sweepFlag, x, y]` | Elliptical arc (`largeArcFlag` and `sweepFlag` are `0` or `1`) |

Example — parametric interpolation along a cubic Bézier at evenly-spaced `t` values instead of
arc-length:

```
import { svgPathProperties } from "svg-path-properties";

const parts = new svgPathProperties("M0,0 C10,20 30,40 50,0").getParts();
for (const part of parts) {
  if (part.details[0] === 'C') {
    const [, cp1x, cp1y, cp2x, cp2y, x, y] = part.details;
    // evaluate cubic Bézier at t=0.5
    const t = 0.5;
    const px = Math.pow(1-t,3)*part.start.x + 3*Math.pow(1-t,2)*t*cp1x + 3*(1-t)*t*t*cp2x + t*t*t*x;
    const py = Math.pow(1-t,3)*part.start.y + 3*Math.pow(1-t,2)*t*cp1y + 3*(1-t)*t*t*cp2y + t*t*t*y;
  }
}
```

### Node

```
const path = require("svg-path-properties");
const properties = new path.svgPathProperties("M0,100 Q50,-50 100,100 T200,100");
```

### Including it from an import

```
import { svgPathProperties } from "svg-path-properties";
const properties = new svgPathProperties("M0,100 Q50,-50 100,100 T200,100");
```

### Including the script in the browser

Once the _script_ tag has been included,

```
const properties = new svgPathProperties.svgPathProperties("M0,100 Q50,-50 100,100 T200,100");
```

### Using _new_

Since _svgPathProperties_ is a class, using _new_ is the correct way to initilize it. For backwards
compatibility reasons, the object can be get without it:

```
const properties = svgPathProperties("M0,100 Q50,-50 100,100 T200,100");
```

## Some usage examples

- [Drawing an animated path](http://bl.ocks.org/rveciana/209fa7efeb01f05fa4a544a76ac8ed91)
- [Label positioning](http://bl.ocks.org/rveciana/bef48021e38a77a520109d2088bff9eb)
- [Drawing stramlines arrows](http://bl.ocks.org/rveciana/edb1dd43f3edc5d16ecaf4839c032dec)
- [Using it to get a length when in node instead of the browser](https://github.com/veltman/flubber/blob/master/src/svg.js),
  as in the [Flubber library](https://github.com/veltman/flubber)
- [SVG animations in React Native](https://bitbucket.org/ingenuityph/react-native-svg-animations/src/master/)

## Typescript

The TypeScript declaration file is available too, since version 0.5.0. From version 1.0.0, the whole
library has been rewritten using TypeScript, and the types are auto-generated.

All public APIs are fully documented with JSDoc comments for better IDE support.

## CREDITS

Some parts of the code are taken from other libraries or questions at StackOverflow:

For Bézier curves:

- [example in bl.ocks.org](http://bl.ocks.org/hnakamur/e7efd0602bfc15f66fc5),
  [gist code](https://gist.github.com/tunght13488/6744e77c242cc7a94859)

- [Stack overflow question](http://stackoverflow.com/questions/11854907/calculate-the-length-of-a-segment-of-a-quadratic-bezier)

- [A Primer on Bézier Curves](http://pomax.github.io/bezierinfo)

- [Arc elements calculation](https://github.com/MadLittleMods/svg-curve-lib/tree/f07d6008a673816f4cb74a3269164b430c3a95cb)

- [path parsing](https://github.com/jkroso/parse-svg-path)

<!--
## Source links

- [/](./index.md) - source: /
- [Sign in](./login?return_to=https%3A%2F%2Fgithub.com%2Frveciana%2Fsvg-path-properties.md) - source: /login?return_to=https%3A%2F%2Fgithub.com%2Frveciana%2Fsvg-path-properties
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
- [Sign up](./signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E&source=header-repo&source_repo=rveciana%2Fsvg-path-properties.md) - source: /signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E&source=header-repo&source_repo=rveciana%2Fsvg-path-properties
- [rveciana](./rveciana.md) - source: /rveciana
- [svg-path-properties](./rveciana-svg-path-properties.md) - source: /rveciana/svg-path-properties
- [Issues 65](./rveciana-svg-path-properties-issues.md) - source: /rveciana/svg-path-properties/issues
- [Pull requests 6](./rveciana-svg-path-properties-pulls.md) - source: /rveciana/svg-path-properties/pulls
- [Actions](./rveciana-svg-path-properties-actions.md) - source: /rveciana/svg-path-properties/actions
- [Projects](./rveciana-svg-path-properties-projects.md) - source: /rveciana/svg-path-properties/projects
- [Security and quality](./rveciana-svg-path-properties-security.md) - source: /rveciana/svg-path-properties/security
- [Insights](./rveciana-svg-path-properties-pulse.md) - source: /rveciana/svg-path-properties/pulse
- [Notifications](./login?return_to=%2Frveciana%2Fsvg-path-properties.md) - source: /login?return_to=%2Frveciana%2Fsvg-path-properties
- [Code of conduct](./rveciana-svg-path-properties.md#coc-ov-file) - source: /rveciana/svg-path-properties#coc-ov-file
- [Activity](./rveciana-svg-path-properties-activity.md) - source: /rveciana/svg-path-properties/activity
- [22 forks](./rveciana-svg-path-properties-forks.md) - source: /rveciana/svg-path-properties/forks
- [Report repository](./contact-report-content?content_url=https%3A%2F%2Fgithub.com%2Frveciana%2Fsvg-path-properties&report=rveciana+%28user%29.md) - source: /contact/report-content?content_url=https%3A%2F%2Fgithub.com%2Frveciana%2Fsvg-path-properties&report=rveciana+%28user%29
- [15 Branches](./rveciana-svg-path-properties-branches.md) - source: /rveciana/svg-path-properties/branches
- [46 Tags](./rveciana-svg-path-properties-tags.md) - source: /rveciana/svg-path-properties/tags
- [rveciana](./rveciana-svg-path-properties-commits?author=rveciana.md) - source: /rveciana/svg-path-properties/commits?author=rveciana
- [2.2.0](./rveciana-svg-path-properties-commit-d67531110946126465efcc1f7175a3f06a5ef67d.md) - source: /rveciana/svg-path-properties/commit/d67531110946126465efcc1f7175a3f06a5ef67d
- [240 Commits](./rveciana-svg-path-properties-commits-main.md) - source: /rveciana/svg-path-properties/commits/main/
- [.changeset](./rveciana-svg-path-properties-tree-main-.changeset.md) - source: /rveciana/svg-path-properties/tree/main/.changeset
- [chore: new release](./rveciana-svg-path-properties-commit-56617efe19ee09c57976a18a834a85c1debd14ab.md) - source: /rveciana/svg-path-properties/commit/56617efe19ee09c57976a18a834a85c1debd14ab
- [.github](./rveciana-svg-path-properties-tree-main-.github.md) - source: /rveciana/svg-path-properties/tree/main/.github
- [ci: upgrade npm to 11.x for Trusted Publishing support](./rveciana-svg-path-properties-commit-039375fb940d022c8442f17301b896b918a3d360.md) - source: /rveciana/svg-path-properties/commit/039375fb940d022c8442f17301b896b918a3d360
- [.husky](./rveciana-svg-path-properties-tree-main-.husky.md) - source: /rveciana/svg-path-properties/tree/main/.husky
- [Upgrade libraries](./rveciana-svg-path-properties-commit-5c64a399035ed0f5248b2986cfed41b56ffc3b55.md) - source: /rveciana/svg-path-properties/commit/5c64a399035ed0f5248b2986cfed41b56ffc3b55
- [.opencode](./rveciana-svg-path-properties-tree-main-.opencode.md) - source: /rveciana/svg-path-properties/tree/main/.opencode
- [Add mcp](./rveciana-svg-path-properties-commit-9ea401d78b3779faf30638fcacb67825cc92285b.md) - source: /rveciana/svg-path-properties/commit/9ea401d78b3779faf30638fcacb67825cc92285b
- [.vscode](./rveciana-svg-path-properties-tree-main-.vscode.md) - source: /rveciana/svg-path-properties/tree/main/.vscode
- [Prepare package for typescript](./rveciana-svg-path-properties-commit-9fc43ad543aa787d5c5a0a0362465a69bb9e18ef.md) - source: /rveciana/svg-path-properties/commit/9fc43ad543aa787d5c5a0a0362465a69bb9e18ef
- [dist](./rveciana-svg-path-properties-tree-main-dist.md) - source: /rveciana/svg-path-properties/tree/main/dist
- [chore: reduce package size and improve code quality](./rveciana-svg-path-properties-commit-58a2cfde7f24ff53fc147c08eb2a40df516ffe06.md) - source: /rveciana/svg-path-properties/commit/58a2cfde7f24ff53fc147c08eb2a40df516ffe06
- [src](./rveciana-svg-path-properties-tree-main-src.md) - source: /rveciana/svg-path-properties/tree/main/src
- [Give a tangent where a control point sits on its anchor](./rveciana-svg-path-properties-commit-880e50e0ae55836b827258b40a4690c9d6390b7f.md) - source: /rveciana/svg-path-properties/commit/880e50e0ae55836b827258b40a4690c9d6390b7f
- [test](./rveciana-svg-path-properties-tree-main-test.md) - source: /rveciana/svg-path-properties/tree/main/test
- [.gitignore](./rveciana-svg-path-properties-blob-main-.gitignore.md) - source: /rveciana/svg-path-properties/blob/main/.gitignore
- [feat: expose segment details via getDetails() and getParts().details](./rveciana-svg-path-properties-commit-16ed66c66fa0bd532adf0e9552361acb7020d157.md) - source: /rveciana/svg-path-properties/commit/16ed66c66fa0bd532adf0e9552361acb7020d157
- [.prettierignore](./rveciana-svg-path-properties-blob-main-.prettierignore.md) - source: /rveciana/svg-path-properties/blob/main/.prettierignore
- [.prettierrc.json](./rveciana-svg-path-properties-blob-main-.prettierrc.json.md) - source: /rveciana/svg-path-properties/blob/main/.prettierrc.json
- [CHANGELOG.md](./rveciana-svg-path-properties-blob-main-CHANGELOG.md.md) - source: /rveciana/svg-path-properties/blob/main/CHANGELOG.md
- [CODE_OF_CONDUCT.md](./rveciana-svg-path-properties-blob-main-CODE_OF_CONDUCT.md.md) - source: /rveciana/svg-path-properties/blob/main/CODE_OF_CONDUCT.md
- [Create CODE_OF_CONDUCT.md](./rveciana-svg-path-properties-commit-1fc8520691a56e3573fc18bbe1e5a83fa86a3d8b.md) - source: /rveciana/svg-path-properties/commit/1fc8520691a56e3573fc18bbe1e5a83fa86a3d8b
- [LICENSE](./rveciana-svg-path-properties-blob-main-LICENSE.md) - source: /rveciana/svg-path-properties/blob/main/LICENSE
- [Initial commit](./rveciana-svg-path-properties-commit-eeb900f87aef517677ea9d9bd238abb243aed84e.md) - source: /rveciana/svg-path-properties/commit/eeb900f87aef517677ea9d9bd238abb243aed84e
- [README.md](./rveciana-svg-path-properties-blob-main-README.md.md) - source: /rveciana/svg-path-properties/blob/main/README.md
- [RELEASE.md](./rveciana-svg-path-properties-blob-main-RELEASE.md.md) - source: /rveciana/svg-path-properties/blob/main/RELEASE.md
- [eslint.config.js](./rveciana-svg-path-properties-blob-main-eslint.config.js.md) - source: /rveciana/svg-path-properties/blob/main/eslint.config.js
- [opencode.json](./rveciana-svg-path-properties-blob-main-opencode.json.md) - source: /rveciana/svg-path-properties/blob/main/opencode.json
- [package-lock.json](./rveciana-svg-path-properties-blob-main-package-lock.json.md) - source: /rveciana/svg-path-properties/blob/main/package-lock.json
- [package.json](./rveciana-svg-path-properties-blob-main-package.json.md) - source: /rveciana/svg-path-properties/blob/main/package.json
- [tsconfig.json](./rveciana-svg-path-properties-blob-main-tsconfig.json.md) - source: /rveciana/svg-path-properties/blob/main/tsconfig.json
- [tsup.config.ts](./rveciana-svg-path-properties-blob-main-tsup.config.ts.md) - source: /rveciana/svg-path-properties/blob/main/tsup.config.ts
- [Drawing an animated path](http://bl.ocks.org/rveciana/209fa7efeb01f05fa4a544a76ac8ed91)
- [Label positioning](http://bl.ocks.org/rveciana/bef48021e38a77a520109d2088bff9eb)
- [Drawing stramlines arrows](http://bl.ocks.org/rveciana/edb1dd43f3edc5d16ecaf4839c032dec)
- [Using it to get a length when in node instead of the browser](https://github.com/veltman/flubber/blob/master/src/svg.js)
- [Flubber library](https://github.com/veltman/flubber)
- [SVG animations in React Native](https://bitbucket.org/ingenuityph/react-native-svg-animations/src/master/)
- [example in bl.ocks.org](http://bl.ocks.org/hnakamur/e7efd0602bfc15f66fc5)
- [gist code](https://gist.github.com/tunght13488/6744e77c242cc7a94859)
- [Stack overflow question](http://stackoverflow.com/questions/11854907/calculate-the-length-of-a-segment-of-a-quadratic-bezier)
- [A Primer on Bézier Curves](http://pomax.github.io/bezierinfo)
- [Arc elements calculation](https://github.com/MadLittleMods/svg-curve-lib/tree/f07d6008a673816f4cb74a3269164b430c3a95cb)
- [path parsing](https://github.com/jkroso/parse-svg-path)
- [Releases](./rveciana-svg-path-properties-releases.md) - source: /rveciana/svg-path-properties/releases
- [v2.2.0 Latest Oct 16, 2026](./rveciana-svg-path-properties-releases-tag-v2.2.0.md) - source: /rveciana/svg-path-properties/releases/tag/v2.2.0
- [Used by](./rveciana-svg-path-properties-network-dependents.md) - source: /rveciana/svg-path-properties/network/dependents
- [Contributors](./rveciana-svg-path-properties-graphs-contributors.md) - source: /rveciana/svg-path-properties/graphs/contributors
- [/RogerVecianaAbzu](./RogerVecianaAbzu.md) - source: /RogerVecianaAbzu
- [/dependabot[bot]](./dependabot[bot].md) - source: /dependabot[bot]
- [/scien](./scien.md) - source: /scien
- [/ievgennaida](./ievgennaida.md) - source: /ievgennaida
- [/github-actions[bot]](./github-actions[bot].md) - source: /github-actions[bot]
- [/Rheeseyb](./Rheeseyb.md) - source: /Rheeseyb
- [/chrisparton1991](./chrisparton1991.md) - source: /chrisparton1991
- [/wcandillon](./wcandillon.md) - source: /wcandillon
- [/punkt2](./punkt2.md) - source: /punkt2
- [/veltman](./veltman.md) - source: /veltman
- [/dgrcode](./dgrcode.md) - source: /dgrcode
- [/FrankSandqvist](./FrankSandqvist.md) - source: /FrankSandqvist
- [/zHaytam](./zHaytam.md) - source: /zHaytam
- [TypeScript 91.6%](./rveciana-svg-path-properties-search?l=typescript.md) - source: /rveciana/svg-path-properties/search?l=typescript
- [HTML 6.9%](./rveciana-svg-path-properties-search?l=html.md) - source: /rveciana/svg-path-properties/search?l=html
- [JavaScript 1.2%](./rveciana-svg-path-properties-search?l=javascript.md) - source: /rveciana/svg-path-properties/search?l=javascript
- [Shell 0.3%](./rveciana-svg-path-properties-search?l=shell.md) - source: /rveciana/svg-path-properties/search?l=shell
- [https://github.com](https://github.com)
- [Terms](https://docs.github.com/site-policy/github-terms/github-terms-of-service)
- [Privacy](https://docs.github.com/site-policy/privacy-policies/github-privacy-statement)
- [Security](https://github.com/security)
- [Status](https://www.githubstatus.com/)
- [Community](https://github.community/)
- [Docs](https://docs.github.com/)
- [Contact](https://support.github.com?tags=dotcom-footer)
-->

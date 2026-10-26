[Skip to content](#start-of-content) Sign in Appearance settings Sign in Sign up Appearance settings {{ message }}

[](./danmarshall-svg-path-outline.md) ![danmarshall](https://avatars.githubusercontent.com/u/11507384?s=60&v=4)**[svg-path-outline](./danmarshall-svg-path-outline.md)** Public

- Notifications You must be signed in to change notification settings
- Fork 8
- Star 77 You must be signed in to star a repository

## About

Create an outline surrounding an SVG path

[danmarshall.github.io/svg-path-outline/browser](https://danmarshall.github.io/svg-path-outline/browser) drawing maker outline svg svg-path [Readme](#readme-ov-file) [Apache-2.0 license](#Apache-2.0-1-ov-file) Activity **77** stars **4** watching **8** forks Report repository**1** Branch **0** TagsOpen more actions menu[![danmarshall](https://avatars.githubusercontent.com/u/11507384?v=4&size=40)](/danmarshall)danmarshallMerge pull request [\#7](https://github.com/danmarshall/svg-path-outline/pull/7) from danmarshall/bezierjs-url Open commit details Feb 20, 2024 c067626 · Feb 20, 2024 29 Commits Open commit details29 Commits

| Name | Name | Last commit message | Last commit date |
|----|----|----|----|
| browser | browser | change url to bezier.js | Feb 20, 2024 |
| .gitignore | .gitignore | Initial commit | Jan 15, 2017 |
| .npmignore | .npmignore | ignore example.png | Feb 28, 2017 |
| LICENSE | LICENSE | Initial commit | Jan 15, 2017 |
| README.md | README.md | add image | Feb 28, 2017 |
| example.png | example.png | improved examples | Feb 28, 2017 |
| index.d.ts | index.d.ts | working version with rainbow example | Feb 28, 2017 |
| index.js | index.js | working version with rainbow example | Feb 28, 2017 |
| index.ts | index.ts | working version with rainbow example | Feb 28, 2017 |
| package.json | package.json | bump tp fix npm | Feb 28, 2017 |
| test.js | test.js | working version with rainbow example | Feb 28, 2017 |
| tsconfig.json | tsconfig.json | working version with rainbow example | Feb 28, 2017 |
|  |  |  |  |

# svg-path-outline


Create an outline surrounding an SVG path

[!Image of example outlines](/danmarshall/svg-path-outline/blob/master/example.png)

A stroke is typically used to outline an SVG element. Use this package if you need an actual SVG path instead. When corners are outlined, you have the option of specifying the style of joint: round, square, or beveled.

Live demo: <https://danmarshall.github.io/svg-path-outline/browser>

## Installation


### Node


```
npm install svg-path-outline --save
```

### Browser


\<script src="https://pomax.github.io/bezierjs/bezier.js" type="text/javascript"\>\</script\>\
\<script src="https://microsoft.github.io/maker.js/target/js/browser.maker.js" type="text/javascript"\>\</script\>\
\<script src="https://danmarshall.github.io/svg-path-outline/browser/index.js" type="text/javascript"\>\</script\>

## Usage


var spo = require('svg-path-outline');\
\
var outline = spo(svgData, distance, options);

## Parameters


### svgData


Input is a string of either SVG `path` data, or point coordinates from SVG `polyline` or `polygon`.

### distance


Numeric distance to offset the outline.

### options


Object with these optional properties:

<table>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<thead>
<tr>
<th>option</th>
<th>type</th>
<th>default</th>
<th>description</th>
</tr>
</thead>
<tbody>
<tr>
<td>joints</td>
<td>number</td>
<td>0</td>
<td>0 - round joints<br />
1 - miter<br />
2 - bevel</td>
</tr>
<tr>
<td>bezierAccuracy</td>
<td>number</td>
<td>0.5</td>
<td>Distance of accuracy for Bezier curves. A lower number is more accurate but requires more computation. Using zero is not recommended as it may never finish computing. This number is relative to the unit system of your SVG; so if you are rendering pixels, then 0.5 is accurate to half a pixel.</td>
</tr>
<tr>
<td>inside</td>
<td>boolean</td>
<td>false</td>
<td>Add offset lines on the inside of the shape</td>
</tr>
<tr>
<td>outside</td>
<td>boolean</td>
<td>true</td>
<td>Add offset lines on the outside of the shape</td>
</tr>
<tr>
<td>tagName</td>
<td>string</td>
<td>'path'</td>
<td>SVG tag name of the type of data:<br />
'path' - SVG path language<br />
'polygon' - point coordinates, closed shape<br />
'polyline' - point coordinates, open shape</td>
</tr>
</tbody>
</table>

### return value


Output is a string of SVG `path` data.

## Examples


Simple example in JavaScript:

var spo = require('svg-path-outline');\
var svgData = "M 95 35 L 59 35 L 48 0 L 36 35 L 0 35 L 29 56 L 18 90 L 48 69 L 77 90 L 66 56 Z";\
var outline = spo(svgData, 10);

Example in HTML:

\<svg id="star" fill="none" stroke="black"\>\
 \<path d="M 95 35 L 59 35 L 48 0 L 36 35 L 0 35 L 29 56 L 18 90 L 48 69 L 77 90 L 66 56 Z" /\>\
\</svg\>\
\
\<script type="text/javascript"\>\
 var spo = require('svg-path-outline');\
 var starPath = document.querySelector('#star path');\
 var d = starPath.getAttribute('d');\
 var outline = spo(d, 10);\
 starPath.setAttribute('d', d + outline);\
\</script\>

## License


Apache 2.0

## About

Create an outline surrounding an SVG path

[danmarshall.github.io/svg-path-outline/browser](https://danmarshall.github.io/svg-path-outline/browser) drawing maker outline svg svg-path [Readme](#readme-ov-file) [Apache-2.0 license](#Apache-2.0-1-ov-file) Activity **77** stars **4** watching **8** forks Report repository

## Releases

No releases published

## Contributors 1 (1)

- [![@danmarshall](https://avatars.githubusercontent.com/u/11507384?s=64&v=4)](/danmarshall)**danmarshall** Dan Marshall

## Languages

- HTML 75.5%
- JavaScript 16.8%
- TypeScript 7.7%

You can’t perform that action at this time.

<!--
## Source links

- / - source: `/`
- Sign in - source: `/login?return_to=https%3A%2F%2Fgithub.com%2Fdanmarshall%2Fsvg-path-outline`
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
- Sign up - source: `/signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E&source=header-repo&source_repo=danmarshall%2Fsvg-path-outline`
- danmarshall - source: `/danmarshall`
- [svg-path-outline](./danmarshall-svg-path-outline.md) - source: /danmarshall/svg-path-outline
- Issues 5 - source: `/danmarshall/svg-path-outline/issues`
- Pull requests - source: `/danmarshall/svg-path-outline/pulls`
- Actions - source: `/danmarshall/svg-path-outline/actions`
- Projects - source: `/danmarshall/svg-path-outline/projects`
- Security and quality - source: `/danmarshall/svg-path-outline/security`
- Insights - source: `/danmarshall/svg-path-outline/pulse`
- Notifications - source: `/login?return_to=%2Fdanmarshall%2Fsvg-path-outline`
- [danmarshall.github.io/svg-path-outline/browser](https://danmarshall.github.io/svg-path-outline/browser)
- drawing - source: `/topics/drawing`
- maker - source: `/topics/maker`
- outline - source: `/topics/outline`
- svg - source: `/topics/svg`
- svg-path - source: `/topics/svg-path`
- Activity - source: `/danmarshall/svg-path-outline/activity`
- 8 forks - source: `/danmarshall/svg-path-outline/forks`
- Report repository - source: `/contact/report-content?content_url=https%3A%2F%2Fgithub.com%2Fdanmarshall%2Fsvg-path-outline&report=danmarshall+%28user%29`
- 1 Branch - source: `/danmarshall/svg-path-outline/branches`
- 0 Tags - source: `/danmarshall/svg-path-outline/tags`
- danmarshall - source: `/danmarshall/svg-path-outline/commits?author=danmarshall`
- Merge pull request - source: `/danmarshall/svg-path-outline/commit/c067626ac34b82b98eefafb8d83071349d991b4b`
- [#7](https://github.com/danmarshall/svg-path-outline/pull/7)
- 29 Commits - source: `/danmarshall/svg-path-outline/commits/master/`
- browser - source: `/danmarshall/svg-path-outline/tree/master/browser`
- change url to bezier.js - source: `/danmarshall/svg-path-outline/commit/1180afb7c5f5da55bfa6b85fa267497458c7b48b`
- .gitignore - source: `/danmarshall/svg-path-outline/blob/master/.gitignore`
- Initial commit - source: `/danmarshall/svg-path-outline/commit/bfefedd86637e5da8fa2992542a3fe5a0de79287`
- .npmignore - source: `/danmarshall/svg-path-outline/blob/master/.npmignore`
- ignore example.png - source: `/danmarshall/svg-path-outline/commit/bec112dafae9a68c1567c87041c715429f59299a`
- LICENSE - source: `/danmarshall/svg-path-outline/blob/master/LICENSE`
- README.md - source: `/danmarshall/svg-path-outline/blob/master/README.md`
- add image - source: `/danmarshall/svg-path-outline/commit/81f2a540c7e6bc7f13066358dcb51631c7e71b70`
- example.png - source: `/danmarshall/svg-path-outline/blob/master/example.png`
- improved examples - source: `/danmarshall/svg-path-outline/commit/81ca6cade02514887b1e5c6265ea613434920d89`
- index.d.ts - source: `/danmarshall/svg-path-outline/blob/master/index.d.ts`
- working version with rainbow example - source: `/danmarshall/svg-path-outline/commit/39668bb3a36edc640ffca21337ee9b8330ff18e1`
- index.js - source: `/danmarshall/svg-path-outline/blob/master/index.js`
- index.ts - source: `/danmarshall/svg-path-outline/blob/master/index.ts`
- package.json - source: `/danmarshall/svg-path-outline/blob/master/package.json`
- bump tp fix npm - source: `/danmarshall/svg-path-outline/commit/1e29fde8fea8e559691e44e51420339864a920b7`
- test.js - source: `/danmarshall/svg-path-outline/blob/master/test.js`
- tsconfig.json - source: `/danmarshall/svg-path-outline/blob/master/tsconfig.json`
- Releases - source: `/danmarshall/svg-path-outline/releases`
- Contributors - source: `/danmarshall/svg-path-outline/graphs/contributors`
- HTML 75.5% - source: `/danmarshall/svg-path-outline/search?l=html`
- JavaScript 16.8% - source: `/danmarshall/svg-path-outline/search?l=javascript`
- TypeScript 7.7% - source: `/danmarshall/svg-path-outline/search?l=typescript`
- [https://github.com](https://github.com)
- [Terms](https://docs.github.com/site-policy/github-terms/github-terms-of-service)
- [Privacy](https://docs.github.com/site-policy/privacy-policies/github-privacy-statement)
- [Security](https://github.com/security)
- [Status](https://www.githubstatus.com/)
- [Community](https://github.community/)
- [Docs](https://docs.github.com/)
- [Contact](https://support.github.com?tags=dotcom-footer)
-->

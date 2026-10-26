# svg-path-intersections

A standalone library to get intersections between two SVG paths. ~ 16KB minified/ 7KB gzipped.

- **versatile:** support for paths, shapes (circles, rectangles, polygons etc.)
- **performant:** optimized by conditional calculation methods for different element types
- runs in \*\*browser \*\*and headless environments like **node**

It includes a path data parser compliant with the
[W3C SVGPathData interface draft](https://svgwg.org/specs/paths/#InterfaceSVGPathData) and can
handle all minified stringified path data inputs (especially `A` commands with concatenated
largeArc, sweep and final on-path parameters "bomb" quite a few other libraries).

[![touching points](https://raw.githubusercontent.com/herrstrietzel/svg-path-intersections/main/img/intersections.png)](https://raw.githubusercontent.com/herrstrietzel/svg-path-intersections/main/img/intersections.png)

- [Usage](#usage)
    - [Browser](#browser)
    - [Node](#node)
- [Parameters/Options](#parameters-options)
- [Methods](#methods)
    - [Intersections between shapes via svgEl() helper method](#intersections-between-shapes-via-svgel-helper-method)
    - [Adjacent "touching" paths](#adjacent-touching-paths)
- [Related repositories](#related-repositories)
- [Similar libraries](#similar-libraries)
- [Credits](#credits)

## Usage

You can either pass

- stringified path data
- a path data array
- a custom shape object using the `svgEl()` helper

```
let intersections = findPathIntersections(d1, d2)
```

or use it alongside with other path data parsers like
[Jarek Foksa's pathdata-polyfill](https://github.com/jarek-foksa/path-data-polyfill) and pass
already parsed path data arrays to the `findPathDataIntersections()` method.

```
let checkCollision = checkCollision(pathData1, pathData2) // returns true or false
```

### Browser

```
<script src="https://cdn.jsdelivr.net/npm/svg-path-intersections@latest/js/svg-path-intersections_standalone.min.js"></script>
```

or

```
<script src="https://unpkg.com/svg-path-intersections@latest/js/svg-path-intersections_standalone.js"></script>
```

```
let d1 = 'M 75 0 a 1 1 45 010 100 1 1 45 010 -100'
let d2 = 'M 50 0 a 1 1 45 010 100 1 1 45 010 -100'

let intersections= findPathIntersections(d1, d2);
console.log(JSON.stringify(intersections, null, ' '));
```

### Node

```
const pathIntersections = require('svg-path-intersections');
const {findPathIntersections, checkPathIntersection, findPathDataIntersections, pointAtT, parsePathDataNormalized} = pathIntersections;


let d1 = 'M 75 0 a 1 1 45 010 100 1 1 45 010 -100'
let d2 = 'M 50 0 a 1 1 45 010 100 1 1 45 010 -100'

let intersections= findPathIntersections(d1, d2);
console.log(JSON.stringify(intersections, null, ' '));
```

## Parameters/Options

| Option               | values/default    | Effect                                                                                                                       |
| -------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| pathData1, pathData2 | path data input   | accepts stringified pathdata or parsed arrays                                                                                |
| stopAtFirst          | false             | stop search after first occurrence: helps to speed up processing e.g. for collision checks                                   |
| quality              | low, medium, high | default: "medium"; higher quality results in more accurate coordinates and `t` values at the cost of longer processing times |

## Methods

- `findPathIntersections(pathData1, pathData2, stopAtFirst, quality)` : finds all intersections
- `checkCollision(d1, d2)`: stops at first intersection – faster than finding all occurences
- `pointAtT(points, t)`: calculates point at `t` value for lines, quadratic or cubic béziers:
    - **cubic bézier:** `pointAtT([{x:0, y:0}, {x:0, y:0}, {x:0, y:0}, {x:0, y:0} ], 0.5)`\
      \(1\. previous end point, 2. first control point, 3. second control point, 4. final on-path
      point)
    - **quadratic bézier:** `pointAtT([{x:0, y:0}, {x:0, y:0}, {x:0, y:0} ], 0.5)`\
      \(1\. previous end point, 2. first control point, 3. final on-path point)
    - **lineto** `pointAtT([{x:0, y:0}, {x:0, y:0}], 0.5)`\
      \(1\. previous end point, 2. final on-path point)
- `parsePathDataNormalized(d, options)`\
  Parse stringified pathdata to array with normalization options. See
  [complete version with all options](https://github.com/herrstrietzel/svg-parse-path-normalized)\
  **Default options:** toAbsolute, toLonghands, arcToCubics

### Intersections between shapes via `svgEl()` helper method

You can use this helper to add all svg geometry elements like so

```
let circle = svgEl(cx:10, cy:10, r: 10);

let ellipse = svgEl(cx:10, cy:10, rx: 10, ry:20 );

let path = svgEl(d: 'M 75 0 a 1 1 45 010 100 1 1 45 010 -100' );

// accepts an array of numbers or a string
let polygon = svgEl(points: '70 50 70 50 67.7 61.5 61.2 71.2 51.5 77.7 40 80 28.5 77.7 18.8 71.2 12.3 61.5 10 50 12.3 38.5 18.8 28.8 28.5 22.3 40 20 51.5 22.3 61.2 28.8 67.7 38.5' );

let polyline = svgEl(points: '70 50 70 50 67.7 61.5 61.2 71.2 51.5 77.7 40 80 28.5 77.7 18.8 71.2 12.3 61.5 10 50 12.3 38.5 18.8 28.8 28.5 22.3 40 20 51.5 22.3 61.2 28.8 67.7 38.5', type:'polyline' );

let rect = svgEl(x:10, y:10, width:50, height:50, rx:5, ry:3)

let line = svgEl(x1:10, y1:10, x2:50, y2:50)

// get intersections between shapes

let intersections = findPathIntersections(circle, path)
```

### Intersections between DOM elements

```
let circle = document.querySelector('circle')
let path = document.querySelector('path')
let intersectionsDOM = getElementIntersections(circle, path)
```

### Demos

- [Codepen: multiple path examples and speed test](https://codepen.io/herrstrietzel/pen/bGJyOXB)
- [Simple demo](https://codepen.io/herrstrietzel/pen/mdgZGrz)
- [Shapes](https://codepen.io/herrstrietzel/pen/OJGKxKp)

### Output

The returned intersection array contains:

- x/y coordinates for each intersection
- `t1` and `t2` values for 1. and 2. path segments
- segment indices (at which intersection occurred)
- segment command points (`cpts1` and `cpts2`)

This way, you can calculate coordinates for both paths or split each path at `t` values.

```
[
 {
  "x": 62.50000000097887,
  "y": 98.40012176975786,
  "t1": 0.15651097923256496,
  "t2": 0.8434890204109524,
  "segment1": 3,
  "segment2": 2,
  "cpts1": [
   {
    "x": 74.99999998680912,
    "y": 100
   },
   {
    "x": 47.410749986809115,
    "y": 99.99999999272146
   },
   {
    "x": 24.999999992721463,
    "y": 77.5892499868091
   },
   {
    "x": 25.000000000000014,
    "y": 49.9999999868091
   }
  ],
  "cpts2": [
   {
    "x": 100,
    "y": 50.000000013190885
   },
   {
    "x": 99.99999999272146,
    "y": 77.58925001319088
   },
   {
    "x": 77.58924998680911,
    "y": 100.00000000727853
   },
   {
    "x": 49.999999986809115,
    "y": 100
   }
  ]
 },
 {
  "x": 62.49999999505845,
  "y": 1.5998782311929203,
  "t1": 0.8434890203595754,
  "t2": 0.15651097928396177,
  "segment1": 4,
  "segment2": 1,
  "cpts1": [
   {
    "x": 25.000000000000014,
    "y": 49.9999999868091
   },
   {
    "x": 25.000000007278558,
    "y": 22.41074998680911
   },
   {
    "x": 47.410750013190906,
    "y": -7.278536884314235e-9
   },
   {
    "x": 75.0000000131909,
    "y": 1.4210854715202004e-14
   }
  ],
  "cpts2": [
   {
    "x": 50,
    "y": 0
   },
   {
    "x": 77.58925001319088,
    "y": 7.278543989741593e-9
   },
   {
    "x": 100.00000000727853,
    "y": 22.4107500131909
   },
   {
    "x": 100,
    "y": 50.000000013190885
   }
  ]
 }
]
```

### Adjacent "touching" paths

Unlike other libraries path-intersections will also detect touching paths.

[![touching points](https://raw.githubusercontent.com/herrstrietzel/svg-path-intersections/main/img/touching-paths.png)](https://raw.githubusercontent.com/herrstrietzel/svg-path-intersections/main/img/touching-paths.png)

## Related repositories

- [svg-parse-path-normalized](https://github.com/herrstrietzel/svg-parse-path-normalized) – Parse
  path data from string including fine-grained normalizing options
- [svg-getpointatlength](https://github.com/herrstrietzel/svg-getpointatlength) – calculate path
  length and point at paths on raw path data

## Similar libraries

- [thelonious's "kld-intersections"](https://github.com/thelonious/kld-intersections)
- [Pomax's "bezierjs"](https://github.com/Pomax/bezierjs)
- [bpmn-io's "path-intersection"](https://github.com/bpmn-io/path-intersection)

## Credits

- Jarek Foksa for his [great polyfill](https://github.com/jarek-foksa/path-data-polyfill) heavily
  inspring to adopt the new pathData interface methodology and for contributing to the specification
- Dmitry Baranovskiy for (raphael.j/snap.svg)
  [pathToAbsolute/Relative functions](https://github.com/DmitryBaranovskiy/raphael/blob/master/raphael.js#L1848)
- Vitaly Puzrin (fontello) for the arc to cubic conversion method
  [a2c.js](https://github.com/fontello/svgpath/blob/master/lib/a2c.js) and
  [cubic to quadratic approximation](https://github.com/fontello/cubic2quad/blob/master/test/cubic2quad.js)
- Mike "POMAX" Kammermans for his great
  [A Primer on Bézier Curves](https://pomax.github.io/bezierinfo)

<!--
## Source links

- [/](./index.md) - source: /
- [Sign in](./login?return_to=https%3A%2F%2Fgithub.com%2Fherrstrietzel%2Fsvg-path-intersections.md) - source: /login?return_to=https%3A%2F%2Fgithub.com%2Fherrstrietzel%2Fsvg-path-intersections
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
- [Sign up](./signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E&source=header-repo&source_repo=herrstrietzel%2Fsvg-path-intersections.md) - source: /signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E&source=header-repo&source_repo=herrstrietzel%2Fsvg-path-intersections
- [herrstrietzel](./herrstrietzel.md) - source: /herrstrietzel
- [svg-path-intersections](./herrstrietzel-svg-path-intersections.md) - source: /herrstrietzel/svg-path-intersections
- [Issues 2](./herrstrietzel-svg-path-intersections-issues.md) - source: /herrstrietzel/svg-path-intersections/issues
- [Pull requests](./herrstrietzel-svg-path-intersections-pulls.md) - source: /herrstrietzel/svg-path-intersections/pulls
- [Actions](./herrstrietzel-svg-path-intersections-actions.md) - source: /herrstrietzel/svg-path-intersections/actions
- [Projects](./herrstrietzel-svg-path-intersections-projects.md) - source: /herrstrietzel/svg-path-intersections/projects
- [Security and quality](./herrstrietzel-svg-path-intersections-security.md) - source: /herrstrietzel/svg-path-intersections/security
- [Insights](./herrstrietzel-svg-path-intersections-pulse.md) - source: /herrstrietzel/svg-path-intersections/pulse
- [Notifications](./login?return_to=%2Fherrstrietzel%2Fsvg-path-intersections.md) - source: /login?return_to=%2Fherrstrietzel%2Fsvg-path-intersections
- [herrstrietzel.github.io/svg-path-intersections/](https://herrstrietzel.github.io/svg-path-intersections/)
- [intersections](./topics-intersections.md) - source: /topics/intersections
- [svg](./topics-svg.md) - source: /topics/svg
- [Activity](./herrstrietzel-svg-path-intersections-activity.md) - source: /herrstrietzel/svg-path-intersections/activity
- [1 fork](./herrstrietzel-svg-path-intersections-forks.md) - source: /herrstrietzel/svg-path-intersections/forks
- [Report repository](./contact-report-content?content_url=https%3A%2F%2Fgithub.com%2Fherrstrietzel%2Fsvg-path-intersections&report=herrstrietzel+%28user%29.md) - source: /contact/report-content?content_url=https%3A%2F%2Fgithub.com%2Fherrstrietzel%2Fsvg-path-intersections&report=herrstrietzel+%28user%29
- [1 Branch](./herrstrietzel-svg-path-intersections-branches.md) - source: /herrstrietzel/svg-path-intersections/branches
- [0 Tags](./herrstrietzel-svg-path-intersections-tags.md) - source: /herrstrietzel/svg-path-intersections/tags
- [herrstrietzel](./herrstrietzel-svg-path-intersections-commits?author=herrstrietzel.md) - source: /herrstrietzel/svg-path-intersections/commits?author=herrstrietzel
- [update package](./herrstrietzel-svg-path-intersections-commit-f8bbd7bd85f2126fd8d31cd65c603332c6b8b3a4.md) - source: /herrstrietzel/svg-path-intersections/commit/f8bbd7bd85f2126fd8d31cd65c603332c6b8b3a4
- [19 Commits](./herrstrietzel-svg-path-intersections-commits-main.md) - source: /herrstrietzel/svg-path-intersections/commits/main/
- [demo](./herrstrietzel-svg-path-intersections-tree-main-demo.md) - source: /herrstrietzel/svg-path-intersections/tree/main/demo
- [update demos](./herrstrietzel-svg-path-intersections-commit-9d9447c055c3a6a49a227dbca8483ddbf973ef2a.md) - source: /herrstrietzel/svg-path-intersections/commit/9d9447c055c3a6a49a227dbca8483ddbf973ef2a
- [img](./herrstrietzel-svg-path-intersections-tree-main-img.md) - source: /herrstrietzel/svg-path-intersections/tree/main/img
- [screenshots](./herrstrietzel-svg-path-intersections-commit-2f7a6c9bb1266371cb0ed442475af13d3e3e525c.md) - source: /herrstrietzel/svg-path-intersections/commit/2f7a6c9bb1266371cb0ed442475af13d3e3e525c
- [js](./herrstrietzel-svg-path-intersections-tree-main-js.md) - source: /herrstrietzel/svg-path-intersections/tree/main/js
- [new shape methods, congruence checks](./herrstrietzel-svg-path-intersections-commit-a5f384ceff49ba3dc569764ca56b5cb3fa236963.md) - source: /herrstrietzel/svg-path-intersections/commit/a5f384ceff49ba3dc569764ca56b5cb3fa236963
- [.gitignore](./herrstrietzel-svg-path-intersections-blob-main-.gitignore.md) - source: /herrstrietzel/svg-path-intersections/blob/main/.gitignore
- [.npmignore](./herrstrietzel-svg-path-intersections-blob-main-.npmignore.md) - source: /herrstrietzel/svg-path-intersections/blob/main/.npmignore
- [LICENSE](./herrstrietzel-svg-path-intersections-blob-main-LICENSE.md) - source: /herrstrietzel/svg-path-intersections/blob/main/LICENSE
- [Create LICENSE](./herrstrietzel-svg-path-intersections-commit-3ba8cc43fbbf2bbcf54b96da530243e6cfa9181e.md) - source: /herrstrietzel/svg-path-intersections/commit/3ba8cc43fbbf2bbcf54b96da530243e6cfa9181e
- [README.md](./herrstrietzel-svg-path-intersections-blob-main-README.md.md) - source: /herrstrietzel/svg-path-intersections/blob/main/README.md
- [update readme](./herrstrietzel-svg-path-intersections-commit-53afd43fc73d28637a8108f87c2fffad6b0faae0.md) - source: /herrstrietzel/svg-path-intersections/commit/53afd43fc73d28637a8108f87c2fffad6b0faae0
- [index.html](./herrstrietzel-svg-path-intersections-blob-main-index.html.md) - source: /herrstrietzel/svg-path-intersections/blob/main/index.html
- [package.json](./herrstrietzel-svg-path-intersections-blob-main-package.json.md) - source: /herrstrietzel/svg-path-intersections/blob/main/package.json
- [W3C SVGPathData interface draft](https://svgwg.org/specs/paths/#InterfaceSVGPathData)
- [https://raw.githubusercontent.com/herrstrietzel/svg-path-intersections/main/img/intersections.png](https://raw.githubusercontent.com/herrstrietzel/svg-path-intersections/main/img/intersections.png)
- [Jarek Foksa's pathdata-polyfill](https://github.com/jarek-foksa/path-data-polyfill)
- [complete version with all options](https://github.com/herrstrietzel/svg-parse-path-normalized)
- [Codepen: multiple path examples and speed test](https://codepen.io/herrstrietzel/pen/bGJyOXB)
- [Simple demo](https://codepen.io/herrstrietzel/pen/mdgZGrz)
- [Shapes](https://codepen.io/herrstrietzel/pen/OJGKxKp)
- [https://raw.githubusercontent.com/herrstrietzel/svg-path-intersections/main/img/touching-paths.png](https://raw.githubusercontent.com/herrstrietzel/svg-path-intersections/main/img/touching-paths.png)
- [svg-getpointatlength](https://github.com/herrstrietzel/svg-getpointatlength)
- [thelonious's "kld-intersections"](https://github.com/thelonious/kld-intersections)
- [Pomax's "bezierjs"](https://github.com/Pomax/bezierjs)
- [bpmn-io's "path-intersection"](https://github.com/bpmn-io/path-intersection)
- [pathToAbsolute/Relative functions](https://github.com/DmitryBaranovskiy/raphael/blob/master/raphael.js#L1848)
- [a2c.js](https://github.com/fontello/svgpath/blob/master/lib/a2c.js)
- [cubic to quadratic approximation](https://github.com/fontello/cubic2quad/blob/master/test/cubic2quad.js)
- [A Primer on Bézier Curves](https://pomax.github.io/bezierinfo)
- [Releases](./herrstrietzel-svg-path-intersections-releases.md) - source: /herrstrietzel/svg-path-intersections/releases
- [Contributors](./herrstrietzel-svg-path-intersections-graphs-contributors.md) - source: /herrstrietzel/svg-path-intersections/graphs/contributors
- [JavaScript 95.4%](./herrstrietzel-svg-path-intersections-search?l=javascript.md) - source: /herrstrietzel/svg-path-intersections/search?l=javascript
- [HTML 4.6%](./herrstrietzel-svg-path-intersections-search?l=html.md) - source: /herrstrietzel/svg-path-intersections/search?l=html
- [https://github.com](https://github.com)
- [Terms](https://docs.github.com/site-policy/github-terms/github-terms-of-service)
- [Privacy](https://docs.github.com/site-policy/privacy-policies/github-privacy-statement)
- [Security](https://github.com/security)
- [Status](https://www.githubstatus.com/)
- [Community](https://github.community/)
- [Docs](https://docs.github.com/)
- [Contact](https://support.github.com?tags=dotcom-footer)
-->

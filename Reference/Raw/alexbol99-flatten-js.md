- [![npm version](https://camo.githubusercontent.com/b3900c4487ff917e793449af68175a58fde60976f1d12cea4334e9fd3bb491a4/68747470733a2f2f62616467652e667572792e696f2f6a732f253430666c617474656e2d6a73253246636f72652e737667)](https://badge.fury.io/js/%40flatten-js%2Fcore)
- [![Coverage Status](https://camo.githubusercontent.com/25d6b5c880e82a4e2608dba35cfc087ce0659c27dfb9583291a693a49c5701e6/68747470733a2f2f636f766572616c6c732e696f2f7265706f732f6769746875622f616c6578626f6c39392f666c617474656e2d6a732f62616467652e7376673f6272616e63683d6d6173746572)](https://coveralls.io/github/alexbol99/flatten-js?branch=master)
- [![](https://camo.githubusercontent.com/eea6f5d63c9bafd46a1620c8b17047333e29ea5b185b997d4ca2674a441dc513/68747470733a2f2f646174612e6a7364656c6976722e636f6d2f76312f7061636b6167652f6e706d2f40666c617474656e2d6a732f636f72652f6261646765)](https://www.jsdelivr.com/package/npm/@flatten-js/core)

# Javascript library for 2d geometry


**flatten-js** is a javascript library for manipulating abstract geometrical shapes like point, vector, line, ray, segment, circle, arc and polygon. Shapes may be organized into Planar Set - searchable container which support spatial queries.

**flatten-js** provides a lot of useful methods and algorithms like finding intersections, checking inclusion, calculating distance, applying affine transformations, performing boolean operations and more.

Packages are distributed in 3 formats: commonjs, umd and es6 modules. Package.json file provides various entry points suitable for different targets.

TypeScript users may take advantage of static type checking with typescript definition file index.d.ts included into the package.

**flatten-js** does not concern too much about visualization. Anyway, all classes implement svg() method, that returns a string which may be inserted into SVG container. It works pretty well together with [d3js](https://d3js.org/) library, but it is definitely possible to create bridges to other graphic libraries.

The best way to start working with FlattenJS is to use awesome [Observable](https://beta.observablehq.com/) javascript interactive notebooks. Check out collection of [Tutorials](https://observablehq.com/collection/@alexbol99/flatten-js-tutorials) published in Observable Notebooks.

Full documentation may be found here: <https://alexbol99.github.io/flatten-js/index.html>

## Contacts


Follow me on Twitter [@alex_bol\_](https://twitter.com/alex_bol_)

## Installation


```
npm install --save @flatten-js/core
```

## Usage


import {Point, Vector, Circle, Line, Ray, Segment, Arc, Box, Polygon, Matrix, PlanarSet} from '@flatten-js/core';

It is possible to import Flatten namespace as default import, and then destruct all classes from it.

import Flatten from '@flatten-js/core'\
const {Point, Vector, Circle, Line, Ray, Segment, Arc, Box, Polygon, Matrix, PlanarSet} = Flatten;

Some classes have shortcuts to avoid annoying *new* constructor:

import {point, vector, circle, line, ray, segment, arc, polygon, matrix} from '@flatten-js/core';

## Example


After module imported, it is possible to create some construction:

    // extract object creators\
    import {point, circle, segment} from '@flatten-js/core';\
\
    // make some construction\
    let s1 = segment(10,10,200,200);\
    let s2 = segment(10,160,200,30);\
    let c = circle(point(200, 110), 50);\
    let ip = s1.intersect(s2);

You may test the code above also in [NPM RunKit](https://npm.runkit.com/@flatten-js/core)

You may also check out examples section in the code which illustrate different use cases:

- in nodejs
- in a browser using `<script>` tag with **unpkg.com** loader
- in a React application

## Content of the library


### Basic shapes


**flatten-js** library implements following basic shapes:

- [Point](https://alexbol99.github.io/flatten-js/Point.html)
- [Vector](https://alexbol99.github.io/flatten-js/Vector.html)
- [Line](https://alexbol99.github.io/flatten-js/Line.html)
- [Ray](https://alexbol99.github.io/flatten-js/Ray.html)
- [Segment](https://alexbol99.github.io/flatten-js/Segment.html)
- [Arc (circular)](https://alexbol99.github.io/flatten-js/Arc.html)
- [Circle](https://alexbol99.github.io/flatten-js/Circle.html)
- [Box (may be used as rectangle)](https://alexbol99.github.io/flatten-js/Box.html)

### Polygon


[Polygon](https://alexbol99.github.io/flatten-js/Polygon.html) in **flatten-js** library is actually a multi-polygon. Polygon is a collection of faces - closed oriented chains of edges, which may be of type Segment or Arc. The most external face called island, a face included into it is called hole. Holes in turn may have inner islands, number of inclusion levels is unlimited.

Orientation of islands and holes is matter for calculation of relationships and boolean operations, holes should have orientation opposite to islands. It means that for proper results faces in a polygon should be **orientable**: they should not have self-intersections. Faces also should not overlap each other. Method `isValid()` checks if polygon fit these rules.

Constructor of the polygon object accept various inputs:

- Array of shapes (instances of Flatten.Segment or Flatten.Arc) that represent closed chains
- Array of shapes as json objects that represent closed chains
- Array of points (Flatten.Point) that represent vertices of the polygon
- Array of numeric pairs \[x,y\] that represent vertices of the polygon
- Instances of Circle or Box

Polygon provides various useful methods:

- `area` - calculate area of a polygon
- `addFace` - add a new face to polygon
- `deleteFace` - removes face from polygon
- `addVertex` - split an edge of polygon adn create new vertex
- `cut` - cut polygon with multiline into sub-polygons
- `findEdgeByPoint` - find edge in polygon
- `contains` - test if polygon contains shape (point, segment or arc)
- `transform` - transform polygon using affine transformation matrix
- `reverse` - revert orientation of faces
- `splitToIslands` - split to array of islands with holes

`splitToIslands()` uses the largest face's orientation to identify outer faces. Opposite-oriented faces represent holes (voids), and are attached to islands that contain them. A hole moved completely outside the islands contributes no filled region and is omitted from the returned polygons; it is not reversed into a new island. The original polygon is unchanged, so the result may contain fewer faces than the input. This method does not clip partially overlapping faces; callers should supply non-overlapping faces with consistent winding.

### Multiline


Multiline represent an unclosed chain of edges of type Segment or Arc

### Planar Set


Planar Set is a container of shapes that enables spatial seach by rectangular query.

### Transformations


All the classes have methods `translate`, `rotate` and `scale` which may be chained.\
Example:

// Rotate segment by 45 deg around its center\
let {point,segment,matrix} = Flatten;\
let s = segment(point(20,30), point(60,70));\
let center = s.box.center;\
let angle = 45.\*Math.PI/180.;\
let rotated_segment = s.rotate(angle, center)

### Intersection points


All classes have method `intersect(otherShape)` that return array of intersection points, if two shapes intersect each other, or empty array otherwise. The is no predefined order of intersection points in the array.

Please don't be confused, there are another two methods `BooleanOperations.intersect()` that performs boolean intersection of polygons and logical predicate `Relations.intersect()` that check if two shapes intersected or not.

### Distance between shapes


All basic classes and polygon have method `distanceTo(othershape)` that calculate distance to other shape. Together with the distance function returns the shortest segment between two shapes - segment between two closest point, where the first point lays on `this` shape, and the second - on the other shape, see example:

let s = segment(point(10,30), point(150, 40));\
let c = circle(point(75,75),10);\
let \[dist,shortest_segment\] = s.distanceTo(c);

### Intersection model (DE-9IM)


The Dimensionally Extended nine-Intersection Model ([DE-9IM](https://en.wikipedia.org/wiki/DE-9IM)) is a topological model and a standard used to describe the spatial relations of two geometries in 2-dimensional plane.

First, for every shape we define:

- An interior
- A boundary
- An exterior

For polygons, the interior, boundary and exterior are obvious, other types have some exclusions:

- Point has no interior
- Line has no boundary

The DE-9IM model based on a 3×3 intersection matrix with the form:

```
         [ I(a) ^ I(b)   B(a) ^ I(b)   E(a) ^ I(b)
de9im =    I(a) ^ B(b)   B(a) ^ B(b)   E(a) ^ B(b)
           I(a) ^ E(b)   B(a) ^ E(b)   E(a) ^ E(b)  ]
```

where `a` and `b` are two shapes (geometries),

`I(), B(), E()` denotes interior, boundary and exterior operator and

`^` denotes operation of intersection. Dimension of intersection result depends on the dimension of shapes, for example,

- intersection between an interior of the line and an interior of the polygon is an array of segments
- intersection between an interior of the line and boundary polygon is an array of points (may include segments in case of touching)
- intersection between interiors of two polygons (if exists) will be a polygon.

DE-9IM matrix describes any possible relationships between two shapes on the plane.

DE-9IM matrix is available via method `relate` under namespace `Relations`.

Each element of DE-9IM matrix is an array of the objects representing corresponding intersection. Empty array represents case of no intersection. If intersection is not applicable (i.e. intersection with a boundary for a line which has no boundary), correspondent cell left undefined.

Intersection between two exteriors not calculated because usually it is meaningless.

let {relate} = Flatten.Relations;\
// \
// define two shapes: polygon1, polygon2\
//\
let de9im = relate(polygon1, polygon2);\
//\
// explore 8 of 9 fields of the de9im matrix:\
// de9im.I2I  de9im.B2I  de9im.E2I\
// de9im.I2B  de9im.B2B  de9im.E2B\
// de9im.I2E  de9im.B2E     N/A

Another common way to represent DE-9IM matrix is a string where

- `T` represent intersection where array is not impty
- `F` represent intersection where array is empty
- `.` means not relevant or not applicable

String may be obtained with `de9im.toString()` method.

### Relationship predicates


The spatial relationships between two shapes exposed via namespace `Relations`. The spatial predicates return `true` if relationship match and `false` otherwise.

let {intersect, disjoint, equal, touch, inside, contain, covered, cover} = Flatten.Relations;\
// define shape a and shape b\
let p = intersect(a, b);\
console.log(p)             // true / false

- `intersect` - shapes a and b have at least one common point
- `disjoint` - opposite to `intersect`
- `equal` - shapes a and b are topologically equal
- `touch` - shapes a and b have at least one point in common but their interiors not intersect
- `inside` - shape a lies in the interior of shape b
- `contain` - shape b lies in the interior of shape a
- `covered` - every point of a lies or in the interior or on the boundary of shape b
- `covered` - every point of b lies or in the interior or on the boundary of shape a

### Boolean operations


Boolean operations on polygons available via namespace **BooleanOperations**. Polygons in boolean operation should be valid: both operands should have same meaning of face orientation, faces should not overlap each other and should not have self-intersections.

User is responsible to provide valid polygons, boolean operation methods do not check validity.

let {unify, subtract, intersect, innerClip, outerClip} = BooleanOperations;

- `unify` - unify two polygons and return resulted polygon
- `subtract` - subtract second polygon from the first and return resulted polygon
- `intersect` - intersect two polygons and return resulted polygon
- `innerClip` - intersect two polygons and return boundary of intersection as 2 arrays. The first aray contains edges of the first polygon, the second - the edges of the second
- `outerClip` - clip boundary of the first polygon with the interior of the second polygon

Implementation based on Weiler-Atherton clipping algorithm, described in the article [Hidden Surface Removal Using Polygon Area Sorting](https://www.cs.drexel.edu/~david/Classes/CS430/HWs/p214-weiler.pdf)

### Serialization


All **flatten-js** shape objects may be serialized using `JSON.stringify()` method. `JSON.stringify` transforms object to string using `.toJSON()` formatter implemented in the class. `JSON.parse` restore object from a string, and then constructor can use this object to create Flatten object.

let {lint, point} = Flatten;\
let l = line(point(4, 0), point(0, 4));\
// Serialize\
let str = JSON.stringify(l);  \
// Parse and reconstruct\
let l_json = JSON.parse(str);\
let l_parsed = line(l_json);

### Visualization


All classes provide `svg()` method, that create svg string that may be inserted into svg container element in a very straightforward way:

\<body\>\
    \<svg id="stage" width="500" height="500"\>\</svg\>\
\<script\>\
    const Flatten = window\["@flatten-js/core"\];\
    const {point, circle, segment} = Flatten;\
\
    // make some construction\
    let s1 = segment(10,10,200,200);\
    let s2 = segment(10,160,200,30);\
    let c = circle(point(200, 110), 50);\
    let ip = s1.intersect(s2);\
\
    document.getElementById("stage").innerHTML = s1.svg() + s2.svg() + c.svg() + ip\[0\].svg();\
\</script\>\
\</body\>

Method `svg()` may accept as a parameter an object that enables to define several basic attributes of svg element: `stroke`, `strokeWidth`, `fill`, `fillRule`, `fillOpacity`, `id` and `className`. If attributes not provided, method `svg()` use default values.

### Other packages


Other packages, published under scope **@flatten-js/**:

| Name | Description |
|----|----|
| [@flatten-js/interval-tree](https://www.npmjs.com/package/@flatten-js/interval-tree) | Interval binary search tree |
| [@flatten-js/boolean-op](https://www.npmjs.com/package/@flatten-js/boolean-op) | Boolean operations (deprecated, use this functionality from the core package) |
| [@flatten-js/polygon-offset](https://www.npmjs.com/package/@flatten-js/polygon-offset) | Polygon offset |

## Support


[![Buy Me A Coffee](https://camo.githubusercontent.com/9a769e616ce78645bf51d12e4179cfbfd72fb413722b284e0be3ec3c75a86010/68747470733a2f2f63646e2e6275796d6561636f666665652e636f6d2f627574746f6e732f64656661756c742d6f72616e67652e706e67)](https://www.buymeacoffee.com/alexbol99)

<!--
## Source links

- [/](./index.md) - source: /
- [Sign in](./login?return_to=https%3A%2F%2Fgithub.com%2Falexbol99%2Fflatten-js.md) - source: /login?return_to=https%3A%2F%2Fgithub.com%2Falexbol99%2Fflatten-js
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
- [Sign up](./signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E&source=header-repo&source_repo=alexbol99%2Fflatten-js.md) - source: /signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E&source=header-repo&source_repo=alexbol99%2Fflatten-js
- [alexbol99](./alexbol99.md) - source: /alexbol99
- [flatten-js](./alexbol99-flatten-js.md) - source: /alexbol99/flatten-js
- [Issues 10](./alexbol99-flatten-js-issues.md) - source: /alexbol99/flatten-js/issues
- [Pull requests 2](./alexbol99-flatten-js-pulls.md) - source: /alexbol99/flatten-js/pulls
- [Discussions](./alexbol99-flatten-js-discussions.md) - source: /alexbol99/flatten-js/discussions
- [Actions](./alexbol99-flatten-js-actions.md) - source: /alexbol99/flatten-js/actions
- [Projects](./alexbol99-flatten-js-projects.md) - source: /alexbol99/flatten-js/projects
- [Security and quality](./alexbol99-flatten-js-security.md) - source: /alexbol99/flatten-js/security
- [Insights](./alexbol99-flatten-js-pulse.md) - source: /alexbol99/flatten-js/pulse
- [Notifications](./login?return_to=%2Falexbol99%2Fflatten-js.md) - source: /login?return_to=%2Falexbol99%2Fflatten-js
- [Activity](./alexbol99-flatten-js-activity.md) - source: /alexbol99/flatten-js/activity
- [64 forks](./alexbol99-flatten-js-forks.md) - source: /alexbol99/flatten-js/forks
- [Report repository](./contact-report-content?content_url=https%3A%2F%2Fgithub.com%2Falexbol99%2Fflatten-js&report=alexbol99+%28user%29.md) - source: /contact/report-content?content_url=https%3A%2F%2Fgithub.com%2Falexbol99%2Fflatten-js&report=alexbol99+%28user%29
- [30 Branches](./alexbol99-flatten-js-branches.md) - source: /alexbol99/flatten-js/branches
- [107 Tags](./alexbol99-flatten-js-tags.md) - source: /alexbol99/flatten-js/tags
- [alexbol99](./alexbol99-flatten-js-commits?author=alexbol99.md) - source: /alexbol99/flatten-js/commits?author=alexbol99
- [chore: release 1.6.15](./alexbol99-flatten-js-commit-2264436796eab01f38f40dd54d12fdcb1c540e64.md) - source: /alexbol99/flatten-js/commit/2264436796eab01f38f40dd54d12fdcb1c540e64
- [673 Commits](./alexbol99-flatten-js-commits-master.md) - source: /alexbol99/flatten-js/commits/master/
- [.github/ workflows](./alexbol99-flatten-js-tree-master-.github-workflows.md) - source: /alexbol99/flatten-js/tree/master/.github/workflows
- [ci: publish releases with Node 24 and current Actions](./alexbol99-flatten-js-commit-0430cacd72bb2d33159cd685552254f13bbe2de1.md) - source: /alexbol99/flatten-js/commit/0430cacd72bb2d33159cd685552254f13bbe2de1
- [.idea](./alexbol99-flatten-js-tree-master-.idea.md) - source: /alexbol99/flatten-js/tree/master/.idea
- [Fix bug in box.transform()](./alexbol99-flatten-js-commit-bc7af8e5e44090864b438365c79f7d4e98f020f4.md) - source: /alexbol99/flatten-js/commit/bc7af8e5e44090864b438365c79f7d4e98f020f4
- [dist](./alexbol99-flatten-js-tree-master-dist.md) - source: /alexbol99/flatten-js/tree/master/dist
- [Merge pull request](./alexbol99-flatten-js-commit-6e7b5600767c04ba8091cf12319a65cd204266a9.md) - source: /alexbol99/flatten-js/commit/6e7b5600767c04ba8091cf12319a65cd204266a9
- [#255](https://github.com/alexbol99/flatten-js/pull/255)
- [docs](./alexbol99-flatten-js-tree-master-docs.md) - source: /alexbol99/flatten-js/tree/master/docs
- [Add Box distance support to shape classes](./alexbol99-flatten-js-commit-cbb4c19ed53c24286dc75d5ea6a155c089838f05.md) - source: /alexbol99/flatten-js/commit/cbb4c19ed53c24286dc75d5ea6a155c089838f05
- [examples](./alexbol99-flatten-js-tree-master-examples.md) - source: /alexbol99/flatten-js/tree/master/examples
- [Issue](./alexbol99-flatten-js-commit-7323efb9c8f931885e273aacaef15bfb532828da.md) - source: /alexbol99/flatten-js/commit/7323efb9c8f931885e273aacaef15bfb532828da
- [#45](https://github.com/alexbol99/flatten-js/issues/45)
- [packages/ utils](./alexbol99-flatten-js-tree-master-packages-utils.md) - source: /alexbol99/flatten-js/tree/master/packages/utils
- [- Upgrade interval tree dependency to scoped package @flatten-js/inte…](./alexbol99-flatten-js-commit-938f39de91577f3b104b86e9715e241705447b16.md) - source: /alexbol99/flatten-js/commit/938f39de91577f3b104b86e9715e241705447b16
- [src](./alexbol99-flatten-js-tree-master-src.md) - source: /alexbol99/flatten-js/tree/master/src
- [test](./alexbol99-flatten-js-tree-master-test.md) - source: /alexbol99/flatten-js/tree/master/test
- [.babelrc](./alexbol99-flatten-js-blob-master-.babelrc.md) - source: /alexbol99/flatten-js/blob/master/.babelrc
- [- update coverage tool istanbul to nyc](./alexbol99-flatten-js-commit-8738590724405f026c213424ef16bc856ba791dd.md) - source: /alexbol99/flatten-js/commit/8738590724405f026c213424ef16bc856ba791dd
- [.gitignore](./alexbol99-flatten-js-blob-master-.gitignore.md) - source: /alexbol99/flatten-js/blob/master/.gitignore
- [- Fix bug in method polygon.cutWithLine()](./alexbol99-flatten-js-commit-b51769a18380e84cd30d28941b1e6ae2df514616.md) - source: /alexbol99/flatten-js/commit/b51769a18380e84cd30d28941b1e6ae2df514616
- [.grenrc.json](./alexbol99-flatten-js-blob-master-.grenrc.json.md) - source: /alexbol99/flatten-js/blob/master/.grenrc.json
- [- Add boolean operations test](./alexbol99-flatten-js-commit-1cee39bb73ddfcfb37850cf7e7dc5bdd1236c87e.md) - source: /alexbol99/flatten-js/commit/1cee39bb73ddfcfb37850cf7e7dc5bdd1236c87e
- [.jsdoc.json](./alexbol99-flatten-js-blob-master-.jsdoc.json.md) - source: /alexbol99/flatten-js/blob/master/.jsdoc.json
- [- Improved documentation and TypeScript type definition, fixed some bugs](./alexbol99-flatten-js-commit-061edf975da884e717eca8de5c7f95028880171e.md) - source: /alexbol99/flatten-js/commit/061edf975da884e717eca8de5c7f95028880171e
- [.npmignore](./alexbol99-flatten-js-blob-master-.npmignore.md) - source: /alexbol99/flatten-js/blob/master/.npmignore
- [Reduce npm package size](./alexbol99-flatten-js-commit-4903aa3c194f0f3c09e90ec6d94d88583c604282.md) - source: /alexbol99/flatten-js/commit/4903aa3c194f0f3c09e90ec6d94d88583c604282
- [.travis.yml](./alexbol99-flatten-js-blob-master-.travis.yml.md) - source: /alexbol99/flatten-js/blob/master/.travis.yml
- [LICENSE](./alexbol99-flatten-js-blob-master-LICENSE.md) - source: /alexbol99/flatten-js/blob/master/LICENSE
- [Initial commit](./alexbol99-flatten-js-commit-7b0deaaf67b01943db56ae2ad21a47f5a1378b75.md) - source: /alexbol99/flatten-js/commit/7b0deaaf67b01943db56ae2ad21a47f5a1378b75
- [README.md](./alexbol99-flatten-js-blob-master-README.md.md) - source: /alexbol99/flatten-js/blob/master/README.md
- [Keep hole orientation semantics and document island splitting](./alexbol99-flatten-js-commit-ce09bfef9f077edc8e43f3cccbbccb7f20e2c3f6.md) - source: /alexbol99/flatten-js/commit/ce09bfef9f077edc8e43f3cccbbccb7f20e2c3f6
- [index.d.ts](./alexbol99-flatten-js-blob-master-index.d.ts.md) - source: /alexbol99/flatten-js/blob/master/index.d.ts
- [Preserve uncontained polygon faces in islands](./alexbol99-flatten-js-commit-ff78ef417f2eb6c0ff417ad3dc0346b8e1e9192d.md) - source: /alexbol99/flatten-js/commit/ff78ef417f2eb6c0ff417ad3dc0346b8e1e9192d
- [index.js](./alexbol99-flatten-js-blob-master-index.js.md) - source: /alexbol99/flatten-js/blob/master/index.js
- [Restore export parseWkt from index.js, remove import from index.js fr…](./alexbol99-flatten-js-commit-32278e3e5a77800822a96e4c623400385b317f11.md) - source: /alexbol99/flatten-js/commit/32278e3e5a77800822a96e4c623400385b317f11
- [package-lock.json](./alexbol99-flatten-js-blob-master-package-lock.json.md) - source: /alexbol99/flatten-js/blob/master/package-lock.json
- [package.json](./alexbol99-flatten-js-blob-master-package.json.md) - source: /alexbol99/flatten-js/blob/master/package.json
- [rollup.config.js](./alexbol99-flatten-js-blob-master-rollup.config.js.md) - source: /alexbol99/flatten-js/blob/master/rollup.config.js
- [Fix export module entry point - target main.mjs instead main.esm](./alexbol99-flatten-js-commit-984251ad9ed5ab8872e671eefb93f91fee24d0fd.md) - source: /alexbol99/flatten-js/commit/984251ad9ed5ab8872e671eefb93f91fee24d0fd
- [https://badge.fury.io/js/%40flatten-js%2Fcore](https://badge.fury.io/js/%40flatten-js%2Fcore)
- [https://coveralls.io/github/alexbol99/flatten-js?branch=master](https://coveralls.io/github/alexbol99/flatten-js?branch=master)
- [https://www.jsdelivr.com/package/npm/@flatten-js/core](https://www.jsdelivr.com/package/npm/@flatten-js/core)
- [d3js](https://d3js.org/)
- [Observable](https://beta.observablehq.com/)
- [Tutorials](https://observablehq.com/collection/@alexbol99/flatten-js-tutorials)
- [https://alexbol99.github.io/flatten-js/index.html](https://alexbol99.github.io/flatten-js/index.html)
- [@alex_bol_](https://twitter.com/alex_bol_)
- [NPM RunKit](https://npm.runkit.com/@flatten-js/core)
- [Point](https://alexbol99.github.io/flatten-js/Point.html)
- [Vector](https://alexbol99.github.io/flatten-js/Vector.html)
- [Line](https://alexbol99.github.io/flatten-js/Line.html)
- [Ray](https://alexbol99.github.io/flatten-js/Ray.html)
- [Segment](https://alexbol99.github.io/flatten-js/Segment.html)
- [Arc (circular)](https://alexbol99.github.io/flatten-js/Arc.html)
- [Circle](https://alexbol99.github.io/flatten-js/Circle.html)
- [Box (may be used as rectangle)](https://alexbol99.github.io/flatten-js/Box.html)
- [Polygon](https://alexbol99.github.io/flatten-js/Polygon.html)
- [DE-9IM](https://en.wikipedia.org/wiki/DE-9IM)
- [Hidden Surface Removal Using Polygon Area Sorting](https://www.cs.drexel.edu/~david/Classes/CS430/HWs/p214-weiler.pdf)
- [@flatten-js/interval-tree](https://www.npmjs.com/package/@flatten-js/interval-tree)
- [@flatten-js/boolean-op](https://www.npmjs.com/package/@flatten-js/boolean-op)
- [@flatten-js/polygon-offset](https://www.npmjs.com/package/@flatten-js/polygon-offset)
- [https://www.buymeacoffee.com/alexbol99](https://www.buymeacoffee.com/alexbol99)
- [Releases](./alexbol99-flatten-js-releases.md) - source: /alexbol99/flatten-js/releases
- [v1.6.15 Latest Oct 25, 2026](./alexbol99-flatten-js-releases-tag-v1.6.15.md) - source: /alexbol99/flatten-js/releases/tag/v1.6.15
- [Contributors](./alexbol99-flatten-js-graphs-contributors.md) - source: /alexbol99/flatten-js/graphs/contributors
- [/alexbol-fls](./alexbol-fls.md) - source: /alexbol-fls
- [/bertyhell](./bertyhell.md) - source: /bertyhell
- [/dependabot[bot]](./dependabot[bot].md) - source: /dependabot[bot]
- [/saraedum](./saraedum.md) - source: /saraedum
- [/stanch](./stanch.md) - source: /stanch
- [/delmohf](./delmohf.md) - source: /delmohf
- [/schelmo](./schelmo.md) - source: /schelmo
- [/AlexQbiq](./AlexQbiq.md) - source: /AlexQbiq
- [/ebuswell](./ebuswell.md) - source: /ebuswell
- [/axtavt](./axtavt.md) - source: /axtavt
- [/nsinstruments](./nsinstruments.md) - source: /nsinstruments
- [/awhitty](./awhitty.md) - source: /awhitty
- [/rtm](./rtm.md) - source: /rtm
- [JavaScript 100%](./alexbol99-flatten-js-search?l=javascript.md) - source: /alexbol99/flatten-js/search?l=javascript
- [https://github.com](https://github.com)
- [Terms](https://docs.github.com/site-policy/github-terms/github-terms-of-service)
- [Privacy](https://docs.github.com/site-policy/privacy-policies/github-privacy-statement)
- [Security](https://github.com/security)
- [Status](https://www.githubstatus.com/)
- [Community](https://github.community/)
- [Docs](https://docs.github.com/)
- [Contact](https://support.github.com?tags=dotcom-footer)
-->

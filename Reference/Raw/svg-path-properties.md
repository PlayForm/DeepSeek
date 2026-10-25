[**15** Branches](https://github.com/rveciana/svg-path-properties/branches)[](https://github.com/rveciana/svg-path-properties/tags)
Go to file Open more actions menu success Oct 15, 2026
[d675311](https://github.com/rveciana/svg-path-properties/commit/d67531110946126465efcc1f7175a3f06a5ef67d)
· Oct 15, 2026 [240 Commits](https://github.com/rveciana/svg-path-properties/commits/main/) Open
commit details 240 Commits

| Name                                                                                                                                                                                                       | Name | Last commit message                                                                                                                                                                                                | Last commit date |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
|                                                                                                                                                                                                            |      |                                                                                                                                                                                                                    | Aug 23, 2026     |
|                                                                                                                                                                                                            |      | [ci: upgrade npm to 11.x for Trusted Publishing support](https://github.com/rveciana/svg-path-properties/commit/039375fb940d022c8442f17301b896b918a3d360 "ci: upgrade npm to 11.x for Trusted Publishing support") | Feb 22, 2026     |
|                                                                                                                                                                                                            |      |                                                                                                                                                                                                                    | Jul 21, 2025     |
|                                                                                                                                                                                                            |      |                                                                                                                                                                                                                    | Aug 22, 2026     |
|                                                                                                                                                                                                            |      | [Prepare package for typescript](https://github.com/rveciana/svg-path-properties/commit/9fc43ad543aa787d5c5a0a0362465a69bb9e18ef "Prepare package for typescript")                                                 | Nov 14, 2019     |
| [chore: reduce package size and improve code quality](https://github.com/rveciana/svg-path-properties/commit/58a2cfde7f24ff53fc147c08eb2a40df516ffe06 "chore: reduce package size and improve code quality |

This PR includes several improvements to the svg-path-properties library:

Package Optimization \(fixes #97\):

- Removed src folder from npm package files array
- Package size reduced by ~50% \(from ~143KB to ~71KB unpacked\)

Code Quality Improvements:

- Optimized distance calculations using Math.hypot\(\) for better performance
- Removed duplicate boundary checks in arc.ts
- Extracted and deduplicated tangent normalization logic in bezier.ts
- Removed redundant parameter checks in bezier-functions.ts

Documentation:

- Added comprehensive JSDoc comments to all public APIs
- Added JSDoc to type definitions
- Fixed typo in README.md \("int he" -> "in the"\)

Dependencies:

- Updated all dev dependencies to latest compatible versions
- All 34 tests pass
- Code coverage improved: 94.37% -> 95.36%

Changesets:

- Created two patch changesets for v2.0.1 release") | Feb 15, 2026 |  
  | [Give a tangent where a control point sits on its
  anchor](https://github.com/rveciana/svg-path-properties/commit/880e50e0ae55836b827258b40a4690c9d6390b7f
  "Give a tangent where a control point sits on its anchor

getTangentAtLength returns {x: 0, y: 0} at either end of a cubic whose adjacent control point
coincides with the anchor. The docs promise a normalized vector, and the curve does have a tangent
there - the first derivative just vanishes:

    M100,200 S400,300 400,200  at 0  ->  {x: 0, y: 0}
    M0,0 C0,0 50,100 100,0     at 0  ->  {x: 0, y: 0}
    M0,0 C50,100 100,0 100,0   at end ->  {x: 0, y: 0}

An S or s with no preceding cubic has its reflected control point set to the current point by
definition, so this is an ordinary path, not a contrived one. Design tools also emit a zero-length
handle on one side of a node.

The quadratic path already handles this - M0,0 Q0,0 100,0 gives {x: 1, y: 0} - because it degrades
to a linear segment. Only the cubic lacked a fallback.

Take the direction from just along the curve instead: the derivative is a polynomial that vanishes
only at isolated points, so the limit from inside gives the geometric tangent, and reading forwards
\(backwards at the end\) keeps the sign pointing along the path.

One case in the tangent table asserted the old {0, 0}. Its neighbour, M100,200 C100,100 250,100
250,200 S400,300 400,200, has a real reflected control point and already expects a unit vector at
the same position.") | Aug 27, 2026 |  
| [Give a tangent where a control point sits on its
anchor](https://github.com/rveciana/svg-path-properties/commit/880e50e0ae55836b827258b40a4690c9d6390b7f
"Give a tangent where a control point sits on its anchor

getTangentAtLength returns {x: 0, y: 0} at either end of a cubic whose adjacent control point
coincides with the anchor. The docs promise a normalized vector, and the curve does have a tangent
there - the first derivative just vanishes:

    M100,200 S400,300 400,200  at 0  ->  {x: 0, y: 0}
    M0,0 C0,0 50,100 100,0     at 0  ->  {x: 0, y: 0}
    M0,0 C50,100 100,0 100,0   at end ->  {x: 0, y: 0}

An S or s with no preceding cubic has its reflected control point set to the current point by
definition, so this is an ordinary path, not a contrived one. Design tools also emit a zero-length
handle on one side of a node.

The quadratic path already handles this - M0,0 Q0,0 100,0 gives {x: 1, y: 0} - because it degrades
to a linear segment. Only the cubic lacked a fallback.

Take the direction from just along the curve instead: the derivative is a polynomial that vanishes
only at isolated points, so the limit from inside gives the geometric tangent, and reading forwards
\(backwards at the end\) keeps the sign pointing along the path.

One case in the tangent table asserted the old {0, 0}. Its neighbour, M100,200 C100,100 250,100
250,200 S400,300 400,200, has a real reflected control point and already expects a unit vector at
the same position.") | Aug 27, 2026 |  
| | | [feat: expose segment details via getDetails() and
getParts().details](https://github.com/rveciana/svg-path-properties/commit/16ed66c66fa0bd532adf0e9552361acb7020d157
"feat: expose segment details via getDetails\(\) and getParts\(\).details

Each segment class \(LinearPosition, Bezier, Arc\) now implements getDetails\(\) returning a typed
SVG-compatible tuple with the uppercase command letter and all coordinates in absolute form:

\['L', x, y\] | \['H', x\] | \['V', y\] | \['Z'\] \['C', cp1x, cp1y, cp2x, cp2y, x, y\] \['Q', cpx,
cpy, x, y\] \['A', rx, ry, xRot, largeArc, sweep, x, y\]

PartProperties now includes a details field populated by getParts\(\). H, V and Z preserve their
original command type. Degenerate Q/q and T/t fallbacks continue to produce LinearPosition and
return \['L', …\].

Closes #129") | Aug 23, 2026 |  
| | | | Jul 21, 2025 |  
| | | | Jul 21, 2025 |  
| | | | Aug 23, 2026 |  
| | |
[Create CODE_OF_CONDUCT.md](https://github.com/rveciana/svg-path-properties/commit/1fc8520691a56e3573fc18bbe1e5a83fa86a3d8b "Create CODE_OF_CONDUCT.md")
| Oct 2, 2020 |  
| | | | Oct 25, 2016 |  
| | | [feat: expose segment details via getDetails() and
getParts().details](https://github.com/rveciana/svg-path-properties/commit/16ed66c66fa0bd532adf0e9552361acb7020d157
"feat: expose segment details via getDetails\(\) and getParts\(\).details

Each segment class \(LinearPosition, Bezier, Arc\) now implements getDetails\(\) returning a typed
SVG-compatible tuple with the uppercase command letter and all coordinates in absolute form:

\['L', x, y\] | \['H', x\] | \['V', y\] | \['Z'\] \['C', cp1x, cp1y, cp2x, cp2y, x, y\] \['Q', cpx,
cpy, x, y\] \['A', rx, ry, xRot, largeArc, sweep, x, y\]

PartProperties now includes a details field populated by getParts\(\). H, V and Z preserve their
original command type. Degenerate Q/q and T/t fallbacks continue to produce LinearPosition and
return \['L', …\].

Closes #129") | Aug 23, 2026 |  
| | | | Jul 21, 2025 |  
| | | | Jul 21, 2025 |  
| | | | Aug 22, 2026 |  
| | | | Oct 15, 2026 |  
| | | | Oct 15, 2026 |  
| | | | Jul 21, 2025 |  
| | | | Jul 21, 2025 |  
| View all files |

# svg-path-properties

Pure Javascript alternative to getPointAtLength(t) and getTotalLength() functions. Works with Canvas
objects and when Node JavaScript can access to path elements properties in a browser, such as its
length and the point at a given length. Unfortunately, this can't be achieved using a Canvas element
or when working with node. This library can be used to replace this need. It has no dependencies on
other JavaScript libraries.

## INSTALL

To use with npm, just type

```
npm install svg-path-properties

```

The package is lightweight with no dependencies (~20KB gzipped). You can use it in the browser
directly by including _svg-path-properties.min.js_ from the dist directory

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
coordinates in **absolute form** :

| Tuple                                                                                                      | Segment type                                                   |
| ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `['L', x, y]`                                                                                              | Line to                                                        |
| `['H', x]`                                                                                                 | Horizontal line to                                             |
| `['V', y]`                                                                                                 | Vertical line to                                               |
| `['Z']`                                                                                                    | Close path                                                     |
| `['C', cp1x, cp1y, cp2x, cp2y, x, y]`                                                                      | Cubic Bézier                                                   |
| `['Q', cpx, cpy, x, y]`                                                                                    | Quadratic Bézier                                               |
| `['A', rx, ry, xRotation, largeArcFlag, sweepFlag, x, y]`                                                  | Elliptical arc (`largeArcFlag` and `sweepFlag` are `0` or `1`) |
| Example — parametric interpolation along a cubic Bézier at evenly-spaced `t` values instead of arc-length: |

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
- [Drawing stramlines arrows](http://bl.ocks.org/rveciana/edb1dd43f3edc5d16ecaf4839c032dec)
- [Using it to get a length when in node instead of the browser](https://github.com/veltman/flubber/blob/master/src/svg.js),
  as in the [Flubber library](https://github.com/veltman/flubber)
- [SVG animations in React Native](https://bitbucket.org/ingenuityph/react-native-svg-animations/src/master/)

## Typescript

The TypeScript declaration file is available too, since version 0.5.0. From version 1.0.0, the whole
library has been rewritten using TypeScript, and the types are auto-generated. All public APIs are
fully documented with JSDoc comments for better IDE support.

## CREDITS

Some parts of the code are taken from other libraries or questions at StackOverflow: For Bézier
curves:

- [example in bl.ocks.org](http://bl.ocks.org/hnakamur/e7efd0602bfc15f66fc5),
  [gist code](https://gist.github.com/tunght13488/6744e77c242cc7a94859)
- [Stack overflow question](http://stackoverflow.com/questions/11854907/calculate-the-length-of-a-segment-of-a-quadratic-bezier)
- [A Primer on Bézier Curves](http://pomax.github.io/bezierinfo)
- [Arc elements calculation](https://github.com/MadLittleMods/svg-curve-lib/tree/f07d6008a673816f4cb74a3269164b430c3a95cb)
- [path parsing](https://github.com/jkroso/parse-svg-path)

## About

Pure Javascript alternative to path.getPointAtLength(t) and getTotalLength() functions. Works with
Canvas & Node **292** stars **6** watching
[ forks](https://github.com/rveciana/svg-path-properties/forks)

##

[ v2.2.0Latest Oct 16, 2026 ](https://github.com/rveciana/svg-path-properties/releases/tag/v2.2.0)

##

[+ 5,217](https://github.com/rveciana/svg-path-properties/network/dependents)

##

## Languages

- [TypeScript91.6%](https://github.com/rveciana/svg-path-properties/search?l=typescript)
- [HTML6.9%](https://github.com/rveciana/svg-path-properties/search?l=html)
- [JavaScript1.2%](https://github.com/rveciana/svg-path-properties/search?l=javascript)
- [Shell0.3%](https://github.com/rveciana/svg-path-properties/search?l=shell)

You can’t perform that action at this time.

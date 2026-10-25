[**2** Branches](https://github.com/countertype/clipper2-ts/branches)[](https://github.com/countertype/clipper2-ts/tags)
Go to file
Open more actions menu
[Merge pull request](https://github.com/countertype/clipper2-ts/commit/bf6e0303217bdffcbe2f03ab7f6218194df8e7e4) [#34](https://github.com/countertype/clipper2-ts/pull/34) [from countertype/perf-scanbeam](https://github.com/countertype/clipper2-ts/commit/bf6e0303217bdffcbe2f03ab7f6218194df8e7e4)
Open commit details
Jul 4, 2026
[bf6e030](https://github.com/countertype/clipper2-ts/commit/bf6e0303217bdffcbe2f03ab7f6218194df8e7e4) · Jul 4, 2026
[100 Commits](https://github.com/countertype/clipper2-ts/commits/main/)
Open commit details
100 Commits  
| Name  | Name  | Last commit message  | Last commit date  |  
| --- | --- | --- | --- |  
|   |   |   | Mar 9, 2026  |  
|   | Jul 3, 2026  |  
|   |   |  [invoke zCallback in doSplitOp (](https://github.com/countertype/clipper2-ts/commit/329f7b4926fc709e04bb82da59e422c72fce7d0b "invoke zCallback in doSplitOp \(#31\)")[#31](https://github.com/countertype/clipper2-ts/issues/31)[)](https://github.com/countertype/clipper2-ts/commit/329f7b4926fc709e04bb82da59e422c72fce7d0b "invoke zCallback in doSplitOp \(#31\)")  | May 22, 2026  |  
|   |   |   | Jan 2, 2026  |  
|   |   | Nov 3, 2025  |  
|   |   |   | Jul 3, 2026  |  
|   |   | Nov 3, 2025  |  
|   |   | [add benchmarks, rolldown, license 3rd party](https://github.com/countertype/clipper2-ts/commit/da477324b651b800ba097b570e1008c323dd5d97 "add benchmarks, rolldown, license 3rd party")  | Feb 6, 2026  |  
|   |   |   | Feb 9, 2026  |  
|   |   |   | Jul 3, 2026  |  
|   |   | [add benchmarks, rolldown, license 3rd party](https://github.com/countertype/clipper2-ts/commit/da477324b651b800ba097b570e1008c323dd5d97 "add benchmarks, rolldown, license 3rd party")  | Feb 6, 2026  |  
|   |   | Nov 18, 2025  |  
|   |   | [add benchmarks, rolldown, license 3rd party](https://github.com/countertype/clipper2-ts/commit/da477324b651b800ba097b570e1008c323dd5d97 "add benchmarks, rolldown, license 3rd party")  | Feb 6, 2026  |  
| View all files |  
# clipper2-ts
TypeScript port of Angus Johnson's [Clipper2](https://github.com/AngusJohnson/Clipper2) library for polygon clipping, offsetting, and triangulation
## Installation

```
npm install clipper2-ts
```

## Usage

```
import { intersect, union, difference, xor, inflatePaths, FillRule, JoinType, EndType } from 'clipper2-ts';

// Define polygons as arrays of points
const subject = [[
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 }
]];

const clip = [[
  { x: 50, y: 50 },
  { x: 150, y: 50 },
  { x: 150, y: 150 },
  { x: 50, y: 150 }
]];

// Boolean operations
const intersection = intersect(subject, clip, FillRule.NonZero);
const unionResult = union(subject, clip, FillRule.NonZero);
const diff = difference(subject, clip, FillRule.NonZero);
const xorResult = xor(subject, clip, FillRule.NonZero);

// Polygon offsetting (inflate/deflate)
const offset = inflatePaths(subject, 10, JoinType.Round, EndType.Polygon);
```

### Triangulation
Convert polygons into triangles using constrained Delaunay triangulation:

```
import { triangulate, triangulateD, TriangulateResult } from 'clipper2-ts';

const polygon = [[
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 }
]];

const { result, solution } = triangulate(polygon);
if (result === TriangulateResult.success) {
  // solution contains triangles (each with 3 vertices)
  console.log(`Created ${solution.length} triangles`);
}

// For floating-point coordinates:
const { result: resultD, solution: solutionD } = triangulateD(polygon, 2);
```

### Z-coordinate support
Points can optionally carry a Z value (e.g., elevation, layer index, color). Z callbacks allow you to assign Z values to new vertices created at intersection points. See [Clipper2 Z Docs](https://www.angusj.com/clipper2/Docs/Overview.htm) for details
## Examples
Try the [interactive example](https://countertype.github.io/clipper2-ts/) showing all Clipper2 operations
To run locally:

```
npm install
npm run serve
# Then open http://localhost:3000/example/
```

This port follows the structure and functionality of Clipper2's C# implementation, with method names adapted to JavaScript conventions. Where C# uses `PascalCase` for methods (`AddPath`, `Execute`), this port uses `camelCase` (`addPath`, `execute`). Class names remain unchanged
For detailed API documentation, see the [official Clipper2 docs](https://www.angusj.com/clipper2/Docs/Overview.htm)
## Testing
The port includes 258 tests validating against Clipper2's reference test suite:

```
npm test              # Run all tests
npm test:coverage     # Run with coverage report
```

The test suite validates clipping, offsetting, triangulation, and Z-callbacks against Clipper2's reference implementation. Polygon test 16 (bow-tie) uses relaxed tolerances as this edge case also fails in the C# reference
## Numeric precision
Unlike C# Clipper2, which has full int64 support, this library uses JavaScript's `Number` rather than `BigInt` for performance, with `BigInt` used for some intermediate arithmetic where needed. Coordinates must stay within the [safe integer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger) range (2^53); the library throws on overflow
If you have a use case that requires the full 64-bit range, and Clipper2-WASM isn't an option, please open an issue and we can discuss!
### Bundlers / minifiers (terser)
This library uses `BigInt` internally. Some versions/configurations of terser have had issues when compressing `BigInt` literals (eg `0n`). `clipper2-ts` avoids BigInt literal syntax in its source to improve compatibility
If you still hit terser issues in a consuming build, one workaround is `terserOptions: { compress: { evaluate: false } }`
## Performance
Faster than JavaScript-based Clipper (Clipper1) ports, slower than Clipper2-WASM; choose based on your constraints
## License
Boost Software License 1.0 (same as Clipper2)
## Credits
Original Clipper2 library by Angus Johnson. TypeScript port maintained by Jeremy Tribby
Benchmark polygon data from [Poly2Tri](https://github.com/jhasse/poly2tri) (BSD 3-clause). See `LICENSE_THIRD_PARTY` for details
## About
TypeScript port of Clipper2 polygon clipping, offsetting, and triangulation library by Angus Johnson
[countertype.github.io/clipper2-ts/](https://countertype.github.io/clipper2-ts/)
[boolean-operations](https://github.com/topics/boolean-operations)[clipper](https://github.com/topics/clipper)[clipper2](https://github.com/topics/clipper2)[delaunay-triangulation](https://github.com/topics/delaunay-triangulation)[minkowski](https://github.com/topics/minkowski)[offsetting](https://github.com/topics/offsetting)[polygon-clipping](https://github.com/topics/polygon-clipping)[self-intersection](https://github.com/topics/self-intersection)[triangulation](https://github.com/topics/triangulation)[vatti](https://github.com/topics/vatti)[vatti-clipping](https://github.com/topics/vatti-clipping)
**42** stars
**3** watching
[ forks](https://github.com/countertype/clipper2-ts/forks)
## 
No releases published
## 
  * [**jpt** Jeremy Tribby](https://github.com/jpt)


## Languages
  * [TypeScript100%](https://github.com/countertype/clipper2-ts/search?l=typescript)


You can’t perform that action at this time. 

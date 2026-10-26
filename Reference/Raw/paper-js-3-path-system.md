Menu

# Path System

Relevant source files

- [src/basic/Line.js](https://github.com/paperjs/paper.js/blob/92775f52/src/basic/Line.js)
- [src/path/Curve.js](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Curve.js)
- [src/path/CurveLocation.js](https://github.com/paperjs/paper.js/blob/92775f52/src/path/CurveLocation.js)
- [src/path/Path.js](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js)
- [src/path/PathFitter.js](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathFitter.js)
- [src/path/PathFlattener.js](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathFlattener.js)
- [src/path/PathItem.Boolean.js](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.Boolean.js)
- [src/path/PathItem.js](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.js)
- [src/util/CollisionDetection.js](https://github.com/paperjs/paper.js/blob/92775f52/src/util/CollisionDetection.js)
- [src/util/Numerical.js](https://github.com/paperjs/paper.js/blob/92775f52/src/util/Numerical.js)
- [test/index.html](https://github.com/paperjs/paper.js/blob/92775f52/test/index.html)
- [test/tests/Curve.js](https://github.com/paperjs/paper.js/blob/92775f52/test/tests/Curve.js)
- [test/tests/Path.js](https://github.com/paperjs/paper.js/blob/92775f52/test/tests/Path.js)
- [test/tests/Path_Boolean.js](https://github.com/paperjs/paper.js/blob/92775f52/test/tests/Path_Boolean.js)
- [test/tests/Path_Intersections.js](https://github.com/paperjs/paper.js/blob/92775f52/test/tests/Path_Intersections.js)
- [test/tests/Style.js](https://github.com/paperjs/paper.js/blob/92775f52/test/tests/Style.js)

The Path System is the core vector drawing capability in Paper.js, providing comprehensive
functionality for creating, manipulating, and rendering vector paths. This system handles the
representation of paths through segments and curves, supports path operations like joining and
boolean operations, and offers utilities for path simplification and flattening.

For information about styling paths, see [Styling System](./paperjs-paper.js-4-styling-system.md).
For details on how paths fit into the scene graph, see
[Scene Graph](./paperjs-paper.js-2.2-scene-graph.md).

## Path Structure and Representation

The Path System is built around a hierarchy of classes with `PathItem` as the base class. Paths are
represented as collections of segments (points with handles), connected by curves.

- [src/path/Path.js 21-296](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L21-L296)
- [src/path/Curve.js 27-145](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Curve.js#L27-L145)
- [src/path/PathItem.js 22-34](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.js#L22-L34)

### Segments and Curves

A path consists of segments connected by curves. Each segment contains a point and optional handle
points (handleIn and handleOut) that control the curvature.

Sources:
[src/path/Path.js 170-257](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L170-L257)
[src/path/Curve.js 63-145](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Curve.js#L63-L145)

A curve in Paper.js is a cubic Bézier curve defined by four points:

1.  The point of the first segment
2.  The handleOut of the first segment
3.  The handleIn of the second segment
4.  The point of the second segment

Paths can be closed or open. When a path is closed, a curve connects the last segment back to the
first segment.

```
// Example of a simple path with segmentsvar path = new Path();path.add(new Point(30, 75));  // First segmentpath.add(new Point(100, 20)); // Second segmentpath.add(new Point(170, 75)); // Third segmentpath.closed = true;           // Close the path
```

Sources:
[src/path/Path.js 484-550](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L484-L550)
[src/path/Path.js 276-296](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L276-L296)

## Creating and Manipulating Paths

Paper.js provides several ways to create paths:

1.  **Constructing paths with segments**:

    ```
    var path = new Path({    segments: [[20, 20], [80, 80], [140, 20]],    strokeColor: 'black'});
    ```

2.  **Adding segments to paths**:

    ```
    var path = new Path();path.strokeColor = 'black';path.add(new Point(30, 75));path.add(new Point(100, 20));
    ```

3.  **Using SVG path data**:

    ```
    var path = new Path('M100,50c0,27.614-22.386,50-50,50S0,77.614,0,50S22.386,0,50,0S100,22.386,100,50');
    ```

4.  **Using predefined shape constructors**:

    ```
    var circle = new Path.Circle(new Point(100, 100), 50);var rectangle = new Path.Rectangle(new Point(20, 20), new Size(60, 60));
    ```

Sources:
[src/path/Path.js 48-127](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L48-L127)
[src/path/Path.js 482-558](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L482-L558)

### Modifying Paths

Paths can be modified by manipulating their segments or applying transformation operations:

Sources:
[src/path/Path.js 551-603](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L551-L603)
[src/path/Path.js 696-784](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L696-L784)

## Boolean Operations

One of the most powerful features of the Path System is the ability to perform boolean operations on
paths:

- **Unite**: Combines the area of two paths
- **Intersect**: Keeps only the area where both paths overlap
- **Subtract**: Subtracts the area of the second path from the first path
- **Exclude**: Keeps only the area where the paths don't overlap

Boolean operations work by:

1.  Calculating the intersections between paths
2.  Splitting paths at these intersections
3.  Determining which parts to keep based on winding numbers and the operation type
4.  Creating a new path from the kept parts

Sources:
[src/path/PathItem.Boolean.js 29-108](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.Boolean.js#L29-L108)
[src/path/PathItem.Boolean.js 110-216](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.Boolean.js#L110-L216)

## Path Utilities

### PathFitter

The `PathFitter` class is used to simplify paths by reducing the number of segments while
maintaining the visual appearance as closely as possible. It uses the Ramer-Douglas-Peucker
algorithm to fit cubic bezier curves to digitized points.

```
// Simplifying a pathvar path = new Path(/* ... */);path.simplify(0.5); // Tolerance parameter
```

Sources:
[src/path/PathFitter.js 23-69](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathFitter.js#L23-L69)
[src/path/PathFitter.js 114-217](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathFitter.js#L114-L217)

### PathFlattener

The `PathFlattener` class converts curves into sequences of straight lines by subdividing curves
until they are flat enough according to a specified tolerance. This is useful for path measurement,
hit testing, and other operations that are easier to perform on straight lines.

```
// Flattening a pathvar path = new Path(/* ... */);path.flatten(0.25); // Flatness parameter
```

Sources:
[src/path/PathFlattener.js 18-105](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathFlattener.js#L18-L105)

## Curve Operations and Classifications

Curves in Paper.js can be analyzed and manipulated in various ways:

Curves can be classified into different types based on their mathematical properties:

- **Line**: A straight line
- **Quadratic**: A quadratic bezier curve
- **Serpentine**: Has an S-shape with one inflection point
- **Cusp**: Has a sharp point with a discontinuous derivative
- **Loop**: Self-intersects to form a loop
- **Arch**: A simple, non-inflected curve

- [src/path/Curve.js 173-175](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Curve.js#L173-L175)
- [src/path/Curve.js 431-438](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Curve.js#L431-L438)
- [src/path/Curve.js 605-629](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Curve.js#L605-L629)
- [src/path/Curve.js 795-819](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Curve.js#L795-L819)

## Intersections and Hit Testing

The Path System provides robust methods for finding intersections between paths and testing if
points are inside paths:

### Intersections

```
var intersections = path1.getIntersections(path2);for (var i = 0; i < intersections.length; i++) {    var point = intersections[i].point;    // Do something with the intersection point}
```

Intersections are represented by `CurveLocation` objects that provide information about:

- The intersection point
- The curves that intersect
- The parameters of the intersection on each curve
- Whether the intersection is a crossing or a tangent point

Sources:
[src/path/PathItem.js 321-339](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.js#L321-L339)
[src/path/CurveLocation.js 29-66](https://github.com/paperjs/paper.js/blob/92775f52/src/path/CurveLocation.js#L29-L66)

### Hit Testing

Hit testing determines if a point is on or inside a path:

```
if (path.contains(point)) {    // Point is inside the path}
```

For complex paths, hit testing uses winding numbers to determine if a point is inside the path
according to either the non-zero or even-odd fill rule.

Sources:
[src/path/PathItem.js 257-282](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.js#L257-L282)

## Performance Considerations

The Path System includes several optimizations for performance:

1.  **Caching**: Various properties like length and area are cached and only recalculated when
    necessary.
2.  **Curve subdivision**: Used for efficient hit testing and intersection detection.
3.  **Path simplification**: Reduces the number of segments for better performance.
4.  **Collision detection**: Uses broad-phase algorithms to quickly filter out non-colliding paths.

For complex paths or when working with many paths, consider:

- Using `simplify()` to reduce the number of segments
- Using `flatten()` with an appropriate tolerance for operations on complex curves
- Using compound paths for complex shapes with holes

Sources:
[src/path/Path.js 139-156](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L139-L156)
[src/util/CollisionDetection.js 19-107](https://github.com/paperjs/paper.js/blob/92775f52/src/util/CollisionDetection.js#L19-L107)

## Table of Path Properties

| Property        | Description                                        | Class    |
| --------------- | -------------------------------------------------- | -------- |
| `segments`      | Array of segments that make up the path            | Path     |
| `curves`        | Array of curves connecting the segments            | Path     |
| `closed`        | Whether the path is closed                         | Path     |
| `length`        | The approximate length of the path                 | Path     |
| `area`          | The area enclosed by the path                      | Path     |
| `fullySelected` | Whether the path and all its segments are selected | Path     |
| `clockwise`     | Whether the path is oriented clockwise             | PathItem |
| `pathData`      | The path's geometry formatted as SVG path data     | PathItem |

Sources:
[src/path/Path.js 170-296](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L170-L296)
[src/path/Path.js 817-852](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L817-L852)

## Table of Path Methods

| Method                   | Description                                                          | Class    |
| ------------------------ | -------------------------------------------------------------------- | -------- |
| `add(segment)`           | Adds a segment to the path                                           | Path     |
| `insert(index, segment)` | Inserts a segment at the specified index                             | Path     |
| `removeSegment(index)`   | Removes the segment at the specified index                           | Path     |
| `removeSegments()`       | Removes all segments from the path                                   | Path     |
| `smooth()`               | Smooths the path by adjusting the curve handles                      | Path     |
| `simplify(tolerance)`    | Simplifies the path by removing redundant points                     | Path     |
| `flatten(flatness)`      | Converts the path to a series of straight lines                      | Path     |
| `unite(path)`            | Returns the union of this path with another                          | PathItem |
| `intersect(path)`        | Returns the intersection of this path with another                   | PathItem |
| `subtract(path)`         | Returns this path with the other path subtracted                     | PathItem |
| `exclude(path)`          | Returns areas where either this or the other path (but not both) are | PathItem |
| `getIntersections(path)` | Returns all intersections between this and another path              | PathItem |
| `contains(point)`        | Returns whether the point is inside the path                         | PathItem |

- [src/path/Path.js 551-603](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L551-L603)
- [src/path/PathItem.js 321-414](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.js#L321-L414)
- [src/path/PathItem.Boolean.js 110-216](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.Boolean.js#L110-L216)

Refresh this wiki

- [Path System](#path-system)
- [Path Structure and Representation](#path-structure-and-representation)
- [Segments and Curves](#segments-and-curves)
- [Creating and Manipulating Paths](#creating-and-manipulating-paths)
- [Modifying Paths](#modifying-paths)
- [Boolean Operations](#boolean-operations)
- [Path Utilities](#path-utilities)
- [PathFitter](#pathfitter)
- [PathFlattener](#pathflattener)
- [Curve Operations and Classifications](#curve-operations-and-classifications)
- [Intersections and Hit Testing](#intersections-and-hit-testing)
- [Intersections](#intersections)
- [Hit Testing](#hit-testing)
- [Performance Considerations](#performance-considerations)
- [Table of Path Properties](#table-of-path-properties)
- [Table of Path Methods](#table-of-path-methods)

<!--
## Source links

- [src/basic/Line.js](https://github.com/paperjs/paper.js/blob/92775f52/src/basic/Line.js)
- [src/path/Curve.js](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Curve.js)
- [src/path/CurveLocation.js](https://github.com/paperjs/paper.js/blob/92775f52/src/path/CurveLocation.js)
- [src/path/Path.js](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js)
- [src/path/PathFitter.js](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathFitter.js)
- [src/path/PathFlattener.js](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathFlattener.js)
- [src/path/PathItem.Boolean.js](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.Boolean.js)
- [src/path/PathItem.js](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.js)
- [src/util/CollisionDetection.js](https://github.com/paperjs/paper.js/blob/92775f52/src/util/CollisionDetection.js)
- [src/util/Numerical.js](https://github.com/paperjs/paper.js/blob/92775f52/src/util/Numerical.js)
- [test/index.html](https://github.com/paperjs/paper.js/blob/92775f52/test/index.html)
- [test/tests/Curve.js](https://github.com/paperjs/paper.js/blob/92775f52/test/tests/Curve.js)
- [test/tests/Path.js](https://github.com/paperjs/paper.js/blob/92775f52/test/tests/Path.js)
- [test/tests/Path_Boolean.js](https://github.com/paperjs/paper.js/blob/92775f52/test/tests/Path_Boolean.js)
- [test/tests/Path_Intersections.js](https://github.com/paperjs/paper.js/blob/92775f52/test/tests/Path_Intersections.js)
- [test/tests/Style.js](https://github.com/paperjs/paper.js/blob/92775f52/test/tests/Style.js)
- [Styling System](./paperjs-paper.js-4-styling-system.md) - source: /paperjs/paper.js/4-styling-system
- [Scene Graph](./paperjs-paper.js-2.2-scene-graph.md) - source: /paperjs/paper.js/2.2-scene-graph
- [src/path/Path.js 21-296](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L21-L296)
- [src/path/Curve.js 27-145](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Curve.js#L27-L145)
- [src/path/PathItem.js 22-34](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.js#L22-L34)
- [src/path/Path.js 170-257](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L170-L257)
- [src/path/Curve.js 63-145](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Curve.js#L63-L145)
- [src/path/Path.js 484-550](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L484-L550)
- [src/path/Path.js 276-296](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L276-L296)
- [src/path/Path.js 48-127](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L48-L127)
- [src/path/Path.js 482-558](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L482-L558)
- [src/path/Path.js 551-603](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L551-L603)
- [src/path/Path.js 696-784](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L696-L784)
- [src/path/PathItem.Boolean.js 29-108](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.Boolean.js#L29-L108)
- [src/path/PathItem.Boolean.js 110-216](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.Boolean.js#L110-L216)
- [src/path/PathFitter.js 23-69](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathFitter.js#L23-L69)
- [src/path/PathFitter.js 114-217](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathFitter.js#L114-L217)
- [src/path/PathFlattener.js 18-105](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathFlattener.js#L18-L105)
- [src/path/Curve.js 173-175](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Curve.js#L173-L175)
- [src/path/Curve.js 431-438](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Curve.js#L431-L438)
- [src/path/Curve.js 605-629](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Curve.js#L605-L629)
- [src/path/Curve.js 795-819](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Curve.js#L795-L819)
- [src/path/PathItem.js 321-339](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.js#L321-L339)
- [src/path/CurveLocation.js 29-66](https://github.com/paperjs/paper.js/blob/92775f52/src/path/CurveLocation.js#L29-L66)
- [src/path/PathItem.js 257-282](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.js#L257-L282)
- [src/path/Path.js 139-156](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L139-L156)
- [src/util/CollisionDetection.js 19-107](https://github.com/paperjs/paper.js/blob/92775f52/src/util/CollisionDetection.js#L19-L107)
- [src/path/Path.js 170-296](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L170-L296)
- [src/path/Path.js 817-852](https://github.com/paperjs/paper.js/blob/92775f52/src/path/Path.js#L817-L852)
- [src/path/PathItem.js 321-414](https://github.com/paperjs/paper.js/blob/92775f52/src/path/PathItem.js#L321-L414)
-->
